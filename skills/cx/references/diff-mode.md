# Diff mode - the daily-sized walk

Loaded by `/cx diff [<ref>]` before anything else (see SKILL.md, **Diff mode**). Everything here
overrides only what it names; every other phase runs as SKILL.md writes it.

A cold vault otherwise forces a full map first, and real maps run to dozens of stops. `diff` reads
only what changed since a ref, as the user meets it, and needs no map, overlay or vault.

## The opening line

Before anything else, print one line:

```
cx diff <ref> (<why this ref>) | overlay: <path|none> | vault: <path|none - the read is in the response> | <n> files, <m> user-meetable
```

## The procedure

1. **Resolve the ref.** A given ref wins. Else the merge-base of `HEAD` with the default branch
   (`origin/HEAD`, else `main`, else `master`); when that is `HEAD` itself or nothing resolves,
   `HEAD~10`.
2. **List the change**: `git diff --name-only <ref>...HEAD`, kept to what a user can meet -
   routes, pages, components, styles, copy and message files, the loaders a screen renders.
   **Uncommitted edits are listed separately, as not part of `<ref>`, and read only on request**:
   in a shared checkout they may be another session's work in progress, not the change under review.
3. **Load the law.** Phase 1 items 4 and 6 always run: the design doc (with the precedence rule in
   SKILL.md, Phase 1) and the heuristics list. Stop notes and promoted patterns are read when a
   vault exists.
4. **Map files to stops.** With a map in `journey.md`, a file maps to every stop whose screen renders
   it. Without one, derive from the router and the imports - **import statements only**; a file
   named in a comment or a string is not imported. A changed route file is its own stop. A route
   reaches any other file when it imports it (one hop) or imports a module that does (two hops);
   nothing further. Write no map.
5. **A data writer is not a stop.** A script, job or ingest that writes data a changed screen reads
   has no screen. Name it in that stop's `Path` line, and check whether its output is actually in
   the store the screen reads - a writer that has never run leaves the screen on its empty state.
6. **Rank, then walk at most 3 stops.** Rank each candidate by *screens reached* x *whether the
   change alters what the user sees or can do* (a copy or layout change does; a refactor with
   identical output does not). State the ranking in one line. Walk the top three; list the rest as
   not walked, and name once any changed file no screen reaches.
7. **Read each** through Phases 3-4 with the change as the scenario: what did this diff do to the
   user at this stop? The path challenge, the left-alone block, the heuristic and the design-doc
   citation on every proposal all hold.

## Labels and the overview

Stops are labelled `D<n> · <route>` (no journey id exists). The overview's `J` field names the
persona from the product brief (`PRODUCT.md` or the overlay's `## Journeys`) or, failing one,
`the user`. `Leaves to` may name a route rather than a next stop.

## Writes, and `--no-dispatch`

Into the vault only if one already exists; otherwise everything goes in the response.

`--no-dispatch` makes the run read-only - no dispatch, no vault write, no commit, and no run-log
line (a read-only info mode for **Skill Reflection**). Under it:

- read from code (`(from code)`) unless the overlay's `## Run` exists; do not start the product to
  find out how;
- skip Phase 5: there is nothing to triage when nothing will be built;
- the path questions (a screen reachable only through a fixture or a writer that never ran) go into
  the `Next?` block as numbered options, not as prompts.

Without `--no-dispatch`, accepted items run Phases 5-7 and commit against the map's stop id or,
with no map, against `D<n> · <route>`.

End with `Next?`: walk the stops left out, build the map (`/cx map`), dispatch the briefs, or
answer a path question.
