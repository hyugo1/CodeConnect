// src/App.js

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

  const resetExecution = useCallback(() => {
    setConsoleOutput('');
    setCharacterPosition({ x: 0, y: 0 });
    setCharacterMessage('');
    console.log('Console and Character have been reset.');
  }, [setConsoleOutput, setCharacterPosition, setCharacterMessage]);

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

  

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

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
        //while start and end nodes
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
  
        setNodes((nds) => nds.concat([whileStartNode, whileEndNode]));
  
        // Connect While Start and While End nodes
        const newEdge = {
          id: `e${whileStartNode.id}-${whileEndNode.id}`,
          source: whileStartNode.id,
          target: whileEndNode.id,
          type: 'custom',
          animated: false,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#555', strokeWidth: 3 },
          label: '',
        };
        setEdges((eds) => eds.concat(newEdge));

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
        setEdges((eds) => eds.concat(loopBackEdge));
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

  // const onNodesRemove = useCallback(
  //   (nodesToRemove) => {
  //     const idsToRemove = nodesToRemove.map((node) => node.id);
  //     setNodes((nds) => nds.filter((node) => !idsToRemove.includes(node.id)));
  //     setEdges((eds) =>
  //       eds.filter(
  //         (edge) =>
  //           !idsToRemove.includes(edge.source) && !idsToRemove.includes(edge.target)
  //       )
  //     );
  //   },
  //   [setNodes, setEdges]
  // );

  // const onEdgesRemove = useCallback(
  //   (edgesToRemove) => {
  //     const idsToRemove = edgesToRemove.map((edge) => edge.id);
  //     setEdges((eds) => eds.filter((edge) => !idsToRemove.includes(edge.id)));
  //   },
  //   [setEdges]
  // );

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
    // Helper function to determine if a node is part of a loop

  const MAX_ITERATIONS = 1000;

  const executeFlowchart = useCallback(async () => {
    let iterationCount = 0;
    setConsoleOutput('');
    setCharacterMessage(''); // Reset character message
    setCharacterPosition({ x: 0, y: 0 }); // Reset character position
  
    const currentNodes = nodes;
    const currentEdges = edges;
  
    // Define isLoopNode inside executeFlowchart to access currentNodes
    const isLoopNode = (nodeId) => {
      const node = currentNodes.find((n) => n.id === nodeId);
      return node && (node.data.nodeType === 'whileStart' || node.data.nodeType === 'whileEnd');
    };
  
    const startNode = currentNodes.find((node) => node.data.nodeType === 'start');
    if (!startNode) {
      alert('No Start node found');
      return;
    }
  
    const outputs = [];
    const context = {
      outputs,
      variables: {},
    };
  
    const traverse = async (nodeId) => {
      iterationCount++;
      if (iterationCount > MAX_ITERATIONS) {
        outputs.push('Error: Maximum iteration limit reached.');
        return;
      }
  
      console.log(`Traversing node: ${nodeId}`);
  
      const node = currentNodes.find((n) => n.id === nodeId);
      if (!node) return;
  
      switch (node.data.nodeType) {
        case 'setVariable': {
          const { varName, varValue } = node.data;
          if (varName) {
            try {
              /* eslint-disable no-new-func */
              const valueFunc = new Function(
                'variables',
                `with (variables) { return (${varValue}); }`
              );
              /* eslint-enable no-new-func */
              const value = valueFunc(context.variables);
              context.variables[varName] = value;
              console.log(`Set variable ${varName} = ${value}`);
            } catch (error) {
              console.error(`Error evaluating value at node ${node.id}:`, error);
              outputs.push(`Error evaluating value in node ${node.id}: ${error.message}`);
              return;
            }
          }
          break;
        }
  
        case 'incrementDecrement': {
          const { varName, varValue } = node.data;
          if (varName) {
            const incrementValue = parseFloat(varValue);
            if (isNaN(incrementValue)) {
              outputs.push(`Invalid increment value at node ${node.id}`);
              return;
            }
            if (context.variables.hasOwnProperty(varName)) {
              context.variables[varName] += incrementValue;
              console.log(`Incremented variable ${varName} by ${incrementValue}. New value: ${context.variables[varName]}`);
            } else {
              outputs.push(`Variable ${varName} is not defined at node ${node.id}`);
              return;
            }
          }
          break;
        }
  
        case 'if': {
          const { leftOperand, operator, rightOperand } = node.data;
          let conditionMet = false;
          if (leftOperand && operator && rightOperand) {
            try {
              const condition = `${leftOperand} ${operator} ${rightOperand}`;
              console.log(`Evaluating condition at node ${node.id}: ${condition}`);
              /* eslint-disable no-new-func */
              const condFunc = new Function(
                'variables',
                `with (variables) { return (${condition}); }`
              );
              /* eslint-enable no-new-func */
              conditionMet = condFunc(context.variables);
            } catch (error) {
              console.error(`Error evaluating condition at node ${node.id}:`, error);
              outputs.push(`Error evaluating condition in node ${node.id}: ${error.message}`);
              return;
            }
          } else {
            outputs.push(`Incomplete condition in node ${node.id}`);
            return;
          }
          // Store conditionMet in the node's data for use in edge traversal
          node.conditionMet = conditionMet;
          break;
        }
  
        case 'print': {
          let message = node.data.message || '';
          let evaluatedMessage;
          try {
            /* eslint-disable no-new-func */
            const messageFunc = new Function(
              'variables',
              `with (variables) { return (${message}); }`
            );
            /* eslint-enable no-new-func */
            evaluatedMessage = messageFunc(context.variables);
          } catch (error) {
            // If an error occurs, treat message as a string literal
            try {
              /* eslint-disable no-new-func */
              const messageFunc = new Function(
                'variables',
                `with (variables) { return (\`${message}\`); }`
              );
              /* eslint-enable no-new-func */
              evaluatedMessage = messageFunc(context.variables);
            } catch (err) {
              console.error(`Error evaluating message at node ${node.id}:`, err);
              outputs.push(`Error evaluating message in node ${node.id}: ${err.message}`);
              return;
            }
          }
          outputs.push(evaluatedMessage);
          setCharacterMessage(evaluatedMessage);
          await new Promise((resolve) => setTimeout(resolve, 2000));
          setCharacterMessage('');
          break;
        }
  
        case 'moveUp':
        case 'moveDown':
        case 'moveLeft':
        case 'moveRight':
        case 'move': {
          let distance = parseInt(node.data.distance, 10);
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
              // For generic move block, assume direction and distance
              const { direction } = node.data;
              switch (direction) {
                case 'up':
                  dy = -distance;
                  break;
                case 'down':
                  dy = distance;
                  break;
                case 'left':
                  dx = -distance;
                  break;
                case 'right':
                  dx = distance;
                  break;
                default:
                  dx = distance; // Default to right if direction is undefined
              }
              break;
            default:
              break;
          }
  
          setCharacterPosition((prevPos) => ({
            x: prevPos.x + dx,
            y: prevPos.y + dy,
          }));
  
          await new Promise((resolve) => setTimeout(resolve, 500)); // Wait for animation
          break;
        }
  
        case 'action': {
          if (node.data.action) {
            try {
              /* eslint-disable no-new-func */
              const func = new Function('context', node.data.action);
              /* eslint-enable no-new-func */
              func(context);
            } catch (error) {
              console.error(`Error executing node ${node.id}:`, error);
              outputs.push(`Error in node ${node.id}: ${error.message}`);
              return;
            }
          }
          break;
        }
  
        case 'whileEnd': {
          // Evaluate the condition
          const { leftOperand, operator, rightOperand } = node.data;
          let conditionMet = false;
          if (leftOperand && operator && rightOperand) {
            try {
              const condition = `${leftOperand} ${operator} ${rightOperand}`;
              console.log(`Evaluating condition at node ${node.id}: ${condition}`);
              /* eslint-disable no-new-func */
              const condFunc = new Function(
                'variables',
                `with (variables) { return (${condition}); }`
              );
              /* eslint-enable no-new-func */
              conditionMet = condFunc(context.variables);
            } catch (error) {
              console.error(`Error evaluating condition at node ${node.id}:`, error);
              outputs.push(`Error evaluating condition in node ${node.id}: ${error.message}`);
              return;
            }
          } else {
            outputs.push(`Incomplete condition in node ${node.id}`);
            return;
          }
  
          if (conditionMet) {
            // Loop back to 'whileStart'
            await traverse(node.data.whileStartNodeId);
          } else {
            // Proceed to the next node after 'whileEnd'
            const exitEdge = currentEdges.find(
              (e) => e.source === node.id && (!e.sourceHandle || !e.sourceHandle.startsWith('loopBack-'))
            );
            if (exitEdge) {
              await traverse(exitEdge.target);
            } else {
              outputs.push(`No exit edge found for node ${node.id}`);
            }
          }
          break;
        }
  
        default:
          // Handle other node types if necessary
          break;
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
        } else if (node.data.nodeType === 'whileStart') {
          // Proceed to the next node(s)
          await traverse(targetNodeId);
        } else if (node.data.nodeType === 'whileEnd') {
          // Already handled above
        } else {
          await traverse(targetNodeId);
        }
      }
    };
  
    await traverse(startNode.id);
  
    console.log('Outputs:', outputs);
    setConsoleOutput(outputs.join('\n'));
  }, [nodes, edges, setConsoleOutput, setCharacterMessage, setCharacterPosition]);

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
        {/* Run, Reset, and Delete Buttons */}
        <div className="button-group">
            <button
              onClick={executeFlowchart}
              className="run-button"
            >
              Run
            </button>
            <button
              onClick={resetExecution}
              className="reset-button"
            >
              Reset
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