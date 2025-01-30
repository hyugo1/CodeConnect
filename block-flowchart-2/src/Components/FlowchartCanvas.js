// src/Components/FlowchartCanvas.js

import React, { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  Controls,
  Background,
  MarkerType,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode/CustomNode';
import CustomEdge from './CustomEdge/CustomEdge';
import ControlPanel from './ControlPanel/ControlPanel';
import BlockPalette from './BlockPalette/BlockPalette';
import { useFlowchartExecutor } from '../hooks/useFlowchartExecutor';
import { v4 as uuidv4 } from 'uuid';

const edgeTypes = {
  custom: CustomEdge,
};

const nodeTypes = {
  custom: CustomNode,
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

  // **Selection State Managed Internally**
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
        case 'loopBack':
          label = 'Loop';
          edgeStyle = { stroke: '#555', strokeWidth: 3 };
          break;
        case 'exit':
          label = 'Exit';
          edgeStyle = { stroke: 'blue', strokeWidth: 3 };
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
            animated:
              sourceHandleType === 'yes' ||
              sourceHandleType === 'no' ||
              sourceHandleType === 'loopBack',
            style: edgeStyle,
            labelBgStyle: {
              fill: 'white',
              color: edgeStyle.stroke,
              fillOpacity: 0.7,
            },
            type: 'custom',
            markerEnd: { type: MarkerType.ArrowClosed },
            id: uuidv4(),
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
          // Unique ID
          id: uuidv4(),
          type: 'operator',
          position: nodeToReplace.position,
          data: {
            label: 'Operator',
            nodeType: 'operator',
            operator: '',
            operand1: '',
            operand2: '',
            resultVar: '',
          },
        };
      } else {
        newNode = {
          // Unique ID
          id: uuidv4(),
          type: 'custom',
          position: nodeToReplace.position,
          data: {
            label: `${selectedBlockType.charAt(0).toUpperCase() + selectedBlockType.slice(1)}`,
            nodeType: selectedBlockType,
          },
        };
      }

      setNodes((nds) =>
        nds.map((node) => (node.id === currentDummyNodeId ? newNode : node))
      );

      // Optionally, update edges connected to the dummy node
      // For simplicity, leaving existing edges as they are

      setPaletteVisible(false);
      setCurrentDummyNodeId(null);
      console.log(`Replaced dummy node "${currentDummyNodeId}" with "${selectedBlockType}" node.`);
    },
    [currentDummyNodeId, nodes, setNodes]
  );

  // Handler for edge click
  const handleEdgeClick = useCallback(
    (edgeId) => {
      // Toggle selection of the edge
      setSelectedEdges((prevSelected) => {
        if (prevSelected.includes(edgeId)) {
          return prevSelected.filter((id) => id !== edgeId);
        } else {
          return [...prevSelected, edgeId];
        }
      });
      console.log(`Edge "${edgeId}" clicked and toggled selection.`);
    },
    [setSelectedEdges]
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
        // Capture the current lastNodeId before adding the loop
        const previousLastNodeId = lastNodeId.current;

        // Create While Start Node with condition inputs
        const whileStartNode = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX, y: snappedY },
          data: {
            label: 'While Start',
            nodeType: 'whileStart',
            leftOperand: '',
            operator: '',
            rightOperand: '',
          },
        };

        // Create Dummy Node representing the loop body
        const dummyNode = {
          id: uuidv4(),
          type: 'dummy',
          position: { x: snappedX + 150, y: snappedY },
          data: {
            label: 'Loop Body',
            nodeType: 'dummy',
          },
        };

        // Create While End Node
        const whileEndNode = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX + 300, y: snappedY },
          data: {
            label: 'While End',
            nodeType: 'whileEnd',
          },
        };

        setNodes((nds) => nds.concat([whileStartNode, dummyNode, whileEndNode]));

        // Connect While Start to Loop Body (True condition)
        const edgeStartToBody = {
           // Unique ID
          id: uuidv4(),
          source: whileStartNode.id,
          target: dummyNode.id,
          type: 'custom',
          label: 'True',
          style: { stroke: 'green', strokeWidth: 3 },
          markerEnd: { type: MarkerType.ArrowClosed },
        };

        // Connect Loop Body to While End
        const edgeBodyToEnd = {
           // Unique ID
          id: uuidv4(),
          source: dummyNode.id,
          target: whileEndNode.id,
          type: 'custom',
          label: '',
          style: { stroke: '#555', strokeWidth: 3 },
          markerEnd: { type: MarkerType.ArrowClosed },
        };

        // Connect While End back to While Start (Loop Back Edge)
        const edgeEndToStart = {
           // Unique ID
          id: uuidv4(),
          source: whileEndNode.id,
          sourceHandle: `loopBack-${whileEndNode.id}`,
          target: whileStartNode.id,
          targetHandle: `loopBack-${whileStartNode.id}`,
          type: 'custom',
          label: 'Loop',
          style: { stroke: '#555', strokeWidth: 3 },
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed },
        };

        // Connect While Start to previous node (False condition)
        if (previousLastNodeId) {
          const edgeStartToExit = {
            id: uuidv4(), // Unique ID
            source: whileStartNode.id,
            target: previousLastNodeId,
            type: 'custom',
            label: 'False',
            style: { stroke: 'blue', strokeWidth: 3 },
            markerEnd: { type: MarkerType.ArrowClosed },
          };

          setEdges((eds) =>
            eds.concat([edgeStartToBody, edgeBodyToEnd, edgeEndToStart, edgeStartToExit])
          );
          console.log(
            `Added "While" block with While Start, Loop Body, and While End nodes, connected to previous node "${previousLastNodeId}".`
          );
        } else {
          // If there's no previous node, just add the loop edges
          setEdges((eds) => eds.concat([edgeStartToBody, edgeBodyToEnd, edgeEndToStart]));
          console.log('Added "While" block without connecting False path (no previous node).');
        }

        // Update lastNodeId to WhileEndNode for future connections
        lastNodeId.current = whileEndNode.id;
      } else if (nodeType === 'operator') {
        const newNode = {
          id: uuidv4(),
          type: 'operator',
          position: { x: snappedX, y: snappedY },
          data: {
            label: 'Operator',
            nodeType: 'operator',
            operator: '',
            operand1: '',
            operand2: '',
            resultVar: '',
          },
        };

        setNodes((nds) => nds.concat(newNode));

        if (lastNodeId.current) {
          const newEdge = {
            // Unique ID
            id: uuidv4(),
            source: lastNodeId.current,
            target: newNode.id,
            type: 'custom',
            label: '',
            style: { stroke: '#555', strokeWidth: 3 },
            markerEnd: { type: MarkerType.ArrowClosed },
            animated: true,
          };
          setEdges((eds) => eds.concat(newEdge));
          console.log(
            `Connected node "${lastNodeId.current}" to new "Operator" node "${newNode.id}".`
          );
        }

        lastNodeId.current = newNode.id;
      } else if (nodeType === 'if') {
        // create 'if' node
        const ifNode = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX, y: snappedY },
          data: {
            label: 'If Then',
            nodeType: 'if',
            leftOperand: '',
            operator: '',
            rightOperand: '',
          },
        };

        // Create Dummy Nodes for True and False branches
        const dummyTrueNode = {
          id: uuidv4(),
          type: 'dummy',
          position: { x: snappedX - 150, y: snappedY + 100 },
          data: {
            label: 'True Action',
            nodeType: 'dummy',
          },
        };

        const dummyFalseNode = {
          id: uuidv4(),
          type: 'dummy',
          position: { x: snappedX + 150, y: snappedY + 100 },
          data: {
            label: 'False Action',
            nodeType: 'dummy',
          },
        };

        setNodes((nds) => nds.concat([ifNode, dummyTrueNode, dummyFalseNode]));

        // Connect If Node to True Action
        const edgeIfToTrue = {
           // Unique ID
          id: uuidv4(),
          source: ifNode.id,
          target: dummyTrueNode.id,
          type: 'custom',
          label: 'True',
          style: { stroke: 'green', strokeWidth: 3 },
          markerEnd: { type: MarkerType.ArrowClosed },
        };

        // Connect If Node to False Action
        const edgeIfToFalse = {
           // Unique ID
          id: uuidv4(),
          source: ifNode.id,
          target: dummyFalseNode.id,
          type: 'custom',
          label: 'False',
          style: { stroke: 'red', strokeWidth: 3, strokeDasharray: '5,5' },
          markerEnd: { type: MarkerType.ArrowClosed },
        };

        setEdges((eds) => eds.concat([edgeIfToTrue, edgeIfToFalse]));
        console.log(`Added "If" block with If Node and True/False Action Dummy Nodes.`);
      } else if (nodeType === 'changeVariable') {
        const newNode = {
          id: uuidv4(),
          type: 'custom', 
          position: { x: snappedX, y: snappedY },
          data: {
            label: 'Change Variable',
            nodeType: 'changeVariable',
            varName: '',
            varValue: 0,
          },
        };

        setNodes((nds) => nds.concat(newNode));

        if (lastNodeId.current) {
          const newEdge = {
             // Unique ID
            id: uuidv4(),
            source: lastNodeId.current,
            target: newNode.id,
            type: 'custom',
            label: '',
            style: { stroke: '#555', strokeWidth: 3 },
            markerEnd: { type: MarkerType.ArrowClosed },
            animated: true,
          };
          setEdges((eds) => eds.concat(newEdge));
          console.log(
            `Connected node "${lastNodeId.current}" to new "Change Variable" node "${newNode.id}".`
          );
        }

        lastNodeId.current = newNode.id;
      } else {
        // Create the new node without auto-connecting edges
        const newNode = {
          // Unique ID
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
            // Unique ID
            id: uuidv4(), 
            source: lastNodeId.current,
            target: newNode.id,
            type: 'custom',
            label: '',
            style: { stroke: '#555', strokeWidth: 3 },
            markerEnd: { type: MarkerType.ArrowClosed },
            animated: true,
          };
          setEdges((eds) => eds.concat(newEdge));
          console.log(
            `Connected node "${lastNodeId.current}" to new "${nodeType}" node "${newNode.id}".`
          );
        }

        lastNodeId.current = newNode.id;
      }
    },
    [setNodes, setEdges, cancelDrag, setCancelDrag]
  );

  // Handler for selection changes
  const onSelectionChange = useCallback(
    ({ nodes: selectedNodesObj, edges: selectedEdgesObj }) => {
      const selectedNodeIds = selectedNodesObj.map((node) => node.id);
      const selectedEdgeIds = selectedEdgesObj.map((edge) => edge.id);
      setSelectedNodes(selectedNodeIds);
      setSelectedEdges(selectedEdgeIds);
      console.log(`Selected node IDs: ${selectedNodeIds.join(', ')}`);
      console.log(`Selected edge IDs: ${selectedEdgeIds.join(', ')}`);
    },
    [setSelectedNodes, setSelectedEdges]
  );

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
          setNodes((nds) => applyNodeChanges(changes, nds));
        }}
        onEdgesChange={(changes) => {
          setEdges((eds) => applyEdgeChanges(changes, eds));
        }}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        onDrop={onDrop}
        onDragOver={onDragOver}
        // **Add onEdgeClick handler**
        onEdgeClick={(event, edge) => {
          event.preventDefault();
          handleEdgeClick(edge.id);
        }}
        // Optional: Deselect edges and nodes when clicking on canvas
        onPaneClick={() => {
          setSelectedEdges([]);
          setSelectedNodes([]);
          console.log('Pane clicked. Deselecting all edges and nodes.');
        }}
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