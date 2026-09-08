---
layer: golden-path
type: golden-path
subject: docs-sync
status: forged
techniques:
  - source-doc-mapping
  - same-change-enforcement
  - coupled-surface-inventory
  - dated-corrections
  - doc-rot-detection
  - catch-up-markers
  - cross-repo-drift-detection
  - source-as-data-without-the-app
  - checked-vs-skipped-denominators
  - earned-verification-state
  - repair-rides-the-open-page
  - rendered-surface-coupling
  - negative-claims-are-pinned
  - prose-as-an-execution-surface
  - translations-drift-against-the-product
---

# Docs-as-code synchronization

Documentation is a standing claim about a system that keeps changing, and every
change to the system silently re-litigates every claim ever written about it.
The build does not go red when a guide describes a tab that was renamed, a
setup step that was automated away, or an architecture line that stopped being
true two quarters ago — documentation drift is the defect class with **no
crash, no failing test, and no complaining user in the loop**, because the
reader who is misled rarely knows it and almost never files a report.
Docs-as-code synchronization is the discipline that treats documentation as a
coupled artifact of the source: the coupling is **declared as data**, the debt
is **collected at the change boundary** rather than by periodic campaign, the
prose is **corrected in place with dates and measurements**, the rot that
slips through is **detected by scan**, and the batch repair that then becomes
necessary anyway is **bounded by a marker**. Two of the walls hold wherever a
corpus is maintained faster than a person can reread it: the document's own
freshness claim must be **earned by a completed recheck**, and the repair
itself **rides whatever page is already open**. Three more hold only
once the described system stops sitting in the same tree as the prose: the
coupling is then **queried across a repository boundary**, the checker must
read the application's declarations **without the application's build**, and
every number the report prints **carries what it could not check**.

One law towers over this subject, inherited from the gate doctrine and paid
for here in full: **a sync gate must observe the change it gates.** This
subject carries the most instructive counter-example in the graph. A
per-change reminder hook — designed, wired, documented, complete with a
dismissal protocol its instruction file described as "the explicit trade-off"
— was measured by replaying one hundred real agent-session transcripts:
**477 turns edited files, 2,367 individual file edits, and the hook's input
walk saw zero of them — 0.00%, across fifteen months of operation.** Its
backward walk stopped at the first event shaped like a user message, and a
tool result is recorded in exactly that shape (93.0% of all such events), so
in any turn that used a tool the walk terminated before reaching a single
edit. Invoked directly on twelve real transcripts holding up to 209 edits
each: exit 0, twelve of twelve. Every dismissal anyone remembered making was
a dismissal of a message that was never sent, and the enforcement the
project's own instructions described was, the whole time, **documentation
cosplaying as enforcement**. The same repository also holds the discipline's
best practice — a correction culture where false claims are amended in place
with the date, the measurement, and sometimes a correction of the correction
— which is why this subject can show both edges of the blade from one tree.

## Where this subject's walls sit

The subject owns the *coupling* between source and every prose surface that
describes it, and the machinery that keeps the coupling honest. It does not
own general gate mechanics — instrument assertion, seeded failures, hook house
rules belong to [quality-gates](../../standards-and-gates/quality-gates/quality-gates.md), and this
subject is that doctrine's sharpest applied case rather than a restatement of
it. It does not own scanning pipelines — sensors, finding lifecycles, and
triage economics are [codebase-scanning](../codebase-scanning/codebase-scanning.md);
this subject contributes the docs-specific sensor and its verdict vocabulary.
It does not own what a tour step contains
([guided-tours](../../../ui-surfaces/shell-and-navigation/guided-tours/guided-tours.md)), what a translation catalog
demands ([i18n](../../../client-architecture/i18n/i18n.md)), or how a changelog rides a release
([release-pipeline](../../build-and-release/release-pipeline/release-pipeline.md)) — it owns the
fact that each of those is a *coupled surface* a source change can owe.

