import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";
import { cn } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevOps Buddy — Autonomous Infrastructure Remediation",
  description:
    "The self-learning, autonomous infrastructure remediation agent that detects, researches, and fixes production errors before they impact users. Powered by Reinforcement Learning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body className={`${geistMono.variable} antialiased`}>
        <ClerkProvider>
          <ClientProviders>{children}</ClientProviders>
        </ClerkProvider>
      </body>
    </html>
  );
}
