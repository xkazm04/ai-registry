---
layer: technique
type: technique
subject: prompt-assembly
technique: foreign-harness-history-folding
status: forged
laws: [unknown-is-not-a-value, failure-not-empty-success, identity-survives-reuse]
shared_with: []
use_when: [continuing a session that a different agent harness recorded, importing another tool's conversation history so a cheaper model can finish the task, a resumed agent calls tools that do not exist in its own roster, deciding whether a borrowed transcript is replayed as turns or rendered as context, a subscription quota ran out mid-task and the work must move to another agent]
---

# Foreign-harness history folding

A conversation recorded by one agent harness and continued by another looks
like the easiest kind of handoff there is. The record is complete, the
provider accepts the messages once the sealed parts are handled, and the
continuing model gets exactly what the first one saw. That last property is
the problem. A harness's history is not neutral prose about the work. It is
written in **that harness's tool vocabulary**: every call names a tool from
its roster and fills that tool's input schema, and every result is shaped by
that tool's output. Replayed into a harness with a different roster, those
turns stop being a record and start acting as a demonstration. A model
continues in the idiom its context shows it.

[endpoint-sealed-continuation-metadata](./endpoint-sealed-continuation-metadata.md)
covers the half of "where it happened" that the provider enforces: opaque
metadata sealed to the endpoint that minted it, rejected loudly when replayed
elsewhere. This technique covers the other half, which nothing enforces. A
foreign tool vocabulary is not rejected. The call is accepted, the model
answers, and its answer names a tool the harness cannot run. The failure
shows up as a failed turn, not as an error about the history, and nobody
looks at the history to explain it.

## The force is real, and it is a property of the model

Measured 2026-09-15 as a paired local experiment. One fixture: a
three-call repair session (read a file, run the tests, edit the file)
recorded under one harness's tool names and input schemas. Then a
continuation prompt ("keep going: re-run the test suite"), sent with a
native roster of three tools that do the same jobs under different names.
Ten seeds per arm, temperature 0.8, first response only:

| Arm | What the continuing model saw | 27B open-weight model | 12B open-weight model |
| --- | --- | --- | --- |
| A | the foreign turns replayed as native tool turns | **10/10** called a tool absent from its roster | 0/10 |
| C | the same turns, same structure, with roster names (control) | 0/10 | 0/10 |
| B | the foreign history folded into a prose summary | 0/10 | 0/10 |
| D | text blocks only, tool calls and results dropped, rendered as a context block | 0/10 | not run |

Arm C is what makes this a measurement of vocabulary and not of structure:
the same turns with names that match the roster produced no foreign call.
In arm A the larger model made no native call at all. It called
the foreign read, shell and edit tools, twice picking the foreign edit
tool again before re-running anything.

Read the right column before generalizing either way. The smaller model
ignored the foreign vocabulary completely. So a harness cannot learn "replay
is safe" from the model it tested with. The receiving harness also does not
know which model the operator will resume on, since choosing a different
model is often the reason for the handoff. Treat the risk as a property of
an unknown model, and
[unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value) puts
it on the fold side.

What the table does not show: only the first response was read, so whether
a model recovers after the harness reports "no such tool" is unmeasured. It
is one fixture and three tools. A roster whose names differ only in case,
or whose schemas share field names, may fall anywhere between arms A and C.

## Three ways to carry a foreign history, and which one continuation needs

- **Translate** each foreign call into the nearest native tool. This is the
  obvious fix, and one open-source implementation declines it in so many
  words. The mapping is pairwise across rosters, and tools with similar
  names seldom share semantics: an edit tool keyed on an exact old string
  and one keyed on a search block fail on different inputs. A translation
  that is wrong about one call leaves the model with a false record of what
  was done, which is worse than no record.
- **Project to text**: keep only the prose blocks, drop calls, results and
  reasoning, and render the turns as a labelled context block. It is cheap
  and safe (arm D), and it is **right for awareness**: a live session the
  receiver does not own, read for what the operator is working on. It is
  wrong for continuation, because the calls and results *are* the work. What
  was read, what failed and what was already edited survive only where some
  assistant sentence happened to restate them.
- **Fold**: store the foreign history verbatim, and on the first turn the
  receiving harness actually runs, summarize the whole foreign span into one
  context block before the model request. The summary carries what the
  calls did (files read, the failing test, the edit made, what has not been
  re-verified) in words, not in a roster. This is the shape continuation
  needs, and it is the one both independent realizations examined here
  arrive at for the case each one owns.

## Decision rules

- **Record the producing harness as provenance on the imported span**, next
  to the producing provider and model, and keep it on every fork of that
  session. A fork of an imported session is still foreign history. Treat a
  span with no recorded producer as foreign.
- **A span whose producer used a different tool roster never reaches the
  model as structured tool turns.** Fold it for continuation, or project it
  to text for awareness. Decide by whether the receiver will act on the
  work, not by how long the span is.
- **Fold at the first run, not at import.** Import should be cheap,
  idempotent and lossless: key it by the source tool plus the source
  session's own id, and write the "imported" marker last so a half-written
  import can never claim the source and block a retry
  ([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)).
  The summary depends on the model that will continue, and that is known
  only at resume. Persist the summary so it runs once per session, and
  stand down whenever the working context already opens with one.
- **The record keeps full fidelity; the fold is a view.** Store the foreign
  turns after the repairs the provider requires (sealed metadata handled per
  the endpoint technique, dangling calls answered per
  [history-compaction](./history-compaction.md)'s resume invariant) and
  apply the fold when composing, the same way a strip is applied. Folding
  never excuses skipping those repairs. A placeholder result for a call whose
  result the source never captured says exactly that, in its own words.
- **A failed fold is not a silent fallback to raw replay.** The shipped
  realization falls back to the raw transcript and writes a warning to a log.
  For a model like the 27B one above, that fallback brings back the
  failure the fold existed to prevent. Surface it to the operator as a
  degraded continuation
  ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)),
  or retry the fold on a different summarizer before replaying.
- **Tell the operator the continuation runs from a summary.** A session
  imported from another agent looks native in a history list, and it behaves
  differently. Label it at the head of the transcript.
- **Pin the text projection's skip with its reason.** A projection that drops
  tool blocks as "noisy" will eventually be improved by someone who wants
  richer context. The reason that survives review is the arm A row, not
  tidiness.

## When this does not apply

- **Same harness, different model.** The roster matches, so arm C governs.
  Only the endpoint seal and the cache arithmetic of switching apply.
- **A roster that is a strict superset with identical names and schemas**
  (a fork of the same harness, a compatibility layer that registers the
  foreign tools for real). Replay is then a continuation in the model's own
  idiom. Verify the schemas, not just the names.
- **The in-flight loop.** A unit of work in progress is never foreign to
  itself.
