# XL spec — `modelled-performance-estimates`

- **Run:** `llmfit-0903` (`/intake` v2.3 over `github.com/AlexsJones/llmfit` @ `d19380ba`)
- **Status:** DISPATCHED
- **Bundle:** `software-engineering`
- **Category:** `engineering-assessment/measurement-method` (flat subcategory holding
  subjects only — verified against `knowledge/software-engineering/taxonomy.json`,
  `categories[8].subcategories[0]`; adding a sixth subject beside
  `measurement-honesty`, `analytics-time-windows`, `metric-forecasting`,
  `people-analytics-ethics`, `peer-benchmarking` creates no nesting conflict)
- **Resulting link depth:** four `../` to `_laws.md` from a technique file
- **Source tree for reconciliation:** `C:/t/llmfit-0903` (read-only; a Rust workspace,
  ~54k lines. The relevant modules are `llmfit-core/src/fit.rs`,
  `llmfit-core/src/analysis.rs`, `llmfit-core/src/benchmarks.rs`, and the design
  document `docs/how-it-works.md`.)

## Why this is a subject and not three techniques

Three load-bearing decisions in the source tree have no home anywhere in the corpus,
and they are not independent — each one is a consequence of the same situation, which
no existing subject describes: **a number the system publishes may have been measured,
or may have been computed from a model of the hardware, and the two are indistinguishable
by unit.** The source states it in one sentence: *"A measured throughput and a formula
guess are both tok/s."*

That situation generates its own pipeline — derive, calibrate, reconcile against
whatever measurements exist, emit with provenance, refuse where the inputs are missing —
and a technique dropped into a neighbouring subject would carry the pipeline implicitly
without anyone being able to read it.

## Why not the obvious neighbours

**`metric-forecasting` is the near miss, and the discriminator must be stated in the
new subject's opening.** It owns the same *asymmetry* — its golden path says a rendered
forecast "carries the same visual authority as a rendered measurement", which is this
subject's problem in a different medium — and `fit-confidence-honesty` is a genuine
neighbour. But its unit of work is a **time series extrapolated forward**: history
exists, the estimate is the history's continuation, and the repair is refusal to
display. This subject's estimate has **no history at all**. It is cross-sectional: a
model of the system (a bandwidth figure, a parameter count, an architecture's
per-token traffic) produces a value for a configuration nobody has ever run, and it is
later *replaced* by a measurement of that exact configuration or *calibrated* by
measurements of neighbouring configurations on the same hardware. Different input,
different failure mode, different repair.

> The discriminator to write: **does the estimate come from the metric's own history,
> or from a model of the system?** Extrapolation belongs to the neighbour; derivation
> and reconciliation belong here.

**`measurement-honesty`** owns whether a measurement was honestly taken. This subject
begins where no measurement was taken at all.

**Do not absorb, and do not link across bundles:** `recruiting`'s
`evidence-provenance-weighting` holds the same *shape* as the provenance ladder below
(`provenance-trust-ladder`, `strongest-provenance-wins-consolidation`,
`default-provenance-fails-safe`) for candidate evidence. Cross-bundle links are
forbidden. State the shared shape in prose if it helps the reader, name no bundle.

## Proposed techniques

Four, each with the decision rule it must carry. The drafter may rename, may merge two
if the boundary genuinely collapses, and **is expected to override this list where the
neighbours' stated scopes say otherwise — say so in the report with the argument.**

### 1. `confidence-travels-with-the-value`

**Rule:** when a field can be filled by a measurement or by a model, the class of
evidence is a sibling field of the value, never a convention, a doc comment, or a
formatting difference. First match wins down an ordered ladder, and the ladder is
published.

The source's ladder is five rungs and the drafter should generalise the *shape*, not
copy the rungs: measured on this machine → measured by others on matching hardware →
formula scaled by a factor derived from runs on this hardware → formula alone → no
estimate possible. The load-bearing part is that rungs 1-2 and 3-4 differ in **what a
consumer may do with them**: a measured value may anchor a calibration, a modelled one
may not, or the calibration feeds on its own output.

Must state: what "matching hardware" means is a *policy* the ladder publishes, not an
implementation detail — the source keys it on CPU + GPU identity, and a looser key
would import a stranger's numbers.

Cite `unknown-is-not-a-value`. Note the boundary with the recruiting shape in prose only.

### 2. `refuse-rather-than-emit-a-sentinel`

**Rule:** when an estimate's required input is unavailable, the field is absent — not
zero, not minus one, not a plausible default. The source's own case is exact and worth
carrying: prompt-processing throughput needs the GPU's fp16 compute figure, and where
that is unknown the field is `null`, *"deliberately different from `0.0`, which would
read as 'immeasurably slow' rather than 'not estimated'"*.

This is an instance of `unknown-is-not-a-value` and the technique must say so rather
than re-derive it. What the technique adds beyond the law is the **domain test**: a
sentinel is safe only if it lies outside every value the measured domain can take, and
for a performance number zero is *inside* that domain — a sort or a threshold ranks an
absent estimate as the worst one. Where the domain has no free value, the field must be
nullable.

