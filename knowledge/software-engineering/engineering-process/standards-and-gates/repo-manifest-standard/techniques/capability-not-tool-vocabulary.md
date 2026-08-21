---
layer: technique
type: technique
subject: repo-manifest-standard
technique: capability-not-tool-vocabulary
status: forged
laws: [one-authority-per-vocabulary]
shared_with: []
use_when: [naming the fields of a repository contract, deciding whether to record a tool name, migrating a manifest off a replaced tool]
---

# Capability, not tool

The single most important rule in a repository contract: **each entry names a
capability and the command that fulfils it. It never names the tool behind the
command.**

A capability is something a repository can *do*: check types, lint, run unit
tests, build, format, audit dependencies, run migrations. It is stable across
decades because it describes an obligation, not an implementation. A tool is
whatever currently discharges that obligation, and tools are replaced on a
timescale of years — sometimes faster than the readers of the manifest are
updated.

The reason this matters more than it sounds: when a tool is swapped, a
capability-shaped manifest changes in exactly one place — the command string —
and every consumer keeps working without knowing anything happened. A
tool-shaped manifest changes in its *schema*, which means every consumer that
learned the old field must be found and updated, and the ones you cannot find
keep reading a field that is now a lie.

## The procedure

1. **Write the obligation as a sentence.** "Before integration, the types must
   check." Not "the type checker must run."
2. **Reduce it to a lowercase, hyphenated capability name** drawn from a small
   declared set. The name must be understandable by someone who has never seen
   this repository: `typecheck`, `lint`, `test-unit`, `build`, `format-check`.
3. **Attach the invocation** — the literal command, as it would be typed at the
   repository root, that fulfils the obligation.
4. **Attach the enforcement point** — where this capability is expected to hold
   (before a push, before merge, on a release candidate). This is a property of
   the obligation, not of the tool.
5. **Stop.** Do not add a field describing the implementation. If you find
   yourself wanting one, see the exceptions below.

## Controls are a second list, and it must be cross-checked

Step 4 deserves its own structure rather than a field on each entry, because the
useful question is asked in the other direction: *which gates does this
repository claim, and does each one have something behind it?*

Keep a short list of **controls** — capability names grouped by where they are
enforced — separate from the capability map. The split that has held up in
practice is two tiers: the checks fast enough to run before code leaves the
machine, and a thin backstop that must pass before integration in a clean
environment. Fast, cheap and deterministic checks belong in the first tier;
slow, environment-sensitive ones in the second. Tune the boundary per
repository — a small test suite belongs early, a thirty-minute one does not —
but state the boundary rather than letting it be wherever someone wired it.

The cross-check is the payoff and costs one comparison: **every control name must
appear in the capability map, and the gap is a finding.** A control with no
backing capability is a policy nobody can run; a capability with no control is a
tool nobody has decided to trust. Both are actionable, and neither is visible
until the two lists exist separately.

The invocation is the only vendor-shaped string in the entry, and that is
deliberate: it is *one field, one line*, and everyone already understands that
commands change. A vendor name in a *field name* or an *enumerated value* is the
expensive kind, because it propagates into every reader's parsing code.

## Decision rules

- **When a capability is provided by two tools at once** (two linters, a fast
  and a thorough test pass), do not create two tool-named entries. Create two
  capability entries with distinct obligations (`lint`, `lint-strict`) or one
  entry whose command runs both. The reader cares how many gates there are, not
  how many products.
- **When a capability does not exist in this repository, omit the entry.** Do
  not declare it with an empty command or a placeholder. Absence means "not
  offered"; a declared-but-broken invocation means "offered and failing," and
  those must not look alike.
- **When the capability set needs a new member, add it to the declared set
  first.** The set of capability names is a closed vocabulary with exactly one
  authoritative definition in the specification
  (`_laws.md#one-authority-per-vocabulary`). A reader that encounters an
  unrecognized name ignores that entry — it does not guess, and it does not
  fail.
- **When two repositories fulfil the same capability differently**, that is the
  point. The whole value of the capability layer is that a fleet-wide reader can
  ask "does every repository have a unit-test gate?" without knowing that half
  of them use a different runner.

## The legitimate exceptions

There are two, and both are narrow.

**A tool name inside the invocation string.** Unavoidable and correct — the
command has to name something. Keep it to the command, never mirror it into a
sibling field "for convenience," because the sibling is what goes stale.

**A tool name in the provenance record.** The manifest may record which
generator produced it and at which version, because that is a historical fact
about a document, not a claim about the repository's present tooling. It is
descriptive of the past and therefore cannot rot.

Everything else — "framework", "package manager", "test framework", "language
version" as manifest fields — is either already stated by an authority in the
repository (point at it, do not restate it) or is a vendor position dressed as a
schema.

## When not to use this

Do not force capability abstraction onto something that genuinely *is*
tool-specific and only ever will be: a per-consumer overlay that configures one
tool's behaviour is allowed to be tool-shaped, because that is its declared
scope. The rule protects the *neutral* document. Trying to make an overlay
vendor-neutral produces a second, worse abstraction layer that nobody needs and
that must be maintained in lockstep with the tool anyway.

The other non-use: internal scripts nobody outside the repository will ever
invoke. A capability entry is a promise to a stranger. If no stranger will read
it, a plain script list is cheaper and honest.
