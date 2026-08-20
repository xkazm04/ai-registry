---
layer: technique
type: technique
subject: pipeline-stage-modelling
technique: one-sentence-meaning-per-stage
status: forged
laws: [meaning-does-not-live-in-a-label, say-only-what-the-record-holds]
shared_with: []
use_when: [designing a default pipeline, adding a stage to a board, writing candidate-facing status copy, onboarding a team onto a shared board]
---

# One sentence of meaning per stage

Every stage carries an authored sentence saying what a candidate sitting in
it is waiting for. Not a description of the column — a statement of the
*state of the person*. The label is a handle; the sentence is the contract.

This is the human-facing half of the same law the role vocabulary serves. The
role keeps machines honest about what a stage means; the sentence keeps
people honest about it
([meaning does not live in a label](../../_laws.md#meaning-does-not-live-in-a-label)).
Both are needed, because a column named *Review* with no sentence will be
used for three different things by three recruiters within a month, and every
metric computed over it will average three populations.

## What a good sentence looks like

The test: it names **who is acting** and **what they are waiting on**, from
the candidate's side, in one line short enough to sit under a column header.

- *Applied and not yet reviewed.*
- *Their evidence is being read against the role's requirements.*
- *An assessment has been produced and is waiting for someone to sign it off.*
- *Scheduled or in conversation with the hiring team.*
- *Terms are being decided; nothing has been sent yet.*
- *Their process here has ended — hired, passed on, or withdrawn.*

What fails the test:

- **Restating the label.** "Screening: the screening stage." Zero
  information, and it is what gets written when the sentence is required but
  not valued.
- **Describing the interface.** "Drag cards here after the phone call."
  Useful once, useless to a candidate, and wrong after the next process
  change.
- **Naming another stage.** "After screening, before offer." Positional
  descriptions break under exactly the edits this whole subject exists to
  survive.
- **Making a promise.** "You will hear back within three days." Timing is the
  aging discipline's, it is a commitment the team may not keep, and it turns
  a definition into a claim about the future.

## Where the sentence is consumed

- **The board.** Under the column header or on hover, so a recruiter
  inheriting a board learns the process from the board rather than from a
  colleague.
- **The stage editor.** Required at creation, alongside the role. Asking for
  the sentence at the moment someone invents a column is the cheapest time to
  make them decide what it is for — and a person who cannot write it has
  discovered they do not need the stage.
- **Candidate-facing status**, where a team publishes one. Here the sentence
  is *adapted*, not copied: the internal line and the line a candidate reads
  serve different audiences and one may reveal things the other must not. But
  they are derived from the same authored meaning, which is what stops the
  two drifting into contradicting each other.
- **Reports.** A stage-level figure carries its stage's sentence, so a reader
  knows what population the number is over.

## Authoring and ownership

Ship a default sentence for every stage of the default board, and for every
role, so no team starts from a blank field. Let teams override — their
process is theirs, and an unedited default that no longer matches is worse
than no sentence, because it is confidently wrong.

Two ownership rules:

- **The sentence is versioned with the axis, not with the display.** A team
  that changes what a stage *means* has made a process change, and the
  sentence is the record of it. Editing a label is cosmetic; editing a
  sentence should feel consequential, because it is.
- **The sentence never states more than the process actually does.** If
  nobody in fact reviews evidence at the screening stage — it is a holding
  pen — the sentence must say so. A sentence describing an aspirational
  process is a claim about how a candidate was treated that the record will
  not support
  ([say only what the record holds](../../_laws.md#say-only-what-the-record-holds)).

## Decision rules

- When a stage is created, require the sentence. Not optional, not
  auto-generated from the label.
- When a role's default sentence is accepted unchanged for a custom stage,
  prompt: custom exists because the vocabulary did not fit, so a generic
  sentence is a contradiction.
- When two stages' sentences are the same, they are one stage or one of them
  is unwritten. Merge or rewrite.
- When a candidate-facing status is derived, derive it from the sentence and
  the role — never from the label, which may be internal shorthand a
  candidate should never see.
- When a team cannot articulate the sentence for a stage they insist on, the
  stage is a bucket rather than a step. It may still be legitimate; give it
  the custom role so nothing computes over it.
- When a sentence and the role disagree — a sentence describing a
  conversation on a screening-role stage — fix the role. The sentence is the
  better evidence of intent, because a human wrote it deliberately.

## When not to use this

Do not require sentences on a scratch board or a personal lane nobody else
reads. The sentence earns its cost where a second person, a metric or a
candidate depends on the stage's meaning; where the audience is one person
for one week, it is friction.

Do not let the sentence become the documentation of the whole process. It is
one line about one state. Handoff rules, who is responsible, what evidence is
collected and what the bar is belong to the role brief and the scorecard
disciplines; a sentence that grows into a paragraph stops being read, and an
unread definition is the same as an absent one.
