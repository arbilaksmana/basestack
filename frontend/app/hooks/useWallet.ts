'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'signing' | 'connected' | 'error';

export interface WalletState {
    address: string | null;
    chainId: string | null;
    status: ConnectionStatus;
    error: string | null;
    isAuthenticated: boolean;
    merchant: {
        id: number;
        walletAddress: string;
        name: string;
    } | null;
}

const NETWORK_NAMES: Record<string, string> = {
    '0x1': 'Ethereum Mainnet',
    '0x2105': 'Base Mainnet',
    '0x14a34': 'Base Sepolia',
    '0x7a69': 'Hardhat Local', // 31337
    '0x539': 'Localhost', // 1337
};

export function useWallet() {
    const [state, setState] = useState<WalletState>({
        address: null,
        chainId: null,
        status: 'disconnected',
        error: null,
        isAuthenticated: false,
        merchant: null,
    });

    // Handle chain ID
    const getNetworkName = useCallback((chainId: string | null) => {
        if (!chainId) return 'Unknown Network';
        return NETWORK_NAMES[chainId] || `Chain ID: ${parseInt(chainId, 16)}`;
    }, []);

    // Check for existing connection on mount
    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        const merchantData = localStorage.getItem('merchant');

        if (token && merchantData) {
            try {
                const merchant = JSON.parse(merchantData);
                setState(prev => ({
                    ...prev,
                    address: merchant.walletAddress,
                    status: 'connected',
                    isAuthenticated: true,
                    merchant,
                }));
            } catch {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('merchant');
            }
        }

        // Get initial chain ID
        if (typeof window !== 'undefined' && window.ethereum) {
            window.ethereum.request({ method: 'eth_chainId' })
                .then((result: unknown) => {
                    const chainId = result as string;
                    setState(prev => ({ ...prev, chainId }));
                })
                .catch(() => { });
        }
    }, []);

    // Listen for account and chain changes
    useEffect(() => {
        if (typeof window === 'undefined' || !window.ethereum) return;

        const handleAccountsChanged = (accounts: unknown) => {
            const accountList = accounts as string[];
            if (accountList.length === 0) {
                disconnect();
            } else if (state.address && accountList[0] !== state.address) {
                disconnect();
            }
        };

        const handleChainChanged = (chainId: unknown) => {
            setState(prev => ({ ...prev, chainId: chainId as string }));
        };

        window.ethereum.on?.('accountsChanged', handleAccountsChanged);
        window.ethereum.on?.('chainChanged', handleChainChanged);

        return () => {
            window.ethereum?.removeListener?.('accountsChanged', handleAccountsChanged);
            window.ethereum?.removeListener?.('chainChanged', handleChainChanged);
        };
    }, [state.address]);

    const connect = useCallback(async () => {
        setState(prev => ({ ...prev, status: 'connecting', error: null }));

        try {
            if (typeof window === 'undefined' || !window.ethereum) {
                throw new Error('No Web3 wallet found. Please install MetaMask or Coinbase Wallet.');
            }

            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts',
            }) as string[];

            if (!accounts || accounts.length === 0) {
                throw new Error('No accounts found. Please connect your wallet.');
            }

            const walletAddress = accounts[0];
            const chainId = await window.ethereum.request({ method: 'eth_chainId' }) as string;

            setState(prev => ({ ...prev, address: walletAddress, chainId, status: 'signing' }));

            const messageResponse = await api.auth.getMessage();
            if (!messageResponse.success || !messageResponse.data) {
                throw new Error('Failed to get authentication message from server.');
            }

            const message = messageResponse.data.message;

            const signature = await window.ethereum.request({
                method: 'personal_sign',
                params: [message, walletAddress],
            }) as string;

            const authResponse = await api.auth.connectWallet(walletAddress, signature);

            if (!authResponse.success || !authResponse.data) {
                throw new Error(authResponse.error?.message || 'Authentication failed.');
            }

            const { token, merchant } = authResponse.data;
            localStorage.setItem('auth_token', token);
            localStorage.setItem('merchant', JSON.stringify(merchant));

            setState(prev => ({
                ...prev,
                address: walletAddress,
                chainId,
                status: 'connected',
                error: null,
                isAuthenticated: true,
                merchant,
            }));

            return { success: true, merchant };

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
            setState(prev => ({
                ...prev,
                status: 'error',
                error: errorMessage,
            }));
            return { success: false, error: errorMessage };
        }
    }, []);

    const disconnect = useCallback(() => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('merchant');

        setState({
            address: null,
            chainId: null,
            status: 'disconnected',
            error: null,
            isAuthenticated: false,
            merchant: null,
        });
    }, []);

    const checkConnection = useCallback(async () => {
        if (typeof window === 'undefined' || !window.ethereum) {
            return false;
        }

        try {
            const accounts = await window.ethereum.request({
                method: 'eth_accounts',
            }) as string[];

            return accounts.length > 0;
        } catch {
            return false;
        }
    }, []);

    // Format address for display
    const formatAddress = useCallback((address: string | null) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }, []);

    return {
        ...state,
        formattedAddress: formatAddress(state.address),
        networkName: getNetworkName(state.chainId),
        connect,
        disconnect,
        checkConnection,
    };
}
