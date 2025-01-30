// src/hooks/useFlowchartExecutor.js

import { useCallback, useRef } from 'react';
import { evaluate } from 'mathjs';

export function useFlowchartExecutor(
  nodes,
  edges,
  setConsoleOutput,
  setCharacterPosition,
  setCharacterMessage
) {
  const MAX_ITERATIONS = 1000;

  // Use ref for visited nodes to maintain reference across renders
  const visitedNodesRef = useRef(new Set());

  const resetExecution = useCallback(() => {
    setConsoleOutput('');
    setCharacterPosition({ x: 0, y: 0 });
    setCharacterMessage('');
    visitedNodesRef.current.clear();
    console.log('Console and Character have been reset.');
  }, [setConsoleOutput, setCharacterPosition, setCharacterMessage]);

  const executeFlowchart = useCallback(async () => {
    let iterationCount = 0;
    setConsoleOutput('');
    setCharacterMessage('');
    setCharacterPosition({ x: 0, y: 0 });

    const currentNodes = nodes;
    const currentEdges = edges;

    const startNode = currentNodes.find(
      (node) => node.type === 'custom' && node.data.nodeType === 'start'
    );
    if (!startNode) {
      alert('No Start node found');
      return;
    }

    const outputs = [];
    const context = {
      variables: {},
      outputs,
      characterPos: { x: 0, y: 0 },
      characterMsg: '',
    };

    /**
     * Recursive function to traverse and execute nodes
     * @param {string} nodeId - Current node ID
     */
    const traverse = async (nodeId) => {
      if (visitedNodesRef.current.has(nodeId)) {
        return;
      }
      visitedNodesRef.current.add(nodeId);

      iterationCount++;
      if (iterationCount > MAX_ITERATIONS) {
        outputs.push('Error: Maximum iteration limit reached.');
        return;
      }

      const node = currentNodes.find((n) => n.id === nodeId);
      if (!node) {
        outputs.push(`Error: Node with ID ${nodeId} not found.`);
        return;
      }

      switch (node.data.nodeType) {
        case 'start':
          // Move to the next node
          executeNextNode(node.id);
          break;

        case 'end':
          setConsoleOutput(context.outputs.join('\n'));
          setCharacterPosition(context.characterPos || { x: 0, y: 0 });
          setCharacterMessage(context.characterMsg || '');
          break;

        case 'setVariable': {
          const { varName, varValue } = node.data;
          if (varName) {
            try {
              // Safely evaluate the variable value
              const value = evaluate(varValue, context.variables);
              context.variables[varName] = value;
              outputs.push(`Set variable ${varName} = ${value}`);
              console.log(`Set variable ${varName} = ${value}`);
            } catch (error) {
              console.error(`Error evaluating value at node ${node.id}:`, error);
              outputs.push(`Error evaluating value in node ${node.id}: ${error.message}`);
              return;
            }
          }
          break;
        }

        case 'changeVariable': {
          const { varName, varValue } = node.data;
          if (varName && context.variables.hasOwnProperty(varName)) {
            try {
              const value = evaluate(varValue, context.variables);
              context.variables[varName] += value;
              outputs.push(
                `Changed variable ${varName} by ${value}, new value: ${context.variables[varName]}`
              );
              console.log(
                `Changed variable ${varName} by ${value}, new value: ${context.variables[varName]}`
              );
            } catch (error) {
              console.error(`Error changing variable at node ${node.id}:`, error);
              outputs.push(`Error changing variable in node ${node.id}: ${error.message}`);
              return;
            }
          } else {
            outputs.push(`Variable "${varName}" not found in node ${node.id}.`);
            return;
          }
          break;
        }

        case 'if': {
          const { leftOperand, operator, rightOperand } = node.data;
          let conditionMet = false;
          if (leftOperand && operator && rightOperand) {
            try {
              // Safely evaluate the condition
              const condition = `${leftOperand} ${operator} ${rightOperand}`;
              console.log(`Evaluating condition at node ${node.id}: ${condition}`);
              conditionMet = evaluate(condition, context.variables);
            } catch (error) {
              console.error(`Error evaluating condition at node ${node.id}:`, error);
              outputs.push(`Error evaluating condition in node ${node.id}: ${error.message}`);
              return;
            }
          } else {
            outputs.push(`Incomplete condition in node ${node.id}.`);
            return;
          }
          node.conditionMet = conditionMet;
          break;
        }

        case 'whileStart': {
          const { leftOperand, operator, rightOperand } = node.data;
          let conditionMet = false;
          if (leftOperand && operator && rightOperand) {
            try {
              const condition = `${leftOperand} ${operator} ${rightOperand}`;
              console.log(`Evaluating while condition at node ${node.id}: ${condition}`);
              conditionMet = evaluate(condition, context.variables);
            } catch (error) {
              console.error(`Error evaluating while condition at node ${node.id}:`, error);
              outputs.push(`Error evaluating while condition in node ${node.id}: ${error.message}`);
              return;
            }
          } else {
            outputs.push(`Incomplete while condition in node ${node.id}.`);
            return;
          }

          if (conditionMet) {
            // Proceed to loop body
            await executeNextNode(node.id, 'body');
          } else {
            // Proceed to exit
            await executeNextNode(node.id, 'exit');
          }
          break;
        }
        case 'whileEnd': {
          // FIND the "Loop" edge from this whileEnd node
          const loopEdge = currentEdges.find(
            (edge) => edge.source === node.id && edge.label === 'Loop'
          );
        
          if (loopEdge) {
            // Follow that edge back to the whileStart
            await traverse(loopEdge.target);
          } else {
            console.warn(`No "Loop" edge found from whileEnd node ${node.id}.`);
          }
          break;
        }

        case 'print': {
          const message = node.data.message || '';
          if (!message) {
            outputs.push(`Error: No message set in Print node "${node.id}".`);
            return;
          }

          // Check if the message is a variable name
          if (context.variables.hasOwnProperty(message)) {
            const value = context.variables[message];
            outputs.push(value);
            setCharacterMessage(value.toString());
            console.log(`Print: ${value}`);
            // Optional: Delay to show the message
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setCharacterMessage('');
          } else {
            // If message contains variable references like ${varName}, replace them
            const evaluatedMessage = message.replace(/\$\{(\w+)\}/g, (match, p1) => {
              return context.variables[p1] !== undefined ? context.variables[p1] : match;
            });
            outputs.push(evaluatedMessage);
            setCharacterMessage(evaluatedMessage);
            console.log(`Print: ${evaluatedMessage}`);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setCharacterMessage('');
          }
          break;
        }

        case 'move': {
          const { distance, direction } = node.data;
          if (distance && direction) {
            let newX = context.characterPos?.x || 0;
            let newY = context.characterPos?.y || 0;

            switch (direction) {
              case 'left':
                newX -= distance;
                break;
              case 'right':
                newX += distance;
                break;
              case 'up':
                newY -= distance;
                break;
              case 'down':
                newY += distance;
                break;
              default:
                break;
            }

            context.characterPos = { x: newX, y: newY };
            outputs.push(`Moved ${direction} by ${distance} units to (${newX}, ${newY})`);
            setCharacterPosition({ x: newX, y: newY });
            console.log(`Moved ${direction} by ${distance} units to (${newX}, ${newY})`);
          }
          break;
        }

        // Implement other node types like 'operator', 'dummy', etc.

        default:
          console.warn(`Unknown node type: ${node.data.nodeType}`);
          break;
      }

      // Traverse edges to connected nodes
      const connectedEdges = currentEdges.filter((e) => e.source === nodeId);
      for (const edge of connectedEdges) {
        const targetNodeId = edge.target;

        const targetNode = currentNodes.find((n) => n.id === targetNodeId);
        if (targetNode && node.data.nodeType === 'if') {
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
        } else if (targetNode && node.data.nodeType === 'whileStart') {
          // Handle the True path to loop body and False path to exit
          if (edge.label === 'True') {
            await traverse(targetNodeId);
          } else if (edge.label === 'False') {
            await traverse(targetNodeId);
          }
        } else {
          await traverse(targetNodeId);
        }
      }
    };

    /**
     * Execute the next node connected to the current node
     * @param {string} currentNodeId
     * @param {string} handleType - 'body' or 'exit'
     */
    const executeNextNode = (currentNodeId, handleType = 'default') => {
      // Find the outgoing edge based on handleType
      let outgoingEdge = null;
      if (handleType === 'body') {
        outgoingEdge = edges.find(
          (edge) => edge.source === currentNodeId && edge.label === 'True'
        );
      } else if (handleType === 'exit') {
        outgoingEdge = edges.find(
          (edge) => edge.source === currentNodeId && edge.label === 'False'
        );
      } else {
        outgoingEdge = edges.find((edge) => edge.source === currentNodeId);
      }

      if (outgoingEdge && outgoingEdge.target) {
        traverse(outgoingEdge.target);
      } else {
        // If no specific edge, proceed to the first outgoing edge
        const defaultEdge = edges.find((edge) => edge.source === currentNodeId);
        if (defaultEdge && defaultEdge.target) {
          traverse(defaultEdge.target);
        } else {
          setConsoleOutput(context.outputs.join('\n') + '\nExecution ended.');
          setCharacterPosition(context.characterPos || { x: 0, y: 0 });
          setCharacterMessage(context.characterMsg || '');
        }
      }
    };

    // Start traversal
    traverse(startNode.id);

    setConsoleOutput(context.outputs.join('\n'));
  }, [
    nodes,
    edges,
    setConsoleOutput,
    setCharacterPosition,
    setCharacterMessage,
  ]);

  return {
    executeFlowchart,
    resetExecution,
  };
}