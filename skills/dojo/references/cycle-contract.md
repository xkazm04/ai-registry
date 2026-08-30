# Cycle contract — the wire shapes

This file is **shared truth** with the gravitone implementation. The field names
below are verbatim; neither side renames one without the other. The manifest is
the only state — everything on disk is addressed from it.

## Types

```ts
type CycleStatus =
  | "planning"       // Phase 3 in progress; recipes and roster being written
  | "generating"     // Phase 4; the runner is producing pairs
  | "judging"        // Phase 5; picks being collected
  | "awaiting-gate"  // Phase 6; parked for the human in Foundry -> Dojo
  | "committed"      // the human gated it and the tab's commit ran (destructive)
  | "failed";        // fail_streak hit the breaker; the log says what broke

interface MediaRef {
  file: string;            // path relative to the cycle directory
  poster?: string;         // videos ALWAYS carry one; judges and the tab read stills
  kind: "image" | "video";
  deleted?: boolean;       // true after a destructive commit removed the bytes
}

interface PairResult {
  id: string;
  scene: string;           // roster scene id (reused from pipeline/foundry/plans/)
  seed: number;            // the SAME seed produced both arms - the control
  baseline: MediaRef;
  challenger: MediaRef;
  judge_pick: "baseline" | "challenger" | "tie";  // the chokepoint judge
  reason: string;          // ONE reason, one sentence - never a score
  gemini_pick?: "baseline" | "challenger" | "tie"; // the joint judge, while both run
  gemini_reason?: string;
}

interface Improvement {
  id: string;
  technique: string;       // the injected technique, by name
  subject: string;         // registry subject slug (media-generation bundle)
  claim: string;           // falsifiable: "when X, do Y, because Z"
  standard: string;        // "<subject>/<technique>" or "none"
  pairs: PairResult[];
  challenger_recipe: string;
  baseline_recipe: string; // the incumbent, read from the live prompt surface
  thumbnail?: string;      // the pair image the tab shows; survives commit if approved
}

interface CycleManifest {
  version: 1;
  id: string;              // <cycle-id>, the directory name
  at: string;              // ISO timestamp of creation
  dimension: string;       // the ONE dimension this cycle trains
  subject: string;
  status: CycleStatus;
  media: MediaRef[];       // everything generated, for the tab and the sweeper
  improvements: Improvement[];   // 1-2 per cycle
  judge_agreement?: number;      // over pairs where both judges picked
  lease?: string;          // who is driving (machine/session id); not yours if held
  fail_streak: number;     // consecutive runner failures; breaker at 3 -> "failed"
  costUsd?: number;
  log: string[];           // append-only, human-readable cycle history
}

type TrainingVerdicts = Record<string /* improvementId */, "approve" | "reject" | null>;

interface TrainingLedgerRow {
  cycle: string;           // cycle id
  dimension: string;
  subject: string;
  technique: string;
  human: "approve" | "reject";
  verdict: "better" | "not-better" | "unmeasurable";  // closed vocabulary
  judge_pick_rate: number; // challenger picks / pairs, chokepoint judge
  gemini_agreement?: number;
  thumb?: string;          // pipeline/foundry/training/thumbs/<cycle>--<improvement>.<ext>
  reflected: false | string; // false until Phase 0 lands the edit; then the sha
  at: string;              // ISO timestamp of the human verdict
}
```

## Directory tree

```
foundry-out/training/<cycle-id>/
  cycle.json        the manifest (the only state)
  verdicts.json     TrainingVerdicts, written by the app tab as the human gates
  pairs/**          generated media, both arms, seed-matched; posters beside videos
```

`foundry-out/` is untracked run output. The two tracked artifacts live under
`pipeline/foundry/`: `training-ledger.json` (the cross-machine sync channel)
and `training/thumbs/` (one image per approved improvement).

## Commit semantics (the tab's commit is destructive)

When the human commits a gated cycle in Foundry -> Dojo:

- the approved improvement's `thumbnail` is copied to
  `pipeline/foundry/training/thumbs/<cycle>--<improvement>.<ext>` — that one
  tracked file is ALL the media that survives;
- rejected improvements' media is deleted (`MediaRef.deleted: true`);
- **undecided media is preserved** — `null` in `TrainingVerdicts` means nobody
  decided, and nobody's media is destroyed by indecision;
- one `TrainingLedgerRow` per decided improvement is appended to
  `training-ledger.json` with `reflected: false`;
- the cycle's `status` moves to `"committed"`.

Phase 0 of a later cycle — on any machine that pulls the ledger — is what turns
`reflected: false` into `reflected: <sha>`.
