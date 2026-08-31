---
layer: application
type: application
subject: async-ui-states
technique: windowing-vs-identifying-keys
stack: react
verified_on: 2026-08-31
verified_against: react@19
applied: experiment
ab_verdict: unmeasurable
proof: structural-only
---

# React application — one params bag, both axes

A read-only census over a managed React tree looking for the shape the
technique predicts: a compound query key whose components span both classes,
with no declared classification and therefore five subsystems deciding
separately.

## The census, and what it cost to trust it

The instrument walks every `.ts`/`.tsx` file that mentions a query key,
extracts each object literal's depth-one keys, and reports the literals
carrying **both** a windowing-named field and an identifying-named field. It
asserts its own parse against a fixture before printing anything, and that
assertion **fired on the first run and refused to print**: `a: b || undefined`
was yielding `undefined` as a key, because the extractor had no notion of
value position. Two projects, 5,998 files, 380 multi-key object literals
examined.

Result: **two candidates in one project, zero in the other.** One candidate
survived hand-verification; the other was an options-destructuring pattern,
not a key — a reminder that the census locates and the reader concludes.

## The confirmed seam

One `useMemo` builds a single params object and hands it whole to the key
factory and to the fetch function. Its seven fields split cleanly:

| Class | Fields |
| --- | --- |
| identifying | category, subcategory, search term |
| windowing | sort field, sort direction, page, page size |

Nothing in the code marks the split. Against the technique's five consumers,
measured on this seam:

- **Previous content** — no retention mechanism of any kind on this query: no
  previous-data placeholder, no deferral of a windowing coordinate. Every key
  change, on either axis, leaves the region with no data.
- **The rendering** — a twenty-cell skeleton grid is mutually exclusive with
  the items area, keyed on a loading flag. So a *sort* change blanks the grid
  exactly as a *new search* does: the forbidden `SETTLED-DATA -> LOADING` edge,
  taken on the windowing axis.
- **Dependent coordinates** — the search-term setter is exported as the raw
  state setter and **does not reset the page**. The identifying axis moves and
  the windowing coordinate stays where it was; page five of a brand-new
  search is reachable. The reverse direction is correct — the page setters
  touch only the page — so the tree has the one-directional rule exactly
  backwards on the half that matters.
- **Region coupling** — the surface's loading flag is the disjunction of two
  regions' flags, so an items-axis change also blanks the neighbouring region.
  That is the golden path's per-region rule, failing here as a consequence of
  the same undeclared classification.
- **Choreography seen-set** — not present on this surface; nothing to check.

## Why the verdict is `unmeasurable` and not `better`

The structural prediction is confirmed, and the behavioural one is not
testable in this tree today. Pagination is **off by default and no caller
enables it**, so the page coordinate is `undefined` in the key; and the sort
setters exist in the filter context's type but no shipped control was found
calling them. Both windowing coordinates are therefore present in the key and
currently unreachable from the UI. No gate or metric here can see a difference
that no user can trigger.

**The instrument that would make it measurable**, as the vocabulary requires:
a rendering test that mounts the surface, changes one windowing coordinate,
and asserts the content region is not replaced — plus its twin on the
identifying axis asserting that it *is*. That is a few lines against the
existing surface, and nothing in the fleet has it.

## The structural fact nobody designed

The mixed-axis key was built **before any control could exercise it**. The
page and sort coordinates were placed in the key, the fetch, and the memo's
dependency list at the time the surface was written; the controls that would
change them were not wired. So this is not a defect introduced by a later
edit under time pressure — it is the default shape that arrives when a params
object is assembled from everything the fetch needs and handed to the key
factory whole. The bag is the natural artifact; the classification is the
thing someone has to decide to add. That is the strongest available argument
for the technique's central instruction — declare the axis where the key is
defined — because at the moment the key is defined is the only moment when
all its components are in one place and nobody has yet had a reason to think
about them separately.

## What this application cannot say

The census matches field **names** against two vocabularies, so it counts
literals, not defects: a project naming its coordinates unconventionally
scores zero and proves nothing. The zero in the second project is a zero for
this instrument, not an absence of the shape. And the seam is latent — a
correct prediction about code that no user currently reaches is weaker
evidence than a measured regression, and is recorded as such.
