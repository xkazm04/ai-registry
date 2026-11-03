---
layer: application
type: application
subject: agent-host-experience
technique: journey-shaped-tool-surface
stack: rust
status: forged
verified_on: 2026-11-03
verified_against: rust@1.97
---

# Journey-shaped tool surface in a money-safety wallet's role-scoped tool server

The wallet (`paypal` in the fleet, read at commit
`a52d8f6dfaab5dc6450b7c7c2d7743be2f7d8ada`, toolchain pinned to Rust 1.97 in
`rust-toolchain.toml`) exposes one loopback MCP server, `crates/table-mcp`, to the
negotiating and shopping agents it launches, and a sandbox front door,
`crates/table-sandbox`, that lets an outside agent app (Claude Code, Codex CLI) connect
to the same server under a live run's grant. It is the strongest journey-shaped surface
in the fleet and the clearest list of what an outside-agent surface still lacks. Every
claim of the technique is marked **confirmed**, **deviation** (the standard stays) or
**upward lesson** (the technique was improved from it). Anchors sit one per line.

## Journeys, not endpoints

**Confirmed — one catalog per role, granted, never excluded.** The server computes what
a session may see from its role. The negotiator gets five operations for one deal, the
shopper two, the assistant one grouped read; every operation finishes a step of the
negotiation journey (read the table, send, accept, withdraw) rather than exposing deals,
offers and bands as nouns.

- `crates/table-mcp/src/lib.rs:276 "The tools a role is served."`
- `crates/table-mcp/src/lib.rs:279 "AgentRole::Negotiator =>"`
- `crates/table-mcp/src/lib.rs:286 "AgentRole::Shopper =>"`
- `crates/table-mcp/src/lib.rs:287 "AgentRole::Assistant =>"`

The design note for a future chat states the reuse rule the technique carries, and the
shape of the outside-agent role it would need — the reads plus one write that opens the
decision:

- `docs/design/conversational-home.md:13 "The existing MCP server is the wrong tool."`
- `docs/design/conversational-home.md:15 "it should be a new read-only role"`

**Confirmed — the tool set is one authority.** Schema, description and annotations are
exhaustive matches on one enum, so a tool cannot ship without them.

- `crates/table-mcp/src/lib.rs:298 "on this enum, so a tool added here without them does not compile"`

**Confirmed — the blast radius is stated in words the model reads.** Each description
ends with what the operation never does, and the sandbox banner repeats it for the
person connecting an agent.

- `crates/table-mcp/src/lib.rs:357 "Sign a WITHDRAW and leave the table. Moves no money."`
- `crates/table-mcp/src/lib.rs:359 "It waits for the owner; it pays nothing."`
- `crates/table-sandbox/src/main.rs:85 "(negotiator: 5 tools, none moves money)"`

**Upward lesson — one state read that names the next moves.** The table read returns the
state and the operations that can succeed now. The technique's procedure step 4 was
written from it: a precondition the server knows is not left for the model to discover
by refusal.

- `crates/table-mcp/src/lib.rs:346 "which tools can succeed now"`

**Confirmed — the counter-case where a thin read is right.** The assistant's only
operation is a primitive with a closed grammar of views, metrics, filters and groupings.

- `crates/table-mcp/src/lib.rs:361 "Read grouped numbers from the owner's own records."`

## Refusals and unknowns

**Confirmed — refusal with a closed code and the rule's own words, in both channels.**
The refusal carries the code, the clause, and the signed rule's text as structured
content and as the first text block; the descriptions name the refusals in advance.

- `crates/table-mcp/src/lib.rs:412 "content and as the text an older client reads"`
- `crates/table-mcp/src/lib.rs:416 "pub fn refusal_result(code: RefusalCode, detail: Option<String>) -> Value"`
- `crates/table-mcp/src/lib.rs:352 "Refused, with a code, outside the signed band"`

**Upward lesson — an abandoned call is unknown, and the model must look.** The
technique's step 6 takes this whole, including the oversize case.

- `crates/table-mcp/src/lib.rs:560 "The call may have been cut off mid-flight; the model must look, not retry."`
- `crates/table-mcp/src/lib.rs:571 "Its outcome is unknown: read the table before acting again."`
- `crates/table-mcp/src/lib.rs:601 "Ask for less (a narrower view, a smaller limit)."`

**Upward lesson — a grant can be discoverable before it is executable.** The agent can
read its catalog and plan while nothing it calls can act.

- `crates/table-mcp/src/lib.rs:169 "no intent executes before the host enables this grant"`

**Upward lesson — a host reads errors before the model does.** The front door renews an
expired session itself rather than surface the status; the technique's section on
errors a host reads was written from this line.

- `crates/table-sandbox/src/front.rs:365 "a client may read it as a sign-in challenge"`

**Confirmed — the door adds no authority, and the bounds are named.** The outside agent
reaches exactly the gates the wallet's own engines do.

- `crates/table-sandbox/src/front.rs:2 "holds no authority of its own"`
- `crates/table-mcp/src/lib.rs:114 "SESSION_SECS: i64 = 120"`
- `crates/table-mcp/src/lib.rs:117 "CALL_BUDGET: u32 = 64"`

## Deviations — the work list

1. **Protocol revision two generations behind.** `initialize` answers an old revision,
   with session headers rather than server-minted handles passed as arguments; the
   current revision is stateless. The server's own marker admits the consequence for
   structured content. The text block carries the same JSON, so the refusal code
   survives either way, but the stance should move to the current revision and the
   marker be settled by a probe in each host.
   - `crates/table-mcp/src/lib.rs:498 "2024-11-05"`
   - `crates/table-mcp/src/lib.rs:413 "UNVERIFIED: whether claude-code / codex-cli surface"`
2. **Documented as streaming, served as POST-only JSON.** The banner tells the user the
   server streams, while both doors route only a POST and answer one JSON body. Either
   the description or the transport has to change; a host that opens a listen stream
   today gets nothing.
   - `crates/table-sandbox/src/main.rs:87 "a streamable HTTP MCP server at"`
   - `crates/table-mcp/src/lib.rs:231 "post(handle)"`
   - `crates/table-sandbox/src/front.rs:181 "post(mcp)"`
3. **No response modes.** The table read takes one optional deal identifier and always
   answers in full; there is no concise mode for an agent polling whose turn it is. Add
   a concise default and a detailed mode.
   - `crates/table-mcp/src/lib.rs:386 "Self::TableView =>"`
4. **Incomplete behavior hints.** The listing publishes two axes only, with no
   idempotent or open-world verdict, where tool-schema-design requires a verdict on every
   axis. The destructive mapping itself is honest and documented.
   - `crates/table-mcp/src/lib.rs:401 "let (read_only, destructive) = self.annotations();"`
   - `crates/table-mcp/src/lib.rs:365 "never as money: no tool moves money"`
5. **No handoff.** A proposed purchase waits for the owner, but the result carries no
   handle or link that lands the owner on that decision in the wallet; the outside agent
   can only say it is waiting. The outside-agent role whose single write opens the
   decision is designed, not built.
   - `docs/design/conversational-home.md:26 "The chat may only open the right decision"`
6. **No views and no view-only operations.** Nothing in the listing distinguishes
   model-visible from view-only, and no operation declares a view. Confirming an offer
   inside a host that renders views — the price against the signed band — is the one
   place in this surface where a view would earn its place.
   - `crates/table-mcp/src/lib.rs:400 "fn listing(self) -> Value"`
