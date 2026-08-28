---
name: scan-sweep
description: "Long-running quality sweep that walks a repository context by context, reads each area's code once, judges it through every scan lens, and lands the safe fixes itself with atomic commits. With no arguments it runs the STABILIZE loop - bug hunting, UI perfection, performance - picking the least-covered context each round and keeping a per-context lens-coverage ledger so a codebase gets swept evenly instead of repeatedly in the same corner. S findings are auto-approved and built in-session; M findings are built only when the reward/risk ratio clears the bar; L findings are never built here and always leave as backlog. Use for a standing quality loop, before a hardening milestone, or to work down a backlog of small defects. Pass --develop for new capability, --optimize for deep hardening, --ideas-only to change no code, --coverage for the pick list."
argument-hint: "[--stabilize|--develop|--optimize] [--one <context>] [--depth N] [--ideas-only] [--lenses k1,k2] [--coverage]"
category: workflow
contexts: tracked
memory: project
version: 2.2.0
tags: sweep, quality, stabilization, backlog, coverage, registry, atomic-commits
---
# Context Sweep

A **long-running sweep** that owns a repository's quality loop. It walks the
context map one area at a time, reads each area's code once, judges what it read
through every relevant lens, and lands the safe fixes itself.

The expensive part of any scan is reading the code. Do it once per context, then
judge. Depth beats breadth *within* a context; breadth comes from the loop
returning to the next-least-covered area, not from skimming.

## Invocation

```
/scan-sweep                     # the LOOP: stabilize, least-covered context first, until stopped
/scan-sweep --one <context>     # exactly one context, then stop
/scan-sweep --coverage          # the pick list; scan nothing
/scan-sweep --ideas-only        # scan and propose; change no code
```

**Default = the stabilize loop.** No arguments means: pick the least lens-covered
context, sweep it, land what is safe, record coverage, then pick the next one and
say so — round after round until the operator stops the session or every context
has been swept. Each round is self-contained: its commits are landed and its
snapshot is written before the next context is chosen, so an interrupted loop
loses nothing but the round in flight.

