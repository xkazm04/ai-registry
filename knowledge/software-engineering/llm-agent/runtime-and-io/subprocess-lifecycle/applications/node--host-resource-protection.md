---
layer: application
type: application
subject: subprocess-lifecycle
technique: host-resource-protection
stack: node
status: forged
verified_on: 2026-10-27
---

# Node — a default ceiling on every child, the fast ones included

The same agent-fleet runner as the sibling application, plus the CI glue
scripts that drive a forge's command-line client. Citations are against
[xkazm04/afterlife](https://github.com/xkazm04/afterlife) at `009c7893`, read
on the `verified_on` date. The scout proposed this as a separate technique
("default ceiling on every child"). It is the ceiling rule this technique
already owns, applied at the door, so it is recorded here as an application,
and the one thing it taught the technique is folded into the technique's
ceilings section.

## The door's default is a ceiling, and the reason is a hook

`runner/proc/proc.ts:33-34 "No child outlives this unless its caller sets timeoutMs: git runs hooks a lane agent can rewrite to hang."`
The constant is thirty minutes, a generous ceiling and not an estimate. Its
justification is the upward lesson: git is not slow, but git runs workspace
code, and workspace code is the agent's. The timer is armed on every spawn,
with the default used when the caller sets nothing:
`runner/proc/proc.ts:162 "}, opts.timeoutMs || DEFAULT_TIMEOUT_MS);"`.
A zero or absent value falls through to the ceiling, never to "no timeout".

## The ceiling kills the tree and keeps the record

When the timer fires, the whole tree goes. The record says it timed out, as a
field separate from the exit code:
`runner/proc/proc.ts:160-161 "timedOut = true;"` followed by
`"void killTree(child.pid).then(() => done(null));"`. Tree kill is the
platform tool's tree flag on Windows and the process group elsewhere
(`runner/proc/proc.ts:36 "taskkill /T /F on Windows (the only thing that reaches grandchildren), the process group elsewhere."`),
which is why children are spawned detached on POSIX
(`runner/proc/proc.ts:155 "detached: process.platform !== 'win32',"`).

## The output budget is per child, and linear

`runner/proc/proc.ts:30-31` caps each stream at 32 MiB with the stated reason
`"a gate printing in a loop does not take the runner down"`. The tail buffer
compacts only after a quarter more has piled up
(`runner/proc/proc.ts:108-109`, `:127 "if (len > max + (max >> 2)) compact();"`),
so a flooding child costs linear time. The result says it was cut, rather than
passing a tail off as the whole output
(`runner/proc/proc.ts:12-13 "stdout or stderr passed maxOutput and only its tail was kept."`).

## The network client gets its own ceiling, below the job's

A call that gives no answer
`gitlab/components/scripts/lib/core/glab.mjs:12 "is killed and thrown with code ETIMEDOUT: a hung connection no longer holds the"`
job until the platform's own job timeout.
The default is 120 seconds, overridable by environment
(`gitlab/components/scripts/lib/core/glab.mjs:16`), with a forced kill and a
named error that carries the configured value:
`gitlab/components/scripts/lib/core/glab.mjs:20 "gave no answer in ${timeout} ms"`.
That is the nested-deadline rule. The inner clock fires first, with a
diagnosis, instead of the outer platform limit killing the job with none.

## Deviations

- **No polite rung.** The ceiling goes straight to a forced tree kill
  (`runner/proc/proc.ts:45 "process.kill(-pid, 'SIGKILL');"`). The ladder in
  termination-and-reaping asks for a stop request and a grace period first.
- **The record carries the fact, not the predicate.** `timedOut: true` does
  not say against which ceiling. A caller-set value and the default are
  indistinguishable after the fact, which the count-carries-predicate rule in
  this technique asks to avoid.
- **Spawn failure is not its own outcome.** A child that never started resolves
  with `code: null` and `timedOut: false`
  (`runner/proc/proc.ts:168-171`), the same shape as a signal death that was
  not the ceiling.
