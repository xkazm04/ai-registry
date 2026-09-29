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

### 2026-09-29 - `/deepen`, second pass (dp-pbfh-0929)

Dispatched on the same finding ("never swept by the librarian") from a primary checkout that
was behind origin: the scan projection had not seen dp-pbh-0929 above, which landed earlier
the same day. Worked from origin/main in a detached worktree, rebased onto the tip of
origin/main after two sibling pushes. This pass runs what that one recorded as not
evaluated: four external lanes (statutory form, pre-start collection law, the silence-gap
literature, contingent-offer rescission) and one blind training-data lane, plus a probe in
the one tree both passes cite. Depth L2 for the statutory claims (primary text read, with
the read-status of each anchor marked in the applications); L1 for the literature.

**Convergence.** The blind lane and the rescission lane independently reached the report-based
adverse-action rules, fair-chance response windows and the contingency ledger, so one new
technique was earned: `rescinding-an-accepted-offer-is-a-decision-with-a-process`. The blind
lane and the form-law lane independently reached the German fixed-term written-form rule and
the text-form change to the statement of terms, and that the blanket "qualified signature for
employment contracts" line is wrong.

**Corrected (each read against the file first).**

- `signature-seam-declared-not-implied`: the decision rule said a qualified signature is
  required for "employment contracts in some jurisdictions". Form attaches to specific
  clauses and acts (a fixed-term clause, a termination), to statute-listed sectors and to
  delivery duties; an ordinary contract or statement of terms can usually be concluded or
  delivered with a simple e-signature or text form, and a non-qualified signature keeps its
  legal effect and admissibility under eIDAS Art. 25(1). New rule: a delivery duty is not met
  by a portal the person can only read inside the employer's surface (Czech Act 281/2023 s.21,
  read from a secondary reproduction).
- `pre-boarding-questionnaire-as-a-hire-record`: work authorisation and health need a
  regime-by-regime condition before "ask for the evidence" holds. US I-9: after acceptance and
  by day three, employer cannot specify documents, originals inspected (live video only for
  E-Verify employers in good standing). UK: prescribed check before start; the "no earlier than
  60 days" figure the research began with is not in the current guidance or code of practice
  and was dropped. Post-offer medical inquiry: same for every entering hire in the category,
  held apart. "The basis changed" softened: consent is weak in employment (EDPB 05/2020), a
  mandatory field rests on contract steps or legal obligation. "Shortest life" is a design
  stance; no regulator sets a period for hired-but-never-started people.
- `the-acceptance-to-start-date-silence-gap` and the golden path: renege risk rising with gap
  and silence is now stated as plausible and unmeasured. No study separates them or measures
  reneges against contact; the adjacent survey points to more contact, not less. The
  fortnight, the median split, the cadence and the touch cap have no source and are labelled
  operating parameters. Ghosting figures are vendor surveys with incomparable definitions.
- Golden path: "two weeks to three months" is a practitioner range; some statutory floors run
  to two months. New paragraph and failure mode on un-hiring through the reject door.

**Added.** One technique (above); four process applications (statutory anchors by ground,
form requirements per clause, pre-start collection conditions, silence-gap evidence) and one
node application (kp: a hired entry can be closed by the selection-stage reject). The node
application from dp-pbh-0929 gained two bullets (retired-module erasure scrub; no name for a
rescinded hire). Its other two applications were kept exactly as that pass left them.

**Verified, left alone.** The owner rule, the empty-is-not-submitted rule, the
labels-not-meaning discipline, the presets technique (no external lane could bear on a claim
it does not make), eIDAS Art. 25(2) and the "audit-stamped acknowledgement is jurisdiction
dependent" wording.

**Measured.** kp, reject on an entry at the hire stage (throwaway unit probe, isolated test
DB, deleted): before `Hired/active`, after `Hired/rejected`, returned true. No guard in the
action path, the comms dispatcher or the store; the rejection letter and `candidate.rejected`
event follow. Read, not run: the hire meter has one call site, on accept.

**Not evaluated.** The FTC staff letter behind "five business days", the NYC statute text,
the remote-applicant carve-out definition, the German post-employment non-compete and
signature level, Czech Labour Code s.34 form of withdrawal and s.334, the sample size of the
one pre-boarding communication survey, and whether kp's UI offers reject on a hired card.
Banked leads (single-sighted): do not message a hire on the channel of their current
employer during the notice period; a silent hire needs a personal call, not another
automated reminder; tracking pixels on a not-yet-employee need a lawful basis in the EU/UK.
Return condition for all three: a second lane, or a project that grows a pre-boarding surface.
Statutory anchors carry `refresh_by: 2027-03-29`.

