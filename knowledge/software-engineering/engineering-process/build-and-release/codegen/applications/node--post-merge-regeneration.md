---
layer: application
type: application
subject: codegen
technique: post-merge-regeneration
stack: node
status: forged
verified_on: 2026-09-03
verified_against: node@20
applied: simulation
ab_verdict: better
proof: structural-only
---

# A derived index with a dozen writers and no merge point to regenerate after

The stack witness is the CI pin — `node-version: '20'` on all five jobs of the
knowledge workflow. The repository carries no `package.json`, no lockfile and no
`.nvmrc`, so that pin is the only version claim the tree makes, and it attests
what the gates run on rather than what the generators require.

The artifacts are a per-bundle `index.json` (eight of them) and a single
`catalog.json` whose hash covers the index. Both are fully derived — two
dependency-free generators rebuild them from the document tree — and both are
tracked. Up to a dozen agent sessions write to one shared checkout at once, so
the artifact has as many writers as there are live sessions, and every one of
them changes it.

The technique's precondition holds exactly: the generated content is not stable
under unrelated edits. Any session that lands a subject changes the index for
every other session, and the catalog's hash changes with it, so two sessions
regenerating minutes apart produce different bytes from the same intent.

## The three cases, taken from the ledger rather than invented

All three are recorded outcomes of real runs on this repository, one line each
in `librarian/sources/index.md`:

1. A secrets-manager intake regenerated both artifacts and then **left them
   uncommitted**, because the regeneration had absorbed a sibling's in-flight
   files.
2. A prompt-tool intake left the index uncommitted for the same reason —
   "it absorbed a sibling's unlanded subject."
3. A gateway intake met a foreign unclaimed restructure of an unrelated bundle
   mid-run, excluded it by pathspec, and again left the index uncommitted.

Three independent runs, three different sources, one identical outcome. Under
policy A the derived artifact is regenerated inside the change that triggered
it, and the standing operating advice for the collision is manual: notice that
the artifact describes content not in `HEAD`, and decline to commit it. That
advice is correct and it is a workaround — it leaves the repository knowingly
carrying a stale index, and it depends on each session running a check nobody
can enforce.

## Where the technique does not transplant unchanged

Policy B as written regenerates once **after the merge** and bans the artifact
from the change. This repository has no merge point: since a single-owner
redesign it commits routine work straight to the trunk, and the gates are the
review. The technique's mechanism assumes a serialization point that exists
here only as "the moment no session is mid-write", which nothing observes.

The adaptation the tree already reaches for by accident is the interesting
part. Of the last sixty commits touching these artifacts, roughly eight are
**generated-only** commits — "generated: index, catalog and fleet map after the
hermes-agent intake", "chore(index): regenerate index and catalog", and three
merges whose subject line ends "generated files regenerated". Those eight are
policy B discovered case by case and never written down: the derived artifact
separated from the content change, regenerated once, committed alone. The other
fifty-two bundle the artifact into the content commit, which is policy A and is
where all three collisions above came from.

So the verdict is **better**, and the reason it is only `structural-only` rather
than a paired measurement is worth stating: the arms differ in a process, and
the second arm cannot be run without a fleet of sessions to run it over. What
the tree supplies instead is the structural fact — the pattern is already
present in about one commit in eight, produced ad hoc by whichever session
happened to notice the collision, with no rule naming it.

## What this realization cannot do

It cannot show the cost of the fifty-two. A stale committed index is
self-correcting — the next regeneration fixes it — so the failure this policy
prevents is bounded and quiet, which is exactly why it has survived sixty
commits without anyone naming it. The measurable that would settle it does not
exist yet: nothing records how often a committed index described a tree that no
session had. Building that counter is a smaller job than adopting the policy,
and it is the honest next step rather than the policy itself.

It also cannot borrow the technique's second half. The allowlist that makes an
automated regenerating commit safe — stage everything, then refuse if any
staged path falls outside a narrow set — has no home here, because the
regeneration is run by a session that is also committing content, not by a bot
with a narrow mandate. Adopting the allowlist would require separating the two,
which is the same serialization point the repository does not have.
