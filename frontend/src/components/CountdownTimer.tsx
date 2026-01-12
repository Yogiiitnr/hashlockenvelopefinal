import { useState, useEffect, useCallback } from 'react';

interface CountdownTimerProps {
  targetDate: string; // ISO datetime
  label?: string;
  onExpire?: () => void;
}

export function CountdownTimer({ targetDate, label = 'Time remaining', onExpire }: CountdownTimerProps) {
  const calculateTimeLeft = useCallback(() => {
    const difference = new Date(targetDate).getTime() - new Date().getTime();
    
    if (difference <= 0) {
      return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      expired: false,
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      if (newTimeLeft.expired && onExpire) {
        onExpire();
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onExpire, calculateTimeLeft]);

  if (timeLeft.expired) {
    return (
      <div className="text-center p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
        <div className="text-red-400 font-bold">⏰ EXPIRED</div>
        <div className="text-sm text-red-300/70 mt-1">{label}</div>
      </div>
    );
  }

  const units = [
    { value: timeLeft.days, label: 'Days', color: 'text-purple-400', bg: 'bg-purple-500/20' },
    { value: timeLeft.hours, label: 'Hours', color: 'text-blue-400', bg: 'bg-blue-500/20' },
    { value: timeLeft.minutes, label: 'Minutes', color: 'text-green-400', bg: 'bg-green-500/20' },
    { value: timeLeft.seconds, label: 'Seconds', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  ];

  return (
    <div className="space-y-3">
      <div className="text-center text-sm text-gray-400">{label}</div>
      <div className="grid grid-cols-4 gap-2">
        {units.map((unit, index) => (
          <div key={index} className={`holographic breathe p-3 rounded-lg ${unit.bg} text-center`}>
            <div className={`${unit.color} text-2xl font-bold font-mono`}>
              {String(unit.value).padStart(2, '0')}
            </div>
            <div className="text-xs text-gray-400 mt-1">{unit.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Compact version for lists
export function CompactCountdown({ targetDate }: { targetDate: string }) {
  const calculateCompactTimeLeft = useCallback(() => {
    const difference = new Date(targetDate).getTime() - new Date().getTime();
    
    if (difference <= 0) return 'Expired';

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / 1000 / 60) % 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState(calculateCompactTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateCompactTimeLeft());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [calculateCompactTimeLeft]);

  const isExpired = timeLeft === 'Expired';

  return (
    <span className={`font-mono text-sm ${isExpired ? 'text-red-400' : 'text-green-400'}`}>
      {isExpired ? '⏰ ' : '⏳ '}{timeLeft}
    </span>
  );
}
