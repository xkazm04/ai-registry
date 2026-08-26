---
layer: technique
type: technique
subject: translation-pipeline-topology
technique: language-registry-single-source
status: forged
laws: [coverage-is-counted-not-claimed, the-source-locale-is-the-source-of-truth]
shared_with: []
use_when: [deciding where the list of supported languages lives, a language switcher offers a language the build does not produce, adding a new target language to a translation pipeline, translation matrix and export matrix disagree about language sets, a pipeline half-runs for a partially configured language]
---

# Language registry as single source

A translation pipeline has several surfaces that each need a list of
languages: the build matrix that decides what gets machine-translated, the
UI switcher that offers languages to readers, the export or book build that
packages per-language output, and the prompt layer that must name the
language for a model. The moment two of those surfaces carry their own
list, they drift, and the drift is always discovered by a reader — a
switcher entry that 404s, an export that silently skips a language the site
shows. The technique: one registry file is the single source of truth for
every machine surface, and no other file may enumerate languages.

## What one registry entry carries

Per language, the registry holds every fact any machine surface needs, so
no surface has a reason to keep its own table:

- the language code used in filenames, URLs, and the switcher;
- the language's English name, used verbatim when prompting an LLM
  translator ("translate into X");
- the native label, shown to readers in the switcher;
- the tag the MT engine requires for that language — whatever tag
  vocabulary the engine speaks, recorded here, not looked up ad hoc;
- a single ci flag that opts the language into the build (below).

The pipeline validates the entry at entry, not mid-run: a requested
language missing its engine tag fails the run before any work happens. A
language cannot be half-registered — either every field is present and
every surface can serve it, or the pipeline refuses it entirely. Failing
late instead produces the worst outcome: a language that translated but
cannot be exported, or built but cannot be offered, which is a coverage
claim no count backs —
[coverage is counted, not claimed](../../../_laws.md#coverage-is-counted-not-claimed).

## The single opt-in flag

The ci flag couples two decisions that are tempting to separate: does the
build matrix translate this language, and does the generated switcher offer
it. One flag drives both, so the switcher structurally cannot offer a
language the translation store lacks, and the build cannot produce a
language no reader can reach. Decoupling them — a "build" flag and a
"visible" flag — is how the failure reappears: someone flips one and not
the other, and the UI promises what the store does not hold. If a staging
state is genuinely needed (translate but do not offer yet), it should be a
single richer value on the same field, never a second flag in a second
file.

Every derived surface reads the registry at generation time. The export
build reads the same registry and the translation store the build wrote,
falling back per unit to the canonical language where a translation is
missing — the canonical text is what fallback means, because
[the source locale is the source of truth](../../../_laws.md#the-source-locale-is-the-source-of-truth).
Fallback is a per-unit patch over gaps, not a licence to ship a language
the registry does not carry.

## The one-line-diff test

The test of the topology is the cost of adding a language: one registry
entry, nothing else to touch. If onboarding a language requires editing a
CI config, a switcher template, an export script, and a prompt file, those
are four shadow registries and each is a future disagreement. Run the test
deliberately — add a language, grep for its code, and every hit outside the
registry and generated output is a file that should be deriving instead of
declaring. The same test catches removal: deleting the entry (or clearing
its flag) must retire the language from every surface in one build.

## Failure modes

- **The convenience copy.** A script hardcodes the language list "to avoid
  parsing the registry." It is correct on the day it is written and wrong
  after the next registry edit. Any list that cannot cite the registry as
  its origin is a defect regardless of current agreement.
- **The permissive entry point.** The pipeline warns instead of exiting on
  a missing engine tag and "does what it can." Partial runs produce
  languages in inconsistent states, and the inconsistency surfaces far from
  its cause. Refusal at entry is the cheap version of every downstream
  debugging session.
- **Registry sprawl.** Per-language facts accrete elsewhere — a locale
  override in the site config, a font hint in the theme — until the
  registry is one source among several. New per-language configuration
  belongs in the registry entry, even when the field is optional for most
  languages.
- **Treating hand-authored surfaces as machine surfaces.** Pages a human
  wrote and vouches for follow a deliberately separate registry with a
  different contract (see hand-authored-exception-contract); forcing them
  under the machine registry either blocks them on machine readiness or
  lets machine flags misstate what a human actually wrote.
