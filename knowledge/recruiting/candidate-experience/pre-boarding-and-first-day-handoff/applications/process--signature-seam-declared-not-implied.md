---
layer: application
type: application
subject: pre-boarding-and-first-day-handoff
technique: signature-seam-declared-not-implied
stack: process
status: forged
verified_on: 2026-09-29
refresh_by: 2027-03-29
---

# Statutory form is per clause, not per contract — anchors read on 2026-09-29

The technique's decision rule used to say a qualified signature is required for
"employment contracts in some jurisdictions". Tested against the statutes it names,
that sentence is wrong in the direction that matters: it sends a team to build a
qualified-signature route for the whole contract where the law asks for form on one
clause, and it lets the same team ship an internal stamp where a specific document
needs more. What follows is what each regime actually says, with how it was read. It is
a map, not legal advice, and the refresh clock is six months.

## Germany: form attaches to specific clauses and acts

- **A fixed-term clause.** TzBfG §14(4), read from the statute site: *"Die Befristung
  eines Arbeitsvertrages bedarf zu ihrer Wirksamkeit der Schriftform."* Only the term
  clause needs the form, not the contract. The consequence, §16: an ineffective term
  means the contract is treated as open-ended, and where the form alone is the defect the
  open-ended contract can still be ended by ordinary notice before the agreed end.
- **A qualified signature can stand in.** BGB §126(3) lets electronic form replace
  written form unless the law says otherwise, and §126a requires a qualified electronic
  signature. §14(4) contains no exclusion. A Berlin labour court (28.09.2021, 36 Ca
  15296/20) treated a non-qualified e-signature as failing the fixed-term form, so the
  contract was open-ended; it left open whether a qualified one would work. That case was
  read only through secondary summaries, and a second decision cited by one vendor blog
  was not confirmed and should not be relied on.
- **Termination is excluded outright.** BGB §623: notice or a termination agreement
  needs written form, "die elektronische Form ist ausgeschlossen". A qualified signature
  does not help.
- **The statement of terms is now text-form, with conditions.** NachwG §2(1) as amended
  (in force 2025-01-01): the record may be in text form and sent electronically if the
  employee can access, store and print it and is asked for a receipt. The employee can
  demand a signed paper original, and the text-form route does not apply in the sectors
  listed in §2a of the undeclared-work statute. The general rule for an ordinary
  open-ended contract is therefore *not* a qualified signature.
- **Two neighbours found on the way**: the employee-invention notice is "in text form"
  (ArbnErfG §5(1)), which argues against fearing a portal for it; a post-employment
  non-compete needs a signed instrument handed over (HGB §74(1)), and whether a qualified
  signature satisfies it was not checked.

## Czech Republic: the pre-boarding surface can fail on delivery, not on signature

- The ministry handbook says a contract may be concluded through electronic
  communications and that "k jejímu uzavření není nezbytný uznávaný či kvalifikovaný
  elektronický podpis"; it must be signed no later than the day of starting work. A
  contract not in writing is void, but once work has begun the invalidity cannot be
  invoked (§20).
- Act 281/2023 (in force 2023-10-01) added a delivery duty (§21): the employer sends the
  copy to an e-mail address of the employee that is *not* in the employer's control and
  that the employee gave in writing for the purpose, and the employee may withdraw within
  seven days of delivery until they have started performing. Read from a secondary
  reproduction of the text; verify before building on the wording. The consequence for a
  pre-boarding portal is concrete: a copy the person can only reach inside the
  employer's own portal does not, on that reading, satisfy the duty.
- Recognised electronic signatures are still reported as needed for unilateral
  termination documents (secondary sources; §334 not read).

## The general layer

- **EU.** eIDAS Art. 25(1): an electronic signature "shall not be denied legal effect and
  admissibility as evidence in legal proceedings solely on the grounds that it is in an
  electronic form or that it does not meet the requirements for qualified electronic
  signatures"; 25(2): a qualified one has the effect of a handwritten signature.
  Regulation (EU) 2024/1183 (in force 2024-05-20 by the lane's computation) restates that
  the regulation "does not affect Union or national law related to the conclusion and
  validity of contracts, other legal or procedural obligations relating to form" — which
  is exactly the door the German and Czech rules walk through. So the audit-stamped
  acknowledgement keeps legal effect and admissibility; what is uncertain is weight, which
  is what the technique already says ("real but jurisdiction-dependent").
- **United States.** 15 USC §7001(a): a signature or contract "may not be denied legal
  effect, validity, or enforceability solely because it is in electronic form". The
  listed exceptions (§7003) are wills, family law and parts of the commercial code, court
  and notice documents; employment contracts are not on them (read from a summary). Whether
  the consumer-consent rule reaches an employee was not tested.
- **United Kingdom.** The written statement of particulars (ERA 1996 s.1) has no
  signature or electronic-form requirement in its text; the Law Commission's statement is
  that an e-signature can execute a document where the signer intends to authenticate it.
  Changes under the 2025 Act were not checked.

## What was not found

No primary source says an authenticated-portal acknowledgement is *insufficient* for a
non-disclosure agreement or an invention assignment in any of the regimes checked.
