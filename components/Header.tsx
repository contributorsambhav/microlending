// In your Header component or any component with wallet connection
import { useEffect, useState } from 'react';

import { FreighterInstallPrompt } from '@/components/FreighterInstallPrompt';
import { useWallet } from '@/context/WalletContext';

export function Header() {
  const { isConnected, connectWallet, publicKey, network } = useWallet();
  const [showFreighterPrompt, setShowFreighterPrompt] = useState(false);

  useEffect(() => {
    const handleFreighterError = () => {
      setShowFreighterPrompt(true);
    };

    window.addEventListener('freighter-install-needed', handleFreighterError);
    
    return () => {
      window.removeEventListener('freighter-install-needed', handleFreighterError);
    };
  }, []);

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      // Error handling is already done in the context
      console.log('Connection failed:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Microlending Platform
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {publicKey?.slice(0, 6)}...{publicKey?.slice(-4)}
                </span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  {network}
                </span>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Freighter Install Prompt */}
      {showFreighterPrompt && (
        <FreighterInstallPrompt 
          onClose={() => setShowFreighterPrompt(false)} 
        />
      )}
    </header>
  );
}