---
layer: application
type: application
subject: voice-io
technique: caller-scoped-voice-binding
stack: python
status: forged
verified_on: 2026-09-03
verified_against: python@3.12
---

# Per-client voice bindings in a local voice studio's Python backend

Voicebox is a local-first voice studio — a Tauri/Rust shell over a Python
FastAPI backend — that exposes its synthesis surface to agents on the same
machine through an MCP server mounted at `/mcp` and a `POST /speak` REST mirror
for callers that are not MCP-native. Citations resolve against commit
`51f49dea198384b4eb6087b72c17057c6eb1c1cd`; the stack witness is the
`justfile`'s interpreter probe, which prefers `python3.12` (`justfile:21`).

The technique is implemented here, in about sixty lines across three files,
and it is correct in design and collapsed at its exit: the four-step precedence
is written down three times, honoured arm by arm, and then flattened into a
single indistinguishable outcome on the way back to the caller. The chain's
central claim — *an explicit argument that does not match is an error, not a
fall-through* — is documented, implemented, and unreachable by the party it was
written for.

## The precedence chain is a module, and it is documented in its own docstring

`backend/mcp_server/resolve.py:1-8` opens with the chain as prose:

```
Precedence:
  1. Explicit tool arg (profile name or id)
  2. Per-client MCPClientBinding.profile_id
  3. CaptureSettings.default_playback_voice_id (global default)
  4. None — caller raises a helpful error
```

`resolve_profile(explicit, client_id, db)` is the single function every speech
entry point calls — the MCP tool at `tools.py:77` and the REST mirror through
the same `_speak` path — so there is exactly one reader of stored voice
configuration for unhosted callers. The design plan states the same chain twice
more, at `docs/plans/MCP_SERVER.md:92` and in the user-facing documentation at
`docs/content/docs/overview/mcp-server.mdx:164-182`, and the documentation is
explicit about the arm the technique cares about most: *"If the name/id doesn't
match, the call errors — the server doesn't silently fall back."*

The code honours it, and the mechanism is a two-line comment worth reading in
full (`resolve.py:23-28`):

```python
if explicit:
    profile = _lookup_profile(explicit, db)
    if profile is not None:
        return profile
    # Explicit but not found — return None so the caller can report it.
    return None
```

That early `return None` is the terminal arm. An explicit argument that misses
does not fall through to the binding or to the global default; the chain stops,
and `tools.py:78-83` turns `None` into a raised `ValueError` rather than into
audio. Arms 2 and 3 fall through legitimately — a binding whose `profile_id` no
longer resolves drops to the global default (`:40-43`) — which is the
asymmetry the technique asks for: the caller's statement is honoured or
refused, the product's stored guesses degrade.

## One row per caller, minted on first sighting

`backend/database/models.py:259-280`. `MCPClientBinding` has `client_id` as its
primary key — one row per caller, not a singleton — with `label`, `profile_id`,
`default_engine`, `default_personality` and `last_seen_at`. The design plan
states the reason at `docs/plans/MCP_SERVER.md:104-117`: *"one row per
client_id (not a singleton — scales to unknown clients, maps 1:1 to the
Settings UI list)"*.

The row is created by the middleware, not by a settings screen.
`backend/mcp_server/context.py:124-155`, `_stamp_last_seen`, queries for the
row and does `MCPClientBinding(client_id=client_id)` when it finds none, then
writes `last_seen_at`. So the settings list *is* the inventory of callers that
have actually reached the door, which is the property the technique names, and
`last_seen_at` answers "did my client id arrive" without a log dive.

Two details in that middleware are better than the technique's minimum and
worth transplanting:

- **The stamp is scoped to paths that actually consume the identifier**
  (`context.py:57-72`, `_STAMPED_PATH_PREFIXES = ("/mcp", "/speak")`), matched
  on a path boundary so a future `/speakers` route cannot inherit it. Unrelated
  traffic that happens to carry the header does not manufacture a row, so the
  inventory stays honest.
