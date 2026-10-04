---
layer: technique
type: technique
subject: data-video-virality
technique: precedent-evidence-gate
status: draft
laws: [unmeasured-is-not-pass, output-never-outruns-evidence]
shared_with: []
use_when: [triaging a backlog of data-video ideas, defining a pass threshold for content ideas, auditing why an accepted idea underperformed]
---

# Precedent evidence gate

A content idea earns precedent points only when there is evidence that
its format and topic already pulled an audience. The evidence is a comparable video
with counted public views, recorded together with its source and the
date it was observed. The gate exists because subjective scores ("strong
hook", "universal") all feel equally confident and are mostly
uncorrelated with outcomes.

## Procedure

1. For each idea, search for **direct comparables**: the same topic in
   the same visual form. Record title, channel, views, length, link and
   observation date.
2. If there is no direct comparable, look for **adjacent** ones: the same
   form on a neighbouring topic, or the same topic in another form. Mark
   them as adjacent.
3. Turn the best comparable's views into a tier score. The tiers are
   logarithmic because view counts are: millions, about a million, a
   quarter-million, tens of thousands, below that.
4. **Cap adjacent evidence** one or two tiers below what direct evidence
   at the same views would earn. Adjacent evidence shows that the form
   works, not that this topic works.
5. Turn the tier into a **bounded score** (about a tenth of the total).
   It ranks ideas that already passed the continuity, path and event
   gates. It never passes an idea on its own: a famous topic with millions
   of views behind it still fails if the chart has no path.

## Decision rules

- No counted views, no precedent points. "Probably popular" is a
  hypothesis to record, not a score.
- Precedent rewards a topic, not a chart. It is weighed after the
  continuity gate and the path check, never instead of them.
- Evidence ages. Keep the observation date, and re-observe before a
  build decision if the evidence is more than a few months old.
- Engagement signals from a platform without public view counts (upvotes,
  likes from search snippets) count as adjacent at best. Note the
  substitution.
- Keep comparables in a shared reference library, so later batches can
  reuse them and the gate stays consistent across scorers.

## When not to use it

- **Deliberate experiments.** A slot reserved for testing an untried
  format should be labelled as an experiment, not passed through a
  relaxed gate.
- **Commissioned or owner-mandated topics.** Score them for information,
  but don't let the gate veto a decision that was never the backlog's to
  make.
