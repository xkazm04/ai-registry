---
layer: golden-path
type: golden-path
subject: ci-execution-trust
status: forged
use_when: [deciding what a delivery system may make your machines run, a pipeline needs a publishing credential, accepting contributions from outside the team, reviewing what a build step can reach]
techniques:
  - control-plane-execution-boundary
  - job-instruction-signing
  - injected-code-scope-ladder
  - untrusted-contribution-lanes
  - measure-apply-split
  - per-call-write-token-handout
  - self-edited-ci-forfeits-evidence
  - evidence-pipeline-provenance
  - secret-materialization-discipline
---

# CI execution trust

A delivery system is the one piece of infrastructure that is *designed* to take instructions
from one place and execute them, with credentials, on machines that can reach production. Every
other system in the organization is hardened against exactly that. This subject is about the
trust relationships that arrangement creates, and about the fact that most teams have never
enumerated them.

The question that organizes everything below is deliberately blunt:

> **If the thing that tells your machines what to run were compromised, what would happen?**

For most delivery setups the honest answer is "everything, immediately, with the deployment
credentials attached, and nobody would know until afterwards". That answer is not a scandal —
it is the default, and it is affordable for a long time. What is not affordable is not knowing
it, because the mitigations are cheap and ordered, and a team that has never asked the question
buys them in the wrong order or not at all.

Three trust relationships exist whether or not anyone has named them:

- **The orchestrator is trusted to say what runs.** Something decides which commands land on
  your machines. Whatever that something is — a hosted service, a self-run server, a file in
  the repository — it holds the power to run arbitrary code as the build identity.
- **The repository is trusted to say what the commands are.** Anyone who can change the build
  definition can change what executes. That set of people is almost always larger than the set
  anyone would name if asked, because it includes everyone who can land a change to any file
  the build reads.
- **The runner is trusted with what it holds.** Credentials, caches, previous jobs' leftovers,
  network reachability. A runner is a machine with production access sitting in a room where
  arbitrary code executes on demand.

The subject's boundary: where a credential is *stored* is
[credential-vault](../../../security/identity-and-access/credential-vault/credential-vault.md); what a *dependency*
brings with it is [supply-chain](../../../security/code-provenance/supply-chain/supply-chain.md); what
signatures over *published artifacts* prove is
[signed-artifacts](../../../security/code-provenance/signed-artifacts/signed-artifacts.md). What is here is the
execution path itself — the trust boundary a job crosses on its way to running.

## Name the boundary before hardening anything

Draw the line between what **decides** work and what **performs** it, and write down what
crosses it. In a hosted arrangement the decider is somebody else's service and the performers
may be your machines; in a self-run arrangement you own both; in the common hybrid the decider
is external and the performers are internal, which is the configuration with the most surprising
consequences and the one people adopt without noticing they have.

