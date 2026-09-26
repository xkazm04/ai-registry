---
layer: technique
type: technique
subject: cicd-monitoring
technique: remote-action-consent
status: forged
laws: []
shared_with: []
use_when: [matching confirmation strength to blast radius, deciding whether an ack counts as success, two deploys from one impatient second click]
---

# Remote action consent

The monitor's write surface: trigger, retry, cancel, deploy. Every one of
these is an outward-facing act against infrastructure other people depend
on, performed from inside a surface whose entire visual language says
*read-only*. That context is the danger: a user who has spent an hour
safely clicking rows to expand them has been trained that clicking here is
free. The write affordances must break that training exactly in proportion
to what they can break.

## Confirmation proportional to blast radius

Not all remote actions are equal, and a uniform "Are you sure?" on all of
them is worse than none — uniform friction gets uniformly click-throughed.
The ladder:

- **Retry a job** — small blast: re-runs work that already failed, output
  supersedes a failure. A plain action; in-flight disarm (below) is the
  only guard it needs — **unless the retry carries dependents**. At least
  one major provider's "re-run failed jobs" re-runs the failed jobs *and
  the jobs that depend on them* (checked 2026-09-26). A failed test job
  upstream of a deploy job is a deploy on retry, so the retry's rung is
  the highest rung among its dependents.
- **Cancel a run** — small-to-medium: destroys in-progress work but
  nothing deployed. One lightweight confirm, naming the run.
- **Trigger a pipeline** — medium: consumes shared runner capacity and
  executes whatever the selected ref currently contains. The confirm
  **echoes the parameters** — ref, variables, what will run — because the
  common failure is not "didn't mean to trigger" but "triggered with the
  wrong inputs".
- **Deploy to an environment** — large: changes what other people are
  running. The confirm names the environment explicitly and requires an
  affirmative act stronger than a default-focused OK button — the
  destructive-action confirmation shapes owned by the hitl-approval
  subject apply here verbatim (the more consequential the target, the
  closer to type-the-name).

Blast radius is a property of (action × target), not of action alone:
"trigger on a feature branch" and "trigger the production release
pipeline" are different rungs. Where target environments carry a
protection marking from the provider, the monitor inherits it; where they
do not, the monitor's own configuration should be able to mark targets as
protected. And where the provider would refuse the action anyway (missing
permission, protected branch), the honest surface reflects that *before*
the click — a disabled affordance with a reason — rather than collecting a
confirmation for a request that can only fail
(see provider-capability-honesty).

## Fire, then watch — never assume

The action request returns an acknowledgment — typically the identifier of
the run it created or affected, but not always, and the adapter has to
know which (a declared capability, see provider-capability-honesty).
Checked 2026-09-26: one major provider's manual-dispatch endpoint
returned no body at all until February 2026 and still does unless the
caller opts in to run details; its re-run endpoints return no body and
reuse the existing run id, so the thing to watch is (that id, the next
attempt); the other provider's cancel returns success whatever state the
pipeline was in. Where no id comes back, correlate by the narrowest
filter the provider offers (event, ref, actor, created after the click),
and render the match as a match, not as certainty. What happens next is
the rule that keeps the monitor honest:

- **The identifier joins the polling set**, and the settling cadence tier
  engages (fast first polls — the user is certainly watching).
- **The UI never fabricates the outcome.** No optimistic flip to
  "running"; the new run appears when a snapshot contains it. Optimistic
  state on a remote system the monitor does not own is fiction with a
  countdown — the provider may queue the run, reject it downstream, or
  attach it to a different ref than assumed.
- **Acknowledged is not succeeded.** The acknowledgment proves the
  request landed; the outcome arrives through the observation loop like
  every other fact. The intermediate render is "requested — waiting to
  observe", a state visibly distinct from both idle and running.

## In-flight disarm

From click to acknowledgment, the control is disabled and visibly busy. A
double-fired retry wastes runner time; a double-fired deploy is two
deploys. This is the standard busy-action discipline (the async-ui-states
subject owns it); it is named here because on this surface the guard is a
correctness control, not a politeness — the second click has real-world
blast, and "the button felt dead so I clicked again" is the single most
reproducible path to it.

## Attribution and audit

An action fired from the monitor happened *through* the monitor but *as*
some credential. Two obligations: the acting identity is visible at the
confirm step (which token, which user the provider will record), and the
monitor keeps its own local record of what was fired, when, at what, by
whom — enough to answer "who deployed that" without subpoenaing the
provider's audit log. Scoped credentials — read tokens for watching,
elevated tokens only where the write surface needs them — are the
credential-vault subject's doctrine; the monitor's obligation is to *use*
the split: a monitor that watches with a deploy-capable token is a deploy
button with extra steps for whoever compromises the display tier.

## Decision rules

- Rank every remote action by (action × target) blast; match the
  confirmation shape to the rank; never uniform.
- Echo inputs at the confirm for parameterized actions — the wrong-inputs
  failure outnumbers the wrong-button failure.
- Return-value is an id, not an outcome; join it to the polling set and
  render "requested" until observed. An acknowledgment that carries no id
  (or reuses one) is a capability fact, handled by correlation or by
  (id, next attempt).
- A fallback that performs a *different* act when the confirmed one fails
  (a commit to a default branch where an API registration failed) is a
  new action on its own rung. Fail the confirmed act and offer the
  fallback with its own consent. Never take it silently on any error.
- Disarm from click to acknowledgment, always.
- Disabled-with-reason beats confirm-then-fail for actions the provider
  will refuse.
- Record fired actions locally with actor, target, time, and resulting
  run id.
