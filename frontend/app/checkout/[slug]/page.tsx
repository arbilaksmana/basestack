"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Check,
    Globe,
    ChevronDown,
    Lock,
    Zap,
    BadgeCheck,
    X,
    Loader2,
    AlertCircle,
    Wallet
} from "lucide-react";
import { api } from "../../lib/api";
import { subscribeOnchain, getTokenBalance, getPlanOnchain, ensureBaseSepolia } from "../../lib/contract";

// Token type
interface CurrencyOption {
    code: string;
    symbol: string;
    amount: string;
    label: string;
    flag: string;
    recommended: boolean;
}

export default function CheckoutPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    // States
    const [plan, setPlan] = useState<{
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
        merchantName?: string;
        onchainPlanId?: number;
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currencies, setCurrencies] = useState<CurrencyOption[]>([]);
    const [selectedCurrency, setSelectedCurrency] = useState<CurrencyOption | null>(null);
    const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStep, setProcessingStep] = useState<string>("");
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [tokenBalance, setTokenBalance] = useState<string | null>(null);
    const [onchainPlanId, setOnchainPlanId] = useState<number | null>(null);
    const [isOnchainActive, setIsOnchainActive] = useState<boolean | null>(null);
    const [onchainChecking, setOnchainChecking] = useState(false);

    // Fetch plan details
    useEffect(() => {
        async function fetchPlan() {
            if (!slug) return;

            setLoading(true);
            try {
                const response = await api.checkout.getPlanBySlug(slug);

                if (response.success && response.data) {
                    const planData = response.data;
                    setPlan(planData);

                    // Verify On-chain Status
                    if (planData.onchainPlanId) {
                        checkOnchainStatus(planData.onchainPlanId);
                    } else {
                        // If backend doesn't return onchainPlanId, assume it might match ID or warn
                        // For now we skip check or guess.
                        // Ideally we fix backend.
                        console.warn("No onchainPlanId returned from backend");
                    }

                    // Build currency options from plan prices
                    const currencyOptions: CurrencyOption[] = [
                        {
                            code: "IDRX",
                            symbol: "Rp",
                            amount: planData.prices.IDRX,
                            label: "IDRX",
                            flag: "🇮🇩",
                            recommended: true
                        },
                        {
                            code: "USDC",
                            symbol: "$",
                            amount: planData.prices.USDC,
                            label: "USDC",
                            flag: "🇺🇸",
                            recommended: false
                        },
                        {
                            code: "USDT",
                            symbol: "$",
                            amount: planData.prices.USDT,
                            label: "USDT",
                            flag: "🇺🇸",
                            recommended: false
                        }
                    ];
                    setCurrencies(currencyOptions);
                    setSelectedCurrency(currencyOptions[0]);
                } else {
                    setError(response.error?.message || "Plan not found");
                }
            } catch (err) {
                setError("Failed to load plan details");
            } finally {
                setLoading(false);
            }
        }

        async function checkOnchainStatus(id: number) {
            setOnchainChecking(true);
            try {
                // We don't need to ensure network just to read? 
                // Actually getPlanOnchain uses provider which might default to RPC_URL if not connected.
                const onchainPlan = await getPlanOnchain(id);
                if (!onchainPlan.active) {
                    setError("This subscription plan is not active on the Base Sepolia network.");
                }
                setIsOnchainActive(onchainPlan.active);
            } catch (err) {
                console.error("Failed to check onchain plan:", err);
                // Don't block UI but warn
                // setError("Could not verify plan on blockchain. It may not exist.");
            } finally {
                setOnchainChecking(false);
            }
        }

        fetchPlan();
    }, [slug]);

    const formatPrice = (currency: CurrencyOption) => {
        if (currency.code === "IDRX") {
            return `Rp ${parseInt(currency.amount).toLocaleString()}`;
        }
        return `${currency.amount} ${currency.code}`;
    };

    const formatBillingInterval = (seconds: number) => {
        if (seconds >= 365 * 86400) return "year";
        if (seconds >= 30 * 86400) return "month";
        if (seconds >= 7 * 86400) return "week";
        return "day";
    };

    const handleSubscribe = async () => {
        if (!plan || !selectedCurrency) return;

        setIsProcessing(true);
        setError(null);
        setProcessingStep("Connecting wallet...");

        try {
            // Check if ethereum provider exists
            if (typeof window === "undefined" || !window.ethereum) {
                throw new Error("Please install MetaMask or Coinbase Wallet to subscribe.");
            }

            // Request wallet connection
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            }) as string[];

            if (!accounts || accounts.length === 0) {
                throw new Error("No wallet connected.");
            }

            const userWallet = accounts[0];
            setWalletAddress(userWallet);

            // Force switch to Base Sepolia
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            if (chainId !== '0x14a34') { // 84532
                setProcessingStep("Switching network...");
                try {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: '0x14a34' }],
                    });
                } catch (switchError: any) {
                    // This error code indicates that the chain has not been added to MetaMask.
                    if (switchError.code === 4902) {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [
                                {
                                    chainId: '0x14a34',
                                    chainName: 'Base Sepolia',
                                    rpcUrls: ['https://sepolia.base.org'],
                                    blockExplorerUrls: ['https://sepolia-explorer.base.org'],
                                    nativeCurrency: {
                                        name: 'Ether',
                                        symbol: 'ETH',
                                        decimals: 18
                                    }
                                },
                            ],
                        });
                    } else {
                        throw switchError;
                    }
                }
            }

            // Check token balance
            setProcessingStep("Checking balance...");
            try {
                const balance = await getTokenBalance(userWallet, selectedCurrency.code);
                setTokenBalance(balance);

                const requiredAmount = parseFloat(selectedCurrency.amount);
                const userBalance = parseFloat(balance);

                if (userBalance < requiredAmount) {
                    throw new Error(`Insufficient ${selectedCurrency.code} balance. You have ${balance}, need ${selectedCurrency.amount}`);
                }
            } catch (balanceErr) {
                console.warn("Could not check balance:", balanceErr);
                // Continue anyway, contract will fail if insufficient
            }

            // Initialize checkout with backend to get onchain plan ID
            setProcessingStep("Initializing checkout...");
            const initResponse = await api.checkout.initCheckout(
                plan.id,
                userWallet,
                selectedCurrency.code
            );

            if (!initResponse.success || !initResponse.data) {
                throw new Error(initResponse.error?.message || "Failed to initialize checkout");
            }

            // Get onchain plan ID from backend (assuming it's stored)
            // For now, we'll use the plan.id as onchainPlanId
            // In production, backend should return the onchainPlanId
            const planIdOnchain = (initResponse.data as { onchainPlanId?: number }).onchainPlanId || plan.id;

            // Subscribe on-chain
            setProcessingStep("Approving token...");
            let txResult;
            try {
                txResult = await subscribeOnchain(
                    planIdOnchain,
                    selectedCurrency.code,
                    selectedCurrency.amount
                );
                setProcessingStep("Confirming transaction...");
            } catch (contractErr: unknown) {
                console.error("Contract error:", contractErr);
                const errObj = contractErr as { reason?: string; message?: string; code?: string };

                if (errObj.reason) {
                    throw new Error(errObj.reason);
                } else if (errObj.code === "ACTION_REJECTED") {
                    throw new Error("Transaction was rejected in wallet.");
                } else if (errObj.message?.includes("user rejected")) {
                    throw new Error("Transaction was rejected in wallet.");
                } else {
                    throw new Error(errObj.message || "Smart contract interaction failed.");
                }
            }

            // Confirm checkout with backend
            setProcessingStep("Confirming with server...");
            const confirmResponse = await api.checkout.confirmCheckout(
                plan.id,
                userWallet,
                selectedCurrency.code,
                txResult.txHash
            );

            if (confirmResponse.success) {
                // Redirect to success page
                const params = new URLSearchParams({
                    plan: plan.name,
                    amount: selectedCurrency.amount,
                    token: selectedCurrency.code,
                    txHash: txResult.txHash
                });
                router.push(`/payment-success?${params.toString()}`);
            } else {
                throw new Error(confirmResponse.error?.message || "Payment confirmation failed");
            }
        } catch (err: unknown) {
            console.error("Checkout error:", err);
            let errorMessage = "Failed to process payment";

            if (err instanceof Error) {
                errorMessage = err.message;
            } else if (typeof err === 'object' && err !== null) {
                const errorObj = err as { message?: string; code?: number; reason?: string };
                if (errorObj.reason) {
                    errorMessage = errorObj.reason;
                } else if (errorObj.message) {
                    errorMessage = errorObj.message;
                } else if (errorObj.code === 4001) {
                    errorMessage = "Transaction was rejected. Please try again.";
                }
            }

            setError(errorMessage);
        } finally {
            setIsProcessing(false);
            setProcessingStep("");
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-green-500 mx-auto mb-4" />
                    <p className="text-zinc-400">Loading checkout...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error && !plan) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-white mb-2">Plan Not Found</h1>
                    <p className="text-zinc-400 mb-6">{error}</p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    if (!plan || !selectedCurrency) return null;

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative">
            {/* Background Blur Effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]"></div>
            </div>

            {/* Close/Back Button */}
            <Link
                href="/"
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all z-20"
            >
                <X className="w-5 h-5" />
            </Link>

            {/* Main Checkout Card */}
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 shadow-2xl">

                    {/* 1. Header - Merchant Branding */}
                    <div className="text-center mb-8">
                        <div className="relative w-16 h-16 mx-auto mb-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-2xl font-bold text-white">
                                {plan.name.charAt(0)}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-500 border-2 border-zinc-900 flex items-center justify-center">
                                <BadgeCheck className="w-3.5 h-3.5 text-white" />
                            </div>
                        </div>
                        <p className="text-zinc-400 text-sm">{plan.merchantName || "BaseStack Merchant"}</p>
                    </div>

                    {/* 2. Product Details */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-white text-center mb-3">
                            {plan.name}
                        </h1>
                        {plan.description && (
                            <p className="text-zinc-400 text-sm text-center leading-relaxed mb-6">
                                {plan.description}
                            </p>
                        )}

                        {/* Features Tags */}
                        <div className="flex flex-wrap justify-center gap-3">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                                <Check className="w-3.5 h-3.5 text-green-500" />
                                <span className="text-xs font-medium text-green-400">Auto-renewal</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                                <Check className="w-3.5 h-3.5 text-green-500" />
                                <span className="text-xs font-medium text-green-400">Cancel anytime</span>
                            </div>
                        </div>
                    </div>

                    {/* 3. Pricing Section */}
                    <div className="bg-zinc-950 border border-white/10 rounded-2xl p-6 mb-6">
                        {/* Price Display */}
                        <div className="text-center mb-4">
                            <motion.div
                                key={selectedCurrency.code}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-4xl font-bold text-white mb-1"
                            >
                                {formatPrice(selectedCurrency)}
                            </motion.div>
                            <p className="text-zinc-500 text-sm">/ {formatBillingInterval(plan.billingInterval)}</p>
                        </div>

                        {/* Currency Switcher */}
                        <div className="relative">
                            <button
                                onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                                className="w-full flex items-center justify-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors py-2"
                            >
                                <Globe className="w-4 h-4" />
                                <span>Pay with other currency?</span>
                                <ChevronDown className={`w-4 h-4 transition-transform ${isCurrencyOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Currency Dropdown */}
                            <AnimatePresence>
                                {isCurrencyOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden z-20"
                                    >
                                        {currencies.map((currency) => (
                                            <button
                                                key={currency.code}
                                                onClick={() => {
                                                    setSelectedCurrency(currency);
                                                    setIsCurrencyOpen(false);
                                                }}
                                                className={`w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors ${selectedCurrency.code === currency.code ? 'bg-white/5' : ''
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg">{currency.flag}</span>
                                                    <div className="text-left">
                                                        <div className="text-sm font-medium text-white">
                                                            {currency.label}
                                                            {currency.recommended && (
                                                                <span className="ml-2 text-xs text-green-400 font-normal">
                                                                    Recommended
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-zinc-500">
                                                            {formatPrice(currency)}
                                                        </div>
                                                    </div>
                                                </div>
                                                {selectedCurrency.code === currency.code && (
                                                    <Check className="w-4 h-4 text-green-500" />
                                                )}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                            <p className="text-red-400 text-sm text-center">{error}</p>
                        </div>
                    )}

                    {/* 4. Payment Method & Action */}
                    <div className="mb-6">
                        {/* Payment Method Indicator */}
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                <Zap className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-xs text-zinc-400">Auto-debit via Base Network</span>
                        </div>

                        {/* CTA Button */}
                        <motion.button
                            onClick={handleSubscribe}
                            disabled={isProcessing}
                            whileHover={{ scale: isProcessing ? 1 : 1.02 }}
                            whileTap={{ scale: isProcessing ? 1 : 0.98 }}
                            className="w-full bg-green-500 hover:bg-green-400 disabled:bg-green-500/50 disabled:cursor-not-allowed text-black font-bold py-4 rounded-xl transition-all shadow-[0_0_30px_rgba(34,197,94,0.2)] hover:shadow-[0_0_40px_rgba(34,197,94,0.3)] flex items-center justify-center gap-2"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {processingStep || "Processing..."}
                                </>
                            ) : (
                                <>Subscribe for {formatPrice(selectedCurrency)}</>
                            )}
                        </motion.button>

                        {/* Sub-text */}
                        <p className="text-xs text-zinc-500 text-center mt-3">
                            Powered by Smart Contract. Cancel anytime.
                        </p>
                    </div>

                    {/* 5. Trust Footer */}
                    <div className="pt-6 border-t border-white/5">
                        <div className="flex items-center justify-center gap-4">
                            <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                                <Lock className="w-3.5 h-3.5" />
                                <span>Secure Onchain Transaction</span>
                            </div>
                        </div>
                        <div className="flex justify-center mt-4">
                            <Image
                                src="/assets/logo.png"
                                alt="BaseStack"
                                width={80}
                                height={20}
                                className="opacity-30 h-5 w-auto"
                            />
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
