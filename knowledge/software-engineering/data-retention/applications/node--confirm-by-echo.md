---
layer: application
type: application
subject: data-retention
technique: confirm-by-echo
stack: node
status: forged
verified_on: 2026-08-20
---

# Node: a three-guard erasure ladder on an on-demand delete route

`POST src/app/api/org/erase/route.ts` is the on-demand erasure door — the
counterpart to a schedule-only purge, added because "data leaves on the
nightly timetable" is not an answer to "erase my data now". Its guards are
the technique's ladder in order, each proven by a test in the sibling
`route.test.ts` (`erase/route.ts:18-27`).

## Rung 1 — same-origin, before the body is read

`requireSameOrigin(request)` runs at `erase/route.ts:53-54`, ahead of
`request.json()`. The reasoning in the header comment is precise: the
session cookie is only `SameSite=Lax`, which does not stop a cross-site form
POST from carrying it, so a bare cross-site POST could otherwise destroy a
tenant. Running it first means a cross-origin caller learns nothing — no
validation messages, no existence oracle for org slugs.

## Rung 2 — echo the exact target

`erase/route.ts:62-73`. The expected phrase is **the target's own name at
the scope being destroyed**:

```
const target = repo || org;
const matches = repo ? confirm === repo : (confirm ?? "").toLowerCase() === org.toLowerCase();
```

Three properties of this that the technique generalizes:

- **Scope-specific.** Org-wide erasure demands the org slug; the per-repo
  variant demands the repo's full name. A payload that meant to scope to one
  repository cannot satisfy an org-wide erase, because it does not contain
  the right string — the scope mistake becomes unsatisfiable, not merely
  unlikely.
- **The identifier's own equality rule.** Org slugs are compared
  case-insensitively because the authorization layer lowercases them
  everywhere; a repo full name is matched exactly, like its database lookup.
  Not "exact always" and not "fuzzy" — *the same rule the system already
  uses for that identifier*.
- **Checked before authorization work.** A payload that does not type the
  name back is a 400 before any role lookup (`erase/route.ts:68-73`), so an
  accidental or replayed `{org}`-only POST from a script cannot delete
  anything, and the error names the exact string required.

## Rung 3 — owner role

`await requireOrgRole(org, "owner")` at `erase/route.ts:76-77`, propagating
the helper's ready-to-send 401/403 verbatim. The comment states the rule the
technique argues for: irreversible, so it is not a member action. Note the
ordering — the check that reveals whether the actor *could* have performed
the operation runs last, after the two cheaper absolute checks.

## After the ladder: degraded outcomes are not green

`erase/route.ts:98-118` is the part most confirmation flows omit. Two
outcomes return 207 rather than 200:

- `!result.complete` — the wall-clock budget stopped the erase at a batch
  boundary. The response adds `resumable: true` and the message "Repeat this
  request to resume", which works because every committed batch is durable
  and the request is idempotent.
- `!result.audited` — the data was erased but the `data.erased` trace could
  not be written. The comment names why this is degraded: "for a compliance
  control, 'mostly erased' and 'erased with no record' are both degraded
  outcomes the caller has to act on."

The erase path also derives its own time budget from the route's declared
`maxDuration = 60` via `ERASE_MAX_DURATION_S`, pinned by the same coupled-
constant test as the scheduled purge (`erase/route.ts:37-42`), and reuses
`pruneRepoScans` with a keep-window of `0` plus `pruneAudit` so the erasure
path can never drift from the delete graph the purge maintains
(`retention.ts:686-697`).

## The tension this route sits inside, and a deviation

`includeAudit: true` erases the org's entire audit trail — the same rows
`src/lib/db/audit-integrity.ts:1-94` makes tamper-evident with a per-row
HMAC folded into `meta._sig`, and which the CSV exporters checksum so a
filed artifact is self-verifying. Erasure and tamper-evidence are pulling in
opposite directions here by design, and the route resolves it by making
trail erasure an explicit, separately-flagged, owner-only, echoed act rather
than a side effect of erasing data.

Two deviations from the standard remain, and the standard does not lower to
meet them. First, the trail is erased wholesale rather than being designed
identifier-only so that erasing the subject leaves the historical account
intact — the technique's preferred resolution. Second, no preview is
attached to this door: the scheduled purge has `?dryRun=1`
(`purge/route.ts:50-55`) but the erasure ladder shows no computed casualty
count beside the confirmation field, so the operator types the name without
being told the size of what they are destroying.
