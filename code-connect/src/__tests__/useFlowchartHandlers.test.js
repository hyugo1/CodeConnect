// src/__tests__/useFlowchartHandlers.test.js
import { renderHook, act } from '@testing-library/react';
import useFlowchartHandlers from '../Components/useFlowchartHandlers';
import { MarkerType } from 'reactflow';

jest.mock('uuid', () => ({ v4: () => 'test-uuid' }));

describe('useFlowchartHandlers', () => {
  let edges;
  let setEdges;

  beforeEach(() => {
    edges = [];
    setEdges = jest.fn((updateFn) => {
      edges = updateFn(edges);
    });
  });

  test('onConnect adds a True edge with green style for yes handle', () => {
    const { result } = renderHook(() =>
      useFlowchartHandlers({ setEdges })
    );
    act(() => {
      result.current.onConnect({ source: 'a', target: 'b', sourceHandle: 'yes-a' });
    });
    expect(edges).toHaveLength(1);
    expect(edges[0]).toMatchObject({
      source: 'a',
      target: 'b',
      label: 'True',
      style: { stroke: 'green', strokeWidth: 3 },
      markerEnd: { type: MarkerType.ArrowClosed },
      animated: false,
      id: 'test-uuid',
    });
  });

  test('onConnect adds a False edge with red style for no handle', () => {
    const { result } = renderHook(() =>
      useFlowchartHandlers({ setEdges })
    );
    act(() => {
      result.current.onConnect({ source: 'x', target: 'y', sourceHandle: 'no-x' });
    });
    expect(edges).toHaveLength(1);
    expect(edges[0]).toMatchObject({
      label: 'False',
      style: { stroke: 'red', strokeWidth: 3 },
    });
  });

  test('onConnect adds an unlabeled edge for other handles', () => {
    const { result } = renderHook(() =>
      useFlowchartHandlers({ setEdges })
    );
    act(() => {
      result.current.onConnect({ source: '1', target: '2', sourceHandle: 'other-1' });
    });
    expect(edges).toHaveLength(1);
    expect(edges[0].label).toBe('');
    expect(edges[0].style).toMatchObject({ stroke: '#555', strokeWidth: 3 });
  });
});


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
});
