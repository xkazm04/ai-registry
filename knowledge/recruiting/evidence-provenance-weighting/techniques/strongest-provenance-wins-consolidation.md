---
layer: technique
type: technique
subject: evidence-provenance-weighting
technique: strongest-provenance-wins-consolidation
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, say-only-what-the-record-holds]
shared_with: []
use_when: [one skill appears under several bases, deduplicating extracted claims, explaining why a skill reads as demonstrated]
---

# Strongest provenance wins

One skill usually appears several times in one candidate's record: named in a
professional role, again in a personal project, and again in the skills list at the
top. Consolidation decides what the pipeline holds as *the* basis for that skill. The
rule is that the strongest basis wins outright, and this technique is why, plus the
two guards that keep it from becoming a laundering path.

## The rule and its justification

**Evidence is disjunctive.** One demonstrated instance is not weakened by ten
self-assertions elsewhere in the same document. If a candidate shipped the thing under
load for three years, the fact that they also listed it in a skills bar tells you
nothing new and must not subtract anything.

The alternatives all fail:

- **Averaging the tiers** lets padding dilute real work. A candidate who lists every
  skill they have ever touched *lowers* the recorded strength of the ones they
  genuinely demonstrated. That is exactly backwards: it penalizes disclosure and
  rewards a terse, curated résumé.
- **Summing the tiers** rewards volume, which is the failure the whole subject exists
  to prevent — the padded list wins again, this time by count.
- **Last-write-wins** makes the recorded tier a function of parse order, which is a
  property of the document layout, not of the person.

## Compare by rank, not by weight

The implementation detail that silently breaks this rule: consolidating by comparing
the two claims' **multipliers**. Because the top rungs are deliberately capped at the
same full-credit weight, a comparison by weight cannot tell a demonstrated skill from
a professionally-used one, and whichever claim the pipeline happened to read first
wins. The candidate's live-case result is then shadowed by a résumé line, the ordering
that the whole ladder exists to express is discarded at the one place it matters most,
and nothing in the output looks wrong.

Consolidate on the **ordinal rank**. Weights are for scoring; rank is for ordering,
and consolidation is an ordering operation. The same rule protects the other end: an
unrecognised origin string must be treated as the floor in the comparison, never as
"no opinion" — a comparison that scores an unknown key as nothing at all is correct by
accident, and stops being correct the moment somebody gives unknown a real weight.

## Multiplicity is a separate signal

Repeated evidence *is* informative — just not about tier. Record it alongside, never
folded in:

- **How many independent bases** support the skill.
- **How recent** the strongest basis is.
- **How long** the strongest basis was sustained.

These support the ranking and the interview plan without touching the strength claim.
A skill demonstrated once, eight years ago, and a skill demonstrated across three
recent roles share a tier and differ on every other axis — which is the honest
description.

## Guard 1 — consolidation cannot repair a dishonest assignment

Strongest-wins operates on the tiers assigned at extraction. If extraction is generous
— if unknown origins land mid-ladder, or if a loose matcher mints top-tier claims off
stray text — then strongest-wins becomes a machine that surfaces *the most flattering
reading of every skill* and hides the honest ones behind it. The two techniques that
protect it are
[default-provenance-fails-safe](default-provenance-fails-safe.md) and
[observed-evidence-minting-gates](observed-evidence-minting-gates.md); without both,
this rule amplifies their failures instead of merely inheriting them.

The diagnostic: if the consolidated tier for most skills across most candidates is at
or near the top of the ladder, the ladder is not being applied — it is being
maximized over noise.

## Guard 2 — the losers are retained, not deleted

Consolidation produces a *display and scoring* value. It does not delete the claims it
outranked. Two reasons, both hard requirements:

- **Audit.** "Why does this person read as demonstrated in this skill?" must terminate
  at a specific basis — a named role, a named exercise — per [a claim carries its
  sample and its basis](../../_laws.md#a-claim-carries-its-sample-and-its-basis). A
  collapsed maximum answers "because the maximum was that", which is not an answer.
- **Correction.** When a mint is later found to be spurious, the correct behaviour is
  to fall back to the next-strongest surviving basis. If the losers were discarded, a
  retraction turns a well-evidenced skill into a missing one, and the candidate is
  punished for the system's error.

Retention also keeps the surface honest: a claim shown as demonstrated may be expanded
to show that it was *also* self-asserted and *also* present in a project, which is
information a recruiter can use — [say only what the record
holds](../../_laws.md#say-only-what-the-record-holds) cuts both ways, and the record
holds more than the maximum.

## Decision rules

- **When two bases tie at the same rung**, keep both as the basis set and rank by
  recency for display. Do not invent a tiebreak that promotes one above its rung.
- **When the strongest basis is disputed or withdrawn**, recompute from the surviving
  set immediately. Do not leave a stale consolidated tier standing on a retracted
  claim.
- **When consolidating across candidates for a comparison view**, consolidate per
  candidate first and compare consolidated values. Comparing raw claim counts compares
  résumé verbosity.
- **When the same skill appears under different names**, normalization happens before
  consolidation, and it belongs to the sibling adjacency practice. Consolidating
  before normalizing produces two entries whose maxima are each computed over half the
  evidence.

## When not to use this

- **For fraud signals.** Repeated inconsistent claims are a pattern worth surfacing,
  and a maximum hides it. Contradiction detection reads the full claim set, not the
  consolidated value.
- **For breadth or seniority inference.** The maximum answers "what is the best basis
  for this one skill". It says nothing about the shape of a career, and building a
  seniority estimate out of consolidated maxima overstates every candidate whose one
  strong instance is their only strong instance.
- **When the bases describe different things.** If "the same skill" is really two
  scopes — a tool used in passing and the same tool owned end to end — the fix is a
  finer skill vocabulary, not a maximum that quietly upgrades the narrow instance to
  the broad one's tier.
