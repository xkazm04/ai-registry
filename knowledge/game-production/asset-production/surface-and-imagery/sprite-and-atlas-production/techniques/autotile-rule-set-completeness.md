---
layer: technique
type: technique
subject: sprite-and-atlas-production
technique: autotile-rule-set-completeness
status: forged
laws: [an-instrument-proves-it-had-input, law-and-check-share-one-source, unmeasured-is-not-a-pass]
shared_with: []
use_when: [authoring or accepting a tile set that resolves neighbourhoods automatically, a hole or a wrong tile appears where two terrains meet, deciding how many tiles a terrain actually requires, commissioning a transition set from a generator]
---

# Autotile rule-set completeness

## The concern

An autotiling rule-set answers exactly one question: given which of a cell's neighbours match this
terrain, which image is drawn. That makes it a total function over a finite domain — and a total
function over a finite domain is the rarest thing in content production, because it can be *proved*
complete rather than reviewed.

The failure it prevents is unglamorous and expensive. A configuration nobody drew is reached by a
level built later, or by a player digging a shape the level designer never made, and the renderer
draws a hole, a fallback, or the wrong terrain in the middle of finished work. It is found late, by
someone who is not the tile artist, and it is reported as "the map is broken" — because from the
outside that is what a missing case looks like.

## Procedure

1. **Write down the matching rule first, as the single statement everything derives from.** Which
   neighbours are consulted — the four sides, or the four sides and the four corners — and under
   what condition each contributes. Both the tile-count arithmetic and the completeness check read
   that statement
   ([law-and-check-share-one-source](../../../../_laws.md#law-and-check-share-one-source)); when
   the rule is restated in a document and re-implemented in a checker, the two disagree and the
   disagreement is invisible from either side.
2. **Derive the required set size from the rule, do not assert it.** Consulting four sides gives
   sixteen cases and sixteen tiles. Consulting eight neighbours gives two hundred and fifty-six
   masks — but with the standard corner rule, that a corner is only distinguishable when both of the
   sides beside it also match, the distinct outcomes collapse to forty-seven. That collapse is a
   consequence of the rule and it must be *computed* from the rule, because a set commissioned
   against a remembered number is commissioned against somebody's memory.
3. **Enumerate every case and resolve each one.** Loop the whole domain — all sixteen, all two
   hundred and fifty-six — pass each neighbourhood through the resolver, and assert that every one
   returns an image. This is a complete proof, not a sample, and it costs microseconds.
4. **Assert the enumeration was non-empty and of the expected size.** A completeness walk over a set
   that failed to load passes: it examined nothing and found no failures
   ([an-instrument-proves-it-had-input](../../../../_laws.md#an-instrument-proves-it-had-input)).
   Report the case count and the distinct-image count beside the verdict, and fail loudly when the
   count is zero or differs from the derived size.
5. **Check the reverse direction too.** An image no neighbourhood ever selects is dead weight — art
   that was paid for and will never be seen — and it is usually the symptom of a mis-numbered set
   rather than of generosity.
6. **Name the missing cases in the terms the artist drew them in.** "Case 214 unmapped" is not
   actionable; "no tile for: matched above, below and left, corner above-left open" sends someone
   to the right cell of the template.
7. **Commission generated transition sets against the enumerated list**, one request per case with
   the neighbourhood described, rather than asking for "a tile set" and counting what comes back.
   The enumeration is the specification, and it exists before the generation.

## Decision rules

- **When a rule-set is accepted without a full enumeration, it is unverified, not complete.**
  ([unmeasured-is-not-a-pass](../../../../_laws.md#unmeasured-is-not-a-pass)) The domain is small
  enough that a sample is a deliberate choice to leave a question unanswered which has a total
  answer.
- **When a case has no image, fail rather than substitute.** A silent fallback to the nearest
  plausible tile turns a loud authoring gap into a subtle visual defect distributed across every
  level — the worst possible trade. Refuse to publish the set and name the gaps.
- **When the neighbourhood count is a project-wide choice, make it once.** Consulting four sides
  needs sixteen tiles and cannot express a diagonal join; consulting eight needs forty-seven and
  can. Mixing both inside one terrain family means the tile budget per terrain is unknowable, and
  budgets stated per terrain are how tile art gets commissioned at all.
- **When a terrain must meet more than one other terrain, the domain is per pair, not per terrain.**
  Three terrains that all meet each other need three transition families, and the naive count — one
  set per terrain — is short by the number of pairs. This is the most common way a "complete" tile
  set is discovered incomplete in a level.
- **When the art is generated, expect the completeness failure to arrive as near-duplicates rather
  than as gaps.** A model asked for a transition set returns plausible tiles for the memorable cases
  and improvisations for the rest; the enumeration catches missing coverage, and a distinct-image
  count catches the opposite failure, where several cases were answered with the same picture.
- **When the rule-set changes, re-enumerate before anything else.** It is the cheapest check in the
  subject and the only one that detects a whole-set regression from a one-line edit.

## When NOT to use it

- **Hand-placed decorative tiles** that no rule selects. Completeness is a property of an automatic
  resolver; a set placed by a human by eye has no domain to enumerate.
- **Rule-sets driven by a scoring or weighted-random selector** over an open set of candidates,
  where the question is not "is every case covered" but "does every case have at least one candidate
  and a sane weight". The completeness idea still applies; the enumeration is over the *conditions*,
  not over the images, and asserting one image per case is wrong there.
- **Continuous or mesh-based terrain blending**, where the transition is a shader operation over a
  surface rather than a selection among images. There is no finite domain, and the acceptance
  question is a material one.

## What this technique does not tell you

A complete rule-set is not a good-looking one. Every case can resolve to an image, and the images
can be inconsistent in lighting, in edge treatment or in palette, so that the transitions read as
patchwork. Completeness is arithmetic and the set's coherence is the palette and set-discipline
question — separate axes, both required, and only the first is provable.
