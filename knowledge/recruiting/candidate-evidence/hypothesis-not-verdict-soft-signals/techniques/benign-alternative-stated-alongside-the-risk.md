---
layer: technique
type: technique
subject: hypothesis-not-verdict-soft-signals
technique: benign-alternative-stated-alongside-the-risk
status: forged
laws: [inference-must-look-like-inference, say-only-what-the-record-holds, uncertainty-resolves-toward-the-candidate]
shared_with: []
use_when: [writing the detail text of a behavioural flag, reviewing screening copy that reads as an accusation, a signal will be shown without its surrounding context]
---

# The benign alternative, stated alongside the risk

Pairing fixes the *surface*. This fixes the *sentence*. Any individual signal will
eventually be read alone — in a summary row, a notification, a pasted line in a
message, an export. Whatever balance the surrounding surface provided is gone at
that moment. So the balance has to live inside the signal's own words.

The rule: **the adverse reading and the innocent reading appear in the same
sentence, and the sentence ends in a question rather than a conclusion.** Not a
disclaimer appended afterwards, not a tooltip, not a legend explaining that flags
are hypotheses. In the sentence, because that is the unit that travels.

## The model sentence

The shape that has proven durable, on the hardest example in the domain — a short
average tenure across several roles:

> **Average tenure 1.4 years across 4 roles.** Can mean contract or project work,
> fast growth — or roles that ended early; the document does not say which.
> Confirm what each move was.
> *Confidence 0.5 · needs confirmation · Probe: "walk through the last three moves:
> what each role added and what you were looking for next."*

Six things are doing work, and every one of them is load-bearing:

1. **The number leads.** "Short tenures" is a judgment; "1.4 years across 4 roles"
   is a fact the candidate can engage with and a reader can check. The sample
   travels with the claim.
2. **Every reading is about the record.** Contract work, growth and roles that
   ended early are worlds that produce this document. None of them is a claim
   about who the person is or what they will do next.
3. **The readings share one sentence, joined by "or".** The em-dash-and-or
   construction refuses to let the adverse reading stand alone even for a clause.
4. **The favourable reading is specific and plausible**, not a token hedge.
   "Fast growth" names a real world that produces this exact document, and the
   sentence says outright that the document cannot tell the worlds apart.
5. **The imperative is to confirm, not to weigh.** The sentence ends by handing
   the reader an action that is not a decision.
6. **The confidence is honestly middling.** Around a coin flip, because that is
   what the document supports. A 0.9 on this reading would be a lie about the
   evidence, and a 0.2 would be a reason not to have emitted it.

That sentence is
[inference-must-look-like-inference](../../../_laws.md#inference-must-look-like-inference)
compressed into two lines, and it is worth copying almost verbatim wherever this
pattern recurs.

**This technique's own first model sentence failed point 2.** It read "Can signal
flight risk — or fast growth. Confirm the reasons." It had the number, the "or",
the confirmation verb and the coin-flip confidence, and it named a reading the
golden path forbids in every rendering. A production panel shipped it verbatim for
weeks, and a review against this technique praised it, because every check listed
here was a check of shape. Balance does not launder a forbidden reading. Pairing
"flight risk" with "fast growth" still hands the interviewer a prediction about the
person. Time in prior jobs does predict later voluntary turnover, modestly
(Barrick & Zimmerman 2005, r between -.16 and -.22 across their predictors), so
the objection is not that the reading is empty. The objection is that it is a
trait label on a person, drawn from a record whose short tenures are often set by
layoffs, contracts, relocation or care, and whose longest tenures belong to older
workers (the same study's largest subgroup difference, d = -0.43 on months in the
last job). The probe changed for a related reason. "The reason for each
transition" is answered well only by a candidate willing to disclose a layoff, an
illness or a family move. "What each role added and what you were looking for
next" is answerable well by everyone. It still reaches the motive, which is where
the information is. Histories of moving toward better jobs predict better outcomes
than histories of leaving bad ones, and more strongly than the tenure arithmetic
does (Sajjadiani et al. 2019).

## Procedure

1. **Write the benign alternative first.** Starting from the concern produces a
   concern with an apology attached; starting from the innocent world produces two
   genuine readings. If the innocent world is hard to write, the detector is
   probably not measuring what you think.
2. **Keep both readings inside one sentence.** Two sentences get truncated,
   quoted, or summarised — and it is never the second one that survives.
3. **Use the candidate's own words where the record holds them.** If the document
   states a reason for a move, the signal quotes it rather than speculating around
   it; [say-only-what-the-record-holds](../../../_laws.md#say-only-what-the-record-holds)
   applies to detail text as much as to rejection copy.
4. **End on the confirmation verb.** "Confirm the reasons." "Ask what they owned."
   The last words a skimmer reads should be an instruction to ask.
5. **Set the confidence to what the document actually supports**, and let a low
   number be a reason to delete rather than a reason to hedge harder.
6. **Read the sentence back as the candidate.** If it would read to them as an
   allegation, rewrite it. This is the fastest review available and it catches
   almost everything.

## Decision rules

- **When the adverse reading is a prediction about the person, the sentence fails
  however balanced it is.** Check the vocabulary of both readings against the
  forbidden list before checking the shape. The shape checks above all pass on a
  sentence that names "flight risk", and a reviewer who runs only them will
  approve it.
- **When the benign alternative is not credible, do not ship the signal.** A
  manufactured innocent reading is worse than none: it looks like fairness and
  functions as cover for a conclusion already reached.
- **When the signal will appear in a compact surface, the compact form still
  carries both readings** — shorten the probe, never the alternative. If only one
  clause fits, it is the alternative that stays, because the adverse reading is the
  one a reader will supply for themselves.
- **When the headline and the alternative live in separate fields, audit every
  artifact that composes only the headline.** The common failure is exact and
  cheap to ship: the number goes in a short label, the two readings go in a longer
  detail, and the copyable one-line checklist is built from *label plus probe* —
  so the alternative is dropped from the only version that ever leaves the screen,
  and an adverse category word is prepended to what remains. Whatever line is
  exportable is the line the rule applies to.
- **When the record contains the actual reason, the alternative is replaced by the
  fact and the signal usually disappears.** A stated reason for a move is not a
  hypothesis to be balanced; it is a claim to be taken at face value unless
  contradicted, and uncertainty resolves toward the candidate
  ([uncertainty-resolves-toward-the-candidate](../../../_laws.md#uncertainty-resolves-toward-the-candidate)).
- **When adverse and benign wordings must be localised, compose the sentence at
  render time from structured parts** — a frozen translated string drifts from the
  detector, and the clause most likely to be lost in a shortened translation is the
  benign one.
- **When a downstream system consumes the signal programmatically, it consumes the
  structured record, never the sentence.** The sentence is for humans; a machine
  parsing "flight risk" out of the detail text has re-created the verdict the
  sentence was built to prevent.

## When not to use it

- **On observed behaviour in your own process.** "Did not respond in ten days" is
  a fact and does not need an alternative reading in the sentence — though it still
  needs the humility that people have lives.
- **On a hard, verifiable failure.** A required certification that is absent is
  absent; inventing a benign reading of a checkable fact is noise.
- **Where the "benign alternative" would itself be an inference about a person's
  circumstances.** Speculating that someone moved often "perhaps due to family
  reasons" is not charity, it is a protected-characteristic guess with a kind tone.
  Stay on the shape of the record: "fast growth" is about a career, "family
  reasons" is about a life.
