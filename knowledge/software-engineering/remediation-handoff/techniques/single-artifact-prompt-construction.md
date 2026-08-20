---
layer: technique
type: technique
subject: remediation-handoff
technique: single-artifact-prompt-construction
status: forged
laws: [one-authority-per-vocabulary, count-carries-predicate]
shared_with: []
use_when:
  - writing the document an unattended coding agent will act on
  - the executing agent cannot reach your system for clarification
---

# Single-artifact prompt construction

The artifact is the entire interface to an executor you will never speak to.
Everything the agent will know about your findings is in it; everything it
cannot infer from it, it will invent. Construction is therefore not
formatting — it is contract writing, and the contract has exactly one
delivery.

## The shape

A working artifact has five parts in this order, and the order is load-bearing
because agents attend disproportionately to the opening and to the last
instruction block before the data.

1. **A header that scopes the work.** How many items, across how many
   codebases, from what kind of analysis, generated when. If a projected
   value rides along, it rides with its predicate
   ([count-carries-predicate](../../_laws.md#count-carries-predicate)).
2. **A framing paragraph.** What these items are, where they came from, and
   what "resolve" means here: small verifiable changes, skip what does not
   apply and say why. The framing must set expectations about the *source*
   of the items — that they are an assessor's reading of the codebase, not
   ground truth — because an agent told that a finding is fact will
   manufacture a fix for a gap that does not exist.
3. **A rules block.** The non-negotiables, stated as imperatives: work one
   codebase at a time, on a branch; read the codebase's own contribution
   guidance before changing anything; prefer the smallest change that really
   closes the gap; extend tests where the gap is about verification; do not
   edit files merely to satisfy a checker; end with a per-identifier summary
   of resolved, skipped, and needs-a-human.
4. **The return contract**, stated inside the rules block, not in a footnote:
   the exact marker line to add to every commit that resolves an item, with
   the exact key, and the note that several identifiers may share one line.
   This is the single instruction whose omission breaks the loop, so it is
   phrased as a rule rather than a suggestion.
5. **One section per codebase**, ordered by total projected value, each item
   under it stating title, identifier, category, impact and cost, why it
   matters, and the questions worth exploring before changing anything.

## Verbatim, not paraphrased

Two things must appear in the artifact exactly as the ledger holds them, and
the reason is the same in both cases: **there is one authority for each
vocabulary, and the artifact is a consumer, not a second author**
([one-authority-per-vocabulary](../../_laws.md#one-authority-per-vocabulary)).

- **The identifier.** It is the token that comes back in the commit history
  and is matched by exact string equality. Any prettification — truncation, a
  display prefix, case folding — breaks the return path in a way that looks
  like the agent simply did not comply.
- **The finding's title and rationale.** Rewriting them for the prompt
  produces a second wording of the same finding, and the inferential half of
  the closing rule compares the *next* assessment's wording against the
  ledger's. Restate the finding in the assessor's own words and add no new
  prose. This also keeps the artifact honest: it visibly carries an
  assessment's opinion, not a synthesized certainty.

The marker key itself is a vocabulary with one definition, shared by the
artifact builder and the history parser. Two hardcoded copies of that key are
a race with a delay fuse — they diverge the day someone renames it, and the
symptom is a loop that silently stops closing anything.

## Determinism

Same items in, same text out: no timestamps inside item bodies, no random
ordering, no model-generated prose in the construction path. Determinism buys
three things that matter more than they sound. The artifact can be diffed
between two generations, so a change in it is attributable. It can be unit
tested — ordering, the presence of every identifier, the rules block, the
marker line — which is the only test you will ever get of a system whose
consumer is outside your process. And a user who regenerates the artifact for
the same batch gets the same text, so re-handing-off is not a new instruction
set.

Build it as a pure function of the batch plus a small context record. Nothing
in the construction path should reach a network, a clock beyond a passed-in
generation stamp, or a model.

## Decision rules

- **When the batch spans codebases, emit one section per codebase**, ordered
  by summed projected value, and instruct the agent to work them one at a
  time — never interleave items from two working trees.
- **When an item has exploratory questions attached, include them** under an
  explicit "explore first" heading; they are the cheapest available
  substitute for the evidence the artifact does not carry.
- **When the assessed branch is the only authoritative one, say so in the
  artifact** — "resolved means merged and reassessed" — so a finished session
  that closes nothing yet is not read as a broken loop.
- **When a field is unknown, omit its line** rather than emitting an empty
  label; blank fields read as missing data the agent should go find.
- **When you are tempted to add a link back to your system, add the content
  instead.** The agent may have no network, no credentials, and no reason to
  believe the link resolves.

## When not to use this

- **When you can watch the agent run.** With a live session you can answer
  questions, inject context, and correct course; the one-shot artifact
  discipline costs you those affordances for nothing.
- **When the fix requires evidence you hold but cannot serialize** — large
  excerpts, generated diffs, binary artifacts. Either serialize it into the
  artifact or accept that the agent must rediscover it, and say which.
- **When the items are questions rather than findings.** An artifact that
  asks an unattended agent to decide policy will get a decision, confidently
  formatted, from something with no authority to make it.
