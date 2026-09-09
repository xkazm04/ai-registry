---
layer: application
type: application
subject: positioning-and-pricing-transparency
technique: state-support-level-not-parity
stack: react
status: forged
verified_on: 2026-09-09
verified_against: react@19
---

# Channel-support pills and present-tense proof lines on a homepage hero

The Adamant workspace at `systedo-case`, commit `2893314930546ed3a314a19a155bcf2f8841a0ea`
(2026-09-08), renders its homepage hero from
`src/components/brand/landing/LandingHero.tsx` (164 lines, extracted from the landing
composer to stay under the repo's 200-line rubric, `:1-4`). The component is the place
where the technique's two rules - a level word beside every channel name, and proof
lines that state only what is true today - are realised, and it proves the structural
fact that the level vocabulary is a typed table beside the surface rather than words
inside the copy dictionary.

## The level table

`LandingHero.tsx:12-20` declares `CHANNELS` as an array of `{ name, level: { cs, en } }`
with four entries: the dominant search engine's ad platform at "live sync", the second
national ad platform at "ad-copy checks", and two social platforms at "publishing". The
comment above it (`:12-14`) is the rule in prose: "Honest support levels: [one] is the
only live-data connector; [the second] gets ad-copy limit checks; [the social two] are
social publishing surfaces. The landing states each level rather than implying live
ingestion from all four."

The render at `:150-158` maps `CHANNELS` into pills: the channel name, then a
muted `· {c.level[locale] ?? c.level.en}` suffix. The level is therefore a property of
the channel row, localised per row, and cannot be omitted for one channel without
editing the table - which the comment guards. The strip is introduced by
`heroWorksAcross` ("Works across", `:36`, `:51`), a phrase that would read as parity
on its own; the per-pill level is what stops it.

Deviation: the levels are hand-typed in this file rather than derived from the
connector registry, so a channel could be promoted by editing a string. The technique
asks that the level never be typed apart from the capability; the tree keeps them in
one table with a prose comment, which is the weaker form. The FAQ on the same site
reads its facts from code (`LandingFaq` per the scout), so the derivation pattern
exists in the tree and has not been applied to this strip.

## Proof lines are present-tense, commitments are elsewhere

`:130-146` renders two proof lines under the calls to action, and the comment at
`:130-136` is the technique's decision rule verbatim: "only what is TRUE today: free
during validation (elevates what /cena states, no payment gateway is wired), and BYOM
across 6 vendors incl. a local runtime with no analytics SDK in the tree ... Deliberately
NOT an 'open source' or self-hosting claim - that is a commitment, and self-hosting does
not work yet." The two lines are `heroFreeLine` (`:32-33`, `:47-48`: free in full during
validation, no gateway, no surprise limits) and `heroByomLine` (`:34-35`, `:49-50`:
your models, your data, nothing calls home).

The self-hosting commitment the comment excludes from the hero lives on the pricing
page instead, in `src/components/marketing/pricing/SelfHostBand.tsx:15` and `:20`, with
a status chip that says it is not functional yet - the technique's "commitment band with
a status" rather than a proof line.

## What the tree confirms about the value case

`docs/value-case.md:21-26` writes the first claim's ships-today line "per the
channel-support pills", so the hero strip and the value case share one level
vocabulary, which is the technique's step 3. `PRODUCT.md:112-116` states the constraint
as product law: "Channel support is tiered and must be stated, never implied ... Public
copy states each level explicitly." The value case's honest caveat (`:66-75`) adds the
sales-safety rule the hero cannot express: the second-platform pill is not to be
"load-bearing in sales conversations" until the client's RPC method set is verified
against a live account, so the pill states a level the code supports (limit checks)
while the deeper capability stays unclaimed.
