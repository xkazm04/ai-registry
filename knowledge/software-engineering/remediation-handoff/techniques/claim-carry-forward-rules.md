---
layer: technique
type: technique
subject: remediation-handoff
technique: claim-carry-forward-rules
status: forged
laws: [identity-survives-reuse, derivation-names-recomputation]
shared_with: []
use_when:
  - matching last run's findings against this run's findings
  - an item someone claimed is neither marked resolved nor restated
---

# Claim carry-forward rules

Every regenerating assessment faces the same problem: the new run produced a
list of findings, the old run produced another, and the system must decide
which new finding *is* which old one, so that history, claims and status
survive. That matching is carry-forward. This technique is about the one case
where the ordinary matcher is dangerously wrong — **a finding somebody
claimed** — and about the rule that replaces it.

## The tiers, and why the last one exists

Matching old to new is normally done in tiers of decreasing confidence:

1. **Exact identity within a category** — same category, same title. Certain.
2. **Normalized identity** — same category, same title after case folding,
   punctuation stripping and whitespace collapse. Near-certain; absorbs
   cosmetic rewording.
3. **Structural pairing** — within a category, if exactly one old finding and
   exactly one new finding remain unmatched, pair them. Plausible, not
   certain.

Tier 3 earns its place for *open* findings. Without it, a finding whose
wording drifts between runs resurfaces as brand new, its history and its age
lost, and the ledger fills with duplicates that are the same problem wearing
different sentences.

## Why tier 3 must not touch a claimed item

Now consider an item an operator handed off. It was fixed. The next run
does not produce it. But the assessment is a rubric that keeps scoring the
codebase, and any rubric with per-category findings will produce *some*
finding for a category that is still below target — the next-worst thing it
can see. So the category has one unmatched old finding (the fixed one) and
one unmatched new finding (the next-worst one), and tier 3 pairs them.

The consequence is specific and nasty: **the claim rides forward onto work
nobody ever took on.** The ledger now shows an item marked as being worked,
with a claimant, a claim timestamp and a history, describing a gap that was
discovered thirty seconds ago and that no human has ever seen. It is
invisible as a defect because it is indistinguishable from a legitimate
carry-forward. And it is self-perpetuating: the same pairing happens next run
and the run after, so the claim never expires and the true fix never gets
credit.

The rule that follows is asymmetric, deliberately:

> **Open findings carry forward through all tiers. Claimed findings carry
> forward by title alone — tiers 1 and 2 only. If the new run does not say
> it again, the claim is honoured as resolved.**

Asymmetry here is the design, not an inconsistency awaiting cleanup. The two
cases optimize different things: for an open finding, the cost of a missed
match is a duplicate, so match generously. For a claimed finding, the cost of
a wrong match is a fabricated claim on unclaimed work, so match strictly and
accept that a genuinely-still-broken gap will occasionally be recorded as
resolved and then reappear as a fresh open item next run — a cheap, visible,
self-correcting error.

## Honouring the unconfirmed claim

The hard half is the disposition when there is no marker and no restatement.
The choice is between holding the item open pending proof and honouring the
claim. Honour it, for two reasons. First, the codebase is the authority: if
the instrument that raised the finding no longer raises it, the system's own
best evidence says the condition is gone. Holding the item open contradicts
your own instrument on the strength of nothing. Second, the alternative
accumulates: unconfirmed claims that never resolve turn the ledger into a
graveyard of half-states, and a ledger nobody can drain stops being read.

State it as the closing rule, in the code's own words: *a claimed item is
carried only by its title; if the assessment does not say it again, the claim
is honoured as resolved.*

## What happens to the replacement finding

When a claimed item closes and the category produced a new finding in its
place, that new finding is a **fresh open item**. It inherits nothing: not
the claim, not the claimant, not the history, not the age. That is the whole
point of excluding tier 3 here, and it must be enforced at the write, not
just assumed at the match.

Enforcement has a second half that is easy to miss. The general matcher runs
first and has already paired the claimed item with something under tier 3; the
claim rule must then *undo* that pairing. And it must undo it in **both**
outcomes, not only when the item closes: an item whose claim is kept is kept
because it was restated under a title tier, so any pairing that is not itself
a title-tier match is a different gap and must be broken. If the matcher does
not report which tier produced a pair, re-check the specific pair with the
strict predicate rather than trusting the pairing that already exists. A claim
kept on the right item but with its history attached to the wrong new finding
is the same defect in slower motion.

## Identity discipline underneath

None of this works without identity that survives regeneration
([identity-survives-reuse](../../_laws.md#identity-survives-reuse)). The
matching key is (category, title) plus a normalization function, and both
sides of the comparison must use the *same* normalizer — a normalizer that
lives in one place and is called by both the matcher and the restatement
check. The persisted identifier, meanwhile, is minted once and is what the
marker names; it is not the matching key and must not be derived from the
title, or a reworded finding becomes a different item and every claim against
it evaporates.

The resulting status is derived, and it names its derivation
([derivation-names-recomputation](../../_laws.md#derivation-names-recomputation)):
each transition records which rule produced it, so the ledger can be
explained and, if the rules change, recomputed.

## Decision rules

- **When a marker names a claimed item, close it** regardless of matching.
- **When a claimed item is restated by tier 1 or 2 and no marker exists, keep
  the claim** — the work is genuinely still outstanding.
- **When a claimed item is not restated by tier 1 or 2, close it as
  resolved** and record that no restatement was the reason.
- **Never apply structural pairing to a claimed item**, in either direction:
  not to keep its claim alive, and not to move its claim to another finding.
- **When normalization changes, treat it as a migration.** A new normalizer
  silently re-partitions every match; roll it out with a run that reports
  what it would change before it changes anything.

## When not to use this

- **When findings are not regenerated wholesale.** If items are created once
  and mutated in place, there is no matching problem and no carry-forward —
  status is just a field.
- **When the assessment does not guarantee at least one finding per weak
  category.** The tier-3 hazard is a consequence of that guarantee; without
  it, structural pairing is less dangerous, though still not free.
- **When claims are short-lived and externally confirmed.** If the executor
  reliably reports back through a channel you control, prefer that report and
  keep matching purely for de-duplication.
