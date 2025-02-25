// src/Components/FlowchartCanvas.js

import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  Controls,
  Background,
  MarkerType,
  applyNodeChanges,
  applyEdgeChanges,
  useReactFlow,
  ConnectionLineType, // For smoothstep edges
} from 'reactflow';
import 'reactflow/dist/style.css';

import CustomBlock from './CustomBlock/CustomBlock';
import CustomEdge from './CustomEdge/CustomEdge';
import ControlPanel from './ControlPanel/ControlPanel';
import BlockPalette from './BlockPalette/BlockPalette';
import { useFlowchartExecutor } from '../hooks/useFlowchartExecutor';
import { v4 as uuidv4 } from 'uuid';

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
  // State for which block/edge is currently "executing" (highlighted)
  const [activeBlockId, setActiveBlockId] = useState(null);
  const [activeEdgeId, setActiveEdgeId] = useState(null);

  // Selection state
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedEdges, setSelectedEdges] = useState([]);

  // Whether to show the palette to replace a dummy block
  const [paletteVisible, setPaletteVisible] = useState(false);
  const [currentDummyBlockId, setCurrentDummyBlockId] = useState(null);

  // ReactFlow wrapper + project() to convert screen coords -> flow coords
  const reactFlowWrapper = useRef(null);
  const { project } = useReactFlow();

  // Track the last added block (for auto-connecting, if you want)
  const lastBlockId = useRef(null);
  useEffect(() => {
    if (blocks.length > 0) {
      lastBlockId.current = blocks[blocks.length - 1].id;
    } else {
      lastBlockId.current = null;
    }
  }, [blocks]);

  // Hook that executes the flowchart
  const { executeFlowchart, resetExecution, setSpeedMultiplier } = useFlowchartExecutor(
    blocks,
    edges,
    setConsoleOutput,
    setCharacterPosition,
    setCharacterMessage,
    setActiveBlockId,
    setActiveEdgeId
  );

  // Wrap CustomBlock so it receives activeBlockId
  const CustomBlockWrapper = useCallback(
    (props) => <CustomBlock {...props} activeBlockId={activeBlockId} />,
    [activeBlockId]
  );
  const nodeTypes = useMemo(() => ({ custom: CustomBlockWrapper }), [CustomBlockWrapper]);

  // Wrap CustomEdge so it receives activeEdgeId
  const CustomEdgeWrapper = useCallback(
    (props) => <CustomEdge {...props} activeEdgeId={activeEdgeId} />,
    [activeEdgeId]
  );
  const edgeTypes = useMemo(() => ({ custom: CustomEdgeWrapper }), [CustomEdgeWrapper]);

  /**
   * When user draws an edge between two blocks,
   * we apply styling + optional labels based on the source handle.
   */
  const onConnect = useCallback(
    (params) => {
      const originalSourceHandle = params.sourceHandle;
      let sourceHandleType = params.sourceHandle;
      if (sourceHandleType) {
        // e.g., "true-<id>" -> "true"
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
          edgeStyle = { stroke: 'red', strokeWidth: 3 };
          break;
        case 'true':
          label = 'True';
          edgeStyle = { stroke: 'green', strokeWidth: 3 };
          break;
        case 'false':
          label = 'False';
          edgeStyle = { stroke: 'red', strokeWidth: 3 };
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
            animated: false,
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

  /**
   * Allows dragging nodes from the palette onto the flow area.
   * We must prevent default to allow dropping.
   */
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';

    
  }, []);

  /**
   * Replaces a "dummy" block with the real block type
   * selected from the palette.
   */
  const onSelectBlock = useCallback(
    (selectedBlockType) => {
      if (!currentDummyBlockId) return;
  
      // Find the block to replace.
      const blockToReplace = blocks.find((block) => block.id === currentDummyBlockId);
      if (!blockToReplace) {
        setPaletteVisible(false);
        setCurrentDummyBlockId(null);
        return;
      }
  
      // Check if this dummy block is allowed to be replaced.
      // (Assuming that in your block data you add a property `dummyAllowed`.)
      if (!blockToReplace.data.dummyAllowed) {
        // For non-replaceable blocks, simply do nothing or show a message.
        alert("This block cannot be replaced.");
        return;
      }
  
      // Otherwise, create the new block based on the selected type.
      let newBlock = null;
      if (selectedBlockType === 'changeVariable') {
        newBlock = {
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
      } else if (selectedBlockType === 'setVariable') {
        newBlock = {
          id: uuidv4(),
          type: 'custom',
          position: blockToReplace.position,
          data: {
            label: 'Set Variable',
            blockType: 'setVariable',
            varName: '',
            varValue: '',
            valueType: 'number',
          },
        };
      } else if (selectedBlockType === 'if') {
        newBlock = {
          id: uuidv4(),
          type: 'custom',
          position: blockToReplace.position,
          data: {
            label: 'If Then',
            blockType: 'if',
            leftOperand: '',
            operator: '',
            rightOperand: '',
          },
        };
      } else if (selectedBlockType === 'while') {
        newBlock = {
          id: uuidv4(),
          type: 'custom',
          position: blockToReplace.position,
          data: {
            label: 'While',
            blockType: 'while',
            leftOperand: '',
            operator: '',
            rightOperand: '',
          },
        };
      } else {
        // Fallback for other types.
        newBlock = {
          id: uuidv4(),
          type: 'custom',
          position: blockToReplace.position,
          data: {
            label: `${selectedBlockType.charAt(0).toUpperCase() + selectedBlockType.slice(1)}`,
            blockType: selectedBlockType,
          },
        };
      }
  
      // Replace the dummy block.
      setNodes((nds) =>
        nds.map((block) => (block.id === currentDummyBlockId ? newBlock : block))
      );
      setPaletteVisible(false);
      setCurrentDummyBlockId(null);
    },
    [currentDummyBlockId, blocks, setNodes]
  );

  /**
   * If the user clicks an edge, we toggle selection in state
   */
  const handleEdgeClick = useCallback(
    (edgeId) => {
      setSelectedEdges((prevSelected) => {
        if (prevSelected.includes(edgeId)) {
          return prevSelected.filter((id) => id !== edgeId);
        } else {
          return [...prevSelected, edgeId];
        }
      });
    },
    [setSelectedEdges]
  );

  /**
   * If user clicks a "dummy" block, open the palette to let them choose a real block type
   */
  const handleSelectBlockClick = useCallback((blockId) => {
    setCurrentDummyBlockId(blockId);
    setPaletteVisible(true);
  }, []);

  /**
   * Handler for dropping a new block from the left palette onto the flow area.
   * We also create 2 dummy blocks: one for the loop body (true) and one for the exit (false).
   */
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      if (cancelDrag) {
        setCancelDrag(false);
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const blockType = event.dataTransfer.getData('application/reactflow');
      if (!blockType) return;

      const dropPoint = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };
      const position = project(dropPoint);
      const snappedX = Math.round(position.x / 15) * 15;
      const snappedY = Math.round(position.y / 15) * 15;

      if (blockType === 'while') {
        const whileStartBlock = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX, y: snappedY },
          data: {
            label: 'While',
            blockType: 'whileStart',
            leftOperand: '',
            operator: '',
            rightOperand: '',
          },
        };
      
        // Create the dummy node for the while body.
        // (We mark it with a flag so we know later to use it for the loopback edge.)
        const dummyBody = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX - 100, y: snappedY + 150 },
          data: {
            label: 'Dummy (While Loop)',
            blockType: 'dummy',
            isWhileBody: true,
          },
        };
      
        // Create the dummy node for the false branch (exit)
        const dummyExit = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX + 150, y: snappedY + 150 },
          data: {
            label: 'Dummy (Exit While Block)',
            blockType: 'dummy',
          },
        };
      
        // Add the three nodes.
        setNodes((nds) => nds.concat([whileStartBlock, dummyBody, dummyExit]));
      
        // Create the true branch edge from While Start to dummyBody.
        const edgeWhileTrue = {
          id: uuidv4(),
          source: whileStartBlock.id,
          target: dummyBody.id,
          sourceHandle: `true-${whileStartBlock.id}`,
          type: 'custom',
          animated: false,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: 'green', strokeWidth: 3 },
          label: 'True',
        };
      
        // Create the false branch edge from While Start to dummyExit.
        const edgeWhileFalse = {
          id: uuidv4(),
          source: whileStartBlock.id,
          target: dummyExit.id,
          sourceHandle: `false-${whileStartBlock.id}`,
          type: 'custom',
          animated: false,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: 'red', strokeWidth: 3 },
          label: 'False',
        };
      
        // Create a loopback edge from the dummyBody back to the While Start.
        // Here we use a fixed sourceHandle id ("loopBack-dummy") for the dummy (even if it does not render one)
        // and expect the While Start block to render a left-hand target handle with id `loopBack-{id}`.
        const loopBackEdge = {
          id: uuidv4(),
          source: dummyBody.id,
          target: whileStartBlock.id,
          sourceHandle: 'loopBack-dummy',
          targetHandle: `loopBack-${whileStartBlock.id}`,
          type: 'custom',
          animated: false,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#555', strokeWidth: 3 },
          label: 'Loop',
        };
        setEdges((eds) => eds.concat([edgeWhileTrue, edgeWhileFalse, loopBackEdge]));
      
        console.log('Added "While Start" block with dummy blocks and a loopback edge.');
      }
      
      // else if (blockType === 'forLoop') {
      //   // ... existing code for forLoop
      //   const forLoopStartBlock = {
      //     id: uuidv4(),
      //     type: 'custom',
      //     position: { x: snappedX, y: snappedY },
      //     data: {
      //       label: 'For Loop Start',
      //       blockType: 'forLoopStart',
      //       arrayVar: 'myArray',
      //       indexVar: 'i',
      //     },
      //   };
      //   const dummyBlock = {
      //     id: uuidv4(),
      //     type: 'custom',
      //     position: { x: snappedX + 100, y: snappedY + 150 },
      //     data: {
      //       label: 'Dummy',
      //       blockType: 'dummy',
      //     },
      //   };
      //   setNodes((nds) => nds.concat([forLoopStartBlock, dummyBlock]));

      //   const edgeStartToDummy = {
      //     id: uuidv4(),
      //     source: forLoopStartBlock.id,
      //     target: dummyBlock.id,
      //     type: 'custom',
      //     animated: false,
      //     markerEnd: { type: MarkerType.ArrowClosed },
      //     style: { stroke: '#555', strokeWidth: 3 },
      //     label: '',
      //     sourceHandle: `body-${forLoopStartBlock.id}`,
      //   };
      //   setEdges((eds) => eds.concat([edgeStartToDummy]));
      //   console.log('Added "For Loop" start + dummy block for body.');
      // }
      else if (blockType === 'if') {
        const ifBlock = {
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
        const dummyTrueBlock = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX - 150, y: snappedY + 150 },
          data: {
            label: 'Dummy (True Action)',
            blockType: 'dummy',
          },
        };
        const dummyFalseBlock = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX + 150, y: snappedY + 150 },
          data: {
            label: 'Dummy (False Action)',
            blockType: 'dummy',
          },
        };
        setNodes((nds) => nds.concat([ifBlock, dummyTrueBlock, dummyFalseBlock]))
        const edgeIfToTrue = {
          id: uuidv4(),
          source: ifBlock.id,
          target: dummyTrueBlock.id,
          sourceHandle: `yes-${ifBlock.id}`,
          type: 'custom',
          animated: false,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: 'green', strokeWidth: 3 },
          label: 'True',
        };
        const edgeIfToFalse = {
          id: uuidv4(),
          source: ifBlock.id,
          target: dummyFalseBlock.id,
          sourceHandle: `no-${ifBlock.id}`,
          type: 'custom',
          animated: false,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: 'red', strokeWidth: 3 },
          label: 'False',
        };
        setEdges((eds) => eds.concat([edgeIfToTrue, edgeIfToFalse]));
        console.log('Added "If" block with dummy blocks for True/False branches.');
      }
      // else if (blockType === 'function') {
      //   const newBlock = {
      //     id: uuidv4(),
      //     type: 'custom',
      //     position: { x: snappedX, y: snappedY },
      //     data: {
      //       label: 'Function',
      //       blockType: 'function',
      //       operator: '',
      //       operand1: '',
      //       operand2: '',
      //       resultVar: '',
      //     },
      //   };
      //   setNodes((nds) => nds.concat(newBlock));
      //   if (lastBlockId.current) {
      //     const newEdge = {
      //       id: uuidv4(),
      //       source: lastBlockId.current,
      //       target: newBlock.id,
      //       type: 'custom',
      //       animated: false,
      //       markerEnd: { type: MarkerType.ArrowClosed },
      //       style: { stroke: '#555', strokeWidth: 3 },
      //       label: '',
      //     };
      //     setEdges((eds) => eds.concat(newEdge));
      //     console.log(`Connected block "${lastBlockId.current}" -> "Function" block "${newBlock.id}".`);
      //   }
      //   lastBlockId.current = newBlock.id;
      // }
      else if (blockType === 'start' || blockType === 'end' || blockType === 'changeVariable' ||
               blockType === 'setVariable' || blockType === 'move' || blockType === 'print') {
        // ... existing code for simple blocks
        const newBlock = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX, y: snappedY },
          data: {
            label: `${blockType.charAt(0).toUpperCase() + blockType.slice(1)}`,
            blockType,
          },
        };
        setNodes((nds) => nds.concat(newBlock));
        if (lastBlockId.current) {
          const newEdge = {
            id: uuidv4(),
            source: lastBlockId.current,
            target: newBlock.id,
            type: 'custom',
            animated: false,
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { stroke: '#555', strokeWidth: 3 },
            label: '',
          };
          setEdges((eds) => eds.concat(newEdge));
        }
        lastBlockId.current = newBlock.id;
      }
      else {
        // Default fallback if needed
        const newBlock = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX, y: snappedY },
          data: {
            label: `${blockType.charAt(0).toUpperCase() + blockType.slice(1)}`,
            blockType,
          },
        };
        setNodes((nds) => nds.concat(newBlock));
      }
    },
    [cancelDrag, project, setNodes, setEdges, setCancelDrag]
  );

  /**
   * Called when the user changes selection (blocks or edges).
   */
  const onSelectionChange = useCallback(({ nodes, edges }) => {
    setSelectedNodes(nodes.map((node) => node.id));
    setSelectedEdges(edges.map((edge) => edge.id));
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
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        // Enable snap to grid if you want
        snapToGrid={true}
        snapGrid={[15, 15]}
        // Provide default edge options (arrow, styling)
        defaultEdgeOptions={{
          type: 'custom',
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#555', strokeWidth: 3 },
        }}
        // Use a smooth step line type to help edges curve around nodes
        connectionLineType={ConnectionLineType.SmoothStep}
        // Optionally style the in-progress edge
        connectionLineStyle={{ stroke: '#999', strokeWidth: 2 }}
        onNodesChange={(changes) => setNodes((nds) => applyNodeChanges(changes, nds))}
        onEdgesChange={(changes) => setEdges((eds) => applyEdgeChanges(changes, eds))}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onEdgeClick={(event, edge) => {
          event.preventDefault();
          // Toggle selection of the clicked edge
          setSelectedEdges((prev) =>
            prev.includes(edge.id) ? prev.filter((id) => id !== edge.id) : [...prev, edge.id]
          );
        }}
        onPaneClick={() => {
          // Deselect everything when clicking the blank pane
          setSelectedEdges([]);
          setSelectedNodes([]);
        }}
      >
        <Controls />
        <Background color="#aaa" gap={16} />
      </ReactFlow>

      {/* The ControlPanel has "Run", "Reset", "Speed Up", etc. */}
      <ControlPanel
        executeFlowchart={executeFlowchart}
        resetExecution={resetExecution}
        setSpeedMultiplier={setSpeedMultiplier}
        selectedNodes={selectedNodes}
        selectedEdges={selectedEdges}
        setNodes={setNodes}
        setEdges={setEdges}
      />

      {/* The BlockPalette for replacing dummy blocks */}
      {paletteVisible && (
        <BlockPalette
          onSelectBlock={onSelectBlock}
          isDragging={isDragging}
          setIsDragging={setIsDragging}
          setCancelDrag={setCancelDrag}
        />
      )}
    </div>
  );
}

export default FlowchartCanvas;