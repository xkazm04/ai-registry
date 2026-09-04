---
layer: technique
type: technique
subject: mcp-tools
technique: client-integration
status: forged
laws: [creation-names-reaper, gate-sees-target, absent-guard-is-loud]
shared_with: []
use_when: [reviewing an install flow that writes a spawn command, deciding which tool calls stop for a human, two servers exporting the same tool name, a server reading an elicitation response as approval]
---

# Client integration

The consuming side of the protocol — the host application and the clients it
creates — owns everything the wire does not: which servers exist in the
user's world, how they were installed, what the model sees of their
catalogs, and what stands between a model's decision to call a tool and the
tool actually running. Server authors get a spec; host authors get custody.

## Config writing is code execution

For a child-process server, the client configuration *is* the attack: the
config names a command line the host will execute with the user's
privileges. Every install flow that writes such an entry — a one-click
button, a marketplace, a copy-paste snippet — is a code-execution consent
flow and must behave like one:

- show the **exact command, untruncated**, arguments included, before
  writing it; a truncated or summarized command is a consent dialog about a
  different program;
- treat edits to an existing entry with the same gravity as creation — the
  swap of a binary name inside an already-approved entry is the cheap
  version of the attack;
- highlight the shapes that deserve fear: shell chaining, network fetch
  piped to an interpreter, paths into credential directories;
- prefer spawning without a shell at all — argument arrays, not command
  strings — so the config cannot smuggle a second command inside the first.

