---
layer: application
type: application
subject: requirement-inflation-control
technique: never-promote-an-unstated-tool
stack: process
status: forged
verified_on: 2026-08-20
---

# Grounding rules in a role-spec generation prompt

`pipeline/jobfit/devcase/design.py:144` builds the prompt for `design_role`,
which turns a hiring need plus a code-base analysis into a structured role
spec (`title`, `seniority`, `roleFamily`, `mustHaves`, `niceToHaves`,
`responsibilities`, `languages`). It is the clearest live example of the
grounding rule stated as a hard constraint inside a generation prompt rather
than as a review checklist applied afterwards.

## The rule, as shipped

`design.py:158` opens a block whose parenthetical carries the whole
justification in five words — "a spec that inflates the need mis-hires":

> "Grounding rules (a spec that inflates the need mis-hires): every mustHave
> must trace to something the need/JD/analysis actually STATES — never promote
> a named tool, product, or process the input does not mention into a
> requirement (illustrative examples belong in niceToHaves, phrased as 'e.g.',
> or nowhere). Keep the must-have list short and decisive (≤8) rather than
> exhaustive. Read the seniority off the JD's own signals (education asked,
> experience asked, scope of duties) — do not default to the seniorityTarget
> when the JD plainly describes a more junior or senior role; carry the JD's
> explicitly named candidate traits into the spec before adding anything of
> your own."

Every clause of the technique is present, and each earns its place:

- **The trace requirement**, scoped to `mustHaves` only — the filtering half
  of the output. `niceToHaves` are left free, exactly as the technique's
  proportionality rule prescribes.
- **The illustration escape hatch, with its phrasing pinned.** "phrased as
  'e.g.', or nowhere" is the marking rule made mechanical: a reviewer scanning
  the nice-to-have list can see at a glance which entries are the model's
  calibration examples and which came from the input. Without the literal
  marker, an example is indistinguishable from a criterion to every downstream
  reader.
- **The ceiling at eight.** Stated as "short and decisive … rather than
  exhaustive", which names the failure it prevents — a generator with no
  length discipline emits a list at the length of its training distribution.
- **Seniority read from the input's own signals.** The prompt enumerates which
  signals count (education asked, experience asked, scope of duties) and
  explicitly forbids defaulting to `seniorityTarget`. This is the anchoring
  failure the technique warns about: ask for a senior spec and you get
  senior-sounding requirements uniformly, which makes the inflation invisible
  because nothing in the list looks out of place next to the rest.
- **The mirror failure, guarded.** "carry the JD's explicitly named candidate
  traits into the spec before adding anything of your own" is the omission
  half of grounding — the error a reviewer hunting for inventions will not
  catch, because it leaves no trace on the page.

## Confirmed grades outrank generated ones

`design.py:148` handles the case where the requestor's own graded requirements
are available, and it is the strongest expression of the authority ordering in
the repo:

> "When statedRequirements are supplied they are the requestor's OWN graded
> dealbreakers, read back and confirmed in the hiring intake — every
> kind=must_have entry must appear in mustHaves (highest weight first) unless
> the analysis concretely contradicts it, and kind=nice_to_have entries belong
> in niceToHaves, never promoted."

The comment at `:130` says why in three lines: this is "the highest-authority
requirement signal when present (it was read back and confirmed in dialog)".
Two directions are governed separately — musts pass through unless
*concretely* contradicted, nice-to-haves are "never promoted" with no escape
clause at all. That asymmetry is correct: a generator demoting a stated
dealbreaker is visible to the requestor at review, while a generator promoting
a preference into a filter silently narrows the pool and nobody reads the
diff.

## The surrounding prompt does the other half

Two nearby instructions matter because they prevent inflation from a direction
the grounding rule alone does not cover. `design.py:145` anchors the role's
identity to what is being hired for and forbids renaming the role to the
code-base's domain — "the codebase is where this person will WORK, not what
defines the role". And the real-stack instruction requires the model to "note
honestly what transfers and what is a gap", with a worked example in the
prompt itself: a general-purpose web framework under a backend role is fine
and the language transfers; a security role on a data-pipeline code base stays
a security role. Transfer and gap are stated as findings, not resolved into
requirements — which is what keeps the analysis from becoming a second
inflation source alongside the brief.

## Deviations from the standard

- **No per-line trace is emitted.** The prompt requires every must-have to
  trace to a statement in the input; the returned JSON is a list of strings,
  so the trace exists only while the model is generating and is unavailable to
  any reviewer. The technique's review pass — name the input span for each
  must-have — cannot be run against this output, only re-derived by hand.
- **Nothing marks a line as generated.** The standard asks that a
  system-drafted requirement stay attributable to the system until a human
  affirms it. Requirements arriving from `statedRequirements` are known to be
  the requestor's; everything else the model adds enters the spec at the same
  visual grade, so the distinction the intake pipeline is careful to record
  upstream (`stated` versus `inferred`) is flattened at this stage.
- **The ceiling is instructed, not enforced.** "≤8" lives in prose. The
  `coerce` step at `:195` normalizes the payload shape; a nine-item must-have
  list would pass. The count control exists in the codebase as a lint over
  published text, which is a different measurement of a different artifact —
  useful, and not a substitute for a check here.
