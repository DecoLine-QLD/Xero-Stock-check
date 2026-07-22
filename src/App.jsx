import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { Lock, ArrowRight } from 'lucide-react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('decoline_stock_auth') === 'true';
  });
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === '7777') {
      setIsAuthenticated(true);
      sessionStorage.setItem('decoline_stock_auth', 'true');
      setError(false);
    } else {
      setError(true);
      setPin('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-10">
            <a href="https://decoline.com.au" target="_top" className="mb-8 block">
              <img
                src="https://static.wixstatic.com/media/66704b_f34f24f1d1804dbb90730597f17fdce1~mv2.png/v1/fill/w_324,h_101,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/logo_decoline.png"
                alt="Decoline Logo"
                className="h-16 w-auto object-contain hover:opacity-80 transition-opacity"
              />
            </a>
            <div className="bg-gray-50 p-4 rounded-full mb-6">
              <Lock className="w-8 h-8 text-[#D61F26]" />
            </div>
            <h1 className="text-2xl font-serif font-black text-black text-center tracking-tight">
              Authorised Access Only
            </h1>
            <p className="text-gray-500 mt-2 text-sm text-center">
              Please enter your PIN to access the live stock monitor.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(false);
                }}
                className={`w-full text-center text-3xl tracking-[1em] font-mono py-4 border-b-2 bg-transparent transition-colors focus:outline-none ${error
                  ? 'border-[#D61F26] text-[#D61F26]'
                  : 'border-gray-200 text-black focus:border-black'
                  }`}
                placeholder="••••"
                autoFocus
              />
              {error && (
                <p className="text-[#D61F26] text-xs font-semibold uppercase tracking-widest text-center mt-4">
                  Incorrect PIN
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={pin.length < 4}
              className="w-full flex items-center justify-center gap-2 py-4 bg-black disabled:bg-gray-200 disabled:text-gray-400 hover:bg-gray-800 text-white font-semibold uppercase tracking-widest text-xs transition-colors"
            >
              Access Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="antialiased min-h-screen w-full bg-[#f3f4f6]">
      <Dashboard />
    </div>
  );
}

export default App;
