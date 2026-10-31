---
subject: browser-credential-boundary
domain: software-engineering
last_touched: 2026-09-02
dry_streak: 0
---

# browser-credential-boundary

First touch: [[2026-08-22-4]] — the 2026-08-22 harvest wave. Class: NEW.

## State

6 techniques, 2 **sql** applications — a rare stack in this bundle. Web-hardened before drafting. `verified_against` deliberately omitted: no runtime version was read.

## Open leads (banked, with return conditions)

- **a control is only as strong as the fact's cheapest publication** (proposed law, not added). Three sightings in this subject: error opacity against the address published in the bundle, a revoke against a grant never explicitly issued, an omitted column against a widenable policy predicate. Return on a sighting outside security.

## 2026-09-01 - inbox leads landed under the librarian sweep ([[2026-09-01-1]])

One lead (kp), NOVEL. New technique `outbound-fetch-destination-validation`, homed here in
its narrowed form (regime two: the server's reach is an unnamed credential spent whenever
something other than configuration picks the address): judge the resolved address not the
string, bind the check to the connection, every hop is a new destination, one door with the
raw client unreachable, the response is a channel too. Corroborated by the server-side
request-forgery category, the cloud-metadata breach class, and current rebinding advisories
that bypass resolve-then-fetch fixes. Application `node--outbound-fetch-destination-validation`
at kp `c6a63199` with four recorded deviations, the sharpest being a feed pull that runs the
string gate only and then fetches with a bearer secret and no redirect control. The general
form is proposed for credential-vault `brokered-egress`; the model-chosen-URL shape for a
tool-runtime subject.
## 2026-09-02 - deepen batch [[2026-09-02-1]]

**Single-stack closed**: a `next` application against a public starter tree read
at a pinned commit (both tiers built from the same two public values - regime
one on the server tier too; no `verified_against`, the tree pins no major).

