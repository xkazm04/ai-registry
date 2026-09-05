---
layer: application
type: application
subject: structured-output
technique: constrained-decoding-is-a-shared-budget
stack: rust
status: forged
verified_on: 2026-09-04
verified_against: rust@1.96.1
applied: code
ab_verdict: better
proof: ab-paired
---

# One schema, three dialects, and a degradation that rode on stderr

An LLM evaluation engine renders **one** caller-supplied JSON schema into three
provider dialects — a `--json-schema` flag for a CLI-shaped provider, a
`response_format: {type: "json_schema", strict: true}` body field for one HTTP
API, and `generationConfig.responseSchema` plus a JSON MIME type for another.
The stack is witnessed by a repo-root toolchain pin (`channel = "1.96.1"`),
which is also the ruler its two blocking gates are measured with.

This is the technique's **dialect half already built, and built correctly**:
one definition, one rendering per route, produced by the layer that assembles
the request rather than by the caller. The tree also has the force that makes
that necessary and not merely tidy — the API base URL for one provider is
read from an environment variable, so the same model is reachable through a
vendor host, a proxy, or a self-hosted server, and no caller can observe which.

## The budget half does not apply here, and that is a finding

The technique's contention argument — several independently authored
contributions consuming one provider-capped capacity until an innocent request
is rejected — has **no seam in this tree**, because there is exactly one
claimant. The engine itself supplies the schema; nothing else can. A search for
schema-carrying request construction found the constraint assembled in one
place per provider and nowhere else.

That is worth recording rather than skipping. The technique's precondition is
*more than one party may request a constraint on the same request*, and a
single-claimant system is where the rule is genuinely unnecessary. A tree that
adopted the priority-and-shedding machinery here would be carrying a mechanism
for a failure it cannot have.

## The structural fact: the tree solved this for the sibling guarantee

The engine's result type carries `determinism: Determinism`, a three-state
enum — every sampling control pinned, reproducibility-by-convention, or
deliberately sampled — read at 66 sites. Its documentation is explicit that a
run whose sampling knobs were *rejected and retried without them* reports the
weaker value, because "agreement on such a run partly measures sampling noise."

That is exactly this technique's shedding rule, discovered independently, for
reproducibility.

The same result type carried **no equivalent for schema enforcement**. A
provider that rejects the schema with a 4xx is retried once schema-less so a
strict-schema model never hard-fails a run — a good decision — and the
degradation was announced with an `eprintln` to stderr. The returned value was
byte-identical in shape to an enforced one. So a caller holding the result
could not distinguish *syntax guaranteed by the provider* from *prose that
happens to look structured*, and the second was parsed as though it were the
first. Nobody designed that asymmetry; one guarantee got a field and its
sibling got a log line.

## The change and its paired proof

**Measurable:** the number of call sites that can distinguish an enforced
schema from a shed one *from the value they hold*.

- **A (before):** 0. The only signal was a line on stderr, which is not a value
  a program can branch on.
- **B (after):** all of them. A `SchemaEnforcement` enum — `Enforced` / `Shed`
  / `NotRequested` — sits beside `Determinism` on the same result type, set
  from the request at each provider's construction site and overwritten to
  `Shed` by the one function that owns the reject-and-retry fallback and is
  therefore the only place that knows the retry happened.

The three states are kept distinct on purpose: `NotRequested` is not a
degradation and must not be confused with `Shed`, which is one — collapsing
them would reproduce the original defect in a new field.

The proof is a unit test asserting the derivation and the non-collapse of the
shed state. The repository's own blocking gates (`cargo fmt --check`,
`cargo clippy -D warnings`) pass, and 127 engine tests pass unchanged.

## What this realization cannot do

It reports the guarantee; it does not *recover* it. A shed schema still means
the output is unconstrained, and the caller must still run the validation door
— which is the golden path's standing point that constrained decoding
guarantees syntax and syntax was never the contract. The field makes the
weaker guarantee legible; it does not make the parse safe. Nothing here
observes whether a proxy silently accepted a schema and ignored it, which
would present as `Enforced` and behave as `Shed`; detecting that needs an
output-side check this tree does not have.
