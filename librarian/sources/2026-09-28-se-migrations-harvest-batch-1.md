---
source: batch
kind: harvest-batch (6 sources, one domain, parallel miners, AUTO mode)
domain: software-engineering
mined_on: 2026-09-28
queue_rows: [SEC-040, SEC-041, SEC-042, SEC-043, SEC-053, SEC-054]
parked_same_pass: []
harvest_skill: 0.5.2
miners: 6 lanes for 6 rows (three prose lanes first; the three repository lanes topped up one per completion, each briefed against the drafts already returned); proposals only; single-writer landing
fetches: 12 (SEC-054 3, SEC-040 3, SEC-043 1, SEC-053 1 clone, SEC-042 1 clone, SEC-041 3)
extracted: 87
accepted: 0
specs_banked: 8 (consolidated from 23 miner content rows)
already_covered: 27
declined: 0
leads: 8
currency: 0
untriaged: 40
dispatched: 0
applied: 0
shipped: 0
run_id: hv-mig-0928
siblings: 0 (board empty at claim and through landing)
---

# software-engineering migrations harvest batch 1: the step was fast, the wait took the site down

Six queued rows from `software-engineering / core`, admitted against one named needle: the
coverage-gaps line for `data-layer` says `migrations` "already states expand-contract
doctrine but cites no canon" and lacks "the lock-queue side". The admission read confirmed
it at body level: across the golden path and nine techniques, "lock" occurs only as "file
locked" and "lock budgets on the low-end machines". The subject scores 0 attention points,
so it was admitted on the gap line, not on points. The other two refill clusters in the
section (audit-log tamper evidence, SEC-029..032/055..057; web performance,
SEC-036..039/048..052) stay queued for a later batch. Parked none.

**Mode: auto, nobody present.** Catches, currency and leads land. Content for this existing
subject is banked as specs in [`harvest/specs.md` section 6](../harvest/specs.md) for the
next attended pass, and nothing is auto-declined. So `accepted: 0` is the mode working as
designed, not a dry batch.

Expected yield, said before mining: mostly catches on expand-contract; **0 currency**,
because no technique in this subject carries a citation or a `verified_on` a canon text can
move (the three applications are pinned to code trees); one or two content rows on lock
handling. Catches and currency held (SEC-043 checked the currency premise directly and
confirmed it). **Content was larger than expected:** five publishers converged on one
missing technique, and two sources contradict sentences the subject states as rules.

A source ORIGINATES a finding. It never AUTHORIZES one.

## The finding

**The subject knows why two code versions need a compatible schema, and nothing about what
a schema step does to live traffic while it waits for its lock.** Five independent
publishers state the same mechanism: a request for a lock that conflicts with ordinary
traffic joins a queue, and every later conflicting request queues behind it, so a step that
executes in milliseconds can stall a hot table for as long as it waits.

- GoCardless (SEC-054) is the incident: about 15 s of API outage from a fast `ALTER TABLE`,
  and a rehearsal on the same day's backup ran "in a few hundred milliseconds".
- GitLab (SEC-040), Braintree (SEC-053), strong_migrations (SEC-042) and pgroll (SEC-041)
  all bound the wait per session and retry on timeout, with file:line anchors in the three
  repositories.
- strong_migrations supplies the cross-engine evidence: the bound and the two-table
  foreign-key footprint hold on Postgres, MySQL and MariaDB alike.

**Two corpus sentences are contradicted, both conditionally.**

- `migrations.md` says the server case differs from the single-copy case in "exactly one
  respect". Concurrent load during the step is a second one, and "a staging copy rehearsed
  it" certifies the statement, not the wait (SEC-054; Braintree names the same two concern
  classes).
- `expand-deploy-contract` says "a rename is all three" releases. GitLab renames inside one
  release under a roll-forward-only policy, because the three phases are separated by
  deploy boundaries, not releases. The corpus sentence holds where rollback targets are
  kept or installs upgrade across versions (its own condition 2).

**One disagreement is stated in the spec, not resolved.** GitLab and strong_migrations bound
the retries and then fail the deploy; Braintree and pgroll retry without limit, so lock
contention stalls the deploy with nobody told. Three of five voices bound it. The
unbounded tools are the evidence for what the bound prevents.

