import axios from 'axios';
import { kv } from './kv.js';

const mockStockData = {
  Items: [
    {
      ProductCode: "LAP-M1-13",
      ProductDescription: "MacBook Pro M1 13-inch",
      AvailableQty: 45,
      AllocatedQty: 5,
      QtyOnHand: 50,
      OnPurchase: 25,
      ProductGroupName: "Laptops"
    },
    {
      ProductCode: "LAP-M2-16",
      ProductDescription: "MacBook Pro M2 Max 16-inch",
      AvailableQty: 12,
      AllocatedQty: 2,
      QtyOnHand: 14,
      OnPurchase: 0,
      ProductGroupName: "Laptops"
    },
    {
      ProductCode: "ACC-USB-C",
      ProductDescription: "USB-C Digital AV Multiport Adapter",
      AvailableQty: 120,
      AllocatedQty: 10,
      QtyOnHand: 130,
      OnPurchase: 150,
      ProductGroupName: "Accessories"
    },
    {
      ProductCode: "MON-STUDIO",
      ProductDescription: "Apple Studio Display",
      AvailableQty: 3,
      AllocatedQty: 0,
      QtyOnHand: 3,
      OnPurchase: 10,
      ProductGroupName: "Monitors"
    },
    {
      ProductCode: "PHN-IP15P",
      ProductDescription: "iPhone 15 Pro 256GB Titanium",
      AvailableQty: 0,
      AllocatedQty: 8,
      QtyOnHand: 8,
      OnPurchase: 50,
      ProductGroupName: "Phones"
    },
    {
      ProductCode: "ACC-MM",
      ProductDescription: "Magic Mouse - Black Multi-Touch",
      AvailableQty: 15,
      AllocatedQty: 1,
      QtyOnHand: 16,
      OnPurchase: 0,
      ProductGroupName: "Accessories"
    }
  ]
};

export default async function handler(req, res) {
  const clientId = process.env.XERO_CLIENT_ID;
  const clientSecret = process.env.XERO_CLIENT_SECRET;

  const shouldUseMockData = !clientId || clientId === 'your_xero_client_id_here' || !clientSecret;
  if (shouldUseMockData) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(mockStockData));
    return;
  }

  try {
    let tokensString = null;
    try {
      tokensString = await kv.get('xero_tokens');
    } catch (kvErr) {
      console.warn('Failed to connect to Vercel KV, falling back to mock data:', kvErr.message);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(mockStockData));
      return;
    }

    if (!tokensString) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Xero integration is not connected. Admin authorization required.' }));
      return;
    }

    const tokens = typeof tokensString === 'string' ? JSON.parse(tokensString) : tokensString;

    let accessToken = tokens.accessToken;
    const isExpired = Date.now() > (tokens.expiresAt - 60000); // 60s buffer

    if (isExpired) {
      const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      const refreshParams = new URLSearchParams();
      refreshParams.append('grant_type', 'refresh_token');
      refreshParams.append('refresh_token', tokens.refreshToken);

      try {
        const refreshResponse = await axios.post(
          'https://identity.xero.com/connect/token',
          refreshParams.toString(),
          {
            headers: {
              'Authorization': `Basic ${basicAuth}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );

        const { access_token, refresh_token, expires_in } = refreshResponse.data;
        accessToken = access_token;

        tokens.accessToken = access_token;
        tokens.refreshToken = refresh_token;
        tokens.expiresAt = Date.now() + (Number(expires_in) * 1000);

        await kv.set('xero_tokens', tokens);
      } catch (refreshErr) {
        console.error('Failed to refresh Xero token:', refreshErr.response?.data || refreshErr.message);
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Xero connection expired. Admin re-authorization required.' }));
        return;
      }
    }

    const xeroHeaders = {
      'Authorization': `Bearer ${accessToken}`,
      'xero-tenant-id': tokens.tenantId,
      'Accept': 'application/json'
    };

    const [itemsResponse, posResponse] = await Promise.all([
      axios.get('https://api.xero.com/api.xro/2.0/Items', { headers: xeroHeaders }),
      axios.get('https://api.xero.com/api.xro/2.0/PurchaseOrders?Statuses=APPROVED,SUBMITTED', { headers: xeroHeaders })
    ]);

    const xeroItems = itemsResponse.data.Items || [];
    const xeroPurchaseOrders = posResponse.data.PurchaseOrders || [];

    const poUpcomingMap = new Map();
    for (const po of xeroPurchaseOrders) {
      if (po.LineItems) {
        for (const line of po.LineItems) {
          if (line.ItemCode) {
            const itemCode = String(line.ItemCode).trim().toUpperCase();
            const qty = Number(line.Quantity || 0);
            poUpcomingMap.set(itemCode, (poUpcomingMap.get(itemCode) || 0) + qty);
          }
        }
      }
    }

    const combinedItems = xeroItems
      .filter(item => item.IsTrackedAsInventory)
      .map(item => {
        const itemCode = String(item.Code).trim().toUpperCase();
        const poUpcoming = poUpcomingMap.get(itemCode) || 0;

        return {
          ProductCode: item.Code,
          ProductDescription: item.Name || item.Description || '',
          QtyOnHand: Number(item.QuantityOnHand || 0),
          AvailableQty: Number(item.QuantityOnHand || 0),
          AllocatedQty: 0,
          OnPurchase: poUpcoming,
          ProductGroupName: ''
        };
      });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ Items: combinedItems }));
  } catch (error) {
    console.error('Error fetching data from Xero API:', error.response?.data || error.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: `Internal server error: ${error.message}` }));
  }
}
