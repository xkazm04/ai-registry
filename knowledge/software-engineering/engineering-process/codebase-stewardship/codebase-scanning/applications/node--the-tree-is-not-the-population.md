---
layer: application
type: application
subject: codebase-scanning
technique: the-tree-is-not-the-population
stack: node
status: forged
verified_on: 2026-08-31
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# A security gate that reports its findings and not its population

A desktop application in this fleet gates its content-security policy with a
dependency-free checker: it walks the frontend source tree, extracts every host
the code fetches from, and fails the build if any host is absent from the
policy. It closes on success with a single line naming the number of fetch
targets and the number of distinct hosts, all allowed.

That line is the whole report, and it is a statement about findings with no
statement about the population they were drawn from. The checker's traversal
keeps a file only when its extension is one of two source extensions, and
prunes two directory names. Neither the extension filter nor the pruning
appears in the output. The gate is a good instance of the shape this technique
describes because nothing about it is careless — the filter is deliberate, the
pruning is correct, and the report is still unfalsifiable.

## The paired comparison

The measurable is the one the technique names: how much of the enumerated tree
was never examined, and whether a reader of the report can tell. Both arms ran
over the same root, in the same session, on the same instrument — arm A being
the traversal exactly as the checker implements it, arm B enumerating first and
classifying each removal by the filter responsible.

| | Arm A (as written) | Arm B (enumerate, then filter) |
| --- | --- | --- |
| Enumerated | not computed | 5,955 files |
| Examined | 5,033 files | 5,033 files |
| Excluded | not computed | 922 files (15.5%) |
| Excluded, by filter | — | 922 by the extension filter |
| Reported to the operator | 0 of the above | all of the above |

Neither arm changes which files are examined; that is the point. The technique
does not claim the gate is looking at the wrong things. It claims that a report
saying "all allowed" over a silently reduced population is a claim the reader
cannot size, and 15.5% is the size.

## The falsifier came back negative, which is the more useful half

An excluded file matters only if it could have carried something the gate
existed to judge. The probe therefore scanned all 922 excluded files for
anything fetch-shaped — an absolute URL literal, a fetch call, a websocket
construction — deliberately using a broader matcher than the gate's own, so
that a miss would be the probe's fault rather than the gate's.

The raw count was 184 files. Hand-classifying all 184 by extension collapsed it
to **zero**: 183 are data files (locale catalogs whose translated strings
legitimately contain URLs, and a generated index), and one is a design
document. **No code-bearing file is excluded from this gate today.** The first
number was not the measurement, and reporting 184 as a near-miss count would
have been wrong in the direction that flatters the finding.

So the gate is sound. What the paired comparison establishes is *why* it is
sound: not because the gate checks anything, but because every executable file
under that root currently happens to carry one of the two extensions the filter
admits. That is an invariant the project satisfies and does not state. The day
a plain-JavaScript, single-file-component or inline-script file with a network
call lands under that root, the gate keeps printing the same reassuring line
and nothing announces the change — the shape
[absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud) forbids, sitting
one level below where the gate's authors were looking.

## What the tree's own shape says about the standard

The structural fact is the ratio, and it argues the technique rather than
merely instancing it. A traversal author choosing an extension allowlist is
making a claim about the *code* population; the denominator they are silently
reducing is the *file* population, and here those two differ by 922 files
because the same directory holds the locale catalogs, the generated indexes and
the design notes alongside the source. Nobody designed that adjacency for the
gate's benefit, and nobody who wrote the filter was thinking about it. The
15.5% is an accident of layout, which is exactly why it needs printing rather
than reasoning about: it will change without anybody deciding it should.

## The change, and what shipping it cost

Two additions to the traversal — a tally of removals keyed by the filter
responsible, incremented at the two points where the walk already discards —
plus one clause on the closing line, turning it into a statement over a stated
denominator. 24 lines added, 3 removed, one file. That is the cheapest form
this technique ever takes, and the reason it is worth doing before there is an
incident to justify it.

Both arms then ran through the gate's own entry point, on the same tree, in the
same session:

```
A: CSP hosts OK — 2 frontend fetch target(s) across 2 host(s), all allowed …
B: CSP hosts OK — 2 frontend fetch target(s) across 2 host(s), all allowed …
     scanned 5033 of 5955 file(s) under src/ (922 excluded: not .ts/.tsx; 0 dir(s) pruned)
```

Same verdict, same targets, same hosts, same exit code; the denominator is the
whole delta. The project's linter passes on the changed file. The counts also
reproduce the earlier read-only probe exactly, which is the check that the probe
had faithfully reproduced the traversal rather than approximating it.

**And the shipped instrument immediately reported something the probe had not
thought to ask.** The pruned-directory counter reads **zero**: the walk carries a
guard against two vendored and build-output directory names, and under this root
that guard has never fired, because neither directory exists there. The guard is
not wrong — it is defensive against a layout the project does not have — but a
reader of the old output would have assumed it was doing work. This is the
technique's last section arriving on its first run: once the excluded set is
published it starts carrying information the scan did not set out to produce.

## What this realization cannot do

The probe measured one gate under one root. It says nothing about the project's
other checkers, several of which walk the same tree with their own filters, and
the technique's claim about *those* is untested here. It also cannot speak to
the pruned directories: both are vendored or generated build output, and
neither was enumerated in arm B beyond being counted as pruned, so the 5,955
denominator is itself a figure over an already-pruned tree. A fully honest
denominator would name that outer boundary too — which is the technique
applying to its own measurement, and worth saying rather than hiding.
