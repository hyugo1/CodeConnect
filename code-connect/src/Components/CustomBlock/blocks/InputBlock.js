import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HelpModal from '../../Modal/HelpModal';
import { Tooltip } from 'react-tooltip';
import { useNodeUpdater } from '../../../hooks/useNodeUpdater';
import './block.css';

const InputBlock = ({ id, data, selected, executing }) => {
  const updateNodeData = useNodeUpdater(id);
  const [showHelp, setShowHelp] = useState(false);

  // Toggle between 'number' and 'string'
  const types = ['number', 'string'];
  const currentType = data.valueType || 'string';
  const nextType = types[(types.indexOf(currentType) + 1) % types.length];
  const toggleValueType = () => updateNodeData({ valueType: nextType });

  const helpText = `
  • Use this block to ask the user for a value.
  • Type the variable name to store it in.
  • Type the prompt message (e.g. "Enter your name").
  • Toggle between number or text input mode.
  `;

  return (
    <div className={`block-container input-block ${selected ? 'selected' : ''} ${executing ? 'executing' : ''}`}>
      <button onClick={() => setShowHelp(true)} className="help-button">
        <HelpOutlineIcon />
      </button>
      <HelpModal
        visible={showHelp}
        onClose={() => setShowHelp(false)}
        title="Input Block Help"
        helpText={helpText}
      />

      <KeyboardIcon className="block-icon" />
      <div>Input</div>

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
        className="block-input"
        placeholder="Variable Name"
        value={data.varName || ''}
        onChange={e => updateNodeData({ varName: e.target.value })}
      />
      <input
        type="text"
        className="block-input"
        placeholder="Prompt Message"
        value={data.prompt || ''}
        onChange={e => updateNodeData({ prompt: e.target.value })}
      />

      <button
        onClick={toggleValueType}
        className="toggle-type-button"
        title="Toggle input type"
      >
        {(data.valueType || 'string').charAt(0).toUpperCase() + (data.valueType || 'string').slice(1)}
      </button>
    </div>
  );
};

export default InputBlock;