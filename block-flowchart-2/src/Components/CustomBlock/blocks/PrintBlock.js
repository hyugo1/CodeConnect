// src/Components/CustomBlock/blocks/Printblock.js

import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { FaPrint, FaQuestion } from 'react-icons/fa';
import HelpModal from '../../Modal/HelpModal';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { useNodeUpdater } from '../../../hooks/useNodeUpdater';
import './block.css';

const PrintBlock = ({ id, data, selected, executing }) => {
  const updateNodeData = useNodeUpdater(id);
  const [showHelp, setShowHelp] = useState(false);
  const helpText = `
  • This block makes the character say a message.
  • Type in the message you want to display.
  • To show a variable’s value, wrap its name in curly braces.
    For example: "{score}" will display the current value score has.
  `;

  const handleChange = (e) => {
    updateNodeData({ message: e.target.value });
  };

  return (
    <div className={`block-container print-block ${selected ? 'selected' : ''} ${executing ? 'executing' : ''}`}>
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
        title="Print Block Help"
        onClose={() => setShowHelp(false)}
      />
      <FaPrint className="block-icon" />
      <div>{data.label || 'Print'}</div>
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
        placeholder="e.g., 'x is {x}'"
        value={data.message || ''}
        onChange={handleChange}
        className="block-input"
      />
    </div>
  );
};

export default PrintBlock;