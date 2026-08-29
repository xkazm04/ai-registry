---
date: 2026-08-29
kind: proposal triage
proposals: 64
amend: 27
application_citation: 10
map_or_coverage: 27
---

# Proposal triage - backtest wave 1

The 64 registry proposals from [[2026-08-29-personas-gravity-wave-1]], triaged by three
workers against the technique files they named, then 27 amendments landed by anchor in
one commit. Project paths are stripped to `[code]`; the anchored evidence lives in each
project's `conform-detail.json`. The map-or-coverage items are the builder/forge
follow-up list; the application-citation items are application documents owed against
an opened tree.


## t-1

# Triage t-1 — 23 proposals

Corroboration bar applied per proposal: (a) bounded counter-case observed in a real tree
(given, for all 23), plus (b) training-data convergence — I reach the same rule reasoning
without the proposal. Where (b) fails or the file already answers it, the row is not an
amend.

Counts: **amend 8 · application-citation 3 · map-or-coverage 12 · already-covered 0 · decline 0**

---

### fleet-orchestration / durable-fleet-state

**Classification:** `amend`

**Reasoning:** The rule is stated absolutely ("One reader, one moment"), but the sibling
technique `result-harvest` already contradicts it — "the run's accounting state persists
with the fleet's durable state" and "a restarted orchestrator finishes the harvest from
the roster" can only mean a second read of the mirror; the corpus holds both halves and
never states the boundary.

**Convergence:** Independently I reach the same rule — a crash-recovery journal is the
only surviving record of sessions that ended in the outage, so post-hoc accounting must
read it, and the freshness contract the prohibition protects binds only readers of
*non-terminal* entries, which terminal-only accounting never touches.

**Target file:** `C:[code]

**Anchor** (insert after these lines — the end of "What the mirror is not"):

```
read the in-memory registry; the moment consumers
read the mirror directly, its write cadence becomes a user-facing freshness
contract and the lazy-write latitude above disappears. One reader, one
moment: the next startup.
```

**Draft:**

```
## The one sanctioned second reader

Post-hoc run accounting is the exception, and it is narrow enough to state.
A harvest that must close a run the orchestrator did not survive cannot ask
the in-memory registry: memory was rebuilt at startup and never knew the
sessions that ended in the gap. Only the mirror holds them. So accounting
over *settled* history is a second reader, and it is admitted on one
condition — **it reads terminal entries only**. Terminal transitions are the
mirror's durably-flushed class already, so a reader confined to them imposes
no freshness contract on the lazy fields and the write latitude above
survives intact. What stays forbidden is unchanged: no dispatcher, sweeper,
or dashboard reads a non-terminal entry from the mirror, because the moment
live state is served from it, its write cadence becomes a promise the mirror
was built not to make.
```

---

### fleet-orchestration / heterogeneous-model-panels

**Classification:** `amend`

**Reasoning:** The file's own enumeration is binary — cross-family panel or same-weights
sampling run — and an enumeration is a claim. Same-provider tiers driven by different
role prompts fall in neither column, and the "sampling run wearing a costume" bullet is
close enough that implementers will read themselves into the conformant side.

**Convergence:** Yes — role prompts cannot decorrelate errors that are trained in, so
agreement among role-diverse same-family seats is evidence the decomposition held, not
concordance. Division of labour is not independence; this is the same argument the file
already makes against same-family reviewers in the produce–review pair.

**Target file:** `C:[code]

**Anchor** (insert after the two "Two consequences" bullets):

```
- **Panels are for decision-shaped questions, not generation.** A question
  whose answer will bind for months, a new tool or release nobody in-house has
  touched, a claim that deserves a genuine attempt at refutation. Routine
  generation through a panel multiplies cost by N for a consistency gain the
  voting baseline already had.
```

**Draft:**

```
**Role diversity is not family diversity, and the third arrangement is the one
that gets miscounted.** A common shape sits between the two above: seats drawn
from one provider's tiers, driven by materially different role prompts. It is
not a sampling run — the seats are not the same weights asked the same thing N
times — and it is not a panel, because the errors it would need to decorrelate
are trained in, and no prompt reaches them. Agreement across such seats is
evidence that the decomposition held: each role did its own job and nothing
contradicted. That is worth having and worth pricing as what it is, but it
must never be recorded in the concordance column. The test is mechanical — ask
what the seats were trained apart on, not what they were told. If the answer is
"nothing", the run bought division of labour, not independence.
```

---

### fleet-orchestration / agents-design (golden path precondition)

**Classification:** `map-or-coverage`

**Reasoning:** Vocabulary match on session/phase/awaiting-input/resume against a subject
whose stated precondition is a fleet; the correct governor exists in the corpus
(`ui-surfaces/input-and-editing/wizard-flows`), so this is a matcher routing defect, not a
hole. Builder follow-up: drop the pair, add the wizard-flows pair with `source:conform`,
and route by the golden path's stated precondition rather than by term overlap.

---

### fleet-orchestration / home-cockpit-widgets

**Classification:** `map-or-coverage`

**Reasoning:** Correct — this is a decision/observability surface, not fleet machinery.
The review-queue half is governed by `operations/service-operations/triage-queues` (its
golden path draws the inbox/gate boundary explicitly and hands genuine approvals to
`llm-agent/orchestration/hitl-approval`), so pair those rather than fleet-orchestration.
The observability-plan half has **no** governing subject in the corpus — a forge lead
worth raising ("failures go to a reviewable queue, at least one success metric tracked"
is a standard nothing currently owns).

---

### fleet-orchestration / home-learning

**Classification:** `map-or-coverage`

