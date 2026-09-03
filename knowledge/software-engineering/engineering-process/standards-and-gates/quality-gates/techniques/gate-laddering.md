---
layer: technique
type: technique
subject: quality-gates
technique: gate-laddering
status: forged
laws: [gate-sees-target, absent-guard-is-loud]
shared_with: []
use_when: [placing each check on the rung its latency affords, local green but pipeline red on the same content, pipeline red every run while merging continues, a compile-gated branch breaks only in the pipeline, deciding whether the local rung analyzes every build configuration, a check that can only run once the program is assembled]
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
| Shipped runtime | every launch | invariants only the composed program can evaluate | yes on a developer build, advisory in the shipped artifact |

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

**Shipped runtime.** Not a lower rung but a later one — it runs after the
binding rung, in the artifact itself: a check that cannot run until the
program is assembled, and is worth re-running every time users start it. It is the one rung whose severity is set by who
is running the binary rather than by how late the stage is, and the one rung
that leaves no pipeline log — both of which are why it gets its own section
further down.

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

## The rung after merge: checks that run when the artifact starts

The four rungs above are sized by latency and all four live in a development
pipeline. Some checks cannot live there at all. An integrity invariant over a
hand-maintained mapping or registry — every mapped name resolves to something
that exists, every item is claimed by exactly one group, the declared metadata
agrees with what was actually assembled — can only be evaluated **once the
program is composed**. There is no editor rung for it and no commit rung,
because its input does not exist until assembly; and it is worth re-running in
the shipped artifact, because configuration and plugin loading can invalidate
it after the merge rung was green.

What makes this a genuinely new rung rather than a fifth column of the same
table is that **its severity splits by audience, not by stage.** Every other
rung answers "how late is this?"; this one answers "who is running the
binary?"

- **Fatal to the author.** On a developer build the defect is a hard startup
  failure. That is the fastest feedback the check can possibly give, and it
  costs a developer nothing: the program they just assembled refuses to start
  and names the entry that is wrong.
- **Advisory to the operator.** In the shipped artifact the same defect is a
  warning. Refusing to start would take a service down over one bad entry
  while every other entry is fine — a large outage bought with a small defect.

**The trap that makes the rung worth writing down: nothing observes its
green.** A runtime rung produces no pipeline log, so nobody notices when it
stops firing. Observed in the wild: the assertions had additionally been
gated on build flags such that two common configurations skipped them
entirely, and the most interesting case of all — a group that had lost every
one of its members — was skipped silently in *every* configuration, because
the loop walking the groups short-circuited above the assertion on the empty
case. An optional guard is an absent one
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)), and this
absence is invisible by construction. So a runtime rung needs a liveness proof
more than any rung in the pipeline does
([gate-liveness](./gate-liveness.md)): seed a violation, start the program in
each configuration that ships, and watch the failure arrive. The diagnostics
at the end of this document all read pipeline history; this rung leaves none
to read.

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

**A control that asks is placed differently from one that decides.** Every
control above resolves on its own — allow or refuse, in milliseconds,
with nobody in the loop. A third kind pauses until a named person
answers, and its placement follows a different rule: an asking control
inside the build loop puts a human on the critical path of *every*
session running in parallel, and at machine pace that is several
sessions, each stalled on the same person's attention. So asking controls
concentrate at stage boundaries — the merge decision, the release
authorization, the edit to a protected path that needs a ticket — where
the pause is one pause per change rather than one per action, and where
the questions can be batched. Inside the loop, a control is allow or
refuse; if it needs a human, it refuses and names the boundary where the
human will be asked. The mechanics of the pause itself belong to the
approval discipline in the agent layer; what belongs here is that
"ask" is a placement decision, and the default of putting it wherever the
action happens is the unconsidered placement this matrix exists to catch.

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

## The narrowing nobody chose: source the compiler removed

Scoping above is a trade someone made on purpose. There is a second narrowing
of the local rung that nobody decides and that no rung reports: **conditional
compilation**. A codebase that targets several operating systems, or carries
build-time feature flags, excises whole regions of its own source before
semantic analysis begins — a false predicate does not disable the code, it
removes the form from the source, and everything downstream runs on what is
left.

The consequence for the ladder is severe and easy to miss, because the rung
looks complete. On a developer's machine the formatter, the type checker, the
linter and the whole test suite run to completion and report clean over a tree
from which the other platform's implementation was deleted before any of them
looked at it. Local green means *green for this configuration*, and nothing in
the output names which one. The first analyzer that ever reads the excluded
branch is a pipeline runner on a different machine, which is the exact latency
this ladder exists to avoid — and the cost lands hardest where the author is an
agent in a loop, because a remote round-trip to discover a name that no longer
exists costs an entire cycle.

Distinguish this from an untested platform: an unexercised configuration is a
gap in *execution* coverage, and enumerating those cells belongs to the
packaging matrix. This is a gap in **analysis** coverage. The excluded branch is
not merely unrun; it is unparsed by every static instrument the project owns, so
a rename in a shared type, a changed signature, or a newly-unused import in that
branch is invisible to the author who caused it.

Two moves close it, and they belong at different layers:

- **On the rung: add a cross-configuration check, not a cross-configuration
  build.** Running the other target's binary needs that target's hardware or an
  emulator and belongs upstream. *Analyzing* it needs neither — a type-check and
  lint pass against the other target is a fraction of a full build, runs on the
  developer's own machine, and puts the excluded region back in front of every
  static instrument. Narrow it deliberately to the surface that cross-analyzes
  without the target's native toolchain and say so; partial analysis coverage of
  the excluded branch is worth far more than the none it replaces.
- **In authoring: prefer the runtime conditional over the compile-time one**
  wherever both branches can compile everywhere. A runtime conditional keeps
  both branches in front of the type checker and costs a dead branch; a
  compile-time one buys the deletion and pays with the blindness. Reserve
  compile-time exclusion for source that genuinely cannot compile elsewhere —
  platform APIs — and concentrate it in dedicated per-configuration modules, so
  the blind region has a stated boundary instead of being scattered through code
  that could have been portable.

The diagnostic to keep beside the rung's others: **how many configurations does
the binding rung analyze, against how many exist?** With platforms the answer is
small and knowable; with feature flags it goes combinatorial quickly, and the
honest posture is to name the configurations that are actually analyzed rather
than to imply all of them are.

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
