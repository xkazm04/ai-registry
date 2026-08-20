---
layer: technique
type: technique
subject: requisition-lifecycle-governance
technique: ingest-as-draft-never-as-live
status: forged
laws: [absence-of-evidence-is-not-evidence, inference-must-look-like-inference, say-only-what-the-record-holds]
shared_with: []
use_when: [importing a third-party advertisement into a hiring system, bulk-loading roles from another source, designing an extraction preview for parsed job text]
---

# Ingest as draft, never as live

Roles arrive from outside constantly. A manager pastes a competitor's
advertisement as a starting point; a client sends a description in an email; a
team migrates from another system; someone drops a whole careers page in at
once. Turning that text into a structured requisition is genuinely valuable —
it removes the most tedious step in role creation — and it is also the fastest
known way to fill a hiring system with roles nobody approved.

## The rule

**An ingested role lands in draft. Always. Regardless of parse quality,
regardless of source, regardless of volume.**

The reason is not that the extraction might be wrong, though it will be. It is
that **nothing in the imported text is an approval**. A third party's
advertisement is evidence of what somebody else decided to hire for. It is not
your organisation's headcount decision, not your budget, not your owner, not
your band. Landing it live skips every precondition on the go-live edge in a
single operation — and does so at whatever scale the import runs at, which is
the scale at which nobody reviews anything.

There is no configuration flag for this. An "import directly as open" option
exists in order to be switched on during a migration and never switched off.

## The extraction preview

Parsed text must be **shown field by field before it is trusted**. Not a
summary, not a confidence score, not a preview of the rendered advertisement: a
view that says *this string went into the title, this list went into the
requirements, this range went into the band*, each editable in place.

The reason is specific to this domain. An extraction that invents a requirement
— a degree, a number of years, a licence — produces a record indistinguishable
from one where a human demanded it, and everything downstream (the screen, the
rubric, the rejection) acts on it at full strength. The provenance discipline
that keeps stated and inferred values apart belongs to the structured-brief
sibling; what belongs here is the interface obligation that a human sees each
extracted field *in its field* before the record becomes a requisition, because
that is the only moment the invention is cheap to catch.

Three supporting rules:

- **Low confidence produces an empty field, never a guess.** A field the parser
  could not determine is unfilled, and renders as unfilled —
  [absence of evidence is not evidence](../../_laws.md#absence-of-evidence-is-not-evidence).
  A plausible filler is the worst outcome available, because it survives review
  by looking normal.
- **What is extracted is marked as extracted.** The reviewer must be able to
  tell machine-derived content from what they typed —
  [inference must look like inference](../../_laws.md#inference-must-look-like-inference).
- **Nothing is asserted that the source did not contain.** If the advertisement
  never mentioned a location, the draft has no location —
  [say only what the record holds](../../_laws.md#say-only-what-the-record-holds).

## Bulk input, split deliberately

A pasted block frequently contains several advertisements. Splitting is a
useful convenience and a dangerous default, because a bad split produces
plausible garbage: one role's title with the next role's requirements, which
reads perfectly and describes nothing.

- Split on an **explicit separator the interface advertises**, and on the
  narrowest glyph set that separator can mean. A permissive delimiter alphabet
  is the classic self-inflicted wound here: characters that also appear inside
  ordinary formatted prose — heading underlines, thematic breaks — fragment one
  advertisement into several garbage roles that each look real enough to
  survive a glance. Prefer one documented divider over clever detection.
- The minimum-length floor doubles as the splitter's guard: a chunk below it is
  dropped rather than parsed, which is what stops a stray separator or a short
  heading from becoming an empty requisition.
- Show the split before the parse — a list of *n* detected roles the operator
  can merge or separate — rather than presenting *n* finished drafts.
- Keep each result independently reviewable and independently discardable. A
  bulk operation that succeeds or fails as one unit forces the operator to
  accept the bad splits to keep the good ones.

## The minimum-length guard

Refuse to ingest a fragment too short to be a description. A few dozen
characters — a title, a line, a truncated paste — cannot produce a requisition;
it produces a shell with an authoritative-looking title and nothing behind it,
and those shells are the hardest records to detect later precisely because
their one populated field looks fine.

Set the floor low enough to admit a terse but real description and high enough
to reject a headline, and state it as a number in **one** place. The single
source of truth is not tidiness: the client-side guard, the splitter and the
server-side check must agree exactly, or a chunk one of them accepts is
rejected by the next and the operator sees a failure they cannot explain.

Note the boundary: this guard
asks whether there is *enough text to parse*. The separate question of whether
a description carries enough substance to be advertised is a lint owned by the
inclusive-advertising sibling and applies at a different edge. Two floors, two
purposes; do not collapse them, or a role that is parseable becomes a role that
is publishable by accident.

## Decision rules

- **When the source is another organisation's advertisement, strip what is
  theirs.** Company name, employer-brand copy, their benefits, their
  application instructions and their contact details are not facts about your
  role, and leaving them in produces an advertisement that misrepresents who is
  hiring.
- **When the parse fails, keep the raw text on the draft.** The operator can
  finish by hand; a failed parse that discards the input has cost the user
  their paste.
- **When importing at volume, rate-limit the human step, not the machine one.**
  Fifty drafts a person must open individually is a real review; fifty drafts
  behind one "accept all" is an import that lands live under a different name.
- **When an ingested role is later opened, it goes through the same go-live
  gate as a hand-written one.** Ingest earns no shortcut; it is a faster way to
  reach the starting line, not a way past it.

## When not to use this

- **For migrating an existing system's live roles**, where roles genuinely were
  approved and open elsewhere. Even then, prefer landing them as drafts with an
  explicit, attributed bulk-open step, so that a person owns the assertion that
  these particular roles are funded and current — a migration is exactly when
  stale roles arrive in bulk.
- **For candidate-supplied text.** Parsing what a candidate sends is a
  different subject with different consent and provenance rules; do not reuse
  this path for it.
- **Where the source is a structured feed with a contract**, field mapping is a
  data-integration problem, not an extraction problem, and the preview
  obligation weakens to a mapping review. The landing state does not weaken.
