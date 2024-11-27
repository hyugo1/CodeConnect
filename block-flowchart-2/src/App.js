// src/App.js

import React, { useCallback, useRef, useEffect, useState } from 'react';
import ReactFlow, {
  addEdge,
  useEdgesState,
  useNodesState,
  Controls,
  Background,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import Sidebar from './Components/Sidebar/Sidebar';
import CustomNode from './Components/CustomNode/CustomNode';
import CustomEdge from './Components/CustomEdge/CustomEdge';
import Character from './Components/Character/Character';
import './styles/App.css';

const edgeTypes = {
  custom: CustomEdge,
};

const nodeTypes = {
  custom: CustomNode,
};

function App() {
  const initialNodes = [];
  const initialEdges = [];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const lastNodeId = useRef(null);

  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedEdges, setSelectedEdges] = useState([]);

  const [consoleOutput, setConsoleOutput] = useState('');

  const [characterPosition, setCharacterPosition] = useState({ x: 0, y: 0 });
  const [characterMessage, setCharacterMessage] = useState('');

  const onConnect = useCallback(
    (params) => {
      console.log('onConnect params:', params);
  
      const originalSourceHandle = params.sourceHandle; // Keep the original sourceHandle with node ID
      let sourceHandleType = params.sourceHandle;
  
      // Extract the handle type without the node ID for labeling and styling
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
        case 'exit':
          label = 'Exit';
          edgeStyle = { stroke: '#555', strokeWidth: 3 };
          break;
        default:
          label = '';
      }
  
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            sourceHandle: originalSourceHandle, // Use the original sourceHandle
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

  

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onNodeChangeHandler = useCallback(
    (id, label, action, message, distance, direction, operand1, operand2, resultVar, varName,
      varValue, leftOperand, operator,rightOperand) => {
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

      const newNode = {
        id: `${+new Date()}`,
        type: 'custom',
        position: { x: snappedX, y: snappedY },
        data: {
          label: `${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} Block`,
          nodeType,
          onChange: onNodeChangeHandler,
          action: '',
          message: '', // For Print Block
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
    },
    [setNodes, setEdges, onNodeChangeHandler]
  );

  const onNodesRemove = useCallback(
    (nodesToRemove) => {
      const idsToRemove = nodesToRemove.map((node) => node.id);
      setNodes((nds) => nds.filter((node) => !idsToRemove.includes(node.id)));
      setEdges((eds) =>
        eds.filter(
          (edge) =>
            !idsToRemove.includes(edge.source) && !idsToRemove.includes(edge.target)
        )
      );
    },
    [setNodes, setEdges]
  );

  const onEdgesRemove = useCallback(
    (edgesToRemove) => {
      const idsToRemove = edgesToRemove.map((edge) => edge.id);
      setEdges((eds) => eds.filter((edge) => !idsToRemove.includes(edge.id)));
    },
    [setEdges]
  );

  const onSelectionChange = useCallback(({ nodes, edges }) => {
    setSelectedNodes(nodes);
    setSelectedEdges(edges);
  }, []);

  // useEffect(() => {
  //   const handleKeyDown = (event) => {
  //     if (event.key === 'Delete' || event.key === 'Backspace') {
  //       if (selectedNodes.length > 0) {
  //         onNodesRemove(selectedNodes);
  //       }
  //       if (selectedEdges.length > 0) {
  //         onEdgesRemove(selectedEdges);
  //       }
  //     }
  //   };

  //   window.addEventListener('keydown', handleKeyDown);
  //   return () => {
  //     window.removeEventListener('keydown', handleKeyDown);
  //   };
  // }, [onNodesRemove, onEdgesRemove, selectedNodes, selectedEdges]);

  const executeFlowchart = useCallback(async () => {
    setConsoleOutput('');
    setCharacterMessage(''); // Reset character message
    setCharacterPosition({ x: 0, y: 0 }); // Reset character position
  
    const currentNodes = nodes;
    const currentEdges = edges;
  
    const startNode = currentNodes.find((node) => node.data.nodeType === 'start');
    if (!startNode) {
      alert('No Start node found');
      return;
    }
  
    const outputs = [];
    const visitedNodes = new Set();
    const context = {
      outputs,
      variables: {},
    };
  
    const traverse = async (nodeId) => {
      console.log(`Traversing node: ${nodeId}`);
      // if (visitedNodes.has(nodeId)) {
      //   return;
      // }
      // visitedNodes.add(nodeId);
  
      const node = currentNodes.find((n) => n.id === nodeId);
      if (!node) return;
  
      if (node.data.nodeType === 'setVariable') {
        const { varName, varValue } = node.data;
        if (varName) {
          let value;
          try {
            const valueFunc = new Function(
              'variables',
              `with (variables) { return (${varValue}); }`
            );
            value = valueFunc(context.variables);
          } catch (error) {
            console.error(`Error evaluating value at node ${node.id}:`, error);
            outputs.push(
              `Error evaluating value in node ${node.id}: ${error.message}`
            );
            return; // Use return instead of continue
          }
          context.variables[varName] = value;
          console.log(`Set variable ${varName} = ${value}`);
        }
      } else if (node.data.nodeType === 'if') {
        // Evaluate condition for If node
        const { leftOperand, operator, rightOperand } = node.data;
        let conditionMet = false;
        if (leftOperand && operator && rightOperand) {
          try {
            const condition = `${leftOperand} ${operator} ${rightOperand}`;
            console.log(`Evaluating condition at node ${node.id}: ${condition}`);
            const condFunc = new Function(
              'variables',
              `with (variables) { return (${condition}); }`
            );
            conditionMet = condFunc(context.variables);
          } catch (error) {
            console.error(`Error evaluating condition at node ${node.id}:`, error);
            outputs.push(
              `Error evaluating condition in node ${node.id}: ${error.message}`
            );
            return; // Use return instead of continue
          }
        } else {
          outputs.push(`Incomplete condition in node ${node.id}`);
          return;
        }
        // Store conditionMet in the node's data for use in edge traversal
        node.conditionMet = conditionMet;
      } else if (node.data.nodeType === 'print') {
        let message = node.data.message || '';
        let evaluatedMessage;
        try {
          const messageFunc = new Function(
            'variables',
            `with (variables) { return (${JSON.stringify(message)}); }`
          );
          evaluatedMessage = messageFunc(context.variables);
        } catch (error) {
          console.error(`Error evaluating message at node ${node.id}:`, error);
          outputs.push(
            `Error evaluating message in node ${node.id}: ${error.message}`
          );
          return;
        }
        outputs.push(evaluatedMessage);
        setCharacterMessage(evaluatedMessage);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setCharacterMessage('');
      } else if (node.data.nodeType.startsWith('move')) {
        // Handle movement blocks
        let distance = parseInt(node.data.distance);
        if (isNaN(distance)) {
          distance = 10; // Default distance if not set
        }
        let dx = 0;
        let dy = 0;
  
        switch (node.data.nodeType) {
          case 'moveUp':
            dy = -distance;
            break;
          case 'moveDown':
            dy = distance;
            break;
          case 'moveLeft':
            dx = -distance;
            break;
          case 'moveRight':
            dx = distance;
            break;
          case 'move':
            // For generic move block, we can ask for direction and distance
            // For simplicity, let's assume positive distance moves right, negative moves left
            dx = distance;
            break;
          default:
            break;
        }
  
        setCharacterPosition((prevPos) => {
          const newPos = { x: prevPos.x + dx, y: prevPos.y + dy };
          return newPos;
        });
  
        await new Promise((resolve) => setTimeout(resolve, 500)); // Wait for animation
      } else if (node.data.action) {
        // Provide context to the action
        try {
          const func = new Function('context', node.data.action);
          func(context);
        } catch (error) {
          console.error(`Error executing node ${node.id}:`, error);
          outputs.push(`Error in node ${node.id}: ${error.message}`);
          return;
        }
      }
  
      // Handle control flow
      const connectedEdges = currentEdges.filter((e) => e.source === nodeId);
  
      for (const edge of connectedEdges) {
        const targetNodeId = edge.target;
        const targetNode = currentNodes.find((n) => n.id === targetNodeId);
  
        if (!targetNode) continue;
  
        if (node.data.nodeType === 'if') {
          const conditionMet = node.conditionMet;
          const sourceHandleType = edge.sourceHandle
            ? edge.sourceHandle.split('-')[0]
            : '';
          if (
            (sourceHandleType === 'yes' && conditionMet) ||
            (sourceHandleType === 'no' && !conditionMet)
          ) {
            await traverse(targetNodeId);
          }
        } else if (node.data.nodeType === 'while') {
          let conditionMet = false;
          let condFunc;
          try {
            condFunc = new Function(
              'variables',
              `with (variables) { return (${node.data.action}); }`
            );
            conditionMet = condFunc(context.variables);
          } catch (error) {
            console.error(`Error evaluating condition at node ${node.id}:`, error);
            outputs.push(
              `Error evaluating condition in node ${node.id}: ${error.message}`
            );
            break;
          }
  
          while (conditionMet) {
            await traverse(targetNodeId);
            try {
              conditionMet = condFunc(context.variables);
            } catch (error) {
              console.error(
                `Error re-evaluating condition at node ${node.id}:`,
                error
              );
              outputs.push(
                `Error re-evaluating condition in node ${node.id}: ${error.message}`
              );
              break;
            }
          }
        } else {
          await traverse(targetNodeId);
        }
      }
    };
  
    await traverse(startNode.id);
  
    console.log('Outputs:', outputs);
    setConsoleOutput(outputs.join('\n'));
  }, [nodes, edges]);

  return (
    <div className="App">
      <div className="app-container">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Middle Flowchart Canvas */}
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
          // onNodesRemove={onNodesRemove}
          // onEdgesRemove={onEdgesRemove}
          onSelectionChange={onSelectionChange}
        >
          <Controls />
          <Background color="#aaa" gap={16} />
        </ReactFlow>
        {/* Run and Delete Buttons */}
        <button
            onClick={executeFlowchart}
            className="run-button"
          >
            Run
          </button>
          <button
            onClick={() => {
              setNodes((nds) => nds.filter((node) => !selectedNodes.includes(node)));
              setEdges((eds) => eds.filter((edge) => !selectedEdges.includes(edge)));
            }}
            disabled={selectedNodes.length === 0 && selectedEdges.length === 0}
            className="delete-button"
          >
            Delete
          </button>
        </div>

        {/* Right Console and Character Area */}
        <div className="right-panel">
          {/* Character Display */}
          <div className="character-area">
            <Character message={characterMessage} position={characterPosition} />
          </div>

          {/* Console Area */}
          <div className="console">
            <h3>Console Output</h3>
            <pre>{consoleOutput}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;