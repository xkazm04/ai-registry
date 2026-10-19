# Azure DevOps two-way contract

Status: **import built and fixture-tested; write-back designed, disabled.** The operator
wants ticket communication once a real org and environment are available; until a smoke
test on that org has passed, no code path in `scripts/ado.mjs` writes to Azure DevOps by
default. This file is the contract the write-back will be enabled against.

The idempotency key in both directions is the proposal's `external_ref` (`ado:<id>`),
unique in the store (partial index `proposals_external_ref`).

## Import - ADO -> proposal (built)

`ado.mjs import`: WIQL (`POST {org}/{project}/_apis/wit/wiql?api-version=7.1`, or
`GET .../wiql/{queryId}` for a saved query) -> ids -> `POST .../_apis/wit/workitemsbatch`
in chunks of 200 ids (the API's cap) with an explicit field list and `errorPolicy: omit`.

| Proposal | From | Rule |
| --- | --- | --- |
| `kind` | - | `work-item` (no metric, no expected delta) |
| `origin` | - | `ado` |
| `external_ref` | `id` | `ado:<id>` |
| `external_url` | org, project, id | `https://dev.azure.com/<org>/<project>/_workitems/edit/<id>` (an org given as a URL keeps its host) |
| `feature` | `System.AreaPath` | overlay `areaPathMap` (full path, then last segment) wins; else the last segment matched case-insensitively (and slugged) to a feature slug, feature name or context name; else `backlog` (added to the app-structure when missing) |
| `lens` | `System.Tags`, `System.WorkItemType` | a tag containing `security` -> `security`; Bug -> `quality`; anything else (User Story, Feature, PBI, Task, Epic, Issue) -> `business` |
| `title` | `System.Title` | as is |
| `body` | `System.Description` (a Bug without one: `Microsoft.VSTS.TCM.ReproSteps`), `Microsoft.VSTS.Common.AcceptanceCriteria`, `System.State`, `System.AssignedTo`, `System.AreaPath`, `System.Tags` | HTML stripped; assignee as **display name only** (the unique name is an e-mail address and stays out of the store) |
| `tier` | `Microsoft.VSTS.Common.Severity`, `Microsoft.VSTS.Common.Priority` | Severity `1 - Critical` -> 0; else Priority 1 -> 1, 2 -> 2, 3 or 4 -> 3; else untriaged (absent). P6 re-ranks every item by the triage rubric anyway |
| `risk_class` | tags, type | security tag -> `authz`; Bug -> `reliability`; else absent (P6 classifies) |
| `status` | - | `proposed`; an imported item waits for the operator like any other |

Re-import: an `external_ref` the store already holds is never inserted again. When its
title, body or link changed, `store.mjs update-external` refreshes them; otherwise it is
skipped. Tier, risk class and status are never touched by a re-import - they belong to the
store once triage ran (the conflict rule below). A concurrent importer that wins the race
is handled: the store refuses the duplicate with the existing id, and the loser updates it.

## Write-back - proposal -> ADO (designed, disabled)

Two operations, both building JSON-patch payloads (`Content-Type:
application/json-patch+json`, api-version 7.1):

- **sync** - imported items whose status the store owns get their ADO state set and a
  comment: `PATCH {org}/{project}/_apis/wit/workitems/{id}`, guarded by
  `{"op": "test", "path": "/rev", "value": <rev read just before>}` so an edit made in ADO
  meanwhile fails the patch instead of being overwritten. A state already at its target is
  left alone (no patch, no comment): sync is idempotent.
- **push** - a scan finding becomes a new work item: `POST
  {org}/{project}/_apis/wit/workitems/${type}` with Title, Description (HTML-escaped,
  newlines as `<br>`), Tags (`bp; bp:<proposal id>; lens:<lens>; T<tier>; risk:<class>`),
  AreaPath (overlay `ado.area_path`), Priority (tier 0|1 -> 1, 2 -> 2, 3 -> 3). Type: Bug
  for the quality and security lenses, else Task (Product Backlog Item on Scrum, Issue on
  Basic).

### State map

Store status -> ADO state per process template. A status with no entry (`failed`,
`rework`) is not synced: the work is still in the store's hands.

| Store status | Agile | Scrum | Basic | CMMI |
| --- | --- | --- | --- | --- |
| proposed | New | New | To Do | Proposed |
| approved | Active | Approved | To Do | Active |
| executing | Active | Committed | Doing | Active |
| done | Resolved | Done | Done | Resolved |
| accepted | Resolved | Done | Done | Resolved |
| released | Closed | Done | Done | Closed |
| declined | Removed | Removed | Done | Removed |
| descoped | Removed | Removed | Done | Removed |

Basic has no Removed state; a declined item there is closed as Done with the comment
saying why. A custom (inherited) process maps its own state names by category: Proposed,
In Progress, Resolved, Completed, Removed.

### Comment format (comment-on-commit)

`POST {org}/{project}/_apis/wit/workItems/{id}/comments?api-version=7.1-preview.4`
(the comments API is still preview in 7.1), body `{"text": ...}`:

```
[bp] p-3f9a1c is done: Payment run posts twice on retry
commit 1a2b3c4 in k-sec-2
release rel-1.4.1
tier T0 money
```

One comment per state change, written in the same sync that moves the state - never on a
sync that changes nothing.

### Conflict rule

- **ADO is the truth for title, description and assignee.** The import refreshes them;
  the store never pushes them back on an imported item.
- **The store is the truth for status after approval.** Before approval (`proposed`) the
  item is ADO's - sync sends nothing for it. From `approved` on, the store's status is
  pushed, and an ADO-side state change in between fails the `/rev` test and is reported,
  not overwritten.
- Tier and risk class are the store's from triage on; they travel only as tags on push.

### PAT scopes

- Import: **Work Items - Read**.
- Write-back: **Work Items - Read & Write**. Nothing else (no Code, no Build, no Project
  and Team). A separate PAT for write is preferable, with an expiry of days, not a year.

The PAT lives in `<repo>/.env.local` as `AZURE_DEVOPS_PAT`, is sent only as Basic auth,
and is redacted (plain and base64) from every error the script prints.

### Rate limits

ADO throttles by a global per-user consumption window and answers `429` (or `503`) with a
`Retry-After` header; `X-RateLimit-Remaining` and `X-RateLimit-Delay` appear before that.
The client retries 429/503 up to three times honouring `Retry-After` (capped at 60 s),
fetches in batches of 200, and sends sync requests one at a time. A bulk push of hundreds
of items should be paced (a short delay between creates) - add it before enabling push.

### Open gaps before `write: true`

1. **Push cannot record the new id.** `update-external` refuses an origin-`scan` item, and
   nothing else writes `external_ref` on one, so a pushed finding cannot be linked to its
   new work item and a second push would duplicate it. `ado.mjs push` therefore refuses
   even with both switches. Needed: a store command that links a scan item to an external
   ref once (`link-external --id --external-ref --external-url`, refused when already set).
2. Comment text is not yet deduplicated across a crash between the patch and the comment;
   acceptable (one missing comment), but say so in the smoke test.

### Smoke test on a real org, before `ado.write: true`

Run on a throwaway project or area path, with a write PAT scoped as above:

1. `import --dry-run` against the real WIQL: counts and features look right; the
   `backlog` share is explained by area paths.
2. `import`, then `import` again: second run reports all skipped; edit one title in ADO,
   third run reports one updated.
3. Approve one imported item in the store; `sync --dry-run` shows exactly one PATCH with
   the expected state for this org's process template (check the state names exist:
   `GET _apis/wit/workitemtypes/{type}/states`).
4. `sync --enable-write` with `ado.write: true`: the state moves, one comment appears;
   rerun - nothing is sent.
5. Change the item's state in ADO by hand, move it in the store, sync: the `/rev` test
   fails and is reported, ADO's change is kept.
6. Invalid PAT: the error says so and contains no token.
7. Only then: set `ado.write: true` in the overlay for that repo, and record the smoke
   test's date and org in the ledger.
