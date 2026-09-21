---
layer: technique
type: technique
subject: grounded-marketing-generation
technique: structural-anti-fabrication-over-instruction
status: forged
laws: [never-invent-proof, provenance-is-binary-and-labelled]
shared_with: []
use_when: [reviewing whether a generator's anti-fabrication rule is only a sentence, designing the schema and validator for a new marketing tool, auditing a demo or fallback path for hardcoded claims]
---

# Structural anti-fabrication over instruction

An instruction in a system prompt - "use only the supplied data; invent nothing that
is not in the sources" - is necessary and is never sufficient. Models follow it most
of the time, cheap tiers follow it less, and "most of the time" in marketing output
means a fabricated price reaches a live ad every few hundred generations. The rule is
therefore built into the structure around the model: the schema, the validator, the
grounding boundary, the deterministic floor and the provenance flag. The instruction
stays, as one centralised fragment, because it raises the base rate; the structure is
what makes the base rate irrelevant.

## The test

Delete the anti-fabrication sentence from the prompt. For each protected item - a
number, a price, a contact, a proof - ask whether a value the model invents could still
reach the published surface. If yes, the protection for that item was instructed only,
and one of the five structures below is missing.

## The five structures

1. **A schema with nowhere to put it.** The output type carries only the fields the
   format needs, and the fields that could carry an invented specific are absent or
   typed as prose. An experiment arm is headline, intro, bullets and a button label;
   there is no statistics field. An ad set is headline, description, callout and
   keyword arrays plus a rationale. Extra fields the model adds are pruned to the
   declared schema before validation, so a helpful "price" property never survives.
2. **A validator that drops what was not requested.** Wherever the output is a
   selection or arrangement of inputs - clusters of the caller's keywords, arms with
   the caller's ids, a plan over the caller's channels - the normalizer discards any
   entity absent from the request and keeps the first answer per id. The model may
   add; the output cannot contain the addition.
3. **A deterministic floor that asserts only supplied values.** Every keyless or
   fallback path that writes copy without a model builds each claim line
   conditionally: a free-shipping headline exists only when the threshold was
   supplied, a rating headline only when a rating was, a dispatch clause only when an
   SLA was. An absent field omits the line rather than substituting a typical value.
   The demo variant of the tool obeys the same floor - a demo that hardcodes "free
   shipping over X" contradicts the system prompt above it, and is what a prospect
   reads first.
4. **Grounding filtered at the boundary.** A sample catalog grounds nothing;
   placeholder rows are stripped by the product's own marker vocabulary; unconfirmed
   scan competitors are excluded and replaced by an "unavailable" flag. The filter
   runs before the prompt is assembled, because the model reads grounding as fact.
5. **Provenance set by the caller.** The illustrative bit is decided where the dataset
   was loaded and rendered as an instruction to generalise; the model is never asked
   to infer from the numbers whether they are real.

## Keeping the instruction honest

The sentence itself is one exported fragment, parameterised by what the model must
stay within ("the supplied figures", "the supplied page text", "the supplied
keywords"), reused verbatim across every grounded tool, and hash-tracked by the
prompt gate so that editing it forces every tool it feeds to be re-proved against the
real model. Two hand-typed copies of the rule drift the day one tool's rules change.
Tool-specific prohibitions ("no discounts or numbers that were not supplied", "no
address, phone or e-mail - you do not have them") append after the shared sentence
rather than replacing it.

## Decision rules

- When a new grounded tool is added, write its schema before its prompt, and remove
  from the schema every field that could carry a protected item the tool does not
  need. A prose-only output is the strongest schema for a page whose numbers must
  come from measurement.
- When a tool's output references entities from its input, add the drop-unknown
  normalizer before the first real run, not after the first incident.
- When a fallback or demo path is written, route it through the same conditional
  floor as the production fallback, and grep the demo for currency amounts, "free",
  "guarantee" and digits before shipping it.
- When grounding comes from a store that can hold seed or placeholder rows, filter at
  the assembly point with the product's own marker vocabulary and a whole-string list
  for unmarked starter names; keep the matcher narrow so real rows never match.
- When an instruction is the only protection left for an item, say so in the tool's
  header as a known gap, so the next reader does not mistake it for structure.

## When not to use this

Do not remove fields a format genuinely needs in the name of structure: a price-list
generator must carry prices, and its protection is the grounding boundary and the
provenance bit, not a schema without a price. Do not add a drop-unknown validator to a
tool whose value is proposing *new* entities (an onboarding scan proposing keywords);
there the protection is that the proposals are labelled as suggestions awaiting the
owner's yes. Do not treat the centralised instruction fragment as optional because
the structures exist; the instruction is what keeps the model from wasting the one
re-prompt on a violation the validator would have caught anyway.
