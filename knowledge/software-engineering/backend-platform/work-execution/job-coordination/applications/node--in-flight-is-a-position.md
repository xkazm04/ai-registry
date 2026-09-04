---
layer: application
type: application
subject: job-coordination
technique: in-flight-is-a-position
stack: node
verified_on: 2026-09-04
verified_against: node@22.19.0
---

# A three-valued tool position in an agent harness (Node/TypeScript)

How `earendil-works/pi` — an agent toolkit whose harness persists conversation
and operation state so interrupted work resumes without repeating settled
effects — realizes in-flight-is-a-position. Citations are against commit
`92d8e2d1` (2026-09-04), monorepo version `0.0.3`. The stack witness is the
repository's own `engines` field (`package.json:63-65`, `node >=22.19.0`),
corroborated by every CI workflow pinning Node 22; it is not a version a
dispatch guessed.

The interesting property of this tree is that it did not arrive at the third
position value by generalizing from job queues. It arrived there from the
opposite direction — an agent loop whose "steps" are model-chosen tool calls,
where the author of the job does not know at design time which effects the run
will attempt. That inverts the usual economics and is why the mechanism is
load-bearing here rather than optional.

## 1. The position vocabulary is explicitly three-valued, per call

A tool call is not tracked by a frontier index. Each call in a batch carries
its own status, and the union is written out as
`planned | effect_pending{replay} | outcome_ready{terminate} | completed{terminate}`
(`packages/agent/docs/harness.md` §3.2). The middle two are the values a
two-valued protocol lacks: `effect_pending` means *dispatched, outcome
unknown*, and `outcome_ready` means *settled but not yet placed in the
conversation*.

The whole operation state is one member of a 13-leaf union replaced entirely
at each transition, and the specification states the reason directly: recovery
"reads it and starts at the responsible procedure, never replaying a journal or
inferring position from what is missing" (§0.3, rule 3). Invariant 5 makes it a
gate rather than a preference — "No read on a hot path may fold history or
infer state from an absent value."

## 2. The dispatch record is committed before the effect, in the same store

`publishToolIntent` is awaited before `performToolInvocation` is ever
constructed (`packages/agent/src/harness/runtime/drive/tools.ts:489-511`). The
ordering is not incidental to the call graph; the specification's write trace
shows the intent as its own atomic commit carrying the exact arguments and the
replay disposition, with the effect strictly after it:

```text
TX[ upsert pi.op.tool_args/O:s1:0, upsert pi.op.state/O = call 0 effect_pending,
                                                    replay: "never" ]
… tool deletes files; live updates u1 … u19 …
```

(`harness.md` §0.5.) There is no second store: `pi.op.state` is a bound value in
the same transactional storage as the conversation entries, and the technique's
"same transaction, same store" rule holds by construction rather than by
review.

## 3. The disposition is data on the intent, and its default is fail-safe

The replay policy is read off the tool declaration and written into the intent:

```ts
prepared.cleared.tool.replay ?? "never",
```

(`tools.ts:496`.) The `?? "never"` is the structural fact worth reporting. An
undeclared tool is treated as **not re-runnable**, so the expensive disposition
is the default and the cheap one must be earned by an explicit declaration.
That is the inverse of the ladder in step-position-and-resumability, whose
"honestly non-idempotent" rung exists precisely because undeclared steps
default to being re-run, and it is the choice a system makes when the set of
effects is open rather than authored.

## 4. The double-check across the deploy boundary is real code, not doctrine

The technique's rule that a stored re-runnable disposition must agree with the
currently declared one is one line here:

```ts
if (!cancelled && call.replay === "safe" && tool?.replay === "safe") {
```

(`tools.ts:527`.) `call.replay` is the value persisted at dispatch;
`tool?.replay` is what the tool registry says right now, after whatever deploy
happened between the crash and the restart. Disagreement, or a tool that has
disappeared from the registry entirely (`tool?` is optional), falls through to
`interruptedOutcome` (`tools.ts:535-538`). The prose states the fallback as a
rule — "If the current tool declaration is missing or no longer safe, use
unsafe interruption recovery rather than suspending"
(`packages/agent/docs/tool-durability.md:407`).

## 5. The structural fact: the mechanism is what lets the sweep skip the human

The tree confirms the technique's claim about *park* from an angle the
technique argues abstractly. Recovery here has no operator queue to fall back
on — there is no human in a restarted agent process — so a design that could
not resolve a non-idempotent frontier step would have to either re-run it or
strand the conversation. It does neither. The unsafe path composes a synthetic
`ToolResultMessage` with `isError: true`, the latest durable progress
checkpoint, and a mandatory interruption marker, and the documentation is
careful about what that flag means: "`isError: true` describes the result
delivered to the model; it does not assert that the external effect failed"
(`tool-durability.md:376`). The run then continues.

That distinction — an error *result* that is explicitly not a claim of *effect
failure* — is the same one indeterminate-closure-on-interruption makes about
not writing `failure` for an unknown outcome, reached independently and
enforced at a different layer. Two trees converging on it from different
pressures is the strongest evidence the corpus has that the status is real and
not a preference.

## 6. What this realization cannot do, and says so

The tree publishes its own limits, which is rarer than the mechanism:

- **Exactly-once external effects is a stated non-goal** (`harness.md` §0.6).
  The third position value buys at-most-once for declared-unsafe effects and
  an honest unknown; it does not buy exactly-once, and hooks are required to
  be idempotent keyed by operation id instead.
- **The provider stream is the one genuinely uncertain window** and is not
  covered by the tool mechanism at all. A death mid-stream leaves a request
  that "may have been billed and may or may not have produced output" (§0.4);
  committed frames preserve the latest partial for display but "never
  establish provider completion" (invariant 31).
- **Per-step replay inside a tool is explicitly deferred**, not solved:
  "Do not add per-step `replay: \"never\"` in this slice. Supporting it
  correctly requires a nested `planned → effect_pending → completed` state and
  an explicit unknown-outcome policy" (`tool-durability.md:485`). Whole-tool
  granularity is the shipped boundary, and the note names exactly what a finer
  one would cost — which is the same mechanism recursing.

## 7. The cost this tree pays

The technique's "when two values are correct" caveat is visible here as the
price actually paid. Every tool call costs two extra commits (intent, then
outcome staging) beyond the entry insert, and the specification's Tier B
conformance tier exists largely to police the ordering — an instrumented
decorator wrapping `Storage.commit()` asserts write order and catches "effects
before intent" and "outcomes not staged before replay becomes impossible"
(`harness.md` §9.3). A system whose steps were all naturally idempotent would
be buying nothing with that machinery. This one is not: its steps are
arbitrary model-chosen commands, and it cannot know in advance which ones
delete files.
