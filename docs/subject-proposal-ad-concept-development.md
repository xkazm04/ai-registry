# Subject proposal — `ad-concept-development`

**Status:** DISPATCHED 2026-10-15, same session as the `/deepen media-generation` run that
raised it. This document is the forge input and the record of what was dispatched. It is
not knowledge.
**Bundle:** `media-generation`
**Category:** `narrative-craft` (flat; six subjects after this one, cap ten)
**Resolved path:** `knowledge/media-generation/narrative-craft/ad-concept-development/`
**Raised by:** `/deepen media-generation`, 2026-10-15, operator-directed: a 42-second
generated spec ad was consistent and creatively generic, and the bundle had nothing to say
about why.
**Engine:** `domain-knowledge-forge`, read [`forge-brief.md`](forge-brief.md) first; it is
the contract. There is no source repository, so phase two (repo reconciliation) is replaced
by the operator's own production bible, read as a `process` application.

---

## The gap, measured

The bundle has 26 subjects and they cover **control**: identity continuity, reference role
maps, style locking, prompt anatomy, grading, assembly. A team that applied all of them
produced a spot whose 27 keyframes hold every face and prop and share one default look,
one framing height and one particle-magic effect. Nothing in the bundle covers the layer
that decides **what to ask for**: the premise, the mechanism of surprise, the hook, and
the division of labour between a language model and a human at that layer. The nearest
prior art, `concept-landing-proposals` in `data-video-art-direction`, is a triage seat
system for data videos. It does not generalise to a persuasive spot.

## Boundaries

- `short-form-narrative-structure` owns beat linking and curiosity gaps inside an
  explainer. This subject owns the premise that comes before any beat.
- `trailer-structure` owns a cut that sells another work. This subject owns a spot that
  sells a product or brand on its own.
- `creator-voice-and-tone` owns voice. `music-prompt-composition` owns how a cue is
  written. This subject only decides whether the sonic hook *is* the concept.
- `image-prompt-composition` owns the default-look attractor at the frame level (landed in
  the same run). This subject owns the idea-level attractor.

## Techniques (five, each on two or more independent lanes)

1. **`agency-preserving-premise`**: the product amplifies, cues or reveals the human's act.
   It never performs it.
   - Evidence: a 2024 AI-assistant ad where the model writes a child's fan letter was
     pulled after backlash; a 2024 tablet spot crushing creative tools drew an apology.
     System1, Super Bowl LX (Feb 2026): AI-themed ads averaged 2.1 stars against 2.7
     overall, and the exception scored 3.3 because the technology "was not the
     protagonist".
   - The blind lane reached the same rule without search.
2. **`creativity-template-mechanisms`**: pick the mechanism of surprise (inversion,
   extreme consequence, absurd alternative, extreme effort, competition) before the
   content.
   - Evidence: Goldenberg, Mazursky and Solomon, *Marketing Science* 18(3), 1999. Six
     templates explained 89% of 200 award winners; about 50% of winners fit one against
     2.5% of non-winners; training in the templates improved creativity ratings.
   - Ipsos and Syracuse Newhouse, May 2026: generated ads skew to category convention;
     convention-breaking ads are more than 20% likelier to win brand attention.
   - Praised generated ads were absurd, comic or self-aware; derided ones attempted
     sincere uplift in imitation live action.
   - The blind lane independently named inversion, exaggeration and genre transplant.
3. **`divergence-against-the-median`**: language-model ideation converges, within one
   model and across vendors. The procedure counters it.
   - Evidence:
     - Doshi and Hauser, *Science Advances* 2024: individual creativity up, collective
       novelty down.
     - Anderson, Shah and Kreminski, Creativity & Cognition 2024.
     - Meincke, Nave and Terwiesch, *Nature Human Behaviour* 2025: less diverse in 37 of
       45 comparisons.
     - Jiang, Choi et al., "Artificial Hivemind", NeurIPS 2025: inter-model convergence;
       judges mismatched to individual taste.
   - Counters:
     - Verbalized Sampling (arXiv 2510.01171): 1.6 to 2.1x diversity.
     - Meincke, Mollick and Terwiesch, SSRN 4708466: chain-of-thought plus asking for
       mutually distinct ideas; a persona barely moves similarity.
     - Chakrabarty, Laban and Wu, CHI 2025: an expert-derived cliché taxonomy as an
       editing pass.
     - The model vendor's own prompting guide: on-distribution output by default, fixed
       by a ban-list plus a committed direction.
   - The blind lane converged on obvious-first-then-ban, quantity-then-cluster, and
     separating generation from judgment.
4. **`rubric-as-spine`**: when the spot is judged against stated weights, the heaviest
   criterion decides what the concept is built around.
   - Evidence: the operator's contest weights catchiness of a mandatory jingle at 35% and
     cohesion at 15% ("a jingle that feels separate" is penalised), so the sonic hook is
     the concept and not the score.
   - Supporting: earworm features, Jakubowski et al. 2016. Counter: Kohli et al., *JAR*
     2013, found no jingle effect on slogan recall.
   - The blind lane said "the hook should be sonic for an audio company" without having
     seen the rules.
5. **`llm-seat-assignment`**: the model holds the generator seat (under technique 3), the
   translator seat (script to shot list to per-engine prompts, small batches, standalone
   prompts, revision from a failure description) and the critic seat (cliché list,
   "which existing ad does this resemble"). The concept and taste seat stays human.
   - Evidence, maker-primary: the Kalshi and IM8 production write-ups, 2025; a 2025
     newspaper profile of a satire studio; a contest winner's case study; a 2026 agency
     write-up of a prompt-project pipeline.
   - Evidence, research: the Hivemind judge mismatch.
   - Counter-evidence: no maker-primary source credits a language model as the creative
     director of widely praised work.

## Applications (`process`)

- `process--rubric-as-spine`: the 2026 contest rubric. Dated, with a short `refresh_by`
  because the contest closes on 10 Nov 2026.
- `process--agency-preserving-premise`: the operator's production bible v2.2
  (13 Oct 2026), read as the case. Its premise ("magic completes the work") fails the
  technique. Its wordless instrumental score fails `rubric-as-spine` too, and that is
  noted as a cross-reference rather than a second application.

## Open questions for the forge

- The right/left-brain feature list (System1) is useful and contested as neuroscience. It
  belongs in the golden path as a practitioner heuristic with that caveat, not as a law.
- Effectiveness evidence (IPA, System1, Ehrenberg-Bass) measures long-run brand effects
  on consumers. A contest is a one-shot panel judgment. Say so wherever it is cited.
