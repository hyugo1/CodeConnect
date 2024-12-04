// src/Components/CustomNode/nodes/IfNode.js

import React from 'react';
import { Handle, Position } from 'reactflow';
import { FaQuestion } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import './IfNode.css';

const handleStyle = { background: '#555' };
const bottomLeftStyle = {
  position: 'absolute',
  width: 3,
  backgroundColor: '#555',
  top: '100%',
  left: '25%',
  height: 50,
  transform: 'translateX(-50%)',
  zIndex: -1,
};
const bottomRightStyle = {
  position: 'absolute',
  width: 3,
  backgroundColor: '#555',
  top: '100%',
  left: '75%',
  height: 50,
  transform: 'translateX(-50%)',
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

const IfNode = ({ id, data, selected }) => {
  const handleLeftOperandChange = (e) => {
    data.onChange(
      id,
      data.label,
      data.action,
      data.message,
      data.distance,
      data.direction,
      data.operand1,
      data.operand2,
      data.resultVar,
      data.varName,
      data.varValue,
      e.target.value,
      data.operator,
      data.rightOperand
    );
  };

  const handleOperatorChange = (e) => {
    data.onChange(
      id,
      data.label,
      data.action,
      data.message,
      data.distance,
      data.direction,
      data.operand1,
      data.operand2,
      data.resultVar,
      data.varName,
      data.varValue,
      data.leftOperand,
      e.target.value,
      data.rightOperand
    );
  };

  const handleRightOperandChange = (e) => {
    data.onChange(
      id,
      data.label,
      data.action,
      data.message,
      data.distance,
      data.direction,
      data.operand1,
      data.operand2,
      data.resultVar,
      data.varName,
      data.varValue,
      data.leftOperand,
      data.operator,
      e.target.value
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
        backgroundColor: '#d8d8f9',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      className={selected ? 'selected' : ''}
    >
      <FaQuestion style={{ marginBottom: 5 }} />
      <div>{data.label}</div>
      <Handle
        type="target"
        position={Position.Top}
        id={`target-${id}`}
        className="handle-target-star" // Use .handle-target-circle if using circle
        style={{
          left: '50%', // Adjust as needed
          top: '0px',  // Adjust as needed
          ...handleStyle,
        }}
        data-tooltip-id={`tooltip-${id}-target`}
        data-tooltip-content="Connect from another node"
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id={`yes-${id}`}
        style={{ left: '25%', ...handleStyle }}
        data-tooltip-id={`tooltip-${id}-yes`}
        data-tooltip-content="True Branch"
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id={`no-${id}`}
        style={{ left: '75%', ...handleStyle }}
        data-tooltip-id={`tooltip-${id}-no`}
        data-tooltip-content="False Branch"
        isConnectable={true}
      />
      {/* Tooltips */}
      <Tooltip id={`tooltip-${id}-target`} place="top" />
      <Tooltip id={`tooltip-${id}-yes`} place="top" />
      <Tooltip id={`tooltip-${id}-no`} place="top" />
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
      <div style={bottomLeftStyle}></div>
      <div style={bottomRightStyle}></div>
    </div>
  );
};

export default IfNode;