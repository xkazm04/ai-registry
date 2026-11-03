---
layer: application
type: application
subject: proof-carrying-agent-actions
technique: inconclusive-routes-to-wait
stack: rust
status: forged
verified_on: 2026-11-03
verified_against: rust@1
---

# A payment agent's proof file: four states per line, three verdicts on screen, two at the exit (paypal)

Project `paypal`, https://github.com/xkazm04/paypal at origin/main, commit a52d8f6d (Rust
workspace, toolchain channel 1.97 in `rust-toolchain.toml`). The product is a wallet in which
an AI agent negotiates and pays under a mandate its owner signed. Each deal exports a signed
proof file, and `crates/table-verify` checks it offline: "Pure: no network, no ledger, no
wallet keys" (`crates/table-verify/src/lib.rs:1`). The agent is the producer, and the person
checking the file (the owner, or the other side of the deal) is the consumer. No model takes
part in the verdict. The action here is a payment, not a merge request, and the verdict waits
for a person rather than for a gate. The rule about the third answer still holds, and it breaks
at the same place.

## A line has four states, not two

`Check` carries `ok`, `checked` and `applies` (`crates/table-verify/src/lib.rs:27-41`). That
gives four readings: passed; failed, meaning the check was made and contradicted; not made,
meaning the check applies but the file lacks the record it compares; and not applicable, meaning
the deal has nothing of that kind. The comments state the two rules the technique asks for.
A check not made "never counts towards verified" (lines 32-34). A check that does not apply
"neither passes nor holds the file back" (lines 36-38). The fold is one line:
`self.checks.iter().all(|c| c.ok || !c.applies)` (line 56). Not-applicable lines are struck,
and a not-made line keeps `applies: true` with `ok: false`, so it holds the file back.

The order-record comparison shows why "not made" may not pass. An order PayPal answered, with
no stored binding to compare, is ambiguous: the file may predate the wallet keeping bindings,
or the binding may have been stripped. The code says so: a file without bindings may be old, and "stripping them is no different";
"the comparison could not be made, which is not the same as a mismatch"
(`crates/table-verify/src/lib.rs:340-343`). The check returns `checked: false,
applies: true` (lines 348-355). An honest old file and a stripped forgery produce the same
evidence, so the only safe reading of that evidence is "not proven".

## The empty set cannot arise

The technique's forgotten rule is that an empty set of checks is inconclusive. Here the empty
set is ruled out by how the checks are built rather than by a branch in the fold. `format`,
`mandate`, `transcript` and `evidence` return `Result<String, String>`. A miss converts
through `From<String>`, which sets `checked: true, applies: true`
(`crates/table-verify/src/lib.rs:68-76`). So these four can never read "not applicable". Every
file is judged at least on the owner's signature over the mandate, the signed transcript chain
and the agent's signature over the evidence head (lines 99-111, 113-123, 125, 525-536). The
smaller vacuous passes ("no countersign in this deal", line 226, and "no money operation in this
deal", line 309) are guarded across records. A create, authorize or capture with no countersign
for its attempt fails (lines 213-224). A money-shaped PayPal call with no recorded operation
fails (lines 293-305).

## The third verdict survives on the app surface

The desktop app's checker picks its headline in the technique's fold order. Failures come first,
then a full pass, then the rest: `bad.length > 0 ? W.failed : state.verified === true ?
PROOF_ALL_THAT_APPLY : PROOF_SOME_UNCHECKED`
(`apps/desktop/client/src/shared/proofcheck/ProofChecker.tsx:283`). The words are "This file
does not check out", "Every check that applies passed" and "Not every check could be made"
(`apps/desktop/client/src/lib/words/proofcheck.ts:18-24`). A dashed line is explained as never
being a pass (line 21). A person reading the sheet can tell a refusal from a gap.

## Deviation: the CLI exit has two values for a readable file

The command-line verifier documents "exit 0 verified, 1 failed, 2 unreadable"
(`crates/table-verify/src/main.rs:1`). Its `verdict` function maps every non-verified report to
`NOT VERIFIED` and exit 1 (lines 29-37). That includes a report whose only shortfall is a
not-made line. The line itself still prints `-` rather than `✗` (lines 13-28). Exit 2 is kept
for files that cannot be read (lines 64-86). That half matches the technique: an error inside
the checker says nothing about the deal and does not share the failure code. But for a script or
pipeline consuming the exit code, "the file lacks a record" and "the file was forged" are the same
outcome. That is the process-boundary loss the technique names. The app keeps the distinction,
and the CLI, the surface a script would call, drops it. The standard stays:
give "not every check could be made" its own exit code (or a verdict file), so a caller can
branch on all three outcomes, with failures still outranking gaps.
