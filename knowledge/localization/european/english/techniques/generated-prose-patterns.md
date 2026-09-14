---
layer: technique
type: technique
subject: english
technique: generated-prose-patterns
status: forged
laws: [every-finding-cites-an-anchor, clean-strings-stay-untouched]
shared_with: []
use_when: [reviewing model-drafted English copy before it ships, writing review rules for generated marketing or UI text, deciding whether a flagged word is a real finding]
---

# Generated-prose patterns

**Framing law, before any rule.** A finding names a text property and a span. It never says
"AI-written", never rests on a detector score, and never rests on a model's verdict that a text
"sounds generated". Every pattern below is one a human editor would cut whoever produced it,
which is the only defensible basis for the rules and makes them apply equally to a tired human.

The evidence is real and narrower than the folklore. Instruction-tuned models overuse
sentence-final participial clauses (about 5.3 times the human rate), nominalizations (2.1) and
phrasal coordination (1.9), while base models sit near human rates (Reinhart et al. 2025).
Flagged vocabulary spikes, then falls once publicised while synonyms take over (Kobak et al. 2025
and monthly update; Geng & Trotta 2025). Generated essays carry about twice the triads, yet "not
X but Y" was *not* significantly overused in the same corpus (a 2026 preprint). Human span
precision on "slop" is 0.65-0.80, organized around relevance, density and tone, and model judges
agree with humans at about chance (Shaib et al. 2025). A crowd-maintained encyclopedia's field
guide to generated text is descriptive: it lists signs of a problem, not the problem.

## EN-DETECTOR · Cite the rule, never the detector or a model verdict

