---
subject: error-handling
domain: software-engineering
last_touched: 2026-09-03
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

### 2026-08-31 - `/intake`, from a single-author blog archive

Amended `taxonomy-design`. Source: [[2026-08-31-brooker-blog]].

**A same-day contradiction, and the best kind.** The fourth axis had landed that
morning stating that never-absorbable is "answered per category, not per site",
with resource-exhaustion caps as its canonical members and "a limit that can be
swallowed is not a limit" as its rule. That reasoning was argued from a
document-parsing threat model - an attacker's oversized payload in one optional
region of one request, uncorrelated, where absorbing defeats the limit.

The primary this run fetched shows the same category firing exactly as
prescribed and taking down a global network: a preallocation cap of 200 against
~60 in use, hit by a **fleet-broadcast** artifact. There the refusal is
perfectly correlated and the blast radius is the fleet rather than the request.
The axis is real; its honesty property was too strong. Absorbability is a
predicate on category *and* arrival shape, and a stop-category reachable from a
broadcast input owes a second decision the per-request case never needed: what
the instance runs on when the newest artifact is refused.

The experiment then found a failure inside the repair itself. Six mutations of a
real broadcast artifact: arm A ran 0 of 32 checks on all six refusals, arm B ran
32 of 32 - but the **truncated** case fails in the decoder with no filename
while the five validator faults name field and file. A fallback that inherits
its diagnostics from the validator handles five classes informatively and the
most likely one anonymously. That clause, and the requirement that staleness be
visible on the running artifact rather than only in the boot log, came from the
seam rather than from the source.

Fleet tally: 11 refuse-on-broadcast sites against ~9 degrade families, and **no
project applies one policy consistently** - the choice is being made per call
site. Two unrelated trees already write the last-known-good copy and neither
reads it back.

## 2026-08-31 - the member that must never fire (intake, [[2026-08-31-pgsql-hackers-2026-08]])

Third touch of this subject today, and the second to land on `taxonomy-design`'s
boundaries rather than inside them. New technique `reclassification-is-not-repair`
plus a golden-path section placed ahead of "Classify on structure, never on prose".

**The seam.** `taxonomy-design` is thorough about the closed set, about categories
earning their place, and about the catch-all being an explicit member with the most
conservative properties. It has nothing about the **opposite** member. The catch-all
means *we did not recognise this*; the internal class means *we recognised it and it is
impossible*. Those are opposite claims needing opposite handling, and the slug map
cannot see the difference - both ends are "the taxonomy". Worth noting beside the
anydoc run's finding earlier today: that one added a fourth *axis* to the same file,
this one adds a distinguished *member*. Two runs, one file, neither colliding, because
a mature technique's gaps are at its edges rather than in its middle.

**Source and corroboration.** A development mailing list, where a patch proposed
assigning real error codes to every condition under which the regression suite reached
the internal class. The senior committer's objection is the finding: "if someone passes
OID 0 to relation_open, that IS an internal bug; labeling it otherwise is a lie and does
nothing to fix the real problem at the caller level... blaming the messenger rather than
looking for the root cause." A contradicted pick, kept - the source located the free
detector and proposed the wrong repair for it.

**The A/B returned `not-better`, which is the useful row.** The connected Rust tree had
already taken both branches of the fork without the technique existing: `Unsupported`
was split out of the internal class with a comment saying a permanent capability gap
must not read as a transient outage (the "declaration was wrong" branch), and a
store-layer commit replaced a coercing enum parse with a failing one, drawing the fork
per vocabulary - "Unknown is a value those two vocabularies deliberately have; `status`
and `redaction` do not." All three construction sites of the internal class passed the
separating question, 3 of 3. Nothing to fix, so the technique gained the amendment
naming the condition under which it finds nothing: a taxonomy already split
deliberately.

**Open, and the reason to come back.** The *detector* half is genuinely absent in that
tree and unusually cheap - the class already has a stable wire string with a unit test
pinning it, and zero tests assert it never fires across the suite. The expensive
prerequisite is built; the sweep is the whole instrument.

**A third sighting would promote the root.** `flake-lifecycle` holds the test form
(quarantine, never delete) and this technique holds the taxonomy form, both descending
from `deletion-is-not-repair`. Two independent sightings of *a signal relabelled instead
of repaired*, in different subjects, from different sources. One more and the root is
worth proposing at law altitude rather than as two techniques citing one law.

## 2026-09-03 - `/intake` kube-rs (run `intake-kube-0903`, intake 2.3.1, Opus workers)

New technique `parse-failure-keeps-identity` (laws `identity-survives-reuse`, `failure-not-empty-success`, `one-authority-per-vocabulary`): when one malformed item would stop a reader over a collection the reader does not own, the decode failure is scoped to the item and the item's identity is still recovered through a projection that is a subset of the same schema, never a parallel one. Boundaries against `structured-propagation` (sideways in data, not upward) and against gated foreign-format import. Application `rust--parse-failure-keeps-identity` against a control-plane client library@1.89 (its typed deserialize guard).

## 2026-09-03 - intake `intake-chatterino2` (2.3.2)

Amendment in `crash-capture`: the restart decision after a crash lives outside the store
the crash may have corrupted (a flag file or a launcher argument), or a store-caused crash
loops on its own policy. Confirmed structurally against the fleet desktop app, whose crash
discriminator is already a marker file beside the store; no restart policy exists there
yet, so the row is a simulation with the seam named for when one does.
`rust--crash-capture` application.
