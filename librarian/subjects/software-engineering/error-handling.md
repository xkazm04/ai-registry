---
subject: error-handling
domain: software-engineering
last_touched: 2026-09-04
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

## 2026-09-03 — `/intake` over a doctrine corpus ([[2026-09-03-rusttraining]])

+1 technique: **`consumer-decides-error-shape`** — a missing stage.

The subject modelled one taxonomy with many consumers, and `structured-propagation`
modelled the *vertical* journey (born deep, decided high, "loss is one-way").
Neither modelled the **horizontal, ownership** asymmetry: two artifacts on
independent release schedules.

Failure shape is decided by *who consumes it*, not by where it is raised. Across a
boundary whose two sides ship independently, the category must be a value the far
side can branch on; inside a unit terminating in a door, an opaque aggregate with
an accumulated context trail is the cheaper correct shape. The conversion belongs
at the boundary between them.

The subject's own rule made the published-unit obligation mandatory and it had
never said so: `error-handling.md:77` "Classify on structure, never on prose" — a
published unit returning an opaque error forces every consumer to do exactly what
that forbids. Inverts at the top of a terminating binary, where the categories
have one consumer and a closed set earns nothing.

**Catch worth recording:** the source claims structured error enums prevent silent
swallowing because matching forces handling. This subject demolishes that —
"Handled is not routed… The test is not 'does the code respond' but 'does a human
ever learn'." Not landed.
## 2026-09-03 - `/intake` kube-rs (run `intake-kube-0903`, intake 2.3.1, Opus workers)

New technique `parse-failure-keeps-identity` (laws `identity-survives-reuse`, `failure-not-empty-success`, `one-authority-per-vocabulary`): when one malformed item would stop a reader over a collection the reader does not own, the decode failure is scoped to the item and the item's identity is still recovered through a projection that is a subset of the same schema, never a parallel one. Boundaries against `structured-propagation` (sideways in data, not upward) and against gated foreign-format import. Application `rust--parse-failure-keeps-identity` against a control-plane client library@1.89 (its typed deserialize guard).

## 2026-09-03 - intake `intake-chatterino2` (2.3.2)

Amendment in `crash-capture`: the restart decision after a crash lives outside the store
the crash may have corrupted (a flag file or a launcher argument), or a store-caused crash
loops on its own policy. Confirmed structurally against the fleet desktop app, whose crash
discriminator is already a marker file beside the store; no restart policy exists there
yet, so the row is a simulation with the seam named for when one does.
`rust--crash-capture` application.

## 2026-09-04 - `/intake`, cargo-make read for language craft

One technique, from [[../../sources/2026-09-04-cargo-make-rust-craft]].

- **`exit-contract-is-a-taxonomy-projection`** (new). The last hop outward for
  any component whose caller is a shell, a supervisor or a CI step: the exit
  status is a second closed vocabulary over the same failures
  `taxonomy-design` governs, and it is the only consumer that cannot read a
  structured field. The rule is that the code is declared **with** the failure
  kind, so the external contract is a projection rather than a translation - a
  table beside the exit drifts because adding a kind and giving it a code are
  two edits and only the first is required to compile.
- Folded in rather than landed separately: the coverage boundary. The projection
  binds only what the type covers, so one peripheral module returning a boxed
  dynamic error leaves it silently, and the audit is a grep counting fallible
  exit paths that do not return the taxonomy's type.
- The source demonstrates both halves at one commit - a well-built projection
  with a correct narrowing rule at the byte boundary, and one subcommand outside
  it. **Applied to this registry's own scripts lane and shipped**, where exit
  code 3 was carrying three incompatible meanings with no declaration anywhere;
  codes 0/1/2 had held across ~30 scripts and broke at the first code a later
  script added.

## Intake 2026-09-05 (`intake-utopia-0905`, source `github:deeplethe/utopia`)

