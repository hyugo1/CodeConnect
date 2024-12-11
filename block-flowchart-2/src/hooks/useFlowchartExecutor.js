// src/hooks/useFlowchartExecutor.js

import { useCallback } from 'react';

export function useFlowchartExecutor(
  nodes,
  edges,
  setConsoleOutput,
  setCharacterPosition,
  setCharacterMessage
) {
  const MAX_ITERATIONS = 1000;

  const resetExecution = useCallback(() => {
    setConsoleOutput('');
    setCharacterPosition({ x: 0, y: 0 });
    setCharacterMessage('');
    console.log('Console and Character have been reset.');
  }, [setConsoleOutput, setCharacterPosition, setCharacterMessage]);

  const executeFlowchart = useCallback(async () => {
    let iterationCount = 0;
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

        case 'ChangeVariable': {
          const { varName, varValue } = node.data;
          if (varName) {
            const incrementValue = parseFloat(varValue);
            if (isNaN(incrementValue)) {
              outputs.push(`Invalid increment value at node ${node.id}`);
              return;
            }
            if (context.variables.hasOwnProperty(varName)) {
              context.variables[varName] += incrementValue;
              console.log(
                `Incremented variable ${varName} by ${incrementValue}. New value: ${context.variables[varName]}`
              );
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
          await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds
          setCharacterMessage('');
          break;
        }

        case 'operator': {
          const { operator, operand1, operand2, resultVar } = node.data;
          if (!operator || !resultVar) {
            outputs.push(`Incomplete operator configuration in node ${node.id}`);
            return;
          }

          let value1 = 0;
          let value2 = 0;

          // Retrieve operand values from variables or parse as numbers
          try {
            value1 = isNaN(parseFloat(operand1)) ? context.variables[operand1] : parseFloat(operand1);
            value2 = isNaN(parseFloat(operand2)) ? context.variables[operand2] : parseFloat(operand2);
          } catch (error) {
            outputs.push(`Error retrieving operands in node ${node.id}: ${error.message}`);
            return;
          }

          if (value1 === undefined || value2 === undefined) {
            outputs.push(`Undefined operands in node ${node.id}`);
            return;
          }

          let result = 0;
          switch (operator) {
            case 'add':
              result = value1 + value2;
              break;
            case 'subtract':
              result = value1 - value2;
              break;
            case 'multiply':
              result = value1 * value2;
              break;
            case 'divide':
              if (value2 === 0) {
                outputs.push(`Division by zero in node ${node.id}`);
                return;
              }
              result = value1 / value2;
              break;
            default:
              outputs.push(`Unknown operator "${operator}" in node ${node.id}`);
              return;
          }

          context.variables[resultVar] = result;
          outputs.push(`Variable "${resultVar}" set to ${result}`);
          console.log(`Operator "${operator}": ${operand1} ${operator} ${operand2} = ${result}`);
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
              // For generic move block, use direction and distance
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

        case 'whileStart': {
          // Do nothing here; the traversal will handle the loop
          break;
        }

        case 'whileEnd': {
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
              context.variables[`conditionMet_${node.id}`] = conditionMet; // Store condition
              console.log(`Condition met: ${conditionMet}`);
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
            // Optionally update a loop counter
            if (!context.variables.loopCounter) {
              context.variables.loopCounter = 1;
            } else {
              context.variables.loopCounter += 1;
            }
            console.log(`Loop Counter: ${context.variables.loopCounter}`);
            
            // Traverse back to whileStart
            const whileStartNodeId = node.data.whileStartNodeId;
            if (whileStartNodeId) {
              await traverse(whileStartNodeId);
            } else {
              outputs.push(`No matching While Start node for node ${node.id}`);
            }
          } else {
            // Exit loop
            const exitEdge = currentEdges.find(
              (e) =>
                e.source === node.id &&
                (!e.sourceHandle || !e.sourceHandle.startsWith('loopBack-'))
            );
            if (exitEdge) {
              await traverse(exitEdge.target);
            } else {
              outputs.push(`No exit edge found for node ${node.id}`);
            }
          }
          return; // Prevent further traversal
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
  }, [
    nodes,
    edges,
    setConsoleOutput,
    setCharacterMessage,
    setCharacterPosition,
  ]);

  return {
    executeFlowchart,
    resetExecution,
  };
}