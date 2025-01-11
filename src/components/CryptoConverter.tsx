import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calculator, ArrowUpDown } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";

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

  const { data: rateData, isLoading, error } = useQuery({
    queryKey: ['cryptoRate', selectedCrypto, selectedCurrency],
    queryFn: async () => {
      try {
        // Special case: if the crypto is USDT and currency is USD, return 1
        if (selectedCrypto === 'tether' && selectedCurrency === 'USD') {
          return 1;
        }

        // Function to handle retries with exponential backoff
        const fetchWithRetry = async (url: string, retries = 3, delay = 1000) => {
          for (let i = 0; i < retries; i++) {
            try {
              const response = await fetch(url);
              if (response.ok) {
                return response;
              }
              // If rate limited, wait longer before retry
              if (response.status === 429) {
                await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
                continue;
              }
              throw new Error(`HTTP error! status: ${response.status}`);
            } catch (error) {
              if (i === retries - 1) throw error;
              await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
            }
          }
          throw new Error('Max retries reached');
        };

        // Try CoinGecko API first
        try {
          const coingeckoResponse = await fetchWithRetry(
            `https://api.coingecko.com/api/v3/simple/price?ids=${selectedCrypto}&vs_currencies=usd`
          );
          const coingeckoData = await coingeckoResponse.json();
          if (coingeckoData[selectedCrypto]?.usd) {
            const cryptoToUSD = coingeckoData[selectedCrypto].usd;
            
            // If target currency is USD, return the rate directly
            if (selectedCurrency === 'USD') {
              return cryptoToUSD;
            }

            // Convert USD to target currency
            const exchangeResponse = await fetchWithRetry(
              'https://api.exchangerate-api.com/v4/latest/USD'
            );
            const exchangeData = await exchangeResponse.json();
            if (!exchangeData.rates?.[selectedCurrency]) {
              throw new Error('Invalid exchange rate response');
            }
            return cryptoToUSD * exchangeData.rates[selectedCurrency];
          }
        } catch (error) {
          console.log('CoinGecko API failed, trying CryptoCompare...');
        }

        // Fallback to CryptoCompare API if CoinGecko fails
        const cryptoSymbol = MAJOR_CRYPTOS.find(c => c.id === selectedCrypto)?.symbol || '';
        const cryptoCompareResponse = await fetchWithRetry(
          `https://min-api.cryptocompare.com/data/price?fsym=${cryptoSymbol}&tsyms=USD`
        );
        const cryptoCompareData = await cryptoCompareResponse.json();
        
        if (!cryptoCompareData.USD) {
          throw new Error('Invalid response from CryptoCompare');
        }

        const cryptoToUSD = cryptoCompareData.USD;

        // If target currency is USD, return the rate directly
        if (selectedCurrency === 'USD') {
          return cryptoToUSD;
        }

        // Convert USD to target currency
        const exchangeResponse = await fetchWithRetry(
          'https://api.exchangerate-api.com/v4/latest/USD'
        );
        const exchangeData = await exchangeResponse.json();
        if (!exchangeData.rates?.[selectedCurrency]) {
          throw new Error('Invalid exchange rate response');
        }

        return cryptoToUSD * exchangeData.rates[selectedCurrency];
      } catch (error) {
        console.error('Error fetching rate:', error);
        throw error;
      }
    },
    refetchInterval: 60000, // Refresh every minute to avoid rate limits
    staleTime: 30000, // Consider data stale after 30 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000),
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
    if (!useCustomRate && rateData) {
      setCustomRate(rateData.toString());
    }
  };

  const calculatedAmount = () => {
    const rate = useCustomRate ? parseFloat(customRate) : rateData;
    if (!rate || isNaN(parseFloat(amount))) return '0';
    
    if (isReversed) {
      return (parseFloat(amount) / rate).toFixed(8);
    }
    return (parseFloat(amount) * rate).toFixed(2);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 pb-20 animate-fade-in">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            Unable to fetch current rates. Please try again later.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {/* First Currency Container */}
            <div className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50">
              <select
                value={!isReversed ? selectedCrypto : selectedCurrency}
                onChange={(e) => !isReversed ? setSelectedCrypto(e.target.value) : setSelectedCurrency(e.target.value)}
                className="flex-1 p-2 border rounded-md bg-white text-sm min-w-[180px]"
              >
                {!isReversed ? 
                  MAJOR_CRYPTOS.map((crypto) => (
                    <option key={crypto.id} value={crypto.id}>
                      {crypto.symbol} - {crypto.name}
                    </option>
                  )) :
                  MAJOR_CURRENCIES.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </option>
                  ))
                }
              </select>
              <Input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                className="w-32"
                placeholder="Amount"
              />
            </div>

            {/* Equals Sign */}
            <div className="flex justify-center items-center">
              <button
                onClick={toggleDirection}
                className="p-2 rounded-full hover:bg-gray-100 transition-all"
              >
                <ArrowUpDown className="w-5 h-5" />
              </button>
            </div>

            {/* Second Currency Container */}
            <div className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50">
              <select
                value={!isReversed ? selectedCurrency : selectedCrypto}
                onChange={(e) => !isReversed ? setSelectedCurrency(e.target.value) : setSelectedCrypto(e.target.value)}
                className="flex-1 p-2 border rounded-md bg-white text-sm min-w-[180px]"
              >
                {!isReversed ?
                  MAJOR_CURRENCIES.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </option>
                  )) :
                  MAJOR_CRYPTOS.map((crypto) => (
                    <option key={crypto.id} value={crypto.id}>
                      {crypto.symbol} - {crypto.name}
                    </option>
                  ))
                }
              </select>
              <div className="w-32 p-2 border rounded-md bg-white text-right">
                {isLoading ? (
                  <div className="animate-pulse">...</div>
                ) : (
                  calculatedAmount()
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calculator Button and Panel */}
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