**Reasoning:** Mispairing, but the proposal's own conclusion is wrong and this is the
useful catch: the corpus is not missing a content-delivery-degradation subject.
[code] already draws exactly
the cached/stale/unavailable distinction (fresh / stale / miss, plus "Failure keeps stale
truth visible" and "never evict on failed revalidation"), and the schema-valid-but-empty
guard is `failure-not-empty-success`, which that technique already cites. Builder
follow-up: pair the context to `client-fetch-cache`; do **not** open a forge lead.

---

### eval-harness / lib-harness

**Classification:** `map-or-coverage`

**Reasoning:** Confirmed mispairing on the word "harness". The proposed governor exists
with both named techniques present —
[code]
and [code]. The finding (a pipeline whose exit status is the counter's, so
a nonzero violation count reports as a pass, doubled by `required:false` under a verifier
that counts only required failures) is a textbook gate-liveness deviation and belongs
against that subject. Builder follow-up: add the `quality-gates` pair with
`source:conform` and re-judge; no eval-harness edit.

---

### eval-harness / overview-certification → quality-gates / policy-projection

**Classification:** `application-citation`

**Reasoning:** "Clamp the visual width, print the true number" is the display-cap-is-not-a-
data-cap rule already inside `policy-projection`; what the tree adds is a positive
instance realized as a habit rather than as a postmortem. That is application-layer
evidence (product-anchored, `file:line`-bearing), not a rule change. Note the destination
subject is `quality-gates`, not `eval-harness` — the citation should be filed under
`quality-gates/applications/` and the context re-paired accordingly.

---

### eval-harness / judge-stability

**Classification:** `amend` (plus a `map-or-coverage` note)

**Reasoning:** Half the proposal is answered by a sentence the worker missed — "the model,
at a specific version — never an alias that silently upgrades" already forbids the pin.
What is genuinely absent is the *verification* half: nothing requires the resolved
identifier to be stamped onto the run artifact, and the file's phrasing reads as being
about vendor labels, so a first-party constant named for a tier passes review as a pin.
Map note: the brief's path [code] no longer exists —
regenerate this context's paths.

**Convergence:** Yes — a symbolic name that resolves through your own roster table is the
same moving target as a vendor alias, and a pin is only auditable if what it resolved to
at scoring time was recorded; otherwise the anchor set measures a drift it cannot
attribute.

**Target file:** `C:[code]

**Anchor** (insert after the paragraph closing "Pin the judge — the whole judge"):

```
Every emitted score carries its packet version — a score without its
instrument identity attached will inevitably be compared against a score
from a different instrument
```

**Draft:**

```
**A pin is verified by what it resolved to, not by what it is named.** The
alias rule above is usually read as being about a vendor's moving labels, and
it catches those; the version that survives review is first-party. A constant
named for a capability tier — the balanced one, the fast one — is an alias with
a local spelling: it resolves through the system's own roster table, a routine
roster revision moves it, and in a diff it reads as deliberate pinning. So the
pin is to a concrete dated identifier, and the identifier the call actually
resolved to is **stamped onto the run artifact beside the packet version**.
Without that stamp, the only evidence of which instrument scored a series is a
constant whose value at scoring time nobody recorded — and the anchor set then
detects a drift it cannot attribute to anything.
```

---

### voice-io / engine-build-session

**Classification:** `map-or-coverage`

**Reasoning:** Vocabulary routing ("voice", "synthesize") against a golden path whose
precondition is a product that listens and speaks; `prompt-and-context/prompt-assembly`
is already paired for this context. Builder follow-up: drop the voice-io row.

---

### voice-io / webhook-ingestion

**Classification:** `map-or-coverage`

**Reasoning:** Same vocabulary resonance (a persona "voice" block), compounded by stale
map data — the brief's [code] is not on disk. Builder
follow-up: drop the pair and regenerate this row's paths.

---

### time-travel-replay / timeline-derivation

**Classification:** `amend`

**Reasoning:** The file enumerates two derivation outcomes (built / stated failure on
unparseable records) and the enumeration is incomplete: a record that parses cleanly but
carries only an aggregate duration cannot support a timeline, and nothing in the file
names apportionment as the fabrication it is. It sits at a stage the subject leaves to a
default — the decision to build at all.

**Convergence:** Yes — spreading an aggregate across items manufactures per-item
measurements from a total, which is the same class of error as interpolating a gap, and
it defeats every downstream honesty rule silently because the invented values look
recorded.

**Target file:** `C:[code]

**Anchor** (insert after the last bullet of "Unclosed and half-recorded items"):

```
- a record too damaged to derive from produces a **stated failure** ("could
  not build timeline: N unparseable records"), never an empty-but-playable
  timeline. Zero playable items from a nonzero record is a derivation error
  until proven otherwise.
```

**Draft:**

```
There is a third outcome, and it is commoner than the damaged record: a record
that parses perfectly and carries no per-item timing at all — a blob of output,
a total duration, an aggregate cost. Nothing is broken, so nothing announces
itself, and the tempting move is to spread the total across the items and play
the result. That is fabrication with better manners than interpolation:
**apportionment manufactures per-item measurements out of an aggregate**, and
every honesty rule downstream then reads them as recorded — no gap can be
disclosed because none exists, no dead air can be compressed because none is
visible, and any reconciliation against the record's own totals passes by
construction. So the derivation has a third verdict, stated as plainly as the
other two: *this record does not support a timeline*, offered together with the
settled summary the record does support — never with a scrubber over invented
time.
```

---

### agent-memory / consolidation

**Classification:** `amend`

**Reasoning:** "The measure follows the question" covers *which* measure serves which
question, but not the order the questions are asked in — and the order is load-bearing in
a way the file's own supersedence section makes urgent, since a mislabelled contradiction
is offered a merge, i.e. the overwrite the file forbids.

**Convergence:** Yes — negation pairs differ by one token, so on any surface similarity
measure a genuine contradiction scores at or above the duplicate threshold; a
duplicate-first pipeline therefore mislabels precisely the sharpest contradictions. This
is the well-known antonym/negation blindness of lexical and embedding similarity, reached
without the proposal.

**Note:** the `file:line` evidence belongs in an `agent-memory/applications/` document,
not in the technique (strip test).

**Target file:** `C:[code]

**Anchor** (insert after the close of "Finding the candidates is a deterministic prefilter"'s
second paragraph):

```
Normalize by the *smaller* side instead. The mirror case, grouping items that
belong to one family, wants the opposite property and belongs to
[rollup-compaction]([code]); the rule to carry is that the
measure follows the question, and a system doing both jobs needs both
measures.
```

**Draft:**

```
**And the order the questions are asked in is part of the rule.** A system
running both measures still has to decide which verdict it tests for first, and
the intuitive order — duplicate first, because it is the cheap and common case —
is the one that fails hardest. A genuine contradiction is usually a one-token
swap of the belief it contradicts: always for never, enabled for disabled, the
same sentence with its polarity turned over. Under any surface measure that is a
near-identical pair, so it clears the duplicate threshold comfortably, and the
sharpest contradictions in the store become the ones a duplicate-first pipeline
is guaranteed to mislabel — and then offers a merge, which is the overwrite this
technique forbids, wearing a tidy-up's face. So **test contradiction and
supersedence before duplicate**, and let the duplicate branch see only what the
polarity check has already cleared.
```

---

### agent-memory / team-memory

**Classification:** `map-or-coverage`

**Reasoning:** Pure map accuracy — four listed paths do not exist and the real entry
points carry the context's strongest conformance evidence under different names. No
technique implication. Builder follow-up: regenerate this context's path list (and the
markdown-vault brief's [code] row) against the current tree before any verdict
on this pair is trusted.

---

### terminal-multiplexing / keystroke-injection

**Classification:** `application-citation`

**Reasoning:** The typed-versus-pasted rule and the bracketed-paste condition are already
fully stated in the technique; what the tree adds is a positive realization worth citing.
The proposal's boundary half — one product holding both the correct and the naive path —
is likewise already covered, by the one-parser rule ("every injection path … parses
through the same door"), which is exactly what a second naive path violates. So: an
application document, no rule change. The subject's `applications/` already holds
[code] and [code]; this would be a third.

---

### conversation-orchestration / two-surface-doctrine (from agents-quick-answer)

**Classification:** `amend` (plus a `map-or-coverage` note)

**Reasoning:** Both techniques state the *outcome* ("one press fires both" must not happen;
"whichever overlay owns the keyboard is served first, and this row yields") but neither
states the mechanism guarantee, and priority ordering is the plausible-looking
implementation that does not deliver it. Amend the technique that owns the arming rule
only — `model-proposed-quick-replies` cross-references it and should not carry the text
twice. Map note: the proposal is right that the pair itself is wrong; the deck is a triage
surface governed by `operations/service-operations/triage-queues`.

**Convergence:** Yes — priority determines who is served first, not who is served;
without an exclusive claim (or an explicit stop-propagation) a ranked dispatch still
reaches every registrant, so the defect survives the fix that looks like the fix.

**Target file:** `C:[code]

**Anchor** (insert after the first bullet of "The ambient decision, and how it is answered"):

```
  and register it with the application's keyboard authority rather than on the
  global event target: the digits are almost certainly claimed by some other
  surface too, and with both listening directly one press fires both.
```

**Draft:**

```
  Registering is not sufficient on its own: the claim must be **exclusive for as
  long as the surface is armed**, not merely higher-priority. A priority order
  decides who is served first; unless something halts the dispatch, everyone
  registered is still served — so a priority-ranked binding fires the armed
  surface *and* whatever else holds that digit, which is the bare-listener defect
  arriving one layer later and much harder to see, because the ordering looks
  like the remedy. Exclusivity is also what makes disarming meaningful: releasing
  a claim is one act with an observable effect, where unwinding a priority stack
  is bookkeeping, and bookkeeping drifts.
```

---

### conversation-orchestration / companion-ui-controls

**Classification:** `map-or-coverage`

**Reasoning:** Row hygiene, not a standard question: five of twelve paths test unrelated
plugins and surfaces bundled under a companion-shaped context name, so any verdict on this
row over-claims. Builder follow-up: split the row before the next judging pass; the three
`conformant` verdicts it currently carries should be re-attributed to the companion paths
only.

---

### conversation-orchestration / plugins-companion-decision

**Classification:** `application-citation` (plus a `map-or-coverage` note)

**Reasoning:** The arbitration rule the proposal wants added is already in the file —
"Within the ambient surface, an answer outranks an announcement." What is new and
citable is that the complementary-condition contract was turned into a **test oracle**
reporting the decision surface as one of three values with the third defined as the
regression — prose made failable. That is application-layer evidence for
`two-surface-doctrine`, not a rule change. Map note: the row also mixes in an immutable
retrospective audit log of recorded decisions, which this subject does not govern
(records surface; route separately).

---

### companion-identity / plugins-companion-inbox

**Classification:** `map-or-coverage`

**Reasoning:** Paired on the word "companion" in a path. The governing subject exists and
the proposal did not find it: `operations/service-operations/triage-queues` — its
`source-normalization` technique is precisely "one item shape, per-source adapters, the
severity exchange rate lives in the adapter", and its golden path owns the needs-me
rollup. The unverifiable-credential-counted-as-failed observation is genuine
`health-checks` doctrine (three-state outcomes / rollup) landing outside health-checks;
record it against that subject rather than judging this pair. Builder follow-up: add the
triage-queues pair with `source:conform`, drop companion-identity.

---

### model-routing / golden path (from byom-provider-settings)

**Classification:** `amend`

**Reasoning:** The "done" bar demands that every mapping entry cite the measurement that
set it, and a deployed system grows a second table the demand cannot bind: an
operator-authored allow-list over which providers their own installation may use. Neither
`effort-calibration` nor `policy-governance` draws the line, and the golden path states
the two demands in one breath, so the calibration half reads as covering both.

**Convergence:** Yes — a permission is not a calibration; asking an operator's contractual
or jurisdictional preference to cite a benchmark is a category error, while the governance
disciplines (data, one door, versioned, diffed, in the record) apply to both unchanged.

**Target file:** `C:[code]

**Anchor** (insert after the close of "The classes and their contracts"):

```
populated layer is not a cascade** - it is a constant with extra places to look
before finding it, wearing the costume of a policy. Before adding a resolution
layer, count how many of the existing ones have ever held a value.
```

**Draft:**

```
## Two tables, only one of which is calibrated

The demand that every mapping entry cite the measurement that set it belongs to
the calibrated table — the class→tier→effort mapping the system owns, where an
entry is a claim about capability and an uncited entry is an intuition hardened
into fact. It does not extend to the second table a deployed system grows:
**operator policy over which providers and models an installation may use at
all**. That table is not a measurement, it is a permission, and asking it to
cite evidence is a category error — the reasons behind it are contractual,
jurisdictional or financial, and no benchmark speaks to them. The governance
half applies to both without softening: policy is data, validated at one door,
versioned, diffed, and visible in the decision record. The calibration half
applies only to the first. Where the two disagree the permission wins, and the
record says a permission decided.
```

---

### model-routing / triggers-studio

**Classification:** `map-or-coverage`

**Reasoning:** Correct re-routing — the governor is `llm-agent/orchestration/agent-chaining`
(graph-to-wiring-translation, run-conditions, cycle-and-depth-guards, handoff-payload-
contracts all name the exact seams cited), and no model-routing technique applies. The
three deviations the proposal derives are a real backlog but they are verdicts on a pair
that does not exist yet, so they cannot land as technique edits from here. Builder
follow-up: add the `agent-chaining` pair with `source:conform` and re-judge; the
fail-open degradation of an unrecognized persisted condition token to "always" is the
sharpest of the three and should be flagged for that pass.

---

### agent-chaining / stop-reason-ledgers (from i18n-generated)

**Classification:** `amend`

**Reasoning:** The citation half is **already covered** — the technique's machinery-side
family names all six reasons, and
[code] (verified 2026-08-18) already
cites those exact tokens including `publish_failed`, `cas_lost`, `quarantined`,
`malformed_config` and `handoff_suppressed`. What no file carries is the proposal's
second half: the enforcement form "one authority" takes when the vocabulary crosses a
language boundary. That is the amendable finding.

**Convergence:** Yes, and it lands on a law the corpus already holds — a parity test whose
expected list is the far-side copy asserts a mirror against itself and cannot see the
authority (`gate-sees-target`). Generation, not a test, is the only mechanical form of one
authority across a boundary.

**Target file:** `C:[code]

**Anchor** (insert after the first bullet of "Decision rules"):

```
- One stop vocabulary, closed, each entry pre-classified success- or
  error-shaped; extending it is a schema change with an owner.
```

**Draft:**

```
- **Across a language boundary, one authority means generated, not mirrored.**
  A vocabulary that crosses from the process that writes it to the surface that
  renders it usually crosses as a bare string, and the reflex guard is a parity
  test on the far side asserting that its list matches. It cannot: the test's
  list *is* the far-side copy, so it asserts a hand-kept mirror against itself
  and keeps passing on the day the two diverge — the gate cannot see its target
  ([gate-sees-target]([code]#gate-sees-target)). One authority here
  has one mechanical form: the far side's vocabulary is generated from the near
  side's definition, so a token that fails to propagate is a build failure rather
  than a rendered token nobody has a label for. Where generation is genuinely
  unavailable, the honest fallback is a loud unknown-token path at runtime, not a
  test that certifies a copy.
```

---

### proactive-nudges / efficacy-feedback

**Classification:** `amend`

**Reasoning:** The file is *not* absolute in the way the proposal reads it — the blockquote
already admits recovery ("recovery is earned by the acted-rate") and the global-ceiling
bullet already forbids raising total contact. The real gap is an asymmetry: the downward
path gets a window, a floor, hysteresis and coarse steps, while the upward path gets a
clause and no discipline at all. Amend to symmetrize and bound the recovery path, not to
loosen the prohibition.

**Convergence:** Yes — "never raise in response to non-action; a raise on an explicit
positive act is a different act, and must be bounded by sample size, step, ceiling and an
unchanged global cap" is the rule I reach independently; escalation-on-ignore is the
anti-pattern, and the file already says so in its own anti-pattern bullet.

**Target file:** `C:[code]

**Anchor** (insert after the first bullet under "Adaptation: down on ignore, never up on urgency"):

```
- Adaptation moves **per-kind caps only**, within the global ceiling; the
  user's total contact never rises because one kind performs well.
```

**Draft:**

```
- **The upward path gets the same discipline as the downward one, or it should
  not exist.** Recovery is named above and then left unmodelled, while decay gets
  a window, a floor, hysteresis and coarse steps — and an unbounded recovery
  clause is how "nothing raises a kind's volume" ends up read as forbidding the
  wrong thing. State the bound. A cap may rise only in response to an **explicit
  positive act**, never to the absence of one; by one step at a time; on a sample
  large enough that the acted-rate means something, over the same rolling window
  the decay side uses; to a ceiling a small fixed distance above the kind's base
  allowance; and always beneath an unchanged global ceiling, so what moves is the
  mix and never the total. Escalation on ignore stays forbidden exactly as
  before — ignoring is the vote, and volume is not an answer to a vote.
```

---

### proactive-nudges / triggers-triggers

**Classification:** `map-or-coverage`

**Reasoning:** Routing, not a hole — proactive-nudges owns machine-initiated contact and
this context is user-authored automation. Two of the three proposed governors exist
(`backend-platform/platform-observability/alerting`, `llm-agent/orchestration/hitl-approval`
for the auto / dry-run / approval modes); **no `cooldown-and-debounce` or scheduling
subject exists** — that half is a genuine forge lead for rate limits and active-hours
windows on user-authored rules. Also stale map data: the brief's [code] is not
on disk. Builder follow-up: drop the pair, add alerting + hitl-approval, regenerate paths,
raise the scheduling/cooldown lead.


## t-2

# Triage t-2 — 34 proposals from /conform backtest workers

Bar applied per intake [code] "## Corroboration" + "### Phase 7 - Land what
survived": a bounded counter-case observed in a real tree **plus** training-data
convergence (I reach the same rule without the proposal in hand). Where only (a)
holds, the row is a lead, not an amendment. No registry file was edited.

Counts: **amend 15 · application-citation 7 · map-or-coverage 12 · already-covered 0 · decline 0**
(Four rows carry an *already-covered core* with a narrower surviving residue —
flagged inline; they are the rows most at risk of being over-landed.)

---

### 1. quality-gates / blocking-by-input-determinism

**Classification: amend**

The axis presumes the gated subject is a commit. Where the gated act is an
irreversible activation against the moving system itself, the axis inverts and
the externally-fed gate must block — a carve-out the file does not make. The
proposal's "third terminal outcome" half is *already covered* by
`gate-liveness` ("three outcomes ... pass / fail / could-not-run") and
`unmeasurable-criteria` (REFUSE); the draft therefore reuses that vocabulary
rather than minting "Held".

**Convergence:** a gate over an irreversible act must separate "proved bad" from
"could not prove good", and an instrument/transport failure belongs to the
second — the pass/fail/unknown split I reach independently, and which
`gate-sees-target` already forces here.

Target: `C:[code]

Anchor:
```
When the reason a gate cannot block lies inside the repository, reach
for a ratchet; when it lies outside, a ratchet is the wrong instrument and the
answer is the split above.
```

Draft:
```
## When the gated act is not a commit

The axis assumes the gate's subject is the tree: a verdict that moves on its
own cannot be attributed to the change being refused. Where the subject is an
**irreversible activation** — arming a live integration against real
credentials, publishing an endpoint the outside world will call, promoting a
key — the assumption inverts. What is being gated *is* the interaction with
the moving system, so a verdict computed without touching it is exactly the
false green the gate exists to prevent, and the externally-fed check blocks.

Determinism still decides something here, but it decides the outcome
vocabulary rather than the permission. Such a gate needs the could-not-run
rung [gate-liveness]([code]) already demands, and an upstream
transport failure resolves there: refuse to promote, spend no repair budget,
and say which of the two happened. Spelling a transport failure as failure
sends someone to repair a credential that was never wrong.
```

---

### 2. sync-replication / topology-declaration

**Classification: amend**

The three shapes do not cover a hub that persists without adjudicating. Drafted
as a bounded condition *inside* hub-and-spoke rather than as a fourth shape —
the proposal's own framing — because the hub is present and only its ordering is
degenerate; minting a fourth shape beside three physics-based ones would blur
the taxonomy. The base-version demand the proposal asks for is already stated in
the hub-and-spoke paragraph; what is new is that this variant is *reached by
mistake* and that its conflict policy therefore goes undeclared.

**Convergence:** single-principal multi-device convergence on a non-ordering
store is a recognised sync shape, and "last-writer-wins is legitimate when every
writer is the same author, but only as a declaration" is a rule I reach cold.

Target: `C:[code]

Anchor:
```
submits carries what the spoke *believed* was current (a version, a base
hash), so the hub can tell an update from a stale overwrite.
```

Draft:
```
The variant worth naming, because it is reached by accident rather than
chosen: **a hub that only stores.** N replicas belonging to one principal
converge on an endpoint that persists whatever arrives — a blind upsert, a
put — and that endpoint orders writes only in the accidental sense that one
of them landed last. Read one replica at a time the stream looks like a
one-way mirror pointed the other way, which is precisely why the conflict
policy in this shape is the one most often left undeclared: nobody believes
there is a hub to declare it at. There is. It owes both of the shape's
obligations unchanged — a *declared* policy, where last-writer-wins is a
legitimate declaration when every spoke is the same author and an undeclared
default is not, and the base-version demand above, without which the store
cannot distinguish an update from a stale overwrite even under a policy that
says it need not care.
```

---

### 3. multi-project / passive-signal-ingestion

**Classification: amend**

The "where is the verdict stored" half is *already covered* ("could-not-observe
is durable state on the project (unwatched-since, with the reason)"). The
separable and genuinely absent claim is the second one: a failed pass must not
advance the since-cursor.

**Convergence:** checkpoint-only-on-success is a rule I reach independently
(offset commit after successful processing); advancing a cursor on a failed read
turns transient blindness into a permanently unread window.

Target: `C:[code]

Anchor:
```
- Watch freshness is itself a signal: "last successfully observed" is part
  of the project's summary row, so even the success path carries its age.
```

Draft:
```
- The verdict is also the **cursor's gate**. A watcher that reads
  incrementally holds a position — a last-seen stamp, a head pointer, a
  since-mark — and a could-not-observe pass must not advance it. Advancing on
  a failed pass converts a transient blindness into permanent loss: the
  window the watcher could not read is never offered again, and the next
  successful pass reports quiet over a gap nothing will revisit. So the
  position moves only on a verdict that actually observed, and where the
  watcher is a stateless poll, the position and the blind-since stamp live on
  the same durable subscription record and are written in one act — no path
  may update one without the other.
```

---

### 4. multi-project / per-project-tabs-and-state

**Classification: amend**

The file's enumeration ("each tab strip is one kind or the other by design")
denies a case the tree holds. Reframed from the proposal: on the technique's own
axis (does closing kill work?) a grouping strip is a *handle* strip, so a third
kind does not fit; what is genuinely new is the scoping invariant a set-valued
tab creates. Drafted that way.

**Convergence:** moderate — the weakest of the batch's amend rows. I reach "a
control scoped to a selection must bound the bulk actions offered beside it"
cold, and the file already owns the adjacent rule ("closing a tab edits the
working set and nothing else"), which is what makes this its home.

Target: `C:[code]

Anchor:
```
crash, a reload), reopening the tab **re-attaches to the still-running
work** rather than rebooting it — the tab was always a handle; the runtime's
survival is what proves it.
```

Draft:
```
A strip whose tab denotes a **set** rather than one project — a saved
grouping, a workspace, a scope over the portfolio — is still a handle strip
and inherits every rule above unchanged. What it adds is an ambiguity a
single-project tab does not have: every action offered beside it now has two
plausible reaches. The invariant is that **the active grouping bounds every
bulk and destructive action taken in its presence** — a select-all selects
within the group, an archive-all touches nothing outside it — and the active
grouping is keyed by minted identity like any other durable selection, with
an explicit guard for a stored id whose group no longer exists. A grouping
strip whose bulk actions quietly address the whole portfolio is the one
control an operator cannot afford to be wrong about, and the wrongness is
invisible until the action has already run.
```

---

### 5. guided-tours / home-learning

**Classification: map-or-coverage**

The golden path's precondition is coaching that points at the live interface and
"does not collect"; a release-roadmap surface is outside it, so half the
context's paths are unjudgeable against this subject. Builder follow-up: split
the context, and bank a corpus-hole lead for a roadmap/changelog-surface subject
under `ui-surfaces` (return condition: a second tree carries the same surface).
No technique edit.

---

### 6. design-tokens / density-and-scale-axes

**Classification: application-citation**

*Already-covered core.* `density-and-scale-axes` states the whole-surface-filter
trap with both teeth, and already names the first one as `gate-sees-target` ("a
contrast audit over the declarations passes while the filtered pixels fail").
The proposal's sharper form — the instrument that is fooled is the product's own
user-facing contrast readout — falls inside "every gate that reads token
*values*"; the widening (some of those gates are shown to users, not to CI) is
one clause and does not clear the convergence bar on its own.

What is genuinely worth landing is the field evidence: an exempt-token list, a
lock utility, and a hardcoded class-prefix counter-filter list are the
enforcement technique's "growing dialect" signature arriving through an axis
rather than through a deadline commit. Home:
`knowledge/software-engineering/ui-surfaces/feedback-and-style/design-tokens/applications/<stack>[code]
(the compensation vocabulary is enforcement evidence), cross-referenced from
`density-and-scale-axes`. Requires an opened tree for `verified_against`.

---

### 7. client-state / mastermind-tests

**Classification: application-citation**

The blanket ask ("each technique should carry a named verification shape") is a
corpus-editorial convention for `/forge` and `/librarian`, not a bounded
technique amendment, and it is partly self-answering: `singleton-lifecycle`
already carries "The test-reset hatch" framed as "the falsifiable form of the
claim", and [code] and
[code] already exist and already cite reset hatches and test
teardown. The remaining evidence (a pinned shared failure-transition function, a
restart round-trip, an IPC-unavailable fallback) is application material.

Home: [code]
— the one named technique with no application document.

Lead (not landed, needs its own corroboration): `persistence-and-migration`
could gain a retained-old-version fixture rule — a migration is proven by
loading an artifact written by the prior version, not by review. Return
condition: a second tree with a versioned client store.

---

### 8. diff-comparison / team-memory

**Classification: map-or-coverage**

The diff-honesty half is *verbatim already covered*: "The vocabulary matches the
alignment" states the rule and illustrates it with the same example (ids minted
fresh per run, so no element of A can match B, producing everything-added plus
everything-removed). The proposed "cheap detection rule" is that section
restated as a reviewer heuristic; it adds no case.

