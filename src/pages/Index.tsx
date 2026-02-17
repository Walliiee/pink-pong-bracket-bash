import { useState, useEffect, useCallback } from "react";
import { getTournamentState } from "@/lib/api";
import type { TournamentState } from "@/lib/api";
import { useSocket } from "@/hooks/useSocket";
import { SignUpForm } from "@/components/SignUpForm";
import { ParticipantsList } from "@/components/ParticipantsList";
import { TournamentBracket } from "@/components/TournamentBracket";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Trophy, Sparkles } from "lucide-react";

const Index = () => {
  const [tournamentState, setTournamentState] = useState<TournamentState | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchTournamentState = useCallback(async () => {
    try {
      const data = await getTournamentState();
      setTournamentState(data);
    } catch (error) {
      console.error("Error fetching tournament state:", error);
    }
  }, []);

  useEffect(() => {
    fetchTournamentState();
  }, [fetchTournamentState]);

  // Real-time: re-fetch tournament state when it changes
  useSocket("tournament:changed", fetchTournamentState);

  const handleSignUp = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-pink-soft/20 to-pink-secondary/30">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="relative bg-gradient-to-r from-background/90 via-pink-soft/40 to-background/90">
          <div className="container mx-auto px-4 py-16 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Trophy className="w-12 h-12 text-primary" />
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-pink-hot to-pink-primary bg-clip-text text-transparent">
                PINK PONG
              </h1>
              <Sparkles className="w-12 h-12 text-pink-hot" />
            </div>
            
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
              Birthday Tournament Bash
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join the ultimate beer pong competition! Sign up, get randomly paired with a teammate, 
              and battle through our single-elimination tournament for glory!
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
              <Badge variant="secondary" className="text-sm px-4 py-2">
                Random Team Pairing
              </Badge>
              <Badge variant="secondary" className="text-sm px-4 py-2">
                Single Elimination
              </Badge>
              <Badge variant="secondary" className="text-sm px-4 py-2">
                Winner Takes All
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Sign Up & Participants */}
          <div className="space-y-8">
            <SignUpForm 
              onSignUp={handleSignUp}
              disabled={tournamentState?.status !== 'registration'}
            />
            <ParticipantsList key={refreshKey} />
          </div>

          {/* Middle Column - Tournament Bracket */}
          <div className="lg:col-span-2 space-y-8">
            <TournamentBracket />
          </div>
        </div>

        <Separator className="my-12" />
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-pink-soft/30 to-pink-secondary/30 border-t border-pink-secondary/20 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            Get ready for the ultimate birthday beer pong showdown!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
