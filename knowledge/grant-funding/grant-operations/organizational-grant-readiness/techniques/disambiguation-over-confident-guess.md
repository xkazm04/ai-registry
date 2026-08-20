---
layer: technique
type: technique
subject: organizational-grant-readiness
technique: disambiguation-over-confident-guess
status: forged
laws: [honest-null-over-forced-guess, never-fabricate-a-figure]
shared_with: []
use_when: [an applicant lookup input matches more than one real organization, capping model confidence on identity-bearing fields, a lookup returned the fluent profile of the wrong organization]
---

# Disambiguation over confident guess

The technique governs the moment a lookup input fails to uniquely identify
one real organization — which bare names do constantly, because organization
names collide across cities, regions and jurisdictions. The rule: when
uniqueness fails, the system must not resolve the ambiguity itself. It caps
confidence on the dangerous fields, emits a short slate of distinguishable
candidates, and hands the choice to the one party who actually knows the
answer. The founding observation, learned by drilling a live pipeline with
deliberately ambiguous names: the failure output is not an error — it is a
*fluent, well-sourced, internally consistent profile of the wrong
organization*, which no reviewer can distinguish from success by looking at
it.

## Why the guess is worse than the blank

An autofilled wrong value that the applicant accepts inherits the
applicant's own authority: from that click forward, every downstream
consumer — eligibility gates, verification, submissions — treats it as
human-confirmed truth. A blank stops the pipeline and asks; an accepted
wrong identifier sails through it. So the cost asymmetry is extreme in one
direction, and the design must be too: the system should be eager to say
"which of these is you?" and nearly incapable of saying "this is you" when
it does not know.

## Procedure

1. **Make uniqueness an explicit first decision.** Before extracting
   anything, the research step decides: does this input pin exactly one
   real organization? A unique registry identifier or a website does; a
   bare name matching multiple real organizations does not. This decision
   is stated in the contract as the gate everything else hangs on.
2. **Cap confidence field-by-field, by damage class.** When uniqueness
   fails, the identity-bearing and figure-bearing fields — registry
   identifier, revenue, entity form — are capped at low confidence or null:
   these are the fields where accepting the wrong organization's value is
   disqualifying. Softer fields (name, city, region) may carry medium at
   most — they help the human orient without pretending to resolve. A cap
   is a hard rule in the contract, not a suggestion to the model.
3. **Emit a candidate slate built for recognition.** Two to five distinct
   real organizations, each carrying exactly what a human needs to spot
   theirs: the name, the distinguishing registry identifier, city and
   region, and one short recognizer — a focus area or a size hint. The
   slate is bounded on both ends: one candidate means the input was
   actually unique; an unbounded list means the system did no filtering
   work.
4. **Route the pick back through the unique path.** Choosing a candidate
   re-runs the lookup keyed on that candidate's identifier — now a unique
   input, eligible for direct fetch and high confidence. The
   disambiguation loop thus converges to the same trusted path as a
   unique first input, rather than promoting the low-confidence draft.
5. **Verify internal consistency before trusting any identity field.**
   Even on the apparently-unique path, the identifier, name and location
   must describe the *same* entity before any of them is marked confident.
   Cross-field consistency is the cheapest available check against a
   registry hit that matched on name but returned a different branch,
   chapter or namesake.

## Decision rules

- **When the candidate slate would contain one entry, treat the input as
  unique and skip the picker, because** a one-option choice trains users
  to click through, which erodes the attention the real slates need.
- **When no real candidates can be found at all, return an honest empty
  result with nulls and a note — never pad the slate with near-matches,
  because** a slate implicitly asserts "one of these is probably you", and
  padding converts an honest null into five simultaneous weak guesses.
- **When the input carries partial discriminators** (a name plus a city),
  **use them to filter candidates, not to justify confidence, because**
  name-plus-city still collides; discriminators narrow the slate, and only
  an identifier-grade match ends it.
- **When a reviewer or metric complains that disambiguation "adds a
  step", hold the line, because** the step is the product working: the
  alternative is not zero steps but a wrong profile accepted in zero
  steps.

## When not to use

Do not interpose a picker when the input genuinely pins one entity — a
unique identifier or a domain deserves the direct path, and forcing
confirmation there is friction without safety. The technique also does not
apply to fields with no identity stakes: mission keywords proposed from
ambiguous material are cheap to edit and need no slate. And in fully
unattended pipelines with no human to pick, the correct degradation is not
"best candidate" but "unresolved, parked for review" — the technique's
whole premise is that resolution authority belongs to a human who knows.
