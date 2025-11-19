import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./db.js";
import { Song } from "./models/song.model.js";

const app = express();
const PORT = process.env.PORT || 5174;

app.use(cors());
app.use(express.json());

// api/songs (Insert song)
app.post("/api/songs", async (req, res) => {
  try {
    const { title = "", artist = "", year } = req.body || {};
    const created = await Song.create({
      title: title.trim(),
      artist: artist.trim(),
      year,
    });
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ message: err.message || "Create failed" });
  }
});

// api/songs (Read all songs)
app.get("/api/songs", async (_req, res) => {
  const rows = await Song.find().sort({ createdAt: -1 });
  res.json(rows);
});

// api/songs/:id (Read one song)
app.get("/api/songs/:id", async (req, res) => {
  const s = await Song.findById(req.params.id);
  if (!s) return res.status(404).json({ message: "Song not found" });
  res.json(s);
});

// /api/songs/:id (Update song)
app.put("/api/songs/:id", async (req, res) => {
  try {
    const { title = "", artist = "", year } = req.body || {};
    const updated = await Song.findByIdAndUpdate(
      req.params.id,
      {
        title: title.trim(),
        artist: artist.trim(),
        year,
      },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: "Song not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message || "Update failed" });
  }
});

async function start() {
  try {
    const mongoUrl = process.env.MONGO_URL;
    if (!mongoUrl) throw new Error("MONGO_URL not set");

    await connectDB(mongoUrl);
    console.log("Mongo connected");

    app.listen(PORT, () =>
      console.log(`API running on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("Connection error:", err.message);
    process.exit(1);
  }
}

start();

// /api/songs/:id (Delete song)
