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
      setMatches(matchesData as any || []);
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

  // Create a traditional bracket layout
  const createBracketLayout = () => {
    const rounds = Object.keys(groupedMatches).map(Number).sort((a, b) => a - b);
    const leftSideRounds = rounds.slice(0, Math.ceil(rounds.length / 2));
    const rightSideRounds = rounds.slice(Math.ceil(rounds.length / 2)).reverse();
    
    return { leftSideRounds, rightSideRounds, finalRound: rounds[rounds.length - 1] };
  };

  const { leftSideRounds, rightSideRounds, finalRound } = createBracketLayout();
  const finalMatch = groupedMatches[finalRound]?.[0];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-pink-hot bg-clip-text text-transparent">
          Tournament Bracket
        </h2>
        <p className="text-muted-foreground">Single elimination • Winner takes all!</p>
      </div>

      <div className="relative overflow-x-auto">
        <div className="flex justify-center items-center min-w-[1200px] p-8">
          {/* Left Side */}
          <div className="flex-1 space-y-8">
            {leftSideRounds.map((round) => (
              <div key={round} className="space-y-4">
                <h3 className="text-lg font-semibold text-center text-primary">
                  {getRoundName(round, totalRounds)}
                </h3>
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.max(1, groupedMatches[round]?.length || 0)}, 1fr)` }}>
                  {groupedMatches[round]?.map((match) => (
                    <Card 
                      key={match.id} 
                      className="p-3 bg-card/50 backdrop-blur-sm border-pink-secondary/20 hover:border-primary/30 transition-all duration-300"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge 
                            variant={match.status === 'completed' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            M{match.match_number}
                          </Badge>
                          {match.status === 'completed' && match.winner && (
                            <Trophy className="w-3 h-3 text-yellow-500" />
                          )}
                        </div>

                        <div className="space-y-1">
                          {/* Team 1 */}
                          <div className={`flex items-center gap-2 p-2 rounded text-xs transition-colors ${
                            match.winner?.id === match.team1?.id 
                              ? 'bg-gradient-to-r from-primary/20 to-pink-hot/10 border border-primary/30' 
                              : 'bg-muted/30'
                          }`}>
                            <Users className="w-3 h-3 text-primary" />
                            <span className="font-medium truncate">
                              {match.team1 
                                ? `${match.team1.player1.name} & ${match.team1.player2.name}`
                                : 'TBD'
                              }
                            </span>
                          </div>

                          <div className="text-center text-xs text-muted-foreground">vs</div>

                          {/* Team 2 */}
                          <div className={`flex items-center gap-2 p-2 rounded text-xs transition-colors ${
                            match.winner?.id === match.team2?.id 
                              ? 'bg-gradient-to-r from-primary/20 to-pink-hot/10 border border-primary/30' 
                              : 'bg-muted/30'
                          }`}>
                            <Users className="w-3 h-3 text-primary" />
                            <span className="font-medium truncate">
                              {match.team2 
                                ? `${match.team2.player1.name} & ${match.team2.player2.name}`
                                : 'TBD'
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Final Match */}
          {finalMatch && (
            <div className="mx-8 flex flex-col items-center">
              <h3 className="text-xl font-bold text-center text-primary mb-4">Final</h3>
              <Card className="p-4 bg-gradient-to-r from-primary/10 to-pink-hot/10 border-primary/30 min-w-[200px]">
                <div className="space-y-3">
                  <div className="flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-yellow-500" />
                  </div>

                  <div className="space-y-2">
                    {/* Team 1 */}
                    <div className={`flex items-center gap-2 p-2 rounded text-sm transition-colors ${
                      finalMatch.winner?.id === finalMatch.team1?.id 
                        ? 'bg-gradient-to-r from-primary/30 to-pink-hot/20 border border-primary/50' 
                        : 'bg-muted/30'
                    }`}>
                      <Users className="w-4 h-4 text-primary" />
                      <span className="font-medium">
                        {finalMatch.team1 
                          ? `${finalMatch.team1.player1.name} & ${finalMatch.team1.player2.name}`
                          : 'TBD'
                        }
                      </span>
                    </div>

                    <div className="text-center text-sm text-muted-foreground font-medium">VS</div>

                    {/* Team 2 */}
                    <div className={`flex items-center gap-2 p-2 rounded text-sm transition-colors ${
                      finalMatch.winner?.id === finalMatch.team2?.id 
                        ? 'bg-gradient-to-r from-primary/30 to-pink-hot/20 border border-primary/50' 
                        : 'bg-muted/30'
                    }`}>
                      <Users className="w-4 h-4 text-primary" />
                      <span className="font-medium">
                        {finalMatch.team2 
                          ? `${finalMatch.team2.player1.name} & ${finalMatch.team2.player2.name}`
                          : 'TBD'
                        }
                      </span>
                    </div>
                  </div>

                  {finalMatch.status === 'completed' && finalMatch.winner && (
                    <div className="pt-2 border-t border-border/50">
                      <div className="text-center">
                        <span className="text-xs text-muted-foreground">🏆 Champions:</span>
                        <div className="font-bold text-primary">
                          {finalMatch.winner.player1.name} & {finalMatch.winner.player2.name}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* Right Side */}
          <div className="flex-1 space-y-8">
            {rightSideRounds.map((round) => (
              <div key={round} className="space-y-4">
                <h3 className="text-lg font-semibold text-center text-primary">
                  {getRoundName(round, totalRounds)}
                </h3>
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.max(1, groupedMatches[round]?.length || 0)}, 1fr)` }}>
                  {groupedMatches[round]?.map((match) => (
                    <Card 
                      key={match.id} 
                      className="p-3 bg-card/50 backdrop-blur-sm border-pink-secondary/20 hover:border-primary/30 transition-all duration-300"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge 
                            variant={match.status === 'completed' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            M{match.match_number}
                          </Badge>
                          {match.status === 'completed' && match.winner && (
                            <Trophy className="w-3 h-3 text-yellow-500" />
                          )}
                        </div>

                        <div className="space-y-1">
                          {/* Team 1 */}
                          <div className={`flex items-center gap-2 p-2 rounded text-xs transition-colors ${
                            match.winner?.id === match.team1?.id 
                              ? 'bg-gradient-to-r from-primary/20 to-pink-hot/10 border border-primary/30' 
                              : 'bg-muted/30'
                          }`}>
                            <Users className="w-3 h-3 text-primary" />
                            <span className="font-medium truncate">
                              {match.team1 
                                ? `${match.team1.player1.name} & ${match.team1.player2.name}`
                                : 'TBD'
                              }
                            </span>
                          </div>

                          <div className="text-center text-xs text-muted-foreground">vs</div>

                          {/* Team 2 */}
                          <div className={`flex items-center gap-2 p-2 rounded text-xs transition-colors ${
                            match.winner?.id === match.team2?.id 
                              ? 'bg-gradient-to-r from-primary/20 to-pink-hot/10 border border-primary/30' 
                              : 'bg-muted/30'
                          }`}>
                            <Users className="w-3 h-3 text-primary" />
                            <span className="font-medium truncate">
                              {match.team2 
                                ? `${match.team2.player1.name} & ${match.team2.player2.name}`
                                : 'TBD'
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};