- **The write is fire-and-forget off the event loop** (`_enqueue_stamp`,
  `:98-116`), because the inline synchronous database write serialised every
  request behind it and starved the event stream the attribution pill depends
  on. An attribution ledger that degrades the channel it attributes will be
  removed; this is the fix that keeps it.

The global default is *not* copied into the row — it stays in
`capture_settings.default_playback_voice_id` and is read at resolution time
(`resolve.py:46-50`), so changing the product default changes it for every
unbound caller. That is the technique's two-copy rule, satisfied.

## The identifier authenticates nothing, and the tree says so

`context.py:28` reads `X-Voicebox-Client-Id` straight off the request into a
`ContextVar`. Any caller can send any value. The tree does not pretend
otherwise: `docs/plans/MCP_SERVER.md:330` records auth as deliberately deferred
— *"none for now (127.0.0.1 only). If we bind outside, bearer token via
`~/.voicebox/secret` + plumb through shim"* — and `tools.py:24` imports a
`request_is_loopback` helper used to gate the local-file argument of the
transcribe tool. The binding table is a disambiguator with a settings screen,
and the trust question is openly a separate, unshipped concern.

## The defect, precisely: one `None` for two different failures

`resolve_profile` returns a bare `Option`. It returns `None` when the caller's
explicit voice name did not match anything, and it returns `None` when nothing
was configured anywhere — binding absent, global default unset. Those are the
two outcomes the precedence chain exists to keep apart, and they arrive at the
call site as the same value.

`tools.py:78-83` then raises one message for both:

```python
if vp is None:
    raise ValueError(
        "No voice profile resolved. Pass `profile=` with a "
        "voice profile name or id, or set a default voice in "
        "Voicebox → Settings → MCP."
    )
```

So an automated caller that typo'd a voice name, or named a voice deleted since
its configuration was written, is told to pass a voice name — which it just
passed. It has no way to learn that its argument was the problem, and the
operator reading its logs has no way either. The failure is silent in the way
that matters for unattended callers specifically: there is nobody at the
machine to notice that the request which "needs a default voice" was in fact a
request that named a voice which no longer exists.

Three things in the tree make this a collapse rather than an oversight:

- The documentation states the distinction as a promise —
  *"If the name/id doesn't match, the call errors — the server doesn't silently
  fall back"* (`mcp-server.mdx:170-171`).
- The resolver's own comment states the intent — *"Explicit but not found —
  return `None` so the caller can report it"* (`resolve.py:27`). The caller
  cannot report it; the comment describes a signal the return type cannot
  carry.
- The design plan writes the chain twice with `error` as its named fourth arm
  (`MCP_SERVER.md:18`, `:92`), and `error` is doing the work of two arms.

The fix is one enum. A typed outcome — *resolved(profile)* /
*not-found(name-as-given)* / *unresolved* — restores the distinction at the
only boundary that loses it, changes no arm of the precedence, and turns the
message a caller receives into one it can act on. That the design survived
three separate written statements of the chain and still lost the distinction
at its return type is the reusable lesson: a precedence chain is only as honest
as the type it hands back.

## Where else it falls short

- **Nothing passes through a retired-voice normalization door.** A binding
  whose `profile_id` is dead simply falls through to the default with no note
  to the user, and `default_engine` is a free string column with no validation
  against the engine registry. The technique asks for stored per-caller
  configuration to be read through the same door as a user's stored
  preference; here the fall-through is silent and the engine field is
  unchecked.
- **Rate is unbounded.** The design plan lists per-source rate limits as a key
  design point (`docs/plans/VOICE_IO.md:422-423`), and no ceiling is enforced
  anywhere in the resolution or speak path. The row that would carry it exists.
- **`default_personality` is a preference in a row minted automatically**, and
  it is on the boundary the technique draws: it changes whether the caller's
  text is rewritten by a model before it is spoken. Defaulting to `False`
  (`models.py:277`) keeps it on the safe side of that line.
