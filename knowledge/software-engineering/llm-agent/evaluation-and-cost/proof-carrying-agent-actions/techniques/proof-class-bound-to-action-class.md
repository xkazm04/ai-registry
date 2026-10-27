---
layer: technique
type: technique
subject: proof-carrying-agent-actions
technique: proof-class-bound-to-action-class
status: forged
laws: [one-authority-per-vocabulary, claimant-does-not-adjudicate, absent-guard-is-loud]
shared_with: []
use_when: [designing the schema of a proof block, adding a new kind of agent action to a gate, an agent's change could be read as more than one kind of action]
---

# Proof class bound to action class

A proof is only checkable if the checker knows what it is supposed to prove.
"This change is safe" is not checkable; "this exploit test fails at base and
passes at head, and nothing else in the suite moved" is. The difference is a
class: each kind of action an agent may take maps to one proof class, and the
proof class lists the observations that must all be present and all hold. The
technique is the mapping, who owns it, and how the class of a given change is
decided.

## One schema per class, every field required

The tempting design is a single proof schema with optional fields — exploit
test if relevant, rescan if relevant, lockfile diff if relevant — and a checker
that verifies whatever is present. That checker verifies the proof the agent
chose to supply. A security fix that omits the exploit test and supplies a
green suite passes, because a green suite is a field the schema allows and the
checker found it valid.

So the classes are discriminated, and within a class every observation is
required. A security-fix proof carries the exploit pair, the not-weakened check,
the same-scanner rescan and the envelope check, and a security-fix proof
missing any one of them is not a weaker proof but an incomplete one, which is
inconclusive rather than passed. A dependency-upgrade proof carries a lockfile
change confined to the declared package and its resolved closure, a build at
head, and the pre-existing suite unchanged and green. A test-quarantine proof
carries the flake record that justifies it and a confinement to marker edits.
Each class's list is short, fixed, and written in one place
([_laws: one-authority-per-vocabulary_](../../../../_laws.md#one-authority-per-vocabulary)).

## The envelope belongs to the class

Each class also carries a policy envelope: which paths the change may touch,
how many lines, whether it may add dependencies, whether it may touch tests at
all and in what way. The envelope is part of the proof, not a separate lint,
because a change outside its class's envelope is not an instance of that class.
A security fix that also reformats twelve files is a security fix plus
something nobody proved. The envelope is read from policy at the base commit,
so the change cannot widen its own envelope.

The envelope binds the producer's own change and nothing else. A proof class
whose subject is a diff someone *else* wrote — a reviewer agent's findings about
a change, each of which must quote a hunk that exists — measures that diff and
records its size, but holds no envelope over it: the reviewer did not author
those paths, and failing a review because the reviewed change was large would
punish the wrong party.

The envelope is also the cheapest misclassification detector there is. A
genuine security fix declared as a dependency bump touches source and test
paths the dependency-bump envelope does not allow, and fails on the envelope
before any finer check runs. That is a good property and not a sufficient one:
an envelope catches a mislabel only where the two classes' envelopes differ.

## The class is derived, then compared with the claim

The agent declares a class, and the declaration is useful — it says which proof
the agent believes it supplied. It does not choose the class. The checker
derives the class from the change: the finding the change references as the
scanner filed it, the paths it touches, whether it edits manifests or tests or
pipeline files. When derivation and declaration agree, the class is settled.
When they disagree, the stricter class wins, or the change routes to a person,
and the disagreement is recorded; an agent that labels a pipeline edit as a
dependency bump has told you something worth knowing
([_laws: claimant-does-not-adjudicate_](../../../../_laws.md#claimant-does-not-adjudicate)).

Some changes derive to no class: they touch the gate's own configuration, the
policy, the tests in ways no class permits, or several classes at once. Those
have no automatic proof. The verdict says "human only" in so many words, rather
than falling back to the most permissive class whose envelope happened to
contain the paths.

## Unknown classes fail closed

The mapping is a closed vocabulary. A class name in a block that the policy does
not define, or a class defined in policy with no checker implementation, is not
treated as "nothing to check". Either case is a configuration defect, and the
gate says so loudly instead of passing a proof that nobody verified
([_laws: absent-guard-is-loud_](../../../../_laws.md#absent-guard-is-loud)).
Check the vocabulary when the policy is *loaded*, not when the first proof
arrives: a misspelled proof class in the policy otherwise surfaces as a gate
that blocks every change of that class forever with a reason nobody connects to
a typo, and a misspelled trigger or class list surfaces as a guard that never
fires. A policy whose class names the checker does not define does not load.
Adding a class is a change to the policy and to the checker together, reviewed
by a person, and it lands with fixtures for the new class (see
negative-fixtures-prove-the-verifier).

## Decision rules

- When designing a proof schema, discriminate by class and make every
  observation in a class required; optional evidence is evidence the agent
  chooses.
- When a change's derived class differs from its declared class, use the
  stricter of the two or route to a person, and record the mismatch.
- When a change fits no class, the verdict is human-only; never borrow the
  envelope of the nearest class.
- When a class name is unknown to the checker, fail closed and report the
  configuration defect.

## When not to use this

Early, before there is a record of what an agent's actions look like, a class
taxonomy is a guess. Start with one or two classes whose proofs are fully
mechanical and route everything else to a person; adding a class with a proof
that is half judgment produces a "proof" that is a model's opinion wearing a
schema.
