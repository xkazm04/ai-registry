---
subject: credential-vault
domain: software-engineering
last_touched: 2026-10-31
dry_streak: 0
---

# credential-vault

First touch: [[2026-08-22-5]], external reconcile against `hashicorp/vault`
@ `c3d7264` (2.2.0-beta1). Gained `go--token-refresh-lifecycle` — second stack;
single-stack debt cleared. Second hint refuted with evidence: OSS rotation is
14 lines of constants plus stubs (Enterprise-only), nothing to reconcile.

## Open leads (banked, convergence rule applies)

- The look-ahead exit: refreshing at a threshold is not enough — the SLEEP must
  not be allowed to land past it. Short lifetimes fail without this.
- Clock-skew margin reframed as measured response AGE (issuance-time anchor),
  strictly better than a guessed buffer.
- The terminal state promoted to a persisted, queryable, counted, listable
  first-class state with a bounded re-attempt sweep.
- Renewability refusal as one reasoned predicate — a single vocabulary for
  "why won't this renew".
- Deviation worth its own lead: failure classification that exists server-side
  collapsing to a SUBSTRING CHECK client-side. THIRD SIGHTING of the
  verdict-vocabulary-must-survive-the-boundary family (with wave 1's erased
  refusal enum and wave 2's exemplary reason-labelled counter) — cycle
  candidate alongside fail-closed.
- Orphaned live credential on failed lease registration — the same file
  honors retire-the-failed-acquisition for tokens and skips it for secrets.

## Cross-subject proposals

- Full-width ±50% jitter vs full-jitter [0,t] — a comparative note for
  backoff-design on which jitter shape preserves expected-value schedules.

## Applied to the technique layer

- 2026-08-22-6: **the taxonomy survives the wire as a typed field** applied to `token-refresh-lifecycle` ([[2026-08-22-6]]). The verdict-survives family is now the standing LAW candidate; a fourth sighting triggers the law pass, not another technique edit.
- 2026-08-22-8: `token-refresh-lifecycle` now cites the promoted `verdict-survives-boundary` law; the family's fourth sighting triggered the law pass as recorded here ([[2026-08-22-8]]).

## 2026-09-02 - leads placed by [[2026-09-02-1]]

- **SSRF has no owner.** Four files touch it - `brokered-egress` (one
  sentence: a redirect must not carry the credential), its rust application
  (SSRF guards, a rebinding-safe client), the web-scraping golden path, and
  browser-credential-boundary's broker-proxy. A consumer lead (2026-08-27,
  measured twice on one shape) exceeds all four: **a URL that arrives inside a
  dependency's response is attacker-controlled input** - validate scheme, IP
  literals AND the resolved address, and re-validate every redirect hop with
  manual redirect handling; a first-hop check is defeated by a legitimate host
  answering a redirect to a private address. `brokered-egress` is the closest
  home. Return when this subject is next opened; land as a clause with a
  cross-link from broker-proxy.
- **"An envelope is session state, not a credential"** - a per-request wrapper
  that the payload can close from inside (sql-console's stacked-COMMIT
  post-mortem). Candidate clause for brokered-egress or a law-level note.


## 2026-09-02 - /intake openbao, design re-read under 2.0.0 (run intake-openbao-0902-v2)

One source-tree application, no technique change, and a boundary this
subject will soon have to state.

- `go--encryption-at-rest` written against a secrets server's source tree
  (design-record entry D): the barrier's three-key hierarchy over untrusted
  storage is this technique's model; the tree extends it with rotation
  split by layer (append the keyring, re-wrap the root), a transient
  upgrade entry for standbys, and rotation behind authentication with
  zero recovery shares at bootstrap. Recorded as the tree's extension, not
  landed as technique text.
