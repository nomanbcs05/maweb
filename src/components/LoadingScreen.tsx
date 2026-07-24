import React, { useState, useEffect } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Immediately hide loading screen and show modal
    setIsVisible(false);
    setTimeout(onComplete, 100); // Fast transition
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#071326] flex items-center justify-center animate-fade-in">
      <div className="h-[200px]">
        {/* EXACT LOGO - NO MODIFICATIONS */}
        <img 
          src="/logo.png" 
          alt="M.A BAKERS" 
          className="h-full w-auto object-contain"
        />
      </div>
    </div>
  );
};
