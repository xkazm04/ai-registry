---
layer: technique
type: technique
subject: people-analytics-ethics
technique: private-view-separation
status: forged
laws: [one-validation-door]
shared_with: []
use_when: [building a personal engineering dashboard, an authorization check is the only thing hiding a roster, a manager asks to see one person's private view]
---

# Private view separation

A private view is the report a person gets about their own work. Separation is
the property that makes the corresponding roster view — the same report about
someone else, or about everyone — **unrepresentable in the data rather than
merely unrendered**: there is no query shape that returns it, no parameter to
widen, and therefore nothing for a future authorization bug to expose.

## Unrepresentable, not hidden

The difference is the whole technique.

- **Hidden** means a producer can return any person's rows and a check decides
  whether to. The dangerous capability exists; a predicate withholds it.
  Predicates are edited, parameterized, cached around, and bypassed by the
  next endpoint. Every incident in this class begins with a capability that
  was only ever supposed to be used one way.
- **Unrepresentable** means the scope carries exactly one identity — the
  viewer's, resolved from the session at the boundary and never accepted as
  an argument — and the producers beneath it are written against that scope.
  Asking for a colleague's view is not denied; it cannot be expressed. There
  is no roster shape to leak because no function returns a set of people.

The practical construction: resolve the viewer's identity once, at the
boundary, into a scope value; give every personal producer that scope as its
only source of identity
([law: one validation door](../../../../_laws.md#one-validation-door)); make the
identity field of the underlying query unavailable as a caller-supplied
parameter. A reviewer should be able to confirm the property by reading the
scope construction alone, without auditing call sites.

## Properties a personal view must keep

- **Self-only, with no delegation path.** No impersonation, no "view as", no
  admin override that renders someone else's personal surface. Support and
  investigation needs are met by other, logged instruments, not by borrowing
  this one.
- **No ranking against colleagues, ever.** The personal view compares a
  person to their own history and, where useful, to a floor-cleared group
  aggregate. A position within the team is the content that converts a
  helpful tool into a source of anxiety and a leak of everyone else's
  standing to everyone else.
- **No mirrored management surface.** If a screen exists that shows the same
  fields for a named other person, the separation is nominal. The
  organization's questions are answered by a different producer over
  aggregate shapes ([aggregate-vs-individual-split](./aggregate-vs-individual-split.md)).
- **Nothing computed here flows upward.** The personal view may consume
  aggregates; it may not become one by being harvested. If a management
  report needs a number, it recomputes it from the aggregate producer.
- **No naming floors applied inward.** The population is one by design.
  Suppression thresholds belong to group reporting and would only hide a
  person's data from themselves.
- **Legible provenance.** The view states what it was computed from and over
  what window, because the person reading it is also the person best placed
  to notice it is wrong — and the only one motivated to say so.

## Procedure

1. **Define the scope type** — an opaque value meaning "this viewer" — and
   construct it in exactly one place from the authenticated session.
2. **Write the personal producers against the scope**, not against an
   identity parameter. A producer that takes an identity argument is a
   roster producer with a convention attached.
3. **Delete or refuse the widening parameter.** If an existing function
   accepts an identity, split it: the personal path loses the parameter, the
   aggregate path loses the identity in its output.
4. **Give the view its own route or surface**, so that authorization for it is
   a single fact rather than a per-field question.
5. **Write the negative test.** The regression that matters asserts that no
   personal producer can be made to return a second identity — not that the
   UI hides a button.
6. **Say so in the product.** Tell the person that this view is theirs, that
   their management chain sees aggregates rather than these rows, and what
   those aggregates contain. A privacy property nobody knows about buys no
   trust, and the claim is also a commitment that keeps the next feature
   honest.

## Decision rules

- **When a stakeholder asks to see one person's private view, the answer is a
  different artifact.** Either the aggregate answers their real question, or
  the question is an evaluation that belongs to a review process with
  consultation and appeal.
- **When a personal producer needs a colleague's data for context, it needs
  the aggregate instead.** Fetching one named colleague's row to draw a
  comparison reintroduces the roster capability one row at a time.
- **When the personal view and an organizational chart would let a reader
  reconstruct individuals** — a team of three where the team aggregate plus
  your own row names the other two — the group aggregate is subject to the
  naming floor before it is offered here
  ([naming-population-floor](./naming-population-floor.md)).
- **When adding an export**, it exports what the viewer can see and carries
  the same scope. An export path that re-queries with an identity parameter
  is the roster view, shipped.

## When not to use it

- **Self-selected public contribution surfaces**, where the person has already
  chosen to publish their activity and hiding it from them or from others
  serves nobody.
- **Formal evaluation systems**, which name individuals under governance this
  technique deliberately lacks. Do not extend a private view into one.
- **Investigation and provenance tooling**, which must be able to answer
  questions about a specified person by design, under access control and its
  own logging. Keep it a separate instrument with a separate door, and do not
  let it become the widening parameter this technique removed.
