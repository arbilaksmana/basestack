"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
    CheckCircle2,
    Copy,
    Check,
    Link as LinkIcon,
    Code,
    ArrowLeft,
    Plus,
    ExternalLink
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
        const newPieces = Array.from({ length: 40 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            delay: Math.random() * 0.3,
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

function PlanCreatedContent() {
    const searchParams = useSearchParams();
    const [showConfetti, setShowConfetti] = useState(true);
    const [copiedLink, setCopiedLink] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);

    // Get plan data from URL params (passed from CreatePlanModal)
    const planData = {
        name: searchParams.get("name") || "Your Plan",
        slug: searchParams.get("slug") || "plan",
        priceIdrx: searchParams.get("priceIdrx") || "0",
        priceUsdc: searchParams.get("priceUsdc") || "0",
    };

    const [origin, setOrigin] = useState("https://basestack.xyz");

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setOrigin(window.location.origin);
        }
    }, []);

    const paymentLink = `${origin}/checkout/${planData.slug}`;

    const embedCode = `<a href="${paymentLink}" 
   class="basestack-button" 
   target="_blank"
   style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;background:#22c55e;color:#000;font-weight:bold;border-radius:999px;text-decoration:none;">
   Subscribe with BaseStack
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

    useEffect(() => {
        const timer = setTimeout(() => setShowConfetti(false), 4000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative">
            {/* Confetti */}
            {showConfetti && <Confetti />}

            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]"></div>
            </div>

            {/* Main Card */}
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative z-10 w-full max-w-lg"
            >
                <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 shadow-2xl">

                    {/* 1. Header - Success Celebration */}
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
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <CheckCircle2 className="w-12 h-12 text-green-500" />
                            </motion.div>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="text-2xl font-bold text-white mb-2"
                        >
                            Plan Published Successfully!
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="text-zinc-400"
                        >
                            Your plan <span className="text-white font-medium">{planData.name}</span> is live on Base network.
                        </motion.p>
                    </div>

                    {/* Plan Summary */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.65 }}
                        className="bg-zinc-950 border border-white/10 rounded-xl p-4 mb-6"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-zinc-400 text-sm">Plan Name</span>
                            <span className="text-white font-medium">{planData.name}</span>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-zinc-400 text-sm">IDRX Price</span>
                            <span className="text-white font-medium">Rp {parseInt(planData.priceIdrx).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-zinc-400 text-sm">USDC Price</span>
                            <span className="text-white font-medium">{planData.priceUsdc} USDC</span>
                        </div>
                    </motion.div>

                    {/* 2. Money Tools Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="space-y-4"
                    >
                        {/* Box A: Direct Payment Link */}
                        <div className="bg-zinc-950 border border-white/10 rounded-xl p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <LinkIcon className="w-4 h-4 text-green-500" />
                                <span className="text-sm font-bold text-white">Share Payment Link</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 overflow-hidden">
                                    <span className="text-sm text-zinc-300 font-mono truncate block">
                                        {paymentLink}
                                    </span>
                                </div>
                                <button
                                    onClick={handleCopyLink}
                                    className={`px-4 py-3 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${copiedLink
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

                            <a
                                href={`/checkout/${planData.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 mt-3 transition-colors"
                            >
                                Preview checkout page
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>

                        {/* Box B: Embed Code */}
                        <div className="bg-zinc-950 border border-white/10 rounded-xl p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <Code className="w-4 h-4 text-blue-500" />
                                <span className="text-sm font-bold text-white">Embed on your Website</span>
                            </div>

                            <div className="bg-zinc-900 border border-white/10 rounded-lg p-4 mb-3 overflow-x-auto">
                                <pre className="text-xs text-zinc-400 font-mono whitespace-pre-wrap break-all">
                                    {`<a href="${paymentLink}" 
   class="basestack-button" 
   target="_blank">
   Subscribe with BaseStack
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
                    </motion.div>

                    {/* 3. Footer Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="mt-6 pt-6 border-t border-white/5 space-y-3"
                    >
                        <Link
                            href="/dashboard"
                            className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-4 rounded-xl transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Dashboard
                        </Link>

                        <Link
                            href="/dashboard"
                            className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 font-medium py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Create Another Plan
                        </Link>
                    </motion.div>

                    {/* Trust Footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9 }}
                        className="mt-6 text-center"
                    >
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

export default function PlanCreatedPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="text-zinc-500">Loading...</div>
            </div>
        }>
            <PlanCreatedContent />
        </Suspense>
    );
}
