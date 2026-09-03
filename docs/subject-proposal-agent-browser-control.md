# Subject proposal — `agent-browser-control`

**Status:** **EXECUTED** 2026-09-02 by run `intake-gstack-0902`, in the same session that raised it (intake 2.1.0, forge handoff scoped to one subsystem: three `design` candidates with `corpus: NONE` and one home). Forged as five techniques plus one application by one forge worker. Overrides recorded by the drafter: `physical-surface-separation` renamed `socket-scoped-surface` (nothing physical is separated; the mechanism is that a path's privilege is which socket it exists on); `bounded-event-buffers` folded into `persistent-browser-daemon` as a section (a property of the daemon's state, not a concern an adopter would look up alone); cookie import as a section of the same technique with the one-platform limitation stated; the protocol discriminator placed in the golden path opening. Two fetches spent on the driver's actionability primary and the accessible-name computation draft. Six deviations recorded and carried into the source-tree task row (`librarian/handoffs/2026-09-02-gstack-source-tree-task.md`). One anchor drift found: the architecture document names the accessibility snapshot API by an older name than the code calls.
**Bundle:** `software-engineering`
**Category:** `llm-agent` → subcategory `runtime-and-io`
**Resolved path:** `knowledge/software-engineering/llm-agent/runtime-and-io/agent-browser-control/`
**Raised by:** `/intake`, 2026-09-02, from
[`librarian/sources/2026-09-02-gstack.md`](../librarian/sources/2026-09-02-gstack.md) (design record entries D3a–D3e).
**Engine:** `domain-knowledge-forge` — read [`forge-brief.md`](forge-brief.md) first; it is the contract.

---

## Placement, verified against the authority

`taxonomy.json` is the authority. `llm-agent.runtime-and-io` currently holds **nine**
subjects — `streaming-output`, `subprocess-lifecycle`, `agent-cli-transport`, `mcp-tools`,
`terminal-multiplexing`, `sidecar-provisioning`, `voice-io`, `agent-addressable-ui`,
`agent-runtime-assembly` — with no nested sub-subcategories. The cap is ten. A tenth flat
subject is legal and creates no mixed node. **Append the slug to the subcategory's
`subjects` array through `scripts/apply-taxonomy.mjs`; do not edit the tree by hand.**

Link depths, stated so they are not derived wrongly:

- from `agent-browser-control/agent-browser-control.md` → `../../../_laws.md`
- from `agent-browser-control/techniques/<t>.md` → `../../../../_laws.md`
- to a sibling subject: `../mcp-tools/mcp-tools.md`, `../subprocess-lifecycle/subprocess-lifecycle.md`,
  `../agent-addressable-ui/agent-addressable-ui.md`
- to a sibling's technique: `../mcp-tools/techniques/write-freshness-gate.md`,
  `../subprocess-lifecycle/techniques/<t>.md`
- to another category's subject: `../../../security/browser-credential-boundary/browser-credential-boundary.md`,
  `../../../backend-platform/resilience/error-handling/techniques/user-facing-mapping.md`,
  `../../prompt-and-context/prompt-safety/prompt-safety.md`

## The gap, measured

The corpus has **no subject for an agent driving a real browser**. Concept probes
(`research-map`, `--prose`, on concepts never on product names) and the golden paths
opened afterwards:

| concept probed | best hit | what it actually covers |
| --- | --- | --- |
| long-lived daemon, state file, auto-restart | `fleet-orchestration/session-registry`, `session-continuation` | *agent* sessions and their continuation — not a tool process the agent talks to |
| element references from the accessibility tree, staleness | `agent-addressable-ui` | the **mirror**: an application stamping references into its own UI so an agent can name them. This subject is the other side — an agent naming elements in *any* page it did not build |
| listener port separation instead of header inference | `webhook-ingestion/listener-lifecycle` | inbound webhooks; nothing about a local tool exposing a scoped remote surface |
| read / write / meta command classes | `mcp-tools/write-freshness-gate`, `egress-argument-gating` | the effect distinction for MCP tools — the nearest neighbour, and it models the *force* (a write is not a read) without the browser's lifecycle around it |
| actionable errors for agents | `machine-paced-delivery/agent-readable-build-outcomes`, `error-handling/user-facing-mapping` | build outcomes; end-user mapping. Neither says what an error must carry so the *agent* can recover without a human |
| grep of the whole corpus for `accessibility tree`, `headless browser`, `browser automation` | 12 files | every hit is a test harness, an a11y technique, or an application aside — none is about the agent-side control loop |

