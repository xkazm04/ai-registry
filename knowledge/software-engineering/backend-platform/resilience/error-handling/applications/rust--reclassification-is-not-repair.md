---
layer: application
type: application
subject: error-handling
technique: reclassification-is-not-repair
stack: rust
status: forged
verified_on: 2026-08-31
verified_against: rust@1.96.1
applied: experiment
ab_verdict: not-better
proof: structural-only
---

# A taxonomy that had already taken the fork (rust)

An LLM-observability ingest server in Rust exposes a closed `ErrorCode` enum
over HTTP (`crates/api/src/error.rs`). It carries an internal member documented
as "an unexpected server-side failure (store, serialization, I/O). HTTP 500."
The technique was applied here expecting to find mis-declared members. It found
none, and the reason is the useful part.

## Arm A and Arm B agree, because the fork was already taken

Enumerating every construction site of the internal class across the workspace
returns **three**, all outside the error module itself:

- `crates/api/src/events.rs:364` — a task join error
- `crates/api/src/state.rs:163` — a task join error
- `crates/api/src/otlp/mod.rs:158` — an error encoding the server's own batch
  response

Put each through the separating question — *can a user reach this through a
documented interface with values it accepts?* — and all three answer no. A join
error requires a task to have panicked or been cancelled; a response-encoding
failure is the server failing to serialize its own output. **Three of three:
declaration was right, caller is the bug.** There is nothing here to reclassify,
so applying the technique changes no code.

More striking is that the tree had already taken the *other* branch, correctly
and on purpose. `ErrorCode::Unsupported` exists as a separate member, and the
comment says why: "Distinct from `internal` so a client (or an operator reading
logs) can tell a permanent capability gap — 'this deploy's backend doesn't do
traces' — from a transient outage, and never confuses it with an empty-but-
authoritative result." A condition that had been landing in the internal class
was found to be genuinely user-reachable and was given a real class. That is the
"declaration was wrong" branch, exercised without the technique existing.

The same reasoning appears once more in the store layer, in the parsing
direction. Commit `e7fcc7c` replaced an `unwrap_or_default()` in `parse_enum`
because "a value the vocabulary did not know was silently coerced into the
type's default and handed downstream as if it were a member" — and it draws the
fork explicitly per vocabulary: `Provider::Unknown` and `Operation::Other` are
deliberate quarantine variants that an unfamiliar value legitimately parses
into, while `status` and `redaction` have no such member and must fail the read.
Its stated reason is the one this technique gives: a corrupt `status` coerced to
`Success` reports a failed call as a successful one, and "none of those look
wrong in a dashboard."

## The half that is genuinely missing

The taxonomy is right; **nothing watches it.** The only assertions naming the
internal class are two unit tests of the error type itself — that it stringifies
to `"internal"` and serializes into the error envelope. **Zero** tests assert
that the class never fires across the suite, and no suite-wide sweep exists.

The detector is unusually cheap here because the expensive prerequisite is
already built and tested: the class has a stable wire string, asserted in a
unit test. A sweep over integration-test responses for that string is the whole
instrument.

## Verdict and its condition

`not-better` **for this tree**, and the condition is worth stating precisely: a
project whose internal class is already narrow, deliberately split, and
constructed only at sites no accepted input can reach has nothing for the fork
to find. The technique's value on such a tree is entirely in the detector, not
in the reclassification discipline — which is now recorded in the technique.

Return condition: build the suite-wide response sweep for the internal wire
string and re-run. Until that instrument exists, the detector half is asserted
here and unmeasured; only the fork half was tested, and it came back clean 3/3.
