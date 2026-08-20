---
layer: technique
type: technique
subject: repo-manifest-standard
technique: must-ignore-unknown
status: forged
laws: [one-validation-door, failure-not-empty-success]
shared_with: []
use_when: [specifying how a reader parses a contract, adding a field to a shared artifact, writing a generator that rewrites a file others also write]
---

# Must ignore unknown

A convention is adopted faster than its readers are upgraded. From the first day
there are two versions in the field, and there will never again be only one. The
clause that makes this survivable is short enough to fit in a sentence and must
appear **in the specification**, not in a maintainer's head:

> A conforming reader must ignore any field, key, or enumerated value it does
> not recognize, and must not treat its presence as an error.

State it in the file format's own terms — open maps everywhere, no closed record
types, no "additional properties forbidden." A schema that rejects unknown keys
has made every future addition a breaking change, and the standard's practical
answer becomes "never extend," which is how conventions calcify and get replaced
by whatever is willing to grow.

## Where strictness is still correct

*Must ignore* is not *must accept anything*. The narrow strict set:

- **The contract version field.** Absent or unparseable is a hard error; a major
  version above what the reader understands is a refusal to proceed, stated as
  such. This is the one field whose meaning the reader cannot afford to guess.
- **The type of a recognized field.** A field the reader knows, holding a shape
  it does not expect, is malformed — not unknown. Ignoring it silently hides a
  real defect.
- **Required fields of a recognized entry.** A capability entry with a name and
  no invocation is broken, and saying so is the reader's job.

Everything outside that set is ignorable. The distinction to hold: **unknown is
tolerated, malformed is reported.** Collapsing them in either direction is a
defect — a reader that errors on unknown fields blocks evolution, and a reader
that shrugs at a malformed known field reports success over garbage
(`_laws.md#failure-not-empty-success`).

## The writer's half, which is violated far more often

Ignoring what you do not recognize does not mean deleting it.

The common accident: a generator rebuilds the manifest from its own model and
writes it out. Every field it has no opinion about vanishes. If a second tool
owned those fields, their content is gone — no error, and a diff that reads as a
tidy-up rather than a loss.

The writer's contract, in three obligations:

1. **Read what is committed** before writing.
2. **Carry forward every key you do not own**, unexamined, in place.
3. **Write only your own keys, and let your own keys win** — so a foreign field
   can never shadow the version identifier, a capability name, or a count.

This is worth a test, and the test is cheap: place a foreign key in the
committed file, regenerate, and assert it survives; place a hostile value in an
owned key, regenerate, and assert it is replaced rather than merged.

## One door

Both halves — parsing on the way in, merging on the way out — belong to exactly
one function each, and every consumer of the manifest goes through them
(`_laws.md#one-validation-door`). Parsing sprinkled across call sites is parsing
minus the call site added next quarter, and that site will be the strict one that
crashes on a field somebody added in good faith.

The door also gives the ignore rule an observable surface: it can *count* what
it ignored. A reader that reports "3 unrecognized fields ignored" during a
verbose run turns a silent tolerance into a diagnosable one, which is how a
version skew gets noticed before it becomes an incident.

## Decision rules

- **When an enumerated value is unrecognized, ignore the entry containing it,
  not the whole document.** One unknown capability name must not cost the reader
  the five it does understand.
- **When a field's meaning must change, do not reuse its name.** Add a new field
  and leave the old one ignorable. Reuse is the one change that *must-ignore*
  cannot protect anyone from, because old readers will happily read the new
  meaning under the old name.
- **When you need a field only your tool understands, namespace it** under a key
  that clearly belongs to one consumer, so the carry-forward rule has an
  unambiguous owner and no future core field can collide with it.

## When not to use this

Do not apply must-ignore to a document whose entire purpose is exhaustive
enumeration — a lockfile, a signed inventory, an attestation whose value comes
from listing everything. There, an unrecognized entry is a real finding, and
tolerance defeats the artifact. Must-ignore belongs to *extensible descriptions*,
not to *closed accountings*.