`browser-credential-boundary` (security) is what the slug map returns for "browser", and
it is about **a web application's shipped bundle holding credentials** — a different
force entirely. It must be cited as a boundary, never absorbed.

Three design decisions from one source tree, each reconstructed with its forces and
rejected alternatives, each `corpus: NONE`, one home. Under intake 2.0.0 that is a
subject by construction, and 2.1.0's routing count says it is a forge handoff.

## The subject, in one paragraph

**Agent browser control** is the discipline of giving a coding or QA agent a real browser
as a tool: a long-lived browser process the agent addresses through a thin local command
surface, page elements the agent names by **references derived from the accessibility
tree** rather than by selectors it writes, commands classed by their effect so the
runtime knows what is safe to retry, errors written so the agent's next command is in the
message, and — when the browser must be reachable by a remote agent — a security model
that comes from **which socket a path exists on**, not from headers a proxy can rewrite.
The subject owns the loop between agent and browser; it owns nothing about the pages, the
credentials a web application ships, or the protocol an agent uses to reach tools in
general.

## Boundaries it must NOT absorb

- **Tool protocol** — `mcp-tools`. The source deliberately rejects MCP for this surface
  (schema overhead per call, persistent connection, token weight) and uses plain HTTP with
  plain-text output. The drafter states the **discriminator** (when a browser surface
  should be an MCP server and when it should not), not a winner; a realization that goes
  the other way exists in this very harness (a browser reached as MCP tools, tab-based).
- **Generic child-process lifecycle** — `subprocess-lifecycle`. The daemon technique
  cites it for spawn/kill/orphan discipline and adds only what a *browser* daemon adds:
  session state worth keeping alive, busy-versus-dead, version-mismatch restart.
- **The application's side of addressability** — `agent-addressable-ui` stamps references
  into a UI the team builds. This subject reads references out of a page nobody on the
  team built. Say so in both notes.
- **Credentials in a web application's bundle** — `browser-credential-boundary`. Cookie
  import into the agent's browser is *this* subject's concern only at the boundary
  (read-only copy of the store, in-memory decryption, values never logged); the web
  app's own credential design stays there.
- **Prompt injection through page content** — `prompt-safety`. Cite it where page text
  reaches the agent; do not restate its ladder.
- **Agent session continuation** — `session-continuation`, `fleet-orchestration`.

## Proposed techniques (slugs are proposals; the drafter may override with an argument)

1. **`persistent-browser-daemon`** — one long-lived browser process per workspace behind
   a state file (pid, port, token, binary version; atomic write, owner-only mode); the
   first command starts it, every later command is a local HTTP call in the ~100-200 ms
   range instead of a 2-5 s cold start; cookies, tabs and storage survive across commands.
   Decision rules the technique must carry: **busy is not dead** (a live pid that does not
   answer the health probe is probed for a bounded window and reported busy with a
   non-zero exit; only an explicit force-restart kills a live daemon); **binary version
   mismatch restarts**, so a stale-binary bug class cannot exist; **crash means exit**, not
   self-heal — the next command restarts; ports drawn from a range that ends below the
   platform's ephemeral pool, with the collision retry counted. Rejected alternative: a
   browser per command (the source measured 40+ s of startup over a 20-command QA run and
   lost every login). Source anchors: `ARCHITECTURE.md:52-80, :354-356`;
   `browse/src/port-allocator.ts:29-31`; `browse/src/server.ts:1552-1595`
   (identity-based liveness, never a process-name kill).
2. **`references-over-selectors`** — the agent never writes a selector. A snapshot walks
   the accessibility tree, assigns sequential references, and stores a locator (role +
   name + index) per reference **outside the DOM**; the agent acts on `@e3`. Rejected
   alternative: injecting reference attributes into the page — breaks under content
   security policy, framework hydration, and shadow roots. Decision rules: references are
   **cleared on navigation** (stale references must fail loudly, never click the wrong
   element); a **presence check before every use** turns a 30 s action timeout into a
   ~5 ms failure whose message says what the element *was* and what to run next; a
   separate namespace for clickable-but-not-in-the-tree elements (cursor styling,
   click handlers, custom tab indices). Source anchors: `ARCHITECTURE.md:192-240`;
   `browse/src/snapshot.ts`; `browse/src/browser-manager.ts` (ref map, `resolveRef`).
