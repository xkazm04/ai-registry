---
domain: game-production
subject: tracked-input-record-and-replay
last_touched: 2026-10-21
touched_by: deepen
dry_streak: 0
depth: L2
---

# tracked-input-record-and-replay

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-10-21 - `/intake apply headless-replay-against-the-rules` (run `intake-apply-hrar-1021`)

This is the first reconciliation against real code. The subject was founded on 2026-10-17
(`cdd41f53`) as a text-only draft.

**Tree.** `mage-arena-vr` `master` at `27e1633`, read in a detached worktree. The project
row is `d25ecc7` on origin master (`.ai/` only). The primary checkout was left untouched: it
is behind origin and carries owner WIP.

**Mode.** `experiment`, a static audit of oracle origin. The verdict is `not-better` on the
technique as written, so the technique gained a boundary section. All 33 automation tests in
the five gesture suites were classified. Of the 27 that carry a rule verdict: 18 authored,
2 pinned, 1 two-sided ratchet, 6 differential (the shipped rule on modelled 30/25 Hz held or
extrapolated streams against the same rule at 72 Hz). As written, the circularity rule
demotes all 6 differentials. They are input-path invariance checks, the pre-device form of
this technique's own divergence section, so the floor fell.

**Amendment, a boundary rather than a mechanism.** A differential stays a check if it has
two things: an anchor that fails when the reference is empty, and a known-miss list that
fails in both directions. An oracle that recomputes the rule's own threshold is a copy of
the rule. A pinned snapshot is legitimate as a refactor guard, but it is named as a snapshot.

**Gaps filed in the project, not built.** No engine build was run in this pass.
- The blink, sigil-line and staff differentials have no reference guard.
- No output names the clip set or the rules revision, and the corpus is regenerated and
  gitignored.
- Four ward oracles compute the expected onset from the rule's own speed constant.

**Refuted on review:** "the staff rule has no reject clip". A reader limited to five suites
reported none, and the defence suite carries "mudra does not plant". A rule's coverage is the
union over every suite that drives it.

**The evidence gate is still owed.** Every clip is synthetic, all 111 of them. Replay versus
person cannot be measured until the project's V2 window records real hands (2026-11-05 to
11-08). Return then and run the divergence half and the corpus-provenance check of
`versioned-input-corpus`. The clip header carries `source` but no runtime, device class or
rules revision.

Not applied this run: `versioned-input-corpus`, `proxy-corpus-miss-ledger`. The project's
`KnownModelMisses` tables are a rule-level miss ledger, and they are the nearest seam for the
second.

### 2026-10-21 - `/deepen game-production/tracked-input-record-and-replay` (run `trr-deepen-1021`)

A Curator dispatch on "3 techniques (design floor is 4)". Volatile scan: no vendor-set facts.
There were three lanes. A web lane read vendor record and playback docs for raw-sensor, pose,
event and robotics-log recorders. A counter-evidence lane attacked five claims, and a blind
lane worked from training data only.

**Landed (`7e467e68`).** New technique `record-below-the-rule`, earned on convergence. The web
lane and the blind lane each reached, independently, the rule that the recording layer decides
which changes a replay can regress. Raw sensor re-runs tracking, so its assertions need
tolerances. Poses bypass the tracker. Decided values bypass the recogniser. The golden path
gained a paragraph on this, a distinction (a measured field versus a decided field) and a
naive-build bullet.

**Counter-evidence.** Nothing was refuted. The circularity rule in
`headless-replay-against-the-rules` was qualified to "a change detector, not a correctness
check", after the characterization-test literature. Two further points confirmed claims
already in the subject and changed nothing. A runtime update can change hand latency with no
app change, which confirms "an older runtime is a different corpus". Raw-sensor playback is
documented as differing from the recording.

