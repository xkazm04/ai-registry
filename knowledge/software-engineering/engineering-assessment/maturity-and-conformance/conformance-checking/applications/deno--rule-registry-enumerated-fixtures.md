---
layer: application
type: application
subject: conformance-checking
technique: rule-registry-enumerated-fixtures
stack: deno
verified_on: 2026-09-06
verified_against: deno@1.46.3
applied: simulation
ab_verdict: unmeasurable
proof: structural-only
---

# A four-pass lint suite that enumerates its own fixture pairing

The stack version is witnessed by the only pinned runtime in the tree — a
service image at `1.46.3`; CI itself pins the `lts` channel through its setup
action in both the lint and test workflows, so the pinned image is the tighter
of the two witnesses and the one recorded here.
The suite is TypeScript run on that runtime, reachable from the project's own
`dev lint` and `dev lint-self-test` entry points; the toolkit release the tree
carries is `0.5.6`.

## What the tree does

The suite is a registry of shell-portability rules with numbered identifiers,
declared in a rules document as `id` / `name` / `severity` / `pattern` /
`message` / `fix`. The pairing requirement is stated in that file's own header
as a MUST: every rule ships a passing and a failing fixture under a directory
named for the rule id, `fail.sh` which must trigger the rule and `pass.sh`
which must not. A separate self-test harness loads the rules document, iterates
every id in it, runs the rules pass against both fixtures, and asserts hit
counts in both directions. It is wired to CI and to a first-class command.

Three of the technique's properties are present and correct:

- The rule messages name the **incident** that motivated them — the platform
  where the construct silently misbehaves, and the symptom it produced — so the
  fixture directory reads as a case file.
- There is an inline, per-line, per-rule **waiver** comment naming a specific
  rule id, with the file's own guidance to use it sparingly and only where the
  surrounding branch makes the code provably safe.
- **Severity is kept separate from the fixture requirement**: the suite runs
  error and warning rules, and both classes carry fixtures.

The harness header also states the regression the pairing exists to catch, in
the technique's own terms: tightening a regex, loosening it, or breaking a
downstream pass without updating the fixture trips the test.

## The structural fact: the boundary is present, and it is the predicted one

The technique's boundary section says the enumeration is only as complete as
the registry it iterates, and that rule suites grow a second definition site.
This tree has one, and it is exactly the shape described.

The suite has four passes. The rules document is the registry for the
pattern-based pass only. One rule — a guard against a zero-byte plugin module —
cannot be expressed as a regex over shell source, so it is implemented in the
plugin pass in TypeScript, with its id exported as a **constant in that pass's
own module**. It is therefore outside the enumeration. The harness covers it by
a hand-maintained map, declared in the harness file with an explanatory comment,
associating a differently-named fixture directory with the rule id and its
expected hit count.

That map is the hole the enumeration was built to close, reopened by hand — and
it produced the predicted false reading during this run, on the first attempt.
Listing the fixture directories shows an unbroken numeric sequence with one id
missing, and the obvious inference is that the rule was retired. It was not: it
is live, enforced, and fixtured under a name the directory convention does not
predict. The convention holds for one of four passes, and nothing says so at the
place an auditor looks.

The failure mode is silent in the other direction too. A second code-defined
rule added without an entry in that map would simply not be asserted, and no
part of the build would go red.

## Mode and verdict, and what would make it measurable

Recorded as `simulation` at `structural-only`, and the reason is specific
rather than a shrug: the A/B this application wants is *add a code-defined rule
without a fixture map entry and observe that the harness stays green* — a
mutation of a third-party tree, which this run may not commit. The measurable
exists and is cheap for a maintainer: the count of rule ids reachable from any
pass that the self-test does not assert. Today that instrument does not exist,
because the harness has no way to enumerate the code-defined ids at all; the
constants are not collected anywhere.

What would make it measurable, in the project's own vocabulary: export the
per-pass rule-id constants into one enumerable list — the union the technique
recommends when two definition sites are genuinely necessary — and have the
self-test fail on any id in that union with no fixture. The number then reads
directly off the harness instead of off an auditor's directory listing, and the
same change removes the false-retirement reading.
