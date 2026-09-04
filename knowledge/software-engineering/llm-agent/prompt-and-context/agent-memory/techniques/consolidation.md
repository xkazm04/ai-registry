---
layer: technique
type: technique
subject: agent-memory
technique: consolidation
status: forged
laws: [derivation-names-recomputation, one-validation-door]
shared_with: []
use_when: [deciding whether conflict flips a belief or just dents it, a short correction ranks below the long belief it fixes, an import wants to bypass the judgment pass, deciding whether a new fact closes an old one or coexists with it]
---

# Consolidation

Consolidation is the judgment pass that turns records into knowledge: it reads
recent episodes and distills them into durable items — facts, preferences,
procedures — each with a confidence, a scope, and a provenance trail back to
the episodes that ground it. It is the only stage in the pipeline where
"happened" becomes "believed", which makes it the stage where all the trust
decisions concentrate. Everything upstream may be generous; this pass is
strict.

## Batched, because judgment needs a horizon

Consolidation runs as a **periodic batch over a window of episodes** — a
sleep cycle — rather than inline at the moment each episode is written. This
is not a throughput optimization; it is what makes the judgment good:

- **Patterns are cross-episode.** "The operator prefers terse reports" is
  visible across five episodes and invisible in any one of them. Inline
  consolidation can only ever extract what a single event proves, which is
  almost nothing worth believing durably.
- **Significance needs hindsight.** At capture time, importance is a guess;
  a day later, the episode that led nowhere is obvious. Batch judgment gets
  to be strict precisely because capture was generous.
- **Deduplication needs the batch.** Ten episodes expressing one fact should
  strengthen one belief, not mint ten. Seen one at a time, each looks new.
- **In-flight heat is a bias.** The moment something feels most important is
  the moment its durability is least assessable. The batch boundary is a
  cooling-off period built into the architecture.

The trigger is **accumulated input, not the clock**. What a pass costs — and
what makes it worth running — is the volume of unconsolidated material, so
the honest trigger is pressure: enough new episodes since the last completed
pass. The clock survives only as a floor (a burst must not cycle twice in an
hour) and as a staleness release (a quiet week still gets compressed
eventually); neither is the trigger. A pure timer runs expensive passes over
empty windows on quiet days and lets heavy days overflow the window on busy
ones.

Three mechanical disciplines keep the batch honest:

- **One boundary, one read.** The measurement that admits a pass and the
  window the pass consumes are the *same* read, not two queries that agree
  today. Two measurements of "what is new since the last pass" will drift,
  and the drift is invisible until material is skipped.
- **Drain forward.** When input caps truncate a heavy window, the pass
  consumes oldest-first and records the exact boundary of what it actually
  read; the residue becomes the *next* pass's oldest material. Taking the
  newest slice of an over-long window silently orphans the middle — material
  no pass will ever reach.
- **Resumable and idempotent over the window.** A crashed pass re-run must
  not double-strengthen beliefs or re-mint items it already produced.

## The outputs are typed

A consolidated item is not free text; it is one of a small closed set of
kinds, because the kinds have different lifecycles:

- **Facts** — claims about the world, the operator, or the agent's
  situation. Have truth values, go stale, get superseded.
- **Preferences** — standing dispositions of the human or the collaboration
  ("wants risks surfaced early"). Softer than facts; strengthen and fade
  with evidence rather than flipping true/false.
- **Procedures** — how-to knowledge distilled from episodes of doing
  ("renewing the credential requires the second approval step"). Validated
  by working, invalidated by failing, and dated by the systems they touch.
- **Failed approaches** — the negative result: what was tried, and the
  symptom that ruled it out. This kind is first-class, not a footnote on the
  procedure that eventually worked, and a store that omits it is the most
  common expensive omission in the subject. An agent without a dead-end
  ledger re-derives the same failure every few sessions, at full cost, with
  full confidence; the item that would have saved the day is precisely the
  one that records an absence of success. Capture it with the symptom
  attached, because "we tried X and it didn't work" without the symptom
  cannot be re-evaluated when the surrounding system changes.

The set is **small and closed at the top, open at the edges**: a fixed core
that every consumer understands, plus room for kinds a specific deployment
needs. The two rules that make an open vocabulary safe rather than sloppy:
readers **ignore kinds they do not recognize** rather than failing on them,
and every kind-keyed policy (retention, half-life, recall tier) has a
**declared default** for an unrecognized kind. Without the default, adding a
kind silently gives it either immortality or immediate erasure, depending on
which policy noticed first — and nobody finds out for a quarter.

