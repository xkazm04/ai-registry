# Batch track - composing the app from the kit, one owner-gated batch at a time

A batch is one feature group, split into at most `batch_builders` modules, built in parallel on disjoint
files, reviewed by the Director, gated by the owner in one sitting. The owner selects each next batch; the
flow is sized to his attention, not to the builders' speed.

## 1. Resume

- Overlay, `Kit.md`, `coverage.json`, `gates.md` (read every verbatim verdict: they are the taste).
- `git fetch`; the base's distance from its remote; `git log <base>..origin/<base> -- <candidate paths>` - a
  module redesigned on another machine is a constraint before the batch, not a merge surprise after.
- Foreign WIP in the working tree; gates' state on arrival (a red gate on arrival is inherited, attribute it).
- Re-run divergence + reachability + join; `coverage.mjs init --inventory` folds new modules in and lists modules the
  inventory no longer has (deleted or moved): mark each `dead` with a note, so the ledger never offers a ghost.
- If the session limit or a usage limit killed builders last time, resume them from their brief files; each
  builder checks `git log` and its own uncommitted files first.

## 2. Select

- Candidates = reachable modules with status `pending` or `sent-back`, in the owner's visibility order.
- One feature group per batch; a large group becomes several batches.
- **Liveness per module:** trace the route/mount from the app router to the module's page component, name it in
  the batch note. A module with no mount is a routing question. **Imported is not shipped:** also trace any gate on
  that path (a dev-only flag, a tier/entitlement gate, a feature flag) and record it; a dev-only or tier-gated surface
  is a target only when the owner says so.
- **Kit gaps first:** if `coverage.mjs status` prints KIT-GAP lines, run `/kit grow` before the feature batch:
  `open-batch --kind kit`, one builder, the kit plus the minimal adoption where the asker worked around the gap,
  each part added to the kit specimen view with tests, every approved kit page pixel-identical except intended
  adoptions; close with `add-kit-part --batch <id>` per part (marks the proposal built). **A kit batch is gated by the
  owner too** (the specimen and the parts' shots): the first kit batch's card came back with a layout defect and a
  scale requirement before any feature batch composed from it - gating it first saved a rework cascade.
- `coverage.mjs open-batch --id <feature-n> --modules ...`.

## 3. Look (before any source edit)

Register every view of every module in the shooter, record or synthesize a tape (read the shooter's
unknown-command report before trusting a shot), and take BEFORE shots of all views at the standard sizes plus
the tall view, dark and light. Write the visible-defect list per module. This is the headline of each builder's
decision list.

## 4. Build

Brief each builder from `builder-brief.md` (a scratch file per builder, amended in place when you learn more).
Rules the brief must carry: the doctrine seed, the project doctrine, the kit's API table, the owner's verbatim
quotes from `gates.md`, the visible-defect list, the region -> kit-part map requirement, "propose kit gaps, never
hand-roll a kit part locally, never edit the kit in a feature batch", file ownership, the commit ritual, the gates,
"never drive the running app". Parallel builders share nothing live: own ports, own tapes, no shared app data.

## 5. Review (Director)

- Open the pairs yourself; check each visible defect's before -> after and each doctrine rule.
- Attribute every ratchet move per file against the batch base; a rise in a builder's file is fixed, not
  re-baselined; drops are ratcheted by the Director on a clean tree after tracing.
- Compose the family image: each module after | a kit reference page (`scripts/family.py`).
- Collect proposed kit parts into `coverage.mjs add-kit-part` (status proposed).

## 6. Gate (owner)

See `gate-kit.md`. One question for the batch (improvement / one more pass / degradation, per module allowed),
plus one multi-select for the calls builders left open. Paths inside the questions. Capture verbatim.

## 7. Close

- `coverage.mjs close-batch --id ... --verdict ... --text "<verbatim>" --commits ...`; per-module statuses.
- Send-backs: resume the same builders with the verdict verbatim (they keep context); re-gate.
- `gates.md` entry; a correction becomes a taste line in the overlay; a rule seen twice moves into the project
  doctrine AND the builder brief (a lesson that lives only in memory never reaches the builder who repeats it).
- Ratchet on a clean tree; `Kit.md` updated; the batch note's `next:` pointer.
