---
layer: technique
type: technique
subject: extension-trust-boundary
technique: unenforced-collision-is-a-documented-capability
status: forged
laws: [silent-state-is-ungoverned, absent-guard-is-loud, gate-sees-target]
shared_with: []
use_when: [a hazard exists and the check for it does not, an extension can shadow a path the host serves, writing the security note for an extension mechanism, deciding what to say about a deferred enforcement item]
---

# An unenforced hazard is a capability, and capabilities get written down

Two extensions may claim the same handler path. So may an extension and the
host. Nothing checks; registration order decides; the last registration wins.
The shadowed path keeps its address and changes its behaviour, with no error,
no warning and no log line, and its callers have nothing to attribute the
change to. The check was deferred to a follow-up.

That is the shape of the problem this technique is about, and the problem is
not the collision. It is what a design document does when a hazard is real, the
trusted party can trigger it, and no mechanism exists to stop them.

## The three responses, and why two of them mislead

**Omit it.** The reader concludes it cannot happen — that is what silence about
a hazard means in a document that discusses hazards. The knowledge stays inside
the heads of the three people who discussed it, where nothing downstream can
act on it ([silent-state-is-ungoverned](../../../../_laws.md#silent-state-is-ungoverned)).

**Promise the check.** "Conflict detection will be added" describes a system
that does not exist, in a document readers use to reason about the one that
does. Worse, it is load-bearing in the wrong direction: someone plans a
deployment around a guarantee whose ship date nobody owns.

**Disclose it as a capability.** State that an enabled extension **can** shadow
any path including the host's own, name the resolution rule, and place the
statement where the trust model is described rather than in a changelog. This
is the only response that leaves the reader's model matching reality.

## The disclosure has four required parts

A disclosure with only the first part is a disclaimer. All four, or it does not
do its job:

**1. Who holds it.** Name the party, and let the naming bound it: *an extension
the operator has explicitly enabled* can do this — not any installed package,
not a remote caller. Bounding the capability to a party who already had
unrestricted execution inside the process is what turns an alarming sentence
into an accurate one, and it is why the disclosure does not have to be a
release blocker.

**2. The exact mechanism and its resolution rule.** Not "conflicts are
possible" but "paths are not checked for uniqueness and the last registration
wins". A reader can act on the second sentence — they know that ordering
matters, that overriding is achievable and reversible, and what a fix would
have to change.

**3. An observation that would reveal it.** Tell the operator to inspect the
**live surface** after startup — the actual set of paths the running server
serves — and compare it with what was expected. This is the load-bearing part
and it is specific: read the running system, not the configuration that was
supposed to produce it, because the configuration is precisely what a
last-write shadow does not contradict
([gate-sees-target](../../../../_laws.md#gate-sees-target)). An operator who
diffs the live surface against a recorded baseline has a real check, built out
of a documented step, while the host's own check does not exist.

**4. A convention for the author, labelled as a convention.** Publish under a
distinct prefix of your own, so accidental collision becomes vanishingly
unlikely. Say plainly that this avoids accidents and does not constrain
decisions: an extension that wants to shadow a path still can, and a convention
that is described as if it prevented that would put the reader's model back
where it started. Then close the loop — **a deliberate override is legitimate
and carries a disclosure obligation of its own**: an extension that claims a
core path on purpose says so in its own documentation, in the place an operator
reads before enabling it. The host cannot make that statement on the author's
behalf; what the host can do is make the obligation explicit in the contract,
so an author who overrides silently has broken a stated rule rather than
merely surprised somebody.

## Record that the check is absent, and where the decision lives

Add one line saying enforcement was considered and deferred, with a pointer to
where that decision is tracked. This costs nothing and does three things: it
tells a contributor the gap is known so they do not re-litigate it in a review;
it makes the eventual check a *compatible* change rather than a surprise, since
readers were told collisions are currently permitted; and it prevents the
worst outcome for an absent guard, which is a reader assuming a guard exists
because the topic was discussed without a verdict
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).

## The pairing: coverage boundaries are disclosures too

The same discipline applies to a fact extension authors get wrong constantly.
Where a host authenticates its request surface, that authentication is often
scoped to a **path prefix**, not to the server. Everything under the prefix is
checked; everything outside is open, and the outside set is larger than anyone
remembers — health, metrics, introspection, and any surface an extension just
attached.

Prefix scoping has a consequence that is worth stating on its own, because it
is the part readers do not derive: **protection becomes a property of the
address, not of the capability.** A function reached under a covered prefix is
authenticated; the same function reached under an alias outside it is not. And
aliases accumulate for reasons unrelated to security — a compatibility path for
one hosting platform, a shorter spelling, an operational control added next to
the health check. The result is a set of unauthenticated paths that includes
some that reach exactly what the authenticated ones reach.

So the disclosure is not a sentence about a prefix; it is an **enumeration of
both sets**. Every covered path, every uncovered one, each with what it can do
and what makes it present in a given configuration — and the aliases called
out by name, because "reaches the same functions as the protected path" is the
single most useful line in the whole document. Enumerating only the covered set
tells a reader nothing about the size of the other. The enumeration is also the
part that rots: it is regenerated from the live surface, not maintained by
memory, or it becomes a description of last year's server
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

Against that background, the extension contract states which prefix is covered
and what sits outside it today. It states the consequence in
the author's own terms — *if your handler is outside the covered prefix it is
unauthenticated, and the host will not tell you* — and it notes the tension
with the collision convention, because taking a distinct prefix is exactly how
a handler lands outside coverage. Each extension then makes one of three
choices deliberately: attach under the covered prefix, authenticate its own
handlers, or declare its surface deliberately open. All three are acceptable;
making the choice by accident is not.

## Decision rules

- If a cheap check exists and works, ship the check. Documentation is not an
  alternative to enforcement that is available.
- If the hazard is reachable by a party **outside** the trust boundary, it is
  not a capability, it is a vulnerability. Disclosure is not a response; fix it
  or do not ship the feature.
- If the capability is bounded to a party who already holds unrestricted
  execution in the process, disclosure is proportionate and a release blocker
  is not.
- If you cannot name an observation that would reveal the capability in use,
  keep working — a disclosure with no observation attached is an apology, and
  the missing observation is usually the cheapest part of the eventual fix.
- When the check finally ships, the disclosure becomes a compatibility note
  ("previously permitted, now rejected"), not a deletion. The people who
  deployed against the old behaviour are the reason it was disclosed.

## When not to use this

- **As a substitute for a fix that is in reach.** The technique is for the
  state where no check exists; using it to avoid writing one is exactly the
  cop-out it is mistaken for.
- **For a hazard with no trusted holder.** If anyone can trigger it, see the
  decision rules — this is not the tool.
- **For routine incompleteness.** Not every unfinished thing is a capability
  disclosure. Reserve it for hazards where a party can silently change what
  another party observes; a missing convenience feature is a backlog item.
