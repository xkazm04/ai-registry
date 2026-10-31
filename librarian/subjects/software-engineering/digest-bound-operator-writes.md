---
subject: digest-bound-operator-writes
domain: software-engineering
last_touched: 2026-10-31
touched_by: architecture-review
---

# digest-bound-operator-writes

## Architecture review - 2026-10-31

First architecture review. All eight documents were read in full and their
relative links resolve. Both applications' anchors were re-checked line by line
against the public tree at `009c7893`: every quoted line is where the document
says it is. GitLab's repository-files documentation was opened for the token
claims, and GitLab's update service for the mismatch refusal.

One internal tension. The preview-id technique makes a `cut` row claimable
(step 3) and also calls `cut` unknown. The node application lists the reclaim as
a gap "against the technique", which it is not. The reclaim happens only after
the confirm has re-planned and found the same digest. It is also required:
recovery from `unknown` is a fresh preview, and a fresh preview of an unchanged
world produces the same content-digest id. The real residual is narrower. A lost
write whose landing changes nothing the plan reads can run twice.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/digest-bound-operator-writes",
  "date": "2026-10-31",
  "baseline": "ee24c7af4",
  "digest": "sha256-b2:8a5088fa9138a80f",
  "disposition": "clarify",
  "coverage": "All 8 documents (golden path, 5 techniques, 2 node applications) read in full. Relative links and law anchors resolve. Every anchor in both applications was re-checked against the raw files of the public tree at commit 009c7893. Not evaluated: running that tree or its tests, and any GitLab instance's behaviour beyond its documentation and source.",
  "counterexamples": [
    "A confirm whose answer was lost after a branch creation re-plans, and the plan's 'name is free' check now refuses. The reclaim of the cut id never runs anything. Re-planning, not the journal state, is what stops the blind resend.",
    "A lost write that changes nothing the plan reads can land twice through a fresh preview: same reads, same digest, claimable cut row. An append with no token and no name check is the case.",
    "GitLab's update-file call refuses a stale last_commit_id with FileChangedError ('You are attempting to update a file that has changed since you started editing it.'). Its docs document only a generic 400 on a failed commit, so the status code is observed or sourced, not documented.",
    "A transport timeout labelled 'write outcome unknown' in its message still answers status failed, and the journal stores failed as safe to run again (node application, retained)."
  ],
  "sources": [
    {
      "url": "https://docs.gitlab.com/api/repository_files/",
      "result": "last_commit_id on update and delete: 'Last known file commit ID.' (optional). Create takes no last_commit_id. Update and create answer only {\"file_path\", \"branch\"}, which supports the read-back of the commit. No status is documented for a mismatch, only 'If the commit fails for any reason, the API returns a 400 Bad Request error with a non-specific error message.'"
    },
    {
      "url": "https://gitlab.com/gitlab-org/gitlab/-/raw/master/app/services/files/update_service.rb",
      "result": "validate! raises FileChangedError, 'You are attempting to update a file that has changed since you started editing it.', when file_has_changed?. This supports the remote refusing a stale token."
    },
    {
      "url": "https://github.com/xkazm04/afterlife/tree/009c7893",
      "result": "Raw files read: run.ts, runs/journal.ts, setup/run.ts, actions/README.md, plans/context.ts, plans/revoke.ts, gitlab/adapter/client.ts, three tests, slot.ts. All cited lines match. Confirmed that confirm() re-plans and compares the digest before once() claims. The claim's where clause admits failed, cut, a foreign-boot running row and a done row older than RECALL_MS. The digest JSON covers kind, proposal and argv. COMMIT_ID is 40 or 64 hex."
    }
  ],
  "documents": {
    "digest-bound-operator-writes.md": {
      "disposition": "keep",
      "reason": "The five rules and the boundary against cicd-monitoring, hitl-approval, delivery-guarantees and concurrency-guards are consistent with the techniques. The recall paths match the preview-id technique."
    },
    "techniques/plan-twice-run-if-unchanged.md": {
      "disposition": "keep",
      "reason": "Intent-not-command, a digest including local side effects, run-nothing-on-changed, the issued-preview record and canonicalization are all sound. It states its residual window and defers it to the token technique."
    },
    "techniques/precondition-token-on-every-write.md": {
      "disposition": "keep",
      "reason": "Read the token with the content, no token means no plan, the token in the digest, and never auto-retry with a fresh token. The GitLab docs and update service support the mechanism. The no-conditional-write fallback is scoped separately from 'offered but not returned'."
    },
    "techniques/preview-id-claim-and-recall.md": {
      "disposition": "clarify",
      "reason": "Step 3 makes failed and cut rows claimable without saying why that is safe for a row it calls unknown. Add the reason: the confirm has re-planned and matched the digest before it claims, and the unknown-to-fresh-preview recovery yields the same id for an unchanged world, so blocking it would block that recovery. Name the residual: a lost write whose landing changes no read the plan makes."
    },
    "techniques/record-before-each-command.md": {
      "disposition": "keep",
      "reason": "Per-command row before send, refuse when the insert fails, unknown when the finish fails, and acting identity as the remote records it. The node application confirms the shape at run.ts:116-127."
    },
    "techniques/unretried-write-unknown-outcome.md": {
      "disposition": "keep",
      "reason": "The refused / not-sent / unknown classification at the transport and the status-not-message rule are sound. The node application's timeout leak is a correctly reported deviation, not a defect in the technique."
    },
    "applications/node--plan-twice-run-if-unchanged.md": {
      "disposition": "clarify",
      "reason": "All anchors re-checked and correct. The second gap overstates: 'a direct second confirm of a cut id would run' happens only after confirm() re-plans and matches the digest (run.ts:182 before once()), the same path the documented fresh preview takes. Restate the gap as the residual for a lost write that changes no read."
    },
    "applications/node--precondition-token-on-every-write.md": {
      "disposition": "keep",
      "reason": "All anchors re-checked and correct, including COMMIT_ID (40 or 64 hex), the timeout message at client.ts:89, and the exit-1 path at run.ts:121 leading to failed at :140. The project's '(400)' is its own claim. GitLab documents only a generic 400 for a failed commit, which is consistent."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied both clarify items from the record above. The preview-id technique now
says why a cut row may be reclaimed, and the node application's gap is restated
as the narrow residual. Both applications' verified_on dates moved to 2026-10-31
because every anchor was re-checked against 009c7893 this run. Nothing is owed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/digest-bound-operator-writes",
  "date": "2026-10-31",
  "baseline": "ee24c7af4",
  "digest": "sha256-b2:ad43ab360eb75ff6",
  "disposition": "keep",
  "coverage": "All 8 documents decided. The two clarify items from the first 2026-10-31 record were applied and re-read. Both applications had their anchors re-checked against commit 009c7893 this run, so verified_on moved to 2026-10-31. The other six documents are byte-unchanged and keep their dispositions. Not evaluated: running the tree or its tests.",
  "counterexamples": [
    "A confirm whose answer was lost after a branch creation re-plans, and the plan's 'name is free' check now refuses. The reclaim of the cut id never runs anything. Re-planning, not the journal state, is what stops the blind resend.",
    "A lost write that changes nothing the plan reads can land twice through a fresh preview: same reads, same digest, claimable cut row. An append with no token and no name check is the case.",
    "GitLab's update-file call refuses a stale last_commit_id with FileChangedError ('You are attempting to update a file that has changed since you started editing it.'). Its docs document only a generic 400 on a failed commit, so the status code is observed or sourced, not documented.",
    "A transport timeout labelled 'write outcome unknown' in its message still answers status failed, and the journal stores failed as safe to run again (node application, retained)."
  ],
  "sources": [
    {
      "url": "https://docs.gitlab.com/api/repository_files/",
      "result": "last_commit_id on update and delete: 'Last known file commit ID.' (optional). Create takes no last_commit_id. Update and create answer only {\"file_path\", \"branch\"}, which supports the read-back of the commit. No status is documented for a mismatch, only 'If the commit fails for any reason, the API returns a 400 Bad Request error with a non-specific error message.'"
    },
    {
      "url": "https://gitlab.com/gitlab-org/gitlab/-/raw/master/app/services/files/update_service.rb",
      "result": "validate! raises FileChangedError, 'You are attempting to update a file that has changed since you started editing it.', when file_has_changed?. This supports the remote refusing a stale token."
    },
    {
      "url": "https://github.com/xkazm04/afterlife/tree/009c7893",
      "result": "Raw files read: run.ts, runs/journal.ts, setup/run.ts, actions/README.md, plans/context.ts, plans/revoke.ts, gitlab/adapter/client.ts, three tests, slot.ts. All cited lines match. Confirmed that confirm() re-plans and compares the digest before once() claims. The claim's where clause admits failed, cut, a foreign-boot running row and a done row older than RECALL_MS. The digest JSON covers kind, proposal and argv. COMMIT_ID is 40 or 64 hex."
    }
  ],
  "documents": {
    "digest-bound-operator-writes.md": {
      "disposition": "keep",
      "reason": "The five rules and the boundary against cicd-monitoring, hitl-approval, delivery-guarantees and concurrency-guards are consistent with the techniques. The recall paths match the preview-id technique."
    },
    "techniques/plan-twice-run-if-unchanged.md": {
      "disposition": "keep",
      "reason": "Intent-not-command, a digest including local side effects, run-nothing-on-changed, the issued-preview record and canonicalization are all sound. It states its residual window and defers it to the token technique."
    },
    "techniques/precondition-token-on-every-write.md": {
      "disposition": "keep",
      "reason": "Read the token with the content, no token means no plan, the token in the digest, and never auto-retry with a fresh token. The GitLab docs and update service support the mechanism. The no-conditional-write fallback is scoped separately from 'offered but not returned'."
    },
    "techniques/preview-id-claim-and-recall.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: added a decision rule explaining why cut and failed rows are claimable. The claim follows the second plan, and the unknown-to-fresh-preview recovery yields the same id for an unchanged world. The rule names the residual: a lost write whose landing changes nothing the plan reads."
    },
    "techniques/record-before-each-command.md": {
      "disposition": "keep",
      "reason": "Per-command row before send, refuse when the insert fails, unknown when the finish fails, and acting identity as the remote records it. The node application confirms the shape at run.ts:116-127."
    },
    "techniques/unretried-write-unknown-outcome.md": {
      "disposition": "keep",
      "reason": "The refused / not-sent / unknown classification at the transport and the status-not-message rule are sound. The node application's timeout leak is a correctly reported deviation, not a defect in the technique."
    },
    "applications/node--plan-twice-run-if-unchanged.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the cut-reclaim gap now says the reclaim matches the technique (re-plan and compare at run.ts:182 before once claims) and names the narrow residual, replacing 'a direct second confirm of a cut id would run'. verified_on moved to 2026-10-31 after a full anchor re-check."
    },
    "applications/node--precondition-token-on-every-write.md": {
      "disposition": "keep",
      "reason": "All anchors re-checked and correct, including COMMIT_ID (40 or 64 hex), the timeout message at client.ts:89, and the exit-1 path at run.ts:121 leading to failed at :140. The project's '(400)' is its own claim. GitLab documents only a generic 400 for a failed commit, which is consistent. verified_on moved to 2026-10-31 after the anchor re-check."
    }
  }
}
```
