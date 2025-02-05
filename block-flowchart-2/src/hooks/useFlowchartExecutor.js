// src/hooks/useFlowchartExecutor.js
import { useCallback } from 'react';
import { evaluate } from 'mathjs';

export function useFlowchartExecutor(
  nodes,
  edges,
  setConsoleOutput,
  setCharacterPosition,
  setCharacterMessage
) {
  const MAX_ITERATIONS = 100;

  const resetExecution = useCallback(() => {
    setConsoleOutput('');
    setCharacterPosition({ x: 0, y: 0 });
    setCharacterMessage('');
    console.log('Console and Character have been reset.');
  }, [setConsoleOutput, setCharacterPosition, setCharacterMessage]);

  /**
   * Recursive function to traverse and execute nodes.
   *
   * @param {string} nodeId - Current node ID.
   * @param {Set} visited - Set of visited node IDs (used when not in a loop).
   * @param {boolean} inLoop - Flag indicating if we are inside a while loop.
   */
  const traverse = async (nodeId, visited, inLoop = false) => {
    // Increase iteration counter and bail out if too many iterations
    iterationCount++;
    if (iterationCount > MAX_ITERATIONS) {
      outputs.push('Error: Maximum iteration limit reached.');
      console.error('Maximum iteration limit reached.');
      setConsoleOutput(outputs.join('\n'));
      return;
    }

    // Find the current node
    const node = currentNodes.find((n) => n.id === nodeId);
    if (!node) {
      outputs.push(`Error: Node with ID ${nodeId} not found.`);
      console.error(`Node with ID ${nodeId} not found.`);
      setConsoleOutput(outputs.join('\n'));
      return;
    }

    // Only use the visited set when not in a loop.
    if (!inLoop) {
      if (visited.has(nodeId)) {
        console.warn(`Node ${nodeId} has already been visited. Skipping to prevent infinite loop.`);
        return;
      }
      visited.add(nodeId);
    }

    console.log(`\n--- Executing Node: ${node.id} (${node.data.nodeType}) ---`);
    outputs.push(`Executing node ${node.data.nodeType}`);

    switch (node.data.nodeType) {
      case 'start':
        await executeNextNode(node.id, visited, inLoop);
        break;

      case 'end':
        outputs.push('Execution ended.');
        console.log('Execution ended.');
        setConsoleOutput(outputs.join('\n'));
        setCharacterPosition(context.characterPos || { x: 0, y: 0 });
        setCharacterMessage(context.characterMsg || '');
        break;

      case 'setVariable': {
        const { varName, varValue } = node.data;
        if (varName) {
          try {
            const value = evaluate(varValue, context.variables);
            context.variables[varName] = value;
            outputs.push(`Set variable ${varName} = ${value}`);
            console.log(`Set variable ${varName} = ${value}`);
          } catch (error) {
            console.error(`Error evaluating value at node ${node.id}:`, error);
            outputs.push(`Error evaluating value in node ${node.id}: ${error.message}`);
            setConsoleOutput(outputs.join('\n'));
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
            setConsoleOutput(outputs.join('\n'));
            return;
          }
        } else {
          outputs.push(`Variable "${varName}" not found in node ${node.id}.`);
          console.error(`Variable "${varName}" not found in node ${node.id}.`);
          setConsoleOutput(outputs.join('\n'));
          return;
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
            conditionMet = evaluate(condition, context.variables);
            outputs.push(`Condition "${condition}" evaluated to ${conditionMet}`);
          } catch (error) {
            console.error(`Error evaluating condition at node ${node.id}:`, error);
            outputs.push(`Error evaluating condition in node ${node.id}: ${error.message}`);
            setConsoleOutput(outputs.join('\n'));
            return;
          }
        } else {
          outputs.push(`Incomplete condition in node ${node.id}.`);
          console.error(`Incomplete condition in node ${node.id}.`);
          setConsoleOutput(outputs.join('\n'));
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
            outputs.push(`While condition "${condition}" evaluated to ${conditionMet}`);
          } catch (error) {
            console.error(`Error evaluating while condition at node ${node.id}:`, error);
            outputs.push(`Error evaluating while condition in node ${node.id}: ${error.message}`);
            setConsoleOutput(outputs.join('\n'));
            return;
          }
        } else {
          outputs.push(`Incomplete while condition in node ${node.id}.`);
          console.error(`Incomplete while condition in node ${node.id}.`);
          setConsoleOutput(outputs.join('\n'));
          return;
        }

        if (conditionMet) {
          // When inside a loop, use a fresh visited set and mark inLoop = true.
          const loopBodyEdge = edges.find(
            (e) => e.source === node.id && e.sourceHandle === `body-${node.id}`
          );
          if (loopBodyEdge) {
            console.log(`Condition met. Traversing to loop body: ${loopBodyEdge.target}`);
            await traverse(loopBodyEdge.target, new Set(), true);
          } else {
            outputs.push(`No loop body connected to node ${node.id}.`);
            console.error(`No loop body connected to node ${node.id}.`);
            setConsoleOutput(outputs.join('\n'));
            return;
          }
        } else {
          // Follow the exit edge when condition fails.
          const exitEdge = edges.find(
            (e) => e.source === node.id && e.sourceHandle === `exit-${node.id}`
          );
          if (exitEdge) {
            console.log(`Condition not met. Exiting loop to node: ${exitEdge.target}`);
            await traverse(exitEdge.target, visited, inLoop);
          } else {
            outputs.push(`No exit path connected to node ${node.id}.`);
            console.error(`No exit path connected to node ${node.id}.`);
            setConsoleOutput(outputs.join('\n'));
            return;
          }
        }
        // Prevent further traversal for whileStart
        return;
      }

      case 'whileEnd': {
        const { whileStartNodeId } = node.data;
        if (whileStartNodeId) {
          console.log(`Loop end reached. Traversing back to While Start node: ${whileStartNodeId}`);
          // Loop back using a fresh visited set and keep inLoop true.
          await traverse(whileStartNodeId, new Set(), true);
        } else {
          const loopBackEdge = edges.find(
            (e) => e.source === node.id && e.sourceHandle === `loopBack-${node.id}`
          );
          if (loopBackEdge) {
            console.log(`Traversing back via loopBack edge to node: ${loopBackEdge.target}`);
            await traverse(loopBackEdge.target, visited, inLoop);
          } else {
            outputs.push(`No loop back path found for node ${node.id}.`);
            console.error(`No loop back path found for node ${node.id}.`);
            setConsoleOutput(outputs.join('\n'));
            return;
          }
        }
        // Prevent further traversal for whileEnd
        return;
      }

      case 'print': {
        const message = node.data.message || '';
        if (!message) {
          outputs.push(`Error: No message set in Print node "${node.id}".`);
          console.error(`No message set in Print node "${node.id}".`);
          setConsoleOutput(outputs.join('\n'));
          return;
        }

        let evaluatedMessage = '';

        // Replace variable references enclosed in curly braces, e.g. {x}
        evaluatedMessage = message.replace(/{(\w+)}/g, (match, varName) => {
          return context.variables.hasOwnProperty(varName) ? context.variables[varName] : match;
        });

        // If no curly brace substitution occurred and the message exactly matches a variable name, print its value.
        if (evaluatedMessage === message && context.variables.hasOwnProperty(message)) {
          evaluatedMessage = context.variables[message].toString();
        }

        outputs.push(`Print: ${evaluatedMessage}`);
        console.log(`Print: ${evaluatedMessage}`);
        setCharacterMessage(evaluatedMessage);

        // Optional delay to show the message
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setCharacterMessage('');
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
              outputs.push(`Unknown direction "${direction}" in Move node "${node.id}".`);
              console.error(`Unknown direction "${direction}" in Move node "${node.id}".`);
              setConsoleOutput(outputs.join('\n'));
              return;
          }

          context.characterPos = { x: newX, y: newY };
          outputs.push(`Moved ${direction} by ${distance} units to (${newX}, ${newY})`);
          console.log(`Moved ${direction} by ${distance} units to (${newX}, ${newY})`);
          setCharacterPosition({ x: newX, y: newY });
        } else {
          outputs.push(`Incomplete move data in node "${node.id}".`);
          console.error(`Incomplete move data in node "${node.id}".`);
        }
        break;
      }
      case 'operator': {
        // Attempt to evaluate the operator node
        try {
          // Map the custom operator names to mathematical symbols.
          let opSymbol = '';
          switch (node.data.operator) {
            case 'add':
              opSymbol = '+';
              break;
            case 'subtract':
              opSymbol = '-';
              break;
            case 'multiply':
              opSymbol = '*';
              break;
            case 'divide':
              opSymbol = '/';
              break;
            default:
              throw new Error('Unknown operator');
          }

          //operand1 and operand 2
          const operand1 = context.variables[node.data.operand1] !== undefined
            ? context.variables[node.data.operand1]
            : node.data.operand1;
          const operand2 = context.variables[node.data.operand2] !== undefined
            ? context.variables[node.data.operand2]
            : node.data.operand2;
          const expression = `${operand1} ${opSymbol} ${operand2}`;
    
          // Evaluate the expression using mathjs
          const result = evaluate(expression, context.variables);
    
          // Store the result in the variable specified by result var if applicable
          if (node.data.resultVar) {
            context.variables[node.data.resultVar] = result;
            outputs.push(`Operator node: ${expression} = ${result}`);
            console.log(`Operator node: ${expression} = ${result}`);
          } else {
            outputs.push(`Operator node evaluated: ${expression} = ${result}`);
            console.log(`Operator node evaluated: ${expression} = ${result}`);
          }
        } catch (error) {
          outputs.push(`Error in operator node ${node.id}: ${error.message}`);
          console.error(`Error in operator node ${node.id}:`, error);
        }
        break;
      }

      default:
        console.warn(`Unknown node type: ${node.data.nodeType}`);
        outputs.push(`Warning: Unknown node type "${node.data.nodeType}" in node "${node.id}".`);
        console.error(`Unknown node type: ${node.data.nodeType}`);
        break;
    }

    // Traverse connected edges for node types that did not return above.
    const connectedEdges = currentEdges.filter((e) => e.source === node.id);
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
          console.log(`Traversing to node ${targetNodeId} based on condition.`);
          await traverse(targetNodeId, visited, inLoop);
        }
      } else {
        console.log(`Traversing to node ${targetNodeId}.`);
        await traverse(targetNodeId, visited, inLoop);
      }
    }

    console.log(`--- Finished Node: ${node.id} ---\n`);
  };

  /**
   * Execute the next node connected to the current node.
   * @param {string} currentNodeId
   * @param {Set} visited - Set of visited node IDs.
   * @param {boolean} inLoop - Flag indicating if we are inside a while loop.
   */
  const executeNextNode = async (currentNodeId, visited, inLoop = false) => {
    const outgoingEdge = edges.find((edge) => edge.source === currentNodeId);
    if (outgoingEdge) {
      console.log(
        `Executing next node via edge ${outgoingEdge.id} to node ${outgoingEdge.target}`
      );
      await traverse(outgoingEdge.target, visited, inLoop);
    } else {
      outputs.push('Execution ended.');
      console.log('No outgoing edges. Execution ended.');
      setConsoleOutput(outputs.join('\n'));
      setCharacterPosition(context.characterPos || { x: 0, y: 0 });
      setCharacterMessage(context.characterMsg || '');
    }
  };

  // Define iterationCount and outputs in a scope accessible to traverse.
  let iterationCount = 0;
  const outputs = [];
  const context = {
    variables: {},
    outputs,
    characterPos: { x: 0, y: 0 },
    characterMsg: '',
  };
  const currentNodes = nodes;
  const currentEdges = edges;

  // Start traversal with an empty visited set and not in a loop.
  const runFlowchart = async () => {
    await traverse(
      currentNodes.find((node) => node.type === 'custom' && node.data.nodeType === 'start')
        .id,
      new Set(),
      false
    );
    setConsoleOutput(outputs.join('\n'));
  };

  const executeFlowchart = useCallback(() => {
    // Reset states before execution
    iterationCount = 0;
    outputs.length = 0;
    context.variables = {};
    setConsoleOutput('');
    setCharacterMessage('');
    setCharacterPosition({ x: 0, y: 0 });
    runFlowchart();
  }, [nodes, edges, setConsoleOutput, setCharacterPosition, setCharacterMessage]);

  return {
    executeFlowchart,
    resetExecution,
  };
}