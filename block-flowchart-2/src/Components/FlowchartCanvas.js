// src/Components/FlowchartCanvas.js

import React, { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  Controls,
  Background,
  MarkerType,
  applyNodeChanges,
  applyEdgeChanges,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode/CustomNode';
import CustomEdge from './CustomEdge/CustomEdge';
import ControlPanel from './ControlPanel/ControlPanel';
import BlockPalette from './BlockPalette/BlockPalette';
import { useFlowchartExecutor } from '../hooks/useFlowchartExecutor';
import { v4 as uuidv4 } from 'uuid'; // Import uuid for unique IDs

const edgeTypes = {
  custom: CustomEdge,
};

const nodeTypes = {
  custom: CustomNode,
  // Add other node types if necessary
};

function FlowchartCanvas({
  nodes,
  setNodes,
  edges,
  setEdges,
  consoleOutput,
  setConsoleOutput,
  characterPosition,
  setCharacterPosition,
  characterMessage,
  setCharacterMessage,
  isDragging,
  cancelDrag,
  setCancelDrag,
  setIsDragging,
}) {
  const lastNodeId = useRef(null);

  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedEdges, setSelectedEdges] = useState([]);

  // State for BlockPalette modal
  const [paletteVisible, setPaletteVisible] = useState(false);
  const [currentDummyNodeId, setCurrentDummyNodeId] = useState(null);

  // Use the custom hook for executing the flowchart
  const { executeFlowchart, resetExecution } = useFlowchartExecutor(
    nodes,
    edges,
    setConsoleOutput,
    setCharacterPosition,
    setCharacterMessage
  );

  // Reset lastNodeId when nodes change (e.g., after loading a project)
  useEffect(() => {
    if (nodes.length > 0) {
      lastNodeId.current = nodes[nodes.length - 1].id;
      console.log(`Updated lastNodeId to "${lastNodeId.current}" after nodes change.`);
    } else {
      lastNodeId.current = null;
      console.log('Reset lastNodeId to null as there are no nodes.');
    }
  }, [nodes]);

  // Handler for connecting nodes
  const onConnect = useCallback(
    (params) => {
      console.log('onConnect params:', params);

      const originalSourceHandle = params.sourceHandle;
      let sourceHandleType = params.sourceHandle;

      if (sourceHandleType) {
        sourceHandleType = sourceHandleType.split('-')[0];
      }

      let label = '';
      let edgeStyle = { stroke: '#555', strokeWidth: 3 };

      switch (sourceHandleType) {
        case 'yes':
          label = 'True';
          edgeStyle = { stroke: 'green', strokeWidth: 3 };
          break;
        case 'no':
          label = 'False';
          edgeStyle = { stroke: 'red', strokeWidth: 3, strokeDasharray: '5,5' };
          break;
        case 'loop':
          label = 'Loop';
          edgeStyle = { stroke: '#555', strokeWidth: 3 };
          break;
        default:
          label = '';
      }

      setEdges((eds) =>
        addEdge(
          {
            ...params,
            sourceHandle: originalSourceHandle,
            label,
            animated: sourceHandleType === 'yes' || sourceHandleType === 'no',
            style: edgeStyle,
            labelBgStyle: {
              fill: 'white',
              color: edgeStyle.stroke,
              fillOpacity: 0.7,
            },
            type: 'custom',
            markerEnd: { type: MarkerType.ArrowClosed },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  // Handler for drag over event
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handler for selecting a block from the palette
  const onSelectBlock = useCallback(
    (selectedBlockType) => {
      if (!currentDummyNodeId) return;

      // Find the dummy node to replace
      const nodeToReplace = nodes.find((node) => node.id === currentDummyNodeId);
      if (!nodeToReplace) {
        console.error(`No node found with id: ${currentDummyNodeId}`);
        setPaletteVisible(false);
        setCurrentDummyNodeId(null);
        return;
      }

      let newNode = null;

      if (selectedBlockType === 'operator') {
        newNode = {
          id: uuidv4(), // Use uuid for unique IDs
          type: 'operator', // Use 'operator' type
          position: nodeToReplace.position,
          data: {
            label: 'Operator',
            nodeType: 'operator',
            operator: '', // Operator to be selected within the node
            operand1: '',
            operand2: '',
            resultVar: '',
            varName: '',
            varValue: '',
            leftOperand: '',
            rightOperand: '',
          },
        };
      } else {
        // For other block types, create as per previous logic
        newNode = {
          id: uuidv4(), // Use uuid for unique IDs
          type: 'custom',
          position: nodeToReplace.position,
          data: {
            label: `${selectedBlockType.charAt(0).toUpperCase() + selectedBlockType.slice(1)}`,
            nodeType: selectedBlockType,
            // Add any other necessary data fields based on block type
          },
        };
      }

      // Replace the dummy node with the new node
      setNodes((nds) =>
        nds.map((node) => (node.id === currentDummyNodeId ? newNode : node))
      );

      // Optionally, update edges connected to the dummy node
      // This depends on how you want the flow to continue after replacement
      // For simplicity, we'll leave existing edges as they are

      setPaletteVisible(false);
      setCurrentDummyNodeId(null);
      console.log(`Replaced dummy node "${currentDummyNodeId}" with "${selectedBlockType}" node.`);
    },
    [currentDummyNodeId, nodes, setNodes]
  );

  // Handler for opening the palette when a dummy node is clicked
  const handleSelectBlockClick = useCallback((nodeId) => {
    setCurrentDummyNodeId(nodeId);
    setPaletteVisible(true);
    console.log(`Selected dummy node "${nodeId}" for replacement.`);
  }, []);

  // Handler for dropping nodes onto the canvas
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      // **Check if Drag was Canceled**
      if (cancelDrag) {
        console.log('Drag was canceled. Ignoring drop.');
        setCancelDrag(false); // Reset the cancelDrag state
        return;
      }

      const reactFlowBounds = event.target.getBoundingClientRect();
      const nodeType = event.dataTransfer.getData('application/reactflow');

      if (!nodeType) return;

      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      const snappedX = Math.round(position.x / 15) * 15;
      const snappedY = Math.round(position.y / 15) * 15;

      if (nodeType === 'while') {
        // Create while start and end nodes
        const whileStartNode = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX, y: snappedY },
          data: {
            label: 'While Start',
            nodeType: 'whileStart',
            condition: '',
            whileEndNodeId: '',
          },
        };

        const whileEndNode = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX + 200, y: snappedY },
          data: {
            label: 'While End',
            nodeType: 'whileEnd',
            condition: '',
            whileStartNodeId: whileStartNode.id,
          },
        };

        // Set the IDs to reference each other
        whileStartNode.data.whileEndNodeId = whileEndNode.id;
        whileEndNode.data.whileStartNodeId = whileStartNode.id;

        // Create a dummy node inside the while loop
        const dummyNode = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX + 100, y: snappedY + 150 },
          data: {
            label: 'Dummy',
            nodeType: 'dummy',
          },
        };

        setNodes((nds) => nds.concat([whileStartNode, dummyNode, whileEndNode]));

        // Connect While Start to Dummy Node
        const edgeStartToDummy = {
          id: `e${whileStartNode.id}-${dummyNode.id}`,
          source: whileStartNode.id,
          target: dummyNode.id,
          type: 'custom',
          animated: false,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#555', strokeWidth: 3 },
          label: '',
        };

        // Connect Dummy Node to While End
        const edgeDummyToEnd = {
          id: `e${dummyNode.id}-${whileEndNode.id}`,
          source: dummyNode.id,
          target: whileEndNode.id,
          type: 'custom',
          animated: false,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#555', strokeWidth: 3 },
          label: '',
        };

        // Connect While End back to While Start (Loop Back Edge)
        const loopBackEdge = {
          id: `e${whileEndNode.id}-${whileStartNode.id}`,
          source: whileEndNode.id,
          target: whileStartNode.id,
          sourceHandle: `loopBack-${whileEndNode.id}`,
          type: 'custom',
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#555', strokeWidth: 3 },
          label: 'Loop',
        };

        setEdges((eds) => eds.concat([edgeStartToDummy, edgeDummyToEnd, loopBackEdge]));
        console.log(`Added "While" block with nodes and edges.`);
      } else if (nodeType === 'operator') {
        const newNode = {
          id: uuidv4(),
          type: 'custom', // Set to 'custom'
          position: { x: snappedX, y: snappedY },
          data: {
            label: 'Operator',
            nodeType: 'operator', // Specify nodeType
            operator: '', // Operator to be selected within the node
            operand1: '',
            operand2: '',
            resultVar: '',
          },
        };
      
        setNodes((nds) => nds.concat(newNode));
      
        if (lastNodeId.current) {
          const newEdge = {
            id: `e${lastNodeId.current}-${newNode.id}`,
            source: lastNodeId.current,
            target: newNode.id,
            type: 'custom',
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { stroke: '#555', strokeWidth: 3 },
            label: '',
          };
          setEdges((eds) => eds.concat(newEdge));
          console.log(`Connected node "${lastNodeId.current}" to new "Operator" node "${newNode.id}".`);
        }
      
        lastNodeId.current = newNode.id;
      } else if (nodeType === 'if') {
        // Create the 'if' node
        const ifNode = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX, y: snappedY },
          data: {
            label: 'If Then',
            nodeType: 'if',
          },
        };

        // Create dummy nodes for True and False branches
        const dummyTrueNode = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX - 150, y: snappedY + 150 },
          data: {
            label: 'True Action',
            nodeType: 'dummy',
          },
        };

        const dummyFalseNode = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX + 150, y: snappedY + 150 },
          data: {
            label: 'False Action',
            nodeType: 'dummy',
          },
        };

        setNodes((nds) => nds.concat([ifNode, dummyTrueNode, dummyFalseNode]));

        // Connect the 'if' node to the dummy nodes
        const edgeIfToTrue = {
          id: `e${ifNode.id}-${dummyTrueNode.id}`,
          source: ifNode.id,
          target: dummyTrueNode.id,
          sourceHandle: `yes-${ifNode.id}`,
          type: 'custom',
          animated: false,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: 'green', strokeWidth: 3 },
          label: 'True',
        };

        const edgeIfToFalse = {
          id: `e${ifNode.id}-${dummyFalseNode.id}`,
          source: ifNode.id,
          target: dummyFalseNode.id,
          sourceHandle: `no-${ifNode.id}`,
          type: 'custom',
          animated: false,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: 'red', strokeWidth: 3, strokeDasharray: '5,5' },
          label: 'False',
        };

        setEdges((eds) => eds.concat([edgeIfToTrue, edgeIfToFalse]));
        console.log(`Added "If" block with nodes and edges.`);
      }
      else if (nodeType === 'changeVariable') {
        const newNode = {
          id: uuidv4(),
          type: 'custom', // Must be 'custom'
          position: { x: snappedX, y: snappedY },
          data: {
            label: 'Change Variable',
            nodeType: 'changeVariable', // Must match nodeMapping
            varName: '',
            varValue: 0,
          },
        };
      
        setNodes((nds) => nds.concat(newNode));
      
        if (lastNodeId.current) {
          const newEdge = {
            id: `e${lastNodeId.current}-${newNode.id}`,
            source: lastNodeId.current,
            target: newNode.id,
            type: 'custom',
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { stroke: '#555', strokeWidth: 3 },
            label: '',
          };
          setEdges((eds) => eds.concat(newEdge));
          console.log(`Connected node "${lastNodeId.current}" to new "Change Variable" node "${newNode.id}".`);
        }
      
        lastNodeId.current = newNode.id;
      }
      else {
        // Create the new node without auto-connecting edges
        const newNode = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX, y: snappedY },
          data: {
            label: `${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)}`,
            nodeType,
            action: '',
            message: '',
          },
        };

        setNodes((nds) => nds.concat(newNode));

        if (lastNodeId.current) {
          const newEdge = {
            id: `e${lastNodeId.current}-${newNode.id}`,
            source: lastNodeId.current,
            target: newNode.id,
            type: 'custom',
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { stroke: '#555', strokeWidth: 3 },
            label: '',
          };
          setEdges((eds) => eds.concat(newEdge));
          console.log(`Connected node "${lastNodeId.current}" to new "${nodeType}" node "${newNode.id}".`);
        }

        lastNodeId.current = newNode.id;
      }
    },
    [setNodes, setEdges, handleSelectBlockClick, cancelDrag, setCancelDrag]
  );

  // Handler for selection changes
  const onSelectionChange = useCallback(({ nodes: selectedNodes, edges: selectedEdges }) => {
    setSelectedNodes(selectedNodes);
    setSelectedEdges(selectedEdges);
    console.log(`Selected nodes: ${selectedNodes.map(n => n.id).join(', ')}`);
    console.log(`Selected edges: ${selectedEdges.map(e => e.id).join(', ')}`);
  }, []);

  return (
    <div
      className="flowchart-container"
      style={{ width: '100%', height: '100%', position: 'relative' }}
    >
      {/* The actual ReactFlow area */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        snapToGrid={true}
        snapGrid={[15, 15]}
        defaultEdgeOptions={{
          type: 'custom',
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#555', strokeWidth: 3 },
        }}
        onNodesChange={(changes) => {
          // Use the imported applyNodeChanges utility function
          setNodes((nds) => applyNodeChanges(changes, nds));
        }}
        onEdgesChange={(changes) => {
          // Use the imported applyEdgeChanges utility function
          setEdges((eds) => applyEdgeChanges(changes, eds));
        }}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        <Controls />
        <Background color="#aaa" gap={16} />
      </ReactFlow>

      {/* Run, Reset, and Delete Buttons */}
      <ControlPanel
        executeFlowchart={executeFlowchart}
        resetExecution={resetExecution}
        selectedNodes={selectedNodes}
        selectedEdges={selectedEdges}
        setNodes={setNodes}
        setEdges={setEdges}
      />

      {/* Block Palette Modal */}
      {paletteVisible && (
        <BlockPalette
          onSelectBlock={onSelectBlock}
          onClose={() => {
            setPaletteVisible(false);
            setCurrentDummyNodeId(null);
            console.log('Block palette closed.');
          }}
          isDragging={isDragging}
          setIsDragging={setIsDragging}
          setCancelDrag={setCancelDrag}
        />
      )}
    </div>
  );
}

export default FlowchartCanvas;