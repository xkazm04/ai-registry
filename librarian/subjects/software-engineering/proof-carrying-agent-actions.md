---
subject: proof-carrying-agent-actions
domain: software-engineering
last_touched: 2026-11-03
dry_streak: 0
---

# proof-carrying-agent-actions

First note. The subject was forged on 2026-10-27 from one node tree: a DevSecOps product whose
model-free proof engine writes a proof block per agent merge request (afterlife 009c7893). A
Curator dispatch ranked it on "single stack (node)".

## State

6 techniques and 4 applications:
- 2 `node`, from afterlife 009c7893 (claims-never-decide, negative-fixtures-prove-the-verifier);
- 2 `rust`, from paypal a52d8f6d (inconclusive-routes-to-wait,
  proof-class-bound-to-action-class): the offline verifier for an AI agent's payment proof file.

test-not-weakened-check and evidence-binds-to-the-measured-change have no application yet.

## 2026-11-03 - deepen (pcaa-deepen-1103)

Landed in 38932ee55. Lanes:
- **`check-currency --volatile --subject`.** 0 dated facts in 9 documents. Nothing to
  re-source.
- **Field.** Four fleet maps join the subject: tracklight, politicas, pof and paypal. paypal's
  `offline-proof-verifier` context scored highest (770). paypal is public (checked with gh).
  Its local main is 20 ahead of origin, so it was read and cited at origin/main a52d8f6d
  through `git show`. Anchors: 19 line anchors across the two applications, 0 missing files,
  0 past end of file, against a git-archive export of that sha. Each was read by hand, because
  none carries an inline quote the checker can compare.
- **Counter-evidence (web, one research agent; quotes taken from raw primary text).**
  - SLSA VSA has `verifier.id` and `policy`; the in-toto Statement has neither. The golden
    path said "attestation formats" carry them. **Corrected** in the golden path and in
    evidence-binds-to-the-measured-change. The correction also says the VSA does not protect
    against a compromised verifier ("Consumers MUST accept only specific (signer, verifier)
    pairs").
  - SWE-bench's `FAIL_TO_PASS` / `PASS_TO_PASS` names are confirmed by the dataset card. Wang,
    Pradel and Liu (arXiv 2503.15223) found the validation "overlooks non-modified test files":
    7.8% of patches count as correct while failing the developer suite. **Sharpened**: the golden
    path now says a curated pass-to-pass list is not the suite. The number stays out of the
    upper layer.
  - ImpossibleBench (arXiv 2510.20270): agents modify tests despite instructions, and read-only
    test access prevents modification but not special-casing. Supports test-not-weakened-check
    as written. **Verified, left untouched.**
  - RFC 8725 §3.1 (quoted verbatim) and RFC 8446 §4.1.3 back the new rule. The lane's caution
    is kept: the TLS sentinel works only because the producer may not omit it.
- **Training-data only (blind, no tools).** Converged unprompted on the downgrade class (JWT
  `alg` confusion, the TLS rollbacks, Android APK v2 strip protection) and on the fix: the
  verifier sets the minimum, and the newer format marks itself inside signed content. It also
  raised "no unchecked assertion, not no assertion", which the golden path already states
  (recomputed or display only). No change there.

Landed:
- **proof-class-bound-to-action-class (condition added).** A versioned proof format is a class
  the file declares. The producer holds the signing key, so it can strip, relabel and re-sign;
  the floor comes from evidence the producer cannot re-sign. A new section, a decision rule
  and a use_when trigger. The golden path gains the sentence.
- **rust--proof-class-bound-to-action-class.md.** `applied: simulation`, `ab_verdict: better`.
  The project's own test asserts that a re-signed downgrade verifies with seven checks struck.
- **rust--inconclusive-routes-to-wait.md.** Four states per line and three verdicts on the app
  sheet. Deviation: the CLI exit has two values for a readable file.

Applied: paypal, simulation, better on 1 of 3 and tied on 2. No code changed, because which
old files stay acceptable is the owner's call.

## Impact

6 pairs in 4 maps (tracklight 1, politicas 2, pof 1, paypal 2), 0 judged, so no stale
verdict. The 12 regenerated maps were committed locally on each active branch, map only
through an isolated index, and not pushed.

## Banked leads

- **A third exit code in paypal's CLI verifier** for "not every check could be made". Return
  when the owner wants the CLI scriptable, or when a CI job consumes its exit.
- **A minimum-format clause in paypal's mandate.** The owner's decision. Return when the
  first format is retired or the clause lands. Then re-run the walk as code.
- **paypal's `assert_forgery_fails`** re-signs each forgery with the deal's own key, so only the
  named check can catch it, and it must fail rather than read "not checked"
  (`crates/table-runtime/src/tests.rs:352-372`). That is a second stack for
  negative-fixtures-prove-the-verifier, and it sharpens the technique: a negative fixture must
  defeat every other check. Return on the next pass. The source is already read.
- **test-not-weakened-check and evidence-binds-to-the-measured-change** have no application.
  Return when a fleet tree gates agent diffs on a test or a pinned verifier build.
