---
layer: application
type: application
subject: docs-sync
technique: prose-as-an-execution-surface
stack: python
status: forged
verified_on: 2026-09-04
verified_against: python@3.12
---

# The install line is the attack surface, and one of them is printed by the program

Read against a public CLI at commit `da5044d2` — an agent-facing tool that
reads thirteen platforms using the operator's own logged-in sessions. Version
witness: the CI job pin at `.github/workflows/pytest.yml:41`.

Two of the nine tests in `tests/test_auth_guidance_policy.py` are not accuracy
checks at all. They are security checks whose only enforcement surface is
prose, and they exist because this project's documentation is executed rather
than read.

## The unowned index name

`test_public_guidance_never_installs_the_unrelated_pypi_package` (`:153-174`),
docstring: *"The PyPI name is owned by another project; GitHub URLs are
required."*

The project's obvious name on the public package index belongs to somebody
else. So the obvious install command — the one any contributor writes from
muscle memory, into any of four localized landing pages — installs a stranger's
code onto a reader's machine, delivered by this project's own words, with every
contextual signal saying it is safe. Every install instruction in the tree is
consequently an explicit archive URL (`docs/install.md:62`, `:77`), and the
check permits the bare form only on a line that also carries the project's own
repository.

The vector is created by a **naming coincidence**, not by a code defect, and
nothing that reads the source tree could ever fire on it. This is the clearest
instance the reading found of a supply-chain exposure whose only surface is
documentation.

## The candidate list is the finding

The check's population is the prose corpus **plus one source file**, added by
name (`:155-157`): the integration entry point, which on a missing optional
dependency prints its own install instruction to standard error
(`agent_reach/integrations/mcp_server.py:32-36`).

That line has every property that matters here — a reader will paste it, it was
written once and never re-read, and it is the **only** install instruction that
reaches a user who never opened a page at all, because it fires exactly when
the tool failed to start. A gate scoped to files with a documentation extension
misses it by construction, in the branch where the reader is least equipped to
notice. The technique's population rule — *text a reader will act on*, not
*files of a documentation type* — was derived from this line.

## Credentials never reach the process table

`test_public_guidance_never_puts_secrets_in_process_arguments` (`:177-196`)
forbids eight prefixes across every document: each credential-taking subcommand
followed by a quotation mark. Session cookies for two platforms, three API
keys, a token, a proxy URL.

The tool's own interface already does the right thing — the export guide
(`docs/cookie-export.md`) documents a hidden prompt, with a `--stdin` flag for
non-interactive automation and the explicit instruction *"never place cookies
in the process arguments."* The gate covers the population the interface cannot
reach: every reader who pasted the documented form. A tool-side refusal fires
after the shell has already recorded the line, and after the value has already
been visible in the process table to anything sampling it. Both halves are
needed, and this tree has both.

## What the realization cannot do

Neither check establishes that any documented command **works**. Executing the
documented commands is a separate and much more expensive discipline, and this
project does not attempt it — `test.sh` runs an integration pass over the
installed tool, not over the instructions. These gates catch only the commands
that work exactly as written and should never have been written, which is what
keeps them cheap enough to run on every change.

The install check is also a pattern match on a bare invocation, so it is a
floor rather than a proof: a reader instructed to install by some third route
the pattern does not describe is outside its reach. And its correctness is
**conditional on a fact about someone else's namespace** — if the index name
were ever transferred to this project, the check would go from load-bearing to
obstructive with no signal, since nothing in the tree records why it exists
except the test's own docstring.
