---
layer: technique
type: technique
subject: invariant-placement
technique: shape-with-a-not-applicable-member
status: forged
laws: [unknown-is-not-a-value, failure-not-empty-success]
shared_with: []
use_when: [a closed set of kinds has gained a member meaning none-of-these, a resolver returns its own result type to signal that it could not resolve, an exhaustive branch has an arm nobody can explain the reachability of, deciding between an absence member and an optional wrapper, auditing what the compiler actually proves about a value drawn from a named set]
---

# Shape with a not-applicable member

The Shape altitude works by subtraction. A value drawn from a closed named set
excludes the illegal combination because the illegal combination has no
expression, and nothing is checked because there is nothing to check. That is
the appeal, and it is fragile in one specific way that looks like a small
convenience at the moment it is introduced.

**Add one member to the set meaning *none of these*, and the altitude does not
merely regress — it inverts.**

The obvious half is that the illegal state is readmitted: a set that was the
proof is now a set with a hole in it. The half that does the damage is the
second one, and it runs through the checker that was supposed to be the
benefit:

> **Exhaustiveness now compels every consumer to invent a semantics for a state
> that cannot occur — and the cheapest invention that compiles is silence.**

A consumer branching on the set is required to handle every member. The
not-applicable member is one. The author of that consumer knows the value
cannot arrive; they are not permitted to say so; so they write the arm that
costs least and reads most harmlessly — return false, return empty, return
success, do nothing. The compiler demanded a decision, the author had no
decision to make, and the placeholder is now indistinguishable from a
considered one. **A mechanism whose whole value was that it forced real
decisions has been used to manufacture a fake one**, and the fake one is a
silent no-op on a path the type says is live.

## Why it is introduced, and why the reason is always local

Nobody designs this. It arrives from a resolver.

A function asks "which member of the set is this?" over an input that might not
name one — a string from a configuration file, a header, a filename extension, a
user-supplied handle. The honest return is *an optional member*. The convenient
return is *a member*, because then the caller can branch on one type instead of
unwrapping first, and the not-applicable member is written into the set to make
that possible. The convenience is entirely inside the resolver and its immediate
caller. The cost is paid by every consumer of the set that is written
afterwards, most of which have nothing to do with resolution.

That asymmetry is the reason the pattern survives review: the author who adds
the member is looking at the two call sites where it helps, and the arms it
mandates do not exist yet.

## The audit, which is cheap and mechanical

Do not reason about it. **Enumerate the producers.**

1. Find every function that returns the set.
2. For each, ask whether *any* path through it can emit the not-applicable
   member.
3. If none can — and this is the common finding, because callers of the resolver
   typically map the member onto a real fallback immediately — then every arm
   handling it anywhere in the system is dead code that the checker forced
   somebody to write.

The finding is worth stating in its full form because it sounds impossible:
there is an arm, in a live branch, over a value whose type permits the state,
which no execution can reach, whose body someone chose, and which will be
faithfully maintained by every future reader as though it meant something. If
the member ever *does* become reachable — a new resolution path, a refactor that
forwards the resolver's result one level further — the behaviour on that path is
whatever the cheapest placeholder happened to be. The most common placeholder,
by a wide margin, is the one that reports success without doing the work.

## The repair: the absence belongs to the wrapper, not to the set

The correction is small and it restores the altitude exactly.

- The set holds only the real members.
- The resolver returns an **optional** member, or a distinct result type whose
  own shape says "resolved" or "did not".
- Each caller of the resolver states its fallback **at the call site**, in the
  one or two places that actually have a policy for it — which is where the
  policy always was.
- Every other consumer branches over a set with no hole in it, and its
  exhaustiveness check goes back to being a proof.

The nesting is the point, not an inconvenience. An optional-of-set has two
levels because the situation has two questions — *did we resolve one* and
*which one* — and the flat form answered the second question with a value that
belongs to the first. Collapsing two questions into one set is precisely the
[unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value) laundering
point: an optional type meeting a non-optional one, and the optional losing.

## Recognising it under other names

The member is rarely called what it is. Watch for `Unknown`, `Unsupported`,
`None`, `Other`, `Invalid`, `Default`, `Auto`, and any member whose doc comment
is a restatement of its own name. Two further signatures:

- **The member is contagious.** Once the set contains it, every signature
  returning the set is implicitly returning "or nothing", and each new consumer
  inherits the mandatory arm.
- **The member has no data.** Real members of a kind set usually carry
  something. A bare member whose meaning is the absence of the others is the
  shape this technique is about, wearing the set's clothes.

An honest exception exists and is worth naming, because it is what the pattern
imitates: a member that models a **genuine, reachable, downstream-meaningful
state** — a kind the system really can hold, really does receive from the
outside, and really must carry through to a consumer that will act on it
differently. That member has producers, its arms are live, and it belongs in the
set. The test is the audit above, and it separates the two cases in one pass.

## Decision rules

- A member whose meaning is "not one of the others" belongs in the wrapper, not
  in the set. Return an optional member from the resolver.
- Before adding a member to a closed set, name the consumer that will branch on
  it and act differently. If none exists, the member is a resolver's convenience
  charged to everyone else.
- Audit by enumerating producers, never by reading consumers. An arm no producer
  can reach is compiler-mandated dead code, and its body was chosen for cheapness.
- Treat a silent-success placeholder in such an arm as a live defect, not as
  dead code, from the moment any refactor could make the member reachable.
- A set gains an absence member the same way a struct gains independent flags:
  locally, cheaply, and at the cost of every site that must thereafter cover a
  combination nobody intends.
