---
layer: application
type: application
subject: session-continuation
technique: advisory-guard-fail-mode
stack: node
status: forged
verified_on: 2026-09-02
verified_against: node@20
---

# Node — a hook registry derived from the installed manifest, two fail-closed entrypoints among twenty-five, and an unref'd timeout timer

The realization is the declarative hook registry and shadow dispatcher in
oh-my-claudecode (commit `e9e8fa3847ce0b3529b84d895e841988c7308f3d`, `package.json`
engines `node: "20.x || 22.x || ..."`), shipped under issue #3707 and documented in
`docs/design/ISSUE-3707-HOOK-REGISTRY-SHADOW.md`. It is the technique's registry: one
entry per installed hook with `event`, `order`, `timeoutMs`, `riskClass`, `failMode`
(`:12`), a fail mode derived from the class, and a dispatcher that enforces the timeout
and applies the fail mode with a structured record.

## Risk class by convention, derived from the installed registration

`hooks/hooks.json` is the runtime source of truth — twenty-five `command` hooks across
the harness's lifecycle events, each with a `timeout` in seconds. The registry is
derived from it, never maintained beside it: `ISSUE-3707:21` — "`buildHookRegistry(hooksJson)`
derives one declarative entry per installed command. Risk classes are assigned by
convention: only `pre-tool-enforcer.mjs` (destructive-mutation) and
`permission-handler.mjs` (security-boundary) fail closed; everything else is advisory
and fails open (owner decision 6). No hand-maintained metadata table."

The code is as short as the sentence. `src/hooks/registry/registry.ts:28-31` is the
whole hard-risk map — two entries — and `:46-48` is the derivation:

```ts
function riskClassForEntrypoint(entrypoint: string): RiskClass {
  return HARD_RISK_ENTRYPOINTS.get(entrypoint) ?? 'advisory';
}
```

Each entry then gets `timeoutMs: (hook.timeout ?? 0) * 1000` and
`failMode: failModeForRisk(riskClass)` (`:89-92`). The class-to-mode function lives in
the workflow registry so no parallel taxonomy exists (`ISSUE-3707:54`):
`src/workflow/registry.ts:61-68` enumerates the five hard-risk classes with the
comment "Only these classes fail closed. Everything else is advisory and fails open",
and `:76-78` is `failModeForRisk`. The fail-closed set is therefore enumerable from
two places a reviewer can read in a minute — the two-entry map and the five-class
list — which is the property the technique asks for.

The drift guard is `validateRegistryAgainstHooksJson` (`ISSUE-3707:23`): "unknown
lifecycle events, unparseable commands, or missing timeouts are reported."

## Bounded handlers, and a timer that cannot hold the process

`ISSUE-3707:30`: "Every handler await is bounded by its declared `timeoutMs` (no
unbounded waits; timers are unref'd so short-lived hook processes are never held
open)." The implementation is `src/hooks/registry/dispatcher.ts:71-85` — a race
between the handler and a rejecting timer, with the line the technique's rule rests
on at `:80-81`:

```ts
// Never keep a short-lived hook process alive for a shadow timer.
if (typeof timer.unref === 'function') timer.unref();
```

and `clearTimeout` in the `finally` at `:84-85`, so a handler that finishes early does
not leave a pending timer either.

## Fail open with a structured diagnostic; fail closed stops the chain

`ISSUE-3707:31`: "advisory hooks fail open with a structured diagnostic record and
later hooks continue; hard-risk hooks fail closed and stop the chain."
`dispatcher.ts:140-151` is that rule in code: on error or timeout the dispatcher pushes
a record carrying `hookId`, `event`, `durationMs`, a `status` of `timeout` or `error`,
the `errorClass`, the declared `failMode` and `riskClass`, and
`appliedDecision: failOpen ? 'fail-open' : 'fail-closed'`; then `:151` —
`if (!failOpen) break; // hard boundary: stop running further hooks`. Instrument
failure is loud by construction: the record is emitted before the decision is applied,
and an advisory hook that crashed leaves a `status: 'error'` row that the pass channel
alone would never show.

## The total-function guard with an enumerated grammar

The plugin's stateless drift guard on the `Stop` event is the technique's "total
function of the current message" in prose. `docs/HOOKS.md:244`: "The decision
classifier is stateless and final-message-local ... It does not use transcript content,
prior `AskUserQuestion` calls, firing history, counters, cooldowns, or session state."
`:246-248` enumerate the three accept forms — a direct binary question, one exact setup
sentence plus one selection closer, one contiguous option list plus a closer — with
their token grammars spelled out. `:247` states the parse rule: "The parser enumerates
every full-string syntactic parse before normalization; zero or multiple parses pass."
`:256` is the fail-open sentence: "Unlisted syntax, malformed or overlapping parses,
unsupported open-input wording, uncertain boundaries, and any attempt to combine
candidates ... across records all fail open." `:258` adds the re-entry case:
"`stop_hook_active` re-entry, environment skips, and exception handling fail open as
before." And `:259` gives the reason the technique gives — a generic Stop hook "cannot
safely infer that the assistant is in the wrong branch or has lost context without
overblocking valid work."

## Deviations and notes

- **Shadow mode only.** `ISSUE-3707:5` and `:35`: the dispatcher runs behind
  `OMC_HOOK_SHADOW` (default off) and "no output is ever merged into a runtime
  decision — behavior change is impossible by construction." At this commit the
  declared fail modes are *observed* against the legacy path, not enforced by it;
  cutover is a successor issue (#3708). The registry is real, the policy is not yet
  the runtime's. The technique's standard is enforcement at the registry, and this
  tree is one step short of it by design.
- Side-effecting handlers are not re-executed in shadow mode (`ISSUE-3707:45`); their
  equivalence is deferred to cutover via decision-shape digests. That is correct — a
  shadow that double-applied state mutations would be a second writer to the control
  store — and it means the fail-mode policy has no measured evidence yet for exactly
  the hooks that write the continuation record.
- The `timeout` field is declared per hook in `hooks/hooks.json` in seconds and
  converted at `registry.ts:89`; a hook with no timeout derives `0`, which the drift
  guard reports rather than defaulting silently.
