"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Code2,
    BrainCircuit,
    GitPullRequest,
    Activity,
    RefreshCw,
    Bell,
} from "lucide-react";
import GradientText from "@/components/ui/GradientText";

const features = [
    {
        title: "Self-Healing Code",
        description:
            "AI Research Agent (Gemini) analyzes errors and generates unified diff patches via GitHub PRs.",
        icon: <Code2 size={28} strokeWidth={1.5} />,
        accent: "#7C3AED",
    },
    {
        title: "RL Memory",
        description:
            "Reinforcement Learning-driven confidence scoring (Q-values) to ensure the agent only deploys proven fixes.",
        icon: <BrainCircuit size={28} strokeWidth={1.5} />,
        accent: "#059669",
    },
    {
        title: "Auto PR Generation",
        description:
            "Automatically creates Pull Requests on GitHub with human-readable diffs, descriptions, and test coverage reports.",
        icon: <GitPullRequest size={28} strokeWidth={1.5} />,
        accent: "#EC4899",
    },
    {
        title: "Anomaly Detection",
        description:
            "Machine-learning pattern recognition detects unusual spikes, latency degradation, and error rate surges.",
        icon: <Activity size={28} strokeWidth={1.5} />,
        accent: "#F59E0B",
    },
    {
        title: "Rollback Safety Net",
        description:
            "If a deployed fix degrades performance, the agent automatically reverts and escalates with full context.",
        icon: <RefreshCw size={28} strokeWidth={1.5} />,
        accent: "#EF4444",
    },
    {
        title: "Smart Alert Routing",
        description:
            "Routes only validated, high-severity alerts to the right on-call engineer — eliminating false-positive noise.",
        icon: <Bell size={28} strokeWidth={1.5} />,
        accent: "#06B6D4",
    },
];

export default function Features() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const total = features.length;
    const middle = Math.floor(total / 2);

    return (
        <section id="features" className="py-24 px-6">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-4">
                    <GradientText colors={["#ffffff", "#60a5fa", "#0070F3", "#60a5fa", "#ffffff"]} animationSpeed={6}>
                        Intelligent Capabilities
                    </GradientText>
                </h2>
                <p className="text-center text-muted mb-20 max-w-xl mx-auto">
                    DevOps Buddy learns from every incident to build a self-improving
                    remediation pipeline.
                </p>
            </div>

            {/* 3D Stacked card layout — desktop */}
            <div className="hidden md:block relative overflow-visible h-[380px]">
                <div className="flex -space-x-20 lg:-space-x-24 items-end justify-center pb-8 pt-24">
                    {features.map((feature, index) => {
                        const distanceFromMiddle = Math.abs(index - middle);
                        const staggerOffset = 100 - distanceFromMiddle * 18;

                        const isHovered = hoveredIndex === index;
                        const isOtherHovered = hoveredIndex !== null && hoveredIndex !== index;

                        const yOffset = isHovered ? -140 : isOtherHovered ? 15 : -staggerOffset;
                        const zIndex = isHovered ? 50 : total - distanceFromMiddle;
                        const scale = isHovered ? 1.05 : 1;

                        return (
                            <motion.div
                                key={index}
                                className="cursor-pointer flex-shrink-0"
                                style={{ zIndex }}
                                initial={{
                                    transform: `perspective(1200px) rotateY(-25deg) translateY(180px)`,
                                    opacity: 0,
                                }}
                                animate={{
                                    transform: `perspective(1200px) rotateY(-25deg) translateY(${yOffset}px) scale(${scale})`,
                                    opacity: 1,
                                }}
                                transition={{
                                    duration: 0.25,
                                    delay: index * 0.06,
                                    ease: [0.25, 0.1, 0.25, 1],
                                }}
                                onHoverStart={() => setHoveredIndex(index)}
                                onHoverEnd={() => setHoveredIndex(null)}
                            >
                                <div
                                    className="w-64 lg:w-72 rounded-2xl p-6 border transition-all duration-300"
                                    style={{
                                        background: "rgba(12, 12, 12, 0.95)",
                                        borderColor: isHovered
                                            ? `${feature.accent}60`
                                            : "rgba(255,255,255,0.08)",
                                        boxShadow: isHovered
                                            ? `0 0 40px ${feature.accent}30, 0 20px 60px rgba(0,0,0,0.6), rgba(0,0,0,0.25) 20px 0px 20px 0px`
                                            : `rgba(0,0,0,0.01) 0.8px 0px 0.8px, rgba(0,0,0,0.03) 2.4px 0px 2.4px, rgba(0,0,0,0.08) 6.4px 0px 6.4px, rgba(0,0,0,0.4) 20px 0px 20px`,
                                    }}
                                >
                                    <div
                                        className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                                        style={{
                                            background: `${feature.accent}15`,
                                            border: `1px solid ${feature.accent}30`,
                                            color: feature.accent,
                                        }}
                                    >
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm text-white/60 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Mobile: regular stacked vertical list */}
            <div className="flex md:hidden flex-col gap-5 max-w-sm mx-auto">
                {features.map((feature, i) => (
                    <div
                        key={i}
                        className="rounded-2xl p-7 border border-white/10"
                        style={{ background: "rgba(12,12,12,0.9)" }}
                    >
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                            style={{
                                background: `${feature.accent}15`,
                                border: `1px solid ${feature.accent}30`,
                                color: feature.accent,
                            }}
                        >
                            {feature.icon}
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                        <p className="text-sm text-white/60 leading-relaxed">{feature.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
