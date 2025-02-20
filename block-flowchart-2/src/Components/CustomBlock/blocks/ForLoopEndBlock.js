// // src/Components/CustomBlock/blocks/ForLoopEndBlock.js
// import React from 'react';
// import { Handle, Position } from 'reactflow';
// import { FaListAlt } from 'react-icons/fa';
// import { Tooltip } from 'react-tooltip';
// import 'react-tooltip/dist/react-tooltip.css';
// import './block.css';

// const ForLoopEndBlock = ({ id, data, selected }) => {
//   return (
//     <div
//       className={`block-container for-loop-end ${selected ? 'selected' : ''}`}
//       style={{ backgroundColor: '#e8f5e9' }}
//     >
//       <FaListAlt style={{ marginBottom: 5 }} />
//       <div>For Loop End</div>
//       {/* Incoming connection from loop body */}
//       <Handle
//         type="target"
//         position={Position.Top}
//         id={`target-${id}`}
//         className="handle-target-circle"
//         style={{ left: '50%', top: '0px' }}
//         data-tooltip-id={`tooltip-${id}-target`}
//         data-tooltip-content="Connect from loop body"
//         isConnectable={true}
//       />
//       {/* Loop-back: connect back to ForLoopStart to repeat the loop */}
//       <Handle
//         type="source"
//         position={Position.Right}
//         id={`loopBack-${id}`}
//         className="handle-source-square"
//         style={{ left: '100%', top: '50%' }}
//         data-tooltip-id={`tooltip-${id}-loopBack`}
//         data-tooltip-content="Connect back to For Loop Start"
//         isConnectable={true}
//       />
//       {/* Exit: continue after the loop */}
//       <Handle
//         type="source"
//         position={Position.Bottom}
//         id={`exit-${id}`}
//         className="handle-source-square"
//         style={{ left: '50%', top: '90%' }}
//         data-tooltip-id={`tooltip-${id}-exit`}
//         data-tooltip-content="Connect to next block after loop"
//         isConnectable={true}
//       />
//       <Tooltip id={`tooltip-${id}-target`} place="top" />
//       <Tooltip id={`tooltip-${id}-loopBack`} place="top" />
//       <Tooltip id={`tooltip-${id}-exit`} place="top" />
//     </div>
//   );
// };

// export default ForLoopEndBlock;