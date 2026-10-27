---
layer: technique
type: technique
subject: probe-confirmed-model-proposals
technique: found-not-hinted
status: forged
laws: [claimant-does-not-adjudicate, gate-sees-target, unknown-is-not-a-value]
shared_with: []
use_when: [assembling the saved configuration from a proposal and its probe results, a probe passed and the model's value differs from what it found, deciding which proposed fields may be stored at all]
---

# Found, not hinted

The step that assembles the saved configuration reads two inputs — the
proposal and the probe results — and the technique fixes which one each stored
value comes from. The rule: **a stored value is copied from what a probe
observed; the proposal's text decides only which probe was asked and where it
looked.** The model's string never becomes configuration merely because a probe
near it passed.

## Why "the probe passed, save the hint" fails

A passing probe confirms that something matching the hint exists. It does not
confirm that the hint *is* that thing, and every gap between the two is a
saved error. The model wrote a resource group and a component name; the lookup
found the component, and the record it returned carries the application id,
the subscription and the canonical name — the hint carries none of the first
two and may differ in the third. The model wrote a host and an organization;
the remote probe parsed the actual address. The model wrote a branch pattern
the listing matched loosely; the listing returned the exact name. Save the hint
and the configuration is right only as far as the model's spelling was; save
the finding and it is right as far as the world is
([_laws: gate-sees-target_](../../../../_laws.md#gate-sees-target)).

There is a second, structural reason. The hint is the claimant's statement; the
finding is the adjudicator's. A save step that copies the hint after a check
has let the claimant's words through the check's door, and any field the check
did not compare — an extra attribute, a variant spelling — rides through with
it ([_laws: claimant-does-not-adjudicate_](../../../../_laws.md#claimant-does-not-adjudicate)).

## The assembly rules

**Each stored field names its source probe.** The host comes from the remote
probe's data, not from the proposal's host field. A cloud resource comes from
the component lookup's returned record, with every identifying attribute
required present, and only then. A pipeline is kept only if a listing probe's
returned identifiers contain its id. Write the source of each field down, in
the assembly function's header, so a reviewer can check the mapping.

**Dependent lines fall with their parent.** A variant of a pipeline is kept only
if its pipeline was kept; a query target only if the resource it queries was
found. A configuration that keeps a child whose parent was refuted points at
nothing.

**Precedence between findings is declared.** When two probes could each supply
a field — a richer telemetry component, and a log workspace as fallback — the
assembly states which wins and keeps the loser only as metadata, so the system
does not collect from both.

**Absent is absent.** A field no probe confirmed is left out of the saved
configuration or stored as an explicit none — never filled from the hint as a
default, never zero-filled ([_laws: unknown-is-not-a-value_](../../../../_laws.md#unknown-is-not-a-value)).
Fields of the proposal that no probe covers — the model's suggested metrics, its
cloud hint as such — are not saved at all. A hint is what a probe was asked,
not what it found.

**The probe results are saved with the configuration.** Every result,
confirmed and not, travels into the stored record, so a later reader can see
what was asked, what was found and when, and re-run the confirmation when the
target changes.

## The edge: values only the model can supply

Some fields have no probe that can produce them and still drive behaviour: the
command that runs a component's tests is the canonical example. The probe that
would confirm it executes target code, which the confirmation pass must not do
unattended. The honest options are two: hold the field out of the saved
configuration until a person runs the command and its exit is recorded, or
save it marked unconfirmed and refuse to act on it until it is. Saving it
alongside the confirmed fields with no mark is the one wrong answer, because
every downstream consumer reads the configuration as uniformly confirmed.

## Decision rules

- When a probe returns data, the stored value is that data; the proposal's
  string is discarded.
- When a line depends on another, keep it only if its parent was kept.
- When two findings could supply a field, declare the precedence in one place.
- When no probe confirmed a field, it is absent or explicitly none in the store.
- When a field can only be confirmed by executing target code, keep it out or
  mark it unconfirmed until a person's run confirms it.

## When not to use this

When a probe can only answer yes or no — existence with no returned record —
there is no finding to copy, and the hint is the only representation of the
value. Store the hint then, but normalized to the form the probe accepted (a
resolved path, not the relative string), and record that the probe was a
membership test rather than a lookup.
