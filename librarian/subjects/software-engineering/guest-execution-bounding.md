# guest-execution-bounding

`software-engineering/backend-platform/language-runtime/guest-execution-bounding`

## 2026-09-04 — intake (obscura), run `obscura-0904`

Forged 2026-09-03 with 6 techniques, all about an interpreter that counts its own
execution. Extended to 11 with a family about the case where counting is impossible.

**What was wrong, and it was a good kind of wrong.** The subject's thesis — *a ceiling is
enforceable exactly where something is counted, and nowhere else* — is true and was
unscoped. Its precondition is that the host owns the dispatch loop. A host embedding a
third-party engine owns nothing of the kind, and for it the counted set is empty by
construction. The subject's "What the naive reading gets wrong" section had already
considered that host's only remaining option and rejected it in three clauses, all three
of which are objections to *killing a thread* and none of which survives when the host
calls a termination handle the engine published instead.

So this was a denial that went too broad, not a hole — which is the shape the intake
method prizes and the reason the correction is stronger than the technique would have
been alone.

**Changed:** thesis scoped to its precondition; the three-objection paragraph answered
clause by clause; a new section, "When the counted set is empty: bounding an engine you
did not write"; `use_when` extended with the uninstrumentable-engine and
fake-timeout entries; a note back to the `untrusted-extension-host` neighbour that its
*counted / uncounted* pair needs a third category — **externally bounded** — because
"uncountable" was being read as "uncapped".

**Added:** `terminate-from-outside-when-you-cannot-count` (the anchor; its diagnostic
half is the one to reuse), `one-terminator-many-armed-slots`, `nested-liveness-ceilings`,
`budget-tier-from-observed-output`, `grace-for-the-uninterruptible-host-call`.

**Applications:** two against the source tree, one against `personas` carrying
`applied: code` / `ab_verdict: better` from a shipped 8-site fix.

**The boundary to keep straight** for whoever reads this next: the two halves are not a
matter of taste. One question routes them — *can the host place a counter in the loop?*
Yes means count, because counting is deterministic and stops the guest where invariants
hold. No means terminate from outside, accept a liveness ceiling instead of a
correctness limit, and set it far above the slowest legitimate work.

**Not absorbed here:** the reference-fidelity, protocol-compatibility, egress and
identity-consistency material from the same source, which has no home in this bundle and
went to `librarian/handoffs/2026-09-04-obscura-design-record.md`.
