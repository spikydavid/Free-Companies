import { NextResponse } from "next/server";

import { getSession, toggleManualBattleSacrificeSession } from "@/lib/field-of-honour/session-store";
import type { TroopType } from "@/lib/field-of-honour";

interface Params {
  params: Promise<{ sessionId: string }>;
}

interface SacrificeBody {
  type?: TroopType;
  index?: number;
}

const VALID_TYPES: TroopType[] = ["melee", "ranged", "mounted"];

export async function POST(request: Request, { params }: Params) {
  const { sessionId } = await params;
  if (!getSession(sessionId)) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as SacrificeBody;
    if (!body.type || !VALID_TYPES.includes(body.type) || body.index === undefined) {
      return NextResponse.json(
        { error: "type (melee|ranged|mounted) and index are required" },
        { status: 400 },
      );
    }

    const battle = toggleManualBattleSacrificeSession(sessionId, body.type, body.index);
    return NextResponse.json({ sessionId, battle });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to toggle sacrifice" },
      { status: 400 },
    );
  }
}
