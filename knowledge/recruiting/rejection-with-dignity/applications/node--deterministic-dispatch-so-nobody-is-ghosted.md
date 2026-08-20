---
layer: application
type: application
subject: rejection-with-dignity
technique: deterministic-dispatch-so-nobody-is-ghosted
stack: node
status: forged
---

# The never-ghost promise across every reject surface

`dispatchRejection` (`app/_lib/comms-dispatch.ts:255-311`) is the single door.
Its doc comment states the design: "Deterministic, respectful template — no LLM,
so it works in a batch policy pass and never ghosts a rejected candidate", with
the reason for the no-model rule spelled out — "a fresh LLM call here would be
slow in a batch pass and would invent a rationale that was never the actual
reason."

Composition is fixed copy plus recorded facts: `t("rejection.opening")` +
an archetype-conditional middle (`isEarlyCareer(entry.archetype) ?
t("rejection.early") : t("rejection.standard")`, `messages/en.json:444-451`) +
the feedback block from `rejection-feedback.ts` + `t("rejection.closing")`. The
archetype branch is documented as "keeping the fairness lever consistent through
to the adverse comm" — the same early-career treatment that shaped the
assessment shapes the letter.

## A human rejects; the pass queues

`app/_lib/automation-pass.ts` records the retirement of unattended auto-reject
(`:319-324`, "AUTO1 RETIRED (UAT M6 / GDPR Art. 22)"): a rejection is "the one
irreversible" outcome, so "every fairness-cleared reject is queued for a human
on the Decisions gate". `AutomationSummary.rejected` is "structurally 0"
(`:123-128`) because the pass no longer produces a rejection — and the preview
was corrected to match, since forecasting N rejections and delivering N approval
cards is a preview that lies (`:296-302`).

A second backstop refuses a reject the fairness invariant protects and
downgrades it to a hold plus an alert rather than "silently auto-rejecting"
(`:349-358`) — the standard's rule that a reason category touching a protected
or unscored state sends the decision to review instead of to a letter.

The exact-set property lives at the bulk surface:
`app/api/pipeline/command/route.ts:90-93` intersects the recruiter's previewed
ids with the currently-matching set via `resolveRejectTargets` and reports
`droppedOut`, so an approval cannot silently widen between preview and commit.

## Isolation, and the surface that went silent

The bulk path (`app/api/pipeline/command/route.ts:105-130`) carries the incident
verbatim: "A bulk reject must NEVER ghost the candidate (UAT M3): the command bar
used to flip status + audit only, while the screen-wave notified — so the FASTEST
reject surface was the one that went silent." The fix is per-candidate
isolation — each `dispatchRejection` in its own `try`, a failure incrementing
`commsFailed` and writing a `rejection_comms_failed` event whose text is an
explicit human instruction ("Rejected via command bar, but the notification
failed to queue — nudge manually") — "so one comms blip neither aborts the batch
nor hides who wasn't told." `screen-wave.ts:429` dispatches on the same door
(`{ automated: true }`, commented "queued, never ghosts").

## The obligation before the record exists

`dispatchKnockoutDecline` (`comms-dispatch.ts:299-341`) is entry-less by design:
channel leads are declined at `lead-intake.ts:124-155` *before* any pipeline
entry exists, so "the one identity in hand is the inbound email". The comment
names the exact person the standard cares about: it exists "for webhook surfaces
whose candidate saw 'submitted' on a third-party board and would otherwise hear
nothing, ever" —
and `lead-intake.ts:133-136` states the priority: "The adverse outcome is where
the never-ghost promise matters most."

`intakeSubmission` (`app/_lib/distribution.ts:104-140`) shows the durable-marker
rule worked out under failure: the acknowledgement is gated on whether an outbox
row exists, **not** on the one-shot `created` flag, because `sendComm` records
that row as its last step — "if the first attempt's sendComm threw … the row is
absent and the submission was persisted un-acknowledged", and the old flag-based
gate "dropped the ack forever". The tradeoff is stated and chosen: "At-least-once
for the candidate ack — a rare concurrent double-submit may send twice, a benign
duplicate, unlike the silent permanent drop it replaces." The same file closes an
internal route that bypassed the closed-posting check and "silently re-ghosted
candidates the close-out exists to protect" by moving the guard into shared core
— the enumerate-every-surface rule realized as one chokepoint.

Measurement exists too: `app/_lib/candidate-nps.ts:1-22` was written because the
never-ghost claim "is currently an assertion", captures a candidate-side score
"at the only honest moment (a terminal outcome)", and refuses to render below
`NPS_MIN_SAMPLE = 10`.

## Deviations

- **No sweep for the outstanding obligation.** Every reject *path* dispatches,
  but nothing scans for terminal-state entries with no rejection comm on record.
  The system is therefore correct-by-construction rather than
  correct-by-verification: a future seventh reject surface that forgets to call
  the dispatcher produces silent ghosting with no detector, which is exactly how
  the command-bar defect (UAT M3) survived until a test run found it. The
  standard wants the sweep and the oldest-outstanding-obligation metric.
- **The knockout decline swallows its failure.** `lead-intake.ts:148-154` logs a
  failed `dispatchKnockoutDecline` to the console only — no
  `rejection_comms_failed`-style event, unlike the command-bar path — so the one
  message owed to a person with no pipeline record is also the one whose failure
  leaves no trace a recruiter will see.
- **Shipped copy promises retention it does not state.** Both letter variants
  (`messages/en.json:447-448`) say "We'll keep your profile on file" while the
  same system enforces consent expiry and anonymization
  (`candidateOutreachSuppression`, `comms-dispatch.ts:223-227`). The standard's
  honest-warmth rule asks for the actual retention window, or for the sentence to
  go.
