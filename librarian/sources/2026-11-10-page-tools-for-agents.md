---
source: batch
kind: batch
url: "youtube:2HZOBs4sJlQ"
urls:
  - https://www.youtube.com/watch?v=2HZOBs4sJlQ
  - https://webmachinelearning.github.io/webmcp/
title: "Page tools for agents, /shift batch of 1 video"
author: "1 channel, first sighting (ByteGrad); no prior note or ledger row for it"
words: 4100
extracted: 9
accepted: 0
declined: 0
leads: 3
already_covered: 4
untriaged: 1
currency: 1
dispatched: 0
applied: 0
shipped: 0
run_id: shift-page-tools-for-agents
siblings: 2
fetches: 2
rescan_when: the WebMCP draft changes its session model (spec section 6.2) or leaves Community Group draft status, or a second independent voice says page tools must not carry writes; or 8 weeks elapse (2027-01-05)
---

# Page tools for agents, mined under /shift, 2026-11-10

Plan `plan-20261109-152922`, cluster `page-tools-for-agents`, board run
`shift-page-tools-for-agents`. The question: a web app can hand a browsing agent tools from the
page itself or through a server tool door. **Which door serves which work?** Phase 7.7:
gate=skipped. No GPU, no download, no render, nothing to remake.

- **Source** = `youtube:2HZOBs4sJlQ` (about 4,100 words, 2026-09-23). A second-hand, sponsored
  practitioner review of a browser proposal for page-registered agent tools, with a framework
  how-to and six toy demos, plus a half where the explainer's motivation is read on screen.
- **Primary** = the WebMCP Draft Community Group Report of 2026-11-10, fetched by the miner in
  two reads (the interface, then section 6, Security and Privacy). It is not a W3C Standard and
  not on the Standards Track.
- **Trees** (read only): gravitone at `407f0aec` (`app/(studio)/_shell/agentNav.ts`,
  `AgentNav.tsx`, `app/(studio)/layout.tsx`, `docs/mcp.md`). The lander re-opened
  `agentNav.ts:3-5` and `docs/mcp.md:6`, `:58-61` at that commit; both say what the miner quoted.
  personas `src-tauri/src/browser_bridge` was grepped by the miner for the annotation fields.

**Expected yield, stated first:** a second-hand review states no operating constraints, so
catches plus at most one boundary amendment written from the primary. That held: 0 accepted,
1 banked, 4 covered.

**Voices.** One channel, one voice. No within-batch convergence.

## What landed

This note and its ledger lines. No corpus file changed. The one upper-layer row (row 1) scores
2/0/2 against the +3 bar and is banked with its anchors below.

## The source's core claim, read backwards

The video's pitch (00:04:41-00:05:32, 00:11:05) is that page tools spare the site server-side
auth and state replication and reuse the interface's own logic, so they beat a server tool door
for in-app work. The primary places its headline hazard exactly there: section 6.2 says the
user's existing authentication cookies and session state are automatically available to the
page, so a page tool acts **as the user**. The agent has no principal of its own at that door,
and the product cannot attribute, scope, meter or refuse anything to it.

The corrected premise comes from the spec and from a tree, not from the video: **a page tool
gets only what lives in the view (navigation, view state, client-only changes the person
watches, reads of what is on screen); every write, every read beyond the screen and anything
that must be attributed to the agent goes through the authenticated door, where the agent
signs in with its own credential.** gravitone already holds that split. Its in-page tools move
the screen only ("no read the page does not already show, no write", `agentNav.ts:3-5`), and
its server door refuses a session cookie with `mcp-needs-token` (`docs/mcp.md:60`) and records
every write against the agent's token name (`docs/mcp.md:6`).

## Candidates

| # | Candidate | Anchor | Outcome | Prior art and reason |
| --- | --- | --- | --- | --- |
| 1 | A page tool runs in the user's session and has no principal: give it the view only, keep writes and attribution behind the token door | [00:04:41]-[00:05:32], [00:11:05]; spec §6.2, §6.3.2.1; gravitone `agentNav.ts:3-5`, `docs/mcp.md:6`, `:60` | Untriaged, 2/0/2 | Below. The source is contradicted; the row is its corrected premise |
| 2 | Page tools are far cheaper than screenshot-and-click browsing | [00:02:34]-[00:03:49] | Already covered | `agent-browser-control` (a reference tree over pixels); `agent-addressable-ui` names vision over a screenshot as the costly reconstruction. No number in the source |
| 3 | The tool's execute reuses the handler the click calls | [00:11:05]-[00:11:31] | Already covered | Law `one-validation-door`; the personas application in `standards-layered-runtime` tests it at the registrar. Reuse keeps one validation door; it does not make the caller a principal |
| 4 | Annotate tools read-only and untrusted-content | [00:11:31]-[00:12:21] | Already covered | The draft now has four annotation members and says agents should not rely on site-asserted annotations alone (§6.4.6). `agent-host-experience` already says a published hint is advice and the product enforces the confirmation; personas maps the consequential hint |
| 5 | Register in a client effect, abort on unmount | [00:09:49]-[00:12:21] | Already covered | The personas application in `standards-layered-runtime` (the `AbortSignal` option is the only unregister); gravitone `AgentNav.tsx` does it |
| 6 | Over-parameterization: a site can shape tool parameters to pull personal attributes out of the agent | spec §6.3.3 (not in the video) | Lead | Below |
| 7 | Support: one agent desktop app runs page tools, other browsers are testing | [00:21:46]-[00:22:11] | Currency (dated fact, no reset) | Below |
| 8 | Send `Permissions-Policy: tools=()` where page tools are not intended | spec §6.4.1 (not in the video) | Lead | Below |
| 9 | Sponsor segment: a hosted runtime brokers delegated third-party OAuth | [00:14:02]-[00:16:36] | Nothing | An advertisement; the surviving idea (per-user delegated credentials) is `mcp-tools` authentication and scoping |

