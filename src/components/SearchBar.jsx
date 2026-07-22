import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';

export const SearchBar = ({ initialValue, onSubmit, onTyping, placeholder = "Search for products...", items = [] }) => {
    const [localValue, setLocalValue] = useState(initialValue || '');
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Compute top suggestions based on what's typed
    const getSuggestions = () => {
        if (!localValue || localValue.trim().length === 0) return [];

        const rawQuery = localValue.toLowerCase().trim();
        const terms = rawQuery.split(/\s+/).filter(Boolean);

        const scoredItems = items.map(item => {
            const name = (item.ProductDescription || item.ProductName || '').toLowerCase();
            const code = (item.ProductCode || '').toLowerCase();
            const group = (item.ProductGroupName || item.ProductGroup?.GroupName || '').toLowerCase();

            // Exclude specific product groups or names entirely
            const excludedGroups = ['discontinued', 'scotia', 'stair nosing', 'trim'];
            const isExcluded = excludedGroups.some(ex => group.includes(ex) || name.includes(ex));

            if (isExcluded) {
                return { item, score: 0 };
            }

            const searchableString = `${name} ${code} ${group}`;

            let score = 0;

            // Exact match gets highest priority
            if (name === rawQuery || code === rawQuery) {
                score = 100;
            }
            // Partial exact match inside the string gets very high priority (e.g., typing "coas" matching "coastal")
            else if (searchableString.includes(rawQuery)) {
                score = 50;
            }
            // Otherwise, fallback to the fuzzy multi-word requirement
            else if (terms.every(t => searchableString.includes(t))) {
                score = 10;
            }

            return { item, score };
        });

        // Filter out 0 scores, sort by highest score, then return the items
        return scoredItems
            .filter(obj => obj.score > 0)
            .sort((a, b) => b.score - a.score)
            .map(obj => obj.item)
            .slice(0, 6); // Max 6 suggestions
    };

    const suggestions = getSuggestions();

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        setShowDropdown(false);
        onSubmit(localValue);
    };

    const handleClear = () => {
        setLocalValue('');
        setShowDropdown(false);
        onSubmit('');
    };

    const handleSuggestionClick = (suggestion) => {
        const term = suggestion.ProductName || suggestion.ProductDescription || suggestion.ProductCode;
        setLocalValue(term);
        setShowDropdown(false);
        onSubmit(term);
    };

    const handleChange = (e) => {
        const val = e.target.value;
        setLocalValue(val);
        setShowDropdown(true);
        if (val === '') {
            onSubmit('');
        } else if (onTyping) {
            onTyping();
        }
    };

    return (
        <div ref={dropdownRef} className="relative w-full z-50">
            <form onSubmit={handleSearch} className="relative group w-full shadow-2xl rounded-2xl flex">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Search className="h-6 w-6 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-14 pr-24 py-5 bg-white border-none rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-shadow text-lg font-medium"
                    placeholder={placeholder}
                    value={localValue}
                    onChange={handleChange}
                    onFocus={() => setShowDropdown(true)}
                />
                <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
                    {localValue && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-2 opacity-70 hover:opacity-100 transition-opacity outline-none"
                        >
                            <div className="bg-gray-100 hover:bg-gray-200 focus:bg-gray-300 p-1 rounded-full transition-colors">
                                <X className="h-4 w-4 text-gray-600" />
                            </div>
                        </button>
                    )}
                    <button
                        type="submit"
                        className="p-2.5 bg-[#D61F26] hover:bg-red-800 text-white rounded-xl shadow-md transition-colors focus:ring-2 focus:ring-red-500 focus:outline-none flex items-center justify-center mr-1"
                    >
                        <ArrowRight className="h-5 w-5" />
                    </button>
                </div>
            </form>

            {/* Dropdown Suggestions */}
            {showDropdown && localValue && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-200 shadow-2xl rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-[100]">
                    <ul className="py-2 divide-y divide-gray-50">
                        {suggestions.map((item, idx) => (
                            <li key={item.ProductCode || idx}>
                                <button
                                    type="button"
                                    onClick={() => handleSuggestionClick(item)}
                                    className="w-full text-left px-5 py-3 hover:bg-gray-50 focus:bg-gray-50 flex items-center justify-between group transition-colors"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-black font-semibold group-hover:text-[#D61F26] transition-colors">
                                            {item.ProductName || item.ProductDescription}
                                        </span>
                                        {item.ProductCode && (
                                            <span className="text-xs text-gray-500 font-mono mt-1 opacity-80">
                                                Code: {item.ProductCode}
                                            </span>
                                        )}
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {showDropdown && localValue && suggestions.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-200 shadow-2xl rounded-xl overflow-hidden p-6 text-center z-[100]">
                    <p className="text-gray-500 text-sm font-medium">No matching products found.</p>
                </div>
            )}
        </div>
    );
};
