---
layer: application
type: application
subject: rejection-with-dignity
technique: deterministic-dispatch-so-nobody-is-ghosted
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
---

# The never-ghost promise across every reject surface

`dispatchRejection` (`app/_lib/comms-dispatch.ts:549-591`) is the single door.
Its doc comment states the design: "Deterministic, respectful template — no LLM,
so it works in a batch policy pass and never ghosts a rejected candidate", with
the reason for the no-model rule spelled out — "a fresh LLM call here would be
slow in a batch pass and would invent a rationale that was never the actual
reason."

Composition is fixed copy plus recorded facts: `t("rejection.opening")` +
an archetype-conditional middle (`isEarlyCareer(entry.archetype) ?
t("rejection.early") : t("rejection.standard")`, `:554`) +
the feedback block from `rejection-feedback.ts` + `t("rejection.closing")`. The
archetype branch is documented as "keeping the fairness lever consistent through
to the adverse comm" — the same early-career treatment that shaped the
assessment shapes the letter.

## A human rejects; the pass queues

`app/_lib/automation-pass.ts` records the retirement of unattended auto-reject
(`:425-432`, "AUTO1 RETIRED (UAT M6 / GDPR Art. 22)"): a rejection is "the one
irreversible" outcome, so "every fairness-cleared reject is queued for a human
on the Decisions gate". `AutomationSummary.rejected` is "structurally 0"
(`:159`) because the pass no longer produces a rejection — and the preview
was corrected to match, since forecasting N rejections and delivering N approval
cards is a preview that lies.

A second backstop refuses a reject the fairness invariant protects and
downgrades it to a hold plus an alert rather than "silently auto-rejecting"
(`:482`) — the standard's rule that a reason category touching a protected
or unscored state sends the decision to review instead of to a letter.

The exact-set property lives at the bulk surface:
`app/api/pipeline/command/route.ts:155-159` intersects the recruiter's previewed
ids with the currently-matching set via `resolveRejectTargets` and reports
`droppedOut`, so an approval cannot silently widen between preview and commit.

## Isolation, and the surface that went silent

The incident the standard is built on has been refactored away, and the lesson
now lives in structure. On 2026-08-20 the bulk path carried its own dispatch
loop with a comment recording it ("A bulk reject must NEVER ghost the candidate
(UAT M3): the command bar used to flip status + audit only, while the
screen-wave notified — so the FASTEST reject surface was the one that went
silent"; that comment no longer exists in the tree, and the UAT M3 label survives
only in `pipeline-command.ts:70`). That loop is gone: the command bar's `execute.ts` now calls the same
`runPipelineEntryAction` as a single reject, so a human reject has ONE dispatch
site (`app/_lib/pipeline-entry-action.ts:531-570`), and the only other caller of
`dispatchRejection` is the screen wave (`screen-wave.ts:610`, `{ automated: true
}`, "queued, never ghosts"). Two doors where there were three-plus is the
enumerate-every-surface rule realised as a chokepoint rather than a checklist.

Both doors keep the per-candidate isolation and count two failure signals, a
throw and a resolved dead letter (`outcome.claim === "failed"`, because the relay
records `failed` and returns, which a `catch` alone reads as notified). Each
writes a `rejection_comms_failed` event whose text is an explicit human
instruction ("Rejected via command bar, but the notification failed to queue —
nudge manually"), and the 200 carries `commsFailed: true`, so one comms blip
neither aborts the batch nor hides who wasn't told. A `refused` verdict (an agent
on the slate, no mailbox by design) writes neither marker, so a non-send is not
counted as a failure.

## The obligation before the record exists

`dispatchKnockoutDecline` (`comms-dispatch.ts:638-`) is entry-less by design:
channel leads are declined at `lead-intake.ts:122-155` *before* any pipeline
entry exists, so "the one identity in hand is the inbound email". The comment
names the exact person the standard cares about: it exists "for webhook surfaces
whose candidate saw 'submitted' on a third-party board and would otherwise hear
nothing, ever" — and `lead-intake.ts:133-136` states the priority: "The adverse
outcome is where the never-ghost promise matters most." Its tenant is passed in
by the caller, because with no entry there is nothing for the outbox row to
derive a workspace from, and the row used to land in the default team's board.

`intakeSubmission` (`app/_lib/distribution.ts:106-`) shows the durable-marker
rule worked out under failure: the acknowledgement is gated on whether an outbox
row exists, **not** on the one-shot `created` flag, because `sendComm` records
that row as its last step, and the old flag-based gate "dropped the ack forever"
(`:135`). The tradeoff is stated and chosen (`:137`): at-least-once for the
candidate ack, a benign duplicate rather than a silent permanent drop. The same
file closes an internal route that bypassed the closed-posting check and
"silently re-ghosted candidates the close-out exists to protect" (`:117`) by
moving the guard into shared core.

Measurement exists too: `app/_lib/candidate-nps.ts:1-22` was written because the
never-ghost claim "is currently an assertion", captures a candidate-side score
"at the only honest moment (a terminal outcome)", and refuses to render below
`NPS_MIN_SAMPLE = 10` (`:21`).

## Deviations

Re-checked 2026-09-29 against the tree; two of the three recorded on 2026-08-20
still stand.

- **No sweep for the outstanding obligation.** Still absent. Every reject path
  dispatches, and there are now two doors rather than several, but nothing scans
  for terminal-state entries with no rejection comm on record, and no
  oldest-outstanding-obligation metric exists (a search for a sweep, an
  "oldest"/"owed" marker and an unnotified counter found none). The system is
  correct by construction, not by verification: a third door that forgets to call
  the dispatcher produces silent ghosting with no detector.
- **The knockout decline still swallows its failure.** `lead-intake.ts:148-154`
  logs a failed `dispatchKnockoutDecline` to the console only. There is no
  `rejection_comms_failed`-style event, unlike both entry-bound doors, so the one
  message owed to a person with no pipeline record is the one whose failure
  leaves no trace a recruiter will see. The caller also ignores a resolved
  dead letter (`claim === "failed"`) that the two other doors now count.
- **Shipped copy still promises retention it does not state.** Both variants
  (`comms.rejection.early` / `.standard` in `messages/en.json`) still say "We'll
  keep your profile on file", while the system enforces consent expiry and
  anonymization. The standard's honest-warmth rule asks for the actual retention
  window, or for the sentence to go. The regulator guidance found on 2026-09-29
  makes the omission sharper: a stated window must not sit inside a legal hold,
  and the window belongs on the application form.
- **New: a requested feedback letter exists, and it is not the dispatch pass.**
  The pull-based letter (see the feedback-letter application in this folder)
  follows a human decision and a candidate's request, so it does not touch the
  never-ghost obligation, which is still met by the unsolicited decline.
