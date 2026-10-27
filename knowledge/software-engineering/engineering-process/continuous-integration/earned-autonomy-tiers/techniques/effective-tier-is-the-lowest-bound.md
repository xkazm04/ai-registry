---
layer: technique
type: technique
subject: earned-autonomy-tiers
technique: effective-tier-is-the-lowest-bound
status: forged
stage: team
laws: [unknown-is-not-a-value, gate-sees-target]
shared_with: []
use_when: [computing which rung an agent action runs at, a promotion outlived the evidence that earned it, a class ceiling was lowered after the class was promoted]
---

# The effective tier is the lowest bound

An action does not run at the rung its class was promoted to. It runs at the **lowest** of
several bounds, each owned by a different authority and each able to lower the result on its own.
The promotion is one input. Treating it as the answer is how a standing outlives the policy that
narrowed it, the tripwire that fired against it, and the evidence that once supported it.

## The bounds

Three bounds are the minimum set, and each answers a different question.

| bound | the question | who moves it |
|---|---|---|
| **record** | what rung does the (agent, class) standing currently hold? | promotion by a person; demotion by a tripwire |
| **class ceiling** | what is the highest rung any agent may hold for this class? | the policy owner, per class |
| **lease** | is the standing still current — renewed within its window, on an agent unchanged since it was earned? | time, and the agent's own identity |

The ceiling exists because some classes should never reach hands-off whatever the record says:
the class whose proof is partial, the class whose blast radius is a production environment. A
ceiling is a policy statement about the class and is independent of any agent. Lowering it must
take effect at once for every standing above it, without anyone editing those standings — which
only happens if the ceiling is applied at read time rather than baked into each standing at
promotion time.

The lease exists because evidence ages. A class promoted on last quarter's record and idle since
holds a standing nobody has re-checked; the proof job may have changed, the codebase has, the
agent may have. A lease names its window at issue, per
[creation-names-reaper](../../../../_laws.md#creation-names-reaper), and renews only while the
record keeps accruing clean actions or a person re-confirms it. The lease belongs on the rung that
takes a person off the path — hands-off — and not below it, where a person still reads every
change and an aged record costs nothing unread. A lapsed lease lowers the effective tier one rung,
not to the bottom — lapse is absence of fresh evidence, not presence of bad evidence, and it should
cost less than a tripwire. A lease timestamp that cannot be parsed has lapsed. A material change to
the agent (model, instruction set, tool grants) counts as a lapse at once.

Further bounds are additive: an incident freeze over a repository, a per-environment ceiling, a
per-path ceiling for files the class may touch. Each is another term in the same minimum.

## Why the minimum and nothing else

Any other combinator lets one bound override another. A "most recent wins" rule lets a stale
promotion override a newer ceiling if the promotion file is touched later. A precedence order
("policy beats record") is correct until someone adds a bound and slots it at the wrong level.
The minimum needs no ordering, is commutative, and has one property that matters more than the
rest: **adding a bound can only lower the result.** A new safety mechanism can never accidentally
raise anyone's autonomy, so bounds can be added by people who do not understand all the others.

The ladder has to be totally ordered for this to work, and the off-ladder states are not on it.
Human-only and quarantined are checked before the minimum, as vetoes: if either applies, the
minimum is never computed.

## Computed at the gate, from stored state

The minimum is computed by the gate, on every action, from the state it reads at that moment —
not cached at agent start, not stamped onto the action by the dispatcher, not carried in the
change's metadata. Per [gate-sees-target](../../../../_laws.md#gate-sees-target), a tier the
gate did not compute itself is a claim about a tier, and the agent's own pipeline is the last
place that claim should come from.

The computation returns the effective tier **and the bound that set it**. "Supervised, because
the lease lapsed on the 14th" is actionable; "supervised" alone sends the operator to read four
files. The binding bound also belongs in the gate's decision record, so a later audit can see
which mechanism was holding the line when a given action landed.

## Unknown is below the ladder

Every input can be missing or malformed, and each case has one answer. Per
[unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value), none of them is a rung:

- No standing recorded for the (agent, class) pair: **not enrolled**, and the gate refuses. The
  tempting answer is the bottom rung, and it is wrong because the bottom rung is still a
  standing — the agent's proposals enter a person's queue and start accruing a record. Enrolment
  at the start rung is an explicit, recorded act, the same kind of policy change a promotion is.
- A tier name the ladder does not contain: refused, and the parse failure is surfaced.
- A class the policy does not declare: unknown, and an unknown class is human-only.
- The lease timestamp cannot be read: lapsed.
- The state store cannot be reached: the gate refuses and says so.

## Whose standing it is must be unambiguous

The minimum is computed for one (agent, class) pair, so the gate has to know which agent's record
counts before it computes anything. When several agents hold a standing in the class and the
action does not name which one acted through a channel the gate trusts, the answer is a refusal,
never the most likely holder and never the highest of them. The agent's name and the class name
both arrive from the action, so look them up only against keys the state actually holds: a name
that happens to match something the lookup structure provides by itself — a default entry, an
inherited property — must not resolve to a standing.

The failure to watch for is a default in the parser — a missing field deserialised to the
schema's default value, and the schema's default chosen for convenience. Make the field required
and the read fail loudly; never let "absent" acquire a rung by accident.

One rule, many readers: the gate is not the only thing that computes a standing. A screen shows
it, a promotion helper drafts from it, a shadow raises it. All of them call the same function, or
the screen will one day show hands-off for a class the gate is holding at supervised, and the
person reading the screen is the one deciding whether to promote.

## When not to use it

A system with one class and one agent, where promotion is rare and a person reviews every
landed change anyway, gets nothing from three bounds; a single stored tier with an unknown-is-
assisted read is enough. The structure starts paying when a policy owner who is not the
promoter needs to narrow a class without touching anyone's standing, or when classes sit idle
long enough for their evidence to go stale.