- The forge handoff (`librarian/handoffs/2026-09-02-openbao.md`) proposes
  `seal-and-key-hierarchy` (N custodies of one root, break-glass seal, seal
  as a pre-storage plugin, per-tenant chains) and `dynamic-secret-lifecycle`
  (the issuer's side of a lease) as NEW subjects beside this one, plus
  EXTENDS rows on `rotation-and-remediation` (versioned key policy) and
  `token-refresh-lifecycle` (renew-at-two-thirds with grace, the proxy's
  revocation-interception matrix). When they land, this golden path owes a
  boundary paragraph: custody of *other people's* secrets (this subject)
  versus issuing and sealing your own (theirs).

## 2026-09-02 - `/intake` portkey-gateway (run `intake-portkey-0902`, intake 2.1.1, Opus workers)

`brokered-egress` gained "The credential can carry a priced roster": the brokered credential names which models it may reach and at what price, so price resolution gains the credential as an axis; boundary to the observability price book stated in prose. Direction proposal in tracklight.

## 2026-09-23 - `/deepen` batch ([[2026-09-23-2]])

Chosen on 8 stale deviations in one project; **5 had been fixed** there (four fully),
mostly the tri-state health work of 2026-09-17. The dominant theme - probes with no
unverifiable state - turned out to have its general home in health-checks'
three-state-outcomes; this pass placed only the credential form here and cross-linked.

**No new technique; four corrections** to `health-probing` and the golden path: verdict and
attempt are **two facts** (keeping the last verdict is right; losing the attempt is the
collapse); **which provider answers are verdicts** - status line alone does not decide,
forbidden is ambiguous across providers, classify from the protocol's typed signals, the
kind crosses boundaries as a field; the compatibility boolean kept beside a typed state as
a **fourth narrowing**; field sensitivity is **one classification with one authority**.
The IPC-envelope deviation was declined as a subject rule: the framework's own guidance
aims IPC encryption at untrusted frontend code, and the renderer already holds the
plaintext.

**Apply (three rows, [[applied]]):** 1 `better`, 2 `not-better`, both conditions written.
Verdict/attempt: no verdict writer clears the attempt, so "render both" alone shows a stale
could-not-check beside an answered verdict in 50 of 80 sequences - the next verdict clears
it, or readers order by time. Sensitivity: the storage seal over-classifies (identifiers
flagged sensitive, a substring name backstop), so pushing its predicate onto the screen
would mask 44 identifiers the confirm screen exists to show - correct the classification
first. The partition row also found a provider answering a revoked token with a success
status and an error body; written in.

Project defects surfaced (for `/conform`, not the subject): every non-2xx filed as a failed
verdict, including rate limits and outages; the gateway sweep writes verdicts through its
own path with no unreachable branch; the attempt fields have no reader.

### Impact (registry map, regenerated 2026-09-23 after this landing)

personas: 9 stale (8 `deviation`, 1 `not-applicable`); 5 of the 8 already fixed.

### Leads

- `rust--acquisition` is partly wrong (the reveal toggle gates on template type, not the
  sensitive flag) and its anchors have drifted. Return: next currency pass or its clock.
- A status-color fallback that defaults to healthy in one panel belongs to status-vocabulary.
  Not placed.

### 2026-09-23 - `/conform --stale` on personas (9 pairs re-judged)

7 deviation, 1 not-applicable, 1 unknown; five of the 2026-08-29 deviations were fixed in
the tree, and every surviving pair deviates for a reason today's landing named (the
compatibility boolean drawn as the verdict, a verdict never clearing the attempt, a
skipped rotation painted as failed). **Proposal (from the judge):** no rule decides whether
a foreign secret arriving *inbound* over an in-app IPC hop must use the transit envelope
the rest of the vault uses; the golden path's boundary argument is written for values going
out, so the api-vault pair could only be `unknown`. `acquisition` is the natural home for
one sentence. **Coverage:** the root causes (the status-only classifier, the verdict writer)
live in a backend engine file no context of this subject owns.


## 2026-10-31 - architecture review (first record)

Trigger: pending since the subject gained its three source-tree techniques and the
2026-09-23 corrections with no review on record. Intended benefit: one current
decision per document, and the arithmetic and code-reading errors found here fixed
before more applications cite them. Failure if ignored: the renewal technique's
worked example teaches the wrong sleep, and two applications misstate what the code
does (a grace that "tracks" a shrinking lease; a reveal toggle keyed on a flag it never
reads). Boundary: the subject is always the holder of a foreign or leased secret; the
issuer's side and seal/key-hierarchy remain the forge handoff's proposed subjects.