Each item carries: the claim at its right altitude (scoped, dated where time
matters), a **confidence** the distiller assigned, and **provenance** — the
episode ids it derives from. The provenance row is not metadata garnish; it
is the [derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)
law applied to belief: a consolidated item is a stored derivation, and the
episodes-plus-pass that produced it are its named recomputation path. A
belief whose grounds cannot be enumerated cannot be audited, re-derived, or
safely forgotten — it can only be taken on faith or deleted.

## Finding the candidates is a deterministic prefilter

Before any judgment can be made about whether a new item duplicates,
corrects, or contradicts an existing one, the existing ones have to be
*found*. That step is deterministic, cheap, and does two jobs the expensive
judgment cannot do for itself.

**It bounds the prompt independently of the store.** A shortlist cap (a
handful of candidates, not the whole store) and a per-candidate excerpt cap
mean the cost of consolidating one item is constant whether the store holds
two hundred items or two hundred thousand. Without both caps, the pass gets
slower exactly as memory starts paying off, and the first response to that
is to run it less often. The excerpt cap matters as much as the shortlist
cap: one enormous item can otherwise consume the whole comparison window and
crowd out its own competitors.

**A cap that is not a shortlist becomes a blind spot.** The two caps above are not
interchangeable with a single global limit on how much of the store the judgment sees.
A system that skips the prefilter and instead hands the pass its *N most important, most
recently updated* items has bounded the prompt and bought a permanent exclusion with it:
everything below the cut is never a candidate again, so a duplicate or a contradiction
that settles in the low-importance tail is never retired, and nothing counts the miss.
The shortlist is what keeps the cap honest, because it is redrawn per new item and
relevance moves; a store-ordered truncation does not move, and its exclusions compound.
The cost half of the same mistake arrives first and is the one that gets noticed: a fixed
timeout on a call whose prompt grows with the active set will start failing partway up,
and on one store replayed over a simulated year of use it cost about a third of the
passes before the store had even reached its cut.

**And the measure it ranks by must fit the question being asked.** Duplicate
and correction detection is *directional*: a short, sharp correction ("we
moved off the shared credential") must score high against the long item it
corrects. A similarity measure that normalizes by the combined size of both
texts punishes that pairing for the length difference alone — and the pairing
it punishes is exactly the one the system most needs to catch, since
corrections are short and the beliefs they overturn are elaborated.
Normalize by the *smaller* side instead. The mirror case, grouping items that
belong to one family, wants the opposite property and belongs to
[rollup-compaction](./rollup-compaction.md); the rule to carry is that the
measure follows the question, and a system doing both jobs needs both
measures.

**And the order the questions are asked in is part of the rule.** A system
running both measures still has to decide which verdict it tests for first, and
the intuitive order — duplicate first, because it is the cheap and common case —
is the one that fails hardest. A genuine contradiction is usually a one-token
swap of the belief it contradicts: always for never, enabled for disabled, the
same sentence with its polarity turned over. Under any surface measure that is a
near-identical pair, so it clears the duplicate threshold comfortably, and the
sharpest contradictions in the store become the ones a duplicate-first pipeline
is guaranteed to mislabel — and then offers a merge, which is the overwrite this
technique forbids, wearing a tidy-up's face. So **test contradiction and
supersedence before duplicate**, and let the duplicate branch see only what the
polarity check has already cleared.

A noise floor completes the prefilter: below some overlap, a candidate is not
worth a reasoner's attention or a human's. And when the reasoner is
unreachable, the prefilter *is* the answer — degraded, clearly marked as
degraded, but not silent.

## Supersedence: contradiction is data

New evidence that conflicts with an existing belief is the most valuable
input consolidation receives, and the one it must never handle by overwrite.
The discipline:

- **Supersede, don't replace.** The new item is written, the old one is
  marked superseded *by* it, and the link is kept. Recall serves the
  successor; audit can still see the lineage. An overwritten belief leaves
  a system that was never wrong, which is a system that cannot be trusted
  about anything.
- **States close; events accumulate.** Supersession applies only to
  *state-valued* claims -- where the world holds one value at a time, so a
  new value closes the old one's validity ("works at Acme" supersedes
  "works at Beta"). *Event-valued* claims are additive records: "delivered
  two reports this week" must never close "delivered three last week", or
  every question that counts, sums, or compares across time becomes
  unanswerable against a store that looks perfectly healthy. So the
  distiller types the claim before it links it, and a candidate pair enters
  supersedence at all only when both sides describe the same state of the
  same subject. The distinction cannot be delegated to timestamps or
  validity windows: temporal machinery records *when* a claim held, and
  will close an additive event with a newer one if asked -- even the
  strongest published forms of windowed supersedence leave this judgment
  to the writer.
