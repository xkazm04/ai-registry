---
layer: application
type: application
subject: organizational-grant-readiness
technique: registry-grounded-autofill
stack: node
status: forged
---

# Node: registry-grounded autofill in Wellspring's onboarding

Wellspring (a Next.js/TypeScript grant-writing platform for nonprofits,
repo `grant-writing-nonprofits`) implements the full autofill pipeline in
`src/features/org-autofill/`, turning its longest form — 10 fields, several
requiring the director to dig up a tax filing — into a review task. The
design doc (`docs/onboarding-autofill-design.md:11-30`) maps each field to
the document a human would otherwise hunt for (revenue → the latest Form
990's line 12, year incorporated → articles of incorporation) and names the
ICP this saves: a $100K–$1M nonprofit run by one overworked director who
abandons at exactly these fields.

## The contract: provenance per field, needs-input as data

`types.ts:21-26` defines `AutofillField<T>` as `{value: T | null,
confidence: "high"|"medium"|"low", source?: string}` — the per-field
provenance the technique demands, with `value: null` as the honest
not-found. `types.ts:103-110` declares `REQUIRED_FIELDS` (`name`, `country`,
`entityType`, `hqCity`, `hqState`, `revenueUsd`) as a const list, and the
parser computes the review list mechanically from it
(`parse.ts:180-184`):

```ts
result.needsInput = REQUIRED_FIELDS.filter((k) => {
  const f = result[k] as AutofillField<unknown>;
  return f.value === null || f.confidence === "low";
});
```

Low-confidence is treated as missing — a weak guess is routed to the
"please confirm" UI, never pre-filled as solid.

## Client-side classification by shape and checksum

`detect.ts:17-59` classifies the single input purely, with no I/O: a
dotted host with no spaces is a `website` (its ccTLD seeds the market —
`.cz`→cz, `.uk`→gb); an all-digit string is tested as a Czech IČO via its
real checksum (`isValidIco`), as a UK charity number (6–8 digits under a
`gb` hint), or as a 9-digit US EIN; everything else falls through to
`name`. The comment at `detect.ts:4-6` states the authority model: "The
model re-derives and may override — this only biases the first guess."

## Market guidance composed from the jurisdiction registry

`prompt.ts:24-49` builds the per-market lookup block *from data*:
identifiers, valid entity-type codes and verification registries come from
`getJurisdictionProfile()`, so adding a market extends autofill with no
prompt rewrite. Only the "where to actually look" line is a small
hand-kept map (`prompt.ts:15-19`): US → the org's latest Form 990 via
ProPublica Nonprofit Explorer plus the IRS Business Master File; CZ → the
ARES registry; GB → the Charity Commission register — authoritative
registry over aggregator, per the technique's sourcing rule.

## The anti-fabrication contract, verbatim

The output contract (`prompt.ts:51-77`) demands one strict JSON object with
`{value, confidence, source}` per field, a `notes` array for caveats
(currency and filing year of converted revenue), and a `sources` array —
non-empty sources being the repo's proxy for "web search actually grounded
this" (`types.ts:93-95`). Its hard rule: "NEVER fabricate an EIN, IČO,
charity number, or revenue. If you cannot verify it from a source, set
value to null, confidence low, and explain in notes."

Uniqueness branches the prompt: a website or registry number triggers a
direct-fetch instruction with an empty candidates array
(`prompt.ts:100-107`), while `lite: true` (`types.ts:51-55`,
`prompt.ts:112-114`) is the declared fast mode — identity, location and
mission keywords only, with the deep-fetch fields (revenue, year, voiced
mission statement) explicitly nulled rather than slowly guessed.

## Defensive receipt

`parse.ts` coerces every field through typed validators; revenue flows
through `parseRevenueUsd` (`org-profile/validation.ts:43-54`), which parses
human notation — "$620,000", "620k", "$1.2M" — and returns null on
anything unparseable, so a mangled number can never masquerade as a filed
figure. The same human-notation parser serves the manual-entry path,
keeping hand-typed and autofilled revenue on one normalization.