Four clarify items were found and applied in this run (renewal arithmetic, the Go
watcher's grace sentence, the acquisition application's reveal-toggle gate, the banked
SSRF lead in brokered-egress). The note's 2026-09-23 lead that `rust--acquisition` is
partly wrong is resolved by that edit at its pinned commit; its later anchor drift is not.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/credential-vault",
  "date": "2026-10-31",
  "baseline": "ec6af1500",
  "digest": "sha256-b2:1c57e44b947c96ef",
  "disposition": "clarify",
  "coverage": "All 20 current documents read in full (golden path, 9 techniques, 10 applications). Source checks are narrower: the upstream and fork lifetime-watcher files, one rate-limit doc, the SSRF cheat sheet, and one pinned project file; server-side Vault anchors, the other OpenBao anchors and most project-tree anchors were not re-opened. Leads still owed from the note: the inbound-IPC transit-envelope sentence proposed for acquisition (a rule choice, not a correction), and the 'an envelope is session state, not a credential' clause.",
  "counterexamples": [
    "With the technique's own 10-20% grace, a fresh 4 s lease never trips the look-ahead; it bites only when a grace kept from an earlier, longer lease meets a lease the issuer has started truncating.",
    "Upstream Vault's watcher now sleeps the backoff interval in error mode (sleepDuration = errorBackoff.NextBackOff()); the zero-sleep deviation is the fork's at its pinned commit, not a property of every watcher.",
    "A provider answers a revoked token with HTTP 200 and an error body; a status-line classifier draws it green, so 'non-2xx is the only failure' fails in the success direction too.",
    "A 403 is a scope rejection at one provider and an exhausted quota at another (403 or 429 with x-ratelimit-remaining 0), so forbidden alone is not a verdict.",
    "A destination host fixed at admission still leaks through redirects or a rebinding DNS answer unless the connected address and every hop are validated."
  ],
  "sources": [
    {
      "url": "https://github.com/hashicorp/vault/blob/main/api/lifetime_watcher.go",
      "result": "Read: sleep is remaining*2/3 + grace/3; exit on remaining<=grace || remaining-sleep<=grace; comment: a 4 s lease with 3 s grace would otherwise end up 'sleeping for more than three of those seconds'. Grace re-derived only 'so long as the lease is extending'. Refutes the technique's 'two and two-thirds seconds' and the Go application's 'tracks that shrinking reality'. Line anchors :274, :347, :378, :399-401, :405 still match."
    },
    {
      "url": "https://github.com/openbao/openbao/blob/6b5f82e1acc4868c19e5b11c0aee25ce4fd3ec38/api/lifetime_watcher.go",
      "result": "Read at the pinned commit: initialTime = time.Now() with no Age subtraction; error branch calls errorBackoff.NextBackOff() only in the give-up condition and never assigns sleepDuration. Supports both deviations in go--renew-at-two-thirds-with-grace."
    },
    {
      "url": "https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api",
      "result": "Primary rate limit exceeded: 'receive a 403 or 429 response' and 'the x-ratelimit-remaining header will be 0'. Supports health-probing's forbidden-is-ambiguous claim."
    },
    {
      "url": "https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html",
      "result": "'Disable the support for the following of the redirection'; 'Domain allowlisting alone does not prevent DNS rebinding'; 'Validate the resolved destination IP addresses'. Supports landing the banked SSRF lead as a clause in brokered-egress."
    },
    {
      "source": "Consumer project tree at the rust--acquisition pinned commit",
      "result": "Read FieldCaptureHelpers.tsx and FieldCaptureRow.tsx: the reveal toggle renders on isSecret, and isSecret = inputType === 'password'; no sensitive flag is consulted. Confirms the note's lead that the application misstates the gate, and agrees with the golden path's own sentence that the renderer masks only what a template typed as a password."
    },
    {
      "source": "Existing consumer applications",
      "result": "Dated project-tree readings and A/B accounts kept as recorded; private runtime evidence not re-run. No verified_on dates moved."
    }
  ],
  "documents": {
    "credential-vault.md": {
      "disposition": "keep",
      "reason": "Custody framing, lifecycle spine, brokered use, metadata/value split with one sensitivity authority, two seats and honest state are coherent with every technique; the seat boundary is stated. Owed leads (inbound IPC envelope) are rule choices, not corrections."
    },
    "techniques/encryption-at-rest.md": {
      "disposition": "keep",
      "reason": "Threat model stated first; envelope layering, AEAD with AAD binding, key identity in the header, altitude of the door and the six-rung deprecation are standard and internally consistent with both applications."
    },
    "techniques/token-refresh-lifecycle.md": {
      "disposition": "keep",
      "reason": "Thresholds, one freshness authority, provider-as-authority, no fabricated expiry, resume sweep, single-flight with re-read and reaped lock, persist-before-use and a typed failure taxonomy; consistent with the upstream watcher read this run."
    },
    "techniques/rotation-and-remediation.md": {
      "disposition": "keep",
      "reason": "Rotation vs remediation split, overlap conditioned on the successor's proof, clock coupled to the ledger witness, weighted ladder with descent and hysteresis, total mapping between vocabularies."
    },
    "techniques/brokered-egress.md": {
      "disposition": "clarify",
      "reason": "Land the banked SSRF lead: a response-borne URL is attacker-controlled; validate the connected address and every redirect hop; name allow-lists do not stop DNS rebinding."
    },
    "techniques/acquisition.md": {
      "disposition": "keep",
      "reason": "Mode ladder, consent-before-scan, found-nothing vs couldn't-look, self-registered-grant provenance case, validation below the modes and required provenance are coherent. The inbound-IPC envelope sentence proposed by conform stays a lead."
    },
    "techniques/health-probing.md": {
      "disposition": "keep",
      "reason": "Three states plus verdict/attempt as two facts with an ordering rule; the forbidden-is-ambiguous claim is confirmed by GitHub's documented 403-or-429 with x-ratelimit-remaining 0; four narrowings and the type-walk audit are sound."
    },
    "techniques/versioned-key-window.md": {
      "disposition": "keep",
      "reason": "Four-ordinal invariant at one door, both-directions version refusal, rotate-persist-restore, two-tier retirement with archive-before-prune, soft-delete flag plus tombstone; matches the pinned-tree application's account."
    },
    "techniques/renew-at-two-thirds-with-grace.md": {
      "disposition": "clarify",
      "reason": "Arithmetic error: by the technique's own formula a 4 s lease with 3 s grace sleeps 3 2/3 s (2/3 x 4 + 3/3), not 2 2/3 s; the upstream comment says 'more than three of those seconds'."
    },
    "techniques/revocation-interception-cache.md": {
      "disposition": "keep",
      "reason": "Five-index model with orphan-detach, eviction on the issuer's confirmation, watcher-exit eviction excluding shutdown, restore order by key, latest-token supersession and a stated blind spot; matches the pinned application."
    },
    "applications/go--encryption-at-rest.md": {
      "disposition": "keep",
      "reason": "Structural-only source-tree reading, scope and limits stated; anchors are documentation paths in the source tree, not re-opened this run."
    },
    "applications/go--renew-at-two-thirds-with-grace.md": {
      "disposition": "keep",
      "reason": "Re-opened the pinned watcher: missing Age subtraction and the never-assigned error-mode sleep both confirmed; line anchors :270 and :346-350 match. Other anchors (auth handler, config) not re-opened, so verified_on unchanged."
    },
    "applications/go--revocation-interception-cache.md": {
      "disposition": "reverify",
      "reason": "Internally consistent and pinned, but its cache, bolt and sink anchors were not re-opened this run; the URL-form lease revocation deviation needs a reading of lease_cache.go at the pin."
    },
    "applications/go--token-refresh-lifecycle.md": {
      "disposition": "clarify",
      "reason": "Contradicts the cited code and its own sibling application: the grace is re-derived only while the lease extends and freezes once max TTL truncates; it does not track the shrinking lease."
    },
    "applications/go--versioned-key-window.md": {
      "disposition": "keep",
      "reason": "Pinned, every claim anchored; deviation (available floor checked at two endpoints, not the policy door) is stated and consistent with the technique. Not re-opened this run."
    },
    "applications/react--rotation-and-remediation.md": {
      "disposition": "keep",
      "reason": "Narrow A/B with its limits written down (classification not reporting, no live corruption observed, cadence unmeasured); verdict scope matches the evidence."
    },
    "applications/rust--acquisition.md": {
      "disposition": "clarify",
      "reason": "Reveal toggle gates on inputType === 'password' (FieldCaptureRow.tsx:58), not on the sensitive flag, at the pinned commit."
    },
    "applications/rust--brokered-egress.md": {
      "disposition": "reverify",
      "reason": "Dated 2026-08-18 without a pinned commit; its anchors into the proxy and broker modules were not re-opened and may have drifted. Needs a pin and a re-read."
    },
    "applications/rust--encryption-at-rest.md": {
      "disposition": "reverify",
      "reason": "Dated 2026-08-18 without a pinned commit; measured counts (36 IVs, 5,008 ciphertexts) and crypto.rs anchors not re-checked. Needs a pin and a re-read."
    },
    "applications/rust--health-probing.md": {
      "disposition": "keep",
      "reason": "Pinned, recent, and its findings drove the technique's current verdict/attempt and status-partition text; limits stated (structural, model not run)."
    }
  }
}
```

## 2026-10-31 - architecture review (after apply)

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/credential-vault",
  "date": "2026-10-31",
  "baseline": "ec6af1500",
  "digest": "sha256-b2:404d97bb62515e78",
  "disposition": "reverify",
  "coverage": "All 20 current documents read in full (golden path, 9 techniques, 10 applications). Source checks are narrower: the upstream and fork lifetime-watcher files, one rate-limit doc, the SSRF cheat sheet, and one pinned project file; server-side Vault anchors, the other OpenBao anchors and most project-tree anchors were not re-opened. Leads still owed from the note: the inbound-IPC transit-envelope sentence proposed for acquisition (a rule choice, not a correction), and the 'an envelope is session state, not a credential' clause. Second record: written after the four clarify items were applied; remaining open items are the three reverify applications.",
  "counterexamples": [
    "With the technique's own 10-20% grace, a fresh 4 s lease never trips the look-ahead; it bites only when a grace kept from an earlier, longer lease meets a lease the issuer has started truncating.",
    "Upstream Vault's watcher now sleeps the backoff interval in error mode (sleepDuration = errorBackoff.NextBackOff()); the zero-sleep deviation is the fork's at its pinned commit, not a property of every watcher.",
    "A provider answers a revoked token with HTTP 200 and an error body; a status-line classifier draws it green, so 'non-2xx is the only failure' fails in the success direction too.",
    "A 403 is a scope rejection at one provider and an exhausted quota at another (403 or 429 with x-ratelimit-remaining 0), so forbidden alone is not a verdict.",
    "A destination host fixed at admission still leaks through redirects or a rebinding DNS answer unless the connected address and every hop are validated."
  ],
  "sources": [
    {
      "url": "https://github.com/hashicorp/vault/blob/main/api/lifetime_watcher.go",
      "result": "Read: sleep is remaining*2/3 + grace/3; exit on remaining<=grace || remaining-sleep<=grace; comment: a 4 s lease with 3 s grace would otherwise end up 'sleeping for more than three of those seconds'. Grace re-derived only 'so long as the lease is extending'. Refutes the technique's 'two and two-thirds seconds' and the Go application's 'tracks that shrinking reality'. Line anchors :274, :347, :378, :399-401, :405 still match."
    },
    {
      "url": "https://github.com/openbao/openbao/blob/6b5f82e1acc4868c19e5b11c0aee25ce4fd3ec38/api/lifetime_watcher.go",
      "result": "Read at the pinned commit: initialTime = time.Now() with no Age subtraction; error branch calls errorBackoff.NextBackOff() only in the give-up condition and never assigns sleepDuration. Supports both deviations in go--renew-at-two-thirds-with-grace."
    },
    {
      "url": "https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api",
      "result": "Primary rate limit exceeded: 'receive a 403 or 429 response' and 'the x-ratelimit-remaining header will be 0'. Supports health-probing's forbidden-is-ambiguous claim."
    },
    {
      "url": "https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html",
      "result": "'Disable the support for the following of the redirection'; 'Domain allowlisting alone does not prevent DNS rebinding'; 'Validate the resolved destination IP addresses'. Supports landing the banked SSRF lead as a clause in brokered-egress."
    },
    {
      "source": "Consumer project tree at the rust--acquisition pinned commit",
      "result": "Read FieldCaptureHelpers.tsx and FieldCaptureRow.tsx: the reveal toggle renders on isSecret, and isSecret = inputType === 'password'; no sensitive flag is consulted. Confirms the note's lead that the application misstates the gate, and agrees with the golden path's own sentence that the renderer masks only what a template typed as a password."
    },
    {
      "source": "Existing consumer applications",
      "result": "Dated project-tree readings and A/B accounts kept as recorded; private runtime evidence not re-run. No verified_on dates moved."
    }
  ],
  "documents": {
    "credential-vault.md": {
      "disposition": "keep",
      "reason": "Custody framing, lifecycle spine, brokered use, metadata/value split with one sensitivity authority, two seats and honest state are coherent with every technique; the seat boundary is stated. Owed leads (inbound IPC envelope) are rule choices, not corrections."
    },
    "techniques/encryption-at-rest.md": {
      "disposition": "keep",
      "reason": "Threat model stated first; envelope layering, AEAD with AAD binding, key identity in the header, altitude of the door and the six-rung deprecation are standard and internally consistent with both applications."
    },
    "techniques/token-refresh-lifecycle.md": {
      "disposition": "keep",
      "reason": "Thresholds, one freshness authority, provider-as-authority, no fabricated expiry, resume sweep, single-flight with re-read and reaped lock, persist-before-use and a typed failure taxonomy; consistent with the upstream watcher read this run."
    },
    "techniques/rotation-and-remediation.md": {
      "disposition": "keep",
      "reason": "Rotation vs remediation split, overlap conditioned on the successor's proof, clock coupled to the ledger witness, weighted ladder with descent and hysteresis, total mapping between vocabularies."
    },
    "techniques/brokered-egress.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: redirect sentence extended with the banked SSRF lead: validate the connected address and every redirect hop when any part of the destination is not fixed at admission; name allow-lists do not stop rebinding (OWASP SSRF cheat sheet)."
    },
    "techniques/acquisition.md": {
      "disposition": "keep",
      "reason": "Mode ladder, consent-before-scan, found-nothing vs couldn't-look, self-registered-grant provenance case, validation below the modes and required provenance are coherent. The inbound-IPC envelope sentence proposed by conform stays a lead."
    },
    "techniques/health-probing.md": {
      "disposition": "keep",
      "reason": "Three states plus verdict/attempt as two facts with an ordering rule; the forbidden-is-ambiguous claim is confirmed by GitHub's documented 403-or-429 with x-ratelimit-remaining 0; four narrowings and the type-walk audit are sound."
    },
    "techniques/versioned-key-window.md": {
      "disposition": "keep",
      "reason": "Four-ordinal invariant at one door, both-directions version refusal, rotate-persist-restore, two-tier retirement with archive-before-prune, soft-delete flag plus tombstone; matches the pinned-tree application's account."
    },
    "techniques/renew-at-two-thirds-with-grace.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 4 s/3 s example sleep corrected from 'two and two-thirds' to 'three and two-thirds' seconds, with the arithmetic shown, per the stated formula and the upstream source comment."
    },
    "techniques/revocation-interception-cache.md": {
      "disposition": "keep",
      "reason": "Five-index model with orphan-detach, eviction on the issuer's confirmation, watcher-exit eviction excluding shutdown, restore order by key, latest-token supersession and a stated blind spot; matches the pinned application."
    },
    "applications/go--encryption-at-rest.md": {
      "disposition": "keep",
      "reason": "Structural-only source-tree reading, scope and limits stated; anchors are documentation paths in the source tree, not re-opened this run."
    },
    "applications/go--renew-at-two-thirds-with-grace.md": {
      "disposition": "keep",
      "reason": "Re-opened the pinned watcher: missing Age subtraction and the never-assigned error-mode sleep both confirmed; line anchors :270 and :346-350 match. Other anchors (auth handler, config) not re-opened, so verified_on unchanged."
    },
    "applications/go--revocation-interception-cache.md": {
      "disposition": "reverify",
      "reason": "Internally consistent and pinned, but its cache, bolt and sink anchors were not re-opened this run; the URL-form lease revocation deviation needs a reading of lease_cache.go at the pin."
    },
    "applications/go--token-refresh-lifecycle.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: grace sentence corrected: re-derived only while the lease extends and frozen once a max TTL truncates renewals, instead of 'tracks that shrinking reality'."
    },
    "applications/go--versioned-key-window.md": {
      "disposition": "keep",
      "reason": "Pinned, every claim anchored; deviation (available floor checked at two endpoints, not the policy door) is stated and consistent with the technique. Not re-opened this run."
    },
    "applications/react--rotation-and-remediation.md": {
      "disposition": "keep",
      "reason": "Narrow A/B with its limits written down (classification not reporting, no live corruption observed, cadence unmeasured); verdict scope matches the evidence."
    },
    "applications/rust--acquisition.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: rung-4 reveal toggle corrected to gate on the field's password input type, not its sensitive flag, with FieldCaptureRow.tsx:58 added, per the pinned project tree. Later anchor drift past the pin not addressed."
    },
    "applications/rust--brokered-egress.md": {
      "disposition": "reverify",
      "reason": "Dated 2026-08-18 without a pinned commit; its anchors into the proxy and broker modules were not re-opened and may have drifted. Needs a pin and a re-read."
    },
    "applications/rust--encryption-at-rest.md": {
      "disposition": "reverify",
      "reason": "Dated 2026-08-18 without a pinned commit; measured counts (36 IVs, 5,008 ciphertexts) and crypto.rs anchors not re-checked. Needs a pin and a re-read."
    },
    "applications/rust--health-probing.md": {
      "disposition": "keep",
      "reason": "Pinned, recent, and its findings drove the technique's current verdict/attempt and status-partition text; limits stated (structural, model not run)."
    }
  }
}
```
