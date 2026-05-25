import { NextResponse } from "next/server";

import {
  getSession,
  startManualBattleSession,
  startManualCampaignBattleSession,
} from "@/lib/field-of-honour/session-store";
import type { TroopCounts } from "@/lib/field-of-honour";

interface Params {
  params: Promise<{ sessionId: string }>;
}

interface StartBattleBody {
  playerId?: string;
  contractId?: string;
  sendHome?: TroopCounts;
}

export async function POST(request: Request, { params }: Params) {
  const { sessionId } = await params;
  const session = getSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as StartBattleBody;
    if (body.contractId) {
      if (!body.playerId) {
        return NextResponse.json(
          { error: "playerId is required when contractId is provided" },
          { status: 400 },
        );
      }

      try {
        const battle = startManualBattleSession(sessionId, body.playerId, body.contractId);
        return NextResponse.json({ sessionId, battle });
      } catch (error) {
        const player = session.engine.getState().players.find((item) => item.id === body.playerId);
        const queuedContractIds = player?.queue.map((contract) => contract.id) ?? [];
        return NextResponse.json(
          {
            error:
              error instanceof Error
                ? error.message
                : "Failed to start manual battle",
            playerId: body.playerId,
            requestedContractId: body.contractId,
            queuedContractIds,
          },
          { status: 400 },
        );
      }
    }

    const battle = startManualCampaignBattleSession(sessionId, body.sendHome);
    return NextResponse.json({ sessionId, battle });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to start manual battle" },
      { status: 400 },
    );
  }
}
