"use client";

import { motion } from "framer-motion";
import React from "react";
import { cn } from "@/app/utils/cn"; // Assuming utility exists, if not I'll inline or create it. I'll stick to standard tailwind classes where possible and inline styles for the specific gradient animations requested.
import ProceduralGroundBackground from "./procedural-ground-background";
import { BlurredInfiniteSlider } from "./infinite-slider";

// Simple cn utility just in case
function classNames(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ');
}

interface VaultoryHeroProps {
    logo: React.ReactNode;
    title: React.ReactNode;
    subtitle?: string;
    description: string;
    badge?: string[];
    emailPlaceholder?: string;
    ctaButton?: {
        label: string;
        onClick: () => void;
    };
    navItems?: Array<{ label: string; onClick: () => void }>;
    authButtons?: {
        login: { label: string; onClick: () => void };
        signup: { label: string; onClick: () => void };
    };
    cryptoCoins?: Array<{
        icon: React.ReactNode;
        size: number;
        position: { x: string; y: string };
        delay: number;
        rotationDuration?: number;
        floatDuration?: number;
    }>;
    brands?: Array<{ name: string; logo: React.ReactNode }>;
    walletImage?: React.ReactNode;
    className?: string;
}

export default function CryptoHero({
    logo,
    title,
    subtitle,
    description,
    badge = [],
    emailPlaceholder = "name@email.com",
    ctaButton,
    navItems = [],
    authButtons,
    cryptoCoins = [],
    brands = [],
    walletImage,
    className = "",
}: VaultoryHeroProps) {
    return (
        <section
            className={classNames("relative min-h-screen w-full overflow-hidden bg-black", className)}
        >
            {/* Background Gradients matching BaseStack */}
            {/* WebGL Background */}
            <ProceduralGroundBackground />

            {/* Overlay to ensure text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black pointer-events-none z-0"></div>

            {/* Central Glow Effect */}
            <motion.div
                className="absolute z-0 pointer-events-none"
                style={{
                    top: "20%",
                    left: "25%",
                    width: "800px",
                    height: "800px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%)",
                    filter: "blur(80px)",
                }}
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Content Container */}
            <div className="relative z-10 min-h-screen flex items-center px-4 md:px-6 pt-24 pb-12">
                <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="space-y-8 text-center lg:text-left"
                    >
                        {/* Badge */}
                        {badge.length > 0 && (
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-6">
                                {badge.map((item, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-zinc-300"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                        {item}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Title */}
                        <h1
                            className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight text-white"
                        >
                            {title}
                            {subtitle && (
                                <>
                                    <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
                                        {subtitle}
                                    </span>
                                </>
                            )}
                        </h1>

                        {/* Description */}
                        <p className="text-lg md:text-xl max-w-xl mx-auto lg:mx-0 text-zinc-400 leading-relaxed">
                            {description}
                        </p>

                        {/* Email Input & CTA */}
                        {ctaButton && (
                            <div className="flex flex-col sm:flex-row items-center gap-4 max-w-md mx-auto lg:mx-0">
                                {emailPlaceholder && (
                                    <input
                                        type="email"
                                        placeholder={emailPlaceholder}
                                        className="w-full sm:flex-1 px-5 py-3.5 rounded-full text-white placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-green-500 transition-all"
                                        style={{
                                            background: "rgba(255, 255, 255, 0.05)",
                                            backdropFilter: "blur(10px)",
                                            border: "1px solid rgba(255, 255, 255, 0.1)",
                                        }}
                                    />
                                )}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={ctaButton.onClick}
                                    className="w-full sm:w-auto px-8 py-3.5 rounded-full font-bold transition-all shadow-lg shadow-green-500/20"
                                    style={{
                                        background: "#22c55e",
                                        color: "#000000",
                                    }}
                                >
                                    {ctaButton.label}
                                </motion.button>
                            </div>
                        )}
                    </motion.div>

                    {/* Right Content - Wallet & Coins */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="relative h-[400px] md:h-[500px] w-full flex items-center justify-center"
                    >
                        {/* Wallet Image / Hero Asset */}
                        <motion.div
                            className="absolute inset-0 flex items-center justify-center z-10"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, delay: 0.7 }}
                        >
                            {walletImage}
                        </motion.div>

                        {/* Floating Crypto Coins */}
                        {cryptoCoins.map((coin, index) => (
                            <motion.div
                                key={index}
                                className="absolute rounded-full flex items-center justify-center z-20 backdrop-blur-sm border border-white/20"
                                style={{
                                    width: `${coin.size}px`,
                                    height: `${coin.size}px`,
                                    left: coin.position.x,
                                    top: coin.position.y,
                                    background: "linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)",
                                    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
                                }}
                                initial={{ opacity: 0, y: 50 }}
                                animate={{
                                    opacity: 1,
                                    y: [0, -20, 0],
                                    rotate: [0, 10, 0, -10, 0],
                                }}
                                transition={{
                                    opacity: { duration: 0.6, delay: 0.8 + coin.delay },
                                    y: {
                                        duration: coin.floatDuration || (3 + index * 0.5),
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    },
                                    rotate: {
                                        duration: coin.rotationDuration || (4 + index * 0.3),
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    },
                                }}
                            >
                                {coin.icon}
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Brand Logos */}
            {brands.length > 0 && (
                <div className="absolute bottom-0 left-0 right-0 z-20 py-8 bg-gradient-to-t from-black to-transparent">
                    <div className="max-w-7xl mx-auto px-6">
                        <p className="text-center text-xs text-zinc-500 uppercase tracking-widest mb-6">Trusted by industry leaders</p>
                        <BlurredInfiniteSlider
                            speed={40}
                            gap={64}
                            fadeWidth={60}
                        >
                            {brands.map((brand, index) => (
                                <div
                                    key={index}
                                    className="w-32 flex items-center justify-center opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                                >
                                    {brand.logo}
                                </div>
                            ))}
                        </BlurredInfiniteSlider>
                    </div>
                </div>
            )}
        </section>
    );
}
