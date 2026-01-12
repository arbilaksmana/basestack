"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Twitter, Github, Linkedin } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-black text-zinc-400 py-16 border-t border-white/10">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-6 group">
                            <Image
                                src="/assets/logo.png"
                                alt="BaseStack Logo"
                                width={140}
                                height={10}
                                className="h-14 w-auto"
                            />
                        </Link>
                        <p className="text-sm leading-relaxed mb-6">
                            The complete recurring payment infrastructure for the Web3 economy on Base chain.
                        </p>
                        <div className="flex gap-4">
                            <SocialLink href="#" icon={<Twitter size={20} />} />
                            <SocialLink href="#" icon={<Github size={20} />} />
                            <SocialLink href="#" icon={<Linkedin size={20} />} />
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Product</h4>
                        <ul className="space-y-4 text-sm">
                            <FooterLink href="#">Features</FooterLink>
                            <FooterLink href="#">Integration</FooterLink>
                            <FooterLink href="#">Pricing</FooterLink>
                            <FooterLink href="#">Changelog</FooterLink>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Resources</h4>
                        <ul className="space-y-4 text-sm">
                            <FooterLink href="#">Documentation</FooterLink>
                            <FooterLink href="#">API Reference</FooterLink>
                            <FooterLink href="#">Community</FooterLink>
                            <FooterLink href="#">Help Center</FooterLink>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Legal</h4>
                        <ul className="space-y-4 text-sm">
                            <FooterLink href="#">Privacy Policy</FooterLink>
                            <FooterLink href="#">Terms of Service</FooterLink>
                            <FooterLink href="#">Cookie Policy</FooterLink>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
                    <p>© {new Date().getFullYear()} BaseStack. All rights reserved.</p>
                    <p>Designed for the future of payments.</p>
                </div>
            </div>
        </footer>
    );
}

function SocialLink({ href, icon }: { href: string; icon: React.ReactNode }) {
    return (
        <a
            href={href}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-green-500 hover:text-black transition-all"
        >
            {icon}
        </a>
    );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <li>
            <Link href={href} className="hover:text-green-400 transition-colors">
                {children}
            </Link>
        </li>
    );
}
