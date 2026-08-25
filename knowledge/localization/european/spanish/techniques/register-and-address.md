---
layer: technique
type: technique
subject: spanish
technique: register-and-address
status: forged
laws: [the-authority-is-a-hypothesis, every-finding-cites-an-anchor]
shared_with: []
use_when: [choosing tú or usted for a product, auditing a catalog for register drift, writing imperatives and possessives in Spanish strings]
---

# Register and address

Spanish second person is a three-way system — *tú*, *usted*, *vos* — collapsed, per
product, to one recorded choice. Everything in this technique follows from two
mechanics: the verb ending carries the register (so most strings mark it invisibly),
and the bare infinitive carries none (so action labels are register-immune).

## ES-REGISTER · one register, chosen once, recorded

A product ships exactly one address register for Spanish, decided before
translation starts and written down where translators will find it. The decision
rule: consumer and lifestyle products default to *tú* — the direction major
vendors' published Spanish style guides have moved their consumer voice — while
professional, operator, financial, medical, and government-facing products default
to *usted*. Neither is "correct Spanish"; what is incorrect is deciding per-string.
Before enforcing the recorded register on an existing catalog, count what the
catalog actually does — a coherent catalog that contradicts the record means the
record gets corrected or a migration gets scheduled, never a silent mid-file flip.

**Source:** the register split is documented per-variant in the major OS vendors'
published Spanish localization style guides; the choice among them is the
product's.

## ES-VOS · voseo is a deliberate regional voice, never a default

*Vos* with its own imperatives (*guardá*, *elegí*, *escribí*) is standard in
Argentina and Uruguay and common in Central America. A product shipping one Spanish
never uses it: it is strongly marked outside its region, and a single-Spanish
catalog must read unmarked everywhere. Use voseo only in a dedicated regional
build whose brief explicitly asks for an Argentine voice — and then consistently,
including the distinct imperative morphology, because half-voseo (*vos* pronouns
with *tú* verbs) reads as error in exactly the market it targets.

## ES-USTEDES · second-person plural is always ustedes in one-Spanish products

*Vosotros* and its forms (*guardáis*, *vuestro*) are Peninsular-only; *ustedes* is
universal — Spain reads it as slightly formal, Latin America as the only plural
"you" that exists. A one-Spanish product always writes *ustedes* + third-person
plural verb, regardless of whether its singular register is *tú* or *usted*. This
is the one register cell where neutrality has a single right answer rather than a
choice.

## ES-PRODROP · the verb ending marks the register; the pronoun does not appear

Spanish is pro-drop: *Guarde los cambios* is fully formal, *Guarda los cambios*
fully informal, and inserting the pronoun (*Guarde usted los cambios*) is not
extra-correct — it reads stilted, patronizing, and costs length a button does not
have. Write the pronoun only for genuine contrast or emphasis, which UI copy
almost never needs. The audit corollary: register is detected from verb endings,
possessives (*tu/su*), and object pronouns (*te/le*), not from searching for the
pronouns *tú*/*usted*, which a correct catalog barely contains.

## ES-REGISTER-MIX · drift is a defect even though every string is correct

Catalogs translated by many hands across years end up mixed — onboarding in *tú*,
settings in *usted* — and every individual string parses fine, which is why drift
survives review. Treat register as a catalog-level invariant: an audit pass greps
for the marked forms of the *wrong* register (informal imperatives, *tu/tus*,
*te*, reflexive *-te* commands under an *usted* product; *su/sus*, *le*, *-se*
commands under a *tú* product) and types each hit against this rule. When legacy
drift is widespread, the recorded policy states the migration posture — fix
opportunistically on touch, or bulk-migrate — so individual translators stop
re-deciding it. New strings always follow the recorded register, even inside a
file full of legacy ones: matching the neighborhood instead of the record is how
drift reproduces.

## ES-INFINITIVE-NEUTRAL · the infinitive is the register-safe zone

Bare infinitives on action controls (*Guardar*, *Cancelar*, *Eliminar*) commit to
no register, which has two practical consequences. First, a register migration
only touches conjugated sentences and possessives — buttons survive unchanged, so
scope the migration by grepping for conjugation, not by re-reading every string.
Second, when a string's register is genuinely undecidable (shared copy, legal
text pending a ruling), recasting into infinitive or noun phrases parks it safely
on either side of the decision. The boundary with ui-conventions-and-length's
control-labeling rule: that rule decides *when* infinitive vs imperative; this one
notes only the register consequence.

## When not to apply

Register rules govern address to the *user*. Strings quoting a third party,
narrating system state (*"El agente completó la tarea"*), or naming things have no
second person and no register to audit — flagging them wastes review budget.
Marketing surfaces owned outside the catalog may legitimately run a warmer
register than the product UI; that is a recorded exception, not drift.
