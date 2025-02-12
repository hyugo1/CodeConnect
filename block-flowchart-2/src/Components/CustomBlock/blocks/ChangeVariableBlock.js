// src/Components/CustomBlock/blocks/ChangeVariableBlock.js
import React from 'react';
import { Handle, Position } from 'reactflow';
import { FaPlusCircle } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { useNodeUpdater } from '../../../hooks/useNodeUpdater';
import './block.css';

const inputStyle = {
  width: '100%',
  marginTop: 6,
  padding: '5px',
  borderRadius: '3px',
  border: '1px solid #ccc',
  fontSize: '12px',
  boxSizing: 'border-box',
};

const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  marginTop: '5px',
};

const ChangeVariableBlock = ({ id, data, selected }) => {
  const updateNodeData = useNodeUpdater(id);

  // 1. Value type toggle (number, string, array)
  const valueType = data.valueType || 'number';
  const valueTypes = ['number', 'string', 'array'];
  const currentTypeIndex = valueTypes.indexOf(valueType);
  const nextType = valueTypes[(currentTypeIndex + 1) % valueTypes.length];

  const handleVarNameChange = (e) => {
    updateNodeData({ varName: e.target.value });
  };

  const handleVarValueChange = (e) => {
    updateNodeData({ varValue: e.target.value });
  };

  // 2. Operation select (only relevant if valueType === 'array')
  //    Default to "add" if not specified
  const operation = data.operation || 'add'; // could be 'add' or 'remove'
  const handleOperationChange = (e) => {
    updateNodeData({ operation: e.target.value });
  };

  const toggleValueType = () => {
    updateNodeData({ valueType: nextType });
  };

  let placeholderText;
  if (valueType === 'number') {
    placeholderText = 'Change Value (number)';
  } else if (valueType === 'string') {
    placeholderText = 'Change Value (string)';
  } else if (valueType === 'array') {
    placeholderText = operation === 'add'
      ? 'Items to ADD (comma separated)'
      : 'Items to REMOVE (comma separated)';
  }

  return (
    <div
      className={`block-container change-variable ${selected ? 'selected' : ''}`}
      style={{ background: '#e0ffe0', position: 'relative' }} 
    >
      <FaPlusCircle style={{ marginBottom: 5 }} />
      <div>{data.label || 'Change Variable'}</div>
      <Handle
        type="target"
        position={Position.Top}
        id={`target-${id}`}
        className="handle-target-circle"
        style={{ left: '50%', top: '0px' }}
        data-tooltip-id={`tooltip-${id}-target`}
        data-tooltip-content="Connect from another block"
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id={`source-${id}`}
        className="handle-source-square"
        style={{ left: '50%', top: '95%' }}
        data-tooltip-id={`tooltip-${id}-source`}
        data-tooltip-content="Connect to another block"
        isConnectable={true}
      />
      <Tooltip id={`tooltip-${id}-target`} place="top" />
      <Tooltip id={`tooltip-${id}-source`} place="top" />

      <input
        type="text"
        placeholder="Variable Name"
        value={data.varName || ''}
        onChange={handleVarNameChange}
        style={inputStyle}
      />

      {/* If number or string, we simply show one input.
          If array, we also show the operation (add/remove). */}
      {valueType === 'array' && (
        <div style={rowStyle}>
          <label style={{ fontSize: '12px' }}>Operation:</label>
          <select
            value={operation}
            onChange={handleOperationChange}
            style={{
              ...inputStyle,
              width: 'auto',
              marginTop: 0,
            }}
          >
            <option value="add">Add</option>
            <option value="remove">Remove</option>
          </select>
        </div>
      )}

      <input
        type="text"
        placeholder={placeholderText}
        value={data.varValue || ''}
        onChange={handleVarValueChange}
        style={inputStyle}
      />

      {/* Toggle button for value type (top-right corner) */}
      <button
        onClick={toggleValueType}
        style={{
          position: 'absolute',
          top: '5px',
          right: '5px',
          background: '#ddd',
          border: '1px solid #aaa',
          borderRadius: '3px',
          padding: '2px 5px',
          fontSize: '10px',
          cursor: 'pointer'
        }}
        title="Toggle change value type"
      >
        {valueType.charAt(0).toUpperCase() + valueType.slice(1)}
      </button>
    </div>
  );
};

export default ChangeVariableBlock;