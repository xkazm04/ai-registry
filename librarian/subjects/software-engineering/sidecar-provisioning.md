---
domain: software-engineering
subject: sidecar-provisioning
last_touched: 2026-08-21
touched_by: research
dry_streak: 0
---

# sidecar-provisioning

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-08-21 - `/research`, from an external source

Gained the `grade-selection` technique (6 -> 7), a `rust` application, and a section in
the golden path. Source: [[2026-08-21-ai-news-open-model-local]].

The gap was structural rather than topical, which is why nobody had filed it: the
subject answers *where an artifact comes from* thoroughly, and had no vocabulary at all
for *which of several interchangeable, unequal versions of it to take*. The provisioning
lifecycle table reads `resident` at any grade, and the capability verdict
(available / absent / broken) has no state for "available, worse". Both now have an
owner.

## Open leads

- **The routing half is elsewhere.** Whether to reach for a locally provisioned artifact
  at all, versus a hosted one, is `model-routing`'s question and specifically
  `capability-floors`'. `grade-selection` deliberately stops at the host boundary and
  links across. If a later run finds the two overlapping in practice, the seam is the
  thing to check first.
- **A connected project carries the same gap in real code**, read but not modified on
  2026-08-21. Return condition: the operator opens the cross-repo lane, or that project
  changes its model catalog on its own.

## Standing debt

- **Single stack.** All three applications are `rust`; the transplant claim is untested.
  The 2026-08-21 run added to the stack it already had and did not pay this down. A
  second stack here is a genuine piece of work, not a formality - the subject is about
  desktop-shaped provisioning and the second stack has to be chosen, not defaulted.
- **Never swept by `/librarian`.** This note is the subject's first record of any kind.

## Declines

None. Nothing about this subject has been proposed and rejected.


## 2026-09-02 - intake (Handy, practitioner build-walkthrough in repo form)

- **Amendment to `atomic-downloads`**: "Resume or restart" gained § "The resume
  contract, check by check" - five protocol-level checks (full-size partial accepted
  without a request; 200-to-Range restarts from zero; 206 offset verified against the
  partial's length; 416 is never a completion signal and only a digest can bless a
  partial; total pinned from the catalog and enforced mid-stream), the connect-vs-stall
  timeout split, and the one-test-per-check protocol against a local socket server.
  Corroborated against RFC 9110 §14.2 / §15.3.7 / §14.4.
- **Second stack, finally.** `applications/node--atomic-downloads.md` pays the
  standing single-stack debt: applied `experiment`, `ab-paired`, verdict `better`
  (1/6 silent-wrong -> 0/6), shipped to a connected tree the same day. Two structural
  facts: a runtime's HTTP client can make two of the five checks itself (short body,
  oversized body), so the technique's "transport success does not prove completeness"
  is now qualified with a caution; the check no transport makes is the catalog
  comparison, and the tree held the catalog number and compared it to nothing.
- Untriaged from the same source: capabilities canonical in the artifact header,
  rendered unknown before download (capability-detection seam).
