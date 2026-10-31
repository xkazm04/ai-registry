---
domain: software-engineering
subject: adoption-measurement
last_touched: 2026-08-31
touched_by: intake
dry_streak: 0
---

# adoption-measurement

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-08-31 - `/intake` (run `intake-agentic-trends-0831`)

First note for this subject. `before-after-outcome-pairing` gained a section,
"Two reasons a half is missing, and only one of them is out of scope", two
decision rules and two `use_when` entries. Source:
[[2026-08-31-agentic-coding-trends-report]] - a vendor prediction report whose
one usable measurement was that ~27% of AI-assisted work is work that would not
have been done at all.

**The gap.** Step 5 excludes a part scored on one side and not the other, to
prevent a delta manufactured by coverage change. Correct, and under-specified:
**induced scope has the identical syntactic shape and the opposite meaning.** A
unit absent from the before side because nobody measured it has an *unknown*
before-value and must be excluded; a unit absent because it *did not exist* has
an **observed zero**, and excluding it deletes the practice's largest effect and
reports the residue. The amendment adds the discriminator (was it absent from
the measurement, or from the world?), the evidence requirement that keeps an
observed zero distinct from an invented baseline - the technique's absolute rule
is untouched and explicitly cited - an `induced` status token, and the rule that
induced scope is reported beside the delta, never folded into it.

**The shape worth remembering.** This is the same defect as the run's other
landing on `hitl-approval`: a rule keying on the property that was easy to
observe rather than the one that decides the verdict, and being structurally
unable to see the difference. Two sightings in one run is not convergence, but a
third from an independent run would make it law-shaped. Recorded in the source
note for that purpose.

**Applied** to `personas` (experiment, `not-better`) and inspected against a
second project's lint ratchet. Both instruments returned *coverage change*, so
the amendment changed no verdict - a rejection, and the most useful row of the
two. The seam class it names: **an instrument whose unit population is derived
by a matcher rather than enumerated from the tree cannot exhibit induced scope**,
however fast the tree grows, because its units are its own output. The map's
contexts held at 208 -> 208 across eight days while the source tree grew 4,746 ->
5,881 files. The ratchet, by contrast, enumerates three causes for a *drop* and
guards its population floor, but has **no ceiling** - a real asymmetry that costs
that project nothing today because its tree is flat (990 -> 996 files in three
months). It is the place to re-run this when that changes. See
[[../../librarian/applied]].

## Architecture review - 2026-10-31