Actionable residue is the map: two listed paths do not exist and the two files
that actually carry the subject are unlisted, so the pair was only evaluable
through the `libs/` entries. Builder follow-up — same defect class as row 27.

---

### 9. motion / taste-budgets

**Classification: amend**

"Which wins" is arguably answered across the pair — `taste-budgets` caps stagger
*by count* ("the rest arrive plainly") and `performance-discipline` §5 points at
that cap for unbounded concurrency. What neither file has is vocabulary
separating a delay adopted for effect from a delay adopted for cost, which is
what lets a render-scheduling window present itself as an entrance and escape
the cap. Weakest amend in the batch on evidence; strongest on the shape of the
defect.

**Convergence:** yes — staggered mounting as a poor substitute for windowing is
a failure I would flag cold, and the corpus already carries the parent shape
("never let a set difference borrow the vocabulary of a change", diff-honesty).

Target: `C:[code]

Anchor:
```
  capped by count, so a long list ripples its first screenful and the rest
  arrive plainly. An entrance the user can outrun with their eyes is
  delaying data for theater.
```

Draft:
```
  That cap is a budget on **attention**, and it must not be read onto a delay
  adopted for **cost**. Spreading the arrival of content already in hand, so
  that a large collection does not commit in one frame, is a scheduling
  decision rather than a gesture: it buys frame budget, its length is set by
  the size of the work, and no entrance cap governs it because it is not an
  entrance. The two stay distinguishable in both directions. A cost-driven
  deferral may not borrow the entrance vocabulary — no easing, no travel, no
  stagger token — or it becomes an unbudgeted choreography the cap can no
  longer see. And an entrance may not be stretched to relieve render cost;
  the instrument for that is windowing the collection, after which the
  visible screenful gets its entrance and stays inside the cap.
