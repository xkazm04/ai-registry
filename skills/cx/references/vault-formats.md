# Vault formats

Loaded by SKILL.md when it bootstraps a vault (Phase 0), closes a stop (Phase 7) and closes a
session (Phase 8). The rules for what goes into each file live in SKILL.md; this file holds only
their shapes.

## Layout

```
$VAULT/
  Cx/journey.md              the ordered stops and their state
  Cx/state.md                where the walk is - rewritten per stop
  Cx/triage.md               the human triage queue --auto fills (l/xl and gated items)
  Cx/stops/S<n>.md           one note per stop: overview, read, decisions, landed, before/after
  Cx/stops/S<n>-before.png   and -after.png (one per surface when the stop names two)
  Patterns/cx-preferences.md promoted rules (shared Patterns/ folder)
  Lessons/<date>-cx.md       per-run reflection (shared Lessons/ folder)
```

## Bootstrap headers (Phase 0)

`$VAULT/Cx/journey.md` - header only (Phase 2 fills it):

```markdown
# Journey - <product>

The ordered stops. One line per stop; state is the first character.
[ ] not walked   [~] walked, items open   [x] done   [-] skipped, reason in the note

## Journeys
```

`$VAULT/Cx/state.md` - header only:

```markdown
# CX State

Where the walk is. Rewritten at the end of every stop.

- journey: none yet
- last stop: none
- next stop: none
- stops walked: 0
- items landed / deferred / declined: 0 / 0 / 0
```

`$VAULT/Patterns/cx-preferences.md` - header only:

```markdown
# CX Preferences (distilled from /cx runs)

> Rules upgraded from `Lessons/` after 3+ observations. Loaded by Phase 1.

_No patterns yet._
```

## The stop note (Phase 7)

`$VAULT/Cx/stops/<id>.md`:

```markdown
# S<n> · <screen> · <surface> - <date>

J<k> <persona>: <scenario>
Before: ![[<id>-before.png]]   After: ![[<id>-after.png]]

## Overview
<the six lines>

## Read
| # | impact | effort | heuristic | doc | proposal | decision |
...

## Left alone
- <what is right, and why>

## The user's read and expectation
<verbatim>

## Landed
- <item> -> <commit sha> `<subject>` - <what the after-shot shows>

## Deferred / declined / withdrawn
- <item> - <reason>

## Cross-references
- previous stop [[S<n-1>]] · next [[S<n+1>]] · design doc rule invoked: <rule>
```

A second round goes into the same note under a dated `## Round 2 - <date>` heading, with the
user's request verbatim.

## The session lesson (Phase 8a)

Appended to `$VAULT/Lessons/<date>-cx.md`:

```markdown
## Run: <timestamp> - <journey> S<a>..S<b>
- stops walked: <n> · proposals: <p> · landed: <l> · deferred: <d> · declined/withdrawn: <w>
### What the declines taught
- <one line each>
### What the user's expectations kept saying
- <a recurring theme, if any>
```
