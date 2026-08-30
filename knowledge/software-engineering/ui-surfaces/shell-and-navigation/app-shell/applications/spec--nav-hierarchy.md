---
layer: application
type: application
subject: app-shell
technique: nav-hierarchy
stack: spec
status: forged
verified_on: 2026-08-30
refresh_by: 2027-02-28
source: "W3C/WCAG@2.2 + W3C/wai-aria@1.2"
---

# The nav's depth and posture, as two public standards write them

## The pin

World Wide Web Consortium, *Web Content Accessibility Guidelines (WCAG) 2.2*,
W3C Recommendation of 12 December 2024, dated edition
`https://www.w3.org/TR/2024/REC-WCAG22-20241212/`, retrieved 2026-08-30;
conformance levels below are that edition's. World Wide Web Consortium,
*Accessible Rich Internet Applications (WAI-ARIA) 1.2*, W3C Recommendation of
6 June 2023, dated edition
`https://www.w3.org/TR/2023/REC-wai-aria-1.2-20230606/`, retrieved the same day;
role definitions are quoted from §5.4 (Definition of Roles).

Neither document is about navigation architecture. Both are about what a user
interface owes a person who cannot use it the way it was drawn — which turns
out to bind roughly half of this technique, and to bind it as conformance
rather than as craft. `refresh_by` is set on a six-month standards window, not
on a runtime clock: no `verified_against` is recorded because a Recommendation
date is not a runtime version and forcing it into `<stack>@<major>` would make
a currency check that means nothing.

## The six prohibitions, against the standards

| prohibition | what the standards hold |
| --- | --- |
| 1. No nav entry exists in one posture but not the other | **Partial, and weaker.** SC 3.2.3 Consistent Navigation (AA) governs *order*, not presence, and carries an exception. |
| 2. No sub-nav goes global | **Silent.** No criterion addresses where a second level renders. |
| 3. No per-user-data entries in the nav vocabulary | **Silent.** No criterion addresses vocabulary closure. |
| 4. No third shell level | **Silent on depth — but SC 2.4.5 Multiple Ways (AA) imposes something we do not.** |
| 5. No silent posture resets | **Silent on preference persistence — but SC 1.4.10 Reflow (AA) makes the width floor mandatory, and SC 2.3.3 (AAA) backs the reduced-motion clause at AAA only.** |
| 6. No icon-only entry without an accessible, discoverable name | **Three criteria at once: SC 4.1.2 (A), SC 1.4.13 (AA), SC 2.5.3 (A).** Fully covered, and sharper than we wrote it. |

## Where our standard is stricter than the public one

**Prohibition 1 is stricter on three separate axes.** SC 3.2.3 Consistent
Navigation (Level AA) reads: "Navigational mechanisms that are repeated on
multiple web pages within a set of web pages occur in the same relative order
each time they are repeated, unless a change is initiated by the user."

- It constrains **order**, not **presence**. An entry that vanishes in the
  collapsed posture and reappears expanded does not obviously violate 3.2.3 at
  all, as long as whatever remains stays in the same relative order. Our
  prohibition is about presence first — "if an entry is only reachable in one
  posture, the two postures are two navs" — and that is the failure the
  criterion does not catch.
- It carries the exception **"unless a change is initiated by the user"**, and
  a collapse toggle is precisely a user-initiated change. So the criterion
  explicitly *permits* the posture toggle to reorder the rail. Our technique
  forbids reordering outright, with no exception: "the collapsed rail is the
  same map at lower resolution — same entries, same order, same gating." This
  is the clearest case in this document of our standard holding a line a public
  standard deliberately relaxes, and we should keep it: the exception exists so
  that user-driven personalisation is not penalised, but a *posture* toggle is
  not personalisation of the map, it is a change of resolution, and a map whose
  order changes with its zoom level is two maps.
- Its scope is "a set of web pages". A shell that swaps its content region
  without replacing the document is arguably one page, in which case the
  criterion does not bind at all. Our prohibition binds regardless of how many
  documents the product happens to have — which is the same architecture-
  independence the golden path's frame-continuity correction is about.

**Prohibition 5's reduced-motion clause sits at our baseline and at the
standards' AAA.** SC 2.3.3 Animation from Interactions is Level AAA: "Motion
animation triggered by interaction can be disabled, unless the animation is
essential to the functionality or the information being conveyed." Our
technique states it unconditionally — "layout math, content reflow, and the
reveal affordances must be correct at both endpoints with animation disabled;
reduced-motion users get the same two postures, settled instantly." We require
at baseline what the standards reserve for their highest conformance level, and
we go slightly further: 2.3.3 asks that the animation be disableable, while we
ask that the *endpoints be correct* with it disabled, which is the thing that
actually breaks.

**The one-active invariant is a SHOULD in the standards.** WAI-ARIA 1.2 defines
`aria-current` as the state that "indicates the element that represents the
current item within a container or set of related elements", and says "Authors
SHOULD set the `aria-current` attribute on only one element within a set of
related elements." That is advisory. The navigation-model technique makes
exactly-one-active a structural invariant enforced by derivation rather than by
authorial care, which is the stronger position: a SHOULD that depends on every
navigation site remembering to run a protocol is the double-highlight bug with
extra steps.

## Where the standards are stricter, or cover ground we miss

