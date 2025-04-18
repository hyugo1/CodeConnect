// src/__tests__/useCodeGenerator.test.js
import { generateJavaScriptCode } from '../hooks/useCodeGenerator';

describe('generateJavaScriptCode', () => {
  test('generates code for start-end flow', () => {
    const blocks = [
      { id: '1', data: { blockType: 'start' } },
      { id: '2', data: { blockType: 'end' } },
    ];
    const edges = [{ source: '1', target: '2' }];
    const code = generateJavaScriptCode(blocks, edges);
    const expected = `function runFlowchart() {
  return;
}`;
    expect(code.trim()).toBe(expected);
  });

  test('generates code for setVariable block', () => {
    const blocks = [
      { id: '1', data: { blockType: 'start' } },
      { id: '2', data: { blockType: 'setVariable', varName: 'x', varValue: '10', valueType: 'number' } },
      { id: '3', data: { blockType: 'end' } },
    ];
    const edges = [
      { source: '1', target: '2' },
      { source: '2', target: '3' },
    ];
    const code = generateJavaScriptCode(blocks, edges);
    const expected = `function runFlowchart() {
  var x = 10;
  return;
}`;
    expect(code.trim()).toBe(expected);
  });

  test('generates code for if-then-else structure', () => {
    const blocks = [
      { id: '1', data: { blockType: 'start' } },
      { id: '2', data: { blockType: 'if', leftOperand: 'x', operator: '>', rightOperand: '5' } },
      { id: '3', data: { blockType: 'setVariable', varName: 'y', varValue: '1', valueType: 'number' } },
      { id: '4', data: { blockType: 'setVariable', varName: 'y', varValue: '0', valueType: 'number' } },
      { id: '5', data: { blockType: 'end' } },
    ];
    const edges = [
      { source: '1', target: '2' },
      { source: '2', target: '3', sourceHandle: 'yes-2' },
      { source: '2', target: '4', sourceHandle: 'no-2' },
      { source: '3', target: '5' },
      { source: '4', target: '5' },
    ];
    const code = generateJavaScriptCode(blocks, edges).trim();
    const expected =
`function runFlowchart() {
  if (x > 5) {
    var y = 1;
    return;
  } else {
    var y = 0;
    return;
  }
}`;
    expect(code).toBe(expected);
  });

  test('generates code for while loop', () => {
    const blocks = [
      { id: '1', data: { blockType: 'start' } },
      { id: '2', data: { blockType: 'whileStart', leftOperand: 'i', operator: '<', rightOperand: '3' } },
      { id: '3', data: { blockType: 'adjustVariable', varName: 'i', varValue: '1', valueType: 'number', operator: '+' } },
      { id: '4', data: { blockType: 'end' } },
    ];
    const edges = [
      { source: '1', target: '2' },
      { source: '2', target: '3', sourceHandle: 'body-2' },
      { source: '3', target: '2' },
      { source: '2', target: '4', sourceHandle: 'exit-2' },
    ];
    const code = generateJavaScriptCode(blocks, edges).trim();
    const expected =
`function runFlowchart() {
  while (i < 3) {
    i += 1;
  }
  return;
}`;
    expect(code).toBe(expected);
  });

  test('returns error comment when no start block', () => {
    const blocks = [{ id: '1', data: { blockType: 'end' } }];
    const edges = [];
    const code = generateJavaScriptCode(blocks, edges).trim();
    expect(code).toBe('// Error: No start block found.');
  });

  // Integration tests: generate code, run it, and verify console output
  test('program: sums two variables and prints result', () => {
    const blocks = [
      { id: '1', data: { blockType: 'start' } },
      { id: '2', data: { blockType: 'setVariable', varName: 'x', varValue: '5', valueType: 'number' } },
      { id: '3', data: { blockType: 'setVariable', varName: 'y', varValue: '3', valueType: 'number' } },
      { id: '4', data: { blockType: 'setVariable', varName: 'z', varValue: 'x + y', valueType: 'number' } },
      { id: '5', data: { blockType: 'print', message: '${z}' } },
      { id: '6', data: { blockType: 'end' } },
    ];
    const edges = [
      { source: '1', target: '2' },
      { source: '2', target: '3' },
      { source: '3', target: '4' },
      { source: '4', target: '5' },
      { source: '5', target: '6' },
    ];
    const code = generateJavaScriptCode(blocks, edges);
    const consoleMock = { log: jest.fn() };
    // Fix: concatenate with '\nreturn runFlowchart;'
    const runFlowchart = new Function('console', code + '\nreturn runFlowchart;')(consoleMock);
    runFlowchart();
    expect(consoleMock.log).toHaveBeenCalledWith('8');
  });

  test('program: print numbers in while loop', () => {
    const blocks = [
      { id: '1', data: { blockType: 'start' } },
      { id: '2', data: { blockType: 'setVariable', varName: 'i', varValue: '0', valueType: 'number' } },
      { id: '3', data: { blockType: 'setVariable', varName: 'limit', varValue: '3', valueType: 'number' } },
      { id: '4', data: { blockType: 'whileStart', leftOperand: 'i', operator: '<', rightOperand: 'limit' } },
      { id: '5', data: { blockType: 'print', message: '${i}' } },
      { id: '6', data: { blockType: 'adjustVariable', varName: 'i', varValue: '1', valueType: 'number', operator: '+' } },
      { id: '7', data: { blockType: 'end' } },
    ];
    const edges = [
      { source: '1', target: '2' },
      { source: '2', target: '3' },
      { source: '3', target: '4' },
      { source: '4', target: '5', sourceHandle: 'body-4' },
      { source: '5', target: '6' },
      { source: '6', target: '4' },
      { source: '4', target: '7', sourceHandle: 'exit-4' },
    ];
    const code = generateJavaScriptCode(blocks, edges);
    const consoleMock = { log: jest.fn() };
    const runFlowchart = new Function('console', code + '\nreturn runFlowchart;')(consoleMock);
    runFlowchart();
    expect(consoleMock.log.mock.calls.map(call => call[0])).toEqual(['0', '1', '2']);
  });
});