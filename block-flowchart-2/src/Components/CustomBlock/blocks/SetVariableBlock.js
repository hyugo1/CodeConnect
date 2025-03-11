import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { FaPenFancy, FaQuestion } from 'react-icons/fa';
import HelpModal from '../../Modal/HelpModal.js';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { useNodeUpdater } from '../../../hooks/useNodeUpdater';
import './block.css';

const SetVariableBlock = ({ id, data, selected, executing }) => {
  const updateNodeData = useNodeUpdater(id);
  const [showHelp, setShowHelp] = useState(false);

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

  const helpText = `
• Provide a variable name.
• Enter a value (number or arithmetic expression if number; text if string).
• Toggle the type using the button on the top right.`;

  return (
    <div
      className={`block-container ${selected ? 'selected' : ''} ${executing ? 'executing' : ''}`}
      style={{ position: 'relative' }}
    >
      <button
        onClick={() => setShowHelp(true)}
        style={{
          position: 'absolute',
          top: '5px',
          left: '5px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '18px',
          color: '#555',
        }}
        title="How to use this block"
      >
        <FaQuestion />
      </button>
      <HelpModal
        visible={showHelp}
        helpText={helpText}
        title="Set Variable Help"
        onClose={() => setShowHelp(false)}
      />
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
        placeholder={
          currentType === 'number'
            ? 'number or expression (e.g., 2+3*4)'
            : 'text value'
        }
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
        {(data.valueType || 'number').charAt(0).toUpperCase() +
          (data.valueType || 'number').slice(1)}
      </button>
    </div>
  );
};

export default SetVariableBlock;