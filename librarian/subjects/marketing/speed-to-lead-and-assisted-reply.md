---
subject: speed-to-lead-and-assisted-reply
domain: marketing
last_touched: 2026-09-09
touched_by: intake-marketing-0909 (forge wave)
dry_streak: 0
---

# speed-to-lead-and-assisted-reply

First touch. Forged 2026-09-09 in the founding wave of the `marketing` bundle
(category `conversion-and-leads`), one worker, expert draft first, then reconciled against the
consumer workspace at `2893314` and the SEO prompt pipeline at `a47c1ecd`.

**use_when:** designing what happens in the minutes after a lead arrives, setting or reporting a first-response service level, letting a model draft or send customer replies, deciding whether an assisted reply may leave without a human

**Techniques (6):** answer-in-first-sentence-never-promise, bant-lite-scoring, delivery-fails-closed-cap-consent, first-reply-promises-channel-not-minutes, five-minute-sla-settled-outcomes-only, risks-gate-not-confidence.

**Applications (3; stacks: node):** node--bant-lite-scoring, node--delivery-fails-closed-cap-consent, node--five-minute-sla-settled-outcomes-only.

## Sightings

- Every threshold the subject states is labelled documented / measured / convention in
  the technique that carries it; the worker's report listed the conventions and they
  are in the files, not only in the report.
- Deviations of the reconciled trees are recorded in the applications with the standard
  kept; the source note `librarian/sources/2026-09-09-seo-agent.md` carries the
  deviation backlog by area.

## 2026-09-16 - intake-ff7om2

- Amendment to `risks-gate-not-confidence`: the list fails toward the human only for
  honest errors, and a payload written to empty it inverts that; code-detected inbound
  signals are a gate input the model cannot clear. Source note
  `librarian/sources/2026-09-16-agent-own-inbox.md`.
- New application `node--risks-gate-not-confidence` (applied: code, better, ab-paired).
  First `librarian/applied.md` row for this subject.
- Boundary shared with software-engineering prompt-safety (`payoff-removal` names the
  self-elevating channel); stated in prose on this side, no cross-bundle link.

## Owed

- Single-stack debt: born with the stacks above; an external reconcile against a
  second tree is the next pass.
- No `librarian/applied.md` row yet except where the source note says so; the
  unapplied backlog is every technique here without a row.

## 2026-10-22 - intake-apply-frpcnm

- New application `node--first-reply-promises-channel-not-minutes` (applied: code,
  better, ab-paired). The function held the channel table and the no-minutes rule;
  two callers passed a row label or a filler word as the name.
- Decision rule added to `first-reply-promises-channel-not-minutes`: greet without a
  name when the field holds none, and carry the person's name apart from the label.
- Single-stack debt unchanged: the only other marketing project has no lead-reply seam.

## 2026-10-31 - architecture review

First architecture-review record. All 13 documents read in full. Primary and
near-primary sources checked for the claims the subject leans on: the 2011 response-time
audit, the EU existing-customer exception, and the 2025 Court of Justice case on free
sign-ups. The HBR and BYU pages exposed only the abstract, so the "median" wording on
the 42-hour figure could not be checked against the article. Secondary summaries call
it an average. The Court of Justice judgment text could not be reached either. A
commentary summary reads the holding in the opposite direction to the technique's
sentence. Both items stay owed and are not applied.

