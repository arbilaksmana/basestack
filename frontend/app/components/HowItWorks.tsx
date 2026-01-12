"use client";

import { motion } from "framer-motion";
import { Copy, Check, ArrowRight, Code2, Rocket, CreditCard } from "lucide-react";
import { cn } from "@/app/utils/cn";

export function HowItWorks() {
    const steps = [
        {
            id: 1,
            title: "Create Subscription Plan",
            description: "Define pricing, billing interval, and accepted tokens (USDC, USDT, IDRX).",
            icon: <Code2 className="w-5 h-5" />,
            visual: (
                <div className="bg-zinc-950 rounded-lg p-3 border border-white/5 font-mono text-xs text-zinc-400">
                    <div className="flex gap-2 mb-2">
                        <span className="text-purple-400">const</span>
                        <span className="text-blue-400">plan</span>
                        <span className="text-zinc-500">=</span>
                        <span className="text-yellow-400">{"{"}</span>
                    </div>
                    <div className="pl-4">
                        <p>name: <span className="text-green-400">"Pro Plan"</span>,</p>
                        <p>price: <span className="text-orange-400">50</span>,</p>
                        <p>currency: <span className="text-green-400">"USDC"</span>,</p>
                        <p>interval: <span className="text-green-400">"monthly"</span></p>
                    </div>
                    <div className="text-yellow-400">{"}"}</div>
                </div>
            )
        },
        {
            id: 2,
            title: "Share Payment Link",
            description: "Get a hosted checkout page instantly or embed the payment button on your site.",
            icon: <Rocket className="w-5 h-5" />,
            visual: (
                <div className="bg-zinc-900 rounded-lg p-4 border border-white/5 flex flex-col gap-3">
                    <div className="flex items-center gap-2 bg-black/50 p-2 rounded border border-white/5">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-[10px] text-zinc-500 truncate">basestack.com/pay/pro-plan</span>
                        <Copy className="w-3 h-3 text-zinc-600 ml-auto" />
                    </div>
                    <button className="w-full bg-green-500 text-black text-xs font-bold py-2 rounded flex items-center justify-center gap-2">
                        Subscribe Now <ArrowRight className="w-3 h-3" />
                    </button>
                </div>
            )
        },
        {
            id: 3,
            title: "Automated Collections",
            description: "Funds settle directly to your wallet. We handle retries and renewals.",
            icon: <CreditCard className="w-5 h-5" />,
            visual: (
                <div className="bg-zinc-900 rounded-lg p-3 border border-white/5">
                    <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                        <div className="text-[10px] text-zinc-500">New Payment</div>
                        <div className="text-[10px] text-green-400 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Succeeded
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-[10px] font-bold">U</div>
                            <span className="text-xs text-white">USDC</span>
                        </div>
                        <span className="text-sm font-bold text-white">+$50.00</span>
                    </div>
                </div>
            )
        }
    ];

    return (
        <section className="py-24 relative bg-black overflow-hidden">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent z-0"></div>

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-sm font-medium mb-6">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        3 Simple Steps
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Start collecting crypto <br /> in <span className="text-green-500">under 5 minutes</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className="relative"
                        >
                            {/* Step Number Badge */}
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-black border border-green-500/50 text-green-500 flex items-center justify-center font-bold text-sm z-10 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                                {step.id}
                            </div>

                            <div className="group h-full p-1 rounded-2xl bg-gradient-to-b from-white/10 to-transparent hover:from-green-500/20 transition-colors duration-500">
                                <div className="h-full bg-zinc-950 rounded-xl p-6 border border-white/5 relative overflow-hidden">
                                    {/* Hover Light Effect */}
                                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-green-500/10 blur-[60px] rounded-full group-hover:bg-green-500/20 transition-colors duration-500 pointer-events-none"></div>

                                    <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-white mb-6 group-hover:scale-110 group-hover:border-green-500/30 transition-all duration-300 relative z-10">
                                        {step.icon}
                                    </div>

                                    <div className="mb-6 relative z-10">
                                        <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                                        <p className="text-sm text-zinc-400 leading-relaxed">
                                            {step.description}
                                        </p>
                                    </div>

                                    {/* Visual Mini-Mockup */}
                                    <div className="mt-auto pt-4 relative z-10 opacity-80 group-hover:opacity-100 transition-opacity">
                                        {step.visual}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
