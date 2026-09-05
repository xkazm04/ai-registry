---
layer: technique
type: technique
subject: markdown-vault
technique: knowledge-integrity-lint
status: forged
laws: [failure-not-empty-success, gate-sees-target, deletion-is-not-repair, absent-guard-is-loud]
shared_with: []
use_when: [deciding whether an unlinked note is exempt, a clean lint report over a partial scan, choosing what a repair pass may delete]
---

# Knowledge integrity lint

Code has compilers and tests; a knowledge store has neither, and its defects
make no noise. A broken reference costs nothing until someone follows it. A
claim that stopped being true costs nothing until someone acts on it. A note
nothing links to simply falls out of the navigable world. The store does not
crash — it **rots**, and the only observable symptom is that humans quietly
stop trusting it. This technique gives the rot detectors, the way lint gave
code its silent defect classes detectors: run them routinely, report
findings as defects with locations, and never let the detector mutate what
it measures.

## The three defect classes

- **Broken links — reference integrity.** A link whose target resolves to no
  note, found by resolving every extracted edge against the note index and
  reported with source note and line, like a compiler error. The resolution
  rules are the shared ones the whole application uses — a linter with its
  own private resolver reports its own private defects.
- **Orphans — link reachability, and only that.** Notes with no incoming
  links. Two honesty requirements, not one. First, orphanhood has
  **legitimate exemptions**: entry points (top-level notes, indexes,
  deliberately unlinked overviews) are not defects, and the exemption policy is
  declared in one predicate visible next to the check — not smuggled in as
  scattered special cases — because the exemptions are where two features'
  "orphan counts" diverge and where a reader will ask why a note was or wasn't
  flagged. Second, and more often got wrong: an orphan is **not an unreachable
  note**. The link graph is one navigation surface among several — a store is
  also entered by full-text search, by tag or field queries, by the folder
  tree, and by the near-miss surface that shows where a note's name is
  *mentioned* without being linked. A note with zero incoming links may be
  reached daily. So the finding is "not reachable by following links", which is
  a real defect for a store whose navigation model is the graph and merely
  interesting for one whose model is search. State which the store is; a defect
  class the humans do not accept as a defect is how a lint report stops being
  read.
- **Staleness — temporal integrity.** A note untouched for longer than a
  threshold is flagged for review. Honesty requirement: modification time is
  a **proxy** for review-currency — an untouched note may be timelessly
  correct, a freshly-touched one may have had a typo fixed in a stale claim.
  The check carries its predicate ("untouched for N days", N configurable,
  zero disables) and presents findings as review candidates, never as
  verdicts. And the proxy has *mechanical* corrupters, not only editorial ones:
  copies, checkouts and re-syncs rewrite modification time wholesale, which
  silences the detector across the entire corpus at once — see
  [replicated-substrate](./replicated-substrate.md) for why an in-band review
  date the human writes is the durable form of this check, with modification
  time as the fallback for records that carry none.

## The detector must see the whole target

Two laws govern the scan itself. Per
[gate-sees-target](../../../../_laws.md#gate-sees-target) and
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success), a lint
pass that silently skips an unreadable directory and reports the remainder
clean has manufactured the most expensive lie the store can tell: a **false
clean** over a partial corpus. The lint walk therefore aborts loudly on the
first unreadable corner — unlike best-effort walks elsewhere in the vault,
whose consumers only want a measurement. Same walker, opposite error policy,
chosen by what the consumer's "done" means. A lint result must be one of
"scanned everything, found these" or "could not scan"; there is no third
state.

That guard covers one cause of a partial corpus and not the other. It fires on
what is present but unreadable; it is silent on what is simply **absent** —
records the store will hold but does not hold yet, or whose content lives
somewhere the walk did not fetch. Nothing errors, so nothing aborts, and the
pass reports a confident verdict plus a crop of broken links pointing at notes
that exist. The error policy is not the fix, because no walk can tell a
never-written note from an unarrived one; the fix is that a whole-corpus verdict
declares the state it was computed in.
[replicated-substrate](./replicated-substrate.md) holds when that state is
knowable and what to say when it is not.

## Two tiers: mechanical and judgment

The defect classes above are **syntactic** — deterministic, cheap, safe to
run on every invocation. Above them sits a **semantic** tier only judgment
can reach: two notes contradicting each other, a topic mentioned everywhere
that deserves its own page, an obvious cross-link both notes are missing,
a cluster the vault covers thinly. A language model reads a compact summary
of the corpus and proposes findings.

The tiers get opposite operating contracts, because their costs and failure
modes are opposite:

| | Syntactic | Semantic |
|---|---|---|
| Determinism | total | none — same vault, different findings per run |
| Cost | a walk | a metered model call |
| Cadence | always | opt-in, deliberate |
| Input | the whole vault | a **bounded** summary: capped note count, capped snippet per note, capped total prompt |
| Output authority | defect reports | **proposals only** — a human reviews before anything acts |

The bounding is not frugality alone: an unbounded corpus dump produces worse
judgment than a curated summary, and an unbounded bill produces a switched-
off tier. Propose-only is not timidity: a nondeterministic detector with
write access is a nondeterministic *mutator*.

**The judgment tier's real failure mode is not a bad finding — it is never
being reached.** "Opt-in, deliberate cadence" is the correct contract and also a
standing invitation to ship the tier without wiring an entry point to it, at
which point it is a body of code that costs review attention, drifts against the
syntactic tier it is supposed to complement, and is eventually deleted by
whoever audits for unreachable code — correctly, on the evidence in front of
them. Per [absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud), an
optional check nobody can invoke is an absent check. So the tier ships with the
affordance that invokes it, in the surface where a human already reads the
syntactic report, and its cost is shown there rather than discovered on a bill;
if that affordance is not worth building yet, the honest move is to not build
the tier yet either. This is the one part of the technique where the cheaper
half — write the detector, wire it later — produces strictly negative value.

## Repair is a separate pass, and deletion is not repair

Lint detects; it never fixes. Repair — pruning superseded notes, merging
duplicates into a canonical note, refreshing links and structure — is its
own pass with its own contract:

- **Bounded**: a per-pass budget of notes and a hard time cap, so a pass is
  reviewable and re-runnable rather than a vault-wide big bang.
- **Goal-declared**: which of prune / merge / refresh this pass may do is
  explicit input, not the repairer's mood.
- **Fact-preserving**: per
  [deletion-is-not-repair](../../../../_laws.md#deletion-is-not-repair), removing
  a note to clear a finding destroys the knowledge that made the note worth
  linting. A merge keeps every distinct fact from its sources; a prune is
  reserved for the superseded and the content-free; human-authored primary
  records are kept intact absent exact duplication.
- **Measured regardless of outcome**: corpus size before and after, counted
  by the pass itself — and counted even when the pass fails or is cancelled,
  because a half-run repair has already mutated the store. Self-reported
  action counts from the repairing agent are reconciled against the
  measured delta, not trusted alone.
