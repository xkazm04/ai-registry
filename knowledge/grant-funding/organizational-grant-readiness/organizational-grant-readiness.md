---
layer: golden-path
type: golden-path
subject: organizational-grant-readiness
status: forged
use_when: [designing an applicant onboarding or profile system for funding work, deciding which organizational facts and documents to collect and how, pre-filling applicant data from registries or models without fabricating, an applicant abandoned onboarding or submitted with wrong identity data]
techniques:
  - funder-fact-taxonomy
  - registry-grounded-autofill
  - disambiguation-over-confident-guess
  - attestation-invalidation
  - applicant-evidence-corpus
  - multi-org-workspace-scoping
---

# Organizational grant readiness

Organizational grant readiness is the discipline of assembling, once, the
canonical set of facts, documents and evidence that every funder asks an
applicant organization for — and keeping that set true. Funders across every
family ask for remarkably similar things: legal identity (registered name,
registry identifier, legal form), location and jurisdiction, financial
standing (most recent annual revenue as filed, year of incorporation, budget),
governance artifacts (board list, bylaws, incorporation papers), and the
organization's mission in its own voice. An organization that has this set
verified and at hand applies in hours; one that does not spends the first week
of every deadline hunting for the same documents it hunted for last time.

The principal reading is that readiness is a **data product with provenance**,
not a filing cabinet. The naive reading — "collect the documents into a
folder" — misses both failure modes that actually cost applicants money:
facts that were never verified (a mistyped identifier that invalidates a
submission), and facts that silently went stale (last year's revenue quoted
three filings later). The readiness set is therefore a small, typed profile
where every field knows where it came from, how confident that source is, and
what would invalidate it.

## The canonical fact set

Four clusters recur across essentially all funders, and they differ in how
they are obtained and how they fail:

1. **Identity** — registered legal name, jurisdiction, entity/legal-form
   code, and the registry identifier. These are *registry facts*: exactly one
   authoritative source exists per jurisdiction, they are verifiable by
   lookup, and a wrong value here is disqualifying, not merely embarrassing.
2. **Location** — headquarters city and region. Known to any staff member,
   but load-bearing downstream: eligibility gates and funder geography read
   these fields, so they must be normalized (a canonical region code derived
   from whatever the human typed), not stored as free text alone.
3. **Financials** — most recent annual revenue as reported on the
   organization's filed annual return, and year of incorporation. These are
   *document facts*: the true value lives on a specific line of a specific
   filing, and the person onboarding usually does not know it from memory.
   This cluster is where hand data entry dies — the overworked single
   director abandons the form at the field that requires digging up a filing.
4. **Mission and voice** — a short set of mission keywords for matching, and
   a freeform mission statement. The statement is not decoration: it is the
   *only* legitimate source of the organization's voice for any AI-assisted
   drafting. Prompts that ask a model to "match the organization's own
   materials" are pointing at this field; if it is empty the drafting layer
   must write in a neutral register, never invent a voice.

Beyond the profile sit the standard attachments funders request by reference:
proof of tax-exempt or registered status, recent financial statements or an
audit, an operating budget, the board list, governance policies, and an
annual report. Readiness means knowing where each lives and when it expires,
not pasting their contents into the profile.

## Assembly without data entry, without fabrication

The central tension of readiness tooling: the facts exist in public
registries and filed documents, so a system *can* fetch most of them — but a
fetched fact presented as certain is a fabrication risk wearing a
convenience costume. The resolution is a strict pipeline:

- **One input, classified.** The applicant supplies a single thing they know
  cold — their name, their website, or their registry identifier. Cheap
  client-side heuristics classify what kind of thing it is (shape and
  checksum identify registry numbers; a dotted host is a website) so the
  lookup can specialize before anything expensive runs. The classifier only
  biases; the research step may override it.
