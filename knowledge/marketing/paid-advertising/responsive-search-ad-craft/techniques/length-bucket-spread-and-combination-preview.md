---
layer: technique
type: technique
subject: responsive-search-ad-craft
technique: length-bucket-spread-and-combination-preview
status: forged
laws: [label-convention-as-convention]
shared_with: []
use_when: [checking whether a headline set renders on a phone, building or reviewing an ad preview, scoring length variety in a rater]
---

# Length-bucket spread and combination preview

A responsive search ad is served as a few headlines and a couple of descriptions
chosen per auction; on a narrow screen the platform prefers a short headline in the
last slot or drops it, and on a wide screen it fills the line. A set of uniformly long
headlines renders well in one place and truncates in the other. The writer supplies
short, medium and long headlines so the combiner can fit every width, and previews
rotating combinations - never only the first three - so the combination that reads
badly is seen before the auction sees it.

## Two footings

That the platform composes ads per device and prefers shorter assets where space is
tight is documented behaviour. The bucket edges - fifteen characters or fewer as
short, up to twenty-four as medium, longer as long - are practitioner convention; a
rater that uses them says so. That a served combination is three headlines and two
descriptions is the platform's documented serving shape and is the number the preview
mirrors.

## Procedure - spread

1. **Bucket each headline by length.** Three buckets is enough; the edges are
   convention.
2. **Require all three buckets to be present for full marks; two is partial; one
   fails.** The score is a share of buckets present, not a distribution target - the
   set does not need equal thirds.
3. **When a bucket is empty, write for it deliberately.** A short headline is usually
   the brand or the call to action ("Order today"); a long one is usually the benefit
   with its qualifier. Do not shorten an existing headline by cutting words; write the
   short one fresh.

## Procedure - preview

1. **Mirror the serving shape.** Three headline slots and two description slots per
   combination.
2. **Rotate a stride window over the non-blank assets.** Combination *i* starts each
   list at offset *i* and wraps; one step advances both lists, and the number of
   distinct views is the longer list's length. Index zero is the first three headlines
   and the first two descriptions - the view a fixed preview always showed - so adding
   rotation changes nothing until the reviewer asks for the next combination.
3. **Show asset numbers beside the preview.** Each shown headline carries its
   one-based position in the set, so a combination that reads badly points at the row
   to fix.
4. **Make the sampler deterministic and index-driven.** No randomness in the preview:
   a preview that repaints a different ad on every render cannot be discussed, and a
   stale index after regeneration must still land on a valid combination (wrap modulo
   the count).
5. **Preview on a narrow width as well as a wide one.** The point of the spread is the
   phone; a preview that only renders desktop width never shows the truncation the
   spread exists to prevent.

## Decision rules

- **When all headlines fall in one bucket, write a headline for each missing bucket
  before touching anything else, because** a length-uniform set is the one that
  truncates on the device most searches come from.
- **When a preview shows a combination that repeats a point, fix the set (delete or
  reword the duplicate), never the preview, because** the platform will serve that
  combination whether or not the preview shows it.
- **When a reviewer sees only the first combination, treat the review as not done,
  because** one view of hundreds is not a review of the ad.
- **When a combination pairs two headlines that only make sense in sequence, split or
  rewrite them, because** the combiner does not know they were a pair.

## When NOT to use

- Do not use a stride sampler as an estimate of what the platform will actually serve.
  It enumerates combinations for review; the platform's choice is weighted by its own
  learning and is not uniform. The preview surfaces bad combinations, it does not
  predict frequent ones.
- Do not apply the three-bucket rule to descriptions. Descriptions have a wider limit,
  fewer slots and a different rendering; the spread argument is about headlines
  competing for a line.
- Do not require the spread when the set is deliberately short (three or four
  headlines for a tightly scoped brand group). There the reviewer reads every
  combination by hand and a bucket rule adds nothing.
