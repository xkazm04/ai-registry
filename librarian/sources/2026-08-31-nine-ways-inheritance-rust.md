---
source: youtube:3IyKC5EtNkM
kind: first-party practitioner account (conference talk, with live peer Q&A)
url: https://www.youtube.com/watch?v=3IyKC5EtNkM
title: "9 Ways to do Inheritance in Rust"
author: Carl Kadie (Seattle Rust User Group, May 2026)
words: 7358
extracted: 11
accepted: 3
declined: 0
leads: 2
already_covered: 0
untriaged: 6
dispatched: 0
applied: 2
shipped: 1
run_id: yt-3IyKC5EtNkM
siblings: 4
---

# 9 Ways to do Inheritance in Rust — Carl Kadie

**Class.** First-party practitioner account. Kadie built the two crates every
puzzle comes from, so each problem is one he actually hit; the class is
authoritative for the *shape* of what he did and weak on universality, and the
standing corrective (land claims as decision rules with conditions attached) is
what both landings do. It carries a light **dialogue** property the sub-class
does not describe: the audience are peers who correct him live, twice, and both
corrections are load-bearing.

**Expected yield, said before the triage table: low.** A language-mechanics talk
is the hardest possible source for a corpus whose upper layers may carry no
product, framework or language names. Six of the nine puzzles are "here is the
syntax for a standard object-oriented move" and strip to `nothing`. That
prediction held exactly — the three that survived are the three that are about
**boundaries** rather than syntax, and all three came from one place: what
happens at the edge of code you do not own.

**Board.** 4 live siblings at claim time (`brooker-2026-08-31` at 7.5 holding
eight subjects including `admission-queue` and `eval-harness`;
`2026-08-31-voltagent-w3` in wave 3 on `agent-memory` and `measurement-honesty`;
`tigerbeetle-2026` at 2c on three `engineering-process` subjects; `danluu-2026`
at phase 0). None held `module-design` or `settings`; the four target files
checked clear immediately before the writes. The index was stale on arrival for
files this run does not own — left alone.

**Fetches: 0 of 3.** Consistent with the class profile. Both landings rest on
training-data convergence plus a real tree that was opened, which is the stronger
pair available here: the delegation hazard is attested across half a dozen
languages independently of this one, and the tree supplied the confirming
instance.

## Accepted

### 1. `borrowed-surface` — new technique on `module-design` (rows 5 + 7 merged)

The operator picked rows 5 and 7 as separate candidates. They landed as **one
technique**, because verification found they share a root and the root is the
higher-altitude finding.

`module-depth` already corrects the author's idea of their own interface
*downstream*: with enough callers, every observable behaviour is interface
whether it was promised or not. The subject has **no model running the other
way** — that part of a module's interface can be authored by somebody else, in
their file, on their release schedule. Two constructs do that, and the source
supplies one instance of each:

- **Implicit delegation** [18:52]. Kadie wraps a string type to get a compile
  error when the two are confused, then adds the forwarding operator and states
  the cost himself: *"the whole reason I gave it a new type was that if I got
  mixed up I would get a compiler error. And now I'm not going to get a compiler
  error in a lot of cases because I've made it so permissive."* The subject's
  existing pass-through model is **per-method and countable**; implicit
  delegation is the same failure with the evidence removed — three lines, an
  unbounded surface, defined in a file the reviewer is not reading.
- **A disjointness premise taken from a contract you do not own** [29:46]. Why
  he did *not* build on a third-party numeric contract: its owner may later add
  the character type he handles separately, retroactively making his two
  disjoint implementations overlap. He then notes the workaround costs the same
  as what he actually shipped.

The technique's decision rule is the discriminator the source states without
generalising: delegation is correct when the wrapper's job is **orthogonal** to
the delegated surface (it adds a capability the delegate lacks), and
self-defeating when the wrapper's job **is** the distinction.

### 2. Fourth signal on `seams-and-adapters` (amendment)

Found by the enumeration hunt. The technique declares "**three** signals, which
can disagree", classifies them ("dependency direction and future replaceability
are both bets; change frequency is a record"), and its *When not to use it*
section says not to own an interface in front of something with one plausible
implementation that changes at its caller's rate and tests fine — which is
precisely Kadie's case, where owning the contract is nonetheless mandatory. The
fourth signal is **ownership of a premise**: correctness depending on a
structural fact about the dependency (a set has these members) rather than on its
behaviour. It is neither a bet nor a churn record — it is checkable today — and
where it fires the *When not to use it* advice is explicitly suspended.

### 3. Open-type case on `typed-accessors` (amendment on `settings`)

Row 9 [37:38]. Kadie's flash-block store takes the type as a **caller
parameter**; he saves a byte under a key, loads it as a string, and it is not a
compile error. He is explicit that the runtime miss is not guaranteed —
*"you wrote out an array of U8s and then asked for a U128 and it thinks that
looks all fine and it would just give you the wrong value"* — mitigates by
storing the type name, states that mitigation's limit, and a peer then names the
zero-cost compile-time answer he had not used. Three states in one source.

