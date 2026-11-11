---
domain: software-engineering
subject: page-load-pipeline
last_touched: 2026-11-11
touched_by: harvest
dry_streak: 0
---

# page-load-pipeline

First touch: forged 2026-09-24 from the XL spec
[`librarian/specs/2026-09-24-page-load-pipeline.md`](../../specs/2026-09-24-page-load-pipeline.md),
surfaced by [[2026-09-24-how-modern-browsers-work]] and picked by the operator.
8 techniques, 2 applications (personas-web, ascent).

## State

Every technique was hardened against primary documents: the browser vendor's
performance documentation (9 fetches) and the HTML specification's scripting
section. The spec was overridden four times on primary evidence (see the spec's
execution record). The category `client-architecture` is full at 10 subjects. The
next subject there needs a subdivision (E2).

## Fleet seams named at forge time (the distribution plan starts here)

- personas-web: a render-blocking foreign font stylesheet on every route; no
  real-visit measurement; routes without a budget entry pass the byte gate; two
  placeholders for one lazily mounted slot; the landing's hero heading served
  inside an `opacity:0` wrapper (found by the /illustrate run the same day).
- ascent: a logo marked high priority on every route; placeholder ratios written
  apart from their composition constants.

## 2026-10-31 - intake apply: navigation-reuse (run intake-apply-navreuse-1031)

First application of `navigation-reuse`, on personas-web (`next`), mode `code`, verdict
`better`, pushed. The eligibility half held on every route measured (12 public, 8 demo
dashboard). The lifecycle half did not: the page-view counter never saw a restored return.
Application: `applications/next--navigation-reuse.md`. Two instrument facts for the next
probe of this subject. The browser test runner's default headless shell refuses every
restoration with its reasons masked, so prove a plain-page control restores before reading
any route. Chrome 156 restored a no-store control page, so the technique's no-store line is
engine- and version-dependent (recorded as a dated fact in the application, not as a
technique edit). The scan's "single stack (next)" point cannot be moved by an apply pass:
every fleet web document is `next`, and the only other web stack is a desktop webview, which
the technique's own exclusion covers.

## 2026-11-11 - /harvest backlog 8-017 ([[2026-09-04-fluxer]], /shift filler)

Amendment to `font-loading-discipline`, better, blind-ab, plus a clause in the golden
path's font section: the Han face is picked by the text's own language tag, falling back
to the document's, never by the interface locale or a one-region-first stack, because a
character range cannot tell the regional faces apart. A decision rule and a test line
came with it. The unit's other half - choose script families from the content, not the
interface locale - tied: both arms reached it unprompted, and the technique already
subsets to the content. Nothing of that half landed.

Probe from a fleet desktop app's real font loader (families injected by UI language, one
regional Han face per UI language; the UI now ships in one language while content
arrives in any). Arm A
technique plus draft, arm B technique as it stands, 2 runs each, no tools, target and
floor written first, one blind judge per probe with a planted reference and bad answer.
Target (A minus B on content-not-locale plus Han, of 8) >= 2: A 8, B 5, met by 3, all of
it on the Han criterion (A 2+2, B 0+1). Floor (a static site whose pages are each
authored in one language must keep its per-page choice): 4 of 4 in both arms. Controls
held. Weakest point: two runs per arm, and one judge point decides between a margin of
2 and 3. Not applied: the fleet loader is the seam the probe came from and was not
changed (build width 0). Return: the first fleet surface that renders authored-elsewhere
Han text with a bundled face.
