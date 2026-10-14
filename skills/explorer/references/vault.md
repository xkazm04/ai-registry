# Explorer vault templates

Every file here is written with the file-writing tool, never through a shell heredoc:
the notes carry backticks, apostrophes and `${}`, and a heredoc has failed on exactly that
(LESSONS.md L206, L255). `$VAULT/Explorer/` below stands for `$VAULT/<vault_subdir>/`.

## Bootstrap (Phase 0, once per vault)

Create what is missing. Do not create `Lessons/` (shared with other skills).

`Explorer/state.md`:

```markdown
# Explorer State

Active claims by `/explorer` runs. Informational only - not a hard lock.
Stale entries (>2h) are released automatically by the next run.

## Active

_No active explorers._
```

`Explorer/coverage.md`:

```markdown
# Explorer Coverage

Per-area visits and the lenses each one ran. `scripts/pick.mjs` reads this file
together with scan-sweep's history to pick the next (context, lens).

## Areas
```

`Explorer/passes.md`:

```markdown
# Explorer Passes

Per-area record of items a **human was asked about and declined** in past runs.
Future passes over the same area skip these. Accepted items don't appear here
(their fix is in the codebase). Items that were not surfaced are also absent,
and so is anything nobody answered - an unanswered item is not a rejection.

## Areas
```

`Patterns/explorer-preferences.md`:

```markdown
# Explorer Preferences (distilled from /explorer runs)

> Rules upgraded from `Lessons/` after 3+ observations. Loaded by Phase 1.

_No patterns yet. Will be populated as runs accumulate._
```

## Claim line (Phase 3)

```markdown
- **{area-slug}** - claimed_at: {ISO timestamp}, run_id: {short random id}, category: {lens}
```

## Coverage row (Phase 9f)

```markdown
### {area-slug}

- Last visited: {YYYY-MM-DD}
- Last run: [[Explorer/sweeps/{date}-{area-slug}]]
- Contexts: {exact context-map name} | {exact context-map name}
- Lenses: bug {YYYY-MM-DD}, sec {YYYY-MM-DD}, quality {YYYY-MM-DD}
- Items surfaced (last 3 runs): [10, 8, 10]
- Items accepted (last 3 runs): [3, 5, 4]
- Yield density: {accepted / surfaced average}
- Notes: {anything noteworthy across runs}
```

- `Contexts:` names the map's contexts exactly, separated by ` | ` (names contain commas
  and ampersands). Without it, `pick.mjs` resolves the slug against context names, then
  group names.
- `Lenses:` is a running union: keep the lenses earlier runs recorded, update the date of
  each lens this run ran, add new ones. Record the picked lens, plus any lens whose probe
  set ran. An incidental item of another lens does not mark that lens run, and a category
  filter of `any` is not eight lenses.
- A legacy row with no `Lenses:` line is read by `pick.mjs` as lenses inferred from the
  item categories in that area's sweep notes, and reported as inferred. Add the line on
  the next visit.

## Item fields (Phase 5)

```yaml
- id: 1
  title: "<short imperative phrase, <=60 chars>"
  category: quality | dx | ui | perf | bug | i18n | a11y | sec
  severity: critical | high | medium | low
  effort: xs | s | m | l
  probe: "<probe id from references/probes.md, or sample>"
  anchor: "<file_path>:<line_number>"
  premise: "<claim type> -> <the evidence read: file:line of the caller / parent / test>"
  evidence: "<2-3 sentences, a verbatim snippet if it helps>"
  suggested_fix: "<1-2 sentence shape of the fix>"
  strong_pattern_ref: "<wikilink to Architect/strong-patterns#...>" | null
  i18n_impact: "<none | adds new strings (every locale, same change) | touches existing keys>"
  cluster_hint: "<ids that ship with this one, or standalone>"
```

## Triage prompt (Phase 7)

Default run - the `m`/`l` band only:

```
{N} small item(s) (xs/s) accepted automatically - building now.

{M} larger item(s) need your call:
  [3] {title}  (m)  {the one thing only you can decide}
  [7] {title}  (l)  {the one thing only you can decide}

Reply with numbers to action, or: all | none | Enter = none
```

`--triage-all` - still one question:

```
{K} item(s) found. Pick what to build (one reply):

  [3] {title}  (m)  {the one thing only you can decide}
  [7] {title}  (l)  {the one thing only you can decide}
  small - the small band: [1, 2, 4, 6] (xs/s)   e.g. "small -4" drops item 4

Reply "small 3", "all", "none", or numbers. Enter = small
```

## Sweep note (Phase 8) - `Explorer/sweeps/{YYYY-MM-DD}-{area-slug}.md`

