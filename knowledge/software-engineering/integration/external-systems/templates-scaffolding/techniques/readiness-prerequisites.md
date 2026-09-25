---
layer: technique
type: technique
subject: templates-scaffolding
technique: readiness-prerequisites
status: forged
laws: [gate-sees-target, failure-not-empty-success, one-authority-per-vocabulary]
shared_with: []
use_when: [declaring what a template assumes about its environment, gate passed but the instance still fails unattended, choosing between blocking adoption and degrading it]
---

# Readiness prerequisites

A template's payload routinely assumes things the adopting environment may
not have: credentials for external services, connected integrations,
sibling entities, platform capabilities. Readiness is the discipline of
**declaring those assumptions in the template and checking them before the
adoption commits** — because the two possible failure sites are wildly
asymmetric in cost:

- **At adoption time**: a human is present, context is fresh, the remedy is
  one guided click away ("this template needs a messaging credential — add
  one here"). Cost: a minute, inside a flow built for it.
- **After adoption**: the instance is born broken and *looks finished*. The
  missing credential surfaces at first unattended run — a 3 a.m. failure
  under the adopter's name, diagnosed from a log, by someone who has
  forgotten the adoption ever happened. Cost: an incident.

A readiness gate keeps every defect that is *present at adoption* at the
first site. Skipping it doesn't remove the check; it moves the check to
production and reassigns it to the on-call. The limit of its reach needs
stating just as plainly. A credential that was healthy at adoption and
later expires, is revoked, or loses a scope produces the same unattended
failure, and no adoption-time gate can see it. That half belongs to the
instance's run-time health: pause, name the requirement that broke, link
the reconnect. The gate writes the requirement records that this run-time
check reads, so the remedy it names later is the same one the gate would
have named on day one. The reach is also set by what the gate *reads*, not
only by when it runs. A gate whose input is the presence of a credential
also passes one that has already failed at adoption. Where a run-time
usability predicate exists, the adoption gate reads that one, so the two
halves cannot disagree about the same credential on the same day.

## Requirements are declared as roles, matched as facts

The template declares **requirements**, not bindings: "a credential able to
send messages", "a connection to an issue tracker", never "credential
#4711" or a named account (that distinction is
[template-portability](./template-portability.md)'s; readiness consumes it).
Each requirement is a small, matchable record: the **role** it plays in the
payload, the **capability** it must have, and whether it is **required or
optional** for the instance to function.

The gate then matches declared requirements against the live environment —
typically the [credential vault](../../../../security/identity-and-access/credential-vault/credential-vault.md)
and the connected-integration registry. Matching rules that earn their
keep:

- **Match on capability, not on name.** The adopter's credential is called
  whatever they called it; the matcher asks "can this act in the declared
  role", using the same metadata the vault maintains for its own purposes
  (service, scopes, health).
- **Prefer verified-healthy candidates, and say when you couldn't.** A
  credential the vault has marked broken satisfies nothing; one the vault
  could not verify is a *provisional* match, and the verdict says so —
  readiness inherits the vault's three-state honesty rather than flattening
  it into found/not-found.
- **The gate must check what adoption will actually use**
  ([gate-sees-target](../../../../_laws.md#gate-sees-target)). If the gate
  matches against one registry and the instantiation resolves bindings
  from another — or matches "some credential exists" while the payload
  needs a specific capability that candidate lacks — the gate passes
  exactly when it shouldn't. The matcher and the adoption-time resolver
  must be the same logic or provably the same query, not two teams'
  approximations of each other.
- **A probe must reach what it claims to test.** A "Test delivery" or
  "check connection" button inside the adoption flow is a readiness probe.
  If it runs against a stub, it reports success for a path that was never
  exercised. Either it calls the real path, or it is labelled a preview and
  never shows a success mark.

## The verdict is three-valued, and each value has a next action

Per requirement, and rolled up per template:

| Verdict | Meaning | Surface behavior |
| --- | --- | --- |
| **ready** | every required role has a satisfying, preferably verified candidate | adopt proceeds; matched bindings shown for confirmation |
| **blocked** | a required role has no candidate | adoption is prevented; the block **names the requirement and links the remedy** — the add-credential / connect-service flow, pre-filled from the declared role |
| **degraded** | required roles satisfied; optional ones not, or matches are unverified | adoption proceeds with an explicit notice of what won't work and what to add later |

Two spelling rules keep the verdict honest
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)):

- **"Blocked" is never generic.** A refusal without the requirement's name
  and a remedy path is indistinguishable from a bug in the gate, and
  adopters treat it as one. The whole value of declaring requirements as
  data is that the block message writes itself.
- **"The gate could not run" is not "ready".** A matcher that errors — the
  registry unreachable, the vault locked — must not fall through to a
  green verdict. Readiness computed over an unreadable environment is the
  gate lying in the direction that costs the most. The same goes for an
  unreadable *template*. When the requirement list can't be parsed, the
  answer is "unknown", not "no requirements, therefore ready".

The verdict vocabulary is defined once and every surface derives from it
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)):
the gallery badge ("needs setup"), the pre-adoption panel, the adoption
button's enablement, and any bulk-adoption tooling must all read the same
three states from the same evaluator — a gallery that computes its own
simplified readiness will disagree with the gate on exactly the entries
that matter.

## Placement: before the commit, visible before the attempt

The gate runs **inside the adoption flow, before the transaction** — that
is its enforcement point. But readiness is also *browse-time information*:
surfacing "needs a messaging credential" on the catalog card lets the
adopter pick a template they can actually run, or fix the environment
before investing in the interview. Same evaluator, two render points. The
browse-time render is advisory (the environment can change between browse
and adopt); the pre-commit run is the one that gates. Evaluating only at
browse time and trusting it at commit time is a time-of-check race wearing
a UX improvement's clothes.

"Same evaluator" has one condition the browse render can't escape: it runs
*before the interview*. The gate's verdict can depend on answers, such as
which credential-backed option was picked or whether a custom fallback was
chosen, and those answers don't exist yet at browse time. So the browse
render has to ask the evaluator a stated question. "Would the defaults
pass?" is one. "Does some answer set pass?" is another. Its label then says
which. A badge that says "Ready" should mean the gate passes on the path
the adopter is most likely to take, and a sort or filter named after
readiness inherits that meaning. If the browse render has to be a cheaper
approximation, it should only ever err toward "needs setup". A card that
says ready and a gate that then blocks is the disagreement adopters
remember. A card that says "needs setup" over a template the gate would
pass costs one click.

## Degraded adoption is legitimate; silent degradation is not

Some templates are genuinely useful at partial readiness — the instance
does local work now, and grows into its integrations later. Supporting
that is good product judgment, under two conditions: the degradation is
**declared** (the notice enumerates the unsatisfied optional roles), and it
is **durable** — the instance itself records which roles went unbound, so
the "finish setting this up" surface can exist after the adoption flow is
gone. An instance that silently dropped three optional capabilities at
adoption, with no record, presents later as "this template is worse than
advertised" — a curation reputation cost paid for a readiness shortcut.