**Announce each round's boundary out loud**: `── Round <n>: <context> (lens
coverage <a>/<total>, last swept <age>) ──`. A loop whose rounds are not visible
reads as one runaway session.

## Strategies — pick at most one

- **`--stabilize` (DEFAULT)** — make what exists *solid*. Deep tier: bounty-hunter,
  error-handler, risk-assessor, code-optimizer, ux-reviewer,
  accessibility-checker, test-strategist, security-auditor. Aim ~80% of the
  finding budget at defects, broken or unpolished UI states, and measured
  performance problems. Feature ideas and architecture proposals are recorded as
  findings only — never built under this strategy.
- **`--develop`** — NEW capability. Deep tier: feature-scout, innovation-catalyst,
  ux-reviewer, onboarding-designer, integration-planner, business-strategist,
  growth-hacker, monetization-advisor. ~70% of the budget at forward-building
  items. Quality lenses still run as a light pass — a real defect is never
  ignored, but marginal cleanups are dropped.
- **`--optimize`** — QUALITY of what exists, deeper than stabilize goes: adds
  tech-debt-tracker, dependency-auditor, devops-optimizer, documentation-auditor,
  mobile-specialist. ~70% of the budget at hardening, debt and coverage.

Name the strategy in the report header and record it in the snapshot's `strategy`
field.

## 1. Scope the round

- `--one <context>` names the context. Otherwise **pick it**: read the context map
  and the sweep history, and choose, in this order — the first context in map
  order with NO snapshot at all; else the smallest `lens_keys` union (fewest
  lenses ever applied); tie → oldest latest snapshot. `scripts/coverage.mjs
  --next` computes exactly this and is the cheapest way to ask.
- State the choice and why in the round header ("never swept" / "lens coverage
  4/22, oldest 2026-08-11"). Coverage rotation must be auditable.
- Stay inside the context's declared file paths for the whole round.

## 2. Load shared awareness — BEFORE reading code

- **Backlog memory** (overlay key `backlogDigest`, default
  `.personas/backlog-digest.json`) — pending / accepted / rejected titles.
  **Never re-propose anything on those lists, including rephrasings of rejected
  titles.** A rejected title is a durable human "no".
- **Hard gates** (`.claude/conventions.json` when present) — a finding that
  violates a declared gate is a defect you are about to introduce, not a finding.
- **Sweep history** (`.claude/scan-history/scan-sweep.jsonl`) — prior snapshots,
  for the trend line and the lens-ordering rule.
- **The registry**, when this repo consumes one — see §6. The registry is
  KNOWLEDGE THAT FEEDS THE LENSES, not a lens of its own and not the sweep's
  primary instrument: each lens reads the governing subject's techniques that
  touch its concern and judges against them (§3). The one place where
  "registry deviation" is itself the finding is the `registry-conformance`
  lens, which runs like any other lens and is budgeted like any other lens.

## 3. Pick the lens package

- `--lenses k1,k2` uses exactly those keys.
- Otherwise the package is **ALL lenses in `references/lenses.md`**, ordered:
  the active strategy's deep tier first, then lenses whose `Match` regex hits the
  context's name, description, keywords, stack or paths, then the rest as a
  lighter pass. Most of the tail will honestly report "nothing real", and that
  clean verdict IS coverage worth recording.
- Within each tier, never-applied lenses (absent from prior `lens_keys`) go
  first. The package's job is to close lens coverage, not re-walk it.
- List the deep / matched / remaining keys in the round header.
- **Lenses are the instrument; the registry is what sharpens them.** A scan is
  a set of prompts applied to the code — `error-handler` asks about error
  doors, `code-optimizer` about render and query cost — and when the repo
  consumes a registry (§6), each lens FIRST reads the techniques in the
  governing subject that touch its concern, then judges the code against them
  and names the technique in the finding. A lens whose concern has no
  governing knowledge judges on the repo's own conventions and says so in the
  finding. The `registry-conformance` lens is the ONLY lens whose findings are
  the deviations themselves — the pure registry→backlog transformation — and
  every other lens leaves those to it rather than restating them.

## 4. Survey, then judge

1. Read the context's files and collect evidence FIRST — form no verdicts while
   still reading.
2. Run any cheap deterministic check that applies (type-checker, linter, existing
   script) and reconcile. Deterministic findings belong to those tools — do not
   restate them as findings.
3. Walk the lens package **sequentially**, and give each tier room to report:
   **deep tier ≤3** findings, **matched tier ≤2**, **remaining tier ≤1**, each
   grounded in `file:line`. Zero from one lens is a valid result — say "nothing
   real" and move on. Zero from a whole TIER is a claim about the codebase, and
   §4.9 is where you test it.

4. **FIND GENEROUSLY, BUILD CONSERVATIVELY. These are different budgets and
   confusing them is the failure this clause exists to prevent.**

   How much work a round does is decided by the ROUTING RULES in §5 — S builds,
   M clears a ratio, L never builds — and not by how many findings exist. So the
   finding budget is not a work budget: raising it raises the BACKLOG, which is
   the artefact the operator triages, and leaves the build volume where §5 put
   it. A sweep that finds five things in a 24-file context has not been
   disciplined; it has been incurious, and it has left the operator a backlog
   that under-describes their own repository.

   **Budget: 12 findings per context per round.** `--depth N` overrides; `--one`
   raises it to 20, because a named context is a deliberate deep dive.
   **Lifetime cap per context: 40.** Subtract what prior snapshots already
   reported, and never re-emit a finding already reported or present in the
   backlog digest.

   **THE BUDGET MUST BE ABLE TO ABSORB THE PACKAGE YOU RAN.** A 22-lens package
   against a 5-item budget is exhausted by lens three, and the other nineteen
   have nowhere to put anything — they become coverage RECORDING, the ledger
   reads 22/22, and the round reports a clean tail it never had room to hear.
   If you narrow the budget, narrow the package with it (`--lenses`), or the
   coverage number is a lie you told yourself. Measured 2026-08-27: a 5-item
   budget over a full package yielded **0.098 findings per lens-pass** against
   the same repository's **1.63** under a 6-lens package a fortnight earlier —
   17× less, from 3.6× more lenses.
5. **Score both sides of every candidate.** *Reward* = user-visible or
   developer-measurable gain (impact 1-10). *Risk* = chance of breaking working
   code, plus churn — lines rewritten per unit of gain (1-10). These two numbers
   drive every routing decision in §5, so guessing them is guessing the routing.
   Two hard rules learned from calibration:
   - **"Unused/dead" claims require proof.** A finding that says dead/unused MUST
     cite its zero-consumer grep in the evidence. Verified dead-code removal is
     the best reward/risk class there is; guessed dead-code removal is the worst.
   - **Repo-declared incremental migrations** (string extraction, token adoption
     — whatever the repo calls fix-as-you-touch) are in scope for the nearest
     lens in files you already read, never as a bulk migration, and never where a
     deterministic gate already tracks them.
6. **Hunt for pairs, not for defect shapes.** On any codebase already swept a few
   times, pattern greps yield near zero. What still hits is **two
   implementations of one rule that must agree, where only one was fixed** —
   client vs server validation, a gate vs its debit, an abstraction vs its
   un-migrated call sites, a doc's stated rule vs the code. Grep for the *shared
   symbol* and diff its call sites. The signal to abandon a grep battery is the
   *second* clean result, not the fifth.
7. **Interrogate every hand-maintained list.** Coverage lists, allow-lists,
   enumerations of tables or routes — ask *what enumerates the ground truth, and
   is the test derived from that or from the list?* A test that reads the
   implementation's own list is coverage theater, and this class produces the
   highest-impact findings a sweep can find.

8. **BEFORE you declare the round, check the yield.** A full package over a
   context of ten files or more should produce roughly **8-12** findings. Fewer
   than **6 is a signal about YOUR PASS, not about the codebase** — the usual
   cause is that you read the deep tier and let the tail report "nothing real"
   without ever pointing it at anything. Under 6, do one more pass before
   declaring: open the two largest files you only skimmed, and drive the three
   never-applied lenses at something specific rather than at the context in
   general.

   A genuinely clean round is possible and must stay reportable — but it is a
   CLAIM, so state what you did to earn it: which files you read in full, which
   hypotheses you traced and why each failed. "Nothing found" and "nothing
   looked for" produce identical reports otherwise, and only one of them is a
   result. Measured 2026-08-27: eight of thirteen rounds returned two findings
   or fewer, none hit the budget, and re-running one of them under this clause
   found the yield had been the method's, not the repository's.

9. **A clean lens is only credible once the tier around it has spoken.** If an
   entire tier reports nothing, name the three things in it you actually
   checked. The tail's job is coverage AND a lighter hunt — it is not a list of
   keys to write into the ledger.

10. **EVERY finding is written in the standard form — no exceptions, no prose
    dumps.** The operator decides from the deck at a glance and a cheaper model
    (Sonnet, Haiku) executes from the text alone, so a finding that is vague
    where another is precise is a finding that will be mis-decided or
    mis-built. The `body` of a finding is markdown with exactly these `## `
    sections, in this order, each present even when short:

    ```markdown
    ## Summary
    One or two sentences: what is wrong (or missing) and where. No reasoning.

    ## Description
    What the code does today, why that is a defect or a gap, and what "fixed"
    looks like. Name the technique/golden path it violates when one applies.
    `file:line` for every claim.

    ## Flow
    - the steps that reproduce or expose it, as bullets — user action → code
      path → observed result
    - for a proposal: the steps the fix takes, in build order

    ## Expected impact
    Who notices, what changes for them, and how it would be measured. One
    sentence on what could break.
    ```

    `evidence` is SEPARATE from `body` and is the proof, as a code block or a
    `file:line` list — the exact lines, the grep output, the count — never a
    restatement of the Description. `title` is the Summary compressed to one
    line (≤ 80 chars, imperative for a fix, noun phrase for a defect).

    The renderer (`TriageCardBody`) splits on these headings and paints each as
    its own block; a body without them paints as one undifferentiated block
    and reads as the lower-quality item it is. Do not invent extra sections;
    put anything else under Description.

