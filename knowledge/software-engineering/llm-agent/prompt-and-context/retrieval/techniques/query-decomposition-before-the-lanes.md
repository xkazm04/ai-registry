---
layer: technique
type: technique
subject: retrieval
technique: query-decomposition-before-the-lanes
status: forged
laws: [silent-state-is-ungoverned, one-authority-per-vocabulary, unknown-is-not-a-value]
shared_with: []
use_when: [a thematic question keeps returning specific items and a specific question keeps returning themes, the caller picks the lane with a mode flag, indexes that answer at different levels of abstraction, wiring a no-retrieval-machinery baseline that someone will actually run]
---

# Query decomposition before the lanes

The query plane begins at *query*, and the stage most often assumed away sits
between the query arriving and the first lane executing: the query is one
string, each lane takes it whole. That holds only while every index answers at
the same level of abstraction — and the moment a corpus indexes both the
specific things it contains and the themes those things participate in, it
stops holding, quietly.

The symptom is a pair of complaints that look unrelated and are one defect. A
thematic question ("how does approval work here") returns specific items that
each mention approval once; a specific question ("what changed in record
4471") returns thematic material *about* the area the record sits in. Neither
is a ranking failure and no floor catches either, because in both cases the
lane that answered worked correctly on keys it should never have been handed.

## The stage: one query, several levels of abstraction

A query is not one key. It carries, at minimum, two kinds of content that
address different indexes:

- **Specifics** — identifiers, proper nouns, jargon, concrete items. These
  address whatever index holds the corpus's individual entries.
- **Themes** — the overarching concepts, the subject area, the *kind* of
  question asked. These address whatever index holds relations, summaries, or
  descriptions spanning many entries.

A single embedding of the whole query is a blend of both, and a blend
under-serves each: pulled away from the specific by the theme and from the
theme by the specific. Same argument the roster makes one level down —
[hybrid-lane-fusion](./hybrid-lane-fusion.md) refuses one matcher because
matchers fail in different places; this stage refuses one key because indexes
answer at different altitudes.

So: **decompose the query into tiers before any lane runs, and let the tier
decide which lane receives which keys.** The tier set is a closed vocabulary
with exactly one definition
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary));
two lists of tiers — one the decomposer emits, one the dispatcher branches on
— is the ordinary way a tier arrives that nothing consumes.

## Lane choice is a property of the decomposition, not of a caller flag

The shape this replaces is a caller-supplied mode: the request says which
apparatus to use and the pipeline obeys. That is the wrong authority twice over
— the caller has not read the corpus and often has not read the query, and a
mode flag makes lane selection *unmeasurable*, because the same query under two
flags is two systems with no shared record of why.

The rule: the decomposition is computed first, and the mapping from tier to
lane is a declared policy evaluated once. A caller may still *pin* a
decomposition — supply the tiers directly, for a replay or a test — a
legitimate override precisely because it substitutes for the decomposition
rather than bypassing the stage.

One constraint carries over from the golden path unchanged: decomposition
selects **which keys each lane gets, never which lanes exist**. An empty tier
gives its lane nothing to search; it does not remove the seat. Let it *disable*
lanes and the richer configuration stops being a superset of the leaner one —
the roster's addition rule, broken from inside.

## The decomposition is an artifact, not a mood

The whole value of the stage is that a query's abstraction level stops being
an emergent property of a vector and becomes something a person can read
([silent-state-is-ungoverned](../../../../_laws.md#silent-state-is-ungoverned)).
Emit it: the tiers, their keys, the decomposer's identity, and the tier-to-lane
mapping that fired. That record answers "why did this query search relations
and that one search entries" — the first question asked when a slice is wrong
— and lets an evaluation blame a ranking regression on the decomposer rather
than on lanes that merely used the keys they were handed.

## An empty tier is not an absent decomposition

Three states must stay distinguishable
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)):

- **The tier is empty** — the decomposer ran and this query names no
  specifics. A normal outcome for a thematic question.
- **The decomposition did not run** — none configured, the call failed, a
  budget refused it. The lanes are about to receive keys nobody computed.
- **Every tier came back empty** — a query too short, too vague, or in a form
  the decomposer does not handle.

The last case needs a stated fallback: use the raw query as the specific tier
and **label the slice as undecomposed** rather than refuse the request. What is
not acceptable is a length threshold silently switching between fallback and
refusal — a query is not more decomposable for being long, and a cutoff on
characters is a magic number standing where a confidence signal belongs.

## Caching: key on what the decomposition actually depends on

The stage costs a model call on the request path and is highly cacheable,
because the decomposition is a function of the query and the decomposer alone.
Key the cache on exactly those two. The recurring mistake is to add the
surrounding retrieval configuration — lane roster, budget, mode — none of
which the decomposer reads: every such term is a partition that re-pays a
model call for an identical answer, hiding in plain sight because the cache
still reports hits within a partition. A derived value's key is its inputs,
not its neighbours. Two smaller disciplines: never cache a decomposition parsed
from a truncated reply, since a partial tier set replays forever; and let a
decomposer change carry its identity, so old entries fall out.

## The undecomposed path is a first-class mode, not a debug flag

Keep a mode that skips this stage and every lane it feeds, running plain
similarity over the raw retrievable units. It is not a degradation: it is the
only honest baseline against which the decomposed path's contribution can be
measured, and where a query's answer sits verbatim in one unit it is the
correct answer, cheaper by a model call. It must be a **named, supported,
documented mode** — a baseline reachable only through an internal flag is a
baseline nobody runs, and a system never measured against its own cheapest arm
has an imaginary quality level in the sense
[retrieval-evaluation](./retrieval-evaluation.md) means it. Report both arms on
one labeled set; expect the decomposition to pay for some query classes only.

## Boundaries, and when the stage earns nothing

Upstream, [retrieval-triggering](./retrieval-triggering.md) has already decided
that this request needs the corpus; this stage never revisits that. Downstream,
[hybrid-lane-fusion](./hybrid-lane-fusion.md) merges what the lanes returned
and does not care which tier seeded which lane, except that the tier travels
with each item as provenance. Where the tiers address a graph of typed
relations, that graph is written by a different discipline — a subject that
writes the graph the lanes read — assumed here exactly as
[relationship-proximity-lane](./relationship-proximity-lane.md) assumes it.

Skip the stage when:

- **The corpus has one addressable level** — tiers all route to the same index
  and the decomposition is pure latency.
- **The consumer already types a structured query.** A grammar the user writes
  deliberately has stated its own level; re-deriving it with a model is a
  worse authority guessing at a better one.
- **The corpus is small enough that retrieval is the wrong tool** — that
  scale-honesty check bites hardest on a stage spending a model call before
  any search happens.
- **The decomposer costs more than the lanes it steers**, which is what it
  means when a labeled set cannot separate the two arms.
