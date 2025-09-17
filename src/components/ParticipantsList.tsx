import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Trophy } from "lucide-react";

interface Participant {
  id: string;
  name: string;
  created_at: string;
}

export const ParticipantsList = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParticipants();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('participants-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participants' }, () => {
        fetchParticipants();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setParticipants(data || []);
    } catch (error) {
      console.error('Error fetching participants:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-card/80 to-pink-soft/30 backdrop-blur-sm border-pink-secondary/30">
        <CardContent className="p-6">
          <div className="animate-pulse text-center">Loading participants...</div>
        </CardContent>
      </Card>
    );
  }

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
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-primary to-pink-hot text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <span className="font-medium">{participant.name}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  #{index + 1}
                </Badge>
              </div>
            ))}
          </div>
        )}
        
        {participants.length > 0 && participants.length % 2 !== 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> You need an even number of participants to form teams. 
              {participants.length % 2 !== 0 && " One more player needed!"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};