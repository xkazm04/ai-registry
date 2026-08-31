---
layer: technique
type: technique
subject: async-ui-states
technique: windowing-vs-identifying-keys
status: forged
laws: [count-carries-predicate]
shared_with: []
use_when: [deciding whether a key change may keep the previous content on screen, scroll position resets when the user only turned a page, a page number survives a new search, choosing which value to defer when showing stale content during a transition]
---

# Windowing vs identifying keys

The [state-model](./state-model.md) says the sticky `settled` bit resets on an
"explicit context change", calls what counts as one *the subtle decision*, and
then declines to make it: *"pick one policy per product and apply it
everywhere, because mixing the two makes the product feel nondeterministic."*
The [table](../../../data-display/table/table.md) subject says the same thing
in nearly the same words, and
[arrival-choreography](./arrival-choreography.md) leans on the same
unspecified term ("resets only on an explicit context change, such as a new
filter"). Three sites, one primitive nobody defines.

The instinct behind "pick one policy" is right and the prescription is wrong.
Arbitrary mixing *is* nondeterministic. But a surface's request is rarely a
single key — it is a **compound** key, and its components do not all mean the
same kind of thing. Classify them once and the mixing stops being arbitrary:
it becomes a rule the user can feel, and the four or five subsystems that each
need this answer stop deriving it separately.

## The two classes

Every component of a surface's request key is one of:

- **Identifying** — changing it changes *which subject* the surface is asking
  about. A search term, an entity id, a tenant, a date range that defines the
  dataset rather than paging through it.
- **Windowing** — changing it changes *which part or view* of the same subject
  is shown. A page number, an offset or cursor, a sort order, a page size, a
  zoom level.

The discriminating question is about the content already on screen, and it has
a sharp answer:

> After this change, is the content currently rendered a **truthful but
> incomplete** answer to the new question, or a **false** one?

Page two of the same search, while page three loads: truthful, incomplete —
those rows really are results for this query. Results for the previous search
term, while the new term loads: false — those rows are not results for this
query at all, and rendering them is the surface asserting something it knows
is untrue. That asymmetry is
[count-carries-predicate](../../../../_laws.md#count-carries-predicate) applied to
content rather than to counts: a rendering carries the predicate it was
produced under, and content minted under one predicate must not render as the
answer to another.

Sort order deserves a note, because it looks borderline and is not. Re-sorting
the same result set is windowing — every row on screen still belongs. Changing
a *filter* that happens to be implemented in the same control is identifying.
Classify by what the change does to the result set, never by which widget
raised it.

## One classification, five consumers

The reason this is worth declaring rather than deciding case by case is that
the answer is needed in at least five places, in five different vocabularies,
by code that does not otherwise talk:

| Subsystem | On a windowing change | On an identifying change |
| --- | --- | --- |
| previous content | keep it rendered, marked (see below) | do not keep it; the region returns to `loading` |
| the sticky `settled` bit | survives — the surface is not new | resets — this genuinely is a new surface, and it may ghost again |
| scroll position | preserved; the user is moving *within* something | reset to the top; a new subject starts at its beginning |
| dependent coordinates | untouched | windowing coordinates reset to their origin (a new search starts at page one) |
| entrance choreography's seen-set | survives; rows are not "arriving" | resets; these are first appearances |

Two properties of that table are load-bearing. **The dependent-coordinate
reset is one-directional**: an identifying change resets the windowing
coordinates, and a windowing change never touches the identifying ones. A
surface where turning the page clears the search box has the arrow backwards.
And **every row is a decision some subsystem will make with or without you** —
undeclared, each is made locally, by whoever wrote that subsystem, from
whatever intuition they had that afternoon. The observable symptoms of five
independent answers are exactly the defects that read as sloppiness: scroll
jumping to the top when the user only turned a page, a page number surviving a
new search, stale results sitting under a fresh query.

## Where to declare it: the input, not the payload

There are two places the classification can live, and they are not equivalent.

**On the payload** — a predicate over the previous response, asking whether it
was produced under the same identifying coordinates:

```
keepPrevious = previous?.term === currentTerm
```

This works, and it carries a hidden prerequisite: **the response must echo its
own identifying coordinates back**. If the payload does not say what predicate
produced it, the predicate cannot be written — and the tempting substitute,
comparing against some field that merely correlates with the term, is a
comparison that is right until the day it isn't. The payload is a shadow copy
of a fact the caller already had.

**On the input** — defer exactly the windowing coordinates, and derive
staleness by comparing the deferred value to the live one:

```
deferredPage = defer(page)
isStale      = page !== deferredPage
```

Prefer this one. The classification is expressed by **which variables you
defer**, so it exists in exactly one place and cannot drift from the thing it
describes; the transport is asked for nothing; and there is no field whose
meaning can quietly change underneath the predicate. It is the same argument
the state model already makes for deriving state from the request machinery
instead of from hand-maintained flags — put the declaration where the fact is,
not in a copy of it.

One corollary comes free and is worth stating because it catches the obvious
mistake: deferred inputs must be primitives or values created outside the
render, so **deferring "the whole search state" as one object is wrong twice
over** — referentially, because a fresh object every render defeats the
mechanism, and semantically, because it defers the identifying axis along with
the windowing one and re-creates the very lie the classification exists to
prevent. Defer the coordinates, never the bag.

## The state the model was missing

The [state-model](./state-model.md) enumerates six states and derives them from
four inputs, and its derivation collapses two situations that a user
distinguishes instantly:

- **refreshing** — the *same* key, a newer answer in flight. What is on screen
  is a correct answer, possibly stale. The golden path's prescription holds:
  ambient at most, because nothing displayed is untrue.
- **superseded** — a *windowing* coordinate moved, and what is on screen is
  the answer to the previous window. It is not stale, it is *for a different
  question*, and the honest rendering marks **the content region itself** — a
  dim, a reduced opacity — because the thing that is provisional is the
  content, not the freshness of the content.

Reaching `superseded` on an identifying change is forbidden: that is the same
edge as rendering the previous subject's data under the current subject's
question, and it belongs in the forbidden-transition table beside the empty
flash.

This also makes the golden path's honesty rules short by one. It names three
ways an async surface can lie — asserting empty before settling, dressing
failure as empty, hiding held data. The fourth is **rendering held content
that answers a different question than the one the surface currently
displays, without saying so**, and it is the one that arrives by accident,
because keeping previous content is otherwise a kindness.

## What "pick one policy" should have said

Keep the fear and drop the prescription. The nondeterminism the corpus warned
about is real, and it comes from mixing policies *per call site*: one list
dims, its neighbour ghosts, and nothing explains the difference to the user or
to the next maintainer. It does not come from mixing policies per **axis**,
which is the opposite — a rule stated once, applied everywhere, and legible to
the user as "same search, moving" versus "new search". Declare the
classification where the key is defined, in one place, and then every
subsystem applies it consistently, which is what "apply it everywhere" was
reaching for.

## Decision rules

- Classify every component of a surface's request key as identifying or
  windowing, at the site where the key is defined, once.
- The test is whether the rendered content is a *truthful but incomplete*
  answer to the new question (windowing) or a *false* one (identifying).
  Classify by the effect on the result set, never by the widget.
- Keep previous content only across windowing changes, and mark the content
  region while it is superseded — not with an ambient indicator, which means
  something else.
- Reset the sticky `settled` bit, scroll position, the choreography seen-set
  and the windowing coordinates on identifying changes only, and never reset
  identifying coordinates from a windowing change.
- Declare the axis on the input by deferring the windowing coordinates, not on
  the payload by a predicate over the previous response; defer primitives, and
  never the whole key object.
- If the payload form is unavoidable, the response must carry the identifying
  coordinates it was produced under; a comparison against a merely correlated
  field is a bug with a delay on it.
