---
layer: technique
type: technique
subject: game-dialogue-voice-pipeline
technique: cast-ledger-with-consent
status: forged
laws: [refuse-rather-than-destroy, unmeasured-is-not-a-pass, declaring-an-input-is-not-consuming-it]
shared_with: []
use_when: [creating or importing a synthesized or cloned voice for a game role, a legal or platform review asks whose voice this is, a provider cannot serve the speech modality the pipeline declares]
---

# Cast ledger with consent

The named concern: the game's voices form a ledger, one row per voice, and the ledger is
the only route by which a line can be rendered. A voice that is not in the ledger does not
speak. The ledger exists to answer, at any later date and without asking anyone's memory,
*who is this voice, what made it, and who agreed*.

## The row

| Field | Content |
| --- | --- |
| `role` | the character or category it speaks for |
| `voice_asset` | the provider's voice identifier, and the clone type if cloned |
| `model_generation` | the speech model generation it was created or trained under, and the date |
| `origin` | designed from a description, licensed library voice, or cloned from a person |
| `consent` | for a cloned voice: the person, the scope of use, the date, and where the signed agreement lives |
| `reference_material` | for a cloned voice: what the clone was conditioned on, and the terms attached to that material |
| `status` | active, flagged for re-cast, retired |

Four properties of the row carry the value.

**Consent is a precondition.** The gate is on the render path: a render request names a
line, the line names a speaker role, the role resolves to a ledger row, and a row whose
origin is a cloned person and whose consent field is empty refuses the request before
anything is generated
([refuse rather than destroy](../../../../_laws.md#refuse-rather-than-destroy) applies to
the refusal being early and visible, not to a quiet downgrade to another voice). It is not
a feature that can be enabled later, and it is not a checkbox on a form the studio fills in
after the voice is in the build.

**A cloned voice carries two sets of terms.** The synthesis model has its own licence; the
reference material has another. A clone conditioned on a clip that came from another
generation service, from a video, or from a session recorded without a usage clause carries
the strictest of them into every line. The row records the reference and its terms, and a
row with an unknown reference is *terms not established*, never *permitted*.

**Model generation is a first-class column.** A voice made under an older generation is
flagged for re-cast when a new generation ships, and is not assumed to carry over. Providers
document that clones created before a new generation may need retraining on it, and that a
clone type supported on one generation may be absent on another; a ledger that does not
record the generation cannot list what a release affects.

**The ledger is not the same as the provider's own controls.** Some providers verify that a
professional clone belongs to the person who submits it and refuse cloning of another
person's voice even with their consent, sharing instead through the other person's own
verified voice. That narrows what can be created and is welcome, and it does not replace
the studio's record: the provider's verification is a fact about the provider's account,
while the ledger is the studio's own evidence, portable if the provider changes.

## Procedure

1. **Create the row before the voice.** Decide the role, the origin and the consent path;
   only then create or import the voice.
2. **Fill the consent field from a document,** not from a statement. The location of the
   agreement is the value.
3. **Bind the voice to the catalog.** Every line names its speaker role; the render path
   resolves role to row and refuses on a missing row or missing consent.
4. **Record the generation at creation,** and on every retrain.
5. **Audit periodically by joining the catalog to the ledger:** lines whose role has no row,
   rows with no lines, rows flagged for re-cast that still speak.

## Decision rules

- **When a voice has no ledger row, no line renders against it.** There is no override
  flag; an emergency path is a row with a stated temporary scope.
- **When a person withdraws consent or the agreed scope ends,** set the row to retired and
  list the lines that used it. Baked takes are the studio's custody and are a legal
  question, not a technical one; the ledger's job is to make the list instant.
- **When a provider does not actually serve the speech modality the project declares,**
  the declaration is a defect. A pipeline that names speech as a producible kind while no
  registered provider serves it reports a voiced deliverable that is only text; the audit
  belongs in the provider registry (see generative provider auditing), and the ledger stays
  empty until a real provider exists.
- **When a designed (not cloned) voice is used,** the consent field reads *not applicable*
  with the reason, not blank. A blank is unmeasured.
- **When a licensed library voice is used,** record the licence's scope for games and for
  derived clones; many libraries permit playback and forbid training on the voice.

## When not to use this

- **For non-speech vocalizations from a sound-effect generator** (a creature growl, a crowd
  murmur) with no person behind them; those belong to the asset classes of the audio
  pipeline.
- **As legal advice.** The ledger records facts; whether a given use is permitted is a
  question for the studio's counsel and the platform's rules.
- **For a one-off placeholder voice in an internal prototype that will be re-cast before
  ship.** Label it a placeholder in the row, since a placeholder that is not labelled tends
  to ship.
