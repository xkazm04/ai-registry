---
layer: technique
type: technique
subject: quality-gates
technique: gate-laddering
status: forged
laws: [gate-sees-target]
shared_with: []
use_when: [placing each check on the rung its latency affords, local green but pipeline red on the same content, pipeline red every run while merging continues]
---

# Gate laddering

One standard, several rungs. The ladder exists because the two properties a
gate needs — *fast enough that nobody routes around it* and *complete enough
that its green is meaningful* — cannot be satisfied by a single check at a
single point. So the same standards are enforced repeatedly, at escalating
cost, with each rung's scope sized to the latency its stage can afford.

## The rungs and their budgets

| Rung | Latency budget | Scope | Enforces? |
|---|---|---|---|
| Editor | instant | the open file | no — feedback only |
| Commit | low seconds | files in the commit | yes, bypassable |
| Push | tens of seconds | affected surface | yes, bypassable |
| Merge pipeline | minutes | everything | yes — the binding rung |

**Editor.** Squiggles at authoring time prevent more defects than any other
rung, and enforce none of them. This rung is where advisory-severity rules
earn their keep — see severity-by-construction — but nothing here counts as
a gate.

**Commit.** The budget is a handful of seconds; above that, authors start
reaching for the bypass flag, and a bypass habit at the commit rung bleeds
into a bypass habit everywhere. Only checks that are fast *and* scoped
belong here: format and lint over the committed files, secret scanning,
message-shape checks, cheap inventory checks with a clear domain trigger
(run the catalog-completeness check only when catalog files are in the
commit). Everything at this rung is scoped to what is being committed —
which immediately raises the gate-sees-target question of *what content*
gets read; that discipline lives in hook-hygiene.

**Push.** The last local rung, and the right home for checks too slow for
every commit but too valuable to defer to the pipeline: type checking, fast
unit-test subsets, contract checks between generated artifacts and their
sources. The push rung's real product is latency — the author learns of the
failure minutes before the pipeline would have told them, while the context
is still loaded.

**Merge pipeline.** Everything, over everything, in a clean environment.
Full lint with no scoping, full test suites, cross-platform builds, every
inventory and drift check at repository scope. This rung is slow and that
is acceptable, because its job is not feedback — it is refusal.

## The binding rung is the last one

Every local rung runs inside the author's machine and can be skipped —
deliberately with a bypass flag, or accidentally because the hooks were
never installed on this clone. That is not a flaw to fix; local enforcement
that *cannot* be bypassed blocks legitimate emergency work and gets torn
out. The consequence is structural:

> **Every check on a lower rung also exists on the merge rung. A check
> that runs only locally is a courtesy, not a gate.**

With one qualification that this rung cannot verify about itself: the
merge rung binds only where the merge decision has been *bound* to it,
by a separate mechanism the pipeline never observes. A check that exists
on the merge rung and is not required by that binding is in the same
position as one that runs only locally — it discovers, it does not refuse
([enforcement-binding](./enforcement-binding.md)).

The local rungs are latency optimizations over the binding rung — they move
the moment of discovery earlier; they do not move the moment of refusal.
Teams that forget this ship elaborate hook suites with no pipeline
counterpart, and the standard holds exactly until the first developer whose
clone lacks the hooks.

And the binding rung binds only if it can be green. A merge pipeline that
is red on every run — measured in the wild at *zero* successes across
hundreds of runs, for months, while merging continued — is not a strict
gate; it is no gate, because a refusal that fires on everything refuses
nothing anyone obeys. Permanent red converts the entire ladder back into
advice: the local rungs still give feedback, but the moment of refusal has
quietly ceased to exist. The pass rate of the binding rung is therefore
the first number to check when auditing any ladder — before reading a
single rule.

## Irreversible defects invert the rule

"Local rungs move the moment of discovery, not the moment of refusal" is
true for every defect whose cost is rework. It is false for defects whose
cost is **incurred at the moment of push**. A credential committed and
pushed has left the machine; the remote refusal that follows produces an
incident report and a rotation, not a prevention. The same holds for
anything that becomes public, replicated, or externally consumed the
instant it leaves the workstation.

