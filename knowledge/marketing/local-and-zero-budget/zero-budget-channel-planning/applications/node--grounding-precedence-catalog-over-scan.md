---
layer: application
type: application
subject: zero-budget-channel-planning
technique: grounding-precedence-catalog-over-scan
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# Grounding precedence, catalog over scan - one pure builder and the placeholder incident

The Czech-first adtech workspace (`systedo-case`, commit
`2893314930546ed3a314a19a155bcf2f8841a0ea`, 2026-09-08) assembles everything the
free-channel plan may know about a business in one framework-free module,
`src/lib/organic-channels/grounding.ts`. The tree confirms the technique
structurally: precedence is a property of one function both server pages call,
the sample and placeholder refusals are code rather than prompt instructions, and
the file's own comments carry the incident that made the placeholder rule
necessary.

## One builder, two callers

`kanalyGroundingInput` (`grounding.ts:117-131`) turns a page's raw reads - catalog
rows, localities, the competitor read, the applied scan profile and a
`catalogIsSample` flag - into the pure builder's input. The comment at `:103-107`
records why it exists: the composition "used to live inline" in the channels page
and was "already duplicated (minus the competitor leg)" inside the visibility-plan
resolver, and "two copies of 'what may ground the plan' is exactly the shape that
lets two pages describe the same project differently". The competitor leg is
optional on the input type (`:89-93`) so a caller that only needs the seeded plan
can skip the read "without changing a single channel or a single word".

## Scalars win outright, lists top up

`buildKanalyGrounding` (`grounding.ts:187-256`) is the precedence. The offering is
a scalar: `catalogOffering || profileOffering` (`:214-216`), the catalog's first
four categories joined, and the scan's offering "consulted ONLY when the catalog
has no categories at all". Keywords are a list: every catalog offering name first,
deduped exactly as before, then scan keywords the catalog does not already name,
up to the shared cap of eight (`:222-231`, `MAX_KEYWORDS` at `:138`). Summary and
audience are profile-only (`:234-235`) because "the catalog has no equivalent, so
there is nothing to lose to". The wire bounds at `:134-138` mirror the request
validator so nothing assembled here is truncated on the way to the prompt, and
`buildChannelResearchPrompt` (`src/lib/ai/tools/channel-research.ts:100-124`)
emits each context line only when present, so a catalog-first tenant's prompt is
unchanged by the arrival of scan fields.

## What grounds nothing - and the 2026-08-29 incident

Two refusals sit at `:204-209`. `catalogIsSample` empties both the categories and
the offering names before anything else runs; the comment at `:190-201` states
the rule and the measurement behind it: "the 2026-08-29 L2 run measured a leadgen
tenant told to 'Vytvořit článek na téma Ukázková služba A' (the seed's own
placeholder service name), and an app tenant whose applied website scan was
overruled by the seed's 'Předplatné / Free / Pro / Team'". The seeded plan's
`{category}` fill is "deliberately untouched" because that plan is labelled a
sample on screen while the prompt is not - the technique's disclosed-versus-
asserted split, in the tree's own words.

The second refusal is `isPlaceholderValue` (`:161-174`). The starter rows a new
project is given are *saved*, so `catalogIsSample` is false for them, and yet
`:149-152` records the same incident from the other side: the leadgen tenant's
plan told him "to describe his listing with 'Ukázková služba A a Ukázková služba
B'". The test is a leading marker regex - `ukázkov`, `vzorov`, `sample`, `demo`,
`example`, `placeholder` - Unicode-aware because an ASCII word boundary "silently
fails to match" after a diacritic (`:158-160`), plus a whole-string set of stand-in
category names (`:171`). The comment at `:167-170` refuses to extend it to
"Předplatné" and "Služby" because those are ordinary Czech category words "a real
tenant may have meant, and grounding is not the place to guess", and names the
gap as the reason starter rows should carry `source: "starter"` provenance
instead of a longer denylist. Both halves of the technique's decision rule are
therefore present: narrow marker, exact category, no guessing.

## Unconfirmed competitors and the unavailable-versus-none split

`kanalyGroundingInput` reads competitors through `curatedCompetitors` (`:119`),
which drops the scan's unconfirmed entries; `:110-113` says grounding "is handed
to the model as fact; asserting a guess as one of the tenant's rivals would route
around the confirm gate the apply route deliberately put there". The apply side
is `seedCompetitors` in `src/lib/onboarding/apply.ts:53-72`, which merges
suggestions and "never replace[s]". The header at `grounding.ts:23-29` also
excludes `toneOfVoice` as belonging to the voice module.

`competitorsGrounding` (`src/lib/organic-channels/types.ts:169-175`) returns
`"unavailable"` on a failed read and `"none"` on an empty curated set, and
`:162-166` explains the reason the technique gives: a failed read "silently
un-grounds regeneration, and the tenant deserves to know before they overwrite a
grounded plan with an un-grounded one". The builder carries it as
`competitorsUnavailable` (`grounding.ts:126-127`, `:241`).

## What the tree does not do

The placeholder rule is a denylist rather than provenance on the starter rows,
and the file says so. The precedence is byte-identical for a catalog-first tenant
by test, but the tests were not re-run for this reconciliation; the claim rests on
the module's comments and code paths as read.
