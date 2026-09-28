---
layer: application
type: application
subject: candidate-status-transparency
technique: candidate-safe-status-projection
stack: spec
status: forged
verified_on: 2026-09-28
refresh_by: 2027-03-28
source: W3C/TAG-capability-urls-2014+OWASP/query-string-exposure+UK-ICO/subject-access-guide+EU/GDPR-Art15
---

# The status link as a capability URL, and what it is not

**Pin.** Retrieved 2026-09-28 and matched verbatim. The web guidance is old and
stable. The data-protection guidance is revised from time to time, so the
clock is six months.

## Where a secret-bearing address escapes

- **W3C Technical Architecture Group, "Good Practices for Capability URLs"
  (TAG Finding, 2014).** It endorses the pattern and lists its conditions:
  "Capability URLs should expire"; a random part of "120 bits or more" of
  entropy; https only; pages "should not include untrusted third-party
  scripts"; managed referrers where the page links out; exclusion from
  crawlers; and a way for the owner to revoke a link. It names where such
  URLs are exposed, including that they "appear in plain text within
  application logs, such as within web servers and in browser history".
- **OWASP, "Information exposure through query strings in URL":** the exposure
  points include the "Referer Header", web logs, shared systems,
  "Browser History" and the browser cache.

The technique's new decision rule takes the hiring-relevant subset: no
third-party script, no referrer, out of indexes, revocable and reissuable.
Expiry is held back on purpose. The golden path's page is left open for weeks
and consulted until the outcome, so a hard expiry trades one failure for
another. Revocation and reissue carry the protection instead, and retention
bounds the life of the link.

## A status view is not an access request answer

- **GDPR Art. 15(3):** "The controller shall provide a copy of the personal
  data undergoing processing."
- **UK ICO, "A guide to subject access":** "You could satisfy the requirement
  to comply with a SAR by giving the person remote access to their information
  on a secure system. If you do this, you must make sure that they can
  download a copy of the requested information".

A lossy, public-safe projection cannot be that copy, by design. The
technique's "when NOT to use it" says the same, and now cites the guidance.
