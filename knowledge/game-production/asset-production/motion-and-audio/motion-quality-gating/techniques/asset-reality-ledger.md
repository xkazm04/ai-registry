---
layer: technique
type: technique
subject: motion-quality-gating
technique: asset-reality-ledger
status: forged
laws: [compiling-is-not-wiring, structural-proof-is-never-sufficient, unmeasured-is-not-a-pass]
shared_with: []
use_when: [reconciling what a project references against what is on disk, an asset exists and the character does nothing, auditing a generated content set before a build]
---

# The asset reality ledger

A project's belief about its own content and the content on disk drift apart
continuously, and every naive check confirms the belief rather than testing it. The
ledger is a reconciliation across four views of the same asset set, built so that the
gaps between the views are the output. It was derived for motion, where the drift is
fastest, and it generalises without change to any asset class a runtime resolves by
name.

## The four views

1. **Referenced** — every asset path any system asks for: state machines, composed
   montages, ability definitions, data tables, generated code. Record *who* references
   each path; a defect with no referrer is unactionable.
2. **Existing** — what a walk of the content tree actually finds, with its size.
3. **Valid** — the subset of existing assets that hold real content rather than a
   stub. Where a manifest or a content inspection is available, validity means the
   asset carries the structures it is supposed to carry — sections, markers, tracks.
4. **Falling back at runtime** — the signals a running build emits when it could not
   resolve or play something and quietly substituted a default. This is the only view
   that describes what a player sees.

Each adjacent pair yields a finding, and they are different defects with different
owners:

- Referenced but not existing → **missing**. The loud one. A name-level break.
- Existing but not valid → **hollow**. The one that survives every naive check.
- Existing but referenced by nobody → **orphan**. Dead weight, and often the ghost of a
  rename that left the real reference pointing at nothing.
- Working on paper but falling back at runtime → the gap between the build and the
  play session, and the one that ends arguments.

## The hollow asset is the whole point

A failed export writes a file. It has the right name, it is in the right folder, it
opens, it loads, it validates, and it contains nothing. Every existence check passes.
Every compile passes. The wiring check passes, because the reference resolves. And the
character stands still.

This is why the ledger needs a content-aware view and not just a directory walk. Where
real validity information exists — a manifest of what each asset actually contains —
use it. Where it does not, a size floor per asset kind is a serviceable heuristic: an
asset of a given kind below a few kilobytes is almost certainly a shell.

Two constraints on the heuristic, and both matter. **It is per kind, never global** —
some kinds are legitimately tiny and others are legitimately enormous, so one threshold
across all of them produces both false alarms and silence. **It is a heuristic and must
be labelled one**, yielding to real content inspection whenever that is available. A
heuristic presented as a fact is how a threshold becomes an unexamined law.

## Decision rules

- **Classify by kind before judging.** The same path is judged differently depending on
  what it is. Use path-segment signals before name signals — an asset sitting in a
  level folder is a level reference whatever its name prefix suggests — and let the
  first matching pattern win, with the order written down.
- **A view that could not be collected is not an empty view.** If the content tree was
  unreachable, or no runtime session was observed, the ledger reports that view as
  uncollected. Every asset would otherwise appear missing, or every fallback absent,
  and a green summary from an uncollected view is the worst output this tool can
  produce.
- **The summary status is not an average.** Any missing or hollow asset of a kind the
  system genuinely depends on is a red status. Counting is not grading; a ledger that
  reports "94% healthy" has hidden the six percent that stops the character moving.
- **Name the kinds whose absence is fatal.** Not every gap is equal. Declare the set of
  kinds the subsystem cannot function without and let everything else be reported
  without escalating the status.
- **Keep the reconciliation core pure and the collectors thin.** The interesting logic
  takes plain lists and returns findings, so it can be tested without a filesystem or a
  running build. Collectors that read a tree or scrape runtime signals are adapters and
  should hold no judgment.

## When not to use it

- **As the sole quality signal.** The ledger proves that assets exist and carry
  content. It says nothing about whether the content is any good — that is the
  perceptual ruler's job, and structural proof is never sufficient.
- **On a content set that is intentionally partial.** During blockout, most references
  point at placeholders on purpose. Run the ledger, but compare against an expected
  baseline rather than against zero, or it reports the plan as a catastrophe.
- **Where the runtime view cannot be collected at all.** Build the other three and say
  so. A three-view ledger is useful; a three-view ledger claiming to be a four-view one
  is not.

## The failure this prevents

Everything compiles, every reference resolves, the content folder is full, and the
character is motionless. The team spends days in the wiring layer — where nothing is
wrong — because the only question anyone knew how to ask was whether the assets were
there, and they were. The ledger turns that week into one line: this asset exists, is
two kilobytes, holds no sections, and the runtime has been substituting a default for
it since the day it was generated.
