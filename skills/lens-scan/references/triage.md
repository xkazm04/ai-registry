# Triage: tier and risk class

Read from `SKILL.md` phase 3 (Propose) whenever the product carries tiers - a takeover,
where an inherited codebase and its imported backlog have to be ordered by how bad each
problem is before anything is built. Any agent that ranks an item (the propose phase, an
importer, a triage pass through `store.mjs rank`) uses this rubric, so two agents put the
same item in the same tier.

Two fields, both on `proposals` (store v4):

- `tier` - how soon the problem must be gone: `0` stop-ship, `1` before production,
  `2` soon after, `3` backlog. NULL means untriaged; an untriaged item sorts after tier 3.
- `risk_class` - what kind of harm it is: `secret`, `authz`, `money`, `data`, `llm`,
  `perf`, `reliability`, `ux`, `debt`. NULL means unclassified.

**`risk` (1-10) is not the severity.** It is the risk of making the change - how likely
the fix itself breaks something. A one-line tenant filter on an IDOR is tier 0 with
risk 2; a cosmetic rename across 40 files is tier 3 with risk 6. Never derive one from
the other, and never write a severity into `risk`.

## Tier 0 - stop-ship

The product must not run in front of users while this is open. Use it only with the
evidence below; a suspicion is tier 1 until it is shown.

- **An exposed secret or credential** (`secret`): an API key, a database URL with its
  password, a signing key in a tracked file, a client bundle or a log line. Example: a
  Stripe live key in `src/config.ts:12`, shipped to the browser by `app/layout.tsx`.
- **An auth or authz hole** (`authz`): an unauthenticated write, an IDOR (a record read
  or written by an id the caller supplies, with no ownership check), a query missing its
  tenant scope. Example: `PUT /api/invoices/:id` updates by id alone,
  `api/invoices/[id]/route.ts:30`, reachable by any signed-in user of any tenant.
- **Money or data corruption** (`money`, `data`): float arithmetic in a ledger write, a
  payment or booking that is not idempotent (a retry charges twice), lost writes (a
  read-modify-write without a transaction or version check). Example:
  `amount * 1.21` on a JS number before `INSERT INTO ledger`, `lib/billing.ts:88`.
- **PII leaking** (`data`, or `llm` when the sink is a model): personal data written to
  logs, returned to a client that should not see it, or sent in an LLM prompt. Example:
  the full customer record interpolated into the support-bot prompt, `ai/support.ts:41`.

**The evidence a tier-0 needs:** the `file:line` of the defect AND the entry point that
reaches it - the route, handler, job or page a real caller hits (`POST /api/pay` ->
`charge()` at `lib/pay.ts:52`). A defect no entry point reaches is tier 2 at most (dead
code is debt); name the entry point or lower the tier.

## Tier 1 - before production

Survivable for a demo, not for real traffic or real money.

- Missing timeouts, retries or rate limits on external and LLM calls (`reliability`, or
  `llm` for a model call). Example: `fetch(PARTNER_URL)` with no timeout in a request
  handler; an LLM call with no max tokens and no per-user limit.
- No error monitoring or tracing on money paths (`reliability`): the payment handler
  swallows its error, nothing reports it.
- Unbounded queries on hot endpoints (`perf`): a list endpoint with no `LIMIT` on a
  table that grows per user action.
- Dependency CVEs rated high or critical (`secret` when it exposes credentials, else
  `reliability`), with the advisory id.
- No audit trail on financial mutations (`money`): a refund or balance change leaves no
  record of who did it and when.

## Tier 2 - soon after

Costs money, time or trust over weeks, not on day one.

- Perf budgets missed (`perf`): a page over its LCP budget, a bundle over its size budget.
- N+1 queries on cold paths (`perf`): an admin report that issues one query per row.
- No LLM cost visibility (`llm`): tokens are spent with no per-feature count or alert.
- Flaky tests (`reliability`): a suite that fails one run in ten blocks every release.

## Tier 3 - backlog

Worth doing, never urgent.

- UX polish (`ux`): an empty state, a misaligned form, a missing loading state.
- Debt (`debt`): a duplicated helper, a dead module, a pattern the house standard moved past.
- Naming (`debt`): a component whose name no longer says what it does.

## Picking the class

One class per item, the harm it prevents: `secret` (a credential), `authz` (who may do
what), `money` (amounts, charges, ledgers), `data` (integrity or privacy of records),
`llm` (model calls: cost, prompts, limits, leakage), `perf` (speed and load),
`reliability` (failure handling, monitoring, flakiness), `ux` (what a user sees and
does), `debt` (the code's own shape). When two fit, take the one named by where the harm
lands - PII sent in a prompt is `llm`, the same PII in a log or a response is `data` -
and name the other in the body.

## Tie-break

Inside one tier, order by:

1. **tier** first - a tier-1 item never jumps a tier-0 one;
2. **blast radius** - how many users, rows or how much money the problem reaches (every
   tenant before one tenant, the payment path before the admin report);
3. **effort** - the smaller `size` first, so a cheap fix of equal reach lands sooner.

`store.mjs proposals` orders by tier (untriaged last) then age; the blast radius and the
effort are the ranker's judgement, written in the body's Expected impact.

## Writing it

```
node ${CLAUDE_SKILL_DIR}/scripts/store.mjs propose ... --tier 0 --risk-class authz
node ${CLAUDE_SKILL_DIR}/scripts/store.mjs rank --id <p> --tier 1 --risk-class reliability --by agent:<name> [--note "<why>"]
```

`rank` works at any status and records `ranked_by` and `ranked_at`; its `--note` lands in
`triage_note`. A re-rank replaces the tier and class - say what changed in the note.