```

---

### 10. motion / reduced-motion-mechanics

**Classification: amend**

The liveness rule stops at "subscribe ... wrap it and forbid the raw one",
which is right for a consumer that re-derives on notice and one rung short for
an engine that has already resolved the preference into a committed target. A
bounded counter-case the file does not cover.

**Convergence:** yes — "sample at use, not at bind" is the general rule; a
preference cached into a derived target is the stale-closure defect, and no
subscription reaches a value that was consumed rather than stored.

Target: `C:[code]

Anchor:
```
reader does not subscribe, wrap it and forbid the raw one. (The contract
itself — which signals exist and how they compose — is accessibility
territory; the mechanics of not fanning it out are this technique's.)
```

Draft:
```
Subscription is sufficient for a consumer that re-derives when it is
notified. It is one rung short for an engine that **resolves the preference
into a committed target**: a scripted loop that computes an end state at
registration time holds, from that moment, a copy of the preference no
notification reaches — travel already in flight runs to completion, and an
entry whose target is never set again never re-reads it at all. There the
mechanism is a third liveness shape: re-evaluate the merged signal **once
per tick, inside the loop, before any integration runs**, so a change lands
on the very next frame for everything currently moving. State its cost, since
it is the objection: one read of the merged signal per frame, paid only while
something is animating — and the engine is already awake then, which is the
argument for putting the read in the loop rather than at every registration.
```

