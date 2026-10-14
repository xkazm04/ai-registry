# Resume and status (architect reference)

Loaded when Q1 picked `resume` (drain one decision) or `status` (read-only refresh of the whole backlog). Both skip Phase 3 — no scanning. Both run the same refresh, 9c, which is the reason they share a file: status is 9c over every pending ADR, resume is 9c over the one you are about to execute.

## Phase 9: Resume mode

Triggered when input was `resume`. Skip all of Phase 3 (no scanning).

### 9a. Read the backlog

Open `$VAULT/Architect/backlog.md`. Print the Pending section to the user, formatted as a numbered table:

```
Pending architect decisions ({N}):

#   Date         Title                                                   Type           R/E/P  Reach
─   ──────────   ─────────────────────────────────────────────────────   ────────────   ─────  ──────────────
1   2026-04-15   Inconsistent loading state shape across feature modules  weak-pattern   3/m/4  47f / 12c / 3s
2   2026-04-15   Replace handcrafted form state with react-hook-form      tech-swap      4/xl/4 ~280f
3   2026-04-22   Missing useInterval primitive; polling leaks             struct-bug     4/l/4  8 effects
...
```

R/E/P = risk / effort / payoff. If the backlog carries a `Last refreshed:` line from a status run, print it and each entry's last class (§ Status mode) beside its row.

### 9b. Pick one to execute

Ask:
```
Which to execute now? Reply with a decision number (1-{N}).

Shortcuts:
  open N   - read the full ADR before deciding (re-asks after)
  abort    - bail; nothing executes
  Enter    - pick decision #1 (top-priority)   <- default
```

If they pick `open N`, read the ADR file and print it. Then re-ask.

### 9c. Refresh the ADR

The ADR was written previously and may be stale (codebase has moved on). Before executing:
- Re-verify the file:line anchors still exist.
- **Re-count reach with the ORIGINAL command** — the ADR's `reach_cmd`, verbatim; with none recorded, reconstruct it, say so, and record it — in the ADR on a resume; in status, in the entry's `Refreshed:` line, never in the ADR. A count from a different predicate is a different number, not a delta.
- **Re-measure the acceptance criteria against the tree**, not against the backlog line. A later session may have shipped the main step under a different commit prefix; only the criteria catch that.
- Read `git log --since=<ADR date>` on the touched files to spot conflicts and work done elsewhere.
- Classify the result (the same four classes § Status mode uses): **still-valid**, **re-sized** (reach or effort band moved — give old -> new; a size change is what the user is actually deciding), **done-elsewhere** (criteria met; name the commit), **stale** (anchors gone or the proposed shape is now wrong).
- If anything material has changed, **stop and present the delta to the user**. Ask whether to proceed, reshape, or abandon. Do not re-execute a step someone else already shipped.

If nothing material has changed, fill in any sketchy parts of the Rollout section and proceed.

### 9d. Execute

Load [the execute reference](execute.md) and run 7a (isolation) through 7h normally — resume executions get a worktree like any other multi-file rollout.

### 9e. Findings a resume discovers

Executing a decision routinely uncovers a new one. Do not fold it into the current ADR and do not leave it as prose: write it through Phase 8 ([backlog entries](backlog-entries.md): stub ADR + backlog entry) with `Source: resume of [[Architect/decisions/<adr>]]` in place of a source scan, and count it in coverage.md as both a drain and a fill — otherwise the drift signal in § Notes on use (scans fill, resumes drain) reads a resume that discovered work as pure drain.

## Status mode (read-only)

Triggered when input was `status`. Answers "what is the backlog actually worth today?" without executing anything. **Read-only on the repository** — no edits, no worktree, no commits; the only write is `backlog.md` in the vault. It is a read-only info mode for the run log (§ Skill Reflection).

1. Read `$VAULT/Architect/backlog.md` and every ADR under `## Pending`.
2. Run 9c's refresh over **each** pending ADR (anchors, `reach_cmd` re-run, acceptance criteria re-measured, `git log --since`). Read the ADR's governing registry subject only when re-sizing it needs the standard's predicate. Independent ADRs can fan out to read-only sub-agents; if the harness refuses them, run them yourself.
3. Classify each **still-valid / re-sized / done-elsewhere / stale**, with one line of evidence: the command and its number, or the commit sha, or the anchor that vanished. A class with no evidence is not a class — mark it `unverified (<why>)`.
4. Update `backlog.md`: set `Last refreshed: {date}` under the title, and append to each entry `Refreshed: {date} - {class} - {evidence}` (plus `reach_cmd (reconstructed): <command>` when the ADR had none). Do **not** move entries between Pending / Shipped / Abandoned on your own; that is the user's call in step 5.
5. Print the table with the class column and end with:

```
Next?
  1. resume N        - execute decision N (refreshed today, 9c is already done)   <- default: top still-valid
  2. close N         - mark a done-elsewhere entry shipped (cites the commit)
  3. abandon N       - move a stale entry to Abandoned with the evidence as reason
  4. reshape N       - re-size the ADR to the new numbers, keep it pending
  5. done
```

`close`, `abandon` and `reshape` edit only the vault. A `resume N` from here skips 9a-9c (done minutes ago) unless the tree moved since — check `git log -1` against the refresh.
