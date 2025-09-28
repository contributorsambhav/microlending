'use client';

import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';

import { stellarService } from '@/lib/stellar';
import toast from 'react-hot-toast';

interface WalletContextType {
  publicKey: string | null;
  isConnected: boolean;
  isLoading: boolean;
  network: string;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  setNetwork: (network: string) => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [network, setNetworkState] = useState<string>('testnet');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const connected = await stellarService.isFreighterConnected();
      if (connected) {
        const pubKey = await stellarService.getPublicKey();
        setPublicKey(pubKey);
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Failed to check wallet connection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const connectWallet = async () => {
    try {
      setIsLoading(true);
      const pubKey = await stellarService.connectFreighter();
      setPublicKey(pubKey);
      setIsConnected(true);
      toast.success('Wallet connected successfully!');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (errorMessage.includes('Freighter wallet extension not found')) {
        // Trigger the install prompt
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('freighter-install-needed'));
        }
        toast.error(
          'Freighter wallet not installed. Please install from freighter.app',
          { duration: 6000 }
        );
      } else if (errorMessage.includes('User declined access')) {
        toast.error('Wallet connection was declined by user');
      } else {
        toast.error('Failed to connect wallet. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setPublicKey(null);
    setIsConnected(false);
    toast.success('Wallet disconnected');
  };

  const setNetwork = (newNetwork: string) => {
    setNetworkState(newNetwork);
    toast.success(`Network changed to ${newNetwork}`);
  };

  return (
    <WalletContext.Provider
      value={{
        publicKey,
        isConnected,
        isLoading,
        network,
        connectWallet,
        disconnectWallet,
        setNetwork,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}