- **Registry-grounded lookup.** A research step (a model with web access, or
  a direct registry API) fills each field with a value, a confidence, and a
  source. The per-jurisdiction knowledge — which registry is authoritative,
  which identifier formats exist, which entity codes are valid — is composed
  from a jurisdiction model, so adding a market extends the pipeline without
  rewriting it.
- **Review, not entry.** The output is a pre-filled form where every field
  is tagged: confident-and-cited, low-confidence-please-confirm, or
  not-found-please-provide. Required fields that are null or weakly sourced
  go on an explicit needs-input list that drives the UI. The human's job
  collapses from "find ten facts" to "confirm ten proposals" — which is the
  entire product, because confirmation survives where entry abandons.

The cardinal rule inside this pipeline: **a wrong identifier the applicant
accepts as theirs is worse than a blank they fill in.** An accepted wrong
value inherits the applicant's own authority — every downstream consumer
treats it as human-confirmed truth. So when the input does not uniquely
identify one real organization (bare names collide constantly), the system
must refuse to guess confidently: it caps confidence on the dangerous fields,
emits a small slate of distinguishable candidates, and lets the human pick —
after which the lookup re-runs against the now-unique identifier.

## Verification is an attestation, and attestations expire

Checking the identifier against the live registry — confirming the
organization exists, is active, and has the status funders require — is
worth persisting: it powers a verified badge, an eligibility signal, and an
audit trail. But the persisted result is an *attestation about a specific
identifier at a specific time*, not a property of the profile. The moment
the identifier changes, the stored attestation describes an entity the
profile no longer claims to be, and it must be invalidated — reset, not
carried forward — or the badge vouches for the wrong organization. This is
the general shape of every derived trust artifact in the readiness set:
each one must know which source fields it depends on, and a change to any of
them resets it to unverified.

Edge case worth naming because it recurs: fiscally sponsored programs are
not their own legal entity. The sponsor's identifier goes on submissions;
the program's own name appears on the cover. A readiness model that cannot
represent "our identity fields belong to another organization" forces such
applicants to lie in one direction or the other.

## Evidence beyond the profile

Structured fields cannot carry everything a matching or drafting layer
needs. Organizations also hold prose evidence — their website, an about
document, a capabilities statement. The readiness system ingests these as a
bounded, sanitized evidence corpus: converted to plain text at the boundary
(never storing original bytes), capped per item and per organization, and
injected into any prompt strictly as delimited untrusted data. And the
profile itself should learn from behavior: the funding opportunities an
organization actually pursues are a revealed-interest signal that can
propose new mission keywords — proposals into an accept/reject rail, never
silent edits, because the profile is the applicant's claim about themselves.

## Failure modes of the naive reading

- **Autofill as oracle.** Presenting fetched values without confidence or
  source turns review back into trust, and the one wrong identifier in
  twenty ships. Provenance per field is what makes review real.
- **Confident resolution of ambiguous names.** The most fluent lookup of the
  wrong organization is the most dangerous output the system can produce.
- **Verification as a boolean.** A `verified: true` flag with no bound
  identifier, source, or timestamp cannot be invalidated correctly and will
  eventually vouch for an entity it never checked.
- **Voice from nowhere.** Drafting layers that invent a mission voice when
  the statement is empty produce applications the organization would not
  recognize as its own.
- **Parsing like a database, not a human.** Revenue arrives as "$1.2M" and
  "620k", not integers; a parser that rejects human notation reintroduces
  the data entry the pipeline exists to remove. Parse generously, then
  normalize; return null on genuine garbage rather than a mangled number.
- **One organization per account, forever.** Consultants and fiscal sponsors
  manage several organizations' readiness sets. If workspace scoping is
  bolted on later, every already-written query becomes a tenancy bug; if the
  organization boundary is designed in from the start — every readiness
  fact keyed to an organization, every access validated against an explicit
  membership allowlist — multi-organization work is a membership row, not a
  migration.

Readiness is done when a stranger with the profile, the attestation trail
and the evidence corpus could complete a standard funder questionnaire
without asking the organization a single factual question — and every answer
they gave could show its source.
