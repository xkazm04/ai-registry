---
layer: application
type: application
subject: release-pipeline
technique: size-budgets
stack: node
verified_on: 2026-10-31
verified_against: node@22
---

# Size budgets — bundle budget gate, committed baseline, per-target installer report

How this repo applies the [size-budgets](../techniques/size-budgets.md)
technique across three scripts and one committed baseline.

## One budget definition, two consumers

`scripts/lib/bundle-budget.mjs` holds the thresholds — `MAX_CHUNK_KB = 850`,
`MAX_TOTAL_KB = 5000` — and its header comment records why it exists:
previously the gate, the report, and the CI flags carried **three
independent copies of 850/5000**, and "the report would say PASS while the
gate said FAIL." Both consumers now import it:

- `scripts/check-bundle-budget.mjs` — **the failing gate** (budget layer).
  Reads every JS chunk in `dist/assets/`, fails (exit 1) on any chunk over
  the per-chunk ceiling or on total overflow. Wired into CI after the build
  (`.github/workflows/ci.yml:678`), flag-overridable for local ad-hoc runs
  but flagless in CI so local and CI can't diverge.
- `scripts/bundle-size-report.mjs` — **the advisory delta layer**. Emits a
  markdown table (top 10 chunks, sizes, deltas, PASS/FAIL) for review
  surfaces, via `scripts/bundle-comment.mjs`.

The 850 ceiling itself is documented against reality ("the main index chunk
is ~778 KB… 850 leaves headroom without masking real growth") — a budget
set from measurement plus deliberate headroom, per the technique.

## The committed baseline

`scripts/bundle-baseline.json` is the committed comparison point:
`{ timestamp, totalKB, chunks: { name → KB } }`, with content-hash suffixes
normalized out of chunk names (`scripts/lib/bundle-budget.mjs:58-66`) so the key
survives rebuilds. Deltas render per chunk (`NEW` for unbaselined chunks)
and for the total. Refreshing it is a deliberate `--save-baseline` + commit
act — the comment at `:110-114` records the incident that shaped this:
`--save-baseline` used to write a *different file* than the one deltas read
from, so refreshing never actually refreshed (a gate-sees-target failure
inside the measuring instrument itself).

## Per-target installer sizes

`scripts/binary-size-report.mjs` covers the native side: binary + every
installer bundle, `--budget <MB>` fail mode (installers only, `:132-138`),
delta-vs-baseline coloring, `--target <triple>` to find the right output
tree — with the comment at `:27-32` recording that omitting `--target` in
CI made the script look at an empty directory and die, "silently disabling
the installer-size budget." The release workflow runs it with
`--budget 100` (`release.yml:435-437`).

## Where it undershoots the technique

1. **No ratchet.** When bundle size drops, nothing proposes lowering
   `bundle-baseline.json` (last refreshed 2026-03-14); headroom accumulates
   exactly as the technique warns.
2. **The installer baseline is not committed.** `binary-size-report.mjs`
   reads `.baseline/binary-sizes.json`, which is untracked — so in CI the
   installer report never has a baseline and the delta column is
   permanently empty. Only the JS bundle side implements
   "committed baseline".
3. **Single-target enforcement.** The installer budget runs only on the
   windows-x64 leg (`release.yml:436` `if: matrix.label == 'windows-x64'`);
   the other three targets ship unbudgeted — the per-target clause of the
   technique, unapplied.

Reported as deviations; the standard stands.

## Re-checked 2026-10-31 at personas@22260d77

The JS side changed shape; the installer side did not.

- **The gate is now a ratchet, not a flat ceiling.** Since 2026-08-30,
  `check-bundle-budget.mjs` compares total JS, startup JS and every chunk
  (keyed by the source module it loads, from a chunk graph the build writes)
  against `scripts/bundle-baseline.json`, and fails on a rise beyond
  max(1%, 10 KB). 850/5000 survive in `scripts/lib/bundle-budget.mjs:34-35`
  only as the no-baseline fallback. Its header records why: the "~778 KB main
  chunk" note above was never re-measured, the real build was ~33 MB over
  1,452 chunks, and the flat check had been failing while running green
  under `if: always()`. The "budget set from measurement plus headroom"
  reading of the 850 ceiling no longer describes the tree. A startup-JS
  ceiling (`STARTUP_TARGET_KB`, set 2026-10-25) is now a hard limit.
- **Undershoot 1 is partly resolved.** A chunk that shrinks or disappears
  now prints a non-fatal "baseline stale" notice proposing `--update`, so a
  drop is surfaced rather than silent. Lowering the baseline is still a
  manual act; the baseline was last refreshed 2026-10-25 (schema 2).
- **The `--save-baseline` incident comment is gone.** `bundle-size-report.mjs`
  no longer writes a baseline at all (retired 2026-10-25,
  `bundle-size-report.mjs:32-36`); `check-bundle-budget.mjs --update` is the
  one writer, which removes the two-file split by construction. The report
  now renders the gate's own ratchet verdict instead of the flat caps.
- **Undershoots 2 and 3 stand.** `.baseline/` is still gitignored, and the
  installer budget still runs only on the windows-x64 leg.
