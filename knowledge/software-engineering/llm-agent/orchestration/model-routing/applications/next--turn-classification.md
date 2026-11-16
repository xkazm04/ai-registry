---
layer: application
type: application
subject: model-routing
technique: turn-classification
stack: next
verified_on: 2026-11-16
verified_against: next@16
applied: simulation
ab_verdict: better
proof: structural-only
---

# The class boundary exists at the contract layer and is explicitly denied at the routing layer

A code-assessment product built on a server-rendered React framework routes every
model call through one provider layer. Witness for the version read: the
framework at `^16.3.3` in `package.json` — a range rather than a lockfile pin, so
the minor is the honest resolution — and the provider modules under
`src/lib/llm/`.

This is the fourth call-class axis — whether a call *decides* what an artifact
should be or *renders* the surface a person receives — tested against a tree that
turns out to have drawn exactly that line already, for a different reason, and
then routed across it as if it were not there.

## A: the seam as it is

Two things are true at once in this codebase.

The **contract** layer already separates the two roles, deliberately and with the
reasoning recorded. The scan path's provider method is shaped around a single
structured contract, scored input to scored assessment. A second text seam exists
precisely because the non-scan surfaces — an organisation-memory write gate and
reflection pass, and the interactive chat turns — need free-form judgment and own
their own schemas. The module's own header states the split and why it had to
exist.

The **routing** layer refuses the same distinction, also deliberately. The text
seam's header says it is not a second provider path: it reuses the same provider
resolution so that "which provider, and is it usable here" has exactly one answer
in the codebase. Downstream, the model id is resolved by one function taking an
optional override, falling back to an environment variable and then a single
constant (`src/lib/llm/bedrock.ts`), and the reasoning budget is read by a
zero-argument function from one environment variable
(`src/lib/llm/config.ts`) and applied to every request that passes through the
client.

The consequence is that **no call site asserts anything about what it is**, and
the routing table has no vocabulary to consult. The technique's rule that an
unclassified call must fail loudly cannot even be stated here: unclassified is
the only condition.

## B: the same seam with the axis added

Three real call classes are already distinguishable in the tree, and they want
different contracts:

1. **The scan assessment leg** — structured verdict, its own retry, failover and
   budget policy, degrading to a deterministic floor when every attempt fails.
   Nothing about it is read as prose; the blast radius of a bad answer is a wrong
   score in a report, and it is the product's main output.
2. **The organisation-memory write gate and reflection pass** — background
   judgment, no human waiting, individual errors washing out at volume.
3. **The interactive chat turn** — a human synchronously watching, long-form
   free text, and the one class where register is what the user experiences.

Under the technique these are three classes against the existing axes, and the
fourth axis is what separates the third from the first two: one renders a surface
a person reads, the others decide something a machine consumes. The dial the tree
already has — a single global reasoning budget — is the technique's own
"calibrate per class, not globally" violated at the smallest possible scope, and
raising it to help the chat turn currently pays for reasoning on every scan call
as well.

## Predicted outcome and the falsifier

Adding a caller-asserted class and mapping it to tier and effort in one place is
predicted to be **small** here rather than a refactor, because the two hard parts
are already done: the call classes exist as separate functions with separate
schemas, and provider resolution is already funnelled through one site that takes
an optional override. The change is to thread a class argument through that site
and give the reasoning budget a per-class lookup instead of a bare environment
read.

**What would falsify it:** if the org-memory gate and the chat turn cannot be
separated at the call site — if both genuinely enter through the shared text seam
with no caller-distinguishable entry point — then the vocabulary would have to be
inferred from content, which the technique forbids, and the honest outcome is two
classes rather than three. That is checkable by enumerating the callers of the
text seam, and it is the first thing an implementer should do.

## Verdict

`better`, at simulation. The tree states the boundary in its own documentation and
then routes across it, which is the strongest form of this finding: nobody has to
be persuaded the distinction is real, because the codebase already argued for it
in a header comment. The cost of adopting is bounded by the fact that the classes
exist; the benefit is that the reasoning dial and the tier stop being one setting
shared between a scoring pass and a conversation.

## What this realization cannot do

The simulation predicts effort and shape, not quality. Nothing here measures
whether a different tier actually serves the chat turn better than the scan leg's
tier — that needs the blind preference instrument the corpus describes, and this
tree has no such harness, so the class split would ship as structure with its
routing table still populated by one model until somebody measures. Recorded as
the return condition on this row.

## Re-read at `54a9800`, 2026-11-16: the class arrived, and it routes everything but the model

Re-checked against a shallow clone of the public repository at `54a9800`
(master, 2026-11-11), with `next` at `^16.3.8`. **Section A no longer
describes the tree.** The prediction of a small adoption came half true.
The half that came true is the half this technique cares about first.

- **The caller now asserts a class, and an untagged call cannot compile.**
  `LlmLegKind` (`src/lib/llm/leg.ts:45`) is a closed vocabulary of six
  classes: `scan`, `memory`, `athena_turn`, `athena_cycle`, `briefing`
  and `lane_summary`. It is a required field on `TextRunnerOptions`
  (:139) "deliberately WITHOUT a default", for the technique's own reason:
  "the caller that forgets to tag itself is exactly the one you needed to
  see". "Fails loudly" is enforced by the type checker. The file was present
  at the shallow clone's earliest reachable commit, `e2d1291a`
  (2026-09-17), so it landed within two weeks of this application.
- **The falsifier resolved in favour of three classes, and more.** The
  memory passes, the interactive turn and the unattended background pass
  are separate call-site tags. The write gate and the reflection pass share
  `memory`, and the tree says it has no signal to split them without a
  restructure.
- **The class selects the temperature, the meter tag and the lane, not the
  tier or the effort.** `llmTemperature(legKind)` gives the chat legs their
  own knob, while scan stays pinned for score reproducibility
  (`config.ts:90-125`). A declared lane table (`lane-routes.ts:38`)
  records, per class, whether an org's own provider answers it, with a
  contract test driving each lane's real resolver. The model is still
  resolved once per provider: `resolveLegRunner` (`text.ts:167`) never
  reads `legKind`, and `resolveBedrockModel` (`bedrock.ts:51`) is still
  override, then environment, then constant.
- **The global reasoning budget no longer reaches the chat turn.**
  `thinkingBudgetTokens()` (`config.ts:380`) is read only by the scan
  path's `assess` (`bedrock.ts:124`). The text-seam transports send no
  thinking configuration. Section B's "raising it to help the chat turn
  currently pays for reasoning on every scan call" is now false in the
  other direction: raising it cannot help the chat turn at all.

The verdict stands as `better`. The tree adopted the vocabulary and the
fail-loudly rule. The class-to-tier and class-to-effort columns, which are
where this technique's cost lever lives, are still empty. The return
condition is unchanged: a measured reason to put a different model behind
`athena_turn` than behind `scan`.
