---
layer: application
type: application
subject: narrative-engine-selection
technique: engine-arbitration-order
stack: process
status: forged
---

# Arbitration order in a video-studio methodic (process)

The source studio's engine doctrine lives in `knowledge/ENGINES.md` of its
production repo — a prose methodic that script-writing sessions load before
choosing structure. It realizes the full selection stack: catalogue, both
axes, and the arbitration order, with the incidents that forged each part
recorded inline.

## The catalogue the arbitration selects from

`knowledge/ENGINES.md:26-34` is the catalogue as a seven-row table — engines
A through G, each keyed by the viewer's pleasure ("being corrected", "the
disproportion between labour and reward", "watching a question get settled",
"one idea compounding"…) with its witnesses and their runtimes in the third
column. The preamble states the technique's evidence discipline directly:
n=10 videos across 6 channels, "every engine still has 1–3 witnesses; this
catalogue is open, not settled", and a corpus-window paragraph (`:14-24`)
that forbids quoting the pooled MEASURED figures as current practice —
three of the ten sources are undated, and they are the only witnesses for
two engines.

## The two axes the order consumes

`knowledge/ENGINES.md:38-64` adds hazard as the second axis: "Fit and hazard
are orthogonal. Hazard is not low fit, and a hazard note is not a veto." Fit
is defined as a property of the material, hazard of the render on this
subject, and the file names the most dangerous cell — high fit, high hazard,
where "the damage is in what the shape *implies* rather than in any
sentence" (`:48-51`). The axis was forced empirically: five assessment seats
across four domains produced structurally excellent engine choices they had
to reject on grounds a single `fit` scalar could not express — one recorded
verbatim as "structurally excellent, tonally disqualifying" (`:62-64`). The
hazard line travels as one free-text field on the fit record, where empty
means "assessed, none found" (`:53-58`).

## The four-step order

`knowledge/ENGINES.md:330-355` is the arbitration itself. It opens by fixing
both ends of the dial: "Zero engines fit is a blocker… the correct response
is 'not a video yet'… not a script" (`:332-334`), and "Many engines fitting
is NOT a smell" — an inferred correction from three seats arguing against a
fourth: "counting engines measures how many ways material can be told, not
how sharp it is", with the warning that a breadth-as-shapelessness heuristic
"fires hardest on the best-researched notebooks" (`:336-340`). Then the four
numbered steps (`:342-351`):

1. hazard first — "Drop every fit whose hazard line you would not defend on
   air… A `strong` fit carrying 'renders a finding of culpability against a
   living person' loses to a `medium` fit that does not";
2. pleasure match — keep engines "whose pleasure matches the material's own
   surprise", mapping surprise types back to catalogue rows;
3. feedability — "Prefer the engine the notebook can actually feed…
   material means fields", naming its two known un-feedable engines (D
   without stored candidates, C without a mechanised familiar domain) as
   "recommendations to do original work at render time";
4. compose — "The remaining two are usually a spine and a final act, not a
   contest", grounded by a witness whose reversal-chain essay closes with an
   adjudication act (`:319-321`).

The honest-residue rule closes the section (`:353-355`): when arbitration
cannot separate finalists, record the pick in the fit record's `why` field
as an editorial choice, "rather than dressing a preference as a fit
measurement."

## What the realization confirms and where it falls short

Confirmed: the order is real doctrine, each step traceable to a named
incident, and step 3's two un-feedable engines are documented at the engine
entries themselves (C at `:131-144`, D at `:184-209`) rather than only in
the arbitration — so a session hitting step 3 finds the schema gap explained
where it will look. Deviation, acknowledged in-file: step 3 is currently a
*warning*, not a gate — the schema fields that would make D and C feedable
(`candidates[]`, a structured familiar-domain half) did not exist at the
time of writing, so the methodic can detect an un-feedable pick but not
prevent the render. The standard stays: extend the asset schema before
rendering the un-feedable engine.
