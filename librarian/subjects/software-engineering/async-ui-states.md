---
subject: async-ui-states
domain: software-engineering
last_touched: 2026-08-31
dry_streak: 0
---

# async-ui-states

First touch: [[2026-08-31-tkdodo-rq-beyond-basics]] — one technique
(`windowing-vs-identifying-keys`), one golden-path correction, one application
(`react--windowing-vs-identifying-keys`, experiment / `unmeasurable`).

**This was a stated doctrine corrected, not a hole filled.** The subject named
the decision and declined to make it: `state-model` said the sticky `settled`
bit resets on an "explicit context change", called what counts as one *the
subtle decision*, and prescribed *"pick one policy per product and apply it
everywhere, because mixing the two makes the product feel nondeterministic."*
The corpus said this **twice** — `table/loading-and-empty-states` carries the
same sentence in nearly the same words — and `arrival-choreography` leans on
the same undefined primitive ("resets only on an explicit context change, such
as a new filter"). Three sites, one term nobody defined.

The correction keeps the fear and drops the prescription: arbitrary mixing
*is* nondeterministic, but a request key is compound and its components split
into **identifying** (change means a different subject) and **windowing**
(change means a different view of the same subject). Mixing per *call site* is
the defect; mixing per *axis* is a rule the user can state. The classification
has at least five consumers — previous-content retention, the sticky bit,
scroll position, dependent-coordinate reset, the choreography seen-set — which
is why declaring it once is the whole point.

Two consequences landed in the golden path: the state table gains
**`superseded`** (content held from a *previous window*, distinct from
`refreshing` because what is on screen is not stale but *for a different
question*, hence the content region itself is marked rather than an ambient
indicator), and the honesty rules went from **three lies to four** — the fourth
being answering a question with another question's content.
`state-model`'s forbidden-transition table gains the matching edge.

**Boundary held with `table`.** That subject specializes this doctrine and
carried the same superseded prescription; rather than restate the rule there,
its line now resolves per-axis and points here. See
[[table]]. The technique cites
`count-carries-predicate` — the same law `table/pagination` already cites for
the adjacent count-honesty rule, which is what made the anchor obvious rather
than invented.

Corroboration: one primary fetched in-run confirmed the scheduler mechanism
verbatim (deferral is a property of the *input*, not the response; staleness
derived by comparing deferred to live) **and confirmed the gap** — the primary
warns only that deferred values must be referentially stable, never which
values are semantically eligible. Mechanism documented; discrimination rule
documented nowhere.

Attention before this run: 29 points, single stack (react), never swept by the
librarian. Still single-stack after it — the application added is react.
