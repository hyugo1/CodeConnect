// src/Components/CustomBlock/blocks/ForLoopStartBlock.js
import React from 'react';
import { Handle, Position } from 'reactflow';
import { FaList } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { useNodeUpdater } from '../../../hooks/useNodeUpdater';
import './block.css';

const inputStyle = {
  width: '90%',
  margin: '5px auto',
  padding: '5px',
  borderRadius: '3px',
  border: '1px solid #ccc',
  fontSize: '12px',
  display: 'block',
};

const ForLoopStartBlock = ({ id, data, selected }) => {
  const updateNodeData = useNodeUpdater(id);
  const arrayVar = data.arrayVar || '';
  const indexVar = data.indexVar || 'i';

  const handleArrayVarChange = (e) => {
    updateNodeData({ arrayVar: e.target.value });
  };

  const handleIndexVarChange = (e) => {
    updateNodeData({ indexVar: e.target.value });
  };

  return (
    <div
      className={`block-container for-loop-start ${selected ? 'selected' : ''}`}
      style={{ backgroundColor: '#e8f5e9', position: 'relative' }}
    >
      <FaList style={{ marginBottom: 5 }} />
      <div>For Loop Start</div>
      {/* Incoming connection */}
      <Handle
        type="target"
        position={Position.Top}
        id={`target-${id}`}
        className="handle-target-circle"
        data-tooltip-id={`tooltip-${id}-target`}
        data-tooltip-content="Connect from previous block"
        isConnectable={true}
      />
      {/* Loop body: go to the loop body */}
      <Handle
        type="source"
        position={Position.Bottom}
        id={`body-${id}`}
        className="handle-source-square"
        style={{ left: '50%', top: '95%' }}
        data-tooltip-id={`tooltip-${id}-body`}
        data-tooltip-content="Connect to loop body"
        isConnectable={true}
      />
      {/* Loop-back: from ForLoopEnd to here */}
      <Handle
        type="target"
        position={Position.Right}
        id={`loopBack-${id}`}
        className="handle-target-circle"
        style={{ left: '100%', top: '50%' }}
        data-tooltip-id={`tooltip-${id}-loopBack`}
        data-tooltip-content="Loop Back (from For Loop End)"
        isConnectable={true}
      />
      {/* Exit: exit the loop */}
      <Handle
        type="source"
        position={Position.Left}
        id={`exit-${id}`}
        className="handle-source-square"
        style={{ left: '0%', top: '50%' }}
        data-tooltip-id={`tooltip-${id}-exit`}
        data-tooltip-content="Exit Loop"
        isConnectable={true}
      />
      <Tooltip id={`tooltip-${id}-target`} place="top" />
      <Tooltip id={`tooltip-${id}-body`} place="top" />
      <Tooltip id={`tooltip-${id}-loopBack`} place="top" />
      <Tooltip id={`tooltip-${id}-exit`} place="top" />

      <input
        type="text"
        placeholder="Array Variable (e.g., arr)"
        value={arrayVar}
        onChange={handleArrayVarChange}
        style={inputStyle}
      />
      <input
        type="text"
        placeholder="Index Variable (e.g., i)"
        value={indexVar}
        onChange={handleIndexVarChange}
        style={inputStyle}
      />
    </div>
  );
};

export default ForLoopStartBlock;