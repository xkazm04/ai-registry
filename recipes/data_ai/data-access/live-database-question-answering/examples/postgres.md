# PostgreSQL as the `database` connector

What was learned mapping this recipe onto PostgreSQL specifically. Nothing here is part of
the recipe: swap the connector and this file stops applying while the recipe does not change.

## What the mapping has to decide

**Postgres is one of the few engines that can make "read only" true at the connection, and
that is the only place it should be made true.** A role granted `SELECT` and nothing else,
or `SET default_transaction_read_only = on` on the session, or a physical read replica, makes
a write a permission error rather than a judgment call. Every layer above that is advisory.
Take the win: the recipe asks for read only to be what the connection permits, and here it
genuinely can be.

**Do not settle for inspecting the SQL, and know exactly why.** Postgres accepts
data-modifying common table expressions, so `WITH x AS (DELETE FROM t RETURNING *) SELECT *
FROM x` is a statement that begins with `WITH`, contains `SELECT`, and deletes rows. Comments
split a statement anywhere, the client protocol will happily carry several statements
separated by semicolons, and zero-width characters survive in the string while being invisible
in the review. The worst version of this failure is the fallback: when a parser cannot read a
query, most implementations drop to a regular expression, so an unparseable query silently
downgrades the check to the weakest one available.

**Bound the query before it runs, using the two things Postgres gives you for free.**
`statement_timeout` ends a runaway scan without the caller having to notice, and `EXPLAIN`
without `ANALYZE` returns an estimated row count and cost before a single row is read. Reading
the estimate is how a result gets bounded before the query runs rather than after, which is
what this recipe's third outcome asks for and what a `LIMIT` alone does not deliver, since a
`LIMIT` on an aggregate bounds nothing.

**`NULL` and the search path are the two silent-wrong-answer generators here.** `COUNT(col)`
skips nulls while `COUNT(*)` does not, `AVG` divides by the non-null count, and `NOT IN`
against a set containing a null returns no rows at all rather than the complement anybody
expected. Separately, an unqualified table name resolves through `search_path`, so the same
query can read a different table depending on the role that ran it. Qualify schemas
explicitly and treat an unqualified name in a generated query as a defect.

**`timestamp` and `timestamptz` are different questions.** A bare `timestamp` column carries
no zone, so a daily total computed on it is computed in whatever zone the writer happened to
be using. The recipe requires an answer to disclose the time zone it assumed; on Postgres that
disclosure is only honest if the column type was checked, because the column name will not
tell you.

## What transfers to any database connector

- Make read only a property of the credential. Ask what the engine can enforce before
  designing anything above it, because engines differ sharply and some can enforce nothing.
- Estimate cost before executing, not after. A ceiling applied to the returned rows does not
  bound an aggregate.
- Find the engine's own null and name-resolution rules before trusting an aggregate; they are
  where a correct-looking query stops meaning what it reads like.
