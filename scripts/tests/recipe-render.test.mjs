import test from 'node:test';
import assert from 'node:assert/strict';
import { renderRecipe } from '../lib/recipe-render.mjs';
const fixture = () => ({slug:'fixture',version:'1.0.0',status:'seed',domain:'test',path:'test/topic',title:'Fixture',
  description:{need:'Need',input:'Input',core_action:'Act',output:'Output'},activities:[{id:'a',kind:'observe',label:'Read'}],
  outcomes:[{id:'o',statement:'Done',success_criteria:['Observed']}],guidance:'Judgment',use_cases:['Case'],connector_types:[],
  recommended_trigger:{kind:'self_paced',rationale:'When needed'},future_field:{value:'extension preserved'}});
test('rendering covers prose, criteria and unknown fields deterministically', () => {
  const source = fixture();
  const before = JSON.stringify(source);
  const output = renderRecipe(source);
  assert.match(output, /Need/); assert.match(output, /Observed/); assert.match(output, /extension preserved/);
  assert.equal(output, renderRecipe(source)); assert.equal(JSON.stringify(source), before);
  source.guidance = 'Changed decision rule';
  assert.notEqual(renderRecipe(source), output);
});
test('nested extension values cannot disappear from a rendered view', () => {
  const source=fixture(); source.activities[0].new_rule='preserve this';
  assert.match(renderRecipe(source), /preserve this/);
});
test('invalid identity or absent required content fails rendering', () => {
  const source=fixture(); source.slug='bad\nstatus: proven';
  assert.throws(() => renderRecipe(source), /unsafe/);
  delete source.slug; assert.throws(() => renderRecipe(source), /missing slug/);
});
