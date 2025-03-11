// StartBlock.js
import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { FaPlay, FaQuestion } from 'react-icons/fa';
import HelpModal from '../../Modal/HelpModal.js';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import './block.css';

const StartBlock = ({ id, data, selected, executing }) => {
  const [showHelp, setShowHelp] = useState(false);
  const helpText = `
• This block marks the beginning of your program.
• Drag subsequent blocks to create your flow.`;

  return (
    <div
      className={`block-container start-block ${selected ? 'selected' : ''} ${executing ? 'executing' : ''}`}
      style={{ backgroundColor: '#d3f9d8', position: 'relative' }}
    >
      {/* Help Button */}
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

      {/* Help Modal */}
      <HelpModal
        visible={showHelp}
        helpText={helpText}
        title="Start Block Help"
        onClose={() => setShowHelp(false)}
      />

      <FaPlay style={{ marginBottom: 5 }} />
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