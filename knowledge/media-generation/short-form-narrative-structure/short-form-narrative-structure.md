---
layer: golden-path
type: golden-path
subject: short-form-narrative-structure
status: forged
use_when: [writing or reviewing a factual video script, designing a script-generation pipeline, diagnosing why a correct explainer loses viewers, budgeting runtime for a short explainer]
techniques:
  - but-therefore-beat-linking
  - question-stack-architecture
  - scqa-opening
  - nested-open-loops
  - reversal-anatomy
  - reframe-close
---

# Short-form narrative structure

A factual video does not hold attention because its facts are good. It holds
attention because, at every moment, the viewer has a live reason to hear the
*next* sentence. Narrative structure is the discipline of manufacturing that
reason continuously — and it is a structural property of the beat list, not a
property of the prose. The prose can be rewritten endlessly without fixing a
video whose structure never gave the viewer anything to want.

The canonical failure has a shape worth naming: the **wiki timeline** —
correct information, correctly ordered, that nobody can sit through. It is
what a knowledgeable writer (or a model handed a topic string) produces by
default, because knowledge is organized taxonomically and attention is
organized causally. Everything in this subject exists to convert the first
organization into the second.

## Attention is earned per sentence, not per video

The naive model of a viewer is someone who decided to watch and will now
watch. The real viewer re-decides constantly, at nearly zero switching cost,
and the decision is always about the *next* moment: do I currently hold an
open question this video seems about to answer? A script is therefore not a
container of information but a **schedule of debts** — questions opened,
carried, and paid. The craft splits into four concerns, and the six
techniques of this subject serve them:

1. **Local causality** — every adjacent pair of beats must be linked by
   consequence or complication, never mere succession
   (but-therefore-beat-linking).
2. **Curiosity architecture** — gaps are opened deliberately, tracked, nested
   so the viewer always has at least one live, and closed in an order that
   keeps the largest alive longest (question-stack-architecture,
   nested-open-loops).
3. **The opening** — the first seconds must open one specific gap before
   anything else is allowed to happen (scqa-opening).
4. **Turns and endings** — surprise is engineered, not asserted
   (reversal-anatomy), and the close converts understanding into a sentence
   the viewer can carry away (reframe-close).

## Curiosity is a gap, and a gap is a debt

Information-gap theory is the load-bearing psychology here: curiosity is not
a general appetite for facts but the specific discomfort of an *identified
hole* in what one knows. Three consequences are non-negotiable:

- **A fact opens no gap; a question does.** "This currency is decentralized"
  closes a gap the viewer never had. "Why would anyone trust money nobody is
  in charge of?" opens one. Openings built from impressive facts fail for
  exactly this reason.
- **Gaps must be specific and feel answerable.** "What is the meaning of
  money?" is too large to feel reachable; "why is the supply capped at
  exactly 21 million?" is a gap a viewer will stay for.
- **Every opened gap is owed an explicit payment.** A viewer whose question
  was never answered feels cheated even when they cannot say why, and the
  debt is charged against the creator's next video, not just this one.

## Explanatory tension is *why*, never *what*

The single most counterintuitive rule of factual work: **give the answer
early.** An explainer is not a mystery novel. A well-built long-form
explainer states its entire thesis inside the first minute and spends the
remaining 90-plus percent of runtime on why the answer is stranger than it
sounds; a sixty-second physics short can answer its title question in its
second word and lose nothing, because one line immediately reopens the gap
at a deeper level. Withholding the conclusion does not create tension — it
creates the suspicion that there is no conclusion. The tension that
sustains factual work is *how can that be true*, and that tension survives
full disclosure of *what* is true.

## Structure scales with runtime; the grammar does not

The same causal grammar governs a thirty-second short and an eighteen-minute
essay; what scales is the act count. The working ratio is roughly **one
act-level question per 60–90 seconds of essay body**: a piece under three
minutes carries exactly one question, a long essay carries about three,
stated out loud immediately after the hook and answered in order. Getting
this wrong in either direction is fatal — two theses in a short means
neither is paid; a single question stretched over fifteen minutes means the
viewer runs out of live debt by minute four.

Turns compress the same way. A long-form reversal earns its surprise across
60–90 seconds with a concrete analogy and a generalization step; a
short-form reversal sheds exactly those two steps and lands in 18–25
seconds, compensating by staying rigorously quantitative through the turn.
The anatomy survives; specific steps are what get cut (reversal-anatomy).

## Composition order: structure before prose, prose last

The procedure that reliably avoids the wiki timeline runs in this order,
and the ordering is the point:

1. **Find the tension.** What about this topic is counterintuitive,
   contested, or absurd? No tension, no video — a topic is not a premise.
2. **Write the question stack** — the acts, as literal questions, approved
   as an artifact of their own before any prose exists.
3. **Draft beats as one-line claims** under each question.
4. **Run the causal test** on every adjacent pair; treat each "and then" as
   a defect to be merged, reordered, or bridged.
5. **Place the reversals** and give each the room its runtime class allows.
6. **Write the hook and the closing line together** — they are one artifact:
   the hook opens the gap, the close names what filling it taught.
7. **Only now write prose**, apply the duration budget, and read it aloud —
   spoken English is a different register from written, and the difference
   is audible in every machine-generated script that skipped this step.

A pipeline that exposes only step 7 — a "generate script" button over a
topic string — will produce the wiki timeline every time, because steps 1–6
are where the quality lives. If a generator is involved anywhere, the
question stack and the beat list must be its reviewable intermediate
outputs, not its hidden reasoning.

## Delivery is a consequence, not a dial

Delivery mechanics are real but strictly downstream of composition.
Measured across strong practitioners, factual narration runs **roughly
200–250 words per minute**, so a 130-second piece budgets about 425–525
words — and the budget must be stated in **essay time, not runtime**,
because sponsor reads and front matter can consume a third of the clock.
Surface statistics like hedge density, second-person address, and numeric
density are consequences of the subject and the chosen structure — a fully
knowable subject hedges near zero, a genuinely uncertain one should say so
out loud — and setting them as independent style dials produces incoherence.
One diagnostic does generalize: the fraction of sentences opening with a
causal or additive connector tracks how much a script *derives* rather than
*asserts*. It is a quality signal, not a length rule.

Two smaller rules with outsized effect. **Nothing before the gap is open**:
greetings, channel identity, and housekeeping are affordable only after the
viewer wants something — three seconds of identity at second twelve costs
nothing; the same three seconds at second zero are the most expensive in
the video. And **a joke may not occupy a beat of its own**: humor earns its
place only when deleting the joke would delete information, which is why
the best factual work is funny without ever stopping to be funny.

## Failure modes of the naive reading

- **The wiki timeline** — beats joined by "and then". Test it mechanically;
  never trust the feeling that it flows.
- **The withheld answer** — mystery-novel structure applied to explanation.
- **Facts with no owner question** — material that answers nothing anyone
  asked; it belongs in a different video or in none.
- **The unearned reversal** — "but it's not that simple!" with no mechanism
  behind it; surprise asserted rather than engineered.
- **The recap ending** — telling viewers what they just heard, which they
  know; the one ending strong practitioners categorically refuse.
- **Two theses** — each halves the other's payment.
- **Explaining without implying** — long stretches of mechanism with no
  moment of reflection saying why it matters. Momentum and meaning are
  supplied by different kinds of beat, and a script needs to alternate
  them: a run of pure consequence is a lecture, a run of pure meaning is an
  essay nobody finishes.
