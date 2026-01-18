'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    api,
    DashboardMetrics,
    Plan,
    BillingLog,
    Subscriber,
    Subscription,
    Merchant,
    PriceRates
} from '../lib/api';

// ============================================
// AUTH HOOK
// ============================================

interface AuthState {
    isAuthenticated: boolean;
    merchant: Merchant | null;
    token: string | null;
}

export function useAuth() {
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        merchant: null,
        token: null,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing token on mount
        const token = localStorage.getItem('auth_token');
        const merchantData = localStorage.getItem('merchant');

        if (token && merchantData) {
            setAuthState({
                isAuthenticated: true,
                token,
                merchant: JSON.parse(merchantData),
            });
        }
        setLoading(false);
    }, []);

    const connectWallet = useCallback(async (walletAddress: string, signature: string) => {
        const response = await api.auth.connectWallet(walletAddress, signature);

        if (response.success && response.data) {
            const { token, merchant } = response.data;
            localStorage.setItem('auth_token', token);
            localStorage.setItem('merchant', JSON.stringify(merchant));

            setAuthState({
                isAuthenticated: true,
                token,
                merchant,
            });

            return { success: true };
        }

        return { success: false, error: response.error };
    }, []);

    const disconnect = useCallback(() => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('merchant');
        setAuthState({
            isAuthenticated: false,
            token: null,
            merchant: null,
        });
    }, []);

    const getAuthMessage = useCallback(async () => {
        const response = await api.auth.getMessage();
        return response.success ? response.data?.message : null;
    }, []);

    return {
        ...authState,
        loading,
        connectWallet,
        disconnect,
        getAuthMessage,
    };
}

// ============================================
// DASHBOARD HOOK
// ============================================

export function useDashboard() {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMetrics = useCallback(async () => {
        setLoading(true);
        const response = await api.dashboard.getMetrics();

        if (response.success && response.data) {
            setMetrics(response.data);
            setError(null);
        } else {
            setError(response.error?.message || 'Failed to fetch metrics');
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchMetrics();
    }, [fetchMetrics]);

    return { metrics, loading, error, refetch: fetchMetrics };
}

// ============================================
// PLANS HOOK
// ============================================

export function usePlans() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPlans = useCallback(async () => {
        setLoading(true);
        const response = await api.plans.getPlans();

        if (response.success && response.data) {
            setPlans(response.data);
            setError(null);
        } else {
            setError(response.error?.message || 'Failed to fetch plans');
        }
        setLoading(false);
    }, []);

    const createPlan = useCallback(async (data: {
        name: string;
        description?: string;
        billingInterval: number;
        priceIdrx: string;
        priceUsdc: string;
        priceUsdt: string;
    }) => {
        const response = await api.plans.createPlan(data);

        if (response.success) {
            await fetchPlans(); // Refresh plans list
        }

        return response;
    }, [fetchPlans]);

    const updatePlan = useCallback(async (planId: number, data: Partial<Plan>) => {
        const response = await api.plans.updatePlan(planId, data);

        if (response.success) {
            await fetchPlans(); // Refresh plans list
        }

        return response;
    }, [fetchPlans]);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    return { plans, loading, error, createPlan, updatePlan, refetch: fetchPlans };
}

// ============================================
// BILLING LOGS HOOK
// ============================================

