---
layer: technique
type: technique
subject: agent-host-experience
technique: in-host-views
status: forged
laws: [absent-guard-is-loud, failure-not-empty-success]
shared_with: []
use_when: [adding a rendered view to a tool an agent host calls, a view that works in one host and breaks in the next, deciding what an inline card may contain]
---

# In-host views

Some agent hosts can render a small interface a product ships beside an operation: the
operation declares a view resource, the host fetches it, runs it in a sandbox inside the
conversation, and hands it the operation's input and result over a message bridge. The
view can call the product's operations back through the host, ask for a larger display
mode, open a link, or post text toward the model. It is the richest thing a product can
put in someone else's conversation, and the easiest to misuse.

## A view earns its place

Ship a view only where **seeing or manipulating beats reading**:

- **Picking** one of several items whose differences are visual or many-attributed.
- **Comparing** two to a handful of things side by side.
- **Confirming** something precise — the exact amount, the exact slot, the exact
  recipient — where a misread sentence costs more than a glance.
- **Visualizing** a shape: a trend, a map, a layout.

Never ship a view to compensate for an operation whose text result is confusing. The
view hides the defect in the hosts that render it and leaves it intact in every host
that does not; fix the operation's result, then decide whether a view still earns its
place.

## The text result is complete without the view

Every operation that has a view still returns a complete text answer and a structured
result, because some hosts never render — a terminal agent calls the operation and
prints what came back. The test is literal: delete the view and finish the journey. If
the text result says "see the card above", it has failed. The structured result is what
the view reads and the text is what a non-rendering host reads; they describe the same
outcome, and a host's absence of a view is an empty rendering, not an empty result
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

## Inline is a glimpse

Three host families publish inline limits. Re-read 2026-11-16 against each family's own
page: all three cap an inline card at two actions, one primary, and a carousel at three
to eight items, and all three forbid nested scrolling. They differ on density: one caps
an inline card at four or five data points, and the others cap each carousel item at
two or three attributes or three lines of metadata. They also differ on larger modes,
offering one or two larger modes beside inline. Treat the shared numbers as a ceiling,
not a target, and the strictest density as the portable one:

- **At most two actions** on an inline view. A third action is a menu, and a menu is
  a sign the view wants to be a larger display mode or the product itself.
- **About four or five data points.** More is a table, and a table belongs in a larger
  mode or in the product.
- **A carousel holds roughly three to eight items**; fewer is a list, more is a search.
- **No nested scrolling, no menus or popovers, no deep navigation.** The host's
  conversation already scrolls; a scroller inside it traps the wheel.
- **Never a second composer.** A text box in the view that asks the user what they
  want competes with the host's own input and splits the conversation in two.

Escalate to a larger display mode (full screen, picture-in-picture or a side panel
where offered; a host that has a side panel may open it in answer to a full-screen
request, so lay out by the container's size rather than by the mode's name) for
depth the user chose, and hand off to the product for anything longer
([depth-handoff](./depth-handoff.md)).

## Language through chat, manipulation in the view

The rule that decides most interaction questions: **if the interaction needs language
understanding or a reply from the model, it goes through the host's chat; if it is a
direct action on content the product already controls, the view handles it.** Choosing
a seat is a click in the view; "find me something quieter" is a message in the chat.
A view that interprets free text itself has rebuilt the host's model badly; a chat
round-trip to toggle a filter has made a click cost a turn. When the view needs the
model to know what the user did in it, it reports the fact through the bridge's
context channel — a statement of state, not an instruction.

## Speak the standard bridge; detect everything else

Hosts diverge feature by feature: which display modes they offer, which bridge messages
they implement, whether they honor the view's border and domain preferences, which
behavior hints they read (a March 2026 survey found the named hosts acting only on
the read-only hint), whether they support teardown and cancellation notices, whether
their mobile runtime exposes device features. So:

- **Use only the standard bridge** for everything the journey needs. A host-specific
  extra — a checkout surface, file transfer, state persisted by the host — is detected
  at run time from what the host declares, and the view works without it.
- **Read the host's declared capabilities** at start and branch on them; never infer a
  host from its user agent or assume a mode exists because it did in the last host.
- **When a capability the journey relies on for safety is absent, say so.** A view that
  needed the host to confirm a destructive call and finds no such support does not
  silently proceed; it hands off or refuses, visibly
  ([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).

## Declare every origin, and test in an enforcing host

The view runs code inside another product, under a content policy that denies by
default. Every origin the view fetches from, loads assets from, frames or posts to is
declared in its resource metadata, and the declaration is the reviewable contract the
host enforces. The usual production failure is a view built in a host or developer mode
that did not enforce the policy, which then breaks or is rejected from a host's
directory over an undeclared origin. Test in a host that enforces, and keep the
declaration as narrow as the view's real needs.

Enforcing hosts also differ in *how* they enforce, and the failure is quiet. Read
2026-11-16 in one host family's guidance: an origin entry the host cannot parse is
dropped and the rest applied, so the request to it fails only in the browser console. A
declared field the standard defines may be ignored and replaced by the host's own
value. So test every declared origin by exercising it in each enforcing host, not by
reading the declaration back. A mobile client may run the view in a native web view
rather than a sandboxed frame, with device features withheld. The standard's own rule is
the floor everyone shares: with no declaration, the view gets no network at all.

## The view's channels to the model are untrusted input

A view can post a message into the conversation and update the model's context. Both
are injection surfaces: the view renders data that may have come from outside (a
listing, a review, a counterparty's note), and anything that data persuades the view to
post reaches the model with the appearance of the user's action. Treat what the view
sends toward the model as the host treats a tool result — data with provenance, never
instruction
([untrusted-result-handling](../../../runtime-and-io/mcp-tools/techniques/untrusted-result-handling.md))
— send facts rather than prompts, and never relay third-party text through it verbatim.
Operations the view calls back through the host are authenticated and authorized by the
product exactly as if the model had called them; the host may also require approval
for view-initiated calls, and the product must not rely on it doing so.

## When not to use this

- When the result is a fact, a short list or a how-to. Prose is the right form, and a
  view adds load and latency for nothing.
- When the product has no visual advantage over the host's own rendering of a table or
  list — let the host render the text.
- When the work is long or consequential; that is a handoff, not a bigger view.
- When the host is the product's own front end; that tier composes its own screen
  ([model-composed-workspace](../../model-composed-workspace/model-composed-workspace.md)).
