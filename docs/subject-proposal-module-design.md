# Subject proposal — `module-design`

**Status:** **EXECUTED** - on disk since 2026-08-22 at `knowledge/software-engineering/engineering-process/codebase-stewardship/module-design/` (in the bundle index). The line below is the status as it stood until 2026-09-05, kept in place: run `intake-utopia-0905` found five of seventeen proposal status lines lagging the disk and moved them in one change, per the practice rule that the change closing a gap moves its label.
**Status as originally written (stale until 2026-09-05):** proposed, dispatch-ready. This is a forge input, not knowledge.
**Bundle:** `software-engineering`
**Category:** `engineering-process` (13 subjects, under the cap; no subcategory needed)
**Raised by:** `/research`, 2026-08-22, from
[`librarian/sources/2026-08-22-de-slop-a-codebase.md`](../librarian/sources/2026-08-22-de-slop-a-codebase.md)
**Engine:** `domain-knowledge-forge` — read [`forge-brief.md`](forge-brief.md) first; it is the contract.

---

## The gap, measured

The bundle carries **124 subjects** and none of them owns module boundaries.
Verified two ways before this document was written:

1. Every subject slug matched against `modul|architect|boundar|interface|coupl|refactor|depend`
   returns only `client-architecture`'s five subjects — `client-fetch-cache`,
   `client-state`, `i18n`, `ipc-contract`, `realtime-events` — which are about
   client-side state, transport and localisation, not about how a codebase is
   divided.
2. `grep -ril "deep module|ousterhout|philosophy of software design"` across the
   whole bundle returns **nothing**.

The adjacent subjects each own a different job and none owns this one:

| Subject | Owns | Does not own |
| --- | --- | --- |
| `codebase-scanning` | Sweeping a tree for findings — defects, dead code, rule violations. | What good structure *is*, or what a structural improvement would be. |
| `quality-gates` | Enforcing that a standard holds on every change. | The standard. |
| `test-harness` | Building and running the harness. | What makes code testable in the first place — which is a boundary question. |
| `dead-code` | Finding what is unreachable. | Whether what remains is well divided. |

This is the most foundational gap the research loop has found. Every other
subject in `engineering-process` presupposes that somebody decided where the
boundaries go, and nothing says how.

## Why it became urgent rather than merely absent

The source's framing is worth carrying into the draft because it is the reason
this is not a 2005 topic: **machine-speed change accelerates structural decay**.
A change made without regard for the whole codebase introduces small
inconsistencies that make the next change harder, and the rate of change is now
much higher than the rate at which anyone reviews structure. The defect is not
that agents write bad code — they frequently write locally excellent code — it is
that locally excellent changes accumulate into a structure nobody chose.

That also explains the shape of the fix, which is not "review harder": it is
periodic, deliberate, human-led structural work with a vocabulary precise enough
to argue in.

## Proposed techniques

Slugs are proposals; the forger owns final naming. Each states the concern and
the decision rule it must carry. Four to six is the target; five are proposed.

### 1. `module-depth`

**Depth is behaviour delivered per unit of interface a caller must learn.** A
deep module hides substantial implementation behind a small interface; a shallow
one exposes nearly as much as it does. Depth is the primary quality axis for a
boundary, and it is measurable in the only way that matters — what a caller has
to know versus what they get.

Must carry: the definition of interface as *everything a caller must know to use
the module correctly*, which explicitly includes documentation, invariants,
ordering requirements and error behaviour — not just the signatures. The
classic failure of shallow modules (a pass-through layer that adds a name and no
behaviour). Why "many small modules" is not automatically good design. And the
honest counter-case: a deep module that hides the wrong thing forces callers to
work around it, so depth is not maximised, it is *placed*.

### 2. `seams-and-adapters`

**A seam is where an interface meets the rest of the system; an adapter is a
concrete thing that satisfies a seam.** Seams are where substitution becomes
possible, which makes them simultaneously the design question and the testing
question — the same locations serve both.

Must carry: how to find where a seam should go (dependency direction, rate of
change, what needs to be replaceable); adapters as the mechanism (the real
implementation and the test double satisfy one interface); and the rule that a
seam nobody substitutes at is a seam that has not been tested and probably does
not hold.

### 3. `locality-and-leverage`

