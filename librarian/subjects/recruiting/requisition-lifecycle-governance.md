---
domain: recruiting
subject: requisition-lifecycle-governance
last_touched: 2026-09-29
touched_by: deepen
dry_streak: 0
depth: L3
---

# requisition-lifecycle-governance

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-09-29 - `/deepen`, first pass (dp-rlg-0929)

The Curator lane dispatched this from the registry's attention scan, on "never swept by
the librarian". That was true: the subject was at revision 1 from the bundle's founding on
2026-08-21, with no note, no `applied.md` row and applications verified on 2026-08-20.
`check-currency` reported no row for it, so no clock had expired; the pass was driven by the
missing sweep, by a fleet that had moved under it (kp changed the close route, the cascade
predicates, the ledger surface and added a fill hook in five weeks), and by the law around it
(a job-posting statute in force since 2026-01-01 and a directive whose transposition deadline
passed on 2026-06-07).

Lanes that ran:
- a **blind training-data lane**, run before anything was read, on ten questions;
- a **vendor counter lane** on six claims (the three-state minimum, fill-closes-the-role,
  the close cascade, the publish split, reopen as a new span, approval expiry), from the
  products' own help pages;
- a **law counter lane** on five claims (never delete, disclosure only on the external step,
  the band's timing, the queued close message, ghost postings as a metric problem only);
- a **ghost-posting and metrics lane** (prevalence, freeze practice, time-to-fill clocks,
  evergreen requisitions, machine ingestion);
- **primary reads on this machine**: 29 CFR 1602.14 and 41 CFR 60-1.12 (eCFR, version
  2026-09-01), and Employment Standards Act, 2000 ss. 8.5, 8.6, 8.7 (Ontario e-Laws);
- a re-read of kp at `006bf7a0a` for every line citation in the three applications, plus the
  publish, fill-hook, ledger and ingest surfaces the applications had not covered.

**Corrected or conditioned (claims that carried no basis, a stale one, or a contradiction):**
- **"Never delete a requisition; the closed record is the only defence."** Not supported.
  The US floor is one year (two for larger federal contractors, and that regulation is being
  rescinded), the EU and UK add a storage-limitation ceiling, and no text read names a
  requisition as a record. Now: the role's own row is non-personal and stays; the candidates
  attached to it go on a retention clock that ends in anonymisation. The blind lane reached
  the same split unprompted.
- **"Everything else is a reason, not a fourth state."** Four products model hold as a
  status with its own permissions (a frozen requisition can be worked but not moved to
  hire-ready; a suspended one refuses offers and a close and resumes without a second
  approval). The test survives and is now applied to hold. Added the two conditions that make
  it safe: entering a hold takes the posting down (a frozen requisition that stays posted keeps
  taking applications), and a hold has an owner and a review date.
- **Jurisdictional disclosure sits on the external step.** Not so: Colorado's rules put
  compensation into the notice to current employees and let the duty arise before any external
  posting; the EU directive names the interview; Ontario exempts internal-only postings. The
  duty attaches to the step the law names, and the band belongs on the approval so any step
  can read it.
- **Reopen.** The subject said both "open a new span, never revert" and "reopen is a
  first-class inverse that restores the withdrawn". Reconciled by exposure: undoing a close
  before anyone was shown the ending is the inverse; reopening a close that stood is a new span
  with an invitation. Vendors split three ways on reopen.
- **Ghost postings.** The immortal requisition is the accidental slice of a wider figure.
  A platform's own data (18 to 22 percent of postings, definition unpublished) and a 2024
  survey (649 completing managers, 40 percent posting a fake listing in a year, mostly for
  deliberate reasons) cannot separate accidental, deliberate and standing pools. The blind lane
  named the "third of postings" figure as the claim most often overstated in this area.
- **Approval expiry** is a design position: no vendor documentation read describes one and
  nothing measures its effect. Kept, and now said to be.
- **"When a role is filled, closed is not optional."** Now the *last* seat, not the first.
- **"Re-run the approval on reopen."** Products split; the rule now separates resuming a hold
  whose level, location and band did not change (no new approval) from reopening a close that
  stood (new approval).
- **"A queued message on close."** Good practice everywhere; a legal duty only in Ontario,
  for interviewed applicants of a public posting (s. 8.6, in force 2026-01-01). No statute read
  requires notice when a posting is simply withdrawn.

**Verified, left alone:** closing is a state and never a hard delete of the role's row; the
ingest-as-draft rule (no source contradicts it, and no measurement of machine-extracted
invented requirements exists to cite either way); the publish split (confirmed in three
products from their own pages, with a third value, *unlisted*, added); the distinct terminal
kind for a withdrawn candidate and the reopen-must-not-undo-a-merit-reject rule (kp's own
code and comments, and now also its feedback-letter policy); the retry may never create (kp
enforces it on both doors that can ingest); the honest-null rule.

**Earned: one technique.** `fill-is-a-count-and-close-is-the-act-it-triggers`. Convergence:
kp's fill hook (added 2026-09-16, made per team on 2026-09-23) and its incident comments, three products'
own pages (one job with N openings; the job closes with its last opening; the requisition is
filled only when all positions are), and the blind lane recalling per-opening status on one
of them. A fourth product is reported, from search summaries only, to close on the first hire.
The clauses that rest on kp alone (a derived *filled*, the compare-and-swap, sparing the
hired on both predicates) are marked in the technique as one project's discipline.

**The tree found what no lane asked.** `runRoleFillHook` had no behavioural test. It now has
four (kp `bddc2020`, local), and each of the technique's two load-bearing clauses was
checked by deleting it.

**Applied** (six rows in `applied.md`):
- **code, better:** the fill technique in kp. The real function against a throwaway database.
  Without the `hired < target` return a three-seat role at one hire came back `filled`
  and withdrew the two people in flight for open seats; without the compare-and-swap two
  concurrent hires both reported `filled`. n is four cases and one seam.
- **unapplied, five:** the hold state (kp has none), the retention split (kp already conforms
  in shape; its clock on closed-role personal data was not traced), undo versus reopen (kp
  restores at any age and has no queued message), vacancy disclosure (no project posts into a
  regime that requires it), and the publish label (kp's `published` also opens the public
  apply link).

**Applications.** All three re-verified to 2026-09-29 at kp `006bf7a0a`; every line citation
had moved. Findings inside them: the ingest failure is now logged (a shortfall closed);
the retry affordance moved from a response flag no product reads to an `unlinked` category and
a per-row action on the record (a shortfall closed by a different mechanism than the standard
describes, with the README still describing the old one); the honest-null sort surface left
the tree with the 2026-09 split; the close cascade gained a role-resolved terminal stage and
two write predicates; a shared corpus role's lifecycle is now per team; an ingest that names
an existing job id overwrites a live role and is now guarded. Two new kp applications (fill and
publish) and four `process` applications that hold the
product and law readings so the upper layers name none.

## Impact

- **kp:** the committed map (generated 2026-09-29T17:10:44Z at `5f990d590`) joins the subject
  to three contexts, `jd-management-api`, `jobs-api` and `jobs-posting-campaign`, all with
  state `unknown` (no verdict was ever judged against it). So 0 stale verdicts and no
  `/conform --stale` queue from this landing; the three contexts are where the next
  `/conform` pass reads the new fill technique and the conditioned reopen rule.
- **No map was rebuilt.** The previous pass on 2026-09-29 found a clean-worktree build of kp's
  map dropped 151 pairs and two carried verdicts against a sibling's map, and kp's tree is
  carrying uncommitted sibling work. The subject's digest in kp's map lags until the next
  fleet rebuild; it changes nothing about a pair.

## Saturation ledger

| | |
| --- | --- |
| Depth | L3 for the fill technique (code, deletion of each clause), L2 for the retention and disclosure claims (statute and regulation text read), L1 for hold and time-to-fill (help-page summaries) |
| Last-pass yield | high: 1 technique, 10 corrections or conditions, 3 applications re-cited, 4 process applications, 1 test added |
| Dry streak | 0 |
| Clocks | the disclosure law moves: re-check by 2027-03-29 (New York S8877, Czech transposition, Ontario regulation text); vendor pages by 2026-12-29 |
| Demand | kp, by three joined contexts |

## Banked leads

- **The Ontario regulation text (O. Reg. 476/24).** The 45 days, the 25-employee threshold, the
  prescribed information ("whether a hiring decision has been made") and the internal-only
  exemption rest on a lane's reading and one blind recall; the e-Laws regulation page returned
  only its title here. Return: a fetch that gets the text, before the numbers are written into
  anything a project acts on.
- **New York S8877 signature or veto,** and the Federal Register notice rescinding 41 CFR 60-1,
  60-2, 60-3 (a summary only; the PDF would not extract). Return: 2026-12-31.
- **Whether Greenhouse has an On Hold status.** One lane reported the sentence, the lane reading
  its status pages did not find it. Return: a read of the job-status page.
- **Lever's help pages** returned errors to the fetch tool; its auto-close-on-first-hire
  behaviour is search-summary only. Return: a fetch that passes the page.
- **Primary regulator pages on candidate-data retention** (DSK, ICO, CNIL, UOOU); the six
  months to two years range is from secondary summaries. Return: before a retention default is
  proposed to a project.
- **Colorado rule numbering** (a summary says the pay-equity rules moved to a different rule
  number) and the Illinois and California text.
- **kp: can a rejected or declined entry sit in the terminal column?** `listJobPipelineStats`
  counts by stage, the hook checks the status of the triggering entry only. Return: the trace
  from the reject and decline doors.
- **kp: `docs/features/jobs/README.md:313-316`** still describes a builder that reads
  `jobIngested` and disables Publish; no such UI exists. Return: the next kp docs pass.
- **A pre-close count on the jobs close dialog.** The assignment lifecycle already computes one
  (`DevLifecycleRow.tsx:83`); the jobs dialog does not. Return: a kp UI pass.
- **Greenhouse's 19 percent "no meaningful hiring activity" figure for the second quarter of
  2026,** relayed through the press with the caveat that it does not mean ghost jobs. Return: the
  benchmark PDF, which is password-protected.
