import { useState, useEffect } from 'react';

export const useBottomNav = () => {
  const [isVisible, setIsVisible] = useState(false);

  const showBottomNav = () => {
    setIsVisible(true);
  };

  const hideBottomNav = () => {
    setIsVisible(false);
  };

  const toggleBottomNav = () => {
    setIsVisible(prev => !prev);
  };

  return {
    isVisible,
    showBottomNav,
    hideBottomNav,
    toggleBottomNav
  };
};
