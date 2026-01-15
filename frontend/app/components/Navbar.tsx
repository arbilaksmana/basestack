"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Features", href: "#features" },
        { name: "Problems", href: "#problems" },
        { name: "How It Works", href: "#how-it-works" },
    ];

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (href.startsWith("#")) {
            e.preventDefault();
            const element = document.querySelector(href);
            if (element) {
                const offsetTop = element.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: "smooth"
                });
            }
            setIsMobileMenuOpen(false);
        }
    };

    return (
        <>
            <motion.header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "glass-nav py-4" : "bg-transparent py-6"
                    }`}
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <Image
                            src="/assets/logo.png"
                            alt="BaseStack Logo"
                            width={140}
                            height={10}
                            className="h-14 w-auto"
                        />
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-1 bg-white/5 rounded-full px-2 py-1 border border-white/10 backdrop-blur-md">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                onClick={(e) => handleNavClick(e, link.href)}
                                className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors relative cursor-pointer"
                            >
                                {link.name}
                            </a>
                        ))}
                    </nav>

                    <div className="hidden md:flex items-center gap-4 relative z-50">
                        <Link
                            href="/signup"
                            className="bg-green-500 hover:bg-green-400 text-black px-5 py-2 rounded-full text-sm font-bold transition-all transform hover:scale-105 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]"
                        >
                            Connect Wallet
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-white"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </motion.header>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed inset-0 z-40 bg-black pt-24 px-4 md:hidden"
                >
                    <div className="flex flex-col gap-6 text-center">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-2xl font-medium text-white"
                                onClick={(e) => handleNavClick(e, link.href)}
                            >
                                {link.name}
                            </a>
                        ))}
                        <div className="flex flex-col gap-4 mt-8">
                            <Link
                                href="/dashboard"
                                className="bg-green-500 text-black py-3 rounded-full text-lg font-bold"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Connect Wallet
                            </Link>
                        </div>
                    </div>
                </motion.div>
            )}
        </>
    );
}

