// src/Components/Canvas/Canvas.js

import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
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
import {
  FaPlay,
  FaUndo,
  FaRedo,
  FaCopy,
  FaPaste,
  FaTrash,
  FaCompressArrowsAlt,
  FaSyncAlt,
} from 'react-icons/fa';
import CustomBlock from '../CustomBlock/CustomBlock';
import CustomEdge from '../CustomEdge/CustomEdge';
import { useFlowchartExecutor } from '../../hooks/useFlowchartExecutor';
import useFlowchartHandlers from '../../hooks/useFlowchartHandlers';
import PaletteOverlay from '../PaletteOverlay/PaletteOverlay';
import { ActiveFlowProvider, useActiveFlow } from '../../contexts/ActiveFlowContext';
import InputModal from '../Modal/InputModal';
import useFlowchartReset from '../../hooks/useFlowchartReset';
import { v4 as uuidv4 } from 'uuid';
import './Canvas.css';

const MIN_DISTANCE = 150;
const PROXIMITY_TEMP_EDGE_CLASS = 'proximity-temp-edge';
const HISTORY_LIMIT = 60;
const PASTE_OFFSET = 40;

const deepClone = (value) => {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
};

const CustomBlockWrapper = props => <CustomBlock {...props} />;
const CustomEdgeWrapper = props => <CustomEdge {...props} />;

/**
 * Inner Canvas component that uses the ActiveFlowContext
 */
