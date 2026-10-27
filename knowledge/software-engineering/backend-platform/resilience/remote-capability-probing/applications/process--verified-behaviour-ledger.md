---
layer: application
type: application
subject: remote-capability-probing
technique: verified-behaviour-ledger
stack: process
status: forged
verified_on: 2026-10-27
---

# A sourced / unverified / verified ledger for an agent platform, in a hackathon DevSecOps build

afterlife (https://github.com/xkazm04/afterlife, commit `009c7893`, the same tree as the
GitLab hackathon showcase) was designed against the GitLab Duo Agent Platform and the GitLab
REST API largely from documentation, then run on gitlab.com in the last days before
submission. Two READMEs carry the ledger: `gitlab/flows/README.md` for the custom agent
flows and `gitlab/apply/README.md` for the write-token project's settings and API
assumptions.

## 1. Tags at the point of use, with a dated default

The flows README opens with the default tag and its date: "Each file's header lists the doc
page every construct was checked on (2026-10-06)." (`gitlab/flows/README.md:3`). Sourced
claims carry `[S]` and the page, as in "A flow gets an OAuth token limited to
`ai_workflows` endpoints ([S] .../flows/custom/)" (`:51`), and the claim that is not yet
checked is marked in the same sentence: "Anything a prompt does through the REST API from
`run_command` (the medic's retry) is still `[R?]`" (`:51-52`). The apply README does the
same for a settings table: "Checked on docs.gitlab.com on 2026-10-07 unless marked `[R?]`."
(`gitlab/apply/README.md:104`), with per-row `[R?]` on the claims a run must confirm
(`:109-110`).

## 2. Contradictions quoted, adaptations named

"Adaptations the live platform required" (`gitlab/flows/README.md:81-91`) is the
technique's step 3 for contradicted claims. The first entry quotes the platform's own
rejection — "`aiCatalogFlowCreate` refused it: "property at `/components/0/max_cycles` is a
disallowed additional property"" — keeps the documentation's statement as the reason it
surprised anyone ("The flow registry v1 doc lists it; the gitlab.com custom flow schema does
not accept it"), and names the design change ("The loop bound now comes only from each
prompt's `params.timeout`") (`:83-85`). The second records a behaviour of the team's own
prompt that only a live mention exposed (`:86-89`). What was accepted as written is listed
too (`:90-91`), so the reader knows which constructs the run did exercise.

## 3. Verified entries carry their evidence, and partial runs say so

"Verified on the first runs (26 Oct 2026)" (`:100-126`) records each observation with its
artefact: a review request "started session 10087632 within a second" (`:102-104`); the
patcher "(session 10087560, mention on issue #1)" and "MR pipeline 2991663290, 50 tests, 0
failed" (`:108-116`). Partial verification is precise, the technique's step 4: "A trigger by
a person works for the mention, assign-reviewer paths." (`:102`), while "Not verified
(`[R?]`), for the first run" (`:128-132`) keeps the unexercised siblings by name — "The goal
of a "merge request created" and of a "work item" event (only mention and assign reviewer
were run)" (`:131`) and the untested pipeline-event trigger (`:132`).

Outside-reader visibility is verified the same way, step 5: agent session and flow pages
"return 404 to a signed-out visitor", while "The job page itself ... the `duo_workflow`
pipelines and the agent's notes and commits on the MRs are public" (`:117-119`).

## Deviation recorded

**The apply README's unverified list was not settled by the same runs.**
`gitlab/apply/README.md:209-229` still carries nine `[R?]` items — the compare endpoint's
`too_large` and `collapsed` fields, the MR pipelines list order, whether a group access
token's approval counts toward approval rules — with no verified replacements beside them,
and the document has no verified section at all, although the flows README shows live runs happened in the same days. The ledger is honest about what is
unknown, which is its first duty; its second, replacing claims as runs settle them, was
done for one document and not the other.
