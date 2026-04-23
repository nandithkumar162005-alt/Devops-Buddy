"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    LayoutDashboard,
    AlertTriangle,
    CheckCircle2,
    GitBranch,
    Bell,
    ChevronDown,
    Search,
    ExternalLink,
    Zap,
    Database,
    Cpu,
    TrendingUp,
    Shield,
    Settings,
    KeyRound,
    User,
    Link2,
    GitFork,
    Pencil,
    Save,
    Eye,
    EyeOff,
    Play,
    RefreshCw,
    Activity,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GradientText from "@/components/ui/GradientText";
import Aurora from "@/components/ui/Aurora";

/* ──────────────────────── TYPES ──────────────────────── */
type TabKey = "errors" | "fixed" | "deployments" | "settings";

interface RealFix {
    error_hash: string;
    repo: string;
    branch: string;
    file_path: string;
    q_value: number;
    ai_confidence: number;
    ai_iterations: number;
    merge_status: boolean | null;
    pr_url: string | null;
    pr_number: number | null;
    root_cause: string | null;
    original_error: string | null;
    created_at: string;
}

interface DashboardStats {
    totalLogs: number;
    anomalies: number;
    fixesDeployed: number;
    sources: { name: string; count: number }[];
    sparkline: number[];
}

function openRunFix() {
    window.dispatchEvent(new Event("open-log-upload"));
}

interface LogEntry {
    id: string;
    timestamp: string;
    level: "error" | "warning" | "critical";
    service: string;
    message: string;
    status: string;
}

interface FixedEntry {
    id: string;
    timestamp: string;
    error: string;
    fix: string;
    workflow: string;
    confidence: number;
}

interface DeployEntry {
    id: string;
    timestamp: string;
    repo: string;
    branch: string;
    status: "success" | "failed" | "pending";
    commitMsg: string;
    prNumber: number;
}

/* ──────────────────────── SAMPLE DATA ──────────────────────── */
const ERRORS: LogEntry[] = [
    { id: "e1", timestamp: "21:14:02", level: "critical", service: "AWS GuardDuty", message: "Anomalous traffic pattern detected", status: "503" },
    { id: "e2", timestamp: "21:13:45", level: "error", service: "AWS Cognito", message: "Multiple login failures", status: "401" },
    { id: "e3", timestamp: "21:13:45", level: "warning", service: "Azure NSG", message: "Security Group change detected", status: "warning" },
    { id: "e4", timestamp: "21:13:30", level: "warning", service: "Azure NSG", message: "Security Group change (Azure NSG)", status: "warning" },
    { id: "e5", timestamp: "21:12:58", level: "error", service: "payment-service", message: "Payment gateway unavailable", status: "502" },
    { id: "e6", timestamp: "21:12:40", level: "critical", service: "database", message: "Connection timeout to replica", status: "503" },
    { id: "e7", timestamp: "21:12:22", level: "error", service: "api-gateway", message: "Rate limit exceeded (API-GW)", status: "429" },
    { id: "e8", timestamp: "21:11:55", level: "warning", service: "cache-service", message: "Cache miss ratio exceeds threshold", status: "warning" },
];

const FIXED: FixedEntry[] = [
    { id: "f1", timestamp: "21:15:00", error: "Connection timeout to replica", fix: "Scaled read replicas from 2→4", workflow: "n8n auto-scale-db", confidence: 0.94 },
    { id: "f2", timestamp: "21:14:30", error: "Payment gateway unavailable", fix: "Switched to fallback provider", workflow: "n8n payment-failover", confidence: 0.89 },
    { id: "f3", timestamp: "21:13:50", error: "Rate limit exceeded (API-GW)", fix: "Increased rate limit + added caching", workflow: "n8n api-limiter", confidence: 0.92 },
    { id: "f4", timestamp: "21:12:10", error: "Cache miss ratio threshold", fix: "Warmed cache with prefetch job", workflow: "n8n cache-warm", confidence: 0.87 },
];

const DEPLOYMENTS: DeployEntry[] = [
    { id: "d1", timestamp: "21:15:05", repo: "devops-buddy/infra", branch: "fix/db-replicas", status: "success", commitMsg: "Scale read replicas to 4", prNumber: 142 },
    { id: "d2", timestamp: "21:14:35", repo: "devops-buddy/payments", branch: "fix/fallback-provider", status: "success", commitMsg: "Add fallback payment provider", prNumber: 87 },
    { id: "d3", timestamp: "21:13:55", repo: "devops-buddy/api-gw", branch: "fix/rate-limiter", status: "pending", commitMsg: "Increase rate limit + cache headers", prNumber: 203 },
    { id: "d4", timestamp: "21:12:15", repo: "devops-buddy/cache", branch: "fix/prefetch", status: "failed", commitMsg: "Add cache prefetch job", prNumber: 64 },
];

