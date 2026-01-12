"use client";

import { useState, useEffect } from "react";

interface SplineViewerProps {
    scene: string;
    className?: string;
}

export function SplineViewer({ scene, className = "" }: SplineViewerProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return (
            <div className={`w-full h-full flex items-center justify-center ${className}`}>
                <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // Convert splinecode URL to embed URL
    // From: https://prod.spline.design/Tw642Ng-WSJeu3NO/scene.splinecode
    // To: https://my.spline.design/Tw642Ng-WSJeu3NO/
    const embedUrl = scene
        .replace('prod.spline.design', 'my.spline.design')
        .replace('/scene.splinecode', '/');

    return (
        <iframe
            src={embedUrl}
            frameBorder="0"
            width="100%"
            height="100%"
            className={className}
            style={{
                border: 'none',
                background: 'transparent',
            }}
            allow="autoplay; fullscreen; xr-spatial-tracking"
            allowFullScreen
        />
    );
}