<!-- architecture-review:v1 -->
```json
{
  "subject": "marketing/speed-to-lead-and-assisted-reply",
  "date": "2026-10-31",
  "baseline": "51cada741",
  "digest": "sha256-b2:e0b6ab46f1c003e0",
  "disposition": "clarify",
  "coverage": "All 13 documents read in full: the golden path, 6 techniques and 6 node applications. Trigger: pending, never architecture-reviewed. Intended benefit: an honest first-response clock, a qualification capture that keeps unknown apart from judged, and two fail-closed gates on assisted replies. Failure if ignored: a service-level rate reads 100% while fresh leads go unanswered, customers get promises nobody can keep, and model-drafted text leaves on a self-reported score or on a stranger's instruction. Boundary: from arrival to the first answer and its qualification. Voice, lead source quality, the general grounded-generation contract and form design are owned elsewhere. Not evaluated: any private consumer tree (the applications are pinned to commits that were not reopened) and the full text of the 2011 HBR article and of CJEU C-654/23. No verification date was refreshed.",
  "counterexamples": [
    "A business that only checks e-mail twice a day is better served by a longer labelled target than by a five-minute one that stays red. The technique says so itself.",
    "A hostile inbound can make an obedient model report a high confidence and an empty risks list on every tier. The risks list then fails toward the send unless a code-detected input the model cannot write sits in the gate.",
    "A free sign-up can count as a sale for the EU existing-customer exception (CJEU C-654/23, as commentary summarises it). So a free sign-up does not, by itself, push a message into the consent-gated category.",
    "A reply to an enquiry on its own channel is service communication. Gating it on a consent record that was never collected leaves a customer unanswered."
  ],
  "sources": [
    {
      "url": "https://hbr.org/2011/03/the-short-life-of-online-sales-leads",
      "result": "Only the abstract was reachable: 'Our research shows that most companies are not responding nearly fast enough.' The 2,241 / 37% / 42-hour figures could not be checked there."
    },
    {
      "url": "https://scholarsarchive.byu.edu/facpub/9711",
      "result": "Catalogue entry for the same peer-reviewed article (Oldroyd, McElheran, Elkington 2011). Abstract only, no figures."
    },
    {
      "source": "Web search, secondary summaries of the 2011 audit",
      "result": "They agree on 2,241 US companies and 37% answering within an hour. They describe 42 hours as an average, either among responders or overall, and none calls it a median. Not enough to edit on, so the item stays owed."
    },
    {
      "url": "https://www.legislation.gov.uk/eudr/2002/58/article/13",
      "result": "Directive 2002/58/EC Art. 13. 13(1) requires 'prior consent' for e-mail direct marketing. 13(2) allows a business that obtained a customer's e-mail 'in the context of the sale of a product or a service' to market 'its own similar products or services', with an objection offered at collection and in each message. Supports the delivery technique's statement of the EU regime."
    },
    {
      "url": "https://www.matheson.com/insights/cjeu-clarifies-direct-marketing-rules-under-eprivacy-directive/",
      "result": "Commentary on CJEU C-654/23 Inteligo Media (13 November 2025): 'the creation of a free account that grants limited content and a free newsletter may constitute a \"sale\"', and 'the soft opt-in must be interpreted strictly, meaning that not every free service will benefit.' The case widens the exception, read narrowly. That is the opposite direction to the delivery technique's 'free sign-ups are not automatically exempt cuts the same way'. The EUR-Lex and CURIA texts did not load, so this was not applied."
    }
  ],
  "documents": {
    "speed-to-lead-and-assisted-reply.md": {
      "disposition": "clarify",
      "reason": "Three changes. (1) The 'Sending the prompt the customer's raw message as instruction' failure mode is garbled. It should read 'sending the customer's raw message to the model as instruction'. (2) The risks paragraph gives the autonomy gate as four model- and config-derived conjuncts. Since the 2026-09-16 amendment, the technique also gates on code-detected hostile signals in the inbound, which the model cannot clear. The golden path should say so, or it contradicts its own technique. (3) Owed, not confirmed: '2011 audit ... median first response of 42 hours'. Secondary summaries say average. Check against the HBR article text."
    },
    "techniques/five-minute-sla-settled-outcomes-only.md": {
      "disposition": "clarify",
      "reason": "The three-state rate, the null rate and the one-constant-per-surface rule are sound. They are confirmed by the drill application's pinned code and by its non-monotonic-rate incident. Owed: 'put the median first response at 42 hours'. Same unconfirmed median-versus-average question as the golden path."
    },
    "techniques/bant-lite-scoring.md": {
      "disposition": "keep",
      "reason": "Point values and band edges are labelled convention. Unknown is the absent state. One band function. Consistent with its application (30/30/30, +-10, 60/40) and with the golden path."
    },
    "techniques/first-reply-promises-channel-not-minutes.md": {
      "disposition": "keep",
      "reason": "The channel table, the no-minutes rule and the greeting/sign-off placeholder rules are internally consistent. The 2026-10-22 decision rule is carried by a paired application."
    },
    "techniques/answer-in-first-sentence-never-promise.md": {
      "disposition": "keep",
      "reason": "Eight rules and a five-field output that match the golden path and both applications. The injection-surface section agrees with the risks technique's adversarial boundary."
    },
    "techniques/risks-gate-not-confidence.md": {
      "disposition": "keep",
      "reason": "The measured weak-tier inflation case and the 12/12 vs 0/12 paired adversarial result are stated with their limits (pattern list, nine-message floor). The convention bar of 80 is labelled. The oversight-guidance sentence cites no source but claims only shape, not numbers."
    },
    "techniques/delivery-fails-closed-cap-consent.md": {
      "disposition": "clarify",
      "reason": "The four refusals, the cap counted inside the claim and unknown consent refused like false all hold, and Art. 13(1)/(2) as stated matches the directive text read this run. Owed, not applied: 'the recent case law that free sign-ups are not automatically exempt cuts the same way'. As commentary summarises C-654/23, a free account can be a 'sale' for the existing-customer exception, construed strictly. The case widens the exception, not the gate. Restate it once the judgment text is read: content still decides the category, and a free sign-up neither automatically qualifies nor is automatically excluded."
    },
    "applications/node--answer-in-first-sentence-never-promise.md": {
      "disposition": "keep",
      "reason": "Paired measurement with its floor and its unmeasured residue stated. Pinned to commit 962c2a1b. Not reopened, and verified_on left as is."
    },
    "applications/node--bant-lite-scoring.md": {
      "disposition": "keep",
      "reason": "A reading witness pinned to 2893314. Its numbers match the technique, and it records its own duplicate-colour-map deviation. Not reopened."
    },
    "applications/node--delivery-fails-closed-cap-consent.md": {
      "disposition": "keep",
      "reason": "A reading witness pinned to 2893314. The 'four conjuncts' quote of decideDraft is correct at that commit, though the later risks application adds an inbound conjunct. The consent-outage-versus-missing deviation is recorded. Not reopened."
    },
    "applications/node--first-reply-promises-channel-not-minutes.md": {
      "disposition": "reverify",
      "reason": "Paired measurement sound as of 7bbd1cab. It says the change sits on a branch, not yet on the default branch, and that the default branch's pre-push gate was red. Whether the change landed needs a look at the consumer tree, which was not reopened."
    },
    "applications/node--five-minute-sla-settled-outcomes-only.md": {
      "disposition": "keep",
      "reason": "A reading witness pinned to 2893314. Its WARNING_RATIO 0.35 matches the technique's 'roughly a third by convention'. It records the unlabelled 5-minute constant and the missing queue rate as deviations. Not reopened."
    },
    "applications/node--risks-gate-not-confidence.md": {
      "disposition": "keep",
      "reason": "Paired adversarial proof with stated limits and known false holds. Pinned to 42c1f54f. Not reopened."
    }
  }
}
```


