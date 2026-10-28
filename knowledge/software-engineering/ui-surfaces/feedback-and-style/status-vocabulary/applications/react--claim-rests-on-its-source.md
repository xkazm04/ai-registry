---
layer: application
type: application
subject: status-vocabulary
technique: claim-rests-on-its-source
stack: react
status: forged
verified_on: 2026-10-27
verified_against: react@19
---

# "Mergeable, git not asked yet" and the verdict the checks derive (afterlife)

Project `afterlife`, https://github.com/xkazm04/afterlife at main, commit 009c7893. A DevSecOps
control plane (React 19.2, `package.json:40`) whose screens show the state of agent runs and the
verdict of each agent change's proof. Two sites carry
[claim-rests-on-its-source](../techniques/claim-rests-on-its-source.md), one for each half: a
state vocabulary named by its basis, and a verdict derived rather than read.

## A wave's state, named by what it rests on

The run ledger's wave chip first said "mergeable" from the run file alone, which was wrong for
waves already merged or whose branch was gone. The fix is a vocabulary with a member per basis,
`src/app/features/runs/model/waveState.ts:1-4`: "A wave that ended mergeable is "mergeable" only
when the desk names it (git says its branch is not in its base yet); without the desk's answer,
or when git could not be asked, it says so, never a guess. The run file alone cannot tell a wave
to take from one already merged or whose branch was deleted."

The labels (`src/app/features/runs/model/waveState.ts:10-17`) make the bases legible: `take: 'mergeable'`, `unasked:
'mergeable, git not asked yet'`, `in: 'in its base, or branch gone'`. Beside them is a second
table keyed by the same union, `WAVE_STATE_MEANS` (`src/app/features/runs/model/waveState.ts:19-27`), documented as "The
chip's tooltip: what the state rests on" — e.g. `unasked`: "whether its branch is in its base
already is not known: git was not asked, or could not be". The derivation reads its sources in
order and returns "not asked" when the second one is absent (`src/app/features/runs/model/waveState.ts:29-37`, "`needs`
absent: the desk is not read (yet). A desk decision with checked false is git not asked
either."). The chip passes the basis as its tooltip (`src/app/features/runs/components/WaveState.tsx:15`
`title={WAVE_STATE_MEANS[k]}`) and draws "not asked" in the unknown tone, not the ok one
(`src/app/features/runs/components/WaveState.tsx:9`).

## The verdict is derived; the stored word is compared

`src/app/features/task/model/verdict/verdict.ts:31-43` is the screen's verdict: "derived by
`verdictOf` from the engine's checks, never read from the stored word." `DerivedVerdict` keeps
both (`src/app/features/task/model/verdict/verdict.ts:22-29`): `verdict` "What the checks say: the word every consumer draws";
`stored` "What the task's proof stored. Never drawn as the verdict."; `mismatch` "a stored
UNKNOWN is no claim, so it never disagrees". The mismatch is surfaced, not discarded:
`src/app/features/task/components/equation/VerdictEquation.tsx:65-68` draws a fail chip titled
"The stored verdict is not what the checks derive; the checks win". A check a person decides is a
struck term, neither pass nor fail (`src/app/features/task/model/verdict/verdict.ts:12-14`, `src/app/features/task/model/verdict/verdict.ts:45-48`), so the derivation
adjudicates only what the engine re-derived — the
[claimant-does-not-adjudicate](../../../../_laws.md#claimant-does-not-adjudicate) law at the
display edge.

## Where the tree sits against the technique

Confirmed on both halves. The two tables (labels and meanings) are separate records keyed by one
union rather than one entry per member; both are total over `WaveStateKind`, so omission is a
compile error, but agreement between a label and its basis sentence rests on the author — the
residual cost [status-color-mapping](../techniques/status-color-mapping.md) names as "totality is
not agreement".