---

### 11. markdown-vault / vault-catalog-autocred-ui

**Classification: map-or-coverage**

Matcher matched the bare word "vault"; the subject's precondition (the store is
a directory of markdown records) fails, and the governing subject already exists
at `knowledge/software-engineering/security/credential-vault/` — which
`p2p-networking`'s golden path already links by name. Builder follow-up: route
on precondition before vocabulary; re-pair the five `vault-*` contexts to
`credential-vault`. No technique edit.

---

### 12. p2p-networking / settings-network

**Classification: application-citation**

*Already-covered core.* `capability-feature-gating` rule 4 already says the
gated capability's entry points must fail explicitly with a "built without this
capability" signal rather than a missing symbol or silent no-op. The proposal's
widening is the audience — rule 4 is written for a developer wandering into
gated territory ("thirty seconds or an afternoon"), and a shipped lite variant
puts the same gap in front of an end user. Real, but one clause, and not enough
alone.

The evidence is good application material: the subsystem compiled behind the
flag exactly as prescribed, plus a first-class rendered state for the
compiled-without case. Home:
`knowledge/software-engineering/engineering-process/build-and-release/build-economics/applications/<stack>[code].

---

### 13. codegen / triggers-studio

**Classification: map-or-coverage**

Lexical false positive on "trigger" / "commit" / "registry"; the subject's
precondition (committed source derived from other committed source by a
registered generator) fails outright. Three builder/forge follow-ups, all
map-side, none a technique edit:

1. Drop the pairing.
2. Add the pairing the subject actually governs — the repo's real generator
   registry and its output roots — and judge it. The worker's concrete
   prediction (a generated binding still exported while its source module has
   been deleted) is `drift-gating`'s orphan-whose-source-died case and would be
   a first-pass find; that is a project finding, not registry content.
3. Route this context to `canvas-graph` and `draft-editing`, whose draft-model
   and completeness-derivation techniques it realizes.

---

### 14. credential-vault / api-vault

**Classification: application-citation**

All four acquisition-ladder rungs present in one tree is a complete set and the
technique's own claim is a ladder — worth citing. No rule change proposed and
none earned. Home:
`knowledge/software-engineering/security/credential-vault/applications/<stack>[code]
(the subject's applications directory currently holds
`go--token-refresh-lifecycle`, `rust--brokered-egress`, `rust--encryption-at-rest`;
`acquisition` has none). Needs an opened tree for `verified_against`.

---

### 15. credential-vault / triggers-triggers

**Classification: map-or-coverage**

Vocabulary resonance on "credential". The golden path's precondition is explicit
— the application must **retain** a foreign secret across sessions and use it
unattended — and an event-trigger list does not. Builder follow-up: re-pair to a
scheduling/event-trigger subject; also one listed path does not exist on disk
(same defect class as rows 8 and 27).

---

### 16. credential-vault / health-probing

**Classification: amend**

The three-state vocabulary and the one-authority rule are stated; what is not is
that the vocabulary's width must survive every *representation*, not just every
*surface*. The technique names display surfaces as the drift point; the measured
loss points here are a catch clause, a persisted boolean, and a declared return
type — all upstream of any renderer.

**Convergence:** yes, strongly. A three-valued domain stored in a two-valued
type is lost at the type; "the badge is the only place the third state ever
existed" is the predictable end state, and the audit is a type walk.

Target: `C:[code]

Anchor:
```
could-not-reach must never be *recorded as a credential failure* — a provider
outage written into the failure ledger indicts every credential behind it,
and the indictment outlives the outage.
```

Draft:
```
The vocabulary's width is a property of **every representation the verdict
passes through**, not only of the surface that renders it. Three narrowings
recur, and each deletes the third state long before a badge is reached: a
failure handler that converts an unreachable provider into the rejected
outcome, because the catch clause has one path out; a persisted column typed
as a boolean, which holds *verified* and *not verified* and has nowhere to
put *not verified yet*; and an intermediate accessor whose declared return
type is narrower than the store's, collapsing the state on the way out. The
audit is therefore a type walk rather than a screenshot: follow one probe
result from the call that produced it, through every type it is declared as,
to the column that stores it, and confirm the third state is representable at
each hop. Where it is not, the third state exists only in the renderer —
which is to say it does not exist.
```

---

### 17. analytics-time-windows / schedules-components

**Classification: application-citation**

An upward lesson realized, not a rule missing: modelling a past scheduled slot
as projected / past-success / past-failure / past-unknown and refusing to colour
a slot from the trigger's overall health is `failure-not-empty-success` on a
calendar surface, and the half-gap tolerance cap for binding nominal slots to
observed runs is a reusable mechanism. Home:
`knowledge/software-engineering/engineering-assessment/measurement-method/analytics-time-windows/applications/<stack>[code]
(note [code] already exists — extend it rather than
opening a second file, or pick the technique the mechanism actually lands under).
Pairs with row 29, which is the same tree seen from the scheduler's side.

---

### 18. data-viz / metric-identity

**Classification: amend**

An enumeration mismatch inside one file: the prose contract lists name, unit,
precision, derivation, window, grain, population, source and polarity; the
variant-registry paragraph declares only surface, window and source. The fields
the registry omits are the fields that fork, and polarity forks first because it
is needed at render time and there is nowhere else to reach for it.

**Convergence:** yes — a registry narrower than the contract it implements
relocates the forks to the fields it declined to hold. Reached cold, and it is
the corpus's own Phase 6 "which file *measures* it" hunt.

Target: `C:[code]

Anchor:
```
A registry of declared variants is the honest middle between a false single
number and silent forks — the reader can be told why two pages differ; with
forks, nobody can.
```

Draft:
```
The registered variant carries the **whole** contract, not the members that
happen to differ today. A registry declaring only surface, window and source
leaves unit, precision and polarity outside the vocabulary — and a member
outside the vocabulary is a member each call site supplies. Polarity goes
first, every time, because it is needed at the moment a delta is coloured or
an arrow is pointed and there is nowhere else to reach for it: within one
release of adding the registry, the same metric is being coloured from a
boolean passed in at three call sites, which is precisely the fork the
registry was built to prevent. So the variant record names every member of
the contract above, and consumers read unit, precision and polarity from it
rather than deciding them locally. A registry narrower than its contract does
not stop the forks — it relocates them to the fields it declined to hold.
```

---

### 19. media-playback / playback-clock

**Classification: amend**

A bounded counter-case to a stated permission. The fan-out section explicitly
allows "the consumer samples on its own slow interval ... the cadence is the
consumer's choice"; the tree shows a correct clock growing an un-throttled
consumer beside a hand-throttled one, because one undifferentiated `subscribe`
makes `subscribe(setState)` the shortest line that typechecks.

**Convergence:** yes, and it is internally corroborated twice in the same
corpus — `reduced-motion-mechanics` ("wrap it and forbid the raw one") and
`performance-discipline` ("per-surface authors never face the choice").

Target: `C:[code]

Anchor:
```
- **On-demand consumers** (persistence, analytics, "resume from here") read
  the reference at the moment of need and store nothing continuously.
```

Draft:
```
One correction to the permission above: the cadence is the consumer's choice,
but the **shape of the door** is not. A clock exposing a single
undifferentiated subscription hands every consumer the frame-rate tick and
asks each to throttle itself, which makes the most expensive subscription the
shortest correct-looking line in the surface — passing the reactive setter
straight into it typechecks, runs, looks fine on a fast machine, and
reintroduces in one call the whole defect this technique exists to prevent.
So the coarse cadence ships as a **named verb** beside the raw one: a
bounded-rate subscription that takes its rate, and a frame-rate subscription
whose name says what it costs. The throttling then lives in the clock, once,
where its correctness is one implementation rather than one per consumer. An
interface whose safest use is also its shortest is the only kind that
survives a second author.
```

---

### 20. deployment-contract / agents-deployment

