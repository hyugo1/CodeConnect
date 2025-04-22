// src/__tests__/useCodeGenerator.extra.test.js
import { generateJavaScriptCode } from '../hooks/useCodeGenerator';

describe('generateJavaScriptCode – individual block types', () => {
  test('input block generates a prompt call', () => {
    const blocks = [
      { id: '1', data: { blockType: 'start' } },
      { id: '2', data: { blockType: 'input', varName: 'name', prompt: 'Enter your name' } },
      { id: '3', data: { blockType: 'end' } },
    ];
    const edges = [
      { source: '1', target: '2' },
      { source: '2', target: '3' },
    ];
    const code = generateJavaScriptCode(blocks, edges);
    expect(code).toContain(`var name = prompt("Enter your name");`);
  });

  test('adjustVariable generates the correct operator assignment', () => {
    const blocks = [
      { id: '1', data: { blockType: 'start' } },
      { id: '2', data: { blockType: 'createVariable', varName: 'x', varValue: '5', valueType: 'number' } },
      { id: '3', data: { blockType: 'adjustVariable', varName: 'x', varValue: '2', valueType: 'number', operator: '+' } },
      { id: '4', data: { blockType: 'end' } },
    ];
    const edges = [
      { source: '1', target: '2' },
      { source: '2', target: '3' },
      { source: '3', target: '4' },
    ];
    const code = generateJavaScriptCode(blocks, edges);
    expect(code).toContain(`var x = 5;`);
    expect(code).toContain(`x += 2;`);
  });

  test('output block emits console.log with template literal', () => {
    const blocks = [
      { id: '1', data: { blockType: 'start' } },
      { id: '2', data: { blockType: 'output', message: 'Hello, {name}!' } },
      { id: '3', data: { blockType: 'end' } },
    ];
    const edges = [
      { source: '1', target: '2' },
      { source: '2', target: '3' },
    ];
    const code = generateJavaScriptCode(blocks, edges);
    // {name} → ${name} inside a backtick
    expect(code).toContain('console.log(`Hello, ${name}!`);');
  });

  test('move block generates moveCharacter call', () => {
    const blocks = [
      { id: '1', data: { blockType: 'start' } },
      { id: '2', data: { blockType: 'move', direction: 'up', distance: 10 } },
      { id: '3', data: { blockType: 'end' } },
    ];
    const edges = [
      { source: '1', target: '2' },
      { source: '2', target: '3' },
    ];
    const code = generateJavaScriptCode(blocks, edges);
    expect(code).toContain(`moveCharacter(up, 10);`);
  });

  test('rotate block generates rotateCharacter call', () => {
    const blocks = [
      { id: '1', data: { blockType: 'start' } },
      { id: '2', data: { blockType: 'rotate', degrees: '90', rotateDirection: 'left' } },
      { id: '3', data: { blockType: 'end' } },
    ];
    const edges = [
      { source: '1', target: '2' },
      { source: '2', target: '3' },
    ];
    const code = generateJavaScriptCode(blocks, edges);
    expect(code).toContain(`rotateCharacter(-90);`);
  });
});

describe('generateJavaScriptCode – combined scenario', () => {
  test('full program: input, create/adjust, if/while, output, move, rotate', () => {
    const blocks = [
      { id: 's', data: { blockType: 'start' } },
      { id: 'i', data: { blockType: 'input', varName: 'n', prompt: 'Enter N' } },
      { id: 'c', data: { blockType: 'createVariable', varName: 'sum', varValue: '0', valueType: 'number' } },
      { id: 'w', data: { blockType: 'whileStart', leftOperand: 'n', operator: '>', rightOperand: '0' } },
      { id: 'a', data: { blockType: 'adjustVariable', varName: 'sum', varValue: 'n', valueType: 'number', operator: '+' } },
      { id: 'd', data: { blockType: 'adjustVariable', varName: 'n', varValue: '1', valueType: 'number', operator: '-' } },
      { id: 'x', data: { blockType: 'output', message: 'Sum is {sum}' } },
      { id: 'm', data: { blockType: 'move', direction: 'right', distance: 5 } },
      { id: 'r', data: { blockType: 'rotate', degrees: '45', rotateDirection: 'right' } },
      { id: 'e', data: { blockType: 'end' } },
    ];
    const edges = [
      { source: 's', target: 'i' },
      { source: 'i', target: 'c' },
      { source: 'c', target: 'w' },
      { source: 'w', target: 'a', sourceHandle: 'body-w' },
      { source: 'a', target: 'd' },
      { source: 'd', target: 'w' },
      { source: 'w', target: 'x', sourceHandle: 'exit-w' },
      { source: 'x', target: 'm' },
      { source: 'm', target: 'r' },
      { source: 'r', target: 'e' },
    ];
    const code = generateJavaScriptCode(blocks, edges).trim().split('\n');

    // spot‑check key lines in order
    expect(code).toEqual(expect.arrayContaining([
      'function runFlowchart() {',
      '  var n = prompt("Enter N");',
      '  var sum = 0;',
      '  while (n > 0) {',
      '    sum += n;',
      '    n -= 1;',
      '  }',
      '  console.log(`Sum is ${sum}`);',
      '  moveCharacter(right, 5);',
      '  rotateCharacter(45);',
      '  return;',
      '}'
    ]));
  });
});