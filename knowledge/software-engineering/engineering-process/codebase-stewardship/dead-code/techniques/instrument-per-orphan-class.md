---
layer: technique
type: technique
subject: dead-code
technique: instrument-per-orphan-class
status: forged
laws:
  - gate-sees-target
  - count-carries-predicate
  - failure-not-empty-success
use_when: [choosing which instrument sees which absence, deciding whether a mention counts as a use, one tool reports green so the rest feel handled]
---

# One instrument per orphan class

The question "is this code dead?" has no single answer procedure, because "dead"
means a different absence for each artifact class — unimported, unreachable,
uninvoked, unregenerated, unread, unadopted — and each absence is visible to a
different instrument. A repo that installs one dead-code tool and considers the
problem handled has covered one class and granted the others an alibi: the tool runs,
reports little, and the green output is read as "no dead code" when it means "no dead
code *of the one kind this instrument can see*"
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).

## The elimination-facing class taxonomy

The detection technique's four kinds (unused exports, orphan modules, unreferenced
cross-boundary registrations, orphaned generated artifacts) are where the taxonomy
starts, not where it ends. Elimination work keeps meeting classes that pass every
reference-shaped check while being fully dead:

- **Dead catalog keys** — entries in a translation catalog, an error registry, a
  token map, that no consuming code references. The catalog is loaded wholesale, so
  nothing fails; the key just rides along, multiplied by every locale or mirror that
  must carry it.
- **Zero-render components** — declared, exported, even *catalogued* in the shared
  component index, with zero render call sites. Documentation citing a component
  keeps it alive to any mention-counting instrument while it renders nowhere.
- **Zero-adopter primitives** — a hook, utility, or pattern shipped as "the
  standard" that nothing adopted. This is the most camouflaged class: it has tests,
  documentation, and a name people recognize — a standard with no witness.
- **Dead knobs** — configuration fields that parse, validate, persist, and are read
  by no behavior. The schema keeps them alive; the settings surface renders them;
  users set them; nothing branches. A dead knob is worse than dead code because it
  is a *live lie to the user*.
- **Unexercised verifiers** — proof scripts, hand-run checks, verification
  lanes whose only trigger is a human habit that lapsed. The class inverts the
  usual carrying cost: other dead code merely rides along, but a dead check
  *reads as coverage* — its existence is cited as safety while it silently
  rots against the surface it once verified. No reference-shaped instrument
  sees it, because it references plenty; the instrument that does is an
  execution record (when did this last run, and did anyone look). The
  observed base rate is brutal — one public tree found four of its six
  hand-run proof scripts had rotted unnoticed, and deleted all six on the
  spot with the note that the automated suite was the only form worth
  keeping. That is the repair rule: a verifier is either wired into a lane
  something actually runs, or it is deleted; a check that runs on memory and
  goodwill is already dead, just not yet wrong.
- **Published names** — the one class where the instrument's error runs the
  other way. Every instrument above is blind toward *alive*: it certifies a
  corpse as living. A reference scan over a repository whose exports have
  consumers outside it is blind toward *dead*: the universe it counts
  references in is the tree, and the name's audience is not. An exported
  symbol with zero in-tree callers and an unknown number of out-of-tree ones
  reads as the cleanest dead export on the list, and its deletion is a
  breaking change nobody's test can see, because the callers that break are in
  trees the suite never runs. The measured instance is a large agent-driven
  structural pass over an open-source agent runtime: workers removed public
  names that had no callers inside the repository, external plugins imported
  them, and the removals survived the full test suite to be caught only in
  human review. The class has no census — the consumer inventory does not
  exist — so its instrument is a **declared surface** (an export manifest, a
  documented plugin interface, a versioned public module list) and a removal
  gate that *flags* a name leaving that surface for review, never deletes it.
  Where a consumer is in a tree you hold — a second language on the far side
  of a wire, a test driver that invokes by name — it is the cross-boundary
  registration class instead, and the joining instrument applies; the
  published-names class is exactly the remainder, the callers no join can
  reach. Note the precondition: a private application with no published
  surface has no members of this class, and treating every export as
  published there would grant the false-alive classes above a new alibi.