## 5. Routing — size decides who approves

Classify every candidate:

- **S** — localized: one file, one mechanism (a rename, a guard, an attribute, a
  clamp, one component's states).
- **M** — a few files or one subsystem seam; a normal PR.
- **L** — structural: architecture-grade work spanning modules — new layers,
  protocol redesigns, cross-cutting migrations.

| Size | Route |
| --- | --- |
| **S** | **Auto-approved. Build it in-session, no ask.** Subject only to the four vetoes below. |
| **M** | **Reward/risk decides** — the table below. |
| **L** | **Never built here. Always backlog.** No triage, no ask, no exception. |

### The M rule — reward over risk

Compute `RRR = impact / risk` from the scores you already assigned in §4.5.

| Condition | Route |
| --- | --- |
| `RRR >= 2.0` **and** `risk <= 4` | **Build** — auto-approved, same as an S. |
| `RRR <= 1.0` **or** `risk >= 7` | **Backlog** — never built in-session. |
| anything between | **Ask** when an operator is attending; **backlog** when unattended. |

One line per asked item — title, reward, risk, RRR, what could break — and the
operator picks. Accepted items join the execution queue; declined ones leave as
findings.

**Pure churn has a reward of 0 by definition** — a refactor of working code with
no user-visible or measurable gain scores `impact: 1` at most, so it can never
clear the bar. That is the intent, not an accident of the formula.

### The four vetoes — they override every route above

An item is backlogged regardless of size or RRR when it:

1. **touches a file outside this context's declared paths** (see the parallel
   rules in §7) — not yours to change this round;
