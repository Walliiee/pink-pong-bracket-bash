import type { Team, Match } from "@/lib/types";

let matchIdCounter = 1;

/** Reset match ID counter (useful for tests / hot reloads) */
export function resetMatchIds() {
  matchIdCounter = 1;
}

/** Fisher-Yates shuffle */
export function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Build the full set of empty matches for a 16-team single-elimination bracket.
 * Round 1: 8 matches, Round 2: 4, Round 3: 2, Round 4 (final): 1
 */
export function buildBracketMatches(): Match[] {
  resetMatchIds();
  const matches: Match[] = [];
  const roundSizes = [8, 4, 2, 1];

  for (let round = 0; round < roundSizes.length; round++) {
    for (let m = 0; m < roundSizes[round]; m++) {
      matches.push({
        id: `match-${matchIdCounter++}`,
        round: round + 1,
        match_number: m + 1,
        status: "pending",
      });
    }
  }

  return matches;
}

/**
 * Randomly assign teams to round-1 bracket slots.
 * Returns a new array of matches with teams filled in.
 */
export function assignTeamsToBracket(teams: Team[], matches: Match[]): Match[] {
  const round1 = matches.filter((m) => m.round === 1);

  type Slot = { matchIndex: number; position: "team1" | "team2" };
  const slots: Slot[] = [];
  round1.forEach((match) => {
    const idx = matches.indexOf(match);
    slots.push({ matchIndex: idx, position: "team1" });
    slots.push({ matchIndex: idx, position: "team2" });
  });

  const shuffledSlots = shuffle([...slots]);
  const result = matches.map((m) => ({ ...m }));

  for (let i = 0; i < Math.min(teams.length, shuffledSlots.length); i++) {
    const { matchIndex, position } = shuffledSlots[i];
    result[matchIndex] = { ...result[matchIndex], [position]: teams[i] };
  }

  return result;
}
