// server.js
// User Profile Card Generator
// Express server that accepts a profile form, processes the input
// (string manipulation, avatar generation), stores it in SQLite,
// and renders a dynamic profile card.

const path = require('path');
const express = require('express');
const multer = require('multer');
const {
  insertProfile,
  getProfileById,
  getAllProfiles,
  deleteProfileById,
} = require('./db/database');
const {
  slugify,
  truncate,
  parseSkills,
  normalizeUrl,
  getInitials,
  nameToColor,
} = require('./utils/helpers');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- View engine ----------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ---------- Middleware ----------
app.use(express.urlencoded({ extended: true })); // parse form (x-www-form-urlencoded) bodies
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---------- File upload (optional avatar image) ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'public', 'uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase());
    cb(ok ? null : new Error('Only image files are allowed (jpg, png, webp, gif).'), ok);
  },
});

// ---------- Routes ----------

// Home: show the form
app.get('/', (req, res) => {
  res.render('index', { error: null });
});

// Handle form submission -> process input -> save to DB -> redirect to card
app.post('/profile', upload.single('avatar'), (req, res) => {
  try {
    const { name, bio, skills, github, linkedin, twitter, portfolio } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).render('index', { error: 'Name is required.' });
    }

    const id = slugify(name);
    const parsedSkills = parseSkills(skills);
    const avatarPath = req.file ? `/uploads/${req.file.filename}` : null;

    const record = {
      id,
      name: name.trim(),
      bio: (bio || '').trim(),
      skills: JSON.stringify(parsedSkills),
      github: normalizeUrl(github || ''),
      linkedin: normalizeUrl(linkedin || ''),
      twitter: normalizeUrl(twitter || ''),
      portfolio: normalizeUrl(portfolio || ''),
      avatar_path: avatarPath,
      avatar_color: nameToColor(name),
      created_at: new Date().toISOString(),
    };

    insertProfile.run(record);

    res.redirect(`/profile/${id}`);
  } catch (err) {
    console.error(err);
    res.status(500).render('index', { error: 'Something went wrong. Please try again.' });
  }
});

// Show a single dynamically generated profile card
app.get('/profile/:id', (req, res) => {
  const profile = getProfileById.get(req.params.id);
  if (!profile) {
    return res.status(404).render('404', { message: 'Profile not found.' });
  }
  res.render('card', {
    profile,
    skills: JSON.parse(profile.skills || '[]'),
    initials: getInitials(profile.name),
    bioPreview: truncate(profile.bio, 260),
  });
});

// Gallery of all created profiles (proof of DB persistence)
app.get('/profiles', (req, res) => {
  const rows = getAllProfiles.all().map((p) => ({
    ...p,
    skills: JSON.parse(p.skills || '[]'),
    initials: getInitials(p.name),
  }));
  res.render('gallery', { profiles: rows });
});

// Delete a profile (simple admin/demo utility)
app.post('/profile/:id/delete', (req, res) => {
  deleteProfileById.run(req.params.id);
  res.redirect('/profiles');
});

// 404 fallback
app.use((req, res) => {
  res.status(404).render('404', { message: 'Page not found.' });
});

// Error handler (e.g. Multer file-type errors)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(400).render('index', { error: err.message || 'Upload error.' });
});

app.listen(PORT, () => {
  console.log(`✅ Profile Card Generator running at http://localhost:${PORT}`);
});
