---
layer: golden-path
type: golden-path
subject: engine-pitfall-corpus
status: forged
use_when: [an incident against a large third-party system just got root-caused, deciding what a generator is told about an engine before it authors anything, a knowledge file has grown into an unroutable wall of text, the same engine trap has now cost the team twice]
techniques:
  - incident-entry-shape
  - domain-scoped-injection-with-a-safe-superset
  - binary-content-wall
  - known-asset-paths-over-invented-ones
  - introspect-before-you-call
  - provenance-on-every-entry
---

# Engine pitfall corpus

Every team working against a large third-party system accumulates folklore: the
operation that silently does nothing in one execution mode, the existence check
that lies for one class of input, the rename that quietly re-points every
referencer. The folklore lives in one senior engineer's head, in a chat thread, in
a commit message nobody will search for again. It is worth a great deal and it
reaches almost nobody.

An engine pitfall corpus is that folklore turned into a routed artifact: a set of
entries, each one an incident compressed to its actionable conclusion, each one
scoped so it arrives at the task it applies to, each one carrying enough
provenance that a reader two versions later can decide whether to still believe
it. The subject is knowledge engineering for a *hostile* domain — hostile not as
a slur but as a property: the system is large, quirky, thinly documented at the
edges, versioned faster than its documentation, and it fails in ways that read as
success. Whether that system is a real-time 3D game engine, a cloud provider's
control plane, a proprietary geometry kernel or a decades-old transaction monitor,
the craft is the same.

## The corpus is a routing problem before it is a writing problem

The naive reading is that the work is writing things down. It is not. Teams that
write things down still repeat incidents, because the document that would have
prevented the incident was forty pages long, organised by engine subsystem, and
nobody opened it while doing the thing.

The corpus has exactly one success criterion: **the entry that would have
prevented this failure was in front of the author at the moment of authoring.**
Everything follows from that. Entries must be short enough to be injected many
at a time. They must carry a machine-readable scope so a router can select them.
They must be independently addressable so a selection is a list of entries and
not a slice of prose. A monolithic prose guide fails the criterion structurally,
no matter how good the prose is: it can only be included whole or not at all, and
whole is unaffordable, so in practice it is not at all.

That is why the atomic unit is an entry with fields, not a section with a
heading. Structure here is not bureaucracy; it is what makes routing possible.

## An incident is not yet knowledge

Between "we hit a wall on Tuesday" and "an entry" there is real work, and skipping
it is the second most common failure. A raw incident is a narrative: what someone
tried, what broke, how long it took, who fixed it. An entry is a *conclusion* plus
the evidence that earned it, scoped to the situations where it applies.

The conversion is a compression with a fixed target shape — an identifier, a
one-line summary written as the instruction the reader should follow, a long
detail that recounts the probe, a scope list, and a provenance record. Each field
exists because a specific failure mode killed corpora that omitted it, and each is
argued in `incident-entry-shape`. One argument is load-bearing enough to state
here, because everything else in the subject depends on it: **the detail recounts
the probe, not the rule.** The weak entry asserts that an operation does not work
in headless mode. The strong entry says what was run, on what version, what was
observed, and what was tried and failed. That is what lets a reader distinguish a
general law from a local accident, and what makes the entry cheaply
*re-verifiable* when the engine moves — because the probe is a procedure someone
can run again. An entry that cannot be re-verified rots silently; that it exists
and parses says nothing about whether it is still true.

## Scoping is an optimisation, and an optimisation may not lose correctness

Once entries carry scope, a router can hand a task only the entries relevant to
it. This is the difference between a corpus that scales to hundreds of entries
and one that caps out at whatever fits in a single injection.

But scoping introduces a failure direction that must be closed deliberately. The
router maps a task descriptor — a subsystem name, a work-item type, a target
module — onto a set of scopes. That mapping will be incomplete, because new task
types arrive faster than anyone updates a routing table. The question is what
happens when the descriptor is *unrecognised*.

The rule: **an unknown scope receives the conservative superset, never the empty
set.** The cost of over-inclusion is tokens and a little reader fatigue. The cost
of under-inclusion is a repeated incident — the exact thing the corpus exists to
prevent, now failing invisibly, because nobody can see the entry that was not
injected. Asymmetric costs demand an asymmetric default: a missing mapping must
never silently drop a relevant pitfall. The same asymmetry rules the router's own
health — a routing table that has stopped being updated should be *visible* as
such, not merely quietly conservative.
`domain-scoped-injection-with-a-safe-superset` makes both a procedure.

## The corpus must state the hard boundary, not only the traps

A corpus assembled purely from incidents lists things that are difficult. It will
not, on its own, ever say **this cannot be done at all** — because nobody files an
incident for a wall they eventually recognised. That omission is expensive in a
specific way: an automated author handed a task that is impossible in its medium
does not stop. It retries, varies its approach, produces something structurally
plausible and behaviourally empty, and burns until an external limit stops it.

