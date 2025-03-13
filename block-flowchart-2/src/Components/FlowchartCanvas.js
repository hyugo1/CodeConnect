// src/Components/FlowchartCanvas.js
import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  Controls,
  Background,
  MiniMap,
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
  // State for currently executing block/edge and selection.
  const [activeBlockId, setActiveBlockId] = useState(null);
  const [activeEdgeId, setActiveEdgeId] = useState(null);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedEdges, setSelectedEdges] = useState([]);
  // Palette state for replacing dummy blocks.
  const [paletteVisible, setPaletteVisible] = useState(false);
  const [currentDummyBlockId, setCurrentDummyBlockId] = useState(null);
  const [dummyBlockPosition, setDummyBlockPosition] = useState(null);
  const [helpShown, setHelpShown] = useState({});
  const [helpModal, setHelpModal] = useState({ visible: false, title: '', content: '' });

  // ReactFlow wrapper & project() function.
  const reactFlowWrapper = useRef(null);
  const { project } = useReactFlow();

  // Track last added block for auto-connection.
  const lastBlockId = useRef(null);
  useEffect(() => {
    if (blocks.length > 0) {
      lastBlockId.current = blocks[blocks.length - 1].id;
    } else {
      lastBlockId.current = null;
    }
  }, [blocks]);

  // This function replaces dummy blocks with a new block type.
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
      // NEW CHECK: Prevent replacing a while loop body dummy with an End block.
      if (newBlockType === 'end' && blockToReplace.data.dummyFor === 'whileBody') {
        alert("Cannot replace the dummy block for the while loop body with an End block.");
        return;
      }
      let additionalData = {};
      if (newBlockType === 'if') {
        additionalData = { leftOperand: '', operator: '', rightOperand: '' };
      } else if (newBlockType === 'whileStart') {
        additionalData = { leftOperand: '', operator: '', rightOperand: '' };
      }
      // Flash the dummy block to indicate replacement is starting.
      setNodes((nds) =>
        nds.map((b) =>
          b.id === dummyId ? { ...b, data: { ...b.data, flash: true } } : b
        )
      );
  
      setTimeout(() => {
        if (newBlockType === 'if') {
          // Update the dummy block into an if block (keeping its ID)
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
          // Create two new dummy nodes for the branches
          const dummyTrue = {
            id: uuidv4(),
            type: 'custom',
            position: {
              x: blockToReplace.position.x - 150,
              y: blockToReplace.position.y + 150,
            },
            data: {
              label: 'Placeholder (True Action)',
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
              label: 'Placeholder (False Action)',
              blockType: 'dummy',
              dummyAllowed: true,
            },
          };
          // Create the join block positioned below the dummies
          const joinBlock = {
            id: uuidv4(),
            type: 'custom',
            position: {
              x: blockToReplace.position.x,
              y: blockToReplace.position.y + 300,
            },
            data: {
              label: 'Join',
              blockType: 'join',
            },
          };
  
          // Replace the dummy with the updated if block and add new nodes
          setNodes((nds) =>
            nds.map((b) => (b.id === dummyId ? updatedIfBlock : b)).concat([
              dummyTrue,
              dummyFalse,
              joinBlock,
            ])
          );
  
          // Create new edges from the if block to the two dummy branches.
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
  
          // Create edges from the dummy branches to the join block.
          const edgeTrueToJoin = {
            id: uuidv4(),
            source: dummyTrue.id,
            target: joinBlock.id,
            type: 'custom',
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { stroke: '#555', strokeWidth: 3 },
          };
          const edgeFalseToJoin = {
            id: uuidv4(),
            source: dummyFalse.id,
            target: joinBlock.id,
            type: 'custom',
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { stroke: '#555', strokeWidth: 3 },
          };
  
          // Re-route any existing outgoing edge from the replaced dummy so it now starts from the join block.
          setEdges((eds) => {
            const reRoutedEdges = eds.map((e) =>
              e.source === dummyId ? { ...e, source: joinBlock.id } : e
            );
            return reRoutedEdges.concat([
              newEdgeIfTrue,
              newEdgeIfFalse,
              edgeTrueToJoin,
              edgeFalseToJoin,
            ]);
          });
        } else if (newBlockType === 'whileStart') {
          // Update the dummy block into a while block.
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
          // Create a dummy for the while loop body and one for exit.
          const dummyBody = {
            id: uuidv4(),
            type: 'custom',
            position: {
              x: blockToReplace.position.x - 100,
              y: blockToReplace.position.y + 150,
            },
            data: {
              label: 'Placeholder (While Loop)',
              blockType: 'dummy',
              dummyAllowed: true,
              dummyFor: 'whileBody',
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
              label: 'Placeholder (Exit Block)',
              blockType: 'dummy',
              dummyAllowed: true,
            },
          };
  
          // Replace the dummy with the updated while block and add new nodes.
          setNodes((nds) =>
            nds.map((b) => (b.id === dummyId ? updatedWhileBlock : b)).concat([
              dummyBody,
              dummyExit,
            ])
          );
  
          // Create new edges from the while block to the dummy nodes.
          const newEdgeWhileBody = {
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
          const newEdgeWhileExit = {
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
  
          // Re-route any existing outgoing edge from the replaced dummy so it now originates from the dummy exit.
          setEdges((eds) => {
            const reRoutedEdges = eds.map((e) =>
              e.source === dummyId ? { ...e, source: dummyExit.id } : e
            );
            return reRoutedEdges.concat([newEdgeWhileBody, newEdgeWhileExit, newLoopBackEdge]);
          });
        } else {
          // For other block types, simply replace the dummy block.
          let newBlockData;
          if (newBlockType === 'changeVariable') {
            newBlockData = {
              label: 'Adjust Variable',
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

  // Example: auto-connect new block from the last block (if not End).
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

  // Wrap CustomBlock to pass additional props for dummy replacement.
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

  // Full onDrop handler with dummy branch creation (including while loop changes).
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
          data: { label: 'Placeholder (True Action)', blockType: 'dummy', dummyAllowed: true },
        };
        const dummyFalse = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX + 150, y: snappedY + 150 },
          data: { label: 'Placeholder (False Action)', blockType: 'dummy', dummyAllowed: true },
        };

        // Create the join block (positioned below the dummies)
        const joinBlock = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX, y: snappedY + 300 },
          data: { label: 'Join', blockType: 'join' },
        };

        // Add the nodes to the canvas
        setNodes((nds) => nds.concat([ifBlock, dummyTrue, dummyFalse, joinBlock]));

        // Create edges from the if block to the dummy blocks
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

        // Create edges from both dummy blocks to the join block
        const edgeTrueToJoin = {
          id: uuidv4(),
          source: dummyTrue.id,
          target: joinBlock.id,
          type: 'custom',
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#555', strokeWidth: 3 },
        };
        const edgeFalseToJoin = {
          id: uuidv4(),
          source: dummyFalse.id,
          target: joinBlock.id,
          type: 'custom',
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#555', strokeWidth: 3 },
        };

        // Add all the new edges
        setEdges((eds) => eds.concat([edgeIfTrue, edgeIfFalse, edgeTrueToJoin, edgeFalseToJoin]));
      } else if (blockType === 'whileStart') {
        // Create a While block with two dummy branches.
        const whileBlock = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX, y: snappedY },
          data: { label: 'While', blockType: 'whileStart', leftOperand: '', operator: '', rightOperand: '' },
        };
        // Create the dummy for the loop body and add dummyFor: 'whileBody'.
        const dummyBody = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX - 100, y: snappedY + 150 },
          data: { label: 'Placeholder (While Loop)', blockType: 'dummy', dummyAllowed: true, dummyFor: 'whileBody' },
        };
        const dummyExit = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX + 150, y: snappedY + 150 },
          data: { label: 'Placeholder (Exit While)', blockType: 'dummy', dummyAllowed: true },
        };
        setNodes((nds) => nds.concat([whileBlock, dummyBody, dummyExit]));
        // autoConnectFromLast(whileBlock.id);
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
        //auto connect
        // if (lastBlockId.current) {
        //   const lastBlock = blocks.find((b) => b.id === lastBlockId.current);
        //   if (lastBlock && lastBlock.data.blockType.toLowerCase() !== 'end') {
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
        //   }
        // }
        // lastBlockId.current = newBlock.id;
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
  
      // Help modal logic (omitted for brevity)
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

  // Render the ReactFlow canvas, control panel, palette overlay, and help modal.
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
        // ... additional ReactFlow props and event handlers ...
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
        // ... other event handlers ...
      >
        <MiniMap
          style={{
            backgroundColor: document.body.classList.contains('dark-mode') ? '#2c2c2c' : '#fff'
          }}
          nodeStrokeColor={(node) => {
            if (node.style?.background) return node.style.background;
            return document.body.classList.contains('dark-mode') ? '#f0f0f0' : '#333';
          }}
          nodeColor={(node) => {
            if (node.style?.background) return node.style.background;
            return document.body.classList.contains('dark-mode') ? '#333' : '#aaa';
          }}
          nodeBorderRadius={2}
        />
        <Controls />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
  
      <ControlPanel
        executeFlowchart={useFlowchartExecutor(
          blocks,
          edges,
          setConsoleOutput,
          setCharacterPosition,
          setCharacterMessage,
          setActiveBlockId,
          setActiveEdgeId
        ).executeFlowchart}
        resetExecution={useFlowchartExecutor(
          blocks,
          edges,
          setConsoleOutput,
          setCharacterPosition,
          setCharacterMessage,
          setActiveBlockId,
          setActiveEdgeId
        ).resetExecution}
        setSpeedMultiplier={useFlowchartExecutor(
          blocks,
          edges,
          setConsoleOutput,
          setCharacterPosition,
          setCharacterMessage,
          setActiveBlockId,
          setActiveEdgeId
        ).setSpeedMultiplier}
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