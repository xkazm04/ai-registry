---
layer: application
type: application
subject: self-describing-model-packages
technique: advisory-version-floors
stack: next
status: forged
verified_on: 2026-10-31
verified_against: next@16
applied: code
ab_verdict: better
proof: ab-paired
---

# An engine version a project was built on, read as a pin and then as a floor

The stack version comes from the tree's own `"next": "16.4.3"` (package.json, pof at
commit `7a5b6cac`). The seam is in xkazm04/pof, a public Next.js app that drives a game
engine's editor. Its first-run wizard finds the engine projects on the machine, finds the
installed engines, and lets the user pick an engine version before opening a project.

The package here is not a model, but it has the same shape the technique describes. Every
engine project file records the engine version it was created on, in one field. That field
is the build floor. The engine opens a project created on an older version and converts it
upward. It does not promise to open a project created on a newer one. The wizard is the
consumer that reads the floor against what is installed and selected.

## What the tree did before

The wizard listed a detected project only when the recorded version string started with
the selected engine's major.minor. That is the first naive answer from the technique:
equality treated as compatibility, and a mismatch treated as a refusal, here by hiding the
project. Four cases followed from that one comparison:

- A project built on an older engine was hidden under the newer engine it opens in. That
  is the expected case, and it is the one the technique says should stay silent.
- A project built on a newer engine than the selected one was hidden too. Nothing said why.
- A project whose recorded value is not a release version (a source-built engine's GUID, or
  an empty field) never matched any pill, so no setting of the wizard could show it. The
  technique asks for an absent floor to be reported as its own outcome. Here it was an
  invisible one.
- The match was a string prefix, so "5.10" counted as "5.1". This is latent: the pills run
  from 5.5 to 5.8.

The engine scan sorted installed engines newest first with a string compare. One consumer
reads the first entry as the latest engine. As text, "5.10.0" sorts below "5.9.0", which is
the technique's warning about lexicographic version compares. This one is latent too until
a two-digit minor ships.

## What changed

One client-safe module carries the floor. It parses only the release part of a version and
drops build decoration and GUIDs, at
`src/lib/project-setup/engineFloor.ts:27 "export function parseRelease(v: string | null | undefined): number[] | null {"`.
It compares parsed components, never strings, at
`src/lib/project-setup/engineFloor.ts:34 "export function compareReleases("`.
It classifies a recorded version against the selected one as match, older, newer or unknown,
at `src/lib/project-setup/engineFloor.ts:42 "export function engineFit("`. A version that does
not parse is `unknown`, never satisfied
(`src/lib/project-setup/engineFloor.ts:44 "if (!r || !s) return { kind: 'unknown', majorGap: false };"`),
and a major-version gap is carried so the warning can say "major"
(`src/lib/project-setup/engineFloor.ts:45 "const majorGap = r[0] !== s[0];"`).

The wizard now lists every project, with exact matches first in their detected order
(`src/components/modules/project-setup/SetupWizard.tsx:79 "const orderedProjects = orderByEngineFit(projects, ueVersion);"`).
Each row asks for at most one note
(`src/components/modules/project-setup/SetupWizard.tsx:205 "const note = engineFitNote(project.fit, project.engineVersion, ueVersion);"`).
The note is null for match and older, names both versions for newer, and labels unknown.
The engine scan sorts by parsed release
(`src/app/api/filesystem/browse/route.ts:266 "return engines.sort((a, b) => compareReleases(b.version, a.version));"`).
The wizard's dead "switch to another version" links went with the filter, because no pill
can now reveal a hidden project.

## Proof

This was a paired A/B in the project's own test file,
`src/__tests__/lib/project-setup/engineFloor.test.ts`. Arm A is the replaced rule, inlined
(the prefix filter and the string sort). Arm B is the shipped module. Both arms ran over the
same inputs: the two projects actually detected on the authoring machine (both recorded on
5.8, installed engine 5.8.3) under the wizard's four pills, then four scripted cases (an
older project, a source-build GUID, an empty association, a full three-part version).

| Measure | A | B |
| --- | --- | --- |
| target, real: built-on-newer pairs warned (both projects under the 5.5, 5.6, 5.7 pills) | 0/6 | 6/6 |
| target, scripted: openable pairs (match or older) listed | 2/6 | 6/6 |
| target, scripted: unknown associations labelled | 0/8 | 8/8 |
| target: newest of 5.9.0, 5.10.0, 5.8.3 | 5.9.0 | 5.10.0 |
| floor: A's list is B's head, same order | - | 8/8 pill runs |
| floor: warnings on a match or older pair | - | 0 |

At the default 5.8 pill the real list is unchanged, 2 of 2 in both arms. So on this machine
the target only moves when the user picks another pill. The full unit suite (14,538 tests),
the type check and lint stayed green. pof has no pre-push gate. The change shipped as
`ab906677`, with the project's ledger row in `7a5b6cac`, pushed from a worktree of the
remote branch.

**The seam was chosen to falsify.** The technique says a recorded build version is a floor,
and above it the consumer stays silent. The first application, a Python launcher on
2026-10-22, came back `not-better`: there the pinned file was a lock the consumer owned, so
drift in either direction was the right report. A caught outcome here would have been the
same: an engine field that behaves as a lock, where a newer engine is as wrong as an older
one. The engine's own upgrade path rules that out. It opens older projects and converts
them, so the recorded value is a build floor and the finding held. The two trees together
give the discriminator: a version the package recorded about where it was built is a floor,
and a version the consumer pinned for itself is a lock.

## What the realization cannot do

The upgrade the floor allows is one-way here. Opening an older project in a newer engine
converts it in place unless the user asks for a copy, and the wizard stays silent on that
case as the technique says. That is a boundary the technique does not state: silence above
the floor assumes going forward costs nothing. It was scored as an amendment candidate
(gain 1, risk 0) and not written. The wizard also still sets the app's engine to the
project's recorded version on open, even when that engine is not installed. The engine scan
knows what is installed, but the open path does not consult it. The real-machine arm has
two projects on one engine, so the older and unknown cases are scripted, not observed.
