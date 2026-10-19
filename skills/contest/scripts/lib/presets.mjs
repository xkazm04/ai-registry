/**
 * Init presets - the part of a contest's shape that is a decision about the kind of brief, not
 * about one idea. Pure: resolves options, touches nothing.
 */

// The seats that carried the first landing contest (2026-09-29, dollar/cinema-portfolio): six of
// six variants delivered, the owner took five of them forward. Sonnet at max effort held level
// with Opus at xhigh on a graphics-heavy brief, at 1.4x the wall time.
export const UI_DEFAULT_PARTICIPANTS = 'claude:claude-sonnet-5-5@max,claude:claude-opus-5-5@xhigh';

export const PRESETS = {
  // A representative / landing page judged first on visual quality, motion and creativity.
  landing: { participants: UI_DEFAULT_PARTICIPANTS, variants: 3, timeout_min: 90, review: 'owner', bar: 'landing-bar.md' },
};

/**
 * Merge a preset under the explicit options: an option the call names always wins.
 * Returns the resolved init shape plus where each value came from, so init can say so.
 */
export function resolveInit(opts) {
  const name = opts.landing ? 'landing' : (opts.preset && opts.preset !== true ? String(opts.preset) : null);
  if (name && !PRESETS[name]) throw new Error(`unknown preset "${name}" (${Object.keys(PRESETS).join(', ')})`);
  const preset = name ? PRESETS[name] : {};
  const given = (k) => opts[k] !== undefined && opts[k] !== true;
  const review = given('review') ? String(opts.review) : (preset.review ?? 'panel');
  if (!['panel', 'owner'].includes(review)) throw new Error(`--review is panel or owner, got "${review}"`);
  return {
    preset: name,
    participants: given('participants') ? String(opts.participants) : (preset.participants ?? UI_DEFAULT_PARTICIPANTS),
    participantsDefaulted: !given('participants'),
    variants: Number(given('variants') ? opts.variants : (preset.variants ?? 3)),
    timeout_min: Number(given('timeout-min') ? opts['timeout-min'] : (preset.timeout_min ?? 60)),
    review,
    bar: preset.bar ?? null,
  };
}

// What a seat delivers, in the brief's words. The default is a page that opens from disk; a contest
// whose artefact is something else (a GitHub README and its SVGs, a report rendered by a staged
// tool) passes `--deliverable <file>` with any of `## Layout`, `## Entry`, `## Data`, `## Test`.
// `index.html` stays the page the owner and the router open, so a non-page deliverable must still
// say how each variant's index.html is produced. Measured on xkazm04 2026-10-15: without this, five
// identical hand edits to every PARTICIPANT.md.
const DELIVERABLE_DEFAULTS = {
  layout: (n) => Array.from({ length: n }, (_, i) => `variant-${i + 1}/index.html     variant-${i + 1}/NOTES.md`).join('\n'),
  entry: () => '`index.html` opens directly from disk (`file://`), with no build step and no server. Inline\n  your CSS and JS, or keep them in files beside it. Libraries only from a public CDN\n  (jsdelivr, cdnjs, unpkg) and only when they earn their weight; a variant that also works\n  offline is worth more than one that does not.',
  data: (_, hasData) => (hasData
    ? 'The input data is in `data/` beside the variant directories, with `data/SCHEMA.md` describing it. Reference it by relative path from `index.html` (for example `<script src="../data/knowledge.js">`), or inline it. Never modify `data/`.'
    : 'No input data is provided; build your own realistic dataset inside the variant and say in `NOTES.md` how it was made.'),
  test: () => 'Test what you can without a browser: the file exists, the script parses, the data path\n  resolves relative to `index.html`.',
};

/**
 * The deliverable lines of the participant brief: the defaults, with any section of an override
 * file (`## Layout`, `## Entry`, `## Data`, `## Test`) replacing its line. Unknown sections throw.
 */
export function deliverableLines(override, { variants, hasData }) {
  const sections = {};
  if (override) {
    for (const part of String(override).split(/^## +/m).slice(1)) {
      const [head, ...body] = part.split('\n');
      const key = head.trim().toLowerCase();
      if (!(key in DELIVERABLE_DEFAULTS)) throw new Error(`--deliverable: unknown section "## ${head.trim()}" (Layout, Entry, Data, Test)`);
      sections[key] = body.join('\n').trim();
    }
  }
  const line = (k) => sections[k] || DELIVERABLE_DEFAULTS[k](variants, hasData);
  return { layout: line('layout'), entry_line: line('entry'), data_line: line('data'), test_line: line('test') };
}

/** The two template sentences that depend on who decides: a blind panel, or the owner alone. */
export function reviewLines(review) {
  return review === 'owner'
    ? {
      review_line: 'the owner will open every variant in a browser, blind, and choose',
      rubric_intro: 'Every variant is reviewed on seven dimensions, equally weighted:',
    }
    : {
      review_line: 'a blind panel will score every variant, and one will win',
      rubric_intro: 'The panel scores each variant 1 to 10 on seven dimensions, equally weighted:',
    };
}