One neighbour sits close enough to need its seam stated in a sentence rather
than a list. [docs-content-model](../../../ui-surfaces/published-surfaces/docs-content-model/docs-content-model.md)
owns documentation modelled as a typed catalog: what a topic record is, the
referential invariants that hold inside one corpus, the projections derived
from it, and the *shape* of the honest-metadata fields a record carries —
including the review date, the checked-against version and the declared watch
set that this subject's cross-boundary detector consumes. **A field on a
record is a content-model decision; a query over it is a stewardship one.**
That subject decides the field exists, what it is typed as, and what its
absence is declared to mean; this subject decides what asks it a question,
what that question costs, and how the answer is reported when it could not be
asked at all.

## The fifteen load-bearing walls

### 1. The coupling is data, not lore

Which documents a change owes is a fact about the system, and facts about the
system live in declared, machine-readable artifacts — one map, entries of
"these source areas couple to these prose targets," extended in the same
change that adds a feature area. A map nobody has to remember is the only
kind that survives staff turnover and agent-driven development. But a
declared map has a failure mode as quiet as the drift it exists to catch:
**the map is the real gate, and whatever it omits is invisible by
construction.** Measured here: a third of the source tree — 1,421 of 4,304
files, including the entire shared-component library and the entire data
layer — matched no entry at all, while the one live checker in the surface
validated only that every path the map *named* resolved. Gate the map's
*coverage*, not just its membership; prefer *deriving* the coupling from
convention where one holds, because a derived coupling cannot be a third
incomplete and repairs itself under the renames that shred a declared one
(318 boundary-crossing renames in one window; 51 of them stripped a
document's coverage entirely). The full discipline is
[source-doc-mapping](./techniques/source-doc-mapping.md).

### 2. The debt is collected at the change boundary

Drift compounds per change, and the only party who reliably knows whether a
change was user-visible is the one who just made it — so the enforcement
point is the change itself, not a weekly cron that arrives after context has
evaporated. But per-change enforcement is only worth its noise if the
enforcement can *see* the change: read it from the version-control record,
which knows renames, deletions, and both sides of a move — never from a
conversation transcript, which knows only destinations, and only if a fragile
turn-boundary heuristic holds. Satisfy on the *named* target, not a directory
prefix (measured here: 54.3% of prefix-shaped satisfactions were the wrong
document). Give the advisory nag its dismissal sentence — "internal-only, no
doc update needed" is a legitimate verdict — but record dismissals somewhere
they can be counted, because an unrecorded dismissal rate cannot be improved,
argued about, or even known. The never-fired autopsy, the fixture lesson, and
the sound design are [same-change-enforcement](./techniques/same-change-enforcement.md).

### 3. A user-visible change owes every coupled surface at once

A product change rarely touches one document. The reference doc, the
onboarding tour that walks the changed flow, the marketing guide that
explains it to prospects, the mode tags that control where it appears — each
is a surface the change owes, and each rots independently if the obligation
is settled surface by surface across sessions. Enumerate the surfaces per
feature in the same map, check each independently, and name each miss
specifically. Draw the enforcement boundary honestly: a surface in a sibling
repository whose check is satisfied by "any file under a sibling checkout"
has made its verdict a function of one machine's directory layout —
cross-repo coupling is a **report**, never a gate. The inventory and its
boundary discipline are
[coupled-surface-inventory](./techniques/coupled-surface-inventory.md).

### 4. A correction is an event, with a date and a measurement

When a documented claim turns out false, the amateur move is to silently
rewrite it — which repairs the sentence and destroys the record, leaving
every downstream copy of the false claim uncorrectable and every reader
unable to date anything else on the page. The practiced move keeps the false
claim visible, states the date, states the measured truth, and names the
instrument that earned it: *"corrected [date]: this line said X; measured,
the value is Y, by method Z."* Corrections themselves rot — the exemplar repo
contains a correction whose own grep was truncated by its display limit and
had to be corrected again, and a resolved-warning paragraph that outlived the
defect it named by four days — so corrections carry verification dates, and
any number that travels carries its predicate or it will be reused for a
claim it does not support (a stale warning count, wrong by 9×, was cited by
five downstream documents as load-bearing rationale). The craft is
[dated-corrections](./techniques/dated-corrections.md).

### 5. Rot is detected, never assumed absent

Whatever the gates catch, some drift ships — dismissed nags, unmapped areas,
imported backlogs, dead hooks. So the surface is scanned: for each document,
discover its coupled sources (the declared map first, colocation convention
second), and judge freshness. The one verdict that separates an honest
scanner from a flattering one: **a document whose coupling cannot be
discovered is *unverifiable*, not clean.** Folding the unverifiable into the
fresh — the tempting default, since both produce no finding — silently
converts the scanner's blind spot into a health claim; the exemplar
implementation's own comment calls rendering them clean "this detector's
biggest lie." Verdict vocabulary, staleness signals beyond timestamps, and
the division of labor with the scanning subject are
[doc-rot-detection](./techniques/doc-rot-detection.md).

### 6. Catch-up is bounded and marked

Batch repair is not a rival strategy to per-change enforcement; it is the
recovery lane every per-change system eventually needs. What separates a
bounded repair from an unbounded rewrite is a **marker**: a small recorded
artifact naming the commit and date of the last full pass, what it covered,
and — first-class, not a footnote — what it consciously skipped. The next
pass reads the marker and scans exactly the range since. And the marker
records *what was done*, never what is hoped: the exemplar marker's note
declared "the hook now prevents this kind of drift per-session; bulk rewrites
should not be needed again" — written the same day the never-fired hook
landed, a hope recorded as a fact, poisoning the very range decision the
marker exists to inform. The artifact and its honesty rules are
[catch-up-markers](./techniques/catch-up-markers.md).

### 7. Across a repository boundary, the coupling is a query

The first six walls all assume one tree, where a single walk reaches the
prose and the source it describes. When the documentation ships from one
repository and the system it documents ships from another, every one of them
degrades to nothing without announcing it: the local history is no evidence,
because the prose can sit untouched for a year while the thing it describes is
rewritten twice. What replaces them is a declaration and a query — each
document names the source areas it makes claims about and the date a human
last reviewed it against them, and the detector asks the *other* repository's
history what changed under those areas since. Two mechanics decide whether it
survives contact. The watch granularity is a **signal-to-noise** choice, not a
precision one: name individual files and the flag fires on every typo until
nobody bumps a review date again; name the whole repository and everything is
always flagged, which carries the same information as flagging nothing. And
the query is cached per distinct **(watch set, review date)** pair rather than
per document, because documents cluster hard onto shared areas and shared
review sittings — a check too slow to run is a check that gets moved to a
nightly job and then forgotten. Note the direction, which is what makes this
gateable at all where the surface-inventory's cross-repo obligation is not:
the evidence is remote but the artifact that must change is local.
[cross-repo-drift-detection](./techniques/cross-repo-drift-detection.md).

### 8. The gate reads the source as data, not through the build

Once documentation is typed records inside an application rather than files on
disk, a checker over it needs the application's own declarations — and must
not obtain them by importing the application, or it inherits the bundler, the
aliases, the environment read at module scope, and every transitive import the
registry happens to pull. Such a gate is **unavailable exactly when the build
is broken**, which is the only moment anyone urgently wants its answer. Two
doors avoid that, with opposite failure modes: pattern-scraping the source is
cheap, dependency-free and survives anything — and is **silently partial**,
matching the entries shaped as the pattern expects and skipping the rest
without a sound; transpiling the file and evaluating it in a sandbox **with
module resolution refused** is exact and fails loudly, the refusal being the
design rather than a limitation — the day the data module grows an import, the
gate stops at the line that reached outside and says so. The trap that decides
which to trust for a completeness claim: **a partial scrape reports success
over the fraction it managed to parse**, and the floor most implementations
write against it — "at least one record" — cannot tell twelve from a hundred.
[source-as-data-without-the-app](./techniques/source-as-data-without-the-app.md).

### 9. Every number carries what could not be checked

A drift report saying *zero drifted* on a machine without the other repository
is true and worthless, and it is worth separating from the empty-success law
it obviously belongs to, because the usual remedy does not reach it. The
ordinary shape of that law is a broken instrument — something to catch. Here
**nothing breaks**: working code takes a branch its author correctly
anticipated, returns an empty list because there was genuinely nothing to
query, and the lie is manufactured one level up where that empty list is summed
with the genuinely clean ones. So the fix is not error handling but
**arithmetic**: three states per unit rather than two, skips carrying a reason
class rather than a single conflated count, a headline formatted as a fraction
with the skipped figure printed even at zero, and an exit code that follows the
denominator so a run that checked nothing is not green in the same way as a run
that checked everything. And each signal states, next to itself, whether it can
fail a build — because from outside, an enforced number and a decorative one
look identical, which is how belief in enforcement outlives the enforcement.
[checked-vs-skipped-denominators](./techniques/checked-vs-skipped-denominators.md).

### 10. The document's own freshness claim is earned, or it blinds the detector

Eight walls govern what an *instrument* may claim. The document also makes a
claim — its review date, its checked-against version — and wall 7's detector
consumes exactly that field to decide which window of the other repository's
history to ask about. A date advanced by a run that verified nothing therefore
does more than mislead a reader: it moves the detector's horizon past the
changes it existed to find, and the detector goes on reporting clean because it
is now asking about a window in which nothing happened. So the stamp advances
only on a **completed recheck over a non-empty population** — never on a clean
preflight, never on an empty coupling, never on an interrupted run. The
corollary is the state the vocabulary lacks: staleness is written **onto the
artifact** and is durable there, because a finding in a scan stream has a
*dismiss* transition and a document that has been in dispute for a year reads
exactly as current as one nobody questioned. And *stale* is suspended belief
with three resolutions, not a synonym for wrong — reaffirm, correct, retract —
of which reaffirming a claim whose evidence merely moved is the common case and
must stay cheap.
[earned-verification-state](./techniques/earned-verification-state.md).

### 11. Repair rides the page that is already open

Walls 2 and 6 name two collectors, both triggered from outside the document: a
diff, or a campaign. A third one decides whether claim-level freshness is
affordable at all — the document being **open**. A worker that opened a page to
document something else resolves that page's outstanding staleness on the way
past, while the context it needs is already loaded, and total maintenance cost
then scales with how much the source changed rather than with how large the
corpus grew. Two conditions make it work and one limitation is permanent.
Detection stays exhaustive while only *resolution* is opportunistic — sampling
the detection instead leaves the stale population unknown, which is the one
thing this design cannot tolerate. The deterministic walk runs **before** the
no-op short-circuit, because *no source changed since the last run* and *every
claim is still bound to live evidence* are different questions, and the claims
an earlier run deliberately deferred belong to no subsequent diff. And it never
converges on cold pages: a document nobody opens is detected stale on every run
and repaired on none, so the batch lane stays the backstop and the cold set
belongs in the marker's consciously-skipped list, where a permanent hole becomes
a scoped debt.
[repair-rides-the-open-page](./techniques/repair-rides-the-open-page.md).

### 12. A figure is a coupled surface nobody can read

Every wall above assumes the artifact can be inspected. A document's pictures
cannot be, and they are derived artifacts with the same standing claim as the
prose beside them. Two existing disciplines each disqualify a rendered surface
for a different reason, which is how it comes to sit in a gap both owners
correctly disclaim: the regeneration diff needs byte-stable output and
rasterization is not byte-stable, so that gate goes red on a toolchain upgrade
that changed nothing visible and is switched off within the month; and the rot
scan resolves coupling by reading, so a figure terminates at the ladder's third
rung and is `unverifiable` permanently rather than occasionally. The
resolution inverts the comparison — digest the **inputs** (the source document,
the parameters that selected this rendering, the renderer's identity), never the
output bytes — and the population must be reported rather than dropped, because
a sweep that counts documents while omitting their figures is publishing the
wrong denominator. The characteristic failure is not an absent obligation but an
obligation filed where nothing executes it: a review-template checkbox asking
the author to re-render, which states the coupling correctly and observes
nothing.
[rendered-surface-coupling](./techniques/rendered-surface-coupling.md).

### 13. Some claims have no source area, and are pinned rather than coupled

Twelve walls discover the source a document is *about* and judge the prose
against it. All twelve presuppose a stage that is free in the ordinary case and
impossible in one class: **the claim must have a source area at all.** A
document that promises the system does *not* do something — never signs the
user in, never executes the platform's own status call, never injects an
imported session into the browser — has as its truth-maker the fact that **no
code exists**. Nothing can be coupled to it, so wall 5 correctly returns
`unverifiable` and will return it on every scan forever, which is the second
member of the permanent-unverifiable category wall 12 found for figures — and
the resolutions are opposites, because a figure has inputs to digest and a
promise has none. Such claims rot two ways, neither of them a source change:
somebody builds the thing, and no map entry could have pointed at a capability
that did not exist; or somebody deletes the sentence in a rewrite or a
translation, because a negative claim reads as boilerplate to every editor who
did not pay for it. So the mechanism inverts — assert the **wording**, in the
test suite, across the named set of documents where a reader is about to act,
with a forbidden-substring dual for the phrasings the promise rules out. Three
things decide whether it holds: the document scope is the finding and belongs
written down, the forbidden set is a floor extended on every escape, and the
pin verifies only that the promise is still *stated* — a pinned false promise
is worse than an unpinned one, so its admission ticket is a dated human review
whose wording it then preserves.
[negative-claims-are-pinned](./techniques/negative-claims-are-pinned.md).

### 14. A document is also a thing people run

Every wall so far treats prose as a claim that can be true or false. Prose is
also **instructions**, and an instruction is not evaluated, it is executed — on
the reader's machine, with the reader's credentials, once, with no later
paragraph able to undo it. Two populations are cheap to gate and belong to
security rather than accuracy: guidance that shows a credential as a positional
argument, which teaches every reader who follows it to spend that secret into
the process table and the shell history before the tool's own refusal can fire;
and an install line naming a public index entry the project does not own, where
the obvious command — written from muscle memory, in any translated landing
page — delivers a stranger's code under the project's own words. The scoping
error is the instructive part, and it is the target-versus-proxy law with an
unusually tempting proxy: the target is *text a reader will act on*, and what
gets checked is *files with a documentation extension*. The setup line a
program prints to standard error when an optional dependency is missing is
documentation by every property that matters, and it reaches the one user who
never opened a page at all.
[prose-as-an-execution-surface](./techniques/prose-as-an-execution-surface.md).

### 15. A translated page drifts against the product, not only against its source

Wall 3 lists the translated page among the surfaces a change owes and hands the
rest to the localization discipline, whose mature answer pins each translated
unit to the content hash of the source revision it was derived from. That is
the right question and it has an independent blind spot this subject must
state, because a corpus can be perfectly clean under it and wrong anyway.
**Staleness relative to a stale source is zero:** when a capability is retired
and nobody updates the primary-language page, every hash still matches and
every locale is reported current, faithfully derived from a document that is
now false. And a page authored *directly* in a target language — the
contribution every long-lived project accumulates — has no source unit, so no
pin, so it sits outside the measured population entirely while the completeness
board stays green. The corrective is a second detector with a different anchor:
assert each localized page against **the shipped capability set read from the
code**, never against its primary-language sibling. It is coarse on purpose and
buys exactly one thing — no page advertises a capability that does not exist —
which must be said next to the signal or the green will be read as the larger
claim. The tell that a project learned this rather than adopted it is that the
assertion set **differs per page**, and the asymmetry is the only written record
of which pages were authored independently.
[translations-drift-against-the-product](./techniques/translations-drift-against-the-product.md).

## The economics: why per-change wins, and what it costs

Per-change enforcement buys the cheapest possible repair — the author still
holds the context, the diff is small, the coupled edit is minutes — at the
price of a nag on many changes and a dismissal ritual on the internal-only
ones. Batch catch-up buys silence between passes at the price of repairs made
without context, at campaign cost, against a range that grew while nobody
watched (the exemplar's one full catch-up rewrote 84 topics in a single
sitting). Opportunistic repair buys the cheapest repair of all — the page is
already open and the context already loaded — at the price of a tail it
structurally cannot reach. The mature system runs all three: per-change as the
primary collector, opportunistic repair riding whatever work is already in
flight, batch as the recovery lane for what neither caught, and the marker as
the ledger between them. What the
economics do not tolerate is the fourth posture this subject's counter-example
manufactured by accident: the *belief* in per-change enforcement with no
live mechanism behind it — all of the nag design's reputation cost was paid
in documentation, and none of its drift prevention was ever delivered, for
fifteen months, invisibly.

## What this subject deliberately excludes

- **Gate mechanics in general.** Liveness, seeded failures, exit-code
  discipline, hook hygiene: [quality-gates](../../standards-and-gates/quality-gates/quality-gates.md).
  This subject applies them to one artifact class and contributes the
  measured proof of what their absence costs.
- **Scanning machinery.** Sensor isolation, finding lifecycle, triage:
  [codebase-scanning](../codebase-scanning/codebase-scanning.md). The doc-rot
  sensor plugs into that pipeline; its verdict vocabulary lives here.
- **The content of the coupled surfaces.** Tour step design is
  [guided-tours](../../../ui-surfaces/shell-and-navigation/guided-tours/guided-tours.md); translation completeness is
  [i18n](../../../client-architecture/i18n/i18n.md); changelog and release notes ride
  [release-pipeline](../../build-and-release/release-pipeline/release-pipeline.md). This subject
  owns only the obligation that links them to a source change.
- **Generated reference documentation.** API docs emitted from source are a
  [codegen](../../build-and-release/codegen/codegen.md) concern — a derived artifact with a
  regeneration path, not a hand-written claim that drifts. This subject
  governs the prose a generator cannot write.

## The techniques

- [source-doc-mapping](./techniques/source-doc-mapping.md) — the coupling as a
  declared, coverage-gated artifact; derivation over declaration; rename
  resilience; the map that travelled without its machine.
- [same-change-enforcement](./techniques/same-change-enforcement.md) — the
  change boundary as collection point; read the diff, not the transcript;
  satisfy on the named target; recorded dismissals; the never-fired autopsy.
- [coupled-surface-inventory](./techniques/coupled-surface-inventory.md) —
  reference docs, tours, marketing, mode tags as enumerated obligations;
  independent checks with specific misses; cross-repo surfaces as reports.
- [dated-corrections](./techniques/dated-corrections.md) — corrections in
  place with date, measurement, and instrument; corrections of corrections;
  expiring resolved-markers; counts that carry predicates.
- [doc-rot-detection](./techniques/doc-rot-detection.md) — freshness scanning
  with *unverifiable* as a first-class verdict; staleness signals beyond
  timestamps; bounded budgets and stable truncation.
- [catch-up-markers](./techniques/catch-up-markers.md) — the last-full-pass
  marker: range, coverage, honest gaps; recording what was done, never what
  is hoped.
- [cross-repo-drift-detection](./techniques/cross-repo-drift-detection.md) —
  the declared watch set and review date; querying the other repository's
  history; granularity as signal-to-noise; one query per distinct pair.
- [source-as-data-without-the-app](./techniques/source-as-data-without-the-app.md)
  — reading the application's registries without its build; scrape versus
  sandboxed evaluation; refused resolution; the partial parse that passes.
- [checked-vs-skipped-denominators](./techniques/checked-vs-skipped-denominators.md)
  — checked, skipped and drifted as three states; reason classes; fractions
  on the headline; labelling which signals can fail.
- [earned-verification-state](./techniques/earned-verification-state.md) — the
  stamp earned by a completed recheck; durable uncertainty on the artifact;
  stale as suspended belief with three resolutions; binding at the proposition.
- [repair-rides-the-open-page](./techniques/repair-rides-the-open-page.md) —
  the third collector; exhaustive detection with opportunistic resolution; the
  walk before the no-op; the cold tail that only the batch lane reaches.
- [negative-claims-are-pinned](./techniques/negative-claims-are-pinned.md) —
  the claim whose truth-maker is that no code exists; the permanent
  unverifiable and why its resolution inverts; wording pinned across a named
  document set with a forbidden dual; the pin that proves statement, not truth.
- [prose-as-an-execution-surface](./techniques/prose-as-an-execution-surface.md)
  — documents as instructions people run; the positional secret and the
  unowned index name; the population as text a reader acts on, including what
  the program prints.
- [translations-drift-against-the-product](./techniques/translations-drift-against-the-product.md)
  — the second anchor; staleness relative to a stale source; the page nobody
  derived; per-page assertion scope as the durable record.
