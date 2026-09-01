# Subject proposal: repository-landing-document

**Status:** proposed by `/intake` on 2026-09-01 from `github:glukicov/slideops` @ `66af7de`
**Bundle:** `software-engineering`
**Category:** `engineering-process/codebase-stewardship` (flat subcategory, 7 subjects; an
8th is legal and no nesting change is required)
**Resolved path:** `knowledge/software-engineering/engineering-process/codebase-stewardship/repository-landing-document/`
**Link depth:** identical to its sibling `docs-sync` - `../../../_laws.md` from the subject
document, `../../../../_laws.md` from `techniques/`.

## Why a subject rather than a technique

The corpus has never heard of this. `research-map` returns no prior art for `readme`, and
the four nearest neighbours each own a different artifact:

- `ui-surfaces/published-surfaces/docs-content-model` - a documentation *site*, react stack,
  with a catalog and per-topic freshness. A README is not a site and has no catalog.
- `codebase-stewardship/docs-sync` - the *freshness* of prose against source. It owns rot;
  it does not own form.
- `codebase-stewardship/machine-authored-documentation` - acceptance of a document a model
  wrote. A landing document is hand-authored and its problem is composition, not truth.
- `integration/markdown-vault` - markdown as a database. A README is markdown as a shopfront.

What none of them owns is the question every repository answers badly: **a single document
that is simultaneously an advertisement, a router, an install guide and a proof of life,
read on three surfaces (a code host, a package registry, a plugin marketplace) by readers
with incompatible goals, in under sixty seconds.** That is a composition problem with its
own constraints and its own measurable failures, and it is subject-sized.

## The measurement that motivates it

Surveyed 2026-09-01 across the seven projects `loadFleet()` resolves on this machine,
against the source repository:

