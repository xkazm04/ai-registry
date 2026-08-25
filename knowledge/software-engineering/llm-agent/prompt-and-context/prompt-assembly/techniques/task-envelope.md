---
layer: technique
type: technique
subject: prompt-assembly
technique: task-envelope
status: forged
laws: [gate-sees-target]
shared_with: []
use_when: [writing the task layer for a delegated or dispatched call, a prompt opens with a role or expertise claim, deciding what the first lines of a task prompt should buy, a worker finished but the result does not match what was asked, an unattended session must decide on its own when it is done]
---

# Task envelope

The task layer is the one layer of the prompt every call rewrites, and the
one whose opening lines are written by habit. The habit is role priming: a
sentence asserting expertise ("an experienced specialist in X") followed by
an urgency cue, on the theory that a model told it is expert performs as
one. The measured record says it does not. A controlled comparison of 162
roles against 2,410 factual questions across four model families
found no accuracy gain over asking directly, with per-persona effects
described as largely random; the best persona for a given question did
exist, but selecting it in advance did no better than chance. Those lines
cost tokens on every call and buy nothing predictable.

The words are not wasted because the opening is unimportant — it is the
position of primacy — but because they carry no *decision the model could
not make alone*. Spend them on the three things it cannot derive:

## The three parts that earn the opening

1. **Locate** — where the material the task needs actually is. A pointer
   to the folder, the record, the document, the section. This is the
   task-layer form of [context-reachability](./context-reachability.md):
   a pointer costs one line and compresses the search the model would
   otherwise spend its first tool calls on; and unlike inlined content it
   cannot go stale in the prompt, because the model reads the live
   target.
2. **Done** — the shape of the finished artifact. Not "a good proposal"
   but "one page, three pain points, the price at the bottom". A done
   criterion is what lets an unattended session decide to stop, and what
   lets the dispatcher's review be a comparison rather than an
   impression. A task without one runs until the model's own sense of
   completeness fires — which is late, or early, and never the same
   twice.
3. **Check** — the verification the model performs before it reports.
   "Before finishing, verify every figure against the notes and flag any
   you cannot back." The check is named explicitly because a model does
   not audit its own output unprompted, and because the check is where
   the task states its *stakes*: what kind of error would be worst.

The three together are roughly the same length as the priming they
replace. The difference is that each sentence changes what the model does.

## Decision rules

- **When a task prompt opens with an expertise claim, replace it with a
  locate pointer.** The claim buys nothing measured; the pointer buys the
  first three tool calls. If there is nowhere to point, the task probably
  lacks its inputs, which is a different problem and a louder one.
- **Keep the identity words that change behaviour, not competence.** A
  role line is not always priming: "you are unattended, the human is
  away", "you were dispatched by the orchestrator at the user's
  approval", "you are the review authority of last resort" are facts
  about permissions, escalation and autonomy that the model cannot
  infer and will act on. The test is whether removing the line changes
  what the model is *allowed* or *expected* to do — if it only changes
  how the model is asked to *feel* about the work, it goes.
- **The identity layer is a product decision, not a task lever.** This
  subject's identity layer (who is speaking, in what voice) is authored
  once and rarely changed; nothing here argues against it. The finding is
  about per-task priming stacked on top — a competence claim re-asserted
  in the task layer of every call, which is where the tokens are spent
  without effect.
- **Write the done criterion as an artifact, and the check as a read.**
  "Verify your answer" is a check in name only; "re-read each file you
  changed and confirm it does what the request asks and nothing it did
  not" is one the model can perform. Per
  [gate-sees-target](../../../../_laws.md#gate-sees-target), a self-check
  that inspects memory of the work instead of the work is a gate that
  sees nothing — it passes exactly when it should fail. Tell the model to
  open the artifact.
- **State the wanted behaviour, not the forbidden one.** "Write it as
  flowing paragraphs" outperforms "do not use bullet points", because a
  negation names the thing to avoid and leaves the target unspecified;
  the model then has to guess what was wanted, and the guess is
  sometimes the thing named. A prohibition earns its line only when the
  forbidden action is *plausible and costly* — pushing to a shared
  branch, deleting, spending money — and even then it sits beside the
  positive instruction, not in place of it.

## What this does not settle

The study measured factual accuracy on question answering. Whether a
persona shifts *style* — register, verbosity, vocabulary — is a separate
question, and the answer is usually yes; a house voice belongs in the
identity layer, deliberately. And "no gain on average" is not "no gain
ever": a domain-matched persona sometimes helped and sometimes hurt in
the same study. The rule is not that priming is harmful; it is that it is
*unpredictable*, and unpredictable spend in the primacy position loses to
three sentences that are not.