const SPARKLINE = [12, 18, 15, 25, 22, 30, 28, 35, 32, 40, 38, 45, 42, 50, 48, 55, 52, 60, 58, 65];

/* ──────────────────────── COMPONENTS ──────────────────────── */

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`rounded-2xl relative overflow-hidden bg-[#0A0A0A]/50 backdrop-blur-md border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] ${className}`}>
            {children}
        </div>
    );
}

function Sparkline({ data, color = "#0070F3", height = 48 }: { data: number[]; color?: string; height?: number }) {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const w = 200;
    const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - ((v - min) / range) * (height - 4)}`).join(" ");
    const areaPoints = `0,${height} ${points} ${w},${height}`;
    return (
        <svg viewBox={`0 0 ${w} ${height}`} className="w-full" preserveAspectRatio="none">
            <defs>
                <linearGradient id={`sg-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon points={areaPoints} fill={`url(#sg-${color.replace("#", "")})`} />
            <polyline points={points} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>
    );
}

function StatCard({ icon, label, value, trend, color }: { icon: React.ReactNode; label: string; value: string; trend?: string; color: string }) {
    return (
        <GlassCard className="p-5 flex flex-col gap-3 relative overflow-hidden group hover:border-white/20 transition-all duration-300">
            {/* Ambient glow */}
            <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" style={{ background: color }} />
            {/* Accent line */}
            <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${color}80, transparent)` }} />
            <div className="flex items-center gap-2 text-white/50 text-[10px] font-bold uppercase tracking-widest">
                {icon}
                {label}
            </div>
            <div className="text-3xl font-bold" style={{ color }}>{value}</div>
            {trend && <div className="text-xs text-green-400 flex items-center gap-1"><TrendingUp size={12} />{trend}</div>}
        </GlassCard>
    );
}

function LevelBadge({ level }: { level: string }) {
    const styles: Record<string, string> = {
        critical: "bg-red-500/20 text-red-400 border-red-500/30",
        error: "bg-orange-500/20 text-orange-400 border-orange-500/30",
        warning: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[level] || "bg-white/10 text-white/60 border-white/10"}`}>
            {level}
        </span>
    );
}

function DeployBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        success: "bg-green-500/20 text-green-400 border-green-500/30",
        failed: "bg-red-500/20 text-red-400 border-red-500/30",
        pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status] || "bg-white/10 text-white/60 border-white/10"}`}>
            {status}
        </span>
    );
}

/* ──────────────────────── TABS ──────────────────────── */

function ErrorsTab({ realFixes }: { realFixes: RealFix[] }) {
    const [expanded, setExpanded] = useState<string | null>(null);
    
    const items = realFixes.length > 0 ? realFixes.map(f => ({
        id: f.error_hash,
        timestamp: new Date(f.created_at).toLocaleTimeString(),
        level: (f.q_value < 0.5 ? "critical" : "error") as "critical" | "error" | "warning",
        service: f.repo || "system",
        message: f.original_error?.slice(0, 100) + "..." || "Unknown error",
        fullMessage: f.original_error || "No detailed logs",
        status: "500",
    })) : ERRORS.map(e => ({ ...e, fullMessage: e.message }));

    return (
        <div className="divide-y divide-white/5">
            {items.map((err) => (
                <div key={err.id}>
                    <button
                        onClick={() => setExpanded(expanded === err.id ? null : err.id)}
                        className="w-full px-4 py-3 flex items-center gap-4 text-left hover:bg-white/[0.02] hover:rounded-2xl transition-all"
                    >
                        <ChevronDown size={14} className={`text-white/30 transition-transform ${expanded === err.id ? "rotate-180" : ""}`} />
                        <LevelBadge level={err.level} />
                        <span className="text-xs text-white/40 font-mono w-16">[{err.timestamp}]</span>
                        <span className="text-sm text-white/70 font-medium min-w-[120px]">{err.service}</span>
                        <span className="text-sm text-white/50 flex-1 truncate">{err.message}</span>
                        <span className="text-xs font-mono text-white/30">{err.status}</span>
                    </button>
                    <AnimatePresence>
                        {expanded === err.id && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden bg-white/[0.01] border-t border-white/5"
                            >
                                <div className="p-4 space-y-2">
                                    <p className="text-xs text-white/30 uppercase tracking-widest font-semibold">Full Message</p>
                                    <p className="font-mono text-sm text-white/70 bg-black/20 rounded-xl p-3 whitespace-pre-wrap">{err.fullMessage}</p>
                                    <div className="grid grid-cols-3 gap-4 text-xs pt-2">
                                        <div><span className="text-white/30">Service:</span> <span className="text-white/60">{err.service}</span></div>
                                        <div><span className="text-white/30">Status:</span> <span className="text-white/60">{err.status}</span></div>
                                        <div><span className="text-white/30">Time:</span> <span className="text-white/60">{err.timestamp}</span></div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
}

function FixedTab({ realFixes, loading }: { realFixes: RealFix[]; loading: boolean }) {
    const items = realFixes.length > 0 ? realFixes : FIXED;
    const isReal = realFixes.length > 0;

    if (loading) return (
        <div className="flex items-center justify-center py-12 gap-3 text-white/30">
            <RefreshCw size={16} className="animate-spin" />
            <span className="text-sm">Loading fix history from database...</span>
        </div>
    );

    return (
        <div className="divide-y divide-white/5">
            {isReal ? realFixes.map((fix) => (
                <div key={fix.error_hash} className="px-4 py-4 hover:bg-white/[0.02] hover:rounded-2xl transition-all">
                    <div className="flex items-center gap-3 mb-2">
                        <CheckCircle2 size={16} className="text-green-400" />
                        <span className="text-sm text-white/80 font-medium flex-1 font-mono truncate">{fix.root_cause || fix.error_hash.slice(0, 20) + "..."}</span>
                        <span className="text-xs text-white/30 font-mono">{new Date(fix.created_at).toLocaleTimeString()}</span>
                    </div>
                    <div className="ml-7 space-y-1.5">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase tracking-wider text-white/30 font-semibold w-16">Repo:</span>
                            <span className="text-sm text-blue-400/80 font-mono">{fix.repo} / {fix.file_path}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase tracking-wider text-white/30 font-semibold w-16">Q-Value:</span>
                            <div className="flex items-center gap-2">
                                <div className="w-24 h-1.5 rounded-full bg-white/5 overflow-hidden">
                                    <div className="h-full rounded-full bg-green-400" style={{ width: `${Math.min(fix.q_value * 100, 100)}%` }} />
                                </div>
                                <span className="text-xs text-green-400 font-mono">{fix.q_value.toFixed(2)}</span>
                            </div>
                        </div>
                        {fix.pr_url && (
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] uppercase tracking-wider text-white/30 font-semibold w-16">PR:</span>
                                <a href={fix.pr_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#0070F3] hover:underline flex items-center gap-1">
                                    View PR <ExternalLink size={10} />
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )) : FIXED.map((fix) => (
                <div key={fix.id} className="px-4 py-4 hover:bg-white/[0.02] hover:rounded-2xl transition-all">
                    <div className="flex items-center gap-3 mb-2">
                        <CheckCircle2 size={16} className="text-green-400" />
                        <span className="text-sm text-white/80 font-medium flex-1">{fix.error}</span>
                        <span className="text-xs text-white/30 font-mono">[{fix.timestamp}]</span>
                    </div>
                    <div className="ml-7 space-y-1.5">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase tracking-wider text-white/30 font-semibold w-16">Fix:</span>
                            <span className="text-sm text-green-400/80">{fix.fix}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase tracking-wider text-white/30 font-semibold w-16">Q-Value:</span>
                            <div className="flex items-center gap-2">
                                <div className="w-24 h-1.5 rounded-full bg-white/5 overflow-hidden">
                                    <div className="h-full rounded-full bg-green-400" style={{ width: `${fix.confidence * 100}%` }} />
                                </div>
                                <span className="text-xs text-green-400 font-mono">{(fix.confidence * 100).toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function DeploymentsTab({ realFixes }: { realFixes: RealFix[] }) {
    const items = realFixes.length > 0 ? realFixes.filter(f => f.pr_url).map(f => ({
        id: f.error_hash,
        timestamp: new Date(f.created_at).toLocaleTimeString(),
        repo: f.repo || "unknown",
        branch: f.branch || "main",
        status: f.merge_status ? "success" : "pending",
        commitMsg: f.root_cause ? `Fix: ${f.root_cause}` : "Automated code fix",
        prNumber: f.pr_number || 0,
        prUrl: f.pr_url
    })) : DEPLOYMENTS.map(d => ({ ...d, prUrl: undefined }));

    return (
        <div className="divide-y divide-white/5">
            {items.map((dep) => (
                <div key={dep.id} className="px-4 py-4 hover:bg-white/[0.02] hover:rounded-2xl transition-all">
                    <div className="flex items-center gap-3 mb-2">
                        <GitBranch size={16} className="text-white/40" />
                        <span className="text-sm text-white/80 font-medium font-mono">{dep.repo}</span>
                        <span className="text-xs text-white/40 font-mono">/{dep.branch}</span>
                        <span className="ml-auto"><DeployBadge status={dep.status} /></span>
                    </div>
                    <div className="ml-7 flex items-center gap-4 text-xs text-white/40">
                        <span className="font-mono">[{dep.timestamp}]</span>
                        <span className="text-white/60">{dep.commitMsg}</span>
                        <a href={dep.prUrl || undefined} target="_blank" rel="noopener noreferrer" className="ml-auto flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors cursor-pointer">
                            PR #{dep.prNumber} <ExternalLink size={10} />
                        </a>
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ──────────────────────── SETTINGS TAB ──────────────────────── */

function SettingsTab() {
    const [editing, setEditing] = useState(false);
    const [showPAT, setShowPAT] = useState(false);
    const [profile, setProfile] = useState({ name: "", bio: "" });
    const [github, setGithub] = useState({
        repoUrl: "",
        firstSlide: "main",
        username: "",
        repoName: "",
        apiKey: "",
    });
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setEditing(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const inputClass = (editable: boolean) =>
        `w-full bg-white/[0.04] border ${
            editable ? "border-[#0070F3]/40 focus:border-[#0070F3]/70" : "border-white/[0.06]"
        } rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder:text-white/20 focus:outline-none transition-all`;

    return (
        <div className="space-y-6">
            {/* ── Profile Card ── */}
            <GlassCard className="p-6 relative overflow-hidden">
                {/* subtle blue top accent line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#0070F3]/60 to-transparent" />
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <User size={16} className="text-[#0070F3]" />
                        <h3 className="text-sm font-bold uppercase tracking-widest text-white/80">Profile</h3>
                    </div>
                    {!editing ? (
                        <button
                            onClick={() => setEditing(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#0070F3] border border-[#0070F3]/30 hover:bg-[#0070F3]/10 transition-all"
                        >
                            <Pencil size={12} /> Edit
                        </button>
                    ) : (
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-green-400 border border-green-400/30 hover:bg-green-400/10 transition-all"
                        >
                            <Save size={12} /> Save
                        </button>
                    )}
                </div>

                {/* Avatar */}
                <div className="flex items-center gap-5 mb-5">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0070F3]/40 to-[#7C3AED]/40 border border-[#0070F3]/30 flex items-center justify-center shadow-[0_0_30px_rgba(0,112,243,0.35)]"
                            style={{ boxShadow: "0 0 0 4px rgba(0,112,243,0.08), 0 0 30px rgba(0,112,243,0.3)" }}>
                            <User size={28} className="text-white/70" />
                        </div>
                        <div className="absolute -inset-1 rounded-2xl bg-[#0070F3]/10 blur-md -z-10" />
                    </div>
                    <div>
                        <p className="text-base font-bold text-white">{profile.name || "Your Name"}</p>
                        <p className="text-xs text-white/50 mt-0.5">{profile.bio || "Add a short bio..."}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[11px] uppercase tracking-widest text-white/60 font-bold">Display Name</label>
                        <input
                            disabled={!editing}
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            placeholder="John Doe"
                            className={inputClass(editing)}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[11px] uppercase tracking-widest text-white/60 font-bold">Bio</label>
                        <input
                            disabled={!editing}
                            value={profile.bio}
                            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                            placeholder="DevOps Engineer @ Acme Corp"
                            className={inputClass(editing)}
                        />
                    </div>
                </div>
            </GlassCard>

            {/* ── GitHub Integration ── */}
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                {/* Mesh gradient background */}
                <div className="absolute inset-0 bg-[#060d1a]" />
                <div className="absolute inset-0"
                    style={{
                        background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,112,243,0.18) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 100% 100%, rgba(124,58,237,0.12) 0%, transparent 60%)"
                    }}
                />
                {/* Top glowing border accent */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#0070F3]/80 to-transparent" />

                <div className="relative z-10 p-6">
                    {/* GitHub Hero Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            {/* GitHub Mark SVG with glow rings */}
                            <div className="relative flex items-center justify-center">
                                {/* Outer pulse ring */}
                                <div className="absolute w-14 h-14 rounded-full border border-white/10 animate-ping opacity-20" />
                                {/* Inner glow ring */}
                                <div className="absolute w-12 h-12 rounded-full bg-white/5 border border-white/20 blur-[1px]" />
                                {/* GitHub SVG mark */}
                                <div className="relative w-10 h-10 rounded-full bg-[#161b22] border border-white/20 flex items-center justify-center shadow-[0_0_24px_rgba(255,255,255,0.15)]">
                                    <svg viewBox="0 0 16 16" width="20" height="20" fill="white" aria-label="GitHub">
                                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-white tracking-wide">GitHub Integration</h3>
                                <p className="text-[11px] text-white/40 mt-0.5 font-medium">Connect your repository to DevOps Buddy</p>
                            </div>
                        </div>
                        {saved && (
                            <motion.span
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-xs text-green-400 font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-400/10 border border-green-400/20"
                            >
                                <CheckCircle2 size={12} /> Saved!
                            </motion.span>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Repo URL */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[11px] uppercase tracking-widest text-white/60 font-bold flex items-center gap-1.5">
                                <Link2 size={11} className="text-[#0070F3]" /> Repository URL
                            </label>
                            <input
                                disabled={!editing}
                                value={github.repoUrl}
                                onChange={(e) => setGithub({ ...github, repoUrl: e.target.value })}
                                placeholder="https://github.com/username/repo"
                                className={inputClass(editing)}
                            />
                        </div>

                        {/* Username */}
                        <div className="space-y-2">
                            <label className="text-[11px] uppercase tracking-widest text-white/60 font-bold flex items-center gap-1.5">
                                <User size={11} className="text-[#0070F3]" /> GitHub Username
                            </label>
                            <input
                                disabled={!editing}
                                value={github.username}
                                onChange={(e) => setGithub({ ...github, username: e.target.value })}
                                placeholder="octocat"
                                className={inputClass(editing)}
                            />
                        </div>

                        {/* Repo Name */}
                        <div className="space-y-2">
                            <label className="text-[11px] uppercase tracking-widest text-white/60 font-bold flex items-center gap-1.5">
                                <GitFork size={11} className="text-[#0070F3]" /> Repository Name
                            </label>
                            <input
                                disabled={!editing}
                                value={github.repoName}
                                onChange={(e) => setGithub({ ...github, repoName: e.target.value })}
                                placeholder="my-infra-repo"
                                className={inputClass(editing)}
                            />
                        </div>

                        {/* First Slide / Default Branch */}
                        <div className="space-y-2">
                            <label className="text-[11px] uppercase tracking-widest text-white/60 font-bold flex items-center gap-1.5">
                                <GitBranch size={11} className="text-[#0070F3]" /> First Slide (Default Branch)
                            </label>
                            <input
                                disabled={!editing}
                                value={github.firstSlide}
                                onChange={(e) => setGithub({ ...github, firstSlide: e.target.value })}
                                placeholder="main"
                                className={inputClass(editing)}
                            />
                        </div>

                        {/* GitHub PAT */}
                        <div className="space-y-2">
                            <label className="text-[11px] uppercase tracking-widest text-white/60 font-bold flex items-center gap-1.5">
                                <KeyRound size={11} className="text-[#0070F3]" /> GitHub API Key (PAT)
                            </label>
                            <div className="relative">
                                <input
                                    disabled={!editing}
                                    type={showPAT ? "text" : "password"}
                                    value={github.apiKey}
                                    onChange={(e) => setGithub({ ...github, apiKey: e.target.value })}
                                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                                    className={`${inputClass(editing)} pr-10`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPAT(!showPAT)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                                >
                                    {showPAT ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-3 mt-6 pt-5 border-t border-white/[0.06]">
                        {!editing ? (
                            <button
                                onClick={() => setEditing(true)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold bg-[#0070F3]/20 text-[#60a5fa] border border-[#0070F3]/40 hover:bg-[#0070F3]/30 transition-all shadow-[0_0_24px_rgba(0,112,243,0.2)]"
                            >
                                <Pencil size={14} /> Edit Configuration
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold bg-green-500/20 text-green-300 border border-green-500/40 hover:bg-green-500/30 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                                >
                                    <Save size={14} /> Save Changes
                                </button>
                                <button
                                    onClick={() => setEditing(false)}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white/50 border border-white/10 hover:bg-white/[0.05] transition-all"
                                >
                                    Cancel
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ──────────────────────── SIDEBAR ──────────────────────── */

const sidebarItems = [
    { key: "overview" as const, icon: <LayoutDashboard size={20} />, label: "Overview" },
    { key: "errors" as const, icon: <AlertTriangle size={20} />, label: "Errors" },
    { key: "fixed" as const, icon: <CheckCircle2 size={20} />, label: "Fixed" },
    { key: "deployments" as const, icon: <GitBranch size={20} />, label: "Deployments" },
    { key: "settings" as const, icon: <Settings size={20} />, label: "Settings" },
];

/* ──────────────────────── MAIN PAGE ──────────────────────── */

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState<TabKey>("errors");
    const [sidebarActive, setSidebarActive] = useState<string>("overview");
    const [searchQuery, setSearchQuery] = useState("");
    const [timeStr, setTimeStr] = useState("");
    const [dateStr, setDateStr] = useState("");
    const [realFixes, setRealFixes] = useState<RealFix[]>([]);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [fixesLoading, setFixesLoading] = useState(false);
    const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

    useEffect(() => {
        const tick = () => {
            const now = new Date();
            setTimeStr(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
            setDateStr(now.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase());
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    const loadFixes = useCallback(async () => {
        setFixesLoading(true);
        try {
            const [historyRes, statsRes] = await Promise.all([
                fetch("/api/history"),
                fetch("/api/dashboard-stats")
            ]);
            
            const historyData = await historyRes.json();
            const statsData = await statsRes.json();
            
            if (historyData.success && Array.isArray(historyData.fixes)) {
                setRealFixes(historyData.fixes);
                setBackendOnline(true);
            }
            if (statsData.success && statsData.stats) {
                setStats(statsData.stats);
            }
        } catch {
            setBackendOnline(false);
        } finally {
            setFixesLoading(false);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        loadFixes(); 
    }, [loadFixes]);

    const handleSidebarClick = (key: string) => {
        setSidebarActive(key);
        if (key === "errors" || key === "fixed" || key === "deployments" || key === "settings") {
            setActiveTab(key as TabKey);
        }
    };

    return (
        <div className="min-h-screen bg-[#03060e] text-white flex pt-24 relative">
            {/* ─── Aurora Background ─── */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <Aurora
                    colorStops={["#3A29FF", "#7C3AED", "#0070F3"]}
                    blend={0.8}
                    amplitude={2.5}
                    speed={0.3}
                />
                {/* Dark overlay to keep UI legible */}
                <div className="absolute inset-0 bg-[#03060e]/55" />
            </div>
            {/* ─── Left Sidebar ─── */}
            <aside className="w-16 hover:w-52 transition-all duration-300 group/sidebar flex flex-col items-center py-6 bg-[#03060e]/50 backdrop-blur-md border-r border-white/[0.08] shrink-0 overflow-hidden z-40 shadow-[0_4px_30px_rgba(0,0,0,0.4)] relative">
                {/* Logo */}
                <div className="w-10 h-10 rounded-xl bg-[#0070F3]/20 border border-[#0070F3]/30 flex items-center justify-center mb-8 shadow-[0_0_20px_rgba(0,112,243,0.3)] shrink-0">
                    <Zap size={18} className="text-[#0070F3]" />
                </div>

                {/* Nav Items */}
                <nav className="flex flex-col gap-2 w-full px-2">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.key}
                            onClick={() => handleSidebarClick(item.key)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-full transition-all w-full text-left ${sidebarActive === item.key
                                ? "bg-[#0070F3]/15 text-[#0070F3] shadow-[0_0_15px_rgba(0,112,243,0.15)] border border-[#0070F3]/20"
                                : "text-white/40 hover:text-white/70 hover:bg-white/[0.03] border border-transparent"
                                }`}
                        >
                            <span className="shrink-0">{item.icon}</span>
                            <span className="text-xs font-semibold tracking-wide whitespace-nowrap overflow-hidden opacity-0 group-hover/sidebar:opacity-100 transition-opacity">{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Bottom */}
                <div className="mt-auto flex flex-col gap-2 w-full px-2">
                    <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/30 hover:text-white/60 hover:bg-white/[0.03] transition-all w-full border border-transparent">
                        <Bell size={20} className="shrink-0" />
                        <span className="text-xs font-semibold whitespace-nowrap overflow-hidden opacity-0 group-hover/sidebar:opacity-100 transition-opacity">Alerts</span>
                    </button>
                </div>
            </aside>

            {/* ─── Main Content ─── */}
            <div className="flex-1 flex flex-col min-w-0 relative z-10">
                {/* Top Bar */}
                <header className="h-14 flex items-center gap-6 px-6 border-b border-white/[0.08] bg-[#03060e]/50 backdrop-blur-md shrink-0 shadow-[0_2px_20px_rgba(0,0,0,0.3)]">
                    <h1 className="text-sm font-bold tracking-widest text-white/80 uppercase">
                        <GradientText colors={["#ffffff", "#60a5fa", "#0070F3", "#60a5fa", "#ffffff"]} animationSpeed={6}>
                            Cloud Dashboard
                        </GradientText>
                    </h1>
                    <div className="flex items-center gap-4 ml-auto">
                        {/* Backend status */}
                        <span className="flex items-center gap-1.5 text-xs">
                            <Activity size={12} className={backendOnline === true ? "text-green-400" : backendOnline === false ? "text-red-400" : "text-white/30"} />
                            <span className={backendOnline === true ? "text-green-400" : backendOnline === false ? "text-red-400" : "text-white/30"}>
                                {backendOnline === true ? "Backend ONLINE" : backendOnline === false ? "Backend OFFLINE" : "Checking..."}
                            </span>
                        </span>
                        <span className="text-xs text-white/40 font-mono">{timeStr} | {dateStr}</span>
                        {/* Run Fix Button */}
                        <button
                            onClick={openRunFix}
                            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0070F3] hover:bg-[#0060d0] text-white text-xs font-bold shadow-[0_0_20px_rgba(0,112,243,0.5)] transition-all hover:shadow-[0_0_30px_rgba(0,112,243,0.7)] active:scale-95"
                        >
                            <Play size={12} fill="white" />
                            Run Fix
                        </button>
                        <button onClick={loadFixes} title="Refresh history" className="text-white/30 hover:text-white/60 transition-colors">
                            <RefreshCw size={14} className={fixesLoading ? "animate-spin" : ""} />
                        </button>
                    </div>
                </header>

                {sidebarActive === "settings" ? (
                    /* ── Full-width Settings Panel ── */
                    <motion.div
                        key="settings-panel"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1 overflow-y-auto p-6"
                    >
                        {/* Settings Header */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-9 h-9 rounded-xl bg-[#0070F3]/15 border border-[#0070F3]/25 flex items-center justify-center shadow-[0_0_16px_rgba(0,112,243,0.2)]">
                                <Settings size={16} className="text-[#0070F3]" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold tracking-widest text-white/80 uppercase">Settings</h2>
                                <p className="text-[10px] text-white/30">Manage your profile &amp; GitHub integration</p>
                            </div>
                        </div>
                        <SettingsTab />
                    </motion.div>
                ) : (
                    <>
                        {/* Stats Row */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 pb-0">
                            <StatCard icon={<Database size={14} />} label="Logs Ingested" value={stats ? `${(stats.totalLogs / 1000).toFixed(1)}k` : "0"} trend="+12.4% ↑" color="#0070F3" />
                            <StatCard icon={<AlertTriangle size={14} />} label="Anomalies Detected" value={`${stats?.anomalies || 0}`} trend="+3.2% ↑" color="#F59E0B" />
                            <StatCard icon={<Shield size={14} />} label="Auto-Triaged" value="100%" color="#10B981" />
                            <StatCard icon={<Cpu size={14} />} label="Fixes Deployed" value={`${stats?.fixesDeployed || 0}`} color="#8B5CF6" />
                        </div>

                        {/* Main Grid */}
                        <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-4 p-6 overflow-auto">
                            {/* Left: Ingestion Metrics */}
                            <GlassCard className="xl:col-span-1 p-5 flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-white/50">Ingestion Metrics</h3>
                                    <span className="text-xs text-white/30 font-mono">~2.5k EPS</span>
                                </div>
                                <div className="mb-6">
                                    <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">Logs Per Second</p>
                                    <Sparkline data={stats?.sparkline?.length ? stats.sparkline : SPARKLINE} color="#0070F3" height={60} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-white/30 uppercase tracking-widest mb-3">Active Sources</p>
                                    <div className="space-y-2">
                                        {(stats?.sources?.length ? stats.sources : [
                                            { name: "AWS", count: 12 },
                                            { name: "Azure", count: 8 },
                                            { name: "GCP", count: 5 },
                                        ]).map((src, i) => (
                                            <div key={src.name} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full" style={{ background: ["#FF9900", "#0078D4", "#4285F4", "#8B5CF6", "#10B981"][i % 5] }} />
                                                    <span className="text-white/60">{src.name}</span>
                                                </div>
                                                <span className="text-white/80 font-mono text-xs">{src.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-6 pt-4 border-t border-white/5">
                                    <p className="text-[10px] text-white/30 uppercase tracking-widest mb-3">Triage Status</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="text-center p-2 rounded-2xl bg-white/[0.02]">
                                            <p className="text-lg font-bold text-white">320/s</p>
                                            <p className="text-[10px] text-white/30 uppercase">Processing</p>
                                        </div>
                                        <div className="text-center p-2 rounded-2xl bg-white/[0.02]">
                                            <p className="text-lg font-bold text-green-400">94.1%</p>
                                            <p className="text-[10px] text-white/30 uppercase">Identified</p>
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>

                            {/* Center: Tabbed Logs */}
                            <GlassCard className="xl:col-span-2 flex flex-col overflow-hidden">
                                <div className="flex items-center gap-1 p-3 border-b border-white/5">
                                    {(
                                        [
                                            { key: "errors", label: "Errors", icon: <AlertTriangle size={14} />, count: ERRORS.length },
                                            { key: "fixed", label: "Fixed", icon: <CheckCircle2 size={14} />, count: FIXED.length },
                                            { key: "deployments", label: "Deployments", icon: <GitBranch size={14} />, count: DEPLOYMENTS.length },
                                        ] as const
                                    ).map((tab) => (
                                        <button
                                            key={tab.key}
                                            onClick={() => { setActiveTab(tab.key); setSidebarActive(tab.key); }}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${activeTab === tab.key
                                                ? "bg-[#0070F3]/15 text-[#0070F3] border border-[#0070F3]/20 shadow-[0_0_12px_rgba(0,112,243,0.1)]"
                                                : "text-white/40 hover:text-white/60 hover:bg-white/[0.03] border border-transparent"
                                                }`}
                                        >
                                            {tab.icon}
                                            {tab.label}
                                            <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? "bg-[#0070F3]/20 text-[#0070F3]" : "bg-white/5 text-white/30"
                                                }`}>{tab.count}</span>
                                        </button>
                                    ))}
                                    <div className="ml-auto relative">
                                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/20" />
                                        <input
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search..."
                                            className="h-8 w-40 rounded-full bg-white/[0.03] border border-white/[0.06] pl-8 pr-3 text-xs text-white/70 placeholder:text-white/20 focus:outline-none focus:border-[#0070F3]/30"
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={activeTab}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{ duration: 0.15 }}
                                        >
                                            {activeTab === "errors" && <ErrorsTab realFixes={realFixes} />}
                                            {activeTab === "fixed" && <FixedTab realFixes={realFixes} loading={fixesLoading} />}
                                            {activeTab === "deployments" && <DeploymentsTab realFixes={realFixes} />}
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </GlassCard>
                        </div>

                        {/* Bottom: Real-Time Alert Feed */}
                        <div className="px-6 pb-6">
                            <GlassCard className="p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Bell size={14} className="text-red-400" />
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-white/50">Real-Time Alert Feed</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {[
                                        { level: "CRITICAL", msg: "Anomalous traffic pattern detected (AWS GuardDuty)", color: "border-red-500/30 bg-red-500/5", icon: "text-red-400" },
                                        { level: "HIGH", msg: "Anomalous vs traffic traffic pattern detected (AWS GuardDuty)", color: "border-orange-500/30 bg-orange-500/5", icon: "text-orange-400" },
                                        { level: "MEDIUM", msg: "Connection timeout: DEBUG: Function executed (AWS Lambda: payment_processing)", color: "border-yellow-500/30 bg-yellow-500/5", icon: "text-yellow-400" },
                                    ].map((alert, i) => (
                                        <div key={i} className={`p-3 rounded-xl border ${alert.color}`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <AlertTriangle size={12} className={alert.icon} />
                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${alert.icon}`}>Urgent Alert</span>
                                            </div>
                                            <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">{alert.level}</p>
                                            <p className="text-xs text-white/60 leading-relaxed">{alert.msg}</p>
                                        </div>
                                    ))}
                                </div>
                            </GlassCard>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
