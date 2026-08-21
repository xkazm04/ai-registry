---
layer: application
type: application
subject: sourcing-campaign-honesty
technique: no-fabricated-testimonial
stack: process
status: forged
---

# A hook taxonomy with a hole in it, on purpose (Python campaign pipeline)

The clearest realization of format exclusion in this repo is a four-member
tuple and the comment above it — `pipeline/jobfit/campaign.py:36-38`:

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

The prompt reinforces it at the beat level (`:181`): *"proof (6–11s): concrete
facts only (stack, location, work mode, salary). No testimonials."* The proof
beat is precisely where the genre wants a quote, so the ban is placed on that
beat rather than stated generically.

## Closure is enforced at the trust boundary

An instruction alone would leave the taxonomy open, because a model can return
any string in `hookType`. `coerce` (`:244-262`) closes it:

```python
hook_type = str(item.get("hookType") or "").strip().lower()
variants.append(_variant(hook_type if hook_type in HOOK_TYPES else HOOK_FALLBACK, hook, ad_copy, script))
```

An out-of-taxonomy angle — including a model that decides to produce an
employee-voice variant and labels it as one — is mapped onto `problem` rather
than passed through. The same boundary drops variants missing a hook or ad
copy, and caps the list at `VARIANT_MAX = 12` (`:41`, applied at `:248`). The
downstream surface therefore only ever sees the four designed labels, which is
why `HOOK_LABEL_KEY` in `app/features/library/jobs/jobsCampaignTabTypes.ts` can
be an exhaustive four-entry map with an `isHookType` guard and no default case.

## The degraded path is honest by construction

The strongest evidence that the exclusion is structural rather than
prompt-deep: the non-LLM fallback (`:215-242`) obeys the same taxonomy, and
obeys it by producing *less*. It appends a variant per hook only when the facts
for that hook exist — `if salary:`, `if place:`, `if skills:` — so a thin
requisition yields two variants where eight were requested. The docstring says
so plainly (`:205-207`): *"the fallback assembles one honest variant per hook
type that has facts to stand on (so it may produce fewer than VARIANT_TARGET;
`source` says which path ran)"*.

Two details generalize:

- **The floor hook.** `problem` is emitted unconditionally, with the comment
  (`:236-237`) *"The problem hook needs no facts beyond the role itself, so the
  fallback always yields at least one variant — a pack can never come back
  empty."* An empty pack would be read as a bug and worked around; one grounded
  variant is a result.
- **The path is recorded.** `source` travels on the pack and into `PackRecord`,
  so a recruiter comparing a thin pack to yesterday's rich one can tell whether
  the record changed or the generator degraded.

## Deviations from the standard

- **No intake path for a real testimonial.** The technique's honest substitute
  — a named, consenting employee quotation ingested as an attributed asset —
  does not exist anywhere in the product. The exclusion is complete but the
  legitimate workflow it should redirect to is absent, which leaves the
  strongest format simply unavailable rather than available-with-consent.
- **The quotation-mark check is not mechanized.** Nothing in `coerce`
  inspects copy for first-person or quoted speech, so a model producing a
  testimonial *inside* an otherwise well-typed `problem` variant would pass the
  boundary. The taxonomy is closed on the label, not on the prose.
