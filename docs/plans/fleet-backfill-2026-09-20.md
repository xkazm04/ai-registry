# Fleet backfill — what is blocked, and on what decision (2026-09-20)

Written for an operator returning to an unattended session. Everything below is measured
and reproducible from the scripts named. **Nothing in this document has been acted on**;
each item is a decision that reaches other people's repositories, and this repository's law
for that is propose-then-adopt.

The ask was: register each project's code into the registry, then conform globally on the
new impact. The first half is blocked on a capability this session does not have. The
second half ran anyway, within the reach that exists today.

---

## 1. The gap, measured

`node scripts/check-context-coverage.mjs`

| | |
| --- | ---: |
| source files across 13 checkouts | 25,891 |
| files inside some context | 15,222 (59%) |
| **files in no context at all** | **10,669 (41%)** |
| dead context paths (pointing at deleted files) | 528 |
| context↔subject pairs | 4,720 |
| pairs judged | 281 (6.0%) |

A file in no context can never be judged, however good the corpus is and however diligent
the session — a pair hangs off a context. So the 6% judged figure is bounded by a 59%
ceiling it has never been measured against. Worst first:

| project | coverage | uncovered | dead paths | map age | context key |
| --- | ---: | ---: | ---: | ---: | --- |
| pof | **9%** | 3,919 | 3 | 33d | id |
| tracklight | 33% | 439 | 6 | 47d | id |
| pumper | 43% | 155 | 0 | 47d | id |
| goat | 47% | 539 | 3 | 96d | **group/name** |
| personas | 58% | 2,708 | **430** | 44d | id |
| systedo-case | 60% | 750 | 0 | 52d | id |
| athena-everywhere | 67% | 258 | 17 | 9d | id |
| politicas | 77% | 242 | 0 | 46d | id |
| kp | 79% | 830 | 27 | 5d | id |
| gravity | 80% | 94 | 0 | 11d | id |
| personas-web | 83% | 217 | 39 | 98d | **group/name** |
| ascent | 85% | 464 | 3 | 22d | **group/name** |
| gravitone | 93% | 54 | 0 | 42d | **group/name** |

**pof is not stale, it is sampled.** Its context map declares 441 file paths for 4,289
source files, and its own `stats.files` block says 441 — 38 contexts for a repo kp partitions
into 191. Same generator, five times the granularity. So "backfill" means different work in
different projects: a re-scan at finer granularity in pof, tracklight and pumper; a refresh
in the 90-day-old maps; a dead-path sweep in personas.

---

## BLOCKER 1 — the context-map rebuild needs a capability this session lacks

Regenerating a context map is `/project-populate`, which **conducts the Personas app's scan
lanes over its loopback bridge**. The app is not running (port 1420 closed, no process), so
the lane cannot be driven from here. This is the single blocker that gates the whole ask.

**Decide:** whether to run `/project-populate contexts` per project, and in what order.

Recommended order, worst-coverage first but with one constraint ahead of it: **do the four
`group/name` projects last or with recovery planned.** Their contexts are keyed by
`<group>/<name>` because the exporter writes no `id`, so a renamed or regrouped context
mints a new key and its verdicts **orphan**. `scripts/lib/map-churn.mjs` recovers some by
path overlap; it is not a guarantee. The id-keyed projects are safe to rebuild.

Measured precedent, worth respecting: an accidental rebuild in kp earlier today moved four
live verdicts into `orphans[]` — none lost, but none live either, and `skills/conform/LESSONS.md`
records an earlier rebuild that "added 628 pairs and turned every verdict into an orphan".

---

## BLOCKER 2 — the matcher hides most of what it finds

Full measurement in [`docs/matcher-reach.md`](../matcher-reach.md).

The join ranks the right subject and then does not publish it. `table` on a context whose
files are `UnifiedTable.tsx`/`SortableHeader.tsx`/`DataGrid.tsx` ranks **#8 at 648**,
`use_when`-grounded, and `TOP = 5` cuts it. The score is a **sum** over matching tokens, so
a subject with twenty-one techniques outscores one with six regardless of precision.

Measured against the 53 pairings readers established *despite* the matcher — the only
uncontaminated labels this fleet has:

| published cap | recall today | with size normalization |
| ---: | ---: | ---: |
| **5** (shipping) | **6%** | 8% |
| 10 | 19% | **32%** | 
| 12 | 28% | **40%** |
| 40 | 49% | 51% |

**Decide:** raise `TOP`, add the normalization, both, or neither. Either rewrites ~4,700
pairs across 13 repositories. Note the ceiling: even uncapped the matcher finds only half
the pairings a reader established, so the other half is a coverage question for the corpus,
not a constant to tune.

