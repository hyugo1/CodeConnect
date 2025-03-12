// src/Components/blocks/SetVariableBlock.js
import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { FaPenFancy, FaQuestion } from 'react-icons/fa';
import HelpModal from '../../Modal/HelpModal';
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
    <div className={`block-container set-variable-block ${selected ? 'selected' : ''} ${executing ? 'executing' : ''}`}>
      <button
        onClick={() => setShowHelp(true)}
        className="help-button"
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
      <FaPenFancy className="block-icon" />
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
        className="toggle-type-button"
        title="Toggle variable type"
      >
        {(data.valueType || 'number').charAt(0).toUpperCase() +
          (data.valueType || 'number').slice(1)}
      </button>
    </div>
  );
};

export default SetVariableBlock;