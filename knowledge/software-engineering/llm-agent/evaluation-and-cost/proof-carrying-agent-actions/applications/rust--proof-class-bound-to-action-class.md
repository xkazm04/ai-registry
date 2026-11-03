---
layer: application
type: application
subject: proof-carrying-agent-actions
technique: proof-class-bound-to-action-class
stack: rust
status: forged
verified_on: 2026-11-03
verified_against: rust@1
applied: simulation
ab_verdict: better
---

# The file names its own format, and the format names its checks (paypal)

Project `paypal`, https://github.com/xkazm04/paypal at origin/main, commit a52d8f6d (Rust
workspace, toolchain channel 1.97). An AI agent negotiates and pays under a mandate its owner
signed. Each deal exports a proof file, and `crates/table-verify` checks it offline with no
model. The proof has two formats. The second, `table.proof.v2`, was introduced in f46c4b48
(2026-10-08). The first stays readable ("`PROOF_FORMAT_V1` stays readable",
`docs/features/proof-and-verification.md:60`). The format is a proof class in the technique's
sense: it decides which observations the file owes. Here the file declares it.

## What the declared format switches off

Seven of the sixteen checks belong to the second format (`crates/table-verify/src/lib.rs:557-616`):
the owner saw the checklist before each decision, no second request to PayPal, a shop-around
group left one table, nothing paid past a hold without a release, the house's kept record never
shrank, the agreed market price recomputes, and the permissions fingerprint. On a file that
says it is first-format, each of them returns "not checked: a file in the first proof format
does not carry this record" with `applies: false` (`crates/table-verify/src/v2.rs:16-20`). The
fold strikes not-applicable lines (`crates/table-verify/src/lib.rs:56`), so these seven checks
do not count toward the verdict at all. The format also lowers the bar inside a check that does
still run. For a first-format file, the money-authority judge accepts an operation with no
`money.authorized` row and does not require the owner's decision row to come before the money
row (`crates/table-verify/src/authority.rs:144-147`; the doc comment at line 131 reads "a v1 file
is read under its own rules, with no new demand on it").

## What already guards the declaration

Two relabels are refused. A first-format file that carries any second-format field fails
`format` (`crates/table-verify/src/lib.rs:101-103`; the field list is `has_v2_fields`,
`crates/table-proto/src/proof.rs:183-189`). The evidence commitment hashes the format string
as its domain, so relabelling a signed second-format file without re-signing it breaks the
evidence head. The project states this ("a v2 file relabelled v1 fails",
`docs/features/proof-and-verification.md:63`) and tests it
(`crates/table-runtime/src/proof_tests.rs:149-152`).

## Deviation: a re-signed downgrade verifies, by design

The agent key that signs the evidence head belongs to the producer. So a holder of that key can
strip the second-format fields, set the first format and sign again. The project's own test
helper does exactly this, `as_v1` ("re-signed by the deal's agent",
`crates/table-runtime/src/tests.rs:336-349`). The test asserts the result passes: "The same
evidence in the first format still verifies under the first format's rules"
(`crates/table-runtime/src/tests.rs:297-307`, `assert!(old.verified(), ...)`), with every
second-format line reading not applicable. The app sheet then reads "Every check that applies
passed". The project names nearby limits: the checks trust the keys inside the file, and newer
rows removed from the end cannot be seen (`docs/features/proof-and-verification.md:278-281`).
It does not name this one. The format that decides whether the owner-saw-the-checklist check
applies is chosen by the party the check is about.

The file already carries evidence that the producer cannot re-sign. The mandate is signed by the
owner and states `not_before` and `expires` (`crates/table-core/src/mandate.rs:118-125`). The
transcript's inbound messages are signed by the counterparty. That is where a format floor
belongs, as the technique's derive-then-compare rule asks. A first-format file whose
owner-signed mandate became valid after the second format shipped cannot be a genuine
first-format file. The floor is stronger still if a second-format mandate states the minimum
proof format inside the owner's signature. Then a file below it is refused rather than read
under the weaker rules.

## The walk

Three cases at a52d8f6d were walked under the verifier as built (A) and under a floor anchored
in the owner-signed mandate (B). (1) A genuine first-format file saved before 2026-10-08: A and
B both verify. The floor costs nothing on honest old files. (2) A second-format deal stripped and
re-signed (`as_v1`, the test above): A verifies with seven checks struck, and B refuses at
`format`. (3) A second-format file relabelled without re-signing: A and B both refuse, at
`evidence`. B is better on 1 of 3 and ties on 2. The verdict comes from the walk, not from a run.
Residual: a mandate that became valid before the cutover and was still in force after it leaves
the date floor open. Only a format floor stated inside the owner's signature closes that gap.
Falsifier: a genuine first-format file whose mandate became valid after 2026-10-08 (case 1 would
then regress), which would mean an older build kept writing the first format after the second
shipped. No code was changed in the project: which old files to keep accepting is the owner's
call. Return: when the project adds a minimum-format clause to the mandate, or retires the
first format.
