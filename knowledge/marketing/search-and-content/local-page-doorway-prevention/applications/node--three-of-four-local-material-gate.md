---
layer: application
type: application
subject: local-page-doorway-prevention
technique: three-of-four-local-material-gate
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# A local page generator with no material gate and no sibling check

The workspace (commit `2893314930546ed3a314a19a155bcf2f8841a0ea`, 2026-09-08) generates
service-by-area landing pages from a coverage matrix: the local module knows which
service-by-locality combinations have no page, and one click turns a gap into a
published, indexable page at `/m/{slug}`. The generator is `src/lib/ai/tools/local-page.ts`,
its grounding resolver `src/lib/local-signals/page-grounding.ts`, the renderer's
metadata branch `src/app/m/[slug]/page.tsx:43-79`, and the spec that shaped it
`docs/specs/wp-W2-C.md`. Against this subject the structural fact is precise: the
generator enforces the *proof* half of the material gate structurally and enforces
none of the *material* half, and nothing measures one area's page against another's.

## What the generator does that the standard requires

The anti-fabrication design is the strongest part and it is structural, as the
technique demands. The header comment at `local-page.ts:9-21` states it: the prompt
carries only pre-computed grounding - catalog service name, price and price model,
derived business type, brand fact block, at most two real reviews from that area quoted
verbatim - and the result type `LocalPageResult` is prose only, with nowhere to put an
invented testimonial or price. The published page renders price from the stored
payload, never from model text, and renders no review block at all. The system prompt
(`:43-54`) forbids address, phone, e-mail, hours and staff names (`:47`) because the
repository has no such data, forbids prices not in the grounding (`:48`), and permits
only verbatim quotation of supplied reviews (`:49`). `normalizeLocalPage` (`:209-221`)
builds the result field by field so a model-emitted `price` or `reviews` key is dropped
by construction (`:205-208`). The spec pins the same rule for the structured data:
"emit only what is true" and no fabricated address (`wp-W2-C.md:36-42`), and
`test-unit/microsite-local-page.test.mjs:3-7` makes the *absence* of an address key the
load-bearing assertion.

The review grounding is the one material-gate item the workspace actually enforces.
`page-grounding.ts:104-111` filters resolved reviews to those whose area matches the
requested area, keeps at most `MAX_PAGE_REVIEWS = 2` (`:39`), and only imported reviews
may be quoted (`:104`, and the header at `:7-13` on why sample reviews never reach a
public page). That is item four of the gate - a real person from there - supplied from
data or absent.

## What it does not do, and what that predicts

The prompt localizes the *place*. Its locality rule (`:51`) requires the area "in the
headline, the intro, at least one section" so the page is "about that area, not
generic", and the FAQ description (`:52`, `:148`) asks for "questions a person in this
locality really asks". Nothing supplied to the model differs by area except the area
string and, when they exist, up to two reviews. The grounding (`:81-118`) carries brand,
business type, service, area, one price line and one brand-context block - all
identical across every area of the same service. Of the gate's four items, the
generator can supply one (reviews), and only for areas that have imported reviews; it
never asks the owner for a job, a local specific or a different FAQ answer, and no
`held` state exists - the coverage matrix's gap cell offers "generate" for every
combination without condition.

The deterministic fallback makes the prediction concrete. `baseLocalPage` (`:252-304`)
is used both as the demo output and as the per-field floor for empty model fields, and
it is a token-swap template: headline `${service} ${area}` (`:295`), a section titled
"[service] in the area [area]" with a body that restates brand, service and area
(`:264-267`), a "how it works" section identical for every area (`:268-272`), and an
FAQ whose first pair is "do you provide [service] in [area]? - yes, [service] in [area]
is part of our offer" (`:283-285`). Run across ten localities, these ten pages differ
only in the area token: their containment against each other after a boilerplate strip
approaches one and their unique-shingle count approaches zero. The model path sits
above this floor but is fed the same inputs, so its output for two areas without
reviews is the same page written twice with different area names - which is what the
model was told to do at `:51`.

Two design choices compound this. The page is indexable unconditionally
(`page.tsx:52-58`, "a local landing page exists TO RANK ... so it is indexable
unconditionally"), so every generated page enters the engine's judgment immediately,
with no draft-only or noindex-until-reviewed state. And there is no similarity check
across a tenant's published local pages: `grep` for shingle, similarity, duplicate or
doorway across the generator, the grounding resolver, the microsite policy and the
gap-page action returns nothing. The `LOCAL_PAGE_LIMITS` caps (`:167-177`) bound field
*length*; nothing bounds field *sameness*.

The prediction, stated as the technique predicts it: a tenant who flips a coverage
matrix green across a service's areas will publish a set whose members are template
clones of each other, with the engine's chosen canonical converging on one of them or
most of them landing in "crawled - currently not indexed". The coverage cell will read
"has page" (`local-page.ts:7`), the page will be live, and the query will not be
ranked. Because nothing in the workspace reads the engine's per-URL verdict either, the
tenant will have no surface that says so.

## Upward lesson taken from the tree

One thing the workspace does better than the standard's usual telling: the demo and
fallback outputs carry an explicit `source: "fallback"` marker into the stored payload
(`:300-303`) so a page assembled from grounding alone is distinguishable from one a
model wrote. A material-gate implementation should carry the same kind of marker for
the gate's outcome - which items passed, which were absent - into the page's payload,
so a page that shipped on two items is auditable later without re-asking the owner.

## Deviations

The standard stands. The workspace proves that structural anti-fabrication and a
material gate are separate mechanisms: the first stops a page from lying and the
second stops it from being empty, and a generator with only the first produces honest
clones. The three missing pieces, in the order the subject would add them, are a
per-area material gate with a held state in front of the generate action, a
containment-and-unique-phrase check of the draft against the tenant's other published
pages for the same service before publish, and an inspection read of published local
pages surfaced beside the coverage cell.
