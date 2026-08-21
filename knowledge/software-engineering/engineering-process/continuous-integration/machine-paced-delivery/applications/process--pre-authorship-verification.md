---
layer: application
type: application
subject: machine-paced-delivery
technique: pre-authorship-verification
stack: process
status: forged
verified_on: 2026-08-21
---

# The pre-push gate as a distributed skill

This registry publishes the technique as an executable artifact rather than as documentation:
`skills/ci-gate-check/SKILL.md` (v1.3.0, category `ci-cd`) is the local gate, and consumers
adopt it by copying the directory. `skills/test-before-commit/SKILL.md` (v2.1.0) is the tighter
inner loop it backstops, and the two cross-reference each other explicitly.

Distributing the technique this way has a property worth naming: the method is versioned, and
`scripts/check-skills.mjs --since <ref>` fails any change to the file that does not carry a
version bump. A method that changes silently under consumers who have already adopted it is
the failure that lane exists to prevent.

## Command discovery, in the technique's order

The skill states the authority ladder as a numbered list, and its third rung carries the
argument in five words:

> 1. `.ai/manifest.yaml` -> `capabilities` (`lint`, `typecheck`, `test`, `build`)
> 2. `package.json` scripts, `Makefile` targets, `justfile` recipes, `pyproject.toml` tool config
> 3. The CI workflow itself (`.github/workflows/*.yml`) - whatever it runs IS the gate

And the never-invent rule immediately after, with its reason attached:

> Never invent a command. If a stage has no command in this repo, report it as **not
> configured** and move on; a fabricated command that "passes" is worse than a missing one.

## Stage order, and why the last one is not optional

The skill's table is the technique's order with a justification per row — `format` because it
is *"cheapest, removes noise before it reaches review"*, `typecheck` because it is *"the highest
signal per second on typed codebases"*, `test` because it is *"behaviour, the only stage that
proves intent"*. The `build` row gets a paragraph of its own, and it is the upward lesson this
application contributes back:

> The `build` stage matters more than it looks: a project can typecheck clean and still fail to
> build (a server-only import pulled into a client module, a missing asset, a bad path alias).

Three concrete mechanisms, none of which any earlier stage observes. The technique's abstract
claim that the build stage is checked nowhere else is this list, generalized.

## The verdict shape

The skill specifies the output the technique asks for, including the *not configured* state as
a distinct rendering rather than a silence:

```
format     ok      0.8s
lint       ok      4.1s
typecheck  FAIL    9.2s   src/api/user.ts:41  Type 'string | null' is not assignable to 'string'
test       -       skipped (earlier stage failed)
build      -       skipped

VERDICT: do not push. 1 failing stage, first error above.
```

One line per stage, the first real failure located inline, `-` for stages that did not run, and
an explicit instruction not to paste logs: *"Print one line per stage and one verdict. Do not
paste whole logs."* The rerun rule is stated with the interaction that motivates it: *"Do not
fix errors in bulk across stages - a lint fix routinely changes what the type checker sees."*

## The timebox rule, verbatim

> Timebox: if the full suite takes longer than a few minutes, run the affected subset locally
> and say so in the verdict (`test  ok (subset: src/api)`), so the reader knows what was proven.

The parenthetical is the whole rule: the smaller claim, honestly stated, in the verdict itself.

## Where the skill states a rule the corpus did not back

Two of the skill's rules are the `proposal-not-push` prohibition arriving early, before this
subject existed to hold it:

> **Never** disable a check to make the gate green. If a rule is wrong, change the rule in its
> config file, in its own commit, with a reason.
>
> A flaky test is a failing test until it is quarantined deliberately and tracked.

Both are correct and both were, until the continuous-integration subcategory landed, assertions
with no standard behind them anywhere in the corpus. The first is now the class list in
`proposal-not-push`; the second is `flake-lifecycle` in the test-harness subject. That is the
ordinary direction of travel for this registry — the skill lane discovers a rule under real
use, and the knowledge lane catches up and generalizes it.
