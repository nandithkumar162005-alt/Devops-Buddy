"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface SpotlightCardProps {
    children: React.ReactNode;
    className?: string;
    spotlightColor?: string;
}

export default function SpotlightCard({
    children,
    className = "",
    spotlightColor = "rgba(255, 255, 255, 0.1)",
}: SpotlightCardProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Mouse position relative to the container
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth movement
    const smoothX = useSpring(mouseX, { damping: 20, stiffness: 150 });
    const smoothY = useSpring(mouseY, { damping: 20, stiffness: 150 });

    // 3D rotation based on mouse position
    const rotateX = useTransform(smoothY, [-0.5, 0.5], [5, -5]);
    const rotateY = useTransform(smoothX, [-0.5, 0.5], [-5, 5]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();

        // Calculate normalized mouse position (-0.5 to 0.5)
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        mouseX.set(x);
        mouseY.set(y);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    return (
        <motion.div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                perspective: 1000,
                rotateX,
                rotateY,
            }}
            className={`relative group rounded-2xl border border-white/5 bg-[#0a0a0a] overflow-hidden ${className}`}
        >
            {/* Spotlight Gradient */}
            <motion.div
                className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                style={{
                    background: useTransform(
                        [smoothX, smoothY],
                        ([x, y]) => {
                            // Convert normalized pos back to %
                            const xp = ((x as number) + 0.5) * 100;
                            const yp = ((y as number) + 0.5) * 100;
                            return `radial-gradient(600px circle at ${xp}% ${yp}%, ${spotlightColor}, transparent 40%)`;
                        }
                    ),
                }}
            />

            {/* Gloss reflection overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none z-0 opacity-50 group-hover:opacity-80 transition-opacity" />

            <div className="relative z-20 h-full">
                {children}
            </div>
        </motion.div>
    );
}