export function useBillingLogs() {
    const [logs, setLogs] = useState<BillingLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        const response = await api.dashboard.getBillingLogs();

        if (response.success && response.data) {
            setLogs(response.data);
            setError(null);
        } else {
            setError(response.error?.message || 'Failed to fetch billing logs');
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    return { logs, loading, error, refetch: fetchLogs };
}

// ============================================
// SUBSCRIBERS HOOK
// ============================================

export function useSubscribers() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSubscribers = useCallback(async () => {
        setLoading(true);
        const response = await api.dashboard.getSubscribers();

        if (response.success && response.data) {
            setSubscribers(response.data);
            setError(null);
        } else {
            setError(response.error?.message || 'Failed to fetch subscribers');
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchSubscribers();
    }, [fetchSubscribers]);

    return { subscribers, loading, error, refetch: fetchSubscribers };
}

// ============================================
// MY SUBSCRIPTIONS HOOK
// ============================================

export function useMySubscriptions(walletAddress: string | null) {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSubscriptions = useCallback(async () => {
        if (!walletAddress) return;

        setLoading(true);
        const response = await api.subscriptions.getMySubscriptions(walletAddress);

        if (response.success && response.data) {
            setSubscriptions(response.data);
            setError(null);
        } else {
            setError(response.error?.message || 'Failed to fetch subscriptions');
        }
        setLoading(false);
    }, [walletAddress]);

    const cancelSubscription = useCallback(async (subscriptionId: number, txHash?: string) => {
        if (!walletAddress) return { success: false };

        const response = await api.subscriptions.cancelSubscription(subscriptionId, walletAddress, txHash);

        if (response.success) {
            await fetchSubscriptions(); // Refresh subscriptions
        }

        return response;
    }, [walletAddress, fetchSubscriptions]);

    useEffect(() => {
        if (walletAddress) {
            fetchSubscriptions();
        }
    }, [walletAddress, fetchSubscriptions]);

    return { subscriptions, loading, error, cancelSubscription, refetch: fetchSubscriptions };
}

// ============================================
// PRICES HOOK
// ============================================

export function usePrices() {
    const [rates, setRates] = useState<PriceRates | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRates = useCallback(async () => {
        setLoading(true);
        const response = await api.prices.getRates();

        if (response.success && response.data) {
            setRates(response.data);
            setError(null);
        } else {
            setError(response.error?.message || 'Failed to fetch rates');
        }
        setLoading(false);
    }, []);

    const convertUsdToIdrx = useCallback(async (usd: number) => {
        return api.prices.convertUsdToIdrx(usd);
    }, []);

    useEffect(() => {
        fetchRates();
    }, [fetchRates]);

    return { rates, loading, error, convertUsdToIdrx, refetch: fetchRates };
}

// ============================================
// CHECKOUT HOOK
// ============================================

export function useCheckout(planSlug: string | null) {
    const [planDetails, setPlanDetails] = useState<{
        id: number;
        name: string;
        slug: string;
        description: string;
        billingInterval: number;
        prices: {
            IDRX: string;
            USDC: string;
            USDT: string;
        };
    } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPlanDetails = useCallback(async () => {
        if (!planSlug) return;

        setLoading(true);
        const response = await api.checkout.getPlanBySlug(planSlug);

        if (response.success && response.data) {
            setPlanDetails(response.data);
            setError(null);
        } else {
            setError(response.error?.message || 'Failed to fetch plan details');
        }
        setLoading(false);
    }, [planSlug]);

    const initCheckout = useCallback(async (
        planId: number,
        walletAddress: string,
        selectedToken: string,
        country?: string
    ) => {
        return api.checkout.initCheckout(planId, walletAddress, selectedToken, country);
    }, []);

    const confirmCheckout = useCallback(async (
        planId: number,
        walletAddress: string,
        selectedToken: string,
        txHash: string
    ) => {
        return api.checkout.confirmCheckout(planId, walletAddress, selectedToken, txHash);
    }, []);

    useEffect(() => {
        if (planSlug) {
            fetchPlanDetails();
        }
    }, [planSlug, fetchPlanDetails]);

    return {
        planDetails,
        loading,
        error,
        initCheckout,
        confirmCheckout,
        refetch: fetchPlanDetails,
    };
}

// ============================================
// MERCHANT PROFILE HOOK
// ============================================

export function useMerchantProfile() {
    const [profile, setProfile] = useState<Merchant | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        const response = await api.merchant.getProfile();

        if (response.success && response.data) {
            setProfile(response.data);
            setError(null);
        } else {
            setError(response.error?.message || 'Failed to fetch profile');
        }
        setLoading(false);
    }, []);

    const updateProfile = useCallback(async (data: { name?: string }) => {
        const response = await api.merchant.updateProfile(data);

        if (response.success && response.data) {
            setProfile(response.data);
        }

        return response;
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    return { profile, loading, error, updateProfile, refetch: fetchProfile };
}
