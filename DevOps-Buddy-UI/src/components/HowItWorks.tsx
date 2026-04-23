"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, BrainCircuit, GitPullRequest, Rocket, ChevronRight, Terminal, Cpu, CheckCircle2 } from "lucide-react";
import GradientText from "@/components/ui/GradientText";
import SpotlightCard from "@/components/ui/SpotlightCard";
import BorderGlow from "@/components/ui/BorderGlow";

const steps = [
    {
        id: "detection",
        title: "Detection & Ingestion",
        shortDesc: "Monitors CloudWatch logs and intercepts errors before users report them.",
        icon: <Search size={24} />,
        color: "#0070F3",
        insight: {
            label: "Real-time Stream",
            content: "Monitoring 5,000+ logs per second across 12 services. Noise filter accuracy: 99.8%.",
            snippet: "filter(log => log.level === 'ERROR' && !isNoise(log))",
        }
    },
    {
        id: "analysis",
        title: "AI Analysis",
        shortDesc: "Agent analyzes stack traces, filters noise, and identifies root causes.",
        icon: <BrainCircuit size={24} />,
        color: "#7C3AED",
        insight: {
            label: "Reasoning Engine",
            content: "Gemini 1.5 Pro identifies symbolic patterns in stack traces to pinpoint the exact line of failure.",
            snippet: "analyze_root_cause(stack_trace, knowledge_graph)",
        }
    },
    {
        id: "patching",
        title: "Patch Generation",
        shortDesc: "Writes the fix, ensures it passes tests, and opens a GitHub PR.",
        icon: <GitPullRequest size={24} />,
        color: "#EC4899",
        insight: {
            label: "Auto-Migration",
            content: "Generating contextual patches with 85% first-pass test success rate.",
            snippet: "git commit -m 'AI: Fix null pointer in auth.ts'",
        }
    },
    {
        id: "deployment",
        title: "Deployment & RL",
        shortDesc: "RL Engine validates the fix against historical data and merges.",
        icon: <Rocket size={24} />,
        color: "#10B981",
        insight: {
            label: "Verification",
            content: "Q-value verification ensures new code doesn't degrade performance metrics.",
            snippet: "reward = validate_deployment(q_value, metrics)",
        }
    },
];

export default function HowItWorks() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (isHovered) return;

        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % steps.length);
        }, 500);

        return () => clearInterval(interval);
    }, [isHovered]);

    return (
        <section id="how-it-works" className="py-24 px-6 relative overflow-hidden">
            {/* Background interactive grid */}
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
                <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                        <GradientText colors={["#c084fc", "#60a5fa", "#34d399", "#60a5fa", "#c084fc"]} animationSpeed={5}>
                            How It Works
                        </GradientText>
                    </h2>
                    <p className="text-white/40 text-center max-w-xl mx-auto">
                        An autonomous remediation pipeline designed for modern cloud infrastructure.
                    </p>
                </div>

                {/* Laser Flow Path (Desktop) */}
                <div className="hidden lg:block relative h-24 mb-12">
                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                        <path d="M 5% 50 L 95% 50" stroke="rgba(255,255,255,0.05)" strokeWidth="2" fill="none" />
                        <motion.path
                            d="M 5% 50 L 95% 50"
                            stroke="url(#laserGradient)"
                            strokeWidth="3"
                            fill="none"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                        <defs>
                            <linearGradient id="laserGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="transparent" />
                                <stop offset="50%" stopColor="#0070F3" />
                                <stop offset="100%" stopColor="transparent" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* Pulsing Step Indicators */}
                    <div className="absolute inset-0 flex justify-between items-center px-[10%]">
                        {steps.map((_, idx) => (
                            <motion.div
                                key={idx}
                                className={`w-4 h-4 rounded-full z-20 border-2 transition-colors duration-500 ${idx <= activeIndex ? 'bg-white border-white' : 'bg-black border-white/20'}`}
                                animate={idx === activeIndex ? { scale: [1, 1.5, 1], boxShadow: ["0 0 0px #fff", "0 0 20px #fff", "0 0 0px #fff"] } : {}}
                                transition={{ repeat: Infinity, duration: 2 }}
                            />
                        ))}
                    </div>
                </div>

                {/* Interactive Cards Grid */}
                <div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {steps.map((step, idx) => (
                        <div key={step.id} onClick={() => setActiveIndex(idx)} className="cursor-pointer h-full">
                            <BorderGlow
                                edgeSensitivity={30}
                                glowColor={`${step.color}80`}
                                borderRadius={24}
                                glowRadius={30}
                                colors={[step.color, '#ffffff', step.color]}
                                className="h-full"
                            >
                                <SpotlightCard
                                    spotlightColor={`${step.color}66`}
                                    className={`h-full transition-all duration-500 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] ${activeIndex === idx ? 'border-white/40 ring-1 ring-white/20' : 'opacity-80 hover:opacity-100'}`}
                                >
                                    <div className="p-6 h-full flex flex-col relative z-20">
                                        <div className="flex items-center justify-between mb-6">
                                            <div
                                                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                                                style={{ background: `linear-gradient(135deg, ${step.color}40, ${step.color}10)`, border: `1px solid ${step.color}60`, color: step.color }}
                                            >
                                                {step.icon}
                                            </div>
                                            <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase">Phase 0{idx + 1}</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-3 tracking-wide">{step.title}</h3>
                                        <p className="text-sm text-white/70 leading-relaxed flex-grow">{step.shortDesc}</p>
                                    </div>
                                </SpotlightCard>
                            </BorderGlow>
                        </div>
                    ))}
                </div>


            </div>
        </section>
    );
}
