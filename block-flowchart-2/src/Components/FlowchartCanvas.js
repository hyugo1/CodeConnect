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

  // Whether to show the palette for replacing dummy blocks
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

  // Handler for connecting nodes with edges
  const onConnect = useCallback(
    (params) => {
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

  // Modified onDragOver: Check if dragging over a dummy block.
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    // Set default drop effect.
    event.dataTransfer.dropEffect = 'move';

    // Check if the element under the pointer is a dummy block.
    const targetElement = event.target;
    const dummyBlock = targetElement.closest('.dummy-block');
    if (dummyBlock) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }, []);

  // Modified onDrop: Replace dummy block if dropping on one.
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

      // Check if the drop target is a dummy block.
      const targetElement = event.target;
      const dummyBlockElement = targetElement.closest('.dummy-block');
      if (dummyBlockElement) {
        const dummyBlockId = dummyBlockElement.dataset.id;
        const dummyNode = blocks.find((block) => block.id === dummyBlockId);

        if (dummyNode && dummyNode.data.blockType === 'dummy') {
          // Prevent replacing with an invalid block type.
          if (blockType === 'start') {
            alert('Start blocks cannot replace dummy blocks.');
            return;
          }
          // Create a new block using the dummy block's id and position.
          let newBlock = null;
          if (blockType === 'changeVariable') {
            newBlock = {
              id: dummyNode.id,
              type: 'custom',
              position: dummyNode.position,
              data: {
                label: 'Change Variable',
                blockType: 'changeVariable',
                varName: '',
                varValue: '',
              },
            };
          } else if (blockType === 'setVariable') {
            newBlock = {
              id: dummyNode.id,
              type: 'custom',
              position: dummyNode.position,
              data: {
                label: 'Set Variable',
                blockType: 'setVariable',
                varName: '',
                varValue: '',
                valueType: 'number',
              },
            };
          } else if (blockType === 'if') {
            newBlock = {
              id: dummyNode.id,
              type: 'custom',
              position: dummyNode.position,
              data: {
                label: 'If Then',
                blockType: 'if',
                leftOperand: '',
                operator: '',
                rightOperand: '',
              },
            };
          } else if (blockType === 'while') {
            newBlock = {
              id: dummyNode.id,
              type: 'custom',
              position: dummyNode.position,
              data: {
                label: 'While',
                blockType: 'while',
                leftOperand: '',
                operator: '',
                rightOperand: '',
              },
            };
          } else {
            newBlock = {
              id: dummyNode.id,
              type: 'custom',
              position: dummyNode.position,
              data: {
                label: blockType.charAt(0).toUpperCase() + blockType.slice(1),
                blockType,
              },
            };
          }

          // Replace the dummy block.
          setNodes((nds) =>
            nds.map((block) => (block.id === dummyNode.id ? newBlock : block))
          );
          return;
        }
      }

      // If not dropped on a dummy block, proceed with the normal drop logic.
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
          sourceHandle: `true-${whileStartBlock.id}`,
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
          sourceHandle: `false-${whileStartBlock.id}`,
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

        console.log('Added "While Start" block with dummy blocks and a loopback edge.');
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
      } else {
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
    [cancelDrag, project, setNodes, setCancelDrag, blocks, setEdges]
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
        togglePause={() => {}}
        paused={false}
        setSpeedMultiplier={setSpeedMultiplier}
        selectedNodes={selectedNodes}
        selectedEdges={selectedEdges}
        setNodes={setNodes}
        setEdges={setEdges}
      />

      {paletteVisible && (
        <BlockPalette
          onSelectBlock={() => {}}
          isDragging={isDragging}
          setIsDragging={setIsDragging}
          setCancelDrag={setCancelDrag}
        />
      )}
    </div>
  );
}

export default FlowchartCanvas;