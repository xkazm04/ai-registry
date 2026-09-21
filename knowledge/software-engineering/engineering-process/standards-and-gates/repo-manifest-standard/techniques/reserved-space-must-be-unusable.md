---
layer: technique
type: technique
subject: repo-manifest-standard
technique: reserved-space-must-be-unusable
status: forged
laws: [identity-survives-reuse, one-validation-door, one-authority-per-vocabulary]
shared_with: []
use_when: [reserving room in a contract for a field you have not designed yet, labelling part of a format experimental or provisional, carving a key out of a space other writers already fill, deciding whether a syntax you refuse to emit should also be refused on the way in]
applied: code
ab_verdict: better
---

# Reserved space is unusable space

Every extensible contract needs room to grow into, and the room is never empty
land: the same key space, attribute space or option namespace is being filled
by other writers at the same time. So an author reserves. The reservation is
written as a sentence — *this prefix is ours*, *this section is experimental*,
*these names are for future use* — and the sentence feels like it has bought
the freedom to design later.

It has bought exactly as much freedom as a writer **loses by using the reserved
space today**. Nothing else in the reservation matters. The label is a
statement about intent; what decides the outcome is what happens when somebody
puts something there and ships it.

## The three rungs, and only two of them reserve anything

**1. Refused at the door.** The document is rejected, or the writer's value is
removed before any reader can act on it. Nothing deployed can depend on the
meaning, so the meaning is still yours to define, and defining it later costs a
release note rather than a migration.

**2. Inert, and non-conforming.** Accepted by every reader, doing nothing, and
an error in the checker the writers already run. Using it buys no behaviour and
costs a red gate. This is the rung to reach for when refusing is not available
because old readers are already deployed and must not start failing: keep the
syntax *ignored* on the way in and *invalid* on the way out, and the gap
between what you refuse to emit and what you must accept is your extension
budget, sized deliberately instead of discovered later.

**3. Accepted, working, and labelled.** "Experimental", "unstable",
"provisional", "preview", "subject to change". This is not a reservation. It is
a release with a disclaimer on it, and the disclaimer is the only part that is
not load-bearing: the space does what a writer needs *today*, so it is adopted
in production by people who read the label, accepted the risk, and now have a
deployment depending on the meaning. What the author retained is the right to
print a warning.

The rung is the discriminator. Ask it of any reservation in one question:
**what does a writer get, right now, by using the space I say is mine?** If the
answer is "a working behaviour", the space is not reserved, however it is
labelled, and the design freedom it was supposed to protect is already spent.

## What rung 3 actually costs, since it is never free

The author does not get to choose between *labelled* and *clean* later. Once
the space works, three costs arrive together, and all three are the author's:

- **Both spellings, forever.** The promoted name ships, the labelled name has
  to keep working, and the implementation grows a table that copies each old
  name's value into its new home. That table is load-bearing code in the
  reader, it is bigger than the feature that created it, and nothing ever
  deletes a row from it.
- **Pre-emptive adoption.** Writers do not wait for the final form. Where the
  provisional and the final name can both be present, they write both, because
  covering two readers is cheaper for them than tracking which reader is
  deployed where. By the time the syntax is settled, the field is full of
  documents carrying both, and the author is negotiating with them.
- **The design argument is over.** A constraint that arrives before the name is
  frozen costs a worse name; a shape that was shipped and adopted costs a
  compatibility programme. The "experimental" label was supposed to keep the
  first cost available, and instead it bought the second one at a discount
  nobody priced.

## Enumeration reserves only what you have already thought of

The rung decides whether a reservation holds. A second decision decides *how
much* it covers, and it is where list-shaped reservations quietly fail.

A reservation by **enumeration** — a named list of keys the host owns — can
only protect names that already exist. Every later addition to the list is a
claim on a name that writers may already have been using, and the claim is
silent: their value is simply read as the new meaning, by a reader that never
asks who wrote it. The list grows exactly when the author has a new idea, which
is exactly when the capture happens.

A reservation by **shape** cannot have that failure. Put the marker on the
*writer's* side — a trailing character, a required owner segment, one namespace
for "mine" — and reserve the whole unmarked remainder, including every name
nobody has invented yet. It is validated in one comparison rather than a
lookup, it needs no registry of owners to be checkable, and the future is
covered by construction instead of by list maintenance.

What a shape claim does not give you is protection *between* writers: two
writers both marking their keys correctly can still collide with each other.
Say so plainly rather than implying a guarantee — the collision the shape
prevents is the one that matters, because it is the one the author would
otherwise cause on every release.

## Both halves are installed when the space is opened, or not at all

This is the part that cannot be retrofitted. A space opened as free-form,
filled by writers, and then reserved key by key is in the worst of every
position: the already-taken names are readable as policy from writer-authored
data, a shape claim over the remainder would invalidate documents in the field,
and the only path to one is a migration of stored content. The reservation is
cheap on the day the space is defined and expensive on every day after it, and
the space is defined exactly once.

So the sequence at authoring time is:

1. Decide what is yours by **shape**, before there is a single document.
2. Make using it cost the writer something at rung 1 or rung 2 — refused, or
   inert and non-conforming.
3. Enforce that at **one door** the writers pass through, not at each reader
   (`_laws.md#one-validation-door`). A reservation enforced by the readers is a
   reservation enforced differently by each of them.
4. When you take a name, name it a *new* name; a reserved name whose meaning
   changed is the one change no tolerance rule protects anyone from
   (`_laws.md#identity-survives-reuse`).

## Decision rules

- **When you cannot refuse, make it inert and invalid — never inert and
  valid.** Ignoring alone is not a reservation; it is an invitation to write
  the field early, and writers accept it. The checker's verdict is what makes
  the space cost something.
- **When you must reserve inside a space writers already fill, reserve by
  refusal at the door and give the capability a field of your own.** The
  reserved name stays yours to write; the writer asks for the behaviour by a
  name you control. A policy read out of writer-authored free-form content is a
  policy anybody can set by accident, and the name's meaning has to have exactly
  one author (`_laws.md#one-authority-per-vocabulary`).
- **When a reservation has to be announced rather than enforced, say which one
  it is.** "This is a convention that prevents accidents and constrains
  nothing" is honest and useful. "Reserved" over a space that works is a
  sentence the author will be arguing with their own field about.
- **When somebody proposes an experimental namespace to protect a design in
  flight, price the alternative first.** Shipping nothing keeps every design
  option and buys no feedback; shipping the real thing behind a flag that
  *refuses to run in production* keeps the name; shipping a working labelled
  form keeps neither. The middle option is usually what was wanted.
- **When the space is already released, stop defending the reservation and
  start dating it.** Publish the transition as a field-level list, keep the old
  names readable, and tell writers which one is the one to write. A label that
  has already failed to reserve does not become stronger by being repeated.

## When not to use this

- **A space with exactly one writer.** If you own every document — an internal
  intermediate, a generated artifact read only by its own generator — there is
  nothing to reserve against, and a refusal at the door is ceremony.
- **A closed accounting.** Where the artifact's value comes from enumerating
  everything (an inventory, an attestation), there is no extension space to
  budget; an unrecognized entry is a finding, not a future feature.
- **As an argument against publishing early.** The rule says a working space is
  released, not that nothing should ship. Ship the working thing under the name
  you intend to keep, or ship it in a form that cannot be deployed. Those are
  the two honest options; a working "experimental" form is the dishonest third.