For that class, the local rung is the *only* layer that can prevent, and
the remote rung's honest job is detection and revocation — a genuinely
different product, worth wiring differently (alert an owner; do not merely
redden a build). Two consequences follow. A local-only secret scan is not
"a courtesy" — it is the whole control, so its liveness deserves the
scrutiny a binding rung gets, including the case where it exits clean
because its scanner is not installed. And the remote counterpart must
still exist, because it is what catches the clone that never installed the
hook — it just cannot be credited with preventing anything.

## Control placement is a design decision, per control

The default ladder puts most weight on the remote rung because that is
where refusal binds. That default is worth re-deriving whenever the author
is an agent working in a loop, because the economics change: a remote
round-trip costs a whole cycle of a workflow that could have run the same
check in seconds locally, and an agent will happily execute a twenty-item
checklist before every push, which no human sustains.

The practice that makes this concrete is a **placement matrix**: for each
standard the team holds, one row naming the layer that primarily enforces
it, the concrete artifact that does the enforcing (a real hook, config, or
script — never a document-shaped placeholder), the checks the author runs
before pushing, and the short list of **hard passes** that genuinely
require the remote layer. A check earns a hard-pass slot only by needing
something the workstation cannot supply:

- a clean room — no local caches, no uncommitted state, no
  author-specific tooling;
- the full tree at a scope too expensive for any local rung;
- credentials or scanning services that must not exist on a developer
  machine;
- the merge decision itself, which is by definition remote.

Everything else is a candidate for pre-push primacy. The matrix's value is
that it makes the placement *explicit and reviewable* — the common failure
is not a wrong placement but an unconsidered one, where every new control
lands remotely because that is where the last one landed.

**Wire one script into both layers.** The strongest form of this design is
a single in-repository checker invoked identically by the pre-push hook
and by the remote job, so the remote run *confirms* what already ran
rather than discovering it for the first time. Two implementations of "the
same" check drift, and the drift surfaces as a remote failure the author
cannot reproduce — which is a bypass generator. One script also collapses
the rung-skew diagnostic below to a triviality: skew becomes impossible
except through scope.

## Scoping is a loan against the backstop

A commit-rung check that examines only the committed files is making a
deliberate trade: completeness for latency. The trade is sound under one
condition — the *unscoped* run exists upstream on the binding rung. Without
the backstop, scoped checking silently converts "the codebase satisfies the
standard" into "files touched recently satisfy the standard," and the gap
concentrates in the oldest, least-visited code
([gate-sees-target](../../../../_laws.md#gate-sees-target): the scoped gate sees
a subset and verdicts the whole).

The same logic governs *conditional* rungs — checks that trigger only when
certain files appear in the change. Conditional triggering is a fine latency
optimization and a poor completeness guarantee: the condition can be wrong,
the coupling can be indirect (the source changed but the artifact that
should have changed with it is not in the diff), and only the unconditional
upstream run closes the hole.

## One authority for the rule set

When the same rule runs at three rungs, there must be one configuration all
three read. Hand-copying rule lists into hook config, push config, and
pipeline config manufactures drift: the rule gets strengthened in one place
and the other two silently gate an older standard. The rungs may differ in
*scope* and *severity handling*; they must not differ in *rule content*
except by derivation from the single source.

## Diagnostics the ladder should emit

- **Bypass rate.** If the bypass flag is used often, the rung is too slow
  or too imprecise — measure which. A rung nobody bypasses and a rung
  everybody bypasses are both signals; only the first is good news.
- **Time-to-red.** For each defect class, which rung catches it? Defect
  classes that only ever surface at the merge rung are candidates for a
  cheaper detector on an earlier rung.
- **Rung skew.** Findings that appear at the merge rung but not at commit
  for the same content mean the rungs have drifted — different rule
  versions, different scoping, or a dead local rung.
- **The typical-commit fire set.** For a representative sample of real
  commits, which jobs would actually have run? Trigger-scoped jobs are
  each individually reasonable, and can still compose into a rung where
  the only job firing on the *median* commit is one that cannot fail —
  replaying recent history against the trigger conditions is the only way
  to see the composition.
