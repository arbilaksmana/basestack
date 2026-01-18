"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Wallet,
    Calendar,
    CreditCard,
    ExternalLink,
    X,
    AlertTriangle,
    Rocket,
    Clock,
    User,
    History,
    Loader2,
    RefreshCw,
    LayoutGrid,
    LogOut
} from "lucide-react";
import { useMySubscriptions } from "../hooks/useApi";
import { Subscription } from "../lib/api";
import { cancelSubscriptionOnchain } from "../lib/contract";

export default function SubscriberDashboardPage() {
    const router = useRouter();
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
    const [currency, setCurrency] = useState<"USD" | "IDR">("USD");
    const [isCanceling, setIsCanceling] = useState(false);
    const [cancelError, setCancelError] = useState<string | null>(null);

    // History Modal State
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [historyLogs, setHistoryLogs] = useState<any[]>([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);

    // API Hook
    const { subscriptions, loading, error, cancelSubscription, refetch } = useMySubscriptions(walletAddress);

    // Auto-connect wallet on mount
    useEffect(() => {
        const autoConnect = async () => {
            if (typeof window !== "undefined" && window.ethereum) {
                try {
                    const accounts = await window.ethereum.request({
                        method: "eth_accounts",
                    }) as string[];
                    if (accounts && accounts.length > 0) {
                        setWalletAddress(accounts[0]);
                    }
                } catch (err) {
                    console.error("Auto-connect error:", err);
                }
            }
        };
        autoConnect();
    }, []);

    const connectWallet = async () => {
        setIsConnecting(true);
        try {
            if (typeof window === "undefined" || !window.ethereum) {
                throw new Error("Please install MetaMask or Coinbase Wallet");
            }

            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            }) as string[];

            if (accounts && accounts.length > 0) {
                setWalletAddress(accounts[0]);
            }
        } catch (err) {
            console.error("Connect error:", err);
        } finally {
            setIsConnecting(false);
        }
    };

    const handleOpenCancelModal = (subscription: Subscription) => {
        setSelectedSubscription(subscription);
        setCancelError(null);
        setCancelModalOpen(true);
    };

    const handleCancelSubscription = async () => {
        if (!selectedSubscription || !walletAddress) return;

        setIsCanceling(true);
        setCancelError(null);

        try {
            // Get the onchain plan ID (stored in subscription or use planId)
            const onchainPlanId = selectedSubscription.planId;

            // Cancel on-chain first
            let txHash: string | undefined;
            try {
                const result = await cancelSubscriptionOnchain(onchainPlanId);
                txHash = result.txHash;
            } catch (contractErr: unknown) {
                console.error("Contract cancel error:", contractErr);
                const errObj = contractErr as { reason?: string; message?: string; code?: string };

                if (errObj.code === "ACTION_REJECTED" || errObj.message?.includes("user rejected")) {
                    throw new Error("Transaction was rejected in wallet.");
                } else if (errObj.reason) {
                    throw new Error(errObj.reason);
                } else {
                    // Contract might fail if not subscribed on-chain, continue with backend
                    console.warn("On-chain cancel failed, updating backend only");
                }
            }

            // Call backend API to update database
            const response = await cancelSubscription(selectedSubscription.id, txHash);

            if (response.success) {
                setCancelModalOpen(false);
                setSelectedSubscription(null);
                refetch();
            } else {
                setCancelError(response.error?.message || "Failed to cancel subscription");
            }
        } catch (err) {
            setCancelError(err instanceof Error ? err.message : "Failed to cancel subscription");
        } finally {
            setIsCanceling(false);
        }
    };

    const handleViewHistory = async (sub: Subscription) => {
        if (!walletAddress) return;
        setSelectedSubscription(sub);
        setHistoryModalOpen(true);
        setIsHistoryLoading(true);
        setHistoryLogs([]);

        try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const res = await fetch(`${API_BASE_URL}/api/me/subscriptions/${sub.id}/logs?walletAddress=${walletAddress}`);
            const data = await res.json();
            if (data.success) {
                setHistoryLogs(data.data);
            }
        } catch (err) {
            console.error("Failed to fetch history", err);
        } finally {
            setIsHistoryLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    };

    const formatWallet = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const activeCount = subscriptions.filter(s => s.status === "active").length;

    // Calculate monthly spend
    const monthlySpend = subscriptions
        .filter(s => s.status === "active")
        .reduce((total, sub) => {
            const amount = parseFloat(sub.amount) || 0;
            const isSubIDR = sub.payToken === 'IDRX';

            if (currency === 'IDR') {
                return total + (isSubIDR ? amount : amount * 16000);
            } else {
                return total + (isSubIDR ? amount / 16000 : amount);
            }
        }, 0);

    // Get next billing date
    const getNextBilling = () => {
        const activeSubs = subscriptions.filter(s => s.status === "active" && s.nextPayment);
        if (activeSubs.length === 0) return null;

        const dates = activeSubs.map(s => new Date(s.nextPayment!));
        const earliest = new Date(Math.min(...dates.map(d => d.getTime())));
        return earliest.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    const handleDisconnect = () => {
        setWalletAddress(null);
        router.push('/');
    };

    // Helper for Card Price
    const getDisplayPrice = (sub: Subscription) => {
        const amount = parseFloat(sub.amount) || 0;
        const isIDR = sub.payToken === 'IDRX';

        if (currency === 'IDR') {
            const val = isIDR ? amount : amount * 16000;
            return `Rp ${val.toLocaleString('id-ID')} / month`;
        } else {
            const val = isIDR ? amount / 16000 : amount;
            return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / month`;
        }
    };

    // Sorted Subscriptions
    const sortedSubscriptions = [...subscriptions].sort((a, b) => {
        const statusPriority: Record<string, number> = { active: 0, past_due: 1, cancelled: 2, canceled: 2 };
        const priorityA = statusPriority[a.status] ?? 3;
        const priorityB = statusPriority[b.status] ?? 3;

        if (priorityA !== priorityB) {
            return priorityA - priorityB;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Not connected state
    if (!walletAddress) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-md"
                >
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center">
                        <Wallet className="w-10 h-10 text-zinc-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h1>
                    <p className="text-zinc-400 mb-6">
                        Connect your wallet to view and manage your subscriptions.
                    </p>
                    <button
                        onClick={connectWallet}
                        disabled={isConnecting}
                        className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 disabled:bg-green-500/50 text-black font-bold px-6 py-3 rounded-full transition-all hover:scale-105"
                    >
                        {isConnecting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Connecting...
                            </>
                        ) : (
                            <>
                                <Wallet className="w-5 h-5" />
                                Connect Wallet
                            </>
                        )}
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5">
                <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/assets/logo.png"
                            alt="BaseStack Logo"
                            width={140}
                            height={10}
                            className="h-14 w-auto"
                        />
                    </Link>

                    {/* Switch to Merchant Dashboard */}
                    <div className="flex items-center gap-4">
                        {/* Currency Toggle */}
                        <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-1 border border-white/5">
                            <button
                                onClick={() => setCurrency("USD")}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${currency === "USD" ? "bg-green-500 text-black" : "text-zinc-400 hover:text-white"}`}
                            >
                                USD
                            </button>
                            <button
                                onClick={() => setCurrency("IDR")}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${currency === "IDR" ? "bg-green-500 text-black" : "text-zinc-400 hover:text-white"}`}
                            >
                                IDR
                            </button>
                        </div>

                        <Link
                            href="/dashboard"
                            className="hidden md:flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
                        >
                            <LayoutGrid className="w-4 h-4" />
                            <span>Merchant Dashboard</span>
                        </Link>

                        {/* Wallet Status */}
                        <div className="flex items-center gap-2 bg-zinc-900 border border-white/10 rounded-full px-4 py-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-sm text-zinc-300 font-mono">{formatWallet(walletAddress)}</span>
                            <Wallet className="w-4 h-4 text-zinc-500" />
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={handleDisconnect}
                            className="p-2 rounded-full bg-zinc-900 border border-white/10 text-zinc-400 hover:text-red-400 hover:border-red-500/30 transition-colors ml-2"
                            title="Disconnect"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-4 md:px-6 py-8">
                {/* Page Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">My Subscriptions</h1>
                        <p className="text-zinc-400">Manage your active subscriptions and billing.</p>
                    </div>
                    <button
                        onClick={() => refetch()}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-zinc-300 transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-zinc-900 border border-white/5 rounded-xl p-4">
                        <div className="text-zinc-400 text-sm mb-1">Active Plans</div>
                        <div className="text-2xl font-bold text-white">{activeCount}</div>
                    </div>
                    <div className="bg-zinc-900 border border-white/5 rounded-xl p-4">
                        <div className="text-zinc-400 text-sm mb-1">Monthly Spend</div>
                        <div className="text-2xl font-bold text-white">
                            {currency === 'IDR' ? 'Rp ' : '$'}
                            {monthlySpend.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}
                        </div>
                    </div>
                    <div className="hidden md:block bg-zinc-900 border border-white/5 rounded-xl p-4">
                        <div className="text-zinc-400 text-sm mb-1">Next Billing</div>
                        <div className="text-2xl font-bold text-green-400">{getNextBilling() || "—"}</div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="text-center py-16">
                        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <p className="text-zinc-400">{error}</p>
                        <button
                            onClick={() => refetch()}
                            className="mt-4 text-green-400 hover:text-green-300"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {/* Subscription List */}
                {!loading && !error && sortedSubscriptions.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {sortedSubscriptions.map((sub, index) => (
                            <motion.div
                                key={sub.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`bg-zinc-900 border rounded-2xl p-6 ${sub.status === "active"
                                    ? "border-white/5"
                                    : sub.status === "past_due"
                                        ? "border-yellow-500/20"
                                        : "border-red-500/20 opacity-60"
                                    }`}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-1">{sub.planName || "Subscription Plan"}</h3>
                                        <div className="flex items-center gap-2 text-sm text-zinc-500">
                                            <User className="w-3.5 h-3.5" />
                                            Plan #{sub.planId}
                                        </div>
                                    </div>
                                    {sub.status === "active" ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                            Active
                                        </span>
                                    ) : sub.status === "past_due" ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-bold">
                                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                                            Past Due
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-700/50 text-zinc-400 text-xs font-bold">
                                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>
                                            Cancelled
                                        </span>
                                    )}
                                </div>

                                {/* Body */}
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                                            <CreditCard className="w-4 h-4" />
                                            Cost
                                        </div>
                                        <span className="text-white font-medium">
                                            {getDisplayPrice(sub)}
                                        </span>
                                    </div>

                                    {sub.status === "active" && sub.nextPayment && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-sm text-zinc-400">
                                                <Calendar className="w-4 h-4" />
                                                Next Auto-debit
                                            </div>
                                            <span className="text-green-400 font-medium text-sm">
                                                {formatDate(sub.nextPayment)}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                                            <Clock className="w-4 h-4" />
                                            Subscribed
                                        </div>
                                        <span className="text-zinc-300 text-sm">
                                            {formatDate(sub.createdAt)}
                                        </span>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <button
                                        onClick={() => handleViewHistory(sub)}
                                        className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                                    >
                                        <History className="w-3.5 h-3.5" />
                                        View History
                                    </button>

                                    {sub.status === "active" ? (
                                        <button
                                            onClick={() => handleOpenCancelModal(sub)}
                                            className="text-sm text-red-400 hover:text-red-300 font-medium transition-colors"
                                        >
                                            Cancel Subscription
                                        </button>
                                    ) : sub.status === "cancelled" ? (
                                        <span className="text-sm text-zinc-500">Cancelled</span>
                                    ) : (
                                        <Link
                                            href="/"
                                            className="text-sm text-green-400 hover:text-green-300 font-medium transition-colors"
                                        >
                                            Renew
                                        </Link>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && subscriptions.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-16"
                    >
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center">
                            <Rocket className="w-10 h-10 text-zinc-600" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No active subscriptions</h3>
                        <p className="text-zinc-400 mb-6 max-w-sm mx-auto">
                            You haven&apos;t subscribed to any services yet. Explore merchants and find something you love!
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-bold px-6 py-3 rounded-full transition-all hover:scale-105"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Explore Merchants
                        </Link>
                    </motion.div>
                )}
            </main>

            {/* Cancel Confirmation Modal */}
            <AnimatePresence>
                {cancelModalOpen && selectedSubscription && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isCanceling && setCancelModalOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        >
                            <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-sm p-6 relative">
                                {/* Close Button */}
                                {!isCanceling && (
                                    <button
                                        onClick={() => setCancelModalOpen(false)}
                                        className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}

                                {/* Warning Icon */}
                                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                                    <AlertTriangle className="w-7 h-7 text-red-500" />
                                </div>

                                <h2 className="text-lg font-bold text-white text-center mb-2">
                                    Cancel Subscription?
                                </h2>

                                <p className="text-zinc-400 text-sm text-center mb-6">
                                    Are you sure you want to cancel <span className="text-white font-medium">{selectedSubscription.planName || "this subscription"}</span>?
                                </p>

                                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 mb-6">
                                    <p className="text-xs text-red-400 leading-relaxed">
                                        ⚠️ You will lose access to the premium content immediately. This action will revoke the allowance on the blockchain.
                                    </p>
                                </div>

                                {/* Error Message */}
                                {cancelError && (
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
                                        <p className="text-red-400 text-sm text-center">{cancelError}</p>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <button
                                        onClick={handleCancelSubscription}
                                        disabled={isCanceling}
                                        className="w-full bg-red-500 hover:bg-red-400 disabled:bg-red-500/50 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                                    >
                                        {isCanceling ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Canceling...
                                            </>
                                        ) : (
                                            "Yes, Cancel Plan"
                                        )}
                                    </button>

                                    {!isCanceling && (
                                        <button
                                            onClick={() => setCancelModalOpen(false)}
                                            className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 font-medium py-3 rounded-xl transition-all"
                                        >
                                            Keep Subscription
                                        </button>
                                    )}
                                </div>

                                {isCanceling && (
                                    <p className="text-xs text-zinc-500 text-center mt-4">
                                        Please confirm the transaction in your wallet...
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* History Modal */}
            <AnimatePresence>
                {historyModalOpen && selectedSubscription && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setHistoryModalOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        >
                            <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-sm p-6 relative max-h-[80vh] overflow-hidden flex flex-col">
                                <button
                                    onClick={() => setHistoryModalOpen(false)}
                                    className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <h2 className="text-lg font-bold text-white mb-4">Payment History</h2>
                                <p className="text-sm text-zinc-400 mb-4">
                                    Recent transactions for <span className="text-white">{selectedSubscription.planName}</span>
                                </p>

                                <div className="flex-1 overflow-y-auto space-y-3 min-h-[150px]">
                                    {isHistoryLoading ? (
                                        <div className="flex items-center justify-center h-20">
                                            <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                                        </div>
                                    ) : historyLogs.length === 0 ? (
                                        <div className="text-center py-6 text-zinc-500 text-sm">
                                            No payment history found.
                                        </div>
                                    ) : (
                                        historyLogs.map((log: any) => (
                                            <div key={log.id} className="bg-white/5 border border-white/5 rounded-lg p-3">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-xs text-zinc-400">
                                                        {new Date(log.createdAt).toLocaleString()}
                                                    </span>
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${log.status === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                                        }`}>
                                                        {log.status}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm font-bold text-white">
                                                        {log.amount} {selectedSubscription.payToken}
                                                    </span>
                                                    <span className="text-xs text-zinc-500">
                                                        ID: #{log.id}
                                                    </span>
                                                </div>
                                                {log.txHash && (
                                                    <a
                                                        href={`https://sepolia.basescan.org/tx/${log.txHash}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1 text-xs text-blue-400 hover:underline truncate"
                                                    >
                                                        {log.txHash.slice(0, 10)}...{log.txHash.slice(-8)}
                                                        <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
