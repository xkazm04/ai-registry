---
layer: application
type: application
subject: repo-manifest-standard
technique: reserved-space-must-be-unusable
stack: rust
verified_on: 2026-09-17
verified_against: rust@2021
applied: code
ab_verdict: better
proof: ab-paired
---

# Two keys carved out of a field documented free-form

The consumer is an observability service whose benchmark definitions carry a
`target` object described in its own type as *"how to produce outputs to judge
(e.g. an endpoint, a model+prompt). Free-form for now"*
(`crates/core/src/score.rs`). An administrator posts that object verbatim to the
create endpoint; nothing filters it, because filtering it would contradict the
promise the field's own documentation makes.

The service has since taken two names out of that space by enumeration, five
weeks apart: a recurrence interval (2026-08-19) and, under
`REGRESSION_DATASET_KEY`, the name of the dataset failing verdicts are mined
into (2026-09-02). Both are read as **policy**, by readers that never ask who
wrote the key: a number under the first becomes a schedule row on the next boot,
and paid recurring runs follow; a string under the second redirects every
failing verdict in the project into a dataset of that name. The documentation
told callers to set the second one by hand — *"a benchmark may declare
`regression_dataset` in its `target` object (a reserved key)"* — so the reserved
key was also the only public interface to the capability.

That is rung 3 of the technique inside a space nobody labelled: the names work
when a caller writes them, so they were never reserved, and the release that
took each one captured whatever callers had been keeping under it.

## 1. The seam was chosen because it could refute the finding

If the create door had already refused or stripped caller-supplied reserved
keys, the finding would have been the opposite of what it claims: reservation by
refusal would have been the norm here and the technique's rung ladder
over-claimed. The door was read first, then measured.

## 2. Arms

One input each, the same door, the crate's own test binary as the instrument.

| | caller-written `target.regression_dataset` | caller-written `target.schedule_interval_secs` | the capability, requested by name | caller's other keys |
| --- | --- | --- | --- | --- |
| **A** — as shipped | stored, and read back as the project's mining policy | stored, becomes a schedule on the next boot | no field exists | kept |
| **B** — reserved at the door | 400, naming the field to send instead | 400, naming the field to send instead | `regression_dataset` request field, host-written | kept |

- **Target**: reserved names a caller can write and have read as host policy.
  **A: 2. B: 0.**
- **Floor**: the capability stays reachable and unreserved names stay the
  caller's. Both held — a `target` carrying `regression_notes` and `retries` is
  stored unchanged, and a matrix target is untouched by the check.
- **Positive control**: with the refusal stubbed out, both new tests fail, and
  the failing output prints the stored benchmark carrying the caller's own note
  as the project's mining policy. The instrument can go red at the line the
  claim is about.

## 3. What the enumeration half cost, measured rather than argued

The shape half of the technique — claim the unmarked remainder, not a list — is
**not reachable here any more**, and the reason is the document's point. The two
names live in stored JSON in three storage backends, are read by two crates
beside the one that writes them, and one of them already carries a boot-time
migration that exists because the key was moved out of this object once before
("the key stays *readable* for one release"). A shape claim over the remainder
would invalidate documents in the field. So the arm that was available is rung 1
for the names already taken, and the next name this service wants remains
unprotected — which is the cost of reserving after the space was opened, priced
at one migration per key rather than one comparison at authoring time.

## 4. Deviation worth recording

The refusal names the replacement field, and the replacement field had to be
*added* for one of the two keys: refusing a reserved key whose only public
interface was that key would have removed a shipped capability. A door that
refuses without offering the same behaviour under a name the host controls is
not this technique, it is a regression.
