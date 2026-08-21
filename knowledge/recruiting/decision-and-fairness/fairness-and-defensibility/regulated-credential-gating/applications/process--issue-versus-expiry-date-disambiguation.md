---
layer: application
type: application
subject: regulated-credential-gating
technique: issue-versus-expiry-date-disambiguation
stack: process
verified_on: 2026-08-20
---

# Two dates on one line, fixed twice by an incident

`pipeline/jobfit/credentials.py` carries the date-role problem and its two production
fixes, both traced to the same scan (`bug-ui-scan-2026-07-09`, item #5) and both pinned
by tests. It is the clearest worked example in the repo of a parsing detail that inverts
a legal verdict.

## The schema admits the ambiguity out loud

`Credential.expiry` (`pipeline/jobfit/models.py:22`) is a bare string commented
`# expiry / issue date if stated`. The field does not know which date it holds. The
module docstring turns that into the scoping argument: "the schema's `expiry` field may
hold an ISSUE date rather than an expiry, so flagging every past date would be noise —
bounding it to genuine hard-gate licences keeps the false-positive cost to a recruiter's
glance" (`credentials.py:16-19`). Scoping as blast-radius control, exactly as the
standard states it.

## Fix one: the later year is the expiry

`_parse_past` (`credentials.py:68-88`) extracts *all* years with
`_YEAR_RE.findall` and takes `max(years)`. The comment records the bug it replaces:

> Two years in one string (e.g. "Issued 2020, expires 2028") → the LATER one is the
> expiry. Take the max, not `re.search`'s FIRST match, which read the issue year and
> false-flagged a still-current licence as expired.

That is the standard's issue-read-as-expiry inversion, observed in production: the
pre-fix code took the first year it saw, which on the overwhelmingly common
"issued …, expires …" ordering is always the issue date. Pinned by
`test_two_year_expiry_uses_later_year_not_issue` (`tests/test_credentials.py:45-53`),
with `test_two_year_expiry_both_past_is_flagged` guarding that the fix did not disarm
the check when both years are genuinely past.

## Fix two: a month must be adjacent to its year

When the maximum year equals the current year, the verdict turns on a month.
`_month_for_year` (`credentials.py:57-67`) accepts a one-to-twelve value **only** when
it sits directly beside that year — `YYYY-MM` / `YYYY/MM` or `MM-YYYY` / `MM/YYYY` —
and is documented as "Deliberately NOT 'any 1-12 number in the string': a stray day or
an id (e.g. `'cert #3'`) must not be read as a month."

`test_same_year_stray_number_is_not_read_as_month`
(`tests/test_credentials.py:61-67`) records the original failure: an expiry of
`"2026 renewal, cert #3"` matched the certificate number `3`, compared it against
today's month `6`, and flagged a current licence as lapsed.
`test_same_year_earlier_month_still_flagged` holds the other side.

## The conservative branches

Three paths return "not past" rather than guessing, which is the standard's
resolve-toward-the-candidate rule realized as control flow: an empty string
(`credentials.py:72`), a string with no recognisable year (`:75-76`), and a same-year
string with no month adjacent to that year (`:87-88`, "no adjacent month → conservative
don't-flag, honoring the module's 'false positives to a glance' promise"). The year
regex itself is bounded to a plausible window rather than matching any four digits, so
a postcode or an identifier does not become a year.

## Where the repo falls short of the standard

- **Conservative silence is not an undetermined state.** All three branches return the
  same boolean `False` as a genuinely current licence. The standard requires
  *undetermined* to be its own value that still caps a favourable verdict on a required
  regulated credential; here an ambiguous date and a valid future date are
  indistinguishable downstream, so an unparseable required licence reads as fine.
- **No label reading.** The rules are purely positional and numeric — nothing consults
  the words "issued", "expires", "valid to" that surround the dates, even though the
  test corpus contains them. Explicit labels are the standard's first and most reliable
  rule and would settle the common cases before any max-of-years heuristic runs.
- **Day-level precision is unavailable**, and a bare year is treated as the whole year
  (only `year < today.year` flags), which matches the standard's "current through the
  end of that year" rule by construction rather than by decision.
- **Only one date is retained.** The record has a single `expiry` string, so an
  extraction that saw both an issue and an expiry cannot store them separately — the
  disambiguation is re-run, on prose, at every read.
