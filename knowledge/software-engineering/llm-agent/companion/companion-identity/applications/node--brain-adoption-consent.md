---
layer: application
type: application
subject: companion-identity
technique: brain-adoption-consent
stack: node
status: forged
verified_on: 2026-10-31
verified_against: node@24
---

# A second product asking to share a companion's brain (Candi / Athena)

Personas' companion Athena keeps her durable self in `~/.personas/companion-brain`
as markdown, with every database over it an index. kp — a recruiting studio built
by the same operator — put its own operator companion, Candi, on the **same brain
root**, deliberately: one mind per person per machine. That transplant is what
forced the consent question, because kp arrives on a machine where a self may
already be standing that it did not write. kp is a Next 16 app
(`package.json:123`) over a stdlib-only Python pipeline; that pin lives here in
prose rather than in `verified_against`, whose contract is a stack runtime
version.

The header of kp's consent module states the position in one line: Candi's memory
"is a tree of markdown files on the OPERATOR'S OWN MACHINE, shared with Personas'
Athena — so kp is not entitled to create it, adopt it, or write into it until the
operator has said yes" (`app/_lib/companion-brain.ts:9-11`). The feature doc names
what it replaced: "Until WP4 the first companion turn on a fresh machine silently
birthed a mind on the operator's disk; now a first-run wizard step asks"
(`docs/features/companion/README.md:47-49`).

## The probe is the one door that creates nothing

`companion_brain.py` routes every reader through `ensure_brain()`
(`pipeline/jobfit/companion_brain.py:151-168`) — which is exactly why the question
could not be asked before it existed. The module says so above the probe: "Every
other reader in this module goes through `ensure_brain` — the probe is the one
door that must not, because a probe that births the tree has already answered the
question it was sent to ask" (`companion_brain.py:201-205`).

`probe_brain()` (`companion_brain.py:283-308`) "creates nothing, opens no index,
and never raises on a missing tree: an absent brain is a legitimate answer, not a
failure." Its four fields are the technique's four:

- **`present`** — a constitution, an identity, or an `episodes/` directory is
  enough (`companion_brain.py:295-297`).
- **`episodes`**, capped at `EPISODE_PROBE_CAP = 999` (`companion_brain.py:206`,
  `_count_episodes` at `:210-226`), because "a human reads '999+' exactly as well
  as '41 812' — so the walk stops at the cap rather than paying for an exact count
  of a tree that grows without bound." The cap is **mirrored on the TypeScript
  side as a constant rather than shipped in the payload**, with the reason stated:
  "a constant that travels can drift; the Python side is the definition and
  `test_probe_counts_episodes_capped` pins it" (`app/_lib/companion-brain-probe.ts:19-24`),
  and the UI branches on it to print words instead of a number it knows is wrong
  (`app/features/shell/setup/SetupCompanionStep.tsx:125,133-137`).
- **`identitySections`** — `## ` headings in `identity.md`, "how much of a self is
  written down. Zero on a freshly born brain" (`companion_brain.py:229-238`).
- **`constitutionOrigin`** — `kp` when the file carries this repo's marker
  `<!-- kp-constitution v1 -->` (`companion_brain.py:207`, matched in the first 400
  bytes at `:256`, stamped as line 1 of `pipeline/jobfit/companion_constitution.md`),
  `personas` when a constitution exists without it, `none` when there is none.

That third verdict is the technique's provenance-not-authorship rule, written out
in the source: "The middle verdict is deliberately a guess stated as provenance
rather than authorship: what the caller needs to decide is 'was this mind made
somewhere else', and both an Athena tree and a hand-edited one answer that the
same way" (`companion_brain.py:246-249`).

The payload is shaped rather than trusted at the HTTP boundary, and the
degradation direction is the safe one: "An unrecognisable payload becomes 'no
brain', which is the conservative direction: the wizard then offers to CREATE
one, and creation is idempotent and never overwrites"
(`companion-brain-probe.ts:65-68`, `coerceBrainProbe` at `:75-85`).

## Two arms, and the second one is keyed to kp's own writes

`companionMemoryEnabled(workspaceId)` (`companion-brain.ts:75-78`) is two lines of
code under twenty lines of reasoning. Explicit: the workspace recorded `connected`
or `birthed`. Implicit: `countBrainEntries(workspaceId) > 0`, a single indexed
`COUNT` over kp's own mirror table (`app/_lib/db/companion.ts:624-629`), where "a
row lands here only because `append_episode` put one there … so a positive count
is evidence of USE, not of installation" (`companion.ts:616-623`).

The discrimination the technique insists on is stated verbatim: the implicit arm
"is deliberately keyed on kp's OWN writes and not on the probe's `present`: a
brain that exists because Personas' Athena made it is somebody else's mind, and
adopting it silently is exactly the thing the consent gate is for"
(`companion-brain.ts:66-69`). And the stability property is checked rather than
assumed — "with memory off no episode is written, so the implicit arm can never
bootstrap itself into a yes" (`companion-brain.ts:69-71`) — with a unit test named
after it (`app/_lib/companion-brain.test.ts:76`), beside one asserting the arm is
per-tenant and not per-machine (`:65`).

