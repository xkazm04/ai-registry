---
layer: application
type: application
subject: live-test-consent-and-evidence
technique: owned-test-accounts-only
stack: rust
status: forged
verified_on: 2026-11-02
verified_against: rust@1.97.1
---

# Owned test accounts in a Rust streamer desktop's Twitch live spike and live twins

Castle Control (main checkout, 2026-11-02; toolchain 1.97.1 from `rust-toolchain.toml`)
is a desktop toolkit a human streamer runs beside their Twitch stream. Its moderation
calls were tested against Twitch in two shapes: a one-shot owner spike binary in
`cc-core` that performs one armed timeout and undoes it, and ten ignored "live twin"
tests in `cc-twitch` that only observe actions the owner performs by hand. This
application follows how both keep every live action on accounts the owner named, and how
the exact flag and the undo sit around that.

## The rule is repo law before it is code

- `CLAUDE.md:22` "Live tests run only on the owner's test channel. Armed actions only ever target the owner's own test accounts."
- `CLAUDE.md:23` "No armed action reaches a real viewer until the M1 exit is met and the owner signs off in writing."
- `CLAUDE.md:16` "Real chat never becomes a fixture: test data is generated and labelled simulated."

## Ownership is the operator's assertion; the harness checks around it

The spike runbook says outright that the code cannot infer ownership, and the twin README
says the same:

- `docs/spike-log.md:209` "Use only your own test channel and a different **owned, non-moderator test"
- `docs/spike-log.md:210` "account**. Passing `--target-login` is your assertion that you own that account."
- `crates/cc-twitch/README.md:93` "is responsible for choosing their test accounts; ownership is not inferred from"

What can be checked is checked, as refusals, before anything is sent. In the twins the
authenticated identity must be the channel's broadcaster and the target a different
account:

- `crates/cc-twitch/src/tests/spike_session.rs:53` "!authenticated.is_empty() && authenticated == broadcaster,"
- `crates/cc-twitch/src/tests/spike_session.rs:57` "!target.is_empty() && target != broadcaster,"
- `crates/cc-twitch/src/tests/spike_session.rs:58` "live refusal: target must be a distinct owner-controlled test account"
- `crates/cc-twitch/src/tests/spike_session.rs:241` "assert!(std::panic::catch_unwind(|| ownership("999", "111", "222")).is_err());"

In the spike, the login must be the test channel's broadcaster, and the target identifies
itself: only the fixed marker from the named login is accepted, a moderator target is
refused, and the numeric ID comes from the platform's chat metadata on that message:

- `crates/cc-core/src/spike_run.rs:62` "return Err("spike requires the test channel broadcaster login");"
- `crates/cc-core/src/spike.rs:153` "if !ingress.login.eq_ignore_ascii_case(expected) || ingress.message.text != "!castle-spike" {"
- `crates/cc-core/src/spike.rs:157` "return Err("target must be a non-moderator owned test account");"
- `docs/spike-log.md:237` "logged. The target's numeric ID comes from Twitch's verified chat metadata, not"

**Deviation:** the twins take the target as a login and resolve it with a name-to-ID
lookup, then check broadcaster/target distinctness only; they do not refuse a privileged
target the way the spike does. The spike's self-identifying marker is the stronger form
and the twins do not use it.

- `crates/cc-twitch/src/tests/spike_session.rs:135` "let target_id = bridge"
- `crates/cc-twitch/src/tests/spike_session.rs:136` ".user_id(&target)"

## Fixed markers in, fixed markers out

The spike writes one constant timeout reason and echoes one constant chat marker; no other
body is printed. The twins persist no payload at all:

- `crates/cc-core/src/spike_run.rs:109` ".timeout(&message.viewer.id, 30, "Castle Control owner test spike")"
- `crates/cc-core/src/spike_run.rs:86` "Only this fixed marker is echoed; other chat is not logged."
- `crates/cc-twitch/README.md:139` "They do not write a ledger, save chat, or persist payloads as evidence/fixtures."

## Observe before you act (upward lesson)

The twins issue no mutation at all. Every moderation action is performed by the owner in
the platform's own interface while the test listens; state-changing scenarios read the
initial state and verify the restore. This was not in the first draft of the technique.

- `crates/cc-twitch/README.md:131` "All moderation mutations are **owner-driven observations**, including warnings,"
- `crates/cc-twitch/README.md:138` "stop their sockets on exit; they do not call `disconnect` and revoke the login."
- `crates/cc-twitch/src/tests/spike_session.rs:174` "// A queued event from before the instruction is not evidence of the"
- `crates/cc-twitch/src/tests/spike_session.rs:176` "while self.rx.try_recv().is_ok() {}"
- `crates/cc-twitch/src/tests/spike_session.rs:203` ".expect("live observation timed out after 90 seconds; assumption NOT verified")"

## Around it: the exact flag and the undo

The twins' guard compares the flag to exactly `1` as the first statement of a session,
is tested with near-misses without touching the environment, and the runbook scopes the
arming to one command:

- `crates/cc-twitch/src/tests/spike_session.rs:46` "flag == Some("1"),"
- `crates/cc-twitch/src/tests/spike_session.rs:100` "guard(std::env::var("CC_LIVE_TWITCH").ok().as_deref());"
- `crates/cc-twitch/src/tests/spike_session.rs:234` "Some(" 1"),"
- `crates/cc-twitch/README.md:84` "sets an environment variable. Running the ignored suite without the flag must fail."
- `docs/spike-log.md:75` "Remove-Item Env:CC_LIVE_TWITCH"

The spike's single armed action is undone whatever the timeout call returned, an
unconfirmed timeout fails the step even after a clean undo, and an unconfirmed undo
hands the owner a named check:

- `crates/cc-core/src/spike_run.rs:106` "// Even a failed/uncertain timeout response is followed by an undo attempt."
- `crates/cc-core/src/spike_run.rs:111` "let undone = services.bridge.unban(&message.viewer.id).await;"
- `crates/cc-core/src/spike_run.rs:113` "(_, Err(_)) => Err("undo unconfirmed: owner must check the test account in Twitch"),"
- `crates/cc-core/src/spike_run.rs:114` "(Err(_), Ok(())) => Err("timeout unconfirmed; undo requested"),"

**Deviation:** there is no pre-flight check that the target starts un-timed-out and no
read-back of the target's state after the unban; "undone" rests on the unban call's
response.

The recorded result of that one armed step:

- `docs/spike-log.md:166` "| WP timeout / undo — ARMED, owned target only | WP (below) | `<UTC> PASS timeout_and_undo` | 2026-10-27T16:44:57.252Z | run 10: 30 s timeout on castlecontroltarget, undone |"