**Classification: amend** (plus a banked coverage lead)

Two separable items. The amendable one: `deploy-gate-coupling` worries only about
*when* the verdict arrives relative to the deploy; a verdict arriving at the
right time about the wrong executor is a second failure of the same law, and the
file's only parity clause is about the check *set*, not the target. Note the
file's `laws:` do not yet include `gate-sees-target`, which this adds.

**Convergence:** yes — "exercise the artifact at the address production serves"
is smoke-test doctrine, and the law it needs already exists in this corpus.

**Coverage lead (not landed):** every technique in the subject presupposes the
repository is the thing deployed. A repository whose *product* deploys
third-party artifacts on a user's behalf, at runtime, per user, reproduces the
subject's exact failure shapes while four of five techniques route out because
the governed object is user data. Lead: a subject or technique for the runtime /
in-app deploy contract, where a committed manifest is replaced by reconciliation
of untracked remote state. Return condition: a second tree with a
reconcile-remote-state deploy surface.

Target: `C:[code]

Anchor:
```
- Never leave both consumers wired to the push with neither resolution; that state is
  indistinguishable from having no gate on production.
```

Draft:
```
- Point the verifying check at the address production serves, never at a
  local or replica twin of it. Timing is one half of the coupling and address
  is the other: a verdict can arrive at exactly the right moment and still
  describe the wrong executor — a check that starts its own copy of the
  artifact, or exercises a staging replica, and reports on it as though it
  had reached the deployed one. The race is closed, the ordering is correct,
  and nothing has verified what production serves
  ([gate-sees-target]([code]#gate-sees-target)). A green verdict
  names the target it exercised, or it is not readable as a verdict about the
  deployment at all.
```

---

### 21. draft-editing / agents-editor

**Classification: map-or-coverage**

Not a rule question: the context's sampled paths are the twelve component files
while every load-bearing realization sits in the sibling `libs/` and `hooks/`
directories, so the pair reads as unimplemented. Builder follow-up, and the
generalisable form is worth stating in the map builder: **a context that samples
only the view layer will read as unimplemented for any subject whose machinery
sits one directory over.** No technique edit.

---

### 22. draft-editing / templates-draft-editor

**Classification: map-or-coverage**

The golden path's boundary section answers this outright — a form is "the
one-shot cousin: compose a valid mutation, submit it once, leave", and a draft
editor's defining lifecycle is continuous partial saves behind a publish gate.
The matcher paired on the literal directory name. Builder follow-up: route to
`form`.

Lead (not landed): `form` may owe a technique about guarding an
expensively-produced one-shot payload — the two techniques that still bite here
do so because a paid generation produced the buffer. Return condition: a second
tree where a metered generation fills a one-shot form.

---

### 23. accessibility / home-cockpit-widgets

**Classification: application-citation**

*Half already covered.* The existing application
[code] already documents
the drain queue and the keyed-remount defeat of platform deduplication, at the
same file and line range the proposal cites — so that data point is banked and
should not be re-landed.

The surviving half is real and unhomed: an in-app toggle projected onto the
document root and observed with a mutation observer alongside the media query is
a concrete mechanism for `preference-respect`'s abstractly-stated composite
signal, and `preference-respect` has no application document. Home:
[code].
Pairs with row 10, which is the same mechanism seen from the motion engine's
side.

---

### 24. long-form-reading-surface / shared-components-layout

**Classification: map-or-coverage**

The golden path routes this itself ("The frame around whole routes ... belongs to
app-shell"), and `app-shell` exists at
`knowledge/software-engineering/ui-surfaces/shell-and-navigation/app-shell/`.
Builder follow-up: re-pair both contexts to `app-shell`.

Forge follow-up (not an amendment I will draft): marking
`fixed-chrome-offset-budget` `shared_with: [app-shell]` is well argued — the
golden path already states the failure generically ("Every element pinned against
fixed chrome ... N independent estimates of one geometry"), and `shared_with` is
a live field in this corpus. It is a governance change requiring the receiving
subject's owner, not a text edit, so it belongs to a forge pass rather than to
this triage.

---

### 25. codebase-scanning / plugins-dev-tools-triage

**Classification: amend** (golden path, wall 3)

Wall 3's evidence requirement, and wall 4's verifier that "re-reads the claimed
location", are both written for a sensor that matches text. A threshold-over-
telemetry sensor has no line to quote, and a majority of a mature emitter roster
is that shape.

**Convergence:** yes, and internally corroborated twice. The corpus already owns
the alternative evidence shape as a law (`count-carries-predicate`, uncited by
wall 3), and `doc-rot-detection` already runs re-measurement as verification
("counts that no longer reproduce — where a claim states both number and
predicate, re-run the predicate and compare").

Target: `C:[code]

Anchor:
```
A finding without quoted evidence is an opinion with a timestamp, and it
poisons the pipeline twice — it cannot be verified, and it teaches operators
that findings in general cannot be trusted.
```

Draft:
```
That requirement is written for a sensor that matches text, and half a mature
roster is not. A sensor reading an **aggregate** — a spend concentration, an
error rate, an interval since last use, a proportion crossing a floor — has
no line to quote, and forcing one on it produces a citation pointing at the
least informative place the number happened to touch. Its evidence is the
other shape the laws already demand: the measured value, the predicate it was
measured under, the threshold it crossed, and the window
([count-carries-predicate]([code]#count-carries-predicate)).
Verification splits along the same seam. A located finding is re-checked by
re-reading its location; a measured one is re-checked by **re-running the
measurement** — the stronger of the two verifiers, because it distinguishes
resolved from merely moved, and it cannot go stale against a tree that was
refactored underneath the claim.
```

---

### 26. webhook-ingestion / delivery-logging-and-replay

**Classification: amend** (narrowed)

*Already-covered core.* The redaction/replay half is stated verbatim in the
file — "redaction and replay consume the same field ... does not disable replay,
it silently converts it into re-delivering the redaction marker ... replay either
reads the payload from wherever the admitted copy durably lives, or refuses
loudly", and body redaction is already scoped per-subscription rather than
wholesale. Do not re-land it.

What survives is the second, smaller point, and it is an internal asymmetry: the
file keeps rejected deliveries precisely so a signature failure can be examined,
then prescribes a replay that re-signs — which can never reproduce one.

**Convergence:** yes — replay-for-reprocessing and replay-for-diagnosis have
opposite requirements, and only naming both keeps `one-validation-door` intact
while making a rejection reproducible.

Target: `C:[code]

Anchor:
```
does replay fall back to an operator-authority admission — a distinct,
logged reason, never a general "skip verification" flag that live traffic
could reach.
```

Draft:
```
Re-signing serves reprocessing and defeats diagnosis, and the record is kept
for both — rejected rows exist so a rejection can be examined, and a replay
that re-signs enters as a *well-formed* delivery that can never reproduce the
failure it was invoked to explain. So replay declares which of two intents it
carries. **Reprocess** re-signs and re-earns admission, exactly as above.
**Reproduce** presents the recorded request as recorded, original signature
header included — which means that header is held out of the redaction
denylist deliberately, as a decision, not by omission — and its outcome,
rejection included, is the result rather than a malfunction. Reproduce is a
verification pass against the record, never a second admission path: it mints
no event and admits nothing. And a reproduce that now passes where the
original failed is itself a finding, because something in the door has moved.
```

---

### 27. canvas-graph / teams-canvas

**Classification: map-or-coverage**

Map health, and the batch's most-repeated defect: twelve vanished paths in this
row, a thirteenth in another, three more in a third — plus the independent
sightings in rows 8, 15 and 21. Builder follow-up as proposed: verify path
existence at map-generation time and mark a row whose paths have largely
disappeared as **stale** rather than emitting it for judgement, because a worker
cannot distinguish "the feature was deleted" from "the feature was renamed and
the subject still governs it". Six sightings across this batch alone; this is the
highest-value non-content follow-up in the set.

---

### 28. canvas-graph / vault-dependency-graph

**Classification: amend** (golden path)

The golden path names the renderer off-ramp and then hands off to six techniques
all written for the editor case, so a renderer-shaped context must re-derive
which clauses still bind — and `not-applicable` becomes available as a blanket
excuse for four of six. Naming what the off-ramp keeps is what closes that.

**Convergence:** yes on the substance. For a generated diagram I independently
reach: layout determinism (including tie-breaking) survives, because a diagram
that redraws differently from identical input has lost the only thing generated
layout offers; shared anchor geometry survives, because edges float off nodes for
the same reason whether or not anyone can drag them; and the accessibility model
survives wholly, since an infinite surface has no native reading order regardless
of editability. What retires is exactly the user-data half.

Target: `C:[code]

Anchor:
```
tree or table where topology *does* matter forces the relationship model into
prose, tooltips, and the user's head.
```

Draft:
```
## The read-only renderer keeps more than it retires

The renderer off-ramp above is a stage of this subject, not an exit from it,
and it is worth stating what crossing it settles — otherwise every technique
below has to be re-derived at each renderer-shaped surface, and the ones that
still bind are the ones quietly dropped.

**Retired:** placement provenance and the user-authored/generated
distinction, layout persistence and its migrations, the placement policy for
new nodes, every direct-manipulation mechanic, and — where the diagram is fit
to its container rather than explored — the transform authority itself.

**Kept, in full:** layout determinism including tie-breaking, because a
diagram that redraws differently from identical input has lost the one thing
a generated layout offers; memoization wherever hover or selection re-renders;
the shared node/edge anchor geometry, since edges float off their nodes for
the same reason whether or not anyone can drag them; focus-context economy at
the edge level; and the entire accessibility model, which a generated diagram
inherits unchanged and unearned.
```

---

### 29. scheduling / schedule-observability

**Classification: amend**

The technique demands cause and represented due time *on the run record*, and
demands the non-fire ledger be written at decision time by the decider. All four
surfaces are specified from the decider's side; nothing requires the reasons to
survive the read path, which is where this pair actually fails.

**Convergence:** yes, and the corpus already holds the law that says it —
`verdict-survives-boundary`, which this technique does not currently cite. A
ledger no consumer can query is a write-only log.

Target: `C:[code]

Anchor:
```
- If an occurrence can be swallowed at a decision point and that point writes no
  record, the point is not done — the empty log after an incident is this technique's
  definition of failure.
```

Draft:
```
- The four surfaces are specified from the decider's side, and a ledger with
  no reader is a write-only log. The non-fire ledger is consumed by displays
  that must account for occurrences which were due and did not run, so the
  reasons the decider wrote survive the read path intact
  ([verdict-survives-boundary]([code]#verdict-survives-boundary)):
  it is exposed as a queryable read model over the same reason tokens,
  joinable to the item and to the occurrence it declined, and a run record
  carries its cause and its represented due time across the API boundary, not
  merely into the store. A read contract returning real runs only, with no
  cause and no due time, leaves a consuming surface exactly one honest option
  — an undifferentiated *unknown* over every declined occurrence — which is a
  correct refusal to assert and a total loss of the evidence the decider took
  the trouble to write.
```

---

### 30. docs-sync / doc-rot-detection

**Classification: amend**

Dead references are currently a *staleness signal*; the proposal makes them a
verdict rung above stale, and the argument holds on both precision and blast
radius: a document whose references have all been renamed away couples to
nothing, so it lands in `unverifiable`, which is the tracked population nobody
reads first — the one available verdict for the highest-risk document has no
rung.

**Convergence:** yes. A near-perfect-precision mechanical check outranking a
timestamp inference is an ordering I reach cold, and "proven wrong" strictly
dominates "suspected of drift".

**Caveat recorded, per the worker:** this bundle appears to have been forged from
the same tree these verdicts were measured against, so the pair's independent
evidential weight is low. Convergence is what carries this row, not the sighting;
a cross-repo backtest is the return condition before treating it as two-sighting.

Target: `C:[code]

Anchor:
```
- **fresh** — coupling established, and nothing in it postdates the doc.
```

Draft:
```
A fourth rung sits **above** stale, and folding it into staleness as a mere
signal costs exactly the documents that need it most:

- **broken** — the document's named files, commands, identifiers or anchors
  no longer resolve. This is not drift suspected from a timestamp; it is a
  document proven wrong by a mechanical check with near-perfect precision,
  and it outranks stale for that reason alone.

The ordering matters because of where broken documents land otherwise. A
document whose every reference has been renamed away couples to nothing, so
the ladder drops it into unverifiable — a population tracked, counted, and
read last. The one verdict available for the highest-risk document had no
rung to occupy. So the rungs run broken, stale, unverifiable, fresh, and the
content signals are evaluated *before* the coupling ladder resolves rather
than after it — guarded, as ever, against tokens the extractor truncated,
which is where this check's precision is actually spent.
```

---

### 31. adoption-measurement / template-adoption-persona-layout

**Classification: map-or-coverage**

Vocabulary collision on the subject's own headline noun. The golden path's
precondition is explicit — "You are measuring other people's behaviour, not your
own product's", across a stated eligible population — and a template-
instantiation wizard has no population. Builder follow-up as proposed: demote a
lexical match on a subject's headline noun when the golden path's precondition is
population-level measurement and the context has no population; re-pair to a
form/wizard subject. No technique edit.

---

### 32. adoption-measurement / template-adoption-questionnaire

**Classification: map-or-coverage**

Same collision, sibling context. Resolves with row 31; carry one builder
follow-up, not two.

---

### 33. connector-catalog / vault-catalog-picker

**Classification: application-citation**

`catalog-as-data` already describes this shape and already calls it "observed
working in the field" — a row-metadata-first read with a static-table fallback,
unioned, documenting its own migration direction in place. That phrasing is an
application-evidence invitation, and no rule change is asked or earned. Home:
`knowledge/software-engineering/integration/connector-catalog/applications/<stack>[code]
(the directory currently holds `react--adapter-normalization` and
`react--schema-driven-forms`). Needs an opened tree for `verified_against`.

---

### 34. settings / api-key-management

**Classification: map-or-coverage**

Directory-vocabulary match. The golden path's subject is a durable key-value
substrate whose defining property is that "reads never fail loudly"; credential
management that happens to live under a settings directory is governed by
`credential-vault`, whose precondition (retention of a foreign secret, used
unattended) it meets. Builder follow-up: route the context to `credential-vault`,
or narrow the pairing to the two surface-shaped techniques that genuinely reach
it. Same root cause as rows 11, 15, 31 and 32 — route on precondition before
vocabulary.

---

## Cross-cutting follow-ups for the builder / forge lanes

1. **Stale map rows** (rows 8, 15, 21, 27 — six independent sightings). Verify
   path existence at map-generation time; emit a row whose paths have largely
   disappeared as `stale`, not for judgement.
2. **Route on precondition, not vocabulary** (rows 11, 13, 15, 22, 24, 31, 32,
   34 — eight sightings). Every golden path in this corpus states its
   precondition in its opening; the matcher is scoring slugs and headline nouns
   against it. This is the single largest source of unusable pairs in the batch.
3. **View-layer-only path sampling** (row 21): a context sampling only components
   reads as unimplemented for any subject whose machinery is one directory over.
4. **Corpus-hole leads banked, none landed:** a roadmap/changelog surface subject
   (row 5); a runtime / in-app deploy contract (row 20); a `form` technique for an
   expensively-produced one-shot payload (row 22); a
   `persistence-and-migration` retained-old-version fixture rule (row 7). Each
   needs a second sighting.


## t-3

# Triage t-3 — /conform backtest proposals

Bar applied: (a) bounded counter-case observed in a real tree + (b) training-data
convergence (I reach the same rule without the proposal in front of me). (b) failing
demotes an amendment to a lead. No registry file was edited.

---

### llm-call-telemetry-model / golden path (context: api-key-management)

**Classification:** `map-or-coverage`

**Reasoning:** The proposal is right and the destination it gestures at already exists —
`knowledge/software-engineering/security/credential-vault` ("holds *other people's
secrets* — credentials issued by external authorities… An API key"), with
`software-engineering/security/authorization` secondary; the match here came from
`server-owned-fields`' writing-credential-stamp vocabulary, not from the golden path's
stated precondition ("a receiving schema… an accounting record that happens to arrive
over an untrusted channel", plus its explicit boundary "emission is not this subject").
Nothing in the telemetry subject should change.

**Follow-up (builder/forge, not a technique edit):** re-point the `api-key-management`
context at `software-engineering/security/credential-vault`; drop this pair from the
backtest rather than scoring it. Not a corpus hole — the corpus has the subject, the map
has the wrong edge.

---

### breach-alerting-and-attribution / golden path

**Classification:** `amend`

**Reasoning:** The golden path draws the builder/operator seam but never says which of its
obligations *survive* the crossing, so a reader on the wrong side of the seam reads the
whole standard as inapplicable; the proposal's split (level-not-edge dedup and
answer-the-next-question are audience-independent; the payload and transport rules are
conditioned on an unenumerable audience) is the split the file's own structure already
implies but does not state.

**Convergence:** Reasoning from the obligations alone, the storm rule follows from the
window's arithmetic and the attribution rule from what an operator does next — neither
mentions an audience — while the refusal, signing and vetting rules all begin from "the
system cannot enumerate who reads this". Same partition, independently reached.

**Target file:** `C:[code]

**Anchor** (insert after these lines, which end the seam paragraph, before `## The three obligations of a breach alert`):

```
visible. Builder-side intuitions — "just query the events behind the alert" —
fail by construction: there are no events behind the most important alerts.
```

**Draft:**

```
The seam is an audience precondition, and it cuts the standard rather than
switching it off. Ask it first: is this payload broadcast to an audience the
alerting system cannot enumerate? When the answer is no — a single local
operator reading their own instrument, already holding full read access to
everything the alert could have said — the rules that exist to bound a payload
lapse: there is no identity boundary to refuse at, no transport to sign, no
unknowable membership to assume. Two obligations do not lapse, because neither
was ever about the audience. A rolling-window breach is still a level and not an
edge, so a local alerter that fires per detection storms exactly as a broadcast
one does, and its reader mutes it just as fast. And a bare fact is still a
homework assignment, so the alert still answers what is burning the money, at
whatever granularity that reader is already entitled to. Route on the audience
question, not on the vocabulary of budgets, caps and spend.
```

*(This also lands the routing half of the proposal: the precondition becomes a sentence a
matcher and a reader can both use, instead of cost/alert vocabulary.)*

---

### operator-surfaces-for-llm-spend / golden path (context: glyph-persona-card)

**Classification:** `map-or-coverage`

**Reasoning:** Self-diagnosed correctly as a `glyph` vocabulary collision — a severity
index over money versus a decorative capability sigil — and the governing subject exists:
`software-engineering/ui-surfaces/feedback-and-style/status-vocabulary`
(`vocabulary-chain-integrity`, `status-color-mapping`), with `data-viz/encoding-vocabulary`
secondary. The proposed "renders no cost/budget/token/margin value" gate fails convergence
test (b): it is a statement about registry routing rather than about the craft, and the
file already presupposes spend in its opening sentence ("telemetry, pricing, attribution,
margin — ends in a person reading a table and deciding something") and in every `use_when`
line. Recording it as a routing rule, not as a golden-path amendment.

**Follow-up (builder/forge):** re-point `glyph-persona-card` at `status-vocabulary`;
consider a matcher rule that a subject whose techniques all presuppose a monetary quantity
does not match a surface with no such quantity.

**Project finding to relay** (not a registry edit, and it belongs to the status-vocabulary
pair rather than this one): a local trigger-icon map declared inside one preview component
escapes the canonical totality-gated map ([code], used at `:155`,
vs [code]) — it already disagrees on one kind and omits five
storable kinds, so a new kind compiles clean and renders wrong there. That is
`vocabulary-chain-integrity`'s defect class exactly.

---

### evidence-bound-visuals / figure-must-cite-a-fact

**Classification:** `amend`

**Reasoning:** Every enforcement sentence in the technique presumes an author that can be
thrown at ("Enforce in a validator… deterministic parsing code that throws", "Reject per
unit, not per batch"); it has no account of a second author — a person typing into a field
the interface has already bound — where there is nothing to reject and the honest
instrument is a standing count that gates the step's reported state. A tree taking that
path reads as non-conformant on a path the technique never considered.

**Convergence:** The block-versus-surface split by author class is a rule I reach
unprompted — machine output is rejected at the boundary because rejection is cheap and the
producer can be re-run; human input is measured and surfaced because a hard refusal
destroys the draft and teaches the author to route around the field. Same rule, same
reason.

**Target file:** `C:[code]

**Anchor** (insert after procedure step 5, before `## Decision rules`):

```
   collection is more forgiving — a bad scene is still dead — it just stops
   taking its siblings with it.
```

**Draft:**

```
## When the author is a person, the gate is a count

The procedure above assumes an author that can be thrown at: a generator whose
output is refused before it reaches the compositor, and re-run at the cost of a
call. A second author breaks the assumption — a person typing into a field the
surface has already bound to a fact record. There is nothing to reject there:
the binding is structural, the value is chosen by hand, and refusing the entry
destroys a draft rather than a violation. The obligation is unchanged; its
instrument moves. Carry a standing count of bound against unbound over the
piece's checkable elements, surface it where the author is working, and let it
gate the *step's* reported state rather than the keystroke — a step holding
unbound figures is not complete and says so, in the same place the author reads
everything else about that step. A throw guards a pipeline; a count guards a
person, and only the second survives an author who can simply stop typing.
```

---

### video-assembly / music-spotting-against-picture  *(reconciliation with derived-turn-markers)*

**Classification:** `amend`

**Reasoning:** The named contradiction is real and one-sided. Step 2 ("Mark in and out
points as times on the master clock, not as scene references") reads as if a typed
timecode were the only way to address the clock, while `derived-turn-markers` in the same
subject calls a stored time "an impression wearing a number" — and this technique's own
last decision rule already assumes cues are *attached to structural marks* and re-derived
on retime. So the file contradicts itself before it contradicts its sibling; the wrong
sentence is step 2, and that is where the reconciliation goes (no link — the two are one
rule stated at different grains).

**Convergence:** Anchored-plus-offset timing over absolute constants is the standard
resolution wherever a timeline can be retimed; I reach "store the derivation, resolve to a
time" without the proposal, and the corpus's own coincidence-trap argument reaches it too.

**Target file:** `C:[code]

**Anchor** (insert after step 2, before step 3 `**Attach a purpose to each cue**`):

```
2. **Mark in and out points as times on the master clock**, not as scene
   references. A cue may enter mid-scene and exit mid-scene; scenes are
   context, the clock is the address.
```

**Draft:**

```
   Read that as a rule about the cue's *address*, not about its storage. The
   address must resolve to a time on the master clock and must stay free to
   resolve inside a scene; how it is held is a separate question, and the
   stronger answer is a derivation over the picture — a structural mark plus an
   offset — rather than a constant somebody read off. Two defects are being
   forbidden here, not one: a cue positioned by a scene *reference* the renderer
   cannot turn into a second, and a cue whose typed number nothing recomputes
   when the picture is retimed. Both put the cue in the wrong place; only the
   second looks correct while doing it. Storing the derivation costs expressing
   mid-scene entries and exits as offsets instead of bare times, and buys
   re-derivation on every retime — pay it, because a cut is retimed far more
   often than a cue is moved by hand. An absolute time against a structural mark
   is one form of the derivation, not an alternative to it.
```

---

### review-iteration-loops / refusal-as-valid-outcome

**Classification:** `amend`

**Reasoning:** Chose `amend` over `application-citation` because the case is a bounded
condition on the ordering rule, not a lesson about one tree: refuse-before-apply assumes
the guard is as certain as the rule it enforces, and has no account of a guard whose
detection band is narrower than its rule. The file's "When NOT to use it" covers notes
that are merely hard, ambiguous or expensive — not enforcers that may be wrong, a
different axis. An application document citing the observed `file:line` is still worth
writing afterwards; the rule comes first.

**Convergence:** Break-glass with a recorded justification is the settled answer wherever
a check cannot be certain and a hard block would make the guarded path the expensive one —
override available, never one click, and permanently stamped on the artifact rather than
on a log nobody reads. Reached independently; the proposal describes the same shape.

**Target file:** `C:[code]

**Anchor** (insert at the end of "Refuse before apply — the ordering rule", before `## When NOT to use it`):

```
and the drift surfaces as the same note being refused by one pen and
honored by the other.
```

**Draft:**

```
The ordering assumes the guard is at least as certain as the rule it enforces.
Some guards are not: one that can only see a proxy for the violation — a
threshold, a heuristic, a check over whichever part of the material happens to
be machine-readable — inherits the ordering but not the authority, and a hard
block there makes the guarded path the expensive one and teaches everybody to
route around it. Keep the ordering and split the outcome. The verdict still
lands before the result is computed, and proceeding anyway stays available but
never free: a deliberate second act rather than one click, and an override
receipt stamped permanently onto the version, carried wherever that version is
named rather than buried in a log. The violation is then recorded instead of
prevented, which is the honest trade when the enforcer cannot be sure — and a
guard whose overrides are all visible is one whose band can be measured and
widened.
```

---

### image-prompt-composition / golden path (context: imaging-providers)

**Classification:** `map-or-coverage`

**Reasoning:** Self-diagnosed and correct. The golden path's stated precondition is the
compiled artifact — "a prompt is a **contract with a structure**", `use_when` "building a
prompt compiler for batch image generation" — so the subject governs the compiler, and the
mapped provider-adapter paths hold no subject for eight of eleven techniques; the match is
`prompt` / `negativePrompt` / `imaging` vocabulary overlap. No technique is wrong and no
rule should change.

**Follow-up (builder/forge):** re-point this subject's context at the compiler paths, and
keep only `negative-prompting`, `prompt-budget-limits`, `prompt-dialect-matching` and
`reference-role-map` against the provider layer — those four are genuinely per-vendor
adapter concerns and the rest have no seam there. Worth checking whether the context map
generally needs a compiler/adapter distinction rather than one path set per subject.

