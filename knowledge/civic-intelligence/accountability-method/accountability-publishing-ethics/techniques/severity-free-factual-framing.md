---
layer: technique
type: technique
subject: accountability-publishing-ethics
technique: severity-free-factual-framing
status: forged
laws: [lead-not-finding, non-partisan-symmetry, one-definition-one-import]
shared_with: []
use_when: [ordering a queue of findings or candidates about named people, writing copy templates for detected patterns, tempted to add a severity or risk score to an accountability surface]
---

# Severity-free factual framing

The moment a platform labels one person's case "critical" and another's
"medium", it has published a comparative moral judgment that no derivation
supports. Severity is an editorial verdict smuggled in as metadata: it answers
"how bad is this?" — a question the evidence layer cannot answer, because
badness depends on intent, context, and adjudication that no registry
contains. Severity-free framing removes the axis entirely: findings are stated
as dated facts of the record, candidates as facts of the process, and any
ordering a surface needs is derived from a property the platform *can* defend.

This is not squeamishness. A severity-ranked queue of named politicians is,
functionally, a published indictment order — the press will read the top of
the list as "the worst offenders according to the platform", and the platform
has no method behind that claim. The framing failure and the ranking failure
are the same failure at two grains.

## The procedure

1. **Write copy as facts of the process, not qualities of the person.** A
   drafting-process finding says what entered the record and when: "clause X
   of print N matches clause Y of statute M; identified [date]". A derived
   flag says what the computation found: "a registry role at a firm holding
   contracts with the ministry this bill amends". No adjective carries a
   judgment — no "suspicious", "troubling", "serious", "minor". The sentence's
   force comes entirely from the fact, which is where it can be defended.
2. **Order by evidence completeness, never by severity.** A review queue must
   be ordered somehow; the honest sort key is *how much material a human
   reviewer has in hand* — a deterministic sum of declared components (has a
   registry citation, has a date, has an amount, has a countervailing check).
   This ordering says "this case is most decidable", not "this case is worst",
   and its decomposition renders beside every item so the reader can audit
   the sort.
3. **Carry the rule text verbatim beside the results.** Every detector's rule
   is written in plain language, versioned, and rendered next to its output —
   the reader sees the exact sentence the machine applied, not a summary of
   it. A rule the surface paraphrases will drift from the rule the code runs;
   the verbatim copy is the contract that they are one thing, and it lives in
   one place, imported by every surface that shows the results.
4. **Give positive and neutral findings the same formal weight.** The
   symmetric badge is part of this technique, not a separate courtesy: if
   flagged ties get bold treatment and clean records or diligent work get
   muted treatment, the typography has re-invented the severity axis. Same
   badge weight, same tone, same placement logic across the finding polarity.

## Decision rules

- **When a stakeholder asks for a severity score, offer a decidability score.**
  The legitimate need behind the ask is triage — "where should the reviewer
  start?" — and evidence completeness answers it without publishing a
  judgment. If the ask is genuinely "tell readers which is worst", the answer
  is that the platform does not know, and saying so is the method.
- **Amounts and counts are not severity.** Sorting contracts by value or ties
  by count is a factual ordering with a disclosed key — legitimate. Weighting
  a composite "risk" from amounts, counts, and recency is a severity model —
  not, unless the model itself is published, justified, and labeled as an
  interpretive layer.
- **The adjective test.** Draft the sentence, then delete every adjective and
  adverb. If the sentence's meaning survives, ship the deleted version. If
  meaning was lost, the lost meaning was a judgment the evidence does not
  carry.
- **A degenerate value reads as missing, never as a number.** A broken stored
  amount rendered as a garbage figure in a public feed is a factual-framing
  failure too: the sentence around a figure asserts the figure is real. The
  canonical formatter answers "not available" for a non-finite value; a
  surface that forks its own formatter will eventually print nonsense into a
  syndicated feed.

## When not to use it

- Not inside the human review console's private deliberation, where a
  reviewer may freely weigh gravity — judgment is the reviewer's job. The
  technique governs what the *platform publishes*, including the ordering of
  its public and semi-public queues.
- Not a ban on consequence reporting. Once an external authority has
  adjudicated — a court ruling, a sanction, a formal censure — reporting that
  adjudication with its source is a registry fact, and its gravity is the
  authority's published word, not the platform's.
