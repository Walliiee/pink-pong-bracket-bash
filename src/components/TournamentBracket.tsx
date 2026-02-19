import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users } from "lucide-react";

interface Team {
  id: string;
  player1: { id: string; name: string };
  player2: { id: string; name: string };
}

interface Match {
  id: string;
  round: number;
  match_number: number;
  team1?: Team;
  team2?: Team;
  winner?: Team;
  status: 'pending' | 'in_progress' | 'completed';
}

export const TournamentBracket = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
    
    // Subscribe to real-time updates for matches, teams, and participants
    const channel = supabase
      .channel('tournament-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => {
        fetchMatches();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, () => {
        fetchMatches();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participants' }, () => {
        fetchMatches();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMatches = async () => {
    try {
      const { data: matchesData, error } = await supabase
        .from('matches')
        .select(`
          *,
          team1:teams!matches_team1_id_fkey (
            id,
            player1:participants!teams_player1_id_fkey (id, name),
            player2:participants!teams_player2_id_fkey (id, name)
          ),
          team2:teams!matches_team2_id_fkey (
            id,
            player1:participants!teams_player1_id_fkey (id, name),
            player2:participants!teams_player2_id_fkey (id, name)
          ),
          winner:teams!matches_winner_id_fkey (
            id,
            player1:participants!teams_player1_id_fkey (id, name),
            player2:participants!teams_player2_id_fkey (id, name)
          )
        `)
        .order('round', { ascending: true })
        .order('match_number', { ascending: true });

      if (error) throw error;
      setMatches((matchesData as Match[]) || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoundName = (round: number, totalRounds: number) => {
    const fromEnd = totalRounds - round + 1;
    if (fromEnd === 1) return "Final";
    if (fromEnd === 2) return "Semi-Final";
    if (fromEnd === 3) return "Quarter-Final";
    return `Round ${round}`;
  };

  const groupedMatches = matches.reduce((acc, match) => {
    if (!acc[match.round]) acc[match.round] = [];
    acc[match.round].push(match);
    return acc;
  }, {} as Record<number, Match[]>);

  const totalRounds = Math.max(...Object.keys(groupedMatches).map(Number));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-primary text-xl">Loading tournament bracket...</div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <Card className="p-8 text-center bg-gradient-to-br from-pink-soft to-background">
        <Trophy className="w-16 h-16 mx-auto mb-4 text-primary" />
        <h3 className="text-2xl font-bold mb-2">Tournament Not Started</h3>
        <p className="text-muted-foreground">
          The tournament bracket will appear here once teams are generated and matches are created.
        </p>
      </Card>
    );
  }

  // Create a 16-team bracket structure (even with empty slots)
  const createBracketStructure = () => {
    // Define the complete 16-team bracket structure
    const bracketStructure = {
      round1: { left: 4, right: 4 }, // Quarter-finals: 8 matches total (4 each side)
      round2: { left: 2, right: 2 }, // Semi-finals: 4 matches total (2 each side) 
      round3: { left: 1, right: 1 }, // Finals: 2 matches total (1 each side)
      final: 1 // Championship: 1 match
    };

    // Fill with actual matches or create empty slots
    const createEmptyMatch = (round: number, matchNumber: number, side: 'left' | 'right'): Match => ({
      id: `empty-${round}-${matchNumber}-${side}`,
      round,
      match_number: matchNumber,
      status: 'pending' as const,
    });

    const leftSideMatches: Record<number, Match[]> = {};
    const rightSideMatches: Record<number, Match[]> = {};

    // Round 1 (8 matches - 4 left, 4 right)
    leftSideMatches[1] = [];
    rightSideMatches[1] = [];
    
    // Fill left side round 1
    for (let i = 0; i < 4; i++) {
      const existingMatch = matches.find(m => m.round === 1 && m.match_number === i + 1);
      leftSideMatches[1].push(existingMatch || createEmptyMatch(1, i + 1, 'left'));
    }
    
    // Fill right side round 1
    for (let i = 0; i < 4; i++) {
      const existingMatch = matches.find(m => m.round === 1 && m.match_number === i + 5);
      rightSideMatches[1].push(existingMatch || createEmptyMatch(1, i + 5, 'right'));
    }

    // Round 2 (4 matches - 2 left, 2 right)
    leftSideMatches[2] = [];
    rightSideMatches[2] = [];
    
    for (let i = 0; i < 2; i++) {
      const existingMatch = matches.find(m => m.round === 2 && m.match_number === i + 1);
      leftSideMatches[2].push(existingMatch || createEmptyMatch(2, i + 1, 'left'));
    }
    
    for (let i = 0; i < 2; i++) {
      const existingMatch = matches.find(m => m.round === 2 && m.match_number === i + 3);
      rightSideMatches[2].push(existingMatch || createEmptyMatch(2, i + 3, 'right'));
    }

    // Round 3 (2 matches - 1 left, 1 right) 
    leftSideMatches[3] = [];
    rightSideMatches[3] = [];
    
    const leftFinalMatch = matches.find(m => m.round === 3 && m.match_number === 1);
    leftSideMatches[3].push(leftFinalMatch || createEmptyMatch(3, 1, 'left'));
    
    const rightFinalMatch = matches.find(m => m.round === 3 && m.match_number === 2);
    rightSideMatches[3].push(rightFinalMatch || createEmptyMatch(3, 2, 'right'));

    // Final match (round 4)
    const finalMatch = matches.find(m => m.round === 4);

    return { 
      leftSideMatches, 
      rightSideMatches, 
      finalMatch: finalMatch || createEmptyMatch(4, 1, 'left'),
      semifinalRounds: [1, 2, 3] 
    };
  };

  const { leftSideMatches, rightSideMatches, finalMatch, semifinalRounds } = createBracketStructure();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-pink-hot bg-clip-text text-transparent">
          Tournament Bracket
        </h2>
        <p className="text-muted-foreground">Single elimination • Winner takes all!</p>
      </div>

      <div className="relative overflow-x-auto px-4">
        <div className="space-y-12 max-w-7xl mx-auto">
          {/* Tournament Rounds - Vertical Layout */}
          <div className="space-y-12">
            {semifinalRounds.map((round) => (
              <div key={round} className="space-y-6">
                <h3 className="text-xl font-bold text-center text-primary">
                  {getRoundName(round, 4)}
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12">
                  {/* Left Side */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-center text-muted-foreground">
                      Left Bracket
                    </h4>
                    <div className="grid gap-4" style={{
                      gridTemplateColumns: leftSideMatches[round]?.length > 2
                        ? 'repeat(2, 1fr)'
                        : `repeat(${Math.max(1, leftSideMatches[round]?.length || 0)}, 1fr)`
                    }}>
                      {leftSideMatches[round]?.map((match, index) => (
                        <Card
                          key={match.id}
                          className="p-3 sm:p-4 bg-card/50 backdrop-blur-sm border-pink-secondary/20 hover:border-primary/30 transition-all duration-300 min-w-0"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Badge 
                                variant={match.status === 'completed' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {match.id.startsWith('empty-') ? `Match ${index + 1}` : `M${match.match_number}`}
                              </Badge>
                              {match.status === 'completed' && match.winner && (
                                <Trophy className="w-4 h-4 text-yellow-500" />
                              )}
                            </div>

                            <div className="space-y-2">
                              {/* Team 1 */}
                              <div className={`flex items-center gap-2 p-2 sm:p-3 rounded-lg text-xs sm:text-sm transition-colors ${
                                match.winner?.id === match.team1?.id
                                  ? 'bg-gradient-to-r from-primary/20 to-pink-hot/10 border border-primary/30'
                                  : 'bg-muted/30'
                              }`}>
                                <Users className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                                <span className="font-medium truncate">
                                  {match.team1
                                    ? `${match.team1.player1.name} & ${match.team1.player2.name}`
                                    : 'Waiting for players...'
                                  }
                                </span>
                              </div>

                              <div className="text-center text-sm text-muted-foreground font-bold">VS</div>

                              {/* Team 2 */}
                              <div className={`flex items-center gap-2 p-2 sm:p-3 rounded-lg text-xs sm:text-sm transition-colors ${
                                match.winner?.id === match.team2?.id
                                  ? 'bg-gradient-to-r from-primary/20 to-pink-hot/10 border border-primary/30'
                                  : 'bg-muted/30'
                              }`}>
                                <Users className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                                <span className="font-medium truncate">
                                  {match.team2
                                    ? `${match.team2.player1.name} & ${match.team2.player2.name}`
                                    : 'Waiting for players...'
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Right Side */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-center text-muted-foreground">
                      Right Bracket
                    </h4>
                    <div className="grid gap-4" style={{
                      gridTemplateColumns: rightSideMatches[round]?.length > 2
                        ? 'repeat(2, 1fr)'
                        : `repeat(${Math.max(1, rightSideMatches[round]?.length || 0)}, 1fr)`
                    }}>
                      {rightSideMatches[round]?.map((match, index) => (
                        <Card
                          key={match.id}
                          className="p-3 sm:p-4 bg-card/50 backdrop-blur-sm border-pink-secondary/20 hover:border-primary/30 transition-all duration-300 min-w-0"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Badge 
                                variant={match.status === 'completed' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {match.id.startsWith('empty-') ? `Match ${index + 1}` : `M${match.match_number}`}
                              </Badge>
                              {match.status === 'completed' && match.winner && (
                                <Trophy className="w-4 h-4 text-yellow-500" />
                              )}
                            </div>

                            <div className="space-y-2">
                              {/* Team 1 */}
                              <div className={`flex items-center gap-2 p-2 sm:p-3 rounded-lg text-xs sm:text-sm transition-colors ${
                                match.winner?.id === match.team1?.id
                                  ? 'bg-gradient-to-r from-primary/20 to-pink-hot/10 border border-primary/30'
                                  : 'bg-muted/30'
                              }`}>
                                <Users className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                                <span className="font-medium truncate">
                                  {match.team1
                                    ? `${match.team1.player1.name} & ${match.team1.player2.name}`
                                    : 'Waiting for players...'
                                  }
                                </span>
                              </div>

                              <div className="text-center text-sm text-muted-foreground font-bold">VS</div>

                              {/* Team 2 */}
                              <div className={`flex items-center gap-2 p-2 sm:p-3 rounded-lg text-xs sm:text-sm transition-colors ${
                                match.winner?.id === match.team2?.id
                                  ? 'bg-gradient-to-r from-primary/20 to-pink-hot/10 border border-primary/30'
                                  : 'bg-muted/30'
                              }`}>
                                <Users className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                                <span className="font-medium truncate">
                                  {match.team2
                                    ? `${match.team2.player1.name} & ${match.team2.player2.name}`
                                    : 'Waiting for players...'
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Final Match */}
          <div className="flex flex-col items-center space-y-4 pt-8">
            <h3 className="text-xl sm:text-2xl font-bold text-center text-primary">🏆 Championship Final 🏆</h3>
            <Card className="p-4 sm:p-6 bg-gradient-to-r from-primary/10 to-pink-hot/10 border-primary/30 w-full max-w-md mx-auto">
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-yellow-500" />
                </div>

                <div className="space-y-3">
                  {/* Team 1 */}
                  <div className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg text-sm transition-colors ${
                    finalMatch.winner?.id === finalMatch.team1?.id
                      ? 'bg-gradient-to-r from-primary/30 to-pink-hot/20 border border-primary/50'
                      : 'bg-muted/30'
                  }`}>
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                    <span className="font-semibold truncate">
                      {finalMatch.team1
                        ? `${finalMatch.team1.player1.name} & ${finalMatch.team1.player2.name}`
                        : 'Waiting for finalist...'
                      }
                    </span>
                  </div>

                  <div className="text-center text-lg text-muted-foreground font-bold">VS</div>

                  {/* Team 2 */}
                  <div className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg text-sm transition-colors ${
                    finalMatch.winner?.id === finalMatch.team2?.id
                      ? 'bg-gradient-to-r from-primary/30 to-pink-hot/20 border border-primary/50'
                      : 'bg-muted/30'
                  }`}>
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                    <span className="font-semibold truncate">
                      {finalMatch.team2
                        ? `${finalMatch.team2.player1.name} & ${finalMatch.team2.player2.name}`
                        : 'Waiting for finalist...'
                      }
                    </span>
                  </div>
                </div>

                {finalMatch.status === 'completed' && finalMatch.winner && (
                  <div className="pt-4 border-t border-border/50">
                    <div className="text-center">
                      <span className="text-sm text-muted-foreground">🏆 Champions:</span>
                      <div className="font-bold text-lg text-primary">
                        {finalMatch.winner.player1.name} & {finalMatch.winner.player2.name}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};