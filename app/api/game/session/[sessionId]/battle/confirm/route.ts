import { NextResponse } from "next/server";

import { confirmManualBattleSession, getSession } from "@/lib/field-of-honour/session-store";

interface Params {
  params: Promise<{ sessionId: string }>;
}

export async function POST(_request: Request, { params }: Params) {
  const { sessionId } = await params;
  if (!getSession(sessionId)) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  try {
    const result = confirmManualBattleSession(sessionId);
    const session = getSession(sessionId);
    return NextResponse.json({
      sessionId,
      result,
      state: session?.engine.getState(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to confirm battle" },
      { status: 400 },
    );
  }
}
