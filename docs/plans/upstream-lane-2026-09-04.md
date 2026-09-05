# The upstream lane — re-reading the trees we already mined (2026-09-04)

A design for `/librarian` 1.4.0. It adds one responsibility: **notice when a repository
this registry already mined has moved, and decide whether the movement changes us.**

Everything below is measured against the vault as it stands on 2026-09-04. The counts
are reproducible from the scripts named; where a number is an estimate it says so.

---

## 1. The gap, measured

| fact | count | where |
| --- | --- | --- |
| source notes in the vault | 156 | `librarian/sources/` |
| notes whose `url:` is a GitHub repository | 78 | `^url: https://github\.com` |
| distinct repositories behind them | 73 | deduped by `owner/repo` |
| notes carrying a `commit:` pin | 66 | frontmatter |
| notes carrying a `rescan_when:` return condition | 23 | frontmatter |
| **application files citing a full 40-char external commit** | **163** | `knowledge/**/applications/` |
| distinct external commits those citations pin | 33 (17 traced to a source note) | — |

The `rescan_when` values are not vague. They name upstream events:

> "CHANGELOG.md gains a released section carrying PRs 3555 (standby restart on
> unroutable invalidation) and 3913 (transaction limit one below the pool)" — openbao
>
> "the receipt-sequenced paste leaves its debug gate" — handy
>
> "the tree lands a VALID_HOOKS-to-emit-site drift test" — hermes-agent

**Nothing reads them on a clock.** `/intake` Phase 1 checks its own conditions, but only
when an operator arrives with a *different* link — the check is a side effect of
unrelated work. The intake scorecard records exactly this: *"the two earlier ones checked
at Phase 1 — neither fired (one day old)."* A condition that is only ever evaluated one
day after it was written is not a mechanism.

This is the same shape as the gap Step 8 closed on 2026-09-02: a lane banks an obligation
and no loop returns to it. There, the registry got better and the projects never found
out. Here, upstream gets better — or upstream moves out from under a citation — and
nobody finds out. The fix is the same shape too: a step in `/librarian`, a counting
script, a ledger row. **Not a new skill.**

### The half that is not optional

163 application files assert things about code at a commit. When that tree moves, no
instrument re-opens them. `check-currency.mjs` ages *our* `verified_on` dates; nothing
ages an *external* pin. A force-push or a deleted branch makes a cited commit
unreachable and the application keeps reading as evidence.

That is the lane's hard product. "Did they ship a breakthrough" is the interesting half;
"is our citation still true" is the half that has to happen whether or not anything
interesting shipped.

---

## 2. Selecting repos: the instrument that did not work, and why it matters

The obvious eligibility rule is **corpus reach**: join the source note to the subjects it
moved (via `run_id`, or a `[[slug]]` wikilink — 69 of 78 notes join), then those subjects
to `fleet-map.json`'s `subjects[].present`, and count the fleet projects that hold a
context under them.

It was prototyped and it fails, in two independent ways:

- **It saturates.** 33 of 78 repos score the full fleet, 53 of 78 score ≥ 4. The
  subjects that most sources touch (`error-handling`, `settings`, `quality-gates`,
  `retry-backoff`, `module-design`) are present in every project, so reach measures
  subject popularity, not repository relevance. The vault already has the name for this:
  *"a signal that is always on is off"* (2026-09-02, the per-subject staleness lesson).
- **It is biased against the best sources.** `vllm-project/vllm` forged six systems and
  scores reach 0, because subjects born from a source are not yet in any project's
  registry map. The instrument ranks a repo lowest exactly when it taught us most.

Recording this because the failure is cheap to repeat: the plausible instrument was
built, run, and rejected on its output. Assert an instrument against the population
before designing around it.

## 3. Selecting repos: feature-set match, measured as reach *into our code*

The operator's rule is *follow the repos whose feature set matches ours, not the ones we
admired for code quality.* Made mechanical: **feature-set match is evidence that this
repository's knowledge reached a project's tree.** That is already recorded, per source
note, in fields nobody has to write anything new for.

Three tiers, precedence order, each an existing fact:

