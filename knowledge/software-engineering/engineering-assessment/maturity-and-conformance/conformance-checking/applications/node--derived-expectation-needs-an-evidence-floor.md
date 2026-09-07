---
layer: application
type: application
subject: conformance-checking
technique: derived-expectation-needs-an-evidence-floor
stack: node
verified_on: 2026-09-07
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# Three derived-evidence gates in one tree, one of which had the floor

The stack version is witnessed by the runtime the gates are executed under in
this tree — `node v24.14.0`, the interpreter that ran all four arms below.
The gates are dependency-free ES modules run directly, with no test framework
between the assertion and the exit code.

## The three gates

A knowledge-registry repository runs its own checkers, and three of them
derive their evidence by pattern-matching source text rather than by loading
or executing what they describe:

- a **citation liveness** gate that extracts every prose URL from the corpus,
  strips fenced and inline code first, and probes each one;
- a **usage lane** gate and a **signals lane** gate, each scanning contributor
  files against five patterns for leaked absolute paths, URLs and email
  addresses, because the repository is public and those files are written by
  an installation elsewhere.

The first already carries the floor this technique argues for, and states it
in the imperative:

> `if (urls.length < 50) die(...only ${urls.length} citations extracted over ${files.length} files; expected 100+. THE EXTRACTOR IS BROKEN.)`

It also runs a known-alive and a known-gone control through its probe before
reporting any verdict, and refuses to report at all if either control comes
back wrong. That gate was written independently of this technique and reached
the same rule, which is the strongest corroboration available for it.

The other two had neither. They are **must-not-match** scans, which is the
harder shape: a clean sweep and a dead pattern set produce identical output,
and the count each gate publishes says how many files were read, never whether
the patterns can still fire.

## The paired proof

Population: the one real contributor file in the usage lane, carrying a
planted Windows absolute path — the exact hazard the gate exists to stop. The
decay modelled in arm B is pattern drift: the five character classes narrowed
so none match, standing in for the hazard's spelling changing under a gate
nobody re-validated.

| arm | patterns | control | exit | outcome |
| --- | --- | --- | --- | --- |
| A | as shipped | none | 1 | leak caught, named |
| B | drifted | none | **0** | **leak shipped, lane reported OK** |
| A′ | as shipped | added | 1 | leak caught, named |
| B′ | drifted | added | 2 | refuses, names the dead pattern |

Arm A is also the calibration: before trusting any of this, the gate was run
against a file with no leak (green) and against the planted one (red, naming
the Windows path). A first attempt at that calibration was invalid and worth
recording — the planted value was written through a shell argument, which ate
the backslashes, so the "known positive" contained no path separator and the
gate correctly ignored it. The instrument agreed with a broken fixture, which
is precisely the failure mode this technique is about, arriving one level up.

Arm B is the finding: an ordinary decay in the derivation converts a true
failure into `exit 0` and the words `usage lane OK`, with nothing else in the
output different. Arm A′ is the cost check — the control adds no false
positive on the healthy path — and B′ is the repair.

## What was changed

Both scanners now assert their own patterns against one fixed positive per
pattern, in pattern order, before reading a single contributor file, and exit
2 naming the dead pattern rather than reporting a clean lane. This is the
discipline the citation gate already used for its network probe, moved to the
two gates that lacked it; the comment in each says why the published count
cannot substitute for it. Both gates stay green on the real tree.

The technique's other clause — separating *derived nothing* from *derived and
matched* in the per-case result — does not apply to these two, because a
must-not-match scan has one population and no per-case empty. It applies to
the citation gate, which already reports its three states separately.

## What this realization cannot do

The control proves each pattern can fire; it says nothing about whether the
five patterns are the right five. A leak in a shape nobody enumerated — a
hostname, a username without a path, a project code — passes every arm above,
and the control makes that gap *harder* to notice by adding a reassuring green
line where there used to be none. The floor is a guard against the instrument
decaying, never against it having been incomplete on the day it was written,
and a reader copying this should not let the control stand in for reviewing
the pattern set against what the lane actually carries.
