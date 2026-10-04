---
domain: software-engineering
subject: remediation-handoff
last_touched: 2026-10-01
touched_by: deepen
dry_streak: 0
depth: L3
---

# remediation-handoff

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-10-01 - `/deepen`, first pass (Curator dispatch, never swept)

Re-read the ascent source behind all three applications (six weeks after
`verified_on` 2026-08-20): `followups.ts`, `followups-claims.ts`,
`followup-claims.ts`, the hand-off route, `scans-persist.ts`. No web lanes, so L2
on those claims and L1 elsewhere. `check-currency` flagged nothing for this
subject.

**Verified, left untouched.** Strict tier-1/2 matching for claimed rows and the
tier-3 exclusion; un-pairing the replacement on close; whole-request refusal with
one answer for foreign and unknown ids; the 50-item cap; skipped ids reported;
the trailer key derived from one constant; org-wide spread at half the fleet.

**Corrected and widened.** Two golden-path rules had flipped in the source.
- *A trailer closes directly* was refuted by the source's own incident (the loop's
  agent wrote the trailer: "certifying its own homework", 2026-08-26). A marker is
  now a hint the rescan must confirm; a still-raised row stays open.
  `evidence-based-auto-close` gains the section and rewrites two decision rules.
- *Absence closes* gained a movement witness (2026-08-28): attributable, not
  mock/real, not inside the noise band, not across a rubric bump. Aspirational
  (craft) items close on a marker alone.
- `handoff-tenancy-and-idempotence`: "a claim is a record, not a lock" gained its
  condition - a machine executor pulling from the queue needs one arbiter, a
  clamped lazily-swept lease, and no closing verb; a human claim stays unleased.
- Applications re-resolved: line numbers replaced by function names, the hand-off
  application rewritten around the single claim path (2026-09-24), the prompt
  application records the capability rule, the verification promise printed only
  when true, and the lane brief that closed the "no stored evidence" gap for one
  path. `process` application carries no `verified_against`.

**Banked.** The refutation channel and batch-shaping techniques were not
re-attacked. Return when currency flags an application or a second project grows
a handoff seam (personas and systedo-case join the subject, both unjudged).

### 2026-10-01 - `/deepen`, second pass (dp-rh-1001b, a twin dispatch)

Dispatched on the same "never swept" finding minutes after the first pass
landed. That pass was still unpublished (local commits only), and its own
lines above said no web lanes ran and two techniques were not re-attacked. So
this run was not an idle: it ran the lanes the first pass named as missing,
and it published both passes together. The first pass's commits were
cherry-picked onto origin unchanged.

**Lanes.** There were four. Two web counter-evidence lanes, one on the
return/write path and one on agent behaviour. One blind training-data lane
as the convergence control. One read-only seam read of personas and
systedo-case, which the first pass had not opened, plus ascent's claim path.
Every quote placed in an upper layer was re-fetched verbatim before it
landed.

**Corrected from the cited source itself.** In ascent's `decideInProgress`
a trailer never waives the movement bar for a gap: a test pins a claimed,
unrestated row at 61 -> 61 as `no-movement`. The first pass had written "a
marker plus not raised closes", and two places still said "close regardless
of matching", in `claim-carry-forward-rules` and in the golden path. All
three now say the marker names the mechanism and lowers nothing. The source's
own module header still states the pre-2026-08-26 rule, and the application
now says so.

**Convergent corrections** (two or more independent lanes, or a lane plus a
measurement):
- *Judged items carry on a title tier only* (golden path flipped). Lanes:
  web (prior-art matchers need a content attribute beyond category) and
  blind (pairing by elimination is unsafe). Experiment on ascent's real
  matcher, n=5: as built 2/5, the rule 4/5. Three silent hides: a new gap
  born dismissed, one born done, a regression carried as done.
