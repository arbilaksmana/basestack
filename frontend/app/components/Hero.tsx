"use client";

import CryptoHero from "./ui/crypto-hero";
import { useRouter } from "next/navigation";
import { CreditCard, Gem, Wallet, TrendingUp, ArrowUpRight } from "lucide-react";
import Image from "next/image";

export function Hero() {
    const router = useRouter();

    return (
        <CryptoHero
            className="pb-32" // Add padding for brands at bottom
            logo={<></>} // Empty logo to avoid duplication with global Navbar
            title={
                <>
                    The Ultimate Payment Stack for {" "}
                    <Image
                        src="/assets/base.svg"
                        alt="Base"
                        width={180}
                        height={60}
                        className="inline-block h-[0.85em] w-auto align-baseline -mb-1 ml-4"
                    />
                </>
            }
            // subtitle="for your business with Crypto"
            badge={["Recurring", "Glocal Pricing", "Keeper Bot"]}
            description="Our complete payment solution with simple integration helps you reach more customers, reduce fraudulent transactions, and reconcile with ease."
            emailPlaceholder="Enter your business email"

            cryptoCoins={[]}
            walletImage={
                <div className="relative w-full max-w-sm mx-auto">
                    {/* Main Card */}
                    <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-3xl p-6 border border-white/10 shadow-2xl shadow-green-500/10">
                        {/* Glow effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-3xl blur-xl opacity-50"></div>

                        <div className="relative z-10">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                                        <Wallet className="w-5 h-5 text-green-500" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-zinc-500">Total Balance</div>
                                        <div className="text-xl font-bold text-white">$24,580.00</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-green-400 text-sm font-medium">
                                    <TrendingUp className="w-4 h-4" />
                                    +12.5%
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center mb-3">
                                        <CreditCard className="w-4 h-4 text-green-500" />
                                    </div>
                                    <div className="text-2xl font-bold text-white">$12.4k</div>
                                    <div className="text-xs text-zinc-500">Monthly Revenue</div>
                                </div>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                                        <Gem className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <div className="text-2xl font-bold text-white">854</div>
                                    <div className="text-xs text-zinc-500">Active Subs</div>
                                </div>
                            </div>

                            {/* Recent Transactions */}
                            <div className="space-y-3">
                                <div className="text-xs text-zinc-500 font-medium">Recent Transactions</div>
                                {[
                                    { token: "USDC", amount: "+$149.00", time: "2 mins ago", color: "text-blue-400" },
                                    { token: "IDRX", amount: "+Rp 2.5M", time: "15 mins ago", color: "text-green-400" },
                                    { token: "USDT", amount: "+$89.00", time: "1 hour ago", color: "text-teal-400" },
                                ].map((tx, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 group hover:border-green-500/30 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center ${tx.color} font-bold text-xs`}>
                                                {tx.token.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm text-white font-medium">Subscription</div>
                                                <div className="text-xs text-zinc-500">{tx.time}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-green-400">{tx.amount}</span>
                                            <ArrowUpRight className="w-4 h-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Floating tokens decoration */}
                    <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-blue-500/80 to-blue-600/80 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/30 animate-bounce" style={{ animationDuration: '3s' }}>
                        USDC
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-14 h-14 bg-gradient-to-br from-green-500/80 to-emerald-600/80 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-green-500/30 animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>
                        IDRX
                    </div>
                    <div className="absolute top-1/2 -right-8 w-12 h-12 bg-gradient-to-br from-teal-500/80 to-teal-600/80 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-teal-500/30 animate-bounce" style={{ animationDuration: '2s', animationDelay: '1s' }}>
                        USDT
                    </div>
                </div>
            }
            brands={[
                { name: "Netflix", logo: <span className="text-xl font-bold text-white">NETFLIX</span> },
                { name: "Spotify", logo: <span className="text-xl font-bold text-white">Spotify</span> },
                { name: "Gjek", logo: <span className="text-xl font-bold text-green-500">gojek</span> },
                { name: "Tokped", logo: <span className="text-xl font-bold text-green-500">tokopedia</span> },
                { name: "Gooogle", logo: <span className="text-xl font-bold text-white">Google</span> },
            ]}
        />
    );
}
