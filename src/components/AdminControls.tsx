import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Settings, Users, Play, RotateCcw, Trophy } from "lucide-react";

interface TournamentState {
  id: string;
  status: 'registration' | 'teams_generated' | 'in_progress' | 'completed';
  current_round: number;
  total_rounds: number | null;
}

export const AdminControls = () => {
  const [tournamentState, setTournamentState] = useState<TournamentState | null>(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTournamentState();
    fetchParticipantCount();
  }, []);

  const fetchTournamentState = async () => {
    try {
      const { data, error } = await supabase
        .from('tournament_state')
        .select('*')
        .single();

      if (error) throw error;
      setTournamentState(data as TournamentState);
    } catch (error) {
      console.error('Error fetching tournament state:', error);
    }
  };

  const fetchParticipantCount = async () => {
    try {
      const { count, error } = await supabase
        .from('participants')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      setParticipantCount(count || 0);
    } catch (error) {
      console.error('Error fetching participant count:', error);
    }
  };

  const generateTeamsAndBracket = async () => {
    if (participantCount < 2) {
      toast({
        title: "Not enough participants",
        description: "You need at least 2 participants to start the tournament.",
        variant: "destructive",
      });
      return;
    }

    if (participantCount % 2 !== 0) {
      toast({
        title: "Odd number of participants",
        description: "You need an even number of participants to form teams.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Fetch all participants
      const { data: participants, error: participantsError } = await supabase
        .from('participants')
        .select('*')
        .order('created_at');

      if (participantsError) throw participantsError;

      // Shuffle participants randomly
      const shuffled = [...participants].sort(() => Math.random() - 0.5);
      
      // Create teams (pairs)
      const teams = [];
      for (let i = 0; i < shuffled.length; i += 2) {
        teams.push({
          player1_id: shuffled[i].id,
          player2_id: shuffled[i + 1].id,
        });
      }

      // Insert teams
      const { data: createdTeams, error: teamsError } = await supabase
        .from('teams')
        .insert(teams)
        .select('*');

      if (teamsError) throw teamsError;

      // Generate tournament bracket
      const teamCount = createdTeams.length;
      const totalRounds = Math.ceil(Math.log2(teamCount));
      
      // Create first round matches
      const matches = [];
      for (let i = 0; i < teamCount; i += 2) {
        matches.push({
          round: 1,
          match_number: Math.floor(i / 2) + 1,
          team1_id: createdTeams[i].id,
          team2_id: createdTeams[i + 1].id,
          status: 'pending' as const,
        });
      }

      // Create subsequent round matches (empty for now)
      for (let round = 2; round <= totalRounds; round++) {
        const matchesInRound = Math.pow(2, totalRounds - round);
        for (let match = 1; match <= matchesInRound; match++) {
          matches.push({
            round,
            match_number: match,
            team1_id: null,
            team2_id: null,
            status: 'pending' as const,
          });
        }
      }

      // Insert matches
      const { error: matchesError } = await supabase
        .from('matches')
        .insert(matches);

      if (matchesError) throw matchesError;

      // Update tournament state
      const { error: stateError } = await supabase
        .from('tournament_state')
        .update({
          status: 'in_progress',
          total_rounds: totalRounds,
        })
        .eq('id', tournamentState?.id);

      if (stateError) throw stateError;

      toast({
        title: "Tournament Started! 🏆",
        description: `${teamCount} teams created with ${totalRounds} rounds planned!`,
      });

      fetchTournamentState();
    } catch (error: any) {
      console.error('Error generating tournament:', error);
      toast({
        title: "Failed to start tournament",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetTournament = async () => {
    if (!confirm("Are you sure you want to reset the entire tournament? This will delete all participants, teams, and matches.")) {
      return;
    }

    setLoading(true);
    try {
      // Delete in correct order due to foreign key constraints
      await supabase.from('matches').delete().gte('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('teams').delete().gte('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('participants').delete().gte('id', '00000000-0000-0000-0000-000000000000');
      
      // Reset tournament state
      await supabase
        .from('tournament_state')
        .update({
          status: 'registration',
          current_round: 1,
          total_rounds: null,
        })
        .eq('id', tournamentState?.id);

      toast({
        title: "Tournament Reset",
        description: "All data has been cleared. Ready for new participants!",
      });

      fetchTournamentState();
      fetchParticipantCount();
    } catch (error: any) {
      console.error('Error resetting tournament:', error);
      toast({
        title: "Reset failed",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (!tournamentState) return null;
    
    const statusConfig = {
      registration: { label: "Registration Open", variant: "default" as const },
      teams_generated: { label: "Teams Generated", variant: "secondary" as const },
      in_progress: { label: "Tournament Active", variant: "default" as const },
      completed: { label: "Tournament Complete", variant: "default" as const },
    };

    const config = statusConfig[tournamentState.status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Card className="bg-gradient-to-br from-card/80 to-pink-soft/30 backdrop-blur-sm border-pink-secondary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          Tournament Admin
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span>Participants: {participantCount}</span>
          </div>
          {tournamentState?.total_rounds && (
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" />
              <span>Rounds: {tournamentState.total_rounds}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {tournamentState?.status === 'registration' && (
            <Button
              onClick={generateTeamsAndBracket}
              disabled={loading || participantCount < 2 || participantCount % 2 !== 0}
              className="flex-1 bg-gradient-to-r from-primary to-pink-hot hover:from-pink-hot hover:to-primary"
            >
              <Play className="w-4 h-4 mr-2" />
              {loading ? "Starting..." : "Start Tournament"}
            </Button>
          )}
          
          <Button
            onClick={resetTournament}
            disabled={loading}
            variant="outline"
            className="border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>

        {participantCount > 0 && participantCount % 2 !== 0 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ You need an even number of participants to form teams.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};