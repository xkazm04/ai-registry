---
source: web:github.blog
kind: first-party practitioner account (vendor engineering blog; four controlled A/B experiments over the authors' own harness, plus one shipped-and-reverted regression)
url: https://github.blog/ai-and-ml/github-copilot/how-we-make-ai-coding-more-cost-efficient-without-sacrificing-task-quality
title: How we make AI coding more cost efficient without sacrificing task quality
author: two staff engineers on the harness team
date: 2026-09-02
words: 2225
extracted: 12
accepted: 5
declined: 0
leads: 2
already_covered: 1
untriaged: 4
dispatched: 1
applied: 2
shipped: 0
run_id: copilot-cost
siblings: 1
---

# How we make AI coding more cost efficient without sacrificing task quality

**Class and expected yield, said before the triage table.** A first-party
practitioner account: the authors built the thing they describe, and the class is
reliable for what they did and measured at n=1. Expected yield stated up front as
two to four landings in existing subjects, mostly on measurement discipline,
several catches, and zero fetches — the class corroborates corpus-internally.
What actually happened was larger than that, and the reason is worth recording:
this source's *negative* results are unusually dense. A blog post about a cost
win that leads with a change the team measured and did **not** ship, and then
describes a prompt rewrite that regressed in production and had to be stopped, is
carrying two boundaries per thousand words. The class's rule — the framing prose
is the strip test's problem, the measurements and the failures are the yield —
held exactly.

**Fetch budget: 0 of 3 spent.** Every accepted finding corroborated either
corpus-internally against a named neighbour or by training-data convergence
(proxy-metric scope, vestigial-affordance decay, hedge deletion in automated
rewriting). No claim needed a primary this run.

**Board:** 1 sibling live at claim (`zvecgrep`), rising to a second run's worth of
uncommitted files by Phase 7. Claimed subjects at Phase 4 and re-checked before
every write; `content` lock taken for the one golden-path line, `index` lock for
the regeneration, `ledger` for the appends.

## Declared focus (round 9), answered

1. **Close `techniques_absent` in writing or build it.** Not applicable to this
   source and not attempted; seventh deferral. Said here rather than silently
   skipped.
2. **On a `not-better` row, treat the tree as a source.** Executed, and it
   produced the run's best result — see the `prompt-assembly` apply row. The row
   did not come back `not-better`; it came back with the *premise* refuted (the
   tree already had the behavioural bench the technique assumed was missing), and
   the rule generalizes: **run the tree-as-source step whenever the tree refutes
   the reading that picked it, not only when the verdict is negative.** The
   project's own baseline had reached this technique's central decision rule seven
   weeks earlier, from a measurement, and that is stronger corroboration than the
   source the technique was written from.
3. **Report the fleet's reach, not just the apply count.** Reported below.

## Fleet reach

Five findings landed. Two were applied. The other three —
`end-to-end-unit-of-optimization`, `compressibility-follows-the-producer`,
`formatting-before-information` — are **unapplied for want of a seam**, and the
reason is one shared precondition rather than three: all three govern a harness
that *shapes tool results before a model reads them*, and no authorized fleet
project owns one. The fleet's agent surfaces consume results; none of them
compresses, reorganizes or reformats another producer's output on the way into a
context. This is the corpus outrunning the fleet, and it is a state, not a miss.
Return condition: when a fleet project grows a tool-result shaping layer, or when
the registry's own instruments start compressing their output for an agent reader.

## Candidates and outcomes

### Accepted

**1. `end-to-end-unit-of-optimization`** (new subject `tool-result-economy`).
Anchor: *"We saved tokens locally and spent more globally."* The mechanism is
**displacement**: an efficiency metric whose boundary is narrower than the unit
the payer is charged for can always be improved by moving work across that
boundary, and the displaced cost is charged at a rate the local metric cannot see
because every recovery turn re-transmits the prefix. Nobody cheated — the number
was honest and the boundary was wrong. Prior art was `metric-role-contract`
(roles) and the forge worker confirmed against the neighbours that nothing in
`eval-harness` owns **scope**; the two fail independently and both are required.
Absorbs the workload-locality corollary: a tighter instruction set that helped one
product surface increased cost on another running the same harness and was not
shipped.

**2. `compressibility-follows-the-producer`** (same subject). Compressibility is a
property of what produced the bytes, not of the bytes or their size. Three rungs:
exact-preserve arbitrary-density output (file contents, diffs, operator scripts),
lossless reorganization for enumerable result sets, lossy only for output
repetitive by construction. The keeper is that the policy was **narrowed by a
measurement** — diff output was compressed in an early version, agents were seen
reopening the originals, the filter was removed — and the forge worker sharpened
the framing: a size threshold is a proxy for compressibility that diverges from
the target at exactly its own worst case, because the largest results are the
class that must never be touched.

**3. `escape-hatch-usage-as-the-safety-metric`** (same subject; the run's keeper).
Anchor: *"That recovery path is both a safety mechanism and an evaluation
signal."* The rate at which the model takes the way back **is** the regression
signal for a lossy transform, it moves within a turn on tens of cases where task
success needs a large sample, and five shapes count — opened the original, re-ran
the command, repeated an exploration, narrowed a search, spent an extra turn. The
last three do not look like recovery; they look like the agent working.

Two boundaries the source does not state and the technique does: a low rate is
evidence **only if the path is advertised inside the result's own bytes**
(otherwise zero-because-unavailable and zero-because-unneeded are the same
number), and the rate is **conditional on the triggered population** — reported
over all tasks it is diluted by the trigger rate, so tightening the trigger
*improves* the diluted number while the transform's quality is unchanged.

**4. `formatting-before-information`** (same subject). Exhaust the transforms that
remove no information before admitting any that does: an information-preserving
removal cannot cause a recovery, so its saving is unconditional. Found via the
**vestigial affordance** — a per-item affordance added for one consumer, kept
emitting after that consumer changed, cost per-emission against value
per-consumer, nothing re-checking the pairing. The discriminator is what makes it
a technique: line numbers are not waste in general, they remain right in diffs and
snippets; they were waste attached to every line of every full-file read while the
editor that consumed them had been replaced by one matching on context. ~5%
offline, ~3% online per user per day, no quality or edit-failure regression.

**5. `compression-hardens-deferred-decisions`** (`prompt-assembly`; written by the
director, not the worker). Found by the asymmetry hunt: `context-budgeting` models
the economics of shrinking a standing layer with break-even arithmetic, cache
multipliers and a measured 2,000-inclusion anchor, and models the risk with
nothing. The mechanism: compression preferentially deletes **hedges**, because a
hedge adds no assertion and has no local justification — and a hedge is where
authorship declined to decide and delegated the branch to call time. Deleting it
does not shorten the rule, it **makes the decision**, and it collapses toward the
restrictive branch because that is the branch statable as a rule. Source instance:
a meta-prompting loop halved a tool's prompt, cautious parallelism guidance came
back as a hard scheduling policy, independent sub-agents ran sequentially, and the
fix that worked was **shorter and less restrictive** — one sentence returning the
choice to the model. Second half: the most compressible lines are the least tested
lines by construction. Ratchet, ordered: on a regression, write the test **before**
changing the text again.

### Already covered (1)

- *"The first online experiment found a regression that the initial offline
  evaluations had missed."* — `eval-harness/certification-levels` says it better:
  level one reasons over a derived model, it is labelled as what it saw, and a
  gate that saw only the proxy has not seen the target. The source's framing adds
  nothing the ladder does not own. **But the ladder is one-directional** and never
  says what an empirical catch owes the cheap level; that half was not dropped —
  it became the ratchet section of finding 5.

### Leads (2)

- **A law candidate at two sightings: the measurement boundary.**
  `context-budgeting` argues "shrinking can cost more than keeping" from the
  assembly side in authoring-cost currency; `end-to-end-unit-of-optimization`
  argues it from the result side in turns. Same shape, different objects, both now
  in the corpus. **Return:** on a third independent sighting, propose it at law
  level rather than adding a fourth technique.
- **Cost per active hour as a denominator.** The source normalizes one result as
  "2.9% lower normalized cost per active hour", which is a different denominator
  from per-session and per-task and is chosen because it is robust to usage
  intensity. Nothing in `cost-metering` discusses denominator choice for an
  agentic workload. **Return:** when a second source uses a time-normalized
  denominator, or when a fleet project reports spend per active period.

### Untriaged (4) — extracted, reached the table, never picked. Nobody verified these.

- **Deliver the result with the wake; batch concurrent completions.** *"that
  notification did not include the completed result, so the agent had to spend
  another turn retrieving output Copilot had already received"* — four model calls
  for two completions became one. Nearest home
  `agent-runtime-assembly/bounded-projection-of-external-work`, which delivers a
  terminal snapshot by an idempotent internal run and never states either the
  two-call cost of a contentless wake or the batching rule. Looks like a missing
  stage; not verified.
- **Eliminate model turns the harness can complete deterministically.** The
  general form of the above, offered by the source as one of its five lessons.
- **The three-part compression policy's *recovery affordance* as a first-class
  tool.** *"the agent can still retrieve the complete original through a direct
  recovery path"* — the shape of that operation (does it re-run, or read a saved
  artifact?) decides whether it is elision or caching, and the source does not say.
- **The 20% figure from migrating one product surface to shared file tools.**
  Reported as separate from everything else in the post; a large number with an
  unstated protocol, and the post explicitly fences it off.

## The XL spec and its dispatch

Three picked candidates plus the general form of a fourth shared one
`HOME IF NEW`, and `prompt-assembly` was at 16 techniques owning a different
artifact. The operator chose the subject at the Phase 5 gate. Spec at
`librarian/specs/2026-09-04-tool-result-economy.md`, **status EXECUTED**; placement
verified against `taxonomy.json` (flat subcategory at 8 subjects, sibling at 10),
not against a count of folders.

One forge worker, dispatched once, zero fetches allocated and zero spent. **It
overrode the brief five times and was right each time**, which is now the fifth
consecutive dispatch where that happened:

1. Re-anchored the unadvertised-hatch claim across two laws rather than picking
   one — `absent-guard-is-loud` carries the mechanism, `failure-not-empty-success`
   carries the reading.
2. Reframed the producer rule as a proxy failure with `gate-sees-target`, a law
   the spec had not proposed: a size threshold diverges from compressibility at
   exactly its own worst case.
3. Gave the vestigial affordance `creation-names-reaper` as its spine — the code
   that starts emitting an affordance never named what would stop it — which
   turned a list of removals into a decision rule.
4. Sharpened the boundary against `line-earning`: an authored rule entered through
   a review that was *about the rule*; emitted formatting entered as an
   implementation detail of a feature whose review was about the feature, so it has
   never been on any agenda.
5. Added an unrequested boundary against `compression-hardens-deferred-decisions`,
   which the director landed in the same checkout mid-forge, distinguishing them in
   prose without linking an in-flight file. The link was added by the director
   after the file settled.

Director review was of the diff, not the report: gate green, purity grep over the
source's own vocabulary (vendor, product, tool and author names) returned empty,
`use_when` present on all four techniques, bidirectionality confirmed both ways,
`taxonomy.json` appended and nothing reordered, and one cited law opened and read
against the claim it carries.

## Applied (2)

- **`compression-hardens-deferred-decisions` → an agent platform,
  `simulation`, `better`.** The precondition the seam was picked for was refuted
  by the tree; see the declared-focus note above.
- **`escape-hatch-usage-as-the-safety-metric` → the same platform, `code`,
  `unmeasurable`.** A 4,000-char truncation over material that genuinely remains
  addressable at its source, emitting a bare ellipsis, so the recovery rate is
  zero by construction. Arm B keeps the head byte for byte and adds the dropped
  count and the source location; a paired test separates the arms on 2 of 2
  assertions. Compiles clean under the project's feature set; **the library test
  binary will not launch on this machine** (`STATUS_ENTRYPOINT_NOT_FOUND`,
  0xc0000139) before running any test, so no gate saw it. Left on a branch, not
  merged, not pushed, master untouched. The instrument is named in the row.

## Near miss worth recording

A parallel session landed `eval-harness/outcome-conditioned-cost` mid-run —
which trials may enter a cost mean. It does **not** collide with
`end-to-end-unit-of-optimization`, which governs the boundary the cost is measured
inside. Two cost-measurement techniques landed one shelf apart on the same day by
two runs that could not see each other; the board showed the sibling, the index did
not, and only reading their file settled it.

## Shared-checkout state at Phase 10

The regenerated `index.json` and `catalog.json` reference six sibling techniques
that are not in `HEAD` (`outcome-conditioned-cost`, `treatment-election-rate`,
`caller-differentiated-capability`, `fluent-syntax-bounded-grammar`,
`input-channel-parity`, `anchor-removal-ablation`). Both artifacts are therefore
**deliberately left uncommitted**; a stale index in a shared checkout is a known
self-correcting state, a committed hash over a neighbour's half-written subject is
not.

## Phases skipped, and why

- **Phase 2b/2c/2d** — not a repository and not a reference index. No clone, no
  design record, so no routing count and no forge handoff decision.
- **Phase 7.6** — no design record, so `directions=n/a`.
- **Phase 7.7** — this run produced no direction proposals; the gate was not shown.
