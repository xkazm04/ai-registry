---
layer: application
type: application
subject: voice-io
technique: engine-choice-on-decisive-terms
stack: python
status: forged
verified_on: 2026-09-08
verified_against: python@3.12
applied: experiment
ab_verdict: better
proof: ab-paired
---

# Decisive-term recall in a recruiting voice harness

The realization is a Python evaluation harness that drives real spoken
interview sessions against a running application and scores the transcript the
product will act on. The stack version is witnessed by the CI setup step that
pins the interpreter for every job (`python-version: "3.12"`, seven workflow
files), not by a declared floor in the project metadata.

This application is unusual in that the tree **already implements the metric
the technique argues for** and pre-dates the technique's landing by three
weeks. What the run added is the paired measurement that shows the metric is
load-bearing rather than decorative, and one structural finding about the
harness that the technique was then written around.

## The tree already separates the two error classes

The harness computes both numbers on every session and treats them
differently, which is the technique's metric contract implemented before it was
stated:

- An aggregate word error rate over the spoken ground truth, with deliberately
  conservative normalization — case, punctuation and whitespace folded;
  diacritics **preserved**, on the stated reasoning that a dropped diacritic is
  a real recognition error rather than a formatting artifact.
- A domain-term recall over a curated lexicon of roughly 150 technology terms,
  returning the missing terms themselves alongside the rate, whose `ok`
  property is `not missing` — a **zero budget on deletions**, exactly the
  posture the technique recommends starting from.

Two implementation details match the technique's morphology rule precisely:
terms are prefix-matched with a maximum inflection of three characters, so
Czech case endings resolve to the canonical term, and the lexicon is sorted
longest-first so a short term is not swallowed by a longer one containing it.
Short ambiguous names that collide with ordinary speech are excluded
deliberately, and the exclusion is recorded in a comment rather than left to be
rediscovered.

The number folding is a third detail worth recording because it is a *measurement
bug the tree found and fixed*: the harness synthesizes the candidate's speech
from text it wrote, so numbers are spoken as words while the recogniser writes
digits, and every number in an utterance was being charged as a substitution
against a transcript that was perfectly correct. Folding both sides to digits
removed a content-free tax that fell hardest on exactly the utterances a work
history is full of.

## The paired result: the two metrics buy different engines

Both arms were scored by the tree's own functions over the same three-utterance
reference set, one of which is the verbatim ground truth and recogniser output
from a live non-English call recorded in the project's own test suite.

- **Arm A** — the real recogniser output. Two domain nouns substituted, the
  sentence frame intact.
- **Arm B** — constructed, and labelled as constructed: the complementary error
  class, in which function words and inflection go wrong and every domain noun
  survives.

| | aggregate WER | decisive-term recall | missing |
| --- | --- | --- | --- |
| Arm A | **0.167** | 0.667 | two domain nouns |
| Arm B | 0.278 | **1.000** | none |

The aggregate prefers arm A by 40%. Recall prefers arm B outright. **On the one
utterance that carries the corruption, both arms score an identical 0.231** —
the aggregate cannot separate a transcript that fabricated two capabilities from
one that preserved every term, because the two arms happen to have made the same
*number* of token errors in different classes.

Verdict `better`: the technique's rule binds in this tree. An engine chosen on
the aggregate here would be chosen against the product's own interest, and the
disagreement is not marginal.

The honest limit on that result: n=3 utterances, arm B is constructed rather
than recorded, and the reference set is one language pair. It establishes that
the metrics *can* invert on this product's real data, not how often they do.

## What the tree's shape says: the metric cannot be aimed

The structural finding is the one the run did not go looking for, and it is
negative. The harness holds a good selection instrument and **cannot point it at
a second engine.** Its session driver speaks one provider's realtime websocket
protocol directly — the streaming chunk format, the ping/pong keepalive, the
server's transcript and turn events — and the scenario runner drives that driver
rather than an interface. There is no engine seam, no adapter, no configuration
naming the thing under test.

Nobody designed that, and it is not a defect of the harness's purpose: it was
built to catch regressions in an integration, and for that job the coupling is
free. But it means the product has an excellent instrument for *regressions* and
none for *choices*, so the moment a competing engine is worth evaluating the
measurement that should decide it is unavailable, and the decision falls back to
a published ranking — the exact failure the technique names. This is the
observation that produced the technique's closing section; the requirement that
the selection instrument be engine-independent was written from a tree where it
is not.

The tree also already carries the technique's neighbouring discipline in
deployed form: a roughly 55-term recognition keyword list is threaded into the
agent configuration at setup time, with a comment tying it directly to the
corruption incident above.

## Confirmed, deviating, and absent

- **Confirmed** — both metrics are computed per session and pooled per corpus;
  deletions are reported separately from the rate; the lexicon is shared and
  extensible; morphology and longest-first matching are implemented as the
  technique specifies.
- **Confirmed** — the selection set is extended along the channel axis
  honestly. Seeded, deterministic degradations (additive noise at a target
  signal-to-noise ratio, gain reduction) are wired through the scenario runner
  into the synthesis call, and the condition is recorded on the run, so a
  fidelity number travels with the condition it was taken under.
- **Deviation** — the recognition bias is static and agent-level rather than
  per-session, and the code comment states both the cause (per-session keywords
  are not reachable through the client SDK's override type) and the cost.
- **Closed on 2026-09-08, after this application was written** — the engine
  boundary. The absence recorded above was the technique's own closing section
  turned into a change: a recogniser protocol one method wide
  (`transcribe(pcm, lang) -> str`), a command-driven adapter so an offline
  open-weights engine is a drop-in without the project taking a dependency on a
  model runtime, a registry where adding a candidate is a registration rather
  than a harness edit, and a bake-off that hands every engine the same
  synthesized bytes and ranks on decisive-term recall with the aggregate demoted
  to a threshold. The project's gate ran green over 2,646 tests. **The
  end-to-end run found a defect no unit test had**: formatting the audio path
  into the command template before splitting it let the shell-style splitter eat
  the path separators on the platform whose separator is an escape character, so
  every candidate reported a missing file for a file the harness had just
  written. Split first, substitute per token. That is the technique's own
  "assert the instrument before the result" arriving one layer down.
- **Absent** — the speaker axis. Because the reference audio is synthesized,
  the set cannot vary accent, disfluency, speaking rate, or a speaker changing
  language inside one sentence. That last one is not hypothetical for this
  product: the recorded corruption is a non-English sentence carrying English
  technology nouns, which is the in-sentence language switch case, and it is the
  case the set is least able to generate more of.