`typed-accessors` enumerates a four-step accessor contract resting on an unstated
premise: **the type is declared at the accessor.** Its step 2 uses parse failure
as the type detector, and parse failure is a heuristic. Zero hits for
type-mismatch vocabulary across the whole subject, and its `Boundaries` section
does not scope typing out — it claims it. The gap is squarely on the subject's
own thesis (*misconfiguration is indistinguishable from configuration*) and is
**worse** than the corruption case it does model, because no default is
substituted: the value looks chosen.

`ipc-contract` was considered and rejected as the home on its own stated boundary
— "no version skew in the field, both halves ship together" — which is exactly
what a persisted store does not have.

## Applied (2 rows, both `better`)

Both seams are in one managed project; the operator confirmed the lane and both
code A/Bs before any edit.

- **`borrowed-surface`, `experiment`, `better`, not committed.** The tree carries
  the pattern in the exact state the technique predicts: a scrubbing wrapper that
  forwards the wrapped type's whole mutating surface, one caller reaching through
  it, and that caller hand-rolling the invariant in four lines under a comment
  explaining why. The guard has left the type and become a convention. Same probe
  line through both arms of a faithful reduction: arm A compiles clean, arm B is
  `error[E0596]`. **Not committed**, and the reason is environmental rather than
  a judgment — the crate's build script fails before the compiler reaches the
  code, so arm B cannot be shown to compile where it would live, and unproven
  does not commit to credential-handling code.
- **`typed-accessors`, `code`, `better`, committed.** The store has a closed key
  registry and a real write door, and enforcement is nonetheless **per key with
  nothing counting it**: 58 of 90 key constants are reachable inside the
  validator, 32 are not, and within the store's own "limits" category (numeric
  ceilings and rate caps) three of four were enforced. The fourth is a weekly
  budget in dollars whose sibling ceiling is enforced *and* carries six negative
  test cases. One test asserting the whole category: FAILED on arm A, ok on arm B.

## Leads

- **An enumeration that names its own count invites its own refutation** [42:27].
  The talk is "9 ways"; in the Q&A two peers name a tenth and an eleventh, and
  the speaker has used neither — *"I didn't even think of that."* Worth watching
  as a source-class property rather than domain knowledge: a source that counts
  its own completeness is pre-marked for the enumeration hunt, and its Q&A is
  where the count breaks. **Return condition:** a second source whose stated
  enumeration is refuted by its own audience on camera.
- **A practitioner shipping the option they doubt, at equal cost** [26:45].
  Kadie chose code generation over hand-enumeration for 15 cases, says *"I'm not
  confident now that it's the best solution, but it is the one I really used"*,
  and then that the alternative is *"about the same amount of code"*. A
  first-party account's weakest moment is where cost is equal and the author
  reports a habit as a finding. **Return condition:** a second first-party
  account volunteering an equal-cost choice it cannot justify — two sightings
  would make this a calibration rule for the class, not a lead.

## Untriaged — extracted, reached the table, nobody picked them

Recorded with anchors so a later run does not re-derive them. **Nobody verified
these and no judgment attaches to any of them.**

| # | Candidate | Anchor | My read at triage |
| --- | --- | --- | --- |
| 1 | Give an interface a default implementation derived from its required members | [05:34] | thin — standard interface design |
| 2 | Require one interface from another | [08:35] | thin |
| 3 | Attach behaviour to a foreign type by declaring a contract you own | [11:33] | partial — the weak half of what `borrowed-surface` form two now covers |
| 4 | Derive standard capabilities rather than hand-write them | [13:40] | thin |
| 6 | Implement for everything satisfying a predicate rather than each anticipated type | [23:13] | partial — open-world extension; nearest home `module-design`, no obvious gap |
| 8 | A predicate-gated capability reports its absence as nonexistence | [33:15] | partial — the diagnostic half is real and has no home |

Row 8 is the one worth a second look if this source is re-run: it is a genuine
observation about conditional API surfaces (the compiler says "no such method",
not "this exists but your bound failed"), and the reason it was not picked is
that no subject in the corpus owns build-time diagnostics.

## Notes on the class

Two things this run adds to the first-party-account entry.

**A talk organised as a numbered enumeration is a gift to Phase 6 hunt 3, and the
gift is in the Q&A.** The speaker's own count was wrong by two, and both misses
were supplied for free by people in the room.

**Length remained a poor proxy, but in a new way.** 7,358 words is a long source,
and most of it is narration of code on slides — the lowest-density prose this
ledger has recorded. The yield sat entirely in the four moments where the speaker
stopped describing a mechanism and said what it had cost him.
