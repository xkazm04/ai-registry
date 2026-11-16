---
subject: draft-editing
domain: software-engineering
last_touched: 2026-11-16
dry_streak: 2
---

# draft-editing

Forged 2026-08-18 from the personas tree. Six techniques, and three `react`
applications against the persona editor (draft model, debounced save groups,
field bounds). The librarian scan picked it on 2026-11-16 because it had one
stack and had never been swept. First touch: the `/deepen` loop below. That
pass added a `python` application from a public CMS tree, which clears the
single-stack debt.

## 2026-11-16 - `/deepen` loop (run `filler-deepen-20261116b`, /shift filler)

Dispatched by the librarian scan: a single stack (`react`), never swept, and
two applications dated 2026-08-18 with no `verified_against`.

#### Round 1 (survey round)

**Not dry. No new technique. Three rules flipped (each gained a condition).
All three applications were re-resolved and corrected.** The lanes were a
read lane over personas at HEAD `8d076db46a` (read through `git show`, so the
dirty working tree was never touched); a counter-evidence web lane; a blind
lane written down before any search; and the volatile facts.

- `draft-model` **flipped (condition added)**: the old rule was "the diff,
  never the record". It now reads "unless the write is conditional": a whole
  record is safe against the stale revert only under a version precondition
  that the server enforces (RFC 9110 §13.1.1). The price is that every
  concurrent write becomes a conflict. The precondition never cures
  blank-filling. Three lanes converged. The blind lane named conditional
  writes. The read lane found the reference editor sending its whole
  Settings group with no version, which the application had filed as a diff.
  The second-stack tree does exactly what the condition describes: it sends
  the whole form and refuses a background save when the version moved. The
  golden path was amended in one sentence.
- `debounced-save-groups` **flipped (condition added)**: the old rule asked
  for a "synchronous last-gasp drain on the platform's closing hook". It now
  asks for a drain the platform lets finish: a synchronous local write or a
  kept-alive send. A synchronous network request at dismissal is refused by
  major browsers (web.dev "disallow synchronous XHR", Chrome 80). The drain
  registers on the page-hidden signal, because the close events do not fire
  reliably (MDN beforeunload; Chrome Page Lifecycle). Personas documents the
  same failure on the desktop webview's teardown path.
- `field-defaults-and-bounds` **flipped (condition added)**: across a trust
  boundary, the server's bound is the authority. A client copy must be
  generated from it or checked against it, and a "matches the server"
  comment counts as a second authority. Prohibition 7 was added. Evidence:
  the timeout field, which the application had held up as exemplary, says
  30 min "matching the engine hard ceiling". The engine's ceiling is 20 min
  and it rejects above that. The drift was already present at the commit the
  2026-08-29 application verified against.
- Applications: `react--draft-model` was re-pinned (all anchors moved) and
  corrected (the diff is at group grain, not field grain; 14 nullable fields
  now). `react--debounced-save-groups` was re-pinned: the unmount flush was
  added, and the drain module now has three importers (still not the
  editor). `react--field-defaults-and-bounds` had "two years" corrected to
  about six months (the tree starts 2026-02-17) and gained the timeout
  correction. All three are `verified_on` 2026-11-16, `react@19`. A new
  `python--draft-model--conditional-autosave` was read in a public CMS tree
  at `3002dd0`.
- Volatile facts: "two years" was refuted (corrected). "~39 call sites" is
  confirmed as the census's own figure, but the census itself sits beside a
  count of 40 call sites across all 13 functions, so it is quoted and was
  not re-counted. "80%" is an illustration, not a measured or vendor fact.

Confirmed and left untouched: completeness gates promotion, not saving
(the second stack defers required fields on a draft save); listen for
`beforeunload` only while dirty, i.e. the guard never fires on a clean
draft (MDN); the in-flight snapshot comparison (the file is byte-stable).

Applied: three simulations against personas, all **better**. See the
ledger fragment.

#### Round 2

Dry. Probes: per-gesture commit buffers sit below the draft threshold (the
golden path's "when not to build a draft layer" already covers them).
Flush-first ordering for guards: the technique holds, and personas' guard
asks first, which is an application gap. Wagtail's deferred required fields
match completeness-derivation.

#### Round 3

Dry. Probes: the debounce window "a second or two" (observed 500 ms and
800 ms, inside it); no retry on a content rejection; no dialog on a clean
draft. All confirmed. dry=2, so the loop idles until a clock or an event.

Banked leads (with return conditions):
- The personas leave guard opens its dialog without trying a flush first.
  This is a `navigation-guards` deviation, and that technique has no
  application yet. Return: the next pass that writes one.
- The pof `useEntityCommitBuffer` is a react patch-overlay buffer whose
  dirtiness is "a patch is buffered". It may serve as a worked
  below-the-threshold case. Return: a pass on `dirty-tracking`, or a request
  for a buffer that is not a draft.
- The Wagtail client script (how it schedules and drains autosave, and how
  it renders `invalid_revision`) was not opened. Return: the next
  `debounced-save-groups` pass that wants a second-stack drain.

Impact: not computed. The map regeneration is owed (Director's step 4).
