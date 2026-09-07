---
layer: technique
type: technique
subject: structured-output
technique: constraint-and-tool-channel-exclusion
status: forged
laws: [unknown-is-not-a-value, failure-not-empty-success]
shared_with: []
use_when: [a request carries both an output schema and tool definitions, a model stopped calling tools after strict output was switched on, deciding whether a constraint may be applied to a turn that may need to act, a provider returns a well-formed answer where a tool call was expected]
---

# The constraint and the tool channel contend for one emission surface

The golden path's rule for constrained decoding is *where the producer supports
it, use it*, qualified only by the reminder that syntax was never the contract.
[constrained-decoding-is-a-shared-budget](./constrained-decoding-is-a-shared-budget.md)
adds a second qualification for the case where several parties want the
constraint at once. Both qualifications are about **who gets the constraint**.
Neither can see the case where the constraint is granted, uncontested, to the
only claimant — and disables something else.

A tool call is not metadata travelling beside the response. On most providers it
is **emitted through the same channel as the content**, as a distinguished token
or tag the decoder produces inline. A grammar that constrains that channel to a
JSON schema makes the tool-call token unemittable, because the token is not in
the schema. The model cannot call the tool, so it does the only thing the
grammar leaves available: it fills the schema from nothing.

## The failure is a confident answer, not an error

The shape is the expensive one. The request is accepted; the transport returns
success; the response validates against the schema the caller asked for; and the
field the caller reads contains an invention.

A measured reproduction against a local inference server, same model, same
prompt, one variable:

```
WITH schema + tools      -> 200   tool_calls: null
                                  content:    {"answer": "...sunny, 15C."}
TOOLS ONLY               -> 200   tool_calls: [get_weather(city: "Paris")]
                                  content:    ""
```

The first response is not degraded output. It is
[unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value) executed
perfectly: the model had no way to find out, and the schema gave it a
well-typed slot that had to be filled with something. A caller reading that
field cannot tell it from an answer the tool produced, and neither can a
validator, because the object is correct.

## Why nobody catches it locally

Three properties compose, and each is individually defensible:

- **The two features are configured by different people.** Strict output is a
  serialization decision, usually made once, near the parsing code. Tools are a
  capability decision, made per agent. Neither author is looking at the other's
  file, and the request assembler joins them without knowing they interact.
- **Each feature works alone.** The schema path is tested with a turn that has
  no tools; the tool path is tested with a turn that has no schema. Both suites
  are green and neither exercises the combination.
- **The provider does not object.** An unsupported *key* usually earns a 400. An
  unsupported *combination* of supported keys usually earns a 200, because
  nothing in the request is individually invalid. The absence of an error is
  evidence about the validator's granularity, not about the request.

## The rule

**A turn that may need to act may not have its output channel constrained**, and
the combination is refused at assembly rather than repaired.

Refused, specifically — not silently resolved. The two plausible repairs are
both worse than an error:

- **Drop the constraint, keep the tools.** The caller now believes syntax is
  guaranteed while it is not, which is the silently-shed-constraint shape the
  shared-budget technique already names. If this is the chosen policy, the shed
  party is told, exactly as it is there.
- **Drop the tools, keep the constraint.** The agent loses a capability its
  author declared, and the loss is invisible: it looks like a model that chose
  not to call anything.

Where the turn genuinely needs both, they are **two turns**: one constrained
extraction over the result of one unconstrained acting turn. That is the only
arrangement in which both guarantees hold, and it is cheap to say so at the
point where the request is built.

## Detecting it in a system that already shipped

The combination is a static property of the assembled request, so the check is a
predicate rather than an evaluation: at the assembly boundary, assert that the
constraint field and the tool list are not both populated. A system that cannot
assert it at assembly can still find the population after the fact, because the
signature is distinctive — **responses that carry a validating object, an empty
tool-call list, and a turn whose agent declares tools.** That set is not
guaranteed to be all defects (a model may legitimately decline to call), but it
is small, enumerable, and the right place to start reading.

The negative control matters here more than usual, because the defect's whole
character is that everything looks fine: send the same prompt twice, once with
the constraint removed, and compare the tool-call list. A pair where the
unconstrained arm calls the tool and the constrained arm answers is the proof
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success) —
a suppressed tool call and a declined tool call are the same silence, and only
the paired run tells them apart).

## What this does not claim

It does not claim every provider composes the two features this way. Some
implement tool calls as a separate structured field the grammar never touches,
and there the combination is fine. It claims something narrower and more useful:
**which of the two a given provider does is not documented, is not derivable
from the fact that both keys are accepted, and changes between versions of the
same server.** So it is measured per provider, with the paired run above, and
the result is a dated fact about that provider rather than a property of the
technique.
