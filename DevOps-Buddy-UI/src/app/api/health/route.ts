import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

/**
 * GET /api/health
 * Proxies health check to the Express backend.
 */
export async function GET(_request: NextRequest) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/health`);
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch {
        return NextResponse.json({ status: "offline" }, { status: 502 });
    }
}
