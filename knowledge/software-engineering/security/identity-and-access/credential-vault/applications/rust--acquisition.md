---
layer: application
type: application
subject: credential-vault
technique: acquisition
stack: rust
status: forged
verified_on: 2026-08-29
verified_against: rust@1.96
---

# All four rungs of the ladder in one tree — and the two that skip the door

*Verified against the project tree at `c2a3c5fa1`.*

The technique's claim is that acquisition is a **ladder**: several modes,
ordered by decreasing automation, with one provider routed to the best mode it
supports. A ladder is only a ladder if the rungs coexist — one vault offering
grant flows *and* tool capture *and* foraging *and* guided manual entry, in the
same product, over the same store. This tree has all four, in four Rust modules
under one command directory, and that completeness is the reason to cite it.
It is also where the technique's harder claims — one validation door,
provenance as a required field — can be measured rather than asserted, and both
come up short in ways the technique predicts exactly.

## Rung 1 — delegated grant flow

`src-tauri/src/commands/credentials/oauth.rs` is the ceiling rung, and it
implements the technique's three craft points rather than only the happy path.

- **The callback listener is treated as a credential surface.** It binds the
  loopback with an ephemeral port (`:556` for the vendor-specific flow, `:1797`
  for the universal one, both `TcpListener::bind("127.0.0.1:0")`), and the
  redirect is *derived* from the bound port rather than configured
  (`run_oauth_callback_server`, `:184-187`). Its lifetime is bounded by an
  absolute deadline computed once (`:191`), so each accept is capped by the
  time still remaining and junk hits cannot extend the total wait.
- **The listener's own hardening is written down as a reasoned budget.** The
  doc at `:165-173` states the problem the naive shape has: "The loopback
  callback port is discoverable, so the server does NOT die on the first
  connection" — a port scanner or a stale tab must not consume the single
  accept and let the real consent time out. Invalid hits are answered, counted,
  and bounded by `MAX_OAUTH_CALLBACK_ATTEMPTS = 32` (`:53`, with eight lines of
  rationale at `:45-52`); a valid HMAC state wins immediately.
- **The narrow-exchange discipline.** PKCE is minted per flow
  (`generate_pkce_pair`, `:1138`; used at `:608`) with the split stated at
  `:605-607` — "The verifier stays server-side and is sent to the token
  endpoint on code exchange; only the challenge goes in the browser authorize
  URL" — and the authorize URL is assembled through typed query pairs
  (`:613-623`).

The credential never passes through the user's hands *or through the
renderer*: the frontend receives only a session reference, and
`redeem_oauth_session_into_fields` (`:1594`) resolves it backend-side at save
or preview time.

## Rung 2 — tool capture

`cli_capture.rs` harvests credentials the user's own tooling already holds, as
a **table of declared recipes** rather than per-tool code. Each entry is a
`CaptureSpec` naming the binary, an `auth_check` step, the field-minting step,
and a `verify_step`. The GitHub entry (`:148-175`) is the shape:
`gh auth status` as the auth check (`:151-154`), `gh auth token` as the mint
(`:158-163`), and `gh api user --jq .login` as the verification that resolves
the identity (`:170-173`). The same table covers cloud, container and hosting
CLIs, and a second capture kind reads a tool's credential *store* directly
where no subcommand exposes it — `FileCaptureField` (`:59-62`) says why:
"Some CLIs (wrangler, convex) store their auth tokens in local config files
that aren't exposed via any CLI subcommand".

Provenance is written here, and only here: `cli_capture_save` (`:1016`) builds
`metadata.source = "cli"` (`:1027`) plus a capture timestamp, with the reason
stated at `:1011-1013` — so "CLI-aware healthchecks and proactive refresh"
know this credential's grant is owned by the tool, not by the vault. That is
the technique's provenance-is-lifecycle-destiny rule, implemented for exactly
one mode.

## Rung 3 — foraging

`foraging.rs` is the rung most trees skip, and this one implements the
technique's four strict rules almost verbatim.

