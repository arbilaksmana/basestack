"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues with WebGL
const FaultyTerminal = dynamic(() => import("./ui/faulty-terminal"), {
    ssr: false,
    loading: () => <div className="absolute inset-0 bg-zinc-900" />
});

export function CTA() {
    return (
        <section className="py-24 relative overflow-hidden bg-black">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative bg-zinc-900/80 border border-white/10 rounded-[3rem] p-8 md:p-20 text-center overflow-hidden"
                >
                    {/* FaultyTerminal Background */}
                    <div className="absolute inset-0 opacity-30">
                        <FaultyTerminal
                            digitSize={1.0}
                            tint="#22c55e"
                            brightness={0.4}
                            scanlineIntensity={0.6}
                            curvature={0.2}
                            mouseReact={true}
                            pageLoadAnimation={true}
                        />
                    </div>

                    {/* Inner Gradients */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent pointer-events-none" />
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent opacity-50" />
                    <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />

                    <div className="relative z-10 max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium mb-8">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Start accepting crypto today
                        </div>

                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
                            Ready to automate your <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">revenue stream?</span>
                        </h2>

                        <p className="text-zinc-400 text-lg md:text-xl mb-10 leading-relaxed">
                            Join forward-thinking businesses scaling with BaseStack. Set up your first subscription plan in minutes.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                            <Link
                                href="/signup"
                                className="w-full sm:w-auto bg-green-500 text-black px-8 py-4 rounded-full text-base font-bold transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] flex items-center justify-center gap-2 group"
                            >
                                Get Started Free
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="/contact"
                                className="w-full sm:w-auto bg-white/5 text-white border border-white/10 px-8 py-4 rounded-full text-base font-medium transition-all hover:bg-white/10"
                            >
                                Contact Sales
                            </Link>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-zinc-500">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span>No credit card required</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span>Cancel anytime</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span>24/7 Support</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
