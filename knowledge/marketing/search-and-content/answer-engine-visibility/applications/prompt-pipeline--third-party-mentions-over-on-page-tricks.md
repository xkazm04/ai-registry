---
layer: application
type: application
subject: answer-engine-visibility
technique: third-party-mentions-over-on-page-tricks
stack: prompt-pipeline
status: forged
verified_on: 2026-09-09
verified_against: prompt-pipeline@2026.09.06
---

# A 38-check GEO spec that carries its own refutation

The open SEO agent (commit `a47c1ecd57016568cc791d24af9d809768d8d5ab`, 2026-09-06)
encodes answer-engine visibility as `references/geo.md`: 38 checks in 8 groups,
graded by `/audit` (`.claude/commands/audit.md:241`) and serialized into the
report card in the same wording and order (`audit.md:540` - "never invented or
dropped"). The spec is the closest thing in the pipeline to this technique, and
it proves the technique's ordering while contradicting it in one check that the
pipeline's own sibling file refutes.

## Confirmed: the spend order and the "do not bother" list

Groups 1 through 8 run in almost exactly the order the technique prescribes.
Group 1 (`geo.md:22-30`) is the preconditions: crawlers allowed by name (`:24`),
the CDN bot toggle as "a common accidental kill switch - verify with the actual
crawl logs or a user-agent fetch test" (`:25`), content that renders without
JavaScript (`:27`), real headings and tables (`:29`). Groups 2-3 (`:31-47`) are
the passage craft: the 40-60 word answer under every question-style H2 (`:33`),
tables, sourced statistics and an attributed quote (`:42-44`). Group 6
(`:64-69`) is original data - "your prices, your job counts, your before/afters
from proof-inventory" (`:66`). Group 7 (`:71-76`) is the mention graph, and it
states the technique's central number verbatim: "mention frequency correlates
about 0.664 with AI citation rates, roughly 3 times stronger than backlinks at
0.218" (`:73`), with the roundup-listicle route (`:75`) and the low cross-engine
overlap, "only about 11 percent of domains cited by [one engine] are also cited
by [another]" (`:76`). Group 7 is also the only group the file tells the grader
to "report as opportunities" rather than pass/fail (`:71`) - the technique's
rule that mentions are findings with a source, never a score.

The "Do not bother with these" section (`:86-94`) is the technique's null
list, item for item: keyword stuffing for AI (`:88`), the manifest file as a
strategy - "8 of 9 measured sites saw zero traffic change" (`:90`), recency
stunts - "the median cited page is 14 months old" (`:92`), and blocking crawlers
(`:94`). The manifest-file check itself (`:28`) is written the way the technique
asks: "honest label: about 10 percent adoption and NO major AI lab has committed
to reading it in production ... ship it, expect nothing from it." The
`website/public/llms.txt` template the pipeline ships is a 25-line
fill-in-the-blanks file with no claim attached to it.

## Deviation: schema sold as a 2.3x lever, refuted two files away

Group 4 (`geo.md:49-55`) grades five markup checks, and its first line carries
the claim the technique names as the field's most reproduced error: "schema-
marked pages are cited about 2.3 times more often" (`:51`). That is the
correlation figure - the vendor's cross-sectional count over millions of URLs.
The same pipeline's `references/blog-post-retention.md:155-156` carries the
controlled result from the same vendor, headed "[E, negative result]": 1,885
pages adding JSON-LD against about 4,000 controls, "no meaningful citation
growth, and a 4.6% decline in AI Overviews. Keep schema for classic SEO. Do not
sell it as an AI lever." And `references/hub-spoke-pages.md:102` says it a third
time: "Schema barely moves AI citations (measured null: -4.6% to +2.4% across
1,885 pages) - schema is for rich results and eligibility, not a GEO lever."

So the pipeline holds both numbers and grades on the wrong one. `geo.md:6`
declares itself the winner of any disagreement on an AI check ("this file wins
and on-page-seo.md gets updated to match"), which means the report card the
client sees scores markup as an AI lever while two reference files the grader
never consults say it is null. The structural fact: a precedence rule between
reference files resolves conflicts in favour of the file that was written from
the vendor summary rather than the controlled test. The standard stays - markup
is graded for rich-result eligibility and entity resolution, in a group that does
not claim a citation multiplier - and the 2.3x line is the one check of 38 an
adopter should rewrite before grading a client against it.

## Deviation: multipliers by source class

The technique requires every quoted lift to carry its source class. The spec
attaches a "Sources behind the numbers" list (`geo.md:98-109`) - ten links, nine
of them vendor or agency blog posts, one of them a study of 1,000 AI Overviews
- and quotes percentages in the check text without saying which source or which
sample produced each: "about 25 percent more AI citations" (`:42`), "about 26
percent" and "about 25 percent" (`:43`), "about a 28 percent lift" (`:44`),
"63 percent of all LLM citations point to listicle-style pages" (`:45`),
"6.7 citations against 2.1" (`:26`), "44.2 percent of all LLM citations are
extracted from the first 30 percent" (`:34`). The one controlled experiment in
the field - the 2023 academic GEO paper - appears only in the sibling file
(`blog-post-retention.md:152-153`, "+40% visibility"), not in the spec that
grades pages. An adopter labelling by class would mark `:42-45` as vendor
correlations on unstated samples, `:73` as a 75,000-brand vendor correlation,
`:26` as a vendor measurement, and only the sibling file's +40% as controlled.

## Upward lesson taken into the technique

`geo.md:16-18` records that the business-profile Q&A feature was removed on 3
November 2025 and replaced by a live answering feature that extracts from the
website, reviews and profile fields, with the practical rule "write answers as
plain, complete sentences ... a bullet fragment with no context is unusable to
it." The draft of this subject had treated the FAQ block as an on-page
concern; the pipeline's dated incident made it a precondition of the listing
surface too, and the answer-block technique now carries the complete-sentence
rule as step 6.
