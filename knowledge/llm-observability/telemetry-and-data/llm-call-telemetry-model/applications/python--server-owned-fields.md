---
layer: application
type: application
subject: llm-call-telemetry-model
technique: server-owned-fields
stack: python
verified_on: 2026-09-02
verified_against: python@3.12
---

# Server-owned message metadata in an agent gateway (deer-flow)

Verified against the deer-flow source tree at commit `08b27aef` (2026-09-02); every line cited below was opened in that clone.

The technique's stamp-and-strip door, applied to a run request instead of a
telemetry event. The subject wrote it for accounting attribution arriving
from SDK producers; the same decision recurs where the producer is a
middleware and the record is a chat message.

## The server-owned set

`_SERVER_OWNED_MESSAGE_METADATA_KEYS` holds the provenance triple every
injecting middleware stamps - content kind, producer kind, optional producer
entity (`backend/packages/harness/deerflow/agents/middlewares/AGENTS.md:7-16`).
The same set covers the display sequence number the gateway assigns and
strips from inbound messages (`backend/app/gateway/AGENTS.md:78-85`), the
internal-caller flag derived only from the server-side auth source, the
channel user id accepted only from an internally authenticated caller's
top-level context, and the assistant `created_by` field, which is
server-owned because the upstream runtime gives one of its values privileged
semantics (`backend/app/gateway/AGENTS.md:23`).

The request trace id is the sharpest instance. It is a context variable the
gateway binds, "the only source"; every other carrier is a derived output,
never read back as input, and a caller-sent value is replaced, because
honouring it "would let the persisted run disagree with the header and the
logs" (`backend/packages/harness/deerflow/AGENTS.md:1-9`). Four fixes in one
changelog entry closed the surfaces where a caller's value had survived:
the run record, the persisted request echo, the exception-handler response
and the cross-origin exposure of the header.

## The one-door property

`build_run_config` merges metadata onto a copy so the stamp cannot reach the
client's own config, and the same function strips `__`-prefixed runtime keys
that consumers use for in-run signalling (`middlewares/AGENTS.md:61-66`).
Stamping and stripping share one function before storage, which is the
technique's requirement.

## What the tree adds

Stamping is **unconditional**: "a fact whose presence depends on whether an
observer is installed is not a fact" (`middlewares/AGENTS.md:13-14`). The
telemetry subject's producers are SDKs that always emit; a middleware chain
can be composed with or without an observer, so the guide states the rule
and then enumerates which producers deliberately do *not* stamp and why -
summarization and title are attributed through system-model-call
observation instead, so a second stamp would be a second truth
(`middlewares/AGENTS.md:17-26`).

## What this realization cannot do

The set is a list. A new middleware that injects a message and forgets to
stamp produces a message with no provenance rather than a wrong one; the
guide's rule "adding a behaviour-affecting field means adding it to the
declaration in the same change" is a review convention, not a gate.
