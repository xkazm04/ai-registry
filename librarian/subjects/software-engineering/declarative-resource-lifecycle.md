---
subject: declarative-resource-lifecycle
domain: software-engineering
last_touched: 2026-09-03
dry_streak: 0
---

# declarative-resource-lifecycle

Born 2026-09-03 from `/intake` run `intake-kube-0903` (intake 2.3.1, round 5 of the 2.x
series, every worker Opus): a scoped forge handoff over the resource-lifecycle system of a
control-plane client library, where design entries A3, A4, D1 and E1 carried `corpus: NONE`
and the HOME-IF-NEW clause fired on all four. First subject of the new subcategory
`operations/control-plane-operations`, created by the director because `service-operations`
was at eight of ten and the forces (independent writers converging on one record, no lock,
no transaction) are not service operation. Boundaries stated first: `entity-lifecycle`
(states for the product's sake vs contracts for independent writers), `concurrency-guards`
(refuses to elect a writer; the witnessing tree ships no leader election),
`job-coordination` (durable job state stays there), `authorization` (grades the caller,
in-process, one failure direction). Techniques: `deletion-blocked-until-dependents-confirm`
(admits soft-delete column plus a named reaper as the degraded case, under one removal door),
`ownership-edges-that-enqueue-the-parent`, `per-field-write-ownership` (kept as one
technique: every conflict path is a ledger mutation), `synchronous-gate-before-persistence`.
Director review: gate green, purity clean (the worker caught "overwhelming" containing
"helm"), `use_when` on all four, link depths right, the guarantee line at `finalizer.rs:101`
opened and read. Spec: `docs/subject-proposal-declarative-resource-lifecycle.md` (EXECUTED).
Fleet: no project runs a control plane; tracklight's fence-token lease reclaim is the nearest
instance, named only in the application. Apply step is a source-tree task (uid precondition
on marker removal, tests where there were none). Deviations for the backlog: the removal
helper guards on name-at-index not minted identity; the finalizer module has zero tests; the
deadlock is documented without either operator escape; cascade shape is chosen implicitly.

## Architecture review - 2026-10-31

First architecture review, against `7b8db2118`. All six documents read in full. The
pinned kube-rs tree (`7a4641d`) was re-opened for every file the application cites, and
the upstream Kubernetes documentation for finalizers, owner references, server-side
apply and admission webhooks was read. The application's citations hold to the line,
with two exceptions recorded below. Server-side apply's documentation recommends the
opposite of one technique rule for one class of writer (a controller forcing on objects
it owns), and the finalizer documentation names a third shape of manual strip (cleanup
done by hand) that the deadlock section calls abandonment. The tracklight citation
(private) was not reopened. No verification date was refreshed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/declarative-resource-lifecycle",
  "date": "2026-10-31",
  "baseline": "7b8db2118",
  "digest": "sha256-b2:d17485a3a3a8ddea",
  "disposition": "clarify",
  "coverage": "All 6 documents read in full (golden path, four techniques, one rust application). Every kube-rs citation in the application was re-opened at the pinned commit 7a4641d (finalizer.rs, watcher.rs, kube-core params.rs, examples/secret_syncer.rs, Cargo.toml, kube/src/mock_tests.rs, kube/src/lib.rs). Four upstream Kubernetes documentation pages read. Not evaluated: the tree-wide claim that no other assertion names finalizers, the private tracklight citation, any runtime execution.",
  "counterexamples": [
    "A reconciling process that created a record and is its only legitimate writer is advised by the store's own documentation to force on every apply, because it cannot resolve a conflict; that is unconditional seizure that is not a design smell.",
    "An operator who cleans up the external dependent by hand and then strips the marker has not abandoned the cleanup and leaked nothing.",
    "The name-at-index removal race in the application cannot fire while this controller's own marker holds the old incarnation open; it needs a third party to strip that marker during the cleanup await.",
    "A fail-closed gate that is also the only path for writes needed to repair the gate (the narrowed-scope rule is what prevents this)."
  ],
  "sources": [
    {
      "url": "https://github.com/kube-rs/kube/blob/7a4641d4cc2f693b2dee97b9fc15fadb96d7f62e/kube-runtime/src/finalizer.rs",
      "result": "Confirms the four-arm match (138-231), 'Short-circuit, so that we keep the finalizer if cleanup fails' (153), the Test+Remove at /metadata/finalizers/{i} (156-176) with the rationale at 161-163, the guarded add with 'Kubernetes doesn't automatically deduplicate finalizers' (199-201), 'No point applying here, since the patch will cause a new reconciliation' (221), Guarantees at 101, Caveats at 114, zero #[test] items. PatchParams::default() on the removal; the Test is on the marker string only."
    },
    {
      "url": "https://github.com/kube-rs/kube/blob/7a4641d4cc2f693b2dee97b9fc15fadb96d7f62e/kube/src/mock_tests.rs",
      "result": "Line 97 comment 'We expect a json patch ... adding our finalizer' sits over a GET assertion, a 'limit=' assertion and an assertion that 'continue=' is ABSENT (98-101). The application says the GET carries continue=; it does not."
    },
    {
      "url": "https://github.com/kube-rs/kube/blob/7a4641d4cc2f693b2dee97b9fc15fadb96d7f62e/kube-core/src/params.rs",
      "result": "propagation_policy doc at 779-784, preconditions at 786-790, builder 841-844, field_manager length > 128 refused at 681 (supports the construction-time check). Watcher Event::Delete NOTE at watcher.rs 60-61, secret_syncer NOTE at 3-5, wiring 89-100, workspace rust-version 1.89.0 and version 4.2.0 in Cargo.toml all confirmed."
    },
    {
      "url": "https://kubernetes.io/docs/reference/using-api/server-side-apply/",
      "result": "Supports conflicts, forced transfer 'removes the field from all other managers' entries', shared ownership 'Any subsequent attempt to change the value of the shared field ... results in a conflict', and relinquishment 'either deleted from the live object or reset to its default value'. Counter-evidence: 'It is strongly recommended for controllers to always force conflicts on objects that they own and manage, since they might not be able to resolve or act on these conflicts.'"
    },
    {
      "url": "https://kubernetes.io/docs/concepts/overview/working-with-objects/finalizers/",
      "result": "Supports deletionTimestamp-then-wait. Names manual removal acceptable 'only ... when the purpose of the finalizer is understood and is accomplished in another way (for example, manually cleaning up some dependent object)' - a strip that is not an abandonment."
    },
    {
      "url": "https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/",
      "result": "Supports response 'uid, copied from the request.uid', warnings 'Limit warnings to 120 characters if possible', failurePolicy covering timeouts, 'An explicit rejection ... always denies ... regardless of the failurePolicy', validating after mutating. The store's default failurePolicy is Fail; the technique's per-rule-class choice stands as advice against inheriting it."
    },
    {
      "url": "https://kubernetes.io/docs/concepts/overview/working-with-objects/owners-dependents/",
      "result": "Supports owner reference by name plus UID and 'Cross-namespace owner references are disallowed by design.'"
    }
  ],
  "documents": {
    "declarative-resource-lifecycle.md": {
      "disposition": "keep",
      "reason": "Boundaries are explicit and each names its reader rule; the four contracts map one-to-one to techniques; the done bar is checkable. Upstream sources support every mechanism it summarises. 'Neither is a default' reads as design advice and holds against a store whose own default is fail-closed."
    },
    "techniques/deletion-blocked-until-dependents-confirm.md": {
      "disposition": "clarify",
      "reason": "The audited-strip escape calls every strip an abandonment that leaks the resource. The upstream finalizer documentation names the case where the cleanup was done by hand and then stripped. Say the strip records which of the two it is."
    },
    "techniques/ownership-edges-that-enqueue-the-parent.md": {
      "disposition": "keep",
      "reason": "Edge-on-child, parent-as-unit, identity over name, declared vs computed with its recomputation sweep, and the scope limit all match the upstream owner-reference semantics (name plus UID; cross-namespace disallowed)."
    },
    "techniques/per-field-write-ownership.md": {
      "disposition": "clarify",
      "reason": "Ledger, conflict, shared ownership and relinquishment match server-side apply's documentation. But 'a seizure that is unconditional in code is not a decision' and 'a process that seizes on every pass' contradict the documented recommendation that a controller force on every write to objects it owns. Scope the rule: unconditional seizure is legitimate for a writer that is the declared sole owner of the fields it states."
    },
    "techniques/synchronous-gate-before-persistence.md": {
      "disposition": "keep",
      "reason": "Availability policy per rule class, timeout as the down case, mutate-before-validate ordering, echoed identifier, short advisory channel and explicit refusal regardless of failure policy all match the admission-webhook documentation."
    },
    "applications/rust--deletion-blocked-until-dependents-confirm.md": {
      "disposition": "clarify",
      "reason": "Citations re-opened at 7a4641d and hold to the line. Two fixes: deviation 2 says the paginated GET carries 'continue='; the assertion is that it does not. Deviation 4 states the name-at-index race without its precondition: while this controller's marker sits on the old incarnation its deletion cannot complete, so the race needs a third party to strip that marker during the cleanup await. The tracklight citation and the tree-wide 'only assertions' claim were not re-checked; verified_on stays."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied the three clarify items the earlier 2026-10-31 record named. The two techniques
now carry the cases the upstream documentation names; the application's two wording
errors are fixed. The application keeps `reverify` for its private citation, which is
now the overall disposition.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/declarative-resource-lifecycle",
  "date": "2026-10-31",
  "baseline": "7b8db2118",
  "digest": "sha256-b2:10f14555ca4baa76",
  "disposition": "reverify",
  "coverage": "All 6 documents decided. The three clarify items from the earlier 2026-10-31 record were applied from sources opened this run (kube-rs at 7a4641d, the Kubernetes finalizer and server-side apply documentation) and the edited sections re-read. The golden path, ownership-edges and synchronous-gate are byte-unchanged. Not evaluated: the private tracklight citation, the tree-wide 'only assertions' claim, any runtime. No verification date was refreshed.",
  "counterexamples": [
    "A reconciling process that created a record and is its only legitimate writer is advised by the store's own documentation to force on every apply, because it cannot resolve a conflict; that is unconditional seizure that is not a design smell.",
    "An operator who cleans up the external dependent by hand and then strips the marker has not abandoned the cleanup and leaked nothing.",
    "The name-at-index removal race in the application cannot fire while this controller's own marker holds the old incarnation open; it needs a third party to strip that marker during the cleanup await.",
    "A fail-closed gate that is also the only path for writes needed to repair the gate (the narrowed-scope rule is what prevents this)."
  ],
  "sources": [
    {
      "url": "https://github.com/kube-rs/kube/blob/7a4641d4cc2f693b2dee97b9fc15fadb96d7f62e/kube-runtime/src/finalizer.rs",
      "result": "Confirms the four-arm match (138-231), 'Short-circuit, so that we keep the finalizer if cleanup fails' (153), the Test+Remove at /metadata/finalizers/{i} (156-176) with the rationale at 161-163, the guarded add with 'Kubernetes doesn't automatically deduplicate finalizers' (199-201), 'No point applying here, since the patch will cause a new reconciliation' (221), Guarantees at 101, Caveats at 114, zero #[test] items. PatchParams::default() on the removal; the Test is on the marker string only."
    },
    {
      "url": "https://github.com/kube-rs/kube/blob/7a4641d4cc2f693b2dee97b9fc15fadb96d7f62e/kube/src/mock_tests.rs",
      "result": "Line 97 comment 'We expect a json patch ... adding our finalizer' sits over a GET assertion, a 'limit=' assertion and an assertion that 'continue=' is ABSENT (98-101). The application says the GET carries continue=; it does not."
    },
    {
      "url": "https://github.com/kube-rs/kube/blob/7a4641d4cc2f693b2dee97b9fc15fadb96d7f62e/kube-core/src/params.rs",
      "result": "propagation_policy doc at 779-784, preconditions at 786-790, builder 841-844, field_manager length > 128 refused at 681 (supports the construction-time check). Watcher Event::Delete NOTE at watcher.rs 60-61, secret_syncer NOTE at 3-5, wiring 89-100, workspace rust-version 1.89.0 and version 4.2.0 in Cargo.toml all confirmed."
    },
    {
      "url": "https://kubernetes.io/docs/reference/using-api/server-side-apply/",
      "result": "Supports conflicts, forced transfer 'removes the field from all other managers' entries', shared ownership 'Any subsequent attempt to change the value of the shared field ... results in a conflict', and relinquishment 'either deleted from the live object or reset to its default value'. Counter-evidence: 'It is strongly recommended for controllers to always force conflicts on objects that they own and manage, since they might not be able to resolve or act on these conflicts.'"
    },
    {
      "url": "https://kubernetes.io/docs/concepts/overview/working-with-objects/finalizers/",
      "result": "Supports deletionTimestamp-then-wait. Names manual removal acceptable 'only ... when the purpose of the finalizer is understood and is accomplished in another way (for example, manually cleaning up some dependent object)' - a strip that is not an abandonment."
    },
    {
      "url": "https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/",
      "result": "Supports response 'uid, copied from the request.uid', warnings 'Limit warnings to 120 characters if possible', failurePolicy covering timeouts, 'An explicit rejection ... always denies ... regardless of the failurePolicy', validating after mutating. The store's default failurePolicy is Fail; the technique's per-rule-class choice stands as advice against inheriting it."
    },
    {
      "url": "https://kubernetes.io/docs/concepts/overview/working-with-objects/owners-dependents/",
      "result": "Supports owner reference by name plus UID and 'Cross-namespace owner references are disallowed by design.'"
    }
  ],
  "documents": {
    "declarative-resource-lifecycle.md": {
      "disposition": "keep",
      "reason": "Boundaries are explicit and each names its reader rule; the four contracts map one-to-one to techniques; the done bar is checkable. Upstream sources support every mechanism it summarises. 'Neither is a default' reads as design advice and holds against a store whose own default is fail-closed."
    },
    "techniques/deletion-blocked-until-dependents-confirm.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the audited-strip escape now records whether the strip is an abandonment (resource leaked, named) or a cleanup a person performed by hand (what they removed is named), per the upstream finalizer documentation."
    },
    "techniques/ownership-edges-that-enqueue-the-parent.md": {
      "disposition": "keep",
      "reason": "Edge-on-child, parent-as-unit, identity over name, declared vs computed with its recomputation sweep, and the scope limit all match the upstream owner-reference semantics (name plus UID; cross-namespace disallowed)."
    },
    "techniques/per-field-write-ownership.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: added the exception the store's own guidance names - a reconciling process writing fields of a record it created and alone maintains is advised to seize on every write; legitimate only while that sole-owner field set is written down, and a conflict outside it remains a refusal to read."
    },
    "techniques/synchronous-gate-before-persistence.md": {
      "disposition": "keep",
      "reason": "Availability policy per rule class, timeout as the down case, mutate-before-validate ordering, echoed identifier, short advisory channel and explicit refusal regardless of failure policy all match the admission-webhook documentation."
    },
    "applications/rust--deletion-blocked-until-dependents-confirm.md": {
      "disposition": "reverify",
      "reason": "applied 2026-10-31: deviation 2 now says the first-page GET asserts the ABSENCE of continue=; deviation 4 now states the race's precondition (a third party strips this controller's marker during the Cleanup await, since otherwise the old incarnation cannot finish deleting). Every kube-rs citation re-opened at 7a4641d holds; the private tracklight citation and the tree-wide 'only assertions' claim were not re-checked, so verified_on stays 2026-09-03."
    }
  }
}
```
