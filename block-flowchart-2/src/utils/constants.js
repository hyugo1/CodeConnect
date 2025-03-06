// // src/Components/FlowchartCanvas.js

// import React, { useCallback, useRef, useState } from 'react';
// import ReactFlow, {
//   addEdge,
//   useEdgesState,
//   useNodesState,
//   Controls,
//   Background,
//   MarkerType,
// } from 'reactflow';
// import 'reactflow/dist/style.css';
// import CustomNode from './CustomNode/CustomNode';
// import CustomEdge from './CustomEdge/CustomEdge';
// import ControlPanel from './ControlPanel';

// const edgeTypes = {
//   custom: CustomEdge,
// };

// const blockTypes = {
//   custom: CustomNode,
// };

// function FlowchartCanvas({
//   consoleOutput,
//   setConsoleOutput,
//   characterPosition,
//   setCharacterPosition,
//   characterMessage,
//   setCharacterMessage,
// }) {
//   const initialNodes = [];
//   const initialEdges = [];

//   const [blocks, setNodes, onNodesChange] = useNodesState(initialNodes);
//   const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

//   const lastNodeId = useRef(null);

//   const [selectedNodes, setSelectedNodes] = useState([]);
//   const [selectedEdges, setSelectedEdges] = useState([]);

//   // Handlers and functions (onConnect, onDrop, executeFlowchart, etc.) go here.
//   // For brevity, I'm omitting the detailed implementations.
//   // Make sure to include them from your original code, adjusted as needed.

//   return (
//     <div
//       className="flowchart-container"
//       onDragOver={onDragOver}
//       onDrop={onDrop}
//     >
//       <ReactFlow
//         blocks={blocks}
//         edges={edges}
//         blockTypes={blockTypes}
//         edgeTypes={edgeTypes}
//         snapToGrid={true}
//         snapGrid={[15, 15]}
//         defaultEdgeOptions={{
//           type: 'custom',
//           markerEnd: { type: MarkerType.ArrowClosed },
//           style: { stroke: '#555', strokeWidth: 3 },
//         }}
//         onNodesChange={onNodesChange}
//         onEdgesChange={onEdgesChange}
//         onConnect={onConnect}
//         onSelectionChange={onSelectionChange}
//       >
//         <Controls />
//         <Background color="#aaa" gap={16} />
//       </ReactFlow>
//       {/* Run, Reset, and Delete Buttons */}
//       <ControlPanel
//         executeFlowchart={executeFlowchart}
//         resetExecution={resetExecution}
//         selectedNodes={selectedNodes}
//         selectedEdges={selectedEdges}
//         setNodes={setNodes}
//         setEdges={setEdges}
//       />
//     </div>
//   );
// }

// export default FlowchartCanvas;