2. **changes a schema, a protocol, a public API or a generated-artifact
   contract** — those need a reviewer who is not the author;
3. **has no gate that can verify it** — if nothing in the repo can tell you the
   fix worked, you are committing a belief;
4. **is a foreign session's in-flight file** — a coordination call, not a triage
   call. Say so in the finding so the next session knows the difference.

**Unattended runs** (dispatched by an app or a fleet, no operator present): the
"ask" band collapses to backlog. S still auto-builds — that is the whole point of
the size class — and L still never does.

## 6. The registry lane — knowledge feeds the lenses, deviations are one lens, leads flow back

Skip this section entirely when the repo declares no registry. When
`.ai/manifest.yaml` carries `registry.local` (or `registry.remote`) and
`knowledge.domains`, the repo consumes a shared knowledge corpus, and a sweep is
one of the few moments that can pay into it as well as read from it.

**Read side — before you judge (§4.3).** Resolve the subject governing this
context and read its golden path plus the techniques whose `use_when` matches.
This read is what the LENSES consume (§3): each lens takes the techniques that
touch its concern into its own judging. The read is not itself a lens, and a
list of "we deviate from technique X" is not a sweep — it is the output of ONE
lens, `registry-conformance`, budgeted like every other one.

- If `.ai/registry-map.json` exists it already holds the context→subject join;
  take the subject's `file` **verbatim** from the index. Never construct a path
  from a slug — bundles are nested and depth is dynamic, so a built path points
  at a folder nobody walks.
- Without a map, resolve through `<registry>/knowledge/<domain>/index.json`.
- Without either, say so in the header (`registry: declared, unmapped`) and judge
  on the repo's own conventions. Degrade honestly; never invent a standard.

A finding that names the technique it violates is worth more than one that names
a smell, and it arrives with the fix already described.

**Log the consult** — append one line to `.ai/consults.jsonl`:

```json
{"ts":"<ISO>","bundle":"<domain>","subjects":["<slug>"],"techniques":["<slug>"],"deviations":<n>}
```

`deviations` counts findings in this round that a technique explicitly names as a
failure. Slugs and counts only, never paths. This is the demand signal the
registry reads to learn which knowledge is actually reached for.

