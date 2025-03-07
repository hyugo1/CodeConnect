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
  ConnectionLineType,
} from 'reactflow';
import 'reactflow/dist/style.css';

import CustomBlock from './CustomBlock/CustomBlock';
import CustomEdge from './CustomEdge/CustomEdge';
import ControlPanel from './ControlPanel/ControlPanel';
import { useFlowchartExecutor } from '../hooks/useFlowchartExecutor';
import { v4 as uuidv4 } from 'uuid';

import useFlowchartHandlers from './useFlowchartHandlers';
import PaletteOverlay from './PaletteOverlay';

import './FlowchartCanvas.css';

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
  // Dummy block palette position
  const [dummyBlockPosition, setDummyBlockPosition] = useState(null);

  // ReactFlow wrapper & project() function
  const reactFlowWrapper = useRef(null);
  const { project } = useReactFlow();

  // Track last added block
  const lastBlockId = useRef(null);
  useEffect(() => {
    if (blocks.length > 0) {
      lastBlockId.current = blocks[blocks.length - 1].id;
    } else {
      lastBlockId.current = null;
    }
  }, [blocks]);

  // Handler for replacing a dummy block.
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
  
      setNodes((nds) =>
        nds.map((b) =>
          b.id === dummyId ? { ...b, data: { ...b.data, flash: true } } : b
        )
      );
  
      setTimeout(() => {
        if (newBlockType === 'if') {
          const updatedIfBlock = {
            ...blockToReplace,
            data: {
              ...blockToReplace.data,
              label: 'If Then',
              blockType: 'if',
              leftOperand: '',
              operator: '',
              rightOperand: '',
              flash: false,
            },
          };
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
          setNodes((nds) =>
            nds.map((b) => (b.id === dummyId ? updatedIfBlock : b)).concat([dummyTrue, dummyFalse])
          );
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
        } else if (newBlockType === 'whileStart') {
          const updatedWhileBlock = {
            ...blockToReplace,
            data: {
              ...blockToReplace.data,
              label: 'While',
              blockType: 'whileStart',
              leftOperand: '',
              operator: '',
              rightOperand: '',
              flash: false,
            },
          };
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
          setNodes((nds) =>
            nds.map((b) => (b.id === dummyId ? updatedWhileBlock : b)).concat([dummyBody, dummyExit])
          );
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
            data: { ...blockToReplace.data, ...newBlockData, flash: false, className: 'replacement-success' },
          };
          setNodes((nds) => nds.map((b) => (b.id === dummyId ? newBlock : b)));
        }
        setPaletteVisible(false);
        setCurrentDummyBlockId(null);
        setDummyBlockPosition(null);
      }, 500);
    },
    [blocks, setNodes, setEdges]
  );

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
        onReplace={(dummyId, e) => {
          if (e && e.currentTarget) {
            const rect = e.currentTarget.getBoundingClientRect();
            setDummyBlockPosition({ top: rect.top, left: rect.right + 10 });
          } else {
            setDummyBlockPosition({ top: 100, left: 100 });
          }
          setCurrentDummyBlockId(dummyId);
          setPaletteVisible(true);
        }}
      />
    ),
    [activeBlockId]
  );
  const nodeTypes = useMemo(() => ({ custom: CustomBlockWrapper }), [CustomBlockWrapper]);

  const CustomEdgeWrapper = useCallback(
    (props) => <CustomEdge {...props} activeEdgeId={activeEdgeId} />,
    [activeEdgeId]
  );
  const edgeTypes = useMemo(() => ({ custom: CustomEdgeWrapper }), [CustomEdgeWrapper]);

  // Get event handlers from the custom hook
  const { onConnect, onDrop, onDragOver, onSelectionChange } = useFlowchartHandlers({
    project,
    reactFlowWrapper,
    setNodes,
    setEdges,
    cancelDrag,
    setCancelDrag,
    blocks,
    lastBlockId,
  });

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
        onSelectionChange={({ nodes, edges }) => {
          setSelectedNodes(nodes.map((node) => node.id));
          setSelectedEdges(edges.map((edge) => edge.id));
        }}
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

      {paletteVisible && dummyBlockPosition && (
        <PaletteOverlay
          dummyBlockPosition={dummyBlockPosition}
          setPaletteVisible={setPaletteVisible}
          currentDummyBlockId={currentDummyBlockId}
          handleReplaceDummyBlock={handleReplaceDummyBlock}
          isDragging={isDragging}
          setIsDragging={setIsDragging}
          setCancelDrag={setCancelDrag}
        />
      )}
    </div>
  );
}

export default FlowchartCanvas;