---
layer: application
type: application
subject: runner-fleet
technique: capability-typed-queues
stack: process
status: forged
verified_on: 2026-08-21
---

# One untyped pool, and a version declared eight times

This repository runs eight jobs across two workflows, and every one of them declares the same
two things by hand. It is the honest starting state the technique describes — a single-shape
fleet that correctly needs no typing, carrying the one defect that appears before typing does.

## The pool: untyped, and correctly so

All eight jobs carry `runs-on: ubuntu-latest` — six in `.github/workflows/knowledge.yml`
(`bundles`, `index`, `usage`, `signals`, `currency`, `catalog`) and two in
`.github/workflows/skills.yml` (`shape`, `version`). There is one pool, provided by the
platform, and nothing requests a capability.

By the technique's own rule this is right: *do not type a single-shape fleet*. Every job is the
same shape — a checkout, a runtime, and a first-party script with no dependencies. There is no
decision for a type system to encode, and adding one would be overhead with nothing behind it.

Worth noting what `ubuntu-latest` is, though, since the technique's naming rule bears on it: it
is a **floating** capability reference, not a pinned one. The pool it resolves to changes when
the platform moves it, which has historically moved toolchain versions underneath builds that
never changed. It is a request for "whatever is current", and that is a legitimate choice here —
these gates are pure functions of the checkout and dependency-free — but it is a choice, not a
neutral default.

## The defect: one authority, eight copies

`node-version: '20'` appears eight times, once per job, in two files:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'
```

This is exactly the smell the technique names: *"a toolchain version repeated in every job of
every workflow. Eight copies is eight places to update, seven places to forget, and a class of
failure where most jobs move and one does not."*

The failure it sets up is specific and quiet. Move seven of the eight to a newer runtime and
the eighth keeps running the old one — and because these gates are dependency-free and mostly
version-insensitive, nothing fails. The lone stale job simply stops testing what the others
test, and there is no signal at all, because a passing job that verified a slightly different
world is indistinguishable from one that verified the right one.

Per [one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary), the pin
belongs in one place the jobs reference. This repository already applies that principle
carefully elsewhere — the bundle digest lives in `scripts/lib/bundle-hash.mjs` specifically so
that `build-catalog.mjs` and `check-hash-stability.mjs` cannot hold two answers to one question,
with the reasoning written at the seam: *"two copies of a digest is two answers to 'did this
bundle change'."* The same argument applies to the runtime pin and has not been made there.

Recording it as a deviation: the standard says one pin, referenced; this repository has eight.

## The assertion the technique asks for, and where it exists

The technique asks that a job requiring a capability assert it inside the job, independently of
the match. This repository does not check its runtime version anywhere — but it does implement
the underlying instinct, thoroughly, for its *own* instruments.

`check-bundles.mjs` asserts three counts after its walk and exits 2 rather than 0 when any is
zero (`THE PARSER IS BROKEN`, `THE LINK MATCHER IS BROKEN`, `THE WALKER IS BROKEN`).
`check-skills.mjs` states the rule outright: *"a gate that walks zero files and exits 0 reports
'clean' when it means 'blind'."* `check-hash-stability.mjs` exists solely to assert a property
of the measuring instrument before the measurement is trusted.

So the *concept* — never accept a result from an instrument you have not confirmed ran
correctly — is a house rule here, applied to the checkers and not yet to the environment they
run in. Extending it is one line per job, or zero if the pin is centralized first.

## What the technique would cost here today

Very little, and that is the point of recording the state rather than the fix:

- **Centralizing the pin** is a small change with a real payoff and no downside.
- **Typing the pool** has no payoff yet. The moment a second shape of work arrives — a job
  needing a different platform, a long lane needing a bigger machine, a lane that must not share
  a runner with the untrusted one — the declaration layer earns its place. Before that it is
  configuration nobody maintains.

The technique's rule is to add a type when a measured need exists, not in anticipation. On that
rule this repository is correct today and carries one small piece of debt that is cheaper to pay
now than after the second shape arrives.
