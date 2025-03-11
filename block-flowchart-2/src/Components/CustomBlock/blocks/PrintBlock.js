import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { FaPrint, FaQuestion } from 'react-icons/fa';
import HelpModal from '../../Modal/HelpModal.js';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { useNodeUpdater } from '../../../hooks/useNodeUpdater';
import './block.css';

const PrintBlock = ({ id, data, selected, executing }) => {
  const updateNodeData = useNodeUpdater(id);
  const [showHelp, setShowHelp] = useState(false);

  const helpText = `
• Enter a message to print.
• Use {variable} syntax to include variable values.`;

  const handleChange = (e) => {
    updateNodeData({ message: e.target.value });
  };

  return (
    <div
      className={`block-container print-block ${selected ? 'selected' : ''} ${executing ? 'executing' : ''}`}
      style={{ backgroundColor: '#ffeeba', position: 'relative' }}
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
        title="Print Block Help"
        onClose={() => setShowHelp(false)}
      />
      <FaPrint style={{ marginBottom: 5 }} />
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
        placeholder="Message to print (e.g., 'x is {x}')"
        value={data.message || ''}
        onChange={handleChange}
        style={{
          width: '100%',
          marginTop: 10,
          padding: '5px',
          borderRadius: '3px',
          border: '1px solid #ccc',
          fontSize: '18px',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
};

export default PrintBlock;