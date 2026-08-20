---
layer: technique
type: technique
subject: rejection-with-dignity
technique: protected-attribute-line-suppression
status: forged
laws: [say-only-what-the-record-holds, uncertainty-resolves-toward-the-candidate]
shared_with: []
use_when: [filtering outbound rejection prose, reviewing free-text reason fields before they are quoted, localising decline copy into a new language]
---

# Protected-attribute line suppression

The last thing that happens to a decline before it is dispatched is a pass over
every outbound line that deletes — **whole** — any line referring to a
protected characteristic. Age, gender, ethnicity or national origin, family and
parental status, disability or health, religion, sexual orientation, union or
political activity, and the near-proxies that stand in for them.

The material this catches is rarely hostile. It is ordinary recruiter shorthand
that becomes indefensible the moment it leaves the building: *recent graduate*,
*overqualified for a young team*, *long gap in employment*, *not the right
cultural background*, *may find the travel difficult with a young family*.
Every one of these, in a letter from the party that just made an adverse
decision, is a documented adverse statement touching a protected class.

## Delete the line, never the word

Redaction at word granularity is the tempting implementation and it is wrong. A
sentence with the word "age" removed is still a sentence about someone's age;
the surrounding clause carries the meaning, and now the visible gap also reads
as concealment. The unit of suppression is the **line** — the whole bullet, the
whole sentence — because that is the smallest unit whose removal leaves no
residue of the claim.

Corollary: feedback must be structured as discrete lines, not as one flowing
paragraph. A filter over a single paragraph has only two moves, keep or delete
everything, and both are bad. Line-structured output is what makes surgical
suppression possible at all.

## The cost asymmetry sets the threshold

This filter is deliberately over-eager, and the justification is arithmetic:

- A **false positive** drops one feedback bullet. The candidate never sees it,
  never knows it existed, and loses at most a piece of advice. Cost: one
  bullet.
- A **false negative** ships a written statement about a protected
  characteristic, attached to an adverse decision, over the organisation's
  name. Cost: a discrimination claim in which your own letter is the exhibit.

No tuning exercise balances those. Where the match is uncertain, suppress —
this is [uncertainty-resolves-toward-the-candidate](../../_laws.md#uncertainty-resolves-toward-the-candidate)
applied to prose: the ambiguous case fails closed, away from the adverse
statement.

## Multilingual by construction

A deny-list in one language protects one language. If you send in five, the
patterns exist in five, maintained together and tested together — because the
localisation of a letter is exactly where an untranslated filter silently stops
working while continuing to report success. Two properties matter beyond
translation:

- **Morphology.** Inflected languages carry the sensitive term in a dozen
  surface forms; match on stems or enumerate the forms, and accept the extra
  false positives (see the asymmetry above).
- **Idiom, not dictionary.** The dangerous phrases are colloquial — the local
  idiom for "too old for the team" rarely contains the word for old. Patterns
  are collected from real recruiter free text in each language, not translated
  from the base list.

## The procedure

1. Run over **every** outbound line: model-generated feedback, quoted human
   free text, and template-filled reason strings alike. Human-written reason
   fields are the highest-yield source; exempting them because a person wrote
   them inverts the risk.
2. Run **last**, immediately before dispatch, after all composition, so nothing
   downstream can reintroduce text.
3. Delete matched lines entirely; keep the remaining lines in order.
4. If suppression empties the feedback section, send with no feedback. Empty is
   a valid output and is never backfilled.
5. Record on the message's audit detail **that the filter fired**, and how many
   lines it removed — not the removed text, which would defeat the point. Show
   the same fact to the recruiter, not only to the auditor: a recorded gap that
   silently disappears from a letter reads as a bug, and the person who wrote
   the gap is the person best placed to rewrite it in sayable terms.
6. When suppression removes **every** line, collapse to the honest no-reason
   state rather than shipping a reason section that is labelled as sourced and
   contains nothing. A state label that no longer describes its payload is a
   lie in the audit trail, which is the one place that cannot afford one.
7. Keep the unfiltered assessment in the internal record. The filter governs
   what is said to the candidate, not what the organisation knows.

## Decision rules

- Apply to prose only. Structured decision data, protected-class analytics and
  adverse-impact monitoring need the real attributes and are governed by the
  fairness and governance material — this filter must never be pointed at them.
- Never let a suppressed line be replaced by a generated substitute; the reason
  for suppression does not disappear when the wording changes.
- When a *stored reason* rather than a feedback line matches, do not merely
  suppress the sentence — the decision itself needs review, and the letter
  falls back to the neutral comparative outcome.
- Version the patterns and test them. A filter with no test suite is an
  assertion that it works, and this one fails silently by construction.

## When not to use this

- **As the primary defence.** Suppression is the last line. Reasons should
  never be recorded in these terms; that hygiene belongs upstream, in how
  reason vocabularies are closed and how screening rules avoid proxies. A
  filter that is doing constant work is reporting an upstream defect.
- **On the audit trail, the debrief record, or discovery material.** Those need
  the truth as recorded, including what was said internally.
- **As a substitute for register review.** The filter catches attribute
  references, not condescension, false warmth, or misgendering — those are
  caught by the acknowledgement and register rules, not here.
