# Cross-cutting laws

Thirteen convergences, nine measured ≥3 independent times during the 2026 composition
campaign and reclassified by `knowledge-hierarchy-plan.md` (`docs/concepts/knowledge-hierarchy-plan.md`)
§2 from Golden-Path candidates to **laws that Techniques cite**; the tenth through
twelfth each earned their place from four sightings in the external-reconcile lane
(librarian runs 2026-08-22); the thirteenth from five independent sightings across
the 2026-08 intake series (two measured trajectory corpora, a system-failure
taxonomy, a skills field study, and first-party practitioner judgment, none derived
from another — librarian source notes 2026-08-25). They are not subjects —
no folder, no techniques of their own. Cite them from a Technique's `laws:` frontmatter
by anchor id. The doctrine's transferable sections migrate here in the closing pass;
until then each law carries its one-paragraph statement.

## <a id="one-authority-per-vocabulary"></a> one-authority-per-vocabulary

Every closed vocabulary (status sets, category enums, mode strings) has exactly one
authoritative definition, and every consumer derives from it. Two hand-maintained copies
of one vocabulary are not redundancy — they are a race with a delay fuse; the copies
drift precisely when someone extends the vocabulary and finds only one of them.

## <a id="gate-sees-target"></a> gate-sees-target

A gate must observe the thing it gates. A check that runs over a proxy (a build log, a
staged subset, a stale index) passes exactly when the proxy diverges from the target —
which is the moment the gate existed for. Before trusting any green result, ask what the
check actually read.

## <a id="failure-not-empty-success"></a> failure-not-empty-success

Failure must be spelled differently from empty success. A scanner that finds nothing and
a scanner that could not run must produce distinguishable outputs; exit 0 with zero
findings is the most expensive lie in automation. Assert the instrument before reporting
the result.

## <a id="identity-survives-reuse"></a> identity-survives-reuse

An entity's identity must survive reordering, reuse, and restart. Index-based keys,
timestamps-as-ids, and name-equality all break under the operations lists actually
undergo (insert, resort, duplicate, resume). Mint identity once, at creation, and carry
it.

## <a id="derivation-names-recomputation"></a> derivation-names-recomputation

Any stored derived value names how it is recomputed. A cached count, a denormalized
rollup, or a materialized summary without a documented, invokable recomputation path is
a future discrepancy with no arbiter.

## <a id="one-validation-door"></a> one-validation-door

Each mutable store has one validation door, and the writers are enumerable. Validation
sprinkled across N call sites is validation minus the site added next quarter; the fix
is structural (one door all writers pass through), not disciplinary (remembering to
validate).

## <a id="count-carries-predicate"></a> count-carries-predicate

A count is meaningless without its predicate. "182 files" is not a finding; "182 files
matching X, measured by Y, cross-checked by Z" is. Any number that travels (into a doc,
a dashboard, a commit message) carries what was counted and how, or it will be reused
for a claim it does not support.

## <a id="deletion-is-not-repair"></a> deletion-is-not-repair

Removing the artifact that exposes a defect is not fixing the defect. Deleting a flaky
test, silencing a warning class, or dropping a failing gate converts a visible problem
into an invisible one at the exact site where visibility existed.

## <a id="creation-names-reaper"></a> creation-names-reaper

Everything created names its reaper. Temp files, background tasks, listeners, worktrees,
caches: the code that creates a resource states what destroys it and when. Unowned
cleanup is deferred leakage — the question "who deletes this?" must have an answer at
creation time, because nobody re-asks it later.

## <a id="verdict-survives-boundary"></a> verdict-survives-boundary

A classified outcome reaches every boundary that acts on it as a typed value. A refusal
enum erased into a generic error, a server-side failure taxonomy re-derived by matching
message text, a policy denial re-thrown as the last underlying failure — in each, the
classification exists where it was computed and dies where it mattered. The test is what
the outermost consumer can branch on; a verdict that survives only as prose has not
survived.

## <a id="absent-guard-is-loud"></a> absent-guard-is-loud

An optional guard is an absent guard. A check that must be configured, mounted, or
switched on protects the examples and not the installations — a deployed fleet converges
on the default, and the default is off. Either the guard engages on its own, or its
absence is loud: a logged, visible, deliberate choice. A system that degrades to
unguarded because a config row is missing, a validator was not attached, or a strict
mode was not requested has made its most important decision silently — and the vendor
that ships the safe mode without self-enabling it has signed the same waiver.

## <a id="unknown-is-not-a-value"></a> unknown-is-not-a-value

Unknown must never render as a definite value. A nil zero-filled into "offline", an
absent ledger read as "never migrated", an unset sentinel that collides with the
strictest legitimate setting, a lost outcome published as a synthetic exit code — each
converts "we do not know" into a confident claim exactly where confidence misleads
most, and the laundering point is always a boundary where an optional type meets a
non-optional one. Sibling of failure-not-empty-success, and distinct: that law
separates failure from empty success; this one separates unknown from every definite
value, including zero.

## <a id="silent-state-is-ungoverned"></a> silent-state-is-ungoverned

An agent's internal state — its assumptions, its uncertainty, its belief that it has
finished — shapes the outcome whether or not anyone can see it, and it can be
governed only once it is converted into an artifact something else can read: an
assumption stated before it is built on, alternatives presented instead of one
silently chosen, a completion claim checked against what actually landed. The
failure signature is uniform across every corpus that has measured it: the agent is
wrong at the same confidence as when it is right, the decisive error precedes its
first observable signal by most of the trajectory, and unverified completion claims
concentrate exactly where recovery is no longer possible. Rules, gates and reviews
bind only surfaced state; whatever remains internal is outside their reach by
construction. Sibling of unknown-is-not-a-value, one level up: that law forbids
rendering unknown as definite in *data*; this one demands the conversion of private
epistemic state into inspectable output before anything downstream relies on it.
