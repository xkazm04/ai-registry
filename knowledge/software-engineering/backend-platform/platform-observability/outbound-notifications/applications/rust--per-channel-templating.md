---
layer: application
type: application
subject: outbound-notifications
technique: per-channel-templating
stack: rust
verified_on: 2026-10-31
verified_against: rust@1.80
---

# Per-channel templating — Mustache-style placeholders and provider bodies (Personas)

The technique's total-rendering grammar as implemented in
`src-tauri/src/engine/webhook_notifier.rs` (`templating` and `providers`
modules), and the authoring surface in
`src/features/settings/sub_notifications/components/WebhookSubscriptionsPanel.tsx`
(its draft form now extracted to `WebhookDraftForm.tsx` beside it).

## Where each mechanism lives

| Mechanism | Implementation |
|---|---|
| Rendering context as contract | `event_to_json` (`webhook_notifier.rs:384-400`): id, event_type, source coordinates, target persona, project, status, created_at, payload — payload parsed leniently, unparseable string becomes a string leaf |
| Placeholder grammar | `templating::render` (`:208-228`): `{{path.to.value}}` walking objects and array indices (`resolve_path`, `:241-264`); `{{event}}` returns the whole event |
| Missing path → empty | `resolve_path` returns `String::new()` on any miss (`:247`, `:252`, `:254`, `:256`); pinned by `templating_missing_path_is_empty` (`:836-841`) |
| Malformed delimiters → literal | placeholders whose content has a space, or that never close, pass through as typed (`:217`, `find_close` returning `None`) |
| Non-string leaves | one serialization via `to_string()`; `Null` renders empty (`:259-263`) |
| Per-class body shape | `providers::build_body` (`:279-298`); generic class ships `{ text, event }` so machine receivers get the structure |
| Default rendering | `providers::default_summary` (`:300-314`): `[Personas] <event_type> — <source>/<id>` — the sender-prefixed one-liner most subscriptions get |
| Totality on the send path | a template failure cannot veto delivery: `render` has no error return, and the `WebhookProcessor` falls back to `default_summary` only for an *empty* template (`:174-183`) |

## Judgment calls worth copying

- **The grammar has no logic.** No conditionals, no loops, no filters —
  paths only. The tests (`templating_walks_nested_paths`) are the whole
  spec, and the spec fits in a paragraph.
- **The literal-survival rule is written down.** "A literal `{{` / `}}`
  survives if the contents contain a space" (`:206-207`) — an odd corner,
  stated once where the parser lives.

## Gaps against the technique (reported, not fixed)

- **No per-target escaping.** `build_body` drops the rendered string
  straight into `text` / `content` for each chat class. Every one of
  those dialects has significant characters (angle-bracket link syntax,
  markdown-style emphasis, mention triggers); event payload text —
  user-generated content in many event types — is not escaped for any of
  them. The technique puts escaping in the adapter that owns the body
  shape; here nothing owns it.
- **No size-cap handling in the notifier stack.** The inbound poller
  truncates replies with headroom (`slack_poller.rs:1050-1057`,
  `SLACK_TEXT_LIMIT`); the outbound webhook path sends whatever the
  template produced. A long payload leaf in a template is a bounced
  delivery, not a truncated one.
- **The empty-vs-typo debt is not repaid at authoring time.** The panel's
  template field is a bare textarea with a placeholder string
  (`WebhookDraftForm.tsx:82-88`); there is no path validation
  against a sample context and no preview. `test_dispatch` renders the
  template against a *synthetic* event whose payload is `{ message }`
  (`webhook_notifier.rs:748-755`), so a template referencing
  `{{payload.persona_id}}` tests as an empty gap and ships as an empty
  gap — the test cannot tell the user their path is wrong.
- **The rendering-context contract is undocumented to users.** The
  context shape exists only in `event_to_json`; the panel does not list
  the available paths. Renaming a field there is a silent break of every
  user template.

  Re-checked 2026-10-31 at personas@22260d77c9: the form now carries a
  one-line hint under the textarea ("Mustache-style placeholders walk the
  event JSON", `WebhookDraftForm.tsx:89`); it names the grammar, not the
  paths, and adds no validation or preview, so both gaps above stand.
- **Digest rendering does not exist** — the fan-out loop has no
  coalescing, so there is nothing to render; noted for completeness
  (registered under the shared technique's owner).
