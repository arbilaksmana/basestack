"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Smartphone, Globe, CreditCard } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function SignupPage() {
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
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Hubungkan Dompet Anda</h1>
                    <p className="text-zinc-400">Pilih dompet Web3 favorit Anda untuk melanjutkan.</p>
                </div>

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
                            // className="rounded-full"
                            />
                            
                        }
                        badges={["Recommended", "Gasless"]}
                    />

                </div>

                {/* Safety Badge */}
                <div className="mt-8 bg-white/5 border border-white/10 rounded-xl p-4 flex gap-4 items-start shadow-sm backdrop-blur-sm">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm mb-1">Aman & Tanpa Penitipan</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            BaseStack tidak pernah memiliki akses ke dana Anda. Anda tetap memegang kendali penuh atas dompet Anda setiap saat.
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
    badges
}: {
    name: string,
    description: string,
    icon: React.ReactNode,
    badges?: string[]
}) {
    return (
        <button className="w-full bg-white group hover:bg-zinc-50 transition-colors rounded-2xl p-4 flex items-center gap-4 text-left shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-200 border border-transparent hover:border-green-500/20">
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
                    </div>
                )}
            </div>
            <ArrowRight className="text-zinc-300 group-hover:text-green-500 transition-colors w-5 h-5" />
        </button>
    );
}
