---
layer: technique
type: technique
subject: agent-cli-transport
technique: subscription-auth-selection
status: forged
laws: [one-validation-door, absent-guard-is-loud]
shared_with: []
use_when: [choosing whose bill a spawned agent run lands on, an API key in the host environment could silently switch billing, a batch workload must run on the operator's flat-rate seat, a spawned child reads untrusted content and inherits the host environment]
---

# Subscription auth selection

An agent CLI typically supports two ways to pay: the **seat** — the
interactive login session of the operator's flat-rate subscription — and a
**metered key** — an API credential billed per token. The transport's whole
economic case usually rests on the seat: a batch of hundreds of calls that
is effectively free on a subscription the operator already pays for would be
a real invoice on metered billing. Which path the child takes is therefore a
*decision the adapter makes*, never an accident of what happens to be in the
environment.

## The precedence trap

The trap is that it *is* an accident by default. Most tools in this class
prefer a metered key over the cached seat session when both are visible —
and the spawning application's own environment very often carries such a key,
because the host uses the same vendor's API elsewhere. The result is the
silent failure mode this technique exists to kill: every spawned run quietly
bills per token while the operator believes they are on their subscription.
Nothing errors. The only symptom is an invoice.

## Strip at the one door, after everything else

The repair is an **environment strip, applied at the single spawn door**
([one-validation-door](../../../../_laws.md#one-validation-door), inherited
through the borrowed spawn contract):

- The adapter holds a **named, per-tool list** of the environment variables
  that switch that tool onto metered or alternate-cloud billing — the key
  variables themselves and the provider-routing switches beside them. The
  list is dated data in the
  [dated-capability-matrix](./dated-capability-matrix.md), because vendors
  add new switches.
- The strip is applied **after all other environment construction**, so no
  override, profile, or config merge can re-introduce a stripped variable
  behind it.
- It is **mandatory at the door with no per-caller opt-out**. Field history
  is blunt here: when the strip lived at call sites, some forgot it, and
  whole feature families silently fell back to pay-per-token until someone
  read a bill. A guard that each caller must remember is an absent guard
  ([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).
- It is **pinned by a test that reads the child's real environment** — not
  the argument the host thinks it passed. The billing variables are exactly
  the kind of thing a refactor re-inherits without noticing.

Strip does not mean the metered path is forbidden — it means metered is an
*explicit* configuration (a deliberate injected credential for CI, a
server-side deployment with no seat), chosen at the door, visible in the
spawn record.

## The direction inverts per tool

The rule is not universally "strip". At least one tool family in this class
has **no seat path at all** — its free interactive tier was discontinued —
and runs only when a metered key or cloud credential is *injected*. For such
a tool the adapter's job flips: ensure the key is present, and label every
run as metered so cost tracking treats it as real spend. Which direction a
tool takes is a capability-matrix row, verified on a date; a hardcoded
"always strip" adapter meets a tool like this and simply stops working, with
an error that blames auth instead of the adapter's assumption.

## When the child reads untrusted content, the strip inverts into an allowlist

Everything above is a *named* strip, and for billing that is the right shape:
the threat is a handful of known variables that switch a tool's payment path,
the vendor publishes them, and the list can be kept as dated data. The same
shape is wrong the moment the child's job is to process content the operator
does not control — scraped pages, a mailbox, a repository somebody else wrote,
the output of a third-party tool server. The threat then is not a switch but
**exfiltration**: an indirect instruction that gets the child, or a tool it
calls, to read its own environment and put it somewhere visible. Against that
threat a denylist fails by construction, because the secret that leaks is the
one nobody put on the list — a webhook signing key loaded from a dotfile, an
error-reporting credential, a per-integration token added last month.

So for a child over untrusted content the environment is **built, not
inherited**:

- **Clear, then add back an allowlist.** The baseline is what a process needs
  to start and find its configuration — the executable search path, the home
  and profile directories, temp, locale, and on some platforms the loader's
  system-root variables — and it carries no application secret.
- **A secret the child legitimately needs is passed by name, to that child
  only.** A CLI authenticating by key receives its own key; a headless browser
  beside it does not. The per-child extra list lives beside the baseline in
  one module, so "what may this child see" is one reviewable decision rather
  than one per spawn site.
- **Pin it the way the strip is pinned**: a test that plants a sentinel secret
  in the host environment, spawns a real child through the door, and asserts
  the child cannot see it — alongside the assertion that the child still
  starts. An allowlist that silently re-inherits after a refactor passes every
  test that only checks the child ran.

The two shapes compose rather than compete: the allowlist decides what a
confidential child can see at all, and the billing strip still runs last over
whatever the allowlist admitted. Tool launchers in this class sometimes ship
the allowlist as their default — a stdio tool-server client that passes only a
short list of safe variables unless told otherwise — and that default is a
safety one line of caller code undoes, by spreading the host environment into
the override. Treat a spread of the full host environment into any child that
reads untrusted content as a finding, whatever the child is: an agent CLI, a
tool server, a browser, or a process the application calls a sandbox because
its working directory is confined. Confining the path and inheriting the
secrets is a sandbox for files and an open door for credentials.

## Session nesting is part of auth hygiene

A special case of environment leakage: when the spawning application itself
runs *inside* an agent session (an agent building a product that spawns the
same vendor's CLI), the vendor's session-marker variables ride along and can
make the child believe it is a nested invocation — changing its behavior or
refusing to start. The door strips the vendor's session markers alongside
the billing keys, so the child always starts as a fresh top-level session.

## Long-lived auth for headless environments

Seat auth is interactive by nature — someone logged in once, in a browser.
For CI and unattended servers, prefer the tool's own mechanism for minting a
long-lived seat-scoped token over smuggling a browser session's artifacts
across machines: the minted token is designed to be portable and revocable;
the copied session file is neither, and it turns the availability probe's
"credential file exists" fallacy into an operational habit.
