---
layer: application
type: application
subject: platform-format-adaptation
technique: derived-short-contract
stack: process
status: forged
---

# The derived-short contract as review items — a video-studio script step

How one generative video studio (repo: `gravitone-gcloud`) turned a single
worked example of a well-derived short into an explicit four-check review
contract wired into its script-step tooling.

## The worked example

`knowledge/templates/short-form-clip/steps/01-script/PATTERNS.md` §4 (lines
66-98) dissects PolyMatter's *This is Not Target* (0:53) — a short derived
from a mid-length video — beat by beat with timestamps:

```
[0:00]  "this is not Target"                ← self-contained hook, no prior knowledge
[0:10]  THE REVEAL: all Target Australia — a COMPLETE payoff, delivered
[0:20]  THE ABSURDITY: identical names/logos/products, "pure coincidence"
[0:29]  THE DETAIL: "the only difference is this period found Down Under"
[0:35]  CONTEXT: 120 years, 2000 stores, all in the US
[0:44]  THE WITHHELD LOOP: "it only tried to expand overseas once and it
        failed spectacularly — click the link below"
```

Note the payoff at 0:10 — the clip answers its own question ("are these the
same company? No") in the first fifth, then spends the rest deepening, and
the loop withheld at 0:44 is a *new* question, not the closed one reopened.

## The contract and its honesty labels

From this one witness the studio inferred the four rules (PATTERNS.md:85-94),
mirrored machine-readably in `params.json` `derived_short_contract`
(lines 56-70): complete on its own · withheld thing is a DIFFERENT question ·
pointer explicit and last · no dependence on the parent's setup. Two details
mark the process discipline:

- **Confidence is stamped on the contract itself**: `"confidence": "INFERRED
  from a single witness (PolyMatter, This is Not Target)"` (params.json:69) —
  the studio ships the contract because it needs one, but records that all
  four rules stand on n=1.
- **The anti-pattern names why it persists**: the `amputated-clip` entry
  (params.json:64-68) carries `"why_it_persists": "It reads as complete to
  the person who made it and as noise to everyone else."` — the author-blindness
  asymmetry that justifies checks over judgment.

## From contract to surface

PATTERNS.md §6 (lines 114-124) converts the craft into the script step's UI
contract: a **derived mode** where the author "picks the parent script, then
the four contract checks in §4 as review items — *is it complete alone; is
the withheld thing a different question; is the pointer explicit; does it
depend on the parent's setup?*" The same section carries the adjacent
refusals (no "did you know" template; the anchor is a single named field that
refuses a second value), so the review items sit inside a surface whose
banned moves are structurally unavailable rather than merely discouraged —
`params.json` `ui_contract.derived_mode` (line 84) is the machine-readable
commitment.

The realization is pure process: no code enforces the contract yet; the
enforcement is the checklist's position in the workflow (at derivation time,
before frames are spent) and the fact that the checks are phrased as the
questions a cold viewer would fail — the one perspective the clip's author
structurally lacks.
