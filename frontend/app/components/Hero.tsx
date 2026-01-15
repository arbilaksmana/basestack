"use client";

import CryptoHero from "./ui/crypto-hero";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatedDashboard } from "./ui/animated-dashboard";

export function Hero() {
    const router = useRouter();

    return (
        <CryptoHero
            className="pb-32" // Add padding for brands at bottom
            logo={<></>} // Empty logo to avoid duplication with global Navbar
            title={
                <>
                    The Ultimate Payment Stack for {" "}
                    <Image
                        src="/assets/base.svg"
                        alt="Base"
                        width={180}
                        height={60}
                        className="inline-block h-[0.85em] w-auto align-baseline -mb-1 ml-4"
                    />
                </>
            }
            // subtitle="for your business with Crypto"
            badge={["Recurring", "Glocal Pricing", "Keeper Bot"]}
            description="Our complete payment solution with simple integration helps you reach more customers, reduce fraudulent transactions, and reconcile with ease."
            emailPlaceholder="Enter your business email"

            cryptoCoins={[]}
            walletImage={<AnimatedDashboard />}
            brands={[
                {
                    name: "Netflix",
                    logo: <img width="60" height="60" src="https://img.icons8.com/windows/60/FFFFFF/netflix.png" alt="netflix" />
                },
                {
                    name: "Amazon",
                    logo: <img width="60" height="60" src="https://img.icons8.com/windows/60/FFFFFF/amazon-web-services.png" alt="amazon-web-services" />

                },
                {
                    name: "Google",
                    logo: <img width="40" height="40" src="https://img.icons8.com/ios-glyphs/40/FFFFFF/google-logo--v1.png" alt="google-logo--v1" />
                },
                {
                    name: "Microsoft",
                    logo: <img width="40" height="40" src="https://img.icons8.com/ios-filled/40/FFFFFF/microsoft.png" alt="microsoft" />
                },
                // Tambahkan logo lainnya...
            ]}
        />
    );
}
