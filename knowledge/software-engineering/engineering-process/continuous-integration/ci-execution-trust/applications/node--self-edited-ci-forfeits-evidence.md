---
layer: application
type: application
subject: ci-execution-trust
technique: self-edited-ci-forfeits-evidence
stack: node
status: forged
verified_on: 2026-10-27
verified_against: node@22
---

# An agent control plane that refuses evidence its merge request could have shaped

Project `afterlife` (https://github.com/xkazm04/afterlife, the same tree as the hackathon mirror
on GitLab), read at `main` commit `009c7893`. Afterlife lets coding agents open merge requests
against target projects and merges some of them without a person, on a Proof Block that a
model-free engine re-derives from the merge request pipeline's artefacts. That makes the
pipeline the thing an agent would most like to shape, and the write side of the system — a
separate project, `belay-apply`, whose scripts live in `gitlab/apply/` — checks two of the
inputs this subject names before it reads a single artefact. The job image is `node:22`
(`gitlab/apply/.gitlab-ci.yml:18 "image: node:22-bookworm"`).

## The configuration surface, walked at the head

`gitlab/apply/ci-touch.mjs` is the walk, and its header states the whole technique in nine lines:
`gitlab/apply/ci-touch.mjs:1 "Does a merge request change its own CI configuration? Such an MR chose which jobs made its evidence"`.
The surface is the configured CI file, read from the project's `ci_config_path` rather than
assumed (`gitlab/apply/ci-touch.mjs:46 "const own = project.ci_config_path || '.gitlab-ci.yml';"`),
anything under `.gitlab/`
(`gitlab/apply/ci-touch.mjs:50 "p === '.gitlab' || p.startsWith('.gitlab/')"`), and every local
include, followed breadth-first with a seen-set through the included files as the head has them
(`gitlab/apply/ci-touch.mjs:54-80`). A cross-project include that names this project is treated
as local (`gitlab/apply/ci-touch.mjs:29 "else if (i.project === projectPath)"`) — the technique's
"a cross-project spelling of a local file is a local file".

The sweep calls it with the diff's every old and new path and a reader pinned to the head
(`gitlab/apply/sweep.mjs:110 "touchesCi({ changed, project: t, readAt: (p) => readFile(t.id, p, head) })"`),
and the README records the consequence as invariant 4: no proof, no `proof::pass`, no approve, no
merge, a WAIT note with the reason (`gitlab/apply/README.md:32`), with `proof::pass` removed if an
older head had it (`gitlab/apply/README.md:50 "If the MR changes CI configuration: WAIT"`).

## Fail closed, case by case

Every fail-closed case in the technique is in the file, each returning a reason string rather
than a boolean:

- unreadable for any reason but a 404:
  `gitlab/apply/ci-touch.mjs:62 "could not be read"` — a 404 alone continues
  (`gitlab/apply/ci-touch.mjs:64 "if (text === null) continue;"`);
- not parseable: `gitlab/apply/ci-touch.mjs:69 "does not parse: treated as changed"`;
- a variable in a project or a path, or a wildcard:
  `gitlab/apply/ci-touch.mjs:28 "a variable"`, `:34 "a path with a variable"`,
  `:36 "a wildcard whose files are not followed"`;
- over the cap of 100 files:
  `gitlab/apply/ci-touch.mjs:76 "includes more than ${MAX_FILES} files: treated as changed"`.

The README's residuals carry the remedy the technique asks the reason to carry: a target that
includes by wildcard waits on every agent MR until it lists its includes by name
(`gitlab/apply/README.md:170 "A target that includes with a wildcard waits on every agent MR"`).

## Upward lessons taken into the technique

Two lines changed the draft. The repository's split of 404 from every other read failure
(`gitlab/apply/ci-touch.mjs:7 "an include that cannot be read (anything but a 404)"`) became the
technique's "an unreadable file is never an absent one". And the README's closing residual is
the honest boundary the technique now states — the walk removes the agent's control over which
jobs ran, not over the test it wrote:
`gitlab/apply/README.md:230 "the evidence is still the output of the target's own test job"`.

## Deviation

A CI file hosted in another project is treated as out of the merge request's reach with no
walk at all (`gitlab/apply/ci-touch.mjs:52 "if (external) return null;"`), marked unverified in
the line's own comment. The technique keeps the stricter rule: an external definition is out of
reach only if it includes nothing back from the changed project, and only once the platform's
behaviour is checked. Here, an external definition that included a local file of the target
would let that file change unseen.

## The run predicates beside it

The same sweep applies [evidence-pipeline-provenance](../techniques/evidence-pipeline-provenance.md):
only a `merge_request_event` pipeline counts
(`gitlab/apply/sweep.mjs:44 "const EVIDENCE_SOURCE = 'merge_request_event';"`), at the head and
finished (`gitlab/apply/sweep.mjs:300`), and a pipeline that carries variables is a WAIT, its
variable list read rather than assumed empty
(`gitlab/apply/sweep.mjs:302 "could not be read"`,
`gitlab/apply/sweep.mjs:303 "ran with ${vars.length} pipeline variable(s)"`). The comment above
it gives the reason in the technique's terms — variables outrank the job's own
(`gitlab/apply/sweep.mjs:296 "pipeline variables, which outrank the job's own"`) — and the README
names the manual-job gap the technique adopted:
`gitlab/apply/README.md:223 "the evidence job must not be"` (`when: manual`).
