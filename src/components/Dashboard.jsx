import React, { useState } from 'react';
import { SearchBar } from './SearchBar';
import { StockTable } from './StockTable';
import { useFetchStock } from '../hooks/useFetchStock';
import { Box, AlertCircle, Package, ArrowLeft, RefreshCw } from 'lucide-react';

export const Dashboard = () => {
    const { items, loading, error } = useFetchStock();
    const [searchTerm, setSearchTerm] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [xeroStatus, setXeroStatus] = useState(() => {
        if (typeof window === 'undefined') return null;
        const params = new URLSearchParams(window.location.search);
        const status = params.get('xero_connection');
        const tenant = params.get('tenant');
        const desc = params.get('error_description');
        if (status) {
            // Clean up the URL parameters
            const url = new URL(window.location.href);
            url.searchParams.delete('xero_connection');
            url.searchParams.delete('tenant');
            url.searchParams.delete('error_description');
            window.history.replaceState({}, '', url.toString());
            return { status, tenant, desc };
        }
        return null;
    });

    const handleSearch = (term) => {
        setSearchTerm(term);
        setIsTyping(false);
    };

    const filteredItems = items.filter(item => {
        const productName = (item.ProductDescription || item.ProductName || '').toLowerCase();
        const productCode = (item.ProductCode || '').toLowerCase();
        const productGroup = (item.ProductGroupName || item.ProductGroup?.GroupName || '').toLowerCase();

        // 1. Exclude specific product groups or names entirely
        const excludedGroups = ['discontinued', 'scotia', 'stair nosing', 'trim'];
        const isExcluded = excludedGroups.some(ex => productGroup.includes(ex) || productName.includes(ex));
        if (isExcluded) return false;

        if (!searchTerm) return true;

        // Split by whitespace and remove empty strings
        const terms = searchTerm.toLowerCase().split(/\s+/).filter(Boolean);

        const searchableString = `${productName} ${productCode} ${productGroup}`;

        // Ensure every typed word is found in the item's details
        return terms.every(t => searchableString.includes(t));
    });

    const isShowingResults = searchTerm && !isTyping;

    const regularItems = filteredItems;

    return (
        <div className="min-h-screen bg-white">
            {xeroStatus && (
                <div className={`px-6 py-4 border-b text-center font-medium text-sm tracking-wide ${
                    xeroStatus.status === 'success' 
                        ? 'bg-green-50 text-green-800 border-green-200' 
                        : 'bg-red-50 text-red-800 border-red-200'
                }`}>
                    {xeroStatus.status === 'success' 
                        ? `✓ Successfully connected to Xero Organization: ${xeroStatus.tenant}`
                        : `✗ Failed to connect to Xero: ${xeroStatus.desc}`
                    }
                    <button 
                        onClick={() => setXeroStatus(null)} 
                        className="ml-4 font-bold text-xs uppercase tracking-wider underline hover:opacity-80"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Header section with clean, luxurious minimalistic aesthetic */}
            <div className="bg-white pt-12 pb-32 px-6 lg:px-8 shadow-sm border-b border-gray-100 relative z-50">

                <div className="max-w-7xl mx-auto relative z-50">
                    <div className="relative flex flex-col items-center justify-center text-center mb-16">
                        <a href="https://decoline.com.au" target="_top" className="mb-6 block">
                            <img
                                src="https://static.wixstatic.com/media/66704b_f34f24f1d1804dbb90730597f17fdce1~mv2.png/v1/fill/w_324,h_101,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/logo_decoline.png"
                                alt="Decoline Logo"
                                className="h-20 md:h-24 w-auto object-contain hover:opacity-80 transition-opacity"
                            />
                        </a>
                        <h1 className="text-4xl md:text-5xl font-serif font-black text-black tracking-tight px-4">
                            Decoline Stock Monitor
                        </h1>

                        <div className="absolute top-0 right-0 hidden md:flex items-center gap-3">
                            <a
                                href="/api/auth"
                                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-black text-white uppercase text-[10px] tracking-widest font-semibold transition-all focus:outline-none"
                            >
                                <RefreshCw className="w-3 h-3" />
                                Connect Xero
                            </a>
                            <a
                                href="https://decoline.com.au"
                                target="_top"
                                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-500 border border-gray-200 hover:border-gray-300 uppercase text-[10px] tracking-widest font-semibold transition-all focus:outline-none"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                Back to Website
                            </a>
                        </div>
                    </div>

                    <div className="flex justify-center max-w-3xl mx-auto mt-12 pb-4 relative z-50">
                        <SearchBar
                            initialValue={searchTerm}
                            onSubmit={handleSearch}
                            onTyping={() => setIsTyping(true)}
                            placeholder="Enter a product name, code, or group..."
                            items={items}
                        />
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-6 lg:px-8 -mt-16 pb-24 relative z-10">
                {error ? (
                    <div className="bg-white border border-[#D61F26] p-10 flex flex-col items-center justify-center text-center shadow-sm max-w-2xl mx-auto">
                        <AlertCircle className="w-12 h-12 text-[#D61F26] mb-5" />
                        <h3 className="text-2xl font-serif text-black mb-3">Connection Error</h3>
                        <p className="text-gray-600 max-w-md font-light">{error}</p>
                        <div className="flex gap-4 mt-8 justify-center">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 uppercase tracking-widest text-xs font-semibold transition-colors border border-gray-200"
                            >
                                Try Again
                            </button>
                            <a
                                href="/api/auth"
                                className="px-8 py-3 bg-[#D61F26] hover:bg-red-800 text-white uppercase tracking-widest text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                Connect Xero Account
                            </a>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-8 pl-2">
                            <h2 className="text-2xl font-serif text-black">
                                {isShowingResults ? 'Search Results' : 'Search for a product to view stock'}
                            </h2>
                            {isShowingResults && (
                                <span className="bg-white px-5 py-2 text-xs font-semibold tracking-widest uppercase text-gray-500 border border-gray-200 flex items-center gap-2">
                                    {filteredItems.length} {filteredItems.length === 1 ? 'Product' : 'Products'}
                                </span>
                            )}
                        </div>
                        {isShowingResults ? (
                            <div className="space-y-16">
                                {regularItems.length > 0 && (
                                    <div>
                                        <h3 className="text-xl font-serif text-black mb-6 pl-2 flex items-center gap-3 border-b border-gray-200 pb-3">
                                            <Package className="w-5 h-5 text-gray-400" /> PLANKS
                                            <span className="text-xs font-sans tracking-widest text-[#D61F26] ml-2">({regularItems.length})</span>
                                        </h3>
                                        <StockTable items={regularItems} loading={loading} />
                                    </div>
                                )}
                                {filteredItems.length === 0 && !loading && (
                                    <StockTable items={[]} loading={false} />
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 bg-white border border-gray-100 shadow-sm">
                                <Box className="w-12 h-12 text-[#D61F26] mb-4 opacity-50" />
                                <p className="text-gray-400 font-light tracking-wide uppercase text-sm">Type a product name above to see stock levels.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
