// src/Components/CustomNode/nodes/WhileEndNode.js

import React from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { FaSync } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import './node.css';

const handleStyle = { background: '#555' };
const DownLineStyle = {
  position: 'absolute',
  width: 3,
  backgroundColor: '#555',
  top: '100%',
  left: '50%',
  height: 50,
  transform: 'translateX(-50%)',
  zIndex: -1,
};
const loopBackLineStyle = {
  position: 'absolute',
  top: '57.5%',
  right: '-25px',
  width: 50,
  height: 3,
  backgroundColor: '#555',
  transform: 'translateY(-50%)',
  zIndex: -1,
};
const conditionStyle = {
  display: 'flex',
  alignItems: 'center',
  marginTop: 10,
};
const inputStyle = {
  flex: 1,
  padding: '5px',
  borderRadius: '3px',
  border: '1px solid #ccc',
  fontSize: '12px',
  marginRight: '5px',
};
const selectStyle = {
  padding: '5px',
  borderRadius: '3px',
  border: '1px solid #ccc',
  fontSize: '12px',
  marginRight: '5px',
};

const WhileEndNode = ({ id, data, selected }) => {
  const { setNodes } = useReactFlow();

  const handleLeftOperandChange = (e) => {
    const newLeftOperand = e.target.value;
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              leftOperand: newLeftOperand,
            },
          };
        }
        return node;
      })
    );
  };

  const handleOperatorChange = (e) => {
    const newOperator = e.target.value;
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              operator: newOperator,
            },
          };
        }
        return node;
      })
    );
  };

  const handleRightOperandChange = (e) => {
    const newRightOperand = e.target.value;
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              rightOperand: newRightOperand,
            },
          };
        }
        return node;
      })
    );
  };

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
        backgroundColor: '#f9f7d8',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      className={selected ? 'selected' : ''}
    >
      <FaSync style={{ marginBottom: 5 }} />
      <div>{data.label}</div>
      <Handle
        type="target"
        position={Position.Top}
        id={`target-${id}`}
        className="handle-target-circle"
        style={{ left: '50%', top: '0px', ...handleStyle }}
        data-tooltip-id={`tooltip-${id}-target`}
        data-tooltip-content="Connect from another node"
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id={`source-${id}`}
        className="handle-source-square"
        style={{ left: '50%', top: '93%', ...handleStyle }}
        data-tooltip-id={`tooltip-${id}-source`}
        data-tooltip-content="Connect to the next node if the loop condition ends"
        isConnectable={true}
      />
      {/* Loop Back Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id={`loopBack-${id}`}
        className="handle-source-square"
        style={{ left: '100%', top: '50%', ...handleStyle }}
        data-tooltip-id={`tooltip-${id}-loopBack`}
        data-tooltip-content="Loop back to While Start"
        isConnectable={true}
      />
      {/* Tooltips */}
      <Tooltip id={`tooltip-${id}-target`} place="top" />
      <Tooltip id={`tooltip-${id}-source`} place="top" />
      <Tooltip id={`tooltip-${id}-loopBack`} place="top" />
      {/* Condition Inputs */}
      <div style={conditionStyle}>
        <input
          type="text"
          placeholder="Left Operand"
          value={data.leftOperand || ''}
          onChange={handleLeftOperandChange}
          style={inputStyle}
        />
        <select
          value={data.operator || ''}
          onChange={handleOperatorChange}
          style={selectStyle}
        >
          <option value="">Op</option>
          <option value="<">&lt;</option>
          <option value=">">&gt;</option>
          <option value="==">==</option>
          <option value="!=">!=</option>
          <option value="<=">&lt;=</option>
          <option value=">=">&gt;=</option>
        </select>
        <input
          type="text"
          placeholder="Right Operand"
          value={data.rightOperand || ''}
          onChange={handleRightOperandChange}
          style={inputStyle}
        />
      </div>
      {/* Branch Lines */}
      <div style={DownLineStyle}></div>
      <div style={loopBackLineStyle}></div>
    </div>
  );
};

export default WhileEndNode;