---
layer: golden-path
type: golden-path
subject: ability-authoring-to-engine
status: forged
use_when: [generating a gameplay ability from a design sentence, constraining a generator against an existing vocabulary, auditing tag hygiene across a content set, wiring a generated spec into an engine]
techniques:
  - few-shot-reference-plus-tag-registry
  - strict-output-schema-with-derived-dependents
  - refinement-mode-minimal-diff
  - tag-dialect-normalization
  - declared-vs-referenced-tag-audit
  - server-derived-codegen-report
---

# Ability authoring to engine

A designer writes a sentence — *a leaping strike that closes distance and staggers on
impact* — and something on the other end must produce an artifact the engine will accept:
named, tagged, costed, cooled down, blocked by the right states, wired to real effects, and
consistent with the several hundred abilities that already exist. That whole span is this
subject. It is a pipeline with three consumers, and the naive reading recognises only the
first of them.

The naive reading is that this is a text-generation problem: describe the ability well and
a capable model will write a good one. It is not. Generating a gameplay artifact is a
problem of producing something that must **agree with an existing vocabulary, an existing
schema and an existing runtime** — three authorities that already exist, are already
inconsistent with each other in places, and none of which the generator can see. Prose
quality is nearly free. Agreement is the entire cost. Which is why almost all of the craft
lives in two places: what you **hand** the author, and what you **refuse to accept** back.

The shape transplants. Any strongly-typed artifact generated against a running system —
a workflow node, a policy rule, an infrastructure resource, a form schema — has the same
three consumers and the same two levers.

## The three agreements

**Agreement with the vocabulary.** Every system of this kind grows a namespace: state
tags, damage types, resource ids, animation slots, effect names. A generator that has not
been shown the namespace will invent members of it, and it will invent *plausible* ones —
which is worse than implausible ones, because plausible names survive review. This is the
signature failure of ungrounded generation, and it is not fixed by asking the model to be
careful. It is fixed by supplying the namespace as reference material, the same way you
would supply real asset identifiers rather than trusting a generator to guess file names.

**Agreement with the schema.** The artifact has a shape the engine will load. Freeform
output means a parsing layer, and a parsing layer means the failure modes move from
"invalid" to "silently misread". A strict schema is cheap. The subtle part is *which
fields the schema contains at all* — because a schema that asks for a value derivable from
its own other fields has invited a contradiction that nothing will catch.

**Agreement with the runtime.** The artifact names things the engine must resolve:
effects, cues, tag identifiers, magnitude sources. Naming them is not wiring them. An
ability that loads cleanly and is granted to nobody, or references an effect nobody
compiled, is a compile-clean nothing. The evidence that closes this gap comes from the
engine's own report of what it registered — never from the generator's summary of what it
believes it produced.

## What you hand the author

The prompt is a briefing, and a briefing has a standard budget: the existing vocabulary,
two or three real examples of accepted work, the schema, and the rules of the house.

The **vocabulary block** is the highest-value token spend in the whole pipeline. Handing a
generator the real tag registry converts an open-ended naming task into a
selection-from-a-set task, and selection is a task models do far better than invention.
Two or three complete, accepted prior artifacts do a second job the schema cannot: they
carry the house's taste — how terse the descriptions run, how the tags are habitually
combined, what magnitude ranges are normal — which is exactly the knowledge that is
tedious to state as rules and trivial to demonstrate.

The **rules of the house** are the ten or so statements that separate an artifact a lead
accepts from one they hand back. They are not design theory; they are authoring craft.
Rules that earn their place in a prompt share a property: each one exists because
something specific went wrong. *A cooldown is the ability's cooldown, not a per-tick
interval* is a rule that costs one line and prevents a class of bug where a single hit
silently becomes damage over time — a bug that behaves plausibly and reads correctly in
the artifact. That is the test for a doctrine note: does it name a mistake a competent
author would make anyway, and would the mistake be silent? A prompt full of rules that
merely restate the schema is a prompt whose rules will be skimmed.

There is a seam here worth naming precisely. Some of these rules are **authoring**
constraints — magnitudes are supplied by the caller rather than baked into a shared
effect, durations fall in stated bands, the incapacitated state tags always appear in the
activation-blocked set. Others are **design** constraints about what makes real-time
combat readable — telegraph windows, escapability, what a death state must interrupt.
Those belong to the design canon and the real-time combat semantics that the authoring
pipeline consumes; state them once there, and let the prompt cite them rather than fork
them. A rule that exists in two places will be corrected in one.

## What you refuse to accept back

Acceptance is where the standard is actually enforced, and it has three layers.

**Structural.** The output parses against the schema. This is necessary and, on its own,
worth very little — an ability can satisfy every type and still reference a tag nobody
declared.

**Referential.** Every name in the artifact resolves to something real: tags exist in the
registry, effects exist, magnitude sources exist. This is where the identifier-form problem
bites. Any identifier that lives in two syntaxes — one legal in the programming language,
one used in the data — will eventually be compared in the wrong one, and a
same-name-different-form comparison fails *quietly*, producing a clean report about the
wrong set. The fix is always the same shape: pick one form as canonical, normalise at
every boundary crossing, and compare only in canonical form. Never compare two identifiers
that arrived from different sides without passing both through the same normaliser. And
where the system itself *declares* the two spellings together, that declaration outranks
any convention you could infer — a convention has exceptions exactly where renames and
abbreviations live, which is exactly where the bug will be.

