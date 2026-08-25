---
layer: technique
type: technique
subject: agent-instruction-files
technique: instruction-freshness
status: forged
laws: [count-carries-predicate, unknown-is-not-a-value]
shared_with: []
use_when: [auditing an instruction file that has not been reviewed in months, an agent confidently followed guidance that turned out stale, deciding how to record a measured fact in the file, a refactor or stack bump landed and the file was not part of the change]
---

# Instruction freshness

The instruction file is the one document the agent trusts *over its own
investigation* — that is what it is for. Which inverts the usual cost of
staleness: a stale wiki page misleads a human who cross-checks; a stale
instruction line redirects an agent that will not. A dead path is
followed, a drifted count is cited, a rule protecting deleted files
constrains work on nothing, and every one of them reads as authoritative
because it sits in the trusted layer. Rot here is worse than absence,
and the file needs a maintenance practice equal to code's.

## Claims carry their date and predicate

The durable form for any fact that can drift is *measured, dated,
attributed*: "1,135 lint warnings (measured 2026-08-14 by the baseline
script)" rather than "about a thousand warnings". The predicate makes
drift detectable — re-run the measurement, compare
([count-carries-predicate](../../../../_laws.md#count-carries-predicate))
— and the date converts a wrong number from a lie into an old
measurement, which an agent can discount appropriately. An undated claim
renders the author's decayed knowledge as current fact: unknown wearing
a value's clothes
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).
The same form governs corrections: a correction that overwrites silently
teaches nothing, while "an earlier revision named a utility that does
not exist — corrected 2026-08-14" both fixes the claim and warns the
reader that this class of claim drifts.

Volatile facts deserve a stronger move than dating: don't inline them.
State the invariant and point at the artifact that knows ("the spec
count lives in the test config; do not cite it from memory").

## The audit walks every line

Freshness work is a periodic sweep with a concrete checklist, cheap
enough to actually run:

- **Paths and commands resolve.** Every file, script, and command named
  in the file exists and runs. This is mechanically checkable — lint
  tooling for exactly this has emerged — and it should be a gate, not a
  reading.
- **Counts re-measure.** Every number with a predicate gets its
  measurement re-run; drifted numbers update with a new date.
- **Enforcement claims fire.** Every "enforced by X" is verified against
  X actually operating — the highest-stakes check, per
  [enforcement-demotion](./enforcement-demotion.md): a phantom gate
  retires the agent's caution for nothing.
- **Rules still have a failure mode.** A rule whose reason has been
  refactored away is pruned, per
  [line-earning](./line-earning.md) — deletion is the maintenance move
  prose files never get and instruction files require.
- **Machine regions are current.** Generated blocks show a recent-enough
  run of their named generator, and no fence has been hand-edited.

## Couple the file to change, not to calendars

The audit catches drift; coupling prevents it. The file joins the
definition of done for the changes that invalidate it: a stack major
bump, a command rename, a directory restructure, the deletion of
anything the file names. The practical trigger is the same one that
admits new lines — when an agent errs because the file misled it, the
fix lands in the file in the same sitting, dated. A repo that only ever
*adds* on failure and never *corrects* on failure is running half the
loop, and the halves compound in opposite directions.
