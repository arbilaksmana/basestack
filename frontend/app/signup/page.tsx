"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ShieldCheck, Loader2, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api } from "../lib/api";

type ConnectionStatus = "idle" | "connecting" | "signing" | "success" | "error";

export default function SignupPage() {
    const router = useRouter();
    const [status, setStatus] = useState<ConnectionStatus>("idle");
    const [error, setError] = useState<string | null>(null);
    const [connectedWallet, setConnectedWallet] = useState<string | null>(null);

    const connectWallet = async (walletType: "metamask" | "coinbase") => {
        setStatus("connecting");
        setError(null);

        try {
            // Check if ethereum provider exists
            if (typeof window === "undefined" || !window.ethereum) {
                throw new Error(
                    walletType === "metamask"
                        ? "MetaMask is not installed. Please install MetaMask extension."
                        : "Coinbase Wallet is not installed. Please install Coinbase Wallet extension."
                );
            }

            // Step 1: Request account access
            console.log("Step 1: Requesting accounts...");
            let accounts: string[];
            try {
                accounts = await window.ethereum.request({
                    method: "eth_requestAccounts",
                }) as string[];
            } catch (accountErr) {
                console.error("Account request error:", accountErr);
                throw new Error("Failed to connect wallet. Please approve the connection in your wallet.");
            }

            if (!accounts || accounts.length === 0) {
                throw new Error("No accounts found. Please connect your wallet.");
            }

            const walletAddress = accounts[0];
            setConnectedWallet(walletAddress);
            console.log("Connected wallet:", walletAddress);

            // Step 2: Get the message to sign from backend
            setStatus("signing");
            console.log("Step 2: Getting auth message from backend...");
            let messageResponse;
            try {
                messageResponse = await api.auth.getMessage();
            } catch (msgErr) {
                console.error("Get message error:", msgErr);
                throw new Error("Failed to connect to server. Please check if backend is running.");
            }

            if (!messageResponse.success || !messageResponse.data) {
                console.error("Message response:", messageResponse);
                throw new Error(messageResponse.error?.message || "Failed to get authentication message from server.");
            }

            const message = messageResponse.data.message;
            console.log("Message to sign:", message);

            // Step 3: Request signature from wallet
            console.log("Step 3: Requesting signature...");
            let signature: string;
            try {
                signature = await window.ethereum.request({
                    method: "personal_sign",
                    params: [message, walletAddress],
                }) as string;
            } catch (signErr) {
                console.error("Signature error:", signErr);
                throw new Error("Signature request was rejected. Please sign the message to authenticate.");
            }

            console.log("Signature obtained");

            // Step 4: Send signature to backend for verification
            console.log("Step 4: Verifying with backend...");
            let authResponse;
            try {
                authResponse = await api.auth.connectWallet(walletAddress, signature);
            } catch (authErr) {
                console.error("Auth error:", authErr);
                throw new Error("Failed to verify signature with server.");
            }

            if (!authResponse.success || !authResponse.data) {
                console.error("Auth response:", authResponse);
                throw new Error(authResponse.error?.message || "Authentication failed.");
            }

            // Store token and merchant info
            const { token, merchant } = authResponse.data;
            localStorage.setItem("auth_token", token);
            localStorage.setItem("merchant", JSON.stringify(merchant));

            console.log("Authentication successful!");
            setStatus("success");

            // Redirect to dashboard after short delay
            setTimeout(() => {
                router.push("/dashboard");
            }, 1500);

        } catch (err: unknown) {
            console.error("Wallet connection error:", err);
            setStatus("error");

            // Handle different error types
            let errorMessage = "Failed to connect wallet";

            if (err instanceof Error) {
                errorMessage = err.message;
            } else if (typeof err === 'object' && err !== null) {
                // MetaMask and other wallets return error objects
                const errorObj = err as { message?: string; code?: number; reason?: string };
                if (errorObj.message) {
                    errorMessage = errorObj.message;
                } else if (errorObj.reason) {
                    errorMessage = errorObj.reason;
                } else if (errorObj.code === 4001) {
                    errorMessage = "Connection request was rejected. Please try again.";
                } else if (errorObj.code === -32002) {
                    errorMessage = "A connection request is already pending. Please check your wallet.";
                }
            } else if (typeof err === 'string') {
                errorMessage = err;
            }

            setError(errorMessage);
        }
    };

    const resetConnection = () => {
        setStatus("idle");
        setError(null);
        setConnectedWallet(null);
    };

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center p-4">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black via-green-900/20 to-green-600/20 pointer-events-none" />

            {/* Close Button / Back */}
            <Link href="/" className="absolute top-8 left-8 text-zinc-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium z-20">
                ← Back to Home
            </Link>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-lg"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Connect Your Wallet</h1>
                    <p className="text-zinc-400">Choose your preferred Web3 wallet to continue.</p>
                </div>

                {/* Connection Status */}
                <AnimatePresence mode="wait">
                    {status !== "idle" && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-6"
                        >
                            <div className={`rounded-xl p-4 border ${status === "success"
                                ? "bg-green-500/10 border-green-500/20"
                                : status === "error"
                                    ? "bg-red-500/10 border-red-500/20"
                                    : "bg-blue-500/10 border-blue-500/20"
                                }`}>
                                <div className="flex items-center gap-3">
                                    {status === "connecting" && (
                                        <>
                                            <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                                            <div>
                                                <span className="text-blue-400 font-medium">Connecting to wallet...</span>
                                                <p className="text-zinc-500 text-sm">Please approve the connection in your wallet</p>
                                            </div>
                                        </>
                                    )}
                                    {status === "signing" && (
                                        <>
                                            <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                                            <div>
                                                <span className="text-blue-400 font-medium">Signing message...</span>
                                                <p className="text-zinc-500 text-sm">Please sign the message in your wallet to verify ownership</p>
                                            </div>
                                        </>
                                    )}
                                    {status === "success" && (
                                        <>
                                            <CheckCircle className="w-5 h-5 text-green-400" />
                                            <div>
                                                <span className="text-green-400 font-medium">Connected successfully!</span>
                                                <p className="text-zinc-500 text-sm">Redirecting to dashboard...</p>
                                            </div>
                                        </>
                                    )}
                                    {status === "error" && (
                                        <>
                                            <XCircle className="w-5 h-5 text-red-400" />
                                            <div className="flex-1">
                                                <span className="text-red-400 font-medium">Connection failed</span>
                                                <p className="text-zinc-500 text-sm">{error}</p>
                                            </div>
                                            <button
                                                onClick={resetConnection}
                                                className="text-sm text-zinc-400 hover:text-white transition-colors"
                                            >
                                                Try again
                                            </button>
                                        </>
                                    )}
                                </div>
                                {connectedWallet && status !== "error" && (
                                    <div className="mt-2 pt-2 border-t border-white/5">
                                        <span className="text-zinc-500 text-xs">Wallet: </span>
                                        <span className="text-zinc-300 text-xs font-mono">
                                            {connectedWallet.slice(0, 6)}...{connectedWallet.slice(-4)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="space-y-4">
                    {/* Coinbase Wallet */}
                    <WalletOption
                        name="Coinbase Wallet"
                        description="Connect with Coinbase Smart Wallet"
                        icon={
                            <Image
                                src="/assets/coinbase.png"
                                alt="Coinbase Wallet"
                                width={40}
                                height={40}
                                className="rounded-full"
                            />
                        }
                        badges={["Recommended", "Gasless"]}
                        onClick={() => connectWallet("coinbase")}
                        disabled={status === "connecting" || status === "signing" || status === "success"}
                    />

                    {/* MetaMask */}
                    <WalletOption
                        name="MetaMask"
                        description="Connect with MetaMask browser extension"
                        icon={
                            <Image
                                src="/assets/metamask.png"
                                alt="MetaMask"
                                width={40}
                                height={40}
                            />
                        }
                        badges={["Popular"]}
                        onClick={() => connectWallet("metamask")}
                        disabled={status === "connecting" || status === "signing" || status === "success"}
                    />
                </div>

                {/* Safety Badge */}
                <div className="mt-8 bg-white/5 border border-white/10 rounded-xl p-4 flex gap-4 items-start shadow-sm backdrop-blur-sm">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm mb-1">Secure & Non-Custodial</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            BaseStack never has access to your funds. You remain in full control of your wallet at all times.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function WalletOption({
    name,
    description,
    icon,
    badges,
    onClick,
    disabled
}: {
    name: string;
    description: string;
    icon: React.ReactNode;
    badges?: string[];
    onClick?: () => void;
    disabled?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`w-full bg-white group hover:bg-zinc-50 transition-colors rounded-2xl p-4 flex items-center gap-4 text-left shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-200 border border-transparent hover:border-green-500/20 ${disabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
        >
            {icon}
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-black text-lg">{name}</span>
                </div>
                <div className="text-zinc-500 text-sm font-medium">{description}</div>

                {badges && (
                    <div className="flex gap-2 mt-2">
                        {badges.includes("Recommended") && (
                            <span className="bg-[#E6F4EA] text-[#137333] text-xs font-bold px-2 py-0.5 rounded">Recommended</span>
                        )}
                        {badges.includes("Gasless") && (
                            <span className="bg-[#E8F0FE] text-[#1967D2] text-xs font-bold px-2 py-0.5 rounded">Gasless</span>
                        )}
                        {badges.includes("Popular") && (
                            <span className="bg-[#FEF7E0] text-[#B45309] text-xs font-bold px-2 py-0.5 rounded">Popular</span>
                        )}
                    </div>
                )}
            </div>
            <ArrowRight className="text-zinc-300 group-hover:text-green-500 transition-colors w-5 h-5" />
        </button>
    );
}
