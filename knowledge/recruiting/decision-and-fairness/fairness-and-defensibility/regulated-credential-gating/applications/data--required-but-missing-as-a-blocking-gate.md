---
layer: application
type: application
subject: regulated-credential-gating
technique: required-but-missing-as-a-blocking-gate
stack: data
status: forged
verified_on: 2026-08-23
source: CMS/NPPES-NPI-Registry
---

# One empty answer for five different situations

**Pin.** Publisher: the US Centers for Medicare & Medicaid Services (CMS). Dataset: the
NPPES NPI Registry via its public Read API, `https://npiregistry.cms.hhs.gov/api/`,
**version 2.1** — the API Help page states versions 1.0 and 2.0 are retired and the
version flag is now mandatory. Companion artifact: the Full Replacement Monthly NPI
Deactivation File V.2, `NPPES_Deactivated_NPI_Report_081026_V2.zip`, snapshot
**2026-08-10**. Retrieved and re-checked **2026-08-23**. **Terms, read first:** the Data
Dissemination page states the data are FOIA-disclosable under the e-FOIA amendments, that
the Registry is a query-only database updated daily, and that there is no charge to view
or to download; the API Help page adds that all output is provided in accordance with the
NPPES Data Dissemination Notice. Volume is capped — `limit` defaults to 10 and maxes at
200, `skip` maxes at 1000, "a maximum of 1,200 records over six requests" — but no
per-second rate limit, API key, token or authentication requirement appears on either page
(grep for *rate limit / throttl / per second / API key / token / authenticat*: zero hits
on both). Evidence below is **12 single queries**, no paging, no sweep; the one bulk
artifact is CMS's own published deactivation file, downloaded once as a file. The live NPI
below, `1871543215`, comes from its holder's own site (stanfordhealthcare.org → Health
Insurance Plans → NPI and Tax ID, "Stanford Health Care Hospital NPI"), not the register.

## The register's entire answer vocabulary

Three shapes, and only three. Every call returned **HTTP 200**, errors included.

| query (all prefixed `?version=2.1&`) | body |
| --- | --- |
| `number=1871543215` — active organizational NPI | `result_count` 1, one record |
| `last_name=SMITH&state=CA&limit=200` | `result_count` 200 |
| `first_name=Bob&last_name=Smith&state=CA&use_first_name_alias=True&limit=200` | `result_count` 26 |
| `number=1871543315` — 10 digits, Luhn check **fails** | `{"result_count":0,"results":[]}` |
| `number=1780670281` / `number=1386647519` — deactivated 2026-08-09 / 2005-05-23 | *byte-identical* |
| `number=1999999992` — Luhn-valid, never assigned | *byte-identical* |
| `last_name=Qzzzxwvutt&limit=200` — no such name | *byte-identical* |
| `first_name=Bob&last_name=Smith&state=CA&use_first_name_alias=False` | *byte-identical* |
| `number=187154321` (9 digits) / `number=ABCDEFGHIJ` | `Errors`: "NPI must be 10 digits", `number` "06" |
| `version=2.0&number=1871543215` | `Errors`: "Unsupported Version", `number` "17" |

Six calls, five distinct situations, one answer: the same 31 bytes, md5
`ee9a8052aee45c7d684a153d9c815321`, and again on a deactivated re-run at re-check. The error
shape covers **length and character class only**: a checksum-invalid identifier is ten
digits, so it never reaches the error vocabulary. (NPI carries a Luhn digit over `80840` +
the first nine digits: `1871543215` → sum 60, valid; altering the seventh digit 2→3 gives
`1871543315` → that position's contribution rises 2→3, sum 61, invalid. The register
answered it exactly as it answered a real deactivated provider.)

## Rule by rule

**"Three states, and the middle one is the common case."** The register can express
*evidenced* and nothing else. **Not evidenced** and **evidenced and disqualifying** arrive
in the same envelope, and so does *your input was wrong*. The NPI Details Help page
documents a `status` field that "identifies if the NPI is Active or Deactivated" — yet
across all 227 records returned today `basic.status` was `"A"` (200/200 SMITH, 26/26 alias,
1/1 organization). That Deactivated value is unreachable through the query surface: CMS
states it discloses "the deactivated NPI and the associated date of deactivation" **within
the files**, and the files are where it stayed. A gate reading a zero-result as *not held*
commits the exact collapse this technique forbids, against an authority that never claimed
otherwise.

