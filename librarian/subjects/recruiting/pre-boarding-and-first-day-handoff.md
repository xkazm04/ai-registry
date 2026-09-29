---
domain: recruiting
subject: pre-boarding-and-first-day-handoff
last_touched: 2026-09-29
touched_by: deepen
dry_streak: 0
depth: L2
---

# pre-boarding-and-first-day-handoff

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-09-29 - `/deepen`, first pass (dp-pbh-0929)

Dispatched on "never swept by the librarian", registry HEAD 2cfe873e, worked from
origin/main f7bb4e05 in a detached worktree. Read the one tree both applications cite,
kp at 52363b016 (Node 24, Next 16). No external research lanes: the golden path's claims
are design rules and product judgment, and the measurable drift was all in the tree.
Depth stays at L2.

**Changed.**

- `the-live-stage-gates-the-handoff` (node application rewritten, every line number
  re-resolved; `verified_on` moved, `verified_against: node@24` added). The acceptance
  path no longer treats "the entry advanced" as "the candidate is hired": the hire-bearing
  effects hang off the *crossing* onto the terminal role, resolved before and after the
  response, because a workspace may compose a column after Offer, a recruiter may move a
  candidate back, and a second token on a hired entry no-ops but still returns the entry.
  `offer.accepted` and `candidate.hired` are now two webhook events. Also new: the
  `role_closed` status (four terminal statuses, not three) and `closeEntriesByJobId`
  withdrawing an accepted-but-not-terminal entry, read from the code, not run.
- The technique gains three conditions: the gate waits for the crossing where a
  post-offer column exists; the claim is per token while the hire is per person; and a
  role closed short of the terminal stage withdraws the entry while the offer reads
  accepted, so a cancelled run carries its own state. The golden path gains one paragraph
  saying acceptance and hire are two events on such a board. Not a new technique: one
  consumer, no lane convergence. The per-person half was reached independently by the
  `offer-lifecycle-and-deadlines` pass the same day, from the same tree.
- `language-neutral-template-keys` (process application) re-read against a
  `localization.md` that had doubled: the gate is three guards, not two, and its code
  parity now sweeps satellite registries and inline codes; the allow-list is capped at 7;
  the "shared helper never returns a sentence" rule is new. The stage-move refusal gap the
  first read named is closed in code (`pipeline-entry-action.ts:178`) and still stated as
  open in the doc and in `scripts/i18n-check.mjs:87` - recorded as drift, not fixed here.

**Confirmed, untouched:** the CAS-loser re-read, refusals-as-codes, role-not-label gating
of the rating endpoint, no pre-boarding surface and no ownership record in the tree, the
signature-seam, preset and questionnaire techniques (no application, no tree to read).

**Not evaluated:** no counter-evidence lane and no blind training-data lane ran; the
golden path's gap and renege claims (two weeks to three months, renege rising with silence)
are unsourced judgment and were not tested against literature. Four techniques
(`industry-preset-checklists`, `pre-boarding-questionnaire-as-a-hire-record`,
`signature-seam-declared-not-implied`, `the-acceptance-to-start-date-silence-gap`) have no
application of their own; the feature that would carry them was removed from kp.

**Applied:** no new technique, but a golden-path rule flipped in condition. kp has no
pre-boarding seam (`unapplied`: return condition "when a project grows a post-acceptance
surface"); kp's own acceptance path already implements the crossing, so there is nothing
to change there.

**Impact:** not computed. The map regeneration writes into every fleet project's
`.ai/registry-map.json`, and kp's is carrying a sibling's uncommitted edit, so it was left
to a quiet tree. Stale-verdict queue for this subject is therefore unrecorded.
