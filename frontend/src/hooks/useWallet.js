import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider } from 'ethers';

export function useWallet() {
  const [address, setAddress] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if user manually disconnected
  const isManuallyDisconnected = () => {
    return localStorage.getItem('wallet_disconnected') === 'true';
  };

  // Handle account changes from MetaMask
  const handleAccountsChanged = useCallback((accounts) => {
    if (accounts.length === 0) {
      // User disconnected from MetaMask
      setAddress(null);
      setProvider(null);
      setSigner(null);
      localStorage.removeItem('token');
      localStorage.removeItem('merchant');
      localStorage.setItem('wallet_disconnected', 'true');
    } else if (address && accounts[0].toLowerCase() !== address.toLowerCase()) {
      // Account changed - need to re-authenticate
      localStorage.removeItem('token');
      localStorage.removeItem('merchant');
      localStorage.setItem('wallet_disconnected', 'true');
      window.location.reload();
    }
  }, [address]);

  // Handle chain changes
  const handleChainChanged = useCallback(() => {
    window.location.reload();
  }, []);

  // Setup event listeners
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Only auto-connect if not manually disconnected
      if (!isManuallyDisconnected()) {
        window.ethereum.request({ method: 'eth_accounts' })
          .then(accounts => {
            if (accounts.length > 0) {
              connectWallet();
            }
          });
      }

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [handleAccountsChanged, handleChainChanged]);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setError('Please install MetaMask');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // Clear disconnect flag when user connects
      localStorage.removeItem('wallet_disconnected');
      
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      
      setProvider(provider);
      setSigner(signer);
      setAddress(accounts[0]);
      
      return accounts[0];
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const signMessage = useCallback(async (message) => {
    if (!signer) {
      throw new Error('Wallet not connected');
    }
    return await signer.signMessage(message);
  }, [signer]);

  const disconnect = useCallback(() => {
    // Set flag to prevent auto-reconnect
    localStorage.setItem('wallet_disconnected', 'true');
    localStorage.removeItem('token');
    localStorage.removeItem('merchant');
    
    setAddress(null);
    setProvider(null);
    setSigner(null);
  }, []);

  return {
    address,
    provider,
    signer,
    loading,
    error,
    connectWallet,
    signMessage,
    disconnect,
    isConnected: !!address
  };
}