First architecture review, against `a86adcdad`. All ten documents were read in
full. The laws the techniques cite exist in the bundle's law file and every
relative link in the golden path resolves. One public source was opened for the
golden path's seat-utilisation claim. The two `ascent` applications and the
private registry-map history behind the before/after application could not be
reopened (the local checkout of the latter is shallow), so their citations stay
`reverify`. Arithmetic was recomputed across all documents. One error was found
(nine of eleven is about 82%, not 100%), plus an off-by-reading churn multiple
and two wording slips. No verification date was refreshed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/adoption-measurement",
  "date": "2026-10-31",
  "baseline": "a86adcdad",
  "digest": "sha256-b2:502064804797857b",
  "disposition": "clarify",
  "coverage": "All 10 documents read in full (golden path, six techniques, three node applications). Relative links and cited laws checked. Arithmetic recomputed in the golden path, adoption-distribution-bands and the before/after application. One public source opened (seat utilisation). Not evaluated: the private ascent tree behind two applications, and the private registry-map and ratchet history behind the third. No verification date was refreshed.",
  "trigger": "Pending: subject had no architecture-review record.",
  "intended_benefit": "Adoption figures that carry their provenance, shape, verdict state and pairing status, and are never converted into outcome claims.",
  "failure_if_ignored": "A seat count, a background sync or an invented baseline renders as adoption and is quoted as a program result.",
  "boundary": "Uptake of practices by other teams, observed second hand. Product telemetry belongs to usage-analytics; naming or ranking people belongs to people-analytics-ethics; general number honesty belongs to measurement-honesty.",
  "counterexamples": [
    "An eligibility rule of eleven of ninety teams with nine adopting gives 9/11, about 82%, not 100%. The golden path's example only shows the denominator point if the number is right.",
    "A compliance control whose uptake is the outcome needs coverage against a stated population, not two ledgers (the separation technique states this exception itself).",
    "An instrument whose units come from a matcher, not from the tree, cannot show induced scope however fast the tree grows (from the before/after application).",
    "A dormancy rule with three states files an artifact nobody ever touched under the same label as one that was used and abandoned, and prune candidates drawn from that label include unmeasured artifacts (the dormancy application's stated deviation)."
  ],
  "sources": [
    {
      "url": "https://zylo.com/news/zylos-saas-management-index-reveals-organizations-only-utilize-60-of-saas-licenses-leaving-40-unused",
      "result": "Vendor press release, 2022-01-18: 'The average organization is only utilizing 60% of their provisioned SaaS licenses', 'leaving 40% wasted, unused'. No method is given. Supports the golden path's 'large minority of paid seats with no activity' as a hedged claim; secondary summaries of later editions report about half unused, which would make 'minority' conservative, but those editions were not opened."
    },
    {
      "source": "Arithmetic in the documents",
      "result": "Golden path: 9/11 = 81.8%, 9/90 = 10%, so '100%' is wrong. Bands: 4/6 = 66.7%, consistent. Before/after application: 764 - 188 + 245 = 821; 576/821 = 70.2%; 57/764 = 7.5%; 5,881/4,746 = +23.9%; all consistent. Additions alone are 4.3 times the net movement; additions plus removals (433) are 7.6 times, so 'the churn is four times the net' needs to name which."
    },
    {
      "source": "Private consumer trees (ascent; registry-map and ratchet histories)",
      "result": "Not reopened. The local checkout holding the registry-map history is shallow and starts after 2026-08-31. Citations stay as dated."
    }
  ],
  "documents": {
    "adoption-measurement.md": {
      "disposition": "clarify",
      "reason": "Sound and well bounded. One arithmetic error: 'a practice that applies to eleven of ninety teams is at 100% when nine of eleven adopt it' should read about 82%. The seat-utilisation claim is hedged and consistent with the vendor index opened this run."
    },
    "techniques/attribution-provenance-tiers.md": {
      "disposition": "keep",
      "reason": "Closed tier ladder, lowest-tier propagation, the non-degenerate allocation basis check and the deletion rule with its rename-invariance test are coherent and match the application that sourced them."
    },
    "techniques/adoption-distribution-bands.md": {
      "disposition": "keep",
      "reason": "Spread and depth as separate readings, enumerated zeros, versioned denominators and concentration rules are consistent; the one worked percentage is correct."
    },
    "techniques/dormancy-verdicts.md": {
      "disposition": "clarify",
      "reason": "The five-state set reads `dormant` as 'qualifying use once', which taken literally excludes an artifact used more than once. It should read 'at least once', which is what separates it from `never-used`."
    },
    "techniques/before-after-outcome-pairing.md": {
      "disposition": "clarify",
      "reason": "Procedure, status set and the induced-scope amendment are coherent. Owed, not applied: the regression-to-the-mean confound says practices are adopted after a bad period 'more often than after a good one', a comparative empirical claim with no source. It needs a source or a hedge ('often'). No source was found this run."
    },
    "techniques/mentor-learner-pairing.md": {
      "disposition": "keep",
      "reason": "Defers people rules wholly to people-analytics-ethics; absolute floors on both sides plus a minimum gap closes the relative-only failure."
    },
    "techniques/adoption-vs-outcome-separation.md": {
      "disposition": "keep",
      "reason": "The two-ledger rule, refusal of outcome-per-adopter units and the compliance exception are consistent with the golden path."
    },
    "applications/node--attribution-provenance-tiers.md": {
      "disposition": "reverify",
      "reason": "Internally consistent and openly records two deviations (one scalar tier per model, two fidelity vocabularies). The private tree and its pinned spend test were not reopened."
    },
    "applications/node--dormancy-verdicts.md": {
      "disposition": "reverify",
      "reason": "The quoted verdict code matches its stated three-state deviation (an old, never-downloaded artifact falls to dormant). The private tree was not reopened."
    },
    "applications/node--before-after-outcome-pairing.md": {
      "disposition": "clarify",
      "reason": "Figures recompute. Two wording fixes owed: 'the churn is four times the net movement' holds only for additions (245/57 = 4.3); total churn is 7.6 times. And 'would have reached the right conclusion by the wrong route, and been wrong on these numbers' contradicts itself; the reader would be right about the tree and wrong about the map. The underlying revisions were not reopened, so the figures themselves remain unwitnessed this run."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied the four changes the earlier 2026-10-31 record named, each an arithmetic
or internal-consistency fix recomputed this run. The regression-to-the-mean
sentence in before-after-outcome-pairing is still owed: it needs a source or a
hedge, and none was found. Applications keep their verification dates.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/adoption-measurement",
  "date": "2026-10-31",
  "baseline": "a86adcdad",
  "digest": "sha256-b2:33aa6c254db18dca",
  "disposition": "clarify",
  "coverage": "All 10 documents decided. The four clarify changes the earlier 2026-10-31 record named for the golden path, dormancy-verdicts and the before/after application were applied and the edited lines re-read; the arithmetic behind them was recomputed this run. The other seven documents are byte-unchanged and keep their dispositions. Still not evaluated: the private ascent tree and the registry-map and ratchet histories. No verification date was refreshed.",
  "trigger": "Pending: subject had no architecture-review record.",
  "intended_benefit": "Adoption figures that carry their provenance, shape, verdict state and pairing status, and are never converted into outcome claims.",
  "failure_if_ignored": "A seat count, a background sync or an invented baseline renders as adoption and is quoted as a program result.",
  "boundary": "Uptake of practices by other teams, observed second hand. Product telemetry belongs to usage-analytics; naming or ranking people belongs to people-analytics-ethics; general number honesty belongs to measurement-honesty.",
  "counterexamples": [
    "An eligibility rule of eleven of ninety teams with nine adopting gives 9/11, about 82%, not 100%. The golden path's example only shows the denominator point if the number is right.",
    "A compliance control whose uptake is the outcome needs coverage against a stated population, not two ledgers (the separation technique states this exception itself).",
    "An instrument whose units come from a matcher, not from the tree, cannot show induced scope however fast the tree grows (from the before/after application).",
    "A dormancy rule with three states files an artifact nobody ever touched under the same label as one that was used and abandoned, and prune candidates drawn from that label include unmeasured artifacts (the dormancy application's stated deviation)."
  ],
  "sources": [
    {
      "url": "https://zylo.com/news/zylos-saas-management-index-reveals-organizations-only-utilize-60-of-saas-licenses-leaving-40-unused",
      "result": "Vendor press release, 2022-01-18: 'The average organization is only utilizing 60% of their provisioned SaaS licenses', 'leaving 40% wasted, unused'. No method is given. Supports the golden path's 'large minority of paid seats with no activity' as a hedged claim; secondary summaries of later editions report about half unused, which would make 'minority' conservative, but those editions were not opened."
    },
    {
      "source": "Arithmetic in the documents",
      "result": "Golden path: 9/11 = 81.8%, 9/90 = 10%, so '100%' is wrong. Bands: 4/6 = 66.7%, consistent. Before/after application: 764 - 188 + 245 = 821; 576/821 = 70.2%; 57/764 = 7.5%; 5,881/4,746 = +23.9%; all consistent. Additions alone are 4.3 times the net movement; additions plus removals (433) are 7.6 times, so 'the churn is four times the net' needs to name which."
    },
    {
      "source": "Private consumer trees (ascent; registry-map and ratchet histories)",
      "result": "Not reopened. The local checkout holding the registry-map history is shallow and starts after 2026-08-31. Citations stay as dated."
    }
  ],
  "documents": {
    "adoption-measurement.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'is at 100% when nine of eleven adopt it' now reads 'is at about 82% when nine of eleven adopt it' (9/11 = 81.8%)."
    },
    "techniques/attribution-provenance-tiers.md": {
      "disposition": "keep",
      "reason": "Closed tier ladder, lowest-tier propagation, the non-degenerate allocation basis check and the deletion rule with its rename-invariance test are coherent and match the application that sourced them."
    },
    "techniques/adoption-distribution-bands.md": {
      "disposition": "keep",
      "reason": "Spread and depth as separate readings, enumerated zeros, versioned denominators and concentration rules are consistent; the one worked percentage is correct."
    },
    "techniques/dormancy-verdicts.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: `dormant` is now 'qualifying use at least once, none within the window', which keeps it distinct from `never-used`."
    },
    "techniques/before-after-outcome-pairing.md": {
      "disposition": "clarify",
      "reason": "Procedure, status set and the induced-scope amendment are coherent. Owed, not applied: the regression-to-the-mean confound says practices are adopted after a bad period 'more often than after a good one', a comparative empirical claim with no source. It needs a source or a hedge ('often'). No source was found this run."
    },
    "techniques/mentor-learner-pairing.md": {
      "disposition": "keep",
      "reason": "Defers people rules wholly to people-analytics-ethics; absolute floors on both sides plus a minimum gap closes the relative-only failure."
    },
    "techniques/adoption-vs-outcome-separation.md": {
      "disposition": "keep",
      "reason": "The two-ledger rule, refusal of outcome-per-adopter units and the compliance exception are consistent with the golden path."
    },
    "applications/node--attribution-provenance-tiers.md": {
      "disposition": "reverify",
      "reason": "Internally consistent and openly records two deviations (one scalar tier per model, two fidelity vocabularies). The private tree and its pinned spend test were not reopened."
    },
    "applications/node--dormancy-verdicts.md": {
      "disposition": "reverify",
      "reason": "The quoted verdict code matches its stated three-state deviation (an old, never-downloaded artifact falls to dormant). The private tree was not reopened."
    },
    "applications/node--before-after-outcome-pairing.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'the churn is four times the net movement' now reads 'the additions alone are four times the net movement (additions and removals together, more than seven)' (245/57 = 4.3, 433/57 = 7.6); the self-contradicting 'reached the right conclusion by the wrong route, and been wrong' now reads 'been right about the tree and wrong about the map's 245 additions'. The two committed revisions behind the figures were not reopened; verified_on unchanged."
    }
  }
}
```
