import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

/**
 * GET /api/dashboard-stats
 * Proxies the dashboard stats request from Next.js to the Express backend.
 */
export async function GET(_request: NextRequest) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/dashboard-stats`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { success: false, stats: null, error: `Backend unreachable: ${message}` },
            { status: 502 }
        );
    }
}
