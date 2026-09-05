---
layer: application
type: application
subject: mcp-tools
technique: catalog-projection-modes
stack: python
verified_on: 2026-09-04
verified_against: python@3.11.14
---

# The second rung, four times over, in a local media-generation server

A local video- and audio-generation runner at commit `cdab3128` publishes an MCP
server alongside its web UI, over an engine with a very large operation surface: a
gallery, a file plane, a media toolbox, a post-processing plane, an artifact
workspace, and generation itself. The stack version is witnessed by
`docs/INSTALLATION.md:23`, whose documented install command is
`conda create -n wan2gp python=3.11.14` against the configuration the same page
calls "well-tested and stable" — an environment pin the project maintains, not a
floor inferred from syntax. The protocol library is pinned separately at
`requirements.txt:84` (`mcp==1.10.1`). The server module is `shared/mcp_server.py`.

This tree is a good witness for the technique because it compressed for the
technique's own stated reason and then hit the problem the technique's
self-teaching section leaves open. Its surface is not published one tool per
operation; whole families are folded behind a single routing tool — `wangp_io`,
`wangp_toolbox`, `wangp_artifact`, `wangp_postprocess` — each of which dispatches
to a set of named actions.

## The ignorant call is answered twice, not once

The technique says a routing tool must stay self-teaching: a call that names no
operation returns the sub-catalog rather than an error. This server does that, and
then does the thing the technique does not describe — it answers a *second*
omission with the operation's argument schema:

```python
# shared/mcp_server.py:1364, the io plane
if not action_name:
    return {"status": "discovery", "actions": compact, "count": len(compact), ...,
            "next": "Call again with one action and omit arguments for its schema."}
...
if arguments is None:
    return {"status": "schema", "action": action_defs[0]}
```

Both rungs return a `status` naming which one answered, so the caller never has to
infer from shape whether it received a catalog, a schema, or a result.

The pattern is not one clever endpoint. It appears at **four independently written
tool families** in the same file, and the convergence is the strongest evidence here
that it is structural rather than incidental:

| Family | discovery rung | schema rung |
| --- | --- | --- |
| artifact workspace | `:1309` | `:1313` |
| file plane | `:1364` | `:1369` |
| toolbox | `:1490` | `:1497` |
| post-processing | `:1461` | — dispatches on a discovered process id |

## What the second rung is *for* here, stated by the code

The artifact plane's discovery response carries what a compressed catalog otherwise
cannot: the thresholds that decide whether the caller should be using this plane at
all.

```python
# :1309
{"status": "discovery", "actions": actions, "count": len(actions),
 "inline_threshold": {"items": ARTIFACT_INLINE_ITEM_THRESHOLD,
                      "tokens": ARTIFACT_INLINE_TOKEN_THRESHOLD},
 "limits": dict(ARTIFACT_LIMITS),
 "skills": ["wangp://skills/large-artifact-workflows", ...],
 "next": "Choose an action. Pass action alone for its schema, then repeat that
          top-level action with a top-level arguments object to execute it."}
```

Under one-tool-one-operation those numbers would have lived in each tool's schema
description. Compression removed that surface, and the discovery rung is where they
came back — which is the technique's "self-teaching" property extended from *what
exists* to *what it costs*.

## The failure the second rung is written against, named in the response

The schema rung's `next` string is unusually emphatic, and it is worth reading as a
bug report rather than as documentation:

> `"Repeat top-level action='<name>' and pass a separate top-level arguments object
> matching action.parameters. Payload size does not change this call shape."`

Two failures are being pre-empted, and both are specific to a model that has just
been handed a schema. The first is serialising the arguments object back as text —
the schema arrives as JSON, and the temptation is to return it in kind. The second
is the size heuristic: a caller that has just learned an operation takes a large
payload is tempted to invent a different call shape for it. The server states that
the shape is invariant. A publisher that has bothered to write both sentences into a
runtime string has watched both happen.

## The empty-object distinction is load-bearing and is honoured

The trigger for the schema rung is `arguments is None` (`:1369`), never a falsy
check. An operation whose arguments are all optional stays callable with an explicit
empty object, and the technique's own listing tool depends on it: the skill file
tells a caller to "omit `action` and pass an empty `arguments` object" to list
existing artifacts without another schema lookup. A server that had written
`if not arguments:` would have made its own zero-argument path unreachable, and the
failure would have looked like a tool that always returns a schema and never runs.

## What this tree does not demonstrate

The technique's projection *ladder* is not exercised here. This server ships one
shape, chosen by its author, with no operator flag selecting a resolution and no
per-family versus per-server alternative — so it is evidence about the
self-teaching rungs and about nothing else in the technique. It also does not
demonstrate the annotation-equality rule: the routing tools publish none of the
protocol's behaviour annotations, so the question of whether a merged tool can
publish one honest annotation set for a destructive and a read-only member is not
answered here in the form the technique describes — but the tree carries the *material* for
it and stops one step short, which is more instructive than an absence would have
been.

Every io action declares an access tier in its own definition
(`shared/deepy/filesystem.py:753+`): `"access": "write"` on `delete`
("permanently delete... recursive is required for a non-empty directory"), `zip`
and `unzip`; `"access": "always"` on `download`. The server uses those tiers
to decide which actions a caller may see at all. So the per-operation blast-radius
classification exists, is maintained, and is correct.

It simply never crosses the wire. The tiers gate the sub-catalog; they are not
published as the protocol's own behaviour annotations, and `wangp_io` — the one
tool definition the host actually sorts on — folds `delete` in beside `list` and
ranged reads with no annotation distinguishing them. A host asking "may this call
destroy something" gets one answer for the whole family. This is the technique's
blast-radius rule met internally and lost at the boundary, which is a sharper
version of the failure than a server that never classified anything: the honest
annotation set the rule asks for is already computable here, from data the file
already holds.
