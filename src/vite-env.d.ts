/// <reference types="vite/client" />

declare global {
  interface Window {
    google: any;
    adsbygoogle: any[];
    interstitialAd?: any;
  }
}

export {};