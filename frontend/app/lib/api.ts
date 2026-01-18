// API Client for BaseStack Backend
// Base URL for API calls

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        code: string;
    };
}

export interface Merchant {
    id: number;
    walletAddress: string;
    name: string;
    createdAt?: string;
}

export interface Plan {
    id: number;
    merchantId: number;
    onchainPlanId?: number;
    name: string;
    slug: string;
    description: string;
    billingInterval: number;
    priceIdrx: string;
    priceUsdc: string;
    priceUsdt: string;
    isActive: boolean;
    status?: 'active' | 'inactive';
    createdAt: string;
}

export interface Subscription {
    id: number;
    planId: number;
    subscriberId: number;
    payToken: string;
    amount: string;
    nextPayment?: string;
    status: 'active' | 'past_due' | 'cancelled';
    createdAt: string;
    planName?: string;
}

export interface DashboardMetrics {
    activeCount: number;
    pastDueCount: number;
    mrr: number;
    totalSubscribers: number;
    revenueSplit?: { token: string; percentage: number }[];
}

export interface BillingLog {
    id: number;
    subscriptionId: number;
    amount: string;
    txHash: string;
    status: string;
    createdAt: string;
    payToken: string;
    planName: string;
    subscriberWallet: string;
}

export interface Subscriber {
    id: number;
    walletAddress: string;
    createdAt: string;
    subscriptionCount: number;
    activeCount: number;
    planName?: string;
    status?: 'active' | 'past_due' | 'cancelled';
    nextPayment?: string;
}

export interface CheckoutInfo {
    plan: Plan;
    amount: string;
    token: string;
    merchantWallet: string;
    tokenAddress: string;
}

export interface PriceRates {
    USD_TO_IDR: number;
    updatedAt: string;
}

// Helper function to get auth token
const getToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('auth_token');
    }
    return null;
};

// Helper function to make API requests
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const token = getToken();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || { message: 'Request failed', code: 'REQUEST_FAILED' },
            };
        }

        return data;
    } catch (error) {
        return {
            success: false,
            error: {
                message: error instanceof Error ? error.message : 'Network error',
                code: 'NETWORK_ERROR',
            },
        };
    }
}

// ============================================
// AUTH API
// ============================================

export const authApi = {
    // Get message to sign for wallet authentication
    getMessage: () =>
        apiRequest<{ message: string }>('/api/auth/message'),

    // Connect wallet with signature
    connectWallet: (walletAddress: string, signature: string) =>
        apiRequest<{ token: string; merchant: Merchant }>('/api/auth/connect-wallet', {
            method: 'POST',
            body: JSON.stringify({ walletAddress, signature }),
        }),
};

// ============================================
// MERCHANT API
// ============================================

export const merchantApi = {
    // Get merchant profile
    getProfile: () =>
        apiRequest<Merchant>('/api/merchant/profile'),

    // Update merchant profile
    updateProfile: (data: { name?: string }) =>
        apiRequest<Merchant>('/api/merchant/profile', {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),
};

// ============================================
// PLANS API
// ============================================

export const plansApi = {
    // Get all plans for merchant
    getPlans: () =>
        apiRequest<Plan[]>('/api/plans'),

    // Create new plan
    createPlan: (data: {
        name: string;
        description?: string;
        billingInterval: number;
        priceIdrx: string;
        priceUsdc: string;
        priceUsdt: string;
        onchainPlanId?: number;
    }) =>
        apiRequest<Plan>('/api/plans', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    // Update plan
    updatePlan: (planId: number, data: Partial<Plan>) =>
        apiRequest<Plan>(`/api/plans/${planId}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),
};

// ============================================
// DASHBOARD API
// ============================================

export const dashboardApi = {
    // Get dashboard metrics
    getMetrics: () =>
        apiRequest<DashboardMetrics>('/api/dashboard/metrics'),

    // Get billing logs
    getBillingLogs: () =>
        apiRequest<BillingLog[]>('/api/dashboard/billing-logs'),

    // Get subscribers
    getSubscribers: () =>
        apiRequest<Subscriber[]>('/api/dashboard/subscribers'),
};

// ============================================
// CHECKOUT API
// ============================================

export const checkoutApi = {
    // Get plan details for checkout (by slug)
    getPlanBySlug: (planSlug: string) =>
        apiRequest<{
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
        }>(`/api/checkout/${planSlug}`),

    // Initialize checkout
    initCheckout: (planId: number, walletAddress: string, selectedToken: string, country?: string) =>
        apiRequest<CheckoutInfo>(`/api/checkout/${planId}/init`, {
            method: 'POST',
            body: JSON.stringify({ walletAddress, selectedToken, country }),
        }),

    // Confirm checkout after payment
    confirmCheckout: (planId: number, walletAddress: string, selectedToken: string, txHash: string) =>
        apiRequest<{ subscription: Subscription }>(`/api/checkout/${planId}/confirm`, {
            method: 'POST',
            body: JSON.stringify({ walletAddress, selectedToken, txHash }),
        }),
};

// ============================================
// SUBSCRIPTIONS API
// ============================================

export const subscriptionsApi = {
    // Get user's subscriptions
    getMySubscriptions: (walletAddress: string) =>
        apiRequest<Subscription[]>(`/api/me/subscriptions?walletAddress=${walletAddress}`),

    // Cancel subscription
    cancelSubscription: (subscriptionId: number, walletAddress: string, txHash?: string) =>
        apiRequest<Subscription>(`/api/me/subscriptions/${subscriptionId}/cancel`, {
            method: 'POST',
            body: JSON.stringify({ walletAddress, txHash }),
        }),
};

// ============================================
// PRICES API
// ============================================

export const pricesApi = {
    // Get current exchange rates
    getRates: () =>
        apiRequest<PriceRates>('/api/prices'),

    // Convert USD to IDRX
    convertUsdToIdrx: (usd: number) =>
        apiRequest<{
            usd: number;
            idrx: number;
            rate: number;
            updatedAt: string;
        }>(`/api/prices/convert?usd=${usd}`),
};

// ============================================
// HEALTH CHECK
// ============================================

export const healthApi = {
    check: () =>
        apiRequest<{ status: string; timestamp: string }>('/health'),
};

// Export all APIs
export const api = {
    auth: authApi,
    merchant: merchantApi,
    plans: plansApi,
    dashboard: dashboardApi,
    checkout: checkoutApi,
    subscriptions: subscriptionsApi,
    prices: pricesApi,
    health: healthApi,
};

export default api;
