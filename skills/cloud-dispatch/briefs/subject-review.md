---
cloud_ok: true
label: subject review <bundle>/<subject>
from: librarian
---

# Subject review: <bundle>/<subject>

You are a worker in a fresh checkout of **ai-registry**, a public registry of knowledge
bundles, branched from its GitHub origin. A Director on another session reviews your diff
before anything merges. Nobody can answer questions while you run: write questions into
RESULT.md and continue.

**Read `AGENTS.md` at the repo root first.** It binds everything below.

## Your dispatch

Re-judge ONE subject whose architecture-review decision is pending or stale, and record the
decision in its subject note.

- Subject: `<bundle>/<subject>`
- Its file, as `knowledge/<bundle>/index.json` resolves it: `<knowledge/<bundle>/.../<subject>/...>`
  - this path came from the index; use it as given and never build one from the slug. Never
  Read or slice `index.json` itself.
- Why it is due (from `node scripts/review-coverage.mjs --json` at dispatch): `<pending | stale since <date>>`
- The note you write: `librarian/subjects/<bundle>/<subject>.md` (create it only if it does
  not exist; otherwise append)

Before anything else, run `node scripts/review-coverage.mjs --json` and confirm the subject's
`state` is `pending` or `stale`. A subject already `reviewed` is a dispatch error: say so in
RESULT.md and stop.

## Method

Follow `docs/semantic-review.md`; it is short, read all of it. In short, and the file wins
where this summary differs:

1. Read the golden path and every owned technique and application in the subject directory.
   The unit is complete only when **every** document has a decision; review-coverage
   compares your `documents` keys against the directory and fails on a missing one.
2. For each document decide `keep`, `clarify`, `split`, `merge`, `deprecate` or `reverify`,
   with a reason. Check primary sources for unstable or disputed claims, and quote what you
   rely on. Reading a source is not executing the software it describes. Evidence you could
   not reach becomes `reverify`, never a refreshed `verified_on` date.
3. Record the baseline commit (`git rev-parse --short HEAD`), the trigger, the intended
   benefit, the failure if ignored, the boundary and at least one counterexample.
4. Compute the digest with `hashBundle(<subject directory>).hash` from
   `scripts/lib/bundle-hash.mjs`; never invent one:
   `node -e "import('./scripts/lib/bundle-hash.mjs').then(m=>console.log(m.hashBundle(process.argv[1]).hash))" <subject directory>`
5. Append the record to the note: a line `<!-- architecture-review:v1 -->` followed by a
   ```` ```json ```` fence carrying `subject` (`<bundle>/<subject>`), `date`, `baseline`,
   `digest`, `disposition`, `coverage`, `counterexamples`, `sources` and `documents`.
   `librarian/subjects/software-engineering/agent-chaining.md` is the worked example.
   Preserve every older entry; when new evidence contradicts an old inference, retract it
   explicitly in prose above your record rather than editing the old one.
6. **This brief changes the note only.** A `clarify` or `split` decision names the change
   in the record's reason and in RESULT.md's Handoff; it does not edit the subject's
   documents. Editing them would change the digest your record was computed against.

## Rules that bite here

- **Never run any registry script with `--help`.** Most have no argument handling and
  execute. Read a script's `argv` handling in its source instead.
- **Run `node scripts/review-coverage.mjs`** after writing the record and put its output
  tail in RESULT.md. Your subject must read `reviewed`, and the run must name no error for
  it. An error elsewhere is inherited: say so with the count.
- Do not touch generated files (index, rules, catalog), `librarian/inbox.md`, or any other
  subject's note.
- No machine paths anywhere you write; this repository is public.

## RESULT.md must carry

- The subject, its state before (`pending` or `stale`) and after.
- The overall disposition and every document's disposition with its reason.
- The sources you read, each with what it supported or refuted.
- `## Handoff` - every `clarify`, `split`, `merge` or `deprecate` change the Director owes
  the subject, and every `reverify` item with the evidence it needs.
- The `review-coverage.mjs` output tail.