**No stored `declined`.** `setCompanionBrainConsent` accepts only the two positive
states, and its doc gives the technique's argument: "'skip' writes nothing at all
rather than a third state, because a null column and an explicit refusal behave
identically (memory off) and inventing the distinction would mean claiming to
know which one an existing row was" (`app/_lib/db/workspaces.ts:141-150`; the
column comment repeats it at `app/_lib/db/core.ts:2409-2419`, and the route at
`app/api/companion/brain/route.ts:29-32`).

## Memoryless runs on the shipped constitution

The CLI's `memory` flag is the consent answer crossing into a process that has no
database (`app/_lib/companion-run.ts:207,248`; `_memory_flag` at
`pipeline/jobfit/companion_cli.py:486-494`, where "an ABSENT key means yes, which
keeps every pre-consent caller … behaving exactly as it did").

The subtle half is that a memory-off turn must not read the identity documents
either. `constitution_template()` (`companion_brain.py:186-192`) exists solely for
this: "A memoryless turn still has to behave like Candi, but `read_constitution`
calls `ensure_brain` — so using it would BIRTH the tree the operator has not
consented to yet, which is the one thing a memory-off turn must never do." The
system prompt swaps in the shipped template and the empty identity skeleton
(`companion_cli.py:297-303`). Surface-owned contracts — tone, blocks, actions,
digest — are appended from the package at assembly time and never written to disk
(`companion_cli.py:304-314`), which is the per-app-law rule holding in practice.

The mode is reported rather than inferred. The doc states the discrimination:
"The payload reports `memoryEnabled` rather than letting the caller infer it from
an empty `recallUsed`: 'she remembered nothing' and 'she may not remember' are
different facts and only one of them is fixable" (`README.md:115-118`). The dock
prints one line under its status — `Memory off - turn it on in setup.` — naming
where the switch is (`app/features/shell/companion/CompanionDockBody.tsx:232`,
`messages/en.json:12767`), "because a limitation with no stated remedy just reads
as a defect" (`README.md:120-123`).

## The question, and where it is checked

`SetupCompanionStep.tsx` asks in the technique's three shapes plus the failure:
memory already on → `AlreadyOn` states it and offers nothing, because "a 'Connect
it' button over a memory that is already connected is a control with nothing to
do" (`:102-118`); present → connect; absent → create (`ConsentChoice` at
`:121-170`); probe failed → say so and let the operator past (`:47-57`). Skip is
always the second tile and `stepSatisfied` stays default-true, "for a stronger
reason than the other optional steps: a consent question that blocks the door is
not a question" (`README.md:144-145`). The comment header rules out the fourth
option explicitly: never "start a fresh one alongside", because "one mind per
machine is the doctrine, and a second would silently split her continuity in two"
(`SetupCompanionStep.tsx:19-21`).

Execution-time re-check and create-before-stamp are both in the POST handler:
"The disk is re-read HERE rather than trusted from the GET the wizard made minutes
ago: a proposal-time check is a claim and an execution-time check is the
guarantee … Birth runs first so consent is only ever stamped over a brain that
exists" (`app/api/companion/brain/route.ts:74-77`), and a birth that somehow left
no brain refuses with `COMPANION_BRAIN_ABSENT` rather than recording a yes
(`:79`). `ensure_brain()` is idempotent and never overwrites, "A constitution or
identity on disk is the operator's file — it may have been edited, or written by
Personas' own Athena sharing this root. Re-birthing over it would silently discard
a self" (`companion_brain.py:154-156`).

The two scopes stay separate: consent is per-workspace even though the tree it
consents to is machine-wide (`route.ts:34-35`).

Re-checked 2026-10-31 at kp@6edf5d7: every quote and construct above holds at
the new anchors, and so do all three shortfalls. One addition: the probe now
returns a fifth field, `constitutionMatchesTemplate`
(`companion_brain.py:264-280`, `:283-308`; coerced at
`companion-brain-probe.ts:70-73`). It is `true` or `false` only when the origin
is `kp`, and says whether the marked constitution still matches the shipped
template byte for byte. This fills the one hole the provenance verdict admitted
(a rewritten constitution that kept the kp marker), without changing the
verdict.

## Where it falls short of the standard

**The only door to the question is the first run.** `POST /api/companion/brain` is
a general operator route, but no Settings control calls it: "turning memory on
later is one button away — but the button does not exist … The dock's memory-off
line therefore names a switch that is currently hard to reach" (`README.md:1300-1306`).
The technique's tolerance for having no stored refusal rests on the question being
cheap and re-askable; here it is re-askable only by re-running onboarding.

**The implicit arm reads an index nothing rebuilds.** kp has no reindex command,
and the doc names the second-order consequence itself: "the implicit consent arm
reads that table, so a truncated mirror on a workspace that never answered the
wizard step reads as 'no consent' and the dock goes memoryless"
(`README.md:1294-1299`). Evidence of use that lives only in a derived index is
evidence that a rebuild can erase — the substrate rule from
[disk-truth-db-index](../techniques/disk-truth-db-index.md) applied to consent: the
episodes on disk are the truth, and the arm reads the mirror.

**The consent step has never been painted by a browser.** It type-checks, lints
and its rule is unit-tested on both arms, "but no run of the wizard has drawn it"
(`README.md:1307-1309`).
