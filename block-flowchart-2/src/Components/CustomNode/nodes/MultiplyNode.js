// src/Components/CustomNode/nodes/MultiplyNode.js

import React from 'react';
import { Handle, Position } from 'reactflow';
import { FaTimes } from 'react-icons/fa';
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
const mathStyle = {
  width: '100%',
  marginTop: 10,
  padding: '5px',
  borderRadius: '3px',
  border: '1px solid #ccc',
  fontSize: '12px',
  boxSizing: 'border-box',
};

const MultiplyNode = ({ id, data, selected }) => {
  const handleOperand1Change = (e) => {
    data.onChange(id, data.label, data.action, data.message, data.distance, data.direction, e.target.value, data.operand2, data.resultVar);
  };

  const handleOperand2Change = (e) => {
    data.onChange(id, data.label, data.action, data.message, data.distance, data.direction, data.operand1, e.target.value, data.resultVar);
  };

  const handleResultVarChange = (e) => {
    data.onChange(id, data.label, data.action, data.message, data.distance, data.direction, data.operand1, data.operand2, e.target.value);
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
        backgroundColor: '#f9d8f9',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      className={selected ? 'selected' : ''}
    >
      <FaTimes style={{ marginBottom: 5 }} />
      <div>{data.label}</div>
      <Handle
        type="target"
        position={Position.Top}
        id={`target-${id}`}
        className="handle-target-circle"
        style={{left: '50%', top: '0px', ...handleStyle}}
        data-tooltip-id={`tooltip-${id}-target`}
        data-tooltip-content="Connect from another node"
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id={`source-${id}`}
        className="handle-source-square"
        style={{ left: '50%', top: '90%', ...handleStyle }}
        data-tooltip-id={`tooltip-${id}-source`}
        data-tooltip-content="Connect to another node"
        isConnectable={true}
      />
      <Tooltip id={`tooltip-${id}-target`} place="top" />
      <Tooltip id={`tooltip-${id}-source`} place="top" />
      <input
        type="text"
        placeholder="Operand 1"
        value={data.operand1}
        onChange={handleOperand1Change}
        style={mathStyle}
      />
      <input
        type="text"
        placeholder="Operand 2"
        value={data.operand2}
        onChange={handleOperand2Change}
        style={mathStyle}
      />
      <input
        type="text"
        placeholder="Result Variable"
        value={data.resultVar}
        onChange={handleResultVarChange}
        style={mathStyle}
      />
      <div style={DownLineStyle}></div>
    </div>
  );
};

export default MultiplyNode;