---
layer: application
type: application
subject: candidate-consent-and-retention
technique: retention-ttl-and-derived-disclosure
stack: node
status: forged
verified_on: 2026-08-20
---

# Deriving the disclosed retention ceiling from the enforced TTL (Node/Next.js)

## The shape

`app/_lib/consent.ts` is a pure, dependency-free module — deliberately, so its
colocated `node --test` suite loads without pulling in `better-sqlite3`. It is
the single place both the enforcement number and the disclosed number come
from. Everything below is in that one file, which is the point.

## The window, and its rationale next to the constant

`consentTtlDays()` (`app/_lib/consent.ts:14-17`) reads `KP_CONSENT_TTL_DAYS`,
validates it to whole days in `1..3650`, and falls back to `365`.

The comment above it does the work the number cannot: it records that 12 months
is the *market* default for this region's recruitment tooling, and — more
importantly — that this is "a GLOBAL default, blind to jurisdiction and source",
so a deployment SHOULD set it for its own legal basis. That is exactly the
floor-shaped contract the technique asks for: a conservative shipped default,
per-deployment override, and the reason written where the next engineer to
change the value will read it.

The per-call `ttlDays` argument on `consentExpiresAt` (`:47-49`) is the seam
left open for a future per-jurisdiction / per-source policy — the defence-tail
versus pool-freshness split, not yet implemented but structurally anticipated.

`CONSENT_TTL_DAYS` (`:18`) freezes the value at module load; `consentTtlDays()`
re-reads the env at call time. Both exist on purpose, and the disclosure path
uses the *live* one.

## The disclosure, derived and rounded up

```ts
export function consentRetentionMonths(ttl: number = consentTtlDays()): number {
  return Math.max(1, Math.ceil((ttl * 12) / 365));
}
```

`app/_lib/consent.ts:28-30`. Three properties, each deliberate:

- **Derived, not typed.** The comment cites the incident that produced it
  (`REC-08` / `capst-l1-005`): the candidate-facing copy hardcoded "12 months"
  while `KP_CONSENT_TTL_DAYS` was tunable, so an operator retuning the window
  silently falsified the legal-basis text. Two independently maintained numbers
  diverged, exactly as the technique predicts.
- **`Math.ceil`, never `round`.** 365 days → 12 months, 180 → 6, 400 → 14. The
  comment states the rule as a direction rather than a formula: "the disclosed
  ceiling must never be shorter than the enforced window (under-disclosure is
  the worse direction)". A `round` would be more accurate on average and wrong
  in the only direction that matters.
- **Reads the env at call time**, unlike the frozen constant, so tests and the
  `/api/compliance` surface always reflect the live knob rather than whatever
  the process booted with.

## The pre-expiry state is a real state

`CONSENT_EXPIRING_DAYS = 30` (`:33`) and the `"expiring"` branch of
`consentStatus` (`:52-63`) give the notice window its own status value, feeding
the pre-expiry reminder and the drawer's amber chip. `ConsentStatus` is
`none | active | expiring | expired | anonymized` — five states, with
`anonymized` terminal and checked first, and `none` (no `givenAt` at all)
distinct from `expired`. That distinction is what lets a recruiter-sourced
entry, held on a different basis, stay contactable while a lapsed one does not.

Note the legacy accommodation at `:57`: a consent granted with no expiry reads
as `active`, and an unparseable expiry timestamp also reads `active` — a
deviation from the standard, which would resolve an unreadable expiry toward
withholding. The gate is correct for every row the current writer produces; the
weak spot is the legacy row.

## Contents disclosed from the record, not the schema

`app/_lib/data-held.ts` projects the "what we hold about you" list from
presence signals rather than a template:

```ts
export function heldDataCategories(s: HeldSignals): string[] {
  const out: string[] = ["cv"];
  if (s.hasContact) out.push("contact");
  out.push("answers");
  if (s.hasInterview) out.push("interview");
  if (s.hasScore) out.push("scores");
  return out;
}
```

The comment names the finding it replaced (`bug-ui-scan-2026-07-09
privacy-consent-provenance #5`): the old hardcoded five-item list told a
candidate who had only applied that the system held their "interview records
and notes" and "assessment scores". A fabricated claim about a named person, on
the one surface whose entire job is to be trustworthy.

The caller wires the signals from the entry itself —
`app/api/data/[token]/route.ts:23-27` derives `hasInterview` from
`interviewStatusByEntries([entry.id])`, `hasScore` from `entry.matchScore`,
`hasContact` from `entry.contact` — so the list cannot outrun the record. Order
is fixed so the rendered list never reshuffles between visits, which matters
for a page a candidate may screenshot.

## What the same route deliberately does not disclose

`app/api/data/[token]/route.ts:9-13` documents the projection as
candidate-safe: role, company, applied date, consent expiry, anonymised flag,
held-data list — and "never the internal entry id, name, score, archetype or
reasoning". The token itself is an opaque capability
(`pipeline_entries.erasure_token`, minted by `ensureErasureToken`, declared at
`app/_lib/db/core.ts:920-925` as "Opaque CSPRNG like lead_token — NEVER the raw
entry id"), so the URL a candidate holds leaks nothing about the record.
