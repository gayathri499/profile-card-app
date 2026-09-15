# 🪪 User Profile Card Generator

A form-based web app built with **Node.js + Express**. Users submit their
name, bio, skills, and social links; the server processes that input
(string cleanup, slugifying, skill parsing, avatar generation), stores the
record in a **SQLite** database, and renders a dynamic profile card.

**Objective:** practice server-side form processing, string manipulation,
and dynamic HTML rendering.

---

## ✨ Features

- **HTML form** for Name, Bio, Skills, Social Links (GitHub, LinkedIn,
  Twitter/X, Portfolio), and an optional avatar image upload.
- **Server-side processing** (`utils/helpers.js`):
  - `slugify()` – turns a name into a unique, URL-safe profile ID
  - `parseSkills()` – splits/cleans a comma-separated skills string into tags
  - `normalizeUrl()` – adds `https://` to social links if missing
  - `getInitials()` / `nameToColor()` – generates a deterministic initials
    avatar (color derived from the name) when no image is uploaded
  - `escapeHtml()` / `truncate()` – sanitizes and trims bio text
- **Dynamic HTML card** rendered server-side with EJS, unique to each
  submission (`/profile/:id`).
- **Persistent storage** in SQLite (`better-sqlite3`) — every profile
  created is saved and can be revisited any time.
- **Gallery page** (`/profiles`) listing every stored profile, proving
  database persistence.
- **Delete** action to remove a stored profile.

---

## 🗂 Project Structure

```
profile-card-app/
├── server.js              # Express app & routes
├── db/
│   ├── database.js        # SQLite setup + prepared queries
│   └── profiles.db        # created automatically at runtime (gitignored)
├── utils/
│   └── helpers.js         # string manipulation / avatar helpers
├── views/
│   ├── index.ejs          # the submission form
│   ├── card.ejs            # single dynamic profile card
│   ├── gallery.ejs         # list of all stored profiles
│   ├── 404.ejs
│   └── partials/head.ejs
├── public/
│   ├── css/style.css
│   └── uploads/            # uploaded avatar images (gitignored)
├── package.json
└── .gitignore
```

---

## 🚀 Getting Started (Local)

**Requirements:** Node.js 18+ and npm.

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd profile-card-app

# 2. Install dependencies
npm install

# 3. Run the server
npm start
# or, for auto-reload during development:
npm run dev
```

The app will be running at **http://localhost:3000**.

- `GET  /`                    → the profile form
- `POST /profile`              → processes the form, saves to DB, redirects to the card
- `GET  /profile/:id`          → renders that user's dynamic profile card
- `GET  /profiles`             → gallery of every profile stored in the DB
- `POST /profile/:id/delete`   → deletes a profile

SQLite creates `db/profiles.db` automatically on first run — no separate
database setup needed.

---

## 🧠 How the Processing Works

1. The form POSTs `multipart/form-data` (so an avatar image can be attached)
   to `/profile`.
2. `server.js` pulls out `name, bio, skills, github, linkedin, twitter, portfolio`
   and passes them through the helpers in `utils/helpers.js`:
   - the name is slugified into a unique ID (`gayathri-kumar-6f992d`)
   - skills are split, trimmed, de-duplicated, and capped
   - social URLs are normalized so users can type `github.com/user` or
     `https://github.com/user` interchangeably
   - if no avatar image was uploaded, initials + a deterministic HSL color
     are computed from the name
3. The resulting record is inserted into the `profiles` table (SQLite).
4. The browser is redirected to `/profile/:id`, which reads that row back
   out of the database and renders `card.ejs` — a fresh dynamic HTML page
   built from the stored data every time it's requested.

---

## 🌐 Deploying for the "Live Demo Link"

This app is a plain Node/Express server with a file-based SQLite DB, so it
deploys cleanly to any Node host. Two easy free options:

### Option A — Render.com
1. Push this repo to GitHub.
2. On [render.com](https://render.com) → **New → Web Service** → connect
   your GitHub repo.
3. Build command: `npm install`
   Start command: `npm start`
4. Deploy — Render gives you a public URL like
   `https://profile-card-app.onrender.com`.

> ⚠️ Render's free tier has an **ephemeral filesystem** — the SQLite file
> resets on redeploy/restart. That's fine for a demo. For real persistence,
> swap in a hosted Postgres (e.g. Render's free Postgres, or Supabase) —
> only `db/database.js` needs to change.

### Option B — Railway.app
1. Push to GitHub → [railway.app](https://railway.app) → **New Project →
   Deploy from GitHub repo**.
2. Railway auto-detects Node, runs `npm install && npm start`.
3. Add a generated public domain from the service settings.

---

## 📦 Submission Checklist

- [x] HTML form capturing Name, Bio, Skills, Social Links, avatar upload
- [x] Node.js server processes input (string manipulation helpers)
- [x] Dynamic HTML profile card + avatar preview rendered per submission
- [x] Profile records persisted in a database (SQLite)
- [ ] Push this folder to a GitHub repository
- [ ] Deploy (Render/Railway/etc.) and grab the live demo URL
- [ ] Submit both links

---

## 🛠 Tech Stack

- **Node.js** + **Express** — server & routing
- **EJS** — server-side HTML templating
- **better-sqlite3** — lightweight embedded database
- **Multer** — multipart form / file upload handling
- Vanilla **CSS** (no framework) for the UI

---

## 📄 License

MIT — free to use and adapt for coursework or your portfolio.
