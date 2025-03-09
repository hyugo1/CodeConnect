import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { FaStop, FaQuestion } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import './block.css';

const EndBlock = ({ id, data, selected, executing }) => {
  const [showHelp, setShowHelp] = useState(false);
  const helpText = `End Block:
• This block marks the end of your program.`;

  return (
    <div
      className={`block-container end-block ${selected ? 'selected' : ''} ${executing ? 'executing' : ''}`}
      style={{ backgroundColor: '#f7d8d8', position: 'relative' }}
    >
      {/* Help Button */}
      <button
        onClick={() => setShowHelp(!showHelp)}
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
      {showHelp && (
        <div
          style={{
            position: 'absolute',
            top: '30px',
            left: '5px',
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '10px',
            width: '180px',
            zIndex: 10,
          }}
        >
          <p style={{ fontSize: '12px', margin: 0 }}>{helpText}</p>
          <button
            onClick={() => setShowHelp(false)}
            style={{
              marginTop: '5px',
              fontSize: '12px',
              background: '#e74c3c',
              color: '#fff',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              padding: '3px 6px',
            }}
          >
            Close
          </button>
        </div>
      )}
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