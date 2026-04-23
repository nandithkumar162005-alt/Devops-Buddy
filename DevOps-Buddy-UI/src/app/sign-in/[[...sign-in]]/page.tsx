"use client";

import { SignIn } from "@clerk/nextjs";
import { Ripple, TechOrbitDisplay } from "@/components/ui/modern-animated-sign-in";
import { ReactNode } from "react";

interface OrbitIcon {
    component: () => ReactNode;
    className: string;
    duration?: number;
    delay?: number;
    radius?: number;
    path?: boolean;
    reverse?: boolean;
}

const iconsArray: OrbitIcon[] = [
    {
        component: () => (
            <img style={{ width: 100, height: 100 }} src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original-wordmark.svg" alt="AWS" />
        ),
        className: "size-[30px] border-none bg-transparent",
        duration: 20, delay: 20, radius: 100, path: false, reverse: false,
    },
    {
        component: () => (
            <img style={{ width: 100, height: 100 }} src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg" alt="Docker" />
        ),
        className: "size-[30px] border-none bg-transparent",
        duration: 20, delay: 10, radius: 100, path: false, reverse: false,
    },
    {
        component: () => (
            <img style={{ width: 100, height: 100 }} src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/kubernetes/kubernetes-original.svg" alt="Kubernetes" />
        ),
        className: "size-[50px] border-none bg-transparent",
        radius: 210, duration: 20, path: false, reverse: false,
    },
    {
        component: () => (
            <img style={{ width: 100, height: 100 }} src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg" alt="GitHub" />
        ),
        className: "size-[50px] border-none bg-transparent",
        radius: 210, duration: 20, delay: 20, path: false, reverse: false,
    },
    {
        component: () => (
            <img style={{ width: 100, height: 100 }} src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/terraform/terraform-original.svg" alt="Terraform" />
        ),
        className: "size-[30px] border-none bg-transparent",
        duration: 20, delay: 20, radius: 150, path: false, reverse: true,
    },
    {
        component: () => (
            <img style={{ width: 100, height: 100 }} src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/googlecloud/googlecloud-original.svg" alt="GCP" />
        ),
        className: "size-[30px] border-none bg-transparent",
        duration: 20, delay: 10, radius: 150, path: false, reverse: true,
    },
    {
        component: () => (
            <img style={{ width: 100, height: 100 }} src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/grafana/grafana-original.svg" alt="Grafana" />
        ),
        className: "size-[50px] border-none bg-transparent",
        radius: 270, duration: 20, path: false, reverse: true,
    },
    {
        component: () => (
            <img style={{ width: 100, height: 100 }} src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/prometheus/prometheus-original.svg" alt="Prometheus" />
        ),
        className: "size-[50px] border-none bg-transparent",
        radius: 270, duration: 20, delay: 60, path: false, reverse: true,
    },
];

export default function SignInPage() {
    return (
        <div className="min-h-screen bg-white flex max-lg:justify-center overflow-hidden pt-24">
            {/* Left Side — Orbiting DevOps Icons */}
            <div className="hidden lg:flex flex-col justify-center w-1/2 relative bg-neutral-50 overflow-hidden">
                <Ripple numCircles={5} mainCircleSize={150} className="opacity-70 !bg-neutral-50" />
                <TechOrbitDisplay iconsArray={iconsArray} text="DevOps Buddy" />
            </div>

            {/* Right Side — Clerk Sign In */}
            <div className="w-full lg:w-1/2 min-h-[calc(100vh-6rem)] flex flex-col justify-center items-center px-6 lg:px-12 relative bg-white">
                <div className="relative z-10 flex flex-col items-center gap-4 w-full max-w-sm">
                    {/* Header */}
                    <div className="text-center mb-2">
                        <div className="inline-flex items-center gap-2 mb-3">
                            <div className="w-9 h-9 rounded-full bg-[#0070F3]/10 border border-[#0070F3]/30 flex items-center justify-center shadow-[0_0_20px_rgba(0,112,243,0.15)]">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0070F3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                    <path d="M2 17l10 5 10-5" />
                                    <path d="M2 12l10 5 10-5" />
                                </svg>
                            </div>
                            <span className="text-gray-900 font-bold tracking-wide text-lg">DevOps Buddy</span>
                        </div>
                        <p className="text-gray-500 text-sm">Sign in to continue</p>
                    </div>

                    {/* Clerk SignIn — Light theme */}
                    <SignIn
                        appearance={{
                            elements: {
                                rootBox: "w-full",
                                card: "!bg-white !border !border-gray-200 !shadow-[0_4px_24px_rgba(0,0,0,0.08)] !rounded-2xl",
                                headerTitle: "!text-gray-900 !font-bold !text-lg",
                                headerSubtitle: "!text-gray-500 !text-sm",
                                socialButtonsBlockButton: "!bg-white !border !border-gray-200 !text-gray-700 hover:!bg-gray-50 hover:!border-gray-300 !transition-all !rounded-xl !font-medium !shadow-sm",
                                socialButtonsBlockButtonText: "!text-gray-700 !font-semibold !text-sm",
                                dividerLine: "!bg-gray-200",
                                dividerText: "!text-gray-400 !text-xs",
                                formFieldLabel: "!text-gray-600 !text-xs !uppercase !tracking-wider !font-semibold",
                                formFieldInput: "!bg-gray-50 !border !border-gray-200 !text-gray-900 !rounded-xl focus:!border-[#0070F3] focus:!ring-[#0070F3]/20 placeholder:!text-gray-400",
                                formButtonPrimary: "!bg-gradient-to-r !from-[#0070F3] !to-[#7C3AED] hover:!from-[#0060df] hover:!to-[#6D28D9] !text-white !font-semibold !rounded-xl !transition-all !shadow-[0_4px_16px_rgba(0,112,243,0.25)]",
                                footerActionLink: "!text-[#0070F3] hover:!text-[#0060df] !font-semibold",
                                footerActionText: "!text-gray-500",
                                identityPreviewText: "!text-gray-900",
                                identityPreviewEditButton: "!text-[#0070F3]",
                                alert: "!bg-red-50 !border !border-red-200 !text-red-600 !rounded-xl",
                                footer: "!bg-transparent !border-t !border-gray-100",
                            },
                            variables: {
                                colorPrimary: "#0070F3",
                                colorBackground: "#ffffff",
                                colorText: "#111827",
                                colorTextSecondary: "#6b7280",
                                colorInputBackground: "#f9fafb",
                                colorInputText: "#111827",
                                borderRadius: "0.75rem",
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
