---
layer: application
type: application
subject: cv-content-construction
technique: machine-rewrite-fidelity-contract
stack: process
status: forged
verified_on: 2026-09-26
---

# The job-seeker CV boost: a deterministic pass, a tailoring pass and a polish dialog

Pinned at `kp@2d02eb0ea`. A job-seeker module turns an imported CV into a designed A4
document through three stages: a deterministic "better expressed" pass (the CV document
builder), a deterministic tailor-to-target pass, and a model-driven polish dialog (the
`cv_polish` persona in the Python pipeline). The operator judged the output "mediocre" in
content even when boosted. Read against this subject the diagnosis is precise: the
pipeline is **honest but inert** on the content side - it almost never adds anything,
which is right, and it almost never *restructures* anything either, which is why the boost
reads as the same CV with tidier casing. And its one generative stage has a fidelity gap
at exactly the place the technique puts the contract.

Anchors below are root-relative to that tree.

## What conforms

- **The addition ban is stated and held in the deterministic passes.**
  app/features/jobseeker/cv/cvDocument.ts:9 "is deliberately narrow and deterministic" and
  app/features/jobseeker/cv/cvDocument.ts:14 "nothing is ever invented: no new claim, no new number". Every change is
  logged as an improvement record so the page can say what was tidied.
- **Tailoring reorders, never adds.**
  app/features/jobseeker/cv/cvTailor.ts:319 "the most relevant sentence leads; the rest keep their order, every one verbatim";
  roles keep reverse-chronological order; compaction keeps the role's line. The coverage
  report (shown / missing demanded skills) is
  app/features/jobseeker/cv/cvTailor.ts:27 "never printed on the sheet" - the
  gap-to-owner rule of `target-role-tailoring-without-stuffing`, realised.
- **The stand-in lexicon is labelled.**
  app/features/jobseeker/cv/cvTailor.ts:114 "and said so in the designer" - a claim carrying its basis.
- **The target is labelled as sought.**
  app/features/jobseeker/cv/cvDocument.ts:378 "Seeking: ${target} roles" - never set as a
  held headline; the career-change target-line rule.
- **The polish persona's `before` is grounded.**
  pipeline/jobfit/jobseeker.py:718 "before.strip() in (source" keeps a
  suggestion only when its source sentence really occurs.

## Measured gaps, ordered by impact

1. **The model's `after` is never checked.**
   pipeline/jobfit/jobseeker.py:1822 "), 600)," accepts the
   replacement with no test for new numbers, names, titles or posting-borrowed skills. The
   only control is the prompt:
   pipeline/jobfit/jobseeker.py:1727 "Never invent facts, dates, employers, numbers or skills"
   and pipeline/jobfit/jobseeker.py:1750 "HARD RULE: never add a skill". The technique's
   evidence is that prompt guardrails alone leave fabrications in about half of outputs;
   the missing piece is a deterministic `after` screen (numbers, proper nouns, title words,
   target-lexicon terms absent from the source) that drops a proposal or downgrades it to a
   question.
2. **A whole regenerated CV is accepted unverified.**
   pipeline/jobfit/jobseeker.py:1811 "or base_artifact[" takes the
   model's full document, falling back to the base only when it is empty. The contract
   treats a full document as a set of proposals to diff, never as adoptable output.
3. **Accepted polish does not reach the printed document.** The designed CV is built from
   the raw source -
   app/features/jobseeker/sieve/StepYou.tsx:161 "cvSourceText: profile.cvSourceText" and
   app/me/cv/print/page.tsx:54 "cvSourceText: profile.cvSourceText" - while polished text
   is stored on its own:
   app/_lib/db/jobseeker-profiles.ts:193 "export function setPolishedCv". Two documents,
   one the owner improved and one they download. Contract step 5.
4. **One deterministic rewrite raises the claim.**
   app/features/jobseeker/cv/cvDocument.ts:287 "responsible for" rewrites "responsible for"
   to "Owned". Responsibility into ownership is the embellishment the accomplishment
   technique reserves for the owner; the safe move is a neutral verb the owner picks, or a
   flag.
5. **No accomplishment restructuring and no outcome ladder.** The deterministic pass fixes
   casing (28 canonical terms), 15 misspellings, wrap hyphens and capitals; nothing detects
   a bullet with no outcome or asks the owner for one. The technique's most valuable output
   - the list of lines stuck at "action and object only", each with its question - does not
   exist.
6. **Every sentence becomes a bullet, with no budget.**
   app/features/jobseeker/cv/cvDocument.ts:285 "return splitSentences(body).map" turns each
   sentence of a role into its own bullet, and no code caps bullets by recency. Compaction
   exists only for off-target roles, only while tailored, and is off by default:
   app/features/jobseeker/cv/CvDesigner.tsx:122 "initial?.compact ?? false". The recency
   budget (3-6 / 2-4 / 1-2 / one line) is the missing construction step.
7. **Skill levels become pips.**
   app/features/jobseeker/cv/cvDocument.ts:384 "A stated level as 1-3 pips" renders a
   self-stated level word as a meter. The word is kept for parsers, but the page shows a
   guess in the grammar of measurement; the skills technique says words on a known scale,
   or nothing.
8. **Keyword emphasis is uncapped at the document level.**
   app/features/jobseeker/cv/cvTailor.ts:254 "const EMPHASIS_PER_BULLET = 2;" plus every
   matched skill item bolded -
   app/features/jobseeker/cv/cvTailor.ts:368 "emphasis: true" - produces a page of bold
   keywords on a strongly matching CV; the tailoring technique caps emphasis at one or two
   per role and none inside the skills list.
9. **"Listed only" is computed but never asked.** Coverage records *where* a demanded
   skill appears (skills list, summary, role), so "listed but never evidenced in a role" is
   derivable, but it is not turned into the owner question ("where did you use X?").

## What would move the verdict

Gaps 1-3 are the fidelity contract and are the ones that can hurt a candidate; gaps 4-9 are
why the output reads as mediocre. None needs a model: 1, 2, 4, 6, 7, 8 and 9 are rule code,
3 is plumbing, and 5 is rule code for detection plus the dialog for the owner's answer.
