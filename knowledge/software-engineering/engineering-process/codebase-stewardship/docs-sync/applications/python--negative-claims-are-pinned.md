---
layer: application
type: application
subject: docs-sync
technique: negative-claims-are-pinned
stack: python
status: forged
verified_on: 2026-09-04
verified_against: python@3.12
---

# Nine tests over prose, because the guarantee was that a module does not exist

Read against a public CLI at commit `da5044d2` that gives an agent read access
to thirteen platforms without paying any platform's API fees — which it
achieves by borrowing the operator's own logged-in browser sessions. The
version witness is the project's CI job pin (`.github/workflows/pytest.yml:41`,
`:66`), not a guess; the compatibility matrix runs 3.10 through 3.13.

The premise makes the documentation load-bearing. A tool that handles a user's
live session cookies for six platforms has guarantees that are **only**
expressible as sentences, and the team's response was a 235-line test file of
nine tests that asserts prose: `tests/test_auth_guidance_policy.py`, docstring
*"Documentation must preserve the project's explicit auth boundaries."*

## Three pinned promises, none with a source area

`test_xiaohongshu_opencli_and_export_boundaries_are_truthful` (`:57-72`) pins
two substrings in three documents: that an imported session is for one
downstream consumer only, and that it is **never injected** into the browser or
the browser-driving client. `test_twitter_operational_docs_explain_the_environment_boundary`
(`:74-122`) pins that the diagnostic command **does not execute** the
platform's own status call, and that the tool **does not modify** the caller's
shell.

None of these can be coupled to anything. There is no injection module to map a
document onto, because the whole content of the claim is that the module was
not built — the permanent `unverifiable` the technique describes, arrived at
from the tree rather than from theory.

**The scope is visibly the finding.** The credential-boundary pair is required
in three documents; the environment-variable boundary in **eleven** — four
localized landing pages, the setup guide, the troubleshooting page, the export
guide, the agent-facing instruction file and its translation. Somebody sat down
and enumerated where a reader is about to act, and the list is the only record
of that judgment.

## Two moves the technique did not predict

**A status glyph is a pinnable verdict.** `:114-122` asserts that no document
in the corpus contains the checkmark-prefixed strings presenting the platform's
read capability as verified — in three languages. The claim being suppressed is
*typographic*: the checkmark is the assertion, and the sentence around it is
incidental. This generalizes past the instance, and the companion test
`test_skill_explains_unverified_backend_state` (`:199-209`) shows why the
project cared — it requires both agent-facing instruction files to state that a
null backend value is a safety state rather than a routing instruction. A glyph
and a null were both being read as verdicts they had not earned.

**The forbidden set is localized on purpose.** `:22-54` forbids the retired
sign-in flow's markers across every document, and the list includes the
Japanese and Korean strings for "automatically extract cookies from the
browser" alongside the Chinese ones. The guidance was removed once. The road
back in is a *translation* of it rather than a restoration of it, and the
author extended the floor to cover the road actually taken.

## What the realization cannot do, and its own receipt for it

The suite proves a sentence is **present**, never that it is **true**, and this
tree paid for the gap in the other direction before it built the pins. The
changelog entry for the market-data channel (`CHANGELOG.md:22`) lists
*"corrected misleading documentation"* — the landing page had claimed the
channel needed no configuration when it in fact required a browser cookie — in
the same bug-fix list as a root-caused HTTP 400 and a rejected user-agent. That
claim was false for at least one release, and no pin could have caught it,
because a pin preserves wording and this wording was wrong when written.

The technique's admission ticket — a dated human review establishing truth,
whose approved wording the pin then preserves — is the direct response to that
failure, and **this project does not have one**. The pins were added after the
corrections rather than as part of them, so the suite currently guarantees the
continuity of sentences whose truth was established informally and is not
re-established by anything. That is the weaker of the two available states, and
it is still far better than the unpinned baseline the changelog documents.

One further limit the tree makes visible: the assertions are substring checks
over whole files, so a pinned promise satisfies the gate wherever it appears —
including in a trailing section no reader reaches. Presence is checked;
placement is not.

## The structural fact

Nine tests over prose, in a project with no documentation site, no generated
reference, and no documentation tooling of any other kind. Nobody builds that
for tidiness, and nothing in the project's stack suggested it. It is what a
team is forced to build when the safety property is that **a capability was
deliberately not built** — because then the only artifact that can carry the
guarantee is the paragraph saying so, and the only thing that can defend the
paragraph is a test that reads it.
