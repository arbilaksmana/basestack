'use client';

import { OnchainKitProvider } from '@coinbase/onchainkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { baseSepolia } from 'wagmi/chains';
import { type ReactNode, useState } from 'react';
import { http, createConfig, WagmiProvider } from 'wagmi';
import { coinbaseWallet, injected } from 'wagmi/connectors';

export function Providers(props: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    const wagmiConfig = createConfig({
        chains: [baseSepolia],
        connectors: [
            injected(),
            coinbaseWallet({
                appName: 'BaseStack',
            }),
        ],
        transports: {
            [baseSepolia.id]: http(),
        },
    });

    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                <OnchainKitProvider
                    apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
                    chain={baseSepolia}
                    config={{
                        appearance: {
                            mode: 'dark',
                            theme: 'default',
                        },
                    }}
                >
                    {props.children}
                </OnchainKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
