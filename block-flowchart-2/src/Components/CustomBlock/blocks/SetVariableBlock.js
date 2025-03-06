import React from 'react';
import { Handle, Position } from 'reactflow';
import { FaPenFancy } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { useNodeUpdater } from '../../../hooks/useNodeUpdater';
import './block.css';

const SetVariableBlock = ({ id, data, selected, executing }) => {
  const updateNodeData = useNodeUpdater(id);
  
  const types = ['number', 'string'];
  const currentType = data.valueType || 'number';
  const currentTypeIndex = types.indexOf(currentType);
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

  let placeholderText = currentType === 'number'
    ? 'Enter number or expression (e.g., 2+3*4)'
    : 'Enter text value';

  return (
    <div
      className={`block-container ${selected ? 'selected' : ''} ${executing ? 'executing' : ''}`}
      style={{ position: 'relative' }}
    >
      <FaPenFancy style={{ marginBottom: 5 }} />
      <div>{data.label || 'Set Variable'}</div>
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
          cursor: 'pointer',
        }}
        title="Toggle variable type"
      >
        {(data.valueType || 'number').charAt(0).toUpperCase() + (data.valueType || 'number').slice(1)}
      </button>
    </div>
  );
};

export default SetVariableBlock;