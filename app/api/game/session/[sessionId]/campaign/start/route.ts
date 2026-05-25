import { NextResponse } from "next/server";

import { getSession, startManualCampaignSession } from "@/lib/field-of-honour/session-store";

interface Params {
  params: Promise<{ sessionId: string }>;
}

interface StartCampaignBody {
  playerId?: string;
  contractIds?: string[];
}

export async function POST(request: Request, { params }: Params) {
  const { sessionId } = await params;
  if (!getSession(sessionId)) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as StartCampaignBody;
    if (!body.playerId || !body.contractIds || body.contractIds.length === 0) {
      return NextResponse.json(
        { error: "playerId and at least one contractId are required" },
        { status: 400 },
      );
    }

    const campaign = startManualCampaignSession(sessionId, body.playerId, body.contractIds);
    return NextResponse.json({ sessionId, campaign });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to start manual campaign" },
      { status: 400 },
    );
  }
}