**Write side — after a fix LANDS.** Most rounds produce nothing here, and that is
the expected result. A lead is owed only when a landed fix (or an L finding you
are backlogging) clears **all four** bars:

1. **General** — an unrelated team on a different stack would face the same
   problem. If it depends on this repo's file layout, it is a project lesson, not
   a lead.
2. **Rule-shaped** — it states as *"when X, do Y, because Z"*. A description with
   no trigger has not finished becoming knowledge.
3. **Novel against the corpus** — you read the governing subject this round and
   the rule is not already in it. A lead that restates a technique is noise.
4. **Earned** — it came from code you changed and verified, not from a fix you
   proposed. A sweep learns by landing things.

Append it to `.ai/registry-leads.jsonl`:

```json
{"ts":"<ISO>","bundle":"<domain>","nearest":"<subject-slug or null>","kind":"technique|application|subject","claim":"<when X, do Y, because Z - one sentence>","because":"<what this run measured or broke and fixed>","confidence":"low|medium|high","from":"scan-sweep@<version>"}
```

**This is a LEAD, not a knowledge write.** A sweep ORIGINATES a finding; it never
AUTHORIZES one. Nothing here edits a bundle — the registry's own intake triages
leads, corroborates them, and lands only what survives. Say in the report that
you filed one, and say plainly when you filed none.

## 7. Execution — land the approved list

Work the approved queue highest-reward first, one finding at a time:

1. **One atomic commit per finding.** Fix, verify, commit, then start the next.
   Never stack two findings' edits in one working state.
2. **Verify before committing** with the repo's own gates for the surface you
   touched (`.claude/conventions.json` or the manifest's capabilities name them;
   else the obvious ones). A fix that fails its gate is repaired inline or fully
   reverted — never committed red, never left half-applied. **A gate you could
   not run is a gate that did not pass**: say so in the report and mark the round
   degraded.

   **ASSERT the gate's own exit code. Reading it is not asserting it, and
   piping it away destroys it.** Three ways this rule has actually been defeated,
   all in one session, each by the shell rather than by the code:

   - `npm run typecheck | tail -3 && git commit` takes **`tail`'s** status,
     always 0. The chain commits over a red gate and the failure scrolls past in
     the output you were trimming.
   - `npm run typecheck; echo "TC=$?"; git commit` **prints** the failure and
     commits anyway. A number in the transcript is not a gate; `;` is not `&&`.
   - The gate is red for a reason that is **not yours** — see below.

   The shape that holds: run each gate in its own invocation, `&&`-chained so a
   non-zero status stops everything, and let the commit be the last link.

   **Under a concurrent session, a whole-tree gate says nothing about your
   change.** `tsc --noEmit` covers every file in the repository, so a sibling
   agent mid-write turns your verification red and a *passing* run can equally
   depend on their unfinished work. Before treating a red whole-tree gate as
   yours, get the failing paths and compare them against the files you touched;
   if none of them are yours, say so, verify what you can scope to your own
   files, and wait for the tree to settle rather than committing into it. §7's
   parallel rules cover STAGING and stopped there — verification has the same
   hazard and it is easier to miss, because the output looks like a verdict on
   you.
3. Commit message `fix(<context>): <finding title>`, with a body line naming the
   lens — the finding's provenance survives in history.
4. **A fix that grows beyond its size class mid-flight is demoted, not forced.**
   If an S starts touching a third file or a shared surface, stop, revert the
   attempt, and emit it as a finding at its honest larger size. This is the
   safety valve behind auto-approving S: the class is enforced at execution time,
   not just at classification time.
5. **Contract and source-guard tests pin the OLD expression**, so a real fix
   fails them. That is correct by design. Budget for it, and *strengthen* the
   assertion in the same commit (pin the new expression AND forbid the old), or
   the fix silently loses its guard.
