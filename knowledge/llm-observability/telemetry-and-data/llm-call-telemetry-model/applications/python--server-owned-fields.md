---
layer: application
type: application
subject: llm-call-telemetry-model
technique: server-owned-fields
stack: python
verified_on: 2026-10-06
verified_against: python@3.12
---

# Server-owned message metadata in an agent gateway (deer-flow)

Verified against the deer-flow source tree at commit `08b27aef` (2026-09-02) and re-verified at `53df22bd` (2026-10-06); every line cited below was re-opened in the newer clone and the line numbers are its own. The middleware guide was compressed between the two commits; where a quotation survives only in the older text, it is marked as such.

The technique's stamp-and-strip door, applied to a run request instead of a
telemetry event. The subject wrote it for accounting attribution arriving
from SDK producers; the same decision recurs where the producer is a
middleware and the record is a chat message.

## The server-owned set

`_SERVER_OWNED_MESSAGE_METADATA_KEYS` holds the provenance triple every
injecting middleware stamps - content kind, producer kind, optional producer
entity - as `PROVENANCE_KEYS` unioned into the set
(`backend/app/gateway/services.py:144-172`; the stamping rule is
`backend/packages/harness/deerflow/agents/middlewares/AGENTS.md:26-29`). Between
the two commits the set grew to cover tool-output blob references, transform
trails, skill-usage records, a project-context marker and the untrusted-input
marker - every new server-authored key went into the one set.
The same set covers the display sequence number the gateway assigns and
strips from inbound messages (`backend/app/gateway/AGENTS.md:150-157`), the
internal-caller flag derived only from the server-side auth source, the
channel user id accepted only from an internally authenticated caller's
top-level context, and the assistant `created_by` field, which is
server-owned because the upstream runtime gives one of its values privileged
semantics (`backend/app/gateway/AGENTS.md:84-86`).

The request trace id is the sharpest instance. It is a context variable the
gateway binds, "the only source"; every other carrier is a derived output,
never read back as input, and a caller-sent value is replaced, because
honouring it "would let the persisted run disagree with the header and the
logs" (`backend/packages/harness/deerflow/AGENTS.md:5-11`). Four fixes in one
changelog entry closed the surfaces where a caller's value had survived:
the run record, the persisted request echo, the exception-handler response
and the cross-origin exposure of the header.

## The one-door property

`build_run_config` merges metadata onto a copy so the stamp cannot reach the
client's own config (`backend/app/gateway/services.py:1077-1086`), and the same
function strips `__`-prefixed runtime keys that consumers use for in-run
signalling (`middlewares/AGENTS.md:77-82`).
Stamping and stripping share one function before storage, which is the
technique's requirement.

## What the tree adds

Stamping is **unconditional**: "a fact whose presence depends on whether an
observer is installed is not a fact" (the guide at `08b27aef`, lines 13-14;
at `53df22bd` the guide keeps the rule and drops the reason - stamp "even
without observers", `middlewares/AGENTS.md:28-29`). The
telemetry subject's producers are SDKs that always emit; a middleware chain
can be composed with or without an observer, so the guide states the rule
and then enumerates which producers deliberately do *not* stamp and why -
summarization and title are attributed through system-model-call
observation instead, so a second stamp would be a second truth
(`middlewares/AGENTS.md:29-33`).

## What this realization cannot do

The set is a list. A new middleware that injects a message and forgets to
stamp produces a message with no provenance rather than a wrong one; the
guide's rule "adding a behaviour-affecting field means adding it to the
declaration in the same change" (the `08b27aef` wording; at `53df22bd`,
"Update `collect_release_policies()` declarations with behavior",
`middlewares/AGENTS.md:37-38`) is a review convention, not a gate.
