---
subject: credential-vault
domain: software-engineering
last_touched: 2026-09-23
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
