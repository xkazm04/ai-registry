// ideas.mjs - an ideator's IDEAS.json: validation, recovery from a final message, the blind board.
//
// WHY recovery exists: a seat that cannot write files (or writes a file that does not parse) is
// told by its brief to put the whole JSON in its final message. Losing ten ideas because the file
// was missing would waste the most expensive part of the pre-round, so the envelope's final text
// is searched for the document: the last ```json fence, else the last top-level `{...}` that
// parses with an `ideas` array.
//
// WHY the board scrubs and then checks: the owner shortlists blind. A seat told not to sign its
// work still mentions its own model in a grounding line now and then, so every text field goes
// through the contest's scrubIdentity with this hackathon's seat ids, model slugs and engine
// names added, and `leaks` re-checks the result for any seat string that survived.
import { blindMap, scrubIdentity, materialPhrases } from '../../../contest/scripts/lib/judging.mjs';
import { ENGINES } from '../../../contest/scripts/lib/participants.mjs';

export const SURFACES = ['frontend', 'backend', 'both'];
export const TEXT_FIELDS = ['title', 'pitch', 'user_moment', 'insight', 'baseline', 'mastery', 'risks'];
export const LIST_FIELDS = ['stretch', 'grounding'];

/** Problems with one idea ([] = valid) and warnings that do not invalidate it. */
export function validateIdea(idea) {
  const problems = [];
  const warnings = [];
  if (!idea || typeof idea !== 'object' || Array.isArray(idea)) return { problems: ['not an object'], warnings };
  for (const f of TEXT_FIELDS) {
    if (typeof idea[f] !== 'string' || !idea[f].trim()) problems.push(`${f} is missing or empty`);
  }
  const surface = typeof idea.surface === 'string' ? idea.surface.trim().toLowerCase() : idea.surface;
  if (!SURFACES.includes(surface)) problems.push(`surface ${JSON.stringify(idea.surface)} is not one of ${SURFACES.join(', ')}`);
  for (const f of LIST_FIELDS) {
    const v = idea[f] ?? [];
    if (!Array.isArray(v) || v.some((x) => typeof x !== 'string')) problems.push(`${f} is not an array of strings`);
  }
  if (Array.isArray(idea.grounding) && idea.grounding.length === 0) warnings.push('grounding is empty - the idea names nothing it reuses');
  return { problems, warnings };
}

/** A normalized copy of a valid idea (trimmed strings, lower-case surface, arrays present). */
export const normalizeIdea = (idea) => ({
  ...Object.fromEntries(TEXT_FIELDS.map((f) => [f, idea[f].trim()])),
  surface: idea.surface.trim().toLowerCase(),
  stretch: (idea.stretch ?? []).map((s) => s.trim()).filter(Boolean),
  grounding: (idea.grounding ?? []).map((s) => s.trim()).filter(Boolean),
});

/**
 * Validate a whole IDEAS.json document. Returns { valid: [idea], invalid: [{ index, title, problems }],
 * warnings, seat_notes }. `expected` is ideas_per_seat; a different count is a warning.
 */
export function validateIdeasDoc(doc, expected = null) {
  if (!doc || typeof doc !== 'object' || !Array.isArray(doc.ideas)) {
    return { valid: [], invalid: [], warnings: [], seat_notes: '', fatal: 'the document has no "ideas" array' };
  }
  const valid = [];
  const invalid = [];
  const warnings = [];
  doc.ideas.forEach((idea, i) => {
    const r = validateIdea(idea);
    if (r.problems.length) invalid.push({ index: i + 1, title: typeof idea?.title === 'string' ? idea.title : null, problems: r.problems });
    else valid.push(normalizeIdea(idea));
    for (const w of r.warnings) warnings.push(`idea ${i + 1}: ${w}`);
  });
  if (expected && doc.ideas.length !== expected) warnings.push(`${doc.ideas.length} idea(s) proposed, ${expected} asked for`);
  return { valid, invalid, warnings, seat_notes: typeof doc.seat_notes === 'string' ? doc.seat_notes : '' };
}

const hasIdeas = (v) => v && typeof v === 'object' && Array.isArray(v.ideas);
const tryParse = (s) => { try { return JSON.parse(s); } catch { return undefined; } };

/** Index of the `}` that closes the `{` at `start`, respecting strings; -1 when unbalanced. */
function closeOf(text, start) {
  let depth = 0;
  let inStr = false;
  for (let i = start; i < text.length; i += 1) {
    const ch = text[i];
    if (inStr) {
      if (ch === '\\') i += 1;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === '{') depth += 1;
    else if (ch === '}') { depth -= 1; if (depth === 0) return i; }
  }
  return -1;
}

