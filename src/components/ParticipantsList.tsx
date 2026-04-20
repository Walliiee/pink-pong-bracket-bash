import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Trophy, Trash2, Shuffle, Info, UserPlus, Swords } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTournament } from "@/hooks/use-tournament";

export const ParticipantsList = () => {
  const { participants, teams, removeParticipant, generateTeams, status } = useTournament();
  const { toast } = useToast();

  const handleDelete = (id: string, name: string) => {
    removeParticipant(id);
    toast({
      title: "Participant removed",
      description: `${name} has been removed from the tournament.`,
    });
  };

  const handleGenerateTeams = () => {
    try {
      const result = generateTeams();
      toast({
        title: "🎉 Teams Generated!",
        description: result.message,
      });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to generate teams. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Empty state - no participants yet
  if (participants.length === 0 && teams.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-card/80 to-pink-soft/30 backdrop-blur-sm border-pink-secondary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Tournament Participants
            <Badge variant="secondary" className="ml-2">0</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 space-y-4">
            <div className="relative inline-block">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-pink-soft to-pink-secondary/30 rounded-full flex items-center justify-center">
                <UserPlus className="w-10 h-10 text-primary/60" />
              </div>
              <div className="absolute -top-1 -right-1">
                <div className="w-6 h-6 bg-primary text-white text-xs rounded-full flex items-center justify-center animate-pulse">+1</div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-muted-foreground">No Participants Yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Be the first to join! Fill out the form above to sign up for the tournament.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <Badge variant="outline" className="text-xs">
                <Swords className="w-3 h-3 mr-1" />
                Max 16 players
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Shuffle className="w-3 h-3 mr-1" />
                Random teams
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Teams generated - show team view
  if (teams.length > 0) {
    return (
      <Card className="bg-gradient-to-br from-card/80 to-pink-soft/30 backdrop-blur-sm border-pink-secondary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Tournament Teams
            <Badge variant="secondary" className="ml-2">{teams.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {teams.map((team, index) => (
              <div
                key={team.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/30 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-primary to-pink-hot text-white text-sm font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {team.player1.name} & {team.player2.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {team.player1.description} • {team.player2.description}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">
                Teams are set! The tournament bracket has been generated. Check the bracket to see the matchups!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Registration phase - show participant list
  return (
    <Card className="bg-gradient-to-br from-card/80 to-pink-soft/30 backdrop-blur-sm border-pink-secondary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Tournament Participants
          <Badge variant="secondary" className="ml-2">
            {participants.length}/16
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 max-h-64 overflow-y-auto pr-1">
          {participants.map((participant, index) => (
            <div
              key={participant.id}
              className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/30 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-primary to-pink-hot text-white text-sm font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium truncate">{participant.name}</span>
                    {participant.age && (
                      <Badge variant="outline" className="text-xs flex-shrink-0">
                        {participant.age}y
                      </Badge>
                    )}
                  </div>
                  {participant.description && (
                    <p className="text-sm text-muted-foreground truncate">
                      {participant.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    handleDelete(participant.id, participant.name)
                  }
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Action area */}
        <div className="mt-4">
          {participants.length >= 2 && participants.length % 2 === 0 && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex-1">
                  <p className="text-sm text-green-800 font-medium">
                    Ready to generate teams!
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {participants.length} participants will form{" "}
                    {participants.length / 2} teams
                  </p>
                </div>
                <Button
                  onClick={handleGenerateTeams}
                  className="bg-gradient-to-r from-primary to-pink-hot hover:from-primary/90 hover:to-pink-hot/90 text-white flex-shrink-0"
                  size="sm"
                >
                  <Shuffle className="w-4 h-4 mr-2" />
                  Generate Teams
                </Button>
              </div>
            </div>
          )}

          {participants.length > 0 && participants.length % 2 !== 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  <strong>Need one more player:</strong> Teams require an even number of participants. 
                  {16 - participants.length > 0 ? `${16 - participants.length} spots still available!` : "Ask someone to join!"}
                </p>
              </div>
            </div>
          )}

          {participants.length > 0 && participants.length < 2 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  <strong>Need more players:</strong> At least 2 participants are needed to create a team.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
