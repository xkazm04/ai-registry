---
layer: technique
type: technique
subject: quality-gates
technique: blocking-by-input-determinism
status: forged
laws: [gate-sees-target, absent-guard-is-loud]
shared_with: []
use_when: [deciding whether a check is permitted to block, a gate advisory since the day it was added, one invocation mixing deterministic and externally-moving checks, a gate whose verdict varies on an unchanged commit]
---

# Blocking by input determinism

Teams decide advisory-versus-blocking on the wrong axis. The usual reasoning is
about the findings: security is serious so it should block, style is cosmetic so
it should warn. That grades the *output*, and it produces both classic errors —
a serious check that walls unrelated work, and a trivial check nobody can be
made to fix.

The axis that holds is the **input**. Ask: *is this gate's verdict a function of
the repository's own contents?* If the same commit, checked again next month,
can produce a different answer without anyone changing anything, the gate is
reading something other than the change it is refusing
([_laws: gate-sees-target_](../../../../_laws.md#gate-sees-target)) — and it must
not block. If the answer is fixed by the commit, the gate may block, and the
only remaining question is whether the tree is clean enough yet.

## Why the input, and not the severity

A blocking gate makes an implicit promise to the author it stops: *you can make
this green, and doing so is part of your change.* When the input is
deterministic that promise is true. When the input moves on its own, it is
false in a specific and corrosive way — an advisory database publishes an entry
overnight against a transitive dependency, and the next person to open an
unrelated pull request is refused for something that did not exist when they
started and has nothing to do with what they wrote.

That refusal is a *true* positive, which is what makes it dangerous. It is not
caught by precision measurement, because the finding is real; it is only caught
by asking whether the finding is attributable to the change being gated. Each
such wall spends the same trust budget that
[false-positive-economics](./false-positive-economics.md) tracks — the author
learns that the ladder stops correct work, and the lesson is not scoped to the
gate that taught it.

The scale of the project sets the price. A team with a rotation that triages
external findings can absorb a blocking supply-chain gate, because someone is
already on the hook to land the bump. A single maintainer cannot, and the
honest configuration says so rather than pretending to a discipline nobody is
staffed for.

## Two advisory-nesses, and only one of them expires

Collapsing these is the most common mistake in the area, because both wear the
same label in the pipeline configuration.

**Debt-shaped advisory is a schedule.** The check's input is perfectly
deterministic; what fails is the current state of the tree. A style or lint gate
over a codebase with a thousand pre-existing findings cannot block on day one,
and its advisory status is a statement about the backlog, not about the check.
It carries an expiry by construction: *when our own debt is retired, this
blocks.* Anything else means the eventual cleanup lands and the gate stays
advisory out of inertia, at which point the debt is free to come back and the
cleanup is a one-time gift rather than a floor.

**Input-shaped advisory is a property.** The check reads something that changes
without the repository: an advisory feed, an upstream registry, a live service,
a model. No amount of work on the tree retires it, and a promotion trigger
phrased as "once we clean up" will never fire because there is nothing here to
clean.

The practical test: name the work that would make this gate safe to promote. If
the work is inside the repository, the status is debt-shaped and dated. If the
answer is "nothing we can do here," it is input-shaped and permanent, and
writing "revisit later" on it is a lie with a deadline.

## Split the invocation until each half is graded on its own input

Most real tools bundle both kinds of check behind one command. A dependency
policy tool that checks license allow-lists, duplicate bans, source pinning
*and* published advisories is, in one invocation, three deterministic checks and
one moving one. Graded as a unit, the whole command inherits the weakest grade:
everything ends up advisory because one of its four jobs reads an external feed.

The move is to split the command so each half can be graded honestly — the
deterministic subcommands become a blocking job (they change only when the
project changes its dependencies, and a violation is squarely the author's), and
only the feed-reading subcommand stays advisory. This is nearly always available
and nearly always cheap, and it recovers most of a bundled gate's enforcement
value. Where it has not been done yet, the honest interim is a single advisory
job whose comment names the split as the pending trigger, rather than a blocking
job that occasionally walls the world.

## An advisory gate still needs a clock and a reader

Advisory is not "off," and it is not "unowned." Two obligations survive.

A gate whose input changes without the repository **learns nothing from being
re-run on a push**, and gets no runs at all during a quiet week. It needs a
scheduled trigger of its own — the one class of check where a clock-driven run
is not redundant with the commit-driven one. Gate its siblings off that trigger
so the schedule costs one runner rather than the whole board.

And someone has to be reading the output. An advisory job whose findings reach
no human is a report with no consumer, which
[severity-by-construction](./severity-by-construction.md) already classifies as
the severity of the void. Deciding a check may not block is a decision about
enforcement, not about attention; if nobody is watching, the correct
description is that the project has no supply-chain check, not that it has an
advisory one.

## Write the decision where the gate lives

The output of this technique is three sentences attached to the gate's own
definition — the job, not a wiki page:

1. **Whether it blocks**, stated plainly.
2. **Why, in terms of its input** — deterministic given the tree, or moving
   independently of it. Naming the axis is what stops the next maintainer from
   re-litigating it on severity.
3. **The condition that changes the answer**, as a falsifiable trigger: *promote
   when the debt is retired*, *promote by splitting the command once someone is
   watching the advisory output*. Not "revisit later," which no one can
   discharge and no reviewer can call overdue.

Sentence three is the whole discipline. Without it, a non-blocking gate is an
optional guard that quietly becomes the permanent state
([_laws: absent-guard-is-loud_](../../../../_laws.md#absent-guard-is-loud)): the
gate's absence has to be a visible, deliberate, dated choice, or the default —
which is off — wins by attrition. With it, advisory status is a position with an
exit condition, and a reader a year later can see whether the exit condition has
already been met.

Keep the decision in one place. Blocking tables republished in a contributor
guide are projections, and they drift in the direction that hurts:
[policy-projection](./policy-projection.md) has the general shape, and the
instance here is a published table still describing a gate as advisory long
after the cleanup that promoted it — which tells a newcomer to skip a check that
will in fact stop them. Derive the table or delete it; a hand-copy of the
enforcement decision is a second authority for it.

## A third class: deterministic subject, nondeterministic apparatus

The two advisory shapes above both assume the verdict is *computed* reliably,
and differ only in where the input lives. One family of gates breaks that
assumption: the check **measures** rather than reads. Elapsed time, throughput,
memory high-water, a sampled resource count — re-run against the same commit,
these return a different number, and the reason is neither the tree nor an
external feed. It is the machine.

Graded on the axis as stated, such a gate answers "partly," which is the answer
that produces both errors. Blocking with a threshold loose enough to absorb a
noisy runner puts the bar above the regressions worth catching, and still walls
an innocent change on a bad afternoon. Advisory has no writable promotion
trigger — no work inside the repository retires the variance — so the gate
decays into a permanent optional guard, which is the outcome the last section
exists to prevent.

The resolution is not a third grade. It is to stop grading the measurement and
**change the input**: restate the standard as an assertion over the source text,
which is deterministic given the commit and therefore blockable by the ordinary
rule, and keep the measurement on a non-gating scheduled lane where it reports
to a person instead of refusing a change. The translation, what it deliberately
stops catching, and the scanner discipline it requires are
[operation-assertion-gates](./operation-assertion-gates.md).

The general test this adds to the axis: *what could a re-run of the same commit
produce* — and if the answer varies, ask **whether the variance is in the input
or in the instrument**, because only the first is a reason to stay advisory. The
second is a reason to pick a different instrument.

## Boundary against ratchet design

[ratchet-design](./ratchet-design.md) and this technique both appear when a
check cannot block today, and they answer different questions.

A ratchet is about a **metric that cannot be zeroed**: the input is entirely
deterministic, the gate is fully blocking, and what is negotiated is the *bar* —
a committed baseline, direction rather than absolute value, re-baselined by
review. Nothing about a ratchet is advisory; it refuses on every rise, which is
why it works. This technique is about a check's **permission to refuse at all**,
which is settled before any bar is chosen.

They compose in one direction only. Debt-shaped advisory status is the case a
ratchet is *for* — if the pre-existing findings are countable and attributable,
a ratchet converts the advisory period into an enforced monotone slope
immediately, and the promotion trigger becomes "when the baseline reaches zero,
delete it and let the rule stand plain." Input-shaped advisory status admits no
ratchet at all: a baseline over a population that grows from an external feed
measures the feed, and the first overnight publication fails a tree nobody
touched. When the reason a gate cannot block lies inside the repository, reach
for a ratchet; when it lies outside, a ratchet is the wrong instrument and the
answer is the split above.

## When the gated act is not a commit

The axis assumes the gate's subject is the tree: a verdict that moves on its
own cannot be attributed to the change being refused. Where the subject is an
**irreversible activation** — arming a live integration against real
credentials, publishing an endpoint the outside world will call, promoting a
key — the assumption inverts. What is being gated *is* the interaction with
the moving system, so a verdict computed without touching it is exactly the
false green the gate exists to prevent, and the externally-fed check blocks.

Determinism still decides something here, but it decides the outcome
vocabulary rather than the permission. Such a gate needs the could-not-run
rung [gate-liveness](./gate-liveness.md) already demands, and an upstream
transport failure resolves there: refuse to promote, spend no repair budget,
and say which of the two happened. Spelling a transport failure as failure
sends someone to repair a credential that was never wrong.

## When not to use it

Do not read this as licence to demote a gate because its findings are
inconvenient. The axis is whether the input moves independently of the tree, not
whether the tree currently fails — those are the two cases above and they have
different remedies. And do not apply the axis to checks whose input is nominally
external but effectively pinned: a schema, a policy file, or a toolchain
resolved from a committed lock is deterministic given the commit, and a gate
over it may block. The question is always what a re-run of the *same commit*
could produce, not where the bytes originally came from.
