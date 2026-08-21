---
layer: technique
type: technique
subject: evidence-provenance-weighting
technique: observed-evidence-minting-gates
status: forged
laws: [say-only-what-the-record-holds, a-verdict-is-bound-to-what-it-judged, inference-must-look-like-inference]
shared_with: []
use_when: [minting evidence from a live exercise or interview, extracting skills from a transcript, adding a top-tier evidence source]
---

# Minting observed evidence

The top rung of the ladder — the system watched the work happen — is the only tier
that cannot be read off a document. It is *minted* by a live process: a work sample, a
structured exercise, a recorded and evaluated conversation. Because it dominates every
other tier in consolidation, a false positive here does not merely add noise; it
outranks and hides every honest weaker claim the candidate actually made. This
technique is the set of gates a mint must pass.

## Two preconditions before any gate

Nothing is minted unless both hold, and they are independent:

- **The assessment itself is trustworthy.** Where the evaluation carries its own
  confidence, a degraded or fallback run is a weak hint and nothing more — it never
  produces the highest-trust signal the system knows. An evaluation that ran on a
  reduced path yields, at most, the tier that path can support.
- **The candidate cleared a competence bar.** Set it deliberately, not at the midpoint:
  a coin-flip performance does not earn the top rung. Anchoring the bar to an existing
  published band — the level at which the rest of the system already calls a result
  promising — keeps it defensible and stops it drifting to whatever makes the demo
  look good.

## Gate 1 — the match is token-bounded, and this is where systems fail

Scanning a transcript or a work product for evidence of named skills by **substring
containment** is the single most common way a pipeline fabricates top-tier evidence.
Skill vocabularies are full of one- and two-character names and short common words,
and those names are substrings of ordinary English. A sentence of neutral praise about
a candidate's communication can mint demonstrated evidence for several unrelated
technologies, because their names happen to sit inside the words. The candidate then
carries the system's strongest evidence for skills they never touched — and, because
the strongest basis wins, that fabrication is what the recruiter sees.

The gates that close it:

- **Match on token boundaries**, never on raw containment.
- **Impose a minimum length** below which a name is only matched through an explicit
  alias or context rule — short names are guilty until proven innocent.
- **Maintain an alias table** for the short and ambiguous names rather than hoping the
  matcher guesses; the table is small, and it is the only honest way to catch a
  one-letter language name without catching every word containing that letter.
- **Require the mention to be about the work.** A skill named in a question the
  interviewer asked, or in the candidate's statement of what they *would like* to
  learn, is not demonstrated evidence. Presence in a transcript is not performance.

Test this gate with a fixture that contains no technical content at all — only
ordinary complimentary prose — and assert that it mints nothing. That test catches the
whole class.

## Gate 2 — an unmapped result credits nothing

The second fabrication path is a fallback with a friendly face. The mint tries to map
what the exercise reported onto the role's named requirements; when nothing maps, some
implementation quietly falls back to "credit the role's requirements anyway". That
converts *we could not tell what was demonstrated* into *everything was demonstrated*
— the flattering-default failure, relocated into the minting path, and it fires
hardest on the deterministic or degraded evaluation path whose output is dimension
labels rather than skill names, so it fires most often exactly where the evidence is
weakest.

**Empty match means empty credit.** And where the assessment names both a
demonstration and a shortfall for the same skill, the shortfall wins: credit is
earned, never inferred from a contradiction.

The mint is also **additive only**. A weak performance adds no observed skills and
subtracts nothing — the system observed the candidate not clear the bar, which is a
reason to withhold credit, not a reason to penalise claims made elsewhere on other
evidence. A minting path that can also demote is a second scoring model with no ladder.

Withholding is recorded with a **machine-readable reason** — bar not cleared,
assessment not trustworthy, nothing mapped — so a caller can say "credit withheld,
here is why" rather than rendering an unexplained absence. A silent withhold is
indistinguishable from a bug, and it will be reported as one.

## Gate 3 — the mint names its session and its artifact

Observed evidence records the exercise that produced it: which session, which prompt
or task, which artifact or excerpt. Without that, the strongest tier in the system is
an unsourced assertion, and the audit answer to "what did they demonstrate?" dead-ends
— [say only what the record holds](../../../_laws.md#say-only-what-the-record-holds). The
pointer must be resolvable by a human, not merely stored: a reader challenging the tier
should be able to go and look at what happened.

## Gate 4 — the mint is bound to its rubric version

A demonstration is scored against a standard, and standards get revised. The mint
stamps the rubric or exercise version it was judged under, so a later revision cannot
retroactively re-mean an old verdict — [a verdict is bound to what it
judged](../../../_laws.md#a-verdict-is-bound-to-what-it-judged). When the rubric changes,
prior mints are marked superseded, not silently re-read. They keep their tier; they
lose their currency.

## Gate 5 — the mint comes from bounded extraction, not narrative

Observed evidence is never harvested from a model's freeform prose about the
candidate. The extraction is enumerated: a closed list of the skills the exercise was
designed to elicit, each answered present-with-instance or not-observed. Freeform
narrative invites the model to reward eloquence, and — worse — to describe skills it
inferred from context as though it had watched them. [Inference must look like
inference](../../../_laws.md#inference-must-look-like-inference): a bounded extraction
cannot silently promote a guess, because there is nowhere for the guess to go.

"Not observed" is a required output of the extraction, distinct from the skill being
absent from the list. An exercise that could only ever produce positives is not
evidence gathering.

## Gate 6 — one minting path

Every source of observed evidence goes through the same mint. A second path that
writes top-tier claims directly — a convenience import, an admin correction, a
migration — is a second and unmarked evidence semantics, and it will not carry the
gates. If a human needs to assert a demonstration, that assertion is its own basis
with its own rung and its own named actor; it does not borrow the observed tier.

## Decision rules

- When a mint cannot name its instance, do not mint. Downgrade to the strongest tier
  the source can actually support.
- When the exercise was degraded — a fallback path, a truncated session, a failed
  scoring pass — the mint is downgraded truthfully rather than inherited from what the
  healthy path would have produced.
- When a candidate disputes a mint, the resolution reads the stored instance. A tier
  that cannot be examined cannot be defended, and an indefensible tier is removed, not
  argued.

## When not to use this

- **When there is no live exercise.** Do not synthesize an observed tier from
  documents, references, or a model's confidence. A strong document is professional
  evidence at best.
- **When the exercise was unstructured.** A casual conversation with no rubric and no
  enumerated targets yields hypotheses, not demonstrations — the appropriate output is
  a probe for the next round, not a tier promotion.
- **For breadth claims.** A single exercise demonstrates the skills it exercised, at
  the depth it reached. Minting "senior in this technology" from a forty-minute sample
  overstates what was observed and will not survive a reference check.
