---
layer: application
type: application
subject: candidate-status-transparency
technique: terminal-moment-experience-measurement
stack: node
verified_on: 2026-08-20
---

# Candidate NPS as the instrumentation of a no-ghosting claim (Node + SQLite)

Four files: the pure scoring rules (`app/_lib/candidate-nps.ts`), the store
(`app/_lib/candidate-nps-store.ts`), the schema
(`app/_lib/db/core.ts:1006-1020`), and the token-gated capture route
(`app/api/status/[token]/nps/route.ts`), with the card at
`app/status/[token]/StatusNpsCard.tsx`.

## Why it exists, in the repo's own words

`candidate-nps.ts:1-8`: the product "argues that a candidate who is told WHY
they were rejected has a better experience than one who is ghosted
(rejection-feedback.ts). **That is currently an assertion.** … so this captures
one at the only honest moment (a terminal outcome)". That sentence is the
technique's whole thesis, written by someone who noticed their own unmeasured
claim.

## Terminal-only, enforced server-side twice

`nps/route.ts:33-37` computes `asked` from
`isTerminalCandidateStatus(candidateStatusFor(...))` — the *same* projection the
status page uses, so the question's eligibility and the displayed outcome
cannot disagree. The comment: asking mid-process "would both be premature and
read as pressure while their application is still live."

The POST re-checks and **refuses** rather than storing quietly (`:62-64`):
"Refuse rather than silently store: a response captured mid-process would be
folded into a 'candidate experience' figure that claims to measure completed
journeys." A 409, not a silent write — this is the technique's out-of-window
rule, and it is the version an expert draft usually gets wrong by simply not
firing the prompt and trusting the client.

## One response per application, in the schema

`db/core.ts:1013-1018` makes `entry_id` the PRIMARY KEY, commented: "one
response per application, so a link-holder cannot ballot-stuff their own
outcome. A resubmit REPLACEs (people change their mind before they hit send
twice); the original created_at is not preserved because a rewritten answer is
a new answer." The store implements exactly that with
`ON CONFLICT(entry_id) DO UPDATE` (`candidate-nps-store.ts:21-25`).

The uniqueness lives in the store, not the page — which is the point, given
the access key is a forwardable link.

## Absent input is not a zero

`parseNpsSubmission` (`candidate-nps.ts:48-68`) refuses coercion, with the trap
spelled out: "`Number(null)`, `Number("")`, `Number("  ")` and `Number([])` are
all 0 — a valid-looking detractor the candidate never chose." It accepts a real
number or a non-empty trimmed string and rejects everything else. On a 0–10
promoter scale, the coerced value is the single most damaging one, which is why
this is the law about absence rather than a validation nicety. The comment cap
(`NPS_COMMENT_MAX = 500`, `:16-18`) is justified as keeping the column from
being "a data-exfiltration channel by whoever holds the token".

## The sample floor, and two figures

`NPS_MIN_SAMPLE = 10` (`:20-22`): "Below this many responses a cNPS is noise:
the metric is a difference of proportions, so a handful of answers swings it by
tens of points." `summarizeNps` (`:70-98`) returns `score: belowSampleFloor ?
null : rawScore` — withheld, "rather than shown with a caveat: unlike a
duration, an NPS is a difference of proportions and reads as authoritative at
any sample size."

`rawScore` is a *separate* field, documented as "For consumers that carry their
own publish/withhold policy … never for direct display" (`:36-39`), alongside
`mean` "because '4.6/5'-style claims are what buyers compare". Two named
fields rather than one flag-controlled field — the shape the standard now
prescribes, learned here.

## Asked once, then thanked

`StatusNpsCard.tsx:6-14`: "Once answered it thanks and stops asking, so a
candidate who polls the page for weeks is never re-prompted." The answered
state is read from the server (`candidateNpsFor`, store `:28-35`), not from
client state, so clearing cookies does not restart the nagging.

## Deviations

- **Terminal outcome is not recorded with the response.** `candidate_nps`
  stores score, comment, timestamp and workspace — not whether the application
  ended in a hire or a decline — so the summary cannot be split by outcome and
  a team that hires a lot reads a flattered average. The standard's rule 7
  stands.
- **Response rate is not tracked.** There is no denominator of terminal
  outcomes reached against responses received, so the collapse signal the
  standard asks for is unavailable.
