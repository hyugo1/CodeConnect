// src/Components/CustomBlock/blocks/WhileStartBlock.js
import React from 'react';
import { Handle, Position } from 'reactflow';
import { FaSync } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { useNodeUpdater } from '../../../hooks/useNodeUpdater';
import './block.css';

const conditionStyle = {
  display: 'flex',
  alignItems: 'center',
  marginTop: 10,
};

const inputStyle = {
  flex: 1,
  padding: '5px',
  borderRadius: '3px',
  border: '1px solid #ccc',
  marginRight: '5px',
  // fontSize: '20px',
};

const selectStyle = {
  padding: '5px',
  borderRadius: '3px',
  border: '1px solid #ccc',
  marginRight: '5px',
  // fontSize: '20px',
};

const WhileStartBlock = ({ id, data, selected, executing }) => {
  const updateNodeData = useNodeUpdater(id);

  const handleLeftOperandChange = (e) => {
    updateNodeData({ leftOperand: e.target.value });
  };

  const handleOperatorChange = (e) => {
    updateNodeData({ operator: e.target.value });
  };

  const handleRightOperandChange = (e) => {
    updateNodeData({ rightOperand: e.target.value });
  };

  return (
    <div
      className={`block-container while-start-block ${selected ? 'selected' : ''} ${executing ? 'executing' : ''}`}
      style={{ backgroundColor: '#f9f7d8' }}
    >
      <FaSync style={{ marginBottom: 5 }} />
      <div>{data.label || 'While'}</div>
      <div style={conditionStyle}>
        <input
          type="text"
          placeholder="Left Operand"
          value={data.leftOperand || ''}
          onChange={handleLeftOperandChange}
          style={inputStyle}
        />
        <select
          value={data.operator || ''}
          onChange={handleOperatorChange}
          style={selectStyle}
        >
          <option value="">Op</option>
          <option value="<">&lt;</option>
          <option value=">">&gt;</option>
          <option value="==">==</option>
          <option value="!=">!=</option>
          <option value="<=">&lt;=</option>
          <option value=">=">&gt;=</option>
        </select>
        <input
          type="text"
          placeholder="Right Operand"
          value={data.rightOperand || ''}
          onChange={handleRightOperandChange}
          style={inputStyle}
        />
      </div>
      {/* Incoming handle */}
      <Handle
        type="target"
        position={Position.Top}
        id={`target-${id}`}
        className="handle-target-circle"
        style={{ left: '50%', top: '0px' }}
        data-tooltip-id={`tooltip-${id}-target`}
        data-tooltip-content="Connect from previous block"
        isConnectable={true}
      />
      {/* True branch handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id={`true-${id}`}
        className="handle-source-square"
        style={{ left: '25%', top: '100%' }}
        data-tooltip-id={`tooltip-${id}-true`}
        data-tooltip-content="If condition true, connect to loop body"
        isConnectable={true}
      />
      {/* False branch handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id={`false-${id}`}
        className="handle-source-square"
        style={{ left: '75%', top: '100%' }}
        data-tooltip-id={`tooltip-${id}-false`}
        data-tooltip-content="If condition false, go to the next block "
        isConnectable={true}
      />
      {/* Loopback target handle on the left for connecting back to While Start */}
      <Handle
        type="target"
        position={Position.Left}
        id={`loopBack-${id}`}
        className="handle-target-circle"
        style={{ left: '0%', top: '50%' }}
        data-tooltip-id={`tooltip-${id}-loopBack`}
        data-tooltip-content="Connect back to While Start for looping"
        isConnectable={true}
      />
      <Tooltip id={`tooltip-${id}-target`} place="top" />
      <Tooltip id={`tooltip-${id}-true`} place="top" />
      <Tooltip id={`tooltip-${id}-loopBack`} place="top" />
    </div>
  );
};

export default WhileStartBlock;