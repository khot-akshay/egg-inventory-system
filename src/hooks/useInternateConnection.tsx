import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const useInternetConnection = () => {
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' && navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('You are back online!', {position:'top-center'});
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('You are offline. Please check your internet connection.',{position:'top-center'});
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

export default useInternetConnection;
