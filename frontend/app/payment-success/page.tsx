"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    CheckCircle2,
    ExternalLink,
    Copy,
    Check,
    MessageCircle,
    LayoutDashboard,
    Calendar,
    Wallet,
    Zap
} from "lucide-react";

// Confetti Component
function Confetti() {
    const [pieces, setPieces] = useState<Array<{
        id: number;
        x: number;
        delay: number;
        duration: number;
        color: string;
        size: number;
        rotation: number;
    }>>([]);

    useEffect(() => {
        const colors = ["#22c55e", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4"];
        const newPieces = Array.from({ length: 50 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            delay: Math.random() * 0.5,
            duration: 2 + Math.random() * 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: 6 + Math.random() * 8,
            rotation: Math.random() * 360,
        }));
        setPieces(newPieces);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
            {pieces.map((piece) => (
                <motion.div
                    key={piece.id}
                    initial={{
                        y: -20,
                        x: `${piece.x}vw`,
                        rotate: 0,
                        opacity: 1
                    }}
                    animate={{
                        y: "110vh",
                        rotate: piece.rotation + 720,
                        opacity: [1, 1, 0]
                    }}
                    transition={{
                        duration: piece.duration,
                        delay: piece.delay,
                        ease: "linear"
                    }}
                    style={{
                        position: "absolute",
                        width: piece.size,
                        height: piece.size,
                        backgroundColor: piece.color,
                        borderRadius: Math.random() > 0.5 ? "50%" : "2px",
                    }}
                />
            ))}
        </div>
    );
}

export default function PaymentSuccessPage() {
    const [copied, setCopied] = useState(false);
    const [showConfetti, setShowConfetti] = useState(true);

    // Mock data (would come from API in real app)
    const subscriptionData = {
        planName: "VIP Trading Signal",
        merchantName: "Budi's Trading Lab",
        amount: "10 USDC",
        txHash: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12",
        nextBilling: "February 12, 2026",
        subscriberName: "Sari",
        telegramLink: "https://t.me/vip_trading_signal"
    };

    const handleCopyTxHash = () => {
        navigator.clipboard.writeText(subscriptionData.txHash);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shortenTxHash = (hash: string) => {
        return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
    };

    useEffect(() => {
        // Hide confetti after animation
        const timer = setTimeout(() => setShowConfetti(false), 4000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative">
            {/* Confetti */}
            {showConfetti && <Confetti />}

            {/* Background Blur Effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]"></div>
            </div>

            {/* Main Success Card */}
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 shadow-2xl">

                    {/* 1. Visual Feedback - Success Icon */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                                type: "spring",
                                stiffness: 200,
                                damping: 15,
                                delay: 0.3
                            }}
                            className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                <CheckCircle2 className="w-12 h-12 text-green-500" />
                            </motion.div>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="text-2xl font-bold text-white mb-2"
                        >
                            You&apos;re all set, {subscriptionData.subscriberName}!
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="text-zinc-400"
                        >
                            You have successfully subscribed to{" "}
                            <span className="text-white font-medium">{subscriptionData.planName}</span>
                        </motion.p>
                    </div>

                    {/* 2. Transaction Receipt */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="bg-zinc-950 border border-white/10 rounded-2xl p-5 mb-6"
                    >
                        <div className="space-y-4">
                            {/* Amount Paid */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                                    <Wallet className="w-4 h-4" />
                                    Payment Amount
                                </div>
                                <span className="text-white font-bold">{subscriptionData.amount}</span>
                            </div>

                            {/* Network */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                                    <Zap className="w-4 h-4" />
                                    Network
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                                        <span className="text-[8px] text-white font-bold">B</span>
                                    </div>
                                    <span className="text-white text-sm">Base Network</span>
                                </div>
                            </div>

                            {/* Transaction Hash */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                                    Tx Hash
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-zinc-300 font-mono text-sm">
                                        {shortenTxHash(subscriptionData.txHash)}
                                    </span>
                                    <button
                                        onClick={handleCopyTxHash}
                                        className="text-zinc-400 hover:text-white transition-colors"
                                    >
                                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                    <a
                                        href={`https://basescan.org/tx/${subscriptionData.txHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-white/5"></div>

                            {/* Next Billing Date */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                                    <Calendar className="w-4 h-4" />
                                    Next Auto-Debit
                                </div>
                                <span className="text-green-400 font-medium text-sm">{subscriptionData.nextBilling}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* 3. Action Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                        className="space-y-3"
                    >
                        {/* Primary Button - Access Content */}
                        <a
                            href={subscriptionData.telegramLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-4 rounded-xl transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] flex items-center justify-center gap-2"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Access Telegram Group
                        </a>

                        {/* Secondary Button - Dashboard */}
                        <Link
                            href="/dashboard"
                            className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 font-medium py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            <LayoutDashboard className="w-5 h-5" />
                            Manage Subscription
                        </Link>
                    </motion.div>

                    {/* Trust Footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="mt-6 pt-6 border-t border-white/5 text-center"
                    >
                        <p className="text-xs text-zinc-500 mb-3">
                            Your subscription will auto-renew. Cancel anytime.
                        </p>
                        <Image
                            src="/assets/logo.png"
                            alt="BaseStack"
                            width={80}
                            height={20}
                            className="opacity-30 h-4 w-auto mx-auto"
                        />
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
