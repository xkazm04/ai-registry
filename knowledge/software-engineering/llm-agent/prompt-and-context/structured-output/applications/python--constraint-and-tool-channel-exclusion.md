---
layer: application
type: application
subject: structured-output
technique: constraint-and-tool-channel-exclusion
stack: python
status: forged
verified_on: 2026-09-06
verified_against: python@3.10
applied: code
ab_verdict: better
proof: ab-paired
---

# A schema and a tool list in one request, and the model answers the weather from nothing

The version witness is the tree's own pin: `src/praisonai-agents/pyproject.toml:10`
declares `requires-python = ">=3.10"` (package `1.7.4`). Read at commit
`54244695b`. The reproduction below is the tree's own, recorded in
`src/praisonai-agents/docs/local-model-layer/00-ground-truth.md` §2, measured
2026-09-03 against a live local inference server (0.33.2) on `127.0.0.1:11434`
with a 0.6B-parameter model.

## The paired run

One prompt, one model, one variable — the request's schema field:

```
POST /api/chat   think=false
prompt: "What is the weather in Paris? Use the tool."
tools:  [get_weather(city: string)]

WITH schema + tools    -> 200   tool_calls: null
                                content:    {"answer": "The weather in Paris is
                                             sunny with a temperature of 15C."}

TOOLS ONLY             -> 200   tool_calls: [get_weather(city: "Paris")]
                                content:    ""
```

Both arms succeed at the transport. The constrained arm returns an object that
validates against the schema the caller asked for and contains an invention;
the unconstrained arm calls the tool correctly. The tree's own reading of the
mechanism: "The JSON grammar makes the tool-call tag unemittable, so the model
cannot call the tool and answers from nothing instead."

This is the technique's negative control, run by the source before we asked for
it, and it is the only observation that separates a suppressed tool call from a
declined one.

## The surrounding evidence that the request layer cannot see it

Two adjacent facts from the same measurement session explain why this class
reaches production rather than a 400:

- **Unknown request keys are silently dropped.** A bogus option key returns 200
  with a normal completion and no warning. The server's validator does not object
  to what it does not recognise, so the absence of an error carries no information
  about whether a field was honoured.
- **Tool-schema keywords are stripped.** `minLength`, `format`, `default` and
  `additionalProperties` are absent from the rendered prompt — so a caller's
  constraint on a *tool parameter* is also silently weaker than written.

Against that background, one combination that *does* produce a hard error is
instructive by contrast: a tool parameter typed as an array (`"type":
["object","null"]`) returns **HTTP 400** with a decoder message. The server
validates individual field *shapes* strictly and field *interactions* not at all
— which is the granularity claim the technique makes, confirmed here on both
sides.

## The design consequence the tree draws

The ledger's conclusion is stated as a design rule, not a bug report: this
combination "must **raise**, not be silently repaired. A fabricated answer that
looks correct is worse than an error." The tree reaches refusal-at-assembly
independently, and for the technique's reason.

The tree also states the scoping rule the technique's closing section argues for:
its whole local-model layer is specified as "a **resolver, not a transport** — it
returns data about what is running and what it will get wrong," with capability
answers obtained by asking the server (`/api/show`) rather than inferred from a
model name prefix. So the quirk is treated as a **dated, per-server fact to be
probed**, not as a property of the framework — which is exactly the boundary the
technique's "what this does not claim" section draws.

One correction the tree made to itself belongs here, because it is the same
discipline: an early draft attributed one model's capability list to another, and
the corrected note reads "**Capabilities are per-model, not per-server.** Always
name the model when quoting a capability set." A capability probe answered at the
wrong granularity is how a per-provider quirk becomes a per-request surprise.

## A second tree reached the same rule, and stopped one step short

A recruiting pipeline's document-analysis path routes every model call through
one seam. It had already arrived at mutual exclusion by construction — a grounding
tool and a response schema cannot both be attached:

```python
if use_grounding:
    config_kwargs["tools"] = [types.Tool(google_search=types.GoogleSearch())]
elif response_mime_type:
    config_kwargs["response_mime_type"] = response_mime_type
```

It had also drawn the technique's downstream consequence, in a docstring on its
JSON extractor: *"With grounding enabled there is no response_mime_type, so the
model returns JSON embedded in prose"* — and built a whole tolerant-parsing
ladder (scan every opener, score candidates against the caller's expected keys)
for exactly that case. Two independent trees, no contact, same rule.

What it had not done is the half the technique insists on: **the shed was
invisible to the shed party.** The flagship analysis path passes *both*
`response_mime_type="application/json"` and `use_grounding=use_grounding`, so
whenever grounding is on the constraint is dropped and the caller has no way to
observe it. The `elif` is the silent version of the "drop the constraint, keep
the tools" repair the technique names as insufficient.

**The change shipped**: the result object gained `schema_enforced`, set false
exactly when a supplied schema was displaced by the grounding tool, so the
parsing posture is readable rather than inferred from the request that produced
it.

## A/B and verdict

**A** — the corpus's unqualified golden-path rule, and the pipeline as it stood:
the combination resolved silently, no observable on the result.
**B** — the technique's rule: the combination is refused or the shed is reported.

Two measurements, one per tree.

**Paired run on the inference server** (the source's own, reproduced above): the
constrained arm returns a validating fabrication with `tool_calls: null`; the
unconstrained arm calls the tool. One variable, two arms, opposite outcomes.

**Paired run on the pipeline**, four cases through the request seam with the
network stubbed, measurable = *shed events a caller can detect*:

| Case | schema sent? | tool sent? | A: caller can tell | B: caller can tell |
| --- | --- | --- | --- | --- |
| schema only | yes | no | n/a (nothing shed) | enforced |
| neither | no | no | n/a | enforced |
| **schema + grounding** | **no — shed** | yes | **no** | **shed** |
| grounding only | no | yes | n/a | enforced |

Arm A: **0 of 1** shed events observable. Arm B: **1 of 1**, with the three
no-shed controls correctly reporting enforced. The arms were run against the same
four tests: A fails 4/4 (the observable does not exist — the mid-state confirms
zero occurrences of the field in the arm-A source), B passes 4/4, and the wider
related slice is 135 passed / 1 skipped with no regression.

Verdict **better**. The two ties in the table are load-bearing rather than
padding: they bound the cost of adopting B at zero for every turn where the
golden path was already right.

What would falsify it: a provider that emits tool calls through a structured
field the grammar never touches, where refusal-at-assembly would block a working
combination. The technique scopes to that — which is why the rule is "measure per
provider with the paired run," and the first measurement above is that, for one
of them.

## What this realization cannot do

It measures one server, one version, one model. The tree's own framing is that
this is a fact with a shelf life — the ground-truth document opens with "Numbers
drift" and gives the re-verification command for every row. So the transferable
half is the paired-run method and the assembly-time refusal; the specific server
behaviour is a dated observation that expires with its next release.
