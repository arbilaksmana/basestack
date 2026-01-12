"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Check,
    Globe,
    ChevronDown,
    Lock,
    Zap,
    BadgeCheck,
    X
} from "lucide-react";

// Currency options
const currencies = [
    { code: "IDRX", symbol: "Rp", amount: 150000, label: "IDRX", flag: "🇮🇩", recommended: true },
    { code: "USDC", symbol: "$", amount: 10, label: "USDC", flag: "🇺🇸", recommended: false },
    { code: "USDT", symbol: "$", amount: 10, label: "USDT", flag: "🇺🇸", recommended: false },
];

export default function CheckoutPage() {
    const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);
    const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);

    const formatPrice = (currency: typeof currencies[0]) => {
        if (currency.code === "IDRX") {
            return `Rp ${currency.amount.toLocaleString()}`;
        }
        return `${currency.amount} ${currency.code}`;
    };

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
                                B
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-500 border-2 border-zinc-900 flex items-center justify-center">
                                <BadgeCheck className="w-3.5 h-3.5 text-white" />
                            </div>
                        </div>
                        <p className="text-zinc-400 text-sm">Budi&apos;s Trading Lab</p>
                    </div>

                    {/* 2. Product Details */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-white text-center mb-3">
                            VIP Trading Signal
                        </h1>
                        <p className="text-zinc-400 text-sm text-center leading-relaxed mb-6">
                            Get exclusive daily signals, access to Telegram group, and weekly market analysis.
                        </p>

                        {/* Features */}
                        <div className="flex flex-wrap justify-center gap-3">
                            {["Daily Alpha", "Direct Support", "Community Access"].map((feature) => (
                                <div
                                    key={feature}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20"
                                >
                                    <Check className="w-3.5 h-3.5 text-green-500" />
                                    <span className="text-xs font-medium text-green-400">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 3. Glocal Pricing Section */}
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
                            <p className="text-zinc-500 text-sm">/ month</p>
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
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-4 rounded-xl transition-all shadow-[0_0_30px_rgba(34,197,94,0.2)] hover:shadow-[0_0_40px_rgba(34,197,94,0.3)]"
                        >
                            Subscribe for {formatPrice(selectedCurrency)}
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
