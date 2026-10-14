---
layer: application
type: application
subject: mcp-tools
technique: caller-differentiated-capability
stack: rust
status: forged
verified_on: 2026-10-14
verified_against: rust@1.85
---

# A speech tool whose agent door cannot write a file

The tree is the open-source speech tool vox, read at commit `96fe9dbc`; the witness for
the stack is `Cargo.toml:4 "edition"`, the 2024 revision, which needs 1.85 or later.
One engine has two doors: a command line for a person and a tool server that coding
agents call. This is the technique's case, with one subtraction.

## The subtraction

The command line can write the rendered audio to a path the person names. The tool
server never builds that option: the request it assembles sets the field to nothing,
`src/mcp.rs:549 "output: None,"`, under a two-line reason,
`src/mcp.rs:547 "Deliberately not exposed over MCP: an agent-supplied path would be"`
and `src/mcp.rs:548 "an arbitrary file write. Saving stays a local CLI concern."`
The tool's schema has no field for it at all, so there is nothing to validate and
nothing for a forgotten check to let through. The asymmetry is published on the human
side too: the user documentation says the flag is reserved to the command line because
`docs/FEATURES.md:66 "un chemin fourni par l'agent serait une ecriture de fichier arbitraire"`
(an agent-supplied path would be an arbitrary file write).

## One resolver behind both doors

Everything not subtracted is resolved by the same code on both doors. The backend that
speaks a request is chosen by one function,
`src/clone.rs:181 "The backend to speak with: the one rule the command line and the MCP"`,
called from the command line at `src/main.rs:323 "let effective_backend = clone::speak_backend("`
and from the tool server at `src/mcp.rs:515 "let backend = clone::speak_backend("`. The
tree records why: before that, a stored model preference reached only one door,
`src/mcp.rs:978 "it used to be dropped, so"` the command to set it only affected the
command line, and a test now pins the shared rule,
`src/mcp.rs:995 "fn speak_request_follows_the_shared_backend_rule()"`. The technique's
companion rule, that nothing downstream of the door should know which door is running,
is what that function enforces.

## What this realization cannot do

The schema keeps two parameters no backend reads, and says so in their descriptions,
`src/mcp.rs:226 "No effect yet: accepted, but no backend reads it"`. That is honest
documentation of a knob that does nothing, which [tool-schema-design](../techniques/tool-schema-design.md)
would rather see removed from the schema, because an agent that sets it learns nothing
from the call's success. The tree does not name the surface when it refuses something,
because it never refuses the subtracted option: there is no field to send. A refusal
that names the surface only becomes necessary when an agent can attempt the option.
