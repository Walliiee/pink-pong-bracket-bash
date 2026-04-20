import { useState, useCallback, type ReactNode } from "react";
import type { Participant, Team, Match, TournamentStatus } from "@/lib/types";
import { shuffle, buildBracketMatches, assignTeamsToBracket } from "@/lib/bracketUtils";
import { TournamentContext } from "@/context/tournament-context-value";

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function TournamentProvider({ children }: { children: ReactNode }) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [status, setStatus] = useState<TournamentStatus>("registration");
  const [isGenerating, setIsGenerating] = useState(false);

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

    setIsGenerating(true);

    // Brief delay to show loading state
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
    setIsGenerating(false);

    return {
      teamsCreated: newTeams.length,
      message: `Successfully created ${newTeams.length} teams and randomly assigned them to bracket positions`,
    };
  }, [participants]);

  const setMatchWinner = useCallback((matchId: string, winningTeam: Team) => {
    setMatches((prev) => {
      const updated = prev.map((m) =>
        m.id === matchId
          ? { ...m, winner: winningTeam, status: "completed" as const }
          : m
      );

      // Advance winner to next round
      const currentMatch = prev.find((m) => m.id === matchId)!;
      const currentRound = currentMatch.round;
      const currentMatchNumber = currentMatch.match_number;

      // Calculate next round match
      const nextRound = currentRound + 1;
      const nextMatchNumber = Math.ceil(currentMatchNumber / 2);

      const nextMatch = updated.find(
        (m) => m.round === nextRound && m.match_number === nextMatchNumber
      );

      if (nextMatch) {
        const isTop = currentMatchNumber % 2 === 1;
        return updated.map((m) =>
          m.id === nextMatch.id
            ? {
                ...m,
                ...(isTop ? { team1: winningTeam } : { team2: winningTeam }),
                status: m.team1 && m.team2 ? "in_progress" as const : m.status,
              }
            : m
        );
      }

      // Check if tournament is complete
      const finalMatch = updated.find((m) => m.round === 4);
      if (finalMatch?.winner) {
        setStatus("completed");
      }

      return updated;
    });
  }, []);

  const resetTournament = useCallback(() => {
    setParticipants([]);
    setTeams([]);
    setMatches([]);
    setStatus("registration");
    setIsGenerating(false);
  }, []);

  return (
    <TournamentContext.Provider
      value={{
        participants,
        teams,
        matches,
        status,
        isGenerating,
        addParticipant,
        removeParticipant,
        generateTeams,
        setMatchWinner,
        resetTournament,
      }}
    >
      {children}
    </TournamentContext.Provider>
  );
}
