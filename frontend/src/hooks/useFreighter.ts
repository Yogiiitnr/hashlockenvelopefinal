import { useState, useEffect } from 'react';

// Freighter wallet types
interface FreighterAPI {
  isConnected: () => Promise<boolean>;
  getPublicKey: () => Promise<string>;
  signTransaction: (xdr: string, options?: { network?: string; networkPassphrase?: string }) => Promise<string>;
  getNetwork: () => Promise<string>;
  isAllowed: () => Promise<boolean>;
  setAllowed: () => Promise<void>;
}

declare global {
  interface Window {
    freighterApi?: FreighterAPI;
  }
}

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
    const checkFreighter = () => {
      // Check multiple possible injection points
      const installed = !!(
        window.freighterApi || 
        (window as any).freighter ||
        document.querySelector('[data-freighter-installed]')
      );
      setIsFreighterInstalled(installed);
      console.log('Freighter detected:', installed);
      console.log('window.freighterApi:', window.freighterApi);
      console.log('Available window properties:', Object.keys(window).filter(k => k.toLowerCase().includes('freight')));
    };

    // Check immediately
    checkFreighter();

    // Check again after delays (Freighter might load later)
    const timeout1 = setTimeout(checkFreighter, 100);
    const timeout2 = setTimeout(checkFreighter, 500);
    const timeout3 = setTimeout(checkFreighter, 1000);
    const timeout4 = setTimeout(checkFreighter, 2000);

    // Also listen for when the page is fully loaded
    if (document.readyState !== 'complete') {
      window.addEventListener('load', checkFreighter);
    }

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
      clearTimeout(timeout4);
      window.removeEventListener('load', checkFreighter);
    };
  }, []);

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (!window.freighterApi) return;

      try {
        const isConnected = await window.freighterApi.isConnected();
        if (isConnected) {
          const key = await window.freighterApi.getPublicKey();
          setPublicKey(key);
          setConnected(true);
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
    if (!window.freighterApi) {
      setError('Freighter wallet is not installed. Please install it from freighter.app');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Request permission to access Freighter
      const isAllowed = await window.freighterApi.isAllowed();
      
      if (!isAllowed) {
        await window.freighterApi.setAllowed();
      }

      // Get the public key
      const key = await window.freighterApi.getPublicKey();
      
      // Verify network is TESTNET
      const network = await window.freighterApi.getNetwork();
      if (network !== 'TESTNET') {
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
    if (!window.freighterApi) {
      throw new Error('Freighter wallet is not installed');
    }

    if (!connected) {
      throw new Error('Wallet is not connected');
    }

    try {
      const signedXdr = await window.freighterApi.signTransaction(xdr, {
        network: 'TESTNET',
        networkPassphrase: 'Test SDF Network ; September 2015',
      });

      return signedXdr;
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
