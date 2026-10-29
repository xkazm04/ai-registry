// packs.mjs - shortlisting by packs: several board ideas fused into one entry, built by one seat.
//
// WHY packs exist: an owner reading a board of forty ideas often sees four products, not twelve
// projects - a broad pack that sweeps a theme and deep packs that each master one corner of it.
// One entry per pack keeps the clock, the worktree and the judging unit unchanged; what changes
// is the brief (a host-written fusion text plus every fused card in full) and the bookkeeping:
// an idea may sit in more than one pack on purpose, so the ledger counts it once per proposer.
//
// Pure: the caller reads packs.json and the board.
import { parseParticipant } from '../../../contest/scripts/lib/participants.mjs';
import { ideaMarkdown } from './render.mjs';

export const FOCI = ['broad', 'deep'];

export const PACK_LICENSE = 'You may sequence, merge or drop parts of the fused ideas to make one product that works; record what you dropped and why in HACKLOG.md.';

/**
 * Validate a packs.json document against the board's idea ids. Returns { packs, problems }; any
 * problem means nothing is shortlisted. A pack: { title, focus, ideas, builder, brief, note? }.
 */
export function validatePacks(doc, boardIds) {
  const problems = [];
  const ids = new Set(boardIds);
  if (!doc || typeof doc !== 'object' || !Array.isArray(doc.packs) || !doc.packs.length) return { packs: [], problems: ['the document has no non-empty "packs" array'] };
  const titles = new Map();
  const packs = doc.packs.map((p, i) => {
    const at = `pack ${i + 1}${typeof p?.title === 'string' && p.title.trim() ? ` "${p.title.trim()}"` : ''}`;
    if (!p || typeof p !== 'object') { problems.push(`${at}: not an object`); return null; }
    const title = typeof p.title === 'string' ? p.title.trim() : '';
    if (!title) problems.push(`${at}: title is missing`);
    else if (titles.has(title.toLowerCase())) problems.push(`${at}: title repeats pack ${titles.get(title.toLowerCase())}`);
    else titles.set(title.toLowerCase(), i + 1);
    const focus = typeof p.focus === 'string' ? p.focus.trim().toLowerCase() : '';
    if (!FOCI.includes(focus)) problems.push(`${at}: focus ${JSON.stringify(p.focus)} is not one of ${FOCI.join(', ')}`);
    const list = Array.isArray(p.ideas) ? p.ideas.map((x) => String(x).trim().toUpperCase()).filter(Boolean) : null;
    if (!list || !list.length) problems.push(`${at}: ideas must be a non-empty array of board ids`);
    const ideas = [...new Set(list ?? [])];
    if (list && ideas.length !== list.length) problems.push(`${at}: ideas repeat an id`);
    for (const id of ideas) if (!ids.has(id)) problems.push(`${at}: idea ${id} is not on the board`);
    let builder = null;
    if (typeof p.builder !== 'string' || !p.builder.trim()) problems.push(`${at}: builder is required (engine:model@effort)`);
    else { try { builder = parseParticipant(p.builder).spec; } catch (e) { problems.push(`${at}: ${e.message}`); } }
    const brief = typeof p.brief === 'string' ? p.brief.trim() : '';
    if (!brief) problems.push(`${at}: brief is missing - the host writes the fusion brief`);
    if (p.note !== undefined && p.note !== null && typeof p.note !== 'string') problems.push(`${at}: note must be a string`);
    return { title, focus, ideas, builder, brief, note: typeof p.note === 'string' ? p.note.trim() : '' };
  });
  return { packs: problems.length ? [] : packs, problems };
}

/**
 * The pack's IDEA.md: title, focus, the fusion brief verbatim, the owner's note, the license to
 * reshape, then every fused idea card in full. `cards` are original ideas with their board id.
 */
export function packMarkdown({ title, focus, brief, note, cards }) {
  return [
    `# Pack: ${title}`,
    '',
    `**Focus:** ${focus} - ${focus === 'broad' ? 'one product that spans the fused ideas' : 'one corner of the track, mastered'}. Fuses ${cards.map((c) => c.id).join(', ')}.`,
    '',
    String(brief).trim(),
    '',
    ...(note ? ['## The owner\'s note on this pack', '', note.trim(), ''] : []),
    PACK_LICENSE,
    '',
    '## Ideas fused into this pack',
    '',
    ...cards.map((c) => ideaMarkdown(c, { heading: '###' }).trim()).flatMap((t) => [t, '']),
  ].join('\n').replace(/\n{3,}/g, '\n\n').trim().concat('\n');
}

/** idea id -> the entries that carry it: "e1" for a pick, `e1 "Pack title"` for a pack. */
export function shortlistLabels(state) {
  const out = {};
  for (const row of state.shortlist ?? []) {
    const ideas = row.ideas ?? (row.idea ? [row.idea] : []);
    const label = row.ideas ? `${row.entry} "${row.title}"` : row.entry;
    for (const id of ideas) (out[id] ??= []).push(label);
  }
  return Object.fromEntries(Object.entries(out).map(([k, v]) => [k, v.join(', ')]));
}

/** Distinct idea ids across the shortlist (an idea in two packs once). */
export const shortlistedIdeas = (state) => [...new Set((state.shortlist ?? []).flatMap((r) => r.ideas ?? (r.idea ? [r.idea] : [])))];

/** How an entry names its idea(s) in status, judging and the vault: `A3` or `pack [deep]: A1, B2`. */
export const entryIdeaLabel = (e) => (e.ideas ? `pack [${e.pack?.focus ?? '?'}]: ${e.ideas.join(', ')}` : String(e.idea));

/**
 * Advice for a `--pick` list: null when it fits, else { refuse, message }. One entry per pick means
 * one seat, one worktree and one dev server per pick; 1.0.0's owner picked 12 ideas for 4 seats,
 * and the host had to invent packs mid-run. More picks than max(4, seats) are refused (override
 * with --force); 5..seats picks are a warning.
 */
export function pickAdvice(picks, seats) {
  const cap = Math.max(4, seats);
  const fuse = 'fuse them into packs instead (one entry per seat: a broad pack and deep ones), write packs.json and run shortlist --packs';
  if (picks > cap) return { refuse: true, message: `${picks} picks for ${seats} seat(s) would start ${picks} entries at once - ${fuse}; --force builds every pick` };
  if (picks < 2 || picks > 4) return { refuse: false, message: `${picks} pick(s) - the format expects 2 to 4${picks > 4 ? `; consider packs: ${fuse}` : ''}` };
  return null;
}
