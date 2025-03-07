// src/Components/useFlowchartHandlers.js

import { useCallback } from 'react';
import { addEdge, MarkerType } from 'reactflow';
import { v4 as uuidv4 } from 'uuid';

const useFlowchartHandlers = ({
  project,
  reactFlowWrapper,
  setNodes,
  setEdges,
  cancelDrag,
  setCancelDrag,
  blocks,
  lastBlockId,
}) => {
  const onConnect = useCallback(
    (params) => {
      const originalSourceHandle = params.sourceHandle;
      let sourceHandleType = originalSourceHandle
        ? originalSourceHandle.split('-')[0].toLowerCase()
        : '';
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
      if (dummyBlockElement && blockType !== 'whileStart' && blockType !== 'if') {
        return;
      }
      const dropPoint = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };
      const position = project(dropPoint);
      const snappedX = Math.round(position.x / 15) * 15;
      const snappedY = Math.round(position.y / 15) * 15;
      if (blockType === 'whileStart') {
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
        // Only auto-connect if the last block exists and is not an End block.
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
    },
    [cancelDrag, project, reactFlowWrapper, setCancelDrag, setNodes, setEdges, blocks, lastBlockId]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    const targetElement = event.target;
    if (targetElement.closest('.dummy-block')) {
      event.dataTransfer.dropEffect = 'copy';
    } else {
      event.dataTransfer.dropEffect = 'move';
    }
  }, []);

  const onSelectionChange = useCallback(({ nodes, edges }) => {
    return {
      selectedNodes: nodes.map((node) => node.id),
      selectedEdges: edges.map((edge) => edge.id),
    };
  }, []);

  return { onConnect, onDrop, onDragOver, onSelectionChange };
};

export default useFlowchartHandlers;