---
layer: technique
type: technique
subject: agent-memory
technique: container-carries-decision-status
status: forged
laws: [unknown-is-not-a-value, silent-state-is-ungoverned]
shared_with: []
use_when: [a consolidation pass writes what the store will treat as current state, the evidence includes pasted notes or planning bullets or an agenda or a draft change, an ingest splits documents into chunks before extraction, a fact says something was decided and nobody can find where, deciding which upstream artifacts a nightly pass may read, adding a rule to an extraction prompt about ideas versus decisions]
---

# The container carries the decision status

A consolidation pass is asked to write what *is*: preferences, constraints,
decisions, project state ([consolidation](./consolidation.md)). Most of the
material it reads was never decided. Plans, brainstorm bullets, an agenda, a
draft change, an open ticket, the minutes of a meeting that ended without a
call. A store that records those as state stops being a source of truth. It
then fails silently, because a hardened plan reads exactly like a decision
to everyone who recalls it later.

The obvious defence is a rule about language: an idea, a suggestion or a
"maybe" is not a decision. It is the wrong defence, and the reason is where
the status lives.

## The sentence keeps its hedge; the list loses its container

A hedge written into a sentence survives extraction. "I'm thinking we should
rewrite the scheduler at some point, not sure" comes out as an idea with no
decision attached, because the hedge is part of the unit the extractor
reads. A bullet in planning notes carries no hedge at all. "Rename the app",
"Move hosting in November", "Drop the mobile client" are written in the
imperative, and the imperative is the grammatical mood of a plan *and* of a
decision. The only thing that tells them apart is the **container**. That
means the document's kind (a brainstorm, a decision log), a state field
(draft, merged), or the sentence that introduced the list. The extractor
reads the item, and the item has nothing to preserve.

This was measured on one companion's nightly compress prompt, as shipped,
with three conversation fixtures and three draws per arm on one model at
medium effort:

| fixture | prompt as shipped | + a sentence-level rule ("an idea is not a decision") | + a container rule |
| --- | --- | --- | --- |
| hedges inside the sentence (30 chances to harden) | **0** hardened | 0 | 0 (one draw) |
| four planning-session bullets, pasted | **12 of 12** hardened, confidence 0.85-0.9 | **12 of 12** | **0 of 12** |
| decided items kept (the floor) | 20/21 and 9/9 | 21/21 and 9/9 | 7/7 and 9/9 |

The as-shipped arm did more than keep the bullets. It **wrote the decision
in**: "as decided in Thursday's planning session" or "per the planning
session decisions", in eleven of twelve values, over evidence that never
used the word. A draft change and a merged change in the same fixture came
through correctly in every arm, because there the state was in the sentence
("is up as a draft"). The sentence-level rule changed nothing. It is aimed
at the case the extractor already handles, and it is blind to the one it
does not handle.

This is [compression-hardens-deferred-decisions](../../prompt-assembly/techniques/compression-hardens-deferred-decisions.md)
on the fact layer. That technique finds the same direction in instructions:
a deferral collapses toward the committed branch when the words that held it
open are dropped. It declares fact layers out of its scope. Here the
dropped words were never in the item to begin with.

## Decision rules

1. **Where the source has a lifecycle field, admit by the field, in code,
   before the extractor runs.** Merged, shipped, closed-as-done and accepted
   are admitted as state. Draft, open and proposed are admitted as open
   items or not at all. A first-party practitioner account of a nightly
   pass over a team's work records the same choice for the same reason. It
   reads only what was shipped, merged or decided that day, because
   observing meeting notes and brainstorming documents made the store
   misrepresent reality. A field is deterministic and costs nothing. A
   prompt asked to infer it from prose is neither.
2. **Where the container has no field, state the container rule in the
   extraction contract.** Pasted notes, a meeting summary and a transcript
   excerpt fall here. A decision needs evidence that *says* it was decided,
   done, merged, shipped or committed to. Items in notes, a planning
   session, a brainstorm, an agenda or a document carry that container's
   status. Without a stated decision the status is **not stated**. Write it
   that way with a confidence ceiling, or leave the item out
   ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).
   Measured above as the third column, and alone (without the sentence
   rule): 0 of 12 hardened, floor unchanged.
3. **Never let the extractor write a decision word the evidence lacks.** An
   invented "decided" is the cheapest symptom to check. A post-write check
   that flags a fact claiming a decision when no cited episode carries a
   decision word caught 23 of 24 hardenings in the recorded outputs. It
   missed the plain future tense: "Hosting will move in November, per
   Thursday's planning session." So the check backs up rule 2. It does not
   replace it.
4. **Carry the container through chunking.** An ingest that splits a
   document must stamp the document's kind and state onto every chunk. A
   chunk cut below its header has lost the only evidence of its status, and
   no rule at extraction can recover it.
5. **Give an open item an exit.** The container rule admits open items as
   facts that carry their status. On the conversational fixtures the fact
   count about doubled (3.8 to 7.5 per pass, one draw for the new arm). An
   open item nobody closes becomes stale state of a new kind. It needs a
   revisit date or a home that is not the belief store. That home is
   [working-memory](./working-memory.md) for a live session, or
   [pending-beliefs-live-apart](./pending-beliefs-live-apart.md) when a
   person will confirm it.

## Where this sits beside the other lanes

[memory-governance](./memory-governance.md) sorts writes by stakes and by
the **author** of the evidence. This rule is a different axis: the evidence's
**commitment state**. The operator's own brainstorm passes every author test
and is still not a decision. The two compose. A third-party document is an
observation about its source whatever its state. A first-party one is state
only when it says so.

## Failure modes

- **A keyword list instead of a state.** "Skip anything containing *maybe*"
  admits every unhedged bullet. Those bullets are the measured failure.
- **The rule in the prompt, the header stripped upstream.** The prompt is
  correct and the evidence it needs was removed at ingest.
- **Oblique references treated as confirmation.** A later "she's already
  making mockups for the rename" is activity around a proposal. It does not
  decide the proposal. The as-shipped arm wrote "the rename" as given.
- **Open items with no exit.** The store fills with "considering X" entries
  that outlive the consideration.

## When not to use it

- **The container is a decision record.** A decision log, merged history and
  a signed agreement are admitted as state by their kind.
- **A person stating their own settled choice.** "I signed the lease" or "I
  quit coffee" is a decision about themselves. The rule is about items whose
  status belongs to a container, not about doubting first-person statements.
- **A single-session scratchpad.** A plan under discussion is exactly what
  working memory should hold, until the session ends.