**SC 2.4.5 Multiple Ways (AA) requires a second route, and we never say so.**
"More than one way is available to locate a web page within a set of web pages
except where the web page is the result of, or a step in, a process." Our
technique caps the shell at two levels and hands everything deeper to the page.
It is silent on what carries a destination the nav can no longer name — and the
standard is not: at Level AA, a nav-only product with more than two levels of
real structure is non-conforming unless a search, a site map, or an equivalent
second route exists. The command surface that the shell-hosted-services
technique treats as a convenience is, at this depth, a conformance requirement.
**This is a genuine gap in our upper layers**: the depth budget was written as
an economics argument and never paid its findability debt.

The same criterion contains an unexpected convergence. Its exception —
"except where the web page is the result of, or a step in, a process" — draws
the identical line as our sub-nav admission test: "If users pass through a
sub-destination once during setup and never return, it is a step, not a place."
Two documents, written for unrelated reasons, both carve steps out of places
using the same word. That is weak evidence that the distinction is real rather
than stylistic.

**SC 1.4.10 Reflow (AA) makes the responsive floor mandatory, not merely
legitimate.** "Content can be presented without loss of information or
functionality, and without requiring scrolling in two dimensions for: Vertical
scrolling content at a width equivalent to 320 CSS pixels." Our technique calls
automatic collapse below a width floor "legitimate as a floor — the window
physically cannot hold labels", i.e. a permitted exception to the
never-fight-the-user rule. The standard inverts the framing: at 320 CSS pixels
a two-column persistent frame that forces horizontal scrolling is a Level AA
failure, so the floor is not a concession the product may make, it is one it
must. Our "restore the user's choice when space returns" clause survives intact
and is the part the standard says nothing about.

**Prohibition 6 is three obligations, not one, and we had merged them.** The
standards separate cleanly:

- SC 4.1.2 Name, Role, Value (Level A): "For all user interface components, the
  name and role can be programmatically determined…" — the *accessible* name.
- SC 1.4.13 Content on Hover or Focus (Level AA): "Where receiving and then
  removing pointer hover or keyboard focus triggers additional content to
  become visible and then hidden, the following are true: Dismissible,
  Hoverable, Persistent." — the *visible reveal*, and its three named
  conditions.
- SC 2.5.3 Label in Name (Level A): "For user interface components with labels
  that include text or images of text, the name contains the text that is
  presented visually."

The first two are the correction this subject already took: a name for the
accessibility layer and a reveal for the person looking are separate debts and
both are owed. The third is a case the technique still does not name. SC 2.5.3
is **vacuous while an entry is icon-only** — there is no visible text for the
accessible name to contain — and **becomes binding the moment the posture
expands**, because a visible label now exists. So the collapse toggle does not
merely change what is drawn; it switches a Level A criterion on and off. A rail
whose collapsed tooltip and expanded label come from different sources is
conforming in one posture and failing in the other, and no test that runs in a
single posture will find it. The rule that follows: **both postures draw their
name from one string**, which is the vocabulary-closure argument arriving from
the accessibility side.

## Adjacent: the golden path's accessibility posture

Not this technique's, but checked in the same pass and worth recording where the
citations already are.

- **The skip link is Level A, and the standard is looser on mechanism than we
  are.** SC 2.4.1 Bypass Blocks (Level A): "A mechanism is available to bypass
  blocks of content that are repeated on multiple web pages." The golden path
  names one mechanism ("a skip link exists"); the standard names an outcome and
  accepts others, landmark structure among them. Naming the mechanism is a
  defensible narrowing — it is the one that works everywhere — but it should
  read as a chosen implementation of a required outcome, not as the requirement.
- **Landmarks are confirmed verbatim.** WAI-ARIA 1.2 §5.4 defines the
  `navigation` role as "A landmark region that contains a collection of
  navigational elements (usually links) for navigating the document or related
  documents" and the `main` role as "The landmark containing the main content of
  the document." The golden path's "the primary nav, the main content region,
  and the status chrome are distinct labeled landmarks" is exactly this.
- **"The current location is stated, not just painted" has its vocabulary.**
  `aria-current` carries the tokens `page`, `step`, `location`, `date`, `time`,
  `true` and `false` — three of which name three different senses of "current".
  That the state has a token for a *step* and a separate one for a *location*
  is the same place/step distinction SC 2.4.5 and our sub-nav test both drew.
  Note also what is *not* in that list: a previewed-but-not-current entry has no
  `aria-current` token, which is why a nav that lets the user browse the map
  without moving must express the preview as a pressed state and not as a second
  current one.
- **"Navigation moves focus" is craft, not conformance.** No success criterion
  in WCAG 2.2 requires focus to move when a shell swaps its content region.
  The golden path states it as a rule, and it is a good one, but it should not
  be read as conformance-backed: the standards require that the change be
  perceivable and programmatically determinable, and leave the focus decision
  to the author. Worth keeping and worth labelling.

## What neither standard touches

Prohibitions 2 and 3 — sub-navs staying section-scoped, and keeping user data
out of the nav vocabulary — have no counterpart in either document. That is not
a gap in the standards; both are architecture rules whose failure mode is a
product that becomes unlearnable, not one that becomes unusable. They stand on
this corpus's own evidence and should not be presented as accessibility claims.
