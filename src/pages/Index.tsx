import React from 'react';
import CryptoConverter from '@/components/CryptoConverter';
import ReservationTime from '@/components/ReservationTime';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-white p-2 shadow-md">
        <h1 className="text-xl font-bold text-center">Crypto Rate</h1>
      </header>
      
      <main className="container mx-auto px-2 py-2 max-w-full overflow-hidden">
        <div className="space-y-0">
          <CryptoConverter />
          <ReservationTime />
        </div>
      </main>
    </div>
  );
};

export default Index;