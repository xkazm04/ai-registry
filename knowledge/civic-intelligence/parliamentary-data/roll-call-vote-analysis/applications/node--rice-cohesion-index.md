---
layer: application
type: application
subject: roll-call-vote-analysis
technique: rice-cohesion-index
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# Rice cohesion index in a civic-graph vote record (node)

The politicas repo already honours most of the technique: one definition of the
positional base and the floor, imported by both the knowledge-graph pass and the
vote-record page; a chamber figure weighted by positional ballots; a group's mean
that ships its qualifying-vote count (`riceVotes`); and a day with nothing above
the floor drawn as a dashed *not measured* mark rather than a perfect-unity stub.

## The seam chosen to falsify "the mean always ships its count"

The technique says an unweighted mean over qualifying votes should travel with the
qualifying-vote count. The club board did. The per-day seismogram bucket did not:
its mean averaged only the votes that had a cohesion value, but the bucket carried
only the day's total vote count, so a mean over one qualifying vote read, beside
"N roll-call votes", as a mean over the whole day. A caught outcome would have
shown the repo had applied the rule in one aggregation and missed it in the other;
that is what it showed.

## A and B

- **A (as shipped):** day bucket = date, total votes, mean cohesion, rebels.
- **B:** the bucket also carries `cohesionVotes`, the count the mean is over, and
  the day detail prints it beside the figure.

Target: the qualifying count is available to the reader. A absent; B present, 2 on
the fixture day and 0 on the same day under a floor above every club's size, where
the mean is null. Floor: the mean values are unchanged, the votetrack unit suite
(211) and the full pre-push suite (4128) green, lint clean.

Not measured: how often live days have a qualifying count far below the vote count.
Return condition: when the live record is next loaded, count days where
cohesionVotes is under half of votes.
