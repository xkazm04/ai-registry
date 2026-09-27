---
domain: agent-operations
subject: blind-judging-of-agent-runs
last_touched: 2026-09-27
touched_by: deepen
dry_streak: 0
---

# blind-judging-of-agent-runs

Subject note. Part of [[index]]; graded against [[standard]].

First touch by `/deepen`. A single-subject run dispatched by the Curator lane on the scan
finding "3 techniques (design floor is 4)". Registry HEAD at dispatch was d93fbd78; the
primary checkout's main was 156 behind origin, so the run worked from origin/main
(2fc868d2) in a detached worktree.

## 2026-09-27 - an agent judge's reach is its packet, facts never scores, family is a proxy

**Depth rung:** L2 primary for the corrections (every number that shaped a landing was read
verbatim from the abstract or the paper's HTML, not from a fetch summary). L3 empirical for
the new technique and the withhold condition, measured on the registry's own contest skill
with no model spend.

**Lanes:** three.
- A blind training-data lane.
- A web counter-evidence lane against five of the subject's claims.
- A primary-source lane on agent judges, shortcut use by agents that can reach material,
  panel independence, and list-wise position bias.

**Convergence:** the blind lane ranked "isolate each judge - no shared scratch directory,
no view of other judges' or the host's notes" second of ten before any search; the
primary-source lane and the contest skill's own 1.6.0 incident log reached the same rule.

**Landed (3063b210):**
- **New technique, sealed-judge-workspace.** When the judge is an agent with a shell, the
  blind is a staging decision, not an instruction: each seat gets a copy holding only its
  brief and the redacted entries; the key, the other seats, the host's material and the
  entry's own history stay out of reach; everything the judge legitimately needs stays in.
- **Flipped: golden path, the bias list.** Order joins and leads it - the best replicated,
  worse with more candidates per reading. Hedging replaces "confidence", on thinner
  evidence. Each judge reads a different order; for an agent judge, labels per seat.
- **Flipped: golden path, "at least one judge from a different family".** Family is a proxy
  for uncorrelated errors. The agent's family never holds the panel's majority, and error
  overlap is measured where labels exist.
- **Flipped: golden path and facts-beside-the-work.** Facts in the packet, never scores;
  the re-judge never sees the earlier score.
- **Conditioned: provenance-scrubbing.** Commit metadata is a leak channel; a vendor-named
  path is kept only if the repository carried it at the base commit; self-preference
  follows familiarity, light rewording lowers it and fuller neutralization brings it back.
- **Conditioned: withhold-rather-than-half-judge.** The verdict that arrived may be kept
  beside the run, labelled with its seat, never averaged in or promoted.
- **Verified and left untouched:** "a verdict from half the panel is a different
  measurement" (the counter lane found panels and single judges measure differently, which
  is the claim); "style is unscrubbable" (verified, reworded only in its mechanism).

**Applied (ai-registry, the contest skill, six rows):**
- **sealed-judge-workspace: `better`, experiment.** Real `collect` + `plan --kind judges`,
  probed from the seat with its brief as the known positive. The 1.6.0 staging moved the key
  and the host's screenshots out of reach. Peer verdicts are still one `..` away: seats
  share one staging folder named for each judge, run concurrently, every engine unsandboxed.
- **withhold condition: `better`, experiment.** The contest's `aggregate()` over four
  cases: a failed seat yields the same mean and spread 0 as a unanimous panel; a verdict
  scoring 1 of 7 dimensions is aggregated anyway and flips the ranking against the valid
  judge.
- **Order flip: `unmeasurable`.** One letter order serves every seat; the instrument is a
  rotation experiment, model spend.
- **Facts-never-scores flip: `unmeasurable`, simulation.** Contest is conformant, 0 of 3.
- **Family-proxy flip: `unmeasurable`.** Too few owner verdicts to measure error overlap.
- **provenance-scrubbing condition: `unapplied`.** No tracked fleet harness judges
  repository runs.

**Owed in the contest skill, not fixed** - another session held about 300 lines of
uncommitted work in its scripts during this run, including `scrubIdentity`:
- one opaque temp root per seat, with no judge or contest id in the name;
- per-seat label rotation;
- compare arrived verdicts with the intended panel before ranking; refuse an invalid verdict;
- a peer-citation grep on each harvested verdict.

That session's uncommitted scrub change independently reaches this subject's path-aware
exception ("an identifier the staged material itself contains is evidence, not a
signature"). It is observed here, not cited: it has not landed.

## Impact

None. No fleet map pairs a context with this subject (`build-registry-map --dry-run`,
0 of 11 readable maps, with a known positive in 10; gravitone's map was not at the expected
path and was not evaluated). No verdict went stale; the dry run's 208 stale verdicts are
other landings', and this run did not regenerate the maps.

## Banked leads

- **Agent judges versus packet judges.** One benchmark (55 tasks) found an agentic judge
  closer to human consensus than a packet judge, with no leakage discussion. A condition
  candidate for facts-beside-the-work ("what the judge may open"). Return when a second
  source measures it, or a fleet harness runs both.
- **Order rotation for list-wise agent panels.** Permutation self-consistency over shuffled
  lists is the published fix for text judges; untested for agents that open files in their
  own order. Return with the rotation experiment.
- **Judge debate.** Peer exchange helps in decentralized networks and hurts under one
  central voice; multi-agent debate can lose accuracy over rounds. Return when a fleet panel
  reconciles after scoring.

## Declined

- A rule preferring agent judges to packet judges: one benchmark, no leakage analysis.
- "Drop the panel, keep the best judge": the nine-judge result is on inference tasks, not
  agent runs; it landed only as the proxy condition.
- Figures seen only in search summaries (a cleaned-container score delta, two ordering
  papers, a self-preference significance re-analysis whose snippet inverted its finding).

Yield: high. dry_streak 0.

Source classes, this run. Kept:
- arXiv abstracts and HTML full text read verbatim through the export API;
- a benchmark maintainer's issue thread for a structural leak and its fix;
- an evaluation lab's own measurement post.

Needs a second source: 2026 preprints standing alone behind a landing claim.
