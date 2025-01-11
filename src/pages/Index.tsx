import React, { useEffect } from 'react';
import CryptoConverter from '@/components/CryptoConverter';

declare global {
  interface Window {
    google: any;
    adsbygoogle: any[];
    interstitialAd?: any;
  }
}

const Index = () => {
  useEffect(() => {
    // Initialize AdMob with error handling
    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndecode.com/pagead/js/adsbygoogle.js?client=ca-pub-9162745056113716';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onerror = () => {
      console.log('AdSense failed to load in development environment');
    };
    document.head.appendChild(script);

    // Initialize banner ad with error handling
    try {
      if (process.env.NODE_ENV === 'production') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.log('AdSense initialization skipped in development');
    }
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-primary text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold text-center">Crypto Rate</h1>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <CryptoConverter />
      </main>

      {process.env.NODE_ENV === 'production' && (
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-9162745056113716"
          data-ad-slot="1821590421"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      )}
    </div>
  );
};

export default Index;