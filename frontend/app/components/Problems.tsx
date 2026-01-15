"use client";

import { motion } from "framer-motion";
import { XCircle, Clock, TrendingDown, Ban, ArrowDown, Construction } from "lucide-react";
import CardSwap, { Card } from "./ui/card-swap";

export function Problems() {
    const problems = [
        {
            icon: <Construction className="w-6 h-6 text-orange-500" />,
            title: "Manual Reconciliation",
            description: "Hours wasted matching wallet addresses to customer orders in spreadsheets.",
            stat: "10+ hrs/week lost",
            color: "orange"
        },
        {
            icon: <Clock className="w-6 h-6 text-red-500" />,
            title: "Late Payments",
            description: "Customers forget to renew, leading to service interruptions and churn.",
            stat: "15% revenue leakage",
            color: "red"
        },
        {
            icon: <TrendingDown className="w-6 h-6 text-yellow-500" />,
            title: "High Transaction Fees",
            description: "Traditional gateways eat up 3-5% of your margins plus FX fees.",
            stat: "3-5% margin loss",
            color: "yellow"
        },
        {
            icon: <Ban className="w-6 h-6 text-zinc-400" />,
            title: "Platform Risk",
            description: "Centralized exchanges can freeze your business account without warning.",
            stat: "Zero control",
            color: "zinc"
        },
    ];

    const getGradient = (color: string) => {
        switch (color) {
            case "orange": return "from-orange-500/30 via-orange-500/10 to-transparent";
            case "red": return "from-red-500/30 via-red-500/10 to-transparent";
            case "yellow": return "from-yellow-500/30 via-yellow-500/10 to-transparent";
            default: return "from-zinc-500/20 via-zinc-500/5 to-transparent";
        }
    };

    const getBorderColor = (color: string) => {
        switch (color) {
            case "orange": return "border-orange-500/50";
            case "red": return "border-red-500/50";
            case "yellow": return "border-yellow-500/50";
            default: return "border-zinc-500/40";
        }
    };

    const getNeonShadow = (color: string) => {
        switch (color) {
            case "orange": return "shadow-[0_0_30px_rgba(249,115,22,0.3),inset_0_0_20px_rgba(249,115,22,0.1)]";
            case "red": return "shadow-[0_0_30px_rgba(239,68,68,0.3),inset_0_0_20px_rgba(239,68,68,0.1)]";
            case "yellow": return "shadow-[0_0_30px_rgba(234,179,8,0.3),inset_0_0_20px_rgba(234,179,8,0.1)]";
            default: return "shadow-[0_0_30px_rgba(113,113,122,0.2),inset_0_0_20px_rgba(113,113,122,0.1)]";
        }
    };

    const getIconGlow = (color: string) => {
        switch (color) {
            case "orange": return "shadow-[0_0_15px_rgba(249,115,22,0.5)]";
            case "red": return "shadow-[0_0_15px_rgba(239,68,68,0.5)]";
            case "yellow": return "shadow-[0_0_15px_rgba(234,179,8,0.5)]";
            default: return "";
        }
    };

    return (
        <section id="problems" className="py-24 relative overflow-hidden bg-black">
            {/* Background Texture */}
            <div className="absolute inset-0 z-0 opacity-20"
                style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #333 1px, transparent 0)', backgroundSize: '40px 40px' }}>
            </div>

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">

                    {/* Left Column: Heading */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="max-w-xl"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium mb-6">
                            <XCircle className="w-4 h-4" />
                            The Current Reality
                        </div>

                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                            Crypto payments shouldn't feel like <span className="text-zinc-500 line-through decoration-red-500/50">rocket science</span>
                        </h2>

                        <p className="text-lg text-zinc-400 leading-relaxed mb-8">
                            Most businesses running on crypto are stuck in 2015 manually checking Etherscan, chasing clients for renewals, and losing money to inefficiencies.
                        </p>

                        <div className="flex items-center gap-4 text-sm text-zinc-500">
                            <div className="flex -space-x-3">
                                {[1, 2, 3].map(i => (
                                    <div
                                        key={i}
                                        className="w-8 h-8 rounded-full border-2 border-red-500/50 bg-zinc-900 flex items-center justify-center text-xs shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                                    >
                                        <ArrowDown className="w-3 h-3 text-red-500" />
                                    </div>
                                ))}
                            </div>
                            <p>It drags your business down.</p>
                        </div>
                    </motion.div>

                    {/* Right Column: CardSwap Animation */}
                    <div className="relative h-[450px] flex items-center justify-center">
                        <CardSwap
                            cardDistance={40}
                            verticalDistance={50}
                            delay={4000}
                            pauseOnHover={true}
                            width={320}
                            height={200}
                            skewAmount={5}
                            easing="elastic"
                        >
                            {problems.map((item, index) => (
                                <Card
                                    key={index}
                                    className={`p-6 bg-gradient-to-br ${getGradient(item.color)} ${getBorderColor(item.color)} ${getNeonShadow(item.color)} border-2`}
                                >
                                    <div className="flex flex-col h-full justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`w-12 h-12 rounded-xl bg-zinc-950 border border-white/20 flex items-center justify-center ${getIconGlow(item.color)}`}>
                                                    {item.icon}
                                                </div>
                                                <span className={`text-xs font-mono bg-black/70 px-2 py-1 rounded-lg border ${getBorderColor(item.color)}`}>
                                                    <span className="text-white">{item.stat}</span>
                                                </span>
                                            </div>

                                            <h3 className="text-xl text-white font-bold mb-2">{item.title}</h3>
                                            <p className="text-sm text-zinc-400 leading-relaxed">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </CardSwap>
                    </div>
                </div>
            </div>
        </section>
    );
}
