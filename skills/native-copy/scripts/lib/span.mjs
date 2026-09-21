// span.mjs - make a quoted span locatable: expand it until it occurs exactly once in its unit.
// Builtins only.
//
// Technique: copy-quality-gates/anchored-model-review, "The deterministic veto layer".
// "The span must occur verbatim" is only checkable when the span is unique: a span that occurs
// twice does not say which occurrence is meant, and a replacement applied to the wrong one is a
// clean-string edit. So a span is widened word by word in scripts written with spaces, and
// character by character in scripts written without word spacing, until it occurs once. A span
// that cannot be made unique inside its unit is reported as not unique, never guessed.

// Scripts conventionally written without spaces between words.
const NO_SPACE = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Thai}\p{Script=Lao}\p{Script=Khmer}\p{Script=Myanmar}\p{Script=Tibetan}]/u;

/** Occurrences of `needle` in `text`, overlapping ones included ("aa" occurs twice in "aaa"). */
export function occurrences(text, needle) {
  if (!needle) return 0;
  let n = 0;
  for (let at = text.indexOf(needle); at !== -1; at = text.indexOf(needle, at + 1)) n += 1;
  return n;
}

// One step outward from [start, end): a single character when the character crossed belongs to
// a no-space script, otherwise the neighbouring whitespace plus the whole next word.
function stepRight(text, end) {
  if (end >= text.length) return end;
  if (NO_SPACE.test(text[end])) return end + 1;
  let j = end;
  while (j < text.length && /\s/u.test(text[j])) j += 1;
  if (j < text.length && NO_SPACE.test(text[j])) return j + 1;
  while (j < text.length && !/\s/u.test(text[j]) && !NO_SPACE.test(text[j])) j += 1;
  return j;
}

function stepLeft(text, start) {
  if (start <= 0) return start;
  if (NO_SPACE.test(text[start - 1])) return start - 1;
  let j = start;
  while (j > 0 && /\s/u.test(text[j - 1])) j -= 1;
  if (j > 0 && NO_SPACE.test(text[j - 1])) return j - 1;
  while (j > 0 && !/\s/u.test(text[j - 1]) && !NO_SPACE.test(text[j - 1])) j -= 1;
  return j;
}

/**
 * Expand the span text.slice(index, index + length) until it occurs exactly once in `text`,
 * alternating right then left. Returns { index, length, span, unique }; `unique: false` means
 * the whole unit was reached without a unique span (a unit that repeats itself, or an empty span).
 */
export function uniqueSpan(text, index, length) {
  const t = String(text);
  let start = Math.max(0, Math.min(index, t.length));
  let end = Math.max(start, Math.min(start + (length || 0), t.length));
  if (end === start) return { index: start, length: 0, span: '', unique: false };
  for (let turn = 0; ; turn += 1) {
    const span = t.slice(start, end);
    if (occurrences(t, span) === 1) return { index: start, length: end - start, span, unique: true };
    if (start === 0 && end === t.length) return { index: start, length: end - start, span, unique: false };
    if (turn % 2 === 0 && end < t.length) end = stepRight(t, end);
    else if (start > 0) start = stepLeft(t, start);
    else end = stepRight(t, end);
  }
}

/**
 * Locate a span quoted by someone who did not give an offset (a model's finding): the index of
 * its only occurrence, or a reason it cannot be anchored.
 * Returns { index } | { error: 'absent' | 'ambiguous', count }.
 */
export function locateSpan(text, span) {
  const t = String(text);
  const s = String(span ?? '');
  if (!s) return { error: 'absent', count: 0 };
  const count = occurrences(t, s);
  if (count === 0) return { error: 'absent', count };
  if (count > 1) return { error: 'ambiguous', count };
  return { index: t.indexOf(s) };
}
