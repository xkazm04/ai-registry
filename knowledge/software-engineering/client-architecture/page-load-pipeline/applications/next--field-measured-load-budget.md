---
layer: application
type: application
subject: page-load-pipeline
technique: field-measured-load-budget
stack: next
status: forged
verified_on: 2026-09-24
verified_against: next@16.3.3
---

# A per-route first-load ratchet with no field half

Tree: personas-web, read at `11601e09` (2026-09-24) while its main checkout was mid-merge in
another session; nothing was modified. Version witness: `package-lock.json` resolves
`node_modules/next` to 16.3.3 and `react` to 19.2.8 (lockfile, not the `^16.3.3` range in
`package.json`). The seam is the bundle ratchet: `scripts/check-bundle-budget.mjs`, its
ceilings in `bundle-budget.json`, and the CI step that runs it after the production build.

## What the pre-merge half does

The gate reads the per-route statistics the build writes and compares them with committed
ceilings. Its header records why it exists, and the reason is the technique's
absent-instrument rule told as an incident: the framework's build output
`scripts/check-bundle-budget.mjs:10 "Next 16's build output no longer prints Size / First Load JS"`,
so `scripts/check-bundle-budget.mjs:11 "nothing in the repo could see bundle weight at all"`, and
a charting chunk sat in `scripts/check-bundle-budget.mjs:12 "three dashboard routes' first load for months"`.
A toolchain upgrade removed the instrument, and nothing failed.

What it holds, measured against the technique:

- **It says what it counts.** The measured value is
  `scripts/check-bundle-budget.mjs:54 "firstLoadUncompressedJsBytes"`, and the ceiling file
  states it: `bundle-budget.json:2 "Ceilings for first-load uncompressed JS, in KB."`
  Uncompressed is the right choice for a main-thread proxy, since parse and compile scale
  with it; the file does not say that is why.
- **It budgets the shared floor separately.** Chunks present in every route's first load are
  summed, and `scripts/check-bundle-budget.mjs:110 "sharedKB > budget.sharedBaselineKB"` fails
  the gate on its own line, labelled as the cost every route pays.
- **It is a ratchet with written headroom.** Each ceiling is the measured value plus
  `scripts/check-bundle-budget.mjs:31 "const TOLERANCE_KB = 40;"`, routes far under their
  ceiling are reported so the win can be locked in, and re-baselining requires a reason in
  the commit message.
- **Missing input fails.** `scripts/check-bundle-budget.mjs:39 "if (!fs.existsSync(STATS)) {"`
  and `scripts/check-bundle-budget.mjs:49 "if (!rows.length) {"` both exit non-zero, so a
  build that stops writing statistics turns the gate red instead of green.
- **It runs where the build ran.** CI runs `.github/workflows/ci.yml:76 "run: npm run build"`
  and then `.github/workflows/ci.yml:82 "run: npm run check:bundle"`, so in CI the statistics
  always come from the tree being judged.
- **It points at the cure.** The failure message names the usual cause, a heavy module
  imported statically, and the dashboard chart cards' client-only dynamic import as the
  shape to copy: `scripts/check-bundle-budget.mjs:136 "defer it with"`.

## Where it falls short of the technique

- **New routes enter unbounded.** A route with no ceiling is collected by
  `scripts/check-bundle-budget.mjs:101 "unbudgeted.push([route, value]);"` and printed as
  `scripts/check-bundle-budget.mjs:120 "routes with no budget entry (add one with --update)"`;
  it does not fail. The route most likely to be heavy is the one the gate lets through.
- **Staleness is not checked.** The gate asserts the statistics file exists, not that it came
  from the current build. In CI the step order covers this; locally it does not. It was run
  read-only for this document (`node scripts/check-bundle-budget.mjs`, no `--update`): the
  local `.next` statistics dated from 2026-09-05 while the ceilings were
  generated on `bundle-budget.json:3 "2026-09-23"`, and the gate reported `/preview` and
  `/preview/[section]` 333 KB over their ceilings. That verdict is about a build three weeks
  older than the budget, not about the current tree. It is the stale-input case the
  technique names, reproduced by accident.
- **There is no field half.** No real-visit collection of the three load metrics was found:
  no vitals reporting in `src`, and the error-reporting client runs with
  `src/lib/sentry.ts:7 "tracesSampleRate: 0,"`. The gate protects bytes, the proxy. Nothing
  reports the 75th percentile of largest paint, responsiveness or layout shift by device
  class, so no one can tell whether staying under the ceilings kept the pages fast.
- **Only script is budgeted.** Render-blocking stylesheets, foreign origins on the critical
  path and preload counts are not gated. The root layout loads a third-party font stylesheet
  on every route, and no budget line would notice a second one.
- **No owner is named** per ceiling, beyond whoever writes the commit message.

## What this realization cannot do or prove

- It cannot show that any route is fast for readers. Bytes under a ceiling do not bound
  main-thread time on a weak device, and responsiveness has no proxy here at all.
- It cannot catch a regression smaller than 40 KB per change, and it allows many such
  changes before the ratchet is re-baselined downward.
- Its shared-floor sum is computed from chunk file sizes on disk and skips chunks that cannot
  be stat'ed. A partially cleaned output directory under-reports the floor instead of
  failing.
- The measurement above ran against a stale local build. It was not rebuilt, because the
  checkout belonged to another session mid-merge. No current per-route number is claimed.
