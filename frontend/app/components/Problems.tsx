"use client";

import { motion } from "framer-motion";
import { XCircle, Clock, TrendingDown, Ban, ArrowDown, Construction } from "lucide-react";
import { cn } from "@/app/utils/cn";

export function Problems() {
    const problems = [
        {
            icon: <Construction className="w-5 h-5 text-orange-500" />,
            title: "Manual Reconciliation",
            description: "Hours wasted matching wallet addresses to customer orders in spreadsheets.",
            stat: "10+ hrs/week lost",
            borderColor: "group-hover:border-orange-500/30",
            bgGradient: "group-hover:from-orange-500/10"
        },
        {
            icon: <Clock className="w-5 h-5 text-red-500" />,
            title: "Late Payments",
            description: "Customers forget to renew, leading to service interruptions and churn.",
            stat: "15% revenue leakage",
            borderColor: "group-hover:border-red-500/30",
            bgGradient: "group-hover:from-red-500/10"
        },
        {
            icon: <TrendingDown className="w-5 h-5 text-yellow-500" />,
            title: "High Transaction Fees",
            description: "Traditional gateways eat up 3-5% of your margins plus FX fees.",
            stat: "3-5% margin loss",
            borderColor: "group-hover:border-yellow-500/30",
            bgGradient: "group-hover:from-yellow-500/10"
        },
        {
            icon: <Ban className="w-5 h-5 text-zinc-400" />,
            title: "Platform Risk",
            description: "Centralized exchanges can freeze your business account without warning.",
            stat: "Zero control",
            borderColor: "group-hover:border-zinc-500/30",
            bgGradient: "group-hover:from-zinc-500/10"
        },
    ];

    return (
        <section className="py-24 relative overflow-hidden bg-black">
            {/* Background Texture */}
            <div className="absolute inset-0 z-0 opacity-20"
                style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #333 1px, transparent 0)', backgroundSize: '40px 40px' }}>
            </div>

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

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
                            Most businesses running on crypto are stuck in 2015—manually checking Etherscan, chasing clients for renewals, and losing money to inefficiencies.
                        </p>

                        <div className="flex items-center gap-4 text-sm text-zinc-500">
                            <div className="flex -space-x-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-zinc-800 flex items-center justify-center text-xs">
                                        <ArrowDown className="w-3 h-3" />
                                    </div>
                                ))}
                            </div>
                            <p>It drags your business down.</p>
                        </div>
                    </motion.div>

                    {/* Right Column: Cards */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        {problems.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className={cn(
                                    "group relative p-6 rounded-2xl bg-zinc-900 border border-white/5 transition-all duration-300 hover:-translate-y-1",
                                    item.borderColor
                                )}
                            >
                                {/* Gradient Hover Bg */}
                                <div className={cn("absolute inset-0 rounded-2xl bg-gradient-to-br to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300", item.bgGradient)} />

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 rounded-lg bg-zinc-950 border border-white/5 flex items-center justify-center">
                                            {item.icon}
                                        </div>
                                        <span className="text-xs font-mono text-zinc-500 bg-black/50 px-2 py-1 rounded border border-white/5">
                                            {item.stat}
                                        </span>
                                    </div>

                                    <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                                    <p className="text-sm text-zinc-400 leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