So the corpus carries a second class of content: an explicit boundary declaring
which artifact classes cannot be produced from the medium the author works in —
typically the binary or tool-authored classes that cannot be emitted as text —
paired with the pure-code pattern to prefer where one exists. Stating the wall is
a refusal, and a refusal delivered up front beats an unbounded attempt.
`binary-content-wall` develops it, including why "and here is what to do instead"
is not politeness but the thing that keeps the boundary from being ignored.

## Supply the real identifiers, or they will be invented

An author asked to reference something it does not have does not stop and ask. It
produces a plausible-looking identifier — right shape, right naming convention,
entirely fictional — and everything downstream compiles, validates, and resolves
to nothing. This is not a flaw to be prompted away; it is what generative
completion does under a missing fact. The cheapest fix in the subject is to remove
the missing fact: curate the real identifiers for the resources tasks routinely
reference, once, and inject them alongside the pitfalls. That converts a
generation problem into a selection problem. `known-asset-paths-over-invented-ones` covers
curation, staleness, and the honest handling of "the set does not contain what you
need" — which must resolve to a declared gap, never to an improvised identifier.

## Two directions in which introspection lies

A large system usually offers a way to ask it questions: does this exist, is this
operation available, what type is this. Treating those answers as ground truth is
the trap that produces the most confident wrong work, because the answers are
wrong in both directions.

**A positive answer is not a capability.** In reduced execution modes — headless,
sandboxed, restricted-permission, offline — an API surface commonly *resolves*
completely while the operations behind it are inert. Introspection reports the
operation as available; calling it does nothing observable, or terminates the
process. The API answering a question is not the API doing the thing.

**A negative answer is not an absence.** Existence and lookup calls frequently
have blind spots — one class of mount, one plugin-provided namespace, one
lazily-registered subsystem — and return a clean negative for things that are
demonstrably present. Code that treats the negative as authoritative will delete,
recreate or fail on a live object.

The discipline that follows is `introspect-before-you-call`: probe in the exact
mode you will run in, prove capability behaviourally rather than structurally, and
treat every negative from an introspection call as a candidate false negative
until a second, differently-shaped check agrees. A capability probe is itself an
entry-worthy artifact — the parallel discipline for external headless tooling in
the asset pipeline is owned by the mesh-finishing subject and is not repeated here.

## Provenance, or the corpus quietly stops being believed

Engine behaviour changes across versions, and an entry written against one release
may be wrong, partially wrong or newly irrelevant against the next. Without a
version and a date on every entry there is no way to ask "which of these were
verified before the upgrade" and get an answer — and a corpus that cannot be
audited becomes a corpus nobody trusts, then one nobody reads. That is the
terminal failure mode of this subject, and it arrives slowly enough to be
invisible: entries do not announce that they have expired. Provenance must also
distinguish *how* something is known — read in vendor documentation, inferred from
a forum answer, or live-probed here on this date and version. Those have different
half-lives and different authority, and collapsing them makes the strong entries
no more credible than the weak ones. `provenance-on-every-entry` sets the fields
and the audit procedure.

## Where entries come from

The corpus is fed, not written once. Its principal supplier is root-cause
analysis: when a crash or failure investigation reaches a *confirmed* root cause
in engine behaviour — not a suspicion, not a correlation — that finding is
converted into an entry, and the investigation is not closed until it has been.
That pipeline belongs to the forensics subject; what belongs here is the
obligation to receive from it, and the rule that only confirmed causes become
entries. A corpus salted with unconfirmed hypotheses inherits their error rate and
loses the authority that makes it worth reading. The other suppliers are the
deliberate probe — an afternoon spent establishing what a subsystem actually does,
captured rather than evaporated — and the review pass that keeps finding the same
defect, which is a routing failure wearing an authoring failure's clothes.

## Seams

The corpus is a *supplier*, not a consumer. The architecture of the briefing a
generator eventually receives — sections, ordering, budget, precedence — is a
separate concern that consumes this corpus among several inputs; name the seam and
do not design the briefing here. Likewise the contract for what a produced artifact
must declare to count as wired, and the safety rules for driving a live engine
session: the corpus supplies the pitfalls, those subjects supply the obligations.

## What the naive reading gets wrong

- **Treating it as documentation.** Documentation describes a system; a corpus
  routes conclusions to tasks. Different units, different success criteria.
- **Writing topics instead of conclusions.** Guarantees every consumer must read
  the body of every entry, which means they read none.
- **Asserting instead of recounting.** Produces entries that cannot be re-verified
  and therefore cannot be retired, so the corpus ages into folklore again — this
  time with the authority of a document.
- **Scoping toward the empty set.** Turns an optimisation into a silent
  correctness bug whose symptom is a repeated incident nobody attributes to the
  router.
- **Listing traps and never the wall.** Leaves an automated author to discover
  impossibility by exhaustion.
- **Omitting version and date.** Guarantees the corpus becomes unauditable, then
  untrusted, then unread, in that order and without a single alarm.
