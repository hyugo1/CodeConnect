import { useCallback } from 'react';
import { evaluate } from 'mathjs';

/**
 * Executes the flowchart by traversing and evaluating blocks.
 *
 * @param {Array} blocks - The array of block objects.
 * @param {Array} edges - The array of edge objects.
 * @param {Function} setConsoleOutput - Function to update console output.
 * @param {Function} setCharacterPosition - Function to update character position.
 * @param {Function} setCharacterMessage - Function to update character message.
 * @param {Function} setActiveBlockId - Function to update the active block id.
 * @param {Function} setActiveEdgeId - Function to update the active edge id.
 * @returns {Object} - { executeFlowchart, resetExecution }
 */
export function useFlowchartExecutor(
  blocks,
  edges,
  setConsoleOutput,
  setCharacterPosition,
  setCharacterMessage,
  setActiveBlockId,
  setActiveEdgeId
) {
  const MAX_ITERATIONS = 100;

  // Reset execution state.
  const resetExecution = useCallback(() => {
    setConsoleOutput('');
    setCharacterPosition({ x: 0, y: 0 });
    setCharacterMessage('');
    if (typeof setActiveBlockId === 'function') {
      setActiveBlockId(null);
    } else {
      console.error('setActiveBlockId is not a function in resetExecution:', setActiveBlockId);
    }
    if (typeof setActiveEdgeId === 'function') {
      setActiveEdgeId(null);
    } else {
      console.error('setActiveEdgeId is not a function in resetExecution:', setActiveEdgeId);
    }
    console.log('Console and Character have been reset.');
  }, [setConsoleOutput, setCharacterPosition, setCharacterMessage, setActiveBlockId, setActiveEdgeId]);

  // Execution context.
  const context = {
    variables: {},
    characterPos: { x: 0, y: 0 },
    characterMsg: '',
  };

  let iterationCount = 0;
  const outputs = [];
  const currentNodes = blocks;
  const currentEdges = edges;

  /**
   * Recursively traverse and execute blocks.
   *
   * @param {string} blockId - The current block's ID.
   * @param {Set} visited - Set of visited block IDs.
   * @param {boolean} inLoop - True if inside a while loop.
   */
  async function traverse(blockId, visited = new Set(), inLoop = false) {
    iterationCount++;
    if (iterationCount > MAX_ITERATIONS) {
      outputs.push('Error: Maximum iteration limit reached.');
      console.error('Maximum iteration limit reached.');
      setConsoleOutput(outputs.join('\n'));
      return;
    }
    const block = currentNodes.find(n => n.id === blockId);
    if (!block) {
      outputs.push(`Error: Node with ID ${blockId} not found.`);
      console.error(`Node with ID ${blockId} not found.`);
      setConsoleOutput(outputs.join('\n'));
      return;
    }
    if (!inLoop) {
      if (visited.has(blockId)) {
        console.warn(`Node ${blockId} already visited. Skipping to prevent infinite loop.`);
        return;
      }
      visited.add(blockId);
    }
    // Mark the current block as active.
    if (typeof setActiveBlockId === 'function') {
      setActiveBlockId(block.id);
    } else {
      console.error('setActiveBlockId is not a function!', setActiveBlockId);
    }
    await new Promise(resolve => setTimeout(resolve, 200));

    console.log(`\n--- Executing Node: ${block.id} (${block.data.blockType}) ---`);
    outputs.push(`Executing block ${block.data.blockType}`);

    switch (block.data.blockType) {
      case 'start':
        await executeNextNode(block.id, visited, inLoop);
        break;
      case 'end':
        outputs.push('Execution ended.');
        console.log('Execution ended.');
        setConsoleOutput(outputs.join('\n'));
        setCharacterPosition(context.characterPos);
        setCharacterMessage(context.characterMsg);
        break;
      case 'setVariable': {
        const { varName, varValue, valueType } = block.data;
        if (varName) {
          try {
            let value;
            if (valueType === 'string') {
              value = varValue;
            } else if (valueType === 'array') {
              value = varValue.split(',').map(item => item.trim());
            } else {
              // int
              value = evaluate(varValue, context.variables);
            }
            context.variables[varName] = value;
            outputs.push(`Set variable ${varName} = ${JSON.stringify(value)}`);
            console.log(`Set variable ${varName} = ${JSON.stringify(value)}`);
          } catch (error) {
            console.error(`Error evaluating value in block ${block.id}:`, error);
            outputs.push(`Error evaluating value in block ${block.id}: ${error.message}`);
            setConsoleOutput(outputs.join('\n'));
            return;
          }
        }
        break;
      }
      case 'changeVariable': {
        const { varName, varValue, valueType, operation } = block.data;
        if (varName && context.variables.hasOwnProperty(varName)) {
          try {
            if (valueType === 'string') {
              // For strings, simply replace the current value with the new one.
              context.variables[varName] = varValue;
            } else if (valueType === 'array') {
              // For arrays, parse the new items from varValue
              let newItems = varValue.split(',')
                .map(item => item.trim())
                .filter(item => item !== '');
      
              // If the variable isn't currently an array, replace it with a new array
              // (unless you want an error).
              if (!Array.isArray(context.variables[varName])) {
                context.variables[varName] = [];
              }
      
              if (operation === 'remove') {
                // Remove each of the newItems from the existing array.
                // e.g. if existing array is [ "1", "2", "3" ] and newItems is [ "2", "3" ],
                // result becomes [ "1" ].
                context.variables[varName] = context.variables[varName].filter(
                  el => !newItems.includes(el)
                );
              } else {
                // Default to "add"
                context.variables[varName] = context.variables[varName].concat(newItems);
              }
            } else {
              // Default: treat as number and add (using mathjs evaluate)
              const value = evaluate(varValue, context.variables);
              context.variables[varName] += value;
            }
            outputs.push(`Changed variable ${varName} to ${JSON.stringify(context.variables[varName])}`);
            console.log(`Changed variable ${varName} to ${JSON.stringify(context.variables[varName])}`);
          } catch (error) {
            console.error(`Error changing variable at block ${block.id}:`, error);
            outputs.push(`Error changing variable in block ${block.id}: ${error.message}`);
            setConsoleOutput(outputs.join('\n'));
            return;
          }
        } else {
          outputs.push(`Variable "${varName}" not found in block ${block.id}.`);
          console.error(`Variable "${varName}" not found in block ${block.id}.`);
          setConsoleOutput(outputs.join('\n'));
          return;
        }
        break;
      }
      case 'if': {
        const { leftOperand, operator, rightOperand } = block.data;
        let conditionMet = false;
        if (leftOperand && operator && rightOperand) {
          try {
            const condition = `${leftOperand} ${operator} ${rightOperand}`;
            console.log(`Evaluating condition at block ${block.id}: ${condition}`);
            conditionMet = evaluate(condition, context.variables);
            outputs.push(`Condition "${condition}" evaluated to ${conditionMet}`);
          } catch (error) {
            console.error(`Error evaluating condition at block ${block.id}:`, error);
            outputs.push(`Error evaluating condition in block ${block.id}: ${error.message}`);
            setConsoleOutput(outputs.join('\n'));
            return;
          }
        } else {
          outputs.push(`Incomplete condition in block ${block.id}.`);
          console.error(`Incomplete condition in block ${block.id}.`);
          setConsoleOutput(outputs.join('\n'));
          return;
        }
        block.conditionMet = conditionMet;
        break;
      }

      case 'whileStart': {
        const { leftOperand, operator, rightOperand } = block.data;
        let conditionMet = false;
        if (leftOperand && operator && rightOperand) {
          try {
            const condition = `${leftOperand} ${operator} ${rightOperand}`;
            console.log(`Evaluating while condition at block ${block.id}: ${condition}`);
            conditionMet = evaluate(condition, context.variables);
            outputs.push(`While condition "${condition}" evaluated to ${conditionMet}`);
          } catch (error) {
            console.error(`Error evaluating while condition at block ${block.id}:`, error);
            outputs.push(`Error evaluating while condition in block ${block.id}: ${error.message}`);
            setConsoleOutput(outputs.join('\n'));
            return;
          }
        } else {
          outputs.push(`Incomplete while condition in block ${block.id}.`);
          console.error(`Incomplete while condition in block ${block.id}.`);
          setConsoleOutput(outputs.join('\n'));
          return;
        }

        if (conditionMet) {
          const loopBodyEdge = edges.find(
            e => e.source === block.id && e.sourceHandle === `body-${block.id}`
          );
          if (loopBodyEdge) {
            console.log(`Condition met. Traversing to loop body: ${loopBodyEdge.target}`);
            await traverse(loopBodyEdge.target, new Set(), true);
          } else {
            outputs.push(`No loop body connected to block ${block.id}.`);
            console.error(`No loop body connected to block ${block.id}.`);
            setConsoleOutput(outputs.join('\n'));
            return;
          }
        } else {
          const exitEdge = edges.find(
            e => e.source === block.id && e.sourceHandle === `exit-${block.id}`
          );
          if (exitEdge) {
            console.log(`Condition not met. Exiting loop to block: ${exitEdge.target}`);
            await traverse(exitEdge.target, visited, inLoop);
          } else {
            outputs.push(`No exit path connected to block ${block.id}.`);
            console.error(`No exit path connected to block ${block.id}.`);
            setConsoleOutput(outputs.join('\n'));
            return;
          }
        }
        return; // Do not traverse beyond whileStart.
      }

      case 'whileEnd': {
        const { whileStartNodeId } = block.data;
        if (whileStartNodeId) {
          console.log(`Loop end reached. Traversing back to While Start block: ${whileStartNodeId}`);
          await traverse(whileStartNodeId, new Set(), true);
        } else {
          const loopBackEdge = edges.find(
            e => e.source === block.id && e.sourceHandle === `loopBack-${block.id}`
          );
          if (loopBackEdge) {
            console.log(`Traversing back via loopBack edge to block: ${loopBackEdge.target}`);
            await traverse(loopBackEdge.target, visited, inLoop);
          } else {
            outputs.push(`No loop back path found for block ${block.id}.`);
            console.error(`No loop back path found for block ${block.id}.`);
            setConsoleOutput(outputs.join('\n'));
            return;
          }
        }
        return; // Do not continue after whileEnd.
      }

      case 'print': {
        const message = block.data.message || '';
        if (!message) {
          outputs.push(`Error: No message set in Print block "${block.id}".`);
          console.error(`No message set in Print block "${block.id}".`);
          setConsoleOutput(outputs.join('\n'));
          return;
        }
        let evaluatedMessage = message.replace(/{(\w+)}/g, (match, varName) => {
          return context.variables.hasOwnProperty(varName)
            ? context.variables[varName]
            : match;
        });
        if (evaluatedMessage === message && context.variables.hasOwnProperty(message)) {
          evaluatedMessage = context.variables[message].toString();
        }
        outputs.push(`Print: ${evaluatedMessage}`);
        console.log(`Print: ${evaluatedMessage}`);
        setCharacterMessage(evaluatedMessage);
        // await new Promise(resolve => setTimeout(resolve, 1000));
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCharacterMessage('');
        break;
      }

      case 'move': {
        const { distance, direction } = block.data;
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
              outputs.push(`Unknown direction "${direction}" in Move block "${block.id}".`);
              console.error(`Unknown direction "${direction}" in Move block "${block.id}".`);
              setConsoleOutput(outputs.join('\n'));
              return;
          }
          context.characterPos = { x: newX, y: newY };
          outputs.push(`Moved ${direction} by ${distance} units to (${newX}, ${newY})`);
          console.log(`Moved ${direction} by ${distance} units to (${newX}, ${newY})`);
          setCharacterPosition({ x: newX, y: newY });
        } else {
          outputs.push(`Incomplete move data in block "${block.id}".`);
          console.error(`Incomplete move data in block "${block.id}".`);
        }
        break;
      }

      case 'function': {
        if (block.data.resultVar && block.data.expression) {
          try {
            const result = evaluate(block.data.expression, context.variables);
            context.variables[block.data.resultVar] = result;
            outputs.push(`Function block: ${block.data.resultVar} = ${result}`);
            console.log(`Function block: ${block.data.resultVar} = ${result}`);
          } catch (error) {
            outputs.push(`Error in function block ${block.id}: ${error.message}`);
            console.error(`Error in function block ${block.id}:`, error);
          }
        } else {
          outputs.push('// Incomplete function block');
        }
        break;
      }

      default:
        outputs.push(`Warning: Unknown block type "${block.data.blockType}" in block "${block.id}".`);
        console.error(`Unknown block type: ${block.data.blockType}`);
        break;
    }

    // Traverse outgoing edges.
    const connectedEdges = currentEdges.filter(e => e.source === block.id);
    for (const edge of connectedEdges) {
      const targetNodeId = edge.target;
      const targetNode = currentNodes.find(n => n.id === targetNodeId);
      if (targetNode && block.data.blockType === 'if') {
        const conditionMet = block.conditionMet;
        const sourceHandleType = edge.sourceHandle ? edge.sourceHandle.split('-')[0] : '';
        if ((sourceHandleType === 'yes' && conditionMet) || (sourceHandleType === 'no' && !conditionMet)) {
          if (typeof setActiveEdgeId === 'function') {
            setActiveEdgeId(edge.id);
          } else {
            console.error('setActiveEdgeId is not a function!', setActiveEdgeId);
          }
          await new Promise(resolve => setTimeout(resolve, 200));
          console.log(`Traversing to block ${targetNodeId} based on condition.`);
          await traverse(targetNodeId, visited, inLoop);
        }
      } else {
        if (typeof setActiveEdgeId === 'function') {
          setActiveEdgeId(edge.id);
        } else {
          console.error('setActiveEdgeId is not a function!', setActiveEdgeId);
        }
        await new Promise(resolve => setTimeout(resolve, 200));
        console.log(`Traversing to block ${targetNodeId}.`);
        await traverse(targetNodeId, visited, inLoop);
      }
    }

    console.log(`--- Finished Node: ${block.id} ---\n`);
  }

  async function executeNextNode(currentNodeId, visited, inLoop = false) {
    const outgoingEdge = edges.find(e => e.source === currentNodeId);
    if (outgoingEdge) {
      if (typeof setActiveEdgeId === 'function') {
        setActiveEdgeId(outgoingEdge.id);
      } else {
        console.error('setActiveEdgeId is not a function!', setActiveEdgeId);
      }
      await new Promise(resolve => setTimeout(resolve, 200));
      console.log(`Executing next block via edge ${outgoingEdge.id} to block ${outgoingEdge.target}`);
      await traverse(outgoingEdge.target, visited, inLoop);
    } else {
      outputs.push('Execution ended.');
      console.log('No outgoing edges. Execution ended.');
      setConsoleOutput(outputs.join('\n'));
      setCharacterPosition(context.characterPos);
      setCharacterMessage(context.characterMsg);
    }
  }

  async function runFlowchart() {
    const startBlock = currentNodes.find(
      block => block.type === 'custom' && block.data.blockType === 'start'
    );
    if (startBlock) {
      await traverse(startBlock.id, new Set(), false);
      setConsoleOutput(outputs.join('\n'));
    } else {
      outputs.push('Error: No start block found.');
      setConsoleOutput(outputs.join('\n'));
    }
  }

  const executeFlowchart = useCallback(() => {
    iterationCount = 0;
    outputs.length = 0;
    context.variables = {};
    setConsoleOutput('');
    setCharacterMessage('');
    setCharacterPosition({ x: 0, y: 0 });
    runFlowchart();
  }, [
    blocks,
    edges,
    setConsoleOutput,
    setCharacterPosition,
    setCharacterMessage,
    setActiveBlockId,
    setActiveEdgeId,
  ]);

  return {
    executeFlowchart,
    resetExecution,
  };
}