- **Consent precedes scanning.** `ForagingConsent.tsx:8-13` is a pre-scan
  screen whose doc states the contract: "it names every source class the scan
  reads BEFORE any secret is touched, so reading real credentials from disk is
  never a surprise. Only after the user clicks 'Start scan' does `onScan` run."
  The named source classes are a literal list (`:18-28`) matching the scanner's
  `ForageSource` enum (`foraging.rs:42-53`).
- **Candidates are presented by identity and location, never by value.**
  `mask_value` (`:168-177`) truncates on read, and the masking is placed at the
  read itself with the reason at `:179-183`: "Values are masked immediately on
  read — raw secrets are never accumulated in intermediate collections." Real
  values are re-read from the source only at import
  (`import_foraged_credential`, `:710-716`, `resolve_real_values` at `:725`).
- **"Found nothing" and "couldn't look" are different results.** This is the
  cleanest instance of the law in the tree, and it is implemented in the
  *type*, not in the renderer. `ForagingScanResult.read_errors` (`:72`) carries
  its own contract at `:68-71`: "whose backing file EXISTS but could not be
  read (permissions, I/O). Absent files are NOT reported — only real read
  failures, so the UI can say 'couldn't read X' instead of silently omitting a
  source the user expected to see." `read_if_present` (`:153-166`) is the
  three-way split that fills it — `NotFound` returns `None` silently (`:160`),
  any other error pushes the source token (`:161-164`). The consuming surface
  keeps the two apart as two separate regions: a read-failure block
  (`ForagingResults.tsx:98-120`, "surfaced, never swallowed") and, distinctly,
  the empty state (`:122-130`).
- **The audit record is shaped, not valued.** `:686-688` — "record THAT a
  filesystem scan ran and its shape (source count, finds, read-error count) —
  never any discovered value."

The half-acquired are reaped on this rung too: every scan clears the previous
candidate list, selection and import state before running
(`useCredentialForaging.ts:54-58`), nothing is pre-selected on purpose
(`:63-65`, "importing a credential is an explicit, informed choice"), and the
candidate list is component state that is never persisted.

## Rung 4 — guided manual entry

The floor rung carries the craft the technique asks for: a numbered
deep-link step into the provider console built from the catalog row's own
`setup_url` (`ConnectorCredentialModal.tsx:142-161`), versioned setup
instructions beside it (`:179-189`), a masked field with a reveal toggle gated
on the field's `sensitive` flag (`FieldCaptureHelpers.tsx:127-139`), and
validate-on-submit wired to the same probe machinery
(`ConnectorCredentialModal.tsx:197`). It also
adds one move the technique does not name: a clipboard TTL
(`FieldCaptureHelpers.tsx:96-117`) that reads the clipboard back after a delay
and clears it if it still holds the pasted secret — treating the clipboard as
the leak surface the technique says it is.

## Reaping, in one place, with its own vocabulary

The technique's closing demand — every in-flight acquisition names its cleanup
at start — is implemented as a session reaper with three separate bounds, each
with a stated reason:

- `OAUTH_SESSION_TTL_SECS = 10 * 60` (`oauth.rs:29`), a redeemed-session grace
  window of 120s (`:39`) whose doc (`:32-38`) explains the case it exists for
  (one consent legitimately redeemed several times when a workspace connect
  provisions one credential per selected service), and a hard cap of 50
  concurrent sessions (`:43`).
- `cleanup_oauth_sessions` (`:1389-1407`) retains only unexpired sessions
  (`:1402`) and then evicts oldest-first over the cap (`:1404`), throttled to
  once per 30s (`:30`), invoked at flow start rather than on a timer.
- State freshness is bounded *independently* of the HMAC
  (`OAUTH_STATE_MAX_AGE_SECS`, `:1221`, checked at `:1314`), so an authentic
  but stale state is a distinct outcome (`:1252`) rather than a forgery.

## The structural fact that makes this evidence

Two things, and the second is the sharper one.

