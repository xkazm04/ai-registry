## Phase 12: Release Log Update ("What's New") — optional

**Skip this phase entirely unless the overlay declares a `## Release log`** — say
"no release log configured, skipping Phase 12" once and move on. The section names
the surface: a structural config file, a content directory, the locale set, and the
key shape items live under. Also skip if zero findings were accepted in Phase 8 —
there is nothing to log.

Where a repo has one, this is what makes the work visible to future-you, to other
contributors opening the app, and — most importantly — to **the actual users**, who
read these strings as news, not engineering logs.

**Critical rule before you start writing anything:** the release log is
**user-facing news**, NOT an internal changelog. The repo law's voice rules for
user-facing copy apply to every word you write here. If you find yourself typing a
file path, a struct name, an env var, or a planning-doc reference, you have already
failed — go back and rewrite as impact + benefit.

### 12a. Read the release config

Read the structural config file the overlay names. Identify:
- `config.active` — the version that the in-app view opens by default
- the matching release object inside `config.releases`
- how many items it already contains
- the highest existing item id in that release (for ID generation)

If the file is missing or unparseable, warn (`release log not found, skipping
Phase 12`) and stop. Do **not** create the file from scratch — its existence
is a project-level decision, not the skill's call.

### 12b. Locate the content folder

Read the directory listing of the content directory the overlay names. It should
hold one file per locale the overlay lists, plus whatever accessor the surface
uses. Read the English file to learn the namespace shape — the overlay's key
shape says where items live and which keys each carries (typically `title` and
`description`).

If any declared locale file is missing, warn loudly:
```
Locale file for {lang} is missing - refusing to write a partial set.
A view that loads copy by direct property access crashes on a missing key.
Restore the file or skip Phase 12.
```

### 12c. Ask the user

Print:
```
Add accepted findings to the release log?
Active release: {version} - currently {N} item(s).

Reply with numbers from the accepted list (e.g., "1, 3"), "all", or "none".
```

Use the **same numbering** as the Phase 7 summary table so the user does not
have to re-translate. Only accepted findings are eligible — declined ones are
implicitly excluded.

If the user replies `none` (or empty), skip to Phase 12g (still confirm
"unchanged" in the summary).

### 12d. Build structural items for the config file

For each chosen finding, build the structural metadata only:

```json
{
  "id": "{next-numeric-id}",
  "type": "{inferred type}",
  "status": "completed",
  "added_at": "{today YYYY-MM-DD}"
}
```

**No `title`, `description`, `summary`, `label`, or `source` fields.** Those
are user-facing strings that live in the locale files, not in the config. The
config is structural metadata only — versions, types, statuses, dates, ids.

**Type inference rules** (in order — first match wins):
1. Finding was escalated to severity `CRITICAL` by the Phase 6 security
   escalation rule → `"security"`
2. Finding's bucket is `code` AND title/summary clearly describes a bug fix
   (keywords: "fix", "bug", "regression", "incorrect", "leak") → `"fix"`
3. Finding introduces a backwards-incompatible change (keywords: "breaking",
   "remove", "rename", "drop column") → `"breaking"`
4. Finding adds documentation only → `"docs"`
5. Otherwise → `"feature"`

**Item ID convention**: simple incrementing strings — find the highest
existing numeric id in `release.items` (`"1", "2", "3", ...`) and increment.
If no items exist yet, start at `"1"`. The id is what links the JSON
structural entry to its i18n content.

Append the new items to the **end** of `release.items` so they appear last
within their type group in the UI (the changelog view groups by type but
keeps within-type ordering stable).

### 12e. Build user-facing content for the i18n files

For each chosen finding, draft a `{ title, description }` pair in **English**
following the user-facing-news voice:

- **Title (≤ 8 words):** lead with the user benefit. Imperative or noun
  phrase, NOT a technical summary. Examples:
  - ❌ "Add Bearer token middleware to /api routes"
  - ✅ "Safer access for the desktop app"
  - ❌ "Implement A2A JSON-RPC handler"
  - ✅ "Open your agents to other AI tools"
- **Description (1-3 short sentences):** explain what the user can now do
  and why they would care. NO file paths, NO module names, NO version-bump
  details, NO planning-doc references, NO implementation jargon. Examples:
  - ❌ "Adds external_api_keys table, Bearer token middleware on the
       management HTTP API, gateway_exposure column on the agent table..."
  - ✅ "Your agents can now talk to other AI tools through a shared protocol.
       Pick exactly which agents you want to share, and protect them with
       access keys you control — your private agents stay private by
       default."

**The translation test:** read your draft and ask "would a non-developer
who has never seen the codebase understand this and care about it?". If the
answer is no, rewrite.

### 12f. Write content to EVERY declared locale file

This is the repo law's i18n contract: every key in the English file must exist
in every other locale file. Skipping any file breaks the UI for that language
at runtime.

For each new item, for each declared locale file:

1. Read the file.
2. Locate the items object for the active version, at the key shape the overlay
   gives. (If the release itself is new, you also need to add its entry with a
   `label`, a `summary`, and an empty items object. Use the version string as the
   default label, and a one-line summary.)
3. Append the new item id with the English `title` + `description` pair you
   drafted in 12e.
4. For non-English locale files, ALSO ensure the file has a top-of-file
   `TODO(i18n-{lang}): translate from English placeholders` marker in that
   file's own comment syntax. If the marker is already there, leave it. If it's
   missing, add it.
5. Write the file back, preserving the file's existing indentation and field
   ordering.

**Do not attempt to translate the strings yourself.** Write English
everywhere. The TODO marker is the signal that human translation is pending.

**Validate before writing:** after building the new content for every locale
file in memory, double-check that:
- Every file gets the same set of new keys
- The id exists in the config AND in every locale file's items map
- No locale file has been skipped

### 12g. Write the config back

Write the updated config with:
- The file's existing indentation
- Trailing newline
- Field ordering inside each item (`id, type, status, priority, sort_order,
  added_at`) for diff-friendliness

### 12h. Confirm

Confirm with a one-line print:
```
Release log updated: {N} item(s) added to {version}.
  - {config file} (structural)
  - {L} locale files (English content + TODO markers preserved)
```

If the user replied `none`, print:
```
Release log unchanged.
```

### 12i. Add to the Phase 11 summary footer

Append a `Release log:` line to the existing Phase 11 printout (re-print
the summary so it stays canonical):

```
  Release log: {N} item(s) added to {version} (en + {L-1} locale placeholders)
                | unchanged
```

---