- *The oracle is foreign-vs-nonexistent* (golden path flipped). Web (the
  standard IDOR guidance, a large host's 404 policy) and blind. ascent's
  machine door already answers both ids `unknown`, per item.
- *A fencing token on worker writes.* Web (the 2016 lease/fencing analysis,
  queue visibility timeouts) and blind. ascent's worker writes match holder
  name only, and its sweep already fences on the lease value.
- *Absence counts only where the producer enumerated the key.* Blind
  (coverage per location) plus experiment on personas' real sweep, n=4: the
  capped list 2/4, uncapped 4/4. Also *per-producer completion* (blind and
  personas' `probedOrigins`), *removed is not fixed* (web, two scanner
  families split it, and blind), and *commits that edit the instrument do not
  close* (both web lanes and blind).
- *A marker outlives a revert.* Web (revert message semantics) and blind.
  The trailer grammar is looser than the version-control one (web only, a
  documented fact, so stated as a choice rather than a rule).
- *Batch by effort against the reliable horizon, one checked commit per
  item.* Web (Kwa et al. 2025; Jin et al. 2026) and blind. "5-15 items" is
  kept as a habit, not a measurement.
- *Repeat the return contract at the end; ship the artifact as a file when
  the session may compact.* Web (Liu et al. 2023, Veseli et al. 2025, an
  agent's compaction documentation) and blind.
- *Calibrate the refutation rate per producer, alarm both ways; already-done
  is not premise-false.* Web, blind, and personas' own split of the two
  outcomes.

**Verified, left untouched.** Tier 3 must never move a claim (every lane
agreed). Refusing is not failing: external measurements confirm it (Zhong et
al. 2025; Gloaguen et al. 2026). "Do not edit to satisfy a checker" was
confirmed, with only its enforcement moved to the closing side. One codebase
per artifact. Resolution defined at the assessed branch: a test-passing
change is often not mergeable, which supports "resolved means merged".

**Declined or banked**, each with a return condition:
- *Orphaned human claims.* A claim nobody executes stays in progress while
  the scan keeps restating it, and the backlog reads smaller. Only the blind
  lane raised it, and no seam has been read. Return when a project records
  claim age.
- *Location fingerprints as identity.* For location-bound findings, prior
  art keys on content and location hashes, not titles. Return when a fleet
  project matches location-bound findings by title. personas already keys
  on the signal.
- *Sample-data taint.* In systedo-case's advice ledger, a subject once seen
  on sample data is never scored, which is stronger than the mock-to-real
  rule. That is one project's analogue, with no handoff seam there. Return on
  a second instance.
- *A worker-reported commit booked as `cleared`.* personas'
  `mark_idea_delivered`. It was a code read and is recorded in the new
  application. No A/B was run: it needs the Rust test harness. Return when
  the next personas pass can run its database tests.
- systedo-case has no handoff seam (advice UI plus manual diagnosis
  tracking). Its `compareOutcome` ±5% dead band against a server-rebuilt
  snapshot is the closest movement-witness analogue.

**Sources removed from technique text** by the purity gate (paths read as
repo paths), kept here instead: git-scm.com docs for `interpret-trailers`
and `revert`; the SARIF SDK matcher, file
`Sarif/Baseline/ResultMatching/DataStructures/ExtractedResult.cs`
(`MatchesCategory && (MatchesAnyWhat || MatchesAllWhere)`); and the
context-window documentation page on code.claude.com ("What survives
compaction").

**Applied.** Four rows: personas experiment `better`; ascent experiment
`better`; ascent simulation `better` (fencing); ascent simulation
`not-better` (the old oracle wording). The seams are in each project's
`.ai/applied.jsonl`, committed locally on its active branch and not pushed,
because both branches carry other runs' unpushed commits.

### Impact

ascent maps two contexts to this subject (Playbooks, Follow-ups Ledger),
personas one, systedo-case one. Measured by a `--dry-run --project` map pass
from the landing tree, which wrote nothing: ascent's 2 judged `conformant`
verdicts are stale on the new digest, and they are its `/conform --stale`
queue. personas and systedo-case carry no judged verdict. The maps were not
regenerated or committed. All three consumer maps already hold another
session's uncommitted regeneration, and committing over it would mix the two.
