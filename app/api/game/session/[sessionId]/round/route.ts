import { NextResponse } from "next/server";

import { getSession, playSessionRound } from "@/lib/field-of-honour/session-store";
import type { RoundChoices } from "@/lib/field-of-honour/types";

interface Params {
  params: Promise<{ sessionId: string }>;
}

interface PlayRoundBody {
  auto?: boolean;
  choices?: RoundChoices;
}

export async function POST(request: Request, { params }: Params) {
  const { sessionId } = await params;
  if (!getSession(sessionId)) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as PlayRoundBody;
    const roundResult = playSessionRound(sessionId, {
      auto: body.auto ?? true,
      choices: body.choices,
    });

    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({
      sessionId,
      roundResult,
      state: session.engine.getState(),
      roundHistory: session.roundHistory,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to play round",
      },
      { status: 400 },
    );
  }
}