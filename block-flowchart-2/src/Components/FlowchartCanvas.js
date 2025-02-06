// src/Components/FlowchartCanvas.js
import React, { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  Controls,
  Background,
  MarkerType,
  applyNodeChanges,
  applyEdgeChanges,
  // Import useReactFlow to access the project() function
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './CustomBlock/CustomBlock';
import CustomEdge from './CustomEdge/CustomEdge';
import ControlPanel from './ControlPanel/ControlPanel';
import BlockPalette from './BlockPalette/BlockPalette';
import { useFlowchartExecutor } from '../hooks/useFlowchartExecutor';
import { v4 as uuidv4 } from 'uuid';

const edgeTypes = {
  custom: CustomEdge,
};

const blockTypes = {
  custom: CustomNode,
};

function FlowchartCanvas({
  blocks,
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

  // Selection state managed internally
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedEdges, setSelectedEdges] = useState([]);

  // State for BlockPalette modal
  const [paletteVisible, setPaletteVisible] = useState(false);
  const [currentDummyNodeId, setCurrentDummyNodeId] = useState(null);

  // Use the custom hook for executing the flowchart
  const { executeFlowchart, resetExecution } = useFlowchartExecutor(
    blocks,
    edges,
    setConsoleOutput,
    setCharacterPosition,
    setCharacterMessage
  );

  // Add a ref for the ReactFlow wrapper to calculate drop positions accurately
  const reactFlowWrapper = useRef(null);

  // Get the project function from React Flow
  const { project } = useReactFlow();

  // Reset lastNodeId when blocks change (e.g., after loading a project)
  useEffect(() => {
    if (blocks.length > 0) {
      lastNodeId.current = blocks[blocks.length - 1].id;
      console.log(`Updated lastNodeId to "${lastNodeId.current}" after blocks change.`);
    } else {
      lastNodeId.current = null;
      console.log('Reset lastNodeId to null as there are no blocks.');
    }
  }, [blocks]);

  // Handler for connecting blocks
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

      const blockToReplace = blocks.find((block) => block.id === currentDummyNodeId);
      if (!blockToReplace) {
        console.error(`No block found with id: ${currentDummyNodeId}`);
        setPaletteVisible(false);
        setCurrentDummyNodeId(null);
        return;
      }

      let newNode = null;

      if (selectedBlockType === 'operator') {
        newNode = {
          id: uuidv4(),
          type: 'custom',
          position: blockToReplace.position,
          data: {
            label: 'Operator',
            blockType: 'operator',
            operator: '',
            operand1: '',
            operand2: '',
            resultVar: '',
            varName: '',
            varValue: '',
            leftOperand: '',
            rightOperand: '',
          },
        };
      } else if (selectedBlockType === 'changeVariable') {
        newNode = {
          id: uuidv4(),
          type: 'custom',
          position: blockToReplace.position,
          data: {
            label: 'Change Variable',
            blockType: 'changeVariable',
            varName: '',
            varValue: '',
          },
        };
      } else {
        newNode = {
          id: uuidv4(),
          type: 'custom',
          position: blockToReplace.position,
          data: {
            label: `${selectedBlockType.charAt(0).toUpperCase() + selectedBlockType.slice(1)}`,
            blockType: selectedBlockType,
          },
        };
      }

      setNodes((nds) =>
        nds.map((block) => (block.id === currentDummyNodeId ? newNode : block))
      );

      setPaletteVisible(false);
      setCurrentDummyNodeId(null);
      console.log(`Replaced dummy block "${currentDummyNodeId}" with "${selectedBlockType}" block.`);
    },
    [currentDummyNodeId, blocks, setNodes]
  );

  // Handler for edge click
  const handleEdgeClick = useCallback(
    (edgeId) => {
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

  // Handler for opening the palette when a dummy block is clicked
  const handleSelectBlockClick = useCallback((blockId) => {
    setCurrentDummyNodeId(blockId);
    setPaletteVisible(true);
    console.log(`Selected dummy block "${blockId}" for replacement.`);
  }, []);

  // Updated onDrop handler using project() to convert screen coordinates to flow coordinates
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      if (cancelDrag) {
        console.log('Drag was canceled. Ignoring drop.');
        setCancelDrag(false);
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const blockType = event.dataTransfer.getData('application/reactflow');

      if (!blockType) return;

      // Get the drop point relative to the container
      const dropPoint = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      // Convert the drop point to the flow's coordinate system
      const position = project(dropPoint);

      // Optionally snap to grid (15px grid)
      const snappedX = Math.round(position.x / 15) * 15;
      const snappedY = Math.round(position.y / 15) * 15;

      // Create blocks based on blockType
      if (blockType === 'while') {
        const whileStartNode = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX, y: snappedY },
          data: {
            label: 'While Start',
            blockType: 'whileStart',
            leftOperand: '',
            operator: '',
            rightOperand: '',
            whileEndNodeId: '',
          },
        };

        const whileEndNode = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX + 200, y: snappedY },
          data: {
            label: 'While End',
            blockType: 'whileEnd',
            whileStartNodeId: whileStartNode.id,
          },
        };

        whileStartNode.data.whileEndNodeId = whileEndNode.id;
        whileEndNode.data.whileStartNodeId = whileStartNode.id;

        const changeVariableNode = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX + 100, y: snappedY + 150 },
          data: {
            label: 'Change Variable',
            blockType: 'changeVariable',
            varName: '',
            varValue: '1',
          },
        };

        const dummyNode = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX + 100, y: snappedY + 300 },
          data: {
            label: 'Dummy',
            blockType: 'dummy',
          },
        };

        setNodes((nds) => nds.concat([whileStartNode, changeVariableNode, dummyNode, whileEndNode]));

        const edgeStartToChange = {
          id: uuidv4(),
          source: whileStartNode.id,
          target: changeVariableNode.id,
          type: 'custom',
          animated: false,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#555', strokeWidth: 3 },
          label: '',
          sourceHandle: `body-${whileStartNode.id}`,
        };

        const edgeChangeToDummy = {
          id: uuidv4(),
          source: changeVariableNode.id,
          target: dummyNode.id,
          type: 'custom',
          animated: false,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#555', strokeWidth: 3 },
          label: '',
        };

        const edgeDummyToEnd = {
          id: uuidv4(),
          source: dummyNode.id,
          target: whileEndNode.id,
          type: 'custom',
          animated: false,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#555', strokeWidth: 3 },
          label: '',
        };

        const loopBackEdge = {
          id: uuidv4(),
          source: whileEndNode.id,
          target: whileStartNode.id,
          sourceHandle: `loopBack-${whileEndNode.id}`,
          targetHandle: `loopBack-${whileStartNode.id}`,
          type: 'custom',
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#555', strokeWidth: 3 },
          label: 'Loop',
        };

        setEdges((eds) =>
          eds.concat([edgeStartToChange, edgeChangeToDummy, edgeDummyToEnd, loopBackEdge])
        );
        console.log(`Added "While" block with blocks and edges.`);
      } else if (blockType === 'if') {
        const ifNode = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX, y: snappedY },
          data: {
            label: 'If Then',
            blockType: 'if',
            leftOperand: '',
            operator: '',
            rightOperand: '',
          },
        };

        const dummyTrueNode = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX - 150, y: snappedY + 150 },
          data: {
            label: 'Dummy',
            blockType: 'dummy',
          },
        };

        const dummyFalseNode = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX + 150, y: snappedY + 150 },
          data: {
            label: 'Dummy',
            blockType: 'dummy',
          },
        };

        setNodes((nds) => nds.concat([ifNode, dummyTrueNode, dummyFalseNode]));

        const edgeIfToTrue = {
          id: uuidv4(),
          source: ifNode.id,
          target: dummyTrueNode.id,
          sourceHandle: `yes-${ifNode.id}`,
          type: 'custom',
          animated: false,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: 'green', strokeWidth: 3, strokeDasharray: '5,5'  },
          label: 'True',
        };

        const edgeIfToFalse = {
          id: uuidv4(),
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
        console.log(`Added "If" block with dummy blocks for both branches.`);
      } else if (blockType === 'operator') {
        const newNode = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX, y: snappedY },
          data: {
            label: 'Operator',
            blockType: 'operator',
            operator: '',
            operand1: '',
            operand2: '',
            resultVar: '',
          },
        };

        setNodes((nds) => nds.concat(newNode));

        if (lastNodeId.current) {
          const newEdge = {
            id: uuidv4(),
            source: lastNodeId.current,
            target: newNode.id,
            type: 'custom',
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { stroke: '#555', strokeWidth: 3 },
            label: '',
          };
          setEdges((eds) => eds.concat(newEdge));
          console.log(`Connected block "${lastNodeId.current}" to new "Operator" block "${newNode.id}".`);
        }

        lastNodeId.current = newNode.id;
      } else {
        // Fallback for all other block types
        const newNode = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX, y: snappedY },
          data: {
            label: `${blockType.charAt(0).toUpperCase() + blockType.slice(1)}`,
            blockType,
          },
        };
        setNodes((nds) => nds.concat(newNode));
      }
    },
    [setNodes, setEdges, cancelDrag, setCancelDrag, project]
  );

  // Handler for selection changes
  const onSelectionChange = useCallback(({ nodes, edges }) => {
    const selectedNodeIds = nodes.map((node) => node.id);
    const selectedEdgeIds = edges.map((edge) => edge.id);
    setSelectedNodes(selectedNodeIds);
    setSelectedEdges(selectedEdgeIds);
    console.log(`Selected node IDs: ${selectedNodeIds.join(', ')}`);
    console.log(`Selected edge IDs: ${selectedEdgeIds.join(', ')}`);
  }, []);

  return (
    <div
      ref={reactFlowWrapper}
      className="flowchart-container"
      style={{ width: '100%', height: '100%', position: 'relative' }}
    >
      <ReactFlow
        nodes={blocks}
        edges={edges}
        nodeTypes={blockTypes}
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
        onEdgeClick={(event, edge) => {
          event.preventDefault();
          handleEdgeClick(edge.id);
        }}
        onPaneClick={() => {
          setSelectedEdges([]);
          setSelectedNodes([]);
          console.log('Pane clicked. Deselecting all edges and blocks.');
        }}
      >
        <Controls />
        <Background color="#aaa" gap={16} />
      </ReactFlow>

      <ControlPanel
        executeFlowchart={executeFlowchart}
        resetExecution={resetExecution}
        selectedNodes={selectedNodes}
        selectedEdges={selectedEdges}
        setNodes={setNodes}
        setEdges={setEdges}
      />

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