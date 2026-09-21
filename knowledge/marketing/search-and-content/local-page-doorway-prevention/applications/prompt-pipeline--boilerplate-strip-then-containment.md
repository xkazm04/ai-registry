---
layer: application
type: application
subject: local-page-doorway-prevention
technique: boilerplate-strip-then-containment
stack: prompt-pipeline
status: forged
verified_on: 2026-09-09
verified_against: prompt-pipeline@2026.09.06
---

# The similarity checker, the pre-build gate, and the audit that contradicts its own reference

The open SEO agent (commit `a47c1ecd57016568cc791d24af9d809768d8d5ab`, 2026-09-06) realizes
this subject across three layers of one prompt pipeline: a reference document that states
the policy history and the measurement method with provenance
(`references/doorway-pages.md`), a small Python checker that implements the measurement
(`code/check_page_similarity.py`), and two commands that consume them - `/service-page`
rule 4, which enforces the pre-build gate, and `/audit` Layer 13, which reports doorway
sets. The structural fact worth recording is that the reference and the checker agree
with the standard exactly, and the audit command does not agree with either.

## The measurement, as implemented

`code/check_page_similarity.py:35-40` declares the constants with their footing in the
module docstring (`:17-25`):

```
SHINGLE_WIDTH = 5           # 5-word windows; Broder used 10, 5 suits short web copy
BOILERPLATE_DF = 0.30       # drop shingles on >30% of pages
JACCARD_NEAR = 0.50         # Broder 1997
JACCARD_DUPE = 0.85
CONTAINMENT_CLONE = 0.80
UNIQUE_SHINGLE_FLOOR = 50   # below this, the page owns almost nothing
```

The order the technique insists on is the order the code runs. Main-content extraction
(`:47-93`) tries a dedicated extractor first and falls back to a tag-skipping parser
that drops `script`, `style`, `nav`, `header`, `footer`, `noscript`, `svg` and `form`
(`:44`). The document-frequency strip is step two (`:170-175`): a counter over every
page's shingles, `boiler` = shingles present on more than `BOILERPLATE_DF` of the set,
`clean = raw - boiler`, and the count of removed phrases is printed as its own line.
The docstring names this as "THIS is what turns 'all my pages are 95% similar' into a
real signal" (`:12-13`), which is the same claim the 2006 within-site study supports.

Step three measures both ways. `containment` (`:111-113`) is documented as
"asymmetric, and that is the point"; the pair loop (`:188-202`) computes resemblance and
both containments, takes the larger containment as `worst`, and classifies in the
technique's order: duplicate at resemblance >= 0.85, template clone at containment
>= 0.80 with the inner page named, near-duplicate at resemblance >= 0.50 as a warning.
The per-page unique-shingle floor runs before the pair loop (`:180-186`) and fails a
page that "says almost nothing its siblings don't" regardless of any pair.

Two deliberate absences match the standard. There is no word-count gate - the
docstring says so (`:24-25`) and cites the engine spokesperson - and there is no
percentage from the engine: `references/doorway-pages.md:21` records the 2022 "there is
no number" answer and `:141` names the one practitioner uniqueness figure (40-60%) as
guidance, not rule. The reference's threshold table (`:133-140`) labels each row's
provenance exactly as the technique does.

## The pre-build gate, as enforced

`references/doorway-pages.md:81-112` is the gate: the four local-material items
(`:89-92`), the 3-of-4 rule with `Status = Held` and a one-line missing-item note
(`:94`), the sibling sentence (`:96-98`), the 10-15 volume convention with the
two-hour-drive cap attributed to its practitioner source (`:102-104`), and four
structural red flags of which the last - every city page pushing to one central form -
is annotated as "the literal doorway definition, and it is the one that bites"
(`:111`). `/service-page` rule 4 (`.claude/commands/service-page.md:45`) makes reading
the reference and running the checker mandatory before any city page, and states the
hold rule as "or flag and skip the city. Never find-and-replace the city name."

The reference's policy section (`:9-56`) is where the three myths in the golden path
come from - the deleted 2015 sentence, the unsourced quotation, the spinner-folklore
80% - and it is the source of the upward lesson that the doorway policy and the
scaled-content policy are two tests with the comparison table at `:39-46`.

## The audit's inconsistency

`.claude/commands/audit.md:348-352` instructs Layer 13 to "measure how much of the body
text is identical" between sibling city pages and grades the result in three bands:

- "Above ~80% identical: doorway pages."
- "70-80%: at risk."
- "Below ~70% with genuine local specifics: fine."

This contradicts the pipeline's own reference in three ways. First, the reference says
no percentage exists (`doorway-pages.md:21`) and calls 80% spinner folklore; the audit
uses 80% as its verdict line. Second, the audit's number is "how much of the body text
is identical" - a raw overlap - with no boilerplate strip, no containment and no
unique-phrase count, while the checker's docstring says skipping the strip makes "every
number garbage" (`:10-13`). Third, the audit labels the 80% band a doorway finding and
cites "the engine's own doorway-page guidance" for it, which is the retired pre-2015
definition the reference at `:11-13` corrects; under the pipeline's own table the
finding would be scaled content, not doorway.

The audit does get the routing right: Layer 13 findings never enter the fix loop
(`:358`), consolidation needs approval under the deletion rule and "is usually the wrong
answer, because the page has a URL worth keeping and a content problem worth fixing"
(`:358`), the layer is ranked at the top of the report when it fires (`:360`), and the
report prints "the sentences that are genuinely unique" per flagged set (`:354`,
`:451`), which is the technique's most actionable output. The command also flags the
reverse case - a city in the title with no mention in the body - as "a doorway page
that has not even tried" (`:356`).

## What this proves about the standard

The pipeline is the strongest single realization of the measurement half of this
subject that the bundle was reconciled against: the method, the ordering, the
asymmetric measure, the labelled provenance and the refusal of word count are all
present in code. It also proves the standard's warning about folklore by example: a
command written in prose, in the same repository, reintroduced the 80% line that its
own reference had just refuted, because a percentage band is easier to write into an
audit than a shingle pipeline. The deviation is recorded here; the standard stays - an
audit's similarity finding is the checker's stripped containment and unique-phrase
count, labelled as convention, and never a raw-overlap percentage.

The pipeline has no realization of the inspection read. `doorway-pages.md:147-155`
describes the console's per-URL canonical and coverage fields and the quota, and
proposes the join to the similarity matrix, but no command or checker performs it; the
audit's index-hygiene layer (`audit.md:258-273`) compares site-search counts against
sitemap counts, which the inspection technique explicitly names as not a substitute.