**Application `rust--structured-propagation`:** a `Terminal` marker type attached as
context by the handler that recognises a permanent failure, found by the queue with
`chain().any(|e| e.is::<Terminal>())` because layers above keep wrapping. A catch on
"category-specific data travels in the value" and "wrap, never replace", at a boundary
the technique's prose does not name: the deciding layer (the queue, in the store crate)
sits *below* the layer that knows the category (the LLM crate) in the dependency graph,
so a typed enum is unreachable and a marker in the shared core crate is the only shape.
One bit only; the fault-line axis and retry-after are not carried.

## 2026-10-14 - intake wc-1014 (storytold/wordcraft)

Landed `containment-boundary-restores-state` (stage between a handled error and crash-capture:
catch at the mutation chokepoint, same error shape, whole-snapshot restore, three doors, net not
licence, targets that abort). Application `rust--containment-boundary-restores-state` against the
source tree (anchors checked). `resilience/` is at the ten-child cap, so panic policy could not be
its own subject there; revisit placement if a second containment technique arrives. Boundary with
crash-capture stated in both directions. Verdict unmeasurable (no panic-injection arm).

### 2026-10-14 - intake rtk-ai/vox (run intake-vox-1014)

Catch, recorded as `applications/rust--containment-boundary-restores-state--vox.md`: a
tool server whose release profile aborts on panic, so its safety is the prevention rule
alone; four agent-reachable panic sites each guarded after a crash with a test named
after it, and no junk-argument sweep over the fourteen tools, which is the technique's
missing half for that tree.

## Architecture review - 2026-10-31