Apply pass, 2026-10-31: the two internal golden-path clarifications were applied. The 42-hour wording and the C-654/23 sentence stay owed for want of primary text.

<!-- architecture-review:v1 -->
```json
{
  "subject": "marketing/speed-to-lead-and-assisted-reply",
  "date": "2026-10-31",
  "baseline": "51cada741",
  "digest": "sha256-b2:7dd70842044e3a16",
  "disposition": "clarify",
  "coverage": "Re-record after the apply pass on the same date and baseline. Only the golden path changed. All 13 documents read in full: the golden path, 6 techniques and 6 node applications. Trigger: pending, never architecture-reviewed. Intended benefit: an honest first-response clock, a qualification capture that keeps unknown apart from judged, and two fail-closed gates on assisted replies. Failure if ignored: a service-level rate reads 100% while fresh leads go unanswered, customers get promises nobody can keep, and model-drafted text leaves on a self-reported score or on a stranger's instruction. Boundary: from arrival to the first answer and its qualification. Voice, lead source quality, the general grounded-generation contract and form design are owned elsewhere. Not evaluated: any private consumer tree (the applications are pinned to commits that were not reopened) and the full text of the 2011 HBR article and of CJEU C-654/23. No verification date was refreshed.",
  "counterexamples": [
    "A business that only checks e-mail twice a day is better served by a longer labelled target than by a five-minute one that stays red. The technique says so itself.",
    "A hostile inbound can make an obedient model report a high confidence and an empty risks list on every tier. The risks list then fails toward the send unless a code-detected input the model cannot write sits in the gate.",
    "A free sign-up can count as a sale for the EU existing-customer exception (CJEU C-654/23, as commentary summarises it). So a free sign-up does not, by itself, push a message into the consent-gated category.",
    "A reply to an enquiry on its own channel is service communication. Gating it on a consent record that was never collected leaves a customer unanswered."
  ],
  "sources": [
    {
      "url": "https://hbr.org/2011/03/the-short-life-of-online-sales-leads",
      "result": "Only the abstract was reachable: 'Our research shows that most companies are not responding nearly fast enough.' The 2,241 / 37% / 42-hour figures could not be checked there."
    },
    {
      "url": "https://scholarsarchive.byu.edu/facpub/9711",
      "result": "Catalogue entry for the same peer-reviewed article (Oldroyd, McElheran, Elkington 2011). Abstract only, no figures."
    },
    {
      "source": "Web search, secondary summaries of the 2011 audit",
      "result": "They agree on 2,241 US companies and 37% answering within an hour. They describe 42 hours as an average, either among responders or overall, and none calls it a median. Not enough to edit on, so the item stays owed."
    },
    {
      "url": "https://www.legislation.gov.uk/eudr/2002/58/article/13",
      "result": "Directive 2002/58/EC Art. 13. 13(1) requires 'prior consent' for e-mail direct marketing. 13(2) allows a business that obtained a customer's e-mail 'in the context of the sale of a product or a service' to market 'its own similar products or services', with an objection offered at collection and in each message. Supports the delivery technique's statement of the EU regime."
    },
    {
      "url": "https://www.matheson.com/insights/cjeu-clarifies-direct-marketing-rules-under-eprivacy-directive/",
      "result": "Commentary on CJEU C-654/23 Inteligo Media (13 November 2025): 'the creation of a free account that grants limited content and a free newsletter may constitute a \"sale\"', and 'the soft opt-in must be interpreted strictly, meaning that not every free service will benefit.' The case widens the exception, read narrowly. That is the opposite direction to the delivery technique's 'free sign-ups are not automatically exempt cuts the same way'. The EUR-Lex and CURIA texts did not load, so this was not applied."
    }
  ],
  "documents": {
    "speed-to-lead-and-assisted-reply.md": {
      "disposition": "clarify",
      "reason": "Applied 2026-10-31: the failure mode now reads 'sending the customer's raw message to the model as instruction' (was 'Sending the prompt the customer's raw message as instruction'). The risks paragraph now says the list fails toward the human only while the model's errors are honest, and that code-detected inbound signals are risks the model cannot clear, read by the same gate. That matches the risks technique's 2026-09-16 amendment. Still owed: '2011 audit ... median first response of 42 hours'. Secondary summaries say average, and the HBR article text was not reachable."
    },
    "techniques/five-minute-sla-settled-outcomes-only.md": {
      "disposition": "clarify",
      "reason": "The three-state rate, the null rate and the one-constant-per-surface rule are sound. They are confirmed by the drill application's pinned code and by its non-monotonic-rate incident. Owed: 'put the median first response at 42 hours'. Same unconfirmed median-versus-average question as the golden path."
    },
    "techniques/bant-lite-scoring.md": {
      "disposition": "keep",
      "reason": "Point values and band edges are labelled convention. Unknown is the absent state. One band function. Consistent with its application (30/30/30, +-10, 60/40) and with the golden path."
    },
    "techniques/first-reply-promises-channel-not-minutes.md": {
      "disposition": "keep",
      "reason": "The channel table, the no-minutes rule and the greeting/sign-off placeholder rules are internally consistent. The 2026-10-22 decision rule is carried by a paired application."
    },
    "techniques/answer-in-first-sentence-never-promise.md": {
      "disposition": "keep",
      "reason": "Eight rules and a five-field output that match the golden path and both applications. The injection-surface section agrees with the risks technique's adversarial boundary."
    },
    "techniques/risks-gate-not-confidence.md": {
      "disposition": "keep",
      "reason": "The measured weak-tier inflation case and the 12/12 vs 0/12 paired adversarial result are stated with their limits (pattern list, nine-message floor). The convention bar of 80 is labelled. The oversight-guidance sentence cites no source but claims only shape, not numbers."
    },
    "techniques/delivery-fails-closed-cap-consent.md": {
      "disposition": "clarify",
      "reason": "The four refusals, the cap counted inside the claim and unknown consent refused like false all hold, and Art. 13(1)/(2) as stated matches the directive text read this run. Owed, not applied: 'the recent case law that free sign-ups are not automatically exempt cuts the same way'. As commentary summarises C-654/23, a free account can be a 'sale' for the existing-customer exception, construed strictly. The case widens the exception, not the gate. Restate it once the judgment text is read: content still decides the category, and a free sign-up neither automatically qualifies nor is automatically excluded."
    },
    "applications/node--answer-in-first-sentence-never-promise.md": {
      "disposition": "keep",
      "reason": "Paired measurement with its floor and its unmeasured residue stated. Pinned to commit 962c2a1b. Not reopened, and verified_on left as is."
    },
    "applications/node--bant-lite-scoring.md": {
      "disposition": "keep",
      "reason": "A reading witness pinned to 2893314. Its numbers match the technique, and it records its own duplicate-colour-map deviation. Not reopened."
    },
    "applications/node--delivery-fails-closed-cap-consent.md": {
      "disposition": "keep",
      "reason": "A reading witness pinned to 2893314. The 'four conjuncts' quote of decideDraft is correct at that commit, though the later risks application adds an inbound conjunct. The consent-outage-versus-missing deviation is recorded. Not reopened."
    },
    "applications/node--first-reply-promises-channel-not-minutes.md": {
      "disposition": "reverify",
      "reason": "Paired measurement sound as of 7bbd1cab. It says the change sits on a branch, not yet on the default branch, and that the default branch's pre-push gate was red. Whether the change landed needs a look at the consumer tree, which was not reopened."
    },
    "applications/node--five-minute-sla-settled-outcomes-only.md": {
      "disposition": "keep",
      "reason": "A reading witness pinned to 2893314. Its WARNING_RATIO 0.35 matches the technique's 'roughly a third by convention'. It records the unlabelled 5-minute constant and the missing queue rate as deviations. Not reopened."
    },
    "applications/node--risks-gate-not-confidence.md": {
      "disposition": "keep",
      "reason": "Paired adversarial proof with stated limits and known false holds. Pinned to 42c1f54f. Not reopened."
    }
  }
}
```