All figures below come from **one instrument** (`scripts/check-readmes.mjs`, written in
this run), run over the fleet and over the source repository on the same counter - two
numbers from two counters would not be a comparison
([count-carries-predicate](../knowledge/software-engineering/_laws.md#count-carries-predicate)).
`figs` counts figures only: a badge image is a badge, not a figure, and an earlier
hand-count of this same fleet got one project wrong by exactly that confusion.

| repo | words | figs | captioned | badges | w/ evidence | callouts | routed pages | longest prose run |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| grant | 3,444 | 0 | 0 | 0 | 0 | 0 | 0 | 16 |
| personas | 2,612 | 0 | 0 | 7 | 4 | 0 | 0 | 12 |
| gravity | 2,089 | 0 | 0 | 0 | 0 | 0 | 0 | 39 |
| tracklight | 1,633 | 0 | 0 | 0 | 0 | 0 | 0 | 17 |
| pumper | 1,064 | 0 | 0 | 0 | 0 | 0 | 0 | 16 |
| politicas | 804 | 0 | 0 | 0 | 0 | 0 | 0 | 10 |
| goat | - | - | - | - | - | - | - | **no README** |
| *source repo* | *1,033* | *3* | *3* | *7* | *4* | *5* | *4* | *10* |

**Seven of seven fleet projects carry zero figures, zero captions, zero reader-directed
callouts and zero routing.** One has no landing document at all. The longest is more than
three times the source repository's length while routing nothing onward - it is a manual
living in the shopfront. The gap is not stylistic taste; it is that nobody has written
down what the document is *for*, so each one grew until its author stopped.

The source repository is a useful reference and **not a model to copy wholesale**: on the
one rule already implemented in the checker it fails too, with 3 of its 7 badges linking
to targets that cannot go red. Argue the rules; do not canonise the exemplar.

## Proposed techniques

Each must carry a decision rule, not a preference. Slugs are proposals; the drafter may
rename, merge or split with an argument.

1. **`landing-document-as-router`** - the document's job is to get each reader to the page
   that answers them, not to answer them. Decision rule: a section moves out to `docs/`
   and gains a routing-table row when it answers a question only *some* readers have, or
   when it exceeds the budget the drafter sets. The routing table's cells must enumerate
   the target's actual contents ("citations, the status table, the cost model, the accuracy
   contract") - a cell that says "more information" routes nobody. The source repository
   holds 1,058 words in the README and 2,470 in the four pages it routes to, which is the
   ratio worth arguing about rather than adopting.

2. **`input-channel-typography`** - a reader must be able to tell, without reading, whether
   a block is something they type at a shell, something they say to an agent, or something
   they only read. Markdown renders all three identically by default. The source repository
   claims the code fence for the shell and a host alert block (carrying a heading line and a
   single speech emoji) for agent speech, and varies the alert type by intent. Decision rule:
   one visual channel per input destination, never shared, and never a channel that means
   nothing. **Open question the drafter must decide, not discover:** alert blocks do not
   render on most package registries and mirrors, where they degrade to plain blockquotes -
   so is a channel that collapses off-host admissible, and what carries the distinction when
   it collapses?

3. **`evidence-linked-badges`** - a badge is a claim in the smallest available typeface, and
   most badge rows are decoration that survives the claim going false. Decision rule: every
   badge links to the artifact that would go red if the claim stopped holding - a
   zero-dependencies badge links to the workflow that proves it, not to a homepage - and a
   badge whose link target cannot fail is deleted. Relates to
   `ui-surfaces/published-surfaces/public-claim-provenance`; state the boundary in prose
   (that subject governs claims rendered by an application, this one governs claims rendered
   by a repository host) and do not link across bundles.

4. **`caption-carrying-figures`** - markdown has no figure caption, so an unaided image
   forces the reader to guess what they are looking at and what is different about it. Two
   idioms exist and both should be named: a centered italic block immediately beneath the
   image, and a two-row centered table when two images must be compared (images in row one,
   captions in row two). Decision rule: every figure's caption states what the reader should
   notice, and for a comparison, what differs between the panels.

5. **`visual-text-cadence`** - the balance rule the operator asked for, stated so it can be
   checked rather than admired. What must the first screen contain; how long may prose run
   before something non-prose breaks it; which breaks count (figure, table, callout, fence)
   and which are noise. The decision rule must be countable, because technique 6 has to
   enforce it.

6. **`house-voice-with-its-grep`** - a style rule that ships without the command that finds
   its violations is advice, and advice loses to the next contributor in a hurry. The source
   repository states each rule beside its detector (a grep for a banned dash character, and a
   colour-literal regex with a stated carve-out for verbatim quoted code). Decision rule: a
   rule enters the house style only if a violation of it can be found by a command a reviewer
   can run, and the carve-outs are part of the rule rather than exceptions granted at review.

## Boundaries this subject must NOT absorb

- **The rot of the landing document's imagery.** A generated hero image is a coupled
  surface with its own freshness problem, and this run lands that separately as
  `docs-sync/rendered-surface-coupling`. This subject owns *whether a figure earns its
  place*; `docs-sync` owns *whether it is still true*. Say so once, in prose, and stop.
- **Documentation-site content models** (`docs-content-model`) - catalogs, draft gating,
  per-topic metadata. A README has none of these.
- **Whether the prose is true** (`docs-sync`) and **whether a model wrote it**
  (`machine-authored-documentation`).
- **Release notes and changelogs.** Adjacent, differently shaped, not here.

## Open questions the drafter decides

1. Does the router budget hold across repository kinds? A library, an application, a plugin
   and a monorepo have different reader populations, and a single word budget across all
   four is probably the weakest thing in this spec.
2. What is the landing document's obligation on surfaces that strip its formatting - a
   package registry page, a plugin marketplace card, a search result? The source repository
   ships a separately rendered social-preview image for exactly this and never says why.
3. Is "no README" (one of seven fleet projects) a violation of this subject or outside it?

## Primaries available to the drafter

Corroboration for this subject is corpus-internal and repository-internal; the source is a
first-party practitioner codebase and the fleet survey above is a real measurement on real
trees. Spend the web budget only on question 2, where the renderers' actual behaviour is a
fact nobody in this run has verified.

## Override licence

This spec is an argument, not an instruction. If the neighbours' stated scopes contradict a
placement here, or a proposed technique collapses into an existing one on reading it, say so
in the report with the reasoning and do the better thing.
