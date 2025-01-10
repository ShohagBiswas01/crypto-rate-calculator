import React, { useEffect } from 'react';
import CryptoConverter from '@/components/CryptoConverter';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const Index = () => {
  useEffect(() => {
    // Initialize AdMob
    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9162745056113716';
    script.async = true;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);

    // Initialize banner ad
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdMob error:', err);
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

      {/* AdMob Banner */}
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-9162745056113716"
        data-ad-slot="1821590421"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default Index;