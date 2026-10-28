---
layer: technique
type: technique
subject: probe-confirmed-model-proposals
technique: probe-per-proposed-line
status: forged
laws: [claimant-does-not-adjudicate, one-validation-door, failure-not-empty-success]
shared_with: []
use_when: [designing how each line of a generated configuration is checked, a model proposes its own verification steps, probe results travel through a client before the save]
---

# Probe per proposed line

A proposal is decomposed into lines, each line has a type, and each type names
the one probe that can confirm it. A folder claim is confirmed by a lookup
inside the target root; a host claim by reading the actual remote; a pipeline
claim by a listing from the hosting service that contains its identifier; a
cloud resource claim by a query that finds it in the account. The registry of
probe kinds is closed and lives in one place, and a line whose type maps to no
probe is not saved, because the line nobody can test is exactly the line a model
invents ([_laws: one-validation-door_](../../../../_laws.md#one-validation-door)).

## The proposer does not choose its own adjudication

It is tempting to let the model propose the probes too — it knows what it
claimed. Allow it, but never rely on it. The system derives, from each line's
type, the probe that line requires and **adds it where the model left it out**,
then deduplicates against whatever the model did propose after passing both
through the same normalizer. A proposer that picks which checks run against its
own claims can pick the weak ones or none, and the configuration saved is then
confirmed by the claimant's choice of evidence
([_laws: claimant-does-not-adjudicate_](../../../../_laws.md#claimant-does-not-adjudicate)).

Model-proposed probes are themselves model output. Each is validated against a
closed grammar before it runs: a known kind, only the argument names that kind
declares, every required argument present, every value free of control and
shell characters even when it travels as an argument vector that no shell
parses, identifiers matching their numeric shape, relative paths that cannot
climb out of the root. A spec that fails any rule is dropped, never repaired,
and the drop is counted. Probes are read-only by construction; one that would
execute target code — running the test command it proposed — does not run in
the confirmation pass at all, but waits for a person's explicit action.

## Some probes only a finding can propose

A query against a found resource needs an identifier that exists only once the
resource is found: the application id a component lookup returned, the
workspace id a workspace lookup returned. The model cannot propose it up front,
and must not be asked to guess it. The probe runner derives the follow-up from
the result of the probe before it and inserts it next in the queue, once, under
the same validation as every other line. The chain is driven by observations,
not by the proposal.

## Three verdicts, not two

Each probe returns confirmed, refuted, or could-not-probe. A listing that does
not contain the claimed identifier refutes the claim. A login that lapsed, a
service that was unreachable, a provider that is not implemented yet, a probe
that threw — none of these said anything about the claim, and recording them as
refuted makes the screen tell the person "your pipeline does not exist" when the
truth is "we could not ask"
([_laws: failure-not-empty-success_](../../../../_laws.md#failure-not-empty-success)).
Neither non-confirmed verdict is saved; the distinction governs what the person
is told and whether a retry is worth offering. The runner never throws for one
probe — every spec yields a result line with its reason — so one broken provider
cannot hide the verdicts of the others.

The result line is the spec that was asked, not what the provider reported
about itself: the kind and arguments recorded are the validated spec's, so a
provider cannot relabel what it answered.

## Results that cross a client are sealed

When probes stream one per request to an interface and the save request comes
back carrying the results, the save step is reading verdicts a client handed
it. Seal each result the server produced with a keyed hash over a canonical
serialization, bound to the target root, under a key that exists only in the
server process; the save keeps only results whose seal verifies, compared in
constant time, and reports how many it discarded. A restart voids every seal
and the interface probes again — the honest cost of a key that is never
written down. Without the seal, any client can submit a confirmed verdict that
no probe returned, and every guarantee upstream is decorative.

## Decision rules

- When a line type has no probe, the line is not saved; add a probe kind before
  adding the line type.
- When the model proposes probes, validate each against the closed grammar and
  add the required probes it omitted.
- When a probe's argument comes from a finding, derive the follow-up from the
  finding; never ask the model for it.
- When a probe could not run, record could-not-probe with its reason, not
  refuted.
- When verdicts leave the server before the save, seal them and verify on the
  way back.

## When not to use this

When a line is a pure label with no external referent — a display name, a
description — there is nothing to probe and nothing to gain by pretending.
Mark such fields as unconfirmed by design, keep them out of anything that
drives behaviour, and let a person edit them.
