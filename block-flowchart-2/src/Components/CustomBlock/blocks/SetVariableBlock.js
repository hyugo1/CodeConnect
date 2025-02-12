import React from 'react';
import { Handle, Position } from 'reactflow';
import { FaPenFancy } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { useNodeUpdater } from '../../../hooks/useNodeUpdater';
import './block.css';

const SetVariableBlock = ({ id, data, selected }) => {
  const updateNodeData = useNodeUpdater(id);
  
  // Default to "number" if no type is provided.
  const valueType = data.valueType || 'number';
  
  // Toggle button will cycle through these types.
  const types = ['number', 'string', 'array'];
  const currentIndex = types.indexOf(valueType);
  const nextType = types[(currentIndex + 1) % types.length];

  const handleVarNameChange = (e) => {
    updateNodeData({ varName: e.target.value });
  };

  const handleVarValueChange = (e) => {
    updateNodeData({ varValue: e.target.value });
  };

  const toggleValueType = () => {
    updateNodeData({ valueType: nextType });
  };

  // Set the placeholder text based on the current value type.
  let placeholderText;
  if (valueType === 'number') {
    placeholderText = 'Value (number)';
  } else if (valueType === 'string') {
    placeholderText = 'Value (string)';
  } else if (valueType === 'array') {
    placeholderText = 'Value (comma separated)';
  }

  return (
    <div
      className={`block-container ${selected ? 'selected' : ''}`}
      style={{ position: 'relative' }} // allows positioning of the toggle button
    >
      <FaPenFancy style={{ marginBottom: 5 }} />
      <div>{data.label}</div>
      <Handle
        type="target"
        position={Position.Top}
        id={`target-${id}`}
        className="handle-target-circle"
        data-tooltip-id={`tooltip-${id}-target`}
        data-tooltip-content="Connect from another block"
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id={`source-${id}`}
        className="handle-source-square"
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
        className="block-input"
      />
      <input
        type="text"
        placeholder={placeholderText}
        value={data.varValue || ''}
        onChange={handleVarValueChange}
        className="block-input"
      />
      {/* Toggle Button in the top right corner */}
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
        title="Toggle variable type"
      >
        {valueType.charAt(0).toUpperCase() + valueType.slice(1)}
      </button>
    </div>
  );
};

export default SetVariableBlock;