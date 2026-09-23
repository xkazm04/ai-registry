---
layer: application
type: application
subject: metric-gates
technique: ratchet-design
stack: node
verified_on: 2026-09-23
---

# Retiring a subtree beside six sibling sessions: the delta, not the census

A desktop application ratchets about two hundred source-scanning rules through one
census (`scripts/census/run-census.mjs`), each rule carrying a committed
baseline of files and matches in `scripts/census/rules.json`. The census has a
recording mode, `--update`, and it does what the convenient recording command
usually does: re-measure the tree and write every rule's measured value into
its baseline, in whichever direction it moved (`updateBaselines`). Its only
guard is a refusal while structural assertions fail; its closing line asks a
reviewer to check that every downward move has a fix behind it. Nothing in it
knows which moves belong to the change being recorded.

## The case

On 2026-09-16 one session deleted six retired sub-pages of one feature
(`3bfe8d18b`, 37 files, 5,882 lines removed) in a checkout where six other
sessions were landing work. The deletion took real violations with it — the
recording commit names 15 hand-rolled spinners, 22 native title tooltips, 31
overpainted typography tokens and 10 raw lazy boundaries among them. A
whole-tree `--update` at that moment would also have written six unrelated
rules' *rises* — sibling sessions' regressions, named in the commit — into the
floor, where they would have stopped failing for the sessions that caused them.

The recording commit (`d84664bc35`) instead moved each baseline down by the
feature tree's measured delta alone: the census run over that feature's tree
at the parent of the wave's first commit (`d311cc806^`) and at the tip, in
isolated roots, and the difference applied per rule. Exactly 23 baselines moved, all downward, and the
six foreign rises were left failing in the buckets that owned them. The same
commit removed a per-file exemption whose file the retirement had deleted.

## What the tool still does not know

The footprint measurement was done by hand for this change. The census's own
recording mode is unchanged, so the next session that reaches for `--update`
in a shared tree records the tree, not its change — the discipline lives in the
commit message, not in the instrument.