First, the four modes are four sibling modules under one command directory
against one store — so the ladder is observable as a *set*, not inferred from
one mode plus a roadmap. The technique's ordering claim can be checked: the
grant flow never shows a value to the user, tool capture shows an identity,
foraging shows a masked candidate and a location, manual entry shows a masked
field. Automation decreases monotonically down the four.

Second, and this is why the tree is worth citing rather than admiring: **the
admission door is measurable here, and it does not hold.** The door itself is
real and well argued. `crud.rs:71-76` refuses to trust the client's claim, in
a comment that names the bug that taught it — "Stamping it verbatim let any
IPC caller fabricate a 'Connection verified' / healthy badge for empty or
invalid credentials" — and converts the flag into a *request* (`:77`), blanking
it on the way to storage (`:82`) and spawning a real server-side probe after
creation whose result is what stamps the ledger (`:96-121`, `persist_probe_state`
at `:110`). The pre-save preview probe resolves an unconsumed OAuth session so
"Test connection" runs against freshly-granted tokens (`:383`, rationale at
`:400-403`).

But the door is attached to *one command*, not to the shared write path — the
exact placement the technique warns produces per-flow coverage. Two of the four
rungs go around it:

- `import_foraged_credential` (`foraging.rs:716`) constructs its input with
  `healthcheck_passed: None` (`:742`) and writes through
  `insert_credential_and_fields_tx` directly (`:751`), never entering
  `create_credential`. No probe runs on a foraged credential.
- `cli_capture_save` (`:1016`) sets `healthcheck_passed: Some(true)` (`:1047`)
  and persists via the repository's `create_with_fields`
  (`credentials.rs:299-315`) — but `healthcheck_passed` is read in exactly one
  place in the whole Rust tree (`crud.rs:77`), so on this path the flag is
  inert. The rung's real validation is its own `auth_check` / `verify_step`
  pair inside the capture spec: a parallel door, with its own vocabulary and
  its own failure taxonomy.

The technique's honest audit is a count — "N admission routes, K of them
passing through the full door". Here N is four and K is two.

## What this realization cannot do or prove

- **The tree is not independent of the standard.** This repository carries its
  own copy of this technique's text at
  `docs/concepts/paths/credential-vault/techniques/acquisition.md`, committed
  2026-08-18. Convergence between the code and the rules above is therefore
  partly *authorship*, not corroboration. What survives that discount is the
  measurements — the door count, the provenance coverage, the inert flag —
  because those are places the code disagrees with the document it ships
  beside.
- **Provenance is a loose string, not a field of the admission contract.**
  There is no provenance column: the credential table
  (`src-tauri/db/src/migrations/schema.rs:166-176`) carries `metadata` as free
  JSON, and `metadata.source` is written by tool capture and
  by one design path and by nothing else. Grant-flow, foraged and manual
  credentials are stored with no origin at all (`foraging.rs:742`,
  `metadata: None`). This is precisely the end state the technique predicts for
  an optional metadata key — "the knowledge evaporates at the door, one mode at
  a time" — so the tree evidences the *failure* the rule describes rather than
  the rule's implementation.
- **The self-registered-client case is resolved and then discarded.** The
  backend distinguishes `"user_provided"` from `"app_managed"`
  (`oauth.rs:517-524`, doc at `:521-522`), but the frontend call sites persist
  `'app_managed'` unconditionally, so the verdict the Rust side computes is
  never stored. The technique's fifth provenance case exists in this tree as a
  computed value with no reader — which is indistinguishable, at rotation time,
  from not having it.
- **Nothing here proves the ladder's routing.** The technique asks that each
  provider be routed to the *best* mode it supports. What is observable is that
  four modes exist and that many providers appear in more than one table; no
  single authority declares, per provider, which rung is preferred, and no
  check would notice a provider offering a grant flow that is only reachable by
  manual paste.
- **Freshness of the capture recipes is unverified.** The CLI capture table
  encodes other tools' command-line surfaces as string literals. Nothing in
  this tree exercises them against installed CLIs, so a renamed subcommand
  fails at a user's machine, not in a build.
