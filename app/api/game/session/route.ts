import { NextResponse } from "next/server";

import { createSession } from "@/lib/field-of-honour/session-store";

interface CreateSessionBody {
  playerIds?: string[];
  seed?: number;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as CreateSessionBody;
    const playerIds = body.playerIds?.length
      ? body.playerIds
      : ["Player 1", "Player 2"];

    const session = createSession(playerIds, body.seed);

    return NextResponse.json({
      sessionId: session.id,
      createdAt: session.createdAt,
      state: session.engine.getState(),
      roundHistory: session.roundHistory,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create session",
      },
      { status: 400 },
    );
  }
}