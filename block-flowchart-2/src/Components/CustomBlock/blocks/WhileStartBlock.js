// src/Components/blocks/WhileStartBlock.js
import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { FaSync, FaQuestion } from 'react-icons/fa';
import HelpModal from '../../Modal/HelpModal';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { useNodeUpdater } from '../../../hooks/useNodeUpdater';
import './block.css';

const WhileStartBlock = ({ id, data, selected, executing }) => {
  const updateNodeData = useNodeUpdater(id);
  const [showHelp, setShowHelp] = useState(false);
  const helpText = `
• This block creates a loop. 
• You are likely to have to set a variable first to compare, like "x" or "y", to a value.
• Then, in the if block type a condition, for example ‘if x > 10’ to tell the program when to keep repeating. 
• The loop (the left branch) runs as long as the condition is true, and the right path runs when it becomes false, meaning it exits the loop.`;

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
    <div className={`block-container while-start-block ${selected ? 'selected' : ''} ${executing ? 'executing' : ''}`}>
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
        title="While Block Help"
        onClose={() => setShowHelp(false)}
      />
      <FaSync className="block-icon" />
      <div>{data.label || 'While'}</div>
      <Handle
        type="target"
        position={Position.Top}
        id={`target-${id}`}
        className="handle-target-circle"
        data-tooltip-id={`tooltip-${id}-target`}
        data-tooltip-content="Connect from previous block"
        isConnectable={true}
      />
      <div className="condition-container">
        <input
          type="text"
          placeholder="First Variable"
          value={data.leftOperand || ''}
          onChange={handleLeftOperandChange}
          className="operand-input"
        />
        <select value={data.operator || ''} onChange={handleOperatorChange} className="operator-select">
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
          placeholder="Second Variable"
          value={data.rightOperand || ''}
          onChange={handleRightOperandChange}
          className="operand-input"
        />
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id={`body-${id}`}
        className="handle-source-square"
        style={{ left: '25%', top: '100%' }}
        data-tooltip-id={`tooltip-${id}-body`}
        data-tooltip-content="If condition true, enter loop body"
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id={`exit-${id}`}
        className="handle-source-square"
        style={{ left: '75%', top: '100%' }}
        data-tooltip-id={`tooltip-${id}-exit`}
        data-tooltip-content="If condition false, exit loop"
        isConnectable={true}
      />
      <Handle
        type="target"
        position={Position.Left}
        id={`loopBack-${id}`}
        className="handle-target-circle"
        style={{ left: '0%', top: '50%' }}
        data-tooltip-id={`tooltip-${id}-loopBack`}
        data-tooltip-content="Connect back for looping"
        isConnectable={true}
      />
      <Tooltip id={`tooltip-${id}-target`} place="top" />
      <Tooltip id={`tooltip-${id}-body`} place="top" />
      <Tooltip id={`tooltip-${id}-exit`} place="top" />
      <Tooltip id={`tooltip-${id}-loopBack`} place="top" />
    </div>
  );
};

export default WhileStartBlock;