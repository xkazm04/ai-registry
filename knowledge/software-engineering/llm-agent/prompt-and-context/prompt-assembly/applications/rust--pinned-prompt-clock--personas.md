---
layer: application
type: application
subject: prompt-assembly
technique: pinned-prompt-clock
stack: rust
status: forged
verified_on: 2026-09-29
verified_against: rust@1.96
applied: simulation
ab_verdict: unmeasurable
---

# A latent per-request clock beside a correct tail section (Rust, desktop companion)

A prompt builder for persona runs that exposes time as template variables, and appends a
run-budget section after assembly. The first is the technique's trap, unarmed; the second
is the technique's answer, built for a different reason.

## The trap, unarmed

The interpolation step defines its "magic" variables from one clock read per assembly
(`src-tauri/engine/src/prompt/variables.rs:23 "trusted_vars.insert("now".into(), now.to_rfc3339());"`),
alongside a date-only `today` and an `iso8601` alias. The `now` value carries fractional
seconds whenever the clock does, so a persona template that used `{{now}}` in its system
text would change its prefix on every request, permanently, not at midnight. A search
of the shipped templates and non-test code found no use of `now` or `iso8601`; `today`
appears only in the golden path's documentation and in tests. **The seam is present and
nothing is standing on it.**

## The answer, arrived at for another reason

The run-budget section, which tells the model when the run will be killed and at what
fraction to stop starting new work, is built from a clock read and formatted to the
second (`src-tauri/engine/src/prompt/assemble.rs:1172 "let fmt = |t: chrono::DateTime<chrono::Utc>| t.format("%H:%M:%S").to_string();"`),
which is the most cache-hostile content a prompt can carry. The runner appends it *after*
assembly, at spawn time
(`src-tauri/src/engine/runner/mod.rs:1690 "prompt::append_spawn_time_section("`), so it
sits beyond everything that might be cached and the assembled prefix is untouched. That
is the technique's placement rule — volatile content at the tail — met by a different
route: the section is per-run because it is a deadline, not because anyone was protecting
a cache.

## Three cases, read from the tree

| Case | Where it would land | Prefix affected? |
| --- | --- | --- |
| a template uses `{{now}}` | system text, per request | yes, every request |
| a template uses `{{today}}` | system text, per day | yes, at midnight, for open sessions |
| the run-budget section | appended after assembly | no |

Verdict `unmeasurable`, mode `simulation`: three cases from a real tree, none exercised.
The instrument that would measure it is the provider's cache-read counter across a
midnight crossing for a persona run that uses a time variable; no such template exists,
so there is nothing to measure. Return condition: a persona template adopts `now` or
`iso8601`, at which point the technique's test (fingerprint of the system layer equal
across a crossing) is the acceptance check. Until then the cheap safeguard is a test that
fails when a template references the sub-second variables in system text.
