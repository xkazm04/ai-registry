---
layer: application
type: application
subject: agent-cli-transport
technique: dated-capability-matrix
stack: claude-code
verified_on: 2026-09-04
verified_against: claude-code@2.1.260
applied: code
ab_verdict: better
proof: ab-paired
---

# Two sessions, one version, different capability sets

The witness for the version below is the CLI's own `system/init` event,
which carries a `claude_code_version` field — the strongest witness this
subject admits, because it is the running process reporting itself rather
than a lockfile reporting what was installed. Both arms reported
`2.1.260`, and both ran on one machine, one account, minutes apart on
2026-09-04.

## The measurement

The matrix's verification ladder ranks a live run strongest, on the
grounds that it proves behaviour rather than documentation. It does — and
this measurement is about the *scope* of what it proves, not its rank.

Two headless spawns, differing only in one environment variable set on the
child process, with the `system/init` payload read and its arrays counted:

| array in `system/init` | arm A (plain) | arm B (one env var set) |
| --- | --- | --- |
| `skills` | 24 | **25** |
| `slash_commands` | 59 | **61** |
| `plugins` | 1 | **2** |
| `tools` | 30 | 30 |
| `agents` | 5 | 5 |
| `claude_code_version` | 2.1.260 | 2.1.260 |

The two commands that appear in arm B and not arm A are the authoring
surface for the capability the variable gates; the skill is its
counterpart. Nothing about the installed artifact differs between the
arms, and nothing about the account does.

The mechanism is visible in the shipped binary: the string
`overridden by the ... environment variable` sits beside `from GrowthBook
(this session's payload)` and `from GrowthBook (the disk cache of an
earlier session)`. Part of the surface is resolved from a remotely-fetched
flag payload at startup, cached on disk from the previous session, and
overridable per process. The public hook documentation for this version
describes five hook types; the binary's own schema defines six, the
sixth being the one the flag gates. Documentation and artifact disagree
because they are answering different questions, and neither is answering
the one that decides a run.

## What this says about the matrix

The row's key is incomplete rather than wrong. Three axes decide a
capability, and this stack exercises all three:

- **artifact** — `claude_code_version`, what shipped;
- **account** — the plan tier (`Workflow` is Max/Team on this CLI, which
  the consuming project already modelled);
- **session** — what the flag payload switched on when *this* process
  started.

The consequence is specific and it lands on the strongest method rather
than the weakest: a live run proves the capability existed **in that
session, on that machine, under that payload**. It does not transfer to a
colleague on the same version and the same plan, and it can differ on the
next spawn with nothing local changed. Help text and vendor docs were
already ranked below a live run; this says the live run's own row needs a
scope, not that it should be demoted.

## The consuming tree, and what it already had right

A desktop app in the fleet probes this CLI at startup for exactly these
fields, reading the same `system/init` event, and gates a fan-out feature
on the result. Two things were true of it before this measurement and one
was not.

Right already: the probe stamps its timestamp at the moment the child
reported, not at the moment the value is handed to a caller — the
freshness half of
[substituted-result-attribution](../../agent-runtime-assembly/techniques/substituted-result-attribution.md),
satisfied without the technique. Right already: the account axis was
documented in the module's own header, with the tier gate named.

Wrong: the module stated that the probe reports what is available "on this
machine + account", which is the two-axis claim this measurement refutes,
and its process-global cache returned a stored result indistinguishable
from a fresh probe. Both were corrected in one change — the scope claim
now carries the measurement above, and a `served_from_cache` flag marks a
replayed capability set so a caller cannot read a past session's surface
as the current one. The crate's type-check passed, the generated
TypeScript binding was regenerated from the Rust type rather than hand
edited, and the formatter gate was clean.

**The honest limit of the result.** The two arrays the consuming project
actually derives its feature gate from — `tools` and `agents` — did **not**
move under this flag. The change therefore records an axis that is real at
the surface the project reads, not a defect in the fields it currently
reads from that surface. That distinction is the whole reason the change
was documentation plus a replay marker rather than a re-keying of the
matrix: the axis is proven, its reach into these specific fields is not.
The return condition is a payload that moves `tools` or `agents`, at which
point the feature gate is itself session-scoped and belongs on the
matrix's **degrade** branch rather than its hide branch.
