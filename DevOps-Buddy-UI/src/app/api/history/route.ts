import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

/**
 * GET /api/history
 * Proxies the fix history request from Next.js to the Express backend.
 */
export async function GET(_request: NextRequest) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/history`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { success: false, fixes: [], error: `Backend unreachable: ${message}` },
            { status: 502 }
        );
    }
}
