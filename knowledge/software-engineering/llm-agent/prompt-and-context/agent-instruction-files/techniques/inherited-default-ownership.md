---
layer: technique
type: technique
subject: agent-instruction-files
technique: inherited-default-ownership
status: forged
laws: [absent-guard-is-loud, silent-state-is-ungoverned]
shared_with: []
use_when: [a harness release changed what an agent does at the end of a task and no repository file changed, deciding whether a behaviour the team relies on needs a line at all, an unattended run pushed or opened a review request nobody asked for, a built-in safety interlock stopped applying after a model or harness upgrade, a bundled check the workflow counted on stopped running by itself, choosing between a prose line and a permission rule to fix a behaviour the harness supplies]
---

# Inherited default ownership

This subject's maintenance funnel is run per line by an owner reading a diff,
and two techniques have already named the diffs it cannot see.
[sibling-floor-ownership](./sibling-floor-ownership.md) found the diff that is
**absent** — an install produces nothing to read.
[rewrite-behavior-pinning](./rewrite-behavior-pinning.md) found the diff that
is **total** — a bulk rewrite changes every line at once. There is a third,
and it is the largest by volume: the diff that happens **in a repository the
owner does not read**. The harness ships on a weekly cadence, its release log
is thousands of lines a quarter, and a fraction of those lines change what an
agent does *when the instruction file says nothing*.

That fraction is the subject of this technique. **Every behaviour a
repository depends on that its files do not state is a line the harness
wrote, and the harness rewrites that line on its own schedule.** The file's
silence is not neutrality. It is a delegation to a default, made without
anyone deciding to delegate, and the delegate changes hands with every
release.

## The shape of the failure, measured over one window

Sixty days of one harness's release log, read for defaults rather than
features, carried three changes that moved a repository's behaviour without
touching the repository:

- **The terminal action of an unattended session became "commit, push, open
  a draft review request"** unless the instruction file says otherwise. A
  repository whose owner keeps the push decision — every file silent on the
  matter — went from *work stays local* to *work leaves the machine* between
  two versions, with the file unchanged and correct throughout.
- **A built-in interlock was relaxed per model generation.** The write tool
  had refused to overwrite a file the session had never read; newer models
  were exempted from the refusal while older ones kept it. A repository whose
  ledgers were protected by that refusal — never by anything it wrote — lost
  the protection on the day it switched models.
- **Bundled review and verification capabilities stopped triggering on their
  own.** A workflow that had counted on the harness to run its check at the
  end of a task had, from one version on, no check at all, and no line in any
  file had ever said the check would run.

None of the three is a bug, and each is defensible on its own terms. What
they share is the direction of the dependence: the repository leaned on the
harness, the harness moved, and nothing in the repository could see the
move. The three instruments this subject already runs are all blind here by
construction. Freshness resolves what the file *names*, and the file named
nothing. Expiry withholds *a line*, and there was no line. Coverage asserts
that every affordance is *named*, and the dependence was on a default, not an
affordance. A repository can pass every check the subject owns and still
have its behaviour rewritten from outside.

## Enumerate the dependence, then sort it

The corrective begins the way [sibling-floor-ownership](./sibling-floor-ownership.md)'s
does: with a list nobody has written. For each stage of a session the
repository cares about — what the agent does before it writes, at the end of
a task, when a check fails, when it needs a decision and nobody is there —
ask **what the harness does if we say nothing, and did we ever decide that
was acceptable?** The first list is short and embarrassing, and it is the
whole finding. An owner who cannot say what their unattended sessions do
with finished work has not delegated the decision; they have never noticed
there was one.

Then sort each inherited default by which way it can move, because the two
directions fail differently and take different pins:

- **A permissive default** — the harness now does *more* than before: pushes,
  overwrites, opens review requests, spawns deeper, runs longer. The failure
  is an action nobody asked for, and it is the one that costs, because it
  can be irreversible and it happens in exactly the sessions nobody is
  watching. This class is pinned **below the model**, in the harness's own
  refusal layer — a deny rule on the action, a pre-tool hook that blocks it —
  because that layer is the one place a harness default cannot override:
  a deny is evaluated before every allow the harness ships, and a blocking
  hook fires before the model's intention is consulted. The pin is a gate,
  and [enforcement-demotion](./enforcement-demotion.md)'s rule about naming
  it applies: the file then carries one line saying the gate exists and why.
- **A restrictive default** — the harness now does *less*: a check stops
  self-triggering, an interlock is dropped for the current model, a
  capability is retired. The failure is a guard the repository silently
  relied on ceasing to exist, which is
  [absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud) with the
  absence caused from outside. This class is pinned by **owning the step**:
  the check the harness used to run becomes a turn-end hook the repository
  registers; the interlock the harness dropped becomes a pre-tool rule the
  repository states. What was borrowed is now written, and written in a
  form that does not depend on the lender.

Prose is the third pin and the weakest. It is the right one only where the
dependence is a judgment — *when* a review request is appropriate, *which*
branch is the active one — and it is subject to everything this subject
says about advisory lines. A default worth pinning in prose is worth one
line that states the decision, never a paragraph restating what the harness
does; the harness's own description of its behaviour is the thing that
expires.

## A harness release is a freshness trigger

[instruction-freshness](./instruction-freshness.md) couples the file to the
repository it describes; [substrate-coupled-expiry](./substrate-coupled-expiry.md)
couples it to the model that reads it. The harness is a third reader with
its own release cadence, and it changes both halves at once — what it does
*for* the agent and what it *lets* the agent do. So the harness's version is
one more coupling the freshness audit records, and a version bump is one
more event that re-opens the file: not to re-read every line, but to walk
the short list above and ask, for each inherited default, whether it still
says what it said when the dependence was accepted. The audit is cheap
because the list is short, and the list is short because most defaults do
not matter; the ones that do are exactly the ones whose change nobody
would otherwise see.

The release log itself is the instrument, read the way this technique read
it: not for what was added, but for what a repository that never wrote a
line about the matter now does differently. That reading is what turns a
vendor's changelog from news into a diff against the file.

## Boundaries

This technique owns behaviour the repository **never stated**. A behaviour it
stated and the harness now contradicts is [instruction-freshness](./instruction-freshness.md)'s
case — the line is there and has gone wrong. A capability that exists and is
not named is [capability-coverage-contract](./capability-coverage-contract.md)'s
case — that technique asserts affordances are reachable; this one asserts
that defaults are decided. And which pin a *stated* rule should take — prose
or gate, program or model — remains [enforcement-demotion](./enforcement-demotion.md)'s
sort; this technique only adds that the sort is also owed to rules the
repository has not yet noticed it holds.