3. **`physical-surface-separation`** — when the daemon must be reachable by a remote
   agent, bind a **second listener** and forward only that one. The tunnel listener serves
   a locked allowlist (pairing, scoped-token commands from a command allowlist); the root
   token is refused on it; health, token bootstrap, cookie surfaces and inspectors exist
   only on the local socket, so a tunnel caller cannot reach them because the path does
   not exist there. Rejected alternative: inferring "remote" from forwarded-for or origin
   headers — proxies rewrite them and local proxies add them. Must carry: the denial log
   (every tunnel rejection recorded with reason, rate-capped), the rule that a liveness
   endpoint **never carries a token**, and the bootstrap rule that the only endpoint
   handing out the root token pins the caller's identity. Source anchors:
   `ARCHITECTURE.md:88-124`; `browse/src/server.ts:292-343, :411-441, :1773`;
   `browse/src/tunnel-denial-log.ts`.
4. **`effect-classed-commands`** — the command registry declares every command as READ
   (no mutation, safe to retry), WRITE (mutates page state, not idempotent) or META
   (server-level), and the **server dispatches by class**, so the classification is
   executable rather than documentary; `help` returns the three sets so an agent can
   self-discover; and the skill prose that teaches the commands is **validated against
   the registry in the free test tier**, so a documented flag that does not exist cannot
   ship. Boundary: `mcp-tools/write-freshness-gate` owns the read-after-write freshness
   rule; this technique owns the classification's use in dispatch and in prose
   validation. Source anchors: `browse/src/commands.ts:13-51`; `ARCHITECTURE.md:326-342,
   :259-296`; `test/skill-validation.test.ts`.
5. **`agent-actionable-errors`** — every error that reaches the agent is rewritten to
   carry the next command: "run `snapshot -i` for fresh refs", "use `@refs` instead of a
   selector", a timeout that names which of navigation or interaction timed out. Driver
   stack traces are stripped. Decision rule: an error the agent cannot act on without a
   human is a defect in the tool, not in the agent. Boundary:
   `error-handling/user-facing-mapping` maps errors for *people*; the reader here has no
   judgment to fall back on and the message is the whole recovery. Source anchors:
   `ARCHITECTURE.md:344-353`; `browse/src/server.ts:944-962`.
6. **`bounded-event-buffers`** (optional; fold into 1 if thin) — console, network and
   dialog events in fixed-size ring buffers flushed asynchronously to append-only files;
   reads come from memory, disk is for post-mortem; request handling never blocks on I/O;
   bounded loss stated (one second). Source anchors: `ARCHITECTURE.md:242-257`.

Five techniques is the floor; six is fine. Do not mint a seventh to reach a number.

## Open questions the drafter decides rather than discovers

- **The name.** `agent-browser-control` was chosen over `headless-browser-tooling` (the
  browser need not be headless; the source runs a headed mode with a sidebar) and
  `browser-automation` (the QA-automation term, which names the *test* use and not the
  agent loop). Override with an argument.
- **Whether cookie import earns a technique** or a section inside the daemon technique.
  The source's rules (keychain consent, in-process decryption, read-only copy of the
  store, per-session key cache, values never in logs) are a first-party account of one
  platform. Recommended: a section, with the cross-platform limitation stated and the
  boundary to `browser-credential-boundary` drawn in one sentence.
- **Whether the MCP discriminator belongs in the golden path opening.** Recommended: yes.
  Two realizations exist — this harness reaches a browser as MCP tools; the source
  rejects MCP for the same job — and the subject is honest only if it says what decides.
- **Whether the sidebar, extension and prompt-injection stack are in scope.** Recommended:
  no. They are a product built *on* the daemon; cite `prompt-safety` and stop.

## Instances a reader can open

- The source tree, pinned at commit `0d1bd5616c0ef096bb7ccee336f63c60ee408618`, cloned
  at `C:/t/gstack` for this run (deleted at Phase 9 unless the task row keeps it).
- This harness's own browser tools (an MCP-reached, tab-addressed browser) as the
  counter-realization for the protocol discriminator — read from the tool descriptions
  available in the session, not from any product documentation.
- Fleet seam: **none.** No connected project runs a browser daemon or drives a browser
  from an agent. Per the standing focus, the apply step is a `task` row against the
  source tree itself.

## Web budget for the drafter

At most two fetches, spent on primaries only: the browser-driver's locator and
actionability documentation (the "locators are external to the DOM" claim needs its
primary), and the accessibility-tree specification the snapshot walks. The source's
README, its feature table and its throughput claims are not corroboration for anything
here and the drafter must not cite them.

## Why proposed rather than written by the intake run

Five mechanisms from one tree and one author, in a subject with no corpus measurement and
two live realizations that disagree on the protocol. A subject needs a golden path that
argues the forces from more than one source and a technique pair reconciled against a
neighbour's stated boundary. That is a forge worker's job with the neighbours open —
which is why it runs now, in this session, and not after the context that argued it is
gone.