/** The IDEAS document a final message carries, or null. */
export function recoverFromFinal(text) {
  const src = String(text ?? '');
  const fences = [...src.matchAll(/```json[ \t]*\r?\n([\s\S]*?)```/gi)].map((m) => m[1]);
  for (let i = fences.length - 1; i >= 0; i -= 1) {
    const v = tryParse(fences[i].trim());
    if (hasIdeas(v)) return v;
  }
  for (let i = src.lastIndexOf('{'); i >= 0; i = i > 0 ? src.lastIndexOf('{', i - 1) : -1) {
    const end = closeOf(src, i);
    if (end === -1) continue;
    const v = tryParse(src.slice(i, end + 1));
    if (hasIdeas(v)) return v;
  }
  return null;
}

/**
 * Every string that names a seat: ids, specs, model slugs (whole and without the engine prefix),
 * labels and engine names. Longest first so a model slug is redacted whole.
 */
export function seatStrings(specs) {
  const out = new Set();
  for (const s of specs) {
    const m = String(s).match(/^([a-z]+):([A-Za-z0-9._-]+)@([a-z]+)(?:#([A-Za-z0-9._-]+))?$/);
    if (!m) continue;
    const [, engine, model, effort, label] = m;
    out.add(s); out.add(`${engine}:${model}`); out.add(model); out.add(engine);
    // The seat id; a bare #label is not added - "second" or "b" is ordinary prose.
    out.add(`${engine}-${model}_${effort}${label ? `-${label}` : ''}`);
  }
  return [...out].sort((a, b) => b.length - a.length);
}

/**
 * The blind board. `seats` is [{ id, spec, ideas: [validIdea] }]. Letters come from blindMap over
 * the seat ids seeded with the hackathon id, so a rerun gives the same letters. `material` is
 * host-written text (track, dossier): identifiers it uses are evidence, not signatures, unless
 * they name a seat of this hackathon. Returns { letters: {A: seatId}, ideas: [card], redactions }.
 */
export function buildBoard({ hackathonId, seats, material = [], letters = null }) {
  const map = letters ?? blindMap(seats.map((s) => s.id), hackathonId);
  const bySeat = Object.fromEntries(Object.entries(map).map(([l, id]) => [id, l]));
  const strings = seatStrings(seats.map((s) => s.spec));
  // Every engine the runner knows is a vendor word, seated in this hackathon or not; the contest's
  // IDENTITY_WORDS lacks the CLI names agy and muse.
  const extra = [...strings, ...[...ENGINES].filter((e) => !strings.includes(e))];
  const seatLower = strings.filter((s) => s.length > 3 && !/^[a-z]+$/.test(s)).map((s) => s.toLowerCase());
  const protect = materialPhrases(material, extra).filter((ph) => !seatLower.some((s) => ph.toLowerCase().includes(s)));
  let redactions = 0;
  const scrub = (t) => { const r = scrubIdentity(t, extra, protect); redactions += r.count; return r.text; };
  const ideas = [];
  for (const letter of Object.keys(map).sort()) {
    const seat = seats.find((s) => s.id === map[letter]);
    if (!seat) continue;
    seat.ideas.forEach((idea, k) => {
      ideas.push({
        id: `${letter}${k + 1}`, letter, n: k + 1,
        ...Object.fromEntries(['title', 'pitch', 'user_moment', 'insight', 'baseline', 'mastery', 'risks'].map((f) => [f, scrub(idea[f])])),
        surface: idea.surface,
        stretch: idea.stretch.map(scrub),
        grounding: idea.grounding.map(scrub),
      });
    });
  }
  return { letters: map, bySeat, ideas, redactions, protect };
}

/** Seat strings (ids, specs, model slugs) still present in `text`; [] is a clean board. */
export function leaks(text, specs, { engines = false } = {}) {
  const lower = String(text).toLowerCase();
  return seatStrings(specs).filter((s) => (engines || !/^[a-z]+$/.test(s)) && lower.includes(s.toLowerCase()));
}

/** Clusters from the host's file: [{ name, note, ideas }] plus "Unclustered"; without one, by letter. */
export function groupIdeas(ideas, clusters = null) {
  const ids = new Set(ideas.map((i) => i.id));
  const warnings = [];
  if (!clusters) {
    const letters = [...new Set(ideas.map((i) => i.letter))].sort();
    return { groups: letters.map((l) => ({ name: `Seat ${l}`, note: '', ideas: ideas.filter((i) => i.letter === l).map((i) => i.id) })), warnings };
  }
  const placed = new Set();
  const groups = [];
  for (const c of clusters.clusters ?? []) {
    const members = [];
    for (const id of c.ideas ?? []) {
      if (!ids.has(id)) { warnings.push(`cluster "${c.name}" names unknown idea ${id}`); continue; }
      if (placed.has(id)) warnings.push(`idea ${id} is in more than one cluster; shown in each`);
      placed.add(id);
      members.push(id);
    }
    groups.push({ name: String(c.name ?? 'Cluster'), note: String(c.note ?? ''), ideas: members });
  }
  const rest = ideas.filter((i) => !placed.has(i.id)).map((i) => i.id);
  if (rest.length) groups.push({ name: 'Unclustered', note: '', ideas: rest });
  return { groups, warnings };
}
