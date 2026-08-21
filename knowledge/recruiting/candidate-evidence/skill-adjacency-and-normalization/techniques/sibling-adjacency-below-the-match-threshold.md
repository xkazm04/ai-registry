---
layer: technique
type: technique
subject: skill-adjacency-and-normalization
technique: sibling-adjacency-below-the-match-threshold
status: forged
laws: [say-only-what-the-record-holds, inference-must-look-like-inference, uncertainty-resolves-toward-the-candidate]
shared_with: []
use_when: [deciding what a cousin skill is worth, setting the line between a nudge and a claim, reviewing a change to a scoring constant]
---

# Sibling adjacency below the match threshold

Two capabilities that share a parent — two instances of one discipline — share
vocabulary, tooling shape, workflow and mental model. A practitioner of one
reaches competence in the other faster than someone starting cold. That effect
is real, it is small, and the entire technique consists of expressing exactly
that: **give it credit, and set the reporting threshold above it so it can never
be spoken as a possession.**

## The two-number arrangement

- **Sibling credit** — a small fraction of an exact match, large enough to order
  two otherwise-equal candidates correctly, small enough that a handful of them
  never adds up to a met requirement.
- **The match threshold** — the score at or above which the system is willing to
  render "this requirement is addressed."

The invariant: `sibling credit < match threshold`. Written as a constraint, in a
comment beside both numbers, and asserted in a test that fails if anyone closes
the gap. With a threshold at the midpoint of the interval, a sibling value
around two fifths sits just under it — close enough to matter in ranking,
provably incapable of publishing a claim.

This is not a tuning preference. It is the structural difference between a
system that ranks and a system that asserts. Above the threshold, a cousin skill
becomes a green tick on a screen a recruiter reads as verification, and the
system has said something about a person that no record supports —
[say only what the record holds](../../../_laws.md#say-only-what-the-record-holds).

## Distance: the ladder and its floor

Adjacency is graduated, and the graduation must bottom out at *zero*, not at a
small number:

| Relation | What it means | Credit |
| --- | --- | --- |
| Exact | same canonical term | full |
| Specialization | candidate holds a child of the requirement | near-full |
| Generalization | candidate holds a parent of the requirement | about half |
| Sibling | shared immediate parent | small, below the threshold |
| Cousin via grandparent only | shared ancestor two steps up | zero |
| Unrelated | no path | zero |

The grandparent cut is the part people leave out, and it is the part that
protects the ranking. A vaguely-shared ancestor several steps up relates half a
family to the other half. Each such pair contributes a small amount; across a
requirement list of fifteen, small amounts sum into a rank change that no
recruiter can explain and no engineer can reproduce from the interface. Cutting
at one step from the shared parent keeps every non-zero credit traceable to a
relationship a human wrote down deliberately.

## Pin the ladder as a contract

The ordering above deserves a dedicated test file whose only job is to assert
the full ladder in one place: exact beats specialization beats generalization
beats sibling beats cousin-at-distance equals zero, and sibling is strictly
below the threshold. Assert the *relations*, not only the literals, so the test
keeps meaning after a legitimate re-tune.

The reason this earns its own file rather than a few assertions scattered among
matcher tests is social. Someone will one day be asked to improve recall on a
sparse family, will find the sibling constant, and will raise it. A test file
named for the contract makes the consequence of that edit arrive as "you are
about to let cousin skills be reported as possessed," rather than as a red
number in an unrelated suite.

## What a sibling match is allowed to do

- **Contribute to a continuous score.** Yes — that is the point.
- **Break a tie in ranking.** Yes, and this is where its value is realized.
- **Appear in an explanation as context** — "has worked with a related
  capability under the same discipline" — as long as the wording names the
  relation and never the requirement's term. Yes.
- **Count toward "requirements met."** Never.
- **Count toward "requirements missing."** Also never — and this is the half
  people forget. A candidate who offered a neighbouring capability made a claim;
  filing them alongside a candidate who said nothing on the subject overstates
  the gap and, where missing must-haves drive a hard filter, can eliminate them.
  The three buckets — addressed, claimed-but-unproven, never-claimed — must be
  **disjoint and exhaustive**, and a sibling hit belongs squarely in the middle
  one. A two-bucket model has nowhere to put it and will put it in whichever
  bucket the implementer found first.
- **Appear as a skill on a candidate's profile.** Never.
- **Satisfy a hard or statutory requirement.** Never, at any credit.
- **Flow into an automated adverse decision.** Never on its own. Where a score
  built partly on adjacency approaches an adverse cutoff, the doubt resolves
  toward the person — [uncertainty resolves toward the candidate](../../../_laws.md#uncertainty-resolves-toward-the-candidate).

## The recruiter-facing form

A sibling match's honest output is not a tick and not silence; it is a *probe*.
"The record shows a neighbouring capability under the same discipline; ask how
they would approach the required one" is actionable, correctly hedged, and
converts the weakest tier of the ladder into the thing it is actually good for:
a question to ask a human being.

## When not to use this

- **When siblings in a family are not actually near-transferable.** Some parents
  group terms administratively rather than by shared practice; two children of
  such a parent transfer nothing. If a family's siblings are unrelated in
  practice, the fix is to restructure the parent, not to keep crediting.
- **When the requirement is binary.** Licences, clearances, statutory
  qualifications and language-proficiency floors admit no adjacency at all.
- **When the score has no threshold.** A system that renders raw scores without
  a publication rule has nowhere to put this technique's invariant; introduce
  the threshold first, then the sibling tier. In that order — a sibling credit
  shipped before its threshold exists is a claim with no ceiling.