Five corrections, every one from engine or platform reference documentation:
"refusal is silent" conditioned on engine kind (a rule-evaluated document
store fails the whole request against the query's *potential* result set);
"policies combine permissively" narrowed to the permissive kind, restrictive
(AND) named as the tool when the column cannot move; an aggregate over
unreadable rows returns a *wrong number that looks like a result* (count 0,
sum null), not nothing; invoker-evaluated views version-gated to the dominant
engine's 2022 major; the **table owner bypasses its own policies** unless
forced - a runtime role that ran the migrations is the realistic miss.

`public-vs-server-env-split` gained "Mark the module, not the entry point"
(inbox lead 2026-08-29, corroborated by two toolchains' server-only markers).

### Open leads (banked, with return conditions)

- **Proposed law "a control is only as strong as the fact's cheapest
  publication"** - fourth sighting (address published under the public prefix
  while a later route hides it), still inside security. Return condition unmet.
- **A rules-language document store as a second engine kind.** Tree read
  (public quickstart rules: read open, write on any authenticated user, no
  owner check). Exposes a real condition on default-deny-plus-defaulted-owner:
  a store with no server-side column default forces the client to SEND the
  owner field - the shape the technique calls "strictly worse", and there the
  only option. Declined this run because it needs a stack name nobody has
  chosen. Return when the vocabulary decision is made; the application can be
  written from the note.
- **RLS is not a complete isolation boundary against composed SQL** (leakproof
  functions, referential-integrity covert channels) - true per engine docs, a
  universal without its condition under the operator-grammar regime. Return on
  a measured exploit path through that layer.
- The SSRF lead (2026-08-27) was declined here and placed on [[credential-vault]].

### Declines

- Renaming the key vocabulary in the two sql applications - they cite a tree at
  2026-08-22; re-reading it is not public work.

### Impact (2026-09-02)

Stale verdicts after this landing: ascent (4). Apply row: see `librarian/applied.md`.
## 2026-09-02 - `/intake` portkey-gateway (run `intake-portkey-0902`, intake 2.1.1, Opus workers)

New technique `allowlisted-operator-stream` (design candidate, corpus NONE): an operator debug stream that survives only through a fixed allowlist of keys with every header redacted, behind an admin token the process refuses to boot without. Slug argued against the subject`s X-plus-Y idiom. Source-tree application `node--allowlisted-operator-stream` with five shortfalls, the sharpest: the tree`s "throws at startup" is a per-request 500 in all three callers, and the allowlist covers three sub-objects rather than the record. Direction proposals written for tracklight (the strongest transfer in the run: self-hosted, holds provider keys, serves an operator dashboard).

## Architecture review - 2026-10-31

First architecture review, against `587c5e52b`. Every document read. The engine
claims mostly hold against the engine's own reference pages; two do not. In
`default-deny-plus-defaulted-owner`, an upsert needs the read policy whenever it
carries a conflict clause, not only when it returns rows. And an update or delete
aimed at a row the policy hides is filtered silently rather than refused, so the
suite's 'assert a refusal' shape is wrong for those two verbs. Separately, the
hosted platform withdrew its open default grant on new public-schema tables during
2026, which dates one sentence in the `next` application. `aggregate-view-not-base-table`
announces two consequences and lists three. The banked law candidate and the
open leads above are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/browser-credential-boundary",
  "date": "2026-10-31",
  "baseline": "587c5e52b",
  "digest": "sha256-b2:8c4e4cc37445b46c",
  "disposition": "clarify",
  "coverage": "All 18 documents (golden path, 10 techniques, 7 applications) read in full. Engine, platform and toolchain claims checked against six primary pages and one pinned public source tree. Not evaluated: the two sql applications' tree, the kp tree, the afterlife tree, the second-tree experiment in the next application. No verification date was refreshed.",
  "counterexamples": [
    "An update or delete aimed at another caller's row under a row policy returns zero affected rows and no error; a suite that asserts 'refused with the expected class' for it fails against a correct policy, or gets loosened until it asserts nothing.",
    "An upsert against a table with insert and update policies but no read policy fails even on its first write in the dominant engine, because the conflict clause requires read access regardless of RETURNING.",
    "A Supabase project after 30 October 2026 that adds a public-schema table without RLS has not published it: the table has no client-role grant until one is issued. Tables created before keep their grants and stay exposed.",
    "A local tool fronted by a proxy that rewrites Host and appends no forwarding header passes the loopback gate (stated residual, retained)."
  ],
  "sources": [
    {
      "url": "https://www.postgresql.org/docs/current/sql-createpolicy.html",
      "result": "Rows failing USING on UPDATE/DELETE: 'Typically, such rows are silently suppressed; no error is reported'; WITH CHECK: 'An error will be thrown'. ON CONFLICT DO UPDATE: 'SELECT permissions are required on the relation ... if the UPDATE path is taken, the row to be updated and the new updated row are checked against the relation's SELECT policies, and an error is thrown', and 'the UPDATE path will never be silently avoided'. Permissive OR, restrictive AND; 'a \"default deny\" policy is assumed'. Refutes default-deny-plus-defaulted-owner's 'read policy ... if anything in the statement returns rows' and its universal 'forbidden write is refused'; supports omit-the-column's permissive/restrictive sentence."
    },
    {
      "url": "https://www.postgresql.org/docs/current/ddl-rowsecurity.html",
      "result": "'Table owners normally bypass row security as well, though a table owner can choose to be subject to row security with ALTER TABLE ... FORCE ROW LEVEL SECURITY.' Supports the owner-exemption paragraph."
    },
    {
      "url": "https://www.postgresql.org/docs/current/sql-createview.html",
      "result": "security_invoker 'causes the underlying base relations to be checked against the privileges of the user of the view rather than the view owner'; 'By default, access ... is determined by the permissions of the view owner.' Supports definer default and off-by-default. The 2022 major (15) is not stated on this page; not re-derived."
    },
    {
      "url": "https://supabase.com/docs/guides/api/api-keys",
      "result": "Publishable key 'Safe to expose online'; 'Row Level Security decides what this client can reach'; 'Supabase is deprecating the anon and service_role keys by the end of 2026.' Supports the next application's key paragraph."
    },
    {
      "url": "https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically",
      "result": "Old default: 'select, insert, update, and delete are granted to every table in the public schema'; new tables now 'require an explicit opt-in (via a Postgres grant)'; default for new projects 'On May 30, 2026', applied to existing projects 'On October 30, 2026'; 'Existing tables are not affected'. Dates the next application's 'every privilege on a new table' claim as superseded."
    },
    {
      "url": "https://nextjs.org/docs/app/getting-started/server-and-client-components",
      "result": "'If variables are not prefixed, Next.js replaces them with an empty string'; importing a server-only module into a Client Component is 'a build-time error'. Supports public-vs-server-env-split's module-marker section."
    },
    {
      "url": "https://github.com/Portkey-AI/gateway/tree/669825cbe89ee51569918b8f78a9db486fd69dd4",
      "result": "Re-read src/middlewares/adminAuth/index.ts and src/middlewares/log/index.ts at the pinned commit: six-key allowlist, list-free header redaction, MAX_RESPONSE_LENGTH 100000, stream substitution, and all three getConfiguredAdminToken callers catching to a 500. start-server.ts, the 89-field Options type and the provider count were not re-read."
    }
  ],
  "documents": {
    "browser-credential-boundary.md": {
      "disposition": "clarify",
      "reason": "Regimes, ordering rule, neighbour seams and engine-kind conditioning hold. One owed fix: a stray four-space indent in the allowlisted-operator-stream bullet of the technique list."
    },
    "techniques/public-vs-server-env-split.md": {
      "disposition": "keep",
      "reason": "Next docs confirm empty-string replacement and the server-only build error. 'The common toolchains' slightly generalizes one toolchain's behaviour; not worth an edit."
    },
    "techniques/broker-proxy-attaches-secret.md": {
      "disposition": "keep",
      "reason": "Four contract clauses stated and listed; path, redirect and configured-base handling consistent with outbound-fetch-destination-validation."
    },
    "techniques/outbound-fetch-destination-validation.md": {
      "disposition": "keep",
      "reason": "Resolve-then-judge-all-records, connection binding, manual redirects and one door are internally consistent and match the kp application's recorded deviations."
    },
    "techniques/opaque-upstream-errors.md": {
      "disposition": "keep",
      "reason": "Closed vocabulary, clamp mapping and failure-not-empty-success are sound; the 'cheapest publication' section is the subject's banked law candidate and is correctly scoped."
    },
    "techniques/aggregate-view-not-base-table.md": {
      "disposition": "clarify",
      "reason": "Says 'Two consequences follow' and then lists three bullets. Definer default and invoker opt-in confirmed against the engine's CREATE VIEW page."
    },
    "techniques/omit-the-column-not-the-value.md": {
      "disposition": "keep",
      "reason": "Permissive-OR / restrictive-AND confirmed verbatim against CREATE POLICY."
    },
    "techniques/default-deny-plus-defaulted-owner.md": {
      "disposition": "clarify",
      "reason": "Two engine-documented errors. (1) The upsert paragraph conditions the read policy on rows being returned; the engine requires read access for any conflict clause and checks existing and updated rows against the read policy, raising rather than skipping. The 'only an insert policy' example must name the read policy to stay true. (2) 'The forbidden write is refused' is wrong for update/delete of hidden rows, which are silently filtered (zero rows, no error); the suite must assert zero affected rows and the row unchanged. Owner-exemption and default-deny paragraphs confirmed."
    },
    "techniques/allowlisted-operator-stream.md": {
      "disposition": "keep",
      "reason": "Construct-it-yourself allowlist versus denylist boundary, record-wide region, boot-condition gate and bounded session store are coherent; the pinned Portkey source confirms the shape it was drawn from."
    },
    "techniques/loopback-addressed-request-gate.md": {
      "disposition": "keep",
      "reason": "Host cannot be set by a rebinding page; bind plus header gate, forwarded-for clause and stated proxy residual are consistent with its application."
    },
    "techniques/server-sealed-client-roundtrip.md": {
      "disposition": "keep",
      "reason": "Canonical encoding, context binding, constant-time compare and drop-count-report are four details as stated; seal-versus-server-state boundary correct (a MAC authenticates, does not hide or prevent replay)."
    },
    "applications/sql--aggregate-view-not-base-table.md": {
      "disposition": "reverify",
      "reason": "Internally consistent with the technique; its 'grant arrived as a schema default' is historical and still true for that tree. The tree was not reopened."
    },
    "applications/sql--default-deny-plus-defaulted-owner.md": {
      "disposition": "reverify",
      "reason": "Thirteen cited column lines counted and consistent; the tree was not reopened."
    },
    "applications/node--server-sealed-client-roundtrip.md": {
      "disposition": "keep",
      "reason": "Verified 2026-10-27 at a pinned public commit; internally consistent with the technique. Not reopened this run."
    },
    "applications/node--allowlisted-operator-stream.md": {
      "disposition": "keep",
      "reason": "Key citations re-read at the pinned commit (allowlist, header redaction, truncation, stream substitution, three callers catching to 500). start-server.ts and the field/provider counts not re-read, so verified_on is unchanged."
    },
    "applications/node--outbound-fetch-destination-validation.md": {
      "disposition": "reverify",
      "reason": "Coherent and its deviations match the technique; the private tree was not reopened."
    },
    "applications/next--public-vs-server-env-split.md": {
      "disposition": "clarify",
      "reason": "'The hosted platform's default grants give the public role every privilege on a new table in the exposed schema' is superseded: the platform's changelog withdrew the default for new public-schema tables (new projects 30 May 2026, existing projects 30 October 2026), and the old default was select/insert/update/delete, not every privilege. The key-deprecation sentence is confirmed. Second-tree experiment not re-run."
    },
    "applications/next--loopback-addressed-request-gate.md": {
      "disposition": "keep",
      "reason": "Verified 2026-10-27 at a pinned public commit; residuals stated beside the rule. Not reopened this run."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied all four clarify items from the record above, each from a primary page
opened this run or an internal count. Applications not reopened keep `reverify`,
which is now the overall disposition.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/browser-credential-boundary",
  "date": "2026-10-31",
  "baseline": "587c5e52b",
  "digest": "sha256-b2:f27e4f74ae614b8e",
  "disposition": "reverify",
  "coverage": "All 18 documents decided. The four clarify items from the first 2026-10-31 record were applied and the edited passages re-read; the other 14 documents are byte-unchanged and keep their dispositions. Remaining reverify items are applications whose private or unpinned trees were not reopened. No verification date was refreshed.",
  "counterexamples": [
    "An update or delete aimed at another caller's row under a row policy returns zero affected rows and no error; a suite that asserts 'refused with the expected class' for it fails against a correct policy, or gets loosened until it asserts nothing.",
    "An upsert against a table with insert and update policies but no read policy fails even on its first write in the dominant engine, because the conflict clause requires read access regardless of RETURNING.",
    "A Supabase project after 30 October 2026 that adds a public-schema table without RLS has not published it: the table has no client-role grant until one is issued. Tables created before keep their grants and stay exposed.",
    "A local tool fronted by a proxy that rewrites Host and appends no forwarding header passes the loopback gate (stated residual, retained)."
  ],
  "sources": [
    {
      "url": "https://www.postgresql.org/docs/current/sql-createpolicy.html",
      "result": "Rows failing USING on UPDATE/DELETE: 'Typically, such rows are silently suppressed; no error is reported'; WITH CHECK: 'An error will be thrown'. ON CONFLICT DO UPDATE: 'SELECT permissions are required on the relation ... if the UPDATE path is taken, the row to be updated and the new updated row are checked against the relation's SELECT policies, and an error is thrown', and 'the UPDATE path will never be silently avoided'. Permissive OR, restrictive AND; 'a \"default deny\" policy is assumed'. Refutes default-deny-plus-defaulted-owner's 'read policy ... if anything in the statement returns rows' and its universal 'forbidden write is refused'; supports omit-the-column's permissive/restrictive sentence."
    },
    {
      "url": "https://www.postgresql.org/docs/current/ddl-rowsecurity.html",
      "result": "'Table owners normally bypass row security as well, though a table owner can choose to be subject to row security with ALTER TABLE ... FORCE ROW LEVEL SECURITY.' Supports the owner-exemption paragraph."
    },
    {
      "url": "https://www.postgresql.org/docs/current/sql-createview.html",
      "result": "security_invoker 'causes the underlying base relations to be checked against the privileges of the user of the view rather than the view owner'; 'By default, access ... is determined by the permissions of the view owner.' Supports definer default and off-by-default. The 2022 major (15) is not stated on this page; not re-derived."
    },
    {
      "url": "https://supabase.com/docs/guides/api/api-keys",
      "result": "Publishable key 'Safe to expose online'; 'Row Level Security decides what this client can reach'; 'Supabase is deprecating the anon and service_role keys by the end of 2026.' Supports the next application's key paragraph."
    },
    {
      "url": "https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically",
      "result": "Old default: 'select, insert, update, and delete are granted to every table in the public schema'; new tables now 'require an explicit opt-in (via a Postgres grant)'; default for new projects 'On May 30, 2026', applied to existing projects 'On October 30, 2026'; 'Existing tables are not affected'. Dates the next application's 'every privilege on a new table' claim as superseded."
    },
    {
      "url": "https://nextjs.org/docs/app/getting-started/server-and-client-components",
      "result": "'If variables are not prefixed, Next.js replaces them with an empty string'; importing a server-only module into a Client Component is 'a build-time error'. Supports public-vs-server-env-split's module-marker section."
    },
    {
      "url": "https://github.com/Portkey-AI/gateway/tree/669825cbe89ee51569918b8f78a9db486fd69dd4",
      "result": "Re-read src/middlewares/adminAuth/index.ts and src/middlewares/log/index.ts at the pinned commit: six-key allowlist, list-free header redaction, MAX_RESPONSE_LENGTH 100000, stream substitution, and all three getConfiguredAdminToken callers catching to a 500. start-server.ts, the 89-field Options type and the provider count were not re-read."
    }
  ],
  "documents": {
    "browser-credential-boundary.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: removed the stray indent in the allowlisted-operator-stream bullet."
    },
    "techniques/public-vs-server-env-split.md": {
      "disposition": "keep",
      "reason": "Next docs confirm empty-string replacement and the server-only build error. 'The common toolchains' slightly generalizes one toolchain's behaviour; not worth an edit."
    },
    "techniques/broker-proxy-attaches-secret.md": {
      "disposition": "keep",
      "reason": "Four contract clauses stated and listed; path, redirect and configured-base handling consistent with outbound-fetch-destination-validation."
    },
    "techniques/outbound-fetch-destination-validation.md": {
      "disposition": "keep",
      "reason": "Resolve-then-judge-all-records, connection binding, manual redirects and one door are internally consistent and match the kp application's recorded deviations."
    },
    "techniques/opaque-upstream-errors.md": {
      "disposition": "keep",
      "reason": "Closed vocabulary, clamp mapping and failure-not-empty-success are sound; the 'cheapest publication' section is the subject's banked law candidate and is correctly scoped."
    },
    "techniques/aggregate-view-not-base-table.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'Two consequences' now reads 'Three consequences', matching the three bullets."
    },
    "techniques/omit-the-column-not-the-value.md": {
      "disposition": "keep",
      "reason": "Permissive-OR / restrictive-AND confirmed verbatim against CREATE POLICY."
    },
    "techniques/default-deny-plus-defaulted-owner.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the upsert paragraph now requires the read policy whenever a conflict clause is present, says existing and updated rows are checked and the conflict path raises; the example names insert and read policies but no update policy; 'Assert refusal' now splits refused writes (insert, update failing the check) from filtered ones (update/delete of hidden rows: assert zero rows affected and the row unchanged)."
    },
    "techniques/allowlisted-operator-stream.md": {
      "disposition": "keep",
      "reason": "Construct-it-yourself allowlist versus denylist boundary, record-wide region, boot-condition gate and bounded session store are coherent; the pinned Portkey source confirms the shape it was drawn from."
    },
    "techniques/loopback-addressed-request-gate.md": {
      "disposition": "keep",
      "reason": "Host cannot be set by a rebinding page; bind plus header gate, forwarded-for clause and stated proxy residual are consistent with its application."
    },
    "techniques/server-sealed-client-roundtrip.md": {
      "disposition": "keep",
      "reason": "Canonical encoding, context binding, constant-time compare and drop-count-report are four details as stated; seal-versus-server-state boundary correct (a MAC authenticates, does not hide or prevent replay)."
    },
    "applications/sql--aggregate-view-not-base-table.md": {
      "disposition": "reverify",
      "reason": "Internally consistent with the technique; its 'grant arrived as a schema default' is historical and still true for that tree. The tree was not reopened."
    },
    "applications/sql--default-deny-plus-defaulted-owner.md": {
      "disposition": "reverify",
      "reason": "Thirteen cited column lines counted and consistent; the tree was not reopened."
    },
    "applications/node--server-sealed-client-roundtrip.md": {
      "disposition": "keep",
      "reason": "Verified 2026-10-27 at a pinned public commit; internally consistent with the technique. Not reopened this run."
    },
    "applications/node--allowlisted-operator-stream.md": {
      "disposition": "keep",
      "reason": "Key citations re-read at the pinned commit (allowlist, header redaction, truncation, stream substitution, three callers catching to 500). start-server.ts and the field/provider counts not re-read, so verified_on is unchanged."
    },
    "applications/node--outbound-fetch-destination-validation.md": {
      "disposition": "reverify",
      "reason": "Coherent and its deviations match the technique; the private tree was not reopened."
    },
    "applications/next--public-vs-server-env-split.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the default-grant sentence now names the old default (select/insert/update/delete) and its 2026 withdrawal for new tables (30 May new projects, 30 October existing), with existing tables keeping their grants. verified_on unchanged: the tree was not reopened."
    },
    "applications/next--loopback-addressed-request-gate.md": {
      "disposition": "keep",
      "reason": "Verified 2026-10-27 at a pinned public commit; residuals stated beside the rule. Not reopened this run."
    }
  }
}
```
