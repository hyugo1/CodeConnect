// // src/Components/CustomBlock/blocks/createVariable.js

// import React, { useState } from 'react';
// import { Handle, Position } from 'reactflow';
// import CreateIcon from '@mui/icons-material/Create';
// import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
// import HelpModal from '../../Modal/HelpModal';
// import { Tooltip } from 'react-tooltip';
// import 'react-tooltip/dist/react-tooltip.css';
// import { useNodeUpdater } from '../../../hooks/useNodeUpdater';
// import './block.css';

// const createVariableBlock = ({ id, data, selected, executing }) => {
//   const updateNodeData = useNodeUpdater(id);
//   const [showHelp, setShowHelp] = useState(false);

//   const types = ['number', 'string'];
//   const currentType = data.valueType || 'number';
//   const currentTypeIndex = types.indexOf(currentType);
//   const nextType = types[(currentTypeIndex + 1) % types.length];

//   const handleVarNameChange = (e) => {
//     updateNodeData({ varName: e.target.value });
//   };

//   const handleVarValueChange = (e) => {
//     updateNodeData({ varValue: e.target.value });
//   };

//   const toggleValueType = () => {
//     updateNodeData({ valueType: nextType });
//   };

//   const helpText = `
//   • Use this block to create a new variable or change an existing one.
//   • Type the variable's name and then enter a value.
//   • For numbers, you can even use an arithmetic expression like "2+3*4".
//   • Click the toggle button to switch the variable type between number and text.
//   `;

//   return (
//     <div className={`block-container createVariable-block ${selected ? 'selected' : ''} ${executing ? 'executing' : ''}`}>
//       <button
//         onClick={() => setShowHelp(true)}
//         className="help-button"
//         title="How to use this block"
//       >
//         <HelpOutlineIcon />
//       </button>
//       <HelpModal
//         visible={showHelp}
//         helpText={helpText}
//         title="Create Variable Help"
//         onClose={() => setShowHelp(false)}
//       />
//       <CreateIcon className="block-icon" />
//       <div>{'Create Variable'}</div>
//       <Handle
//         type="target"
//         position={Position.Top}
//         id={`target-${id}`}
//         className="handle-target-circle"
//         data-tooltip-id={`tooltip-${id}-target`}
//         data-tooltip-content="Connect from another block"
//         isConnectable={true}
//       />
//       <Handle
//         type="source"
//         position={Position.Bottom}
//         id={`source-${id}`}
//         className="handle-source-square"
//         data-tooltip-id={`tooltip-${id}-source`}
//         data-tooltip-content="Connect to another block"
//         isConnectable={true}
//       />
//       <Tooltip id={`tooltip-${id}-target`} place="top" />
//       <Tooltip id={`tooltip-${id}-source`} place="top" />
//       <input
//         type="text"
//         placeholder="Variable Name"
//         value={data.varName || ''}
//         onChange={handleVarNameChange}
//         className="block-input"
//       />
//       <input
//         type="text"
//         placeholder={
//           currentType === 'number'
//             ? 'Value/Math Expression'
//             : 'text value'
//         }
//         value={data.varValue || ''}
//         onChange={handleVarValueChange}
//         className="block-input"
//       />
//       <button
//         onClick={toggleValueType}
//         className="toggle-type-button"
//         title="Toggle variable type"
//       >
//         {(data.valueType || 'number').charAt(0).toUpperCase() +
//           (data.valueType || 'number').slice(1)}
//       </button>
//     </div>
//   );
// };

// export default createVariableBlock;



import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import CreateIcon from '@mui/icons-material/Create';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HelpModal from '../../Modal/HelpModal';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { useNodeUpdater } from '../../../hooks/useNodeUpdater';
import './block.css';

const CreateVariableBlock = ({ id, data, selected, executing }) => {
  const updateNodeData = useNodeUpdater(id);
  const [showHelp, setShowHelp] = useState(false);

  const types = ['number', 'string'];
  const currentType = data.valueType || 'number';
  const currentIndex = types.indexOf(currentType);
  const nextType = types[(currentIndex + 1) % types.length];

  const toggleValueType = () => {
    updateNodeData({ valueType: nextType });
  };

  const helpText = `
  • Use this block to create a new variable or change an existing one.
  • Type the variable's name and then enter a value.
  • For numbers, you can even use an arithmetic expression like "2+3*4".
  • Click the toggle button to switch the variable type between number and text.
  `;

  // handlers for each textbox
  const handleNameChange = (e) => {
    updateNodeData({ varName: e.target.value });
  };
  const handleValueChange = (e) => {
    updateNodeData({ varValue: e.target.value });
  };

  return (
    <div
      className={`
        block-container createVariable-block
        ${selected ? 'selected' : ''}
        ${executing ? 'executing' : ''}
      `}
    >
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
        title="Create Variable Block Help"
        onClose={() => setShowHelp(false)}
      />

      <CreateIcon className="block-icon" />
      <div>{'Create Variable'}</div>

      <Handle
        type="target"
        position={Position.Top}
        id={`target-${id}`}
        className="handle-target-circle"
        data-tooltip-id={`tooltip-${id}-target`}
        data-tooltip-content="Connect from another block"
        isConnectable
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id={`source-${id}`}
        className="handle-source-square"
        data-tooltip-id={`tooltip-${id}-source`}
        data-tooltip-content="Connect to another block"
        isConnectable
      />
      <Tooltip id={`tooltip-${id}-target`} place="top" />
      <Tooltip id={`tooltip-${id}-source`} place="top" />

      {/* ↓ your two‑input row ↓ */}
      <div className="createVariable-input-wrapper">
        <span className="set-label">Set</span>
        <input
          type="text"
          placeholder="Variable"
          className="operand-input"
          value={data.varName || ''}
          onChange={handleNameChange}
        />
        <span className="to-label">to</span>
        <input
          type="text"
          placeholder={currentType === 'number' ? 'Value' : 'Text'}
          className="operand-input"
          value={data.varValue || ''}
          onChange={handleValueChange}
        />
      </div>

      {/* ↓ toggle button for number ⇄ string ↓ */}
      <button
        onClick={toggleValueType}
        className="toggle-type-button"
        title="Toggle variable type"
      >
        {currentType.charAt(0).toUpperCase() + currentType.slice(1)}
      </button>
    </div>
  );
};

export default CreateVariableBlock;