---
layer: technique
type: technique
subject: probe-confirmed-model-proposals
technique: isolated-proposer-call
status: forged
laws: [creation-names-reaper, absent-guard-is-loud, unknown-is-not-a-value]
shared_with: []
use_when: [invoking an agent runtime only to get one structured answer, the target repository carries its own agent instructions or hooks, the proposal schema must handle unknown values]
---

# Isolated proposer call

The proposer is one model call that receives a fact pack and a schema and
returns one structured object. It has no tools, it runs once, and it runs from a
working directory that contains nothing. Each of those three properties closes
a different door, and the common failure is to close two.

## No tools

A proposer that can read files, run commands or fetch addresses is an agent,
and an agent's evidence is whatever it chose to read. That loses the fact
pack's guarantee that the evidence is complete and recorded, and it gives the
target's content a second door: a file the agent opens is text above no fence,
read at the moment the agent is deciding what to do next. Deny every tool
explicitly — an empty allowlist *and* a deny-list naming every tool the runtime
has — because a runtime whose default is "tools on" turns a missing setting into
an armed agent ([_laws: absent-guard-is-loud_](../../../../_laws.md#absent-guard-is-loud)).

## An isolated working directory

Agent runtimes increasingly load context from where they are started: an
instruction file, a settings file, hooks that run on events, a memory store
keyed by the directory. Started inside the target, the proposer inherits all
of them — the target's own instructions now sit in the authoritative region of
the prompt, and its hooks execute code on the operator's machine during what
was meant to be a read-only proposal. Start it instead from a fresh, empty
scratch directory created for this call alone.

Two details decide whether the scratch directory is clean. It is **removed in a
finally block**, on success, failure and timeout alike
([_laws: creation-names-reaper_](../../../../_laws.md#creation-names-reaper));
a proposer that times out every few runs otherwise leaves a growing litter of
temp folders. And it is created under a path the system's own discovery
ignores: when the product itself scans "the places an agent has worked" to find
targets, the proposer's scratch folder is one of those places, and an unignored
one turns up next week as a target to onboard.

## Once

The call is single-shot. No retries with a rephrased prompt until the answer
looks right, no second call to "fix" the proposal against probe results. A
retry loop steered by the probes turns the probes into a search oracle: the
model learns which guesses pass, and the saved configuration converges on what
the probes cannot distinguish rather than on what is true. If a proposal is
poor, the fix is a better fact pack or a better prompt, measured across targets.
A timeout or a non-zero exit is an error the caller reports — never an empty
proposal, which would read downstream as "nothing to watch".

## The schema makes unknown expressible

The prompt's answer contract tells the model to **leave a key out when it does
not know the value** and never to write a null, an empty string or a zero for
an unknown ([_laws: unknown-is-not-a-value_](../../../../_laws.md#unknown-is-not-a-value)).
A schema that requires every field invites the model to fill each one, and a
filled guess is indistinguishable from a fact until a probe refutes it — or,
for fields no probe covers, never. The same contract states the incentive
plainly: lines no probe confirms are not saved, so proposing what the facts do
not support gains nothing. A model told the rule faces the same gradient whether
it is careful or captured.

Parse the answer by extracting the one object it contains and validating it
against the schema at one door; drop the parts that fail, count what was
dropped, and report the count beside the proposal. A dropped count that climbs
across runs is a prompt that has drifted from the schema.

## Decision rules

- When the call only needs to return a structured answer, give it no tools,
  stated explicitly on both allow and deny sides.
- When the runtime loads anything from its working directory, start it from a
  fresh scratch directory the system's own discovery ignores, and remove it in
  a finally block.
- When the proposal is poor, improve the pack or the prompt; never loop the call
  against the probes.
- When a field may be unknown, the schema lets it be absent and the prompt says
  absent is correct.

## When not to use this

When the proposal genuinely requires interaction — the target can only be
understood by running it, and no prepared probe can supply the fact — a single
sealed call cannot see enough. Use an agent with a sandbox and a recorded
trajectory, and treat the trajectory as the evidence record, accepting that two
runs will not be comparable line for line.
