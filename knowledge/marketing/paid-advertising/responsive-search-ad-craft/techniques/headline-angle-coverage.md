---
layer: technique
type: technique
subject: responsive-search-ad-craft
technique: headline-angle-coverage
status: forged
laws: [never-invent-proof, label-convention-as-convention]
shared_with: []
use_when: [writing the headline set for an ad group, judging whether a generated set is padded, briefing a generator on what the headlines must cover]
---

# Headline angle coverage

The headlines of a responsive search ad are written by angle, and the count is what the
angles add up to. The platform combines a few of them per auction, so two headlines
that make the same point in different words are not coverage - they are a combination
that repeats itself when the combiner picks both. The set is strong when any three
headlines drawn from it make an ad that says three things.

## The angle list

A set for a product or service covers, at minimum:

- **Main benefit** - the one thing the buyer gets.
- **Audience** - who this is for, in the words they would use about themselves.
- **Call to action** - a direct instruction: order, book, compare, get a quote. At least
  one, without exception; a set with no call to action leaves the combiner unable to
  close.
- **Trust or quality** - a supplied proof point: a guarantee, a certification, years in
  business, a return policy. Only what the business gave. An unsupplied trust claim is
  the most common fabrication in ad copy and the reason the grounding contract exists.
- **Breadth of range** - how much choice there is, when that is true and given.
- **Brand** - the business or shop name, at least once whenever it was supplied,
  because a combination with no brand headline is an anonymous ad and the searcher
  cannot tell whose it is.

Price, delivery terms and stock are angles too, when supplied; they are never invented
to fill a slot. Five or more distinct angles is the practitioner's acceptance bar for a
set; the number is convention, the requirement that each headline add an angle is the
technique.

## Procedure

1. **List the angles the brief supports.** Each angle needs material from the grounded
   inputs. An angle with no material is left out, not faked.
2. **Write one headline per supported angle first.** This is the floor of the set.
3. **Add a second headline for an angle only when it says something new** - a different
   benefit, a different audience segment, a different call to action verb. A reworded
   duplicate is deleted, not kept as a "variant".
4. **Check every headline stands alone.** A headline that depends on another to make
   sense ("...and free returns") assumes a combination the platform may never serve.
5. **Check distinctness mechanically.** Normalise (lowercase, strip diacritics and
   punctuation) and count unique headlines; anything that collapses is a duplicate.
   Then read for near-duplicates the normaliser cannot catch - same point, different
   words - because a distinctness count is a proxy for angle coverage, not a measure
   of it.
6. **Stop when the angles are covered.** Eight distinct headlines is the convention for
   "enough to rotate"; the slot count is fifteen. Filling the gap between with
   rewordings degrades the ad the combiner serves.

## Decision rules

- **When the brief supplies fewer angles than the target count, ship fewer headlines,
  because** a padded set puts near-duplicates into the same served combination, and
  that ad is worse than a shorter rotation.
- **When a brand name is in the inputs, one headline carries it, because** the combiner
  otherwise serves anonymous ads and the searcher's recall attaches to nobody.
- **When a generator returns headlines that all share a template ("X for Y", "X for
  Z"), reject the set as one angle repeated, because** template variation reads as one
  headline to a searcher and as many to a distinctness counter.
- **When the trust angle has no supplied proof, leave it out and put the question to
  the owner, because** an invented guarantee in an ad is a claim the business is then
  held to.

## When NOT to use

- Do not apply the angle list to a single-purpose ad group (a brand-only campaign, a
  one-offer promotion) as a mandatory checklist. There the audience and range angles
  may have nothing to say, and the technique's rule - fewer, distinct - applies over
  its list.
- Do not treat the distinctness count as the coverage measure. Fifteen unique strings
  can be three angles; the count catches literal duplicates and nothing else.
- Do not let angle coverage override the character limit or the keyword-coverage
  share; a headline written to fit an angle still stays under thirty and the set still
  keeps keyword-free headlines for the combiner to pair.
