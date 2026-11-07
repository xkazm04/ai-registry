---
layer: technique
type: technique
subject: eval-harness
technique: green-through-the-model
status: forged
applied: experiment
ab_verdict: better
laws: [gate-sees-target, count-carries-predicate]
shared_with: []
use_when: [an acceptance case runs through an agent that calls a tool, deciding what an end-to-end pass through a model proves about the tool beneath it, a tool description tells the model to pass the text unchanged, a tool parses what a person wrote and an agent sits in front of it]
---

# A green through the model says nothing about the tool

An end-to-end pass through an agent includes the model's ability to work around what is
beneath it. Collect the case through the agent and the tool called directly on the same raw
text, as one unit, and treat a disagreement as the defect standing. An instruction in the
description to pass raw text does not remove this. It does not replace the end-to-end run.

The gate here reads the agent's result while the target is the tool
([gate-sees-target](../../../../_laws.md#gate-sees-target)). Neither arm alone reads both.

## What the pair compares

- **Results, not arguments.** The disagreement is that the agent arm returned something and
  the direct arm returned nothing. A rewritten argument is not the defect by itself: on six
  control runs with a healthy tool, the first call differed from the raw text in three, and
  both arms returned the product in all six.
- **Every call in the run.** A retry after an empty raw call is the same hiding. Reading only
  the first call misses it.
- **The same function.** Both arms reach one implementation, with the raw text as the case
  recorded it. Keep the arguments the model sent byte for byte, since they are the evidence
  of what it worked around.

## The measurement and its limits

One run of `qwen3.8:27b` through Ollama 0.40.6, `think:false`, default temperature. A
catalogue of 8 invented products, and a search tool with one planted defect: a number in the
query that a product's name lacks drops that product. The description told the model to pass
what the person wrote, exactly as written. Ten customer sentences carried a quantity or a
budget number no product has, three runs each, and the direct call returned nothing on all
ten.

Through the model, **21 of 30 runs were compensated greens**: the arguments differed from the
raw text, a product came back, and the direct arm on that text was empty. 19 of those came on
the first call and 2 on a retry. 3 of the 30 passed raw text on all calls. In the other 9 the
model called the tool and got nothing, so there the end-to-end run saw the defect itself. The
tool was called in 6 of 6 control runs.

Read those counts with their predicate
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)):

- 2 of the 21 rest on a plural normalisation in the tool, fixed before measuring. Without it
  the count is 19. These are not the same 2 as the retries.
- The sentence that first described the defect scored 0 of 3. It kept its number in every
  run, so a single example sentence is a poor probe of this.
- One model, thinking off, one wording of the description, an invented catalogue. This is
  attributed to this model. It gives no rate for any other model, and it says nothing about
  whether a model would rewrite on a real catalogue.
