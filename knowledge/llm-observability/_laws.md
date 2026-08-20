# Laws — LLM observability

Cross-cutting invariants of operating LLM traffic as a product. Techniques cite
these by anchor; they are not subjects and get no folder. Each was extracted from
doctrine that recurs across independent concerns of the founding corpus.

## <a id="never-present-absence-as-an-answer"></a>Never present absence as an answer

An unported filter returns "unsupported", never an unfiltered page presented as
honored. An empty capability returns a refusal, never an empty list that reads as
"nobody spent anything". A cap whose window holds no priced evidence is
unpriceable and refuses — it does not read the missing data as zero headroom. A
currency with no exchange rate is stored flagged, never silently treated as the
base currency. Absence is a state to disclose, not a value to substitute.

## <a id="nullable-never-zero"></a>Nullable, never zero

A cost that could not be priced is null. A zero is a measurement; a null is an
admission — and every aggregate over nullable measures carries how many rows it
could not measure. Reading null as zero converts every downstream cap, margin and
trend into a quiet lie on exactly the newest, least-vetted traffic.

## <a id="server-owns-the-accounting-clock"></a>The server owns the accounting clock

Clients own their event time for debugging; the server stamps its own receipt
time and every budget, window and enforcement decision keys on the server's
clock. Any client-writable field that feeds accounting or attribution is either
re-stamped from the authenticated principal or stripped — otherwise a caller can
launder spend onto someone else's budget with one JSON key.

## <a id="estimation-announces-itself"></a>Estimation announces itself

Every imputed, truncated, filtered, or simulated number carries its own
disclosure: imputation reported beside the total it entered, truncation flagged
with a deterministic tie-break, a filtered response echoing its predicate so a
cohort subtotal cannot read as a business total, a what-if stamped as simulated
with its assumptions attached. The reader learns what was estimated from the
payload itself, never from documentation.

## <a id="no-retroactive-restatement"></a>No retroactive restatement

Cost is stamped once at ingest; correcting a wrong price does not restate spend
already inside a window, and the caveat says so. Exchange rates come from a
static, auditable snapshot — deterministic and versioned — never a live feed that
silently re-prices history between two reports. Accounting that can change after
the fact is not accounting.

## <a id="the-judge-is-both-untrusted-and-under-test"></a>The judge is both untrusted and under test

The judge's input is attacker-influenced by construction — candidate text is
fenced, boundary imitations are neutralized and flagged, and known biases
(position, verbosity, self-preference) are counterbalanced in the prompt
contract. And the judge itself is a measuring instrument that drifts: it is
calibrated against human agreement on a schedule, its verdicts carry provenance,
and an uncalibrated judge's scores are leads, not measurements.

## <a id="statistical-verdicts-or-no-verdict"></a>Statistical verdicts, or no verdict

"Regressed" and "better" are paired, family-wise-corrected statistical claims at
a fixed, non-configurable confidence — a tool whose alpha is a knob invites
tuning until the answer is the desired one. A partial run is never green; an
unverified result is a distinct exit state from a passing one.

## <a id="aggregates-leave-identity-behind"></a>Aggregates leave identity behind

What leaves the installation is aggregate by construction: k-floored on cases and
on distinct sources, continuous side-channels bucketed, single-contributor
influence bounded and disclosed, identity derived from issued credentials rather
than asserted. Counts are rejected when implausible — a count is the weight the
merge trusts.

## <a id="quality-apparatus-stays-unbudgeted"></a>The quality apparatus stays unbudgeted

Judge and benchmark spend is segregated from product cost by construction — it
never enters COGS, and no usage cap ever throttles the scoring path. An
observability product that meters its own measuring instrument alongside the
traffic it measures can silently blind itself exactly when traffic spikes.
