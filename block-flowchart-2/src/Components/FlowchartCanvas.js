// src/Components/FlowchartCanvas.js

import React, { useCallback, useRef, useState } from 'react';
import ReactFlow, {
  addEdge,
  useEdgesState,
  useNodesState,
  Controls,
  Background,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode/CustomNode';
import CustomEdge from './CustomEdge/CustomEdge'
import ControlPanel from './ControlPanel';
import { useFlowchartExecutor } from '../hooks/useFlowchartExecutor';

const edgeTypes = {
  custom: CustomEdge,
};

const nodeTypes = {
  custom: CustomNode,
};

function FlowchartCanvas({
  consoleOutput,
  setConsoleOutput,
  characterPosition,
  setCharacterPosition,
  characterMessage,
  setCharacterMessage,
}) {
  const initialNodes = [];
  const initialEdges = [];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const lastNodeId = useRef(null);

  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedEdges, setSelectedEdges] = useState([]);

  // Use the custom hook for executing the flowchart
  const { executeFlowchart, resetExecution } = useFlowchartExecutor(
    nodes,
    edges,
    setConsoleOutput,
    setCharacterPosition,
    setCharacterMessage
  );

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
          edgeStyle = { stroke: 'red', strokeWidth: 3, strokeDasharray: '5,5' };
          break;
        case 'loop':
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
            animated: sourceHandleType === 'yes' || sourceHandleType === 'no',
            style: edgeStyle,
            labelBgStyle: {
              fill: 'white',
              color: edgeStyle.stroke,
              fillOpacity: 0.7,
            },
            type: 'custom',
            markerEnd: { type: MarkerType.ArrowClosed },
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

  // Handler for node changes
  const onNodeChangeHandler = useCallback(
    (
      id,
      label,
      action,
      message,
      distance,
      direction,
      operand1,
      operand2,
      resultVar,
      varName,
      varValue,
      leftOperand,
      operator,
      rightOperand
    ) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              data: {
                ...node.data,
                label,
                action,
                message,
                distance,
                direction,
                operand1,
                operand2,
                resultVar,
                varName,
                varValue,
                leftOperand,
                operator,
                rightOperand,
              },
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  // Handler for dropping nodes onto the canvas
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = event.target.getBoundingClientRect();
      const nodeType = event.dataTransfer.getData('application/reactflow');

      if (!nodeType) return;

      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      const snappedX = Math.round(position.x / 15) * 15;
      const snappedY = Math.round(position.y / 15) * 15;

      if (nodeType === 'while') {
        // Create while start and end nodes
        const whileStartNode = {
          id: `${+new Date()}-start`,
          type: 'custom',
          position: { x: snappedX, y: snappedY },
          data: {
            label: 'While Start',
            nodeType: 'whileStart',
            onChange: onNodeChangeHandler,
            condition: '',
            whileEndNodeId: '',
          },
        };

        const whileEndNode = {
          id: `${+new Date()}-end`,
          type: 'custom',
          position: { x: snappedX + 200, y: snappedY },
          data: {
            label: 'While End',
            nodeType: 'whileEnd',
            onChange: onNodeChangeHandler,
            condition: '',
            whileStartNodeId: whileStartNode.id,
          },
        };

        // Set the IDs to reference each other
        whileStartNode.data.whileEndNodeId = whileEndNode.id;
        whileEndNode.data.whileStartNodeId = whileStartNode.id;

        // Create a dummy node inside the while loop
        const dummyNode = {
          id: `${+new Date()}-dummy`,
          type: 'custom',
          position: { x: snappedX + 100, y: snappedY + 150 },
          data: {
            label: 'Dummy Block',
            nodeType: 'dummy',
            onChange: onNodeChangeHandler,
          },
        };

        setNodes((nds) => nds.concat([whileStartNode, dummyNode, whileEndNode]));

        // Connect While Start to Dummy Node
        const edgeStartToDummy = {
          id: `e${whileStartNode.id}-${dummyNode.id}`,
          source: whileStartNode.id,
          target: dummyNode.id,
          type: 'custom',
          animated: false,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#555', strokeWidth: 3 },
          label: '',
        };

        // Connect Dummy Node to While End
        const edgeDummyToEnd = {
          id: `e${dummyNode.id}-${whileEndNode.id}`,
          source: dummyNode.id,
          target: whileEndNode.id,
          type: 'custom',
          animated: false,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#555', strokeWidth: 3 },
          label: '',
        };

        // Connect While End back to While Start (Loop Back Edge)
        const loopBackEdge = {
          id: `e${whileEndNode.id}-${whileStartNode.id}`,
          source: whileEndNode.id,
          target: whileStartNode.id,
          sourceHandle: `loopBack-${whileEndNode.id}`,
          type: 'custom',
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#555', strokeWidth: 3 },
          label: 'Loop',
        };

        setEdges((eds) => eds.concat([edgeStartToDummy, edgeDummyToEnd, loopBackEdge]));
      } else if (nodeType === 'if') {
        // Create the 'if' node
        const ifNode = {
          id: `${+new Date()}-if`,
          type: 'custom',
          position: { x: snappedX, y: snappedY },
          data: {
            label: 'If Block',
            nodeType: 'if',
            onChange: onNodeChangeHandler,
          },
        };

        // Create dummy nodes for True and False branches
        const dummyTrueNode = {
          id: `${+new Date()}-dummy-true`,
          type: 'custom',
          position: { x: snappedX - 150, y: snappedY + 150 },
          data: {
            label: 'True Action',
            nodeType: 'dummy',
            onChange: onNodeChangeHandler,
          },
        };

        const dummyFalseNode = {
          id: `${+new Date()}-dummy-false`,
          type: 'custom',
          position: { x: snappedX + 150, y: snappedY + 150 },
          data: {
            label: 'False Action',
            nodeType: 'dummy',
            onChange: onNodeChangeHandler,
          },
        };

        setNodes((nds) => nds.concat([ifNode, dummyTrueNode, dummyFalseNode]));

        // Connect the 'if' node to the dummy nodes
        const edgeIfToTrue = {
          id: `e${ifNode.id}-${dummyTrueNode.id}`,
          source: ifNode.id,
          target: dummyTrueNode.id,
          sourceHandle: `yes-${ifNode.id}`,
          type: 'custom',
          animated: false,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: 'green', strokeWidth: 3 },
          label: 'True',
        };

        const edgeIfToFalse = {
          id: `e${ifNode.id}-${dummyFalseNode.id}`,
          source: ifNode.id,
          target: dummyFalseNode.id,
          sourceHandle: `no-${ifNode.id}`,
          type: 'custom',
          animated: false,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: 'red', strokeWidth: 3, strokeDasharray: '5,5' },
          label: 'False',
        };

        setEdges((eds) => eds.concat([edgeIfToTrue, edgeIfToFalse]));
      } else {
        // Create the new node without auto-connecting edges
        const newNode = {
          id: `${+new Date()}`,
          type: 'custom',
          position: { x: snappedX, y: snappedY },
          data: {
            label: `${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} Block`,
            nodeType,
            onChange: onNodeChangeHandler,
            action: '',
            message: '',
          },
        };

        setNodes((nds) => nds.concat(newNode));

        if (lastNodeId.current) {
          const newEdge = {
            id: `e${lastNodeId.current}-${newNode.id}`,
            source: lastNodeId.current,
            target: newNode.id,
            type: 'custom',
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { stroke: '#555', strokeWidth: 3 },
            label: '',
          };
          setEdges((eds) => eds.concat(newEdge));
        }

        lastNodeId.current = newNode.id;
      }
    },
    [setNodes, setEdges, onNodeChangeHandler]
  );

  // Handler for selection changes
  const onSelectionChange = useCallback(({ nodes, edges }) => {
    setSelectedNodes(nodes);
    setSelectedEdges(edges);
  }, []);

  return (
    <div
      className="flowchart-container"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <ReactFlow
        nodes={nodes}
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
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
      >
        <Controls />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
      {/* Run, Reset, and Delete Buttons */}
      <ControlPanel
        executeFlowchart={executeFlowchart}
        resetExecution={resetExecution}
        selectedNodes={selectedNodes}
        selectedEdges={selectedEdges}
        setNodes={setNodes}
        setEdges={setEdges}
      />
    </div>
  );
}

export default FlowchartCanvas;