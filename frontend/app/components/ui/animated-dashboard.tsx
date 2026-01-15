"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Wallet, TrendingUp, CreditCard, Gem, ArrowUpRight, Bell } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";

// Animated counter hook
function useCounter(end: number, duration: number = 2000, delay: number = 0) {
    const [count, setCount] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => setHasStarted(true), delay);
        return () => clearTimeout(timeout);
    }, [delay]);

    useEffect(() => {
        if (!hasStarted) return;

        let startTime: number;
        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration, hasStarted]);

    return count;
}

// Notification type
interface Notification {
    id: number;
    amount: string;
    type: string;
    color: string;
}

export function AnimatedDashboard() {
    const balance = useCounter(24580, 2500, 500);
    const revenue = useCounter(12400, 2000, 800);
    const subs = useCounter(854, 1800, 1000);

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const notificationId = useRef(0);

    // Random notifications popping up
    useEffect(() => {
        const notifTypes = [
            { amount: "+$149.00", type: "USDC", color: "from-blue-500 to-blue-600" },
            { amount: "+Rp 2.5M", type: "IDRX", color: "from-green-500 to-emerald-600" },
            { amount: "+$89.00", type: "USDT", color: "from-teal-500 to-teal-600" },
            { amount: "+$299.00", type: "USDC", color: "from-blue-500 to-blue-600" },
            { amount: "+Rp 5M", type: "IDRX", color: "from-green-500 to-emerald-600" },
        ];

        const interval = setInterval(() => {
            const randomNotif = notifTypes[Math.floor(Math.random() * notifTypes.length)];
            const newNotif = {
                id: notificationId.current++,
                ...randomNotif
            };

            setNotifications(prev => [...prev.slice(-2), newNotif]);

            // Auto remove after 3 seconds
            setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
            }, 3000);
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    const transactions = [
        { token: "USDC", amount: "+$149.00", time: "2 mins ago", color: "text-blue-400", bg: "bg-blue-500/20", icon: "/assets/usdc.png" },
        { token: "IDRX", amount: "+Rp 2.5M", time: "15 mins ago", color: "text-green-400", bg: "bg-green-500/20", icon: "/assets/idrx.png" },
        { token: "USDT", amount: "+$89.00", time: "1 hour ago", color: "text-teal-400", bg: "bg-teal-500/20", icon: "/assets/usdt.png" },
    ];

    return (
        <div className="relative w-full max-w-sm mx-auto">
            {/* Floating Notifications */}
            <div className="absolute -top-4 -right-8 z-20 space-y-2">
                <AnimatePresence>
                    {notifications.map((notif) => (
                        <motion.div
                            key={notif.id}
                            initial={{ opacity: 0, x: 50, scale: 0.8 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 50, scale: 0.8 }}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r ${notif.color} text-white text-sm font-bold shadow-lg`}
                        >
                            <Bell className="w-3 h-3" />
                            <span>{notif.amount}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Main Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-3xl p-6 border border-white/10 shadow-2xl shadow-green-500/10"
                whileHover={{ scale: 1.02 }}
            >
                {/* Glow effect */}
                <motion.div
                    className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-3xl blur-xl"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                />

                <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                                <Wallet className="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                                <div className="text-xs text-zinc-500">Total Balance</div>
                                <div className="text-xl font-bold text-white">
                                    ${balance.toLocaleString()}.00
                                </div>
                            </div>
                        </div>
                        <motion.div
                            className="flex items-center gap-1 text-green-400 text-sm font-medium"
                            animate={{ y: [0, -3, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <TrendingUp className="w-4 h-4" />
                            +12.5%
                        </motion.div>
                    </div>

                    {/* Animated Line Chart */}
                    <div className="mb-6 h-16 relative overflow-hidden rounded-xl bg-white/5 p-3">
                        <svg className="w-full h-full" viewBox="0 0 200 40" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
                                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            {/* Area fill */}
                            <motion.path
                                d="M0,35 Q25,30 50,25 T100,20 T150,12 T200,8 L200,40 L0,40 Z"
                                fill="url(#chartGradient)"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 1, delay: 0.5 }}
                            />
                            {/* Line */}
                            <motion.path
                                d="M0,35 Q25,30 50,25 T100,20 T150,12 T200,8"
                                fill="none"
                                stroke="#22c55e"
                                strokeWidth="2"
                                strokeLinecap="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 2, delay: 0.3 }}
                            />
                            {/* Animated dot */}
                            <motion.circle
                                r="3"
                                fill="#22c55e"
                                initial={{ cx: 0, cy: 35 }}
                                animate={{ cx: 200, cy: 8 }}
                                transition={{ duration: 2, delay: 0.3 }}
                            />
                        </svg>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <motion.div
                            className="bg-white/5 p-4 rounded-2xl border border-white/5"
                            whileHover={{ scale: 1.05, borderColor: "rgba(34, 197, 94, 0.3)" }}
                        >
                            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center mb-3">
                                <CreditCard className="w-4 h-4 text-green-500" />
                            </div>
                            <div className="text-2xl font-bold text-white">
                                ${(revenue / 1000).toFixed(1)}k
                            </div>
                            <div className="text-xs text-zinc-500">Monthly Revenue</div>
                        </motion.div>
                        <motion.div
                            className="bg-white/5 p-4 rounded-2xl border border-white/5"
                            whileHover={{ scale: 1.05, borderColor: "rgba(59, 130, 246, 0.3)" }}
                        >
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                                <Gem className="w-4 h-4 text-blue-500" />
                            </div>
                            <div className="text-2xl font-bold text-white">{subs}</div>
                            <div className="text-xs text-zinc-500">Active Subs</div>
                        </motion.div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="space-y-3">
                        <div className="text-xs text-zinc-500 font-medium">Recent Transactions</div>
                        {transactions.map((tx, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1.5 + i * 0.2 }}
                                whileHover={{ scale: 1.02, x: 5 }}
                                className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 group hover:border-green-500/30 transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full overflow-hidden">
                                        <Image src={tx.icon} alt={tx.token} width={32} height={32} className="w-full h-full object-cover" />
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
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Floating tokens decoration */}
            <motion.div
                className="absolute -top-4 -left-4 w-16 h-16 rounded-2xl overflow-hidden"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
            >
                <Image src="/assets/usdc.png" alt="USDC" width={64} height={64} className="w-full h-full object-cover" />
            </motion.div>
            <motion.div
                className="absolute -bottom-4 -right-4 w-14 h-14 rounded-2xl overflow-hidden"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
            >
                <Image src="/assets/idrx.png" alt="IDRX" width={56} height={56} className="w-full h-full object-cover" />
            </motion.div>
            <motion.div
                className="absolute top-1/2 -right-8 w-12 h-12 rounded-xl overflow-hidden"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            >
                <Image src="/assets/usdt.png" alt="USDT" width={48} height={48} className="w-full h-full object-cover" />
            </motion.div>
        </div>
    );
}
