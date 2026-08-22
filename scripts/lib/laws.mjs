// Law-statement extraction — the one implementation.
//
// A bundle's `_laws.md` holds cross-cutting invariants, each behind a stable `<a id>`
// anchor. `build-index.mjs` lifts the statement beneath each anchor into `index.json` so a
// consumer reading the index sees what a cited law actually says without opening the file.
//
// WHY THIS IS A MODULE AND NOT A REGEX AT THE CALL SITE. The same argument the bundle
// digest already made: two copies of this parser are two answers to "what is this law's
// statement", and the copies drift the moment somebody fixes one. The stability guard
// (check-hash-stability.mjs) asserts the property THROUGH this function, so the thing
// tested is the thing that runs.
//
// WHY THE NORMALIZATION IS THE FIRST LINE. The statement pattern ends a law at a blank
// line: `[^\n#]` after a newline must not match, and on an LF checkout the next character
// IS `\n`, so it stops. On a CRLF checkout the next character is `\r`, which `[^\n#]`
// happily accepts — so the match ran straight through the blank line and swallowed every
// following paragraph up to the next heading.
//
// That is not hypothetical. The recruiting bundle is the only one whose laws carry a
// second elaborating paragraph, and its committed index.json was generated on a CRLF
// checkout: 828-character statements where a Linux runner computes 267. `build-index --check`
// was green on the machine that wrote it and red in CI, indistinguishably from real
// staleness, and main's `bundle index freshness` job sat red across two pushes.
//
// The rule the repository already learned from the digest, restated: a generated artifact
// must be a property of the CONTENT, never of the checkout it was taken from. Normalize
// before parsing, not after.
const LAW_RE = /<a id="([^"]+)"><\/a>\s*([^\n]*)\n+([^\n]+(?:\n[^\n#][^\n]*)*)/g;

/**
 * Anchor id -> first paragraph beneath it, whitespace-collapsed.
 * @param {string} text raw `_laws.md` contents, any line endings
 * @returns {Record<string, string>}
 */
export const extractLawStatements = (text) => {
  // `\r\n` only, never a blunt "drop every CR": a lone CR is content, and the digest
  // helper takes the same care for the same reason.
  const normalized = text.replace(/\r\n/g, '\n');
  const out = {};
  for (const m of normalized.matchAll(LAW_RE)) {
    out[m[1]] = m[3].replace(/\s+/g, ' ').trim();
  }
  return out;
};
