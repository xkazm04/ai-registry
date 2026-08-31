---
subject: error-handling
domain: software-engineering
last_touched: 2026-08-28
dry_streak: 0
---

# error-handling

First touch: 2026-08-28, `/deepen` loop round 3 over the software-engineering
domain. 23 attention points, 5 consumer deviations, no prior vault note. Touched
shortly before by an intake amendment (`7c641ab`, the auto-capture tier) which
is not a sweep — the subject had never been scanned as a whole.

## State

6 -> 7 techniques, 2 applications (`react`, `rust`).

Landed:

- `cancellation-attribution` (new technique) — work that stops before it
  finishes is the third outcome, and the subject's taxonomy had two slots.
- `error-handling.md` — new golden-path section ("Not every non-success is a
  failure") plus frontmatter and index wiring, placed before the propagation
  section because the attribution has to exist before it can survive a
  boundary.

## The claim that made it a technique rather than a category

The cheap answer — add a "cancelled" category and route it nowhere — trades one
wrong answer for another. **Cancellation is an outcome with a cause, and the
cause answers every question the taxonomy asks.** One observable, four answers:

| Cause | Retry | Tell user | Count |
| --- | --- | --- | --- |
| Requester went away | no | no | as traffic |
| Superseded by newer input | no | no | as a tuning signal |
| Local deadline fired | yes | yes | as a real failure |
| Process draining for restart | elsewhere | yes | against the deployment |

And the mechanism that makes it durable rather than merely overlooked: **the
platform's cancellation signal is causeless by construction.** Every runtime
reports *that* work was cancelled and none reports *who* cancelled it, because
the mechanism is built to compose and a composable cancellation cannot know
which of its nested owners fired. So attribution must be written at the site
that calls for the stop; it is not recoverable at the site that catches. The
seductive failure is filing an unattributed cancel under the benign cause
because most of them are benign — `unknown-is-not-a-value` in the one class
where being wrong makes no sound.

Corollaries that earned their place: nested cancels read innermost-first (a
deadline inside an abandoned request produces two, and the outer one arrives
last and overwrites the story); the discriminator everyone reaches for is the
error's *name*, which answers the question that was never in doubt; and the
route-nowhere bucket must itself be monitored for shape changes, because once a
category exists that reports nothing, a misclassification into it is
undetectable by construction.

## Prior art checked before drafting

Grep over the subject: `cancel` 0, `abort` 0, `shutdown` 0, `partial` 0. Then
bundle-wide, which found the one thing that mattered:

- **`stream-proxy-hop/abort-versus-unreachable`** owns the two-way
  discrimination at a streaming hop and owns it well — including the
  measurement of why it matters there ("count aborts as errors and the error
  rate becomes a traffic metric... a real outage adds a bump that no threshold
  can find"). It also explicitly bounds itself: *"On an ordinary request the
  ambiguity barely exists."* That sentence is the boundary and also the reason
  the general case was missing — it is no longer true of ordinary requests,
  where abort-on-unmount, abort-on-keystroke, deadline cancels and drain are
  routine. The new technique defers the streaming mechanics to it by name and
  holds the general claim it is an instance of. Two subjects reaching the same
  distinction from different directions was the strongest convergence signal
  available this round.

## Counter-evidence that confirmed (no edit — first-class results)

- **"Doors need throttles" already exists.** The obvious attack on the subject's
  central invariant — that "every failure reaches a door" is how you build an
  unreadable telemetry stream — was pre-empted: `error-doors` has both
  "Report once, at the owner" and "Frequency: doors need throttles". Declined
  as covered; the new technique cites the invariant's exact reading instead of
  restating the throttle.
- **"Classify on structure, never on prose"** holds and gets a sharper instance
  than the golden path's own: even where a runtime supplies a structured
  cancellation sentinel rather than a name to match, the sentinel is still the
  wrong instrument, because it is structured about the wrong fact. Folded into
  the new technique rather than amended into the golden path.

## Open leads (banked, with return conditions)

- **Partial success has no home either** (`partial`: 0 hits in the subject). A
  batch where seven of ten items succeeded is neither outcome, and the same
  binary-taxonomy pressure applies. Not minted: unlike cancellation it produced
  no independent second sighting in the bundle, and its natural home may be
  `job-coordination` or `admission-queue` rather than here. Return condition:
  a run that opens either, or a second sighting anywhere.
- **`abort-versus-unreachable`'s self-bounding sentence is now inaccurate** —
  "on an ordinary request the ambiguity barely exists" was true of the traffic
  shape it was forged against and is not true generally. Not edited: it is
  another subject's file and the sentence is load-bearing for that technique's
  "why this pair specifically" argument, so the fix is a rewording its own
  subject should choose. Return condition: any run that opens
  `stream-proxy-hop`.

## Registry-local note

The round-3 gate run collided with a concurrent session writing
`game-production` and `media-generation`: a `build-index` here swept that
session's untracked techniques into two bundles' `index.json`, and
`build-catalog` then refused to write at all (catalog and indexes disagreeing
by four and two techniques). Restored both foreign indexes plus `catalog.json`
and `rules/ai-registry-localization.md` to HEAD and committed path-scoped.
Second occurrence of the lesson that a generated index is the shared file most
likely to couple two runs' atomic commits — and the first where the *catalog's*
own consistency check was the thing that surfaced it, which is the check
behaving exactly as designed. **`catalog.json` is left stale on purpose; the
next run in a quiet tree regenerates it.**

## 2026-08-31 - the fourth axis (intake, [[2026-08-31-anydoc]])

Two amendments from a Rust document-conversion crate, both from the Phase 6 step-3
enumeration hunt. `taxonomy-design` says "each category must answer **three** questions,
because these are the questions consumers branch on" - an enumeration, which invites
exactly one question. The source's `is_fatal()` predicate is the answer: a fourth axis,
**recoverability in place**, which only becomes visible where absorption is the default.

- `taxonomy-design.md` gained "The fourth axis, where leniency is the design". The
  membership inverts: in a lenient component you enumerate the categories that may
  **never** be absorbed, and that set is a security boundary - a limit that can be
  swallowed is not a limit, because an adversary relocates the payload into whatever part
  the reader treats as optional. `use_when` gained a fourth entry.
- `swallowed-error-prevention.md` gained "When leniency is the architecture, invert the
  marker". That file already covered *per-site* declared drops ("probes where failure is
  an expected answer, cleanup where nothing is lost"); it did not cover a component where
  every parse step is one. The census denominator moves from sites to categories.

**What this subject already had, and the source did not improve on:** the two-channel
error contract (a stable machine code beside a free-to-change display message, pinned by
a round-trip test). `structured-propagation` states it in as many words. The source
implements it unusually well - a `code()` method plus a test enumerating every variant so
the wire spelling cannot drift - and it is a catch, not a landing. Recorded so nobody
proposes it again.

No golden-path edit was needed. In a six-sibling checkout that meant no `content` lock,
which is worth noticing as a property of amendments: **an amendment inside a technique
touches no shared spine, and is therefore the cheap move under contention as well as the
cheap move editorially.**