## Banked as specs (auto mode; see specs.md section 6)

| spec | shape | target | from |
| --- | --- | --- | --- |
| 6a | new technique | `migrations` (slug for the lander: lock-bounded DDL) | SEC-054 C1/C3/C5, SEC-040 C1-C2, SEC-053 (bound, footprint, pre-check, one deadline, no escalation), SEC-042 S1 + refinements, SEC-041 Spec A |
| 6b | golden-path amendment | `migrations.md` (two respects, not one; rehearsal certifies the statement) | SEC-054 C2, SEC-053 README:34-38, SEC-040 budget-on-a-copy |
| 6c | discriminator | `migrations/error-propagation` (a lock-wait timeout is transient on a server) | SEC-054 C4, SEC-040 C1, SEC-053, SEC-042, SEC-041 |
| 6d | amendment | `migrations/transactional-ddl` (online builds leave the transaction; the unit shrinks on a live server) | SEC-040 C3, SEC-042 S2, SEC-053 |
| 6e | new technique, one voice | `migrations` (deploy-relative migration slots with time budgets) | SEC-040 C4 |
| 6f | amendment | `migrations/expand-deploy-contract` (phases are deploy boundaries; direction rule; engine-conditional two-step constraints; online-built index) | SEC-040 C5-C6, SEC-042 S4, SEC-053, SEC-054 C9 |
| 6g | amendment | `migrations/expand-deploy-contract` (readers outside the deployment inventory: a store-side shim) | SEC-043 #11, SEC-041 Spec D |
| 6h | new technique | `migrations` (a migration safety gate: unclassified DDL refused) | SEC-053, SEC-042, SEC-040 (lint-enforced review) |

## Per source

### SEC-054 - Sinjakli, "Zero-downtime Postgres migrations - the hard parts" (GoCardless)

- **Class:** first-party practitioner account, a post-mortem. It is a hybrid: the incident
  half is first-party and authoritative (n=1), and the "avoiding downtime" half is
  unmeasured advice. The page is undated ("Last edited Jun 2024"); internal evidence (9.4
  as the new release) points to early 2016, not the queue's 2015.
- **11 extracted:** 3 banked (6a, 6b, 6c), 4 caught, 1 lead, 1 currency note, 2 folded.
- **Caught:** split DDL transactions short (`transactional-ddl`); no rename of an in-use
  column (`expand-deploy-contract`); add the constraint unvalidated then validate
  (`expand-deploy-contract`, the uniqueness decomposition); take the window when small
  (`expand-deploy-contract`, "Below a rolling replacement, take the window").
- **Currency note, no clock moved:** the worked trigger has been weakened since. PG 18 docs
  say `ADD FOREIGN KEY` "requires only a SHARE ROW EXCLUSIVE lock", which does not conflict
  with a plain `SELECT`, so the post's example (a long read holds up the FK add) no longer
  reproduces. The queue mechanism and `lock_timeout` are current. Spec 6a is written
  against the docs, not the post.

### SEC-040 - GitLab Migration Style Guide + "Avoiding downtime in migrations"

- **Class:** first-party practitioner account, not a hybrid: an enforced style guide with
  lint rules and database reviewers. Last updated 2026-09-24 (`c4536651`). It serves two
  populations at once, GitLab.com (rolling, roll-forward only) and self-managed installs
  (upgrade across releases), and most of its discriminators come from that split.