function CanvasInner({
  blocks,
  setNodes,
  edges,
  setEdges,
  setConsoleOutput,
  setCharacterPosition,
  setCharacterRotation,
  setCharacterMessage,
  isDragging,
  cancelDrag,
  setCancelDrag,
  setIsDragging,
  colorMode,
}) {
  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition, fitView, setViewport, getViewport } = useReactFlow();

  const {
    setErrorBlockId,
    setActiveBlockId,
    setActiveEdgeId,
    paletteVisible,
    currentDummyBlockId,
    dummyBlockPosition,
    closePalette,
  } = useActiveFlow();

  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedEdges, setSelectedEdges] = useState([]);
  const [helpModal, setHelpModal] = useState({ visible: false, title: '', content: '' });
  const [, setHistory] = useState([]);
  const [, setFuture] = useState([]);
  const [clipboard, setClipboard] = useState({ nodes: [], edges: [] });
  const [nodeContextMenu, setNodeContextMenu] = useState({ visible: false, x: 0, y: 0, nodeId: null });

  const snapshotRef = useRef({ blocks: deepClone(blocks), edges: deepClone(edges) });
  const restoringHistoryRef = useRef(false);
  const pasteIterationRef = useRef(0);
  const viewportRestoredRef = useRef(false);
  const hasAutoFittedRef = useRef(false);

  const lastBlockId = useRef(null);
  useEffect(() => {
    lastBlockId.current = blocks.length > 0 ? blocks[blocks.length - 1].id : null;
  }, [blocks]);

  useEffect(() => {
    const currentSnapshot = { blocks: deepClone(blocks), edges: deepClone(edges) };

    if (restoringHistoryRef.current) {
      snapshotRef.current = currentSnapshot;
      restoringHistoryRef.current = false;
      return;
    }

    const previousSnapshot = snapshotRef.current;
    const hasChanged =
      JSON.stringify(previousSnapshot.blocks) !== JSON.stringify(currentSnapshot.blocks) ||
      JSON.stringify(previousSnapshot.edges) !== JSON.stringify(currentSnapshot.edges);

    if (!hasChanged) {
      return;
    }

    setHistory((entries) => [...entries.slice(-(HISTORY_LIMIT - 1)), previousSnapshot]);
    setFuture([]);
    snapshotRef.current = currentSnapshot;
  }, [blocks, edges]);

  useEffect(() => {
    if (viewportRestoredRef.current) {
      return;
    }

    viewportRestoredRef.current = true;

    try {
      const raw = localStorage.getItem('code-connect:viewport');
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw);
      if (
        typeof parsed?.x === 'number' &&
        typeof parsed?.y === 'number' &&
        typeof parsed?.zoom === 'number'
      ) {
        setViewport(parsed, { duration: 220 });
      }
    } catch (_error) {
      localStorage.removeItem('code-connect:viewport');
    }
  }, [setViewport]);

  useEffect(() => {
    if (hasAutoFittedRef.current || blocks.length === 0) {
      return;
    }

    hasAutoFittedRef.current = true;
    fitView({ duration: 240, padding: 0.22 });
  }, [blocks.length, fitView]);

  const closeNodeContextMenu = useCallback(() => {
    setNodeContextMenu({ visible: false, x: 0, y: 0, nodeId: null });
  }, []);

  const copySelectedFlow = useCallback(() => {
    if (selectedNodes.length === 0) {
      return;
    }

    const selectedNodeIdSet = new Set(selectedNodes);
    const nodesToCopy = blocks.filter((node) => selectedNodeIdSet.has(node.id));
    const edgesToCopy = edges.filter(
      (edge) =>
        selectedEdges.includes(edge.id) ||
        (selectedNodeIdSet.has(edge.source) && selectedNodeIdSet.has(edge.target))
    );

    setClipboard({
      nodes: deepClone(nodesToCopy),
      edges: deepClone(edgesToCopy),
    });
    pasteIterationRef.current = 0;
  }, [blocks, edges, selectedEdges, selectedNodes]);

  const pasteFlow = useCallback(() => {
    if (!clipboard.nodes?.length) {
      return;
    }

    pasteIterationRef.current += 1;
    const offset = PASTE_OFFSET * pasteIterationRef.current;
    const idMap = new Map();

    const pastedNodes = clipboard.nodes.map((node) => {
      const newId = uuidv4();
      idMap.set(node.id, newId);

      return {
        ...deepClone(node),
        id: newId,
        selected: true,
        position: {
          x: (node.position?.x || 0) + offset,
          y: (node.position?.y || 0) + offset,
        },
      };
    });

    const pastedEdges = (clipboard.edges || [])
      .filter((edge) => idMap.has(edge.source) && idMap.has(edge.target))
      .map((edge) => ({
        ...deepClone(edge),
        id: uuidv4(),
        source: idMap.get(edge.source),
        target: idMap.get(edge.target),
        selected: false,
      }));

    setNodes((nds) => nds.map((node) => ({ ...node, selected: false })).concat(pastedNodes));
    setEdges((eds) => eds.map((edge) => ({ ...edge, selected: false })).concat(pastedEdges));
    setSelectedNodes(pastedNodes.map((node) => node.id));
    setSelectedEdges([]);
    closeNodeContextMenu();
  }, [clipboard.edges, clipboard.nodes, closeNodeContextMenu, setEdges, setNodes]);

  const duplicateSingleNode = useCallback((nodeId) => {
    const originalNode = blocks.find((node) => node.id === nodeId);
    if (!originalNode) {
      return;
    }

    const duplicatedNode = {
      ...deepClone(originalNode),
      id: uuidv4(),
      selected: true,
      position: {
        x: (originalNode.position?.x || 0) + PASTE_OFFSET,
        y: (originalNode.position?.y || 0) + PASTE_OFFSET,
      },
    };

    setNodes((nds) => nds.map((node) => ({ ...node, selected: false })).concat(duplicatedNode));
    setSelectedNodes([duplicatedNode.id]);
    setSelectedEdges([]);
    closeNodeContextMenu();
  }, [blocks, closeNodeContextMenu, setNodes]);

  const deleteSingleNode = useCallback((nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    setSelectedNodes((ids) => ids.filter((id) => id !== nodeId));
    setSelectedEdges([]);
    closeNodeContextMenu();
  }, [closeNodeContextMenu, setEdges, setNodes]);

  const deleteSelection = useCallback(() => {
    if (selectedNodes.length === 0 && selectedEdges.length === 0) {
      return;
    }

    const selectedNodeIds = new Set(selectedNodes);
    const selectedEdgeIds = new Set(selectedEdges);

    setNodes((nds) => nds.filter((node) => !selectedNodeIds.has(node.id)));
    setEdges((eds) =>
      eds.filter(
        (edge) =>
          !selectedEdgeIds.has(edge.id) &&
          !selectedNodeIds.has(edge.source) &&
          !selectedNodeIds.has(edge.target)
      )
    );
    setSelectedNodes([]);
    setSelectedEdges([]);
    closeNodeContextMenu();
  }, [closeNodeContextMenu, selectedEdges, selectedNodes, setEdges, setNodes]);

  const undoFlow = useCallback(() => {
    setHistory((entries) => {
      if (entries.length === 0) {
        return entries;
      }

      const previousSnapshot = entries[entries.length - 1];
      const currentSnapshot = snapshotRef.current;

      setFuture((futureEntries) => [currentSnapshot, ...futureEntries].slice(0, HISTORY_LIMIT));
      restoringHistoryRef.current = true;
      snapshotRef.current = deepClone(previousSnapshot);

      setNodes(deepClone(previousSnapshot.blocks));
      setEdges(deepClone(previousSnapshot.edges));
      setSelectedNodes([]);
      setSelectedEdges([]);

      closeNodeContextMenu();
      return entries.slice(0, -1);
    });
  }, [closeNodeContextMenu, setEdges, setNodes]);

  const redoFlow = useCallback(() => {
    setFuture((futureEntries) => {
      if (futureEntries.length === 0) {
        return futureEntries;
      }

      const nextSnapshot = futureEntries[0];
      const currentSnapshot = snapshotRef.current;

      setHistory((entries) => [...entries.slice(-(HISTORY_LIMIT - 1)), currentSnapshot]);
      restoringHistoryRef.current = true;
      snapshotRef.current = deepClone(nextSnapshot);

      setNodes(deepClone(nextSnapshot.blocks));
      setEdges(deepClone(nextSnapshot.edges));
      setSelectedNodes([]);
      setSelectedEdges([]);

      closeNodeContextMenu();
      return futureEntries.slice(1);
    });
  }, [closeNodeContextMenu, setEdges, setNodes]);

  useEffect(() => {
    if (!nodeContextMenu.visible) {
      return;
    }

    const handleWindowClick = () => {
      closeNodeContextMenu();
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closeNodeContextMenu();
      }
    };

    window.addEventListener('click', handleWindowClick);
    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('click', handleWindowClick);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [closeNodeContextMenu, nodeContextMenu.visible]);

  // Block replacement handler
  const handleReplaceDummyBlock = useCallback(
    (dummyId, newBlockType) => {
      const blockToReplace = blocks.find(b => b.id === dummyId);
      if (!blockToReplace) return;
      if (blockToReplace.data.dummyAllowed === false) {
        alert("This block cannot be replaced.");
        return;
      }
      if (newBlockType === 'start') {
        alert("Cannot replace a placement block with a start block.");
        return;
      }

      setNodes(nds =>
        nds.map(b => (b.id === dummyId ? { ...b, data: { ...b.data, flash: true } } : b))
      );

      setTimeout(() => {
        if (newBlockType === 'if') {
          const updated = {
            ...blockToReplace,
            data: { label: 'If Then', blockType: 'if', leftOperand: '', operator: '==', rightOperand: '' },
          };
          const dummyTrue = {
            id: uuidv4(),
            type: 'custom',
            position: { x: blockToReplace.position.x - 150, y: blockToReplace.position.y + 150 },
            data: { label: 'Placeholder (True Path)', blockType: 'dummy', dummyAllowed: true },
          };
          const dummyFalse = {
            id: uuidv4(),
            type: 'custom',
            position: { x: blockToReplace.position.x + 150, y: blockToReplace.position.y + 150 },
            data: { label: 'Placeholder (False Path)', blockType: 'dummy', dummyAllowed: true },
          };
          const join = {
            id: uuidv4(),
            type: 'custom',
            position: { x: blockToReplace.position.x, y: blockToReplace.position.y + 300 },
            data: { label: 'Join', blockType: 'join' },
          };

          setNodes(nds => nds.map(b => (b.id === dummyId ? updated : b)).concat([dummyTrue, dummyFalse, join]));

          const edgeTrue = {
            id: uuidv4(), source: updated.id, target: dummyTrue.id,
            sourceHandle: `yes-${updated.id}`, type: 'custom', markerEnd: { type: MarkerType.ArrowClosed },
            style: { stroke: 'green', strokeWidth: 3 }, label: 'True',
          };
          const edgeFalse = {
            id: uuidv4(), source: updated.id, target: dummyFalse.id,
            sourceHandle: `no-${updated.id}`, type: 'custom', markerEnd: { type: MarkerType.ArrowClosed },
            style: { stroke: 'red', strokeWidth: 3 }, label: 'False',
          };
          const edgeTJoin = {
            id: uuidv4(), source: dummyTrue.id, target: join.id,
            type: 'custom', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#555', strokeWidth: 3 },
          };
          const edgeFJoin = {
            id: uuidv4(), source: dummyFalse.id, target: join.id,
            type: 'custom', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#555', strokeWidth: 3 },
          };

          setEdges(eds => {
            const filtered = eds.filter(e => e.source !== dummyId && e.target !== dummyId);
            return filtered.concat([edgeTrue, edgeFalse, edgeTJoin, edgeFJoin]);
          });

        } else if (newBlockType === 'whileStart') {
          const updated = {
            ...blockToReplace,
            data: { label: 'While', blockType: 'whileStart', leftOperand: '', operator: '', rightOperand: '' },
          };
          const body = {
            id: uuidv4(), type: 'custom',
            position: { x: blockToReplace.position.x - 100, y: blockToReplace.position.y + 150 },
            data: { label: 'Placeholder (While Loop)', blockType: 'dummy', dummyAllowed: true, dummyFor: 'whileBody' },
          };
          const exit = {
            id: uuidv4(), type: 'custom',
            position: { x: blockToReplace.position.x + 150, y: blockToReplace.position.y + 150 },
            data: { label: 'Placeholder (Exit Block)', blockType: 'dummy', dummyAllowed: true },
          };

          setNodes(nds => nds.map(b => (b.id === dummyId ? updated : b)).concat([body, exit]));

          const edgeBody = {
            id: uuidv4(), source: updated.id, target: body.id,
            sourceHandle: `body-${updated.id}`, type: 'custom', markerEnd: { type: MarkerType.ArrowClosed },
            style: { stroke: 'green', strokeWidth: 3 }, label: 'True',
          };
          const edgeExit = {
            id: uuidv4(), source: updated.id, target: exit.id,
            sourceHandle: `exit-${updated.id}`, type: 'custom', markerEnd: { type: MarkerType.ArrowClosed },
            style: { stroke: 'red', strokeWidth: 3 }, label: 'False',
          };
          const loopBack = {
            id: uuidv4(), source: body.id, target: updated.id,
            sourceHandle: `source-${body.id}`, targetHandle: `loopBack-${updated.id}`,
            type: 'custom', markerEnd: { type: MarkerType.ArrowClosed },
            style: { stroke: '#555', strokeWidth: 3 }, label: 'Loop Back',
          };

          setEdges(eds => {
            const filtered = eds.filter(e => e.source !== dummyId && e.target !== dummyId);
            return filtered.concat([edgeBody, edgeExit, loopBack]);
          });

        } else {
          let newData;
          if (newBlockType === 'updateVariable') {
            newData = { label: 'Update Variable', blockType: 'updateVariable', varName: '', varValue: '' };
          } else if (newBlockType === 'createVariable') {
            newData = { label: 'Create Variable', blockType: 'createVariable', varName: '', varValue: '', valueType: 'number' };
          } else {
            newData = { label: newBlockType.charAt(0).toUpperCase() + newBlockType.slice(1), blockType: newBlockType };
          }
          setNodes(nds =>
            nds.map(b =>
              b.id === dummyId
                ? { ...b, data: { ...b.data, ...newData, flash: false } }
                : b
            )
          );
        }

        closePalette();
      }, 300);
    },
    [blocks, setNodes, setEdges, closePalette]
  );

  const nodeTypes = useMemo(() => ({ custom: CustomBlockWrapper }), []);

  const edgeTypes = useMemo(() => ({ custom: CustomEdgeWrapper }), []);

  const { onConnect } = useFlowchartHandlers({
    reactFlowWrapper,
    setNodes,
    setEdges,
    cancelDrag,
    setCancelDrag,
    blocks,
    lastBlockId,
  });

  const handleDrop = useCallback(
    event => {
      event.preventDefault();
      if (cancelDrag) {
        setCancelDrag(false);
        return;
      }
      const blockType = event.dataTransfer.getData('application/reactflow');
      if (!blockType) return;

      const dropPoint = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      const snappedX = Math.round(dropPoint.x / 15) * 15;
      const snappedY = Math.round(dropPoint.y / 15) * 15;

      if (blockType === 'if') {
        const ifBlock = {
          id: uuidv4(), type: 'custom', position: { x: snappedX, y: snappedY },
          data: { label: 'If Then', blockType: 'if', leftOperand: '', operator: '==', rightOperand: '' },
        };
        const dummyTrue = {
          id: uuidv4(), type: 'custom',
          position: { x: snappedX - 150, y: snappedY + 150 },
          data: { label: 'Placeholder (True Path)', blockType: 'dummy', dummyAllowed: true },
        };
        const dummyFalse = {
          id: uuidv4(), type: 'custom',
          position: { x: snappedX + 150, y: snappedY + 150 },
          data: { label: 'Placeholder (False Path)', blockType: 'dummy', dummyAllowed: true },
        };
        const joinBlock = {
          id: uuidv4(), type: 'custom', position: { x: snappedX, y: snappedY + 300 },
          data: { label: 'Join', blockType: 'join' },
        };

        setNodes(nds => nds.concat([ifBlock, dummyTrue, dummyFalse, joinBlock]));

        const edgeIfTrue = {
          id: uuidv4(), source: ifBlock.id, target: dummyTrue.id,
          sourceHandle: `yes-${ifBlock.id}`, type: 'custom', markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: 'green', strokeWidth: 3 }, label: 'True',
        };
        const edgeIfFalse = {
          id: uuidv4(), source: ifBlock.id, target: dummyFalse.id,
          sourceHandle: `no-${ifBlock.id}`, type: 'custom', markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: 'red', strokeWidth: 3 }, label: 'False',
        };
        const edgeTrueToJoin = {
          id: uuidv4(), source: dummyTrue.id, target: joinBlock.id,
          type: 'custom', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#555', strokeWidth: 3 },
        };
        const edgeFalseToJoin = {
          id: uuidv4(), source: dummyFalse.id, target: joinBlock.id,
          type: 'custom', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#555', strokeWidth: 3 },
        };

        setEdges(eds => eds.concat([edgeIfTrue, edgeIfFalse, edgeTrueToJoin, edgeFalseToJoin]));
      } else if (blockType === 'whileStart') {
        const whileBlock = {
          id: uuidv4(), type: 'custom', position: { x: snappedX, y: snappedY },
          data: { label: 'While', blockType: 'whileStart', leftOperand: '', operator: '', rightOperand: '' },
        };
        const dummyBody = {
          id: uuidv4(), type: 'custom',
          position: { x: snappedX - 100, y: snappedY + 150 },
          data: { label: 'Placeholder (While Loop)', blockType: 'dummy', dummyAllowed: true, dummyFor: 'whileBody' },
        };
        const dummyExit = {
          id: uuidv4(), type: 'custom',
          position: { x: snappedX + 150, y: snappedY + 150 },
          data: { label: 'Placeholder (Exit While)', blockType: 'dummy', dummyAllowed: true },
        };
        setNodes(nds => nds.concat([whileBlock, dummyBody, dummyExit]));

        const edgeWhileBody = {
          id: uuidv4(), source: whileBlock.id, target: dummyBody.id,
          sourceHandle: `body-${whileBlock.id}`, type: 'custom', markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: 'green', strokeWidth: 3 }, label: 'True',
        };
        const edgeWhileExit = {
          id: uuidv4(), source: whileBlock.id, target: dummyExit.id,
          sourceHandle: `exit-${whileBlock.id}`, type: 'custom', markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: 'red', strokeWidth: 3 }, label: 'False',
        };
        const edgeLoopBack = {
          id: uuidv4(), source: dummyBody.id, target: whileBlock.id,
          sourceHandle: `loopBack-dummy`, targetHandle: `loopBack-${whileBlock.id}`,
          type: 'custom', markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#555', strokeWidth: 3 }, label: 'Loop Back',
        };
        setEdges(eds => eds.concat([edgeWhileBody, edgeWhileExit, edgeLoopBack]));
      } else if (
        blockType === 'start' || blockType === 'end' || blockType === 'updateVariable' ||
        blockType === 'createVariable' || blockType === 'move' || blockType === 'rotate' || blockType === 'output'
      ) {
        const newBlock = {
          id: uuidv4(), type: 'custom', position: { x: snappedX, y: snappedY },
          data: { label: blockType.charAt(0).toUpperCase() + blockType.slice(1), blockType },
        };
        setNodes(nds => nds.concat(newBlock));
      } else {
        const newBlock = {
          id: uuidv4(), type: 'custom', position: { x: snappedX, y: snappedY },
          data: { label: blockType.charAt(0).toUpperCase() + blockType.slice(1), blockType },
        };
        setNodes(nds => nds.concat(newBlock));
      }
    },
    [cancelDrag, screenToFlowPosition, setCancelDrag, setNodes, setEdges]
  );

  const onDragOverHandler = useCallback(event => {
    event.preventDefault();
    event.dataTransfer.dropEffect = event.target.closest('.dummy-block') ? 'copy' : 'move';
  }, []);

  const { executeFlowchart, inputRequest } = useFlowchartExecutor(
    blocks,
    edges,
    setConsoleOutput,
    setCharacterPosition,
    setCharacterMessage,
    setCharacterRotation,
    setActiveBlockId,
    setActiveEdgeId,
    setErrorBlockId
  );

  const executeSelectedFlowchart = useCallback(() => {
    const selectedBlockId = selectedNodes[0] || null;
    executeFlowchart({ selectedBlockId });
  }, [executeFlowchart, selectedNodes]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable
      ) {
        return;
      }

      if ((event.key === 'Delete' || event.key === 'Backspace') && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        deleteSelection();
        return;
      }

      const usesCommandModifier = event.metaKey || event.ctrlKey;
      if (!usesCommandModifier) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === 'c') {
        event.preventDefault();
        copySelectedFlow();
        return;
      }

      if (key === 'v') {
        event.preventDefault();
        pasteFlow();
        return;
      }

      if (key === 'enter') {
        event.preventDefault();
        executeSelectedFlowchart();
        return;
      }

      if (key === 'a') {
        event.preventDefault();
        setNodes((nds) => nds.map((node) => ({ ...node, selected: true })));
        setEdges((eds) => eds.map((edge) => ({ ...edge, selected: true })));
        setSelectedNodes(blocks.map((node) => node.id));
        setSelectedEdges(edges.map((edge) => edge.id));
        return;
      }

      if (key === '0') {
        event.preventDefault();
        fitView({ duration: 250, padding: 0.22 });
        return;
      }

      if (key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undoFlow();
        return;
      }

      if ((key === 'z' && event.shiftKey) || key === 'y') {
        event.preventDefault();
        redoFlow();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [blocks, copySelectedFlow, deleteSelection, edges, executeSelectedFlowchart, fitView, pasteFlow, redoFlow, setEdges, setNodes, undoFlow]);


  const resetExecution = useFlowchartReset({
    setConsoleOutput,
    setCharacterPosition,
    setCharacterRotation,
    setCharacterMessage,
    setActiveBlockId,
    setActiveEdgeId,
  });

  const getNodeCenter = useCallback((node) => {
    const width = node.width ?? node.measured?.width ?? 180;
    const height = node.height ?? node.measured?.height ?? 60;
    const x = (node.positionAbsolute?.x ?? node.position?.x ?? 0) + width / 2;
    const y = (node.positionAbsolute?.y ?? node.position?.y ?? 0) + height / 2;
    return { x, y };
  }, []);

  const getNodeBounds = useCallback((node) => {
    const width = node.width ?? node.measured?.width ?? 180;
    const height = node.height ?? node.measured?.height ?? 60;
    const left = node.positionAbsolute?.x ?? node.position?.x ?? 0;
    const top = node.positionAbsolute?.y ?? node.position?.y ?? 0;

    return {
      left,
      top,
      right: left + width,
      bottom: top + height,
    };
  }, []);

  const getBoundsGapDistance = useCallback((a, b) => {
    const dx = Math.max(0, Math.max(a.left, b.left) - Math.min(a.right, b.right));
    const dy = Math.max(0, Math.max(a.top, b.top) - Math.min(a.bottom, b.bottom));
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const getDefaultHandlesForProximity = useCallback((sourceNode, targetNode) => {
    const sourceType = (sourceNode?.data?.blockType || '').toLowerCase();
    const targetType = (targetNode?.data?.blockType || '').toLowerCase();

    if (sourceType === 'end' || sourceType === 'if' || sourceType === 'whilestart') {
      return null;
    }

    if (targetType === 'start') {
      return null;
    }

    return {
      sourceHandle: `source-${sourceNode.id}`,
      targetHandle: `target-${targetNode.id}`,
    };
  }, []);

  const hasIncomingConnectionAtEntrance = useCallback(
    (edgeList, candidateEdge) =>
      edgeList.some(
        (edge) =>
          edge.target === candidateEdge.target &&
          (edge.targetHandle || null) === (candidateEdge.targetHandle || null)
      ),
    []
  );

  const isValidConnection = useCallback(
    (connection) => {
      if (!connection?.source || !connection?.target) {
        return false;
      }

      if (connection.source === connection.target) {
        return false;
      }

      const sourceNode = blocks.find((node) => node.id === connection.source);
      const targetNode = blocks.find((node) => node.id === connection.target);
      const sourceType = (sourceNode?.data?.blockType || '').toLowerCase();
      const targetType = (targetNode?.data?.blockType || '').toLowerCase();

      if (sourceType === 'end' || sourceType === 'if' || sourceType === 'whilestart') {
        return false;
      }

      if (targetType === 'start') {
        return false;
      }

      const hasIncomingOnSameEntrance = edges.some(
        (edge) =>
          edge.target === connection.target &&
          (edge.targetHandle || null) === (connection.targetHandle || null)
      );

      return !hasIncomingOnSameEntrance;
    },
    [blocks, edges]
  );

  const onMoveEnd = useCallback(() => {
    const viewport = getViewport();
    localStorage.setItem('code-connect:viewport', JSON.stringify(viewport));
  }, [getViewport]);

  const getClosestEdge = useCallback((draggedNode) => {
    const draggedCenter = getNodeCenter(draggedNode);
    const draggedBounds = getNodeBounds(draggedNode);

    const closestNode = blocks.reduce(
      (closest, node) => {
        if (node.id === draggedNode.id) {
          return closest;
        }

        const nodeBounds = getNodeBounds(node);
        const distance = getBoundsGapDistance(draggedBounds, nodeBounds);

        if (distance < closest.distance && distance < MIN_DISTANCE) {
          return { distance, node };
        }

        return closest;
      },
      { distance: Number.MAX_VALUE, node: null }
    );

    if (!closestNode.node) {
      return null;
    }

    const closeNodeCenter = getNodeCenter(closestNode.node);
    const closeNodeIsSource = closeNodeCenter.x < draggedCenter.x;
    const sourceNode = closeNodeIsSource ? closestNode.node : draggedNode;
    const targetNode = closeNodeIsSource ? draggedNode : closestNode.node;
    const handles = getDefaultHandlesForProximity(sourceNode, targetNode);

    if (!handles) {
      return null;
    }

    return {
      id: `${sourceNode.id}-${targetNode.id}`,
      source: sourceNode.id,
      target: targetNode.id,
      sourceHandle: handles.sourceHandle,
      targetHandle: handles.targetHandle,
      type: 'custom',
      markerEnd: { type: MarkerType.ArrowClosed },
    };
  }, [blocks, getBoundsGapDistance, getDefaultHandlesForProximity, getNodeBounds, getNodeCenter]);

  const onNodeDrag = useCallback((_, node) => {
    const closeEdge = getClosestEdge(node);

    setEdges((currentEdges) => {
      const nextEdges = currentEdges.filter((edge) => edge.className !== PROXIMITY_TEMP_EDGE_CLASS);

      if (
        closeEdge &&
        !hasIncomingConnectionAtEntrance(nextEdges, closeEdge) &&
        !nextEdges.some(
          (edge) =>
            edge.source === closeEdge.source &&
            edge.target === closeEdge.target &&
            edge.sourceHandle === closeEdge.sourceHandle &&
            edge.targetHandle === closeEdge.targetHandle
        )
      ) {
        nextEdges.push({
          ...closeEdge,
          className: PROXIMITY_TEMP_EDGE_CLASS,
          style: {
            strokeDasharray: '6 6',
            strokeWidth: 2.5,
          },
        });
      }

      return nextEdges;
    });
  }, [getClosestEdge, hasIncomingConnectionAtEntrance, setEdges]);

  const onNodeDragStop = useCallback((_, node) => {
    const closeEdge = getClosestEdge(node);

    setEdges((currentEdges) => {
      const nextEdges = currentEdges.filter((edge) => edge.className !== PROXIMITY_TEMP_EDGE_CLASS);

      if (
        closeEdge &&
        !hasIncomingConnectionAtEntrance(nextEdges, closeEdge) &&
        !nextEdges.some(
          (edge) =>
            edge.source === closeEdge.source &&
            edge.target === closeEdge.target &&
            edge.sourceHandle === closeEdge.sourceHandle &&
            edge.targetHandle === closeEdge.targetHandle
        )
      ) {
        nextEdges.push({
          ...closeEdge,
          id: uuidv4(),
          className: 'proximity-edge',
        });
      }

      return nextEdges;
    });
  }, [getClosestEdge, hasIncomingConnectionAtEntrance, setEdges]);

  const onNodeContextMenu = useCallback((event, node) => {
    event.preventDefault();
    event.stopPropagation();

    setSelectedNodes([node.id]);
    setSelectedEdges([]);
    setNodeContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      nodeId: node.id,
    });
  }, []);

  return (
    <div ref={reactFlowWrapper} className="flowchart-container" style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div className="canvas-toolbar">
        <div className="toolbar-group">
          <button
            className="toolbar-btn primary"
            type="button"
            onClick={executeSelectedFlowchart}
            aria-label="Run"
            data-tooltip="Run"
          >
            <FaPlay />
            <span className="toolbar-label">Run</span>
          </button>
          <button
            className="toolbar-btn"
            type="button"
            onClick={resetExecution}
            aria-label="Reset execution"
            data-tooltip="Reset"
          >
            <FaSyncAlt />
            <span className="toolbar-label">Reset</span>
          </button>
        </div>
        <div className="toolbar-group">
          <button className="toolbar-btn" type="button" onClick={undoFlow} aria-label="Undo" data-tooltip="Undo">
            <FaUndo />
            <span className="toolbar-label">Undo</span>
          </button>
          <button className="toolbar-btn" type="button" onClick={redoFlow} aria-label="Redo" data-tooltip="Redo">
            <FaRedo />
            <span className="toolbar-label">Redo</span>
          </button>
          <button className="toolbar-btn" type="button" onClick={copySelectedFlow} aria-label="Copy" data-tooltip="Copy">
            <FaCopy />
            <span className="toolbar-label">Copy</span>
          </button>
          <button className="toolbar-btn" type="button" onClick={pasteFlow} aria-label="Paste" data-tooltip="Paste">
            <FaPaste />
            <span className="toolbar-label">Paste</span>
          </button>
          <button className="toolbar-btn danger" type="button" onClick={deleteSelection} aria-label="Delete" data-tooltip="Delete">
            <FaTrash />
            <span className="toolbar-label">Delete</span>
          </button>
          <button
            className="toolbar-btn"
            type="button"
            onClick={() => fitView({ duration: 250, padding: 0.22 })}
            aria-label="Fit view"
            data-tooltip="Fit view"
          >
            <FaCompressArrowsAlt />
            <span className="toolbar-label">Fit</span>
          </button>
        </div>
      </div>
      <ReactFlow
        colorMode={colorMode}
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
        isValidConnection={isValidConnection}
        onSelectionChange={({ nodes, edges }) => {
          setSelectedNodes(nodes.map((node) => node.id));
          setSelectedEdges(edges.map((edge) => edge.id));
        }}
        onDrop={handleDrop}
        onDragOver={onDragOverHandler}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        onMoveEnd={onMoveEnd}
        onPaneClick={closeNodeContextMenu}
        onNodeContextMenu={onNodeContextMenu}
      >
        <MiniMap
          style={{
            backgroundColor: colorMode === 'dark' ? '#0f172a' : '#ffffff'
          }}
          nodeStrokeColor={(node) => {
            if (node.style?.background) return node.style.background;
            return colorMode === 'dark' ? '#f0f0f0' : '#334155';
          }}
          nodeColor={(node) => {
            if (node.style?.background) return node.style.background;
            return colorMode === 'dark' ? '#334155' : '#cbd5e1';
          }}
          nodeBorderRadius={2}
        />
        <Controls />
        <Background color={colorMode === 'dark' ? '#334155' : '#94a3b8'} gap={20} />
      </ReactFlow>

      {paletteVisible && dummyBlockPosition && (
        <PaletteOverlay
          dummyBlockPosition={dummyBlockPosition}
          onClose={closePalette}
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
            <button onClick={() => setHelpModal({ ...helpModal, visible: false })} className="help-modal-close" aria-label="Close help modal">
              Got It!
            </button>
          </div>
        </div>
      )}

      {inputRequest && (
        <InputModal
          open={!!inputRequest}
          promptText={inputRequest.promptText}
          onSubmit={val => inputRequest.resolve(val)}
          onCancel={() => inputRequest.resolve(null)}
        />
      )}

      {nodeContextMenu.visible && (
        <div
          className="node-context-menu"
          style={{ left: nodeContextMenu.x, top: nodeContextMenu.y }}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => {
              const node = blocks.find((item) => item.id === nodeContextMenu.nodeId);
              if (node) {
                setClipboard({ nodes: [deepClone(node)], edges: [] });
                pasteIterationRef.current = 0;
              }
              closeNodeContextMenu();
            }}
          >
            Copy Node
          </button>
          <button type="button" onClick={pasteFlow} disabled={!clipboard.nodes?.length}>
            Paste
          </button>
          <button type="button" onClick={() => duplicateSingleNode(nodeContextMenu.nodeId)}>
            Duplicate Node
          </button>
          <button type="button" className="danger" onClick={() => deleteSingleNode(nodeContextMenu.nodeId)}>
            Delete Node
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Canvas wrapper component that provides context
 */
function Canvas(props) {
  return (
    <ActiveFlowProvider>
      <CanvasInner {...props} />
    </ActiveFlowProvider>
  );
}

export default Canvas;