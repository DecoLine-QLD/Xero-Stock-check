import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { PackageSearch, Calendar, Edit3, Check, Lock, KeyRound, X } from 'lucide-react';

export const StockTable = ({ items, loading }) => {
    const [etas, setEtas] = useState(() => {
        try {
            const saved = localStorage.getItem('decoline_stock_etas');
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    });

    const [isAdminMode, setIsAdminMode] = useState(false);
    const [showPinModal, setShowPinModal] = useState(false);
    const [adminPinInput, setAdminPinInput] = useState('');
    const [pinError, setPinError] = useState(false);

    const handleEtaChange = (code, value) => {
        if (!code) return;
        const updated = { ...etas, [code]: value };
        setEtas(updated);
        try {
            localStorage.setItem('decoline_stock_etas', JSON.stringify(updated));
        } catch {
            // Storage quota fallback
        }
    };

    const handleAdminButtonClick = () => {
        if (isAdminMode) {
            setIsAdminMode(false);
        } else {
            setAdminPinInput('');
            setPinError(false);
            setShowPinModal(true);
        }
    };

    const handlePinSubmit = (e) => {
        e.preventDefault();
        if (adminPinInput === '1247') {
            setIsAdminMode(true);
            setShowPinModal(false);
            setAdminPinInput('');
            setPinError(false);
        } else {
            setPinError(true);
            setAdminPinInput('');
        }
    };

    if (loading) {
        return (
            <div className="bg-white border border-gray-100 overflow-hidden min-h-[400px] flex flex-col items-center justify-center">
                <div className="relative w-12 h-12 mb-6">
                    <div className="absolute inset-0 border-2 border-gray-100 rounded-full"></div>
                    <div className="absolute inset-0 border-2 border-[#D61F26] rounded-full border-t-transparent animate-spin"></div>
                </div>
                <h3 className="text-sm tracking-widest uppercase font-semibold text-black">Loading Details</h3>
                <p className="text-gray-400 text-xs mt-2 uppercase tracking-widest">Connecting to Xero API</p>
            </div>
        );
    }

    if (!items || items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 bg-white border border-gray-100 border-dashed">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <PackageSearch className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-sm tracking-widest font-semibold uppercase text-black mb-3">No products found</h3>
                <p className="text-gray-500 max-w-sm text-center font-light leading-relaxed">
                    Try adjusting your search terms or filters to find what you're looking for.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-100 overflow-hidden relative">
            {/* Table Control Bar */}
            <div className="px-6 py-3 bg-gray-50/70 border-b border-gray-200 flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {items.length} {items.length === 1 ? 'Item' : 'Items'} Listed
                </span>
                <button
                    type="button"
                    onClick={handleAdminButtonClick}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all border ${
                        isAdminMode
                            ? 'bg-[#D61F26] text-white border-[#D61F26] shadow-sm'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                    }`}
                >
                    {isAdminMode ? <Check className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    {isAdminMode ? 'Done Editing ETAs' : 'Edit ETAs (Admin)'}
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white border-b border-black">
                            <th className="px-6 py-4 text-xs font-semibold text-black uppercase tracking-widest w-[45%]">
                                Product Name
                            </th>
                            <th className="px-6 py-4 text-xs font-semibold text-black uppercase tracking-widest text-right w-[25%]">
                                Qty On Hand
                            </th>
                            <th className="px-6 py-4 text-xs font-semibold text-black uppercase tracking-widest text-right w-[30%]">
                                Upcoming Qty
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {items.map((item, index) => {
                            const productName = item.ProductDescription || item.ProductName || 'Unknown Product';
                            const productGroup = (item.ProductGroupName || item.ProductGroup?.GroupName || '').toLowerCase();
                            const displayUnit = productGroup.includes('bond') ? 'ea' : 'sqm';
                            const qtyOnHand = Number(item.AvailableQty ?? item.StockOnHand ?? item.QtyOnHand ?? 0);
                            const onPurchaseQty = Number(item.OnPurchase ?? item.OnPurchaseQty ?? item.PurchaseOrderQty ?? 0);

                            const isLowStock = qtyOnHand < 10 && qtyOnHand > 0;
                            const isOutOfStock = qtyOnHand <= 0;
                            const itemCode = item.ProductCode || item.Guid || index;
                            const currentEta = etas[item.ProductCode] || '';

                            return (
                                <tr
                                    key={itemCode}
                                    className="hover:bg-gray-50 transition-colors group"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-black font-medium text-lg group-hover:text-[#D61F26] transition-colors">
                                                {productName}
                                            </span>
                                            {item.ProductCode && (
                                                <span className="text-xs font-mono font-light text-gray-400 mt-1 uppercase tracking-widest">
                                                    {item.ProductCode}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right align-top">
                                        <span className={`inline-flex items-center justify-center px-3 py-1 text-sm font-bold tracking-widest border ${
                                            isOutOfStock
                                                ? 'bg-red-50 text-red-700 border-red-200'
                                                : isLowStock
                                                ? 'bg-orange-50 text-orange-700 border-orange-200'
                                                : 'bg-green-50 text-green-700 border-green-200'
                                        }`}>
                                            {qtyOnHand.toLocaleString()} <span className="text-[10px] ml-1.5 opacity-80 uppercase tracking-widest">{displayUnit}</span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right align-top">
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`inline-flex items-center justify-center px-3 py-1 text-sm font-bold tracking-widest border ${
                                                onPurchaseQty > 0
                                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                    : 'bg-gray-50 text-gray-400 border-gray-100'
                                            }`}>
                                                {onPurchaseQty > 0 ? `+${onPurchaseQty.toLocaleString()}` : '0'}{' '}
                                                <span className="text-[10px] ml-1.5 opacity-80 uppercase tracking-widest">{displayUnit}</span>
                                            </span>

                                            {/* ETA Section */}
                                            {isAdminMode ? (
                                                <div className="flex items-center gap-1 mt-1 bg-gray-50 p-1.5 rounded border border-gray-200 shadow-inner">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">ETA:</span>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. 15 Aug / TBD"
                                                        value={currentEta}
                                                        onChange={(e) => handleEtaChange(item.ProductCode, e.target.value)}
                                                        className="px-2 py-1 text-xs border border-gray-300 rounded bg-white text-black focus:border-[#D61F26] focus:outline-none w-32 text-right font-medium"
                                                    />
                                                </div>
                                            ) : (
                                                currentEta ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold tracking-wider text-amber-800 bg-amber-50 border border-amber-200/80 rounded-full font-mono">
                                                        <Calendar className="w-3 h-3 text-amber-600" />
                                                        ETA: {currentEta}
                                                    </span>
                                                ) : onPurchaseQty > 0 ? (
                                                    <span className="text-[11px] text-gray-400 font-mono tracking-wider">
                                                        ETA: TBD
                                                    </span>
                                                ) : null
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Admin Password Modal rendered at document body level (Portal) */}
            {showPinModal && createPortal(
                <div className="fixed inset-0 bg-black/65 backdrop-blur-md z-[99999] flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white border border-gray-200 p-8 rounded-2xl max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 my-auto">
                        <button
                            type="button"
                            onClick={() => setShowPinModal(false)}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black transition-colors rounded-full hover:bg-gray-100"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        
                        <div className="flex flex-col items-center text-center">
                            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4 text-[#D61F26] border border-red-100">
                                <KeyRound className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-serif font-bold text-black mb-1">Admin Verification</h3>
                            <p className="text-xs text-gray-500 mb-6 font-light">
                                Enter Admin PIN (1247) to modify product ETAs.
                            </p>

                            <form onSubmit={handlePinSubmit} className="w-full space-y-6">
                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                                    <input
                                        type="password"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={4}
                                        value={adminPinInput}
                                        onChange={(e) => {
                                            setAdminPinInput(e.target.value);
                                            setPinError(false);
                                        }}
                                        placeholder="••••"
                                        autoFocus
                                        className={`w-full text-center text-3xl tracking-[0.6em] font-mono py-3.5 px-2 bg-white rounded-lg border-2 transition-all focus:outline-none ${
                                            pinError
                                                ? 'border-[#D61F26] text-[#D61F26] bg-red-50/30'
                                                : 'border-gray-300 text-black focus:border-[#D61F26] focus:ring-2 focus:ring-red-500/20'
                                        }`}
                                    />
                                    {pinError && (
                                        <p className="text-[#D61F26] text-[11px] font-semibold uppercase tracking-wider mt-2">
                                            Incorrect Admin PIN
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-2.5">
                                    <button
                                        type="button"
                                        onClick={() => setShowPinModal(false)}
                                        className="w-1/2 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold uppercase text-xs tracking-wider transition-colors rounded-xl border border-gray-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="w-1/2 py-3.5 bg-[#D61F26] hover:bg-red-800 text-white font-semibold uppercase text-xs tracking-wider transition-colors shadow-md rounded-xl"
                                    >
                                        Verify
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
