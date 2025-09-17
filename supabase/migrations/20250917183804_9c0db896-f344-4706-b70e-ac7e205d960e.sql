-- Create participants table
CREATE TABLE public.participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create teams table (pairs of participants)
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player1_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  player2_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create matches table for tournament bracket
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  round INTEGER NOT NULL,
  match_number INTEGER NOT NULL,
  team1_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  team2_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  winner_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tournament_state table to track tournament status
CREATE TABLE public.tournament_state (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'registration' CHECK (status IN ('registration', 'teams_generated', 'in_progress', 'completed')),
  current_round INTEGER DEFAULT 1,
  total_rounds INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert initial tournament state
INSERT INTO public.tournament_state (status) VALUES ('registration');

-- Enable Row Level Security
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_state ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (this is a party app, everyone can view)
CREATE POLICY "Anyone can view participants" ON public.participants FOR SELECT USING (true);
CREATE POLICY "Anyone can insert participants" ON public.participants FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Anyone can view matches" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Anyone can view tournament state" ON public.tournament_state FOR SELECT USING (true);

-- Admin policies for managing tournament (for now, anyone can manage)
CREATE POLICY "Anyone can update tournament state" ON public.tournament_state FOR UPDATE USING (true);
CREATE POLICY "Anyone can insert teams" ON public.teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert matches" ON public.matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update matches" ON public.matches FOR UPDATE USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tournament_state_updated_at
  BEFORE UPDATE ON public.tournament_state
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();