```markdown
---
date: 2026-05-01
run_id: {short id}
area: {context-id or group}
contexts: [{exact map name}, ...]
lenses: [bug, sec]            # lenses pointed at a named artefact this run
picked_by: pick.mjs | user    # and the pick line, verbatim, in the body
files_sampled: {N}
probes_run: [known-gaps, gate-matrix, consumer-claim]
category_filter: any | quality | ...
total_items: <actual count, 0-10>
auto_accepted: [1, 4, 5]      # the xs/s band - built without asking
triaged: [2, 3]               # the m/l band - put to the user
accepted: [1, 3, 4, 5]        # everything actually built (auto + triaged-in)
declined: [2]                 # only ever a human's explicit "no"
unasked: []                   # triage-band items nobody answered - resurface next run
deferred: []
killed: 3                     # candidates the premise gate rejected
commits: [<sha1>, <sha2>]
widened: false
---

# {Area title} sweep - {date}

Pick: {the pick.mjs line or the user's choice, and why}

## Items

### [1] {title} - accepted -> {sha} `{commit subject}`
**Category / Severity / Effort:** {cat} / {sev} / {effort}
**Probe:** {probe id | sample}
**Anchor:** `{file:line}`
**Premise:** {claim type} -> {the evidence read: caller, mounting parent, failing test}
**Evidence:** {evidence}
**Fix shape:** {what was actually done; the commit body has the detail}

### [2] {title} - declined
...
**Decline reason:** _filled in Phase 9_

### [4] {title} - unasked (unattended run - not declined)
...
**Status:** `decided: unasked` - put to no one; NOT fingerprinted in passes.md.

### [3] {title} - deferred
...
**Reason:** {concrete blocker, not "later"}

## Killed candidates

- {claim, one line} - killed by `{deciding file:line}`: {what that file showed}

## Cross-references
- Adjacent contexts with open lenses: {from pick.mjs, optional}
- Related preferences: [[Patterns/explorer-preferences]]
```

## Lessons entry (Phase 9b) - `Lessons/{YYYY-MM-DD}-explorer.md`, append

```markdown
## Run: {timestamp} - {area} ({lens})

Sampled: {N} files; probes: {list}
Surfaced: {M} items ({P} from probes, {S} from sampling); killed: {K}
Accepted: [list]
Declined: [list] (with reasons)
Deferred: [list] (with blockers)

### Self-reflection
- Probes that paid / that came back empty: {list}
- Calibration drift: {e.g. "rated 7 items high, 2 were"}
- Tools to use more / less next time: {observation}
```

## passes.md fingerprint (Phase 9d)

```markdown
## {area}

- {file:line} - {1-line summary of the rejected suggestion} - pass {date}, run {id}, reason: {short reason}
```

## Decline question (Phase 9a)

```
For the declined items, why did you skip them?

  [2] {title}
  [5] {title}

Reply per-item ("2: too vague, 5: already planned") or one overall reason.
  skip    - record "no reason given"
  Enter   - same as "skip"   <- default
```

## Pattern promotion (Phase 9e)

```
I've seen this 3+ times - promote to permanent rule?
  "{distilled rule}"

Source runs: [[...]], [[...]], [[...]]

Next?
  1. promote to Patterns/explorer-preferences.md   <- default
  2. snooze (re-ask after 3 more observations)
  3. drop (don't promote, reset the counter)
```

## Final summary (Phase 10)

```
Explorer run complete.

  Area / lens:    {context(s)} / {lens}  (picked by {pick.mjs | user})
  Probes run:     {list}
  Files sampled:  {N}
  Items surfaced: {M} (ceiling 10) - {P} from probes, {S} from sampling
  Killed:         {K} at the premise gate (deciding files in the sweep note)
  Auto-accepted:  {A} (xs/s, built without asking) -> {shas}
  Triaged:        {T} put to you -> {K} actioned, {L} declined
  Unasked:        {U} (unattended - resurface next run, not recorded as declines)
  Deferred:       {D}
  Unverified:     {what the gates could not settle, or "none"}
  Gate baseline:  {the full-gate line recorded before the first edit}

  Coverage: {area} lenses now {list}

  Files updated:
    + $VAULT/Explorer/sweeps/{date}-{slug}.md
    + $VAULT/Lessons/{date}-explorer.md
    ~ $VAULT/Explorer/coverage.md
    ~ $VAULT/Explorer/passes.md  (if any declines)
    ~ $VAULT/Explorer/state.md   (claim released)

  Next?
    1. /explorer  (next pick: {context} / {lens})   <- default
    2. /explorer {same area}, lens {next open lens}
    3. /research {area}    (external-source companion run)
    4. /explorer {area} --triage-all   (if the auto band ran larger than expected)
    5. done
```
