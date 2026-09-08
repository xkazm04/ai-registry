# Subject proposal: narrative-scroll-surface

**Status:** proposed and forged 2026-09-08 from `kp` @ `3394deb2`
**Bundle:** `software-engineering`
**Category:** `ui-surfaces/published-surfaces` (5 subjects before this one; the
child-directory cap in `scripts/lib/taxonomy.mjs` is 10, so a 6th needs no
renesting and none was done)
**Resolved path:** `knowledge/software-engineering/ui-surfaces/published-surfaces/narrative-scroll-surface/`
**Link depth:** identical to its sibling `lazy-section-addressability` —
`../../../_laws.md` from the subject document, `../../../../_laws.md` from
`techniques/` and `applications/`.

## Why a subject rather than a technique

`node scripts/research-map.mjs` was run for this territory before drafting and
**no subject owns it**. That claim is not repeated below without having been
checked. The four nearest neighbours were each read in full, and each owns
something else:

- **`engineering-process/codebase-stewardship/repository-landing-document`**
  owns a repository's front page as advertisement-and-router. Its reader also
  arrives undecided, which is the reason for the confusion — but its medium is
  a markdown document rendered by a code host, a package registry and a
  marketplace, each of which strips formatting differently. It cannot animate,
  cannot bind to scroll, and its reader is looking for a *route onward* rather
  than an explanation. Its `visual-text-cadence` and `caption-carrying-figures`
  are cousins of this subject's illustration rules; its mechanics are not
  transferable in either direction.
- **`ui-surfaces/published-surfaces/long-form-reading-surface`** owns
  navigating *inside* a document: the contents panel, the scroll-spy reading
  band, the fixed-chrome offset budget. Its reader already wants the content
  and needs to find a part of it. The two subjects both put an index down the
  side of a scrolling column, and the objects are not the same: there the
  index is a table of contents for a reader making a choice; here it is a
  position readout for a reader who must not be asked to make one.
- **`ui-surfaces/published-surfaces/lazy-section-addressability`** owns
  addresses that resolve before their content exists. Its relationship to this
  subject is a constraint rather than an overlap: `reveal-without-loss`
  *forbids* the deferral that subject exists to manage. A narrative surface
  that has genuinely deferred sections has acquired that subject's problem in
  addition to this one's.
- **`ui-surfaces/feedback-and-style/motion`** owns the movement vocabulary —
  gestures, engines, presets, budgets, the lifecycle of motion nobody asked
  for. It explicitly disclaims the layer above it: "The system is not the token
  layer beneath it and not the choreography semantics above it"
  (`motion.md:32-33`), routing the *when-may-it-play* question to
  `async-ui-states/arrival-choreography`. That routing covers an arrival
  cascade over data; it does not cover a page-length sequence bound to a
  reader's scroll. This subject answers the choreography question for an
  explanatory page and leaves every vocabulary decision where it is.

What none of them owns is the situation itself: **a page whose reader has no
task and no intention to read, whose content is a sequence, and whose craft
problem is being consumable without the reader ever deciding how to read it.**
That situation produces a coherent, testable set of failures — a stack of
unrelated bands, art that decorates a claim it does not evidence, animation on
a clock that is therefore always at the wrong moment, a reader handed a choice
who answers it by leaving, and content revealed on scroll that does not exist
for anyone who never scrolls. Five techniques, one reader model, one boundary
set: subject-sized.

## The evidence that motivates it

