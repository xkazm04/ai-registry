---
layer: technique
type: technique
subject: engine-pitfall-corpus
technique: provenance-on-every-entry
status: forged
laws: [a-verdict-is-bound-to-its-content, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [a platform upgrade has landed and nobody knows which entries survived it, deciding how strongly to weigh a claim in a knowledge base, an entry is being contradicted by observed behaviour]
---

# Provenance on every entry

An entry without provenance is an anonymous assertion. It cannot be weighed
against a contradicting observation, it cannot be audited after an upgrade, and it
cannot be retired — so it stays, quietly wrong, indefinitely. Provenance is the
field that makes the corpus a body of evidence rather than a body of opinion.

## The fields

- **Strength** — how this is known. Three grades, and they must be visibly
  different:
  - *probed*: someone ran it and observed the result, here, in a stated mode.
    The strongest grade; only this one licenses a flat prohibition.
  - *documented*: read in the platform's own reference. Strong about intent, weak
    about behaviour in reduced modes, which is where most pitfalls live.
  - *reported*: a talk, a forum answer, a colleague, a model's own recollection.
    Useful as a lead. Never the basis for a prohibition on its own.
- **Origin** — the specific source: which incident, which investigation, which
  document, which talk. Specific enough that a reader can go back to it. "The
  packaging incident" is a source; "internal knowledge" is not.
- **Version** — the exact platform release the observation was made against.
- **Mode** — the execution mode it holds for, when the claim is mode-specific,
  which most are.
- **Date** — when the observation was made. Version alone is insufficient: a
  release is patched, and two observations of the same release months apart can
  legitimately differ.

Mixed-strength entries are common and honest — a lead from a talk, confirmed by a
local probe. Record both, in that order, because the reader needs to know that the
*confirmation* is local even though the *idea* was not.

## Why the grades must stay distinct

Collapsing grades is the quiet way a corpus loses its authority. A reported claim
sitting in the same visual form as a probed one inherits the probed one's
credibility until it is disproved — and when it is disproved, it spends the probed
one's credibility on the way out. Readers do not re-grade individual entries after
a bad experience; they discount the whole document. Keeping the grades visible is
what lets a single wrong lead cost only itself.

## Decay, and the audit that catches it

Platform behaviour changes across versions. An entry may become wrong, partially
wrong, or newly irrelevant, and it will not announce any of these. The only
defence is an audit, and an audit is only possible if every entry carries a
version and a date.

Run the audit **on the upgrade, not on a calendar.** The procedure:

1. Select every entry whose version predates the new release.
2. Sort by strength. Probed entries are re-probed — the detail already contains the
   procedure, which is the whole reason the detail recounts the probe. Documented
   entries are re-read. Reported entries are the cheapest to retire and should be
   the first candidates.
3. Assign each a verdict: **still holds** (stamp the new version and date),
   **changed** (rewrite the detail; keep the identifier so existing citations
   survive), **retired** (mark it, keep it visible with the version range it was
   true for — a reader who meets a code comment referencing the old behaviour needs
   to find the retirement), or **unverified** (say so, explicitly).
4. **Unverified is a state, not a pass.** An entry that nobody had time to re-probe
   is neither confirmed nor retired, and it must render as unverified rather than
   silently carrying its old stamp forward. Silence must not propagate as still-true.

An entry's claim is bound to the version it was probed against. After that version
moves, the entry is evidence about the past until someone re-establishes it. Report
that gap rather than hiding it: a visible gap is survivable, and "unverified since
the upgrade" reading as "verified" is not.

## Decision rules

- **No entry enters the corpus without at least a strength and an origin.** Version
  and date are required for the probed grade and strongly expected for the others.
- **When an entry contradicts an observation, the higher grade wins, and the loser
  is rewritten rather than deleted** — a version-bounded disagreement is one of the
  most useful things a corpus can hold, because it tells the next reader that
  behaviour forked and where.
- **A prohibition requires the probed grade.** Absolute language on reported
  evidence is how a corpus acquires a rule that is merely someone's bad afternoon.
- **Stamp on write, not on review.** Provenance added later is reconstructed, and
  reconstructed dates are guesses that look like facts.
- **Percentage of the corpus verified against the current release is a real health
  metric** and the one to watch after an upgrade. Report the unverified count
  separately from the verified one; do not merge them into a single "entries"
  figure, which is exactly the collapse this technique exists to prevent.

## When not to use it

There is no exemption for a "obvious" entry — obvious claims are the ones most
likely to be version-specific folklore. The one real limit is granularity: do not
attach provenance to sub-clauses within a detail. If two claims inside one entry
have genuinely different strengths or versions, that is a signal the entry is two
entries.
