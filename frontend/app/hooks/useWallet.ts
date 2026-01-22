'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useDisconnect, useSignMessage, useChainId } from 'wagmi';
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

const NETWORK_NAMES: Record<number, string> = {
    1: 'Ethereum Mainnet',
    8453: 'Base Mainnet',
    84532: 'Base Sepolia',
    31337: 'Hardhat Local',
};

export function useWallet() {
    const { address: wagmiAddress, status: wagmiStatus, isConnected } = useAccount();
    const { disconnect: wagmiDisconnect } = useDisconnect();
    const { signMessageAsync } = useSignMessage();
    const chainId = useChainId();

    const [state, setState] = useState<WalletState>({
        address: null,
        chainId: null,
        status: 'disconnected',
        error: null,
        isAuthenticated: false,
        merchant: null,
    });

    // Handle chain ID
    const getNetworkName = useCallback((id: number | null) => {
        if (!id) return 'Unknown Network';
        return NETWORK_NAMES[id] || `Chain ID: ${id}`;
    }, []);

    // Sync Wagmi state with local state and check auth
    useEffect(() => {
        const syncState = async () => {
            // If Wagmi is disconnected, reset everything
            if (wagmiStatus === 'disconnected') {
                setState(prev => ({
                    ...prev,
                    address: null,
                    chainId: null,
                    status: 'disconnected',
                    isAuthenticated: false,
                    merchant: null
                }));
                return;
            }

            // If Wagmi is connected, check if we are authenticated
            if (wagmiStatus === 'connected' && wagmiAddress) {
                const token = localStorage.getItem('auth_token');
                const merchantData = localStorage.getItem('merchant');
                const storedAddress = merchantData ? JSON.parse(merchantData).walletAddress : null;

                // Valid auth for CURRENT wallet
                if (token && merchantData && storedAddress === wagmiAddress) {
                    setState({
                        address: wagmiAddress,
                        chainId: String(chainId),
                        status: 'connected',
                        error: null,
                        isAuthenticated: true,
                        merchant: JSON.parse(merchantData),
                    });
                } else {
                    // Connected but not authenticated yet
                    setState(prev => ({
                        ...prev,
                        address: wagmiAddress,
                        chainId: String(chainId),
                        status: 'connecting', // waiting for sig
                        isAuthenticated: false,
                        merchant: null
                    }));

                    // Optional: Trigger sign in automatically or wait for user action?
                    // For now, we'll let the user trigger 'connect' (which is now 'login') explicitly
                    // OR we can trigger it: cancel previous logic.
                    // Let's just update the state so the UI knows we are "Wallet Connected" but "Not App Logged In"
                }
            }
        };

        syncState();
    }, [wagmiStatus, wagmiAddress, chainId]);


    const connect = useCallback(async () => {
        // This function now effectively serves as "Login with Wallet"
        // because "Connecting" is handled by OnchainKit button.

        if (!wagmiAddress) {
            // If called while wallet not connected, we can't do much. 
            // The UI should encourage using the OnchainKit button.
            setState(prev => ({ ...prev, error: "Please connect your wallet first." }));
            return { success: false, error: "Wallet not connected" };
        }

        setState(prev => ({ ...prev, status: 'signing', error: null }));

        try {
            const messageResponse = await api.auth.getMessage();
            if (!messageResponse.success || !messageResponse.data) {
                throw new Error('Failed to get authentication message from server.');
            }

            const message = messageResponse.data.message;

            const signature = await signMessageAsync({ message });

            const authResponse = await api.auth.connectWallet(wagmiAddress, signature);

            if (!authResponse.success || !authResponse.data) {
                throw new Error(authResponse.error?.message || 'Authentication failed.');
            }

            const { token, merchant } = authResponse.data;
            localStorage.setItem('auth_token', token);
            localStorage.setItem('merchant', JSON.stringify(merchant));

            setState(prev => ({
                ...prev,
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
    }, [wagmiAddress, signMessageAsync]);

    const disconnect = useCallback(() => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('merchant');
        wagmiDisconnect();

        setState({
            address: null,
            chainId: null,
            status: 'disconnected',
            error: null,
            isAuthenticated: false,
            merchant: null,
        });
    }, [wagmiDisconnect]);

    const checkConnection = useCallback(async () => {
        return isConnected;
    }, [isConnected]);

    // Format address for display
    const formatAddress = useCallback((addr: string | null) => {
        if (!addr) return '';
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    }, []);

    // Auto-login if we have a token (handled in useEffect, but we ensure structure matches)

    return {
        ...state,
        formattedAddress: formatAddress(state.address),
        networkName: getNetworkName(typeof chainId === 'number' ? chainId : null),
        connect, // This is now "Sign In"
        disconnect,
        checkConnection,
    };
}
