
"use client"

import React, { useEffect, useState } from 'react';

interface FreighterInstallPromptProps {
  onClose?: () => void;
}

export const FreighterInstallPrompt: React.FC<FreighterInstallPromptProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if Freighter is installed
    const checkFreighter = async () => {
      if (typeof window !== 'undefined') {
        // Wait a bit for extension to load
        setTimeout(() => {
          if (!window.freighterApi) {
            setIsVisible(true);
          }
        }, 1000);
      }
    };

    checkFreighter();
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const handleInstall = () => {
    window.open('https://freighter.app/', '_blank');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Freighter Wallet Required
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
            To use this microlending platform, you need to install the Freighter wallet extension for Stellar.
          </p>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <h3 className="font-semibold mb-2">What is Freighter?</h3>
            <ul className="space-y-1 mb-4">
              <li>• Official Stellar wallet browser extension</li>
              <li>• Secure storage for your Stellar assets</li>
              <li>• Easy interaction with Stellar dApps</li>
              <li>• Free and open source</li>
            </ul>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleInstall}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Install Freighter
          </button>
          <button
            onClick={handleClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Maybe Later
          </button>
        </div>
        
        <p className="text-xs text-gray-400 text-center mt-4">
          After installation, refresh this page to continue
        </p>
      </div>
    </div>
  );
};

// Usage in your main component or layout
export const WalletConnectionWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Check if user tried to connect but failed due to missing Freighter
    const handleFreighterError = () => {
      setShowInstallPrompt(true);
    };

    // You can trigger this from your wallet context when connection fails
    window.addEventListener('freighter-install-needed', handleFreighterError);

    return () => {
      window.removeEventListener('freighter-install-needed', handleFreighterError);
    };
  }, []);

  return (
    <>
      {children}
      <FreighterInstallPrompt
        onClose={() => setShowInstallPrompt(false)}
      />
    </>
  );
};