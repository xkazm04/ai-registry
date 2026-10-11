---
layer: technique
type: technique
subject: evidence-grounded-claims
technique: bracketed-placeholder-over-invention
status: forged
laws: [never-fabricate-a-figure]
shared_with: []
use_when: [writing drafting prompts for funding narratives, deciding what a generator should do when a figure is missing, gating a draft for submission readiness]
---

# Bracketed placeholder over invention

Every drafting prompt eventually forces the same fork: the narrative calls
for a specific figure — people served, a budget amount, an outcome rate —
and the grounding does not contain one. The generator will resolve that
fork one way or the other, so the technique is to resolve it *by design*:
**a visible bracketed placeholder for the writer to fill, never a made-up
number.** The clause lives verbatim in every narrative-drafting prompt
variant — "where a specific figure would strengthen the case but isn't
provided above, use a bracketed placeholder like [insert number served],
not a made-up number" — because the fork appears in every narrative, and
any variant missing the clause resolves it the fluent way.

## Why the ugly form is the right one

A placeholder is worse prose and better epistemics, on four grounds:

1. **Recoverability.** A blank the writer fills is a task; a wrong figure
   the applicant signs is *their* false statement, discoverable at review,
   audit, or renewal. The asymmetry is total — one costs minutes, the
   other costs credibility or worse.
2. **Visibility.** Brackets cannot be skimmed past. A fabricated "1,200
   families served" reads as finished and sails through review; `[insert
   families served]` stops every reader. The placeholder converts a
   silent error into a loud to-do.
3. **Machine legibility.** A simple bracket pattern makes placeholders
   greppable: a quality pass can list every unresolved fill-in, a
   submission gate can refuse a draft that still carries one, and the
   detection layer can *exclude* bracketed spans so the honest form is
   never flagged as a fabrication. None of that works for an invented
   number, which is indistinguishable from a real one by inspection.
4. **Typed resolvability.** A placeholder that names what it wants
   ("insert number served") is a lookup request the fact ledger can later
   answer with a sourced value. It is the entry point of the
   placeholder-to-fact loop, not a dead end.

## The discipline around the form

- **Placeholders are honest, not acceptable.** The draft that carries them
  is correctly unfinished. The submission gate blocks any draft with an
  unresolved placeholder, and quality review surfaces each one as a flag
  the writer must resolve — with a real value, a ledger fact, or a
  rewrite that no longer needs the figure. Honest and submittable are
  different states, and the pipeline must keep them different.
- **Name the want.** `[insert outcome rate from most recent evaluation]`
  resolves; `[TBD]` does not. Prompt examples should model descriptive
  placeholders, because the generator copies the shape it is shown.
- **Keep the form short and single-line.** A bounded bracket pattern is
  what keeps detection and exclusion cheap and unambiguous; a placeholder
  that sprawls across lines or nests brackets defeats both.
- **One grammar for every reader, sized to what the generator writes.**
  "Short" is a request to the generator, not a property of its output. A
  model told to name the want appends an example ("[insert specific
  barrier, such as transportation or scheduling conflicts]"), and in one
  measured run about one placeholder in ten outgrew a bound sized to the
  prompt's own short example. The list the writer resolves, the gate that
  refuses submission, the detection layer's exclusion, and any harvester
  that turns prose into reported figures must all read *one* definition,
  checked against recorded generator output, so that the set a check
  exempts is exactly the set the gate lists. When each reader carries its
  own bound, one span can be exempt from detection and invisible to the
  gate at the same time. No single reader's test can catch that, because
  each reader is correct by its own definition. A want-verb lead is the
  discriminator that lets a long placeholder count without every long
  bracketed aside counting too. And the example inside the brackets must
  never carry a figure, because to any reader the span outgrows, that
  figure reads as a claim.
- **Never suppress the form for polish.** The strongest anti-pattern is a
  post-processing step or prompt tweak that removes placeholders to make
  demos look finished. A generator forbidden the honest form does not
  stop needing the fork resolved — it resolves it the other way.

## Decision rules

- When the grounding contains the figure, use it exactly; a placeholder
  where a ledger fact exists is laziness, not honesty.
- When the figure is absent, emit the descriptive placeholder — even in
  an executive summary, even in a budget line, even where it reads badly.
- When a claim can be made strongly *without* the number ("we serve
  families across the county's three poorest districts"), prefer the
  number-free phrasing over a placeholder the org may never be able to
  fill — but never let this become a route to vague-everything prose;
  it applies where the specific figure is genuinely unavailable, not
  merely un-looked-up.
- When the same placeholder recurs across sections, keep the wording
  identical so resolution fills all of them consistently.
- When more than one component reads placeholders, they import one
  definition. Test it by walking the writer's path: fill every span the
  gate lists, re-run the gate, and require that no placeholder remains.

## When not to use

The technique governs *figures and verifiable specifics* — statistics,
amounts, dates, named partners. It is not a license to bracket judgment
calls ("[insert compelling opening]") — those are the writer's or the
generator's job, and bracketing them exports work without the
recoverability payoff. And in documents that are *internal* — a strategy
memo, a funder-research note — placeholders may persist indefinitely;
the submission gate that makes them temporary is a property of
outbound applications, not of all writing.
