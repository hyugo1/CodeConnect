// src/Components/CustomBlock/blocks/ChangeVariableBlock.js
import React from 'react';
import { Handle, Position } from 'reactflow';
import { FaPlusCircle } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { useNodeUpdater } from '../../../hooks/useNodeUpdater';
import './block.css';

const ChangeVariableBlock = ({ id, data, selected, executing }) => {
  const updateNodeData = useNodeUpdater(id);

  const valueType = data.valueType || 'number';
  const types = ['number', 'string'];
  const currentTypeIndex = types.indexOf(valueType);
  const nextType = types[(currentTypeIndex + 1) % types.length];

  const handleVarNameChange = (e) => {
    updateNodeData({ varName: e.target.value });
  };

  const handleVarValueChange = (e) => {
    updateNodeData({ varValue: e.target.value });
  };

  const toggleValueType = () => {
    updateNodeData({ valueType: nextType });
  };

  let placeholderText = '';
  if (valueType === 'number') {
    placeholderText = 'Enter arithmetic expression (e.g., 2+3)';
  } else {
    placeholderText = 'Enter new text value';
  }

  return (
    <div
      className={`block-container change-variable ${selected ? 'selected' : ''} ${executing ? 'executing' : ''}`}
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
        style={{
          width: '100%',
          marginTop: 10,
          padding: '5px',
          borderRadius: '3px',
          border: '1px solid #ccc',
          // fontsize: '20px',
        }}
      />

      <input
        type="text"
        placeholder={placeholderText}
        value={data.varValue || ''}
        onChange={handleVarValueChange}
        style={{
          width: '100%',
          marginTop: 10,
          padding: '5px',
          borderRadius: '3px',
          border: '1px solid #ccc',
          // fontsize: '20px',
        }}
      />

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
          // fontSize: '10px',
          cursor: 'pointer',
        }}
        title="Toggle change value type"
      >
        {valueType.charAt(0).toUpperCase() + valueType.slice(1)}
      </button>
    </div>
  );
};

export default ChangeVariableBlock;