---
layer: technique
type: technique
subject: agent-cli-transport
technique: fallback-ladder
status: forged
laws: [absent-guard-is-loud, failure-not-empty-success, one-authority-per-vocabulary]
shared_with: []
use_when: [the agent binary is missing on a deployment, designing keyless or offline product behavior, a managed platform cannot spawn local binaries]
---

# The fallback ladder

An agent-CLI transport is an **optional dependency by nature**: it exists
only where an operator installed a binary and logged in, it cannot exist at
all on managed serverless platforms, and a policy flag can forbid it on
machines where it works. A product that treats the transport as assumed
infrastructure crashes on exactly the deployments that most need a good
first impression — fresh installs, keyless trials, offline evaluations.
The technique: **degradation is a product property**, designed as a ladder
and labeled at every rung.

## The ladder

Ordered by fidelity, each rung tried only when the one above is honestly
unavailable:

1. **The preferred transport** — the local agent CLI, on the operator's
   seat.
2. **An alternate provider** — a metered API adapter behind the same
   interface, where the deployment carries a key. Same contract, different
   economics; the caller does not change.
3. **The deterministic floor** — a heuristic or rule-based computation that
   produces the same *shape* of result with no model at all. It exists so
   the product remains demonstrable and testable keyless.
4. **Honest refusal** — for features where a deterministic stand-in would
   be a lie (an editing agent has no heuristic substitute), the feature
   says what is missing and how to supply it.

Two properties make it a ladder rather than a pile:

- **Selection is explicit and inspectable.** Which rung served a given
  request is recorded and displayed. A deterministic score that renders
  indistinguishably from a model verdict is the ladder's cardinal sin —
  the rung label must travel with the result to every surface that shows
  it ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success):
  "the model was unavailable, here is the heuristic" and "the model said
  this" are different findings).
- **Descent has a reason.** Each step down records *why* — probe failed,
  policy forbade, timeout, parse failure after retries — so a fleet that
  quietly lives on the floor is diagnosable from its descent reasons, not
  from a hunch.

## One predicate, shared

"Is the CLI transport usable here?" is a closed judgment with a tendency to
get reimplemented — one copy in the scoring path, another in a side feature
added later. The copies then drift: field history records a deployment
class that gained a working transport in the main path while a sibling
feature, holding its own stale copy of the predicate, kept throwing on the
very machines that had just been unblocked. The predicate is written once
and imported everywhere
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary));
gates at inner seams reuse it as defense in depth, never re-derive it.

## Absence must be *detectable*, and often it is not where you look

The ladder's whole premise is that the top rung's unavailability can be
recognized. On the deployments that matter most — the fresh install, the
machine that never had the tool — that recognition is harder than it
appears, and the two mechanisms an implementation reaches for first both
fail:

- **The spawn-error event does not fire.** Where the launch passes through
  a platform interpreter (unavoidable when the tool is distributed as a
  script wrapper), a *missing* program is not a spawn failure. The
  interpreter starts fine, cannot find the program, and exits nonzero like
  any ordinary child. The handler holding the "not installed" verdict is
  never reached, and absence arrives disguised as a run that went badly.
- **Feeding the prompt can kill the host first.** Writing a prompt into the
  input stream of a child that has already gone reports as a stream
  *event*, not as a throw at the call site; unhandled, the host runtime may
  escalate it to a fatal error and end the whole process. A transport can
  own a carefully written not-installed verdict *and* a ladder above it and
  have neither ever execute, because nothing survived long enough to
  classify anything.

Both are invisible on every machine that has the tool installed and total
on every machine that does not — which is to say, invisible in exactly the
population that tests the ladder, and fatal in exactly the population the
ladder exists for. So the not-installed rung is reached from the
[availability-probe](./availability-probe.md) and from exit status plus
error text, the prompt write is guarded, and the descent path is exercised
on a machine (or a fixture) where the binary genuinely is not there. A
ladder whose top rung's failure has never been executed is a design, not a
behavior.

## Misconfiguration must not silently select the floor

The subtlest route to the bottom rung is a knob, not an outage. A timeout
knob set to zero or garbage, read as "kill instantly", fails every
transport call in milliseconds and routes the entire product to the
deterministic floor — permanently, quietly, with a healthy-looking probe.
Knob discipline: a nonsensical value for a resource ceiling is
**misconfiguration, floored to a sane minimum**, never interpreted as "no
limit" or "immediately". The same applies to the offline flag in reverse:
policy-forbidden must read as *forbidden by policy* in the descent record,
not as "binary missing" — repairing the wrong cause is how offline flags
get deleted by well-meaning fixes.

## The floor is a first-class citizen

Because the floor is what trials, tests, and CI actually exercise, it is
built and maintained as a real implementation: deterministic given its
inputs, fast, and honest about its provenance in output. Keeping the floor
good is what makes the guard's absence loud in the right way
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)): a
deployment without the transport still *works*, visibly labeled as
degraded — instead of silently half-working, which is the state nobody
files a bug about.
