// db/database.js
// Handles all SQLite database setup and queries using better-sqlite3.

const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, 'profiles.db');
const db = new Database(DB_PATH);

// Create the profiles table if it doesn't already exist.
db.exec(`
  CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    bio TEXT,
    skills TEXT,        -- stored as JSON array string
    github TEXT,
    linkedin TEXT,
    twitter TEXT,
    portfolio TEXT,
    avatar_path TEXT,   -- path to uploaded avatar image, or NULL for generated initials
    avatar_color TEXT,  -- hex color used for the generated initials avatar
    created_at TEXT NOT NULL
  )
`);

const insertProfile = db.prepare(`
  INSERT INTO profiles
    (id, name, bio, skills, github, linkedin, twitter, portfolio, avatar_path, avatar_color, created_at)
  VALUES
    (@id, @name, @bio, @skills, @github, @linkedin, @twitter, @portfolio, @avatar_path, @avatar_color, @created_at)
`);

const getProfileById = db.prepare(`SELECT * FROM profiles WHERE id = ?`);
const getAllProfiles = db.prepare(`SELECT * FROM profiles ORDER BY created_at DESC`);
const deleteProfileById = db.prepare(`DELETE FROM profiles WHERE id = ?`);

module.exports = {
  db,
  insertProfile,
  getProfileById,
  getAllProfiles,
  deleteProfileById,
};
