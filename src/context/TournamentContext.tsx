import { useState, useCallback, type ReactNode } from "react";
import type { Participant, Team, Match, TournamentStatus } from "@/lib/types";
import { shuffle, buildBracketMatches, assignTeamsToBracket } from "@/lib/bracketUtils";
import { TournamentContext } from "@/context/tournament-context-value";

let nextId = 1;
function generateId(): string {
  return `local-${nextId++}-${Date.now()}`;
}

export function TournamentProvider({ children }: { children: ReactNode }) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [status, setStatus] = useState<TournamentStatus>("registration");

  const addParticipant = useCallback(
    (name: string, age: number, description: string) => {
      const participant: Participant = {
        id: generateId(),
        name,
        age,
        description,
        created_at: new Date().toISOString(),
      };
      setParticipants((prev) => [...prev, participant]);
    },
    [],
  );

  const removeParticipant = useCallback((id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const generateTeams = useCallback(() => {
    if (participants.length < 2) {
      throw new Error("Need at least 2 participants to form teams");
    }
    if (participants.length % 2 !== 0) {
      throw new Error("Need an even number of participants to form teams");
    }

    const shuffled = shuffle([...participants]);
    const newTeams: Team[] = [];

    for (let i = 0; i < shuffled.length - 1; i += 2) {
      newTeams.push({
        id: generateId(),
        player1: shuffled[i],
        player2: shuffled[i + 1],
      });
    }

    const emptyMatches = buildBracketMatches();
    const filledMatches = assignTeamsToBracket(newTeams, emptyMatches);

    setTeams(newTeams);
    setMatches(filledMatches);
    setStatus("teams_generated");

    return {
      teamsCreated: newTeams.length,
      message: `Successfully created ${newTeams.length} teams and randomly assigned them to bracket positions`,
    };
  }, [participants]);

  return (
    <TournamentContext.Provider
      value={{
        participants,
        teams,
        matches,
        status,
        addParticipant,
        removeParticipant,
        generateTeams,
      }}
    >
      {children}
    </TournamentContext.Provider>
  );
}
