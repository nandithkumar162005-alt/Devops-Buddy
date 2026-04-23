"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

export default function Hero() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const router = useRouter();
    const { isSignedIn } = useAuth();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationId: number;
        const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        for (let i = 0; i < 40; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.2 - 0.1,
                size: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.6 + 0.2,
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
                ctx.fill();
            });

            animationId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener("resize", resize);
        };
    }, []);

    const handleGetStarted = () => {
        if (!isSignedIn) {
            // Not signed in — send to sign-in first
            router.push("/sign-in");
        } else {
            // Already signed in — go to dashboard
            router.push("/dashboard");
        }
    };

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Subtle White Particle Overlay constrained to hero */}
            <canvas ref={canvasRef} className="absolute inset-0 z-[1] pointer-events-none" />

            <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight tracking-tight drop-shadow-2xl"
                    style={{
                        background: "linear-gradient(135deg, #ffffff 0%, #60a5fa 50%, #0070F3 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                    }}
                >
                    DevOps Buddy
                </h1>

                <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-md">
                    The self-learning, autonomous infrastructure remediation agent that
                    detects, researches, and fixes production errors before they impact
                    users.{" "}
                    <span className="text-white font-medium drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
                        Powered by Reinforcement Learning.
                    </span>
                </p>

                <button
                    onClick={handleGetStarted}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/30 text-white font-semibold text-lg hover:bg-white/20 hover:border-white/50 transition-all hover:scale-105 active:scale-95 shadow-[0_8px_32px_rgba(0,0,0,0.3)] cursor-pointer"
                >
                    Get Started
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </button>

                {/* Scroll chevron */}
                <div className="mt-16 animate-bounce-slow">
                    <svg className="mx-auto text-white/50" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 9l6 6 6-6" />
                    </svg>
                </div>
            </div>
        </section>
    );
}
