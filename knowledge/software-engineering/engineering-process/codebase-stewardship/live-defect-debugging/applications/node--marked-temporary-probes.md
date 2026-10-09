---
layer: application
type: application
subject: live-defect-debugging
technique: marked-temporary-probes
stack: node
status: forged
verified_on: 2026-10-09
verified_against: node@22
---

# Marker pairs enforced by prose: a debugging skill and its cleanup sweep

What this realization cannot do: nothing in it checks that a probe has a marker. The
rule lives in a skill file that is handed to a model as instructions, and the only code
in the package is a small log server that appends whatever JSON it receives. A probe
written without markers, with a variant spelling, or in a language whose comment
syntax breaks the literal search string is accepted by every part of the system. The
sweep below works because the model follows it, and the tree contains no test that it
does. Everything cited is a statement of intent, not a verified behaviour. The evidence
is one tree (n=1).

Tree read: the `debug-agent` package at commit `295af90bcfc16ba3578e6be91ed1c552261bb257`
(package version 0.0.6). The version witness for `verified_against` is the CI pin, not
the package floor: the manifest declares only a minimum, `packages/debug-agent/package.json:60 "node": ">=18"`,
and both workflows run the suite on the newer line, `.github/workflows/test.yml:24 "node-version: 22"`.
The citations were resolved against the files themselves, which is a source read, not a
run on either runtime.

## The marker rule

The skill makes the wrapper mandatory and says why it is mandatory:

- `packages/debug-agent/skill/SKILL.md:151 "Wrap EACH debug log in a collapsible code region"`, with the
  JavaScript pair given on the next line, a start marker `// #region debug log` and an
  end marker `// #endregion`.
- `packages/debug-agent/skill/SKILL.md:153 "This keeps the editor clean by auto-folding debug instrumentation"` is
  the folding half of the technique, stated as a benefit.
- `packages/debug-agent/skill/SKILL.md:211 "This is why wrapping every debug log in"` closes the document
  by pointing back at the rule: the marker exists so that cleanup is deterministic.

## The sweep, in four steps

The cleanup section is the technique's removal procedure nearly step for step:

1. `packages/debug-agent/skill/SKILL.md:206 "Search all files for"` the marker, naming grep or ripgrep.
2. Delete the block inclusively, `packages/debug-agent/skill/SKILL.md:207 "through its corresponding"` end marker.
3. `packages/debug-agent/skill/SKILL.md:208 "Grep again to verify zero markers remain"`.
4. `packages/debug-agent/skill/SKILL.md:209 "to review all changes"` by `git diff`, to confirm only the intentional
   fix remains and no stray debug code was missed.

Step four is the one that catches an unmarked probe, which is the exact failure the
marker rule cannot prevent by itself.

## Probes outlive the fix

The skill holds the probes through the fix and through the verification run, and names
the one condition for removal: `packages/debug-agent/skill/SKILL.md:36 "user confirms that there are no more issues"`.
The same rule is repeated as a prohibition in the logging section,
`packages/debug-agent/skill/SKILL.md:182 "Removing or modifying any previously added logs"`, and in the
workflow order itself, where the fix step says
`packages/debug-agent/skill/SKILL.md:27 "do NOT remove instrumentation yet"`.

## The secrets prohibition

`packages/debug-agent/skill/SKILL.md:154 "Logging secrets (tokens, passwords, API keys, PII)"` is a one-line
forbidden category, with no per-probe judgement allowed, which matches the technique's
shape. It is enforced by nothing but the sentence. The risk it addresses is larger than
the local case: the same skill offers a remote mode in which payloads are relayed
through a hosted service, `packages/debug-agent/skill/SKILL.md:46 "Logs are relayed through a hosted service"`,
so a probe that records a value there leaves the machine.

## Where the realization falls short of the technique

- **The sweep's search string is one literal.** Line 206 names `#region debug log`
  with no space after the hash. A language whose comment convention is a spaced pair
  of words, or whose region syntax differs, will not match it, and nothing in the skill
  says to check the search against a known marked probe before trusting a zero. The
  technique's positive-control step has no counterpart here.
- **The one-line probe template has no marker.** The mandatory JavaScript snippet,
  `packages/debug-agent/skill/SKILL.md:128 "fetch('ENDPOINT',{method:'POST'"`, is a single line that
  carries neither marker, so the template as written yields an unmarked probe unless the
  model wraps it from the general rule a few lines below it.
- **Nothing in the server cares.** The server accepts any JSON object
  (`packages/debug-agent/src/server.ts:121 "const logEntry = JSON.parse(requestBody);"`) and writes it, so a
  probe that was never marked, never mapped to a hypothesis, or never swept is
  indistinguishable from a good one to every part of the code.
