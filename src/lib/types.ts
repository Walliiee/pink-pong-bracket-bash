export interface Participant {
  id: string;
  name: string;
  age: number | null;
  description: string | null;
  created_at: string;
}

export interface Team {
  id: string;
  player1: Participant;
  player2: Participant;
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

export type TournamentStatus =
  | "registration"
  | "teams_generated"
  | "in_progress"
  | "completed";
