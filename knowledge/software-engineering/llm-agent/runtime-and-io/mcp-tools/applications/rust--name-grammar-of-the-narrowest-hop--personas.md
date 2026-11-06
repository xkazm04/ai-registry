---
layer: application
type: application
subject: mcp-tools
technique: name-grammar-of-the-narrowest-hop
stack: rust
status: forged
verified_on: 2026-11-06
verified_against: rust@1.80
applied: experiment
ab_verdict: not-better
---

# A browser bridge that relays page-declared tools without listing them

The personas desktop app drives web pages for its agents through a browser
bridge, and pages may declare tools of their own (natively, or through a
polyfill the bridge injects). That makes the bridge a **relay** in this
technique's sense: it carries tool names a third party authored, and the
third party followed a protocol whose grammar is wider than the hop to the
model. Read at commit `a0d21aceb180fecede03b653f6ca94deb55d5cea`; the toolchain
witness is the workspace's declared `rust-version = "1.80.0"`
(`src-tauri/Cargo.toml:222`).

## Page names are validated — against the wider grammar

The bridge does check page-declared names. Its polyfill registrar refuses a
name outside "The standard's tool-name alphabet and length bound"
(`src-tauri/src/browser_bridge/webview/inject.js:226-227`):
`const TOOL_NAME = /^[A-Za-z0-9_.-]{1,128}$/;`, enforced at `:282`. That is a
correct implementation of the page-side standard, added on 2026-10-31 when the
polyfill's registrar was brought up to it — and it is exactly the proxy this
technique warns about. It admits the dot and admits 65 to 128 characters,
both of which the narrowest function-calling grammar rejects. A page that
registers `admin.tools.list` passes the bridge's own validator by design.
Where the browser supplies a native registry the polyfill is not installed,
and the bridge sees whatever the native one accepted.

The injected script then describes each tool with its name untouched —
`name: tool.name` (`inject.js:206-208`). That would be the failure this
technique describes, except for where the name lands: the bridge's own
listing carries two fixed tools, `browser_page_tools` and
`browser_call_page_tool` (`src-tauri/src/browser_bridge/mcp.rs:284`, `:289`),
and the second takes the page's tool as an **argument** — `"name": {
"type": "string", "description": "Tool name exactly as browser_page_tools
reported it." }` (`mcp.rs:294`). A page that declares a dotted name, a
130-character name or a name with a space produces a string in a result and
a string in an argument. Neither has a grammar beyond the schema's, so no
page can take the bridge's listing down. This is the technique's
dispatch-by-argument shape, chosen for gating reasons (the class of a page
tool is derived per call from the page's manifest) and immune to the name
problem as a side effect.

## The declared next change is the hazardous one

`src-tauri/src/browser_bridge/webview/hands.rs:221-227` carries a function
with no caller yet and a comment naming its future consumer: "the consumer
is the MCP surface's `tools/list`, which appends these to whatever
`browser_page_tools` reported for the page". The bridge's own hands
(`page_scroll`, `page_click`, `page_fill`, `page_select`, `page_submit`) fit
the narrow grammar. The page's tools are whatever the page chose. A
`tools/list` built that way is the verbatim-relay shape — one spec-legal
dotted name declared by any page the agent visits would make a strict host
refuse the bridge's whole listing, including its own fixed tools.

## Proof

Experiment, product code untouched. **Target:** names in the bridge's listed
catalog that fail `^[A-Za-z0-9_-]{1,64}$`. **Floor:** the listing's content
and the gate's per-call classification, unchanged. A catalog extractor over
the tree, asserted first against a known positive (a tree at a commit whose
four dotted names it must flag, 4 of 4) and a known negative (the same tree a
release later, 0 of 4), found every statically registered name in this tree
inside the grammar — 39 of 39 across 21 registration files, the bridge's 16
fixed tools and 5 hands included — and
found the only dynamic name path to be the argument above. Arm A (the tree
as it is) lists **0** non-conforming names; arm B (adding a conforming-name
assertion over the listing) would list **0**. The target cannot move, so the
verdict is `not-better`: adopting the guard today changes nothing this tree
does. Status `structural-only`; the app crate's test binary does not start on
the machine that ran this, so no in-tree test arm was attempted.

The structural fact is the useful sentence. The tree is immune not because
it checks names — it does, against the grammar that admits the failing case —
but because it never lists a name it did not write, and
the one planned change that would list foreign names is already written down
beside the function it would call. The guard belongs in that change, at the
point where page tools join `tools/list`: alias them with a stable reverse
table, or keep them behind the dispatcher.
