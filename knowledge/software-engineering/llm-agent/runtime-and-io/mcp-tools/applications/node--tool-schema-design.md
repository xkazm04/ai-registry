---
layer: application
type: application
subject: mcp-tools
technique: tool-schema-design
stack: node
verified_on: 2026-09-23
applied: code
ab_verdict: unmeasurable
proof: structural-only
---

# Behaviour annotations pinned by a recording-client probe

`xkazm04/pof` ships a stdio tool server (`tools/pof-mcp`) in front of a game
toolchain's local HTTP API: pipeline steps, an autonomous harness, simulators,
engine scans. Commit `b1cb1005` (2026-09-01) made it advertise the protocol's
behaviour annotations on every tool, and made them checked claims rather than
published prose. Read at tree `824df6e2` on 2026-09-23. No
`verified_against` is stamped: the package's `engines` field is a floor
(`node >=18`), not a major.

## The shape

- **The verdict is required by the type, but only partly decided by it.**
  `ToolDef.annotations` is a mandatory field (`src/tools/shared.ts`), built
  through two constructors. `readOnly(title)` fixes read-only,
  non-destructive, idempotent and closed-world in one call. `writes(title,
  opts)` takes destructive, idempotent and open-world as **optional** flags
  that default to `false`. A tool with no annotation block does not compile.
  A write tool whose author never thought about destructiveness does
  compile, and it publishes "not destructive", which is the less cautious
  value. **Deviation:** the technique asks for a verdict on every axis, and
  a default is not a verdict. The completeness test below cannot see the
  gap, because a defaulted boolean is still a boolean. At this tree, 42 of
  56 tools are read-only and 14 are writes.
- **Five tests in `src/annotations.test.ts`** carry the technique's four
  checks:
  1. every tool has a boolean on each of the four axes, and read-only implies
     non-destructive and idempotent;
  2. every read-only handler runs against a recording stand-in for the
     backend client, and any POST fails unless its route is in
     `READ_ONLY_POST` (`src/coverage.ts`) with a reason. A read-only tool that
     reaches no route must be declared in `LOCAL_ONLY` with a reason, and it
     is then asserted to reach none;
  3. every allow-listed route must resolve to a real route file whose source
     matches none of a regex of write primitives (file writes, process
     spawns, database-module imports, the save and insert helpers). An entry
     no read-only tool reaches fails as stale;
  4. the annotations a real stdio client receives from the tool listing equal
     the registry's.
  A fifth test holds write tools that keep a static example to a reason in
  `WRITE_TOOL_SAFE_EXAMPLE`.
- **The allow-list is small and argued.** Eight routes at this tree: three
  compute endpoints (Monte-Carlo combat, a sensitivity sweep, a health
  fusion), one analysis endpoint, and four disk-walking scans. The sweep's
  entry records the near miss the reading found: the neighbouring
  simulator route persists a run through a save helper and has a
  near-identical description, so its tool is annotated as a write.

## What the fault-injection proves, and what it does not

The commit message reports the fault-injection: flipping the artifact-submit
write tool to read-only fails the guard on that tool's step-submit POST. This
document did not re-run it. Building the package writes `dist/` into the
project tree, so reading the test's source was as far as the check went. The
probe's structure supports the claim, since a read-only-annotated handler
that POSTs to an unlisted route is a violation by construction.

The guard's reach is the technique's stated boundary, visible here:

- `probeArgs` fills required arguments with placeholders, and `probeReply`
  returns one generic shape, so branches that open only on real backend data
  are not driven.
- Only POST is judged. Fourteen route files export a GET handler and also
  contain a write primitive. In none of them does the GET body call one
  directly, but those bodies delegate to library functions the scan does not
  follow. "A GET is safe" is an assumption the guard relies on without
  testing it.
- The write-primitive regex has one recorded false positive in its own
  comment: `regex.exec(...)` was matched as a process spawn until the pattern
  learned to exclude member calls.

## Verdict

A close match for the publisher-side rule, and the source of it. The guard
covers the dangerous direction (a write wearing read-only) on the probed path
and keeps its own exemption list from going stale. It has three gaps. The
write constructor defaults the destructive axis to false instead of
requiring a verdict. The read verb's effect class is assumed. Delegated
writes are not followed. None of the three is written down beside the test.
The first closes by making the write constructor's flags required. The other
two close either by recording them as named assumptions or by extending the
source check to the GET handlers that read-only tools reach.
