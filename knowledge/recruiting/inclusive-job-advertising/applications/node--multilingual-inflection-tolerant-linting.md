---
layer: application
type: application
subject: inclusive-job-advertising
technique: multilingual-inflection-tolerant-linting
stack: node
status: forged
---

# Bilingual phrase patterns in the JD lint engine (Node/TypeScript)

`app/_lib/jd-lint.ts` is the whole rules engine: pure, registry-free, no
network, no model. Its header states the architecture and the reason in one
breath (`:8-11`) — *"Deliberately rules-only (no LLM): the check must be
instant, deterministic, and free — it runs on every edit. The phrase lists are
the highest-frequency offenders in EN + CS job ads, with inflection-tolerant
Czech stems."*

## Two lists, not one translated list

`VAGUE_PATTERNS` (`:24-42`) holds eight English patterns and seven Czech ones,
and the Czech half is **not a translation** of the English half. It carries
offenders that only exist in that market's advertising register —
`motivující (finanční) ohodnocení`, `rodinná atmosféra`, `staň se součástí`,
`mladý kolektiv` — while the English half carries `work hard, play hard` and
the `rockstar|ninja|guru` family, which have no Czech equivalent in local
postings. That asymmetry is the standard's "prefer a shorter native list over a
translated long one" realized: the lists diverge because the boilerplate
diverges.

`EXCLUSIONARY_PATTERNS` (`:48-58`) is split the same way, and its comment
(`:44-47`) notes the one cross-list discipline that matters: *"rockstar/ninja/
guru already flag under `vague`, so they're not repeated here"* — one phrase,
one finding, even when it belongs to two categories.

## Inflection tolerance, and the two Unicode traps

Every Czech pattern stems and then opens a `\p{L}*` letter run:

```
/konkurenceschopn\p{L}*\s+(?:plat\p{L}*|mzd\p{L}*|ohodnocen\p{L}*)/giu
```

The module comment names the trap that forces `\p{L}` rather than `\w`
(`:10-11`): *"`\p{L}` because JS `\w` excludes diacritics —
`/konkurenceschopn\w*/` would stall at 'ý'."* This is trap three of the
standard, observed in the language it bites in: the stem is correct, the
letter class is not, and the pattern silently matches only the nominative
forms while missing every declined one.

The `giu` flags are all three load-bearing and the comment says which does what
(`:21-23`): `g` to collect every hit rather than the first, `i` **with Unicode
folding** so `Kč`/`Č` fold correctly, `u` to interpret `\p{L}` at all.

Trap four appears at `PLACE_RE` (`:70-74`), where the fix is the *absence* of
a construct:

```
// Substring stems on purpose — "hybridní", "v kanceláři", "remotely" all count;
// trailing ASCII \b would break after diacritics (plzeň), so none is used.
```

A trailing word boundary after `plzeň` does not hold, because the boundary
assertion is defined against the same ASCII class `\w` is. The pattern
therefore ends at the stem and accepts the substring — a deliberate loosening,
documented as deliberate, which is the difference between this and a bug.

## Findings as the writer reads them

`collectPhrases` (`:80-98`) implements the presentation rules exactly: it
collects across all patterns, sorts by `match.index` so findings arrive in
**document order** — *"the recruiter reads the findings against their own text
top-to-bottom"* (`:76-79`) — normalizes internal whitespace but reports
`match[0]` **as written**, and dedupes on a lowercased key so *"Dynamic team"*
and *"dynamic team"* report once.

## Deviations from the standard

- **No language detection, and no not-checked state.** The engine is
  "bilingual by content" (`jdsLibrary.ts:38-39`) — there is no language
  argument to thread, so a posting in a third language is run against the EN+CS
  lists and returns zero phrase findings. That renders as clean. The product
  already localizes template scaffolding into four languages
  (`renderTemplate.ts:66-68`), so German and French postings exist while no
  list covers them. The standard's rule stands: an unsupported language must
  report *not checked in this language*, never an empty finding set.
- **`MUST_HAVE_RE` (`:62`) counts marker words, not requirements**, and
  `MANY_MUST_HAVES = 8` (`:63`) sits above the roughly-five ceiling the
  requirement discipline sets. The proxy is honest about being advisory, but
  the threshold is not the cap — and a posting with ten bare bullets and no
  marker word scores zero.
