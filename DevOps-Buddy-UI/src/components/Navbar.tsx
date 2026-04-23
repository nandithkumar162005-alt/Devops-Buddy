"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";

export default function Navbar() {
    const pathname = usePathname();
    const isAuthPage = pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up");
    
    const { scrollY } = useScroll();
    const [hidden, setHidden] = useState(false);

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious() ?? 0;
        if (latest > previous && latest > 150) {
            setHidden(true);
        } else {
            setHidden(false);
        }
    });

    return (
        <motion.nav 
            variants={{
                visible: { y: 0 },
                hidden: { y: -120 },
            }}
            animate={hidden ? "hidden" : "visible"}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center pt-10 px-4 pointer-events-none"
        >
            <div className={`pointer-events-auto px-6 py-2 w-full max-w-5xl justify-between flex items-center gap-2 rounded-full transition-all duration-300 ${isAuthPage
                ? "bg-white/70 border border-black/10 shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
                : "navbar-glass"
                }`}>
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all group-hover:scale-105 ${isAuthPage
                        ? "bg-[#0070F3]/10 border border-[#0070F3]/20 shadow-[0_0_15px_rgba(0,112,243,0.15)]"
                        : "bg-white/10 border border-white/20 shadow-[0_0_15px_rgba(0,112,243,0.3)] group-hover:bg-white/15"
                        }`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0070F3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <span className={`text-sm font-semibold tracking-wide ${isAuthPage ? "text-gray-900" : "text-white drop-shadow-md"}`}>
                        DevOps Buddy
                    </span>
                </Link>

                {/* Auth Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                    <Show when="signed-out">
                        <SignInButton mode="redirect">
                            <button className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${isAuthPage
                                ? "text-gray-700 hover:text-gray-900 hover:bg-black/5"
                                : "navbar-btn navbar-btn-ghost"
                                }`}>
                                Log In
                            </button>
                        </SignInButton>
                        <SignUpButton mode="redirect">
                            <button className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${isAuthPage
                                ? "bg-gray-900 text-white hover:bg-gray-800 shadow-sm"
                                : "navbar-btn navbar-btn-primary"
                                }`}>
                                Sign Up
                            </button>
                        </SignUpButton>
                    </Show>
                    <Show when="signed-in">
                        <UserButton
                            appearance={{
                                elements: {
                                    avatarBox: `w-8 h-8 border shadow-[0_0_12px_rgba(0,112,243,0.3)] ${isAuthPage ? "border-gray-200" : "border-white/20"}`,
                                    userButtonPopoverCard: "bg-[#0B0B0B] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] !rounded-xl",
                                    userButtonPopoverActionButton: "text-white/70 hover:text-white hover:bg-white/5",
                                    userButtonPopoverActionButtonText: "text-white/70",
                                    userButtonPopoverFooter: "hidden",
                                }
                            }}
                        />
                    </Show>
                </div>
            </div>
        </motion.nav>
    );
}
