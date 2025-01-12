import React from 'react';
import CryptoConverter from '@/components/CryptoConverter';
import ReservationTime from '@/components/ReservationTime';

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-primary text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold text-center">Crypto Rate</h1>
      </header>
      
      <main className="container mx-auto px-4 py-8 space-y-4">
        <CryptoConverter />
        <ReservationTime />
      </main>
    </div>
  );
};

export default Index;