The source reaches the same rule at two further stages, and the technique is stronger
for naming them: a size token that cannot be derived from a parameter count *"yields
nothing rather than a bogus `0b`"*, and a model name whose format marks it as belonging
to another runtime yields no mapped repository rather than a fabricated one.

### 3. `scoped-calibration-fallback`

**Rule:** a correction table's fallback must be scoped so that **adding an entry only
ever moves the thing it names.** A global fudge factor tuned on the cases you have
regresses the cases you do not.

The source's instance: sparse-architecture decode is estimated per architecture, and
architectures without an entry fall back to a heuristic keyed on expert count — which
fits the newest designs badly (one model estimated ~2.6× low). The fix was per-
architecture entries, explicitly documented as *"adding an entry only ever moves the
architecture it names."*

Must state: the fallback's own error is **not** a bug to be fixed by tuning the
fallback — it is the signal that the entry is missing, and tuning the fallback to fit
the newest case is how the table stops being auditable. Also: a calibration derived
from measurements must not be fed by values the ladder in technique 1 marks as
modelled, or the table calibrates against itself.

### 4. `one-ratio-then-a-capability-cap`

**Rule:** a categorical verdict derived from continuous inputs is a pure function of
**one** ratio, and any capability distinction is applied afterwards as a cap — never
mixed into the ratio as a second input.

The source carries the strongest evidence in the whole tree for this, because it
records the refutation **in both directions**. The verdict used to depend on a
catalog-wide `model_size × 2.0` heuristic *and* on pool utilization, and that:

- **over-promised on tight fits** — a 23 GB model on a 24 GB card met its 22 GB
  recommendation and scored the top verdict at 96% pool utilization, where it will not
  actually load; and
- **under-rated roomy ones** — a 9 GB model filling 56% of a 16 GB card scored one
  tier down, while the same model on a 24 GB card scored top. *"The verdict tracked the
  card's size instead of how tightly the model fits it."*

Both directions from one defect is what makes this transplantable: a two-input verdict
does not fail in one direction that a threshold tweak could correct.

The cap is the second half and is not optional: execution paths that cannot deliver the
top verdict are capped at the tier below, *"because Perfect means 'fits with room to
spare **and** runs on the GPU'"* — and are **not** pushed lower than that, because a
model that fits comfortably in a slower path is genuinely runnable. Naive designs push
the whole path down a tier and lose the distinction.

Must also state the band's edge: the top band stops at 98%, not 100%, because a pool
filled to the last percent leaves nothing for allocator slack and fragmentation. A
threshold at the theoretical limit is a threshold that has not been tested.

## Boundaries this subject must NOT absorb

- **Anything about which model or vendor to choose.** That is routing, it lives in
  other subjects and other bundles, and this subject is about the *number*, not the
  decision the number feeds.
- **Time-series extrapolation.** `metric-forecasting`'s ground. Cite the discriminator,
  do not restate its techniques.
- **How a benchmark is run, queued, or budgeted.** Measurement operations are a
  neighbour's; this subject consumes measurements and never describes taking them.
- **How contributed measurements are validated, anonymised or weighted.** That ground
  is held in another bundle and is being amended by this same run — the ladder in
  technique 1 consumes the *result*, and must not describe the ingestion.
- **Hardware detection.** How the machine's specs are discovered is a different concern
  entirely (and is landing as a separate technique in this run).

## Open questions the drafter must decide, not discover

1. **Does the ladder's "calibrated" rung deserve its own technique?** It is the only
   rung that is a *hybrid* — a formula scaled by local measurement — and it is where
   self-calibration can occur. If the drafter finds two independent decision rules
   inside it, split it out; otherwise it stays a rung with a paragraph.
2. **Where does the "publish the resolved basis" obligation sit?** The source reports
   which bandwidth figure was actually used (`estimate_basis.gpu_bandwidth_gbps`) so
   any estimate can be re-derived, and the law `derivation-names-recomputation` already
   exists. Decide whether that is a fifth technique or an obligation stated in the
   golden path's "what this owes the operator" section. My read: golden path, because
   the law carries the mechanism already.
3. **Does the subject own the "unsupported" verdict** — a configuration the model
   cannot represent at all, distinct from one whose inputs are merely missing? The
   source has both (`unsupported` is a ladder rung; `null` prefill is missing input).
   If they are genuinely two states, the golden path must say so.

## Web budget

Two fetches, spent only on primaries: the throughput/roofline reasoning is well
covered in public inference-engine discussions the source itself cites, and the
memory-bandwidth-bound decode claim is standard enough that training-data convergence
should carry it. Do not spend a fetch corroborating the source's own numbers — they
are one project's calibration and belong in the application layer, not the technique.

## Reconciliation

Read-only against `C:/t/llmfit-0903`. The subject is forged from the general rule; the
source tree is the *instance* and its product names must not appear in any upper-layer
document. Purity words to grep your own output for before returning: the tool's name,
every runtime and vendor name in `docs/providers.md`, every model family name in
`MODELS.md`, and the quantization format tokens.

## Gate

Run `node scripts/check-bundles.mjs` and `node scripts/build-index.mjs --check` on your
own subject before returning. **Run no git commands at all** — the director commits.
Return a report naming: every file written, every override you made and why, the
`use_when` line for each technique, and the taxonomy entry you appended (appended, never
reordered).
