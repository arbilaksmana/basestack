import { useState, useEffect, useCallback } from 'react';
import { getAuthMessage, connectWallet as apiConnectWallet } from '../api';

export function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [merchant, setMerchant] = useState(() => {
    const saved = localStorage.getItem('merchant');
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback(async (walletAddress, signMessage) => {
    // Get message to sign
    const { message } = await getAuthMessage();
    
    // Sign message with wallet
    const signature = await signMessage(message);
    
    // Authenticate with backend
    const result = await apiConnectWallet(walletAddress, signature);
    
    // Save to state and localStorage
    setToken(result.token);
    setMerchant(result.merchant);
    localStorage.setItem('token', result.token);
    localStorage.setItem('merchant', JSON.stringify(result.merchant));
    
    return result;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setMerchant(null);
    localStorage.removeItem('token');
    localStorage.removeItem('merchant');
  }, []);

  return {
    token,
    merchant,
    isAuthenticated: !!token,
    login,
    logout
  };
}