**Applied.** mage-arena-vr at `a31989a`, experiment, `better`. Four rules gate on
runtime-decided fields: sigil style A pen state, staff grip, the system gate and session
confidence. The synthetic corpus places the thumb from the authored pinch, and 0 of 8,995
pen-down frames over 113 clips have the tips apart (seeded control: 5 of 5 detected). Project
change `b0ce3c7` adds a Field layers section to `docs/CLIP-SCHEMA.md`, and the row is at
`c1b94cc`. Both were pushed from a detached worktree, and the primary checkout was untouched
(behind by 76, with owner WIP).

**Impact.** mage-arena-vr's bridge declares no domains, so it has no registry map: no pairs
and no stale verdicts. No fleet project's committed map names this subject. The join exists
only through the applications.

**Return conditions.**
- V2 window, 2026-11-05 to 11-08. For each recorded clip, count the frames where `pinch` says
  contact and the tips are apart, and the reverse. That count is the first proxy-miss row for
  pinch.
- Run the extrapolation model both ways on real clips.
- Also owed in that window: the earlier pass's divergence half and the corpus-provenance check.
- Banked, untested: the replay clock (timestamps versus one frame per update). The web lane
  found both documented. The deterministic headless timestep owns most of it, so it was not
  minted here.

## 2026-10-22 - intake apply, proxy-corpus-miss-ledger (run intake-apply-pcml-1022)

Dispatched by Curator from the attention scan, "single stack (cpp)". The single stack is
not addressable: mage-arena-vr is the only fleet project with tracked-hand input.

**Applied.** mage-arena-vr at `aea4226`, experiment, `better`, structural-only. The seam was
chosen to falsify: the plan already requires October figures labelled "mouse or synthetic",
and if that rule held, a basis label would add nothing. Over 31 hand-input figure statements
in ten documents, 0 carried their basis in the number's own field, and 4 used wording that
named the wrong basis ("recorded corpus", and "mouse" for generator output). The 90 mouse
clips come from the corpus generator, so the D-G2 "mouse" figures are in-distribution. The
feasibility report holds 25 of the 31 figures and never says its clips are generated. Project
change `9ebdf43` (pushed to origin master from a detached worktree; primary checkout behind
by 80 with owner WIP, untouched) adds `docs/PROXY-LEDGER.md`, relabels three cells in the
submission draft, and links the ledger from the clip schema. The miss ledger is empty and
says so: 0 recorded clips, 0 human mouse draws.

**Landed.** One decision rule in `proxy-corpus-miss-ledger`: a label that names the channel
("mouse", "recorded") is not a basis label; the label names what produced the input.

**Return conditions.**
- The owner's first D-G2 mouse draws, or V2 recordings (2026-11-05 to 11-08): the first
  ledger row where a human figure disagrees with a generated one.
- Retire the generated corpus per rule only by the ledger's section 4. The sigil stroke
  bounds (`InnerTailRatio`, `MinInnerStrokeRatio`) were set entirely on stand-ins.

## Architecture review - 2026-10-31