**Coherence.** The artifact agrees with itself and with the corpus. Derived values match
their inputs. Declared vocabulary and referenced vocabulary line up in both directions —
and the second direction is the one teams skip. A reference to an undeclared tag breaks
loudly and gets fixed. A declared tag nobody references breaks nothing, so it survives:
the vocabulary accumulates dead entries, the next author reads them as real, and the
registry stops being a description of the system. Treating those two defects as equally
serious is a deliberate stance and the right one — the first costs a bug, the second costs
the reliability of the reference material every future generation depends on.

Coherence checking has one structural requirement people discover late: the audit must
record *which authoring surface* each reference came from. Real systems have more than one
— hand-written content, generated-and-adopted content, data-driven content — and an audit
that quietly loses one of them does not report a gap, it reports a *better score*, because
the vanished references took their unresolved names with them. A metric that improves when
a data source disappears is worse than no metric. The defence is an attribution line whose
emptiness is legible.

## Revision is not regeneration

The second call is a different task from the first. Once an artifact exists and a human has
asked for one change — *make it cost less, keep everything else* — regenerating from the
brief plus the note is a category error. Generation is not stable: unconstrained, a model
will rewrite the description, re-pick the tags, and shift three numbers nobody mentioned.
The reviewer now has to diff the whole artifact to find the one change they asked for, and
in practice they will not; they will read the changed field and approve the rest.

So the second call is a distinct mode with a distinct instruction: you are given the
current artifact and a change request, you return the complete artifact, you re-derive
whatever the change genuinely implies, and every field outside that implicated closure is
byte-identical to what you were given. Returning the whole
artifact rather than a patch keeps the schema and the validators on the same path as
first-generation; the minimal-diff constraint lives in the instruction and, critically, is
*verified* after the fact by comparing fields rather than trusted. The value of this mode
is measured in review cost: a diff of two fields is read, a diff of thirty is skimmed.

## Provenance, and who gets to say it worked

Generated source that enters a build must carry the exact prompt that produced it. Not a
prompt name, not a version tag — the resolved text, stored alongside the output. Two
reasons, and the second one is the load-bearing one. First, without it a later reviewer
cannot distinguish a model failure from a briefing failure, and those have opposite fixes.
Second, prompts drift continuously while artifacts persist, so a version identifier
resolves to a document that no longer exists. Provenance that resolves to a mutable thing
is not provenance.

And the status of a generated artifact — compiled, registered, confirmed — is derived by
the observer, never reported by the producer. A generator asked whether its code compiled
will answer plausibly and cheaply. The authority is the thing that actually watched: the
build's own output, the engine's registration report, the count of symbols that exist
afterwards. Where a generator's claim is recorded at all, it is recorded and labelled as
self-reported, and it sits next to the verified number as a separate figure. The two
disagreeing is a finding in itself, and often the most useful one in the pipeline.

The report stores the rungs, not a summary of them: written, built, registered, present in
the destination the runtime actually reads. And a count that was never returned is not
zero — one is a missing measurement, the other a measured failure, they send an engineer to
different places, and a schema that defaults the first into the second has destroyed the
distinction before anyone can act on it.

The same instinct governs the seeding of a new artifact: a starter form is a *scaffold with
its unknowns marked as unknown*, not a plausible default set. A default that looks like an
authored value will be shipped as one.

## Failure modes of the naive reading

- **Plausible invention.** The generator names a state tag that does not exist. It reads
  correctly, passes review, and does nothing at runtime — the ability is simply never
  blocked by that state.
- **The silent internal contradiction.** A schema asks for a summary value alongside the
  values it summarises. They disagree by a little. Nothing checks, because nothing knows
  which one is the authority.
- **The clean report about the wrong set.** An audit compares identifiers across a
  boundary without normalising, matches nothing, and reports a large, confident, entirely
  fictional list of problems — or, worse, empty sets that score as perfect. Two empty sets
  are not a clean bill of health; they are a measurement that did not happen, and any
  scoring function must gate that case explicitly rather than let it render as full marks.
- **Regeneration drift.** Three rounds of "just tweak the cooldown" and the ability shares
  a name with the one that was approved and nothing else.
- **The self-certified build.** The generator reports success; nobody looked; the artifact
  is in the catalogue as complete and is not in the engine at all.

## Where this subject ends

The general assembly of a production prompt — its sections, its budget, how templates
resolve — is a separate concern; this pipeline is one producer built on that architecture.
The balance laws the numbers must obey, and what a readable real-time exchange requires,
belong to the genre's systems canon and to real-time combat semantics respectively; this
subject's job is to hand those rules to the author and to check that the returned artifact
did not violate them. Generating engine code from a visual graph rather than from a spec is
the close cousin — same three agreements, a different input form. And what counts as
wired rather than merely present is the wiring contract's subject; here it appears only as
the rule that the report comes from the observer.
