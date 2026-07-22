import axios from 'axios';
import { kv } from './kv.js';

export default async function handler(req, res) {
  const { code, error } = req.query;

  if (error) {
    res.writeHead(302, { Location: `/?xero_connection=error&error_description=${encodeURIComponent(error)}` });
    res.end();
    return;
  }

  if (!code) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Authorization code is missing from callback.' }));
    return;
  }

  const clientId = process.env.XERO_CLIENT_ID;
  const clientSecret = process.env.XERO_CLIENT_SECRET;
  const redirectUri = process.env.XERO_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Xero environment variables are not configured.' }));
    return;
  }

  try {
    // 1. Exchange auth code for tokens
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const tokenParams = new URLSearchParams();
    tokenParams.append('grant_type', 'authorization_code');
    tokenParams.append('code', code);
    tokenParams.append('redirect_uri', redirectUri);

    const tokenResponse = await axios.post(
      'https://identity.xero.com/connect/token',
      tokenParams.toString(),
      {
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    const expiresAt = Date.now() + (Number(expires_in) * 1000);

    // 2. Fetch connection (tenant ID)
    const connectionsResponse = await axios.get(
      'https://api.xero.com/connections',
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Find the first active tenant
    const connections = connectionsResponse.data;
    if (!connections || connections.length === 0) {
      throw new Error('No active Xero connections/tenants found for this user account.');
    }

    const tenantId = connections[0].tenantId;
    const tenantName = connections[0].tenantName;

    // 3. Save tokens and tenant details securely in Vercel KV
    const tokenData = {
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: expiresAt,
      tenantId: tenantId,
      tenantName: tenantName
    };

    await kv.set('xero_tokens', tokenData);

    // 4. Redirect user back to UI with success status
    res.writeHead(302, { Location: `/?xero_connection=success&tenant=${encodeURIComponent(tenantName)}` });
    res.end();
  } catch (err) {
    console.error('Error exchanging code in Xero callback:', err.response?.data || err.message);
    const errorMsg = err.response?.data?.error_description || err.message || 'Unknown error';
    res.writeHead(302, { Location: `/?xero_connection=error&error_description=${encodeURIComponent(errorMsg)}` });
    res.end();
  }
}
