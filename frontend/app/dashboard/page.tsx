"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    Copy,
    Code,
    Pencil,
    Plus,
    Check,
    X,
    ChevronDown,
    Wallet,
    TrendingUp,
    Users,
    PieChart,
    ExternalLink,
    MoreVertical
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Mock Data
const mockPlans = [
    {
        id: 1,
        name: "VIP Trading Signal",
        priceIDRX: 150000,
        priceUSDC: 10,
        billing: "Monthly",
        subscribers: 45,
        link: "basestack.xyz/pay/vip-signal",
        nextPull: "1 Feb 2026"
    },
    {
        id: 2,
        name: "Premium Newsletter",
        priceIDRX: 75000,
        priceUSDC: 5,
        billing: "Monthly",
        subscribers: 89,
        link: "basestack.xyz/pay/newsletter",
        nextPull: "1 Feb 2026"
    },
    {
        id: 3,
        name: "Pro Membership",
        priceIDRX: 500000,
        priceUSDC: 35,
        billing: "Yearly",
        subscribers: 12,
        link: "basestack.xyz/pay/pro",
        nextPull: "12 Jan 2027"
    },
];

const mockTransactions = [
    { id: 1, subscriber: "budi.base.eth", plan: "VIP Trading Signal", amount: "10 USDC", status: "paid", date: "2026-01-12 14:32" },
    { id: 2, subscriber: "0x88a1...f2c4", plan: "Premium Newsletter", amount: "75,000 IDRX", status: "paid", date: "2026-01-12 13:15" },
    { id: 3, subscriber: "ani.base.eth", plan: "VIP Trading Signal", amount: "150,000 IDRX", status: "grace", date: "2026-01-12 12:08" },
    { id: 4, subscriber: "0x3d2e...9a1b", plan: "Pro Membership", amount: "35 USDC", status: "paid", date: "2026-01-11 22:45" },
    { id: 5, subscriber: "crypto.base.eth", plan: "Premium Newsletter", amount: "5 USDC", status: "paid", date: "2026-01-11 18:20" },
];

export default function DashboardPage() {
    const [currency, setCurrency] = useState<"IDR" | "USD">("USD");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [copiedLink, setCopiedLink] = useState<string | null>(null);

    const handleCopyLink = (link: string) => {
        navigator.clipboard.writeText(`https://${link}`);
        setCopiedLink(link);
        setTimeout(() => setCopiedLink(null), 2000);
    };

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

                        {/* Wallet Status */}
                        <div className="flex items-center gap-2 bg-zinc-900 border border-white/10 rounded-full px-4 py-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-sm text-zinc-300 font-mono">0x123...abc</span>
                            <Wallet className="w-4 h-4 text-zinc-500" />
                        </div>
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
                            {currency === "USD" ? "$1,250.00" : "Rp 19.500.000"}
                        </div>
                        <div className="text-sm text-zinc-500">
                            {currency === "USD" ? "Est. Rp 19.500.000 / bulan" : "Est. $1,250.00 / month"}
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
                        <div className="text-4xl font-bold text-white mb-1">142</div>
                        <div className="text-sm text-green-400 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            +12 new this week
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
                        <div className="flex items-center gap-4">
                            {/* Simple Bar Chart */}
                            <div className="flex-1 h-4 bg-zinc-800 rounded-full overflow-hidden flex">
                                <div className="w-[60%] bg-green-500 h-full"></div>
                                <div className="w-[40%] bg-blue-500 h-full"></div>
                            </div>
                        </div>
                        <div className="flex justify-between mt-3 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-zinc-400">60% IDRX</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <span className="text-zinc-400">40% USDC</span>
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* Main Section: Subscription Plans */}
                <section className="mb-10">
                    <h2 className="text-xl font-bold text-white mb-6">Your Subscription Plans</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Existing Plan Cards */}
                        {mockPlans.map((plan, index) => (
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
                                        <span className="text-white font-bold">Rp {plan.priceIDRX.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-lg">🌏</span>
                                        <span className="text-zinc-400">Global:</span>
                                        <span className="text-white font-bold">{plan.priceUSDC} USDC</span>
                                    </div>
                                </div>

                                {/* Meta */}
                                <div className="flex items-center justify-between text-sm text-zinc-500 mb-2">
                                    <span>{plan.billing}</span>
                                    <span>{plan.subscribers} subscribers</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-4">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                    <span>Next Pull: {plan.nextPull}</span>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                                    <button
                                        onClick={() => handleCopyLink(plan.link)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-zinc-300 hover:text-white transition-colors"
                                    >
                                        {copiedLink === plan.link ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                        {copiedLink === plan.link ? "Copied!" : "Copy Link"}
                                    </button>
                                    <button className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors">
                                        <Code className="w-4 h-4" />
                                    </button>
                                    <button className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors">
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}

                        {/* Create New Plan Card */}
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: mockPlans.length * 0.1 }}
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
                </section>

                {/* Bottom Section: Recent Transactions */}
                <section>
                    <h2 className="text-xl font-bold text-white mb-6">Recent Transactions</h2>
                    <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden">
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
                                    {mockTransactions.map((tx) => (
                                        <tr key={tx.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                                            <td className="py-4 px-6">
                                                <span className="text-sm font-mono text-white">{tx.subscriber}</span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="text-sm text-zinc-300">{tx.plan}</span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="text-sm font-bold text-white">{tx.amount}</span>
                                            </td>
                                            <td className="py-4 px-6">
                                                {tx.status === "paid" ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                        Paid
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                                        Grace Period
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="text-sm text-zinc-500">{tx.date}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </main>

            {/* Create Plan Modal */}
            <CreatePlanModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
        </div>
    );
}

// Create Plan Modal Component
function CreatePlanModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [planName, setPlanName] = useState("");
    const [description, setDescription] = useState("");
    const [billingInterval, setBillingInterval] = useState("monthly");
    const [priceIDRX, setPriceIDRX] = useState("");
    const [priceUSDC, setPriceUSDC] = useState("");

    const handleIDRXChange = (value: string) => {
        setPriceIDRX(value);
        // Auto-calculate USD equivalent (mock rate: 1 USD = 16,000 IDR)
        const numValue = parseFloat(value.replace(/,/g, ""));
        if (!isNaN(numValue)) {
            setPriceUSDC((numValue / 16000).toFixed(2));
        }
    };

    const handleUSDCChange = (value: string) => {
        setPriceUSDC(value);
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

                                {/* Submit Button */}
                                <button className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-lg transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] flex items-center justify-center gap-2 text-sm">
                                    Publish Plan on Base
                                    <ExternalLink className="w-4 h-4" />
                                </button>

                                <p className="text-xs text-zinc-500 text-center">
                                    This will trigger a wallet transaction.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
