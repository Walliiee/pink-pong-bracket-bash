import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Trophy, Trash2, Shuffle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTournament } from "@/hooks/use-tournament";

export const ParticipantsList = () => {
  const { participants, removeParticipant, generateTeams } = useTournament();
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
        title: "Teams Generated!",
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

  return (
    <Card className="bg-gradient-to-br from-card/80 to-pink-soft/30 backdrop-blur-sm border-pink-secondary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Tournament Participants
          <Badge variant="secondary" className="ml-2">
            {participants.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {participants.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">
              No participants yet. Be the first to join!
            </p>
          </div>
        ) : (
          <div className="grid gap-2 max-h-64 overflow-y-auto">
            {participants.map((participant, index) => (
              <div
                key={participant.id}
                className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/30 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-primary to-pink-hot text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{participant.name}</span>
                      {participant.age && (
                        <Badge variant="outline" className="text-xs">
                          {participant.age}
                        </Badge>
                      )}
                    </div>
                    {participant.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {participant.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
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
        )}

        {participants.length >= 2 && participants.length % 2 === 0 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
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
                className="bg-gradient-to-r from-primary to-pink-hot hover:from-primary/90 hover:to-pink-hot/90 text-white"
                size="sm"
              >
                <Shuffle className="w-4 h-4 mr-2" />
                Generate Teams
              </Button>
            </div>
          </div>
        )}

        {participants.length > 0 && participants.length % 2 !== 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> You need an even number of participants to
              form teams. One more player needed!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