6. **Never author a pattern through a shell heredoc, and seed a violation to
   prove the gate still bites.** A heredoc reads `\b`, `\s`, `\n` as its own
   escapes, so a regex written that way can reach the file as control characters
   — measured: `\b` arrived as a literal `0x08`, the matcher found nothing, and
   every subject read as compliant. Use the file-writing tool for anything
   containing a backslash, and after ANY scripted edit to a checker, seed the
   thing it looks for and watch it go red. A gate that cannot match reports a
   clean codebase in a voice indistinguishable from success.

7. **A source-scanning gate must strip comments before it matches.** The files a
   sweep writes explain the rule in prose, directly above the code that
   implements it — so a matcher run over raw text is satisfied by a file that
   TALKS about the rule and does not follow it. Measured twice in one session: a
   probe passed against a deliberately broken subject because the word it looked
   for survived in the comment describing the fix. Strip `//` and `/* */` first,
   then match, and let the fail-before be what tells you — it is the only step
   that catches this, and it caught it both times.

**Parallel-session rules** — several sweeps may share this repo, one context each:

- Edit ONLY inside your context's paths, plus their tests and any generated
  artifacts the repo REQUIRES you to regenerate for those edits. A needed change
  outside that boundary is veto 1, not a decision.
- Stage with explicit pathspecs only. Never `git add -A` / `.` / `-u`, never
  `git stash`, never reset another session's work. Before each commit confirm the
  staged list is exactly your files.
- Shared or generated surfaces other sessions also write (locale bundles,
  generated types, checksum manifests): make the edit and its regen, commit
  IMMEDIATELY, and keep that commit minimal. Shared files must never sit
  uncommitted while you work on the next finding.

## 8. Report each round

Header first:

- `Method: full (context: <name>, strategy: <s>, lenses: <n> evaluated)` — or
  `DEGRADED: <what was skipped and why>` if you sampled, skipped a lens, or could
  not run a gate. **A degraded sweep reported as complete is worse than no
  sweep.**
- `registry: <domain>/<subject>` — or `none` / `declared, unmapped`.

Then what SHIPPED, one line each (`fixed  <title> - <sha>`), then the backlogged
findings — each in the standard form of §4.10 (Summary / Description / Flow /
Expected impact, evidence separate), plus **Scores** (size + effort / impact /
risk, and the RRR for every M).

Close each round with: X built, Y backlogged, Z lenses evaluated, leads filed,
the trend for this context (`12 -> 7 -> 5 findings`), and **the next context the
loop will take**.

## 9. Emit to the memory outbox

Append to the outbox (overlay key `memoryOutbox`, default
`.personas/memory-outbox.jsonl`), ONE JSON object per line.

**A BUILT finding is a progress node, not a finding** — it must never land in the
backlog as open work:

```json
{"type":"node","kind":"progress","skill":"scan-<lens-key>","context":"<context>","title":"Fixed: <title>","body":"<sha>; <one-line gist>"}
```

Each BACKLOGGED finding:

```json
{"type":"finding","skill":"scan-sweep","lens":"<lens-key>","context":"<context>","title":"<title>","body":"## Summary\n...\n\n## Description\n...\n\n## Flow\n- ...\n\n## Expected impact\n...","evidence":"<code block or file:line list — the proof, not the prose>","size":"S|M|L","effort":3,"impact":7,"risk":2}
```

`body` is the §4.10 form verbatim — the four `## ` sections, newline-escaped in
the JSON. A finding emitted in any other shape is rejected at review, not
reformatted.

Escalation — at most one per lens, ONLY when that lens produced a critical
finding (impact >= 8) or 3 real findings in this context:

```json
{"type":"escalation","skill":"scan-sweep","lens":"<lens-key>","context":"<context>","reason":"<<=120 chars: what a deep pass should chase>"}
```

Coverage — one node per lens actually evaluated (clean lenses included: that IS
the coverage record), plus one for the round:

```json
{"type":"node","kind":"progress","skill":"scan-<lens-key>","context":"<context>","title":"Sweep pass: <lens-key> over <context>","body":"<n> findings; <gist or 'clean'>"}
{"type":"node","kind":"progress","skill":"scan-sweep","context":"<context>","title":"Sweep of <context>","body":"<n> lenses; <built> built, <open> backlogged, <e> escalations, <l> leads"}
```

