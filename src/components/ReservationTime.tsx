import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const ReservationTime = () => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const { toast } = useToast();
  
  // Generate random hour between 13 and 19
  const getRandomHour = () => {
    // Generate once per day using the current date as seed
    const today = new Date().toDateString();
    const seed = Array.from(today).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const random = Math.sin(seed) * 10000;
    return Math.floor((random - Math.floor(random)) * 7) + 13; // 13 to 19
  };
  
  // Calculate the next reservation window
  const calculateNextWindow = () => {
    const now = new Date();
    const target = new Date(now);
    const randomHour = getRandomHour();
    target.setUTCHours(randomHour, 0, 0, 0);
    
    if (now.getTime() > target.getTime()) {
      target.setDate(target.getDate() + 1);
    }
    
    return target.getTime() - now.getTime();
  };

  useEffect(() => {
    setTimeRemaining(calculateNextWindow());
    
    const timer = setInterval(() => {
      const remaining = calculateNextWindow();
      setTimeRemaining(remaining);
      
      // Notify when new window starts
      if (remaining === 0) {
        toast({
          title: "New Reservation Window",
          description: "The optimal reservation window is now open!",
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getFormattedReservationTime = () => {
    const hour = getRandomHour();
    return `${hour}:00 GMT`;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto overflow-hidden animate-fade-in">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Clock className="h-6 w-6" />
            Today's Best Reservation Time
          </h2>
        </div>
        
        <div className="bg-primary/5 rounded-lg p-4 mb-4">
          <div className="text-xl font-semibold text-center mb-2">
            {getFormattedReservationTime()}
          </div>
          <div className="text-center text-sm text-muted-foreground">
            Next window in: <span className="font-mono text-primary">{formatTime(timeRemaining)}</span>
          </div>
        </div>
        
        <div className="bg-secondary/10 rounded-lg p-4 animate-pulse">
          <p className="text-center text-sm">
            💡 Reserve early during this time for better confirmation chances!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReservationTime;