export default function handler(req, res) {
  const clientId = process.env.XERO_CLIENT_ID;
  const redirectUri = process.env.XERO_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Xero Client ID and Redirect URI must be set in environment variables.' }));
    return;
  }

  const scopes = [
    'openid',
    'profile',
    'email',
    'accounting.settings.read',
    'accounting.invoices.read',
    'offline_access'
  ].join(' ');

  const authorizationUrl = `https://login.xero.com/identity/connect/authorize` +
    `?response_type=code` +
    `&client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(scopes)}` +
    `&state=xero-auth-state`;

  res.writeHead(302, { Location: authorizationUrl });
  res.end();
}
