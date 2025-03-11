import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { FaStop, FaQuestion } from 'react-icons/fa';
import HelpModal from '../../Modal/HelpModal.js';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import './block.css';

const EndBlock = ({ id, data, selected, executing }) => {
  const [showHelp, setShowHelp] = useState(false);
  const helpText = `
• This block marks the end of your program.
• Putting this at the end of your program will allow you to run the program.
`;

  return (
    <div
      className={`block-container end-block ${selected ? 'selected' : ''} ${executing ? 'executing' : ''}`}
      style={{ backgroundColor: '#f7d8d8', position: 'relative' }}
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
        title="End Block Help"
        onClose={() => setShowHelp(false)}
      />
      <FaStop style={{ marginBottom: 5 }} />
      <div>{data.label || 'End'}</div>
      <Handle
        type="target"
        position={Position.Top}
        id={`target-${id}`}
        className="handle-target-circle"
        data-tooltip-id={`tooltip-${id}-target`}
        data-tooltip-content="Connect from another block"
        isConnectable={true}
      />
      <Tooltip id={`tooltip-${id}-target`} place="top" />
    </div>
  );
};

export default EndBlock;