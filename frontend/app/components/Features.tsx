"use client";

import { Wallet, Shield, Zap, RefreshCw, Globe } from "lucide-react";
import { GlowingEffect } from "./ui/glowing-effect";
import { cn } from "@/app/utils/cn";
import { motion } from "framer-motion";
import Image from "next/image";

export function Features() {
    return (
        <section id="features" className="py-24 relative bg-black">
            {/* Simple Background Glow */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Powerful features for
                        <span className="text-zinc-500"> modern businesses</span>
                    </h2>
                    <p className="text-zinc-400">
                        Everything you need to accept recurring crypto payments and scale your business.
                    </p>
                </div>

                <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2">
                    {/* Multi-Currency Card - Special Design */}
                    <MultiCurrencyCard />

                    {/* Other Feature Cards */}
                    <GridItem
                        area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
                        icon={<Wallet className="h-4 w-4 text-black dark:text-neutral-400" />}
                        title="Auto-Renewal Engine"
                        description="Automated billing that never misses a payment."
                        image="/assets/card2.png"
                    />
                    <GridItem
                        area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]"
                        icon={<Shield className="h-4 w-4 text-black dark:text-neutral-400" />}
                        title="Non-Custodial"
                        description="You keep full control of your funds."
                        image="/assets/card3.png"
                    />
                    <GridItem
                        area="md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]"
                        icon={<Zap className="h-4 w-4 text-black dark:text-neutral-400" />}
                        title="Instant Settlement"
                        description="Funds settle directly to your wallet."
                        image="/assets/card4.png"
                    />
                    <GridItem
                        area="md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]"
                        icon={<Globe className="h-4 w-4 text-black dark:text-neutral-400" />}
                        title="Global Reach"
                        description="Accept payments from anywhere worldwide."
                        image="/assets/card5.png"
                    />
                </ul>
            </div>
        </section>
    );
}

// ===== SPECIAL MULTI-CURRENCY CARD =====
function MultiCurrencyCard() {
    return (
        <li className="min-h-[14rem] list-none md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]">
            <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-zinc-800 p-2 md:rounded-[1.5rem] md:p-3">
                <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    borderWidth={3}
                    variant="default"
                />
                <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-xl border-[0.75px] border-zinc-800 bg-zinc-900/50 p-6 shadow-sm md:p-6">
                    {/* Image with Glow Effect - Top Right */}
                    <div className="absolute top-2 right-2 w-28 h-28 md:w-36 md:h-36 pointer-events-none">
                        {/* Glow behind image */}
                        <div className="absolute inset-0 bg-green-500/30 blur-2xl rounded-full scale-75"></div>
                        <Image
                            src="/assets/card1.png"
                            alt="Multi-Currency"
                            width={144}
                            height={144}
                            className="relative w-full h-full object-contain drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                        />
                    </div>

                    {/* Content */}
                    <div className="relative flex flex-1 flex-col justify-between gap-3 z-10">
                        <div className="w-fit rounded-lg border-[0.75px] border-zinc-700 bg-zinc-800 p-2 text-white">
                            <RefreshCw className="h-4 w-4 text-neutral-400" />
                        </div>
                        <div className="space-y-3">
                            <h3 className="pt-0.5 text-xl leading-[1.375rem] font-semibold font-sans tracking-[-0.04em] md:text-2xl md:leading-[1.875rem] text-balance text-white">
                                Multi-Currency Support
                            </h3>
                            <h2 className="font-sans text-sm leading-[1.125rem] md:text-base md:leading-[1.375rem] text-zinc-400">
                                Accept IDRX, USDC & USDT seamlessly.
                            </h2>
                        </div>
                    </div>
                </div>
            </div>
        </li>
    );
}

// ===== REGULAR GRID ITEM =====
interface GridItemProps {
    area: string;
    icon: React.ReactNode;
    title: string;
    description: React.ReactNode;
    image?: string;
}

const GridItem = ({ area, icon, title, description, image }: GridItemProps) => {
    return (
        <li className={cn("min-h-[14rem] list-none", area)}>
            <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-zinc-800 p-2 md:rounded-[1.5rem] md:p-3">
                <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    borderWidth={3}
                    variant="default"
                />
                <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-[0.75px] border-zinc-800 bg-zinc-900/50 p-6 shadow-sm md:p-6">
                    {/* Optional Image with Glow Effect */}
                    {image && (
                        <div className="absolute top-2 right-2 w-28 h-28 md:w-36 md:h-36 pointer-events-none">
                            <div className="absolute inset-0 bg-green-500/30 blur-2xl rounded-full scale-75"></div>
                            <Image
                                src={image}
                                alt=""
                                width={144}
                                height={144}
                                className="relative w-full h-full object-contain drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                            />
                        </div>
                    )}

                    <div className="relative flex flex-1 flex-col justify-between gap-3 z-10">
                        <div className="w-fit rounded-lg border-[0.75px] border-zinc-700 bg-zinc-800 p-2 text-white">
                            {icon}
                        </div>
                        <div className="space-y-3">
                            <h3 className="pt-0.5 text-xl leading-[1.375rem] font-semibold font-sans tracking-[-0.04em] md:text-2xl md:leading-[1.875rem] text-balance text-white">
                                {title}
                            </h3>
                            <h2 className="[&_b]:md:font-semibold [&_strong]:md:font-semibold font-sans text-sm leading-[1.125rem] md:text-base md:leading-[1.375rem] text-zinc-400">
                                {description}
                            </h2>
                        </div>
                    </div>
                </div>
            </div>
        </li>
    );
};