## The blindness matrix

Each instrument family sees some classes and is structurally blind to others:

- **Reference counting** ("is this name mentioned anywhere?") catches unused exports
  and nothing deeper. Its signature failure is the shadow-declaration defeat the
  shared detection technique dissects: dead code references other dead code, so
  refcounts certify dead islands as alive. The measured emblem — a CI-enforced
  refcount guard over generated artifacts that *protected* twenty-six of
  twenty-nine orphans because dead consumers still imported them — is what a
  refcount instrument does at its best: it gates, and the gate does not see its
  target ([gate-sees-target](../../../../_laws.md#gate-sees-target)).
- **Reachability walking** (transitive closure from declared entry points) catches
  orphan modules and dead islands whole. Its blindness: everything on the far side
  of a serialization or generation boundary, and everything summoned dynamically.
  Its two roster rules: entry points are an owned vocabulary, and **tests are not
  entries** — a module kept alive only by its own test is an orphan with a test,
  which is precisely what the instrument must surface, not excuse.
- **Inventory reconciliation** (enumerate what *should* exist from current sources;
  diff against what does) is the only instrument that sees orphaned generated
  artifacts and unregistered/never-invoked cross-boundary registrations — the
  classes that produce no diff and no missing reference by construction. Both
  directions of the diff matter: presence-without-source is an orphan;
  source-without-presence is a missed generation.
- **Consumer-side key walking** (scan the consuming code for every key it can
  reference; subtract from the catalog) sees dead catalog keys. Its design tension
  is asymmetric error cost: claiming a live key dead is destructive, claiming a
  dead key live is recoverable — so the scan is deliberately permissive (any
  reference to a prefix marks the subtree live; declared escapes for dynamic
  lookups) and says so, rather than tuning for an impressive body count.
- **Adoption censuses** (count *uses*, not mentions: render call sites, hook
  callers, knob reads) are the only instrument for the false-affordance classes.
  Mentions lie — catalogs, comments, and re-exports all mention — so the census
  counts the one thing that constitutes life for that class: a render, a call, a
  branch on the value.

## The roster rule

For every artifact family the build creates — modules, exported symbols,
cross-boundary registrations, generated files, catalog keys, shared primitives,
configuration fields — **name the instrument that would notice its corpse.** A
family with no named instrument accumulates orphans at the rate of ordinary
refactoring, because refactoring updates callers and forgets artifacts, and nothing
is watching the artifact side. The roster is a maintained document, not a vibe:
class → instrument → cadence → where its findings land. Unassigned classes are
listed as unassigned — an honest gap outperforms an assumed coverage
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

The roster carries one more column than class → instrument: **the universe each
instrument counts in.** An instrument's universe is a declaration — the entry
list, the project glob, the ignore patterns, the set of trees it opens — and a
consumer outside the declaration is invisible to it whether that consumer is
another repository, another language in the same tree, or a file the
configuration excluded. Two consequences. A name reported unused is unused
*within the declared universe*, and the roster says what that universe is so a
reader can ask whether the audience fits inside it. And an exclusion added to
quiet a noisy directory is a removal of consumers from the census, which
converts every export those files used into a candidate corpse: read the ignore
list as part of the instrument, and pair it with the join that reaches what it
dropped.

Two corollaries. First, instruments cross-check each other where classes overlap:
when the refcount guard and the reconciliation inventory disagree about a generated
artifact, the disagreement is the finding — one of them is measuring the wrong
thing. Second, every instrument's output is framed as *candidates with a predicate*,
never verdicts: "47 modules unreachable from the declared entries" travels intact;
"47 dead files" gets reused for a claim no instrument made.
