import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
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
  // Create state for active (executing) block and edge IDs
  const [activeBlockId, setActiveBlockId] = useState(null);
  const [activeEdgeId, setActiveEdgeId] = useState(null);

  // Existing selection state
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedEdges, setSelectedEdges] = useState([]);

  // State for showing the Block Palette
  const [paletteVisible, setPaletteVisible] = useState(false);
  const [currentDummyBlockId, setCurrentDummyBlockId] = useState(null);

  // ReactFlow wrapper ref and project() function
  const reactFlowWrapper = useRef(null);
  const { project } = useReactFlow();

  // Ref to track the last added block's ID
  const lastBlockId = useRef(null);
  useEffect(() => {
    if (blocks.length > 0) {
      lastBlockId.current = blocks[blocks.length - 1].id;
      console.log(`Updated lastBlockId to "${lastBlockId.current}" after blocks change.`);
    } else {
      lastBlockId.current = null;
      console.log('Reset lastBlockId to null as there are no blocks.');
    }
  }, [blocks]);

  // Use the flowchart executor hook and pass the active ID setters
  const { executeFlowchart, resetExecution } = useFlowchartExecutor(
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
          edgeStyle = { stroke: 'red', strokeWidth: 3 };
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

  // Handler for drag over event
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handler for selecting a block from the palette
  const onSelectBlock = useCallback(
    (selectedBlockType) => {
      if (!currentDummyBlockId) return;
      const blockToReplace = blocks.find((block) => block.id === currentDummyBlockId);
      if (!blockToReplace) {
        console.error(`No block found with id: ${currentDummyBlockId}`);
        setPaletteVisible(false);
        setCurrentDummyBlockId(null);
        return;
      }
      let newBlock = null;
      if (selectedBlockType === 'function') {
        newBlock = {
          id: uuidv4(),
          type: 'custom',
          position: blockToReplace.position,
          data: {
            label: 'Function',
            blockType: 'function',
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
      } else {
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
      setNodes((nds) =>
        nds.map((block) => (block.id === currentDummyBlockId ? newBlock : block))
      );
      setPaletteVisible(false);
      setCurrentDummyBlockId(null);
      console.log(`Replaced dummy block "${currentDummyBlockId}" with "${selectedBlockType}" block.`);
    },
    [currentDummyBlockId, blocks, setNodes]
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
    setCurrentDummyBlockId(blockId);
    setPaletteVisible(true);
    console.log(`Selected dummy block "${blockId}" for replacement.`);
  }, []);

  // onDrop handler using project() to convert screen coordinates to flow coordinates
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
            label: 'While Start',
            blockType: 'whileStart',
            leftOperand: '',
            operator: '',
            rightOperand: '',
            whileEndBlockId: '',
          },
        };
        const whileEndBlock = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX + 200, y: snappedY },
          data: {
            label: 'While End',
            blockType: 'whileEnd',
            whileStartBlockId: whileStartBlock.id,
          },
        };
        whileStartBlock.data.whileEndBlockId = whileEndBlock.id;
        whileEndBlock.data.whileStartBlockId = whileStartBlock.id;
        const changeVariableBlock = {
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
        const dummyBlock = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX + 100, y: snappedY + 300 },
          data: {
            label: 'Dummy',
            blockType: 'dummy',
          },
        };
        setNodes((nds) => nds.concat([whileStartBlock, changeVariableBlock, dummyBlock, whileEndBlock]));
        const edgeStartToChange = {
          id: uuidv4(),
          source: whileStartBlock.id,
          target: changeVariableBlock.id,
          type: 'custom',
          animated: false,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#555', strokeWidth: 3 },
          label: '',
          sourceHandle: `body-${whileStartBlock.id}`,
        };
        const edgeChangeToDummy = {
          id: uuidv4(),
          source: changeVariableBlock.id,
          target: dummyBlock.id,
          type: 'custom',
          animated: false,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#555', strokeWidth: 3 },
          label: '',
        };
        const edgeDummyToEnd = {
          id: uuidv4(),
          source: dummyBlock.id,
          target: whileEndBlock.id,
          type: 'custom',
          animated: false,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#555', strokeWidth: 3 },
          label: '',
        };
        const loopBackEdge = {
          id: uuidv4(),
          source: whileEndBlock.id,
          target: whileStartBlock.id,
          sourceHandle: `loopBack-${whileEndBlock.id}`,
          targetHandle: `loopBack-${whileStartBlock.id}`,
          type: 'custom',
          animated: false,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#555', strokeWidth: 3 },
          label: 'Loop',
        };
        setEdges((eds) =>
          eds.concat([edgeStartToChange, edgeChangeToDummy, edgeDummyToEnd, loopBackEdge])
        );
        console.log(`Added "While" block with blocks and edges.`);
      } else if (blockType === 'forLoop') {
        const forLoopStartBlock = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX, y: snappedY },
          data: {
            label: 'For Loop Start',
            blockType: 'forLoopStart',
            arrayVar: '',
            indexVar: 'i',
          },
        };
        const forLoopEndBlock = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX + 200, y: snappedY },
          data: {
            label: 'For Loop End',
            blockType: 'forLoopEnd',
            forLoopStartBlockId: forLoopStartBlock.id,
          },
        };
        forLoopStartBlock.data.forLoopEndBlockId = forLoopEndBlock.id;
        forLoopEndBlock.data.forLoopStartBlockId = forLoopStartBlock.id;
        const dummyBlock = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX + 100, y: snappedY + 150 },
          data: {
            label: 'Dummy',
            blockType: 'dummy',
          },
        };
        setNodes((nds) => nds.concat([forLoopStartBlock, dummyBlock, forLoopEndBlock]));
        const edgeStartToDummy = {
          id: uuidv4(),
          source: forLoopStartBlock.id,
          target: dummyBlock.id,
          type: 'custom',
          animated: false,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#555', strokeWidth: 3 },
          label: '',
          sourceHandle: `body-${forLoopStartBlock.id}`,
        };
        const edgeDummyToEnd = {
          id: uuidv4(),
          source: dummyBlock.id,
          target: forLoopEndBlock.id,
          type: 'custom',
          animated: false,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#555', strokeWidth: 3 },
          label: '',
        };
        const loopBackEdge = {
          id: uuidv4(),
          source: forLoopEndBlock.id,
          target: forLoopStartBlock.id,
          sourceHandle: `loopBack-${forLoopEndBlock.id}`,
          targetHandle: `loopBack-${forLoopStartBlock.id}`,
          type: 'custom',
          animated: false,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#555', strokeWidth: 3 },
          label: 'Loop',
        };
        setEdges((eds) => eds.concat([edgeStartToDummy, edgeDummyToEnd, loopBackEdge]));
        console.log(`Added "For Loop" blocks with start, dummy, and end edges.`);
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
            label: 'Dummy',
            blockType: 'dummy',
          },
        };
        const dummyFalseBlock = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX + 150, y: snappedY + 150 },
          data: {
            label: 'Dummy',
            blockType: 'dummy',
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
        console.log(`Added "If" block with dummy blocks for both branches.`);
      } else if (blockType === 'function') {
        const newBlock = {
          id: uuidv4(),
          type: 'custom',
          position: { x: snappedX, y: snappedY },
          data: {
            label: 'Function',
            blockType: 'function',
            operator: '',
            operand1: '',
            operand2: '',
            resultVar: '',
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
          console.log(`Connected block "${lastBlockId.current}" to new "Operator" block "${newBlock.id}".`);
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
    [cancelDrag, project, setNodes, setCancelDrag]
  );

  const onSelectionChange = useCallback(({ nodes, edges }) => {
    setSelectedNodes(nodes.map((node) => node.id));
    setSelectedEdges(edges.map((edge) => edge.id));
    console.log('Selected nodes:', nodes.map(n => n.id).join(', '));
    console.log('Selected edges:', edges.map(e => e.id).join(', '));
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
        selectedNodes={selectedNodes}
        selectedEdges={selectedEdges}
        setNodes={setNodes}
        setEdges={setEdges}
      />

      {paletteVisible && (
        <BlockPalette
          onSelectBlock={(blockType) => {
            setPaletteVisible(false);
            setCurrentDummyBlockId(null);
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