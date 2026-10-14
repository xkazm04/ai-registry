# Vault bootstrap (architect reference)

Loaded by Phase 0 when any of the files below is missing from the resolved vault. A vault that already has all of them never needs this file.

### Bootstrap (one-time per vault)

If any of these are missing, create them:

- `$VAULT/Architect/` (directory)
- `$VAULT/Architect/scans/`, `$VAULT/Architect/decisions/` (directories)
- `$VAULT/Architect/backlog.md`:
  ```markdown
  # Architect Backlog

  Durable queue of architectural decisions. Sorted manually by priority.
  Status values: `proposed | approved | in-progress | shipped | abandoned | blocked`.

  ## Pending
  _No pending decisions._

  ## Shipped
  _None yet._

  ## Abandoned / Blocked
  _None yet._
  ```
- `$VAULT/Architect/strong-patterns.md`:
  ```markdown
  # Strong Patterns

  Load-bearing patterns identified by `/architect`. Promote-worthy: ideally these
  graduate into lint rules, design-doc sections, or codified conventions.

  ## Patterns

  _No patterns yet._
  ```
- `$VAULT/Architect/weak-patterns.md`:
  ```markdown
  # Weak Patterns

  Anti-patterns identified by `/architect`, with reach data. Each entry should
  eventually convert into a backlog decision (or get explicitly accepted as
  "tolerable for now" with a reason).

  ## Patterns

  _No patterns yet._
  ```
- `$VAULT/Architect/coverage.md`:
  ```markdown
  # Architect Coverage

  Heatmap of themes and areas scanned, with last-scan date.

  ## Themes
  _No themes scanned._

  ## Areas
  _No areas scanned._
  ```
- `$VAULT/Patterns/architect-preferences.md`:
  ```markdown
  # Architect Preferences (distilled from /architect runs)

  > Rules upgraded from `Lessons/` after 3+ observations. Loaded by Phase 1.

  _No patterns yet. Will be populated as runs accumulate._
  ```

`Lessons/` is shared with the other skills — don't recreate.
