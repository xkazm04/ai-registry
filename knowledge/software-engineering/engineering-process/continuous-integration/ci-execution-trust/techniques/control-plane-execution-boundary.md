---
layer: technique
type: technique
subject: ci-execution-trust
technique: control-plane-execution-boundary
status: forged
stage: multi-service
laws: [gate-sees-target, one-validation-door]
shared_with: []
use_when: [choosing between a hosted and a self-run delivery system, asking what a compromised orchestrator could do, placing a control and unsure which side it belongs on]
---

# Control plane and execution boundary

Draw one line: on one side, whatever **decides** what work happens; on the other, whatever
**performs** it. Then enumerate what crosses. Almost every question in this subject becomes
answerable once that line is on paper, and almost none of them are answerable before.

## The three arrangements

| arrangement | decider | performers | the property that surprises people |
|---|---|---|---|
| **fully hosted** | external service | external machines | your code and credentials are on infrastructure you cannot inspect; the trust is total and the operational cost is zero |
| **fully self-run** | your service | your machines | you own the whole boundary, including the obligation to patch, isolate and monitor it — which is a real job |
| **hybrid** | external service | your machines | the decider is outside your control and the performers are inside your network |

The hybrid is the one most teams end up in, usually without choosing it, and it has the least
obvious properties. An external decider instructing internal machines means a compromise over
there becomes code execution *inside your network*, on machines that were placed inside it
because they needed to reach things. It is a perfectly reasonable arrangement — it is also the
one where signing job instructions has the highest value, and the reason that technique exists.

## What to enumerate

For your arrangement, write down four lists. An afternoon, once, and it does not go stale
quickly.

1. **What crosses the boundary inward.** Job instructions, environment values, the repository
   reference, plugin and extension references, retry and cancel commands. Each item is
   something a compromised decider controls.
2. **What identity the performer runs as.** Not "the build user" — what that identity can
   actually reach: which networks, which stores, which credentials it can request, which other
   machines trust it. This list is always longer than expected and shortening it is usually the
   highest-value change available.
3. **What crosses outward.** Logs, artifacts, status, metrics. This is the disclosure channel:
   whatever a job prints goes to the decider, so a hosted decider sees whatever your builds
   print, including what they print accidentally.
4. **What survives a job.** Caches, checkouts, temporary files, credentials in an agent, daemon
   state. Everything on this list is a channel from one job to the next, and therefore from one
   repository to another if the machine serves more than one.

## Placing a control on the correct side

Per [gate-sees-target](../../../../_laws.md#gate-sees-target), a control enforced by the party
it constrains is not a control. The test for any rule is: **which side enforces it, and is that
side the one it restricts?**

- A rule that says which repositories may reach which environments, enforced by configuration
  the decider holds, is a control over users of the decider, not over the decider.
- A rule enforced on the performer — a runner that will not accept a job it cannot verify, a
  network that will not route from the build segment to the production database — constrains
  the decider. That is a real boundary.
- A rule enforced by policy documentation is a preference.

This is not an argument that hosted deciders are untrustworthy. It is an argument for knowing
which of your controls would survive if one were, because that is the difference between a
security posture and a list of settings.

## One door, per direction

Per [one-validation-door](../../../../_laws.md#one-validation-door), each direction across the
boundary should have one place it is mediated:

- **Inward**: one place jobs are accepted and validated, rather than several entry points with
  different checks. A delivery setup with a main path plus two convenience paths that skip it
  has the security of the weakest path and the documentation of the strongest.
- **Outward**: one place logs and artifacts are published, so redaction and retention are
  applied once. A second publishing route is a second redaction implementation, which means an
  unredacted one.

## What a compromise buys, written down

The exercise ends with one paragraph per side, in plain terms, and it is worth writing even
when the answer is uncomfortable:

- **If the decider were compromised:** it could run arbitrary commands as the build identity on
  every performer, with everything from list 2, and would see everything from list 3.
- **If a performer were compromised:** it holds everything from list 4 and can reach everything
  from list 2, for as long as it is not rebuilt.

Both paragraphs point at their own mitigations. The first points at signing instructions and at
shortening list 2. The second points at ephemeral runners and at isolation between repositories
— which is the runner-fleet subject's territory, and the reason these two subjects sit beside
each other.

## When NOT to do this

Never — but scale it. A solo project with one repository and one deployment target writes four
short lists in ten minutes and is done. The mistake is not doing it too early; it is producing
a diagram nobody derives a decision from. If no control moves and no credential shrinks as a
result, the exercise was decoration.

## Decision rules

- Draw the decide/perform line explicitly and identify which of the three arrangements you are
  in — including if you did not choose it.
- Enumerate inward crossings, performer identity reach, outward crossings, and what survives a
  job.
- For every control, name which side enforces it; a control enforced by the side it restricts
  does not count.
- One mediated door inward, one outward.
- Write the two compromise paragraphs in plain terms, and act on what they point at.
- Scale the exercise to the setup; if nothing changes as a result, it was decoration.
