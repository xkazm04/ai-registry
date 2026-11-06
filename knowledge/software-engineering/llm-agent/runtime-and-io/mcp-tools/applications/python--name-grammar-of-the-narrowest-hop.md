---
layer: application
type: application
subject: mcp-tools
technique: name-grammar-of-the-narrowest-hop
stack: python
status: forged
verified_on: 2026-11-06
verified_against: python@3.12
---

# A dotted tool namespace, rejected whole, renamed in one breaking release

Voicebox is a local-first voice studio whose Python backend mounts a tool
server at `/mcp` so agents on the same machine can make it speak and
transcribe. Citations resolve against commit
`8af7efe62fab8d33e2a5dfbedabaa45f68a5184f`, with the earlier state read at
`51f49dea198384b4eb6087b72c17057c6eb1c1cd`. The stack witness is the
`justfile`'s interpreter pin, `python_version := "3.12"` (`justfile:23`),
which the container build matches (`FROM python:3.12-slim`, `Dockerfile:35`).

## The protocol-conformant first spelling

At the earlier pin the four tools were registered as `voicebox.speak`,
`voicebox.transcribe`, `voicebox.list_captures` and `voicebox.list_profiles`,
and the module docstring gave the reason: "Tools are registered with dotted
names (``voicebox.speak`` etc.) so they look natural in agent logs". Every
one of those names satisfies the protocol's own rule, which lists the dot
among the allowed characters and uses a dotted name as its example. Nothing
in the tree checked them against anything narrower, and nothing needed to
until a host did.

## The rejection, and its radius

A widely used desktop host validates tool names against
`^[a-zA-Z0-9_-]{1,64}$` and, on one failure, refuses the **whole** listing.
The rewritten docstring now records exactly that
(`backend/mcp_server/tools.py:3-6`): "MCP clients such as Claude Desktop
validate tool names against ``^[a-zA-Z0-9_-]{1,64}$`` and reject the whole
tool list if any name contains a dot (#790)". The product's entire agent
surface was absent on that host while it worked on others — four tools, four
violations, one failure mode.

## The fix was a flag day

`tools.py:40`, `:117`, `:175` and `:203` now register `voicebox_speak`,
`voicebox_transcribe`, `voicebox_list_captures` and `voicebox_list_profiles`.
The 0.6.0 changelog marks it as the release's one breaking change and tells
users that "Agents and configs that call the dotted names must be updated"
(`CHANGELOG.md:92`). No alias for the old spelling was kept on the call path:
a search of the backend for the dotted names at the later pin finds nothing,
because even the comments that mentioned them were rewritten in the same
change (`backend/mcp_server/context.py:36`, `:64`, `:69`). So every caller addressing the server directly — the stdio
shim's users, scripts, other agents' saved configurations — broke at once,
which an accepted alias would have turned into a deprecation.

## What the tree still cannot do

There is no check. The narrow grammar now lives in a docstring, which a
fifth tool registered next quarter will not read; the one test that names a
tool (`backend/tests/test_speak_language.py:141`) calls it by its new
spelling and would catch a rename of *that* tool, not a dotted newcomer. A test that lists the
registered catalog and asserts every name against the pattern would have
caught the first dotted name on the day it was written, and it would catch
the next one. The tree also relays no foreign names — every listed tool is
authored here — so the relay half of the technique has no instance in it.
