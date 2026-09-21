---
layer: technique
type: technique
subject: quality-gates
technique: hook-hygiene
status: forged
laws: [gate-sees-target, failure-not-empty-success]
shared_with: []
use_when: [deciding whether a hook may fix what it finds, a second tool installs its own commit check, checks pass on clones where nothing ran]
---

# Hook hygiene

Commit- and push-stage gates run as hooks inside the author's working
copy — an environment the gate does not own, may share with other in-flight
work, and can silently corrupt. Hooks are guests. This technique is the
house rules: what a hook may read, what it must never touch, and how the
hook layer stays honest given that everything about it is bypassable.

## Hooks observe; they never mutate

The single most damaging hook convenience is the auto-fix: a hook that
reformats, regenerates, or re-stages content on the way into a commit.
It feels helpful and it breaks three contracts at once:

- **The author's review contract.** Content lands in the commit that the
  author never saw. The diff they reviewed and the diff that shipped
  differ — by exactly the part a machine wrote at the last instant.
- **The staging contract.** Auto-fixing a partially staged file either
  destroys the staged/unstaged split the author deliberately built, or
  fixes the working-tree copy while committing the unfixed staged copy —
  each a different flavor of committing something other than what was
  checked.
- **The shared-tree contract.** On a working copy shared with parallel
  sessions or unfinished work, a mutating hook edits state that belongs
  to someone else entirely.

The sound division: hooks **refuse and explain**; fixing is a separate,
explicit command the author runs and reviews. A hook message that says
"run the formatter, then re-stage" costs the author ten seconds and keeps
every contract intact. If a team insists on auto-fix, it belongs in the
editor-on-save loop — where the author watches it happen — never in the
commit path.

## Read the content being committed, not the tree it sits in

A commit hook's verdict is about the commit. The working tree is a proxy
for it that diverges under exactly the conditions that matter: partial
staging, parallel edits, generated files touched since staging
([gate-sees-target](../../../../_laws.md#gate-sees-target)). The discipline:

- Scope file lists to the staged set, not to directory walks.
- Where the tooling allows, check **staged content** — the bytes as they
  will be committed — not the working-tree file of the same name.
- Where it does not allow that, acknowledge the gap: a tree-reading hook
  passes or fails the tree, and the merge-rung backstop is what actually
  judges the committed content.

Conditional hooks — run the expensive check only when relevant files are
staged — are good latency engineering with a known blind spot: coupled
artifacts *not* in the commit (the source changed; the artifact that must
change with it was never staged) will not trip the condition. The
condition should key on the files that *trigger* the obligation, and the
unconditional upstream run covers the rest.

## Non-interactive, deterministic, bounded

A hook runs in whatever invoked the commit — a terminal, an editor
integration, an automation with no human attached. Therefore:

- **Never prompt.** Anything that reads from an interactive terminal
  hangs or dies in half the contexts that commit. Decisions belong in
  configuration, not in mid-hook questions.
- **Bounded time, announced budget.** A hook that sometimes takes two
  minutes converts the whole rung into a bypass generator (see
  gate-laddering's budgets).
- **Deterministic.** No network calls whose failure fails the commit; a
  hook that goes red when a registry is down teaches the team that red
  means "weather," which destroys the meaning of red for every other
  gate.

## Bypass is a feature — with a ledger

Local hooks must be bypassable: emergencies, broken tooling, and
legitimate exceptional commits all exist, and a hook that cannot be
skipped gets uninstalled, which is a bypass without a trace. The sound
posture:

- One standard bypass mechanism, documented, visible in the commit's
  context rather than hidden.
- The merge-rung backstop catches whatever the bypass let through — the
  bypass skips *feedback*, never *refusal*.
- Bypass frequency is reviewed as a gate-health metric: routine bypassing
  indicts the hook (too slow, too imprecise), not the authors.

## Extend the hook that exists; never add a parallel one

A repository has at most one hook system, and adding a second — because
the new control shipped with its own installer, or because the existing
configuration was unfamiliar — is a durable defect, not a convenience.
Both systems claim the same trigger, the order in which they fire is
incidental, an author debugging a slow commit uninstalls one of them
without knowing which controls it carried, and the "is the hook
installed?" question now has two answers that can disagree. Worse, the
second system's config is a second place to keep the rule set, which is
exactly the drift the single-authority rule forbids.

The discipline for any tool that wants a commit- or push-time control: it
contributes **one line to the repository's existing hook configuration**,
naming a script that lives in the repository. That keeps the rung's
inventory in one readable place, keeps installation a single question, and
keeps the same script available to the merge rung — which is what makes
the remote run a confirmation rather than a separate implementation (see
gate-laddering).

## Installation is a liveness problem

Hooks live in the clone, not the repository — a fresh clone has none, an
old clone has last year's. A hook that is not installed produces no
output, which is indistinguishable from a hook that passed
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)
applied to the whole rung). Mitigations, in strength order: the merge-rung
backstop (mandatory anyway), an install step wired into the project's
standard bootstrap so a working checkout implies working hooks, and a
pipeline check that the hook configuration in the repository matches what
the hooks actually run — so at least *drift* between declared and actual
hook behavior is caught centrally, even though absence on any given clone
never can be.

## When the author is an agent, the bypass is not the author's to take

"Bypass is a feature" above was written for a human author: the emergency
commit, the broken toolchain, the exceptional change a person has decided
to make and will answer for. Every clause of it — one documented mechanism,
visible in the commit's context, reviewed as a health metric — assumes the
entity taking the bypass is the entity accountable for it. When most
commits in a repository are authored by an agent, that assumption fails in
the direction that costs. An agent asked to make a commit succeed and
handed a hook that refuses has, in the skip flag, the cheapest possible
route to a green result — the exact shape of shortcut
[proposal-not-push@machine-paced-delivery](../../../continuous-integration/machine-paced-delivery/techniques/proposal-not-push.md)
catalogues, where the request was for green and green is what arrives. The
skip is not disobedience; it is a locally reasonable reading of an
underspecified goal, and a prose line forbidding it is advisory in
precisely the sessions where it will be read least carefully.

So the rule inverts at the boundary between authors, and the inversion is
about *who* may bypass, not whether bypass exists. The hook stays
bypassable, because everything in the section above still holds for the
person. The bypass is made **unreachable by the agent**, and the place to
make it unreachable is the harness's own permission layer rather than the
hook: a deny rule on the skip flag, and on the history-rewriting flags that
serve the same purpose, evaluated before every allow the session carries.
That layer is the right one for three reasons the hook cannot supply. It
fires before the command runs, so the hook is never even asked. It cannot
be argued with from inside the session, where a hook's message can be. And
it is verified the same way any refusal is — by attempting the denied
action and watching it refused — which is
[gate-liveness](./gate-liveness.md) applied to the guard on the guard.

The ledger rule survives the inversion and gains a reader. A bypass that
does occur is now, by construction, a human's, and the review of bypass
frequency is a review of what the person had to route around. What it can
no longer be mistaken for is an agent's habit, which is the reading that
would otherwise indict the hook for a failure that belonged to the brief.

The same shape applies to a repository's own escape hatch. An environment
variable that skips the push-time gate is a bypass with a different
spelling, and an agent can set it in the same command it runs; it takes the
same deny.
