import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Sparkles } from "lucide-react";

interface SignUpFormProps {
  onSignUp: () => void;
  disabled?: boolean;
}

export const SignUpForm = ({ onSignUp, disabled = false }: SignUpFormProps) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name to join the tournament!",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('participants')
        .insert([{ name: name.trim() }]);

      if (error) throw error;

      toast({
        title: "Welcome to the tournament! 🏆",
        description: `${name} has been added to the beer pong tournament!`,
      });

      setName("");
      onSignUp();
    } catch (error: any) {
      console.error('Error signing up:', error);
      toast({
        title: "Sign up failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto bg-gradient-to-br from-card/80 to-pink-soft/30 backdrop-blur-sm border-pink-secondary/30">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <Sparkles className="w-6 h-6 text-primary" />
          Join the Tournament
        </CardTitle>
        <CardDescription>
          Sign up for the ultimate beer pong showdown!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Your Name
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading || disabled}
              className="transition-all duration-300 focus:ring-primary/50 focus:border-primary"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-primary to-pink-hot hover:from-pink-hot hover:to-primary transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl" 
            disabled={loading || disabled}
          >
            {loading ? (
              "Joining..."
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Join Tournament
              </>
            )}
          </Button>

          {disabled && (
            <p className="text-sm text-center text-muted-foreground">
              Registration is currently closed.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
};