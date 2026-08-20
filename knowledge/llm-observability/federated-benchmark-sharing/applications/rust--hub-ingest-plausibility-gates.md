---
layer: application
type: application
subject: federated-benchmark-sharing
technique: hub-ingest-plausibility-gates
stack: rust
status: forged
---

# Rust: LightTrack's one-function hub trust policy

LightTrack's federation hub concentrates its entire trust policy in
`sanitize_entry` (`crates/api/src/collective/sanitize.rs:50-104`), exactly
as the technique prescribes — the module doc calls it "the whole of the
hub's trust policy in one place: identity normalization, closed
vocabularies, `[0,1]` clamps, and the plausibility rules that reject a
count rather than clamping it."

## Clamp vs reject, written as policy

The plausibility rules are documented "in one place so they can be
documented verbatim" (`sanitize.rs:29-37`): every number finite, `n_runs ≥ 1`,
`n_cases ≥ n_runs` ("a run scores at least one case, so more runs than
cases is impossible"), `n_cases ≤ 1_000_000`, `avg_cost_usd ≤ 1_000.0`. The
constants carry their one-sentence justifications: a million-case bucket
"is a typo or an attack, not a benchmark; accepting it hands the merged row
to whoever types the biggest number" (`sanitize.rs:21-24`), and $1000/case
"is not a price, it is noise" (`sanitize.rs:27`). The dividing rule is
stated where it executes: "Quality/pass-rate are *clamped* rather than
rejected (a `[0,1]` overshoot is a rounding artifact); counts are
*rejected*, because a count is the weight the merge trusts"
(`sanitize.rs:36-37`).

The two refusals are distinct variants (`Reject::Malformed` vs
`Reject::Implausible`, `sanitize.rs:14-19`), "kept apart in the ack so a
contributor can tell 'you sent junk' from 'your numbers are not
believable'". The test `implausible_counts_are_rejected_not_clamped`
(`sanitize.rs:192-232`) drives each rule and also asserts the believable
end lands: `n_cases == MAX_CASES_PER_ENTRY` is accepted — the ceiling
itself is plausible.

## Auxiliary fields drop to absent; vocabularies stay closed

`sanitize_entry` drops a negative variance to `None` (`sanitize.rs:81`),
clamps the judge tag to a canon vocabulary where anything unrecognized
becomes `"unknown"` (`canon_judge`, `sanitize.rs:108-117`), and routes the
determinism stamp through `canon_determinism` so "an unrecognized
determinism label becomes 'not recorded' rather than a fourth level — a
poster must not be able to widen the rigor vocabulary, which is exactly
what would turn it into a fingerprinting channel" (`sanitize.rs:93-99`).
Model identity is normalized through `ModelAliases` (`sanitize.rs:65`) so
provider prefixes and dated snapshot names collapse into one row, and the
hub re-buckets the contributed cost (`sanitize.rs:73-75`): "what the
contributor did to its own numbers is its business, what gets published is
the hub's." The hub also stamps `received_at` from its own clock
(`sanitize.rs:102`); retention at read time keys on that stamp
(`crates/api/src/collective/leaderboard.rs:71-74`).

## The gate composes with the floors downstream

The leaderboard endpoint's module doc (`leaderboard.rs:3-5`) fixes the
assembly order the sanitized entries flow into: "read → retention → merge →
**k-anonymity over sources** → user filters → counts over what survived. A
filter that ran before the source floor could strip a row down to one
contributor's private eval results." The source-floor block
(`leaderboard.rs:78-88`) spells out why the case floor cannot substitute
("a 5000-case single-source row is still one source") and discloses
withheld rows as a `held_back` count rather than shrinking the board
silently — the gate, the floors and the disclosure are one pipeline, each
covering the others' residual.
