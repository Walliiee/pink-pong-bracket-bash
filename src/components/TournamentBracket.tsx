import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Users, Crown, Sparkles, RotateCcw } from "lucide-react";
import { useTournament } from "@/hooks/use-tournament";
import type { Team, Match } from "@/lib/types";

/* ─── CSS Confetti ─── */
const confettiStyles = `
@keyframes confettiFall {
  0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
  100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
}
@keyframes confettiSway {
  0%, 100% { margin-left: 0; }
  50% { margin-left: 30px; }
}
.confetti-piece {
  position: fixed;
  width: 10px;
  height: 10px;
  top: -10px;
  z-index: 9999;
  pointer-events: none;
  animation: confettiFall 3s ease-in forwards, confettiSway 1.5s ease-in-out infinite;
}
`;

function ConfettiOverlay({ champion }: { champion: Team }) {
  const colors = ['#FFD700', '#FF69B4', '#00CED1', '#FFA500', '#7B68EE', '#32CD32', '#FF4500', '#1E90FF'];
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    color: colors[i % colors.length],
    delay: `${Math.random() * 2}s`,
    duration: `${2 + Math.random() * 2}s`,
    size: `${6 + Math.random() * 10}px`,
    shape: i % 3 === 0 ? '50%' : i % 3 === 1 ? '0' : '2px',
  }));

  return (
    <>
      <style>{confettiStyles}</style>
      {/* Confetti pieces */}
      {pieces.map((p, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: p.left,
            backgroundColor: p.color,
            animationDelay: p.delay,
            animationDuration: p.duration,
            width: p.size,
            height: p.size,
            borderRadius: p.shape,
          }}
        />
      ))}

      {/* Winner overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="text-center p-8 md:p-12 max-w-lg mx-4 animate-bounce">
          <div className="text-8xl md:text-9xl mb-4">🏆</div>
          <div className="text-5xl md:text-6xl font-black text-white mb-2">
            {champion.player1.name} & {champion.player2.name}
          </div>
          <div className="text-3xl md:text-4xl font-bold text-yellow-300 tracking-widest mb-6">
            CHAMPION!
          </div>
          <p className="text-lg text-white/80 mb-8">
            Congratulations on winning the Pink Pong Birthday Tournament!
          </p>
          <button onClick={resetTournament}
            className="px-8 py-3 bg-gradient-to-r from-primary to-pink-hot text-white font-bold rounded-full text-lg hover:scale-105 transition-transform shadow-2xl"
          >
            <RotateCcw className="w-5 h-5 inline mr-2" />
            Play Again
          </button>
        </div>
      </div>
    </>
  );
}

export const TournamentBracket = () => {
  const { matches, status, setMatchWinner, resetTournament } = useTournament();
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);

  const getRoundName = (round: number, totalRounds: number) => {
    const fromEnd = totalRounds - round + 1;
    if (fromEnd === 1) return "Final";
    if (fromEnd === 2) return "Semi-Final";
    if (fromEnd === 3) return "Quarter-Final";
    return `Round ${round}`;
  };

  const isTournamentComplete = () => {
    const finalMatch = matches.find((m) => m.round === 4);
    return finalMatch?.status === "completed" && finalMatch?.winner;
  };

  const getChampions = () => {
    const finalMatch = matches.find((m) => m.round === 4);
    return finalMatch?.winner;
  };

  // Empty state — no bracket yet
  if (matches.length === 0) {
    return (
      <Card className="p-8 text-center bg-gradient-to-br from-pink-soft/50 to-background border-pink-secondary/30">
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <Trophy className="w-32 h-32 text-primary" />
          </div>
          <div className="relative">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-primary animate-pulse" />
            <h3 className="text-2xl font-bold mb-2">Generate the Bracket to See Matchups</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              The tournament bracket will appear here once teams are generated and matches are created.
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

  // Tournament Complete — Show Winner Celebration!
  if (isTournamentComplete()) {
    const champions = getChampions();
    if (champions) {
      return <ConfettiOverlay champion={champions} />;
    }
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
      const existing = matches.find((m) => m.round === 1 && m.match_number === i + 1);
      leftSideMatches[1].push(existing || createEmptyMatch(1, i + 1, "left"));
    }
    for (let i = 0; i < 4; i++) {
      const existing = matches.find((m) => m.round === 1 && m.match_number === i + 5);
      rightSideMatches[1].push(existing || createEmptyMatch(1, i + 5, "right"));
    }

    // Round 2 (4 matches - 2 left, 2 right)
    leftSideMatches[2] = [];
    rightSideMatches[2] = [];
    for (let i = 0; i < 2; i++) {
      const existing = matches.find((m) => m.round === 2 && m.match_number === i + 1);
      leftSideMatches[2].push(existing || createEmptyMatch(2, i + 1, "left"));
    }
    for (let i = 0; i < 2; i++) {
      const existing = matches.find((m) => m.round === 2 && m.match_number === i + 3);
      rightSideMatches[2].push(existing || createEmptyMatch(2, i + 3, "right"));
    }

    // Round 3 (2 matches - 1 left, 1 right)
    leftSideMatches[3] = [];
    rightSideMatches[3] = [];
    const leftFinal = matches.find((m) => m.round === 3 && m.match_number === 1);
    leftSideMatches[3].push(leftFinal || createEmptyMatch(3, 1, "left"));
    const rightFinal = matches.find((m) => m.round === 3 && m.match_number === 2);
    rightSideMatches[3].push(rightFinal || createEmptyMatch(3, 2, "right"));

    // Final match (round 4)
    const finalMatch = matches.find((m) => m.round === 4) || createEmptyMatch(4, 1, "left");

    return { leftSideMatches, rightSideMatches, finalMatch, semifinalRounds: [1, 2, 3] };
  };

  const { leftSideMatches, rightSideMatches, finalMatch, semifinalRounds } = createBracketStructure();

  const handleSelectWinner = (matchId: string, team: Team) => {
    setMatchWinner(matchId, team);
    setSelectedMatch(null);
  };

  const renderMatchCard = (match: Match, index: number) => {
    const isSelectable = match.team1 && match.team2 && match.status !== "completed";
    const isSelected = selectedMatch === match.id;

    return (
      <Card
        key={match.id}
        className={`p-2 sm:p-3 backdrop-blur-sm transition-all duration-300 min-w-0 ${
          match.status === "completed"
            ? "bg-card/80 border-primary/40"
            : isSelectable
            ? "bg-card/60 border-pink-hot/40 cursor-pointer hover:border-primary/60"
            : "bg-card/50 border-pink-secondary/20"
        }`}
        onClick={() => isSelectable && setSelectedMatch(isSelected ? null : match.id)}
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge
              variant={match.status === "completed" ? "default" : "secondary"}
              className="text-xs px-1.5 py-0.5"
            >
              {match.id.startsWith("empty-") ? `M${index + 1}` : `M${match.match_number}`}
            </Badge>
            {match.status === "completed" && match.winner && (
              <Trophy className="w-3 h-3 text-yellow-500" />
            )}
          </div>

          <div className="space-y-1">
            {[match.team1, match.team2].map((team, teamIdx) => {
              const isWinner = match.winner?.id === team?.id;
              const canClick = isSelected && team && match.status !== "completed";

              return (
                <div
                  key={teamIdx}
                  className={`flex items-center gap-1 p-1.5 sm:p-2 rounded text-xs transition-colors ${
                    isWinner
                      ? "bg-gradient-to-r from-primary/20 to-pink-hot/10 border border-primary/30"
                      : canClick
                      ? "bg-pink-soft/30 border border-pink-hot/30 cursor-pointer hover:bg-pink-hot/20"
                      : "bg-muted/30"
                  }`}
                  onClick={canClick ? (e) => { e.stopPropagation(); handleSelectWinner(match.id, team!); } : undefined}
                >
                  <Users className="w-3 h-3 text-primary flex-shrink-0" />
                  <span className={`font-medium truncate leading-tight ${isWinner ? 'text-primary' : ''}`}>
                    {team ? `${team.player1.name} & ${team.player2.name}` : "Waiting..."}
                  </span>
                  {isSelected && team && match.status !== "completed" && (
                    <span className="ml-auto text-[10px] text-pink-hot font-bold">TAP</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-pink-hot bg-clip-text text-transparent">
          Tournament Bracket
        </h2>
        <p className="text-sm md:text-base text-muted-foreground">
          Tap a match to select the winner
        </p>
      </div>

      {/* Desktop layout */}
      <div className="hidden lg:block space-y-8 max-w-7xl mx-auto">
        {semifinalRounds.map((round) => (
          <div key={round} className="space-y-6">
            <h3 className="text-xl font-bold text-center text-primary">
              {getRoundName(round, 4)}
            </h3>
            <div className="grid grid-cols-2 gap-8 xl:gap-12">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-center text-muted-foreground">Left Bracket</h4>
                <div
                  className="grid gap-4"
                  style={{
                    gridTemplateColumns: (leftSideMatches[round]?.length ?? 0) > 2 ? "repeat(2, 1fr)" : `repeat(${Math.max(1, leftSideMatches[round]?.length ?? 0)}, 1fr)`,
                  }}
                >
                  {leftSideMatches[round]?.map((match, index) => renderMatchCard(match, index))}
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-center text-muted-foreground">Right Bracket</h4>
                <div
                  className="grid gap-4"
                  style={{
                    gridTemplateColumns: (rightSideMatches[round]?.length ?? 0) > 2 ? "repeat(2, 1fr)" : `repeat(${Math.max(1, rightSideMatches[round]?.length ?? 0)}, 1fr)`,
                  }}
                >
                  {rightSideMatches[round]?.map((match, index) => renderMatchCard(match, index))}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Final Match - Desktop */}
        <div className="flex flex-col items-center space-y-4 pt-8">
          <h3 className="text-2xl font-bold text-center text-primary">🏆 Championship Final</h3>
          <Card className="p-6 bg-gradient-to-r from-primary/10 to-pink-hot/10 border-primary/30 w-full max-w-md mx-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <Crown className="w-8 h-8 text-yellow-500" />
              </div>
              <div className="space-y-3">
                {[finalMatch.team1, finalMatch.team2].map((team, idx) => {
                  const isWinner = finalMatch.winner?.id === team?.id;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 p-4 rounded-lg text-sm transition-colors ${
                        isWinner
                          ? "bg-gradient-to-r from-primary/30 to-pink-hot/20 border border-primary/50"
                          : "bg-muted/30"
                      }`}
                    >
                      <Users className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="font-semibold truncate">
                        {team ? `${team.player1.name} & ${team.player2.name}` : "Waiting for finalist..."}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Mobile layout — horizontal scroll */}
      <div className="lg:hidden overflow-x-auto pb-4 -mx-4 px-4">
        <div className="min-w-[800px] space-y-6">
          {semifinalRounds.map((round) => (
            <div key={round} className="space-y-3">
              <h3 className="text-base font-bold text-center text-primary">
                {getRoundName(round, 4)}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-center text-muted-foreground uppercase tracking-wider">Left</h4>
                  <div className="grid gap-2" style={{ gridTemplateColumns: (leftSideMatches[round]?.length ?? 0) > 2 ? "repeat(2, 1fr)" : `repeat(${Math.max(1, leftSideMatches[round]?.length ?? 0)}, 1fr)` }}>
                    {leftSideMatches[round]?.map((match, index) => renderMatchCard(match, index))}
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-center text-muted-foreground uppercase tracking-wider">Right</h4>
                  <div className="grid gap-2" style={{ gridTemplateColumns: (rightSideMatches[round]?.length ?? 0) > 2 ? "repeat(2, 1fr)" : `repeat(${Math.max(1, rightSideMatches[round]?.length ?? 0)}, 1fr)` }}>
                    {rightSideMatches[round]?.map((match, index) => renderMatchCard(match, index))}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Final Match - Mobile */}
          <div className="flex flex-col items-center space-y-3 pt-4">
            <h3 className="text-lg font-bold text-center text-primary">🏆 Championship Final</h3>
            <Card className="p-4 bg-gradient-to-r from-primary/10 to-pink-hot/10 border-primary/30 w-full max-w-xs mx-auto">
              <div className="space-y-3">
                <div className="flex items-center justify-center">
                  <Crown className="w-6 h-6 text-yellow-500" />
                </div>
                {[finalMatch.team1, finalMatch.team2].map((team, idx) => {
                  const isWinner = finalMatch.winner?.id === team?.id;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 p-2 rounded text-xs transition-colors ${
                        isWinner ? "bg-gradient-to-r from-primary/30 to-pink-hot/20 border border-primary/50" : "bg-muted/30"
                      }`}
                    >
                      <Users className="w-3 h-3 text-primary flex-shrink-0" />
                      <span className="font-semibold truncate">
                        {team ? `${team.player1.name} & ${team.player2.name}` : "Waiting..."}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Play Again button when tournament is running */}
      {status !== "registration" && !isTournamentComplete() && (
        <div className="text-center pt-4">
          <Button
            variant="outline"
            onClick={resetTournament}
            className="text-muted-foreground"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Tournament
          </Button>
        </div>
      )}
    </div>
  );
};
