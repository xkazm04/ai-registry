---
layer: application
type: application
subject: metric-surface-contract
technique: metric-removal-is-a-staged-pipeline
stack: python
status: forged
verified_on: 2026-09-03
verified_against: python@3.12
---

# A deprecation pipeline written after a removal was noticed too late

The clearest available instance of this technique is a project-wide policy that exists
because a metric removal that looked safe was not. Citations are against
`vllm-project/vllm` at commit `facd9a74a1cd1b9fed324cdc2cceb8d54fdad3d0`, files
`docs/contributing/deprecation_policy.md`, `docs/design/metrics.md`,
`vllm/config/observability.py`, `vllm/version.py`, `vllm/v1/metrics/loggers.py`.

## 1. The incident

`docs/design/metrics.md:435-447` names it in one sentence and three links: a throughput
metric was deprecated "with a comment in the code", later removed, "and then noticed by a
user" — the issue arriving after the release. The document's own conclusion is that
deprecating metrics "shouldn't be taken lightly. Users may not notice a metric has been
deprecated, and may be quite inconvenienced when it is suddenly (from their perspective)
removed, even if there is an equivalent metric for them to use."

A comment in the emitting code is read by maintainers. The consumer was not a maintainer.
That is the whole argument for a pipeline, and it is dated.

## 2. The pipeline

`docs/contributing/deprecation_policy.md` is short and is the policy. Deprecations are
tied to **minor (Y) releases** of an X.Y.Z scheme (`:13-19`), and the stages are:

1. **Deprecated, still on by default** (`:34-47`) — "a removal version is explicitly
   stated in the deprecation warning (e.g., 'This will be removed in v0.10.0')",
   communicated through help strings, log output, API responses, `/metrics` output, user
   documentation, release notes and an RFC issue for feedback. The metrics-specific
   guidance at `docs/design/metrics.md:449-458` adds: put the notice in the help string
   that appears in the scrape output, list it in user-facing documentation and release
   notes, and hide it behind a flag before deleting.
2. **Deprecated, off by default** (`:49-56`) — "Feature is disabled by default, but can
   still be re-enabled via a CLI flag or environment variable. Feature throws an error
   when used without re-enabling ... Ensures any remaining usage is clearly surfaced and
   blocks silent breakage before full removal." The error is the feature.
3. **Removed** (`:58-62`) — "Only features that have passed through the previous
   deprecation stages will be removed."

`:64-72` works the timeline: deprecated in `v0.9.0`, off-by-default in `v0.10.0`, gone in
`v0.11.0`. And `:76-77`: "**No Removals in Patch Releases** ... to avoid surprising
users." A grace-period clause (`:78-79`) starts the clock now for everything deprecated
before the policy existed, rather than retroactively — the rule that stops a new policy
from immediately breaking people.

## 3. The escape hatch expires by construction

`ObservabilityConfig.show_hidden_metrics_for_version`
(`vllm/config/observability.py:19-26`) takes the version the metric was hidden in, not a
boolean: "if a previously deprecated metric has been hidden since the v0.7.0 release, you
use `--show-hidden-metrics-for-version=0.7` as a temporary escape hatch while you migrate
to new metrics." The `show_hidden_metrics` property (`:27-34`) delegates to
`version._prev_minor_version_was` (`vllm/version.py:15-32`), which returns true only when
the supplied string equals the *immediately previous* minor version — a dev tree matches
anything, and an assertion pins the current major.

So a flag left in a deployment template silently stops granting anything one minor
release later, instead of keeping a dead surface alive forever. A field validator
(`observability.py:132-138`) parses the value so a malformed version fails at startup
rather than quietly disabling the hatch. This is the technique's "deadline with a value
attached" as forty lines of code.

## 4. The named regrets, which are the queue

`docs/design/metrics.md:463-500` is a list of the surface's own defects, each with what
should happen to it: a metric added and never implemented ("can just be removed"); two
queue-time metrics added two weeks apart computing the same interval, where the survivor
is chosen because "the latter is used by the Grafana dashboard, so we should deprecate or
remove the former" — the demonstrated consumer, not the nicer name; a hit-rate gauge
already replaced by counters; two metrics describing a swap mode the current engine no
longer has.

`:379-403` is the sharpest of them: a metric encodes per-adapter running and waiting
counts as a comma-separated string in a label, which the document calls "quite
misguided — we could use labels to distinguish between per-adapter counts", immediately
followed by a link to a known downstream user and the note that if the design is
revisited, "we should coordinate with downstream users so they can migrate before the
removal". A regret, a partial enumeration of the consumers, and a migration obligation,
in the same paragraph. `:610-618` extends the self-critique to naming: colons in metric
names against the ecosystem's reservation of that character for consumer-defined rules,
inconsistent unit suffixes, and a suffix the exposition format rewrites.

## 5. Where it falls short

The plumbing is ahead of its use. `show_hidden_metrics` is read into the exporter at
`vllm/v1/metrics/loggers.py:461-463` — with the comment "Use this flag to hide metrics
that were deprecated in a previous release and which will be removed future" — and, at
this commit, nothing in the metrics exporter branches on it: the field is stored and not
consulted. Stage 2 has a mechanism and no occupants, while the regret list above holds
several metrics that ought to be in it. The standard is unchanged and the direction is
right: a pipeline built before it is needed is the correct order, but a stage nothing has
ever passed through has not yet been proven to work.
