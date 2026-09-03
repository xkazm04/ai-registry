---
layer: application
type: application
subject: extension-trust-boundary
technique: unenforced-collision-is-a-documented-capability
stack: python
status: forged
verified_on: 2026-09-03
verified_against: python@3.12
---

# Shadowing, disclosed; authentication coverage, enumerated

Read against `github:vllm-project/vllm` at commit
`facd9a74a1cd1b9fed324cdc2cceb8d54fdad3d0`. Two disclosures on the same
surface, one about a hazard with no check and one about a coverage boundary
people misread. Neither is a mitigation.

## The hazard, in three places, with no check anywhere

`docs/design/endpoint_plugins.md:129` states it plainly:

> There is currently no route conflict enforcement (tracked as a follow-up to
> RFC #46565). A plugin's `attach_router` can register a path that collides
> with a core route and routes attached later win.

The same fact appears in the protocol the author implements
(`vllm/plugins/endpoint_plugins/interface.py:63-69` — "Routes attached here can
shadow core routes with the same path. There is currently no conflict
enforcement") and in the security posture the operator reads
(`docs/usage/security.md:349`). Three audiences, three documents, one fact,
and the tracking pointer travels with it — so the gap reads as known rather
than as an oversight, and the eventual check will be a compatible change
rather than a surprise.

Against the technique's four required parts:

1. **Who holds it** — `docs/usage/security.md:340`: an endpoint plugin "must be
   treated as part of the server's trusted code base and not as sandboxed or
   reviewed input", and `:342` bounds it further: none load unless an operator
   names them. The capability belongs to an operator-enabled extension, which
   is why the disclosure is proportionate rather than a release blocker.
2. **The mechanism and its resolution rule** — last registration wins, and
   `interface.py:66` fixes the ordering that makes it reachable: plugin routers
   attach *after* all core routers.
3. **The observation** — `docs/usage/security.md:349`: "review `app.routes`
   after startup if you need certainty about what is actually being served."
   The live route table of the running server, not the configuration that was
   supposed to produce it.
4. **The convention, labelled as one** — `docs/design/endpoint_plugins.md:131`
   asks for a distinct prefix (`/plugins/<plugin-name>/...`); `:132` then
   permits the deliberate override and attaches the author's own disclosure
   obligation: register under a core prefix "only ... if you specifically
   intend to override or extend existing behavior **and document that clearly
   for operators allowlisting your plugin**".

The worked example in the same document deliberately publishes under a core
prefix (`/v1/admin/scheduler_config`, `:132` and the end-to-end test at
`tests/plugins_tests/test_endpoint_plugins.py:196-199`), which is the
convention being exercised rather than assumed.

## The coverage boundary, enumerated rather than summarized

`docs/usage/security.md:150` states the scope: `--api-key` authenticates "only
for OpenAI-compatible API endpoints under the `/v1` path prefix, and other
similar `/v2`, `/inference` path prefix". Protection is a property of the
address.

What makes the section a disclosure rather than a caveat is `:156-250`: both
sets are enumerated in full. Roughly thirty protected paths at `:156-181`, each
with its enabling flag where one exists; then the unprotected set at
`:183-250`, grouped by kind — inference, operational control, utility,
tokenizer info, development, profiler — with each entry's consequence attached
and the flag that makes it present. The aliases are called out by name:
`/invocations` "routes to the same inference functions as `/v1` endpoints"
(`:189`), repeated at `:246` as the note that it "is particularly concerning as
it provides unauthenticated access to the same inference capabilities as the
protected `/v1` endpoints"; `/score` and `/rerank` appear in both lists under
different prefixes; `/pause`, `/abort_requests` and `/scale_elastic_ep` are
listed with denial of service as their stated effect.

The extension-facing consequence is the third operator practice
(`docs/usage/security.md:350`): "A plugin route outside those prefixes is
unauthenticated unless the plugin implements its own authentication." Set that
beside the prefix convention at `docs/design/endpoint_plugins.md:131` and the
tension is explicit in the tree — the namespacing that avoids collision is the
same move that leaves the route outside authentication coverage. Both documents
resolve it the same way, by naming a third control: deploy behind a proxy that
allowlists exactly the routes intended to be reachable (`:350`, and the general
recommendation at `:272-278`).

## What is not claimed

`docs/usage/security.md:147-152` refuses the summary an operator would prefer:
"Do not rely exclusively on `--api-key` for securing access." The enumeration
is the reason that sentence is believable — a reader can count the paths the
flag does not cover, which is the difference between a warning and a
disclosure.
