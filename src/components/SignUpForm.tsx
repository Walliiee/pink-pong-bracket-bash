import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Sparkles, AlertCircle } from "lucide-react";
import { useTournament } from "@/hooks/use-tournament";

export const SignUpForm = () => {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [description, setDescription] = useState("");
  const [touched, setTouched] = useState({ name: false, age: false, description: false });
  const { toast } = useToast();
  const { addParticipant, status, participants } = useTournament();

  const disabled = status !== "registration";
  const participantCount = participants.length;
  const spotsRemaining = Math.max(0, 16 - participantCount);
  const isFull = participantCount >= 16;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name to join the tournament!",
        variant: "destructive",
      });
      return;
    }

    if (!age.trim() || isNaN(Number(age)) || Number(age) < 1 || Number(age) > 120) {
      toast({
        title: "Valid age required",
        description: "Please enter a valid age between 1 and 120!",
        variant: "destructive",
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: "Description required",
        description: "Please enter three words that describe you!",
        variant: "destructive",
      });
      return;
    }

    if (isFull) {
      toast({
        title: "Tournament is full!",
        description: "Maximum 16 participants reached. Sorry!",
        variant: "destructive",
      });
      return;
    }

    addParticipant(name.trim(), Number(age), description.trim());

    toast({
      title: "Welcome to the tournament! 🎉",
      description: `${name} has been added to the beer pong tournament!`,
    });

    setName("");
    setAge("");
    setDescription("");
    setTouched({ name: false, age: false, description: false });
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched(prev => ({ ...prev, [field]: true }));
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
        
        {/* Participant counter badge */}
        <div className="mt-4 flex justify-center">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
            isFull 
              ? "bg-red-100 text-red-700 border border-red-200" 
              : spotsRemaining <= 4 
                ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                : "bg-green-100 text-green-800 border border-green-200"
          }`}>
            <span>{participantCount}/16 players</span>
            {!isFull && spotsRemaining > 0 && (
              <span className="text-xs opacity-75">({spotsRemaining} spots left)</span>
            )}
            {isFull && <span className="text-xs">Full!</span>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isFull ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-red-700">Tournament is Full!</h3>
            <p className="text-muted-foreground">
              All 16 spots have been claimed. Check back next time!
            </p>
          </div>
        ) : disabled ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Registration Closed</h3>
            <p className="text-muted-foreground">
              Teams have been generated. The tournament is in progress!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Your Name *
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => handleBlur('name')}
                disabled={disabled}
                className={`transition-all duration-300 focus:ring-primary/50 focus:border-primary ${
                  touched.name && !name.trim() ? "border-red-300 ring-1 ring-red-100" : ""
                }`}
                maxLength={50}
              />
              {touched.name && !name.trim() && (
                <p className="text-xs text-red-500">Name is required</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="age" className="text-sm font-medium">
                Your Age *
              </label>
              <Input
                id="age"
                type="number"
                min="1"
                max="120"
                placeholder="Enter your age..."
                value={age}
                onChange={(e) => setAge(e.target.value)}
                onBlur={() => handleBlur('age')}
                disabled={disabled}
                className={`transition-all duration-300 focus:ring-primary/50 focus:border-primary ${
                  touched.age && (!age.trim() || Number(age) < 1) ? "border-red-300 ring-1 ring-red-100" : ""
                }`}
              />
              {touched.age && (!age.trim() || Number(age) < 1) && (
                <p className="text-xs text-red-500">Valid age is required</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Three words that describe you *
              </label>
              <Input
                id="description"
                type="text"
                placeholder="e.g., Fun, Competitive, Energetic"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => handleBlur('description')}
                disabled={disabled}
                className={`transition-all duration-300 focus:ring-primary/50 focus:border-primary ${
                  touched.description && !description.trim() ? "border-red-300 ring-1 ring-red-100" : ""
                }`}
                maxLength={100}
              />
              {touched.description && !description.trim() && (
                <p className="text-xs text-red-500">Description is required</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-pink-hot hover:from-pink-hot hover:to-primary transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              disabled={disabled || !name.trim() || !age.trim() || !description.trim()}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Join Tournament
            </Button>

            {disabled && (
              <p className="text-sm text-center text-muted-foreground">
                Registration is currently closed.
              </p>
            )}
          </form>
        )}
      </CardContent>
    </Card>
  );
};
