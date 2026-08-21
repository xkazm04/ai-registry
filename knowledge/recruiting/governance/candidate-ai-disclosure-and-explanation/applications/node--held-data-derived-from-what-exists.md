---
layer: application
type: application
subject: candidate-ai-disclosure-and-explanation
technique: held-data-derived-from-what-exists
stack: node
status: forged
verified_on: 2026-08-20
---

# "What we hold about you", computed from the entry

`app/_lib/data-held.ts` exists because a hardcoded list shipped first. Its doc
comment names the bug it replaced — "the old hardcoded five-item list
(bug-ui-scan-2026-07-09 privacy-consent-provenance #5)" — and the harm: "so a
candidate who only applied is never falsely told we hold their 'interview
records and notes' or 'assessment scores' on a transparency surface."

`heldDataCategories(s: HeldSignals)` (`data-held.ts:20-27`) takes three presence
booleans and returns an ordered list:

```
const out: string[] = ["cv"];
if (s.hasContact) out.push("contact");
out.push("answers");
if (s.hasInterview) out.push("interview");
if (s.hasScore) out.push("scores");
```

The unconditional entries are justified rather than assumed — "`cv` + `answers`
are inherent to having applied" — and the conditional ones are "listed only when
captured". Order is fixed "so the rendered list never reshuffles", which matters
on a surface a person may screenshot and compare across visits.

The signals are read off the live record at request time in
`app/api/data/[token]/route.ts:24-28`: `entry.contact != null`,
`interviewStatusByEntries([entry.id])[entry.id] != null`, `entry.matchScore != null`.
Nothing is configured; every category is a question asked of this entry.

The module is deliberately pure and dependency-free — "so the colocated
`node --test` loads it without dragging in better-sqlite3" — which is what makes
the honesty rule unit-testable rather than route-local, the same discipline the
decision-redaction module uses.

## The projection around it

The route's header states the wider boundary: "it returns a candidate-safe
projection only — role/company/applied-date + consent expiry — never the internal
entry id, name, score, archetype or reasoning" (`route.ts:9-13`). The response
body is exactly `jobTitle`, `company`, `appliedAt`, `consentExpiresAt`,
`anonymized`, `held`. Access is by an opaque erasure capability token
(`ensureErasureToken`) carried by the "manage your data" footer on every
candidate communication — so the surface reaches the person without an account,
which is what makes it usable by the candidates most likely to need it.

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
row the TOKEN resolved to — never a session: this is a public capability-link
route and has none." The residual deviation is that the handler still returns
`{ erased: true }` unconditionally rather than from a confirmed row count; the
standard asks for the confirmation to be derived from the effect, so that the
next predicate that silently matches nothing cannot again be reported as success.
