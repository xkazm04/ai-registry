---
layer: golden-path
type: golden-path
subject: responsive-search-ad-craft
status: forged
use_when: [writing or generating a multi-asset search ad, rating a set of headlines and descriptions before upload, exporting an ad set to a platform import sheet, deciding what a platform's ad-strength label is allowed to mean]
techniques:
  - platform-limits-stay-slightly-under
  - headline-angle-coverage
  - keyword-coverage-half-not-all
  - length-bucket-spread-and-combination-preview
  - over-limit-omitted-not-truncated
  - ad-strength-is-a-proxy-not-relevance
---

# Responsive search ad craft

A responsive search ad is not an ad. It is a bag of assets - a dozen or so headlines, a
handful of descriptions, some callouts - from which the platform assembles a different
ad for every auction, choosing a few headlines and a couple of descriptions that fit the
query, the device and the space it has. The advertiser never writes the ad the searcher
sees. They write the material, and the platform writes the ad. Everything in this
subject follows from that one inversion: the unit of craft is the set, not the line, and
the set is judged by what its combinations can render, not by what its best headline
says.

This subject owns **the writing and rating of the asset set under platform character
limits**: staying slightly under the limits rather than at them, covering distinct
angles across the headlines, putting the keyword in about half of them rather than all,
spreading headline lengths so combinations render on a phone, omitting an over-limit
asset from an export rather than truncating it, previewing served combinations, and
treating the platform's "ad strength" label as a proxy that knows nothing about the
landing page. It does not own where the copy's facts come from or how a generator is
stopped from inventing them - `grounded-marketing-generation` owns the anti-fabrication
clause and the approval gate, and `product-feed-and-catalog-spine` owns the catalog
that supplies a product's benefits and its audience. When this subject says "the
benefits given", it means benefits that arrived through those two subjects' contracts.
Which keywords the ad group holds is `search-term-mining`'s; the landing page's own
craft is `money-page-conversion-craft`'s.

## The set is the unit

A principal practitioner holds three things true about a responsive search ad that the
naive reading misses.

**The platform combines; the writer supplies.** A served combination is a few headlines
and a couple of descriptions, and the platform picks them per auction. So a headline is
never read alone - it is read next to two siblings it did not choose. Two headlines
that say the same thing in different words are not "coverage", they are a combination
that repeats itself. A headline that only makes sense after another one has been read
is a combination that may never render. The test of a headline is: does it stand alone,
and does it add something when it lands beside any two others in the set?

**The limits are the platform's, the targets are convention.** The character limits -
on the dominant search engine's ad platform, thirty characters per headline, ninety per
description, and fifteen headline and four description slots; on a second national
platform's search-network combined ad, the same shape - are documented facts and
change only when the platform announces it. The *targets* a rater applies inside those
limits - eight headlines as "enough", half the headlines carrying a keyword, three
length buckets represented - are practitioner convention and every document in this
subject says so where it uses one. The limits and the targets are on different footing
and a rater that presents its targets as platform behaviour has manufactured folklore.

**A label is a proxy.** The platform attaches a Poor-to-Excellent "ad strength" label to
the set. It is computed from the assets alone: count, distinctness, keyword presence,
length spread. It does not read the landing page, it does not know the offer, it does
not move with the ad's own results. A set can carry the top label while pointing at a
page that an experiment already proved loses. The label is a linting pass on the
material, and a rater that mirrors it locally is doing the same linting - useful,
cheap, and silent about relevance.

## Writing the set

The order of work for one ad group is fixed enough to state.

1. **Establish what may be said.** The product, its benefits, its audience and the
   brand name arrive from the grounding contract. Nothing else may appear: no number,
   price, discount, superlative or credential that was not given. That rule is not this
   subject's to restate; it is the reason a headline slot stays empty rather than
   getting a plausible "20% off".

2. **Write headlines by angle, not by count.** Benefit, audience, call to action,
   trust or quality, breadth of range, brand - each angle gets at least one headline,
   the call to action and the brand get one each without fail, and the count is what
   the angles add up to. Eight distinct angles beat fifteen rewordings of three. The
   over-generation failure - fill every slot because the platform offers fifteen - is
   real and the label rewards it; the practitioner does not.

3. **Put the keyword in about half.** A keyword in every headline gives the platform
   no keyword-free headline to pair with a keyword-bearing one, and reads as spam to
   the searcher who sees the same term three times in one ad. A keyword in none of
   them loses the bold match on the results page and the relevance signal that feeds
   the platform's own quality assessment. The half is a convention; the shape of the
   argument - some, not all - is not.

4. **Spread the lengths.** A headline set of uniformly twenty-eight-character lines
   renders well on a wide screen and truncates on a phone, where the platform prefers
   a short headline in the third slot or drops it. Short, medium and long headlines
   give the combiner something to fit every width. The bucket edges are convention;
   the need for buckets is a documented rendering behaviour.

5. **Stay slightly under every limit.** A thirty-character limit is a boundary, not a
   target. Copy written *to* the limit fails on the platform's own counting (some
   characters count double, some punctuation is disallowed, a trailing space is
   trimmed then a word is not), fails on a second platform whose limit differs by a
   few characters, and fails when a generator's tokenizer counts differently from the
   upload validator. Two to three characters of headroom is the convention; the
   reason - the counting is not yours - is structural.

