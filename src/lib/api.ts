const BASE = "/api";

async function request<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

// ── Participants ──────────────────────────────────────────────

export interface Participant {
  id: string;
  name: string;
  age: number | null;
  description: string | null;
  created_at: string;
}

export function getParticipants(): Promise<Participant[]> {
  return request("/participants");
}

export function addParticipant(data: {
  name: string;
  age?: number;
  description?: string;
}): Promise<Participant> {
  return request("/participants", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function removeParticipant(id: string): Promise<{ success: boolean }> {
  return request(`/participants/${id}`, { method: "DELETE" });
}

// ── Matches ───────────────────────────────────────────────────

export interface Team {
  id: string;
  player1: { id: string; name: string };
  player2: { id: string; name: string };
}

export interface Match {
  id: string;
  round: number;
  match_number: number;
  team1?: Team;
  team2?: Team;
  winner?: Team;
  status: "pending" | "in_progress" | "completed";
}

export function getMatches(): Promise<Match[]> {
  return request("/matches");
}

export function initializeBracket(): Promise<{ success: boolean }> {
  return request("/matches/initialize", { method: "POST" });
}

// ── Tournament ────────────────────────────────────────────────

export interface TournamentState {
  id: string;
  status: "registration" | "teams_generated" | "in_progress" | "completed";
  current_round: number | null;
  total_rounds: number | null;
  updated_at: string;
}

export function getTournamentState(): Promise<TournamentState> {
  return request("/tournament-state");
}

export function generateTeams(): Promise<{
  success: boolean;
  teamsCreated: number;
  message: string;
}> {
  return request("/tournament/generate-teams", { method: "POST" });
}
