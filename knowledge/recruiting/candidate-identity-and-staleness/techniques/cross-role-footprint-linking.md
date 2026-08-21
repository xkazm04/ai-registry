---
layer: technique
type: technique
subject: candidate-identity-and-staleness
technique: cross-role-footprint-linking
status: forged
laws: [say-only-what-the-record-holds, every-decision-names-its-actor, uncertainty-resolves-toward-the-candidate]
shared_with: []
use_when: [showing a recruiter everywhere a candidate has been considered, building a saved-analysis or profile surface, deciding whether an identity join may cross a redaction or entity boundary]
---

# Cross-role footprint linking

A candidate's footprint is the set of places one person appears across the
organisation: the openings they applied to, the pools they were sourced into,
the analyses run on their material, and what was concluded each time. Assembled,
it turns a per-opening row into a picture of a relationship — and it is the
single most useful artifact a recruiter can be handed when deciding how to treat
someone who is already known.

The join that produces it is the identity question made operational, so it
inherits every hazard in the subject and adds one of its own: a footprint is a
*disclosure surface*. Everything it assembles was previously scattered, and
scattering was sometimes the point.

## Build the footprint on the strongest key you have

Order the joins by how exact they are, and label the result with which key
produced it.

1. **Artifact identity.** Records referencing the same content digest hold the
   same document. Exact, cheap, no false positives, and the backbone of the
   footprint.
2. **Issued identifiers.** An account, a verified contact address, a
   single-use invitation. Exact where present; frequently absent.
3. **Probabilistic person matching.** Everything else — name similarity,
   overlapping employers, a phone number, a public profile link. Useful,
   never conclusive, and never permitted to drive an adverse action on its own.

A footprint that mixes tiers must say which tier each link came from. "Also
considered for two other openings — matched on the same document" is a fact.
"Also considered for two other openings" where one link is a name-similarity
guess is a statement the record does not support
([say only what the record holds](../../_laws.md#say-only-what-the-record-holds)).
The distinction is not fussiness: a recruiter reading a footprint forms a view
about the person's persistence, seniority, or desperation, and forming it from a
mis-join is a real harm.

## What the footprint is worth

- **It prevents institutional amnesia.** A person applying for the fourth time
  should not be greeted as a stranger, and a recruiter about to reject someone a
  colleague is interviewing elsewhere should know it.
- **It makes duplicate work visible.** The same document analysed five times,
  each analysis costing money and producing a marginally different verdict, is
  a visible defect once the footprint exists and invisible before.
- **It exposes inconsistency.** Two very different conclusions about the same
  document, drawn under the same requirement, is a calibration signal you would
  otherwise never see.
- **It is the substrate for rediscovery.** The neighbouring practice of
  re-surfacing previously assessed people consumes this footprint and depends
  on its correctness.

## The boundaries it may not cross

This is the technique's real content. Linking is a capability; using it is a
decision with a name on it
([every decision names its actor](../../_laws.md#every-decision-names-its-actor)).

- **Redaction boundaries.** If an assessment is being conducted blind, the
  footprint is a re-identification channel — it names the person, their history,
  and often the very attributes the redaction removed. The blind surface either
  does not show the footprint at all, or shows a strictly reduced form that
  carries no identifying content. Never both a blind screen and a full
  footprint on the same page.
- **Anonymisation.** A record whose link to a human was deliberately destroyed
  is out of the join permanently, in both directions. A footprint that
  reassembles an erased person from their surviving records has performed the
  exact reconstruction the erasure existed to prevent. This is terminal, not a
  filter to be relaxed for an internal tool.
- **Legal entity and tenancy boundaries.** Two openings held by different
  employing entities, or different customers of a shared system, may not share
  a footprint merely because the same file was submitted to both. The person
  applied twice, to two organisations, and consented once to each.
- **Consent scope.** Where a candidate provided material for one opening only,
  the footprint may record that the material exists without exposing its
  content across the boundary.

When any of these is in doubt, show less. A missing footprint costs a recruiter
a search; a footprint that should not have been assembled cannot be un-seen
([uncertainty resolves toward the
candidate](../../_laws.md#uncertainty-resolves-toward-the-candidate)).

## Presentation rules

- Show **what was concluded**, not just that something was concluded. A
  footprint listing four openings with no outcomes invites a recruiter to
  assume the worst.
- Show **when**, on every entry. A footprint is a set of dated claims, and the
  age of each is the reader's main tool for weighting it.
- Show the **staleness state** of each linked analysis, since an old footprint
  entry is precisely where a superseded judgment gets quoted as current.
- Do **not** aggregate the footprint into a derived score. "Applied six times"
  is a fact; turning it into a persistence or desperation signal is an
  inference about a person built from your own record-keeping, and it will
  correlate with things you cannot defend.
- Make each entry navigable to the underlying evidence. A footprint that cannot
  be drilled into is a rumour with a layout.
- Make the lookup **best-effort**: a fault in the identity store hides the
  footprint, it never breaks the record it decorates. The footprint is context
  added to a report, and a report that fails to render because a secondary join
  failed has traded a small loss for a total one. The corollary is that an
  absent footprint must never read as *this person has no history* — say
  nothing rather than say none.

## When not to use it

Do not build a footprint surface before the identity keys are trustworthy. A
footprint over label-derived identity is a machine for displaying one person's
history under another person's name, at exactly the moment a recruiter is
paying attention.

Do not surface a footprint to a reader who is not entitled to all of it. The
partial footprint — filtered to what this reader may see — is usually the right
product, and it must be visibly partial, or a hiring manager will read the
absence of other openings as a fact about the candidate.

And do not use the footprint to influence a score. Its job is context for a
human. The moment prior appearances feed a ranking, familiarity begins
compounding, and containing that ratchet is the rediscovery discipline's
problem, with rules this technique does not restate.