The config file itself is part of the trust boundary. When install flows
inject **capability tokens** through it (an environment entry or argument the
spawned server or the connecting client presents on calls), the file has
become a credential store: permissions chosen deliberately at creation,
secrets excluded from backups and sync where possible, and — the
discipline most often skipped — an expiry and a rotation owner for the token
written there ([creation-names-reaper](../../../../_laws.md#creation-names-reaper)).
A never-expiring token in a world-readable config outlives the enthusiasm of
whoever installed it, indefinitely.

## Connection custody

The host creates one client per server connection and owns each one's
lifecycle: spawn (or connect), converse, and reap — child processes killed
on shutdown and on config replacement, network connections closed, and
nothing left running because a teardown path forgot it. Under the stateless
architecture the client keeps its own bookkeeping honest: it caches each
server's self-description within the freshness terms the server declared
(a capability check against a stale cached description is a check against a
proxy — [gate-sees-target](../../../../_laws.md#gate-sees-target) — so honor the
declared lifetime, and re-discover on version errors), stamps every request
with version, capabilities, and identity, and treats reconnects as routine
rather than exceptional.

The client's other standing duty is freshness of the catalogs: subscribe to
list-changed notifications where offered, refresh on receipt, and poll
regardless — notifications are best-effort by contract, so a client whose
tool map is only as fresh as its last received notification has a tool map
of unknown age.

## Federation: the host curates what the model sees

A host connected to many servers holds a combined catalog the model cannot
usefully swallow whole. Selection quality falls as the catalog grows, and
the host — the only party that sees the whole federation — owns the
countermeasures:

- **Progressive discovery**: expose to the model the tools plausibly
  relevant to the current task, not the union of everything installed; load
  more on demand.
- **Collision management**: two servers exporting `search` need
  distinguishing at the host layer — prefixing by server, or curated
  aliases — because the model's choice between identical names is chance.
- **Per-context enablement**: which servers are even *on* is a user-visible
  setting per workspace or conversation, not a global constant. The blast
  radius of a malicious or compromised server is bounded first by where it
  is enabled at all.

## The consent seat

Tools are model-controlled; consent is host-enforced. The host decides which
calls proceed unattended and which stop for a human, and the design
dimensions are:

- **Tiering by declared blast radius** — read-only tools may auto-approve
  where destructive ones always confirm — remembering the declarations are
  the server's unverified claims about itself, so the tier assignment also
  weighs how much the *server* is trusted, not just what the tool claims.
- **Grant memory with an edge**: "always allow this tool" is a standing
  grant, and standing grants need review surfaces and revocation, like any
  credential.
- **Provenance in the prompt**: the consent dialog names which server is
  asking, with which arguments, verbatim — the human is the last gate, and a
  gate that cannot see what it gates approves blind.

**Elicitation inverts the flow** — the server asks the user a structured
question mid-operation, through the client. The host's obligations: render
the request as coming *from the server, by name* (a server must not be able
to impersonate the host's own chrome and phish through it), constrain the
response to the declared structure, and let the user decline without the
transcript treating decline as an error. With sampling deprecated, elicitation
is the one channel by which a server reaches the human; guard its authenticity
accordingly.

## The server's half of the elicitation contract

Those obligations are the host's. The server that *asks* has its own, and
that is where the defect usually lives, because the answer arrives in two
places at once and only one of them is the decision.

- **The envelope is not the decision.** The transport-level response carries
  an action; the structured payload carries the user's actual selection. A
  client that submits the form returns action *accept* even when the user
  chose the reject option — their choice lives in the payload field the
  elicitation's own schema declared required. A server that reads only the
  envelope therefore converts every rejection into an approval. Require
  **both** the envelope action and the declared decision field to say accept;
  anything else is not approval. The gate must read the field the schema
  declared, not the wrapper the transport supplied
  ([gate-sees-target](../../../../_laws.md#gate-sees-target)).
- **Absent capability is a denial, not a default.** A client that does not
  support elicitation at all has the call rejected — never waved through on
  the grounds that consent could not be collected
  ([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)). Fail
  closed, because that client is precisely the one least able to show a
  consent prompt.
- **An elicitation that throws is a denial too.** Any exception in the consent
  round trip resolves to not-approved.
- **The last three return a result; the first does not, and the split is the
  two-channel rule working correctly.** An envelope-accept with a
  payload-reject, an explicit decline and a mechanism error are all outcomes
  addressed to the model, which can explain them and choose differently — a
  consent failure routed through the protocol channel kills a conversation
  that could have recovered. But a caller that never declared the consent
  capability at all cannot be talked into consenting by anything the model
  says: the remediation is a host or configuration change, so it belongs to
  the machinery, and the right answer is a typed protocol error naming
  **which capability would have made the call succeed**. Apply the actor test
  from [tool-schema-design](./tool-schema-design.md) rather than a blanket
  rule, and a consent architecture routes each outcome to the party that can
  move it.

The general shape is worth naming: a consent mechanism has **five distinct
not-approved outcomes** — capability absent, envelope-accept with
payload-reject, explicit decline, mechanism error, and **silence**. A server
that collapses them into a single boolean will get at least one of them wrong,
silently, and in the permissive direction.

**The fifth is the one a blocking design never had, and it is invisible by
construction.** When the consent round trip is a held call, silence has a
deadline — the wait times out and the server learns something. When the round
trip is instead *terminate now, resume later* — the shape a stateless
protocol forces, because a server may not hold a slot open for a human — the
original call has already **completed successfully**, and a caller that
simply never comes back is indistinguishable from one still thinking, one
whose user walked away, one that crashed, and one whose host policy
suppressed the prompt without telling anybody. Three consequences follow, and
each has bitten someone: a refusal that must be *recorded* may never be
recorded, so no approval gate may treat "no decline seen" as "not declined";
there is nothing in flight to cancel, so a user dismissing the dialog
generates no cancellation; and any progress channel scoped to the original
call dies with it. Anything the server reserved pending an answer is
therefore reclaimed **by expiry, not by a decline** — the timeout is the only
mechanism that fires, so it must exist and be short enough to matter.

## Failure at the seam

The host degrades per-server, never globally: one server that fails to
spawn, times out, or version-mismatches is marked degraded — visibly, with
its name and the reason — while the rest of the federation keeps working.
And "this server offered zero tools" is rendered differently from "this
server could not be reached": a catalog honestly empty and a catalog
unknowable are different facts, and a host that shows both as an empty list
teaches its user to distrust the empty state in both directions.
