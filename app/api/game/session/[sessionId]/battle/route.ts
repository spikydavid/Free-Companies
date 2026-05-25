import { NextResponse } from "next/server";

import { getManualBattleSession, getSession } from "@/lib/field-of-honour/session-store";

interface Params {
  params: Promise<{ sessionId: string }>;
}

export async function GET(_request: Request, { params }: Params) {
  const { sessionId } = await params;
  if (!getSession(sessionId)) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  try {
    const battle = getManualBattleSession(sessionId);
    return NextResponse.json({ sessionId, battle });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No manual battle active" },
      { status: 400 },
    );
  }
}
