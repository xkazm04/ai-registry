---
subject: credential-vault
domain: software-engineering
last_touched: 2026-09-02
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
