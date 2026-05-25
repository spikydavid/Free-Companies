import { NextResponse } from "next/server";

import { getSession, scoreSession } from "@/lib/field-of-honour/session-store";

interface Params {
  params: Promise<{ sessionId: string }>;
}

export async function GET(_request: Request, { params }: Params) {
  const { sessionId } = await params;
  if (!getSession(sessionId)) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  try {
    const scores = scoreSession(sessionId);
    return NextResponse.json({ sessionId, scores });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to score session",
      },
      { status: 400 },
    );
  }
}