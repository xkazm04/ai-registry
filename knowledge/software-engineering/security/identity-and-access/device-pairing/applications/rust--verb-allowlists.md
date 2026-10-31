---
layer: application
type: application
subject: device-pairing
technique: verb-allowlists
stack: rust
verified_on: 2026-10-31
verified_against: rust@1.80.0
---

# The companion API's closed five-verb grammar

`src-tauri/src/commands/fleet/companion_api.rs` is the technique's
reference implementation: what a paired phone may do is a sum type, and
everything else fails to parse.

## The grammar

`CompanionAct` (`:431-451`) is a serde tag-dispatched enum with exactly
five variants — approve / reject / reply / wake / kill — and the module
docstring states the closure as the design: "`/api/act` accepts exactly
five verbs … Nothing else parses" (`:19-21`). The test drives both sides
of the closure (`act_grammar_is_closed`, `:655-678`): the five verbs
deserialize, and the plausible-forbidden sampler — `spawn` with a cwd,
`broadcast`, `write_raw` with an escape sequence — fails at the type
boundary. An unlisted verb is a 422 from the deserializer; no handler
exists to reach.

## Projection-only reads

`/api/state` returns `RemoteState` (`:294-302`), a purpose-built
projection: labels, coarse states, attention flags, and the remotely
answerable approvals. The hard rule is written where the shape is
defined: "It carries NO PTY bytes, no transcripts, no cwd paths, no
credentials" (`:24-27`). The label fallback chain is name-like only —
title → user name → project label, "Never a filesystem path"
(`:264-265`, implemented `:336-340`) — the exact fallback-audit the
technique calls for. The projection is versioned (`v: 1`, `:372`).

## Writes act only on what the projection showed

- A remote approve/reject must pass `require_remote_approval`
  (`:607-620`): the id must resolve to a **currently pending** approval
  whose action is in `REMOTE_APPROVAL_ACTIONS` (`:258`) — recomputed via
  the same `fleet_pending_approvals` filter that builds the projection
  (`:379-417`), so visibility and permission cannot drift. "The phone can
  never approve an arbitrary approval id it did not see in its own
  projection" (`:603-606`).
- A remote reply lands only on a session currently `AwaitingInput`
  (`:577-585`) — "typing into a working terminal from a phone is never
  right" — re-derived at execution time, not trusted from the client.
- Free text is hostile: `sanitize_reply` (`:475-484`) drops every control
  character except newline ("no ESC — a remote reply must never be able
  to smuggle terminal control sequences"), caps at 500 chars
  (`MAX_REPLY_CHARS`, `:61`), and the test pins the escape-stripping
  (`:645-653`).
- Every act, success or failure, writes a ledger row with the device id
  in the rationale (`audit`, `:486-515`; rule #4 of the module header).

## The borrowed control that rotted, one module over

The same repo carries the technique's cautionary tale on the P2P remote
path: `src-tauri/src/companion/remote_jobs.rs` justified running a full agent turn for
a paired device by listing the local constraints that "still constrain
her here, unchanged and unduplicated" — and one of the named constraints,
`AUTOAPPROVE_ALLOWLIST`, was deleted on 2026-08-10; the reference
survives only in comments (10 mentions, 6 files, 0 declarations —
measured in `docs/concepts/golden-paths/cross-device-pairing.md` §0.5).
A safety argument written as prose, with no import and no test, rotted
toward permissiveness within days of an unrelated refactor — while the
companion API's enumerated verbs, enforced in its own code, were
untouched by the same change. The two paths, side by side, are the whole
argument for structural allowlists.

Re-checked 2026-10-31 at personas@22260d77c9: the remote-jobs docstring still
names `AUTOAPPROVE_ALLOWLIST` among the constraints that "still constrain her
here" (`src-tauri/src/companion/remote_jobs.rs:35-37`), and the tree still holds
no declaration of it; the comment-only mentions have grown to 12 across 7 `.rs`
files. The finding stands.
