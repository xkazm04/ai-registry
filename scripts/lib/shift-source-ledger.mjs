/**
 * shift-source-ledger - which YouTube videos has this registry already mined?
 *
 * WHY
 * /shift fills its queue unattended, so a video mined twice costs a full extraction round
 * with nobody watching. `librarian/sources/index.md` looks like the answer and is not:
 * measured, some ids exist only in a source note's frontmatter and never reached the index.
 * The ledger is therefore the UNION of the index and the frontmatter of every note.
 *
 * WHY NOT run-board's normSource
 * That fold answers "are these two spellings one source?" and lowercases video ids to do it.
 * YouTube ids are case-sensitive, and yt-dlp and any link built from a lowercased id reach
 * nothing, so this ledger keeps each id exactly as it was written. A fold is for comparing;
 * this set is also read back out.
 */
import fs from 'node:fs';
import path from 'node:path';

const ID = '[A-Za-z0-9_-]{11}';
const AFTER_ID = '(?![A-Za-z0-9_-])';
const SPELLINGS = new RegExp(
  `(?:youtu\\.be/|youtube\\.com/(?:watch\\?(?:[^\\s)"'\\]]*&)?v=|shorts/|live/|embed/)|youtube:)(${ID})${AFTER_ID}`,
  'gi',
);

export const VIDEO_ID_RE = new RegExp(`^${ID}$`);

/** Every video id spelled in a text, case preserved, in first-seen order. */
export function extractVideoIds(text) {
  return [...new Set([...String(text).matchAll(SPELLINGS)].map((m) => m[1]))];
}

/** The frontmatter block of a note, or '' when it has none. */
export function frontmatterOf(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(String(text));
  return m ? m[1] : '';
}

/**
 * The union, as a Set of case-preserved ids. A missing index throws: "the ledger could not be
 * read" must never pass for "nothing has been mined", which would re-mine everything.
 */
export function minedVideoIds(root) {
  const dir = path.join(root, 'librarian', 'sources');
  const ids = new Set(extractVideoIds(fs.readFileSync(path.join(dir, 'index.md'), 'utf8')));
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.md') || f === 'index.md') continue;
    for (const id of extractVideoIds(frontmatterOf(fs.readFileSync(path.join(dir, f), 'utf8')))) ids.add(id);
  }
  return ids;
}