**The two benefits of a good boundary, and they accrue to different people.**
Locality is the maintainer's: changes, bugs and their fixes concentrate in one
place instead of scattering. Leverage is the caller's: capability per unit of
interface learned. Both are consequences of depth and they can be traded against
each other.

Must carry: co-locating what changes together as the operational form of
locality; why scattered change is the diagnostic symptom of a boundary in the
wrong place; and how the two are used as the pair of criteria a structural
proposal is argued against.

### 4. `structural-improvement-loop`

**Structural work is a deliberate periodic pass, not a review-time reflex**, and
it has a shape: scan for candidates → ground each in real code on both sides →
elicit the target shape with a human → emit a specification rather than a change.

Must carry: why candidates must be grounded in concrete code at both ends before
they are discussed (an ungrounded structural proposal is unfalsifiable, and the
discussion becomes taste); why the loop's output is a spec or an issue and not a
diff (the change is large, reviewable only as a whole, and separating the
decision from the edit is what makes it reviewable at all); and cadence — this
is periodic work whose absence is invisible until it is expensive.

Cross-reference rather than restate: `codebase-scanning` owns the mechanics of
sweeping a tree and the lifecycle of a finding; this technique owns what a
*structural* candidate is and what is done with it.

### 5. `structure-is-not-delegable`

**An agent can find structural candidates and cannot choose which are worth
having.** Finding is pattern recognition over a codebase; choosing requires
knowing where the product is going, which is not in the tree. The source's
framing — excellent tactical work needs a strategic decision above it — is the
right altitude for the technique.

Must carry: the division of labour (agent proposes candidates with evidence,
human selects and shapes, agent executes the shaped change); why this one flow
must not run unattended, and specifically that a blanket auto-approval grant
breaks a flow whose *value* is the human's turn — it does not speed the flow up,
it deletes it; and the honest limit, which is that this claim is about today's
capability and states what would have to change for it to stop being true.

**This technique is in deliberate tension with
[`orchestration-to-tool-migration`](../knowledge/software-engineering/llm-agent/runtime-and-io/mcp-tools/techniques/orchestration-to-tool-migration.md)**,
which argues that as capability rises, decisions should migrate from
orchestration to the agent. Both are correct and the boundary between them is
the interesting content: that technique governs decisions **with a measurable
outcome inside the run** (did the pipeline produce better output), while this one
governs decisions whose outcome is measurable only over months (was this the
right structure). A decision the harness cannot score is one the migration
argument does not reach. **Reference that technique explicitly and state the
boundary** — do not restate its content, and do not quietly contradict it.

## Boundaries this subject must NOT absorb

- **Finding defects** — `codebase-scanning`.
- **Enforcing a standard on each change** — `quality-gates`.
- **Building and running tests** — `test-harness`. This subject owns *what makes
  code testable* (seams); that subject owns the harness.
- **Any specific architecture style.** Hexagonal, clean, onion and layered are
  vocabularies for the same underlying concerns. The subject teaches the
  concerns; naming a style as *the* answer is a purity violation waiting to
  happen and it dates the document.

## Open questions for the forger

1. **Name.** `module-design` is plain and slightly generic. `module-boundaries`
   is more specific about the concern; `structural-design` is broader than the
   techniques support. Decide in the draft.
2. **Is `structural-improvement-loop` really this subject's, or `codebase-scanning`'s?**
   The proposal puts it here because it is about structure rather than defects,
   but the argument is not airtight and the forger should settle it rather than
   leave two subjects half-owning it.
3. **Applications.** `react` and `node` are both plausible from consuming
   projects; `process` is arguably the honest stack for the improvement loop.
   Only write one against a tree you actually open, and stamp `verified_on` with
   the date you resolved its citations.

## Provenance and its limits

The vocabulary in techniques 1–3 is **John Ousterhout's**, from *A Philosophy of
Software Design*, and the seam/adapter framing comes from the hexagonal
architecture tradition (Cockburn) and from Michael Feathers' *Working
Effectively with Legacy Code*, where seams are named as the enabling concept for
testing untested code. These are established, citable, decades-old ideas with
substantial literature — which is exactly why the two-phase order applies with
full force: **draft from practitioner knowledge and the literature first**, and
treat the source that raised this proposal as one practitioner's application of
it rather than as the standard.

Techniques 4 and 5 are the genuinely contemporary half — the loop and the
delegation boundary are responses to machine-speed change, and they have far less
literature behind them. Web hardening is worth spending there and largely
unnecessary for 1–3.