Keep the outbox lean — ingest caps at 200 lines / 512 KB and 30 finding lines per
pass. At 12 findings per context that is between two and three rounds, so the
loop WILL meet this cap: check whether the file was drained between rounds (the
app deletes it on ingest), keep going if it was, and if it was not, emit the
round's findings highest-reward first, stop at the cap, and say in the report
which findings did not fit and that they are unrecorded. A finding silently
dropped for want of a line is worse than one never found, because the ledger
will claim the context was swept.

## 10. Persist a snapshot

Append one line per round to `.claude/scan-history/scan-sweep.jsonl` (create the
directory if needed). `lens_keys` = every lens actually evaluated — this is the
per-context coverage ledger the picker and the lens ordering both read.
`findings` counts BOTH built and backlogged.

```json
{"at":"<ISO-8601>","scope":"<context>","mode":"resolve|ideas","strategy":"stabilize|develop|optimize","lens_keys":["<key>"],"lenses":<n>,"findings":<n>,"fixed":<n>,"escalations":<n>,"leads":<n>,"degraded":<bool>,"note":"<<=80 chars>"}
```

## Project overlay

Everything project-specific lives in `.claude/scan-sweep/config.md` in the
consuming repo. The skill runs on the defaults without it.

| Key | Default | Meaning |
| --- | --- | --- |
| `contextMap` | `context-map.json` | The context inventory the loop walks. |
| `memoryOutbox` | `.personas/memory-outbox.jsonl` | Where findings are emitted. |
| `backlogDigest` | `.personas/backlog-digest.json` | Titles never to re-propose. |
| `gates` | from `.claude/conventions.json` / manifest capabilities | Verification commands per surface. |
| `depth` | 5 (loop), 10 (`--one`) | Findings per context per round. |
| `neverSweep` | none | Contexts the loop skips (generated, vendored). |

## Coverage table

`--coverage` scans nothing. Run `node ${CLAUDE_SKILL_DIR}/scripts/coverage.mjs`
(`--all` for every context, `--next` for just the next pick, `--json` for a
machine read) and present the per-context table — lens coverage, findings vs
fixed, last strategy and age, least-covered first. Then stop.

---

## Skill Reflection

After the run's real work is done, reflect twice - autonomously, without asking the user. Be honest about volume: most runs produce NOTHING for lane 2. An empty reflection is a valid result; a forced lesson is pollution. Calibration: nothing (common) / one line (sometimes) / a lesson entry (occasionally) / a redesign proposal (rare).

Lane 1 - PROJECT learnings (what the next session in THIS repo needs): write via the MEMORY BLOCK contract if this prompt carries one, else append node lines to the memory outbox per that contract. Project-specific insight only.

Lane 2 - METHOD learnings (what would improve THIS SKILL for every project):
1. If nothing generalizes beyond this repo, stop here.
2. Append an entry to `LESSONS.md` in this skill's directory: `## <version-used> - <YYYY-MM-DD> - <project-name>` followed by `- ` bullets. Record the version the run USED, not a bump target. Wrap a bullet in a `### Redesign proposal` sub-block when it argues for a methodic redesign you are NOT applying now.
3. Version bump - ONLY when you also edit SKILL.md to apply the improvement in the same change: patch for a change that alters the directory without altering behaviour, minor for a prompt/step refinement, major for a methodic redesign. Never bump without an applied edit; never edit the method without a bump.
4. Sync ritual (only when you bumped): commit the skill directory as a STANDALONE commit - message `skill(<name>): v<new> - <one-line reason>` - containing nothing but this skill's files, and regenerate the registry's marketplace manifest in the same change.

Note that a registry LEAD (§6) is a different artifact from a lane-2 lesson: a lesson improves this METHOD, a lead proposes DOMAIN knowledge. A run may produce either, both, or neither.
