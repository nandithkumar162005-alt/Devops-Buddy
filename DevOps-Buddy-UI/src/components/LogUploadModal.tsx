"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    GitBranch, KeyRound, FileCode2, ScrollText,
    X, Loader2, CheckCircle2, ExternalLink,
    Zap, AlertCircle, ChevronRight
} from "lucide-react";

interface FixResult {
    success: boolean;
    source?: string;
    logSource?: string;
    prUrl?: string;
    prNumber?: number;
    fixBranch?: string;
    rootCause?: string;
    fixMethod?: string;
    aiIterations?: number;
    aiConfidence?: number;
    qValue?: number;
    decisionLabel?: string;
    steps?: { step: string; detail: string; time: string }[];
    error?: string;
}

type Stage = "idle" | "running" | "done" | "error";

export default function RunFixModal() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [stage, setStage] = useState<Stage>("idle");
    const [result, setResult] = useState<FixResult | null>(null);
    const [liveStep, setLiveStep] = useState("");

    // Form fields
    const [repo, setRepo] = useState("");
    const [branch, setBranch] = useState("main");
    const [filePath, setFilePath] = useState("");
    const [token, setToken] = useState("");
    const [commitMsg, setCommitMsg] = useState("");
    const [showToken, setShowToken] = useState(false);

    useEffect(() => {
        const handleOpen = () => {
            setIsOpen(true);
            setStage("idle");
            setResult(null);
            setLiveStep("");
        };
        window.addEventListener("open-log-upload", handleOpen);
        return () => window.removeEventListener("open-log-upload", handleOpen);
    }, []);

    const close = () => {
        setIsOpen(false);
        setStage("idle");
        setResult(null);
        setLiveStep("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!repo || !branch || !filePath) return;

        setStage("running");
        setLiveStep("🔑 Hashing error fingerprint...");

        try {
            // Animate through steps while waiting
            const stepMessages = [
                "🔍 Auto-discovering error log from GitHub...",
                "📊 Checking GitHub Actions for failed runs...",
                "🗄️ Scanning common log file paths...",
                "🔑 Hashing error fingerprint...",
                "🗄️ Checking database for known fixes...",
                "📥 Fetching broken file from GitHub...",
                "🤖 Running Gemini AI reflexive loop...",
                "🔁 Reflection pass — refining fix...",
                "🚀 Pushing fix to GitHub...",
                "📬 Creating Pull Request...",
            ];
            let si = 0;
            const stepTimer = setInterval(() => {
                si = (si + 1) % stepMessages.length;
                setLiveStep(stepMessages[si]);
            }, 2500);

            const res = await fetch(`/api/fix`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    repo, branch, filePath,
                    token: token || undefined,
                    commitMessage: commitMsg || undefined,
                }),
            });

            clearInterval(stepTimer);
            const data: FixResult = await res.json();

            setResult(data);
            setStage(data.success ? "done" : "error");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Unknown error";
            setResult({ success: false, error: message });
            setStage("error");
        }
    };

    if (!isOpen) return null;

    const inputClass =
        "w-full bg-white/[0.04] border border-white/[0.10] rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-[#0070F3]/50 transition-all";

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={close}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="relative w-full max-w-2xl mx-4 rounded-2xl bg-[#060d1a] border border-[#0070F3]/40 shadow-[0_0_60px_rgba(0,112,243,0.3)] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Top accent */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#0070F3] to-transparent" />

                {/* Header */}
                <div className="flex items-center gap-3 p-6 border-b border-white/[0.08]">
                    <div className="w-9 h-9 rounded-xl bg-[#0070F3]/20 border border-[#0070F3]/30 flex items-center justify-center shadow-[0_0_20px_rgba(0,112,243,0.3)]">
                        <Zap size={16} className="text-[#0070F3]" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-white">Run DevOps Buddy Fix</h2>
                        <p className="text-xs text-white/40">Fetches file from GitHub · Gemini AI · Reflexive Loop · Auto PR</p>
                    </div>
                    <button onClick={close} className="ml-auto text-white/30 hover:text-white/70 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 max-h-[80vh] overflow-y-auto">
                    <AnimatePresence mode="wait">

                        {/* ── IDLE: Input Form ── */}
                        {stage === "idle" && (
                            <motion.form
                                key="form"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onSubmit={handleSubmit}
                                className="space-y-5"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Repo */}
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] uppercase tracking-widest text-white/50 font-bold flex items-center gap-1.5">
                                            <GitBranch size={11} className="text-[#0070F3]" /> Repository
                                        </label>
                                        <input
                                            required
                                            value={repo}
                                            onChange={(e) => setRepo(e.target.value)}
                                            placeholder="owner/repo"
                                            className={inputClass}
                                        />
                                    </div>

                                    {/* Branch */}
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] uppercase tracking-widest text-white/50 font-bold flex items-center gap-1.5">
                                            <GitBranch size={11} className="text-[#0070F3]" /> Branch
                                        </label>
                                        <input
                                            required
                                            value={branch}
                                            onChange={(e) => setBranch(e.target.value)}
                                            placeholder="main"
                                            className={inputClass}
                                        />
                                    </div>

                                    {/* File Path */}
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-[11px] uppercase tracking-widest text-white/50 font-bold flex items-center gap-1.5">
                                            <FileCode2 size={11} className="text-[#0070F3]" /> File Path in Repo
                                            <span className="text-white/20 normal-case tracking-normal font-normal ml-1">(fetched automatically from GitHub)</span>
                                        </label>
                                        <input
                                            required
                                            value={filePath}
                                            onChange={(e) => setFilePath(e.target.value)}
                                            placeholder="src/app.js"
                                            className={inputClass}
                                        />
                                    </div>

                                    {/* GitHub Token */}
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-[11px] uppercase tracking-widest text-white/50 font-bold flex items-center gap-1.5">
                                            <KeyRound size={11} className="text-[#0070F3]" /> GitHub PAT
                                            <span className="text-white/20 normal-case tracking-normal font-normal ml-1">(leave blank — backend uses GITHUB_TOKEN from env)</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showToken ? "text" : "password"}
                                                value={token}
                                                onChange={(e) => setToken(e.target.value)}
                                                placeholder="Leave blank to use GITHUB_TOKEN from backend .env"
                                                className={`${inputClass} pr-20`}
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                                {token && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setToken("")}
                                                        className="text-red-400/60 hover:text-red-400 transition-colors text-xs"
                                                    >clear</button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => setShowToken(!showToken)}
                                                    className="text-white/30 hover:text-white/60 transition-colors text-xs"
                                                >
                                                    {showToken ? "hide" : "show"}
                                                </button>
                                            </div>
                                        </div>
                                        {!token && (
                                            <p className="text-[11px] text-green-400/60 pl-1 flex items-center gap-1">
                                                ✓ Using GITHUB_TOKEN from backend environment
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Auto-log info banner */}
                                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#0070F3]/[0.07] border border-[#0070F3]/20">
                                    <ScrollText size={14} className="text-[#0070F3] shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-[#60a5fa] font-semibold mb-0.5">Error log fetched automatically</p>
                                        <p className="text-[11px] text-white/40 leading-relaxed">
                                            The backend will auto-discover your error log from GitHub Actions failed runs,
                                            common log file paths, or recent commit history — no input needed.
                                        </p>
                                    </div>
                                </div>

                                {/* Commit Message (optional) */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] uppercase tracking-widest text-white/50 font-bold">
                                        Commit Message <span className="text-white/20 normal-case tracking-normal font-normal">(optional — auto-generated if blank)</span>
                                    </label>
                                    <input
                                        value={commitMsg}
                                        onChange={(e) => setCommitMsg(e.target.value)}
                                        placeholder="🤖 DevOps Buddy: auto-fix"
                                        className={inputClass}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 rounded-xl bg-[#0070F3] hover:bg-[#0060d0] text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(0,112,243,0.5)] transition-all hover:shadow-[0_0_40px_rgba(0,112,243,0.7)] active:scale-[0.98]"
                                >
                                    <Zap size={16} />
                                    Run Auto-Fix Pipeline
                                    <ChevronRight size={16} />
                                </button>
                            </motion.form>
                        )}

                        {/* ── RUNNING: Progress ── */}
                        {stage === "running" && (
                            <motion.div
                                key="running"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="py-10 flex flex-col items-center gap-6 text-center"
                            >
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-full bg-[#0070F3]/10 border border-[#0070F3]/30 flex items-center justify-center shadow-[0_0_40px_rgba(0,112,243,0.4)]">
                                        <Loader2 size={32} className="text-[#0070F3] animate-spin" />
                                    </div>
                                    <div className="absolute -inset-3 rounded-full border border-[#0070F3]/10 animate-ping" />
                                </div>
                                <div>
                                    <p className="text-white/80 font-semibold text-base mb-1">Pipeline Running...</p>
                                    <p className="text-sm text-[#0070F3] font-mono">{liveStep}</p>
                                </div>
                                <div className="w-full max-w-sm space-y-2">
                                    {[
                                        "Hash error fingerprint",
                                        "DB lookup for cached fix",
                                        "Fetch file from GitHub",
                                        "Gemini reflexive AI loop",
                                        "Push fix + create PR",
                                        "Save result to database",
                                    ].map((s, i) => (
                                        <div key={i} className="flex items-center gap-3 text-xs text-white/30">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#0070F3]/40 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                                            {s}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* ── DONE: Success ── */}
                        {stage === "done" && result?.success && (
                            <motion.div
                                key="done"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="space-y-5"
                            >
                                {/* Success header */}
                                <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                                    <CheckCircle2 size={22} className="text-green-400 shrink-0" />
                                    <div>
                                        <p className="text-green-400 font-bold text-sm">Fix deployed successfully!</p>
                                        <p className="text-xs text-white/40 mt-0.5">
                                            {result.source === "cache"
                                                ? "✅ Used cached high-confidence fix (no AI needed)"
                                                : `🤖 Gemini ran ${result.aiIterations} iteration${result.aiIterations !== 1 ? "s" : ""}`}
                                        </p>
                                        {result.logSource && (
                                            <p className="text-xs text-[#60a5fa]/70 mt-1 flex items-center gap-1">
                                                <ScrollText size={10} />
                                                Log source: <span className="font-mono">{result.logSource}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* PR Link */}
                                {result.prUrl && (
                                    <a
                                        href={result.prUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-4 rounded-xl bg-[#0070F3]/10 border border-[#0070F3]/30 hover:bg-[#0070F3]/15 transition-all group"
                                    >
                                        <GitBranch size={16} className="text-[#0070F3]" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-white/40 uppercase tracking-wider mb-0.5">Pull Request #{result.prNumber}</p>
                                            <p className="text-sm text-[#60a5fa] font-mono truncate">{result.prUrl}</p>
                                        </div>
                                        <ExternalLink size={14} className="text-white/30 group-hover:text-[#0070F3] transition-colors" />
                                    </a>
                                )}

                                {/* Stats Grid */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                                        <p className="text-lg font-bold text-white">{result.aiIterations ?? 0}</p>
                                        <p className="text-[10px] text-white/30 uppercase tracking-wider mt-0.5">AI Iterations</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                                        <p className="text-lg font-bold text-green-400">
                                            {result.aiConfidence != null ? `${(result.aiConfidence * 100).toFixed(1)}%` : "—"}
                                        </p>
                                        <p className="text-[10px] text-white/30 uppercase tracking-wider mt-0.5">Confidence</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                                        <p className="text-lg font-bold text-[#0070F3]">
                                            {result.qValue != null ? result.qValue.toFixed(2) : "—"}
                                        </p>
                                        <p className="text-[10px] text-white/30 uppercase tracking-wider mt-0.5">Q-Value</p>
                                    </div>
                                </div>

                                {/* Root Cause */}
                                {result.rootCause && (
                                    <div className="space-y-1.5">
                                        <p className="text-[11px] uppercase tracking-widest text-white/30 font-bold">Root Cause</p>
                                        <p className="text-sm text-white/60 bg-white/[0.02] rounded-xl p-3 border border-white/[0.06]">
                                            {result.rootCause}
                                        </p>
                                    </div>
                                )}

                                {/* Fix Method */}
                                {result.fixMethod && (
                                    <div className="space-y-1.5">
                                        <p className="text-[11px] uppercase tracking-widest text-white/30 font-bold">Fix Strategy</p>
                                        <p className="text-sm text-white/60 bg-white/[0.02] rounded-xl p-3 border border-white/[0.06]">
                                            {result.fixMethod}
                                        </p>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-2">
                                    {result.prUrl && (
                                        <a
                                            href={result.prUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 py-2.5 rounded-xl bg-[#0070F3] hover:bg-[#0060d0] text-white font-bold text-sm text-center transition-all shadow-[0_0_20px_rgba(0,112,243,0.4)]"
                                        >
                                            Review PR on GitHub
                                        </a>
                                    )}
                                    <button
                                        onClick={() => { close(); router.push("/dashboard"); }}
                                        className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 hover:bg-white/[0.04] text-sm font-semibold transition-all"
                                    >
                                        Back to Dashboard
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* ── ERROR ── */}
                        {stage === "error" && (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="py-8 space-y-5"
                            >
                                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                    <AlertCircle size={20} className="text-red-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-red-400 font-bold text-sm mb-1">Pipeline failed</p>
                                        <p className="text-xs text-white/50 font-mono">{result?.error}</p>
                                    </div>
                                </div>
                                {result?.steps && result.steps.length > 0 && (
                                    <div className="space-y-1.5">
                                        <p className="text-[11px] uppercase tracking-widest text-white/30 font-bold">Steps completed before failure</p>
                                        {result.steps.map((s, i) => (
                                            <div key={i} className="flex items-center gap-2 text-xs text-white/40">
                                                <CheckCircle2 size={12} className="text-green-400/60" />
                                                {s.step}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <button
                                    onClick={() => setStage("idle")}
                                    className="w-full py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white/70 text-sm font-semibold hover:bg-white/[0.08] transition-all"
                                >
                                    ← Try Again
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
