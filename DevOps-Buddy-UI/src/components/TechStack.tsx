"use client";

import React from "react";
import GradientText from "@/components/ui/GradientText";

const techStack = [
    {
        name: "n8n",
        logo: (
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="14" fill="#EA4B71" />
                <path d="M8 20V12l4 4 4-4v8M20 12v8l4-4 4 4V12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        name: "PostgreSQL",
        logo: (
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="14" fill="#336791" />
                <path d="M22.5 22c.3-1.5 0-2.6-.7-3.1l-.2-.1c1-.4 2.4-1.8 2.8-3.5.4-2-.3-3.7-.3-3.7s-.5-1.7-2-3a7.3 7.3 0 0 0-3.8-1.8c-1.5-.2-2.8.1-3.8.7-.5-.1-1.1-.2-1.7-.1-1.5.1-2.7.7-3.4 1.7-.8 1.2-.8 2.8-.5 4.6.3 1.5.7 3.1 1.3 4.6.6 1.4 1.5 2.6 2.6 2.6.4 0 .9-.2 1.2-.6.3.4.8.6 1.4.6h.1c-.1.5-.1 1 0 1.4.2.7.6 1.2 1.2 1.4h.3c.7 0 1.4-.5 2.1-1.5.4-.6.7-1.2 1-1.8h.2c.9 0 1.6-.3 2.2-1" stroke="white" strokeWidth="1" strokeLinecap="round" fill="none" />
                <ellipse cx="19" cy="12" rx="1" ry="1.2" fill="white" />
            </svg>
        ),
    },
    {
        name: "Supabase",
        logo: (
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="14" fill="#3ECF8E" />
                <path d="M17.2 24.6c-.4.6-1.4.3-1.4-.5l-.2-6.4h7.2c1.1 0 1.7 1.3 1 2.1l-6.6 4.8z" fill="white" />
                <path d="M14.8 7.4c.4-.6 1.4-.3 1.4.5l.2 6.4H9.2c-1.1 0-1.7-1.3-1-2.1l6.6-4.8z" fill="white" fillOpacity="0.7" />
            </svg>
        ),
    },
    {
        name: "Gemini",
        logo: (
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="14" fill="#4285F4" />
                <path d="M16 6C16 14.5 22 16 26 16C22 16 16 17.5 16 26C16 17.5 10 16 6 16C10 16 16 14.5 16 6Z" fill="white" />
            </svg>
        ),
    },
    {
        name: "GitHub",
        logo: (
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="14" fill="#24292e" />
                <path d="M16 6a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34a2.65 2.65 0 0 0-1.11-1.46c-.91-.62.07-.61.07-.61a2.1 2.1 0 0 1 1.53 1.03 2.13 2.13 0 0 0 2.91.83 2.13 2.13 0 0 1 .64-1.34c-2.22-.25-4.56-1.11-4.56-4.94a3.87 3.87 0 0 1 1.03-2.68 3.6 3.6 0 0 1 .1-2.65s.84-.27 2.75 1.03a9.48 9.48 0 0 1 5.02 0c1.91-1.3 2.75-1.03 2.75-1.03a3.6 3.6 0 0 1 .1 2.65 3.87 3.87 0 0 1 1.03 2.68c0 3.84-2.34 4.69-4.57 4.93a2.39 2.39 0 0 1 .68 1.86v2.75c0 .27.18.58.69.48A10 10 0 0 0 16 6z" fill="white" />
            </svg>
        ),
    },
    {
        name: "Tailwind CSS",
        logo: (
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="14" fill="#0EA5E9" />
                <path d="M10.4 14.4c.8-3.2 3-4.8 6.4-4.8 5.1 0 5.7 3.8 8.2 4.4 1.7.4 3.1-.2 4.4-1.8-.8 3.2-3 4.8-6.4 4.8-5.1 0-5.7-3.8-8.2-4.4-1.7-.4-3.1.2-4.4 1.8z" fill="white" fillOpacity="0.9" />
                <path d="M4.4 20.4c.8-3.2 3-4.8 6.4-4.8 5.1 0 5.7 3.8 8.2 4.4 1.7.4 3.1-.2 4.4-1.8-.8 3.2-3 4.8-6.4 4.8-5.1 0-5.7-3.8-8.2-4.4-1.7-.4-3.1.2-4.4 1.8z" fill="white" fillOpacity="0.6" />
            </svg>
        ),
    },
    {
        name: "Next.js",
        logo: (
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="14" fill="#000" />
                <path d="M13 21V11l9.5 13c.4-.3.7-.6 1-.9L14.2 11H13v10z" fill="white" />
                <path d="M20 11v6.5l-1-1.4V11h1z" fill="white" />
                <circle cx="16" cy="16" r="9" stroke="white" strokeWidth="1.2" fill="none" />
            </svg>
        ),
    },
    {
        name: "AWS CloudWatch",
        logo: (
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="14" fill="#FF9900" />
                <path d="M10 20L14 12L18 18L22 14L26 20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <circle cx="14" cy="12" r="1.5" fill="white" />
                <circle cx="22" cy="14" r="1.5" fill="white" />
            </svg>
        ),
    },
];

// Duplicate 3x for seamless loop
const marqueeItems = [...techStack, ...techStack, ...techStack];

export default function TechStack() {
    return (
        <section id="tech-stack" className="py-24 px-6 border-t border-border">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-4">
                    <GradientText colors={["#f472b6", "#0070F3", "#a78bfa", "#0070F3", "#f472b6"]} animationSpeed={7}>
                        Tech Stack
                    </GradientText>
                </h2>
                <p className="text-center text-muted mb-16 max-w-md mx-auto">
                    Built on battle-tested, modern technologies for unmatched reliability.
                </p>
            </div>

            {/* Horizontal marquee - continuous scroll */}
            <div className="relative overflow-hidden">
                {/* Fade edges */}
                <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none" />

                <div className="flex items-center gap-16 w-max animate-marquee">
                    {marqueeItems.map((tech, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-3 shrink-0"
                        >
                            <div className="shrink-0">{tech.logo}</div>
                            <span className="text-sm text-white font-bold tracking-wide whitespace-nowrap">
                                {tech.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
