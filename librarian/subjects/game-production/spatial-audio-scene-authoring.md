---
domain: game-production
subject: spatial-audio-scene-authoring
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# spatial-audio-scene-authoring

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/spatial-audio-scene-authoring",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:8a9e12b2c7d4f4e1",
  "disposition": "reverify",
  "coverage": "All 9 owned documents read and assessed in table order. 1 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "Dialogue may require both an admitted voice and reduced competing music; choosing only one leaves either starvation or masking unresolved.",
    "An outer radius of 20 units and max(0.3*radius,50) gives inner radius 50, reversing the intended distance band.",
    "A required trap telegraph omitted with probability one half is absent on half the sampled triggers, regardless of whether ambience feels less repetitive."
  ],
  "sources": [
    {
      "path": "knowledge/game-production/asset-production/motion-and-audio/spatial-audio-scene-authoring",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://www.audiokinetic.com/en/library/edge/?id=concept_virtualvoices.html&source=SDK",
      "scope": "Official search excerpt distinguishes physical/virtual voice selection by threshold and playback limits; no engine run."
    },
    {
      "url": "https://www.audiokinetic.com/ja/library/edge/?id=defining_properties_of_bus&source=Help",
      "scope": "Official search excerpt describes ducking as reducing competing bus levels; used to distinguish mixing from voice admission."
    }
  ],
  "documents": {
    "spatial-audio-scene-authoring.md": {
      "disposition": "reverify",
      "reason": "Room-derived defaults and explicit missing assets are useful. Reverify unreferenced loudness recommendations, fixed hearing/voice limits, outdoor reverb and one-to-one acoustic parameter claims. Reservation and ducking address different failures and can coexist; geometry, material and mix context defeat universal room-type prescriptions."
    },
    "techniques/attenuation-falloff-and-distance-filtering.md": {
      "disposition": "reverify",
      "reason": "A positive radius fraction already gives a full-level core: absence of a floor does not eliminate it. Clamp a minimum inner radius against the outer boundary, distinguish falloff width from absolute outer distance, and validate units. Logarithmic, 30 percent and 2 kHz are authoring examples, not universal acoustic endpoints; level and spectrum alone cannot uniquely recover distance."
    },
    "techniques/event-priority-concurrency-cooldown.md": {
      "disposition": "clarify",
      "reason": "Repaired the exclusive ducking-or-reservation rule, unspecified concurrency scope and unbounded critical priority. Distinguishes voice admission, masking, virtualization and measured hardware cost; numeric presets remain project decisions."
    },
    "techniques/occlusion-to-volume-and-filter.md": {
      "disposition": "reverify",
      "reason": "The direct/wet distinction is a useful approximation, not a universal physical model. Reverify material-frequency behavior, sub-bass exemption and the claim nobody notices distant approximations. A 20 kHz filter is not necessarily bypass or valid below the sample-rate limit; hysteresis and temporal debounce differ."
    },
    "techniques/reverb-parameter-tables.md": {
      "disposition": "reverify",
      "reason": "Preset values require implementation ranges and listening evidence. Decay depends on absorption as well as size; early delay depends on source/listener path geometry, not just nearest wall. Outdoor dry treatment and convolution with authored impulse responses are valid; all-zero decay may be invalid rather than bypass, and arbitrary mid-scale custom is not neutral."
    },
    "techniques/room-type-to-acoustic-profile.md": {
      "disposition": "reverify",
      "reason": "Room function does not establish enclosure, wall transmission or narrative importance. State modifier precedence and stable override identity; occlusion step addition contradicts the all-multiplicative instruction. Randomly omitting a required trap warning changes gameplay and needs a cue contract, not an unconditional probability below one."
    },
    "techniques/two-d-vs-three-d-spatialization-choice.md": {
      "disposition": "reverify",
      "reason": "The single bit contradicts the proposed positionless footsteps with world reverb. Position, attenuation, filtering, reverb sends and bus routing are related but independently authorable; diegetic music can use a music bus with spatial routing. Head-relative sources can retain directional cues, and 2D games can use spatial sound."
    },
    "applications/node--room-type-to-acoustic-profile.md": {
      "disposition": "reverify",
      "reason": "Historical Node/PoF locations, generated engine identifiers, provider incident and verification date were not rerun. The 0-8 room scale and 0-3 event scale are not shown reconciled; max(radius*0.3,50) can exceed a tiny outer radius. Source-table repetition is not listening validation or API compilation evidence; placeholder comments alone do not prevent shipping."
    },
    "applications/process--event-priority-concurrency-cooldown.md": {
      "disposition": "reverify",
      "reason": "Historical process catalog and verification date were not rerun. The displayed table has three UI and six world rows, not four and seven. Seed values do not independently validate technique values copied from them; missing measured load is correctly disclosed. Ducking cannot replace admission protection and reservations are not the only possible priority policy."
    }
  }
}
```

### 2026-09-10 — re-review after the compression revert

Read all nine owned documents in full at the current bytes, recomputed the numeric claims,
and checked the one external claim (the loudness targets) against a primary recommendation.
Four findings, three of them internal contradictions and one a miscount.

**Finding 1 — the inner-radius floor is justified by the wrong failure.**
`attenuation-falloff-and-distance-filtering` derives the inner radius as a fraction of the
zone radius (roughly 30%) with an absolute floor, and explains the floor thus: *"Without it,
a zone smaller than roughly three times the floor produces a sound that is never at full
level anywhere, which reads as a broken emitter rather than as a small one."* Without the
floor the inner radius is 0.3R for every R, so a full-level core always exists and is always
30% of the zone; it becomes small in absolute terms and never vanishes. The stated failure
does not follow from removing the floor. The case the floor actually creates is the
opposite one and is unhandled: for a zone radius below the floor, `max(0.3R, floor)` returns
an inner radius **larger than the falloff distance**, inverting the band so the source is at
full level throughout and the distance filter's sweep has negative width. The document needs
the floor clamped against the outer radius, and the paragraph needs the failure it actually
prevents (an imperceptibly small core, which is a legibility problem, not an absent one).
The worked application shows the same expression, `Math.max(zone.attenuationRadius * 0.3,
50)`, where the smallest room radius is 800 and the floor is therefore never reached — the
defect is latent in the rule rather than live in that deployment.

**Finding 2 — the modifier rule contradicts its own list.** `room-type-to-acoustic-profile`
lists three global modifiers — "a radius multiplier, an occlusion step up or down the
ladder, a volume scale" — and then constrains them: "modifiers are *multiplicative on the
derived value* so the table stays the single source". An occlusion step is an additive move
along an ordinal ladder, which is why the same sentence has to add that it is "clamped at
both ends rather than wrapping". Two of the three modifiers are multiplicative and the third
is ordinal; the rule should say what it means — every modifier composes with the derived
value rather than replacing it — instead of naming an operation that only fits two of them.

**Finding 3 — the one-bit decision is contradicted by its own worked case.**
`two-d-vs-three-d-spatialization-choice` states that positionless is "a one-bit decision per
class" and that a positionless class "is exempt from attenuation, distance filtering,
occlusion and world reverb", encoded "as a consequence of the flag rather than as four more
fields per class". Its own recommended resolution for the player's own footsteps is
"positionless with a reverb send driven by the current zone" — a positionless class with
world reverb, which the exemption forbids. The ambiguous-class section is the most useful
part of the document and it needs the bit to be two bits, or the exemption list to drop
reverb send and say so.

**Finding 4 — a miscount in the seeded catalog.**
`applications/process--event-priority-concurrency-cooldown.md` closes its table with "all
four `ui` classes and all three `music` classes are `2d`; all seven world classes are
`3d`". The table above it has three `ui` rows — Button Click, Menu Open, Notification. The
music and world counts are right. Since the sentence is offered as the evidence that the
split is by category with no exceptions, the count should match the table it is counting.

**The loudness targets check out.** The golden path's "-24 LKFS integrated for home
consoles and about -18 LKFS for handheld and mobile ... true peak held below roughly -1
dBTP" matches the ASWG-R001 recommendation for interactive entertainment. The document does
not name the recommendation, which for a number a producer will mix against is worth a
citation; the claim itself is sound and is left `keep`.

**Retracted.** The preceding record marked seven of nine `reverify`. Several reasons argue
with positions the documents do not hold — `occlusion-to-volume-and-filter` was told that
"the direct/wet distinction is a useful approximation, not a universal physical model",
which is how the document presents it, and that a 20 kHz filter "is not necessarily
bypass", which is the document's own point about writing the neutral case as an explicit
value. `reverb-parameter-tables` was told its presets "require implementation ranges and
listening evidence"; it presents them as "values that work as a starting set" and tells the
reader to read the table as arguments rather than as data. Those dispositions are withdrawn.

**What I could not verify.** Nothing was heard. No engine was run, no mix was measured, no
listening test was performed, and the consuming checkout was not opened — the two
applications are historical witnesses at `verified_on` 2026-08-30 and 2026-08-20 and those
dates are left untouched. The preset parameter values, the occlusion ladder's numbers and
the concurrency/cooldown defaults are authoring starting points that only a listening pass
can validate, and none of them was validated here.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/spatial-audio-scene-authoring",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:15c3a806b016eed9",
  "disposition": "clarify",
  "coverage": "All 9 owned documents read in full at current bytes; numeric claims recomputed (the 0.35 multiplier as roughly 9 dB, the inner-radius expression against the room table's radii, the seeded catalog's category counts) and the loudness targets checked against a primary recommendation. Explicitly not evaluated: any listening test, any engine or middleware run, the reverb preset values, the occlusion ladder's perceptual calibration, the concurrency and cooldown defaults under load, and the consuming checkout. No verification date refreshed.",
  "counterexamples": [
    "A zone whose radius is below the inner-radius floor: max(0.3R, floor) returns an inner radius larger than the falloff distance, so the band inverts and the distance filter sweeps across negative width. The rule has no clamp for it and the document's stated degenerate case is a different one.",
    "Diegetic music in a game whose music system owns adaptive transitions: the rule sends it down the world path so it occludes, and the one-bit decision cannot also give it the music bus's transition logic — the class needs both and the flag can express only one.",
    "A reflective outdoor space — a canyon, a stone courtyard: decay follows absorption and enclosure rather than being indoors, and the room-type table's 'outdoor' row (very short decay, minimal density) is wrong for it with no term to say so.",
    "A game whose worst case is a scripted set piece rather than a reproducible crowded encounter: the validation pass ('play the most crowded encounter the game can produce') has nothing to play on demand, and the technique's exclusion covers games where nothing competes, not games where the competition cannot be staged."
  ],
  "sources": [
    {
      "url": "local: knowledge/game-production/asset-production/motion-and-audio/spatial-audio-scene-authoring",
      "result": "All nine documents read as primary evidence; established the inner-radius justification error and its unhandled inversion, the multiplicative-modifier contradiction, the positionless-with-reverb contradiction and the ui-row miscount. Established nothing about how any of the tabulated values sound."
    },
    {
      "url": "http://gameaudiopodcast.com/ASWG-R001.pdf",
      "result": "Read as the primary recommendation behind the golden path's loudness targets: -24 LKFS for home consoles, -18 LKFS for portable devices, true peak below -1 dBTP. Corroborates the numbers and the direction of the split. Establishes nothing about this subject's other values, and the golden path does not cite it — the reference is worth adding where the targets are stated."
    }
  ],
  "documents": {
    "spatial-audio-scene-authoring.md": {
      "disposition": "keep",
      "reason": "The framing that carries the subject — derive the scene from the room graph, and ration playback at the point the event class is defined — is argued from a real structural tension rather than asserted, and the two rules that make a derivation adoptable (overrides survive regeneration; a substituted value announces itself) are the difference between a generator a discipline uses and one it routes around. The loudness targets match ASWG-R001; naming the recommendation would make them checkable by a reader."
    },
    "techniques/attenuation-falloff-and-distance-filtering.md": {
      "disposition": "clarify",
      "reason": "The floor's justification is backwards: a fractional inner radius always yields a proportional full-level core, so removing the floor cannot produce a sound 'never at full level anywhere'. What the floor does produce, unhandled, is an inner radius exceeding the falloff distance for zones below it, inverting the band. Clamp the floor against the outer radius and restate the failure as an imperceptibly small core. The four ordered decisions and the units discipline are otherwise sound, and the cutoff and curve values are correctly presented as authoring endpoints."
    },
    "techniques/event-priority-concurrency-cooldown.md": {
      "disposition": "keep",
      "reason": "The three-failures argument — concurrency stops a swarm, cooldown stops a retrigger, priority decides the survivor of a global overrun — is the reason the fields must not collapse into one importance number, and it is stated with the failure each field answers. Ducking-versus-priority resolved per class with the decision recorded next to the class, and the requirement that an unexercised class render as not-measured, are both correct."
    },
    "techniques/occlusion-to-volume-and-filter.md": {
      "disposition": "keep",
      "reason": "Retracts the prior reverify, which argued with positions the document does not hold. The two-parameter rule is argued from a stated mechanism, the ladder's shape (linear volume, ratio-wise cutoff) is justified by logarithmic pitch perception, the neutral case is written as an explicit value for one authority and for interpolability, and occlusion-versus-obstruction is correctly identified as a gameplay signal rather than a nicety."
    },
    "techniques/reverb-parameter-tables.md": {
      "disposition": "keep",
      "reason": "Retracts the prior reverify. The table is explicitly a starting set to be read as arguments, the perceptual roles of decay, diffusion and density are separated with a worked pair (cave versus hall at similar decay), and outdoor-is-not-dry is the specific error the section exists to prevent. The explicit all-zero 'none' row separates 'no reverb here' from 'reverb never got assigned here'."
    },
    "techniques/room-type-to-acoustic-profile.md": {
      "disposition": "clarify",
      "reason": "The global-modifier constraint says modifiers are multiplicative on the derived value, while one of the three modifiers it just listed is an additive step along an ordinal ladder — which is why the same sentence needs a clamp. State the rule as composition with the derived value. The profile row, the radius-tracks-reach-not-room-size rule, the shallow-keyword-matching visibility requirement and the three-clause override contract (including report-what-would-have-changed) are all sound."
    },
    "techniques/two-d-vs-three-d-spatialization-choice.md": {
      "disposition": "clarify",
      "reason": "States that a positionless class is exempt from world reverb and that this is encoded as a consequence of one flag, then recommends positionless-with-a-zone-driven-reverb-send as the standard resolution for the player's own footsteps. Either the decision is two bits or reverb send leaves the exemption list. The ambiguous-class section is the document's most useful content and is what makes the contradiction worth repairing rather than trimming."
    },
    "applications/node--room-type-to-acoustic-profile.md": {
      "disposition": "keep",
      "reason": "Unusually well maintained: each drifted anchor carries a dated 'since first documented' note rather than a silent edit, and the table is marked as no longer exhaustive rather than quietly extended. Records its own deviation (a bare attenuationBase in the authoring row, with the unit appearing only in the generated comment) with the standard held. The three-way cue provenance and the placeholder-that-refuses-to-look-real are the upward lessons and are correctly attributed. verified_on 2026-08-30 stands unrefreshed."
    },
    "applications/process--event-priority-concurrency-cooldown.md": {
      "disposition": "clarify",
      "reason": "Says 'all four ui classes' where the table it is summarising has three; the music and world counts are correct. The sentence is offered as evidence that the split is by category with no exceptions, so the count matters. The four deviations it records — no reservation or stealing policy, the player's own footsteps not split out, no dialogue category and therefore nowhere to record the ducking-versus-reservation decision, and nothing exercised under load — are accurate and correctly held to the standard. verified_on 2026-08-20 stands unrefreshed."
    }
  }
}
```