> **Trigger** — a finding based on a detector score, "sounds AI-generated", or an unanchored
> model judgment.
> **Rule** — restate it as an EN rule with a quoted span and a minimal replacement, or drop it.
> **Source** — Liang et al. 2023 (detectors flag non-native writing); Shaib et al. 2025;
> [every finding cites an anchor](../../../_laws.md#every-finding-cites-an-anchor).

✗ *Hero reads as AI-written (detector 87%).* → ✓ *EN-PUFFERY · "seamless platform" · no fact.*

## EN-ARTIFACT · Strip generation artifacts and chat residue

> **Trigger** — citation markup tokens, *Certainly! Here's*, *I hope this helps*, cutoff
> disclaimers, bracketed placeholders (*[Company Name]*).
> **Rule** — remove. Zero tolerance: the one pattern that is a defect in every context.

✗ *Certainly! Here's a tagline for [Company Name]:* → ✓ the tagline alone.

## EN-PUFFERY · Apply the swap test to category adjectives

> **Trigger** — *seamless*, *robust*, *cutting-edge*, *game-changer*, *unlock*, *elevate*,
> *empower*, *transform*, *revolutionize*, *powerful*, *next-level*, with no fact in the sentence.
> **Rule** — if the sentence stays true for any product in the category, replace it with the
> specific, checkable fact, or cut it. A density rule, not a ban.
> **Source** — concrete wording outperforms vague (Packard & Berger 2021).
> **Exceptions** — technical senses (*robust estimator*); literal senses (*unlock* for access
> behind sign-in); a word immediately backed by its proof, where cutting it is a minor edit.

✗ *A powerful, seamless way to transform your workflow.* → ✓ *Imports spreadsheets and flags
duplicates before you send.*

## EN-SYNONYM-SWAP · Reject a fix that renames the empty claim

> **Trigger** — a fix that replaces a flagged word with its synonym (*delve* → *dive into*,
> *leverage* → *harness*, *crucial* → *vital*).
> **Rule** — reject it; remove the claim or supply the fact (Kobak et al. 2025; Geng & Trotta 2025).

✗ *Harness the vital power of data* → ✓ *See which campaigns lost money last week.*

## EN-SIGNIFICANCE · Show the consequence instead of narrating importance

> **Trigger** — *plays a crucial role*, *is a testament to*, *underscores the importance of*,
> *marks a shift*.
> **Rule** — state what happens because of the thing, or cut the sentence.

✗ *Security plays a crucial role in our platform.* → ✓ *Every export is encrypted and expires in
24 hours.*

## EN-PARTICIPLE-TAIL · Cut sentence-final participial tails that comment

> **Trigger** — *, ensuring…*, *, highlighting…*, *, making it easier to…* ending a sentence.
> **Rule** — cut the tail; if its content matters, give it a sentence with a subject. The most
> overused structure in instruction-tuned output (Reinhart et al. 2025).
> **Exceptions** — a real sequence of actions (*Select the file, holding Shift to add more*).

✗ *Reports update hourly, ensuring you always have the latest insights.* → ✓ *Reports update
every hour.*

## EN-COPULA · Say "is" and "has" when you mean them

> **Trigger** — *serves as*, *stands as*, *boasts*, *features* as an ornamental *is* or *has*.
> **Rule** — use *is* or *has*. Source: the field guide's list, recorded from one research lane.
> **Exceptions** — the literal sense (*the page features three case studies*, describing layout).

✗ *The dashboard serves as a central hub and boasts 12 charts.* → ✓ *The dashboard has 12 charts.*

## EN-VAGUE-ATTRIBUTION · Name the source or cut the attribution

> **Trigger** — *experts agree*, *studies show*, *trusted by leading teams*, with no name.
> **Rule** — flag the wording: name the source, or cut. Which sources count as proof is a
> marketing concern, not this rule's.

✗ *Studies show teams save hours.* → ✓ *In our 2025 survey of 212 customers, teams saved 3 hours
a week.*

## EN-INCOMPLETE-COMPARISON · State the baseline

> **Trigger** — *significantly faster*, *up to 10x better*, *more secure*, with no comparator.
> **Rule** — name what it is compared with, and the measure.

✗ *Up to 10x faster reporting.* → ✓ *Reports that took 20 minutes in spreadsheets take 2.*

## EN-TRIAD · List three only when there are three

> **Trigger** — a triad whose weakest item can go without losing information; more than one
> triad per section.
> **Rule** — keep the real items; warning level, confirmed by a reviewer.
> **Exceptions** — real three-part content; established slogans.

✗ *Fast, reliable and efficient sync.* → ✓ *Sync that finishes in under a minute.*

## EN-FALSE-CONTRAST · Drop "not X, but Y" when nobody believes X

> **Trigger** — *not X, but Y*; *it's not just X, it's Y*.
> **Rule** — a strawman test, not a ban: cut the negated half when this audience does not hold X;
> keep it when it corrects a misconception the audience demonstrably holds. The evidence is
> contested: widely cited as a tell, not significantly overused in a measured corpus.

✗ *It's not just a CRM, it's a growth engine.* → ✓ *A CRM that drafts your follow-up emails.*

## EN-OPENER · Open with the reader's fact, not the era

> **Trigger** — *In today's fast-paced world*, *In the ever-evolving landscape*, *Imagine a world
> where*.
> **Rule** — open with the reader's problem or the product's fact.

✗ *In today's fast-paced world, invoicing is harder than ever.* → ✓ *Late invoices cost agencies
cash every month.*

## EN-CLOSER · Cut closers that restate; end on the next step

> **Trigger** — *In conclusion*, *Ultimately, X is more than a tool*, a final paragraph repeating
> the page.
> **Rule** — end with the next step or the last new fact.

✗ *Ultimately, it's more than software. It's a partner.* → ✓ *Start a free trial. No card needed.*

## EN-WHETHER · Turn "Whether you're X or Y" into real paths, or delete it

> **Trigger** — *Whether you're a startup or an enterprise…*
> **Rule** — give X and Y distinct content, or delete the frame (practitioner review convention).

✗ *Whether you're a freelancer or a team, we've got you covered.* → ✓ *Freelancers: one seat,
free. Teams: shared inboxes and roles.*

## EN-TEMPLATED-GRID · Feature cards must not be interchangeable

> **Trigger** — three or more cards with one template and length whose titles could swap.
> **Rule** — give each card a mechanism, a number or an example. Keep labels grammatically parallel
> (EN-LIST-PARALLEL): parallel form, distinct content.
> **Exceptions** — specification and pricing tables.

✗ *Fast · Get results quickly.* / *Secure · Keep data safe.* → ✓ *Fast · 100,000 rows in under a
minute.* / *Secure · Data stays in the EU.*

## EN-BOLD-LEAD · A bold bullet label must add a term

> **Trigger** — a bold label that restates its sentence (*Speed: fast performance…*).
> **Rule** — make the label a term the sentence does not say, or drop the label.
> **Exceptions** — glossaries and definition lists.

✗ ***Speed:** Fast performance for your team.* → ✓ ***Bulk import:** 100,000 rows in a minute.*

## EN-EMOJI-BULLET · No emoji as list markers or heading ornaments

> **Trigger** — emoji used as bullets or before headings on product and marketing pages.
> **Rule** — remove; use real list markup and plain headings.
> **Exceptions** — a declared social or community voice.

## EN-STACCATO · At most one fragment run per page

> **Trigger** — a run of short fragments for rhythm (*No setup. No config. No hassle.*).
> **Rule** — allow one per page; rewrite the rest as sentences.

✗ a second run on the page → ✓ *Nothing to install: connect your account and go.*

**Explicitly not tells.** A single em dash; a real three-item list; curly quotes (correct web
typography); title case (a consistency question, EN-CASE); *Additionally* in long-form prose; any
single vocabulary word out of context.

## Using the set

Walk the rules as binary questions against the draft, each yes citing a span. EN-ARTIFACT blocks;
EN-PUFFERY, EN-PARTICIPLE-TAIL and EN-SIGNIFICANCE are warnings a reviewer confirms; EN-TRIAD,
EN-FALSE-CONTRAST and EN-STACCATO are density judgments. Nominalizations are cited as EN-NOUN-PILE,
which lives with the translationese rules. Repair only flagged spans, once, and check each repair
against EN-SYNONYM-SWAP; a string that was clean stays as it was
([clean strings stay untouched](../../../_laws.md#clean-strings-stay-untouched)).

When NOT to apply: quotes and testimonials; established slogans; long-form editorial prose, where
connectors and varied rhythm are ordinary style; any word-list hit whose rule-level exception
holds. Never report a pattern count as evidence of authorship.
