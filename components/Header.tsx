'use client';

import { Loader2, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useWallet } from '@/context/WalletContext';

export function Header() {
  const { isConnected, connectWallet, publicKey, network, isLoading } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      console.log('Attempting to connect wallet...');
      await connectWallet();
      console.log('Wallet connected successfully!');
    } catch (error) {
      console.error('Connection failed in Header:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Wallet className="w-6 h-6 text-blue-600 mr-2" />
            <h1 className="text-xl font-semibold text-gray-900">
              MicroLend Platform
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="flex items-center space-x-2 text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Checking wallet...</span>
              </div>
            ) : isConnected && publicKey ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-mono text-gray-700">
                    {publicKey.slice(0, 6)}...{publicKey.slice(-4)}
                  </span>
                </div>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                  {network}
                </span>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4" />
                    <span>Connect Wallet</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}