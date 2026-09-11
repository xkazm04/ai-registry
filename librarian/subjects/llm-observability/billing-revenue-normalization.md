---
domain: llm-observability
subject: billing-revenue-normalization
last_touched: 2026-09-11
touched_by: architecture-review
dry_streak: 0
---

# billing-revenue-normalization

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "llm-observability/billing-revenue-normalization",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:d598e936e7f82f8d",
  "disposition": "reverify",
  "coverage": "All 10 owned documents read and assessed in table order. 3 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "A corrected invoice snapshot arrives first and an old snapshot arrives last; unconditional upsert restores the old amount.",
    "A missing-rate amount of 100 units stored as 100 USD is dimensionally wrong even when a caveat is displayed.",
    "A new debit-reversal kind defaulted to one-time revenue changes both sign and recognition.",
    "A cumulative refund updated in a later month overwrites the timing of an earlier partial refund."
  ],
  "sources": [
    {
      "path": "knowledge/llm-observability/economics-and-governance/billing-revenue-normalization",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://docs.stripe.com/webhooks",
      "scope": "Official snapshot, unordered delivery, duplicate handling and fresh retry signature semantics checked; no webhook executed."
    },
    {
      "url": "https://docs.stripe.com/currencies",
      "scope": "Official provider-specific currency and payout/charge exceptions checked; no payment reconciliation performed."
    },
    {
      "url": "https://github.com/standard-webhooks/standard-webhooks/blob/main/spec/standard-webhooks.md",
      "scope": "Primary specification confirms signed message identity and symmetric/asymmetric variants; broad market and accounting claims not refreshed."
    }
  ],
  "documents": {
    "billing-revenue-normalization.md": {
      "disposition": "reverify",
      "reason": "Stable identity does not eliminate reconciliation, ensure ordering or prevent revaluation on replay. Delivery/event/object identities differ; multiple refunds and lines need their own grain. Authentic tracked events can still fail schema, authorization or persistence. Original amounts and conversion provenance must be retained; operational normalization does not establish formal recognition."
    },
    "techniques/deterministic-external-ids.md": {
      "disposition": "reverify",
      "reason": "Provider alone may not namespace connected accounts, tenants and test/live environments. Charge-keyed cumulative refunds lose individual refund periods; distinguish immutable refund facts from current charge snapshots. Random internal ids plus unique external keys are valid. Natural keys can collide, and identity stability does not imply stable content."
    },
    "techniques/idempotent-revenue-upsert.md": {
      "disposition": "clarify",
      "reason": "Repaired last-arrival-wins under unordered snapshots, idempotent effects versus object updates, version checks, durable inbox recovery and finite provider retry assumptions."
    },
    "techniques/minor-unit-currency-handling.md": {
      "disposition": "reverify",
      "reason": "Minor unit is an accounting representation, not necessarily smallest circulating coin. Provider field/operation/version may differ from ISO; zero/two/three are not an exhaustive currency universe. Reject unknown semantics instead of defaulting; exact decimal/integer storage and rounding policy matter. One example per class cannot pin every mapping forever."
    },
    "techniques/revenue-kind-taxonomy.md": {
      "disposition": "clarify",
      "reason": "Repaired unknown kinds becoming positive immediate revenue, missing periods, mixed invoice lines, cumulative refunds and signed amounts doctrine. Operational allocation is explicitly separate from formal recognition."
    },
    "techniques/signature-is-the-auth.md": {
      "disposition": "reverify",
      "reason": "Authentication must also bind expected account/environment/endpoint and validate schema/authorization after signature. Malformed authentic tracked events can fail. Header encoding and signed components are scheme-specific; subtraction/abs can overflow on hostile timestamps. Rotation follows actual provider signing behavior, not assumed old-signature retry horizons; message signatures can complement other transport auth."
    },
    "techniques/static-auditable-fx-book.md": {
      "disposition": "clarify",
      "reason": "Repaired missing rates as null base amounts, persisted conversion state/book identity, replay stability, dated policies and reproducible corrections. A static process singleton does not preserve historical provenance across deployment changes."
    },
    "applications/process--signature-is-the-auth.md": {
      "disposition": "reverify",
      "reason": "Dated survey retained. Standard Webhooks supports signed identity and symmetric/asymmetric variants; Stripe issues fresh timestamp/signature per retry, narrowing old-key rotation rationale. Acquisition claims, universal 24-48-hour practice, short-lived-key adoption and formal revenue-recognition equivalence were not refreshed and remain reverify."
    },
    "applications/rust--signature-is-the-auth.md": {
      "disposition": "reverify",
      "reason": "Historical code/version/date retained, not rerun. Malformed JSON and normalization can reject authentic events; missing future-boundary, timestamp-overflow, multiple-signature and rotation cases preclude every-property claim. Raw-body MAC checks are appropriate but do not establish account-scoped ledger authorization."
    },
    "applications/rust--static-auditable-fx-book.md": {
      "disposition": "reverify",
      "reason": "Historical code/version/date retained, not rerun. 1:1 unknown currency is not USD; current-book convertibility can relabel an old unconverted record after restart. Rates must be finite, and provider-specific amount semantics may differ from the displayed ISO lists. Per-row original amount/rate/version persistence is not shown, so every-claim-confirmed is unsupported."
    }
  }
}
```

## 2026-09-10 — architecture re-review after the compression revert

Second review on this date, against the reverted bytes (HEAD `44c8996`). All 10
owned documents read in full: the golden path, six techniques, three
applications. The Standard Webhooks specification was resolved to its normative
text, and three cited seams were opened in the local tracklight tree.

**Retraction.** The earlier 2026-09-10 record's dispositions are retracted as an
outstanding work list and retained above as history; its repairs were part of the
pass reverted the same day.

**The finding that would justify a content change: the spec does not recommend
300 seconds.** Two documents attribute a numeric replay tolerance to the
Standard Webhooks specification. `signature-is-the-auth` says "Five minutes is
the widely used default (and the tolerance the emerging cross-provider webhook
specification recommends)". `process--signature-is-the-auth` says the spec has
"a recommended replay tolerance of **300 seconds**". Read at
`spec/standard-webhooks.md`, the specification's only sentence on the subject is
"Make sure to verify the `webhook-timestamp` header has a timestamp that is
within some allowable tolerance of the current timestamp to prevent replay
attacks" — it prescribes no value. The only five-minute figure in the document
is an example TTL for the idempotency seen-set ("e.g. save the IDs in redis for
5 minutes"), which is a different mechanism serving a different purpose. The
five-minute default is genuinely widespread — Stripe documents it and the
tracklight adapter hard-codes `TOLERANCE_SECS = 300` — so the *guidance* is
sound; the attribution is not. Two sentences to fix: keep the default, drop the
claim that the spec recommends it, and say where it actually comes from.

That correction matters more than its size because both documents already teach
the reader to be precise about exactly this kind of claim — the technique's own
"be honest about what the tolerance is" paragraph is an argument against
over-claiming a bound. Borrowing a number from reference implementations and
crediting it to a specification is the same species of error one paragraph
later.

**Everything else the spec was asked, it confirmed.** The signed content is
`msg_id.timestamp.payload`; the three headers are `webhook-id`,
`webhook-timestamp`, `webhook-signature`; an asymmetric `v1a` ed25519 variant
exists with `whsk_`/`whpk_` key prefixes; and the spec does recommend using
`webhook-id` as an idempotency key. So the sharpening the application claims to
have absorbed — that binding the delivery id into the MAC stops a replayer
re-labelling a captured payload — is correct at the source.

**Tree checks.** `crates/billing/src/stripe.rs` carries `TOLERANCE_SECS = 300`,
the two-sided `.abs()` comparison, the MAC over `t` + `.` + raw body, and
`verify_slice` for the constant-time compare. `config/fx_rates.json` carries the
`_meta` note verbatim as the application quotes it — the convention sentence
("Each rate is the USD value of ONE unit of the currency"), the explicit "NOT a
live feed — margins are as fresh as this file", `last_verified: 2026-07-13`, and
the ECB and IMF source URLs — with the minor-unit boundary stated inside the
book ("decimals … are handled in code, NOT here"). `crates/billing/src/fx.rs`
carries `UsdAmount { amount_usd, converted }` and the shared-instance rationale.
One observation about the tree rather than the corpus: `last_verified` is
2026-07-13, roughly two months old against a technique that calls monthly the
typical cadence — which is the technique working exactly as designed, since the
staleness is legible from the artifact without asking anyone.

**Not evaluated.** No webhook was delivered, no signature verified in execution,
no test run. The Stripe, PayPal, Metronome/Orb/Lago and JWKS-rotation claims in
the dated survey were not re-resolved, nor were the 2026 acquisition claims
(Stripe/Metronome, Adyen/Orb, Salesforce/m3ter); the survey carries
`refresh_by: 2026-11-20`. The ISO 4217 zero-decimal and three-decimal lists were
not checked against the standard's published table, which is what the technique
itself instructs a reader to do.

**Frontmatter note, not a content finding.** Both rust applications
(`rust--signature-is-the-auth`, `rust--static-auditable-fx-book`) carry no
`status:` key where the process application does.

<!-- architecture-review:v1 -->
```json
{
  "subject": "llm-observability/billing-revenue-normalization",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:ded209380899dd06",
  "disposition": "clarify",
  "coverage": "All 10 owned documents read in full against the reverted bytes. The Standard Webhooks specification resolved to its normative text and searched for every duration it names. Three cited seams opened in the local tracklight tree (the Stripe adapter, the FX book artifact, the FX table). Not evaluated: any webhook delivery, signature verification in execution, or test run; the provider and platform claims in the dated survey; the ISO 4217 decimal-exponent lists.",
  "counterexamples": [
    "A provider that redelivers an object at an older version than one already stored — the upsert's last-write-wins arm regresses the row, and the technique explicitly defers timestamp-comparison cleverness until out-of-order versions have been measured, which means the first occurrence is silent.",
    "A currency the provider flattens to a two-decimal convention against ISO 4217's zero-decimal classification: the technique names the hazard and tells the reader to prefer the provider's semantics, but a ledger ingesting from two providers that disagree about the same code has no rule at all.",
    "A refunded subscription: this subject correctly makes the refund its own namespaced record rather than a mutation, which is what leaves the neighbouring margin subject's recognition function amortizing the cancelled charge into future windows. The seam between the two subjects is where the case falls."
  ],
  "sources": [
    {
      "url": "https://raw.githubusercontent.com/standard-webhooks/standard-webhooks/main/spec/standard-webhooks.md",
      "result": "Read (not executed). Confirms the signed content msg_id.timestamp.payload, the webhook-id / webhook-timestamp / webhook-signature headers, the v1a ed25519 asymmetric variant with whsk_/whpk_ prefixes, and the recommendation to use webhook-id as an idempotency key. Establishes the correction: the spec prescribes no tolerance value, saying only 'within some allowable tolerance'; its single 5-minute figure is an example TTL for the idempotency seen-set, not a replay bound."
    },
    {
      "path": "C:/Users/kazda/kiro/tracklight",
      "result": "Read at d398835. Confirms TOLERANCE_SECS = 300 with a two-sided abs() comparison, the MAC over t + '.' + raw body, and verify_slice as the constant-time compare in crates/billing/src/stripe.rs; and the _meta convention note, 'NOT a live feed' sentence, last_verified 2026-07-13 and ECB/IMF sources in config/fx_rates.json, with UsdAmount{amount_usd, converted} and the shared-instance rationale in fx.rs. Nothing was built or executed."
    }
  ],
  "documents": {
    "billing-revenue-normalization.md": {"disposition": "keep", "reason": "The four-stage framing, the delivery-is-not-the-event distinction, the unordered-by-contract rule and the authenticity-is-not-relevance decision table are all corroborated by the specification and by the adapter. The three money mistakes and the persist-atomically-acknowledge-after ordering are stated with the asymmetry that settles them."},
    "techniques/deterministic-external-ids.md": {"disposition": "keep", "reason": "Derived-not-generated with its five construction rules — key on the business object, prefix the provider, namespace derived records, keep the raw id in its own column, freeze the function — is complete and each rule names the failure it prevents. The scope limit at the end (records that are not shadows of an external fact) keeps it from over-reaching."},
    "techniques/idempotent-revenue-upsert.md": {"disposition": "keep", "reason": "Upsert-not-insert-if-absent is argued from the provider's corrections rather than only from redelivery, the acknowledgement asymmetry is stated in the right direction, and the high-volume variant (durably persist the raw delivery, acknowledge on that commit) restates the invariant correctly rather than weakening it. The last-write-wins rule is knowingly conditional."},
    "techniques/minor-unit-currency-handling.md": {"disposition": "keep", "reason": "Both directions of the bug are named (understating by 100x, overstating by 10x), the three classes are given with a per-currency lookup shape, and the sharp edge — some providers flatten a zero-decimal currency against the standard, so the provider's semantics govern ingest — is the detail that makes this usable. Its own instruction to take the lists from the published table rather than from memory was not exercised this run."},
    "techniques/revenue-kind-taxonomy.md": {"disposition": "keep", "reason": "Magnitude-plus-kind versus scattered negatives is argued from the concrete downstream consequences, the classification rules infer structure rather than event names, and the closed-and-small test ('would the margin surface compute a different number?') is operational. The refund-is-its-own-record rule is right here and is where the neighbouring recognition gap originates."},
    "techniques/signature-is-the-auth.md": {"disposition": "clarify", "reason": "Every mechanism claim was confirmed against the specification this run — the signed content shape, the headers, the asymmetric variant, the delivery-id binding, and the honest reading that the timestamp is a staleness bound rather than replay prevention. One attribution repair: the spec does not recommend five minutes or any other tolerance; that default comes from provider documentation and reference implementations, and the parenthetical crediting it to the specification should say so."},
    "techniques/static-auditable-fx-book.md": {"disposition": "keep", "reason": "Rejecting the live feed on determinism-and-audit grounds rather than cost, the book's six contract clauses, the missing-rate three-way decision, and the degraded-and-disclosed startup fallback are all confirmed as realized in the tree. The closing boundary is unusually good: it concedes that statutory reporting needs transaction-date rates and scopes this technique to management reporting instead of defending the snapshot everywhere."},
    "applications/process--signature-is-the-auth.md": {"disposition": "clarify", "reason": "The specification's shape, the delivery-id binding, the v1a asymmetric variant and the dedup recommendation were all confirmed at the source this run. One attribution repair, the same one as the technique: the spec recommends no numeric tolerance, so 'a recommended replay tolerance of 300 seconds' should be credited to Stripe and the reference implementations instead. The provider, platform-acquisition and JWKS claims were not re-resolved; refresh_by 2026-11-20 governs them."},
    "applications/rust--signature-is-the-auth.md": {"disposition": "keep", "reason": "The four load-bearing properties were opened this run and match: the 300-second two-sided bound, the MAC over timestamp-dot-raw-body, verify_slice for constant time, and parsing only after verification. The upward lesson it records — clock as parameter, header as closure — is what makes each security property a deterministic unit test, and it is visible in the trait signature. Carries no status frontmatter key."},
    "applications/rust--static-auditable-fx-book.md": {"disposition": "keep", "reason": "The artifact was opened and carries the _meta convention sentence, the not-a-live-feed statement, last_verified and the ECB/IMF sources exactly as quoted, with the minor-unit boundary declared inside the book. The two upward lessons (put the convention inside the artifact; drop non-positive rates at load) are both realized. Carries no status frontmatter key."}
  }
}
```

## Intake - 2026-09-11 - polar-api-versioning

New technique `contract-version-is-provenance`, plus three applications
(`node--`, `rust--`). The subject was thorough from stage two of its own stated
pipeline onward - authenticate, identify, normalize, persist - and never asked
under which **contract version** a payload was serialized. Its closing auditor
enumeration is the tell: "answered entirely from the records themselves", listing
provider, business object, currency, magnitude, kind, and the rate-book version -
a completeness claim that omits the one version the operator does not control.
The golden path was extended additively rather than rewritten; the existing
clauses stay true.

The finding was promoted by a tree, not by the source. A fleet consumer's revenue
row carries `fx_book_version` and no contract-version field - provenance
discipline applied thoroughly and stopping exactly at the authorship boundary.
That is the subject's own asymmetry standing in code.

## Open leads

- The rust application's verdict is `unmeasurable`, not for lack of a change but
  for lack of an instrument: the crate's normalization tests assert against
  fixtures with no version in them. Return condition: a provider rotation
  produces a second-contract delivery anywhere in the fleet, giving the fixture
  pair the arm needs.
- Nothing in the corpus yet models *asserting* a received contract version
  against the configured one. The failure action is a real policy fork - warn, or
  refuse to process money - and the two have very different blast radii. Worth a
  technique once a second source or a second tree has an opinion.
