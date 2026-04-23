"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import LogUploadModal from "@/components/LogUploadModal";



export default function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Navbar />
            <LogUploadModal />
            {children}
        </>
    );
}
