import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  Controls,
  Background,
  MarkerType,
  applyNodeChanges,
  applyEdgeChanges,
  useReactFlow,
  ConnectionLineType,
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
  // State for currently executing block/edge
  const [activeBlockId, setActiveBlockId] = useState(null);
  const [activeEdgeId, setActiveEdgeId] = useState(null);

  // Selection state
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedEdges, setSelectedEdges] = useState([]);

  // Palette state for replacing dummy blocks
  const [paletteVisible, setPaletteVisible] = useState(false);
  const [currentDummyBlockId, setCurrentDummyBlockId] = useState(null);

  // ReactFlow wrapper & project() function for coordinate conversion
  const reactFlowWrapper = useRef(null);
  const { project } = useReactFlow();

  // Track last added block (for auto-connecting, if desired)
  const lastBlockId = useRef(null);
  useEffect(() => {
    if (blocks.length > 0) {
      lastBlockId.current = blocks[blocks.length - 1].id;
    } else {
      lastBlockId.current = null;
    }
  }, [blocks]);

  // Handler for replacing a dummy block
  const handleReplaceDummyBlock = useCallback(
    (dummyId, newBlockType) => {
      const blockToReplace = blocks.find((block) => block.id === dummyId);
      if (!blockToReplace) return;
      if (blockToReplace.data.dummyAllowed === false) {
        alert("This block cannot be replaced.");
        return;
      }
      if (newBlockType === 'start') {
        alert("Cannot replace a dummy block with a start block.");
        return;
      }
  
      // For structured control blocks, create additional dummy nodes and connecting edges
      if (newBlockType === 'if') {
        // Update the dummy block to become an If block
        const updatedIfBlock = {
          ...blockToReplace,
          data: {
            ...blockToReplace.data,
            label: 'If Then',
            blockType: 'if',
            leftOperand: '',
            operator: '',
            rightOperand: '',
          },
        };
        // Create new dummy nodes for the True and False branches
        const dummyTrue = {
          id: uuidv4(),
          type: 'custom',
          position: {
            x: blockToReplace.position.x - 150,
            y: blockToReplace.position.y + 150,
          },
          data: {
            label: 'Dummy (True Action)',
            blockType: 'dummy',
            dummyAllowed: true,
          },
        };
        const dummyFalse = {
          id: uuidv4(),
          type: 'custom',
          position: {
            x: blockToReplace.position.x + 150,
            y: blockToReplace.position.y + 150,
          },
          data: {
            label: 'Dummy (False Action)',
            blockType: 'dummy',
            dummyAllowed: true,
          },
        };
  
        // Replace the dummy block with the updated if block and add new dummy nodes
        setNodes((nds) =>
          nds.map((b) => (b.id === dummyId ? updatedIfBlock : b)).concat([dummyTrue, dummyFalse])
        );
        // Create new edges from the if block to the true and false dummy nodes
        const newEdgeIfTrue = {
          id: uuidv4(),
          source: updatedIfBlock.id,
          target: dummyTrue.id,
          sourceHandle: `yes-${updatedIfBlock.id}`,
          type: 'custom',
          animated: false,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: 'green', strokeWidth: 3 },
          label: 'True',
        };
        const newEdgeIfFalse = {
          id: uuidv4(),
          source: updatedIfBlock.id,
          target: dummyFalse.id,
          sourceHandle: `no-${updatedIfBlock.id}`,
          type: 'custom',
          animated: false,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: 'red', strokeWidth: 3 },
          label: 'False',
        };
        setEdges((eds) => eds.concat([newEdgeIfTrue, newEdgeIfFalse]));
      } else if (newBlockType === 'while') {
        // Update the dummy block to become a While block
        const updatedWhileBlock = {
          ...blockToReplace,
          data: {
            ...blockToReplace.data,
            label: 'While',
            blockType: 'whileStart',
            leftOperand: '',
            operator: '',
            rightOperand: '',
          },
        };
        // Create dummy nodes for the loop body and the exit path
        const dummyBody = {
          id: uuidv4(),
          type: 'custom',
          position: {
            x: blockToReplace.position.x - 100,
            y: blockToReplace.position.y + 150,
          },
          data: {
            label: 'Dummy (While Loop)',
            blockType: 'dummy',
            dummyAllowed: true,
          },
        };
        const dummyExit = {
          id: uuidv4(),
          type: 'custom',
          position: {
            x: blockToReplace.position.x + 150,
            y: blockToReplace.position.y + 150,
          },
          data: {
            label: 'Dummy (Exit While Block)',
            blockType: 'dummy',
            dummyAllowed: true,
          },
        };
        // Replace the dummy block and add the new dummy nodes
        setNodes((nds) =>
          nds.map((b) => (b.id === dummyId ? updatedWhileBlock : b)).concat([dummyBody, dummyExit])
        );
        // Create edges connecting the while block to its body and exit nodes
        const newEdgeWhileTrue = {
          id: uuidv4(),
          source: updatedWhileBlock.id,
          target: dummyBody.id,
          sourceHandle: `body-${updatedWhileBlock.id}`,
          type: 'custom',
          animated: false,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: 'green', strokeWidth: 3 },
          label: 'True',
        };
        const newEdgeWhileFalse = {
          id: uuidv4(),
          source: updatedWhileBlock.id,
          target: dummyExit.id,
          sourceHandle: `exit-${updatedWhileBlock.id}`,
          type: 'custom',
          animated: false,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: 'red', strokeWidth: 3 },
          label: 'False',
        };
        // Also add a loopback edge from the loop body back to the while block
        const newLoopBackEdge = {
          id: uuidv4(),
          source: dummyBody.id,
          target: updatedWhileBlock.id,
          sourceHandle: 'loopBack-dummy',
          targetHandle: `loopBack-${updatedWhileBlock.id}`,
          type: 'custom',
          animated: false,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#555', strokeWidth: 3 },
          label: 'Loop',
        };
        setEdges((eds) => eds.concat([newEdgeWhileTrue, newEdgeWhileFalse, newLoopBackEdge]));
      } else {
        // For all other block types, simply update the dummy block's data
        let newBlockData;
        if (newBlockType === 'changeVariable') {
          newBlockData = {
            label: 'Change Variable',
            blockType: 'changeVariable',
            varName: '',
            varValue: '',
          };
        } else if (newBlockType === 'setVariable') {
          newBlockData = {
            label: 'Set Variable',
            blockType: 'setVariable',
            varName: '',
            varValue: '',
            valueType: 'number',
          };
        } else {
          newBlockData = {
            label: newBlockType.charAt(0).toUpperCase() + newBlockType.slice(1),
            blockType: newBlockType,
          };
        }
        const newBlock = {
          ...blockToReplace,
          data: { ...blockToReplace.data, ...newBlockData },
        };
        setNodes((nds) => nds.map((b) => (b.id === dummyId ? newBlock : b)));
      }
      // Hide the palette after replacement
      setPaletteVisible(false);
      setCurrentDummyBlockId(null);
    },
    [blocks, setNodes, setEdges]
  );

  // Flowchart execution hook
  const { executeFlowchart, resetExecution, setSpeedMultiplier } = useFlowchartExecutor(
    blocks,
    edges,
    setConsoleOutput,
    setCharacterPosition,
    setCharacterMessage,
    setActiveBlockId,
    setActiveEdgeId
  );

  const CustomBlockWrapper = useCallback(
    (props) => (
      <CustomBlock
        {...props}
        activeBlockId={activeBlockId}
        onReplace={(dummyId) => {
          // When the dummy is clicked, set it as current and show the palette.
          setCurrentDummyBlockId(dummyId);
          setPaletteVisible(true);
        }}
      />
    ),
    [activeBlockId]
  );
  const nodeTypes = useMemo(() => ({ custom: CustomBlockWrapper }), [CustomBlockWrapper]);

  // Wrap CustomEdge so it receives activeEdgeId.
  const CustomEdgeWrapper = useCallback(
    (props) => <CustomEdge {...props} activeEdgeId={activeEdgeId} />,
    [activeEdgeId]
  );
  const edgeTypes = useMemo(() => ({ custom: CustomEdgeWrapper }), [CustomEdgeWrapper]);

  // Handler for connecting nodes with edges.
  const onConnect = useCallback(
    (params) => {
      const originalSourceHandle = params.sourceHandle;
      let sourceHandleType = params.sourceHandle;
      if (sourceHandleType) {
        // Extract the prefix before the dash (e.g., "body" from "body-<id>")
        sourceHandleType = sourceHandleType.split('-')[0];
      }

      let label = '';
      let edgeStyle = { stroke: '#555', strokeWidth: 3 };

      switch (sourceHandleType) {
        case 'yes':
        case 'true':
        case 'body':
          label = 'True';
          edgeStyle = { stroke: 'green', strokeWidth: 3 };
          break;
        case 'no':
        case 'false':
        case 'exit':
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

  // onDragOver: adjust dropEffect based on whether the target is a dummy block.
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    const targetElement = event.target;
    if (targetElement.closest('.dummy-block')) {
      event.dataTransfer.dropEffect = 'copy';
    } else {
      event.dataTransfer.dropEffect = 'move';
    }
  }, []);

  // onDrop handler: create new blocks (or structured blocks) when dropping on the canvas.
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

      const targetElement = event.target;
      const dummyBlockElement = targetElement.closest('.dummy-block');
      // If the drop is on a dummy block AND the block type is not 'while' or 'if',
      // let the DummyBlock component handle replacement.
      if (dummyBlockElement && blockType !== 'while' && blockType !== 'if') {
        return;
      }

      const dropPoint = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };
      const position = project(dropPoint);
      const snappedX = Math.round(position.x / 15) * 15;
      const snappedY = Math.round(position.y / 15) * 15;

      // Create structured blocks for 'while' and 'if'
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
        const dummyBody = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX - 100, y: snappedY + 150 },
          data: {
            label: 'Dummy (While Loop)',
            blockType: 'dummy',
            dummyAllowed: true,
          },
        };
        const dummyExit = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX + 150, y: snappedY + 150 },
          data: {
            label: 'Dummy (Exit While Block)',
            blockType: 'dummy',
            dummyAllowed: true,
          },
        };
        setNodes((nds) => nds.concat([whileStartBlock, dummyBody, dummyExit]));
  
        const edgeWhileTrue = {
          id: uuidv4(),
          source: whileStartBlock.id,
          target: dummyBody.id,
          sourceHandle: `body-${whileStartBlock.id}`,
          type: 'custom',
          animated: false,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: 'green', strokeWidth: 3 },
          label: 'True',
        };
        const edgeWhileFalse = {
          id: uuidv4(),
          source: whileStartBlock.id,
          target: dummyExit.id,
          sourceHandle: `exit-${whileStartBlock.id}`,
          type: 'custom',
          animated: false,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: 'red', strokeWidth: 3 },
          label: 'False',
        };
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
        console.log('Added "While" block with dummy blocks and a loopback edge.');
      } else if (blockType === 'if') {
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
            dummyAllowed: true,
          },
        };
        const dummyFalseBlock = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX + 150, y: snappedY + 150 },
          data: {
            label: 'Dummy (False Action)',
            blockType: 'dummy',
            dummyAllowed: true,
          },
        };
        setNodes((nds) => nds.concat([ifBlock, dummyTrueBlock, dummyFalseBlock]));
  
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
      } else if (
        blockType === 'start' ||
        blockType === 'end' ||
        blockType === 'changeVariable' ||
        blockType === 'setVariable' ||
        blockType === 'move' ||
        blockType === 'print'
      ) {
        const newBlock = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX, y: snappedY },
          data: {
            label: blockType.charAt(0).toUpperCase() + blockType.slice(1),
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
      } else {
        const newBlock = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX, y: snappedY },
          data: {
            label: blockType.charAt(0).toUpperCase() + blockType.slice(1),
            blockType,
          },
        };
        setNodes((nds) => nds.concat(newBlock));
      }
    },
    [cancelDrag, project, setNodes, setEdges, setCancelDrag, blocks]
  );

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
        snapToGrid={true}
        snapGrid={[15, 15]}
        defaultEdgeOptions={{
          type: 'custom',
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#555', strokeWidth: 3 },
        }}
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={{ stroke: '#999', strokeWidth: 2 }}
        onNodesChange={(changes) => setNodes((nds) => applyNodeChanges(changes, nds))}
        onEdgesChange={(changes) => setEdges((eds) => applyEdgeChanges(changes, eds))}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onEdgeClick={(event, edge) => {
          event.preventDefault();
          setSelectedEdges((prev) =>
            prev.includes(edge.id) ? prev.filter((id) => id !== edge.id) : [...prev, edge.id]
          );
        }}
        onPaneClick={() => {
          setSelectedEdges([]);
          setSelectedNodes([]);
        }}
      >
        <Controls />
        <Background color="#aaa" gap={16} />
      </ReactFlow>

      <ControlPanel
        executeFlowchart={executeFlowchart}
        resetExecution={resetExecution}
        setSpeedMultiplier={setSpeedMultiplier}
        selectedNodes={selectedNodes}
        selectedEdges={selectedEdges}
        setNodes={setNodes}
        setEdges={setEdges}
      />

      {paletteVisible && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1000,
            backgroundColor: 'rgba(0,0,0,0.2)',
          }}
          onClick={(e) => {
            e.stopPropagation();
            setPaletteVisible(false);
            setCurrentDummyBlockId(null);
          }}
        >
          <BlockPalette
            onSelectBlock={(selectedBlockType) => {
              if (!currentDummyBlockId) return;
              handleReplaceDummyBlock(currentDummyBlockId, selectedBlockType);
            }}
            isDragging={isDragging}
            setIsDragging={setIsDragging}
            setCancelDrag={setCancelDrag}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

export default FlowchartCanvas;