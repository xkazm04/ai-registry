---
subject: digest-bound-operator-writes
domain: software-engineering
last_touched: 2026-11-03
dry_streak: 0
---

# digest-bound-operator-writes

First note. The subject was harvested on 2026-10-27 from one node tree, a Next.js server
that writes to GitLab as the signed-in operator (afterlife 009c7893). A Curator dispatch
ranked it on "single stack (node)".

## State

5 techniques, 4 applications: 2 `node` (afterlife 009c7893), 1 `rust` (paypal a52d8f6d),
and 1 `python` (athena-muse 7000a27). The two new applications both apply
unretried-write-unknown-outcome. plan-twice-run-if-unchanged,
preview-id-claim-and-recall and record-before-each-command still have only the node
tree. paypal's reserve-before-send and athena's conditional card claim are seams for the
last two, but were not written up this pass.

## 2026-11-03 - deepen (dbow-deepen-1103)

Landed in 575652ac5 (catalog 89e5c2d81). Lanes:
- **Counter-evidence (web)**: Stripe's idempotent-requests and low-level error pages,
  Stripe API v2 overview, PayPal's idempotency reference, the IETF httpapi
  Idempotency-Key draft (-08), GitLab repository-files and commits API docs, GitHub
  contents API, RFC 9110 sections 9.2.2, 13.1.1 and 15.5.13, RFC 6585, Kubernetes API
  conventions, git-push docs, AWS SDK retry behaviour and the Builders' Library on
  retries. Retention figures were re-read verbatim from PayPal's published OpenAPI files
  (Orders v2: 6 h, extendable to 72; Payouts: 30 days; Payments v2 capture and void:
  the key is documented, no window).
- **Training-data only (blind)**: one agent, no tools. It converged on every keyed-retry
  bound (per-endpoint window, same payload, a key minted once and stored, a 409 on a
  concurrent retry), and on reconciling by a client reference with "not found" not
  meaning absent. It was unsure of the vendor figures, and the web lane supplied them.
- **Field**: a slug search across the fleet's 18 registered slugs (four maps join the
  subject by words only), then behaviour words. Two second-stack seams: paypal (Rust) and
  athena-muse (Python, no context map, so it is unjoinable). Both were read from
  `origin/main`, and every anchor was checked with check-anchors against a git-archive
  export (27 of 27 held).
- `check-currency --volatile --subject`: 1 fact, preview-id-claim-and-recall L53 "two
  days". It is a house default for a recall window, not a vendor-set figure. Left
  standing.

What moved:
- **Flipped (unretried-write-unknown-outcome, golden path): a keyed retry is bounded.**
  The old line "its unknown collapses back to known once the retry answers" is refuted by
  Stripe v1, which replays a stored 500 under the same key and calls a 500 indeterminate.
  PayPal says a retry reports the current status, not the original's. Bounds now named:
  one key per operation, minted once; that endpoint's window, with no send under either
  key past it; the same payload; a replay counts only when it names what the write made.
  A documented key with no window covers in-call retries only.
- **Flipped: a 5xx on a write is unknown** unless the remote documents it as "nothing
  applied". athena-muse does this already, and the blind lane named it.
- **New decision rule: the reopen-on-error handler launders unknown.** The same failure
  in two stacks: afterlife's journal stores `failed` for a timeout, and athena's gate
  returns a signed card to waiting. Each carries honest words on a reopened action.
- **New procedure step: settle reads** look up by the identifier the write carried, after
  the write could have committed. paypal's `SETTLE_SECS` and the blind lane converged.
- **Condition the field taught (from paypal)**: the remote's own state, such as a final
  capture, can bound a second send where no key store is documented. Its refusal means
  look.
- **Precision (precondition-token-on-every-write)**: GitLab documents only a
  non-specific 400 for any failed commit, so a stale token's refusal says the file *may*
  have moved. RFC 9110 lets a server answer an already-applied conditional write with a
  2xx.
- **Confirmed untouched**: If-Match → 412 (RFC 9110), 428 (RFC 6585), Kubernetes stale
  resourceVersion → 409, and no blind auto-retry of unkeyed writes. Even AWS's
  retry-everything SDK leans on generated idempotency tokens for this. The node
  application's "GitLab refuses it (400)" matches the docs.
- **Applied**: 2 rows. paypal: simulation, `better` (1 of 3 cases changes, an
  invoice 5xx read as unknown, and the tree taught two conditions). athena-muse:
  experiment, `better`, **held for the owner**. Delivered-then-503 followed by a
  re-sign gives 2 sends as shipped and 1 with the card kept settled. The repo's own test
  pins the reopen.

## Impact

No judged verdicts: 5 pairs in 4 projects join this subject by words alone (gravitone
1, personas 2, kp 1, ascent 1), all `state: unknown`, and 0 stale. Neither seam that
implements the subject is joined: paypal's money pipeline and athena-muse (no context
map). Maps were regenerated fleet-wide and committed locally on each active branch (12
projects, map file only). None were pushed, because every branch already carries other
sessions' unpushed commits.

## Banked

- **athena-muse: settle the card on unknown.** The A/B is measured. Its return condition
  is the owner's choice, or the twins' real-account run. The gate's generic "nothing
  changed. Try again." for a non-API exception is the same lie one layer down. Fix both
  together.
- **paypal: trace a secondary 5xx through the pipeline.** The client returns
  `Error::Api { status: 500 }` for an unretried invoice write. Return when the invoice
  path is next touched, and check whether the ledger reads it as unknown.
- **paypal's UNVERIFIED note can narrow**: the Payments v2 spec documents the key on
  capture and void, and only the window is missing. Return with the item above.
- **Second-stack applications for record-before-each-command (paypal
  `reserve_operation`) and preview-id-claim-and-recall (athena's conditional card
  claim).** Return on the next pass that is not ranked on a correction.
- **ascent `openDraftPr` digest-bound replace** (`src/lib/github/write.replace.test.ts`).
  It cites this subject, so it is a node seam for plan-twice in a second tree. Return when
  a pass needs tree diversity rather than stack diversity.
