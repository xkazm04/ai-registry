---
layer: application
type: application
subject: prompt-safety
technique: session-capability-conjunction
stack: rust
verified_on: 2026-09-14
applied: simulation
ab_verdict: unmeasurable
proof: structural-only
---

# Session capability conjunction at the Rust runner's doors

The runner spawns an agent CLI per persona execution, relays credentialed API
calls through its own proxy, and ships exactly one mutating hook point. All
three legs of the conjunction exist in this tree. The one gate that could refuse
the outbound step judges each request alone, and its type cannot express the
rule.

**The seam was chosen to falsify the technique.** The proxy already enforces
per-credential resource scope. If scope enforcement cut the exfiltration path on
its own, the conjunction would add nothing here, and the application would have
said so. It does not cut it (case 1), which is where the technique's "destination
scope shrinks C, it does not remove it" rule came from.

## Three cases from the tree, under policy A (as built) and B (the conjunction)

**1. A credential-relayed write after a third-party read.** The emit site
`hooks::MutationPoint::ApiRequest` (`src-tauri/src/engine/api_proxy.rs:724-820`)
wraps SSRF validation and scope enforcement. The request record it judges is
`ApiCall { credential_id, service_type, method, path, original_path, rewrites }`
(`src-tauri/src/engine/runner/hooks/mod.rs:164-174`): no execution or session
identity. *A:* a session reads a hostile page, and the page tells the model to post
a record's contents to an endpoint inside the credential's scope. SSRF passes,
scope passes, the request goes out. *B:* an interceptor at the same point reads the
execution's leg ledger, sees A and B lit, and returns a refusal value for a
write-method request. *Falsifier:* every connector whose credential can write is
scoped to destinations no third party can read.

**2. Credentials enter at spawn.** `inject_connector_credentials`
(`src-tauri/src/engine/runner/credentials.rs:546-575`) decrypts a connector's
fields into the child process's environment. *A:* B is lit before the first turn
for any persona with a connector, and nothing records it. *B:* the ledger sets B
at spawn, not on read, because the host cannot see a read of its own environment.
*Falsifier:* the CLI's environment is unreadable to model-issued tool calls.

**3. The roster is undeclared.** `resolve_allowed_tools`
(`src-tauri/engine/src/prompt/discipline.rs:127-157`) returns `None` unless an
operator sets the `allowed_tools` parameter, and the runner's own comment records
that `None` "is every persona until an operator sets the parameter"
(`src-tauri/src/engine/runner/mod.rs:614-617`). Outside tests, no tree file sets it.
*A:* whether a session can fetch pages (leg A) or open a network connection from a
shell (leg C) belongs to the harness underneath and is unknown to the host. *B:*
undeclared means all legs lit, so every connector-carrying session hits the
outbound gate. The predicted cost is approval volume, which is why the design-time
cut (declare rosters that exclude a leg) is the first move here. *Falsifier:*
declared rosters turn out to be the common case in stored personas, not only in
tests.

## The structural fact

The hook surface is deliberately honest: one mutating point, a typed refusal, and
a pairing test that fails the build if a point has no emit site. That honesty makes
the gap exact. The tree's only refusal-capable door is **session-blind by type**, and
the place where leg A becomes observable, the stream's tool-result lines, has no
emit site. The runner can refuse a request for what the request says, and never for
what the session has read.

## What this realization cannot do

Even with the ledger, the proxy is not the whole of leg C. A shell tool inside the
spawned CLI opens its own connections, and the proxy never sees them. A gate built
at `ApiRequest` guards the credentialed doors only, and should record the
shell-network door as unguarded rather than imply coverage.

## Verdict

`unmeasurable`: no arm was run. The instrument that would measure it: an execution
id carried on `ApiCall`, a tool-result classifier that sets leg A, and a replayed
injection fixture (hostile page, then an in-scope write) counting refused outbound
writes under A and B, beside the count of sessions the gate would interrupt.
