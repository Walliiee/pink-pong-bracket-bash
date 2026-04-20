import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Users, Crown, Sparkles } from "lucide-react";
import { useTournament } from "@/hooks/use-tournament";
import type { Match } from "@/lib/types";

export const TournamentBracket = () => {
  const { matches } = useTournament();

  const getRoundName = (round: number, totalRounds: number) => {
    const fromEnd = totalRounds - round + 1;
    if (fromEnd === 1) return "Final";
    if (fromEnd === 2) return "Semi-Final";
    if (fromEnd === 3) return "Quarter-Final";
    return `Round ${round}`;
  };

  // Check if tournament is complete (final match has a winner)
  const isTournamentComplete = () => {
    const finalMatch = matches.find((m) => m.round === 4);
    return finalMatch?.status === "completed" && finalMatch?.winner;
  };

  const getChampions = () => {
    const finalMatch = matches.find((m) => m.round === 4);
    return finalMatch?.winner;
  };

  if (matches.length === 0) {
    return (
      <Card className="p-8 text-center bg-gradient-to-br from-pink-soft/50 to-background border-pink-secondary/30">
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <Trophy className="w-32 h-32 text-primary" />
          </div>
          <div className="relative">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-primary animate-pulse" />
            <h3 className="text-2xl font-bold mb-2">Tournament Not Started</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              The tournament bracket will appear here once teams are generated and
              matches are created.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Badge variant="secondary" className="px-3 py-1">
                <Sparkles className="w-3 h-3 mr-1" />
                16 players max
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                <Users className="w-3 h-3 mr-1" />
                Random teams
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                <Trophy className="w-3 h-3 mr-1" />
                Single elimination
              </Badge>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Tournament Complete - Show Winner Celebration!
  if (isTournamentComplete()) {
    const champions = getChampions();
    return (
      <div className="space-y-8">
        {/* Winner Celebration Banner */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-pink-hot/20 to-primary/20 animate-pulse" />
          <div className="relative bg-gradient-to-br from-primary/90 to-pink-hot/90 rounded-2xl p-8 text-center text-white shadow-2xl">
            {/* Confetti effect using CSS */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full animate-bounce"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    backgroundColor: ['#FFD700', '#FFA500', '#FF69B4', '#00CED1', '#32CD32'][i % 5],
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${1 + Math.random()}s`,
                  }}
                />
              ))}
            </div>
            
            <div className="relative">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <Crown className="w-20 h-20 text-yellow-300 animate-bounce" />
                  <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-200 animate-pulse" />
                  <Sparkles className="absolute -bottom-2 -left-2 w-6 h-6 text-yellow-200 animate-pulse" style={{ animationDelay: '0.5s' }} />
                </div>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold mb-2">🏆 CHAMPIONS 🏆</h2>
              <div className="text-xl md:text-2xl font-semibold mb-4">
                {champions && (
                  <div className="flex flex-col items-center gap-2">
                    <span>{champions.player1.name}</span>
                    <span className="text-lg opacity-80">&</span>
                    <span>{champions.player2.name}</span>
                  </div>
                )}
              </div>
              <p className="text-lg opacity-90">Congratulations on winning the Pink Pong Birthday Tournament!</p>
            </div>
          </div>
        </div>

        {/* Mini bracket showing final result */}
        <div className="text-center">
          <h3 className="text-xl font-bold mb-4 text-muted-foreground">Final Results</h3>
          <Card className="p-6 max-w-md mx-auto bg-gradient-to-br from-card/80 to-pink-soft/20">
            <div className="space-y-4">
              {matches.filter(m => m.round >= 3).map((match) => (
                <div key={match.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium text-muted-foreground">
                    {match.round === 4 ? 'Final' : `Semi ${match.match_number}`}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${match.winner?.id === match.team1?.id ? 'font-bold text-primary' : ''}`}>
                      {match.team1 ? `${match.team1.player1.name} & ${match.team1.player2.name}` : 'TBD'}
                    </span>
                    <span className="text-muted-foreground">vs</span>
                    <span className={`text-sm ${match.winner?.id === match.team2?.id ? 'font-bold text-primary' : ''}`}>
                      {match.team2 ? `${match.team2.player1.name} & ${match.team2.player2.name}` : 'TBD'}
                    </span>
                  </div>
                  {match.winner && (
                    <Trophy className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const createBracketStructure = () => {
    const createEmptyMatch = (
      round: number,
      matchNumber: number,
      side: "left" | "right",
    ): Match => ({
      id: `empty-${round}-${matchNumber}-${side}`,
      round,
      match_number: matchNumber,
      status: "pending" as const,
    });

    const leftSideMatches: Record<number, Match[]> = {};
    const rightSideMatches: Record<number, Match[]> = {};

    // Round 1 (8 matches - 4 left, 4 right)
    leftSideMatches[1] = [];
    rightSideMatches[1] = [];
    for (let i = 0; i < 4; i++) {
      const existing = matches.find(
        (m) => m.round === 1 && m.match_number === i + 1,
      );
      leftSideMatches[1].push(
        existing || createEmptyMatch(1, i + 1, "left"),
      );
    }
    for (let i = 0; i < 4; i++) {
      const existing = matches.find(
        (m) => m.round === 1 && m.match_number === i + 5,
      );
      rightSideMatches[1].push(
        existing || createEmptyMatch(1, i + 5, "right"),
      );
    }

    // Round 2 (4 matches - 2 left, 2 right)
    leftSideMatches[2] = [];
    rightSideMatches[2] = [];
    for (let i = 0; i < 2; i++) {
      const existing = matches.find(
        (m) => m.round === 2 && m.match_number === i + 1,
      );
      leftSideMatches[2].push(
        existing || createEmptyMatch(2, i + 1, "left"),
      );
    }
    for (let i = 0; i < 2; i++) {
      const existing = matches.find(
        (m) => m.round === 2 && m.match_number === i + 3,
      );
      rightSideMatches[2].push(
        existing || createEmptyMatch(2, i + 3, "right"),
      );
    }

    // Round 3 (2 matches - 1 left, 1 right)
    leftSideMatches[3] = [];
    rightSideMatches[3] = [];
    const leftFinal = matches.find(
      (m) => m.round === 3 && m.match_number === 1,
    );
    leftSideMatches[3].push(leftFinal || createEmptyMatch(3, 1, "left"));
    const rightFinal = matches.find(
      (m) => m.round === 3 && m.match_number === 2,
    );
    rightSideMatches[3].push(rightFinal || createEmptyMatch(3, 2, "right"));

    // Final match (round 4)
    const finalMatch =
      matches.find((m) => m.round === 4) || createEmptyMatch(4, 1, "left");

    return {
      leftSideMatches,
      rightSideMatches,
      finalMatch,
      semifinalRounds: [1, 2, 3],
    };
  };

  const { leftSideMatches, rightSideMatches, finalMatch, semifinalRounds } =
    createBracketStructure();

  const renderMatchCard = (match: Match, index: number) => (
    <Card
      key={match.id}
      className="p-2 sm:p-3 bg-card/50 backdrop-blur-sm border-pink-secondary/20 hover:border-primary/30 transition-all duration-300 min-w-0"
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Badge
            variant={match.status === "completed" ? "default" : "secondary"}
            className="text-xs px-1.5 py-0.5"
          >
            {match.id.startsWith("empty-")
              ? `M${index + 1}`
              : `M${match.match_number}`}
          </Badge>
          {match.status === "completed" && match.winner && (
            <Trophy className="w-3 h-3 text-yellow-500" />
          )}
        </div>

        <div className="space-y-1">
          <div
            className={`flex items-center gap-1 p-1.5 sm:p-2 rounded text-xs transition-colors ${
              match.winner?.id === match.team1?.id
                ? "bg-gradient-to-r from-primary/20 to-pink-hot/10 border border-primary/30"
                : "bg-muted/30"
            }`}
          >
            <Users className="w-3 h-3 text-primary flex-shrink-0" />
            <span className="font-medium truncate leading-tight">
              {match.team1
                ? `${match.team1.player1.name} & ${match.team1.player2.name}`
                : "Waiting..."}
            </span>
          </div>

          <div className="text-center text-xs text-muted-foreground font-bold py-0.5">VS</div>

          <div
            className={`flex items-center gap-1 p-1.5 sm:p-2 rounded text-xs transition-colors ${
              match.winner?.id === match.team2?.id
                ? "bg-gradient-to-r from-primary/20 to-pink-hot/10 border border-primary/30"
                : "bg-muted/30"
            }`}
          >
            <Users className="w-3 h-3 text-primary flex-shrink-0" />
            <span className="font-medium truncate leading-tight">
              {match.team2
                ? `${match.team2.player1.name} & ${match.team2.player2.name}`
                : "Waiting..."}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-pink-hot bg-clip-text text-transparent">
          Tournament Bracket
        </h2>
        <p className="text-sm md:text-base text-muted-foreground">
          Single elimination - Winner takes all!
        </p>
      </div>

      <div className="relative">
        {/* Mobile: Horizontal scroll wrapper */}
        <div className="lg:hidden overflow-x-auto pb-4 -mx-4 px-4">
          <div className="min-w-[800px] space-y-6">
            {semifinalRounds.map((round) => (
              <div key={round} className="space-y-3">
                <h3 className="text-base font-bold text-center text-primary">
                  {getRoundName(round, 4)}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {/* Left Side */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-center text-muted-foreground uppercase tracking-wider">
                      Left
                    </h4>
                    <div
                      className="grid gap-2"
                      style={{
                        gridTemplateColumns:
                          (leftSideMatches[round]?.length ?? 0) > 2
                            ? "repeat(2, 1fr)"
                            : `repeat(${Math.max(1, leftSideMatches[round]?.length ?? 0)}, 1fr)`,
                      }}
                    >
                      {leftSideMatches[round]?.map((match, index) =>
                        renderMatchCard(match, index),
                      )}
                    </div>
                  </div>

                  {/* Right Side */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-center text-muted-foreground uppercase tracking-wider">
                      Right
                    </h4>
                    <div
                      className="grid gap-2"
                      style={{
                        gridTemplateColumns:
                          (rightSideMatches[round]?.length ?? 0) > 2
                            ? "repeat(2, 1fr)"
                            : `repeat(${Math.max(1, rightSideMatches[round]?.length ?? 0)}, 1fr)`,
                      }}
                    >
                      {rightSideMatches[round]?.map((match, index) =>
                        renderMatchCard(match, index),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Final Match - Mobile */}
            <div className="flex flex-col items-center space-y-3 pt-4">
              <h3 className="text-lg font-bold text-center text-primary">
                Championship Final
              </h3>
              <Card className="p-4 bg-gradient-to-r from-primary/10 to-pink-hot/10 border-primary/30 w-full max-w-xs mx-auto">
                <div className="space-y-3">
                  <div className="flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-yellow-500" />
                  </div>

                  <div className="space-y-2">
                    <div
                      className={`flex items-center gap-2 p-2 rounded text-xs transition-colors ${
                        finalMatch.winner?.id === finalMatch.team1?.id
                          ? "bg-gradient-to-r from-primary/30 to-pink-hot/20 border border-primary/50"
                          : "bg-muted/30"
                      }`}
                    >
                      <Users className="w-3 h-3 text-primary flex-shrink-0" />
                      <span className="font-semibold truncate">
                        {finalMatch.team1
                          ? `${finalMatch.team1.player1.name} & ${finalMatch.team1.player2.name}`
                          : "Waiting..."}
                      </span>
                    </div>

                    <div className="text-center text-sm text-muted-foreground font-bold">VS</div>

                    <div
                      className={`flex items-center gap-2 p-2 rounded text-xs transition-colors ${
                        finalMatch.winner?.id === finalMatch.team2?.id
                          ? "bg-gradient-to-r from-primary/30 to-pink-hot/20 border border-primary/50"
                          : "bg-muted/30"
                      }`}
                    >
                      <Users className="w-3 h-3 text-primary flex-shrink-0" />
                      <span className="font-semibold truncate">
                        {finalMatch.team2
                          ? `${finalMatch.team2.player1.name} & ${finalMatch.team2.player2.name}`
                          : "Waiting..."}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Desktop: Normal layout */}
        <div className="hidden lg:block space-y-8 max-w-7xl mx-auto">
          <div className="space-y-8">
            {semifinalRounds.map((round) => (
              <div key={round} className="space-y-6">
                <h3 className="text-xl font-bold text-center text-primary">
                  {getRoundName(round, 4)}
                </h3>

                <div className="grid grid-cols-2 gap-8 xl:gap-12">
                  {/* Left Side */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-center text-muted-foreground">
                      Left Bracket
                    </h4>
                    <div
                      className="grid gap-4"
                      style={{
                        gridTemplateColumns:
                          (leftSideMatches[round]?.length ?? 0) > 2
                            ? "repeat(2, 1fr)"
                            : `repeat(${Math.max(1, leftSideMatches[round]?.length ?? 0)}, 1fr)`,
                      }}
                    >
                      {leftSideMatches[round]?.map((match, index) =>
                        renderMatchCard(match, index),
                      )}
                    </div>
                  </div>

                  {/* Right Side */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-center text-muted-foreground">
                      Right Bracket
                    </h4>
                    <div
                      className="grid gap-4"
                      style={{
                        gridTemplateColumns:
                          (rightSideMatches[round]?.length ?? 0) > 2
                            ? "repeat(2, 1fr)"
                            : `repeat(${Math.max(1, rightSideMatches[round]?.length ?? 0)}, 1fr)`,
                      }}
                    >
                      {rightSideMatches[round]?.map((match, index) =>
                        renderMatchCard(match, index),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Final Match - Desktop */}
          <div className="flex flex-col items-center space-y-4 pt-8">
            <h3 className="text-2xl font-bold text-center text-primary">
              Championship Final
            </h3>
            <Card className="p-6 bg-gradient-to-r from-primary/10 to-pink-hot/10 border-primary/30 w-full max-w-md mx-auto">
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-yellow-500" />
                </div>

                <div className="space-y-3">
                  <div
                    className={`flex items-center gap-3 p-4 rounded-lg text-sm transition-colors ${
                      finalMatch.winner?.id === finalMatch.team1?.id
                        ? "bg-gradient-to-r from-primary/30 to-pink-hot/20 border border-primary/50"
                        : "bg-muted/30"
                    }`}
                  >
                    <Users className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="font-semibold truncate">
                      {finalMatch.team1
                        ? `${finalMatch.team1.player1.name} & ${finalMatch.team1.player2.name}`
                        : "Waiting for finalist..."}
                    </span>
                  </div>

                  <div className="text-center text-lg text-muted-foreground font-bold">
                    VS
                  </div>

                  <div
                    className={`flex items-center gap-3 p-4 rounded-lg text-sm transition-colors ${
                      finalMatch.winner?.id === finalMatch.team2?.id
                        ? "bg-gradient-to-r from-primary/30 to-pink-hot/20 border border-primary/50"
                        : "bg-muted/30"
                    }`}
                  >
                    <Users className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="font-semibold truncate">
                      {finalMatch.team2
                        ? `${finalMatch.team2.player1.name} & ${finalMatch.team2.player2.name}`
                        : "Waiting for finalist..."}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
