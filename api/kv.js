import axios from 'axios';

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

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
