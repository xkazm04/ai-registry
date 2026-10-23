---
layer: application
type: application
subject: native-guest-interop
technique: async-native-as-promise
stack: rust
status: forged
verified_on: 2026-10-22
verified_against: rust@1.96
applied: simulation
ab_verdict: better
---

# Async native as promise, in a component-model host

Verified against a Rust workspace whose `rust-toolchain.toml` pins channel
1.96.1 (the toolchain witness), at commit `937541c`. The host is the
component-model embedding in `crates/engine-wasm/src/app_host.rs`; the guest
contract is `crates/engine-wasm/wit/pumper-app.wit`. The seam did not exist on
2026-10-14 (the plugin host linked nothing); the host-import slice landed on
2026-10-18 and this is the first time the technique has a tree to meet.

## What kind of crossing this is

It is not a promise. The imports are declared `async | trappable`
(`app_host.rs:62` "imports: { default: async | trappable }"), so the guest calls
`fetch` as an ordinary function and the host suspends the guest's fiber while
the future runs. Parts one and two of the technique (a promise created in the
calling frame, a job that owns the resolvers) have no counterpart: the engine
owns the suspension and nothing can be collected out from under a pending
call. The technique's third part, and its decision rule that the conversion
happens at settlement with a typed reason, does apply, and that is the part
this tree can falsify.

## The seam chosen to falsify the rule

Where the host converts a host failure into the guest's failure value:
`app_host.rs:276` `async fn fetch` returns `Ok(Err(e.to_string()))` for any
engine error, and the WIT declares the arm as `result<string, string>`
(`pumper-app.wit` "fetch: func(request-json: string) -> result<string, string>").
The host's own error type is the opposite of a string: it carries
`retry_after` on the HTTP variant and classifies terminal failures through
`is_terminal_for_job` (`crates/core/src/error.rs:932`, six variants).

Three real cases walked under both policies (A: the string as it ships; B: a
name plus bounded message, with the wait carried for the one variant that has
one):

1. **A server asks for a ten-minute wait the fetch budget cannot honour.** The
   error type's own comment records the grants fleet re-queuing in ten seconds
   into the same rate limit. A: the guest sees `http engine: <message>`; the
   wait is not in the text, so a guest that wants to checkpoint and stop has
   nothing to branch on. B: the guest reads the category and the wait.
2. **The job's spend ceiling is reached.** The host variant is terminal by
   construction. A: the guest sees a string beginning `budget:` and can only
   retry or give up by guessing; a retry re-refuses. B: the category says
   terminal. The guest stops at once.
3. **A malformed request.** The one case the host already treats as the
   guest's error, on the `err` arm. A and B agree; this is the control.

Prediction under B: cases 1 and 2 change the guest's next action, case 3 does
not. **Falsifier:** a guest app in the fleet that already branches on the
prefix of the string. None is in this tree (the fixture guest only describes
and runs), so the string has no consumer to break, which is also why the
change is cheap now and a major version later.

## What the tree confirms, and the boundary it adds

Confirms: the rule "never a generic failure string" is violated here exactly
where the host's own type has the information. The error type's comment names
the failure mode (classification by matching substrings of a sentence).

Adds: the host has two failure channels and the split is deliberate. `admit`
(`app_host.rs:181`) returns a trap for the host-call ceiling, the wall-clock
deadline and over-size payloads, and the module comment calls fuel "a ceiling,
not an allowance". Those must NOT become guest-catchable rejections: a guest
that could catch its own ceiling could loop on it. The technique's line that a
raw host failure is a crash where the guest expected a rejection holds only
for failures the guest is entitled to handle; the amendment states that.

## What this realization cannot do

It does not settle a promise, root a handle or reject on cancel: cancellation
drops the whole future (fuel yield interval, `app_host.rs:14-19`) and the guest
never observes it. The typed-reason change is a MAJOR bump of the WIT package
by the file's own versioning rule, so it is a task for the owner, not a patch.
