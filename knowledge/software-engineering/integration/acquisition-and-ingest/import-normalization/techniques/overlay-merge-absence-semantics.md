---
layer: technique
type: technique
subject: import-normalization
technique: overlay-merge-absence-semantics
status: forged
laws: [unknown-is-not-a-value, gate-sees-target]
shared_with: []
use_when: [deciding what an empty collection in a patch document means, a guard over a collection passes because the collection is empty, an overlay merge erased the canonical set and the integrity check still passed, choosing between merge-by-default and wholesale replacement]
---

# Overlay merges and the meaning of absence

Sooner or later the pipeline stops proposing new entities and starts
proposing *changes to existing ones*: a re-import of the file the user
brought last month, a partial export covering only what the author edited, a
supplementary document that fills in what the first one omitted. The
document arriving second is an **overlay**, the document already in the store
is **canonical**, and the whole surface reduces to one question the design
must answer out loud: *what does it mean for the overlay to say nothing?*

Get this wrong and the failure is uniquely bad. Import's other failures are
loud — a refusal, a bad entity, a visible half-mapping. This one is a
**deletion the user never asked for, performed by a code path whose job was
to preserve**, and it arrives disguised as a successful update.

## Three states, not two

An overlay's treatment of a collection has three distinguishable inputs, and
a merge that collapses them into two is already broken:

| Overlay says | Intended meaning |
| --- | --- |
| the key is **absent** | not mentioned — keep the canonical set |
| the key is **present and empty** | ← *this is the decision* |
| the key holds **members** | the stated update |

The middle row is where designs diverge, and the divergence is real, not a
matter of one side being ignorant. One widely deployed patch convention
treats a document's values as wholesale replacements — a present-and-empty
collection means *replace with nothing*, and a distinguished explicit marker
means *delete this member*. Another widely deployed convention merges
collections by key and requires an explicit **replace directive** before any
whole-set replacement happens. Both are coherent; neither is universal.

So the rule this technique states is a **design choice, declared and
enforced**, not a law of merging: *in an import overlay, an empty collection
means "not mentioned"; wholesale replacement requires an explicit replace
marker the author had to type.* That choice is the right default here
because of who authors overlays — a foreign exporter that omits sections it
considers unchanged, or a user who edited one branch of a large document.
Under the other convention, every such omission is an erasure, and the
person who typed nothing is the person who deleted everything.

What is *not* a choice is that the three states must stay distinguishable at
every hop. An overlay parser that normalizes a missing key into an empty
collection has destroyed the distinction before the merge ever runs, and
per [unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value) it has
done the classic laundering: *not mentioned* — an unknown — has been
rendered as a definite, actionable value at the boundary where an optional
shape met a non-optional one. Whatever the merge then does, it is acting on
a fabricated instruction. Keep absence absent through parse, through the
intermediate representation, and into the merge, exactly as
[intermediate-representation](./intermediate-representation.md) keeps
synthetic entities' provenance explicitly empty rather than plausibly
filled.

## The vacuous guard

The mechanism that converts this design question into a live data-loss bug
deserves naming, because it is invisible in review and every language ships
it. A universal quantifier over a collection — *do all members satisfy
this?* — is **true of the empty collection**. There are no members to fail,
so the predicate is vacuously satisfied. Reviewers read the guard as "only
proceed when the incoming members are all safe to replace with"; what it
actually says is "proceed when no incoming member objects", and an empty
collection objects to nothing.

The measured failure: a merge whose wholesale-replace branch was gated by
exactly such a check. An overlay carrying an empty collection sailed through
the guard — every one of its zero members passed — took the replace branch,
and erased the canonical set. The guard was not bypassed, not misconfigured,
not skipped; it ran and returned true. A guard that must observe members to
mean anything therefore needs its emptiness precondition written *first and
separately*: the non-empty test is a distinct branch with a distinct
outcome, not a clause someone can fold into the quantifier later.

The general form is worth carrying out of this subject: **any predicate of
the form "all of them are X" is an authorization the empty set always
wins.** The same shape sits under "all entities validated", "all references
resolve", "all rows are covered" — each of which reports success loudest at
the moment there was nothing to check, which is the sibling of
[failure spelled as empty success](../../../../_laws.md#failure-not-empty-success)
one level down, in the guard rather than the report.

## Integrity must cover the merged result, not its ancestor

The second half of the incident is the one that makes it durable. The
canonical document was protected by an integrity digest — the mechanism that
exists to prove the file was not altered behind the system's back. It
passed. It passed because the digest was computed over the canonical content
*before* the merge wrote, and the erasure landed after. The gate observed a
state that no longer existed by the time anyone read it, which is
[gate-sees-target](../../../../_laws.md#gate-sees-target) in its purest form: a
check that runs over a proxy passes exactly when the proxy diverges from the
target, and the divergence *was* the event.

Two orderings fix it, and a pipeline should have both:

- **Digest the artifact that lands.** The integrity value is computed over
  the post-merge bytes, as the last step before they are written, and
  verified by re-reading them. A digest taken upstream of any transform
  certifies a draft.
- **Make the merge itself the checked step.** Before committing a merge,
  compare the canonical set's membership count and identities against the
  result and require the difference to be *explained* by the overlay — a
  removal the overlay explicitly asked for, or none. An unexplained drop to
  zero is a described refusal, not a write. This is the merge's own
  [count-carries-predicate](../../../../_laws.md#count-carries-predicate)
  obligation: "42 members after merge, from 51 before, 9 removed by explicit
  markers" is a sentence the merge can prove; "merged successfully" is not.

Ordering is the whole lesson, and it recurs anywhere a guarantee is
established and then something else touches the artifact — the same reason a
transform applied after a safety pass voids the safety pass rather than
inheriting it (see
[intermediate-representation](./intermediate-representation.md) on writing
after the waist).

## The overlay is still an import

Nothing about "this is only an update" relaxes the rest of the path. The
overlay is a foreign document from an untrusted source and passes
[import-validation](./import-validation.md)'s doors like any other. The
merge's *outcome* — what will change, what will be removed, what the removal
was justified by — is proposal material that renders in the gate before it
commits, because a destructive merge is exactly the case
[review-before-commit](./review-before-commit.md)'s replace policy exists to
make explicit. And a merge that removes canonical members records them in
the loss ledger with reasons, per
[lossy-conversion-disclosure](./lossy-conversion-disclosure.md): a member
deleted by an overlay is a loss the user is owed an itemization of, whether
or not the deletion was intended.

## Test the empty case on purpose

The fixture set that catches this is small and almost never written, because
every author tests the interesting overlay. Required cases, each asserting
the canonical set afterwards: overlay omits the key; overlay carries the key
empty; overlay carries the key empty *with* the explicit replace marker;
overlay carries one member where canonical had three. If the second and
third cases produce the same result, the replace marker is decorative and
the design choice is not actually enforced — it is a comment.
