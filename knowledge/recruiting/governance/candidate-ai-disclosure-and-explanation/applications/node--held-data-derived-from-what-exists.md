---
layer: application
type: application
subject: candidate-ai-disclosure-and-explanation
technique: held-data-derived-from-what-exists
stack: node
status: forged
verified_on: 2026-09-26
verified_against: node@24
---

# "What we hold about you", computed from the entry

`app/_lib/data-held.ts` exists because a hardcoded list shipped first. Its doc
comment names the bug it replaced, "the old hardcoded five-item list
(bug-ui-scan-2026-07-09 privacy-consent-provenance #5)", and the harm: "so a
candidate who only applied is never falsely told we hold their 'interview
records and notes' or 'assessment scores' on a transparency surface."

`heldDataCategories(s: HeldSignals)` takes four presence booleans and returns an
ordered list:

```
const out: string[] = ["cv"];
if (s.hasContact) out.push("contact");
out.push("answers");
if (s.hasInterview) out.push("interview");
if (s.hasScore) out.push("scores");
if (s.hasFeedbackLetter) out.push("feedbackLetter");
```

The unconditional entries are justified rather than assumed: "`cv` + `answers`
are inherent to having applied". The conditional ones are "listed only when
captured". The fourth signal arrived after 2026-08-20 and shows the technique's
point about new stored data. A feedback letter the candidate requested is its own
category, because "the letter is a document about them that exists only because
they did". Order is fixed "so the rendered list never reshuffles", which matters
on a surface a person may screenshot and compare across visits.

The signals are read off the live record at request time in
`app/api/data/[token]/route.ts`. Nothing is configured; every category is a
question asked of this entry.

## The render side refuses to fill a gap

`renderableHeldCategories(held, labelled)` is the 2026-09 addition, and it closes
the same over-claim from the other end. The page used to fall back to
`Object.keys(labels)` when the response carried no `held` array, which re-armed
the five-item list on the one surface where it is a transparency failure. The
comment states the rule: "A missing field is not evidence that we hold
everything; it is no evidence at all, so the honest render is NOTHING." Anything
the page cannot label is dropped, and a repeated key collapses.

Both functions are pure and dependency-free, so the colocated `node --test`
loads them without the database. That makes the honesty rule unit-testable
rather than route-local.

## The projection around it

The route returns a candidate-safe projection only: role, company, applied date,
consent expiry, `anonymized` and `held`. It never returns the internal entry id,
name, score, archetype or reasoning. Access is by an opaque erasure capability
token carried by the "manage your data" footer on every candidate communication.
So the surface reaches the person without an account, which makes it usable by
the candidates most likely to need it.

## The erasure confirmation, and why effect beats completion

The `POST` handler on the same route is the erasure path, and its comment records
the incident that produced this technique's sixth procedural step:

> "`anonymizeEntry` scrubs under `WHERE id = ? AND workspace_id = ?`, so the bare
> call matched NO row for any candidate outside the default workspace — the scrub
> silently did nothing while this endpoint still answered `{ erased: true }`. A
> candidate exercised their Art. 17 right to erasure, was told it was done, and
> their name, contact, CV profile, saved analyses and interview transcript stayed
> fully readable on the recruiter's board."

The fix is the right one and it is stated as a rule: "The workspace comes off the
row the TOKEN resolved to — never a session".

**Deviation, unchanged since 2026-08-20.** The handler still discards
`anonymizeEntry`'s return value, which is the scrubbed entry or `null` when no
row matched, and answers `{ erased: true }` unconditionally. The effect is
available on the line above the confirmation and is not consulted. The next
predicate that silently matches nothing would again be reported to the person as
success.
