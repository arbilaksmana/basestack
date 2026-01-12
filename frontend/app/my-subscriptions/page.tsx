"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
    History
} from "lucide-react";

// Mock Data - would come from API GET /api/me/subscriptions
const mockSubscriptions = [
    {
        id: 1,
        planName: "VIP Trading Signal",
        merchant: "Budi's Trading Lab",
        amount: "10 USDC",
        billingCycle: "month",
        nextPayment: "February 12, 2026",
        status: "active",
        subscribedAt: "January 12, 2026"
    },
    {
        id: 2,
        planName: "Premium Newsletter",
        merchant: "Crypto Daily",
        amount: "Rp 75,000",
        billingCycle: "month",
        nextPayment: "February 5, 2026",
        status: "active",
        subscribedAt: "January 5, 2026"
    }
];

export default function SubscriberDashboardPage() {
    const [subscriptions, setSubscriptions] = useState(mockSubscriptions);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<typeof mockSubscriptions[0] | null>(null);
    const [isCanceling, setIsCanceling] = useState(false);

    const handleOpenCancelModal = (plan: typeof mockSubscriptions[0]) => {
        setSelectedPlan(plan);
        setCancelModalOpen(true);
    };

    const handleCancelSubscription = async () => {
        if (!selectedPlan) return;

        setIsCanceling(true);

        // Simulate wallet interaction and API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Update local state
        setSubscriptions(prev =>
            prev.map(sub =>
                sub.id === selectedPlan.id
                    ? { ...sub, status: "canceled" }
                    : sub
            )
        );

        setIsCanceling(false);
        setCancelModalOpen(false);
        setSelectedPlan(null);
    };

    const activeCount = subscriptions.filter(s => s.status === "active").length;

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

                    {/* Wallet Status */}
                    <div className="flex items-center gap-2 bg-zinc-900 border border-white/10 rounded-full px-4 py-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-sm text-zinc-300 font-mono">0x88a1...f2c4</span>
                        <Wallet className="w-4 h-4 text-zinc-500" />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-4 md:px-6 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">My Subscriptions</h1>
                    <p className="text-zinc-400">Manage your active subscriptions and billing.</p>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-zinc-900 border border-white/5 rounded-xl p-4">
                        <div className="text-zinc-400 text-sm mb-1">Active Plans</div>
                        <div className="text-2xl font-bold text-white">{activeCount}</div>
                    </div>
                    <div className="bg-zinc-900 border border-white/5 rounded-xl p-4">
                        <div className="text-zinc-400 text-sm mb-1">Monthly Spend</div>
                        <div className="text-2xl font-bold text-white">~$15.00</div>
                    </div>
                    <div className="hidden md:block bg-zinc-900 border border-white/5 rounded-xl p-4">
                        <div className="text-zinc-400 text-sm mb-1">Next Billing</div>
                        <div className="text-2xl font-bold text-green-400">Feb 5</div>
                    </div>
                </div>

                {/* Subscription List */}
                {subscriptions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {subscriptions.map((sub, index) => (
                            <motion.div
                                key={sub.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`bg-zinc-900 border rounded-2xl p-6 ${sub.status === "active"
                                    ? "border-white/5"
                                    : "border-red-500/20 opacity-60"
                                    }`}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-1">{sub.planName}</h3>
                                        <div className="flex items-center gap-2 text-sm text-zinc-500">
                                            <User className="w-3.5 h-3.5" />
                                            {sub.merchant}
                                        </div>
                                    </div>
                                    {sub.status === "active" ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                            Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-700/50 text-zinc-400 text-xs font-bold">
                                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>
                                            Canceled
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
                                            {sub.amount} / {sub.billingCycle}
                                        </span>
                                    </div>

                                    {sub.status === "active" && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-sm text-zinc-400">
                                                <Calendar className="w-4 h-4" />
                                                Next Auto-debit
                                            </div>
                                            <span className="text-green-400 font-medium text-sm">
                                                {sub.nextPayment}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                                            <Clock className="w-4 h-4" />
                                            Subscribed
                                        </div>
                                        <span className="text-zinc-300 text-sm">
                                            {sub.subscribedAt}
                                        </span>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <button className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
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
                                    ) : (
                                        <Link
                                            href="/checkout"
                                            className="text-sm text-green-400 hover:text-green-300 font-medium transition-colors"
                                        >
                                            Resubscribe
                                        </Link>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    /* Empty State */
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
                {cancelModalOpen && selectedPlan && (
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
                                    Are you sure you want to cancel <span className="text-white font-medium">{selectedPlan.planName}</span>?
                                </p>

                                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 mb-6">
                                    <p className="text-xs text-red-400 leading-relaxed">
                                        ⚠️ You will lose access to the premium content immediately. This action will revoke the allowance on the blockchain.
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={handleCancelSubscription}
                                        disabled={isCanceling}
                                        className="w-full bg-red-500 hover:bg-red-400 disabled:bg-red-500/50 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                                    >
                                        {isCanceling ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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
        </div>
    );
}
