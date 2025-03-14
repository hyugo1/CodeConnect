// src/Components/CustomBlock/blocks/WhileStartBlock.js


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
  • This block starts a loop that repeats a set of actions.
  • First, choose a variable and write a condition (for example, "x > 10").
  • The left branch is the loop body that repeats as long as the condition is true.
  • When the condition becomes false, the program follows the right branch and exits the loop.
  • Use this block to repeat actions until a certain condition is met.
  `;
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
          placeholder="First Value"
          value={data.leftOperand || ''}
          onChange={handleLeftOperandChange}
          className="operand-input"
        />
        <select value={data.operator || ''} onChange={handleOperatorChange} className="operator-select">
          <option value="">Op</option>
          <option value="<">&lt;</option>
          <option value=">">&gt;</option>
          {/* <option value="==">==</option> */}
          <option value="<=">&lt;=</option>
          <option value=">=">&gt;=</option>
          <option value="!=">!=</option>
        </select>
        <input
          type="text"
          placeholder="Second Value"
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