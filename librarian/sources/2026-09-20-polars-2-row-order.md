---
source: youtube:uHELj20WrOc
kind: youtube
url: https://www.youtube.com/watch?v=uHELj20WrOc
title: Polars 2.0 Says 5x Faster... So What's Changed?
author: Better Stack
words: 1561
extracted: 12
accepted: 1
declined: 0
leads: 2
already_covered: 4
untriaged: 0
dispatched: 0
applied: 1
shipped: 1
run_id: intake-uhelj-0920
siblings: 0
fetches: 1
rescan_when: not a repository source
---

# The release that removed nothing and changed what your code computes

**Class:** second-hand practitioner review. A creator demoing someone else's
release candidate, with a thin first-party layer (they installed it, ran a
join, and report "faster on my machine, just not five times"). Expected yield
per the class: currency, leads and catches, with **no upper-layer landing
without a fetched primary** — because a demo is organised around a happy path
and states no operating constraints. That is exactly what happened: the one
landing exists because of the fetch, and would not have been writable from the
video.

**Board:** 0 siblings at claim. But an unclaimed sibling was live in the
checkout all along — a marketing `/intake` run (`2026-09-20-claude-backlinks-free`)
with two untracked bundle files and edits to **both shared ledgers**. It was
invisible to `run-board list` and visible only to `git status`, which is the
case the method already names (an operator editing by hand is not on the
board). It changed how this run committed; see "Commit" below.

## The proudest segment, and the boundary it was missing

The class rule says the segment a demo is proudest of is where its boundary is
missing. Here it is the migration story: every removed method raises an error
naming its replacement, so "run the code, break something, fix exactly that
break, keep going" is the whole upgrade. The video is genuinely pleased with
this, and calls it a smart choice.

Four minutes later the same video says two complaints keep coming up, the
first being row order: *"nothing crashes. Your numbers can still be completely
correct. They're just attached to rows in a different order."*

Both halves are true and the video never joins them. **The error-driven
migration is complete for exactly the changes that raise, and the one change
that alters results raises nothing.** That join is the run's finding, and the
video contains both halves of it without noticing.

## What the fetch bought (1 of 3)

The primary upgrade guide, fetched in-run. It corroborated the video and added
the three things the video could not give:

- The scope in the vendor's own words: the new default engine "does not
  guarantee row order for operations that don't require it (`unpivot`,
  `group_by`, joins, ...)" — an open-ended list, not the video's three.
- The vendor's own admission, which is the sentence the whole landing rests on:
  **"This change may silently impact the results of your pipelines."**
- The asymmetry, which is only visible from the release notes: the release
  shipped **two new exception types** (`AttributeRemovedError`,
  `ArgumentRemovedError`) so every removal could raise a message naming its
  replacement — and for the change it admits is silent, a paragraph. It also
  shipped four restore levers at three scopes (per-call `maintain_order=`,
  per-query `engine=`, process-wide config, environment variable) and no way
  to find the affected call sites.

## Triage

Expected yield said one landing at most. Ten rows reached the table; five of
them folded into row 1 rather than standing alone, which is the honest shape —
they are the same finding seen from different sides.

| # | Shape | Title | Prior art | Read | G/R/C | Outcome |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | technique | A breaking change that raises and one that does not are different releases | `release-pipeline` | real gap | 3/1/2 | **accepted** |
| 2 | amendment | The ordering was emergent, never promised | `release-level-by-reader-reach` | partial | — | folded into 1 |
| 3 | amendment | Restore switch at process scope | none | partial | — | folded into 1 |
| 4 | — | Removals raise, naming their replacement | `deprecation-by-version-arithmetic` | likely catch | — | **catch** |
| 5 | — | Horizontal concat refuses mismatched heights | refuse-to-guess | likely catch | — | **catch** |
| 6 | — | Mixed-signedness widens instead of falling back to a lossy type | — | partial | — | folded into 1 |
| 7 | lead | A capability word shipped ahead of the capability | — | real gap | — | **lead** |
| 8 | — | The headline multiplier is an expectation with no benchmark table | `tested-superiority-claims` | likely catch | — | **catch** |
| 9 | lead | One project, two language bindings, different major versions | — | thin | — | **lead** |
| 10 | — | A string conversion now returns null where it used to raise | — | partial | — | folded into 1 |

Rows 4, 5 and 8 ran under the corroboration table rather than the score, per
the v2.8 routing rule: a catch needs no admission.

**Row 1's score.** GAIN 2 (a new technique in a subject not on the attention
list) +1 (it refutes an assertion the corpus makes — see below) = 3. RISK 0
(the director opened the golden path, three neighbouring techniques and the
primary) +1 (the home is mildly contested between the release subject and the
data-access one) = 1. COST 2. `3 − 1 = 2` clears the threshold, and `GAIN ≥
COST`. V1 checked before drafting: the category holds 6 of 10 children, and a
technique adds none.

## What it refutes

The golden path opens by enumerating how a release's claim fails: *"the version
can lie, the description can be noise, the artifacts can disagree with each
other, and the distribution channel can silently deliver nothing."* Four
failure modes, all of them about the release's **metadata and delivery**. The
enumeration hunt asks what an enumeration does not contain, and the answer here
is the case where all four hold — an honest version, a complete description,
consistent artifacts, a sound channel — and the caller's unedited code still
computes something different. That is now a fifth clause in the golden path.