First architecture review. Every technique has now been reconciled against one consumer
tree, but only on synthetic clips, so the replay-versus-person gate is still owed. The
`versioned-input-corpus` application (2026-10-22, project change `14a0f63`) has no touch-log
entry above; it is the subject's only `ab-paired` proof. Primary sources confirm the
raw-sensor playback divergence (ARCore) and that pinch strength and the system-gesture flag
are runtime-reported (OpenXR aim state; one runtime always leaves the system bit unset). Two
clarify items were found: the golden path's status paragraph, and the headless technique's
"a person who watched it" oracle sentence, which contradicts its own boundary.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/tracked-input-record-and-replay",
  "date": "2026-10-31",
  "baseline": "b3879e1d2",
  "digest": "sha256-b2:1fc15cf2f3e3b36d",
  "disposition": "clarify",
  "coverage": "All 9 documents read in full (golden path, 4 techniques, 4 cpp applications). Four external sources checked for the raw-sensor playback, decided-field and runtime-version claims; the Khronos page refused direct fetch. Application arithmetic recomputed. Not evaluated: the private consumer tree, any engine build, any real-hand recording (none exists).",
  "counterexamples": [
    "A raw-sensor replay can produce different poses from the session it came from and between playback runs (ARCore documents both), so an exact threshold assertion on that tier fails with no rule change.",
    "A runtime can leave a decided field permanently unset: Ultraleap's OpenXR layer always clears the system-gesture aim bit, so a rule gated on it is unexercised on that runtime whatever the clips say.",
    "A differential oracle taken from the shipped rule on a clean clip is not circular: a wrong rule does not make 'the input path leaves the verdict unchanged' pass, provided the reference is anchored.",
    "A synthetic corpus that poses the thumb from the authored pinch reports zero cross-layer disagreements by construction; that zero is not a pass."
  ],
  "sources": [
    {
      "url": "https://developers.google.com/ar/develop/java/recording-and-playback/developer-guide",
      "result": "Read 2026-10-31: 'ARCore APIs may produce different results during playback than observed during recording.' and 'They may also produce different results during subsequent playback sessions.' Supports record-below-the-rule's raw-sensor row (tolerances, repeated runs). It does not say tracking is re-run; the row's 'tracking run again on playback' is the technique's inference, consistent with but not stated by this page."
    },
    {
      "url": "https://registry.khronos.org/OpenXR/specs/1.1/man/html/XrHandTrackingAimStateFB.html",
      "result": "Direct fetch refused (403); spec content reached through search excerpts and the Ultraleap page. XrHandTrackingAimStateFB carries pinchStrengthIndex (0.0-1.0, 1.0 = thumb and index fully touching) and the SYSTEM_GESTURE aim flag, chained onto xrLocateHandJointsEXT. Supports 'a frame of joints often also carries a contact strength ... and a system-gesture flag' as runtime-decided fields."
    },
    {
      "url": "https://docs.ultraleap.com/openxr/features/facebook-aim/index.html",
      "result": "Via search excerpt: the MENU_PRESSED and SYSTEM_GESTURE bits are always unset on that runtime. Confirms decided fields vary by runtime, not only by version."
    },
    {
      "url": "https://developer.oculus.com/blog/hand-tracking-22-response-time-meta-quest-developers",
      "result": "Via search excerpts (vendor's own claim): Hands 2.2 on system v56 cut hand latency up to 40% typical and 75% in fast motion, and added an opt-in Fast Motion Mode. Supports 'an older runtime is a different corpus' and 'sensor mode' as a provenance field. Vendor figures, not independent."
    },
    {
      "source": "Internal arithmetic across the applications",
      "result": "Headless replay: 18+2+1+6+6 = 33 tests, 27 rule-verdict, 9 relabelled under arm B, 3 snapshots + 6 differentials after the boundary - consistent. Record-below: 8,995+4,947+360 = 14,302 frames over 113 clips, against versioned-input-corpus's 14,132 samples over 111 clips - consistent with two more clips counted across two directories, not proven. Proxy ledger: 4 wrong-basis wordings, one fixed, 3 left - consistent."
    }
  ],
  "documents": {
    "tracked-input-record-and-replay.md": {
      "disposition": "clarify",
      "reason": "Status section says the subject is 'written from design reasoning and from one consumer's plan, not from a measured run'. Four applications since reconciled every technique against one consumer's tree (static audits and one paired A/B), all on synthetic clips. Restate: reconciled against one tree, synthetic input only, and the replay-versus-person evidence gate still owed. Rest keep: boundaries, layer paragraph and distinctions agree with the techniques and with the sources above."
    },
    "techniques/headless-replay-against-the-rules.md": {
      "disposition": "clarify",
      "reason": "First section says the expected outcome 'is written down by a person who watched it'. The technique's own boundary section accepts an authored-intent oracle (a synthetic clip nobody watched) and a differential oracle from the shipped rule on a different input path, and its application counts 18 authored-intent tests as legitimate. Widen the sentence to name the clip's authored intent and point to the boundary."
    },
    "techniques/proxy-corpus-miss-ledger.md": {
      "disposition": "keep",
      "reason": "Rules are internally consistent; the channel-versus-basis decision rule is the earned addition from its application and does not overreach. No unstable external claim."
    },
    "techniques/record-below-the-rule.md": {
      "disposition": "keep",
      "reason": "Raw-sensor row matches ARCore's documented playback divergence; the decided-field section matches the OpenXR aim-state fields and Ultraleap's always-unset system bit. 'Tracking run again on playback' is inference the ARCore page neither states nor contradicts; acceptable as written."
    },
    "techniques/versioned-input-corpus.md": {
      "disposition": "keep",
      "reason": "Runtime-and-mode provenance is supported by Meta's Hands 2.2 latency change and its opt-in Fast Motion Mode. The closed-schema sidecar rule is earned from its application."
    },
    "applications/cpp--headless-replay-against-the-rules.md": {
      "disposition": "reverify",
      "reason": "Counts are internally consistent. The private tree at 27e1633 was not reopened, no engine build was run, and every anchor quote is unverified this run."
    },
    "applications/cpp--proxy-corpus-miss-ledger.md": {
      "disposition": "reverify",
      "reason": "Table arithmetic consistent. Private tree at 9ebdf43 and its 31-statement inventory not reopened."
    },
    "applications/cpp--record-below-the-rule.md": {
      "disposition": "reverify",
      "reason": "Frame table sums to 14,302 over 113 clips; the instrument and control clip were not re-run and the tree at a31989a was not reopened."
    },
    "applications/cpp--versioned-input-corpus.md": {
      "disposition": "reverify",
      "reason": "Only ab-paired application; its three-edit instrument was not re-run. Its clip count (111) differs from the record-below application's 113 at a different commit and directory scope; consistent, not proven. The subject note has no touch-log entry for this 2026-10-22 application."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied the two clarify items above, against the new digest. Applications were not touched
and keep `reverify`, which is now the overall disposition.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/tracked-input-record-and-replay",
  "date": "2026-10-31",
  "baseline": "1212e28aa",
  "digest": "sha256-b2:679e145ae10ec510",
  "disposition": "reverify",
  "coverage": "Second record after applying the two clarify items of the first 2026-10-31 record; the edited sentences re-read. Other seven documents byte-unchanged and keep their dispositions. Applications untouched; verification dates not moved.",
  "counterexamples": [
    "A raw-sensor replay can produce different poses from the session it came from and between playback runs (ARCore documents both), so an exact threshold assertion on that tier fails with no rule change.",
    "A runtime can leave a decided field permanently unset: Ultraleap's OpenXR layer always clears the system-gesture aim bit, so a rule gated on it is unexercised on that runtime whatever the clips say.",
    "A differential oracle taken from the shipped rule on a clean clip is not circular: a wrong rule does not make 'the input path leaves the verdict unchanged' pass, provided the reference is anchored.",
    "A synthetic corpus that poses the thumb from the authored pinch reports zero cross-layer disagreements by construction; that zero is not a pass."
  ],
  "sources": [
    {
      "url": "https://developers.google.com/ar/develop/java/recording-and-playback/developer-guide",
      "result": "Read 2026-10-31: 'ARCore APIs may produce different results during playback than observed during recording.' and 'They may also produce different results during subsequent playback sessions.' Supports record-below-the-rule's raw-sensor row (tolerances, repeated runs). It does not say tracking is re-run; the row's 'tracking run again on playback' is the technique's inference, consistent with but not stated by this page."
    },
    {
      "url": "https://registry.khronos.org/OpenXR/specs/1.1/man/html/XrHandTrackingAimStateFB.html",
      "result": "Direct fetch refused (403); spec content reached through search excerpts and the Ultraleap page. XrHandTrackingAimStateFB carries pinchStrengthIndex (0.0-1.0, 1.0 = thumb and index fully touching) and the SYSTEM_GESTURE aim flag, chained onto xrLocateHandJointsEXT. Supports 'a frame of joints often also carries a contact strength ... and a system-gesture flag' as runtime-decided fields."
    },
    {
      "url": "https://docs.ultraleap.com/openxr/features/facebook-aim/index.html",
      "result": "Via search excerpt: the MENU_PRESSED and SYSTEM_GESTURE bits are always unset on that runtime. Confirms decided fields vary by runtime, not only by version."
    },
    {
      "url": "https://developer.oculus.com/blog/hand-tracking-22-response-time-meta-quest-developers",
      "result": "Via search excerpts (vendor's own claim): Hands 2.2 on system v56 cut hand latency up to 40% typical and 75% in fast motion, and added an opt-in Fast Motion Mode. Supports 'an older runtime is a different corpus' and 'sensor mode' as a provenance field. Vendor figures, not independent."
    },
    {
      "source": "Internal arithmetic across the applications",
      "result": "Headless replay: 18+2+1+6+6 = 33 tests, 27 rule-verdict, 9 relabelled under arm B, 3 snapshots + 6 differentials after the boundary - consistent. Record-below: 8,995+4,947+360 = 14,302 frames over 113 clips, against versioned-input-corpus's 14,132 samples over 111 clips - consistent with two more clips counted across two directories, not proven. Proxy ledger: 4 wrong-basis wordings, one fixed, 3 left - consistent."
    }
  ],
  "documents": {
    "tracked-input-record-and-replay.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: status section now says the techniques were reconciled against one consumer's tree, on synthetic clips only, and that no application has measured replay against a person; the evidence-gate sentence is unchanged."
    },
    "techniques/headless-replay-against-the-rules.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'written down by a person who watched it' now reads 'taken from the clip's authored intent, or written down by a person who watched it', with a pointer to the boundary section for the differential case."
    },
    "techniques/proxy-corpus-miss-ledger.md": {
      "disposition": "keep",
      "reason": "Rules are internally consistent; the channel-versus-basis decision rule is the earned addition from its application and does not overreach. No unstable external claim."
    },
    "techniques/record-below-the-rule.md": {
      "disposition": "keep",
      "reason": "Raw-sensor row matches ARCore's documented playback divergence; the decided-field section matches the OpenXR aim-state fields and Ultraleap's always-unset system bit. 'Tracking run again on playback' is inference the ARCore page neither states nor contradicts; acceptable as written."
    },
    "techniques/versioned-input-corpus.md": {
      "disposition": "keep",
      "reason": "Runtime-and-mode provenance is supported by Meta's Hands 2.2 latency change and its opt-in Fast Motion Mode. The closed-schema sidecar rule is earned from its application."
    },
    "applications/cpp--headless-replay-against-the-rules.md": {
      "disposition": "reverify",
      "reason": "Counts are internally consistent. The private tree at 27e1633 was not reopened, no engine build was run, and every anchor quote is unverified this run."
    },
    "applications/cpp--proxy-corpus-miss-ledger.md": {
      "disposition": "reverify",
      "reason": "Table arithmetic consistent. Private tree at 9ebdf43 and its 31-statement inventory not reopened."
    },
    "applications/cpp--record-below-the-rule.md": {
      "disposition": "reverify",
      "reason": "Frame table sums to 14,302 over 113 clips; the instrument and control clip were not re-run and the tree at a31989a was not reopened."
    },
    "applications/cpp--versioned-input-corpus.md": {
      "disposition": "reverify",
      "reason": "Only ab-paired application; its three-edit instrument was not re-run. Its clip count (111) differs from the record-below application's 113 at a different commit and directory scope; consistent, not proven. The subject note has no touch-log entry for this 2026-10-22 application."
    }
  }
}
```
