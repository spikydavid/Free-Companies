import { FieldOfHonourEngine } from "./engine";
import { loadContractsFromSheet1Csv } from "./contracts";
import type {
  ManualBattleConfirmResult,
  ManualCampaignState,
  ManualBattleState,
  RoundChoices,
  RoundResult,
  TroopCounts,
  TroopType,
} from "./types";

export interface GameSession {
  id: string;
  engine: FieldOfHonourEngine;
  roundHistory: RoundResult[];
  createdAt: string;
}

const sessions = new Map<string, GameSession>();

function seededRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

function generateSessionId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createSession(playerIds: string[], seed?: number): GameSession {
  const contracts = loadContractsFromSheet1Csv("data/contracts-sheet1.csv");
  const random = seed === undefined ? undefined : seededRandom(seed);
  const engine = new FieldOfHonourEngine({ playerIds, contracts, random });

  const session: GameSession = {
    id: generateSessionId(),
    engine,
    roundHistory: [],
    createdAt: new Date().toISOString(),
  };

  sessions.set(session.id, session);
  return session;
}

export function getSession(sessionId: string): GameSession | undefined {
  return sessions.get(sessionId);
}

export function playSessionRound(
  sessionId: string,
  options?: { auto?: boolean; choices?: RoundChoices },
): RoundResult {
  const session = sessions.get(sessionId);
  if (!session) {
    throw new Error("Session not found");
  }

  const auto = options?.auto ?? true;
  let roundResult: RoundResult;
  if (!auto && options?.choices) {
    roundResult = session.engine.playRound(options.choices);
  } else {
    roundResult = session.engine.playAutoRound();
  }

  session.roundHistory.push(roundResult);
  return roundResult;
}

export function scoreSession(sessionId: string) {
  const session = sessions.get(sessionId);
  if (!session) {
    throw new Error("Session not found");
  }

  return session.engine.scoreGame();
}

export function startManualBattleSession(
  sessionId: string,
  playerId: string,
  contractId: string,
): ManualBattleState {
  const session = sessions.get(sessionId);
  if (!session) {
    throw new Error("Session not found");
  }

  return session.engine.startManualBattle(playerId, contractId);
}

export function getManualBattleSession(sessionId: string): ManualBattleState {
  const session = sessions.get(sessionId);
  if (!session) {
    throw new Error("Session not found");
  }

  return session.engine.getManualBattleState();
}

export function rerollManualBattleSession(
  sessionId: string,
  type: TroopType,
  index: number,
): ManualBattleState {
  const session = sessions.get(sessionId);
  if (!session) {
    throw new Error("Session not found");
  }

  return session.engine.rerollManualBattleDie(type, index);
}

export function toggleManualBattleSacrificeSession(
  sessionId: string,
  type: TroopType,
  index: number,
): ManualBattleState {
  const session = sessions.get(sessionId);
  if (!session) {
    throw new Error("Session not found");
  }

  return session.engine.toggleManualBattleSacrifice(type, index);
}

export function confirmManualBattleSession(sessionId: string): ManualBattleConfirmResult {
  const session = sessions.get(sessionId);
  if (!session) {
    throw new Error("Session not found");
  }

  return session.engine.confirmManualBattle();
}

export function startManualCampaignSession(
  sessionId: string,
  playerId: string,
  contractIds: string[],
): ManualCampaignState {
  const session = sessions.get(sessionId);
  if (!session) {
    throw new Error("Session not found");
  }

  return session.engine.startManualCampaign(playerId, contractIds);
}

export function getManualCampaignSession(sessionId: string): ManualCampaignState {
  const session = sessions.get(sessionId);
  if (!session) {
    throw new Error("Session not found");
  }

  return session.engine.getManualCampaignState();
}

export function startManualCampaignBattleSession(
  sessionId: string,
  sendHome?: TroopCounts,
): ManualBattleState {
  const session = sessions.get(sessionId);
  if (!session) {
    throw new Error("Session not found");
  }

  return session.engine.startManualCampaignBattle(undefined, sendHome);
}