**Applied:** one new technique: kp, `experiment`, `unmeasurable` (failing arm measured, fixed
arm a design needing a schema change and an owner's decision on reversing a billed hire).
Two flipped rules (statutory form; work-authorisation and health): `unapplied`, no project
has a signing or questionnaire surface (kp removed its module); return condition "when a
project grows a post-acceptance surface".

**Impact:** no project carries a judged verdict against this subject. kp joins it at four
contexts, every pair `unknown` and lexical ("template", "checklist"); the dry-run map for kp
lists twenty stale verdicts, none against this subject. The map was not regenerated: a
dry rebuild from this tree differs from kp's committed map on seven subjects (this one, whose
map digest is still the revision-1 value, and six others), and which side is newer cannot be
told from a tree that holds only origin/main, so a write could revert a sibling's digests. The
next rebuild from a tree holding everything carries this one. kp: one local commit (applied row), not pushed.

## Same-day pass from the diverged local main (merged, not re-run)

This pass was written on a local branch that diverged from origin while origin ran its own passes on the same subject; its content is kept beside origin's rather than replacing it.

subject: pre-boarding-and-first-day-handoff
domain: recruiting

First librarian note. `/deepen` was dispatched by the Curator lane on the scan finding "never swept by the librarian" (run dp-pbf-0929, registry HEAD at dispatch 3851e5aa). The content pass had already landed an hour earlier, as 1ec9cfd6 (revision 1 to 2, 16:54), from a session that left no subject note, no `applied.md` row, no run result and no map regeneration. This run therefore did not repeat the research: it reviewed that landing's diff, checked what rests on kp code, and did the propagation and ledger work the landing owed. The research lanes of the earlier session are not in the record; what follows is what this run can vouch for.

## 2026-09-29 - a rescission needs its own door, statutory form is per clause, the renege claim is a hypothesis

**Depth rung:** L2 for the statutory anchors (the landing's applications say, per clause, whether the primary text or a secondary summary was read; several are marked unread); L3 for the two kp claims this run touched.

**The landing (1ec9cfd6), as reviewed here:**
- **New technique `rescinding-an-accepted-offer-is-a-decision-with-a-process`.** Four parts: the acceptance carries a contingency ledger, a rescission is a named human decision citing a ground, the ground selects what is owed, the record carries a distinct outcome. Its honest gaps are stated: no authoritative source on what a recruiter must hand a manager, statutory anchors marked read or not read.
- **Renege claim demoted.** "Renege rates rise with the gap and the silence" is now a practitioner's inference; the technique says no study separating the two was found, that the cohort thresholds are configuration, and that published no-show figures are vendor surveys not to be quoted as base rates.
- **Statutory form is per clause, not per contract.** The signature technique's rule "employment contracts in some jurisdictions need a qualified signature" was refuted against the statutes it named and replaced by a per-document, per-jurisdiction property the flow reads.
- **Basis and collection conditions.** Consent is a weak basis in employment; work authorisation and health need the regime's own conditions on what may be collected, when and how.

**Checked here against kp (`b65ce4b8e`):**
- The rescission application's core claim stands on a read of the guards: `actOnPipelineEntry` refuses an accept on a terminal status and has no stage guard on a reject. The probe was run by the landing session; this run did not re-run it.
- New application `node--pre-boarding-questionnaire-as-a-hire-record`, run here as a two-arm probe (the parent of the commit that added the scrub versus current main, two throwaway worktrees, deleted). An erasure of a Hired entry left a phone number, an immunisation answer and the signer name readable at A; B masked or blanked all of it. It supports the technique's new sentence that removing a feature does not remove what it collected, and adds a condition: keep the scrub keyed to table existence until a migration drops the rows.

**Not evaluated:** any live database still holding the retired rows; whether kp's UI offers reject on a hired card; the German, Czech and UK contract anchors beyond what the application marks as read; the fixed-term, termination and delivery-duty clauses the signature application maps.

**Applied:** four rows in `applied.md`: rescinding (kp, experiment, unmeasurable), questionnaire (kp, code, better), signature seam and silence gap (unapplied, kp holds no seam; return conditions recorded).

## Impact
Regenerated from this run's generated commit (282ee58e). One project joins this subject: kp, 6 pairs, all `unknown`, never judged. So 0 stale verdicts under this subject and nothing for `/conform --stale`. The whole-fleet table lists 210 stale verdicts under other subjects (table, prompt-assembly, test-harness, eval-harness, agent-cli-transport and others), none of them mine.

Side effect, recorded: reading the impact table with `build-registry-map.mjs --dry-run` rewrote all twelve fleet maps despite printing "nothing written". Those maps were then regenerated and committed locally, one commit each on the project's active branch, unpushed, only `.ai/registry-map.json` in each.

## Saturation ledger
Rung L2. Last-pass yield: one new technique, three technique corrections, a fourth application. Dry streak 0. Clocks: the statutory anchors and the silence-gap literature carry a 2027-03-29 refresh; fair-chance and consumer-report guidance move on that order. Event: a project growing any part of the accepted-to-started window, or a rescission door.

## Banked leads
- The technique's contingency ledger has no reference implementation in the fleet. Return condition: a project that models a post-acceptance check as a state.
- Primary texts not read by the landing: the 1997 FTC staff letter behind the five-day figure, the NYC code wording, the remote-applicant definition in 15 USC 1681b(b)(3)(C). Return condition: a run wanting to move those statements from "marked unread" to "read".
