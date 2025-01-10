import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Calculator } from 'lucide-react';

const MAJOR_CRYPTOS = [
  { id: 'tether', symbol: 'USDT', name: 'Tether' },
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP' },
  { id: 'usd-coin', symbol: 'USDC', name: 'USD Coin' },
];

const CryptoConverter = () => {
  const [selectedCrypto, setSelectedCrypto] = useState('tether');
  const [userCurrency, setUserCurrency] = useState('USD');
  const [amount, setAmount] = useState('1');
  const [showCalculator, setShowCalculator] = useState(false);

  // Fetch user's country currency
  useEffect(() => {
    fetch('https://ipapi.co/currency/')
      .then(res => res.text())
      .then(currency => {
        if (currency && currency.length === 3) {
          setUserCurrency(currency);
        }
      })
      .catch(() => {
        console.log('Failed to detect currency, using USD');
      });
  }, []);

  // Fetch crypto rate
  const { data: rateData, isLoading } = useQuery({
    queryKey: ['cryptoRate', selectedCrypto, userCurrency],
    queryFn: async () => {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${selectedCrypto}&vs_currencies=${userCurrency.toLowerCase()}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch rate');
      }
      const data = await response.json();
      return data[selectedCrypto][userCurrency.toLowerCase()];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      setAmount(value);
    }
  };

  const calculatedAmount = () => {
    if (!rateData || !amount) return '0';
    return (parseFloat(amount) * rateData).toFixed(2);
  };

  return (
    <div className="p-4 max-w-md mx-auto animate-fade-in">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
        <div className="flex flex-col space-y-4">
          <select
            value={selectedCrypto}
            onChange={(e) => setSelectedCrypto(e.target.value)}
            className="p-2 border rounded-md bg-gray-50"
          >
            {MAJOR_CRYPTOS.map((crypto) => (
              <option key={crypto.id} value={crypto.id}>
                {crypto.symbol} - {crypto.name}
              </option>
            ))}
          </select>

          <div className="text-center text-2xl font-bold">=</div>

          <div className="relative">
            <input
              type="text"
              value={amount}
              onChange={handleAmountChange}
              className="w-full p-2 border rounded-md"
              placeholder="Enter amount"
            />
            <div className="mt-2 text-center text-xl font-semibold">
              {isLoading ? (
                <div className="animate-pulse">Loading...</div>
              ) : (
                `${calculatedAmount()} ${userCurrency}`
              )}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => setShowCalculator(!showCalculator)}
        className="w-full bg-primary text-white p-3 rounded-lg flex items-center justify-center gap-2 mb-4"
      >
        <Calculator className="w-5 h-5" />
        {showCalculator ? 'Hide Calculator' : 'Show Calculator'}
      </button>

      {showCalculator && (
        <div className="bg-white rounded-lg shadow-lg p-6 animate-slide-up">
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

      {/* AdMob Banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-2 shadow-lg">
        <div id="banner-ad" className="w-full h-16 bg-gray-200 flex items-center justify-center">
          {/* AdMob Banner will be inserted here */}
        </div>
      </div>
    </div>
  );
};

export default CryptoConverter;