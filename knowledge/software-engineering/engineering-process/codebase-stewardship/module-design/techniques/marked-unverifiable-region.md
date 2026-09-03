---
layer: technique
type: technique
subject: module-design
technique: marked-unverifiable-region
status: forged
laws: [one-validation-door]
shared_with: []
use_when: [an operation the checker cannot verify must exist somewhere, deciding whether to forbid an escape hatch or design one, auditing every place a guarantee is asserted rather than proved, a hatch is spreading because the safe path cannot express something]
---

# The marked unverifiable region

Every system has operations its checker cannot verify. A statement assembled as
text and executed by another engine. An assertion that a value is of a type the
checker cannot prove it is. A dynamic evaluation. A call that runs with more
authority than the caller. A write through a reflective path that no static
reference records. A cast across a foreign boundary. In each case a human knows
something the checker does not, and the code proceeds on that knowledge.

The naive policy is abstinence: forbid the construct, and the problem is
defined away. It does not survive contact. **Refusing an escape hatch just
drives people to a lower layer with no rules at all** — the query built by
string concatenation in a helper nobody reviews, the reflective write moved
into a configuration loader, the privileged operation done by a script outside
the application entirely. The unverifiable operation was not eliminated; its
marking was.

The correct policy is that the unverifiable region **exists, and is designed**.
Four properties make it auditable, and a region missing any one of them is not
a discipline, it is a habit.

## The four properties

**1. Marked, so it is greppable.** The construct that enters the region is
named for what it is, unmissable in review, and findable by a single mechanical
search over the tree. The population of unverifiable operations must be
enumerable by someone who does not already know where they are — otherwise
every question about the system's guarantees ("where do we assert a type
instead of checking it?") is a survey with an unknown error rate.

**2. Enclosed, so no caller reaches it without passing a checked surface.** The
region sits behind an interface whose every entry point is checkable, and there
is no other route in. This is
[one-validation-door](../../../../_laws.md#one-validation-door) with a checker
in place of a store: an unverifiable operation reachable directly by callers is
a door that has been left open beside the one everyone was told to use, and the
guarantee the enclosure was built to provide does not hold on that path. The
structural form is the one
[seams-and-adapters](./seams-and-adapters.md) states for substitution — the
door is the only way in *by construction*, so the direct route is unavailable
rather than discouraged. A region enclosed by convention is enclosed until the
next call site.

**3. As small as the operation requires, and no larger.** The region's size is
the audit's size, and the two failures are symmetric. A block enlarged for
convenience — one marker wrapped around a whole routine because writing three
of them was tedious — silently claims that every operation inside it was
examined, including the ordinary ones nobody looked at. A hatch enlarged for
scope — a raw path that relaxes more than the one discipline it needed to —
takes on every other guarantee as collateral. Minimising is not tidiness: it is
what keeps the marked population the same as the *examined* population, and
those two diverging is the exact defect the marking exists to prevent.

**4. Accompanied at each use by the written statement of the fact that makes it
valid.** Not "this is justified", not the name of the person who approved it,
not a ticket reference: the **invariant** — the thing that is true, that the
checker cannot see, and on which correctness depends. "The index is in range
because the length was checked above and nothing between can shrink it." "This
value is of that type because it came from the constructor that is the only
producer." "This text is a fixed literal and contains no caller input."

Property four is the one that turns a list of locations into an audit. Without
it, a reviewer arriving at a marked site can determine only *that* somebody
decided this was fine; with it, they can check whether the stated fact is still
true — which is precisely what changes when the code around it changes. It also
converts the region into a review artefact usable by someone who is not the
author, which is the condition under which the audit survives the author's
departure.

The acceptance test for all four together: **an audit of the region is a short
read, forever.** Short, because it is minimal and enumerable; a read rather
than an investigation, because each site carries its own reasoning; and forever
rather than once, because it is greppable, so the property is re-checkable on
any day by anyone.

## What the invariant is written against

The statement at each site is a fact about the code's *state*, and its value is
that it becomes checkable when the surrounding code changes. So it names what
must remain true, not what is currently done. "The buffer is large enough"
is the fact; "we allocated it two lines up" is an observation about today's
code that will read as still-valid after the allocation moves.

This is [module-depth](./module-depth.md)'s informal half of the interface —
the invariants a caller must establish and maintain — written down at the one
place where the compiler has stopped enforcing anything. The reason it is
mandatory here and merely advisable elsewhere is that everywhere else, a
violated invariant eventually produces a type error, a failed assertion, or a
test failure. Inside the region there is nothing left to produce one.

## The domain instance, and the neighbour

The corpus already holds the fully worked version of this for one domain:
[query-construction](../../../../backend-platform/data-layer/data-access/techniques/query-construction.md)
designs the raw-statement hatch for a query builder, with the naming rule, the
enumerability rule, and the argument against abstinence. Read it for the
concrete shape; this technique is the same design lifted off that domain, plus
the two properties a domain instance does not need to name — minimise the
region, and write the invariant rather than a justification.

Distinguish it from a **suppression**, which is a different artefact with a
different discipline.
[suppression-hygiene](../../dead-code/techniques/suppression-hygiene.md)
governs entries whose job is to make an instrument *report nothing* — they
carry a mandatory reason, they fail the run when they match nothing, and every
one names its reaper. An unverifiable region is not a silenced report; it is an
operation that was always outside the checker's reach, and it is expected to be
permanent. The two overlap on the reason requirement and diverge on everything
else: a suppression that never lapses is a defect, and a marked region that
never lapses is working as designed.

## Detecting the region that is growing

One number is worth keeping, with its predicate stated: **how many marked sites
exist, and how many distinct enclosing interfaces do they sit behind.** A rising
site count behind a stable, small set of interfaces is healthy growth — the
system is doing more of the thing the region was built for. A rising *interface*
count is the signal that matters: the safe surface cannot express something
callers need, so each new caller is opening its own hatch. The repair is at the
checked surface, not at the hatches; every one of them is a bug report about
the interface, and they are the cheapest design feedback in the codebase.

## When not to use it

**Where a verified alternative exists at acceptable cost, the marked hatch is
unpaid debt wearing a discipline's clothes.** The marking makes it look
governed, the invariant comment makes it look reasoned, and the whole apparatus
makes the cheap correct option look like the fussy one. Worse, the marking
makes it *durable*: a region with a name, a comment convention and an audit
procedure has acquired the institutional standing to survive indefinitely,
whereas the same code with no ceremony would have been replaced the first time
somebody had an afternoon.

So the order is fixed: establish that the checked path genuinely cannot express
the operation, at a cost the project can pay, **before** designing the hatch. A
region opened because the verified path was unfamiliar, or slower in a way
nobody measured, or annoying at one call site, is not an unverifiable region —
it is ordinary code with an exemption attached, and the exemption is what will
be cited by the next three people who did not want to learn the checked path
either.
