import { NextResponse } from "next/server";

import { getSession } from "@/lib/field-of-honour/session-store";

interface Params {
  params: Promise<{ sessionId: string }>;
}

export async function GET(_request: Request, { params }: Params) {
  const { sessionId } = await params;
  const session = getSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json({
    sessionId: session.id,
    createdAt: session.createdAt,
    state: session.engine.getState(),
    roundHistory: session.roundHistory,
  });
}