---
domain: software-engineering
subject: cicd-monitoring
last_touched: 2026-09-26
touched_by: deepen
dry_streak: 0
depth: L2
---

# cicd-monitoring

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-09-26 - `/deepen`, first pass (dp-cim-0926)

Dispatched by the Curator lane on "single stack (react)". There were four
lanes:
- a read of the one fleet tree whose map joins this subject: Personas' Rust
  backend, which holds the GitLab token and serves the job log, the
  deployment ledger and the deploy/rollback acts;
- a re-read of the react applications' tree for drift since 2026-08-18;
- web counter-evidence on six claims, against provider docs only;
- a blind training-data lane.

**Counter-evidence: two claims refuted as stated, four conditioned.**
- "A finished pipeline's status is immutable" / "terminal runs are immutable,
  cache hard": refuted as stated. Both major providers reuse the id. One
  allows up to 50 re-runs within 30 days under the same run id and serves
  each attempt separately. The other retries into the same pipeline id,
  back through pending. What is immutable is (run, attempt).
- "Every observation spends someone else's budget": refuted for one
  provider. An authorized 304 does not count against its primary limit.
  The other documents no public conditional support, so the claim holds
  there.
- "Most observer-side monitors never get [push]": conditioned and
  re-reasoned. Both providers have pipeline and job webhooks. Observers
  lack admin rights on the watched repository and lack a reachable
  endpoint, and failed deliveries are not redelivered automatically, so
  polling reconciles.
- The canonical status set: conditioned. A parked member was missing
  (manual gate, approval up to 30 days, schedule, held resource). One
  provider's state is two axes (status + conclusion). `canceling` is
  transitional, not terminal.
- "The request returns an identifier": conditioned. Manual dispatch on one
  provider returned no body until February 2026 and still does unless the
  caller opts in. Re-runs reuse the id. The other provider's cancel answers
  200 in any state.
- Retry as a small-blast action: conditioned. "Re-run failed jobs" also
  re-runs their dependents, so the retry takes the rung of its highest
  dependent.

**Convergence.** The web lane and the blind lane independently reached
three things: per-attempt terminality (with the dedup consequence, which
the blind lane named first), the free 304 on one provider only, and the
parked class with idle-cadence polling and a separate "needs you"
notification. Push-as-hint also converged. The dispatch-id change is web
only; the blind lane held it at low confidence. No new technique was
earned: every convergence landed as a condition on an existing one.

**Tree read.** The joined tree's react side has changed since the forge.
`gitlab_get_job_log` was implemented on 2026-09-17, bounded at 64 KiB
(1 MiB cap) and painted at 200 lines, but it still carries no truncation
marker. The other four pipeline commands have been unregistered since
2026-03-13, so the viewer, the poll loop and the notifier still cannot run.
The Rust side gave the second stack, and three findings no lane predicted:
- a deploy/rollback fallback that turns any error into a commit on the
  default branch;
- an undeploy that writes no history row, so the status fold labels a
  deliberate removal `failed`;
- a hardcoded `"success"` result column.

**Landed** (b49b2c0f):
- three rust applications (failure-drill-down, deployment-history,
  remote-action-consent), `verified_on: 2026-09-26`,
  `verified_against: rust@1`;
- conditions in all six techniques and four golden-path paragraphs;
- two react applications corrected, with every citation re-checked
  (failure-drill-down, liveness-scoped-polling).

The other three react applications keep `verified_on: 2026-08-18`. Their
citations were not re-checked this run.

**Applied** (5 rows in [[applied]]):
- simulation better: per-attempt terminality and the attempt in the dedup
  key, over Personas' real classifier with three documented sequences;
- simulation better: the parked class, same model;
- simulation better: the fallback-is-a-different-act rule over the Rust
  deploy's three error classes;
- 2 unapplied: conditional requests (no fleet project polls a provider that
  answers them), and push (no fleet project receives CI webhooks).

No code was committed in Personas. Its checkout had 85 modified files and
an uncommitted 18k-line map rebuild from another session, so its tree and
its map were left alone.

## Impact

Personas: two contexts join this subject, `agents-deployment` and
`plugins-gitlab`. Both are at revision 2 in a map built to a scratch file
at registry b49b2c0f, and both are unjudged (`state: unknown`), so there
are 0 stale verdicts. **Owed:** rebuild Personas' committed
`.ai/registry-map.json` once the session holding it has committed or
dropped its rebuild. `/conform` on those two contexts is the first
judgment either has had.

## Leads banked

- **Personas: the unlabelled cut.** `get_job_trace` should return (text,
  truncated, size), and `gitlabFetchJobLog` should keep an error state
  apart from the loading skeleton. Return: the next time the log rung is
  touched, or when the pipeline commands are registered.
- **Personas: the fallback act.** Narrow `Err(_)` to "Duo API not
  available" and offer the `AGENTS.md` commit as its own confirmed action;
  write an `undeployed` row. Return: a quiet Personas tree, as a `code`
  row.
- **The Range header on the job-log read.** Whether it is honoured is
  undocumented. One live request with a token would settle it. Return:
  when a GitLab token is available to a run.

## Declined

- "A capability is declared by the executing side, not by the UI" (from the
  react surface for unregistered commands). There is one source and no
  second lane reached it, so it stays in the application, not the
  technique.