**"When a required credential is not evidenced, cap and ask; never reject."** Confirmed,
and the register argues for it. Both the API Help page and the downloads page carry the
same standing notice: *"Issuance of an NPI does not ensure or validate that the Health Care
Provider is Licensed or Credentialed."* The authority of record for the identifier
explicitly disclaims authority over the credential — the technique's "a screen, not a
verdict — and the finding should say so", published by the register on its own front door.

**"Compare structured record against structured requirement, on kind, jurisdiction and
currency."** Two of the three are servable. *Kind and jurisdiction:* `taxonomies[]` carries
`code`, `desc`, `primary`, `license` and `state` — the organizational record returned
`282N00000X` / "General Acute Care Hospital", `primary: true`, `license` `070000662`,
`state` `CA`. *Currency:* absent. Walking every key of all 226 records returned by the two
name queries, **no key contains `expir`, `valid`, `renew` or `deactiv`** — not one. The
register holds a licence *number* with no status and no expiry; `basic` offers
`enumeration_date`, `last_updated` and `certification_date`, which date the **record**, not
the licence. The technique's third comparison axis has no column to read.

**"Ask the candidate before concluding … the only step that can convert *not evidenced*
into a fact."** Sharpened. Of the 200 active individual providers returned by
`last_name=SMITH&state=CA`, **54 carry no licence number at all** in their primary
taxonomy (146/200 do); of those 146, **16 name a state other than the queried practice
state** (AZ 2, VA 2, CO 2, FL 2, NV 1, …) — the technique's reciprocity case, sitting in
the record as a plain field mismatch. And the licence field is **self-reported**: the Data
Dissemination page states the Registry contains data "as reported to NPPES by you, or by
someone acting on your behalf, or by an organization provider's Authorized Official", and
the organizational record shipped a live example — a Utah Medicaid identifier whose value
is the literal string `=========`. A register hit is not uniformly authority-verified: the
NPI is issued by the authority, the licence beside it is an assertion it republishes.

**"When multiple preconditions are unmet, emit them all."** A name query cannot tell you
how many there are. `result_count` reports **rows returned, not rows matched**: the SMITH
query returned exactly 200 — the documented `limit` ceiling — with no total anywhere.
Beyond 1,200 records over six requests the count is unobtainable, and the web Registry's
help page caps searches at "the first 2100 results". "Ambiguous" has no measurable size.

**The default that manufactures candidates.** `use_first_name_alias` is documented as
defaulting to **True**, matching similar given names. `first_name=Bob&last_name=Smith`
with `state=CA` returned **26** providers: 23 ROBERT, 3 BOBBY, **none named Bob**; the same
query with `use_first_name_alias=False` returned **0**. The register's default turns "no
such person" into twenty-six confident-looking candidates for an operator who never set
the flag.

## Findings the technique should carry

1. **A register's negative is a property of the query, not of the person.** The split
   between *determinate* outcomes (bad checksum, deactivated) and *inconclusive* ones
   (zero-result name search) is real in the world and **absent from the instrument**: one
   byte-identical answer for all of them. Determinacy must be manufactured outside the
   register — the checksum computed locally before the call, deactivation joined from a
   separate file. A gate reading state off the response cannot tell a typo from a revocation.
2. **State the state the register can answer, not the state you wanted.** This one answers
   *is this identifier currently listed* — not *is this person licensed*, *was it ever
   issued*, *is it current*, or *did you type it right*.
3. **A register answer has a shelf life, and it is measurable.** The monthly deactivation
   file holds **351,912** rows (all distinct; 2005-05-23 to 2026-08-09), of which **36,181**
   fall in the twelve months to 2026-08-10 and **2,643** in the trailing thirty days —
   about 99 a day leaving the active set. A cached *found active* decays at a quotable rate.
4. **Verification tier belongs to the field, not to the source.** Same response, two tiers:
   the NPI is authority-issued, the licence beside it self-asserted, and CMS says so twice.
5. **`Errors` at HTTP 200.** Every malformation, every unsupported version, every empty
   result returned 200. A client keying on transport status reads success throughout.
