---
subject: multi-project
domain: software-engineering
last_touched: 2026-11-16
touched_by: deepen
dry_streak: 1
---

# multi-project

The golden path has six techniques: project identity and joins, the portfolio
drill hierarchy, per-project tabs and state, passive signal ingestion,
cross-project comparison, and the onboarding lifecycle. There are three
applications, all read against the Personas tree: the passport wall (react),
the project-tracking pulse engine (rust), and the two-registries identity
simulation (rust). The librarian had not swept this subject before this run.

## 2026-11-16 - first /deepen (loop 3, run filler-deepen-20261116g, /shift filler)

**Round 1 (web survey): not dry. Three technique amendments, two golden-path
sentences, no new technique.**

- **Amendment, passive-signal-ingestion, with a golden-path sentence.**
  - The rule: a watcher's position comes from what it read, never from the
    clock.
  - Three consequences:
    - the stamp is taken from the read, not after downstream digestion;
    - a capped read that drops the oldest items cannot advance;
    - for version-control history the position is reachability (the heads
      seen), not a date.
  - Three lanes converged:
    - the blind lane predicted all three;
    - the git-log reference (read 2026-11-16) contrasts plain `--since`,
      which stops at the first older commit, with `--since-as-filter`, and
      notes that `--max-count` keeps the first N shown;
    - the Personas scheduler stamps `Utc::now()` after a model call of up to
      90 s, caps newest-first and still stamps, and uses a date cursor
      although 37% of commits since 08-18 arrived by merge.
- **Amendment, project-identity-and-joins, with the golden-path admission
  sentence.**
  - The rule: an identity marker in the working copy is machine-local link
    state; a binding is a set; bindings are per machine.
  - Two lanes:
    - the tree: the Personas marker resolver refuses a live second folder.
      The marker is committed in three fleet repos, and one of them has a
      live worktree here. gravitone ignores it as "the machine marker".
    - the web: the Vercel CLI's own `.vercel` README says the link file is
      not shared and is gitignored on creation.
  - The blind lane did not predict it.
- **Amendment, portfolio-drill-hierarchy.** The rule: a second lens on the
  wall must answer something the first cannot. Usually that is N outgrowing
  the matrix's width. It is labelled craft.
  - The tree removed its cover grid as "a strict subset" on 2026-08-27.
  - Its successor, the Atlas, also keeps one figure.
  - Web support is practitioner-level only.
- **Read lane.** All three applications were re-read at Personas
  `8d076db46a` and re-dated. Two gained `verified_against`. Corrections:
  - the pulse engine's paths moved, its consolidator changed model class,
    push is now authenticated, and push stopped stamping the watcher
    position;
  - deviation 1 is half-paid: the cursor holds on a blind tick, but there
    is still no durable blind state;
  - the wall's two lenses are gone, and the Atlas is now the default L1;
  - textual twins are now folded at registry admission.
- **Volatile facts:** none vendor-set. The `check-currency --volatile` hits
  are a tree constant (7 days, 5 minutes) and illustrative numbers in the
  techniques. No applications were expired or at risk.

**Round 2: not dry.** A training-data probe of round 1's reachability rule
asked what happens when a remembered head is no longer reachable (a rewrite
or a prune). One sentence was added: it is could-not-observe for the range,
followed by an explicit re-baseline. Re-offering rewritten work can be
undone, and skipping work cannot.

**Round 3: dry.** Probes found nothing new:
- the identity amendment against fleet-layer worktrees: a session's checkout
  should not mint a project, which is consistent with "add a binding";
- the small-cohort percentile caveat and the tab tombstones: both are
  already in their techniques;
- file-watcher unreliability: the baseline cadence already covers it.

## Ledger

- 2026-11-16 passive-signal-ingestion amendment: simulation, better 3 of 3
  on Personas.
- 2026-11-16 project-identity-and-joins amendment: simulation, better 2 of
  3 (registry worktree, Personas second machine; level on gravitone).
- 2026-11-16 portfolio-drill-hierarchy amendment: simulation, better 2 of 2
  retrospective (wall grid removal, Atlas single figure). That is below the
  three-case floor, and the row says so.

## Open leads (banked)

- The tracking registry's deletes cascade the pulse history (`ON DELETE
  CASCADE`). That is archival-as-deletion against onboarding-lifecycle.
  Return: when the tracking side gains an archive state, or on the next
  read.
- The Atlas needs its own application once it replaces the legacy wall.
  Return: the switch is removed.
- A reconciliation query joining the two Personas registries by path is
  still the cheapest measurement. Return: a session that may open a live
  database read-only.

## Impact

Not computed. Workers do not regenerate the map; the Director owes it.
