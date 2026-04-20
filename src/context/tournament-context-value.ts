import { createContext } from "react";
import type { Participant, Team, Match, TournamentStatus } from "@/lib/types";

export interface TournamentContextValue {
  participants: Participant[];
  teams: Team[];
  matches: Match[];
  status: TournamentStatus;
  isGenerating: boolean;
  addParticipant: (name: string, age: number, description: string) => void;
  removeParticipant: (id: string) => void;
  generateTeams: () => { teamsCreated: number; message: string };
  setMatchWinner: (matchId: string, winningTeam: Team) => void;
  resetTournament: () => void;
}

export const TournamentContext = createContext<TournamentContextValue | null>(null);
