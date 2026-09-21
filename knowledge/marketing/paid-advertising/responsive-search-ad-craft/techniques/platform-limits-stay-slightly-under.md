---
layer: technique
type: technique
subject: responsive-search-ad-craft
technique: platform-limits-stay-slightly-under
status: forged
laws: [label-convention-as-convention, a-gate-before-money-and-copy]
shared_with: []
use_when: [instructing a generator on ad character limits, validating an ad set before upload, targeting two platforms from one ad set]
---

# Platform limits: stay slightly under

A character limit is the platform's boundary, not the writer's target. An asset written
to exactly the limit fails in three ways the writer cannot see from their own editor:
the platform counts differently (some scripts count a character as two, a trailing
space is trimmed and then a word is not, disallowed punctuation is rejected outright),
a second platform's limit differs by a few characters, and a generator's notion of
length differs from the upload validator's. Two to three characters of headroom absorbs
all three.

## The two footings

The **limits** are documented platform facts. On the dominant search engine's ad
platform: thirty characters per headline, ninety per description, twenty-five per
callout, fifteen headline and four description slots, with a ninety-character long
headline on some formats. A second national platform's search-network combined ad
documents the same shape, and its display-network combined ad documents a different one
(a twenty-five character short headline, one of each). The lesson is that limits are
per platform *and* per network, and a set that declares one limit table for "search
ads" has silently chosen one platform and one network.

The **headroom** is practitioner convention. Two to three characters under is the
habit; nothing in any platform's documentation asks for it, and a technique or a
prompt that says "stay slightly under" labels it as the convention it is.

## Procedure

1. **Declare the limits once, per platform, as constants with their source.** Not
   re-exported from each other: a second platform gets its own table with its own
   documentation citation, so that when one platform changes its limit the other's
   export is byte-identical. Two tables that happen to agree today are still two
   tables.
2. **State the limits in the generator's instructions, with the headroom.** "Headline
   at most thirty characters; prefer slightly under." The instruction is the cheap
   half.
3. **Re-check every asset after generation.** The instruction is not the check. Count
   each asset against its limit in the same code that will export it, and produce a
   per-asset violation naming the asset, its length and the limit.
4. **Feed violations back before clamping.** A generator told "headline three is
   forty-six characters, limit thirty" rewrites; a generator whose output was silently
   cut never learns. One self-correction pass, then the over-limit asset is dropped
   (see `over-limit-omitted-not-truncated`).
5. **Flag in the editor what the export will drop.** An asset the writer edits by hand
   past the limit turns red where it sits, so the omission at export is never a
   surprise.
6. **Count the way the platform counts.** Where a platform documents double-width
   characters or forbidden symbols, the local counter mirrors that, and the headroom
   covers what the documentation leaves out.

## Decision rules

- **When a generator returns an asset over the limit, send the violation back for one
  rewrite, because** the model that wrote it can shorten it with the meaning intact,
  and a clamp cannot.
- **When an ad set targets two platforms, validate against each platform's own
  table, because** their limits coincide by accident, not by contract, and the day they
  diverge is the day a shared constant ships a rejected asset.
- **When the platform's counting rule is undocumented for a character class, treat the
  headroom as the safety margin and keep it, because** a rejected upload costs a day and
  three characters cost nothing.
- **When a fast, cheap generator tier is proposed for ad copy, run the limit check on
  its raw output before the clamp, because** a benchmark of three tiers on this task
  found the fast tier over the limit on most headlines and relying entirely on the
  clamp to look compliant. The limit is a hard constraint that smaller models do not
  hold, and the clamp hides the failure.

## When NOT to use

- Do not apply search-ad limits to social or display copy. Each network has its own
  table; the technique's point is that the table is per platform and per network, not
  that thirty and ninety are universal.
- Do not tighten the headroom into a second, private limit ("we cap at twenty-seven").
  A private limit throws away good headlines and drifts into being quoted as the
  platform's. Headroom is a preference in the instruction, not a validator threshold.
- Do not skip the post-generation check because the generator is a top tier. The top
  tier in the same benchmark still needed self-validation to land clean, and a
  generator change is invisible to the check unless the check runs every time.
