---
layer: application
type: application
subject: sourcing-campaign-honesty
technique: no-fabricated-testimonial
stack: process
status: forged
verified_on: 2026-09-29
applied: code
ab_verdict: better
---

# A hook taxonomy with a hole in it, on purpose (Python campaign pipeline)

Every line number below is `pipeline/jobfit/campaign.py` at kp `092f2e1e3` (local,
unpushed at the time of writing; its parent `f0395dbec` is the tree the first
re-read used). The 2026-08-20 citations had all moved: two fixes landed since, and
this pass added the boundary check described in the last section.

The clearest realization of format exclusion in this repo is a four-member
tuple and the comment above it (`:37-40`):

```python
# Hook taxonomy (canonical codes; the UI maps them to localized labels). The
# 4-beat playbook's "employee POV" is deliberately not a member — see module doc.
HOOK_TYPES: tuple[str, ...] = ("number", "location", "problem", "skills")
HOOK_FALLBACK = "problem"
```

## The exclusion is recorded as a decision, not left as an omission

The module docstring (`:8-12`) states the reasoning where the next reader will
find it:

> Only the supplied job facts may appear in the copy. No invented pay,
> benefits, team details, or testimonials — which is also why the "employee
> POV" hook type from the original playbook is intentionally absent: we cannot
> fabricate a testimonial. A "skills" (stack) hook replaces it for tech roles.

Three things in that sentence match the technique exactly. The source playbook
*did* include the employee-perspective hook — this is a deliberate subtraction
from an external best-practice list, not a taxonomy that happened never to
include it. The stated reason is about the **format's possibility**, not about
wording: *we cannot fabricate a testimonial*. And the excluded slot is
**replaced** rather than left empty, which is what keeps the exclusion from
being relitigated: the menu still has four angles, so nobody experiences the
honesty rule as a missing feature.

The prompt reinforces it at the beat level (`:255`): *"proof (6–11s): concrete
facts only (stack, location, work mode, salary). No testimonials."* The proof
beat is precisely where the genre wants a quote, so the ban is placed on that
beat rather than stated generically.

## Closure is enforced at the trust boundary, on the label and on the words

An instruction alone would leave the taxonomy open, because a model can return
any string in `hookType`. `coerce` (`:335-356`) closes it:

```python
hook_type = str(item.get("hookType") or "").strip().lower()
variant = _variant(hook_type if hook_type in HOOK_TYPES else HOOK_FALLBACK, hook, ad_copy, script)
```

An out-of-taxonomy angle — including a model that decides to produce an
employee-voice variant and labels it as one — is mapped onto `problem`. The same
boundary drops variants missing a hook or ad copy, and caps the list at
`VARIANT_MAX = 12` (`:43`, applied at `:339`). The downstream surface therefore
only ever sees the four designed labels.

**Until this pass that was the whole of it, and a label is not the prose.** The
mapped variant kept its words, so a testimonial relabelled `problem` arrived as a
testimonial, and the existing test (`test_off_taxonomy_hook_type_falls_back`)
pinned only the label. `_boundary_violation` (`:216-234`) now runs on every
model-written variant before it is kept: a quotation mark (`_QUOTE_RE`, `:81`) or
a first-person singular in the pack's own language (`_FIRST_PERSON_RES`, `:82-87`,
per language so Czech `je` is not read as a French pronoun) drops it.

## The degraded path is honest by construction

The strongest evidence that the exclusion is structural rather than
prompt-deep: the non-LLM fallback (`:306-334`) obeys the same taxonomy, and
obeys it by producing *less*. It appends a variant per hook only when the facts
for that hook exist — `if salary:`, `if place:`, `if skills:` (`:317-324`) — so a
thin requisition yields two variants where eight were requested. The docstring
says so plainly (`:279-280`): *"the fallback assembles one honest variant per
hook type that has facts to stand on (so it may produce fewer than
VARIANT_TARGET; `source` says which path ran)"*.

Two details generalize:

- **The floor hook.** `problem` is emitted unconditionally, with the comment
  (`:328-329`) *"The problem hook needs no facts beyond the role itself, so the
  fallback always yields at least one variant — a pack can never come back
  empty."* An empty pack would be read as a bug and worked around; one grounded
  variant is a result.
- **The path recorded is whose words are on the wire.** `source` travels on the
  pack into `PackRecord`. Until 2026-09-05 (`b9ee1956f`) it answered "llm" for a
  reply that coercion had emptied, so a pack made entirely of the template was
  painted as AI-written copy; the comparison at `:382` now stamps it
  "deterministic". "Record which path produced the output" therefore means the
  path that produced the *text*, not the path that was *called*. This pass's
  check feeds the same route: a payload where every variant is dropped takes it
  too, with the `unusable_output` reason.

## Measured: what the boundary let through, before and after

Code A/B, `campaign.draft_campaign_pack` with a stub provider, so the real module
and no provider spend. n = 14 hand-written variants: 8 planted defects and 6
clean shapes (pay range, place, stack, problem, Czech pay, stack and place).

| | planted defects passed | clean variants dropped |
|---|---|---|
| Label-only boundary (before, `f0395dbec`) | 8 of 8 | 0 of 6 |
| Words checked (after, `092f2e1e3`) | 2 of 8 | 0 of 6 |

The six it now drops: an invented pay figure, an invented benefit count, an
invented year, a quoted testimonial under an allowed label, an unquoted
first-person testimonial under an off-menu label, and the boilerplate euphemism.
The two it still passes are the ones it cannot see: an invented perk written
without a numeral ("free lunch, a dog-friendly office, fully remote") and one end
of the stated pay band standing alone as the headline. Ten new tests in
`BoundaryHonestyTests` were red on the old module and are green on the new one,
and the full `pipeline/jobfit` suite (3370 tests) shows the same two failures it
showed before the change.

Limits, stated because n is small: the clean set was written in the same sitting
as the check, which biases it toward passing. The independent clean control is
the deterministic pack, which kp wrote earlier: all four languages, full and thin
facts, every variant passes its own boundary. No real model output was available,
so the false-drop rate on live copy is unmeasured; the first place it would show
is a variant the model writes with a quotation mark around a job title.

## Deviations from the standard

- **No intake path for a real testimonial.** The technique's honest substitute
  — a named, consenting employee quotation ingested as an attributed asset —
  still does not exist anywhere in the product (`git grep` for testimonial over
  `app/` and `pipeline/` at this commit finds only the exclusion's own comments
  and prompt). The exclusion is complete but the legitimate workflow it should
  redirect to is absent.
- **The floor hook's instruction is open.** The prompt describes `problem` as
  "a pain this role solves for the candidate" (`:251`), which asks the model to
  originate a claim about the role, on the one hook that needs no fact. The
  deterministic template is safe (`"Looking for your next {role} role?"`); the
  model path is looser than the template it stands in for. Not measured.
- **Off-menu angles map to the least constrained member.** `HOOK_FALLBACK` is
  `problem`, the hook with the loosest instruction. With the words now checked
  this is far less exposed than it was; it remains the member an unrecognised
  angle is filed under.
