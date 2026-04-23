"use client";

import Hero from "@/components/Hero";
import ProblemSolution from "@/components/ProblemSolution";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import TechStack from "@/components/TechStack";
import Silk from "@/components/Silk";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      {/* Global Fixed Silk Background */}
      <div className="fixed inset-0 z-[-1]">
        <Silk
          speed={7}
          scale={1.2}
          color="#004ce6"
          noiseIntensity={2.5}
          rotation={0.2}
        />
        {/* Subtle dark overlay for text readability across the whole page */}
        <div className="absolute inset-0 bg-black/30 z-[1]" />
      </div>

      <Hero />
      <ProblemSolution />
      <Features />
      <HowItWorks />
      <TechStack />

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10 text-center bg-white/5 backdrop-blur-md">
        <p className="text-sm text-white/70">
          &copy; 2026 DevOps Buddy. Built for the Agentathon.
        </p>
        <p className="text-xs text-white/50 mt-2">
          Powered by n8n &bull; Supabase &bull; Gemini &bull; Next.js
        </p>
      </footer>
    </main>
  );
}
