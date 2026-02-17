import express from "express";
import { createServer } from "http";
import { Server as SocketServer } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import os from "os";

import {
  getAllParticipants,
  createParticipant,
  deleteParticipant,
  getAllMatchesWithTeams,
  getTournamentState,
  updateTournamentStatus,
  regenerateTeamsAndBracket,
  assignParticipantToBracket,
  initializeBracket,
} from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;

const app = express();
const server = createServer(app);

const io = new SocketServer(server, {
  cors: { origin: "*" },
});

app.use(express.json());

// Serve the built frontend in production
const distPath = path.join(__dirname, "..", "dist");
app.use(express.static(distPath));

// Broadcast helper — call after any mutation
function broadcast(event) {
  io.emit(event);
}

// ── API Routes ────────────────────────────────────────────────

// Participants
app.get("/api/participants", (_req, res) => {
  res.json(getAllParticipants());
});

app.post("/api/participants", (req, res) => {
  try {
    const { name, age, description } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: "Name is required" });

    const participant = createParticipant({
      name: name.trim(),
      age: age ? Number(age) : null,
      description: description?.trim() || null,
    });

    // Auto-assign to bracket when enough participants
    try {
      assignParticipantToBracket();
    } catch (_e) {
      // non-critical
    }

    broadcast("participants:changed");
    broadcast("matches:changed");
    res.status(201).json(participant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/participants/:id", (req, res) => {
  try {
    deleteParticipant(req.params.id);
    broadcast("participants:changed");
    broadcast("matches:changed");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Matches (with joined team/player data)
app.get("/api/matches", (_req, res) => {
  res.json(getAllMatchesWithTeams());
});

app.post("/api/matches/initialize", (_req, res) => {
  try {
    initializeBracket();
    broadcast("matches:changed");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tournament state
app.get("/api/tournament-state", (_req, res) => {
  res.json(getTournamentState());
});

app.patch("/api/tournament-state", (req, res) => {
  try {
    const { status } = req.body;
    const state = updateTournamentStatus(status);
    broadcast("tournament:changed");
    res.json(state);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate teams
app.post("/api/tournament/generate-teams", (_req, res) => {
  try {
    const result = regenerateTeamsAndBracket();
    broadcast("participants:changed");
    broadcast("matches:changed");
    broadcast("tournament:changed");
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// SPA fallback — serve index.html for all non-API routes
app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// ── Socket.IO ─────────────────────────────────────────────────

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// ── Start ─────────────────────────────────────────────────────

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

server.listen(PORT, "0.0.0.0", () => {
  const localIP = getLocalIP();
  console.log("");
  console.log("  🏓  Pink Pong Tournament Server is running!");
  console.log("");
  console.log(`  Local:   http://localhost:${PORT}`);
  console.log(`  Network: http://${localIP}:${PORT}  (use this on phones)`);
  console.log("");
});
