# PostgreSQL as the `database` connector

What was learned mapping this recipe onto PostgreSQL specifically. Nothing here is part of
the recipe: swap the connector and this file stops applying while the recipe does not change.

## What the mapping has to decide

**`information_schema` is filtered by privilege and `pg_catalog` is not.** The standard view
shows only what the current role can access, so a table this credential cannot see is
returned as absent rather than as hidden, and a refresh reading it will report a drop that
did not happen. That is precisely the failure this recipe's third outcome names, and on
Postgres it has a fix: read `pg_catalog` for what exists and `information_schema` for what
this role reaches, and report the difference between the two as unseen rather than folding
it into either answer.

**A rename is invisible by name and obvious by identity.** Postgres keeps a stable `oid` on
every table and a stable `attnum` on every column, and both survive `ALTER ... RENAME`. Carry
them in the picture and a rename is a fact rather than an inference; carry only names and the
same event is indistinguishable from a drop plus an addition, which is the exact confusion
this recipe exists to prevent. Nothing in a name-only diff can recover it afterwards.

**Views and materialized views break the recipe's promise in different ways.** A view's
columns can change type or disappear without any DDL against the view, because it inherits
from what it selects; a materialized view keeps serving its last refresh regardless of what
the underlying tables now hold. A picture that lists both as ordinary tables is telling a
consumer that a stale copy is live data. Record which relations are derived, and for a
materialized view record when it was last refreshed as well, since its freshness is a
separate fact from the picture's own.

**Partitioned tables inflate a structural diff into noise.** New partitions appear as new
relations on whatever schedule the partitioning runs on, so a refresh reports structural
change every day and the announcement this recipe asks for becomes something nobody reads.
Roll partitions up to their parent before diffing, and treat a new partition as ordinary
rather than as a change worth telling anybody about.

**A change in a domain, an enum or a check constraint is a change in meaning wearing
structural clothing.** Adding a value to an enum or widening a check is visible in the
catalog, which makes it the rare case of semantic drift this work can actually catch. It is
worth reading for exactly that reason: it is the one place a structural read reaches into the
category the recipe otherwise admits it cannot see.

## What transfers to any database connector

- Ask whether the catalog you are reading is privilege-filtered. If it is, absent and
  forbidden look identical and the picture will report deletions that never happened.
- Find the engine's stable identifier for a relation and carry it. Without one, a rename is
  unrecoverable from a diff.
- Separate derived objects from base tables in the picture, and record a cached object's own
  freshness alongside the picture's.
