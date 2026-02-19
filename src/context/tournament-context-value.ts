import { createContext } from "react";
import type { Participant, Team, Match, TournamentStatus } from "@/lib/types";

export interface TournamentContextValue {
  participants: Participant[];
  teams: Team[];
  matches: Match[];
  status: TournamentStatus;
  addParticipant: (name: string, age: number, description: string) => void;
  removeParticipant: (id: string) => void;
  generateTeams: () => { teamsCreated: number; message: string };
}

export const TournamentContext = createContext<TournamentContextValue | null>(
  null,
);