A cheap partial that does not touch scoring: **raise `TOP` only**. It publishes more
candidates without changing any ranking, and `/conform` already ignores what it does not
judge.

---

## BLOCKER 3 — the signals lane cannot be refreshed

`.machine.local.json` declares `contributor: xkazm04`; the public `signals/` lane holds
`kazda-dev-box.json` for the same app on the same machine. `converge.mjs` **skips** the
signals phase rather than minting a second public identity for one installation, because
`docs/telemetry-identity.md` is explicit that a rename is an evidence-backed migration in
`identity-aliases.json`, never an inference from similar names.

Consequence: the signals lane is 22 days stale and will stay so. Every consult logged in
this session's waves — and there were many — is sitting in project ledgers unfolded.

**Decide:** align `.machine.local.json` to `kazda-dev-box`, or record the migration in
`identity-aliases.json`. Then `node scripts/converge.mjs --only signals`.

---

## BLOCKER 4 — two projects can never report

`kiro/clon-astra` and `kiro/clon-fable` carry `.ai/manifest.yaml` and live consult/lead
ledgers, and are absent from `projects.json`. `loadBridge` resolves an undeclared project to
nothing **without erroring**, so their knowledge cannot arrive and no instrument says so.

**Decide:** declare them in `projects.json` (with relative checkouts), or accept that they
are out of scope.

---

## BLOCKER 5 — the corpus is teaching from code that no longer exists

Found while conforming, not by a currency check:

- `applications/react--performance.md` cites **goat** as its worked example of a
  runtime-selected rung ladder. `hooks/useCollectionLazyLoad.ts` no longer exists;
  `CollectionPanel.tsx` is now `const displayItems = filteredItems;` with the strategy
  selection, the slice and the trigger all gone. goat went from a two-rung ladder to a
  zero-rung one. `verified_on: 2026-08-24` is not merely stale, the headline claim is false.
- `applications/react--client-server-split.md` records "**No error state**: the body machine
  has no failure branch" for **personas**; that shortfall is closed, and its claim about
  `:500-515` is wrong at HEAD.
- `status-vocabulary/applications/next--vocabulary-chain-integrity.md` cited
  `FIDELITY_TIERS`, which no longer exists in the tree it was drawn from. (Corrected in
  today's drain; the other two are not.)

**Decide:** a `/deepen` or `/intake` pass over the application layer. `check-currency.mjs`
cannot catch this class — it measures *age*, and these citations resolve to real files whose
claims have rotted.

---

## BLOCKER 6 — one repo per stack per technique

Zero of 1,788 applications name two projects, and the `<stack>--<technique>.md` filename
allows exactly one. So gravity's live-region announcer — described by the reader who found
it as the cleanest implementation of `live-region-architecture` anywhere, including a
bounded shed that skips assertives — has nowhere to live, because personas already owns
`react--live-region-architecture.md`. Same for ascent's menu.

**Decide:** whether `docs/rkb-profile.md` should admit a second witness, and in what shape.
This is now the binding constraint on the accessibility subject's evidence layer.

---

## BLOCKER 7 — the consult hook is installed in one project

`node scripts/install-consult-hook.mjs` reports the fleet. Only **pof** carries it, from a
smoke test. Of the remaining twelve: **seven write a tracked file** (`.githooks/pre-commit`,
`.husky/pre-commit`) and so need their owner's commit; **two** (politicas, athena-everywhere)
use hook managers the installer refuses to rewrite and need a one-line snippet added by hand;
the rest resolve to machine-local `.git/hooks` and cost nothing.

**Decide:** `node scripts/install-consult-hook.mjs --install`, then commit in the seven.

---

## What ran anyway, unattended

- **`/conform` on the `table` subject across nine projects** — 25 verdicts (2 conformant, 23
  deviation), ~30 pairings established where the matcher had scored the subject at zero.
  Run note: today's entries in each project's map, plus `librarian/runs/2026-09-20-1.md`
  for the drain that preceded it.
- **A general `/conform` wave** on the four never-judged projects (goat, tracklight, pumper,
  gravitone) plus kp's orphan adoption and gravity's stale re-judging.
- **`conform` 1.7.0** — three corrections, each found by a worker against real code: commit
  by pathspec rather than only staging by one; take `evaluatedAgainst` from the registry
  index rather than the pair's copy; read the golden path's "when NOT to use this" before
  adding a zero-scored pairing.
- **Two new instruments**: `check-context-coverage.mjs` (the table in §1) and the reach
  measurement in `docs/matcher-reach.md`.

## What is owed but not blocked

101 open leads in `librarian/inbox.md` across ~60 keys. The banking note says to batch the
next drain **by bundle**, not by subject: a worker stops paying for itself at one or two
leads, which is what most of the tail now holds.
