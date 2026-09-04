---
layer: application
type: application
subject: mcp-tools
technique: fluent-syntax-bounded-grammar
stack: node
verified_on: 2026-09-04
verified_against: node@22
applied: simulation
ab_verdict: unmeasurable
proof: structural-only
---

# A search tool that takes a command line and never runs one

## The seam

A local-first search tool exposes a file-search binary to agents over MCP. Its
tool takes a single `command` field holding what the caller would have typed:

```json
{ "root": "/absolute/path", "command": "rg -n -F 'loadTheme' -g '*.ts' src" }
```

The documentation states the property the whole design rests on in one
clause — the command *"is parsed into arguments and is never executed by a
shell."* Verified in `src/cli/managed-rg.ts` at commit `7d73ca1`
(`package.json` pins `node >= 22`): the parser rejects shell operators by
name, rejects `$(` and `${` as expansion, and treats backslashes as path
separators rather than as escapes, with the reason in a comment — the paths
come from Windows shells, so the platform wins over the notation's origin.

## The whitelist, and the reason for its single entry

The parser admits exactly one construct that looks like a pipeline: a
trailing `| head`, `| head -N`, or `| head -n N`, applied by the tool as an
output bound. Everything else — every other operator, every other pipeline
position — raises an error naming the operator that was refused.

The operational justification is legible in the tool's own contract: managed
search is *"exhaustive by default"*, so without a bounding idiom the model's
only way to limit output is to not ask the question. The admitted operator is
the one the operation requires, and it is spelled the way the model already
writes it. That is the discipline the technique asks for, and this tree is
where the technique was read out of.

The tool's error text for a refused option also names the surface rather than
the binary — *"is not supported by the MCP tool"* — which is
[caller-differentiated-capability](../techniques/caller-differentiated-capability.md)'s
rule appearing on the same input path, and the two techniques compose here on
one parse.

## No arm B in this fleet

No managed project accepts a command string from a model. A search across
every checked-out tree for a shell invocation reachable from an agent-supplied
argument returned nothing, so there is no seam at which to run a comparison,
and this document records the source's own realization rather than an
adoption of it. The technique is not unapplied because it failed a test; it is
unapplied because its precondition — a tool whose input is a notation rather
than a schema — does not currently exist in the fleet.

## What this realization cannot do

The parser bounds syntax, and the tree is explicit that the semantic checks
run separately on the parsed form: path arguments are resolved through their
existing ancestors and asserted inside the root afterwards. A reader copying
only the parser would inherit the containment gap, and the tool's own layering
is the evidence that the parse is a prerequisite for those checks rather than
a substitute — the parse produces the argument vector the path assertions then
read.

Return condition: when a managed project exposes a query language, glob
syntax, or command line as a model-supplied argument, apply this at that seam
and measure malformed-call rate against a structured-schema alternative.