- **Contradiction lowers confidence before it flips conclusions.** One
  conflicting episode against a many-times-reinforced belief is a reason to
  doubt, not yet a reason to reverse. Weight of evidence decides; recency
  is a tiebreaker, not a trump.
- **Except when the source is the human.** An explicit operator correction
  supersedes immediately regardless of the standing belief's weight — it is
  the highest evidence grade the system knows, and the superseding item's
  provenance says so.
- **The distiller's own output is untrusted input.** When the judgment is
  performed by a fallible reasoner (and it always is), every reference it
  emits — the grounds it cites, the item it claims to supersede — is
  validated against the store before anything acts on it: the cited
  episodes must exist, and the supersede target must be a live item of the
  right kind and scope. A hallucinated reference *drops the candidate*; it
  must never demote an arbitrary belief the distiller happened to name.
  Without this check, the review gate guards the front door while the
  proposal's side effects walk through the back.
- **Reinforcement is the mirror case.** Evidence agreeing with an existing
  belief strengthens it (confidence, freshness) rather than minting a
  duplicate. Duplicated beliefs drift independently — the classic
  two-copies race, one adjudication away from contradicting themselves.

## One door, enumerable writers

The consolidated store has **one validation door** — the consolidation pass
itself — and every path that creates a belief goes through it, per
[one-validation-door](../../../../_laws.md#one-validation-door). The pressure to
add a second door is constant and always locally reasonable: a direct write
from working memory ("we just learned this, why wait for the cycle"), an
import from another system, a bulk seed at setup time. Each bypass creates
beliefs that skipped the judgment — no dedup against existing items, no
supersedence check, no distiller-assigned confidence — and the store now
holds two grades of belief that look identical at recall time, which is the
worst version of the problem because nothing marks the weaker grade.

The imports and seeds are legitimate needs; the answer is to route them
through the door — as synthetic episodes the pass consolidates, or through
the same validation the pass applies — never around it. Writers to the
belief store should be enumerable on one hand, and the enumeration is worth
keeping literally true.

## A validated citation is not a verified one

The distiller's references are validated against the store: the cited episodes
must exist. That is **referential integrity**, and it proves the pointer
resolves. It does not prove the cited record contains what the belief asserts,
and those come apart in the failure mode this door exists for — a real episode
cited for a number it never held resolves perfectly and is a fabrication.

The second check is a read-back, and it is cheap where the belief carries a
value: the asserted figure or phrase must occur in the cited record, found by
exact match before any looser search, with the outcome recorded on the belief.
One system gating writes this way rejected roughly three in ten model-proposed
rows.

Bind the **key** as well as the value. A figure can be quoted perfectly and
filed under the wrong metric name, and value-binding alone admits it; that
check is the one most pipelines skip and it is where most of those rejections
came from. Where a belief carries no quotable value — a judgment, a synthesis —
the read-back is unavailable, and that is a reason to record which grade of
provenance the belief has rather than to skip the distinction.

The golden path's rule has a sharper form: a belief without provenance is a
rumor with a database row, and **a belief whose provenance was never read back
is a rumor with a footnote.**

## Reachability outranks description

A consolidated item's description is what the pipeline naturally spends its
budget improving. The measurement says the budget is better spent elsewhere: on
one system, removing the cross-reference index that let an item be reached from
more than one place cost about a third of end-to-end quality, and removing the
rule that files an item into its runner-up cluster when the top two are close
cost nearly as much — while improving the per-item summaries moved the result
within noise.

The generalizable form is that **single-home assignment is the defect**. An
item filed in exactly one place is unreachable from every other place it is
relevant to, and no amount of describing it better fixes that, because the
description is only read once the reader is already in the right neighbourhood.
Where consolidation assigns an item to a cluster, a topic or a lane, ask what
the second-best assignment was and whether the margin was thin enough that both
should hold it.

One boundary, from the same measurement: a pass that checked *sibling summaries
for confusability* and repartitioned them bought nothing. The confusability
check pays on a **selection surface**, where a reader picks between candidates
by their descriptions, and not on a **partition**, where the descriptions only
route. Two different objects with the same tell.

## What consolidation refuses

The strictness has a shape. The pass declines to mint: claims at transcript
altitude ("the operator said X" — extract the fact or leave it as episode);
one-off circumstances with no forward relevance; anything whose sensitivity
screening should have excluded it upstream (a second screen here is cheap
insurance); and items about the agent's own identity or standing rules,
which are *proposed*, never committed — that lane belongs to
[memory-governance](./memory-governance.md).
