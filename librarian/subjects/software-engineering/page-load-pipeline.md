---
domain: software-engineering
subject: page-load-pipeline
last_touched: 2026-09-24
touched_by: forge
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
