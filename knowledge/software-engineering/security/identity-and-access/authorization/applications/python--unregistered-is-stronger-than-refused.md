---
layer: application
type: application
subject: authorization
technique: unregistered-is-stronger-than-refused
stack: python
status: forged
verified_on: 2026-09-06
verified_against: python@3.13
---

# A read-only mode built out of the route table (Python / FastAPI)

*Verified against `dullage/flatnotes` at `7f5b773c9cb37cc84978079ed4790e7de38d3970`
(2026-08-29), app version 5.5.5. Python is witnessed three times concordantly —
`.python-version` = `3.13`, `requires-python = ">=3.13,<3.14"`, Dockerfile
runtime stage `python:3.13-slim-trixie`. FastAPI is pinned exactly at 0.141.1.*

This tree is a small self-hosted note app, and it carries both of the technique's
constructions in **one 266-line file**, applied to two different dimensions,
with the discriminator falling exactly where the technique says it should. That
co-location is why it is worth an application document: the comparison is not
across two codebases with different authors and different eras, it is across
twenty lines.

## The process-constant dimension: the route is not built

`server/global_config.py:105-109` declares a closed four-member mode vocabulary
— `none`, `read_only`, `password`, `totp` — read once from the environment at
construction time. It cannot change while the process runs.

`server/main.py` enforces `read_only` by **not defining the routes**:

```python
if global_config.auth_type != AuthType.READ_ONLY:   # :87
    @router.post("/api/notes", ...)
    def post_note(note: NoteCreate): ...
    @router.patch("/api/notes/{title}", ...)
    ...
    @router.delete("/api/notes/{title}", ...)
```

and again at `:227` for attachment upload. The decorators are inside the
conditional, so in a read-only deployment the mutating operations are never
bound into the router. Every property the technique claims is observable here:

- **No handler exists to reach.** The refusal is FastAPI's own 404 from route
  resolution. No application code runs, nothing deserializes the body, nothing
  resolves the `{title}` path parameter — and `title` is the parameter that
  becomes a filesystem path downstream, so the preamble that never runs is the
  security-relevant one.
- **The derived artifacts are restricted for free.** `app = FastAPI(openapi_url=...)`
  (`:23-26`) generates the schema from the route table. A read-only instance's
  OpenAPI document simply does not list the mutating operations; nobody had to
  remember to filter them, and a generated client built against that instance
  cannot call them.
- **A new operation is visible rather than covered.** Adding a seventh endpoint
  means choosing an indentation level. That is a structural fact a reviewer sees
  without knowing the mode vocabulary exists — the property the technique argues
  is worth more than an annotation nobody forgets to write.

The read path is deliberately outside the block: `get_note` (`:70`), `search`
(`:152`) and `get_tags` (`:169`) are registered unconditionally, which is what
makes the mode read-*only* rather than off.

## The request-varying dimension, twenty lines above

Authentication is the other dimension, and it varies per request — a token is
present or it is not — so it cannot be resolved at import time. The tree uses the
other construction, correctly:

```python
auth_deps = [Depends(auth.authenticate)] if auth else []   # :21
```

attached to each route as `dependencies=auth_deps`. Two routes deliberately omit
it: `/api/config` (`:183`), which the UI must read before a login exists, and
`/health` (`:252`).

So the discriminator the technique proposes — *can the answer differ between two
requests to this process?* — is answered independently for two dimensions in one
file, and both answers produce the construction the technique prescribes. That
is the strongest evidence this application offers, and it was not designed as a
demonstration of anything.

## The structural fact: the two constructions fail in opposite directions

Line 21 is also the technique's counter-case, sitting in the same file as its
positive case, and neither was written to illustrate anything.

When `auth_type` is `none`, `global_config.load_auth()` returns `None`
(`:19-25` of `global_config.py`), so `auth_deps` evaluates to `[]`. An empty
dependency list is not an error. It attaches cleanly to all eleven routes. It
logs nothing. Every route stays fully addressable and is now fully open —
which is the *intended* behaviour for `none`, and that is precisely what makes
it the right counter-case: the mechanism's disabled state is indistinguishable,
from the route table's point of view, between "the operator chose open" and "the
guard failed to attach". The route-table construction has no such ambiguity,
because its enabled state removes something you can observe the absence of from
outside.

Both mechanisms are correct here. The asymmetry is in what a *mistake* would
look like: a bug that emptied `auth_deps` produces a silently public API that
returns 200; a bug that dropped the `if` at `:87` produces mutating endpoints
that appear in the OpenAPI document, which is visible without a request. This is
the pairing rule the technique states, and this tree is where it was read.

## What this realization cannot do

- **It cannot express a per-user permission**, and does not try — there is one
  user. A system with two users whose modes differ cannot use the route-table
  construction for that dimension at all, and nothing here tests that boundary.
- **It cannot report the mode as a refusal reason.** A client receiving 404 for
  `POST /api/notes` cannot distinguish "this instance is read-only" from "this
  endpoint does not exist in this version". The tree mitigates it out of band:
  `/api/config` (`:183`) publishes `auth_type` unconditionally, so the UI reads
  the mode and hides the controls rather than discovering the absence by calling.
  That is the technique's last decision rule satisfied by a separate endpoint
  rather than by the refusal itself, and it works only because the client is
  first-party.
- **There is no test suite** (0 test files in the repository), so every claim
  above is read from the source and from the route table's construction, not
  from an executed assertion.