Rule each row ran under: row 1 under the Phase 5 score; rows 6-8 under the corroboration table;
rows 2-5 and 9 are catches.

## Row 1: why it banks, and what clears it

Score: GAIN 1 (a boundary case of a mechanism the corpus owns) +1 convergence (the spec's §6.2
and gravitone's tree reached the boundary without this video; gravitone's stated reason is its
own bridge's gate and its token door) = 2. RISK 0 (spec and tree opened, the lander re-opened
the tree lines, the landing would append). COST 2. 2 - 0 = 2, below +3.

**The lander checked for a sentence it would invert, and found none.**

- `journey-shaped-tool-surface` § "One door, different grants" says outside agents, the product's
  own assistant and launched agents all reach the same operations through the same door, each
  with a catalog computed from its grant. That is an enumeration, and it does not contain the
  caller this row adds: an agent in the user's own tab, which cannot hold a grant. The paragraph
  stays true; the row is a boundary case, not an inversion.
- The `agent-host-experience` golden path's "Choosing the surface" table has no row for an agent
  already in the user's tab. Every row assumes a door the product authenticates. Again an
  absence, not a contrary sentence.
- `agent-addressable-ui` says nothing about sessions, auth or writes. It is a coding-agent subject
  and not this decision's home.
- `first-party-agent-is-a-principal` (mcp-tools) allows a second door authenticated by session
  for a server-side first-party agent, with admission shared. That is a server door with a
  principal, not a page door, so it neither contradicts nor covers the row.
- **The root is already owned in general form.** `delegated-authority` (security/authorization)
  names "impersonation" as a failure shape: an intermediary that carries the originator's own
  credential gets the scope right and destroys the account, because nothing downstream can
  separate what the person did from what the machinery did. A page tool is that shape by
  construction. So the gap is narrower than the miner drew it: the surface-choice consequence in
  `agent-host-experience`, routed to `delegated-authority`, not a new principle.

It clears on a second independent voice in a later run (convergence across runs), or on a corpus
sentence that says page tools may carry writes. **Home: `agent-host-experience`**
(`journey-shaped-tool-surface` § "One door, different grants", plus one row in the golden path's
"Choosing the surface" table), not `agent-addressable-ui`. Draft, stripped: a tool the product's
own page registers for an agent in the user's browser runs inside the user's session, so it acts
as the user and cannot be scoped, metered or refused by role; give that door only what the
person already sees and could already do, and keep every write, every read beyond the screen and
anything attributed to the agent behind the authenticated door, where the agent arrives with its
own credential and a session credential is refused.

Apply seam if it lands: gravitone already realizes it (page door view-only, 0 of 3 page tools
write or read beyond the screen; server door token-only, agent recorded). A structural A/B there
would read `not-better`, because the tree already holds the rule. No gravitone change is owed.

## Leads

- **Over-parameterization** (row 6, spec §6.3.3): ask an agent only for what the operation needs.
  Returns when a wired app registers a page tool whose input schema asks for personal attributes.
  Home then: `journey-shaped-tool-surface` input design.
- **`Permissions-Policy: tools=()` outside the studio** (row 8): gravitone sends no such header,
  but it registers page tools only in its studio layout and the default allowlist `'self'` already
  blocks cross-origin frames, so the header changes nothing today. Returns when gravitone serves
  third-party script or a same-origin page outside the studio that could register tools.
- **A dotted relayed tool name** (a sibling's tail): gravitone's layout says the bridge catalogs
  its page tools as `host.gravitone.<name>`, and `name-grammar-of-the-narrowest-hop` (mcp-tools)
  says the narrowest function-calling grammar refuses dots. The bridge was not read. Returns when
  a run next touches the page bridge or the personas `tools/list` merge.

## Currency

The page-tool draft moved between the 2026-10-27 draft the personas application tested against
and the 2026-11-10 draft read here: four annotation members (adding a consequential hint and a
debugging member) and an `exposedTo` option with a `tools` permission policy. No clock reset is
owed: the application's `verified_on` dates the personas tree, not the draft, and the tree was
not re-read. Browser support stays a dated fact with no number.

## Not extracted

- The six demos' particulars and their tool counts: happy-path toys with no measurement.
- The model and desktop app named in the demo: dated product facts, nothing survives the strip.
- The framework detail of registering inside an effect because the API is browser-only.
- The sponsor segment beyond row 9.
- Spec sections the miner did not reach in text (observation detail, open issues on size limits,
  injection datasets and cross-top-level execution). Nothing is claimed from them.

## Plan homes

The plan named `mcp-tools`, `agent-browser-control` and `agent-addressable-ui`. The decision's
real home is `agent-host-experience`; `mcp-tools` stays the neighbour for the wire and auth, and
`agent-addressable-ui` is struck.
