// src/Components/FlowchartCanvas.js

import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  MarkerType,
  applyNodeChanges,
  applyEdgeChanges,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomBlock from './CustomBlock/CustomBlock';
import CustomEdge from './CustomEdge/CustomEdge';
import ControlPanel from './ControlPanel/ControlPanel';
import { useFlowchartExecutor } from '../hooks/useFlowchartExecutor';
import { v4 as uuidv4 } from 'uuid';
import useFlowchartHandlers from './useFlowchartHandlers';
import PaletteOverlay from './PaletteOverlay';
import { ActiveFlowContext } from '../contexts/ActiveFlowContext';
import './FlowchartCanvas.css';

function FlowchartCanvas({
  blocks,
  setNodes,
  edges,
  setEdges,
  setConsoleOutput,
  setCharacterPosition,
  setCharacterMessage,
  isDragging,
  cancelDrag,
  setCancelDrag,
  setIsDragging,
}) {
  const [activeBlockId, setActiveBlockId] = useState(null);
  const [activeEdgeId, setActiveEdgeId] = useState(null);
  const [errorBlockId, setErrorBlockId] = useState(null); 
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedEdges, setSelectedEdges] = useState([]);
  const [paletteVisible, setPaletteVisible] = useState(false);
  const [currentDummyBlockId, setCurrentDummyBlockId] = useState(null);
  const [dummyBlockPosition, setDummyBlockPosition] = useState(null);
  const [helpModal, setHelpModal] = useState({ visible: false, title: '', content: '' });

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
      if (newBlockType === 'end' && blockToReplace.data.dummyFor === 'whileBody') {
        alert("Cannot replace the dummy block for the while loop body with an End block.");
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
          setNodes((nds) =>
            nds.map((b) => (b.id === dummyId ? updatedIfBlock : b)).concat([
              dummyTrue,
              dummyFalse,
              joinBlock,
            ])
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
          setNodes((nds) =>
            nds.map((b) => (b.id === dummyId ? updatedWhileBlock : b)).concat([
              dummyBody,
              dummyExit,
            ])
          );
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
      }, 1000);
    },
    [blocks, setNodes, setEdges] 
  );

  const CustomBlockWrapper = (props) => <CustomBlock {...props} />;
  const nodeTypes = useMemo(() => ({ custom: CustomBlockWrapper }), []);

  const CustomEdgeWrapper = (props) => <CustomEdge {...props} />;
  const edgeTypes = useMemo(() => ({ custom: CustomEdgeWrapper }), []);

  const { onConnect } = useFlowchartHandlers({
    project,
    reactFlowWrapper,
    setNodes,
    setEdges,
    cancelDrag,
    setCancelDrag,
    blocks,
    lastBlockId,
  });

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

        const joinBlock = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX, y: snappedY + 300 },
          data: { label: 'Join', blockType: 'join' },
        };

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

        setEdges((eds) => eds.concat([edgeIfTrue, edgeIfFalse, edgeTrueToJoin, edgeFalseToJoin]));
      } else if (blockType === 'whileStart') {
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
          data: { label: 'Placeholder (While Loop)', blockType: 'dummy', dummyAllowed: true, dummyFor: 'whileBody' },
        };
        const dummyExit = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX + 150, y: snappedY + 150 },
          data: { label: 'Placeholder (Exit While)', blockType: 'dummy', dummyAllowed: true },
        };
        setNodes((nds) => nds.concat([whileBlock, dummyBody, dummyExit]));
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
    [cancelDrag, project, reactFlowWrapper, setCancelDrag, setNodes, setEdges]
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
    <ActiveFlowContext.Provider
      value={{
        activeBlockId,
        activeEdgeId,
        errorBlockId,
        setErrorBlockId, 
        onReplace: (dummyId, e) => {
          if (e && e.currentTarget) {
            const rect = e.currentTarget.getBoundingClientRect();
            setDummyBlockPosition({ top: rect.top, left: rect.right + 10 });
          } else {
            setDummyBlockPosition({ top: 100, left: 100 });
          }
          setCurrentDummyBlockId(dummyId);
          setPaletteVisible(true);
        },
      }}
    >
      <ReactFlow
        nodes={blocks}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        snapToGrid={true}
        snapGrid={[15, 15]}
        onNodesChange={(changes) => setNodes((nds) => applyNodeChanges(changes, nds))}
        onEdgesChange={(changes) =>
          setEdges((eds) => {
            const updatedEdges = applyEdgeChanges(changes, eds);
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
          setActiveEdgeId,
          setErrorBlockId
        ).executeFlowchart}
        resetExecution={useFlowchartExecutor(
          blocks,
          edges,
          setConsoleOutput,
          setCharacterPosition,
          setCharacterMessage,
          setActiveBlockId,
          setActiveEdgeId,
          setErrorBlockId
        ).resetExecution}
        setSpeedMultiplier={useFlowchartExecutor(
          blocks,
          edges,
          setConsoleOutput,
          setCharacterPosition,
          setCharacterMessage,
          setActiveBlockId,
          setActiveEdgeId,
          setErrorBlockId
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
    </ActiveFlowContext.Provider>
    </div>
  );
}

export default FlowchartCanvas;