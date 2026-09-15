// utils/helpers.js
// Server-side string manipulation helpers used to turn raw form input
// into the data a profile card needs.

const crypto = require('crypto');

/**
 * Turn a name into a URL-safe slug + short random suffix so two
 * "John Smith" profiles don't collide.
 *   "  John   Smith! " -> "john-smith-a1b2c3"
 */
function slugify(name) {
  const base = name
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')   // strip anything not alphanumeric/space/hyphen
    .replace(/\s+/g, '-')           // collapse whitespace to hyphens
    .replace(/-+/g, '-')            // collapse repeated hyphens
    .replace(/^-|-$/g, '');         // trim leading/trailing hyphens

  const suffix = crypto.randomBytes(3).toString('hex'); // 6-char unique suffix
  return `${base || 'user'}-${suffix}`;
}

/**
 * Escape HTML special characters so user input can never inject markup.
 */
function escapeHtml(str = '') {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Truncate long bios for card previews, keeping full text elsewhere.
 */
function truncate(str = '', maxLen = 220) {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen).trim() + '…';
}

/**
 * "Java, Python,  C++ ,,React" -> ["Java", "Python", "C++", "React"]
 * - splits on commas, trims whitespace, drops empties/duplicates, caps count.
 */
function parseSkills(raw = '', maxSkills = 12) {
  const seen = new Set();
  const skills = [];
  raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((skill) => {
      const key = skill.toLowerCase();
      if (!seen.has(key) && skills.length < maxSkills) {
        seen.add(key);
        skills.push(skill);
      }
    });
  return skills;
}

/**
 * "linkedin.com/in/gayu" -> "https://linkedin.com/in/gayu"
 * Leaves it empty if nothing was provided; leaves valid URLs untouched.
 */
function normalizeUrl(url = '') {
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/**
 * "Gayathri Kumar" -> "GK"   |   "madonna" -> "M"
 */
function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Deterministically derive a pleasant HSL background color from the
 * person's name, so the same name always gets the same avatar color.
 */
function nameToColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0; // force 32-bit int
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 62%, 48%)`;
}

module.exports = {
  slugify,
  escapeHtml,
  truncate,
  parseSkills,
  normalizeUrl,
  getInitials,
  nameToColor,
};
