import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "tournament.db");

const db = new Database(DB_PATH);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS participants (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    age INTEGER,
    description TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS teams (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    player1_id TEXT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    player2_id TEXT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS matches (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    round INTEGER NOT NULL,
    match_number INTEGER NOT NULL,
    team1_id TEXT REFERENCES teams(id) ON DELETE SET NULL,
    team2_id TEXT REFERENCES teams(id) ON DELETE SET NULL,
    winner_id TEXT REFERENCES teams(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS tournament_state (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    status TEXT DEFAULT 'registration',
    current_round INTEGER DEFAULT 1,
    total_rounds INTEGER DEFAULT 4,
    updated_at TEXT DEFAULT (datetime('now'))
  );
`);

// Ensure a tournament_state row exists
const stateRow = db.prepare("SELECT id FROM tournament_state LIMIT 1").get();
if (!stateRow) {
  db.prepare(
    "INSERT INTO tournament_state (id, status, current_round, total_rounds) VALUES (?, 'registration', 1, 4)"
  ).run(crypto.randomUUID());
}

export function uuid() {
  return crypto.randomUUID();
}

// ── Participants ──────────────────────────────────────────────

export function getAllParticipants() {
  return db
    .prepare("SELECT * FROM participants ORDER BY created_at ASC")
    .all();
}

export function createParticipant({ name, age, description }) {
  const id = uuid();
  db.prepare(
    "INSERT INTO participants (id, name, age, description) VALUES (?, ?, ?, ?)"
  ).run(id, name, age ?? null, description ?? null);
  return db.prepare("SELECT * FROM participants WHERE id = ?").get(id);
}

export function deleteParticipant(id) {
  db.prepare("DELETE FROM teams WHERE player1_id = ? OR player2_id = ?").run(id, id);
  db.prepare("DELETE FROM participants WHERE id = ?").run(id);
}

// ── Teams ─────────────────────────────────────────────────────

export function getAllTeams() {
  return db.prepare("SELECT * FROM teams ORDER BY created_at ASC").all();
}

export function createTeam(player1_id, player2_id) {
  const id = uuid();
  db.prepare(
    "INSERT INTO teams (id, player1_id, player2_id) VALUES (?, ?, ?)"
  ).run(id, player1_id, player2_id);
  return db.prepare("SELECT * FROM teams WHERE id = ?").get(id);
}

export function deleteAllTeams() {
  db.prepare("DELETE FROM teams").run();
}

// ── Matches ───────────────────────────────────────────────────

export function getAllMatchesRaw() {
  return db
    .prepare("SELECT * FROM matches ORDER BY round ASC, match_number ASC")
    .all();
}

export function getAllMatchesWithTeams() {
  const matches = getAllMatchesRaw();
  return matches.map((m) => enrichMatch(m));
}

function enrichMatch(m) {
  const result = { ...m };
  if (m.team1_id) result.team1 = getTeamWithPlayers(m.team1_id);
  if (m.team2_id) result.team2 = getTeamWithPlayers(m.team2_id);
  if (m.winner_id) result.winner = getTeamWithPlayers(m.winner_id);
  return result;
}

function getTeamWithPlayers(teamId) {
  const team = db.prepare("SELECT * FROM teams WHERE id = ?").get(teamId);
  if (!team) return null;
  const player1 = db
    .prepare("SELECT id, name FROM participants WHERE id = ?")
    .get(team.player1_id);
  const player2 = db
    .prepare("SELECT id, name FROM participants WHERE id = ?")
    .get(team.player2_id);
  return { id: team.id, player1, player2 };
}

export function initializeBracket() {
  const existing = db.prepare("SELECT id FROM matches LIMIT 1").get();
  if (existing) return;

  const insert = db.prepare(
    "INSERT INTO matches (id, round, match_number, status) VALUES (?, ?, ?, 'pending')"
  );

  const batch = db.transaction(() => {
    for (let i = 1; i <= 8; i++) insert.run(uuid(), 1, i);
    for (let i = 1; i <= 4; i++) insert.run(uuid(), 2, i);
    for (let i = 1; i <= 2; i++) insert.run(uuid(), 3, i);
    insert.run(uuid(), 4, 1);
  });
  batch();
}

export function resetMatchAssignments() {
  db.prepare(
    "UPDATE matches SET team1_id = NULL, team2_id = NULL, winner_id = NULL, status = 'pending', updated_at = datetime('now')"
  ).run();
}

export function updateMatchTeam(matchId, field, teamId) {
  db.prepare(
    `UPDATE matches SET ${field} = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(teamId, matchId);
}

// ── Tournament state ──────────────────────────────────────────

export function getTournamentState() {
  return db.prepare("SELECT * FROM tournament_state LIMIT 1").get();
}

export function updateTournamentStatus(status) {
  db.prepare(
    "UPDATE tournament_state SET status = ?, updated_at = datetime('now')"
  ).run(status);
  return getTournamentState();
}

// ── Bracket logic ─────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function regenerateTeamsAndBracket() {
  const participants = getAllParticipants();
  if (!participants.length) throw new Error("No participants found");
  if (participants.length % 2 !== 0)
    throw new Error("Need an even number of participants to form teams");

  const tx = db.transaction(() => {
    deleteAllTeams();
    resetMatchAssignments();
    initializeBracket();

    const shuffled = shuffle(participants);
    const newTeams = [];
    for (let i = 0; i < shuffled.length - 1; i += 2) {
      newTeams.push(createTeam(shuffled[i].id, shuffled[i + 1].id));
    }

    const round1 = db
      .prepare(
        "SELECT * FROM matches WHERE round = 1 ORDER BY match_number ASC"
      )
      .all();

    const positions = [];
    round1.forEach((m) => {
      positions.push({ matchId: m.id, field: "team1_id" });
      positions.push({ matchId: m.id, field: "team2_id" });
    });
    const shuffledPositions = shuffle(positions);

    for (let i = 0; i < Math.min(newTeams.length, shuffledPositions.length); i++) {
      updateMatchTeam(
        shuffledPositions[i].matchId,
        shuffledPositions[i].field,
        newTeams[i].id
      );
    }

    updateTournamentStatus("teams_generated");
  });
  tx();

  return {
    success: true,
    teamsCreated: Math.floor(getAllParticipants().length / 2),
    message: `Successfully created teams and randomly assigned them to bracket positions`,
  };
}

export function assignParticipantToBracket() {
  initializeBracket();

  const participants = getAllParticipants();
  const teams = getAllTeams();

  const idsInTeams = new Set();
  teams.forEach((t) => {
    idsInTeams.add(t.player1_id);
    idsInTeams.add(t.player2_id);
  });

  const unpaired = participants.filter((p) => !idsInTeams.has(p.id));
  if (unpaired.length < 2) return;

  const tx = db.transaction(() => {
    const shuffled = shuffle(unpaired);
    for (let i = 0; i < shuffled.length - 1; i += 2) {
      const team = createTeam(shuffled[i].id, shuffled[i + 1].id);

      const round1 = db
        .prepare(
          "SELECT * FROM matches WHERE round = 1 ORDER BY match_number ASC"
        )
        .all();

      const slots = [];
      round1.forEach((m) => {
        if (!m.team1_id) slots.push({ matchId: m.id, field: "team1_id" });
        if (!m.team2_id) slots.push({ matchId: m.id, field: "team2_id" });
      });

      if (slots.length > 0) {
        const pick = slots[Math.floor(Math.random() * slots.length)];
        updateMatchTeam(pick.matchId, pick.field, team.id);
      }
    }
  });
  tx();
}

export default db;
