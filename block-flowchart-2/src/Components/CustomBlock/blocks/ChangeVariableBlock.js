// ChangeVariableBlock.js
import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { FaPlusCircle, FaQuestion } from 'react-icons/fa';
import HelpModal from '../../Modal/HelpModal.js';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { useNodeUpdater } from '../../../hooks/useNodeUpdater';
import './block.css';

const ChangeVariableBlock = ({ id, data, selected, executing }) => {
  const updateNodeData = useNodeUpdater(id);
  const [showHelp, setShowHelp] = useState(false);

  const helpText = `
• Enter the variable name (must already exist).
• Provide a value to add or update the variable.`;

  const handleVarNameChange = (e) => {
    updateNodeData({ varName: e.target.value });
  };

  const handleVarValueChange = (e) => {
    updateNodeData({ varValue: e.target.value });
  };

  return (
    <div
      className={`block-container change-variable ${selected ? 'selected' : ''} ${executing ? 'executing' : ''}`}
      style={{ background: '#e0ffe0', position: 'relative' }}
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
        title="Change Variable Help"
        onClose={() => setShowHelp(false)}
      />
      <FaPlusCircle style={{ marginBottom: 5 }} />
      <div>{data.label || 'Change Variable'}</div>
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
        placeholder="New Value"
        value={data.varValue || ''}
        onChange={handleVarValueChange}
        className="block-input"
      />
    </div>
  );
};

export default ChangeVariableBlock;