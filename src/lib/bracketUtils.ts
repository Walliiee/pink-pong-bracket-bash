import { supabase } from "@/integrations/supabase/client";

interface Participant {
  id: string;
  name: string;
  age: number;
  description: string;
}

// Initialize the tournament bracket structure
export const initializeBracket = async () => {
  try {
    // Check if bracket already exists
    const { data: existingMatches } = await supabase
      .from('matches')
      .select('id')
      .limit(1);

    if (existingMatches && existingMatches.length > 0) {
      return; // Bracket already initialized
    }

    // Create all 15 matches for a 16-team tournament
    const matches = [];

    // Round 1: 8 matches (quarter-finals)
    for (let i = 1; i <= 8; i++) {
      matches.push({
        round: 1,
        match_number: i,
        status: 'pending'
      });
    }

    // Round 2: 4 matches (semi-finals)
    for (let i = 1; i <= 4; i++) {
      matches.push({
        round: 2,
        match_number: i,
        status: 'pending'
      });
    }

    // Round 3: 2 matches (finals)
    for (let i = 1; i <= 2; i++) {
      matches.push({
        round: 3,
        match_number: i,
        status: 'pending'
      });
    }

    // Round 4: 1 match (championship)
    matches.push({
      round: 4,
      match_number: 1,
      status: 'pending'
    });

    // Insert all matches
    const { error } = await supabase
      .from('matches')
      .insert(matches);

    if (error) throw error;

    console.log('Tournament bracket initialized successfully');
  } catch (error) {
    console.error('Error initializing bracket:', error);
    throw error;
  }
};

// Randomly assign participant to available bracket slot
export const assignParticipantToBracket = async (participant: Participant) => {
  try {
    // Initialize bracket if it doesn't exist
    await initializeBracket();

    // Get all participants and existing teams
    const { data: allParticipants, error: participantsError } = await supabase
      .from('participants')
      .select('*')
      .order('created_at', { ascending: true });

    const { data: existingTeams, error: teamsError } = await supabase
      .from('teams')
      .select('player1_id, player2_id');

    if (participantsError) throw participantsError;
    if (teamsError) throw teamsError;

    if (!allParticipants || allParticipants.length === 0) {
      return;
    }

    // Find participants who are not already in teams
    const participantIdsInTeams = new Set();
    existingTeams?.forEach(team => {
      participantIdsInTeams.add(team.player1_id);
      participantIdsInTeams.add(team.player2_id);
    });

    const unpairedParticipants = allParticipants.filter(p => 
      !participantIdsInTeams.has(p.id)
    );
    
    if (unpairedParticipants.length >= 2) {
      // Shuffle participants for random pairing
      const shuffled = [...unpairedParticipants].sort(() => Math.random() - 0.5);
      
      // Create teams from pairs
      for (let i = 0; i < shuffled.length - 1; i += 2) {
        const player1 = shuffled[i];
        const player2 = shuffled[i + 1];

        // Create new team
        const { data: newTeam, error: teamError } = await supabase
          .from('teams')
          .insert({
            player1_id: player1.id,
            player2_id: player2.id
          })
          .select()
          .single();

        if (teamError) throw teamError;

        // Find available match slot in round 1
        const { data: availableMatch, error: matchError } = await supabase
          .from('matches')
          .select('*')
          .eq('round', 1)
          .is('team1_id', null)
          .limit(1)
          .single();

        if (!matchError && availableMatch) {
          // Assign team to match slot
          const { error: updateError } = await supabase
            .from('matches')
            .update({ team1_id: newTeam.id })
            .eq('id', availableMatch.id);

          if (updateError) throw updateError;
        } else {
          // Try to find a match with only team1 filled to add as team2
          const { data: partialMatch, error: partialError } = await supabase
            .from('matches')
            .select('*')
            .eq('round', 1)
            .not('team1_id', 'is', null)
            .is('team2_id', null)
            .limit(1)
            .single();

          if (!partialError && partialMatch) {
            const { error: updateError } = await supabase
              .from('matches')
              .update({ team2_id: newTeam.id })
              .eq('id', partialMatch.id);

            if (updateError) throw updateError;
          }
        }
      }
    }

  } catch (error) {
    console.error('Error assigning participant to bracket:', error);
    throw error;
  }
};

// Get tournament progress
export const getTournamentProgress = async () => {
  try {
    const { data: participants, error: participantsError } = await supabase
      .from('participants')
      .select('*');

    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*');

    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('*')
      .not('team1_id', 'is', null)
      .not('team2_id', 'is', null);

    if (participantsError) throw participantsError;
    if (teamsError) throw teamsError;
    if (matchesError) throw matchesError;

    return {
      participantCount: participants?.length || 0,
      teamCount: teams?.length || 0,
      activeMatches: matches?.length || 0,
      tournamentReady: (participants?.length || 0) >= 16
    };
  } catch (error) {
    console.error('Error getting tournament progress:', error);
    return {
      participantCount: 0,
      teamCount: 0,
      activeMatches: 0,
      tournamentReady: false
    };
  }
};