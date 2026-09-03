---
layer: technique
type: technique
subject: quality-gates
technique: counted-set-snapshot
status: forged
laws: [count-carries-predicate, gate-sees-target]
shared_with: []
use_when: [a regression snapshot records only totals, a change swapped one counted item for another and nothing went red, deciding what a committed baseline should contain, a recorded artifact has gone stale without any gate noticing, normalising a generated snapshot so it stops churning]
---

# Counted-set snapshot

A count-based regression snapshot records how many. It does not record
*which*, and that omission is not a rounding error — it is a whole class of
change the gate cannot see. Substitute one counted item for another and the
total is unchanged. Alter an item's content without adding or removing one
and the total is unchanged. Both pass, silently, and the artifact everyone
believes describes the current system now describes the previous one.

The corrective is one line of policy and a paragraph of care: **commit a
normalised map of the counted items alongside the count, and gate on both.**
The count answers "how many"; the map answers "which, and in what shape".
A gate holding only the first is reading a proxy for the population it
claims to govern
([gate-sees-target](../../../../_laws.md#gate-sees-target)), and the proxy
diverges from the target at exactly the substitutions the snapshot existed
to catch.

## What the total cannot see

Three shapes, all common, all invisible to a count:

- **Substitution.** One item leaves the population and another arrives in
  the same measurement window. Net zero. This is the ordinary outcome of a
  refactor, and it is also the ordinary outcome of a refactor that
  accidentally replaced a cheap item with an expensive one.
- **Mutation in place.** The item is still there and still counts once, but
  its content changed — a field added, a condition widened, a parameter
  dropped. Nothing in the count has a place to hold that.
- **Staleness by omission.** The consequence of the first two. The
  committed artifact drifts out of correspondence with reality while every
  reading stays green, and the divergence is discovered later by someone
  who trusted the artifact and should not have.

The third is the expensive one, because the snapshot's value was never the
number. It was the ability to answer "what was true then" at the moment
someone needs to compare. A snapshot that recorded only a total answers
that question with a number and no referent, which is the condition
[count-carries-predicate](../../../../_laws.md#count-carries-predicate)
names: a count travelling without what was counted will eventually be used
for a claim it does not support.

## The map: per bucket, keyed by identity, valued by multiplicity

The artifact to commit is not a list. It is, per bucket, a map from the
**normalised identity of each item** to **how many times it occurred**:

- **Per bucket, not one flat set.** The same item occurring under two
  buckets is two facts, and folding them together destroys exactly the
  attribution the ratchet's bucketing bought
  ([ratchet-design](./ratchet-design.md)). The bucket is whatever the count
  is already bucketed by — route, package, rule, phase.
- **Keyed by identity, not by position.** Order of arrival is not stable
  where the work is concurrent, so an ordered list produces a diff on every
  run for no reason. Sorting the keys makes the artifact order-independent
  and the diff meaningful.
- **Valued by multiplicity.** Two occurrences of the same item is a
  different fact from one, and the values must sum to the count snapshot —
  which is the cheap consistency check between the two artifacts and the
  reason to keep them both rather than replacing one with the other.

The diff of that map is the view a bare count cannot give: what appeared,
what vanished, and what changed multiplicity, each with its own text.

## Normalisation is the whole difficulty

An unnormalised map is worse than no map, because every incidental
difference becomes a diff, every diff becomes noise, and a reviewer who has
learned to skim the artifact is not reading it. The rule has two halves and
they pull against each other: fold away what is incidental, preserve
everything that is a real substitution.

Three moves cover most of it:

- **Fold whitespace.** Collapse runs of space and line breaks to a single
  separator and trim the ends. Reformatting the source must not read as a
  changed item.
- **Collapse variable-length argument lists to one form.** Where an item is
  emitted with a run of placeholders whose length varies with the size of
  the batch, rewrite the run to a single elided marker. A change to a batch
  size then diffs as what it is — a change in *how many* items, which the
  count already carries — instead of as a rewrite of every item that
  happened to be batched. Without this, one tuning constant churns the
  whole artifact and buries every real change in it.
- **Strip nothing that carries meaning.** Argument *values* are usually
  already absent from the emitted form; where they are not, they are the
  one thing worth eliding. Field lists, conditions and structure stay. The
  test is directional: after normalisation, a batch-size change must not
  diff, and a field added inside a nested clause must.

Normalisation is itself a derivation, so the artifact names the command
that regenerates it and the same code path writes and checks it — a
second implementation of the normaliser is a guaranteed future disagreement
about whether two items are the same item.

## Two artifacts, two failures, one gate

Keep both and fail on either. They catch different things and neither
subsumes the other:

| the artifact | goes red on | is blind to |
|---|---|---|
| the count, per bucket | items added or removed | substitution, mutation in place |
| the normalised map | substitution, mutation, multiplicity shifts | nothing the count catches that it misses |

The map is the stronger instrument and it is also the noisier one, which is
why the count keeps its place: the count's diff is short enough to read in
the pipeline log, and the map's diff belongs in the committed artifact
where a reviewer can open it. Emit both from one invocation so a single run
surfaces both, and combine the exit codes so either failing fails the gate.

## When not to

- **When the item has no stable identity.** If normalisation cannot produce
  a key that survives an unrelated edit, the map will churn on every change
  and be ignored within a month. Fix the normaliser or do not ship the map.
- **When the population is enormous.** A map of hundreds of thousands of
  items is not a review artifact; it is a database. Bucket harder, or
  snapshot the identities only for the buckets whose contents anyone would
  actually inspect.
- **When the count is the whole claim.** Some metrics genuinely are
  scalars — total weight, elapsed budget. There is no set underneath, and
  inventing one adds an artifact nobody can act on.

## Boundary

[ratchet-design](./ratchet-design.md) owns the baseline's **direction**
discipline: which way it may move, who may move it, and what an unexplained
drop means. This technique owns the baseline's **contents**: what the
committed artifact must hold for a diff against it to mean anything. A
ratchet over a count-only baseline is a well-governed direction on an
under-specified quantity — correct about movement, blind to substitution —
and the two techniques compose without overlapping.

## Decision rules

- Commit the normalised identity map beside the count; gate on both.
- Bucket the map the way the count is bucketed; sort the keys; carry
  multiplicity.
- Fold whitespace and collapse variable-arity argument runs; preserve
  structure and fields.
- Verify the normaliser directionally: a batch-size change must not diff, a
  nested field addition must.
- Name the regenerating command in or beside the artifact, and let the same
  code path write and check it.
- Skip the map where identity is unstable, the population is unreviewable,
  or there is no set underneath the number.
