---
layer: technique
type: technique
subject: test-input-generation
technique: field-captured-operation-traces
status: forged
laws: [one-authority-per-vocabulary, gate-sees-target, failure-not-empty-success]
shared_with: []
use_when: [a randomized suite that has stopped finding defects users still hit, deciding what a bug report from the field should turn into, choosing the vocabulary a generator emits its cases in, a defect reproducible only by a long interactive sequence]
---

# Field-captured operation traces

A suite's inputs conventionally come from three places: fresh randomness, a
persisted regression corpus, and cases a person wrote. All three are authored —
the generator's distribution is its author's model of what users do, the corpus
is the subset of that distribution which once failed, and the hand-written lane
is the imagination the generator was supposed to replace. There is a fourth
source, and it is the only one whose distribution nobody chose: **the running
product, instrumented to emit the sequence a real user actually performed.**

The technique is not "log user actions." Products do that already and the logs
are useless as inputs, because they are written in the vocabulary of the user
interface — clicks, coordinates, widget names — and nothing can replay them
against the model. The technique is a constraint on the vocabulary:

> The field trace and the generator emit the same language, and one reproducer
> consumes both.

## The mechanism

1. **Register the mutating operations of the model layer**, by name, with their
   parameter types, in a reflection table the process can read at runtime. This
   table is the vocabulary, and it is the same table the generator draws from
   when it composes a random sequence. Two tables would be two authorities for
   one language, and they diverge exactly when a new operation is added to one
   ([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
2. **Log at the top-level call only.** Model operations are re-entrant: a move
   calls a remove and an insert, a group operation calls the per-item ones. A
   trace that records every frame is not a sequence of user intentions and does
   not replay — re-executing the outer call would perform the inner ones a
   second time. The logger takes a per-thread depth counter and records a call
   only when the depth was zero on entry.
3. **Record the arguments as values and the returns as identities.** An
   operation's parameters routinely include handles to objects created by
   earlier operations. The trace stores each created object under a generated
   name and refers to it by that name thereafter, so the sequence is
   self-contained: it constructs what it needs before it uses it.
4. **Record reversal events too.** Undo and redo are operations, they are where
   compositional defects concentrate, and a trace that omits them replays a
   history the user did not have.
5. **Emit the persisted artifact in the regression lane's format** — which,
   per [seed-is-not-a-reproduction](./seed-is-not-a-reproduction.md), is the
   derived input and never a seed. When the vocabulary is small and typed, the
   most durable serialization available is *executable source in the suite's
   own language*: it needs no deserializer, it fails at compile time rather
   than silently when the vocabulary changes, and it is readable and editable
   by the person debugging it.

## Why the fourth lane finds what the other three cannot

A generator bounds the space it can reach, and that bound is its author's
([generator-bounds-the-space](./generator-bounds-the-space.md)). The bound is
usually invisible: the suite is green, the fuzzer runs nightly, and the defects
users report are all in the region the generator does not sample. That is a
gate reading a target it was never pointed at
([gate-sees-target](../../../../_laws.md#gate-sees-target)), reporting the
comfortable answer throughout
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

Field sequences differ from generated ones in ways no generator author
reproduces on purpose:

- **They are long and repetitive.** Real sessions perform the same operation
  hundreds of times with slowly drifting parameters. Generators sample for
  variety, because variety is what their authors were optimizing for, and
  state-accumulation defects need the opposite.
- **They interleave reversal with work.** Users undo mid-sequence, redo
  partially, then continue editing from the middle of their own history.
  Generated sequences that include undo usually include it uniformly at random,
  which is a different distribution.
- **They are correlated with real inputs.** The operation sequence and the
  documents it runs against came from the same person and match each other.
  Generated pairings are independent by construction.
- **They are already interesting.** A trace collected because the session
  crashed is a pre-filtered sample of the space; no generator budget was spent
  finding it.

The last point is the economic argument. In one instrumented editing model, the
machine-produced regression file carried **448 of the suite's 775 whole-model
invariant assertions** — the captured-and-minimized lane asserted more about the
system than every hand-written case combined, and cost no author time per entry.

## Costs and the two ways this goes wrong

- **The trace is a privacy and secrecy surface.** Its arguments carry file
  paths, document contents, names and sizes. A trace is user data: it is
  collected on consent, it is redactable per parameter (the vocabulary is
  typed, so redaction is a property of the parameter's type and can be
  declared once), and a trace attached to a bug report is reviewed before it
  enters a repository that outlives the report.
- **The vocabulary rots silently unless replay is a gate.** Rename an operation
  or change a parameter's type and every stored trace refers to something that
  no longer exists. If the persisted form is source, this is a build failure,
  which is the loud outcome you want. If it is data, the deserializer must
  reject an unknown operation rather than skipping it — a trace that replays
  four of its five steps and passes is the regression-corpus failure this
  subject already names, arriving through a different door.
- **Instrumentation that is not always on is not a field lane.** A logger
  compiled only into debug builds captures the sequences of people running
  debug builds, which is the development team. That is a useful lane and it is
  not this one; say which you have.

## Prohibitions

1. No second vocabulary. If the generator and the logger name operations
   differently, there is no fourth lane — there are two formats and a
   translator nobody maintains.
2. No trace without depth suppression. A trace of every re-entrant frame is not
   replayable and its length hides that it is not.
3. No field trace admitted to the regression corpus without first being
   minimized and re-run to confirm it still fails. An unminimized trace is a
   session, not a case, and it will be deleted the first time it breaks for an
   unrelated reason.
4. No collection without consent and per-parameter redaction declared in the
   vocabulary itself.
