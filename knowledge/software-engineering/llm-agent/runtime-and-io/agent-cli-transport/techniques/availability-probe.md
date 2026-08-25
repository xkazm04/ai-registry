---
layer: technique
type: technique
subject: agent-cli-transport
technique: availability-probe
status: forged
laws: [failure-not-empty-success, unknown-is-not-a-value]
shared_with: []
use_when: [deciding whether a local agent binary can serve a request, a cached login artifact might be stale or ineligible, a health check must not spend tokens]
---

# The availability probe

Before the first real call, the adapter answers two separate questions:
**is the tool installed**, and **is it authorized to answer**. They fail
differently, they are repaired differently (install versus log in), and a
probe that collapses them into one boolean produces support tickets that
say "the AI is broken" for both.

## Installed: version, parsed leniently

The install probe runs the tool's version command and records the result.
Two disciplines:

- **Parse leniently, compare deliberately.** Version strings in this tool
  class carry prefixes and suffixes that change between releases; the probe
  extracts the semantic version and keeps the raw string. The extracted
  version is not trivia — it is the key into the
  [dated-capability-matrix](./dated-capability-matrix.md), and a version the
  matrix has never seen is a signal to re-verify, not to assume.
- **Resolve like the spawn will.** The probe must execute the same binary
  the real run will execute — through the same resolution the spawn door
  uses — or it validates a different program than the one that will serve
  requests ([gate-sees-target](../../../../_laws.md#gate-sees-target) via the
  borrowed spawn contract). On platforms where the tool ships as a shim,
  the bare name may be launchable from a terminal and not from the host's
  process API; the probe that ignores this reports available on a machine
  where every real call would fail.

## Authorized: a zero-token proof, where one exists

The best tools in this class expose an **auth-status command**: a local
check that reports logged-in state, auth method, and plan tier as
structured output, exits zero when authorized, and **spends no tokens**.
Where that exists, it is the whole authorization probe — cheap enough to
run at startup and before batches.

Where it does not exist, resist the two tempting substitutes:

- **Credential-file existence proves nothing.** A cached login artifact can
  be present, well-formed — and *ineligible*: the account tier was
  discontinued, the token was revoked server-side, the client version was
  end-of-lifed. A probe that reads "file exists" as "authorized" converts
  unknown into a confident yes at exactly the boundary where it misleads
  ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).
- **A silent paid ping.** If the only honest proof is a minimal real run,
  perform it *labeled as spending* — smallest possible prompt, caller aware
  it costs — never as an invisible side effect of a health endpoint that
  fires on every page load.

The probe result is therefore three-valued at minimum: authorized,
unauthorized (with the tool's stated reason), and **unknown** — and unknown
renders as unknown, never as either neighbor.

## The probe result is capability data

A good probe returns a record, not a boolean: installed, resolved path,
version, authorized, auth method (seat versus metered key — the billing
consequence belongs to
[subscription-auth-selection](./subscription-auth-selection.md)), and the
probe's own timestamp. Cache it — probing on every call is waste — but the
cache invalidates on version change and on any real-run auth failure: a
transport that just answered "not logged in" has falsified the cached probe,
whatever its age.

## Policy can veto a healthy probe

Availability is not only mechanical. A deployment-level no-egress flag must
make the probe answer *unavailable* even when the binary is present and
logged in — the child reaches the vendor's cloud through a subprocess, which
network-layer guards in the host runtime cannot see, so the offline policy
has to be enforced here, at the probe, where the fallback ladder can catch
the refusal and degrade deterministically. Same for platform class: a
managed serverless deployment where no local binary can exist should answer
"unavailable on this platform" from configuration, before any filesystem
lookup, so the failure names its real cause
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
