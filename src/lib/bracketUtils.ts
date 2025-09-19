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
      // Use Fisher-Yates shuffle for better randomization
      const shuffled = [...unpairedParticipants];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      
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

        // Find all available bracket slots in round 1
        const { data: allRound1Matches, error: matchesError } = await supabase
          .from('matches')
          .select('*')
          .eq('round', 1)
          .order('match_number', { ascending: true });

        if (matchesError) throw matchesError;

        // Create list of all available slots (team1 and team2 positions)
        const availableSlots: Array<{matchId: string, position: 'team1' | 'team2'}> = [];

        allRound1Matches?.forEach(match => {
          if (!match.team1_id) {
            availableSlots.push({ matchId: match.id, position: 'team1' });
          }
          if (!match.team2_id) {
            availableSlots.push({ matchId: match.id, position: 'team2' });
          }
        });

        if (availableSlots.length > 0) {
          // Randomly select one of the available slots
          const randomIndex = Math.floor(Math.random() * availableSlots.length);
          const selectedSlot = availableSlots[randomIndex];

          // Assign team to the randomly selected slot
          const updateField = selectedSlot.position === 'team1' ? 'team1_id' : 'team2_id';
          const { error: updateError } = await supabase
            .from('matches')
            .update({ [updateField]: newTeam.id })
            .eq('id', selectedSlot.matchId);

          if (updateError) throw updateError;
        }
      }
    }

  } catch (error) {
    console.error('Error assigning participant to bracket:', error);
    throw error;
  }
};

// Regenerate all teams and randomly assign to bracket
export const regenerateTeamsAndBracket = async () => {
  try {
    // Get all participants
    const { data: allParticipants, error: participantsError } = await supabase
      .from('participants')
      .select('*')
      .order('created_at', { ascending: true });

    if (participantsError) throw participantsError;

    if (!allParticipants || allParticipants.length === 0) {
      throw new Error('No participants found');
    }

    if (allParticipants.length % 2 !== 0) {
      throw new Error('Need an even number of participants to form teams');
    }

    // Clear existing teams and match assignments
    await supabase.from('teams').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase
      .from('matches')
      .update({ team1_id: null, team2_id: null, winner_id: null, status: 'pending' })
      .neq('id', '00000000-0000-0000-0000-000000000000');

    // Fisher-Yates shuffle for optimal randomization
    const shuffledParticipants = [...allParticipants];
    for (let i = shuffledParticipants.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledParticipants[i], shuffledParticipants[j]] = [shuffledParticipants[j], shuffledParticipants[i]];
    }

    // Create teams from shuffled participants
    const newTeams = [];
    for (let i = 0; i < shuffledParticipants.length - 1; i += 2) {
      const player1 = shuffledParticipants[i];
      const player2 = shuffledParticipants[i + 1];

      const { data: newTeam, error: teamError } = await supabase
        .from('teams')
        .insert({
          player1_id: player1.id,
          player2_id: player2.id
        })
        .select()
        .single();

      if (teamError) throw teamError;
      newTeams.push(newTeam);
    }

    // Get all round 1 matches
    const { data: round1Matches, error: matchesError } = await supabase
      .from('matches')
      .select('*')
      .eq('round', 1)
      .order('match_number', { ascending: true });

    if (matchesError) throw matchesError;

    // Create array of all bracket positions
    const bracketPositions: Array<{matchId: string, position: 'team1' | 'team2'}> = [];
    round1Matches?.forEach(match => {
      bracketPositions.push({ matchId: match.id, position: 'team1' });
      bracketPositions.push({ matchId: match.id, position: 'team2' });
    });

    // Shuffle bracket positions
    for (let i = bracketPositions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bracketPositions[i], bracketPositions[j]] = [bracketPositions[j], bracketPositions[i]];
    }

    // Assign teams to shuffled bracket positions
    for (let i = 0; i < Math.min(newTeams.length, bracketPositions.length); i++) {
      const team = newTeams[i];
      const position = bracketPositions[i];

      const updateField = position.position === 'team1' ? 'team1_id' : 'team2_id';
      const { error: updateError } = await supabase
        .from('matches')
        .update({ [updateField]: team.id })
        .eq('id', position.matchId);

      if (updateError) throw updateError;
    }

    // Update tournament status to teams_generated
    const { error: statusError } = await supabase
      .from('tournament_state')
      .update({ status: 'teams_generated' })
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (statusError) throw statusError;

    return {
      success: true,
      teamsCreated: newTeams.length,
      message: `Successfully created ${newTeams.length} teams and randomly assigned them to bracket positions`
    };

  } catch (error) {
    console.error('Error regenerating teams and bracket:', error);
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