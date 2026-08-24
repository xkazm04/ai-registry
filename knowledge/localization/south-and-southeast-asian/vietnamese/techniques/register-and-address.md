---
layer: technique
type: technique
subject: vietnamese
technique: register-and-address
status: forged
laws: [every-finding-cites-an-anchor]
shared_with: []
use_when: [deciding how a product addresses the Vietnamese user, reviewing pronoun and register choices in a vi catalog, writing button labels and imperatives in Vietnamese]
---

# Register & address

Vietnamese carries register entirely in person-reference — there is no formal verb
conjugation to fall back on, the way French or German localizers lean on vous/Sie.
Every string that mentions the user, the product, or a third party makes a register
claim through the word it picks, and the system below is the settled resolution for
software addressed to a single unknown operator. The rules carry identifiers so an
audit finding can cite them by name.

## VI-BAN · the user is bạn

**Trigger:** any string that needs a second-person reference.
**Rule:** use bạn, and only bạn. Never the kinship terms anh / chị / em / cô / chú /
bác / ông / bà (each asserts the user's age and gender relative to the product —
a claim no product can make); never mày / cậu (intimate register, insulting from
software); quý khách only in a deliberate service-voice product where the decision
is recorded, because it casts every string as vendor-to-customer ceremony.
**Source:** Microsoft Vietnamese style guide — its examples use bạn throughout, and
its bias-free-language section explicitly rewrites gendered generic references into
bạn or a role noun.
**Exception:** marketing or support surfaces owned outside the catalog may address a
known segment as anh/chị; the UI catalog does not follow them. Consistency within
the catalog is the anchor — a single anh/chị string amid bạn is a defect even
though it is polite Vietnamese.

## VI-IMPERATIVE · commands drop the pronoun

**Trigger:** button labels, menu commands, short instructions.
**Rule:** bare imperative verb, no subject, no softener: Lưu, Hủy, Đóng, Xóa, Sửa.
Do not write Bạn hãy lưu or Hãy lưu for a Save button — hãy is an exhortation
particle that turns a control into a moral encouragement. In running instructional
prose ("click X to do Y"), the imperative likewise stands bare: Chọn mạng có sẵn…,
as Microsoft's own dialog examples show.
**Exception:** onboarding or empty-state copy that is genuinely conversational may
use hãy for warmth — one register decision for that surface, recorded, not
per-string taste.

## VI-SELF · the product says chúng tôi, or nothing

**Trigger:** strings where the product speaks about itself ("we couldn't save your
file", "we recommend…").
**Rule:** first person plural chúng tôi — the exclusive "we" (speaker without
listener), which is exactly the product-team-to-user relationship. Never tôi (a
singular first-person character the product cannot sustain), never chúng ta (inclusive "we",
which claims the user is part of the team — reserve it for genuinely joint
framing, "let's get you set up", used sparingly and deliberately). Prefer no
subject at all where Vietnamese allows it: Không thể lưu tệp ("could not save the
file") is more idiomatic than a chúng tôi sentence for plain status.
**Source:** Microsoft Vietnamese style guide, pronouns section (chúng tôi = we,
chúng ta = we + audience).

## VI-GENDERED · no gendered or hierarchical reference to third parties

**Trigger:** strings about a generic third person — "the user", "a member", "the
admin can…".
**Rule:** use a role noun (người dùng, quản trị viên, thành viên, khách hàng) or
người đó ("that person"); never anh ta / cô ta / ông / bà for a person whose
gender is unknown, and never a plural-marker workaround that changes the meaning.
When generalizing, prefer the plural (họ, các bạn) — Vietnamese third-person
singular pronouns are all marked for gender or disrespect, so the role noun is
not just the inclusive choice but the only neutral one available.
**Source:** Microsoft Vietnamese style guide, bias-free communication section,
which lists exactly this rewrite ladder.

## When not to apply this system

A product with a designed voice character — a companion app that deliberately speaks as em
to an audience that opted in, a children's product where the software plausibly is
the older sibling — may run a different register system. That is a product-voice
decision that lives in the consuming repo, recorded as an explicit overruling of
VI-BAN, per [the authority is a hypothesis until counted](../../../_laws.md#the-authority-is-a-hypothesis).
What is never legitimate is an *unrecorded* mixture: register in Vietnamese is a
system, and two registers in one catalog reads as two products.
