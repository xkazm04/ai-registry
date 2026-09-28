---
layer: application
type: application
subject: candidate-status-transparency
technique: terminal-moment-experience-measurement
stack: node
verified_on: 2026-09-28
verified_against: node@24
---

# Candidate NPS as the instrumentation of a no-ghosting claim (Node + SQLite)

Four files: the pure scoring rules (`app/_lib/candidate-nps.ts`), the store
(`app/_lib/candidate-nps-store.ts`), the schema (`app/_lib/db/core.ts`, the
`candidate_nps` table at `:1971-1984` in the committed tree), and the
token-gated capture route (`app/api/status/[token]/nps/route.ts`), with the
card at `app/status/[token]/StatusNpsCard.tsx`. Re-read at kp `6f3fca44d`.

## Why it exists, in the repo's own words

`candidate-nps.ts:3-7`: the product "argues that a candidate who is told WHY
they were rejected has a better experience than one who is ghosted
(rejection-feedback.ts). **That is currently an assertion.** … so this captures
one at the only honest moment (a terminal outcome)". That sentence is the
technique's whole thesis, written by someone who noticed their own unmeasured
claim.

## Terminal-only, enforced server-side twice

`nps/route.ts:34-37` computes `asked` from
`isTerminalCandidateStatus(candidateStatusFor(...))` — the *same* projection the
status page uses, so the question's eligibility and the displayed outcome
cannot disagree. The comment says "hired / not selected", but the terminal set
also includes `withdrawn` (`application-status.ts:91-93`), so a candidate who
turned an offer down is asked too. That is the right population. The comment
is narrower than the code.

The POST re-checks and **refuses** rather than storing quietly (`:67-69`):
"Refuse rather than silently store: a response captured mid-process would be
folded into a 'candidate experience' figure that claims to measure completed
journeys." Since 2026-09-03 the refusal is the coded
`STATUS_NPS_NOT_APPLICABLE` 409, and the body is capped at 8 KB counted on the
bytes actually read (`:55-57`, `:71-72`).

## One response per application, in the schema

The table comment (`core.ts:1973-1976`) makes `entry_id` the PRIMARY KEY: "one
response per application, so a link-holder cannot ballot-stuff their own
outcome. A resubmit REPLACEs (people change their mind before they hit send
twice); the original created_at is not preserved because a rewritten answer is
a new answer." The store implements exactly that with
`ON CONFLICT(entry_id) DO UPDATE` (`candidate-nps-store.ts:21-24`).

## Absent input is not a zero

`parseNpsSubmission` (`candidate-nps.ts:63-81`) refuses coercion, with the trap
spelled out at `:66-68`: "Number(null), Number(""), Number("  ") and
Number([]) are all 0 — a valid-looking detractor the candidate never chose."
Refusals are codes, not English reasons (`:48-61`). The comment cap
(`NPS_COMMENT_MAX = 500`, `:15-17`) keeps the column from being "a
data-exfiltration channel by whoever holds the token".

## The sample floor, and two figures

`NPS_MIN_SAMPLE = 10` (`:19-21`): "Below this many responses a cNPS is noise:
the metric is a difference of proportions, so a handful of answers swings it by
tens of points." `summarizeNps` (`:84-113`) withholds the score below the
floor "rather than shown with a caveat: unlike a duration, an NPS is a
difference of proportions and reads as authoritative at any sample size"
(`:106-107`).

`rawScore` is a *separate* field, "For consumers that carry their own
publish/withhold policy … never for direct display" (`:38-41`), alongside
`mean` (`:42-44`). The metric pack consumes it under the same floor
(`metric-pack.ts:289-302`). Two named fields rather than one flag-controlled
field — the shape the standard prescribes, learned here.

The floor's own comment is right about the size of the swing, and the
standard now adds the consequence: at ten answers the 95% interval on the
figure is roughly ±40 points. Past the floor the figure is displayed with its
response count and no interval.

## Asked once, then thanked

`StatusNpsCard.tsx:14-16`: "Once answered it thanks and stops asking, so a
candidate who polls the page for weeks is never re-prompted." The answered
state is read from the server (`candidateNpsFor`, store `:30-35`), not from
client state.

## Deviations

- **The terminal outcome is not recorded with the response** (still open).
  `candidate_nps` holds entry id, score, comment, timestamp and workspace, and
  `candidateNpsSummary` (store `:39-48`) cannot split by outcome, so a team
  that hires a lot reads a flattered average. The pattern is already in the
  tree: the newer `interview_letters` table stores
  `outcome TEXT NOT NULL CHECK(outcome IN ('not_selected','hired'))`
  (`core.ts:1548`). It was not carried over to NPS.
- **Response rate is not tracked** (still open). The metric pack carries
  `responses` and the floor, and no count of terminal outcomes reached, so the
  collapse signal is unavailable.
- **No interval travels with the figure.** The metric pack publishes the score
  and its response count.
