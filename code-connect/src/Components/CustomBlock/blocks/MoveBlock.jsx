// src/Components/CustomBlock/blocks/MoveBlock.js


import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
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

const MoveBlock = ({ id, data, selected, executing }) => {
  const updateNodeData = useNodeUpdater(id);
  const [showHelp, setShowHelp] = useState(false);
  const helpText = `
  • This block moves your character on the screen.
  • Enter a number to define the distance to move.
  • Then, choose a direction from the dropdown.
  `;
  const handleDistanceChange = (e) => {
    const newDistance = parseInt(e.target.value, 10) || 0;
    updateNodeData({ distance: newDistance });
  };

  const handleDirectionChange = (e) => {
    updateNodeData({ direction: e.target.value });
  };

  let icon = null;
  switch (data.direction) {
    case 'up':
      icon = <ArrowUpwardIcon className="block-icon" />;
      break;
    case 'down':
      icon = <ArrowDownwardIcon className="block-icon" />;
      break;
    case 'left':
      icon = <ArrowBackIcon className="block-icon" />;
      break;
    case 'right':
      icon = <ArrowForwardIcon className="block-icon" />;
      break;
    default:
      icon = <CompareArrowsIcon className="block-icon" />;
  }

  return (
    <div className={`block-container move-block ${selected ? 'selected' : ''} ${executing ? 'executing' : ''}`}>
      <button
        onClick={() => setShowHelp(true)}
        className="help-button"
        title="How to use this block"
      >
        <HelpOutlineIcon />
      </button>
      <HelpModal
        visible={showHelp}
        helpText={helpText}
        title="Move Block Help"
        onClose={() => setShowHelp(false)}
      />
      {icon}
      <div>{'Move Character'}</div>
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
        placeholder="Distance to Move"
        value={data.distance || ''}
        onChange={handleDistanceChange}
        style={inputStyle}
        className="block-input"
      />
      <select
        value={data.direction || ''}
        onChange={handleDirectionChange}
        style={inputStyle}
        className='operator-select'
      >
        <option value="">Select Direction</option>
        <option value="up">Up</option>
        <option value="down">Down</option>
        <option value="left">Left</option>
        <option value="right">Right</option>
      </select>
    </div>
  );
};

export default MoveBlock;