**Instrument:** `grep -ro` over `app/landing` in the source repository at
`3394deb2`, counting occurrences and files; a second pass with `grep -rl` for
the file counts. One counter for every figure below
([count-carries-predicate](../knowledge/software-engineering/_laws.md#count-carries-predicate)).
Everything else in this section is a citation, not a measurement.

| what was counted | figure |
|---|---:|
| non-test source files under the marketing tree | 63 |
| viewport-triggered reveal sites (`whileInView`) | 46, across 19 files |
| of those, inside the eight station illustrations of the one narrative page | 22 |
| files driving motion from scroll position (`useScroll`) | **1** |
| declarations of a replaying reveal (`once: false`) | 2 |
| files reading a reduced-motion hook | 25 of 63 |

The ratio is the finding. A tree that has invested heavily in motion — 46
reveal sites, a reduced-motion hook in 40% of its files, a purpose-built
external-store hook to read the preference safely — drives **one** file from
the reader's own position. The other 45 sites fire on a viewport trigger and
then run on a timer, which is the failure mode this subject names first. And
inside the single scroll-bound page, 22 of the timed sites are the station
illustrations themselves: the page's envelope is bound to the reader and the
evidence inside the envelope is not.

That is not a competence gap. The repository demonstrably knows the harder
parts — the spine's geometry is derived from the station list, the peak scale
is measured against a real gutter at three viewport widths, the rail's
labels are legible at rest because the dot-column version was tried and
rejected. What is missing is the level at which those decisions are one
decision, which is what a golden path is for.

## What the source repository confirmed

Read in full: `app/landing/spark/AboutCurve.tsx`, `SectionRail.tsx`,
`about-art/shared.ts`, `about-art/index.tsx`, `about-art/IntakeArt.tsx`,
`tokens.ts`, `useStillMotion.ts`, `sections/MobileNav.tsx`, the
`.spark-type-art` rule in `app/globals.css`, `AboutCurve.test.ts`, the
`/about` assertions in `MarketingClaims.test.ts`, `e2e/public-pages.spec.ts`,
and the art-direction exemption in `docs/design/README.md` that lets this page
use literal hexes.

Confirmed with citations in the three applications: the derived spine, the
station vocabulary as data, the total-map rule for per-station attributes, the
station triad, page-order numbering with nothing parsed back out, the
in-peak-out envelope, spring smoothing, the measured peak-collision clearance,
the legible-at-rest rail with its reserved-band geometry, the replace-not-push
history rule, scroll read as external state so the first render is correct,
and the phone-width substitution.

## Upward lessons the repository taught, folded into the standard

Five, each of which the expert draft lacked or held weakly:

1. **A hand-plotted spine desynchronizes invisibly.** The path was nine
   literal segments against seven stations; adding an eighth would have left it
   hanging, "invisible in a diff and visible only on the page". The technique
   now requires the spine's geometry to be computed from the station list.
2. **A jump replaces its history entry.** An index that pushes one per jump
   buries the page the reader arrived from — the orientation tax collected on
   the way out. This was not in the draft at all.
3. **A pinned index's reserved band is a budget the page's own content must be
   measured against**, and the collision surfaces first in the
   longest-translating language on the narrowest viewport that still shows the
   rail. The draft had the reserve-width rule; it did not have the page-content
   half.
4. **A block type-scale lift must re-state absolute values, not multiply**, or
   nested illustration blocks compound into a size nobody chose.
5. **Walk-and-return restores a latching reveal and does nothing for a
   scroll-bound one.** The repository's accessibility harness scrolls to the
   bottom and back before auditing, with the reason stated — correct for the
   viewport-triggered bands, a no-op for the scroll-bound stations on the same
   suite's first page. The technique now states the remedy per mechanism.

A sixth, folded into two techniques: **nothing may branch served markup on a
fact only the reader's device knows.** The repository's hook comment records
the incident — a hero that dropped five elements the server had written,
mismatching hydration and re-rendering the whole page "for precisely the
visitors who asked for less".

## Where the repository deviates, with the standard kept

Recorded in the applications, not softened:

- Every station's evidence animates on a clock (`ENTER`/`DRAW`, delays to
  1.05s) and replays on each re-entry, inside a correctly scroll-bound
  envelope.
- Reduced motion does not collapse the stations; the mechanism to do it exists
  in the same tree and is spent on one hero flourish.
- The reduced-motion guard's entrance check is scoped to the feature-preview
  directory, so the station art is inside no check's target.
- The served static frame is the gesture's entry state (10% opacity), so the
  text is in the document — the first obligation is met — while the printed,
  exported and unscripted renderings are ghosts.
- A rail jump moves scroll but not focus, on both the rail and the phone menu.
- The you-are-here readout is lost below the rail's breakpoint with no record
  of the decision.
- The station's numeral is absent below the medium breakpoint, surviving only
  in the eyebrow copy.
- The eyebrow copy carries its own numeral in four catalogs. This is the
  technique's stated exception rather than a plain violation: nothing reads it
  back out, and two locale-parity checks pin both the numeral and the
  separator the derived rail label depends on.

## Boundaries this subject does not absorb

- The motion vocabulary — presets, engines, easing families, taste budgets.
- Contents panels, scroll-spy definition and the fixed-chrome offset budget:
  the reading surface's, and cited as a debt rather than restated.
- Address spaces over content that has not mounted: the lazy-addressability
  subject's, and forbidden here by construction.
- The composition of a repository front page.
- Whether the claims on the page are true, and how a derived figure earns the
  right to appear — `public-claim-provenance`, in this same subcategory.

## Gate

`node scripts/gate.mjs --lane knowledge --write` regenerated the bundle index
and `--lane knowledge` re-ran clean; the taxonomy entry was added by hand under
`ui-surfaces` → `published-surfaces`.
