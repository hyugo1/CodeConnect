// src/Components/CustomBlock/blocks/RotateBlock.js
import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { FaArrowLeft, FaArrowRight, FaArrowsAltH, FaQuestion } from 'react-icons/fa';
import HelpModal from '../../Modal/HelpModal';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { useNodeUpdater } from '../../../hooks/useNodeUpdater';
import './block.css';

const inputStyle = {
  width: '100%',
  marginTop: 10,
  padding: '5px',
  borderRadius: '3px',
  border: '1px solid #ccc',
  fontSize: '16px',
  boxSizing: 'border-box',
};

const RotateBlock = ({ id, data, selected, executing }) => {
  const updateNodeData = useNodeUpdater(id);
  const [showHelp, setShowHelp] = useState(false);
  const helpText = `
  • This block rotates your character on the screen.
  • Enter a number to define the degrees to rotate.
  • Then, choose a direction from the dropdown.
  `;
  
  // Rename the handler to update "degrees" (instead of "distance")
  const handleDegreesChange = (e) => {
    // Save degrees as a number
    const newDegrees = parseInt(e.target.value, 10) || 0;
    updateNodeData({ degrees: newDegrees });
  };

  const handleDirectionChange = (e) => {
    updateNodeData({ rotateDirection: e.target.value });
  };

  // Choose an icon based on rotateDirection
  let icon = null;
  switch (data.rotateDirection) {
    case 'left':
      icon = <FaArrowLeft className="block-icon" />;
      break;
    case 'right':
      icon = <FaArrowRight className="block-icon" />;
      break;
    default:
      icon = <FaArrowsAltH className="block-icon" />;
  }

  return (
    <div className={`block-container rotate-block ${selected ? 'selected' : ''} ${executing ? 'executing' : ''}`}>
      <button onClick={() => setShowHelp(true)} className="help-button" title="How to use this block">
        <FaQuestion />
      </button>
      <HelpModal
        visible={showHelp}
        helpText={helpText}
        title="Rotate Block Help"
        onClose={() => setShowHelp(false)}
      />
      {icon}
      <div>{data.label || 'Rotate Character'}</div>
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
        type="number"
        placeholder="Degrees to Rotate"
        value={data.degrees || ''}
        onChange={handleDegreesChange}
        style={inputStyle}
      />
      <select
        value={data.rotateDirection || ''}
        onChange={handleDirectionChange}
        style={inputStyle}
      >
        <option value="">Select Direction</option>
        <option value="left">Rotate Left</option>
        <option value="right">Rotate Right</option>
      </select>
    </div>
  );
};

export default RotateBlock;