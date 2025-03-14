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

  return { onConnect, onDragOver, onSelectionChange };
};

export default useFlowchartHandlers;