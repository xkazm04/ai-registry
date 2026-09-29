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