Once the line is drawn, the useful questions become answerable: what instructions cross it,
what identity do they arrive as, what could a compromised decider make a performer do, and what
would be left behind afterwards. Per
[gate-sees-target](../../../_laws.md#gate-sees-target), a control that sits on the wrong side of
that line is not a control — it is a suggestion the other side may ignore. The mapping
procedure, the three arrangements and what each one actually implies are
[control-plane-execution-boundary](./techniques/control-plane-execution-boundary.md).

## The strongest available answer is to stop trusting the decider

If instructions are signed where they are authored and verified where they are executed, a
compromised orchestrator can delay, reorder or drop work — but it cannot invent work. That is a
large reduction in what a single compromise buys, and it is achievable with ordinary
asymmetric-signature machinery: the authoring side holds a private key, the executing side holds
only public keys, and a job that does not verify does not run.

It is also the most expensive control in this subject, and the one most often adopted before
the cheap ones. State plainly what it does and does not cover: it covers the instructions, not
the code they check out; it requires that the executing side genuinely lacks the signing key,
which means separate identities rather than separate directories; and it needs a key-rotation
story from the first day, because a signing key with no rotation path becomes permanent. The
signing scope, the identity split, the verification-failure decision, and rotation are
[job-instruction-signing](./techniques/job-instruction-signing.md).

## Injected code has a scope, and the scope is a ladder

Every delivery system lets code be inserted into the job lifecycle from more than one place,
and the places have wildly different reach. Ordering them is the cheapest, highest-value
exercise in this subject:

| tier | reach | who can change it |
|---|---|---|
| machine-level lifecycle code | every job on that machine, from every repository | whoever administers the fleet |
| repository-level lifecycle code | every job for that repository | everyone who can land a change there |
| step-level extensions | one step | the same, plus whoever publishes the extension |

The rule that follows is a preference, not a prohibition: **push injected code down the ladder
until it stops working**. Machine-level code is for what genuinely concerns the machine —
bootstrapping, cleanup, fleet policy — and is not a convenient place for a shortcut that saves
a repository some duplication, because it silently applies to every unrelated repository that
machine ever serves. Per [one-validation-door](../../../_laws.md#one-validation-door), each tier
needs one enumerable place its contents come from, not several. The tiers, their review
requirements, and the third-party-extension question are
[injected-code-scope-ladder](./techniques/injected-code-scope-ladder.md).

## A contribution from outside the trusted set runs in a different lane

The moment a repository accepts changes from people who cannot already deploy it, a hole opens
that has nothing to do with cleverness: their change includes the build definition, so
submitting a change *is* submitting code to be executed with whatever the build holds.

The standard is two lanes with different capabilities. The untrusted lane verifies — it builds,
it tests, it reports — and holds nothing: no publishing credential, no deployment reach, no
write access to a shared cache. The trusted lane holds what it needs and runs only on
instructions from inside the trusted set. What must never exist is one lane that does both and
is switched by a condition, because the condition is evaluated by the thing being attacked.

Two failure modes are worth naming in advance because both are common and both look safe. A
lane that is *supposed* to be credential-free but was never verified to be, per
[failure-not-empty-success](../../../_laws.md#failure-not-empty-success) — absence of a
credential is a property to be checked, not assumed. And event data from an untrusted
contribution interpolated directly into a command, where the data is the attacker's text and
the command is a shell. The lane split, the approval gate for the trusted path, and the
untrusted-input handling rules are
[untrusted-contribution-lanes](./techniques/untrusted-contribution-lanes.md).

## A job does not hold their code and your credential at once

A correct lane split is collapsed most often by addition, not by design. A
verifying job is credential-free and stays that way until somebody wants it
to be useful — post the measurement as a comment, apply the label, commit
the regenerated snapshot back — and each of those needs a write scope,
granted to the job that is already building and running a contributor's
code. Nobody decided to hand foreign code a write token; a helpful feature
did it one step at a time.

The rule is a conjunction, not a lane: **measuring and applying are
different jobs.** A read-only job runs the untrusted code and emits an inert
artifact; a later job with write scope consumes that artifact, executes
nothing from the change, and applies the result. The residual risk is worth
naming because it is where this pattern is usually implemented carelessly —
the applying job still trusts the artifact's *contents*, so the producing
job must not be able to write arbitrary paths into it, and the applying job
allowlists every path it commits. The split, the inert handoff, binding the
application to the measured revision, and telling a missing artifact apart
from a failed measurement are
[measure-apply-split](./techniques/measure-apply-split.md).

When the change can edit the pipeline the two jobs belong to, the split
is not yet a boundary: the change can add a step to the applying job, or a
job beside it, and read whatever token that pipeline holds. The split then
has to cross a project. One separate writer project holds every write
token and makes every write, runs only its own reviewed definition, and
reads targets as data; no target pipeline carries a write token at all.
Inside the writer the same reasoning applies one level down — each child
call is handed only the token it writes with, and a call whose named token
is missing refuses rather than falling back to another. The writer
project, its hardening, and the per-call handout are
[per-call-write-token-handout](./techniques/per-call-write-token-handout.md).

## A result is evidence only if the change did not choose it

Everything above keeps a change from reaching a credential. A different
question arises the moment a pipeline result is allowed to merge or prove a
change without a person reading it: could the change have shaped the
result? Per [claimant-does-not-adjudicate](../../../_laws.md#claimant-does-not-adjudicate),
the party being judged supplies no input the verdict reads, and a pipeline
offers two such inputs that review does not see.

The first is the definition. A change that edits the pipeline's
configuration — the root definition, the platform-adjacent directory, or
any file the definition includes locally, followed transitively as the
head has them — chose which jobs made its evidence. It earns no proof
mark, no automatic approval and no automatic merge; it waits for a person,
with the reason. The walk fails closed: a file that does not parse, an
include that cannot be read or resolved, a wildcard, a variable in a path
all count as touching. The surface, the fail-closed cases and what the
forfeit does not certify are
[self-edited-ci-forfeits-evidence](./techniques/self-edited-ci-forfeits-evidence.md).

The second is the run itself. Anyone who can push a branch can usually
start another run of the same revision by hand, by API, by trigger or by
schedule, and most of those doors accept run-level variables, which outrank
the definition's own. Only the run the change's ordinary event produced,
at exactly the head being judged, finished, with no run-level variables,
counts — and the gate reads the newest such run rather than searching for
a green one. The four predicates, and why the platform restriction and
the reader's refusal are both needed, are
[evidence-pipeline-provenance](./techniques/evidence-pipeline-provenance.md).

## A secret exists for as short a time, in as few places, as the work allows

The last technique is the one that pays at every scale including the smallest, because the
first project with a publishing credential already has the whole problem. A secret is fetched
as late as possible, given to the narrowest scope that needs it, never written into anything
durable, and named with an expiry at the moment it is issued per
[creation-names-reaper](../../../_laws.md#creation-names-reaper).

Three specific defects account for most real exposure and none of them requires an adversary:
a secret resolved into the plan while the plan is being stored for auditability; a secret in an
environment inherited by every child process including the ones that print their environment on
failure; and a secret that is long-lived because rotating it was never anybody's task. The
materialization rules, the scoping ladder, and the leak-detection-at-the-boundary discipline are
[secret-materialization-discipline](./techniques/secret-materialization-discipline.md).

## The order to buy these in

This subject describes controls with genuinely different costs, and adopting them out of order
is the characteristic mistake — a team signs its job instructions while its publishing token has
been in a repository variable for two years.

1. **Secret materialization.** Cheapest, applies from the first credential, catches real leaks.
2. **Untrusted-contribution lanes.** Necessary the day the first outside change arrives; free
   before that.
3. **The measure/apply split.** Bought the first time a check wants to write something back —
   one extra job, and far cheaper to build that way than to unpick later.
4. **The writer project and its per-call handout.** Bought the day an automated author or an
   outside contributor can push a definition into a pipeline that would hold a write token.
5. **The self-edit forfeit and the run predicates.** Bought the day a pipeline result may merge
   or prove a change without a person; both are a reader's checks, not infrastructure.
6. **The injected-code ladder.** An audit and a preference, not a system to build.
7. **The boundary map.** An afternoon with a diagram; the prerequisite for the next item.
8. **Job-instruction signing.** Real infrastructure, real key management, real ongoing cost.

## What this subject does not own

The standing that decides which agent actions may merge without a person — the ladder of
autonomy, how it is earned on a record and lost to a tripwire — is
[earned-autonomy-tiers](../earned-autonomy-tiers/earned-autonomy-tiers.md). This subject owns
the execution path that produces the evidence such a standing reads: who holds the write tokens,
which runs count, and when a change has shaped its own result. The two meet at one rule, stated
here and consumed there: a change that edited its own pipeline, or a run started with variables,
contributes no evidence, whatever standing its author holds. The rule a reader uses to pick: if
the question is whether a pipeline's output can be believed or what it can reach, it is here;
if it is how much an author's accumulated, believed results should let it do unattended, it is
there.

## The techniques

- [control-plane-execution-boundary](./techniques/control-plane-execution-boundary.md) — where
  deciding ends and performing begins, the three arrangements, and what crosses the line.
- [job-instruction-signing](./techniques/job-instruction-signing.md) — signing what will be
  executed, the identity split, verification failure behaviour, and rotation.
- [injected-code-scope-ladder](./techniques/injected-code-scope-ladder.md) — machine, repository
  and step tiers, pushing code down the ladder, and third-party extensions.
- [untrusted-contribution-lanes](./techniques/untrusted-contribution-lanes.md) — two lanes with
  different capabilities, verifying the credential-free one, and untrusted input as data.
- [measure-apply-split](./techniques/measure-apply-split.md) — the read-only
  producer and the write-scoped applier, the inert artifact between them,
  the allowlist on what may be committed, and binding the application to
  the revision that was measured.
- [per-call-write-token-handout](./techniques/per-call-write-token-handout.md) — one writer
  project holds every write token, no target pipeline carries one, and each child call is
  handed only the token it writes with.
- [self-edited-ci-forfeits-evidence](./techniques/self-edited-ci-forfeits-evidence.md) — a
  change that edits its pipeline's configuration, followed through its local includes, earns no
  proof and no automatic merge; the walk fails closed.
- [evidence-pipeline-provenance](./techniques/evidence-pipeline-provenance.md) — only the
  change's own finished run at the exact head, with no run-level variables, counts as evidence.
- [secret-materialization-discipline](./techniques/secret-materialization-discipline.md) — late
  fetch, narrow scope, nothing durable, expiry at issue, detection at the boundary.
