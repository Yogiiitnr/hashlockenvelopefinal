import { useState, useEffect } from 'react';
import * as freighterApi from '@stellar/freighter-api';

export interface UseFreighterReturn {
  publicKey: string | null;
  connected: boolean;
  loading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  signTransaction: (xdr: string) => Promise<string>;
  isFreighterInstalled: boolean;
}

/**
 * Hook to manage Freighter wallet connection and interactions
 * Handles connection, disconnection, signing, and network verification
 */
export function useFreighter(): UseFreighterReturn {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFreighterInstalled, setIsFreighterInstalled] = useState(false);

  // Check if Freighter is installed on mount
  useEffect(() => {
    const checkFreighter = async () => {
      try {
        // Use the Freighter API to check if it's installed and connected
        const result = await freighterApi.isConnected();
        
        if (result.error) {
          setIsFreighterInstalled(false);
          console.log('Freighter not detected:', result.error);
        } else {
          setIsFreighterInstalled(true);
          console.log('Freighter detected, connected:', result.isConnected);
        }
      } catch (err) {
        // If error, Freighter is not installed
        setIsFreighterInstalled(false);
        console.log('Freighter not installed:', err);
      }
    };

    // Check immediately
    checkFreighter();

    // Check again after delays (Freighter might load later)
    const timeout1 = setTimeout(checkFreighter, 100);
    const timeout2 = setTimeout(checkFreighter, 500);
    const timeout3 = setTimeout(checkFreighter, 1000);

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
    };
  }, []);

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (!isFreighterInstalled) return;

      try {
        const connectedResult = await freighterApi.isConnected();
        if (connectedResult.error) {
          console.error('Error checking connection:', connectedResult.error);
          return;
        }

        if (connectedResult.isConnected) {
          const addressResult = await freighterApi.getAddress();
          if (!addressResult.error && addressResult.address) {
            setPublicKey(addressResult.address);
            setConnected(true);
          }
        }
      } catch (err) {
        console.error('Error checking connection:', err);
      }
    };

    checkConnection();
  }, [isFreighterInstalled]);

  /**
   * Connect to Freighter wallet
   * Requests access and verifies the network is set to TESTNET
   */
  const connect = async () => {
    if (!isFreighterInstalled) {
      setError('Freighter wallet is not installed. Please install it from freighter.app');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Request access (this will prompt the user to approve the connection)
      const accessResult = await freighterApi.requestAccess();
      
      if (accessResult.error) {
        throw new Error(accessResult.error.message || 'Failed to get permission');
      }

      // Get the address
      const key = accessResult.address;
      
      // Verify network is TESTNET
      const networkResult = await freighterApi.getNetwork();
      if (networkResult.error) {
        throw new Error(networkResult.error.message || 'Failed to get network');
      }

      if (networkResult.network !== 'TESTNET') {
        setError('Please switch Freighter to TESTNET network');
        setLoading(false);
        return;
      }

      setPublicKey(key);
      setConnected(true);
      setError(null);
    } catch (err: any) {
      console.error('Error connecting to Freighter:', err);
      setError(err.message || 'Failed to connect to Freighter wallet');
      setConnected(false);
      setPublicKey(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Disconnect from Freighter wallet
   */
  const disconnect = () => {
    setPublicKey(null);
    setConnected(false);
    setError(null);
  };

  /**
   * Sign a transaction using Freighter
   * @param xdr - The transaction XDR string
   * @returns The signed transaction XDR
   */
  const signTransaction = async (xdr: string): Promise<string> => {
    if (!isFreighterInstalled) {
      throw new Error('Freighter wallet is not installed');
    }

    if (!connected) {
      throw new Error('Wallet is not connected');
    }

    try {
      const result = await freighterApi.signTransaction(xdr, {
        networkPassphrase: 'Test SDF Network ; September 2015',
      });

      if (result.error) {
        throw new Error(result.error.message || 'Failed to sign transaction');
      }

      return result.signedTxXdr;
    } catch (err: any) {
      console.error('Error signing transaction:', err);
      throw new Error(err.message || 'Failed to sign transaction');
    }
  };

  return {
    publicKey,
    connected,
    loading,
    error,
    connect,
    disconnect,
    signTransaction,
    isFreighterInstalled,
  };
}
