# The contest vault

An Obsidian-openable folder. `contest.mjs verdict` writes it; nothing else does. Resolve the
root from the overlay (`vault:` candidates, first existing wins; default `<repo>/.contest`),
then use `<root>/<vault_subdir>/` (default `Contest`).

```
<root>/Contest/
  Contests.md              # index table, newest first, one row per contest
  Patterns.md              # the ledger: one `## <slug>` per design philosophy, with wins/seen counts
  contests/<id>.md         # one note per contest
```

## contests/<id>.md

Frontmatter (`contest`, `title`, `date`, `project`, `participants`, `judges`, `winner`,
`winner_seat`, `runner_up`, `shortlist`, `patterns`, `tags: [contest]`) so Dataview can table contests by
seat or pattern. Body: the idea, the scoreboard (mean, spread, the rubric dimensions, per-judge totals,
seats unblinded), the seats' reported cost and wall time, the host's decision note, the patterns
and anti-patterns the panel named, each pattern linked to its ledger section.

## Patterns.md

```
## <slug>

<statement - one transferable design philosophy>

wins: <n>
seen: <n>

- <contest-id>: <evidence> (winner)
- <contest-id>: <evidence>
```

`wins` counts contests where the winning variant carried the pattern; `seen` counts contests
where any judge named it. `contest.mjs init` reads this ledger and quotes the top entries in
every participant's brief under "What has won before" - as the bar to surpass, with an explicit
instruction not to copy. That loop is the point of the vault: each contest's winners raise the
floor of the next.

A shortlist verdict (`verdict --shortlist`) writes the same note with no winner, the owner's review
in place of the decision, and sightings only in the ledger. The refinement round is a contest of
its own (`<id>-r<round>`) and gets its own note when it is decided; link the two by hand.

## Hygiene

- The vault is not version-controlled and no app snapshots agent writes. Update notes; never
  duplicate a slug. `verdict` refuses to overwrite a contest note unless `--force`.
- Entry artefacts stay in the arena (`<arena>/<id>/entries/`), not in the vault; the note links
  the winner's path. Promote a winner into a product by copying it out of the arena in a
  separate, reviewed change.
