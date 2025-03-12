// src/Components/blocks/ChangeVariableBlock.js
import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { FaPlusCircle, FaQuestion } from 'react-icons/fa';
import HelpModal from '../../Modal/HelpModal';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { useNodeUpdater } from '../../../hooks/useNodeUpdater';
import './block.css';

const ChangeVariableBlock = ({ id, data, selected, executing }) => {
  const updateNodeData = useNodeUpdater(id);
  const [showHelp, setShowHelp] = useState(false);

  const helpText = `
  • This block changes the value of a number variable.
  • Type the name of the variable you want to change (for example, "score").
  • Choose an operation (add, subtract, multiply, or divide) from the dropdown.
  • Enter the number that will be used in the operation.
  • Note: This block only works with numbers.
  `;

  const handleVarNameChange = (e) => {
    updateNodeData({ varName: e.target.value });
  };

  const handleVarValueChange = (e) => {
    updateNodeData({ varValue: e.target.value });
  };

  const handleOperatorChange = (e) => {
    updateNodeData({ operator: e.target.value });
  };

  return (
    <div
      className={`block-container change-variable-block ${selected ? 'selected' : ''} ${executing ? 'executing' : ''}`}
    >
      <button onClick={() => setShowHelp(true)} className="help-button" title="How to use this block">
        <FaQuestion />
      </button>
      <HelpModal
        visible={showHelp}
        helpText={helpText}
        title="Adjust Variable Help"
        onClose={() => setShowHelp(false)}
      />
      <FaPlusCircle className="block-icon" />
      <div>{data.label || 'Adjust Variable'}</div>
      <Handle
        type="target"
        position={Position.Top}
        id={`target-${id}`}
        className="handle-target-circle"
        data-tooltip-id={`tooltip-${id}-target`}
        data-tooltip-content="Connect from previous block"
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id={`source-${id}`}
        className="handle-source-square"
        data-tooltip-id={`tooltip-${id}-source`}
        data-tooltip-content="Connect to next block"
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
      {/* Group the operator dropdown with the variable value input */}
      <div className="operator-input-wrapper">
        <select
          value={data.operator || '+'}
          onChange={handleOperatorChange}
          className="operator-select"
        >
          <option value="+">+</option>
          <option value="-">-</option>
          <option value="*">*</option>
          <option value="/">/</option>
        </select>
        <input
          type="text"
          placeholder={
            (data.valueType || 'number') === 'number'
              ? 'numerical value'
              : 'text value'
          }
          value={data.varValue || ''}
          onChange={handleVarValueChange}
          className="block-input"
        />
      </div>
    </div>
  );
};

export default ChangeVariableBlock;