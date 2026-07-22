import { useState, useEffect } from 'react';
import { XeroService } from '../services/xero';

export const useFetchStock = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchStock = async (isRefresh = false) => {
        try {
            if (isRefresh) setIsRefreshing(true);
            else setLoading(true);
            setError(null);

            // Request stock data from local Xero Service API
            const data = await XeroService.getStockOnHand();
            setItems(data?.Items || []);
        } catch {
            setError('Failed to connect to Xero API. Please ensure you have authenticated with Xero via the Admin panel.');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStock();

        // Automatic polling every 5 minutes (300,000 milliseconds)
        const pollingInterval = setInterval(() => {
            fetchStock(true); // pass true to indicate it's a silent background refresh
        }, 5 * 60 * 1000);

        return () => clearInterval(pollingInterval);
    }, []);

    return { items, loading, error, isRefreshing, refetch: () => fetchStock(true) };
};
