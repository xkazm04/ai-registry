---
domain: grant-funding
subject: organizational-grant-readiness
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# organizational-grant-readiness

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/organizational-grant-readiness",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:97e1912a944a8ddb",
  "disposition": "reverify",
  "coverage": "All 9 owned documents read and assessed in table order. 3 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "A parent and several legal subsidiaries share one domain; direct lookup cannot choose the applicant automatically.",
    "A truncated search returns one namesake while the intended entity is absent.",
    "A stale selected tenant silently falls back to a different authorized client and saves its financial data there.",
    "Verification for identifier A finishes after a save changes the profile to B; write-time reset alone cannot prevent the late result restoring a badge."
  ],
  "sources": [
    {
      "path": "knowledge/grant-funding/grant-operations/organizational-grant-readiness",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html",
      "scope": "Official guidance supports layered type validation and decompressed-size limits; no upload exploit run."
    },
    {
      "url": "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html",
      "scope": "Official guidance supports default denial and permission validation on each request; no consumer authorization test run."
    }
  ],
  "documents": {
    "organizational-grant-readiness.md": {
      "disposition": "reverify",
      "reason": "One registry per jurisdiction, universally disqualifying wrong fields, sole mission voice source and sponsor identifier rules are overgeneralized. Multiple registries and approved organizational materials can be valid; sponsorship depends on applicant structure and call. Readiness is call-relative, not every future questionnaire. Website and identifier shapes do not establish unique identity."
    },
    "techniques/applicant-evidence-corpus.md": {
      "disposition": "clarify",
      "reason": "Repaired ingestion versus storage risks, content verification, total decompression limits, uncertain source retention and profile conflicts. Delimited plain text remains untrusted and sensitive."
    },
    "techniques/attestation-invalidation.md": {
      "disposition": "reverify",
      "reason": "Input-change invalidation is useful but must reject late verification of a previous revision atomically. Server must validate verification results rather than accept client fields. Keep historical evidence; expiry, source revocation and policy changes also matter. Partial checks can be represented without an aggregate pass."
    },
    "techniques/disambiguation-over-confident-guess.md": {
      "disposition": "clarify",
      "reason": "Repaired domains and one returned candidate as insufficient uniqueness evidence, registry namespaces, abstention and evidence-based selection. Human selection does not authenticate representation."
    },
    "techniques/funder-fact-taxonomy.md": {
      "disposition": "reverify",
      "reason": "Four useful classes are not exclusive or exhaustive: incorporation can be a registry fact, location can require documents, voice may come from approved material. Requirements depend on call and stage, revenue needs period/basis/currency, and a single authority per country is not guaranteed. Intersection can omit essential conditional fields."
    },
    "techniques/multi-org-workspace-scoping.md": {
      "disposition": "clarify",
      "reason": "Repaired silent tenant fallback on writes, implicit perpetual own-id authorization, resource ownership, action permissions and background-job scoping. User-id reuse is only a legacy option, not a prerequisite for migration-free tenancy."
    },
    "techniques/registry-grounded-autofill.md": {
      "disposition": "reverify",
      "reason": "Website does not pin one legal entity and a number requires registry namespace. A model supplied sources list does not prove retrieval or entailment. Silence is unknown, not contradictory evidence. Parsers must retain currency/period/locale; user certainty does not bypass required validation. Approval is a claim, not independent verification."
    },
    "applications/node--attestation-invalidation.md": {
      "disposition": "reverify",
      "reason": "Historical code/date retained, not rerun. Three displayed fields lack bound identifier, per-claim coverage and policy. Comments do not prove atomic implementation; late verification and untrusted client fields need actual storage tests. Name binding requires name dependencies too; blanket sponsorship advice remains unverified."
    },
    "applications/node--registry-grounded-autofill.md": {
      "disposition": "reverify",
      "reason": "Historical code/date retained, not rerun. Optional source and medium unsourced values can pass needsInput. Domains are not unique, source arrays are not retrieval proof, parsing cannot guarantee truthful figures and manually curated source hints contradict universal data-only extension."
    }
  }
}
```
