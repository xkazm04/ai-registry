---
layer: application
type: application
subject: search-intent-classification
technique: serp-count-verdict-not-tool-label
stack: prompt-pipeline
status: forged
verified_on: 2026-09-09
verified_against: prompt-pipeline@2026.09.06
---

# The intent rule of an SEO command pipeline: a count that labels itself as convention

The open SEO agent (seven slash commands plus reference specs; commit
`a47c1ecd57016568cc791d24af9d809768d8d5ab`, 2026-09-06) realises the technique as
a reference file the keyword-research command is told to treat as *the* rule, and
it is the cleanest prompt-layer statement of the standard the bundle has seen. It
confirms every step of the technique and adds one thing the draft lacked: it names
its own threshold as convention in the same sentence that states it.

## Where the rule lives

- `references/search-intent.md:9-13` - the opening section is titled with the
  law verbatim: the tool's label is a hint, the results page is the verdict. It
  says the vendors "guess intent from the words in the phrase", are "most wrong on
  exactly the keywords that matter - the expensive commercial ones", and orders
  **"Never classify from the phrase alone. Search it and count what Google
  returns."**
- `references/search-intent.md:17-41` - the count. "10 results, 6 decides it
  (our convention, not a documented standard)", then: *"Label this honestly
  whenever you cite it. The 6-of-10 threshold has no documented source anywhere
  ... Every published method uses unquantified language instead."* It quotes the
  rater guidelines' dominant / common / minor interpretations and the 2002
  paper's "no assumption ... that this intent can be inferred with any certitude
  from the query". Results are classified "by what the PAGE is, not what it is
  about", into informational / transactional / commercial-investigation; the
  verdict is `>=6` of one type, else mixed. Line 41: **"Write down what you
  counted, not just the verdict."**
- `references/search-intent.md:59-65` - the non-result evidence: ads (commercial),
  map pack (local specifically), snippet / people-also-ask (informational lean),
  shopping (transactional but paid-crowded, "say so rather than mapping a page
  that cannot rank"), video pack.
- `.claude/commands/keyword-research.md:90-100` (Cut 2) - the command binds the
  reference as law: *"Read `references/search-intent.md` - it IS the rule"*, and
  repeats the convention label inline: *"The 6-of-10 threshold is our internal
  convention, not a documented standard - never cite it as best practice."* It
  closes with the technique's step 7: *"Say in the report which keywords Semrush
  labelled wrong; it's usually a handful and it's usually the expensive ones."*
- `references/keyword-strategy.md:162-163` - the same threshold listed under
  **Myths**: "6 of 10 results decides intent is a documented method" is refuted
  with the four sources that use qualitative language only.

## Structural facts the tree proves

**The convention label is enforced twice, at two layers.** The reference states
the threshold and immediately disclaims its provenance; the command that consumes
the reference restates the disclaimer rather than trusting the reader to have
read it. That is the bundle's
[label convention as convention](../../../_laws.md#label-convention-as-convention)
law realised as prompt structure - a model following the command cannot reach the
number without passing the label - and it is stronger than the technique's own
step 5, which only asks that the label accompany the number. Upward lesson,
folded into the technique: the label sits in the sentence that states the
number, not in a footnote.

**The count is an output field, not a reasoning step.** Line 41's "write down
what you counted" plus the block format at `keyword-research.md:181-185`
(a verdict line per root) make the count a checkable artefact of the run. This
is the mechanism that makes the verdict falsifiable by the next reader, and it
is what distinguishes the pipeline's rule from a tool's label: both produce a
verdict, only one produces the observation behind it.

**Local is read off a feature, not a bucket.** The results are classified into
three page types; local intent is recognised from the map pack
(`search-intent.md:61`) and routed to "a location page and a business profile,
not just a page". So the pipeline reaches the five-bucket taxonomy of the
`local-and-comparison-as-own-intents` technique, but by two different routes -
page type for comparison, page feature for local. The standard holds; the
realisation is worth knowing because a reader who counts only page types will
miss the local verdict that the feature carries.

## Where the tree deviates

- **The search is instructed, not verified.** Nothing in the seven commands
  checks that a root's block carries a count before a page command consumes it;
  the checkers under the tree test other invariants. A model that skips the
  search and pastes the vendor label produces a block the pipeline cannot
  distinguish from a counted one. The technique's rule that an unsearched query
  has no verdict is therefore a discipline of the operator here, not of the
  pipeline.
- **The vendor is named as the fallback and as the recommended first step.**
  Cut 1's data-gathering step (`keyword-research.md:87-88`) recommends a specific
  vendor's trial with an affiliate link before the intent rule runs. The intent
  rule itself is vendor-independent; the pipeline around it is not, which is the
  boundary the bundle's purity profile draws and the reason the upper layers say
  "a keyword-data vendor".
- **One engine's results page.** The whole rule is written against one search
  engine's page. For a Czech-market business the second national engine's page
  is a second verdict the pipeline never reads; the technique's "in the target
  market" step is the bundle's addition.
