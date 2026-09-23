---
layer: application
type: application
subject: connector-catalog
technique: schema-driven-forms
stack: react
verified_on: 2026-09-23
verified_against: react@19
---

# Schema-driven credential forms in the vault catalog

*Citations re-resolved against the project tree at `f05c1759f` (react 19.2.6 from the lockfile).*

The repo runs the technique on two lanes with one field vocabulary. **Shipped
connectors** declare their credential shape in per-connector JSON
(`scripts/connectors/builtin/slack.json`: two `fields` entries with `key`,
`label`, `type: "password"`, `required`, `placeholder`, `helpText`, and
`sensitive: true` at `:19`/`:28`), rendered by `CredentialTemplateForm`.
**Operator-defined connectors** (MCP servers, custom APIs, databases) go
through `CredentialSchemaForm`
(`src/features/vault/sub_catalog/components/schemas/CredentialSchemaForm.tsx`),
driven by a `SchemaFormConfig` whose factories live in
`schemaConfigs.tsx` — `getMcpSchema` (`:13`), `getCustomSchema` (`:85`),
`getDatabaseSchema` (`:173`). Each config is sub-typed (`config.subTypes`,
selected at `CredentialSchemaForm.tsx:80`), and each sub-type carries its own
field list plus a `healthcheck(fieldValues)` recipe builder (`:96-105`) — the
declaration feeding both the form and the probe, exactly the alignment the
technique demands.

## Declaration → renderer specifics worth copying

- **Extra-field kinds are a closed widget vocabulary** (`textarea`,
  `checkbox`, `key-value-list`), initialized per kind (`:47-53`) and rendered
  by a single `ExtraFieldRenderer` — a new kind benefits every config.
- **Key-value rows get minted ids on entry** (`:55-67`): pairs arriving from
  edit flows may lack one, and the renderer keys rows by id because "index
  keys mis-attach row state after a delete" — identity-survives-reuse applied
  at the widget level, with the reason in the comment.
- **The save path serializes the declared shape, not the rendered one**
  (`:121-125`): the connector row's `fields` column is built from the
  sub-type's declaration, so storage and any later re-render read the same
  contract the form did.

## The paired mint and its reaper

For operator-defined connectors, save creates a catalog row *and* the first
credential as one act (`createConnectorDefinition` at `:135-146`, then
`createCredential` at `:153-158`). The failure seam is closed: if the
credential save throws after the row was minted, the catch deletes the
just-created connector (`:167-177`), and because the rollback is itself
fallible, its failure goes to a breadcrumb rather than vanishing — the
comment names the stake: "an orphaned connector after a save failure isn't
invisible."

## The gate, and the measured vacuous green

Save is hard-gated on probe success: `CredentialTemplateForm.tsx:187-193`
disables Save until `healthcheckResult?.success` (plus the OAuth-completion
arm for OAuth templates). That makes probe/declaration alignment
load-bearing — and the misalignment is measured, not hypothetical:
the consumer's deviation register §126 found that of 113 shipped
connectors carrying a `healthcheck_config`, three declare an `api_key` field
their probe never substitutes (no `{{field}}`, no auth header), so "Test
connection" returns green **for any typed value** — and the gate then admits
exactly those credentials. Re-counted at `f05c1759f`, the population is
unchanged: 113 rows carry a probe, and the same three (`kalshi`, `pubmed`,
`semantic_scholar`, each with one `api_key` field) contain no `{{…}}`
substitution anywhere in the probe. The healthy contrast is in the same
population: `slack.json:31-38` substitutes `{{bot_token}}` into an `auth.test`
call. Twenty rows declare zero fields. Most are OAuth-acquired (the
credential comes from the grant, not from typed fields) or local, and `arxiv`
is the one public-API row whose probe is *correctly* unauthenticated rather
than vacuously green. The durable fix the register
names — a seed-time cross-check of the (declared fields, probe template)
pair — is the technique's intra-row consistency rule verbatim.

## The no-probe rows, and a save gate that follows the recipe

Thirteen of the 115 shipped rows that declare fields carry no
`healthcheck_config`. They are four webhooks (`discord_webhook`,
`slack_webhook`, `teams_webhook`, `generic_webhook`), four databases
(`postgres`, `mongodb`, `redis`, `duckdb`), three desktop bridges,
`mcp_gateway` and `twin`. That is the population the technique's "third
outcome" is written for: in most of these rows a probe would be a side
effect, or the service is not reachable over HTTP.

The tree handles the absence in the shape the technique now describes, at
two layers:

- **The save gate follows the recipe.** `ConnectorCredentialModal.tsx:98`
  reads `connectorDefinition?.healthcheck_config != null`, and `:211-212`
  gates Save only when that is true. It used to default the gate *on* when no
  catalog row existed (commit `904c1692b`, 2026-09-17, whose message names the
  unsatisfiable gate: Save "stayed disabled behind a 'Test connection' the
  catalog never declared a way to run"). The modal's only production caller
  passes `connectorDefinition={undefined}` (`TemplateModals.tsx:119-129`), so
  the old default locked every suggested connector.
- **Absence is a typed state, not a green.** `engine/healthcheck.rs:20-43`
  splits the probe outcome into `Verified` / `Unverifiable` / `Failed` /
  `Unreachable`. The no-recipe path returns `Unverifiable` (`:476-484`,
  `:559-567`). The storage door does not trust the client's flag:
  `commands/credentials/crud.rs:76-88` treats `healthcheck_passed` as a
  *request* to run the probe server-side, and `:108-124` stamps whatever the
  real probe returns.

The seam that remains is a back-compat boolean. `HealthcheckResult::unverifiable`
sets `success: true` (`healthcheck.rs:103-109`; the doc at `:698-706` says so
and explains why counting on it folds "never probed" into "passed"). Any
consumer that reads `.success` rather than `state` sees the two as the same,
and the form's gate is one of them (`CredentialTemplateForm.tsx:187-193`). That
is acceptable for opening a gate, because the server re-stamps the real state
afterwards. It is not acceptable for a badge. Nothing in the catalog marks a
no-probe row as deliberately unprobed, so the 13 rows are indistinguishable
from a row whose author forgot the probe.

## Where the repo deviates from the standard

- The per-connector escape hatch is partially structural: sub-types,
  variants, and auth methods (`CredentialTemplateForm.tsx:106-161`) are
  declarative, but MCP/custom/database get whole distinct config factories
  rather than registered overrides on one registry — enumerable in practice
  (three factories), but growth would push toward the technique's registry
  shape.
- Validation lives at the form layer. The storage door
  (`create_credential`, `commands/credentials/crud.rs:37-140`) parses the
  field map and re-probes when asked, but it does not check the map against
  the row's declared required fields. Non-form writers (import, automation)
  therefore bypass the declared contract, which is the gap the technique's
  "three more readers" section names.
