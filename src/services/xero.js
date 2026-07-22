import axios from 'axios';

export const XeroService = {
    getStockOnHand: async () => {
        try {
            const response = await axios.get('/api/stock');
            return response.data;
        } catch (error) {
            console.error('Error fetching stock from Xero backend:', error.response?.data || error.message);
            throw error;
        }
    }
};
