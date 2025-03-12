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
  • This block adjusts an existing variable’s value.
  • Enter the variable’s name and the amount to add or subtract.
  • Use positive numbers to increase and negative numbers to decrease the value.
  • Toggle the variable type if necessary (number or text).`;

  const handleVarNameChange = (e) => {
    updateNodeData({ varName: e.target.value });
  };

  const handleVarValueChange = (e) => {
    updateNodeData({ varValue: e.target.value });
  };

  // const toggleValueType = () => {
  //   const types = ['number', 'string'];
  //   const currentType = data.valueType || 'number';
  //   const currentIndex = types.indexOf(currentType);
  //   const nextType = types[(currentIndex + 1) % types.length];
  //   updateNodeData({ valueType: nextType });
  // };

  return (
    <div
      className={`block-container change-variable-block ${selected ? 'selected' : ''} ${executing ? 'executing' : ''}`}
    >
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
      <input
        type="text"
        placeholder={
          (data.valueType || 'number') === 'number'
            ? 'number or expression (e.g., 2+3*4)'
            : 'text value'
        }
        value={data.varValue || ''}
        onChange={handleVarValueChange}
        className="block-input"
      />
      {/* <button
        onClick={toggleValueType}
        className="toggle-type-button"
        title="Toggle variable type"
      >
        {(data.valueType || 'number').charAt(0).toUpperCase() +
          (data.valueType || 'number').slice(1)}
      </button> */}
    </div>
  );
};

export default ChangeVariableBlock;