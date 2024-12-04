// src/Components/CustomNode/CustomNode.js

import React from 'react';

import StartNode from './nodes/StartNode';
import EndNode from './nodes/EndNode';
import IfNode from './nodes/IfNode';
import WhileStartNode from './nodes/WhileStartNode';
import WhileEndNode from './nodes/WhileEndNode';
import PrintNode from './nodes/PrintNode';
import MoveNode from './nodes/MoveNode';
import AddNode from './nodes/AddNode';
import SubtractNode from './nodes/SubtractNode';
import MultiplyNode from './nodes/MultiplyNode';
import DivideNode from './nodes/DivideNode';
import SetVariableNode from './nodes/SetVariableNode';
import IncrementDecrementNode from './nodes/IncrementDecrementNode';
import DummyNode from './nodes/DummyNode';

const nodeMapping = {
  start: StartNode,
  end: EndNode, // Ensure 'end' is mapped to EndNode
  if: IfNode,
  whileStart: WhileStartNode,
  whileEnd: WhileEndNode,
  print: PrintNode,
  move: MoveNode,
  add: AddNode,
  subtract: SubtractNode,
  multiply: MultiplyNode,
  divide: DivideNode,
  setVariable: SetVariableNode,
  incrementDecrement: IncrementDecrementNode,
  dummy: DummyNode,
};

const CustomNode = ({ id, data, selected }) => {
  const SpecificNode = nodeMapping[data.nodeType];

  if (!SpecificNode) {
    // Fallback to a default node if nodeType is not recognized
    return (
      <div
        style={{
          padding: 10,
          border: '2px solid #777',
          borderRadius: 5,
          position: 'relative',
          minWidth: 180,
          textAlign: 'center',
          fontWeight: 'bold',
          backgroundColor: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
        className={selected ? 'selected' : ''}
      >
        <div>Unknown Node</div>
      </div>
    );
  }

  return <SpecificNode id={id} data={data} selected={selected} />;
};

export default CustomNode;