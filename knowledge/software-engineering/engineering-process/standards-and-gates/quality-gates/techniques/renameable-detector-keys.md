---
layer: technique
type: technique
subject: quality-gates
technique: renameable-detector-keys
status: forged
laws: [gate-sees-target, deletion-is-not-repair, count-carries-predicate]
shared_with: []
use_when: [a check matches a list of literal names, the party being gated also authors the artifact the gate reads, a detector's findings dropped to zero after a refactor nobody reviewed, deciding whether extending a denylist is a fix, an agent is asked to make a scanner report clean]
---

# The key the author can change

[self-reported-gate-inputs](./self-reported-gate-inputs.md) covers the case
where the gate reads a record the gated party writes. This is its sibling and
the failure is one step earlier: the record can be complete and honest, and the
gate still misses, because **the key the detector matches on is something the
author can change without changing the thing being measured.**

A detector has a key — the thing it compares against. A duplicate-code scanner
keyed on identifier names. A purity check keyed on a list of product names. A
coverage rule keyed on a file path. A lint suppression counted by rule id. In
every case the check answers a question about a *property* by matching a
*token*, and the two are joined only by convention. Break the convention and
the property survives untouched while the token stops matching.

## Why this is not the false-negative problem

A missed detection is ordinary and is priced by
[false-positive-economics](./false-positive-economics.md)'s mirror image: some
share of instances will not match, the rate is measurable, and extending the
key's coverage reduces it. That reasoning is sound where the misses are
**accidental** — the key's coverage and the property's extent differ by
oversight, and the gap closes as the list grows.

It is unsound the moment the author knows the key. Then the misses are not
distributed across the population; they are concentrated on exactly the cases
the author wanted through, because renaming is the cheapest way to satisfy the
instruction "make this check pass". This is
[deletion-is-not-repair](../../../../_laws.md#deletion-is-not-repair) with the
deletion moved out of the artifact and into the *index*: nothing was removed,
nothing was suppressed, and the finding is gone. The gate reports the token it
read, never the property it was asked about
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

The distinction decides the remedy, and getting it wrong is the common error.
An accidental gap is fixed by extending the list. A concealable key is **not**
fixed by extending the list, because the list's length was never the binding
constraint — the author's freedom to move off it was. A team that answers a
bypass by adding the bypassed name has bought one round.

## The test, and it is mechanical

For any detector, ask:

> **Can the author change what this check matches on, without changing what the
> check is about?**

If yes, the key is renameable and a green result means "no listed token
present", not "the property holds". Three shapes recur:

- **Name keys.** A denylist, an allowlist, a rule id, an identifier. A synonym,
  a periphrasis, an alias, a re-export or an abbreviation refers identically and
  matches nothing.
- **Location keys.** A path glob, a directory scope, an annotation site. Moving
  the code out of scope leaves it running.
- **Population keys.** A count over items the author enrols. Not enrolling is
  free — this one is [self-reported-gate-inputs](./self-reported-gate-inputs.md).

## What a non-renameable key looks like

The property has to be recovered from something the author cannot vary while
keeping the behaviour. That usually means **normalising away the degree of
freedom the evader would use**, then keying on what is left:

- For a duplicate detector, compare **bodies structurally with identifiers
  anonymised**, so two functions that differ only in their names hash alike. The
  evasion move — rename and it is no longer a duplicate — is normalised out of
  the key before the comparison happens.
- For a location key, key on **what the code does** (an imported symbol, a call
  into a boundary) rather than where it sits.
- For a population key, derive the population from a source the gated party does
  not write.

The normalisation is the whole design, and it is chosen by naming the evasion
first: *what is the cheapest edit that keeps the behaviour and clears the
check?* Whatever that edit varies is what the key must be invariant to.

## When no invariant key exists, say so in the verdict

Some properties genuinely cannot be recovered from a token — anything that turns
on **reference** or on meaning. A rule that a document must not tie itself to a
particular product is violated identically by naming the product and by
describing it unmistakably, and no static key separates the second case from
ordinary prose. The honest response is not to abandon the check and not to
pretend it is complete. It is to **make the verdict carry its own predicate**
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)):

- the pass says *no listed token was found*, never *the property holds*;
- the check declares itself a **floor** in its own output, so a reader cannot
  mistake coverage for proof;
- the differently-keyed check that can see the rest — a review, a judgment pass,
  a human read — is named as the part that has not run, so its absence is
  visible rather than assumed.

A floor that announces itself is a working gate. A floor that reports as a
ceiling is the failure this technique exists to name, and it is the more
dangerous of the two because it retires the reviewer.

## Diagnostics

- **Findings per thousand units, over time.** A detector whose rate falls
  without a corresponding change in the code is the signature; the fall looks
  like improvement and is the thing to open. This is
  [gate-liveness](./gate-liveness.md) aimed at the key rather than at the
  wiring.
- **Bypass round-trips.** Count how often the response to a miss was "add the
  new name to the list". Two on one detector says the key is renameable and the
  team is paying interest.
- **Whether the pass states its predicate.** Read the check's own success
  output. If it names the property rather than the token, the report is
  overclaiming by construction.

## Boundaries

- [self-reported-gate-inputs](./self-reported-gate-inputs.md) owns the case
  where the *record* is author-written. This one owns the case where the record
  is fine and the *key* is author-changeable. A detector can have both defects
  and they are fixed separately.
- [oracle-frozen-during-repair](./oracle-frozen-during-repair.md) owns the
  actor's write access to the check itself. Here the check is untouched — only
  the code moved out from under it, which no freeze on the oracle prevents.
- [vacuous-by-evaluation](./vacuous-by-evaluation.md) owns a rule no input can
  violate. A renameable key can be violated; it is simply cheap to step around.