| tier | test | means | count today |
| --- | --- | --- | --- |
| **1 — peer** | `directions:` records a peer comparison study, **or** `handoff:` records a forge | we measured ourselves against this system's architecture, or adopted it | **9** |
| **2 — shipped** | `shipped: >= 1` | a change reached a project tree because of this repo | **19** |
| **3 — applied** | `applied: >= 2` with at least one `better` verdict in `applied.md` on a subject it touched | tested against a real seam, not yet shipped | **15** |

Two exclusions, both stated so they are not re-derived every run:

- **Catalogue class** (`awesome-*`, reference indexes, paper aggregators, curricula,
  doctrine corpora) — 11 repos. A catalogue's delta is more rows, and rows belong in
  `librarian/harvest/`, not here.
- **Unpinned** — 11 repos with no `commit:`. A delta needs a base. These are reported as
  `pin: none, delta: unknown`, never as "no change". *Unknown is not zero.*

**And one exclusion by lane: the watchlist's Track B.** Track B's own header says its
axis is "premium engineering reputation", and `[[2026-08-22-2]]` measured the two tracks
near-orthogonal. A tree admitted for engineering mastery re-scans as more mastery; that
is `/reconcile`'s job, on `/reconcile`'s terms. This lane never touches it. Likewise the
class B/C standards and registers — a spec is re-pinned by the wave that cites it.

**Result: 43 of 73 repositories eligible, 30 excluded with a stated reason.** The
excluded set includes repos whose landings all came back `unapplied — no seam in the
fleet`, which is precisely the operator's "learned through their code quality" class.

---

## 4. Cadence

The clock has three floors and a condition override. The floors differ by tier because
the existing `rescan_when` values already chose different fallbacks for good reasons —
MONAI ships twice a year, `getsentry/self-hosted` ships monthly on the 15th.

| trigger | effect |
| --- | --- |
| a named condition fires (a release landed, a tagged version appeared since the mine) | **due now**, whatever the clock says |
| tier 1, no condition fired | floor **30 days** |
| tier 2 | floor **60 days** |
| tier 3 | floor **90 days** |
| a repo whose `handoff:` is not yet forged | **not due** — it is owed work, not a re-scan |
| archived upstream | retire the row, struck not deleted |

Caps, which are the part that keeps this from becoming a feed:

- **At most 3 delta re-scans dispatched per `/librarian` run.**
- **At most 6 per calendar month.**
- They count against step 5's existing **cap 10 concurrent** and step 6's ~8-per-sitting
  review ceiling. They do **not** get their own budget. If the structural worklist is
  full, the upstream pass records the due rows and takes none.
