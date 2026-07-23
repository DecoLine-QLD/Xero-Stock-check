import axios from 'axios';

let KV_URL = process.env.KV_REST_API_URL || process.env.KV_URL;
let KV_TOKEN = process.env.KV_REST_API_TOKEN;

// If URL has redis:// or rediss:// protocol, parse and transform it into https:// REST API URL
if (KV_URL && (KV_URL.startsWith('redis://') || KV_URL.startsWith('rediss://'))) {
  try {
    const cleanUrl = KV_URL.replace('redis://', '').replace('rediss://', '');
    const [authPart, hostPart] = cleanUrl.split('@');
    
    if (hostPart) {
      const host = hostPart.split(':')[0];
      KV_URL = `https://${host}`;
    }
    
    if (!KV_TOKEN && authPart) {
      const token = authPart.split(':')[1] || authPart;
      KV_TOKEN = token;
    }
  } catch (err) {
    console.error('Failed to auto-parse Vercel KV Redis URL:', err.message);
  }
}

export const kv = {
  async get(key) {
    if (!KV_URL || !KV_TOKEN) {
      throw new Error('Vercel KV environment variables are not configured');
    }
    const response = await axios.post(
      KV_URL,
      ['GET', key],
      {
        headers: {
          Authorization: `Bearer ${KV_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.result; // Upstash returns value (string or null)
  },

  async set(key, value) {
    if (!KV_URL || !KV_TOKEN) {
      throw new Error('Vercel KV environment variables are not configured');
    }
    const response = await axios.post(
      KV_URL,
      ['SET', key, typeof value === 'string' ? value : JSON.stringify(value)],
      {
        headers: {
          Authorization: `Bearer ${KV_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.result;
  }
};
