---
layer: application
type: application
subject: shared-research-record
technique: explicit-explore-slots
stack: process
status: draft
verified_on: 2026-09-24
applied: experiment
ab_verdict: not-better
---

# Process: a registry's research fleet, a single worklist and claims keyed on where

Witness: this registry itself (ai-registry, main at `f91ed00f`, read 2026-09-24). A
dozen self-directed research sessions (intake, harvest, deepen, forge and reconcile runs)
share one git history. No planner assigns them sources or subjects. Each session reads
the same scan to choose where to work, and a claim board to avoid colliding. It is a
second, independently built instance of the shared-research-record pattern, and it
reached several of the same rules without the paper. It also lacks the one this
technique is about.

## Claims keyed on where (the in-flight marker)

The claim board is the in-flight marker. It is advisory by design, the same stance as a
zero-weight in-flight type: it makes a collision visible and prevents nothing. At claim
time it checks the normalised source first, then subject, path and project addresses.
It resolves ambiguity towards contention on purpose.

- scripts/run-board.mjs:3 "the claim board a dozen parallel research sessions read to stay out of"
- scripts/run-board.mjs:31 "Records are advisory."
- scripts/run-board.mjs:367 "if (normSource(s.source) === normSource(source)) {"
- scripts/run-board.mjs:375 "OVERLAP"
- scripts/run-board.mjs:199 "CONTENDED costs one wait and is visible; a false clear costs a lost write"

Both keys are *where*-keys, and the board's own header records the collision they miss.
Two sessions mining two different sources reached one idea. The source key could not
see it, because the sources differed. The subject key could see it only once both had
mapped their findings to a subject and claimed it, and by then one of them had already
concluded the subject was missing.

- scripts/run-board.mjs:12 "landed a subject that Phase 4's map had already declared absent"

**Upward lesson, taken into the technique.** The registry has something the measured
research community lacked: a pre-declared identity space, the taxonomy of subject slugs.
The paper's record could only detect a duplicate idea after publication, by embedding
similarity. Here a session can claim the idea's slot, the subject address, before it
writes. The residual gap is timing. The subject claim is made after a session has spent
its mining, so the idea-level collision is caught late and not prevented.

## One sorted worklist (the frontier view)

Every librarian session reads one list sorted by attention points, and acts on its
head:

- scripts/librarian-scan.mjs:474 "const worklist = [...subjects].sort((a, b) => b.points - a.points"
- scripts/librarian-scan.mjs:33 "the worklist head"

Two terms in it have the shape of exploration.

**A never-swept bonus.** A subject no session has swept gets a flat bonus. This is the
explore-novel analogue. But it is binary (never versus ever), not a confidence term. A
subject swept once and a subject swept ten times both get zero, so after the first
sweep the bonus says nothing about how thinly a region has been worked.

- scripts/librarian-scan.mjs:236-237 "key: 'neverSwept',"
- scripts/librarian-scan.mjs:408 "add(W.neverSwept, 'never swept by the librarian')"

**A dry-streak brake.** The scan computes a streak from recorded run results and carries
it *beside* the points, not inside them, and the reading session applies it. This is an
exploitation brake: stop re-mining ground that keeps coming back empty. It is the
per-subject cousin of raising exploration when outcomes bunch, applied by the reader and
not by the view.

- scripts/librarian-scan.mjs:164 "the streak is the number of"
- scripts/librarian-scan.mjs:442 "dryStreak: dryOf[key] ?? null,"
- .claude/skills/librarian/SKILL.md:87 "Suppress the saturated."

**Deviation, measured, and the trigger does not fire.** There is no slot separation.
Every session reading the scan sees the same head, in the same order, at the same time.
The prediction was that a fleet started together would contend for the top few subjects.
It was tested against the fleet's own history and it did not hold (next section). What
would satisfy the technique in this registry's own vocabulary, if the trigger ever fires,
is to serve the worklist head as three short lists. Exploit would hold subjects carrying consumer demand or an expired clock.
Explore-known would hold swept subjects with few applications or few techniques in thin
categories. Explore-novel would hold never-swept subjects and subjects in categories no
session has touched recently. Replace the binary never-swept bonus with a term that
decays with the number of sweeps.

## Measured: the fleet does not herd (2026-09-24)

The seam was chosen to falsify: if this fleet herds, the technique owes the scan three
lists. Instrument: every commit touching `knowledge/` from 2026-08-25 to 2026-09-24, each
file mapped to its subject folder, and the commits split by how the work was chosen.
*Source-driven* means an operator handed a session a source (intake, 275 commits, 648
subject touches). *Frontier-driven* means the session picked from the worklist (librarian,
deepen, harvest, reconcile: 70 commits, 181 touches). Mapper controls: a technique path and
a golden path map to their subject, and an index file maps to nothing. The only unmapped
files were indexes and laws.

| | top subject share | top-5 share | effective subjects per touch | cross-run same-subject pairs within 1h / 6h |
| --- | --- | --- | --- | --- |
| frontier-driven | 3.9% | 0.138 | 0.51 | 6% / 25% (81 pairs) |
| source-driven, subsampled to 70 commits (2,000 draws) | - | p5 0.152, p50 0.185 | p50 0.44 | - |
| source-driven, all | 4.0% | 0.173 | 0.18 | 3% / 10% (2,381 pairs) |

Target: concentration of frontier-driven work. Floor: the same mapper over source-driven
work, size-matched. The work picked off one sorted list is **less** concentrated than work
that a human routed, and nowhere near the one-third single-cluster share that triggered
the intervention in the measured research community. Verdict: `not-better`. The slots
would spend budget on a problem this fleet does not have.

**Why, and the boundary it draws.** This worklist ranks *defects*, and working a subject
removes the defect, so the subject's points fall and it leaves the head. The dry-streak
brake and the one-writer-per-subject claim push the same way. A leaderboard ranks
*achievements*, and improving the leader keeps it at the head and makes it more
attractive to build on. A frontier that empties itself when it is worked cannot herd for
long. A frontier that rewards being worked does herd. The technique carries that
distinction as its first boundary.

## Independence of evidence (convergent with independent-reuse-evidence)

The intake method reached the self-citation rule on its own, at the level of sources. It
tiers sources and refuses to count them, because a relay is downstream of what it relays.
That is counting distinct upstream roots, not carriers. Convergence as a corroboration
tier requires independent sources from different runs. The batch lane dedupes by author,
not by source. That is the capture boundary drawn at the participant and not the
carrier: many outlets for one author count as one.

- .claude/skills/intake/SKILL.md:412 "Tier sources; never count them."
- .claude/skills/intake/SKILL.md:413 "a relay is downstream of the primary"
- .claude/skills/intake/SKILL.md:376 "Two independent sources, from different runs, reaching the same rule."
- .claude/skills/intake/SKILL.md:274 "deduped by *author* not by source"

## Typed verdicts (convergent with typed-contribution-vocabulary)

The applied ledger is the verification channel. Its verdicts are a closed set, and the
negative one changes the standard: a rejection adds a condition to the technique. It
also carries the third verdict the technique adds and the measured community's
vocabulary lacked: `unmeasurable`, which has to name its instrument.

- librarian/applied.md:16 "(a rejection - the technique gains a condition)"
- librarian/applied.md:17 "(must name the instrument)"