First architecture review of the subject, against `a2473a65c`. Every one of the 23
documents was read in full. Five primary sources were opened. Two mainstream runtimes now
carry a cancellation cause (Web `AbortSignal.reason`, Go `context.Cause`), which refutes the
"causeless by construction" wording in the golden path and in cancellation-attribution,
though not their remedy. The pinned cargo-make source shows that its 404 and 700-band codes
all collapse to exit status 1, which contradicts two paragraphs of the application. The
fleet post-mortem behind the broadcast-arrival amendment was re-read and supports it. No
verification date was refreshed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/error-handling",
  "date": "2026-10-31",
  "baseline": "a2473a65c",
  "digest": "sha256-b2:d811928687fd4faf",
  "disposition": "clarify",
  "coverage": "All 23 current documents decided (golden path, 12 techniques, 10 applications), each read in full. Primary sources opened this run: MDN AbortController.abort, Go context package docs, the Cloudflare 2025-11-18 post-mortem, kube-rs error_boundary.rs at its pinned commit, cargo-make error.rs and completion.rs at their pinned commit. Not evaluated: every private consumer tree, the PostgreSQL mailing-list thread cited in the note, and the unpinned utopia, wordcraft and vox trees. No verification date was refreshed.",
  "counterexamples": [
    "A Web fetch aborted with controller.abort(new SupersededError()) carries its cause to the catcher via signal.reason; a technique that says the platform never reports a cause is wrong for that runtime, though its remedy (write the cause at the canceller) is exactly what happened.",
    "A Go context derived with WithTimeoutCause reports its own cause on deadline, but the CancelFunc it returns does not set one, so an explicit cancel through that function still reads as generic Canceled.",
    "A u16 exit taxonomy whose bands sit at 404 and 700+ satisfies 'declare the code with the kind' and still gives every one of those kinds the same exit status 1 on a one-byte platform.",
    "A config cap of 200 against ~60 in use is correct as a per-request stop category and fleet-fatal when the input is a file regenerated every five minutes and pushed to every machine."
  ],
  "sources": [
    {
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort",
      "result": "Read 2026-10-31. The reason parameter is 'The reason why the operation was aborted, which can be any JavaScript value. If not specified, the reason is set to \"AbortError\" DOMException.' Refutes 'never tells you who cancelled it' as a statement about the platform: a cause slot exists, but it is filled only when the canceller supplies one."
    },
    {
      "url": "https://pkg.go.dev/context",
      "result": "Read 2026-10-31. WithCancelCause and Cause (go1.20): 'Cause returns a non-nil error explaining why c was canceled'; 'Calling cancel with nil sets the cause to Canceled'; with no cause set, Cause 'returns the same value as c.Err()'. WithDeadlineCause/WithTimeoutCause (go1.21) set a cause when the deadline fires, and 'The returned CancelFunc does not set the cause.' Same refutation; supports the technique's remedy (attribution at the canceller), which these APIs are."
    },
    {
      "url": "https://blog.cloudflare.com/18-november-2025-outage/",
      "result": "Read 2026-10-31. 'Currently that limit is set to 200, well above our current use of ~60 features'; the file 'was being generated every five minutes'; 'The larger-than-expected feature file was then propagated to all the machines that make up our network.' Supports taxonomy-design's broadcast-arrival amendment as written."
    },
    {
      "url": "https://github.com/kube-rs/kube/blob/7a4641d4cc2f693b2dee97b9fc15fadb96d7f62e/kube-core/src/error_boundary.rs",
      "result": "Read pinned file (145 lines). Anchors :18, :23, :42-43, :46-47, :51, :61, :82, :98 and the quoted comments match the application. watcher.rs and the example file were not reopened."
    },
    {
      "url": "https://github.com/sagiegurari/cargo-make/blob/95dcc545db8cf08af6fbec524e200e7c80b06027/src/lib/error.rs",
      "result": "Read pinned file. Discriminants are 100-110, NotFound = 404, and 700/709/710/720/730/731. Termination::report passes an ExitCode variant through, else maps any discriminant > u8::MAX to ExitCode::FAILURE after printing it. So 404 and the whole 700 band never reach a caller: they all exit as the generic failure. The application's claims that a caller can branch on the 700 range and that 404 is a recognisable-number payoff are contradicted by the same file it quotes. completion.rs:27 Box<dyn Error> confirmed."
    }
  ],
  "documents": {
    "error-handling.md": {
      "disposition": "clarify",
      "reason": "Two changes owed. (1) The closing 'The techniques' list names 9 of the 12 techniques in the frontmatter: reclassification-is-not-repair, containment-boundary-restores-state and exit-contract-is-a-taxonomy-projection are missing, and the body never points to the last two. Add them to the list and give containment one sentence where crash capture is introduced. (2) 'the platform's cancellation signal is causeless by construction ... carrying no record of which one that was' is refuted for two mainstream runtimes (AbortSignal.reason, Go context.Cause); restate as: the signal carries a cause only when the canceller writes one, the defaults are generic, and the catcher cannot reconstruct it."
    },
    "techniques/taxonomy-design.md": {
      "disposition": "keep",
      "reason": "Closed set, catch-all as an explicit member, three consumer axes, the recoverability axis and its broadcast-arrival amendment hold. The fleet incident behind the amendment was re-read in its primary post-mortem (200-feature cap against ~60 in use, file pushed to every machine)."
    },
    "techniques/reclassification-is-not-repair.md": {
      "disposition": "keep",
      "reason": "The repair fork, the separating question and the four 'when not to use' boundaries (including the already-split taxonomy case measured 3/3) are internally consistent with taxonomy-design's catch-all."
    },
    "techniques/error-doors.md": {
      "disposition": "keep",
      "reason": "Invariant, routing table, trail-record-as-conditional-door, report-once-at-owner, throttles and door-failure rules are coherent and cross-link correctly."
    },
    "techniques/user-facing-mapping.md": {
      "disposition": "keep",
      "reason": "Registry of message plus suggestion, structure-first lookup with a quarantined prose tier, total fallback that reports its own misses, keys not sentences. No unstable claim."
    },
    "techniques/structured-propagation.md": {
      "disposition": "keep",
      "reason": "Typed value, wrap-never-replace, category at birth, stringification as the dominant boundary loss, minted failures carry their category. Loss-is-one-way argument holds."
    },
    "techniques/parse-failure-keeps-identity.md": {
      "disposition": "keep",
      "reason": "Procedure, stability rule for the identity projection, three-clause decision rule and boundaries are consistent; the reference implementation was re-read at its pinned commit and matches."
    },
    "techniques/swallowed-error-prevention.md": {
      "disposition": "keep",
      "reason": "Gate-sees-proxy diagnosis, door-coverage census with stated predicate, cheap routed path, and the inverted marker for lenient components (consistent with taxonomy-design's fourth axis)."
    },
    "techniques/crash-capture.md": {
      "disposition": "keep",
      "reason": "Escape-hook inversion, per-context last-resort handlers, bounded breadcrumbs, allowlist sanitization, persist-then-ship with a named reaper, and restart policy outside the store are coherent; the in-band streaming case is correctly flagged."
    },
    "techniques/cancellation-attribution.md": {
      "disposition": "clarify",
      "reason": "The section 'The runtime's cancellation signal is deliberately causeless' says the platform 'never tells you who cancelled it' and that a composable cancellation 'cannot know'. Web AbortSignal carries a reason (any value, default AbortError DOMException) and Go has context.Cause with WithCancelCause/WithDeadlineCause. The remedy survives and is in fact what those APIs implement: the cause exists only if the canceller writes it, defaults are generic, and a catcher cannot recover it from the shared condition. Restate the mechanism accordingly."
    },
    "techniques/consumer-decides-error-shape.md": {
      "disposition": "keep",
      "reason": "Ownership axis, two shapes, one-way conversion and the compatibility event of extending a published enumeration are sound; the lockstep single-consumer inversion is a good boundary."
    },
    "techniques/containment-boundary-restores-state.md": {
      "disposition": "keep",
      "reason": "Chokepoint with one failure shape, whole-history snapshot, row-state rollback case, three trust-edge doors, the net-is-not-a-licence rules and the abort-target caveat are coherent."
    },
    "techniques/exit-contract-is-a-taxonomy-projection.md": {
      "disposition": "clarify",
      "reason": "The numbering paragraph recommends reserving bands and borrowing well-known codes without saying they must fit the platform's code space, while the narrowing section a few paragraphs later collapses anything that does not fit to the generic value. The rust application shows the consequence: 404 and a 700 band that never reach a caller. Add the fit condition to the numbering advice."
    },
    "applications/react--error-doors.md": {
      "disposition": "reverify",
      "reason": "Census figures (760/2,752, 10.6%, 99.5% vs 58.6%) and line anchors come from a private tree that was not reopened; internally consistent with the swallowed-error technique."
    },
    "applications/next--taxonomy-design.md": {
      "disposition": "clarify",
      "reason": "Owed, not applied. 'The seam' and 'The arms' both describe a template ruleset validated at module scope and quote the same comment verbatim, once as 'inlined into the build' and once as a tree 'whose consumer runs without a build step', so which tree held which seam is unclear. The private trees were not reopened, so the correct attribution cannot be confirmed here. Results (0/32 vs 32/32 over six mutations, the truncated-write diagnostic gap) are internally consistent."
    },
    "applications/rust--taxonomy-design.md": {
      "disposition": "reverify",
      "reason": "Eleven-variant authority, predicate consumers, parity fixtures and the 40/43 Unknown incident (93%) are internally consistent; private tree not reopened."
    },
    "applications/rust--structured-propagation.md": {
      "disposition": "reverify",
      "reason": "Arithmetic holds (30 s + 2 min + 4.5 min = 7 min, quadratic 30*n^2). The public repository was not reopened and no commit is pinned."
    },
    "applications/rust--reclassification-is-not-repair.md": {
      "disposition": "reverify",
      "reason": "Three construction sites and the Unsupported/parse_enum reasoning are consistent with the technique; the source tree and commit e7fcc7c were not reopened."
    },
    "applications/rust--parse-failure-keeps-identity.md": {
      "disposition": "keep",
      "reason": "Pinned error_boundary.rs re-read: every anchor and quoted comment matches, including the unconditional clone and the silent identity-projection failure at :51. watcher.rs and the example were not reopened, so verified_on is not moved."
    },
    "applications/rust--exit-contract-is-a-taxonomy-projection.md": {
      "disposition": "clarify",
      "reason": "Pinned error.rs re-read. The narrowing code is quoted correctly, but the application then claims a caller can branch on the 700-731 range and that NotFound = 404 is a recognisable-number payoff. Every one of those discriminants exceeds u8::MAX, so report() exits them all as ExitCode::FAILURE; only 100-110 reach a shell. The text also omits the ExitCode variant passthrough. Correct the banding and 404 paragraphs."
    },
    "applications/rust--crash-capture.md": {
      "disposition": "reverify",
      "reason": "Structural simulation against a private tree; marker-file anchors not reopened. Its own falsifier (a supervisor that never opens the store) is stated."
    },
    "applications/rust--containment-boundary-restores-state.md": {
      "disposition": "reverify",
      "reason": "Anchors at commit 04f6f53 were not reopened; the experiment arm admits unread report hooks; ab_verdict unmeasurable is honest."
    },
    "applications/rust--containment-boundary-restores-state--vox.md": {
      "disposition": "reverify",
      "reason": "Anchors at commit 96fe9dbc were not reopened. Consistent with the technique's abort-target section."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied four of the five clarify items from the record above, each backed by a primary
source opened this run or by a checked internal inconsistency. The next--taxonomy-design
clarify is still owed: it needs the private trees reopened to say which tree held which
seam. With that item and the reverify applications left, the overall disposition stays
`clarify`.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/error-handling",
  "date": "2026-10-31",
  "baseline": "a2473a65c",
  "digest": "sha256-b2:ab263ebfb27fd9b8",
  "disposition": "clarify",
  "coverage": "All 23 current documents decided. Four clarify items applied (golden path, cancellation-attribution, exit-contract technique, rust exit-contract application) and the edited sections re-read; the other 19 documents are byte-unchanged and keep their dispositions from the record above. Sources are the ones opened for that record. No private tree was reopened and no verification date was refreshed.",
  "counterexamples": [
    "A Web fetch aborted with controller.abort(new SupersededError()) carries its cause to the catcher via signal.reason; a technique that says the platform never reports a cause is wrong for that runtime, though its remedy (write the cause at the canceller) is exactly what happened.",
    "A Go context derived with WithTimeoutCause reports its own cause on deadline, but the CancelFunc it returns does not set one, so an explicit cancel through that function still reads as generic Canceled.",
    "A u16 exit taxonomy whose bands sit at 404 and 700+ satisfies 'declare the code with the kind' and still gives every one of those kinds the same exit status 1 on a one-byte platform.",
    "A config cap of 200 against ~60 in use is correct as a per-request stop category and fleet-fatal when the input is a file regenerated every five minutes and pushed to every machine."
  ],
  "sources": [
    {
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort",
      "result": "Read 2026-10-31. The reason parameter is 'The reason why the operation was aborted, which can be any JavaScript value. If not specified, the reason is set to \"AbortError\" DOMException.' Refutes 'never tells you who cancelled it' as a statement about the platform: a cause slot exists, but it is filled only when the canceller supplies one."
    },
    {
      "url": "https://pkg.go.dev/context",
      "result": "Read 2026-10-31. WithCancelCause and Cause (go1.20): 'Cause returns a non-nil error explaining why c was canceled'; 'Calling cancel with nil sets the cause to Canceled'; with no cause set, Cause 'returns the same value as c.Err()'. WithDeadlineCause/WithTimeoutCause (go1.21) set a cause when the deadline fires, and 'The returned CancelFunc does not set the cause.' Same refutation; supports the technique's remedy (attribution at the canceller), which these APIs are."
    },
    {
      "url": "https://blog.cloudflare.com/18-november-2025-outage/",
      "result": "Read 2026-10-31. 'Currently that limit is set to 200, well above our current use of ~60 features'; the file 'was being generated every five minutes'; 'The larger-than-expected feature file was then propagated to all the machines that make up our network.' Supports taxonomy-design's broadcast-arrival amendment as written."
    },
    {
      "url": "https://github.com/kube-rs/kube/blob/7a4641d4cc2f693b2dee97b9fc15fadb96d7f62e/kube-core/src/error_boundary.rs",
      "result": "Read pinned file (145 lines). Anchors :18, :23, :42-43, :46-47, :51, :61, :82, :98 and the quoted comments match the application. watcher.rs and the example file were not reopened."
    },
    {
      "url": "https://github.com/sagiegurari/cargo-make/blob/95dcc545db8cf08af6fbec524e200e7c80b06027/src/lib/error.rs",
      "result": "Read pinned file. Discriminants are 100-110, NotFound = 404, and 700/709/710/720/730/731. Termination::report passes an ExitCode variant through, else maps any discriminant > u8::MAX to ExitCode::FAILURE after printing it. So 404 and the whole 700 band never reach a caller: they all exit as the generic failure. The application's claims that a caller can branch on the 700 range and that 404 is a recognisable-number payoff are contradicted by the same file it quotes. completion.rs:27 Box<dyn Error> confirmed."
    }
  ],
  "documents": {
    "error-handling.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'The techniques' list now names all 12 techniques (added reclassification-is-not-repair, containment-boundary-restores-state, exit-contract-is-a-taxonomy-projection); the crash-capture section gained one sentence pointing to containment as the tier before it; 'causeless by construction ... carrying no record' became 'causeless by default', noting that some runtimes offer a reason slot that holds a cause only if the canceller wrote one."
    },
    "techniques/taxonomy-design.md": {
      "disposition": "keep",
      "reason": "Closed set, catch-all as an explicit member, three consumer axes, the recoverability axis and its broadcast-arrival amendment hold. The fleet incident behind the amendment was re-read in its primary post-mortem (200-feature cap against ~60 in use, file pushed to every machine)."
    },
    "techniques/reclassification-is-not-repair.md": {
      "disposition": "keep",
      "reason": "The repair fork, the separating question and the four 'when not to use' boundaries (including the already-split taxonomy case measured 3/3) are internally consistent with taxonomy-design's catch-all."
    },
    "techniques/error-doors.md": {
      "disposition": "keep",
      "reason": "Invariant, routing table, trail-record-as-conditional-door, report-once-at-owner, throttles and door-failure rules are coherent and cross-link correctly."
    },
    "techniques/user-facing-mapping.md": {
      "disposition": "keep",
      "reason": "Registry of message plus suggestion, structure-first lookup with a quarantined prose tier, total fallback that reports its own misses, keys not sentences. No unstable claim."
    },
    "techniques/structured-propagation.md": {
      "disposition": "keep",
      "reason": "Typed value, wrap-never-replace, category at birth, stringification as the dominant boundary loss, minted failures carry their category. Loss-is-one-way argument holds."
    },
    "techniques/parse-failure-keeps-identity.md": {
      "disposition": "keep",
      "reason": "Procedure, stability rule for the identity projection, three-clause decision rule and boundaries are consistent; the reference implementation was re-read at its pinned commit and matches."
    },
    "techniques/swallowed-error-prevention.md": {
      "disposition": "keep",
      "reason": "Gate-sees-proxy diagnosis, door-coverage census with stated predicate, cheap routed path, and the inverted marker for lenient components (consistent with taxonomy-design's fourth axis)."
    },
    "techniques/crash-capture.md": {
      "disposition": "keep",
      "reason": "Escape-hook inversion, per-context last-resort handlers, bounded breadcrumbs, allowlist sanitization, persist-then-ship with a named reaper, and restart policy outside the store are coherent; the in-band streaming case is correctly flagged."
    },
    "techniques/cancellation-attribution.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: section retitled 'causeless by default'; 'never tells you who cancelled it' became 'tells you who cancelled it only if the canceller said so', with the optional reason slot (Web abort reason, Go cancellation cause), its generic default and the cancel paths that never set it; the attribution bullet now says the reason is recorded in that slot where one exists. Remedy unchanged."
    },
    "techniques/consumer-decides-error-shape.md": {
      "disposition": "keep",
      "reason": "Ownership axis, two shapes, one-way conversion and the compatibility event of extending a published enumeration are sound; the lockstep single-consumer inversion is a good boundary."
    },
    "techniques/containment-boundary-restores-state.md": {
      "disposition": "keep",
      "reason": "Chokepoint with one failure shape, whole-history snapshot, row-state rollback case, three trust-edge doors, the net-is-not-a-licence rules and the abort-target caveat are coherent."
    },
    "techniques/exit-contract-is-a-taxonomy-projection.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the numbering paragraph now says bands and borrowed codes pay only inside the platform's code space, since the narrowing rule collapses anything outside it to the generic failure."
    },
    "applications/react--error-doors.md": {
      "disposition": "reverify",
      "reason": "Census figures (760/2,752, 10.6%, 99.5% vs 58.6%) and line anchors come from a private tree that was not reopened; internally consistent with the swallowed-error technique."
    },
    "applications/next--taxonomy-design.md": {
      "disposition": "clarify",
      "reason": "Owed, not applied. 'The seam' and 'The arms' both describe a template ruleset validated at module scope and quote the same comment verbatim, once as 'inlined into the build' and once as a tree 'whose consumer runs without a build step', so which tree held which seam is unclear. The private trees were not reopened, so the correct attribution cannot be confirmed here. Results (0/32 vs 32/32 over six mutations, the truncated-write diagnostic gap) are internally consistent."
    },
    "applications/rust--taxonomy-design.md": {
      "disposition": "reverify",
      "reason": "Eleven-variant authority, predicate consumers, parity fixtures and the 40/43 Unknown incident (93%) are internally consistent; private tree not reopened."
    },
    "applications/rust--structured-propagation.md": {
      "disposition": "reverify",
      "reason": "Arithmetic holds (30 s + 2 min + 4.5 min = 7 min, quadratic 30*n^2). The public repository was not reopened and no commit is pinned."
    },
    "applications/rust--reclassification-is-not-repair.md": {
      "disposition": "reverify",
      "reason": "Three construction sites and the Unsupported/parse_enum reasoning are consistent with the technique; the source tree and commit e7fcc7c were not reopened."
    },
    "applications/rust--parse-failure-keeps-identity.md": {
      "disposition": "keep",
      "reason": "Pinned error_boundary.rs re-read: every anchor and quoted comment matches, including the unconditional clone and the silent identity-projection failure at :51. watcher.rs and the example were not reopened, so verified_on is not moved."
    },
    "applications/rust--exit-contract-is-a-taxonomy-projection.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the banding paragraph now says only 100-110 fit an exit status and that 404 and the 700 block all exit as the generic failure; the ExitCode(=710) passthrough is named; the narrowing and closing paragraphs say 404 exits as 1. verified_on not moved: the 94-site count, README and CI claims were not re-checked."
    },
    "applications/rust--crash-capture.md": {
      "disposition": "reverify",
      "reason": "Structural simulation against a private tree; marker-file anchors not reopened. Its own falsifier (a supervisor that never opens the store) is stated."
    },
    "applications/rust--containment-boundary-restores-state.md": {
      "disposition": "reverify",
      "reason": "Anchors at commit 04f6f53 were not reopened; the experiment arm admits unread report hooks; ab_verdict unmeasurable is honest."
    },
    "applications/rust--containment-boundary-restores-state--vox.md": {
      "disposition": "reverify",
      "reason": "Anchors at commit 96fe9dbc were not reopened. Consistent with the technique's abort-target section."
    }
  }
}
```