- **12 extracted:** 4 banked (6a, 6d, 6e, 6f), 5 caught, 1 lead, plus a Rails/Postgres tail.
- **Caught:** two-step constraint add; roll forward in production, restore on
  self-managed; guards that assume little (the corpus's asserting guards say it better);
  ordering by milestone (duplicate-version refusal); batched backfill with a transaction per
  batch (`data-migrations`).
- The Postgres and Rails values (15 s statement timeout, 3/10/20 minute slots, 50 retries
  over 40 minutes, the pooler bypass) are application material. No Postgres application
  is published, so no clock moved.

### SEC-043 - Sadalage and Fowler, "Evolutionary Database Design" (2003, rewritten 2016)

- **Class:** first-party practitioner account (Thoughtworks projects of 500-600 tables).
- **Currency 0, checked, not assumed:** none of the nine techniques or the golden path
  cites Fowler, Sadalage, Ambler or any external text, and `verified_on` exists only on the
  three code-pinned applications.
- **17 extracted:** 1 banked (6g), 10 caught, 1 lead, 3 untriaged.
- **The canon is behind the corpus on its own ground.** Its worked example fuses DDL, a
  backfill and a `DROP COLUMN` in one script, which `data-migrations` ("a step is a shape
  change or a data rewrite, never both fused") and `expand-deploy-contract` forbid. It
  lists many-site customized schemas as unsolved, which `dynamic-table-set-migrations`
  owns.
- **Caught:** append-only chain; small steps; duplicate numbers and replay on a blank store;
  CI applies migrations (`data-access/repo-testing`); a database per developer (test side
  only); transition phase for code-side compatibility; reverse migrations not worth it;
  upgrade on startup from an unknown version; access code separated
  (`schema-drift-detection`); schemaless implicit schema (`migrate-from-data-shape`).

### SEC-053 - Braintree `pg_ha_migrations` @ `fa1e5d4` (2026-09-09)

- **Class:** first-party practitioner account in repository form. The README's "Migration
  Safety" section is the rules; `safe_statements.rb` and
  `blocking_database_transactions.rb` are the method. Sent against SEC-054's drafts.
- **15 extracted:** corroborates 6a, 6b, 6c; originates parts of 6a, 6d, 6f and 6h; 1 lead;
  2 caught (roll forward, never revert; backfill separate from shape).
- **New from this voice:** `LOCK_TIMEOUT_SECONDS = 5` per session, restored after; one
  deadline over a whole multi-table acquisition because per-object timeouts add up
  (README:102 "total lock time is additive"); nested or escalating locks refused; a
  conflict-mode pre-check for old transactions before joining the queue; the 25 s pause
  after a timeout exists "to allow potentially queued up queries to finish".
- **Disagreement:** the retry loop is `until successfully_acquired_lock` with no counter
  (`safe_statements.rb:711`). The bound in 6a/6c rests on other voices.
- **Tension with `transactional-ddl`:** the gem runs each statement in its own transaction
  because held locks add up, which moves the ledger bump outside the statement's
  transaction. Carried into 6d for the lander.

### SEC-042 - `ankane/strong_migrations` @ `23d8e1f` (2026-09-26), v2.8.0

- **Class:** a single-maintainer open-source catalog (README rules + `lib/` enforcement), not
  a vendor product. Rails, the same stack as GitLab, so it corroborates only engine-level
  claims, never ORM-level ones. Sent last, against two sibling drafts.
- **17 extracted:** corroborates 6a (three engines), 6d (refined), 6f (engine-conditional),
  6h; 3 leads; 3 caught (backfill not fused with the alter; unsafe-at-scale is fine on
  small tables; rename as expand, dual-write, contract).
- **Refinements:** the retry unit must equal the atomic unit, and a whole-step retry is
  refused once anything has committed (`checker.rb:92-96, 137`); behind a transaction-mode
  pooler the timeouts go on the migrator's own database role; two timeouts, a short lock
  wait and a long statement.
- **Contradicted sibling premise:** the catalog does not assert that an index is VALID after
  an online build. It only drops a leftover invalid index on re-run, opt-in
  (`remove_invalid_indexes = false`). 6d keeps the post-condition as the corpus's own
  discipline, and says no source here authorizes it. README:1022 says "non-concurrently"
  where the code comment means the concurrent case; do not cite that sentence.

### SEC-041 - `xataio/pgroll` @ `777a535` (2026-09-08), v0.16.3

- **Class:** vendor repository (Go + MDX). Doc prose is claims, and each one was checked
  against the code. Sent against 6a and 6g.
- **15 extracted:** corroborates 6a (500 ms per session, jittered backoff 1 s to 1 min,
  whole transaction rolled back before the sleep); corroborates 6g's mechanism (version
  schemas of views, triggers in both directions) and **contradicts its "observed from the
  store"**: `Complete` drops the old version schema with no client check
  (`execute.go:173-193`), and the gate is a Warning in the docs. 3 leads, 3 caught (keyset
  watermark plus classifier column; rollback only before contract; shape and backfill as
  separate steps).
- **Refines 6g twice:** one active migration per schema caps the store-side window at two
  versions and blocks the next change until old readers drain, which collides with the
  corpus's durable-queue case ("for a durable queue that can be days"); and store-side
  compatibility removes the dual-write code from the app release.
- Retry has no count and no deadline (`db.go:38-106`), the second unbounded voice.

## Leads (each with its return condition)

| lead | from | return when |
| --- | --- | --- |
| long-running and idle-in-transaction sessions (an open developer console) are latent outages for any lock-taking step; analytics belongs on a replica | SEC-054 | 6a lands (its pre-check is the home), or `read-serving-replicas` is next deepened; recheck by 2026-12-28 |
| production data fixes as chain steps, never console DML; a separate data-fix chain with its own history table | SEC-043 | a second primary (a migration tool documenting multiple history tables) or a fleet repo running two chains on one store |
| an ORM that caches the table shape at boot treats a column no query names as used; ignore it one release before the drop | SEC-040, SEC-042 (both Rails: one stack) | evidence from a second stack; home `expand-deploy-contract` beside "cached query plans" |
| an unsafe verb is allowed on a table measured small or empty | SEC-053 | 6a lands; strong_migrations' "created in this migration" rule is the stronger criterion, reconcile the two then |
| a live-store backfill needs a pace knob; the vendor default is full speed (pgroll batch 1000, delay 0) | SEC-042, SEC-041 | `data-migrations` is next deepened (it has batching and no throttle); by 2026-12-28 |
| a lock bound set with `SET` on a pooled handle leaves every re-opened connection unbounded | SEC-041 (code read, not run) | a Go or Rust application of 6a is written; test it there |
| a view-based compatibility shim can bypass row-level policy unless the view runs as the invoker | SEC-041 (vendor doc only) | 6g lands, or `security/authorization` touches row-level security |
| "dangerous" defined as blocking reads or writes for more than a few seconds after acquisition, or likely app errors | SEC-042 | 6a or 6h lands and needs a threshold for its gate |

## Untriaged (nobody verified these; not declined)

- SEC-054: `log_lock_waits` to find the risk ahead of time; `ADD COLUMN ... DEFAULT ... NOT
  NULL` rewrite (probably moved by PG 11's metadata-only default; check before any currency
  row); `RENAME CONSTRAINT` lock level.
- SEC-040: regenerated schema file, migration checksums, identifier limits, the timestamp
  floor; the multi-database split; no external call inside a database transaction
  (candidate for `work-execution`); no analytics-only columns on hot tables; per-connection
  scope of the lifted statement timeout and PG 17 `transaction_timeout`; the anti-wraparound
  autovacuum preflight (folded into 6a's pre-check as a second voice); explicit no-op
  `down`; text limits, JSON storage, primary-key swaps, the bigint conversion runbook.
- SEC-043: DBA and developer pairing; production-like sample data from the first iteration;
  per-tenant schema fan-out (named as unsolved, no mechanism).
- SEC-053: concurrent index builds on one physical database block each other; the
  dependent-object check before a drop; `create_table force: true` refused; a second
  default change in one migration refused; enum rename has no safe variant; partition
  wrappers; the PayPal companion essay (403).
- SEC-042: analyze statistics after an index build; a separate migration user without
  ALTER for the app; PG 17 `transaction_timeout`; MySQL auto-increment under statement
  replication; unique constraint via an online index then attach; `json` breaks `SELECT
  DISTINCT`; enum value removal unsupported; `create_table force: true`; column removal
  always needs acknowledgement.
- SEC-041: trigger write amplification (benchmark numbers not read); `sql2pgroll` and ORM
  converters; `baseline`; `raw_sql` `onComplete` and idempotent `down` (likely
  `idempotent-steps`); replica identity.

## Not evaluated

- No A/B evaluation: auto mode landed no content, so there is nothing to evaluate. The
  specs owe evaluations when they land; the fleet's migrations applications are go and
  rust, and no fleet project was confirmed here to run live-server DDL, which the attended
  pass should check before choosing the evaluation route.
- The PG conflict-table reading for a long *write* transaction queueing the FK add is
  training knowledge, not fetched.
- `review-coverage` subject decisions: no subject was touched.