- Everything due and not taken is written down with the reason, so the next run does not
  re-derive it. (Same rule as the direction pass's "record the ones you did not write".)

**Measured today: 0 repos are due on the clock.** The whole eligible population was mined
within the last four days. The lane starts quiet and its first firing will be
condition-driven — which is the correct first result, and the reason the instrument needs
a `--self-test` rather than a first run to prove it works.

---

## 5. The instrument — `scripts/upstream-check.mjs`

`/librarian`'s first non-negotiable is *never count anything yourself*. So the lane is a
script, and the skill spends judgment only on what its output means.

Reads: every `librarian/sources/*.md` frontmatter with a GitHub `url:`; `mined_on:` or
the filename date; `commit:`, `rescan_when:`, `kind:`, `directions:`, `handoff:`,
`shipped:`, `applied:`; `librarian/applied.md`; `librarian/upstream.md`.

Per eligible repo, three `gh api` calls — verified live against three repos today:

```
repos/{o}/{r}                          -> default_branch, pushed_at, archived
repos/{o}/{r}/releases?per_page=5      -> releases published since mined_on
repos/{o}/{r}/compare/{pin}...{branch} -> status, ahead_by, behind_by, total_commits, files
```

Measured cost: **~129 calls for the whole eligible set**, against an authenticated limit
of 5000/hr. The lane is not rate-limit constrained.

Emits per repo: `tier`, `eligible`, `daysSince`, `releasesSince[]`, `aheadBy`,
`behindBy`, `filesChanged`, `pinReachable`, `conditionText`, `conditionState`, `due`,
`reasons[]`.

Five honesty rules the script must carry, each earned by a failure already in this
repo's ledger:

1. **It never claims a prose condition fired.** `conditionState` is one of `fired`
   (a release or tag landed after the mine — the only clause a script can decide),
   `not-fired`, `undecidable` (prose the model must read), or `none`. The condition text
   is printed beside the release evidence; the librarian judges. Same division of labour
   as the scan.
2. **Unpinned is `delta: unknown`, never `no change`.**
3. **`behind_by > 0` or an unreachable pin is a finding, not an error.** The compare uses
   the merge-base, so a force-push shows up as `behind_by`, and a 404 on the pin means a
   cited commit is gone — which makes every application citing it unverifiable *now*.
4. **A network or rate-limit failure is reported per repo as `error`, never folded into
   `not due`.** A dead API that grades as all-clear is the failure mode the 2026-08-23
   dispatcher lesson already paid for ("a free fleet can be entirely down, and the
   experiment must say so rather than grade silence").
5. **`--self-test` asserts against a known positive** before any absence is trusted —
   a pinned repo known to have moved must come back `ahead`. Two entries in the operator's
   own memory (`grep -L` with `-q`, multi-`-e` grep) are the same class of silent
   wrong answer.

---

## 6. The dispatch — reuse `/intake`, do not write a worker

The delta re-scan already exists and its yield profile is already measured. From
`2026-09-01-openwiki-v050.md`, a re-scan of a repo mined five days earlier:

> **A delta's unique product is not new features — it is reversals**, because a reversal
> is a design decision that production tested and found wrong. Everything else in a
> seven-day window is already-covered or thin.

That run predicted "a high catch rate, 2-4 landings, and at least one amendment
corroborated by the vendor moving to our position", and got exactly that. The lane's job
is to make that run happen on a clock instead of on a whim.

New dispatch row in step 5:

| finding | engine |
| --- | --- |
| an eligible repo's condition fired, or its clock floor passed | scoped `/intake <url> --delta --since <pin>` — one Opus worker per repo, under the same cap, reviewed under step 6 |

The worker contract is a new **`docs/upstream-brief.md`**, sibling of
`reconcile-brief.md` and `harvest-brief.md`. It states only what differs from a first
scan:

1. **Read the prior source note first.** Its declines answer half of what you are about
   to propose. openwiki's run: *"the prior note is the most important input to this one,
   and reading it first changed the whole shape of the run."*
2. **Sweep in reversal order** — changed operating documents, the changelog's `Fixed`
   list, then the diff of anything the prior note cited by `file:line`.
3. **Re-open every citation this repo's commit backs.** Non-discretionary. An
   application whose cited lines moved is either re-verified against the new commit or
   its claim is withdrawn. This is the lane's floor: a delta run that lands no technique
   but repairs three citations is a successful run.
4. **State the expected yield before the triage table** (high catch rate, 2-4 landings,
   at least one amendment). Deviating from the prediction is itself a finding worth
   writing down.
5. Everything else is intake's existing procedure — Phase 7.5 apply and A/B, Phase 7.6
   directions, an `applied.md` row per landing, Phase 8 ship. The lane inherits every
   discipline rather than inventing one. **That is what "without harm" means here.**

"Analyze impact and execute" therefore needs nothing new: 7.5 is the impact analysis,
7.6 is the direction, `applied.md` is the receipt, and step 8's propagation carries it
to the fleet.

---

## 7. The memory — `librarian/upstream.md`

One row per eligible repository. The register that answers *when did we last look at
this, and what did we see* in one second — the same job `sources/index.md` does for
"has this been mined".

| repo | tier | pinned | last scanned | last checked | upstream state | condition | note |

Rules, matching the vault's existing character:

- **Append and update in place; never delete a row.** (The watchlist's own standing rule.)
- A repo checked and found unmoved gets its `last checked` date updated and nothing else.
  That row is the record that we looked — without it, "are we overdue?" is unanswerable.
- **Record due-and-not-taken with the reason** (cap, unforged handoff, tier floor).
- Retire on archive or on the repo's subjects leaving the fleet — struck through, dated.
- Public lane: slugs, dates, counts. Never a consumer's paths.

The lane needs **no new frontmatter field** to work — `commit:`, the filename date,
`kind:`, `shipped:`, `applied:`, `handoff:` and `directions:` are all already written.
A delta run produces a new source note under the existing `-v2` / `-vNNN` convention,
and the ledger's `last scanned` is that note's date.

One change to `/intake` is worth making, and only one: **`rescan_when:` becomes mandatory
on repository-class source notes.** It is already the declared practice since 1.6.0
(23 notes carry one); making it required costs a sentence and is the lane's fuel.

---

## 8. Where it attaches

| step | change |
| --- | --- |
| **1 — prove the instrument** | add `node scripts/upstream-check.mjs --json`, and its `--self-test`. Runs every sweep; it is three seconds and 129 API calls. |
| **4 — rank** | new judgment: **"upstream movement is third-party demand, and it ranks below ours."** Consumer deviation, verdict debt and a due lead all outrank a delta. A citation whose pin is unreachable is the exception — that is corpus decay, and it ranks with `check-currency`'s expiries. |
| **5 — dispatch** | the delta row above, inside the existing cap. |
| **7 — commit and vault** | write `librarian/upstream.md`; record declines. |
| invocation | `/librarian upstream` — run the lane alone, report and dispatch nothing without the operator. |
| scheduling | `upstream-check.mjs --due --exit-code` becomes the second cron wake-trigger beside `check-currency.mjs --fail-on-expired`, when that wrapper is built. |

Version `1.3.0` → `1.4.0`. `LESSONS.md` gets its entry **after the first real run**, not
before — that file records what runs taught, and this lane has not run.

---

## 9. Harm analysis

The failure modes this lane could introduce, and what stops each:

| risk | control |
| --- | --- |
| **It becomes a news feed.** 73 repos × monthly = a permanent worklist. | Three eligibility tiers (43 of 73), two class exclusions, 3-per-run and 6-per-month caps, and "dry is a result" restated for the lane. A pass that finds nothing due writes one line and exits. |
| **It crowds out the corpus work.** | Deltas share step 5's cap 10 and step 6's review ceiling. No separate budget. Structural and consumer demand outrank upstream movement in step 4. |
| **It duplicates `/reconcile`.** | Track B and the class B/C counterparts are excluded by lane, in writing, in both the skill and the watchlist. |
| **It duplicates `/harvest`.** | The pass greps `librarian/harvest/` for a queued row on the same URL and defers to the queue. |
| **It collides with parallel sessions.** | A delta claims subjects on `run-board.mjs` like any intake. This checkout demonstrably has a dozen live siblings — `watchlist.md` and `LESSONS.md` both changed underneath this design while it was being written. Append, never regenerate. |
| **A silent instrument.** | `--self-test`, per-repo `error` state, and the five honesty rules in §5. |
| **A clock nobody winds.** | Stated rather than papered over: the lane is due-checkable at any time and the ledger makes "how overdue" a fact. Automatic firing waits for the cron wrapper the skill already scopes — and that wrapper must keep the pull-request rule. |

---

## 10. What this deliberately does not do

- **It does not scan repos we have never mined.** That is the watchlist's Track A and the
  harvest queue. This lane only re-reads what the registry already paid to read once.
- **It does not grade upstream quality.** No maturity scan, no adoption score. Movement
  and citation validity only.
- **It does not decide prose conditions mechanically.** The script reports; the librarian
  reads; a worker verifies against the tree.
- **It does not push.** Pull request only, on a branch, like everything here.

## 11. Landing sequence

1. `scripts/upstream-check.mjs` + `--self-test`, asserted against a repo known to have moved.
2. `docs/upstream-brief.md`.
3. `librarian/upstream.md`, seeded with the 43 eligible rows and the 30 exclusions.
4. `SKILL.md` → 1.4.0; the step 1/4/5/7 edits and the `/librarian upstream` invocation.
5. `/intake`: the one `rescan_when` clause.
6. `librarian/index.md` and `watchlist.md`: one line each pointing at the new lane and
   its Track B exclusion.
7. Gates in order — `check-bundles`, `build-index`, `build-catalog`,
   `build-knowledge-rules`, regenerate `rules/` — then a pull request. Never a push.

## 12. Open question for the operator

Tier 3 (`applied >= 2`, nothing shipped) admits 15 repos on a 90-day floor. That is the
weakest evidence class in the design, and it is the one most likely to produce a delta
run that lands nothing. The alternative is to drop tier 3 and let those repos re-enter
only when a condition fires — 28 eligible instead of 43, and a lane that is quieter than
the operator asked for. This design keeps tier 3; the first three months of the ledger
will settle it, and the ledger is what makes that settlement evidence rather than taste.
