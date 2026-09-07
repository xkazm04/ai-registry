# Notion as the `knowledge_base` connector

What was learned mapping this recipe onto Notion specifically. Nothing here is part of the
recipe: swap the connector and this file stops applying while the recipe does not change.

## What the mapping has to decide

**One page per period, never one page updated in place.** The obvious Notion shape for a
standing record is a single page that always shows the current picture, and it destroys the
thing the record exists for. An account is evidence about a period, and evidence that was
overwritten cannot be produced later. Model the account as a database row or a child page
per period, and let the summary view be derived from those rather than being the only copy.

**Page history is not an audit trail.** Notion keeps version history, but its retention
depends on the workspace plan and it records who edited the page rather than who approved
the grant. Do not let it stand in for the ledger, and do not cite it in an account.

**Property types decide what the account can be queried by later.** An approver written as
plain text cannot be filtered on, so the question "show me everything this person approved"
becomes a manual read six months after adoption. Establish at adoption which fields are
relation or select properties, because converting them later rewrites every existing row.

**Blocks are the rate limit, not pages.** A long account is written as many block appends,
so a period with heavy request volume can hit limits partway through and leave a half
written page that reads as a complete one. Write the account with its own completeness
marker so a truncated page is visibly truncated.

## What transfers to any knowledge base connector

- An account is evidence about a period; if the destination overwrites, it is not a record.
- The destination's own version history is about editors, not about approvers. It is never
  the audit trail.
- Decide at adoption which fields must be queryable, because retrofitting structure onto
  prose is a migration.
