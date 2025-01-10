import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calculator, ArrowUpDown } from 'lucide-react';

const MAJOR_CRYPTOS = [
  { id: 'tether', symbol: 'USDT', name: 'Tether' },
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP' },
  { id: 'usd-coin', symbol: 'USDC', name: 'USD Coin' },
];

const MAJOR_CURRENCIES = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'INR', name: 'Indian Rupee' },
];

interface Window {
  google: any;
  adsbygoogle: any[];
  interstitialAd?: any;
}

const CryptoConverter = () => {
  const [selectedCrypto, setSelectedCrypto] = useState('tether');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [amount, setAmount] = useState('1');
  const [showCalculator, setShowCalculator] = useState(false);
  const [isReversed, setIsReversed] = useState(false);
  const [customRate, setCustomRate] = useState<string>('');
  const [useCustomRate, setUseCustomRate] = useState(false);

  // Fetch user's country currency
  useEffect(() => {
    fetch('https://ipapi.co/currency/')
      .then(res => res.text())
      .then(currency => {
        if (currency && currency.length === 3) {
          setSelectedCurrency(currency);
        }
      })
      .catch(() => {
        console.log('Failed to detect currency, using USD');
      });
  }, []);

  // Load interstitial ad
  useEffect(() => {
    if (typeof window.google === 'undefined') {
      console.log('Google Ads not loaded yet');
      return;
    }

    const script = document.createElement('script');
    script.innerHTML = `
      let interstitialAd;
      function loadInterstitial() {
        if (typeof google !== 'undefined') {
          interstitialAd = new google.ads.InterstitialAd();
          interstitialAd.setAdUnitId('ca-app-pub-9162745056113716/6893087733');
          interstitialAd.load();
        }
      }
      loadInterstitial();
    `;
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const { data: rateData, isLoading } = useQuery({
    queryKey: ['cryptoRate', selectedCrypto, selectedCurrency],
    queryFn: async () => {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${selectedCrypto}&vs_currencies=${selectedCurrency.toLowerCase()}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch rate');
      }
      const data = await response.json();
      return data[selectedCrypto][selectedCurrency.toLowerCase()];
    },
    refetchInterval: 30000,
    enabled: !useCustomRate,
  });

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      setAmount(value);
    }
  };

  const handleCustomRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      setCustomRate(value);
    }
  };

  const handleShowCalculator = () => {
    try {
      // @ts-ignore
      if (window.interstitialAd && window.interstitialAd.isLoaded()) {
        // @ts-ignore
        window.interstitialAd.show();
      }
    } catch (err) {
      console.error('Error showing interstitial ad:', err);
    }
    setShowCalculator(!showCalculator);
  };

  const toggleDirection = () => {
    setIsReversed(!isReversed);
  };

  const toggleCustomRate = () => {
    setUseCustomRate(!useCustomRate);
    if (!useCustomRate) {
      setCustomRate(rateData?.toString() || '');
    }
  };

  const calculatedAmount = () => {
    const rate = useCustomRate ? parseFloat(customRate) : rateData;
    if (!rate || !amount) return '0';
    if (isReversed) {
      return (parseFloat(amount) / rate).toFixed(8);
    }
    return (parseFloat(amount) * rate).toFixed(2);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 pb-20 animate-fade-in">
      <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          {!isReversed ? (
            <>
              <select
                value={selectedCrypto}
                onChange={(e) => setSelectedCrypto(e.target.value)}
                className="w-full sm:w-[45%] p-2 border rounded-md bg-gray-50 text-sm"
              >
                {MAJOR_CRYPTOS.map((crypto) => (
                  <option key={crypto.id} value={crypto.id}>
                    {crypto.symbol} - {crypto.name}
                  </option>
                ))}
              </select>
              <button
                onClick={toggleDirection}
                className="p-2 rounded-full hover:bg-gray-100 flex-shrink-0"
              >
                <ArrowUpDown className="w-5 h-5" />
              </button>
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="w-full sm:w-[45%] p-2 border rounded-md bg-gray-50 text-sm"
              >
                {MAJOR_CURRENCIES.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <>
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="w-full sm:w-[45%] p-2 border rounded-md bg-gray-50 text-sm"
              >
                {MAJOR_CURRENCIES.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
              <button
                onClick={toggleDirection}
                className="p-2 rounded-full hover:bg-gray-100 flex-shrink-0"
              >
                <ArrowUpDown className="w-5 h-5" />
              </button>
              <select
                value={selectedCrypto}
                onChange={(e) => setSelectedCrypto(e.target.value)}
                className="w-full sm:w-[45%] p-2 border rounded-md bg-gray-50 text-sm"
              >
                {MAJOR_CRYPTOS.map((crypto) => (
                  <option key={crypto.id} value={crypto.id}>
                    {crypto.symbol} - {crypto.name}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>

        <div className="text-center text-2xl font-bold">=</div>

        <div className="relative w-full">
          <input
            type="text"
            value={amount}
            onChange={handleAmountChange}
            className="w-full p-2 border rounded-md"
            placeholder="Enter amount"
          />
          <div className="mt-2 text-center text-xl font-semibold break-words">
            {isLoading ? (
              <div className="animate-pulse">Loading...</div>
            ) : (
              `${calculatedAmount()} ${isReversed ? MAJOR_CRYPTOS.find(c => c.id === selectedCrypto)?.symbol : selectedCurrency}`
            )}
          </div>
        </div>
      </div>

      <button
        onClick={handleShowCalculator}
        className="w-full bg-primary text-white p-3 rounded-lg flex items-center justify-center gap-2 mb-4"
      >
        <Calculator className="w-5 h-5" />
        {showCalculator ? 'Hide Custom Rate' : 'Show Custom Rate'}
      </button>

      {showCalculator && (
        <div className="bg-white rounded-lg shadow-lg p-4 animate-slide-up">
          <div className="mb-4">
            <label className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={useCustomRate}
                onChange={toggleCustomRate}
                className="rounded border-gray-300"
              />
              <span>Use custom rate</span>
            </label>
            {useCustomRate && (
              <input
                type="text"
                value={customRate}
                onChange={handleCustomRateChange}
                placeholder="Enter custom rate"
                className="w-full p-2 border rounded-md mb-4"
              />
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, 'C'].map((key) => (
              <button
                key={key}
                onClick={() => {
                  if (key === 'C') {
                    setAmount('');
                  } else {
                    setAmount(prev => prev + key);
                  }
                }}
                className="p-3 text-center bg-gray-100 rounded hover:bg-gray-200"
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white p-2 shadow-lg">
        <div id="banner-ad" className="w-full h-16 bg-gray-200 flex items-center justify-center">
          {/* AdMob Banner will be inserted here */}
        </div>
      </div>
    </div>
  );
};

export default CryptoConverter;
