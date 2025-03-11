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

import { auth } from '../config/firebase';
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
  // State to track which block types have already shown help on first drop (local state only)
  const [helpShown, setHelpShown] = useState({});
  // State for help modal (replacing alert)
  const [helpModal, setHelpModal] = useState({ visible: false, title: '', content: '' });

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
      let additionalData = {};
      if (newBlockType === 'if') {
        additionalData = { leftOperand: '', operator: '', rightOperand: '' };
      } else if (newBlockType === 'whileStart') {
        additionalData = { leftOperand: '', operator: '', rightOperand: '' };
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
            label: 'Loop Back',
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

  // Wrap CustomBlock to pass additional props (for dummy replacement)
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

  const { onConnect, onDragOver } = useFlowchartHandlers({
    project,
    reactFlowWrapper,
    setNodes,
    setEdges,
    cancelDrag,
    setCancelDrag,
    blocks,
    lastBlockId,
  });

  // Helper: auto-connect new block from previous block (if previous block is not "end")
  const autoConnectFromLast = (newBlockId) => {
    if (lastBlockId.current) {
      const lastBlock = blocks.find((b) => b.id === lastBlockId.current);
      if (lastBlock && lastBlock.data.blockType.toLowerCase() !== 'end') {
        const edge = {
          id: uuidv4(),
          source: lastBlockId.current,
          target: newBlockId,
          type: 'custom',
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#555', strokeWidth: 3 },
        };
        setEdges((eds) => eds.concat(edge));
      }
    }
    lastBlockId.current = newBlockId;
  };

  // Instead of alert, show help via modal
  const showHelpModalForBlock = (blockType) => {
    let title = '';
    let helpContent = '';
    switch (blockType) {
      case 'setVariable':
        title = 'Set Variable';
        helpContent = 'Set Variable: Create a variable with a name and a value.';
        break;
      case 'if':
        title = 'If Then';
        helpContent = 'If Then: Create a decision block with two branches (true and false) that are automatically connected.';
        break;
      case 'whileStart':
        title = 'While';
        helpContent = 'While: Create a loop with a body (for looping) and an exit branch that are automatically connected (plus a loopback edge).';
        break;
      case 'print':
        title = 'Print';
        helpContent = 'Print: Output a message to the console.';
        break;
      case 'move':
        title = 'Move';
        helpContent = 'Move: Move your character in a specified direction by a given distance.';
        break;
      case 'changeVariable':
        title = 'Change Variable';
        helpContent = 'Change Variable: Modify the value of an existing variable.';
        break;
      case 'start':
        title = 'Start';
        helpContent = 'Start: The beginning of your flowchart.';
        break;
      case 'end':
        title = 'End';
        helpContent = 'End: The end of your flowchart.';
        break;
      default:
        title = blockType;
        helpContent = `Help for ${blockType} block.`;
    }
    setHelpModal({ visible: true, title, content: helpContent });
  };

  // Full onDrop handler with dummy branch creation, auto-connection, and modal help
  const handleDrop = useCallback(
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

      if (blockType === 'if') {
        // Create an If block with two dummy branches
        const ifBlock = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX, y: snappedY },
          data: { label: 'If Then', blockType: 'if', leftOperand: '', operator: '', rightOperand: '' },
        };
        const dummyTrue = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX - 150, y: snappedY + 150 },
          data: { label: 'Dummy (True Action)', blockType: 'dummy', dummyAllowed: true },
        };
        const dummyFalse = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX + 150, y: snappedY + 150 },
          data: { label: 'Dummy (False Action)', blockType: 'dummy', dummyAllowed: true },
        };
        setNodes((nds) => nds.concat([ifBlock, dummyTrue, dummyFalse]));
        autoConnectFromLast(ifBlock.id);
        const edgeIfTrue = {
          id: uuidv4(),
          source: ifBlock.id,
          target: dummyTrue.id,
          sourceHandle: `yes-${ifBlock.id}`,
          type: 'custom',
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: 'green', strokeWidth: 3 },
          label: 'True',
        };
        const edgeIfFalse = {
          id: uuidv4(),
          source: ifBlock.id,
          target: dummyFalse.id,
          sourceHandle: `no-${ifBlock.id}`,
          type: 'custom',
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: 'red', strokeWidth: 3 },
          label: 'False',
        };
        setEdges((eds) => eds.concat([edgeIfTrue, edgeIfFalse]));
      } else if (blockType === 'whileStart') {
        // Create a While block with two dummy branches
        const whileBlock = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX, y: snappedY },
          data: { label: 'While', blockType: 'whileStart', leftOperand: '', operator: '', rightOperand: '' },
        };
        const dummyBody = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX - 100, y: snappedY + 150 },
          data: { label: 'Dummy (While Loop)', blockType: 'dummy', dummyAllowed: true },
        };
        const dummyExit = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX + 150, y: snappedY + 150 },
          data: { label: 'Dummy (Exit While Block)', blockType: 'dummy', dummyAllowed: true },
        };
        setNodes((nds) => nds.concat([whileBlock, dummyBody, dummyExit]));
        autoConnectFromLast(whileBlock.id);
        const edgeWhileBody = {
          id: uuidv4(),
          source: whileBlock.id,
          target: dummyBody.id,
          sourceHandle: `body-${whileBlock.id}`,
          type: 'custom',
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: 'green', strokeWidth: 3 },
          label: 'True',
        };
        const edgeWhileExit = {
          id: uuidv4(),
          source: whileBlock.id,
          target: dummyExit.id,
          sourceHandle: `exit-${whileBlock.id}`,
          type: 'custom',
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: 'red', strokeWidth: 3 },
          label: 'False',
        };
        const edgeLoopBack = {
          id: uuidv4(),
          source: dummyBody.id,
          target: whileBlock.id,
          sourceHandle: 'loopBack-dummy',
          targetHandle: `loopBack-${whileBlock.id}`,
          type: 'custom',
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#555', strokeWidth: 3 },
          label: 'Loop Back',
        };
        setEdges((eds) => eds.concat([edgeWhileBody, edgeWhileExit, edgeLoopBack]));
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
          const lastBlock = blocks.find((b) => b.id === lastBlockId.current);
          if (lastBlock && lastBlock.data.blockType.toLowerCase() !== 'end') {
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

      // Determine a storage key that depends on the current user's login state.
      const userId = auth.currentUser ? auth.currentUser.uid : 'anonymous';
      const storageKey = `blockExplanationShown_${userId}_${blockType}`;

      if (!localStorage.getItem(storageKey)) {
        showHelpModalForBlock(blockType);
        localStorage.setItem(storageKey, 'true');
      }

      // Only show the explanation modal if it has not been shown for THIS user (persisted via localStorage)
      if (!helpShown[blockType] && !localStorage.getItem(storageKey)) {
        showHelpModalForBlock(blockType);
        setHelpShown((prev) => ({ ...prev, [blockType]: true }));
        localStorage.setItem(storageKey, 'true');
      }
    },
    [cancelDrag, project, reactFlowWrapper, setCancelDrag, setNodes, setEdges, helpShown, blocks, lastBlockId]
  );

  const onDragOverHandler = useCallback((event) => {
    event.preventDefault();
    const targetElement = event.target;
    if (targetElement.closest('.dummy-block')) {
      event.dataTransfer.dropEffect = 'copy';
    } else {
      event.dataTransfer.dropEffect = 'move';
    }
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
        onEdgesChange={(changes) =>
          setEdges((eds) => {
            const updatedEdges = applyEdgeChanges(changes, eds);
            // Ensure that loopback edges always have the label "Loop Back"
            return updatedEdges.map((edge) => {
              if (edge.sourceHandle && edge.sourceHandle.startsWith('loopBack')) {
                return { ...edge, label: 'Loop Back' };
              }
              return edge;
            });
          })
        }
        onConnect={onConnect}
        onSelectionChange={({ nodes, edges }) => {
          setSelectedNodes(nodes.map((node) => node.id));
          setSelectedEdges(edges.map((edge) => edge.id));
        }}
        onDrop={handleDrop}
        onDragOver={onDragOverHandler}
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

      {helpModal.visible && (
        <div className="help-modal-overlay" onClick={() => setHelpModal({ ...helpModal, visible: false })}>
          <div className="help-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{helpModal.title}</h3>
            <p>{helpModal.content}</p>
            <button onClick={() => setHelpModal({ ...helpModal, visible: false })} className="help-modal-close">
              Got It!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FlowchartCanvas;