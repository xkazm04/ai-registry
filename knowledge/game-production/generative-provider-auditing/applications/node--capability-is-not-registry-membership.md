---
layer: application
type: application
subject: generative-provider-auditing
technique: capability-is-not-registry-membership
stack: node
status: forged
---

# The audio provider capability and licence contract in PoF

`src/lib/audio-gen/` is the clearest realization of the capability/membership separation in
the PoF codebase, and it exists because the separation was once missing.

## The incident that produced it

`src/lib/audio-gen/capabilities.ts:3-11` records it plainly:

> `AudioProvider.capabilities` used to be decoration: the route never consulted it, so a
> `music` or `tts` request reached ElevenLabs' `/v1/sound-generation` like any other and
> came back as an SFX clip — **billed, cached, and filed under the kind the user asked
> for**.

That is the mislabelled-artifact failure exactly: the request succeeded, money was spent,
and the pipeline acquired an asset whose recorded kind was wrong. A capability list nobody
gates on is not a registry.

## The provider interface makes membership, licence and reason structural

`src/lib/audio-gen/types.ts:33-53` gives each of the three its own field, with the
doctrine in the doc comments:

- `capabilities: AudioKind[]` — "The kinds `generate` REALLY serves … not a wish list. A
  kind absent here is refused before any billed provider call, so it can never come back
  as a mislabelled clip."
- `commercialLicense: Partial<Record<AudioKind, CommercialLicense>>` — declared **only**
  for kinds in `capabilities`, because "a licence badge for a kind the provider cannot
  serve is a claim about audio that will never exist". The `Partial` is deliberate: the
  authoring surface renders "licence not declared" rather than inventing a default.
- `unsupported: Partial<Record<AudioKind, string>>` — "Why each unserved kind is unserved,
  in the provider's own words", surfaced verbatim by the route's refusal envelope.

`unsupportedReason()` (`capabilities.ts:29-33`) closes the last hole: an unserved kind with
no recorded reason still returns a refusal sentence — "and no reason was recorded" —
rather than silence, so an undeclared reason reads as a refusal, never as an unexplained
absence.

## Removing a claim rather than half-keeping it

`src/lib/audio-gen/providers/elevenlabs.ts:17-46` shows the removal, with the reasoning
kept:

```ts
capabilities: ['sfx', 'ambient'],
commercialLicense: { sfx: 'yes', ambient: 'yes' },
unsupported: {
  music: 'PoF only calls /v1/sound-generation, which synthesises sound effects. '
    + 'ElevenLabs music is a separate product and endpoint that PoF does not integrate, '
    + 'so a music request here would return an SFX clip filed as music.',
  tts: 'Text-to-speech needs /v1/text-to-speech/{voice_id} and a chosen voice; '
    + 'PoF integrates neither, so speech cannot be produced here.',
},
```

The header states the rule the technique names: "The claims are removed rather than
half-kept … That is a second integration, not a flag — so PoF does not claim
text-to-speech." Note also what *is* claimed and why: "`sfx` and `ambient` are both
honestly served by sound-generation — ambient is the same synthesis with a longer prompt
and duration." Membership is justified per kind, in one sentence each.

## Two gates, one wording

The route refuses first; the provider re-checks at dispatch (`elevenlabs.ts:50-54`):

```ts
// Defence in depth: the route refuses first, but a direct caller must not be
// able to slip an unserved kind into the one endpoint this provider has.
if (!supportsKind(ElevenLabsProvider, req.kind)) {
  throw new Error(refusalMessage(ElevenLabsProvider, req.kind));
}
```

Both gates call the same `refusalMessage()` (`capabilities.ts:41-45`), and the authoring
surface lists unserved kinds with their reasons through `unsupportedKinds()`
(`capabilities.ts:35-39`) — so the disabled option in the interface, the API refusal
envelope, and the adapter's own guard all say the same sentence. One authority, three
surfaces.

**Deviation, standard unchanged.** This licence-honesty contract exists for audio only;
the visual and mesh paths carry no equivalent `commercialLicense` declaration, so a 3D or
image asset's commercial status is unrecorded at the point of generation. The standard is
that licence terms are part of membership for every media kind that ships.
