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

### 2026-09-10 — architecture re-review after the compression revert

Read all nine documents at their restored bytes: the golden path, six techniques
and the two Node applications. The record above was written against the reverted
2026-09-09 rewrite. **Retraction:** its `reverify` on six of nine documents does
not survive re-reading. Its security objections in particular are answered in the
current text — `applicant-evidence-corpus` already rejects the client-declared
media type in favour of an extension allowlist, already caps decompression per
entry, already re-validates every redirect hop against the private-address guard;
`multi-org-workspace-scoping` already specifies that an out-of-allowlist selection
is ignored rather than errored, in one resolution function every read and write
flows through. Those are the documents' own rules, not gaps in them.

One finding is real and it appears twice. The golden path's first fact cluster and
`techniques/funder-fact-taxonomy.md`'s first class both assert that for registry
facts "exactly one authoritative source exists per jurisdiction". That is false in
both markets this subject's own application works in. In the United States, a
nonprofit's registered legal name and legal form come from a state incorporation
registry while its exempt status and identifier come from the federal tax authority
— and the application itself records the verification as passing against *two*
distinct federal files, then a third registry for a different market. In the United
Kingdom, charity registration is split across three national regulators, with
company registration separate again. The consequence in the text is not cosmetic:
"exactly one authoritative source" is what licenses the taxonomy's prescription of
a single lookup and a single verification per jurisdiction, and it is what makes
the attestation's `verificationSource` field look like an implementation detail
rather than the necessary shape. The honest claim is that each registry *fact* has
one authoritative source, which may be a different registry from the one that owns
the neighbouring fact.

Everything else I kept, and two of them deserve the note that they are the
strongest documents in the group. `disambiguation-over-confident-guess` states its
founding observation as an experiment (drilling a live pipeline with deliberately
ambiguous names) and derives the cost asymmetry from it rather than asserting it;
its unattended-pipeline degradation rule — "unresolved, parked for review", not
"best candidate" — is exactly the boundary a weaker document would have left open.
`attestation-invalidation` closes the two failure paths that matter (write-path
reset rather than a sweep; reset to null rather than a stale flag) and then adds
the freshness horizon for the mutations you cannot observe, which is the rule most
verification designs omit.

Boundaries I noticed and am recording as counterexamples rather than defects: the
migration-free identity trick keys a solo organization by the owner's user id,
which is elegant while the two coincide and awkward the first time an organization
must outlive or be transferred away from that person; and `registry-grounded-autofill`
treats a non-empty sources array as the working proxy for grounding, which the same
instrument that fabricates can also produce — the document labels it a proxy, which
is why I did not escalate it.

What I could not verify: the `grant-writing-nonprofits` repository is not in this
checkout, so both applications' file paths, line numbers and quoted comments were
read as dated records rather than re-executed, and no upload, lookup or tenancy
path was exercised. Their verified_on dates are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/organizational-grant-readiness",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:439bd1d2d1fcfd2e",
  "disposition": "clarify",
  "coverage": "All 9 documents read in full at restored bytes. The single-authoritative-registry claim was checked against the registry structure of the two markets the subject's own application serves. Not evaluated: the grant-writing-nonprofits repository, so both applications' references were read as dated records; no upload path, registry lookup, authorization check or tenancy resolution was executed; no maturity or verified_on change.",
  "counterexamples": [
    "A US nonprofit's registered legal name and legal form come from a state incorporation registry while its exempt status and identifier come from the federal tax authority: two authoritative sources in one jurisdiction, for adjacent fields in the same identity cluster.",
    "A UK charity may be registered with one of three national charity regulators and separately at the company register: 'exactly one authoritative source per jurisdiction' has no referent there.",
    "A fiscally sponsored program whose identity fields belong to the sponsor: the readiness model must represent identity that is legitimately another entity's, which the golden path names but the four-class taxonomy does not accommodate.",
    "A solo organization keyed by its owner's user id that must later be transferred to a new owner or outlive the account: the migration-free trick has no story for separating the two identities it deliberately fused."
  ],
  "sources": [
    {
      "url": "https://webgate.ec.europa.eu/funding-tenders-opportunities/spaces/OM/pages/1867804/Registration+and+validation+of+your+organisation",
      "result": "Read as a worked example of a registry regime where identity validation and special-status validation are separate determinations by one service; supports the general point that registry facts and status facts need not share a source, but establishes nothing about the US or UK regimes the finding rests on."
    }
  ],
  "documents": {
    "organizational-grant-readiness.md": {
      "disposition": "clarify",
      "reason": "Asserts that identity fields have 'exactly one authoritative source per jurisdiction'. False in both markets the subject's own application serves: US legal identity and exempt status sit with different authorities, and UK charity registration is split across three regulators plus the company register. Restate as one authoritative source per fact, not per jurisdiction."
    },
    "techniques/applicant-evidence-corpus.md": {
      "disposition": "keep",
      "reason": "Text-not-bytes is argued from the liabilities it removes, every bound is placed at the boundary before storage, the fetch path is treated as a server-side request-forgery surface with per-hop revalidation, and the prompt block is framed as untrusted data with no authority over the pipeline reading it."
    },
    "techniques/attestation-invalidation.md": {
      "disposition": "keep",
      "reason": "Bound inputs, write-path reset rather than a sweep, reset-to-null rather than a stale flag, and a freshness horizon for externally mutable subjects together close both the observable and unobservable invalidation paths. The dependency-set discipline is stated as data next to the artifact, not as tribal memory."
    },
    "techniques/disambiguation-over-confident-guess.md": {
      "disposition": "keep",
      "reason": "The founding observation is an experiment rather than an assertion, the cost asymmetry is derived, and the unattended-pipeline rule degrades to parked-for-review rather than best-candidate. Cross-field consistency as the cheap check against a namesake match is a concrete, testable rule."
    },
    "techniques/funder-fact-taxonomy.md": {
      "disposition": "clarify",
      "reason": "Registry facts are defined by the property 'exactly one authoritative source per jurisdiction', which is the same false premise as the golden path and is what licenses a single lookup and single verification per market. The four classes remain useful; the property needs restating per fact."
    },
    "techniques/multi-org-workspace-scoping.md": {
      "disposition": "keep",
      "reason": "Server-side allowlist, client selection treated as a hint and ignored rather than errored when invalid, one resolution function on every read and write path, and per-request resolution caching are each tied to the specific hole they close. The speculative-machinery warning correctly separates day-one keying from the switcher UI."
    },
    "techniques/registry-grounded-autofill.md": {
      "disposition": "keep",
      "reason": "Sourced proposals rather than facts, low-confidence treated as missing, jurisdiction knowledge composed as data, and confidence tied to source class are all stated as hard contract rules. The sources array is explicitly labelled a working proxy for grounding rather than proof of retrieval, which is the honest framing of a weak signal."
    },
    "applications/node--attestation-invalidation.md": {
      "disposition": "keep",
      "reason": "A dated record of the attestation triple, the write-path invalidation and the matching user-facing copy, and it names its own deviation from the standard (binding is implicit rather than stored inside the attestation) rather than claiming full conformance."
    },
    "applications/node--registry-grounded-autofill.md": {
      "disposition": "keep",
      "reason": "Reports the per-field provenance type, the mechanically computed needs-input list, the checksum-based client classifier and the declared fast mode accurately, including the hand-kept where-to-look map as an acknowledged exception to data-driven market extension."
    }
  }
}
```
