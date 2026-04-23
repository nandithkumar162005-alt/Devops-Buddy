"use client";

import React from "react";
import { AlertCircle, CheckCircle2, Zap, Clock, ShieldCheck, Activity } from "lucide-react";
import BorderGlow from "@/components/ui/BorderGlow";
import GradientText from "@/components/ui/GradientText";

export default function ProblemSolution() {
    return (
        <section id="problem-solution" className="py-24 px-6 border-t border-white/5 relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#0070F3]/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
                        <GradientText colors={["#ef4444", "#f97316", "#ffffff", "#60a5fa", "#0070F3", "#60a5fa", "#ffffff", "#f97316", "#ef4444"]} animationSpeed={8}>
                            The Cost of Downtime vs. The DevOps Buddy Future
                        </GradientText>
                    </h2>
                    <p className="text-lg text-white/60 max-w-2xl mx-auto">
                        Traditional incident management is slow, manual, and stressful. We replace PagerDuty nightmares with an autonomous agent that fixes issues before you even wake up.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
                    {/* Problem Side */}
                    <div className="transition-transform duration-300 hover:-translate-y-2">
                        <BorderGlow
                            backgroundColor="#0d0808"
                            borderRadius={24}
                            glowColor="0 80 60"
                            glowRadius={35}
                            glowIntensity={1.2}
                            edgeSensitivity={25}
                            coneSpread={30}
                            colors={['#ef4444', '#f97316', '#dc2626']}
                            fillOpacity={0.4}
                            className="h-full"
                        >
                            <div className="p-8 h-full">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                                        <AlertCircle size={24} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500">The Old Way</h3>
                                </div>

                                <ul className="space-y-6">
                                    <li className="flex items-start gap-4">
                                        <div className="mt-1 min-w-[24px] text-red-400">
                                            <Clock size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-medium mb-1">Slow Response Times</h4>
                                            <p className="text-white/50 text-sm">Engineers must be paged, wake up, open laptops, and manually trace logs.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <div className="mt-1 min-w-[24px] text-red-400">
                                            <Activity size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-medium mb-1">Alert Fatigue</h4>
                                            <p className="text-white/50 text-sm">Hundreds of false positives bury the actual critical issues.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <div className="mt-1 min-w-[24px] text-red-400">
                                            <ShieldCheck className="opacity-70" size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-medium mb-1">Manual Hotfixes</h4>
                                            <p className="text-white/50 text-sm">Error-prone manual patches pushed directly to production under pressure.</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </BorderGlow>
                    </div>

                    {/* Solution Side */}
                    <div className="transition-transform duration-300 hover:-translate-y-2">
                        <BorderGlow
                            backgroundColor="#080d1a"
                            borderRadius={24}
                            glowColor="210 80 60"
                            glowRadius={35}
                            glowIntensity={1.2}
                            edgeSensitivity={25}
                            coneSpread={30}
                            colors={['#0070F3', '#38bdf8', '#6366f1']}
                            fillOpacity={0.4}
                            className="h-full"
                        >
                            <div className="p-8 h-full">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 rounded-full bg-[#0070F3]/30 border border-[#0070F3]/50 flex items-center justify-center text-blue-300 shadow-[0_0_30px_rgba(0,112,243,0.5)]">
                                        <Zap size={24} fill="currentColor" className="text-[#0070F3]" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#0070F3] to-blue-300">The DevOps Buddy Way</h3>
                                </div>

                                <ul className="space-y-6">
                                    <li className="flex items-start gap-4">
                                        <div className="mt-1 min-w-[24px] text-[#0070F3]">
                                            <CheckCircle2 size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-medium mb-1">Autonomous Triage</h4>
                                            <p className="text-white/70 text-sm leading-relaxed">Agent instantly parses logs, filters noise, and identifies the exact root cause in seconds.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <div className="mt-1 min-w-[24px] text-[#0070F3]">
                                            <CheckCircle2 size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-medium mb-1">Self-Healing Infrastructure</h4>
                                            <p className="text-white/70 text-sm leading-relaxed">Automatically researches the error, generates the fix, and opens a perfect Pull Request.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <div className="mt-1 min-w-[24px] text-[#0070F3]">
                                            <CheckCircle2 size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-medium mb-1">Continuous Learning</h4>
                                            <p className="text-white/70 text-sm leading-relaxed">Uses Reinforcement Learning to build a knowledge graph, ensuring it never hits the same bug twice.</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </BorderGlow>
                    </div>
                </div>
            </div>
        </section>
    );
}
