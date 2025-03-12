// src/Components/blocks/StartBlock.js
import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { FaPlay, FaQuestion } from 'react-icons/fa';
import HelpModal from '../../Modal/HelpModal';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import './block.css';

const StartBlock = ({ id, data, selected, executing }) => {
  const [showHelp, setShowHelp] = useState(false);
  const helpText = `
• This is where your program begins.
• Drag more blocks from the start block to build your program’s steps.`;

  return (
    <div className={`block-container start-block ${selected ? 'selected' : ''} ${executing ? 'executing' : ''}`}>
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
        title="Start Block Help"
        onClose={() => setShowHelp(false)}
      />
      <FaPlay className="block-icon" />
      <div>{data.label || 'Start'}</div>
      <Handle
        type="source"
        position={Position.Bottom}
        id={`source-${id}`}
        className="handle-source-square"
        data-tooltip-id={`tooltip-${id}-source`}
        data-tooltip-content="Connect to another block"
        isConnectable={true}
      />
      <Tooltip id={`tooltip-${id}-source`} place="top" />
    </div>
  );
};

export default StartBlock;