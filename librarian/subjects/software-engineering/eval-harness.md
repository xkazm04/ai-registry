---
domain: software-engineering
subject: eval-harness
last_touched: 2026-08-26
touched_by: intake
dry_streak: 0
---

# eval-harness

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-08-22 - `/research`, from an external source

`judge-stability` amended: the instrument's swing bounds the claim. Source:
[[2026-08-22-shapes-of-agent-memory]] - a controlled study where swapping the
reader+judge stack on byte-identical retrieval moved the score further (6.9
points) than the gaps between the systems under comparison (0.3-3.6), and
where the same system pair sat inside the swing on one benchmark and 15
points apart on another. The technique had the within-judge repeatability
floor; the cross-instrument ceiling and its scenario-set dependence were the
missing halves.

### 2026-08-26 - `/intake`, from a first-party prototype report

Gained **two** techniques (6 -> 8), the subject's first additions since forge.
Source: [[2026-08-26-knowledge-compressor]].

- `unaided-baseline-screening` - a scenario the candidate satisfies WITHOUT the
  material under test measures the candidate's prior, not the system, and it
  cannot be spotted by reading it. Run the scenario against a deprived candidate
  and discard everything the deprived run satisfies. The deprivation chosen IS
  the claim the suite supports, which is why it is written down beside it.
- `overshoot-and-restore` - when the harness is a bound on a search rather than
  a gate, the null change is always green, so an all-green optimization run
  cannot distinguish "reached the limit" from "did nothing". Require a failure,
  restore minimally, report the pair.

Both landed against a **missing stage**, not a missing opinion: the subject was
thorough from scoring onward and had nothing at scenario *admission*, and
nothing about the harness being used as a search bound at all. The golden path
gained one section, "A pass is evidence only where a failure was reachable",
which states the composition rule - screen first, then overshoot, because
overshooting an unscreened suite finds a phantom bound.

Corroboration: zero fetches. Training-data convergence (closed-book baselines;
delta-debugging's 1-minimality) plus corpus-internal convergence - the same move
already existed twice here, in other subjects.

## Boundary recorded (the other side is in test-harness)

`test-harness/negative-control-tests` and both new techniques run the same move
on different unknowns, and the pair is stated in both new files:

- Negative control: break the **system** to prove a **test** can fire. The
  instrument is the unknown; the mutation is disposable; restore completely.
- Unaided-baseline screening: deprive the **candidate** to prove a **scenario**
  can fail. The question is the unknown.
- Overshoot-and-restore: push the **system** to find **where** the test fires.
  The reduction is the deliverable; the restore is partial by design.

This is the deterministic subject's declared deferral working as intended -
test-harness owns the deterministic lane and defers non-determinism here.

## Open leads

- Candidate 7 from the same source (retrieval recall vs end-to-end answer
  accuracy - "comparing different sports") sits on the boundary between this
  subject and retrieval/retrieval-evaluation. Untriaged; if picked later,
  decide the home by which subject's stated job the confusion damages.

- **Law candidate, banked not written:** *a green result is evidence only where
  red was reachable.* Four sightings, three subjects, two runs (negative
  controls, lane ablation, and both techniques above). `failure-not-empty-success`
  covers how failure is spelled; `gate-sees-target` covers proxies; neither
  covers reachability. **Return on a fifth sighting outside `software-engineering`**
  - three of four are in this bundle, which is the shape a house habit takes.

## Declines

None.
