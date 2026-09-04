---
layer: application
type: application
subject: quality-gates
technique: ratchet-design
stack: node
verified_on: 2026-09-01
verified_against: node@24
---

# A suppression ratchet whose drop is a note, not a red build

This repository ratchets its suppression debt on two sides — Python ignores
via `scripts/lint/ruff-ratchet.mjs`, and TypeScript/ESLint suppressions via
`scripts/lint/ts-ratchet.mjs` against the committed baseline `ts-debt.json`
(`ts-ratchet.mjs:88`). The blocking invocation is `npm run lint:ts-ratchet`
(`package.json:23`), wired into CI at `.github/workflows/ci.yml:88`.

## The five verdicts, split by direction

`runChecks` grades each ceiling and assigns severity by *which way the number
moved*:

- `undeclared`, `unexplained`, `grew` — **blocking**, exit 1
  (`ts-ratchet.mjs:395`).
- `burnt-down` (zero occurrences against a non-zero ceiling) —
  **note** (`ts-ratchet.mjs:287-298`).
- `slack` (fewer than the ceiling) — **note** (`ts-ratchet.mjs:300-311`).

The header states the reason in one line (`ts-ratchet.mjs:57-59`): *"A NOTE:
making every removed suppression a red build taxes the fix rather than the
debt."* That is the technique's asymmetry implemented — the rise is refused,
the drop is refused *silence*, and the two are not the same severity.

## The recording is performed unattended, under all three conditions

Both notes carry the exact command that records them, and say who normally
runs it: *"Run `npm run lint:ts-ratchet -- --tighten` … (autofix.yml does
this on every pull request)"* (`ts-ratchet.mjs:294`, `:307`). The three
guards that make an automatic baseline write survivable are all present:

1. **Downward only.** `tighten()` lowers a ceiling to the tree's count and
   returns the entry untouched when `actual >= max`
   (`ts-ratchet.mjs:332-341`), with the doc comment stating the rule: *"Never
   raises one: a ceiling that follows the debt upward is a log, not a
   ratchet."*
2. **A diff on the change under review, not a write to the mainline.** It
   runs inside `.github/workflows/autofix.yml:139-140`, whose only trigger is
   `pull_request` (`autofix.yml:50-51`),
   and the file is committed in `JSON.stringify(…, 2)` formatting precisely
   so an unattended rewrite puts two numbers in the diff rather than the
   whole file (`ts-ratchet.mjs:324-328`).
3. **Behind the counter's own instrument assertion.** An empty walk is fatal:
   *"no .ts/.tsx files found under … — that is not 'no debt', it is a walk
   that found nothing"* (`ts-ratchet.mjs:186-192`), and an unreadable
   `ts-debt.json` exits 1 with *"if it moved or changed shape, this check is
   not checking anything"* (`ts-ratchet.mjs:365-371`). The header names the
   failure it is preventing: without them *"every entry would look burnt down
   and a `--tighten` would zero the whole list against a tree it never
   opened"* (`ts-ratchet.mjs:72-74`).

## Why the drop is worth recording at all

Both notes end with the same sentence in different words — *"Until then the
entry would let the debt grow back to the old number"* — which is the
technique's graduation rule stated as a hazard: a ceiling left above the tree
is headroom, and headroom refills. Burning an entry down to zero **locks the
win**, because zero is a ceiling like any other and the next occurrence to
arrive is a `grew` (`ts-ratchet.mjs:60-62`).

## The deliberate divergence between the two ratchets

The header records where the sibling differs and why
(`ts-ratchet.mjs:64-69`): in `ruff-ratchet.mjs` an ignore that suppresses
nothing is `dead` and **blocking** (`ruff-ratchet.mjs:32`, `:156`), because
there the entry *is* a live suppression and one that excuses nothing is rot
reading as policy. Here the entry is a *ceiling* on a suppression, so the
burnt-down entry is worth keeping at zero. Same mechanism, opposite verdict,
decided by what the row means — and written down at the divergence rather
than discovered by the next reader.

## The motivating constraint, named

The editors of `ts-debt.json` are a much smaller set than the authors who
trip it — the script's own header calls the TypeScript side "the larger
surface, and where most agent-authored code lands" (`ts-ratchet.mjs:9`), and
the baseline is one shared file. Making each burn-down a two-part change would put every
conformance fix through that file; the note-plus-unattended-tighten split is
what keeps the baseline off the critical path of the fix.

## Sources

- This repo at HEAD `c6a63199`: `scripts/lint/ts-ratchet.mjs`,
  `scripts/lint/ruff-ratchet.mjs`, `.github/workflows/autofix.yml:125-140`,
  `.github/workflows/ci.yml:88`, `package.json:23`.
- Independent corroboration of the cost being paid elsewhere: ESLint's bulk
  suppressions exit non-zero once a suppressed violation is fixed
  ("There are suppressions left that do not occur anymore… consider
  re-running with `--prune-suppressions`"), i.e. the fix itself reddens the
  build until the baseline is edited —
  <https://eslint.org/docs/latest/use/suppressions>.
