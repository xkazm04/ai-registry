# The vault - what a council remembers between runs

Resolve `VAULT` = the first existing `vault:` candidate in the overlay, else
**`<repo>/.personas/council/vault/`**. **The same schema either way**, and an
Obsidian-openable folder either way. Everything then lives under
`$VAULT/<vault_subdir>/` (default `Council`).

> **The `<repo>/.council/` default is retired.** It put an untracked directory in the
> consuming repo's `git status` forever, in a repo that had no reason to ignore a path it
> had never heard of - while this file's own rule two paragraphs down says the vault is not
> version controlled. The new default lives under `.personas/`, the tree that already holds
> the run directories and the `state_file` and that a consuming repo has therefore already
> had to ignore. **To move an existing one:** `git status` first to be sure nothing in
> `.council/` was ever committed, then move the whole directory to
> `<repo>/.personas/council/vault/` (`mv`, not copy-and-delete - the notes are the record
> and there is no recovery feature behind them), confirm `runs/` came with it, and delete
> the old path only once the new one reads. Nothing inside needs rewriting: the schema is
> identical and no note stores its own location. A repo that prefers the old path keeps it
> by naming it in the overlay's `vault:` - the default moved, the key did not.

**The vault is created when it is absent**, at phase 0, before anything reads it: the vault
directory, `runs/`, a headed but empty `Bar.md`, and an empty `Calibration.md`. **An empty
`Calibration.md` means `uncalibrated`**, which is the correct first state of every repo and
not a gap for a Director to fill in.

The run directory in the repo holds what ONE run produced. The vault holds what the
councils have learned, which is the part that makes the tenth run better than the first.

```
Council/
  Council.md                      HOME: the subject ledger
  Bar.md                          the wins/seen ledger - what a good verdict has looked like
  Calibration.md                  what the judges have been measured to do
  market-briefs/<project>/<slug>.md   cached prior-art reads, dated
  runs/<run_id>.md                one immutable note per completed run
```

## Vault safety - non-negotiable

The vault is not version controlled, and no file-recovery feature ever sees an agent's
writes. So:

- **Never open for write a note you did not create this session** without re-reading it
  immediately first. Never patch from a copy read at the start of the run.
- **Note names collide.** Probe before writing and suffix `-2`, `-3`.
- After any parallel phase, **list the target directory** and backfill anything a member
  was supposed to leave and did not.
- Nothing in the vault is a source of truth for a consumer. `result.json` is.

## `Council.md` - the ledger

One row per subject the council has ever seen. Rewritten in place; it is an index, not a
record.

```markdown
| Subject | Kind | Rounds | Last outcome | Last run | Human decision | Drift |
|---|---|---|---|---|---|---|
| onboarding-to-first-run | use_case | 2 | ready | 2026-09-20-...-r2 | approved 2026-09-21 | none |
```

## `Bar.md` - the wins/seen ledger

The point of the vault. A statement about what a good subject looks like in THIS product
gains a **win** when it appears in a subject a person approved, and a **sighting** every
time a member names it. Same shape as a pattern ledger elsewhere in the fleet, and the same
discipline: curate three strong statements rather than ten restatements of the rubric.

```markdown
### <slug>
statement: <one line, phrased so it transfers to a different subject>
wins: 2   seen: 7
- <run_id>: <the evidence, one line>
```

A statement is written **once**; later runs append an evidence line and move the counters.
The statement text of an existing slug is never rewritten by a later run - if it was wrong,
add a new slug and say in its first evidence line which one it supersedes.

**`Bar.md` is quoted into the next council's briefs as the floor**, with an explicit
instruction not to grade against it mechanically: it is the bar that has been cleared
before, not a rubric row.

## `market-briefs/<project>/<slug>.md` - the 30-day cache

Written by the rivalry member, read by the rivalry member.

```markdown
---
subject: <slug>
project: <project>
researched_at: <YYYY-MM-DD>
capability: <the one capability compared>
---
## Who            (2-4 named products, each with its pinned version or release date)
## What they do that we do not
## What we do NOT take, and why
## Where they are ahead
## Sources        (the urls, one per line)
```

`researched_at` is the whole contract. A brief **within 30 days** is used as-is and costs
no lookups. Older, or absent, and the member researches and writes a new file. A refresh
**supersedes**: write the new brief, and keep the old one as a dated section beneath it
rather than deleting it - a comparison that changed is itself a finding.

## `runs/<run_id>.md` - immutable

One note per completed run: the frontmatter identity, the dimension table, `must_address`,
the human decision when one arrives, and a link to the run directory in the repo. Written
once. A later round writes its own note and links back; it never edits this one.

```markdown
---
run: <run_id>          subject: <slug>        kind: use_case | architecture
round: <n>             supersedes: <run_id | ->
rubric: feature-v1     trust_state: uncalibrated
outcome: ready         overall: 0.72          coverage: 0.85
head_sha: <sha>        span_digest: <64 hex>  drift: none | grown | changed | unknown
decided: <approved | rejected | -> on <date>   reason: "<the person's words, verbatim>"
---
```

A human rejection's **reason is quoted verbatim** and is the highest-value line in the
vault: it becomes `must_address` on the next round, and it is the only signal the method
has about what this particular person actually cares about.

## `Calibration.md`

What is actually known about the judged members' repeatability, and therefore why
`trust_state` reads what it reads.

```markdown
## <YYYY-MM-DD> - <what was run>
- repeats: <n> of the same subject at the same round
- spread per judged dimension: value <x>, craft <y>, rivalry <z>
- labelled set: <n> subjects with a human verdict, agreement <m>/<n>
- verdict: uncalibrated | untrusted | trusted, and why
```

**Until a calibration entry exists, `trust_state` is `uncalibrated` and every report says
so.** Writing `trusted` into an overlay because the scores look sensible is the one move
that would quietly turn this whole method into a rubber stamp.
