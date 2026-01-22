"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAccount, useBalance } from 'wagmi';
import {
    Copy,
    Code,
    Pencil,
    Plus,
    Check,
    X,
    ChevronDown,
    Wallet as WalletIcon,
    TrendingUp,
    Users,
    User,
    PieChart,
    ExternalLink,
    MoreVertical,
    Loader2,
    LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Wallet,
    ConnectWallet,
    WalletDropdown,
    WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import {
    Address,
    Avatar,
    Name,
    Identity,
    EthBalance,
} from '@coinbase/onchainkit/identity';
import { useDashboard, usePlans, useBillingLogs, useSubscribers, useMerchantProfile } from "../hooks/useApi";
import { useWallet } from "../hooks/useWallet";
import { api, Plan, DashboardMetrics, BillingLog, Subscriber } from "../lib/api";
import { createPlanOnchain } from "../lib/contract";

export default function DashboardPage() {
    // Wagmi Hooks for Wallet Status
    const { address } = useAccount();
    const { data: balanceData } = useBalance({
        address: address,
    });

    // Helper to format balance to 3 decimal places
    const formattedBalance = balanceData
        ? `${parseFloat(balanceData.formatted).toFixed(3)} ${balanceData.symbol}`
        : '0 ETH';

    const router = useRouter();
    const [currency, setCurrency] = useState<"IDR" | "USD">("USD");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [copiedLink, setCopiedLink] = useState<string | null>(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    // Wallet Hook for auth
    const { isAuthenticated, formattedAddress, merchant, disconnect, status: walletStatus, networkName } = useWallet();

    // API Hooks
    const { metrics, loading: metricsLoading, refetch: refetchMetrics } = useDashboard();
    const { plans, loading: plansLoading, createPlan, updatePlan, refetch: refetchPlans } = usePlans();
    const { logs: billingLogs, loading: logsLoading } = useBillingLogs();
    const { subscribers, loading: subscribersLoading } = useSubscribers();
    const { profile: merchantProfile } = useMerchantProfile();

    // State for edit plan and embed modal
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [embedPlan, setEmbedPlan] = useState<Plan | null>(null);
    const [activeTab, setActiveTab] = useState<"transactions" | "subscribers">("transactions");

    // Auth protection - redirect to signup if not authenticated
    useEffect(() => {
        // Wait for wallet status to be checked
        if (walletStatus === 'disconnected') {
            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
            if (!token) {
                router.push('/signup');
            } else {
                setIsCheckingAuth(false);
            }
        } else {
            setIsCheckingAuth(false);
        }
    }, [walletStatus, router]);

    const handleDisconnect = () => {
        disconnect();
        router.push('/');
    };

    const handleCopyLink = (link: string) => {
        navigator.clipboard.writeText(`https://${link}`);
        setCopiedLink(link);
        setTimeout(() => setCopiedLink(null), 2000);
    };

    // Format MRR for display
    const formatMRR = (mrr: number) => {
        if (currency === "USD") {
            // Assuming MRR is in smallest unit, convert to USD
            return `$${(mrr / 1000000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        } else {
            // Convert to IDR (assuming 1 USD = 16000 IDR)
            const idr = (mrr / 1000000) * 16000;
            return `Rp ${idr.toLocaleString()}`;
        }
    };

    // Generate checkout link from plan slug
    const getPlanLink = (plan: Plan) => {
        return `basestack.xyz/checkout/${plan.slug}`;
    };

    // Format billing interval
    const formatBillingInterval = (seconds: number) => {
        const days = seconds / 86400;
        if (days >= 365) return "Yearly";
        if (days >= 30) return "Monthly";
        if (days >= 7) return "Weekly";
        return `${days} days`;
    };

    // Show loading while checking auth
    if (isCheckingAuth) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            {/* Header / Top Bar */}
            <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5">
                <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/assets/logo.png"
                            alt="BaseStack Logo"
                            width={140}
                            height={10}
                            className="h-14 w-auto"
                        />
                    </Link>

                    {/* Right Side */}
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

                        {/* Network Status */}
                        <div className="hidden md:flex items-center gap-2 bg-zinc-900 border border-white/10 rounded-full px-4 h-[42px]">
                            <div className={`w-2 h-2 rounded-full ${networkName?.includes('Base') ? 'bg-orange-500' : 'bg-red-500'}`}></div>
                            <span className="text-sm text-zinc-300 font-medium">
                                {networkName || 'Network'}
                            </span>
                        </div>

                        {/* Wallet Status Pill */}
                        <div className="flex items-center gap-3 bg-zinc-900 border border-white/10 rounded-full px-4 h-[42px]">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-sm font-medium text-white">
                                {formattedBalance}
                            </span>
                            <span className="text-sm font-mono text-zinc-400">
                                {address?.slice(0, 6)}...{address?.slice(-4)}
                            </span>
                            <WalletIcon className="w-4 h-4 text-zinc-500" />
                        </div>

                        {/* Switch to Subscriber View */}
                        <Link
                            href="/my-subscriptions"
                            className="p-2 rounded-full bg-zinc-900 border border-white/10 text-zinc-400 hover:text-green-400 hover:border-green-500/30 transition-colors"
                            title="My Subscriptions"
                        >
                            <User className="w-4 h-4" />
                        </Link>

                        {/* Disconnect Button */}
                        <button
                            onClick={handleDisconnect}
                            className="p-2 rounded-full bg-zinc-900 border border-white/10 text-zinc-400 hover:text-red-400 hover:border-red-500/30 transition-colors"
                            title="Disconnect"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                {/* Hero Section: Revenue Stats */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    {/* Card 1: Total MRR */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-zinc-900 border border-white/5 rounded-2xl p-6"
                    >
                        <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
                            <TrendingUp className="w-4 h-4" />
                            Monthly Recurring Revenue
                        </div>
                        <div className="text-4xl font-bold text-white mb-1">
                            {metricsLoading ? (
                                <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
                            ) : (
                                formatMRR(metrics?.mrr || 0)
                            )}
                        </div>
                        <div className="text-sm text-zinc-500">
                            {metrics?.pastDueCount ? `${metrics.pastDueCount} past due` : "All payments on time"}
                        </div>
                    </motion.div>

                    {/* Card 2: Active Subscribers */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-zinc-900 border border-white/5 rounded-2xl p-6"
                    >
                        <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
                            <Users className="w-4 h-4" />
                            Active Subscribers
                        </div>
                        <div className="text-4xl font-bold text-white mb-1">
                            {metricsLoading ? (
                                <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
                            ) : (
                                metrics?.activeCount || 0
                            )}
                        </div>
                        <div className="text-sm text-zinc-500">
                            {metrics?.totalSubscribers || 0} total subscribers
                        </div>
                    </motion.div>

                    {/* Card 3: Currency Split */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-zinc-900 border border-white/5 rounded-2xl p-6"
                    >
                        <div className="flex items-center gap-2 text-zinc-400 text-sm mb-4">
                            <PieChart className="w-4 h-4" />
                            Revenue Split
                        </div>
                        {metrics?.revenueSplit && metrics.revenueSplit.length > 0 ? (
                            <>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 h-4 bg-zinc-800 rounded-full overflow-hidden flex">
                                        {metrics.revenueSplit.map((item) => {
                                            const color = item.token === 'IDRX' ? 'bg-green-500' :
                                                item.token === 'USDC' ? 'bg-blue-500' :
                                                    item.token === 'USDT' ? 'bg-teal-500' : 'bg-purple-500';
                                            return (
                                                <div
                                                    key={item.token}
                                                    style={{ width: `${item.percentage}%` }}
                                                    className={`h-full ${color}`}
                                                    title={`${item.percentage}% ${item.token}`}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="flex flex-wrap justify-between mt-3 text-sm gap-y-2">
                                    {metrics.revenueSplit.map((item) => {
                                        const color = item.token === 'IDRX' ? 'bg-green-500' :
                                            item.token === 'USDC' ? 'bg-blue-500' :
                                                item.token === 'USDT' ? 'bg-teal-500' : 'bg-purple-500';
                                        return (
                                            <div key={item.token} className="flex items-center gap-2 mr-3">
                                                <div className={`w-2 h-2 rounded-full ${color}`}></div>
                                                <span className="text-zinc-400">{item.percentage}% {item.token}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-20 text-zinc-500 text-sm">
                                No revenue data available
                            </div>
                        )}
                    </motion.div>
                </section>

                {/* Main Section: Subscription Plans */}
                <section className="mb-10">
                    <h2 className="text-xl font-bold text-white mb-6">Your Subscription Plans</h2>

                    {plansLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Plan Cards from API */}
                            {plans.map((plan, index) => (
                                <motion.div
                                    key={plan.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group bg-zinc-900 border border-white/5 rounded-2xl p-6 hover:border-green-500/30 transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                                        <button className="text-zinc-500 hover:text-white transition-colors">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Pricing */}
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-lg">🇮🇩</span>
                                            <span className="text-zinc-400">IDRX:</span>
                                            <span className="text-white font-bold">Rp {parseInt(plan.priceIdrx).toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-lg">🌏</span>
                                            <span className="text-zinc-400">USDC:</span>
                                            <span className="text-white font-bold">{plan.priceUsdc} USDC</span>
                                        </div>
                                    </div>

                                    {/* Meta */}
                                    <div className="flex items-center justify-between text-sm text-zinc-500 mb-2">
                                        <span>{formatBillingInterval(plan.billingInterval)}</span>
                                        <span className={plan.status === 'active' ? "text-green-400" : "text-zinc-500"}>
                                            {plan.status === 'active' ? "Active" : "Inactive"}
                                        </span>
                                    </div>
                                    {plan.description && (
                                        <p className="text-xs text-zinc-500 mb-4 line-clamp-2">{plan.description}</p>
                                    )}

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                                        <button
                                            onClick={() => handleCopyLink(getPlanLink(plan))}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-zinc-300 hover:text-white transition-colors"
                                        >
                                            {copiedLink === getPlanLink(plan) ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                            {copiedLink === getPlanLink(plan) ? "Copied!" : "Copy Link"}
                                        </button>
                                        <button
                                            onClick={() => setEmbedPlan(plan)}
                                            className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                                            title="Get Embed Code"
                                        >
                                            <Code className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setEditingPlan(plan)}
                                            className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Create New Plan Card */}
                            <motion.button
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: plans.length * 0.1 }}
                                onClick={() => setIsCreateModalOpen(true)}
                                className="group bg-zinc-900/50 border-2 border-dashed border-white/10 rounded-2xl p-6 hover:border-green-500/50 hover:bg-zinc-900 transition-all flex flex-col items-center justify-center min-h-[280px]"
                            >
                                <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mb-4 group-hover:bg-green-500/20 group-hover:scale-110 transition-all">
                                    <Plus className="w-6 h-6 text-green-500" />
                                </div>
                                <span className="text-lg font-bold text-white">Create New Plan</span>
                                <span className="text-sm text-zinc-500 mt-1">Add a subscription product</span>
                            </motion.button>
                        </div>
                    )}
                </section>

                {/* Bottom Section: Tabs for Transactions & Subscribers */}
                <section>
                    {/* Tab Navigation */}
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => setActiveTab("transactions")}
                            className={`text-xl font-bold transition-colors ${activeTab === "transactions" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                                }`}
                        >
                            Recent Transactions
                        </button>
                        <button
                            onClick={() => setActiveTab("subscribers")}
                            className={`text-xl font-bold transition-colors ${activeTab === "subscribers" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                                }`}
                        >
                            Subscriptions ({subscribers.length})
                        </button>
                    </div>

                    {/* Transactions Tab */}
                    {activeTab === "transactions" && (
                        <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden">
                            {logsLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
                                </div>
                            ) : billingLogs.length === 0 ? (
                                <div className="text-center py-12 text-zinc-500">
                                    No transactions yet
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-white/5">
                                                <th className="text-left py-4 px-6 text-sm font-medium text-zinc-400">Subscriber</th>
                                                <th className="text-left py-4 px-6 text-sm font-medium text-zinc-400">Plan</th>
                                                <th className="text-left py-4 px-6 text-sm font-medium text-zinc-400">Amount Paid</th>
                                                <th className="text-left py-4 px-6 text-sm font-medium text-zinc-400">Status</th>
                                                <th className="text-left py-4 px-6 text-sm font-medium text-zinc-400">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {billingLogs.map((log: BillingLog) => (
                                                <tr key={log.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-4 px-6">
                                                        <span className="text-sm font-mono text-white">
                                                            {log.subscriberWallet?.slice(0, 6)}...{log.subscriberWallet?.slice(-4)}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className="text-sm text-zinc-300">{log.planName}</span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className="text-sm font-bold text-white">
                                                            {log.amount} {log.payToken}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        {log.status === "success" ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                                Paid
                                                            </span>
                                                        ) : log.status === "failed" ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                                                Failed
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-bold">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                                                                Pending
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className="text-sm text-zinc-500">
                                                            {new Date(log.createdAt).toLocaleString()}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Subscribers Tab */}
                    {activeTab === "subscribers" && (
                        <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden">
                            {subscribersLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
                                </div>
                            ) : subscribers.length === 0 ? (
                                <div className="text-center py-12 text-zinc-500">
                                    No subscribers yet
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-white/5">
                                                <th className="text-left py-4 px-6 text-sm font-medium text-zinc-400">Wallet Address</th>
                                                <th className="text-left py-4 px-6 text-sm font-medium text-zinc-400">Plan</th>
                                                <th className="text-left py-4 px-6 text-sm font-medium text-zinc-400">Status</th>
                                                <th className="text-left py-4 px-6 text-sm font-medium text-zinc-400">Next Payment</th>
                                                <th className="text-left py-4 px-6 text-sm font-medium text-zinc-400">Joined</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {subscribers.map((sub: Subscriber, index: number) => (
                                                <tr key={index} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-4 px-6">
                                                        <span className="text-sm font-mono text-white">
                                                            {sub.walletAddress?.slice(0, 6)}...{sub.walletAddress?.slice(-4)}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className="text-sm text-zinc-300">{sub.planName || "N/A"}</span>
                                                    </td>
                                                    <td className="py-4 px-6">
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
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-500/10 text-zinc-400 text-xs font-bold">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>
                                                                {sub.status || "Unknown"}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className="text-sm text-zinc-500">
                                                            {sub.nextPayment ? new Date(sub.nextPayment).toLocaleDateString() : "N/A"}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className="text-sm text-zinc-500">
                                                            {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : "N/A"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </main>

            {/* Create Plan Modal */}
            <CreatePlanModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => refetchPlans()}
            />

            {/* Edit Plan Modal */}
            {editingPlan && (
                <EditPlanModal
                    plan={editingPlan}
                    onClose={() => setEditingPlan(null)}
                    onSuccess={() => {
                        refetchPlans();
                        setEditingPlan(null);
                    }}
                />
            )}

            {/* Embed Code Modal */}
            {embedPlan && (
                <EmbedCodeModal
                    plan={embedPlan}
                    onClose={() => setEmbedPlan(null)}
                />
            )}
        </div>
    );
}

// Create Plan Modal Component
function CreatePlanModal({
    isOpen,
    onClose,
    onSuccess
}: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}) {
    const router = useRouter();
    const [planName, setPlanName] = useState("");
    const [description, setDescription] = useState("");
    const [billingInterval, setBillingInterval] = useState("monthly");
    const [priceIDRX, setPriceIDRX] = useState("");
    const [priceUSDC, setPriceUSDC] = useState("");
    const [priceUSDT, setPriceUSDT] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { createPlan } = usePlans();

    const handleIDRXChange = (value: string) => {
        setPriceIDRX(value);
        // Auto-calculate USD equivalent (mock rate: 1 USD = 16,000 IDR)
        const numValue = parseFloat(value.replace(/,/g, ""));
        if (!isNaN(numValue)) {
            const usdValue = (numValue / 16000).toFixed(2);
            setPriceUSDC(usdValue);
            setPriceUSDT(usdValue);
        }
    };

    const handleUSDCChange = (value: string) => {
        setPriceUSDC(value);
        setPriceUSDT(value); // Keep USDT same as USDC
    };

    const validateForm = () => {
        if (!planName.trim()) {
            setError("Plan name is required");
            return false;
        }
        if (!priceIDRX || !priceUSDC) {
            setError("Please set pricing for your plan");
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const billingIntervalSeconds = billingInterval === "monthly" ? 2592000 : 31536000;
            let onchainPlanId: number | undefined;

            try {
                // Ensure wallet is connected
                if (typeof window !== "undefined" && !window.ethereum) {
                    throw new Error("Please install a wallet to create on-chain plans");
                }

                // Create plan on-chain
                const result = await createPlanOnchain(
                    priceIDRX,
                    priceUSDC,
                    priceUSDT || priceUSDC,
                    billingIntervalSeconds
                );
                onchainPlanId = result.planId;
                console.log("Plan created on-chain with ID:", onchainPlanId);
            } catch (err: unknown) {
                console.error("On-chain creation failed:", err);
                const msg = err instanceof Error ? err.message : "On-chain creation failed";
                if (msg.includes("rejected")) {
                    throw new Error("Transaction rejected in wallet");
                }
                throw new Error(msg);
            }

            const planData = {
                name: planName,
                description,
                billingInterval: billingIntervalSeconds,
                priceIdrx: priceIDRX,
                priceUsdc: priceUSDC,
                priceUsdt: priceUSDT || priceUSDC,
                onchainPlanId
            };

            const response = await api.plans.createPlan(planData);

            if (response.success) {
                // Reset form
                setPlanName("");
                setDescription("");
                setPriceIDRX("");
                setPriceUSDC("");
                setPriceUSDT("");
                setBillingInterval("monthly");

                onSuccess?.();
                onClose();

                // Redirect to success page
                const params = new URLSearchParams({
                    name: planName,
                    slug: response.data?.slug || "",
                    priceIdrx: priceIDRX,
                    priceUsdc: priceUSDC
                });
                router.push(`/plan-created?${params.toString()}`);
            } else {
                setError(response.error?.message || "Failed to create plan");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create plan");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <h2 className="text-xl font-bold text-white mb-1">Create New Plan</h2>
                            <p className="text-zinc-400 text-sm mb-5">Define your subscription product and pricing.</p>

                            {/* Form */}
                            <div className="space-y-4">
                                {/* Plan Name */}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">Plan Name</label>
                                    <input
                                        type="text"
                                        value={planName}
                                        onChange={(e) => setPlanName(e.target.value)}
                                        placeholder="e.g., VIP Trading Signal"
                                        className="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-green-500/50 transition-colors"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Brief description of your plan..."
                                        rows={2}
                                        className="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-green-500/50 transition-colors resize-none"
                                    />
                                </div>

                                {/* Billing Interval */}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">Billing Interval</label>
                                    <div className="relative">
                                        <select
                                            value={billingInterval}
                                            onChange={(e) => setBillingInterval(e.target.value)}
                                            className="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-green-500/50 transition-colors appearance-none cursor-pointer"
                                        >
                                            <option value="monthly">Monthly</option>
                                            <option value="yearly">Yearly</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Smart Pricing Engine */}
                                <div className="bg-zinc-950 border border-white/10 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-sm font-bold text-white">💡 Smart Pricing</span>
                                    </div>
                                    <p className="text-xs text-zinc-500 mb-3">Set your price. We handle the conversion.</p>

                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Local Price */}
                                        <div>
                                            <label className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1.5">
                                                <span>🇮🇩</span> IDRX
                                            </label>
                                            <input
                                                type="text"
                                                value={priceIDRX}
                                                onChange={(e) => handleIDRXChange(e.target.value)}
                                                placeholder="150000"
                                                className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-green-500/50 transition-colors"
                                            />
                                            {priceIDRX && (
                                                <p className="text-xs text-zinc-500 mt-1">≈ ${priceUSDC} USD</p>
                                            )}
                                        </div>

                                        {/* Global Price */}
                                        <div>
                                            <label className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1.5">
                                                <span>🌏</span> USDC
                                            </label>
                                            <input
                                                type="text"
                                                value={priceUSDC}
                                                onChange={(e) => handleUSDCChange(e.target.value)}
                                                placeholder="10"
                                                className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-green-500/50 transition-colors"
                                            />
                                            <p className="text-xs text-zinc-500 mt-1">Editable</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                        <p className="text-red-400 text-sm">{error}</p>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="w-full bg-green-500 hover:bg-green-400 disabled:bg-green-500/50 disabled:cursor-not-allowed text-black font-bold py-3 rounded-lg transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] flex items-center justify-center gap-2 text-sm"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Creating Plan...
                                        </>
                                    ) : (
                                        <>
                                            Publish Plan on Base
                                            <ExternalLink className="w-4 h-4" />
                                        </>
                                    )}
                                </button>

                                <p className="text-xs text-zinc-500 text-center">
                                    This will create a subscription plan.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// Edit Plan Modal Component
function EditPlanModal({
    plan,
    onClose,
    onSuccess
}: {
    plan: Plan;
    onClose: () => void;
    onSuccess?: () => void;
}) {
    const [planName, setPlanName] = useState(plan.name);
    const [description, setDescription] = useState(plan.description || "");
    const [isActive, setIsActive] = useState(plan.status === 'active' || plan.isActive);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { updatePlan } = usePlans();

    const handleSubmit = async () => {
        setError(null);

        if (!planName.trim()) {
            setError("Plan name is required");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await updatePlan(plan.id, {
                name: planName,
                description: description || undefined,
                status: isActive ? 'active' : 'inactive',
            } as Partial<Plan>);

            if (response.success) {
                onSuccess?.();
            } else {
                setError(response.error?.message || "Failed to update plan");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update plan");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            <>
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                >
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md p-6 relative">
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-xl font-bold text-white mb-1">Edit Plan</h2>
                        <p className="text-zinc-400 text-sm mb-5">Update your subscription plan details.</p>

                        {/* Form */}
                        <div className="space-y-4">
                            {/* Plan Name */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Plan Name</label>
                                <input
                                    type="text"
                                    value={planName}
                                    onChange={(e) => setPlanName(e.target.value)}
                                    placeholder="e.g., VIP Trading Signal"
                                    className="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-green-500/50 transition-colors"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Brief description of your plan..."
                                    rows={2}
                                    className="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-green-500/50 transition-colors resize-none"
                                />
                            </div>

                            {/* Status Toggle */}
                            <div className="flex items-center justify-between p-3 bg-zinc-950 border border-white/10 rounded-lg">
                                <div>
                                    <span className="text-sm font-medium text-white">Plan Status</span>
                                    <p className="text-xs text-zinc-500">Active plans are visible to subscribers</p>
                                </div>
                                <button
                                    onClick={() => setIsActive(!isActive)}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${isActive ? "bg-green-500" : "bg-zinc-700"
                                        }`}
                                >
                                    <span
                                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${isActive ? "left-7" : "left-1"
                                            }`}
                                    />
                                </button>
                            </div>

                            {/* Pricing Info (Read-only) */}
                            <div className="bg-zinc-950 border border-white/10 rounded-lg p-4">
                                <span className="text-sm font-bold text-zinc-400 mb-2 block">Pricing (Read-only)</span>
                                <div className="grid grid-cols-3 gap-2 text-sm">
                                    <div>
                                        <span className="text-zinc-500">IDRX</span>
                                        <p className="text-white font-medium">{plan.priceIdrx}</p>
                                    </div>
                                    <div>
                                        <span className="text-zinc-500">USDC</span>
                                        <p className="text-white font-medium">{plan.priceUsdc}</p>
                                    </div>
                                    <div>
                                        <span className="text-zinc-500">USDT</span>
                                        <p className="text-white font-medium">{plan.priceUsdt}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                    <p className="text-red-400 text-sm">{error}</p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="w-full bg-green-500 hover:bg-green-400 disabled:bg-green-500/50 disabled:cursor-not-allowed text-black font-bold py-3 rounded-lg transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] flex items-center justify-center gap-2 text-sm"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </>
        </AnimatePresence>
    );
}

// Embed Code Modal Component
function EmbedCodeModal({
    plan,
    onClose
}: {
    plan: Plan;
    onClose: () => void;
}) {
    const [copiedLink, setCopiedLink] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);

    const paymentLink = `https://basestack.xyz/checkout/${plan.slug}`;

    const embedCode = `<a href="${paymentLink}" 
   class="basestack-button" 
   target="_blank"
   style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;background:#22c55e;color:#000;font-weight:bold;border-radius:999px;text-decoration:none;">
   Subscribe to ${plan.name}
</a>`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(paymentLink);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(embedCode);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
    };

    return (
        <AnimatePresence>
            <>
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                >
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-lg p-6 relative">
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                <Code className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Embed & Share</h2>
                                <p className="text-zinc-400 text-sm">{plan.name}</p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            {/* Payment Link */}
                            <div className="bg-zinc-950 border border-white/10 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <ExternalLink className="w-4 h-4 text-green-500" />
                                    <span className="text-sm font-bold text-white">Direct Payment Link</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 overflow-hidden">
                                        <span className="text-sm text-zinc-300 font-mono truncate block">
                                            {paymentLink}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleCopyLink}
                                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${copiedLink
                                            ? "bg-green-500/20 text-green-400"
                                            : "bg-white/5 hover:bg-white/10 text-white"
                                            }`}
                                    >
                                        {copiedLink ? (
                                            <>
                                                <Check className="w-4 h-4" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4" />
                                                Copy
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Embed Code */}
                            <div className="bg-zinc-950 border border-white/10 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Code className="w-4 h-4 text-blue-500" />
                                    <span className="text-sm font-bold text-white">Embed on Website</span>
                                </div>

                                <div className="bg-zinc-900 border border-white/10 rounded-lg p-3 mb-3 overflow-x-auto">
                                    <pre className="text-xs text-zinc-400 font-mono whitespace-pre-wrap break-all">
                                        {`<a href="${paymentLink}" 
   class="basestack-button" 
   target="_blank">
   Subscribe to ${plan.name}
</a>`}
                                    </pre>
                                </div>

                                <button
                                    onClick={handleCopyCode}
                                    className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${copiedCode
                                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                        : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                                        }`}
                                >
                                    {copiedCode ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Code Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            Copy Embed Code
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Preview Button */}
                            <div className="bg-zinc-950/50 border border-white/5 rounded-xl p-4 text-center">
                                <span className="text-xs text-zinc-500 block mb-3">Button Preview</span>
                                <a
                                    href={`/checkout/${plan.slug}`}
                                    target="_blank"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-400 text-black font-bold rounded-full transition-all hover:scale-105"
                                >
                                    Subscribe to {plan.name}
                                </a>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </>
        </AnimatePresence>
    );
}