6. **Preview combinations, not the first three.** A preview that always shows
   headlines one to three and descriptions one and two shows one ad out of the
   hundreds bought. Rotate a window over the set so the writer sees short beside long,
   the brand headline beside the call to action, the fourth description alone with
   the last headline. The preview's job is to surface the combination that reads
   badly, and a fixed view surfaces nothing.

7. **Rate, then read the rating as a lint.** A local strength heuristic - counts,
   distinctness, spread, keyword coverage, limits - tells the writer what is missing
   from the material. It says nothing about whether the material is right. An
   over-limit asset caps the rating below "good" no matter how strong the rest is,
   because a top label next to an asset that cannot ship is a contradiction the
   writer will stop trusting.

8. **Export what can ship.** An asset over the limit is omitted from the import sheet,
   not truncated. A truncated headline ships copy nobody approved - a word cut in
   half, a call to action missing its verb - into an auction where the writer will
   not see it for weeks. An omitted asset leaves a slot empty, which the platform
   handles, and a red flag in the editor, which the writer handles.

## Where the naive reading fails

**Filling every slot.** The platform recommends all fifteen headlines and the label
punishes fewer. Fifteen headlines with six angles among them are nine near-duplicates,
and near-duplicates in the same combination are the most common ugly ad. The count
target in a rater is a floor for rotation, not a goal for its own sake, and the
distinctness factor exists to punish exactly the padding the count factor invites.

**Pinning to control the ad.** Pinning a headline to position one restores the old
static-ad feeling of control and removes most of the combinations the platform could
have tried. Pin the brand or a legally required line when there is a reason; pin
nothing else, and know that the strength label drops on pinning because the label
counts combinations. That drop is the one case where the label's opinion and the
practitioner's coincide for the wrong reason - the label objects to fewer
combinations, the practitioner objects to fewer experiments.

**Trusting the label as performance.** A 2023 analysis by an ad-management vendor of
roughly twenty thousand accounts found no correlation between the strength label and
click-through, conversion rate or cost per acquisition, and a practitioner experiment
the same year found an "Excellent" set losing to a "Good" one on click-through,
conversion rate and the platform's quality score. Most well-performing sets in the
wild carry "Poor" or "Average". The label's own documentation says it does not change
with performance. It is a completeness check on the material, and a rater that mirrors
it must say so in its label.

**Letting the platform write assets.** The dominant platform offers to generate
headlines and descriptions from the landing page and the ad group's keywords; since
mid-2025 that offer lives inside a campaign-level automation setting rather than a
standalone toggle, and it is opt-in there. A platform-written asset is ungrounded by
this bundle's standard - nothing in the grounding contract supplied it - so a business
that cannot review every served asset leaves the option off, and one that turns it on
reviews the generated assets as it would review a generator's output.

**Repairing over-limit output by clamping.** A generator that returns a forty-six
character headline is not repaired by cutting it at thirty. The repair is to send it
back with the violation named, let it rewrite, and drop the asset if it cannot. A
benchmark of three model tiers on this exact task found the fast tier violating limits
on most headlines and relying entirely on the clamp - mid-word cuts, lost content -
while the mid tier landed within limits with a single description over by a few
characters. The fast tier's copy was rated unusable because of the clamp, not despite
it. Character limits are a hard constraint a smaller model does not hold, and the
degradation shows in the clamp log before it shows in the auction.

**Rating a single ad group's copy as if it were an account.** The set is written for one
ad group and one landing page. A set copied across ad groups with the keyword swapped
carries the first group's benefits into the second's auction. The keyword-coverage
factor will pass; the relevance the factor cannot see will fail.

## What this subject asks of a generator

An agent producing an ad set obeys the same order and adds three structural
obligations. It states the limits in its instructions and asks for output slightly
under them, then re-checks every asset against the limits after generation - the
instruction alone is not the check. It carries a per-asset violation list that is fed
back for self-correction before any clamp is applied, and it reports which assets were
dropped. And it emits the rating with its footing visible: the limits as documented
platform facts, the count and coverage targets as convention, and the whole label as a
material check that has not read the landing page.

The techniques below hold the decision rules. Each names which of its thresholds is
documented platform behaviour and which is a practitioner habit, because the fastest
way for this subject to rot is for a bucket edge or a coverage share to be quoted back
a year later as something the platform requires.
