# Backlog entries: Phase 8 (architect reference)

Loaded when triage queued any finding, noted or codified a strong pattern or proven negative, or a resume uncovered a new finding (9e). It holds the stub ADR rule and the entry formats for `backlog.md`, `weak-patterns.md` and `strong-patterns.md`.

## Phase 8: Backlog the queued decisions

For every finding the user marked **queue** in Phase 6 (and every finding a resume uncovers, 9e):

### 8a. Write a stub ADR

Same template as Phase 7b ([execute reference](execute.md)), but with:
- `status: proposed`
- Rollout section can be sketchy (filled in when the decision moves to `in-progress` in a future session).
- No commits, no branch.

Save to `$VAULT/Architect/decisions/{YYYY-MM-DD}-{slug}.md`.

### 8b. Append to the backlog

In `$VAULT/Architect/backlog.md`, under `## Pending`, add:

```markdown
- **[{date}] {Title}** - type: {type}, risk: {N}, effort: {s/m/l/xl}, payoff: {N}, reach: {concrete}
  ADR: [[Architect/decisions/{date}-{slug}]]
  Source scan: [[Architect/scans/{date}-{theme}-{mode}]]
  standard: {subject}/{technique} | none
  Status: proposed
  Notes: {any user input from triage}
```

Sort the Pending section by `(reach × payoff) / (risk × effort)` descending (reach = the first integer in `reach`) — easiest high-payoff first. The user can manually re-sort.

### 8c. Update weak-patterns.md / strong-patterns.md

For weak-pattern findings, add or update an entry in `$VAULT/Architect/weak-patterns.md`:

```markdown
## {Pattern title}

- First seen: {date} (this run)  /  Last seen: {date}
- Reach: {count, current}
- Reach trend: {growing | stable | shrinking}
- Backlog item: [[Architect/backlog#decision-N]] (or "no decision queued yet")
- Examples: `{file:line}`, `{file:line}`, `{file:line}`
```

For strong-pattern findings — write only when triage verdict is `note` or `codify`. **Never write entries the user marked `drop`** (drop means "not actually load-bearing"; persisting it would pollute the file). For `codify` verdicts, the entry is written here in skeleton form, then Phase 7B fills in `Codified`, `Codification status`, and `Codification ADR` when the codification ships.

```markdown
## {Pattern title}

- Identified: {date}
- Reach: {count}
- Why it works: {1 sentence}
- Codification status: noted | docs-written | lint-rule-added | test-guard-added | combination
- Last reviewed: {date - set on every aging review snooze}
- Examples: `{file:line}`, `{file:line}`
```

A **proven negative** is recorded in the scan note (§ Proven negatives) and as a strong-patterns entry in the same format plus one line: `- Kept absent by: {gate, proven to fire by <probe command>} | none`.

A strong-pattern entry that a later run **refutes** (the scan found the shape it claimed absent, or the opposite of what it claimed) is never silently deleted: append `- Conflict: {date} - {evidence: command and count, or file:line} - [[Architect/scans/{date}-{theme}-{mode}]]` and let Phase 6 triage decide whether to drop it.

For aging strong patterns marked `drop` in Phase 6, **delete** the existing entry from `strong-patterns.md` (see Phase 7B.h). Entries are not kept around as tombstones.