The two techniques that look closest both key on **symbol identity** and
neither can express this: `deprecation-by-version-arithmetic` hangs a
`since`/`removed` pair on a symbol, and there is no symbol here; the release
removed nothing. `release-level-by-reader-reach` classifies what a reader does
with *a member it has never heard of*, and here the reader has heard of
everything — nothing was added.

## The apply step: a seam chosen to falsify, and it half-refuted me

Landed as `announcing-versus-silent-breakage` in `release-pipeline`, with a
`rust` application carrying the measurement.

The seam hunt went looking for a project depending on an order nothing
promised. **The first candidate refuted the hunt**: a spend rollup whose two
queries carry no ordering clause turned out to sort explicitly afterwards on
the full grouping key across both ledgers — a *total* comparator, correct for
the technique's own reason, with a comment explaining itself. There was no bug.

So the question became the falsifiable one: **if that comparator were weakened,
would anything notice?** A CAUGHT outcome would have taught that a good suite
is already the aid and the technique's third rule is redundant — which is what
made the arm worth running.

Six shipped tests, four comparator arms, a perturbation flag modelling a
different engine's row order, and a known-positive control:

- **Target** — tests failing when the sort goes non-total while row count,
  values and multiset all hold. Predicted ~0. **Measured 0 of 6, on two
  independent weakenings**, each with a provably different emitted sequence.
- **Floor** — arm A green and the perturbation provably firing. Both held: the
  full comparator is byte-identical under perturbation and the weakened one is
  not, so a green arm cannot be a harness that never ran.
- **Control** — dropping the day term failed 1 test, proving the harness can
  see an ordering change at all. Eight green cells would otherwise have been
  unreadable.

Five of the six tests assert by keyed lookup; the sixth reads one row. The
module's single ordering assertion covers one comparator term of three, and
covers it in one arrival direction only — under the control with rows arriving
reversed it passes by luck.

**Shipped** on the project's own branch: the comparator extracted as a named
function carrying its totality contract, and one test that feeds it two
permutations and requires the same sequence back. Verified in the harness to
pass on the shipped comparator and fail on all three weakenings — the property
the six existing tests do not have. The in-tree gate could not run: that
crate's build script is red at HEAD for an unrelated pre-existing reason, and
the row records `ab-paired` on a standalone copy rather than a green suite,
because that is what was actually observed. The repository's staged hooks
(formatting, secret scan) ran green.

## Catches

- **Errors as the migration guide.** `deprecation-by-version-arithmetic`
  already lists "a hard failure at the new version that names what was
  removed" as the honest option where a deprecation window is void. The
  release's two new exception types are that rule, implemented well.
- **Refusing mismatched inputs instead of guessing.** The corpus holds this in
  several forms; a horizontal concat that used to pad with nulls and now
  requires equal heights is an instance, not a rule.
- **A headline multiplier with no benchmark table.** `tested-superiority-claims`
  and the law that a claim carries its sample and its basis already cover it.
  The video's own n=1 ("faster, but I've never gotten anything like five
  times") is the correct response and needs no landing.
- **Callers of the lazy scan entry points were already on the new engine**
  before the release. Real, but it is a fact about one product's adoption
  curve, not a portable rule.

## Leads

- **A capability word that shipped ahead of the capability.** The engine is
  called streaming, and the part that would make it stream — spilling to disk,
  true out-of-core — has not landed; today it means chunked and pipelined.
  Users complained about the word, not the engine. There is something here
  about naming a stage for its destination rather than its state, and one
  source is not enough for it. *Return when a second independent source shows a
  capability word shipping ahead of its capability and the confusion costing
  something measurable.*
- **One project, two language bindings, two major versions.** The Python
  binding goes to 2.0 while the core crate stays on 0.55, so "version 2.0" is
  true of one surface and false of another. *Return when a connected project
  consumes one library through two bindings, where the skew could bite.*

## Directions

`directions=n/a` — a video carries no design record, so Phase 7.6 does not run.

## Commit

The sibling **committed mid-run** (`5c5b0acf`, `6c57d203`), between this run's
first regeneration and its commit, which changed what was safe to commit twice
in opposite directions. Worth recording because the first reading was wrong in
a way that only re-checking caught.

At the first regeneration, `knowledge/marketing/index.json` and `catalog.json`
encoded the sibling's then-untracked marketing technique and had to be held
back; `knowledge/software-engineering/index.json` looked clean. After their
commit the marketing half resolved itself — but the software-engineering index
did **not**, and for a different reason that a slug-level check could not see.
Its diff carries three subject digest bumps: `mcp-tools` (in `HEAD` at
`aa095e97`, whose own run left the index stale for exactly this rule),
`release-pipeline` (this run's), and **`scoring-rubrics`** — whose digest moved
because a *still-uncommitted* edit to one of its techniques changed the file's
content. A digest is not a slug; grepping the diff for foreign technique names
returned nothing and the file was still describing work that is not in `HEAD`.

So both generated artifacts are left uncommitted, which is the documented
self-correcting state. **The lesson is the check, not the outcome: verify a
regenerated index by diffing subject digests against `HEAD`, not by grepping it
for slugs you do not recognise.** A modified existing document moves a hash and
adds no name.

The two shared ledgers each ended up with exactly one added line — this run's —
because the sibling's rows landed in their commit rather than beside mine, so
no partial staging was needed. The commit still names its paths explicitly and
stages the two new bundle files and the note by name; nothing was staged with
`-A`, and the sibling's `normalization.md`, `build-registry-map.mjs` and probe
file are untouched.
