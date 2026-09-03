---
layer: technique
type: technique
subject: multi-provider-gateway-plane
technique: adapter-direction-asymmetry
status: forged
laws: [one-authority-per-vocabulary, one-validation-door]
shared_with: []
use_when: [designing the adapter interface for many upstreams at once, a mapping table has grown conditionals and now needs a debugger, an upstream with a wholly different auth scheme is distorting the shared pipeline, nobody can answer which parameters an upstream actually supports without reading code]
---

# Adapter direction asymmetry

An adapter translates between the plane's published contract and one upstream's
dialect, in two directions. The recurring finding, once the number of upstreams
is large enough for the shape to matter, is that **the two directions do not
deserve the same expression medium**. Outbound translation is data. Inbound
translation is code. Designing the interface symmetrically — in either
direction — costs more than the asymmetry ever does.

## Why outbound is data

Request translation across many upstreams is overwhelmingly three operations:
**rename** a parameter, **clamp** it to the upstream's bounds, and **default** it
when absent. Occasionally a value is mapped through a small fixed table. That is
a description, not an algorithm, and expressing it as one — a table of published
name to upstream name, with bounds, default, required-ness, and at most a pure
single-value transform — buys four things that are hard to buy any other way:

- **Reviewability.** An adapter is readable in a minute against the upstream's
  published parameter list, by someone who does not know the plane's code. When
  a new upstream is onboarded, the review is a comparison of two tables.
- **One validation door.** Bounds and required-ness live in the same structure
  that does the renaming, so the request body is constructed once, from the
  table, with the checks applied in that construction rather than sprinkled
  across whichever call sites remembered
  ([one-validation-door](../../../../_laws.md#one-validation-door)).
- **One authority for the naming.** The table *is* the answer to "which
  parameters does this upstream accept and what do we call them"
  ([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)),
  rather than a fact distributed over a function body and a comment.
- **Mechanical checks.** A table can be diffed against a published schema,
  linted for parameters the contract no longer has, and generated from
  documentation. A function body can be none of those.

## Why inbound is not

Response translation is structural. It re-shapes arrays into other arrays,
synthesizes identifiers the upstream never sent, folds several native fields into
one published field, maps enumerations through tables *and* through conditions,
and — on streams — accumulates state across frames. None of that is renaming.
Expressed as data it becomes a mapping language with conditionals, iteration and
expressions: a programming language with no types, no debugger, no stack traces
and no reviewers, invented one feature at a time by people who were trying to
avoid writing a function.

The tell arrives early and is worth naming as a rule: **when the mapping data
acquires an "if", the decision has already been made and only the tooling is
missing.** At that point the honest move is to write the transform as code,
because code is what it is.

So the inbound side is one function per upstream per endpoint kind, small, doing
the structural work explicitly. That matches, on the response direction, the
stance a neighbouring domain of this corpus already takes about extracting
provider-reported counters — one small explicit extractor per provider family,
never one clever generic walker, because the shapes are independent designs
rather than variations on a theme and a generic walker's failure mode is that it
*finds something*. That subject sits in another domain and therefore carries no
link from here; the refinement this technique adds is that the rule is
**direction-dependent**. The response side does not generalize. The request side
does, and treating both as ungeneralizable is how a plane with fifty upstreams
ends up with fifty hand-written request builders that each forgot a different
clamp.

## The unit is upstream and endpoint, not upstream

The real surface area is the product of upstreams and endpoint kinds, and the
endpoint dimension is the one designs under-count. One upstream commonly speaks
different dialects at different endpoints — different parameter names, a
different response envelope, a different stream framing (see
[per-provider-stream-framing](./per-provider-stream-framing.md)) — often because
those endpoints were built by different teams or in different years. An adapter
keyed only by upstream forces those differences into conditionals inside a shared
transform, which is the same "if" tell one level up.

## The escape hatch, declared and counted

Some upstreams do not fit the pipeline at all: a request signing scheme that has
to see the finished bytes, an authentication exchange with its own round trip, a
transport that is not the one everything else uses. Forcing them through the
shared path distorts it for everyone — a signing step becomes an optional hook
that every other adapter must skip, and the pipeline acquires a branch per
exception.

Give it one declared hatch: an adapter may replace the whole request path with
its own handler. Three rules keep the hatch from eating the design:

- **All or nothing.** An adapter uses the pipeline or replaces it. A
  half-hatched adapter — table for some fields, custom code that also rewrites
  the body — has two authorities for the request and they will disagree.
- **Declared, not detected.** The adapter states that it takes the hatch, in the
  same manifest the dispatcher reads to find it. Sniffing for the presence of a
  handler makes the dispatch rule implicit and the behaviour hard to enumerate.
- **Counted.** If a large minority of adapters take the hatch, the pipeline is
  modelling the wrong thing and the finding is about the pipeline, not about the
  adapters. The count is the only signal that says so before the next ten
  adapters are written around it.

## Decision rules

- **A table transform is pure and single-valued.** Name and value in, name and
  value out. The moment a transform needs another parameter's value, the
  request's context, or the upstream's response, it is code — and that field
  moves to code rather than the table growing a scope.
- **Defaults belong to the adapter, not to the caller's absence.** A parameter
  the caller omitted and one the caller set to the upstream's default are the
  same bytes on the wire and different facts in the record. Where the difference
  matters, keep the caller's omission visible in the decision record even after
  the table has filled it in.
- **Cross-upstream normalization lives in one shared table per direction, not in
  each adapter.** The published enumerations — termination reasons, roles,
  content kinds — map through one authority in each direction; an adapter that
  keeps a private copy is the second copy that drifts.
- **Onboarding writes from documentation, never by analogy.** A new adapter
  copied from the nearest existing one inherits its neighbour's clamps and its
  neighbour's mistakes, and the review that would have caught it is exactly the
  review the table format made cheap.

## When not to use it

- **When there are two or three upstreams.** Write both directions as code; the
  table earns its keep at a count where reviewability and generation start to
  matter, and below that it is indirection for its own sake.
- **When the upstreams are versions of one contract.** Then the differences are a
  diff, not a translation, and a version-aware single adapter is simpler than a
  table per version.
- **When the request side is genuinely structural.** An upstream whose request
  shape differs by more than names and bounds — a different message model, a
  different notion of a turn — is the escape hatch's case, and forcing it into a
  parameter table produces the same private language by the other road.
