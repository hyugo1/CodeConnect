import React, { useRef, useState, useCallback } from 'react';
import { evaluate } from 'mathjs';

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
  const BASE_BLOCK_DELAY = 800;   // base time a block stays active
  const BASE_EDGE_DELAY = 800;    // base time an edge stays active
  const PRINT_DELAY = 1000;       // delay for print blocks

  const speedRef = useRef(2);
  const [paused, setPaused] = useState(false);

  const delay = async (ms) => {
    let remaining = ms / speedRef.current;
    while (remaining > 0) {
      if (paused) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      } else {
        const chunk = Math.min(50, remaining);
        const t0 = Date.now();
        await new Promise((resolve) => setTimeout(resolve, chunk));
        const t1 = Date.now();
        remaining -= (t1 - t0);
      }
    }
  };

  const setSpeedMultiplier = useCallback((multiplier) => {
    speedRef.current = multiplier;
    console.log(`Speed multiplier set to ${multiplier}`);
  }, []);

  // Toggle pause/resume. TODO: NEEDS FIXING  
  const togglePause = useCallback(() => {
    setPaused((prev) => {
      const newVal = !prev;
      console.log(`Paused: ${newVal}`);
      return newVal;
    });
  }, []);

  // Reset execution state and unpause.
  const resetExecution = useCallback(() => {
    setConsoleOutput('');
    setCharacterPosition({ x: 0, y: 0 });
    setCharacterMessage('');
    setActiveBlockId(null);
    setActiveEdgeId(null);
    setPaused(false);
    console.log('Execution has been reset.');
  }, [setConsoleOutput, setCharacterPosition, setCharacterMessage, setActiveBlockId, setActiveEdgeId]);

  // Execution context: holds runtime variables and character state.
  const context = {
    variables: {},
    characterPos: { x: 0, y: 0 },
    characterMsg: '',
  };

  let iterationCount = 0;
  const outputs = [];
  const currentNodes = blocks;
  const currentEdges = edges;

  async function traverse(blockId, visited = new Set(), inLoop = false) {
    iterationCount++;
    if (iterationCount > MAX_ITERATIONS) {
      outputs.push('Error: Maximum iteration limit reached.');
      console.error('Maximum iteration limit reached.');
      setConsoleOutput(outputs.join('\n'));
      return;
    }
    const block = currentNodes.find((n) => n.id === blockId);
    if (!block) {
      outputs.push(`Error: Node with ID ${blockId} not found.`);
      console.error(`Node with ID ${blockId} not found.`);
      setConsoleOutput(outputs.join('\n'));
      return;
    }
    // Prevent infinite loops (unless in a loop context)
    if (!inLoop && visited.has(blockId)) {
      console.warn(`Node ${blockId} already visited. Skipping to prevent infinite loop.`);
      return;
    }
    visited.add(blockId);

    // Set the active block and wait a constant time.
    setActiveBlockId(block.id);
    await delay(BASE_BLOCK_DELAY);

    console.log(`\n--- Executing Node: ${block.id} (${block.data.blockType}) ---`);
    outputs.push(`Executing block ${block.data.blockType}`);

    switch (block.data.blockType) {
      case 'start':
        await executeNextNode(block.id, visited, inLoop);
        break;
      case 'end':
        outputs.push('Execution ended.');
        console.log('Execution ended.');
        // Clear active block and edge so animations stop
        setActiveBlockId(null);
        setActiveEdgeId(null);
        setConsoleOutput(outputs.join('\n'));
        setCharacterPosition(context.characterPos);
        setCharacterMessage(context.characterMsg);
        return; // Stop further traversal.
      case 'setVariable': {
        const { varName, varValue, valueType } = block.data;
        if (varName) {
          try {
            let value;
            if (valueType === 'string') {
              value = varValue;
            } else {
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
              context.variables[varName] = varValue;
            } else {
              const value = evaluate(varValue, context.variables);
              context.variables[varName] += value;
            }
            outputs.push(`Changed variable ${varName} to ${JSON.stringify(context.variables[varName])}`);
            console.log(`Changed variable ${varName} to ${JSON.stringify(context.variables[varName])}`);
          } catch (error) {
            console.error(`Error changing variable in block ${block.id}:`, error);
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
        // Save the condition result on the block for use later.
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
            (e) => e.source === block.id && e.sourceHandle === `body-${block.id}`
          );
          if (loopBodyEdge) {
            console.log(`Condition met. Traversing to loop body: ${loopBodyEdge.target}`);
            setActiveEdgeId(loopBodyEdge.id);
            await delay(BASE_EDGE_DELAY);
            setActiveEdgeId(null);
            await traverse(loopBodyEdge.target, new Set(), true);
          } else {
            outputs.push(`No loop body connected to block ${block.id}.`);
            console.error(`No loop body connected to block ${block.id}.`);
            setConsoleOutput(outputs.join('\n'));
            return;
          }
        } else {
          const exitEdge = edges.find(
            (e) => e.source === block.id && e.sourceHandle === `exit-${block.id}`
          );
          if (exitEdge) {
            console.log(`Condition not met. Exiting loop to block: ${exitEdge.target}`);
            setActiveEdgeId(exitEdge.id);
            await delay(BASE_EDGE_DELAY);
            setActiveEdgeId(null);
            await traverse(exitEdge.target, new Set(), inLoop);
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
          await delay(BASE_BLOCK_DELAY);
          await traverse(whileStartNodeId, new Set(), true);
        } else {
          const loopBackEdge = edges.find(
            (e) => e.source === block.id && e.sourceHandle === `loopBack-${block.id}`
          );
          if (loopBackEdge) {
            console.log(`Traversing back via loopBack edge to block: ${loopBackEdge.target}`);
            await delay(BASE_BLOCK_DELAY);
            await traverse(loopBackEdge.target, new Set(), true);
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
        let evaluatedMessage = message.replace(/{(\w+)}/g, (match, varName) =>
          context.variables.hasOwnProperty(varName)
            ? context.variables[varName]
            : match
        );
        if (evaluatedMessage === message && context.variables.hasOwnProperty(message)) {
          evaluatedMessage = context.variables[message].toString();
        }
        outputs.push(`Print: ${evaluatedMessage}`);
        console.log(`Print: ${evaluatedMessage}`);
        setCharacterMessage(evaluatedMessage);
        await delay(PRINT_DELAY);
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
      default:
        outputs.push(`Warning: Unknown block type "${block.data.blockType}" in block "${block.id}".`);
        console.error(`Unknown block type: ${block.data.blockType}`);
        break;
    }

    // Traverse outgoing edges.
    const connectedEdges = currentEdges.filter((e) => e.source === block.id);
    for (const edge of connectedEdges) {
      if (block.data.blockType === 'if') {
        const sourceHandleType = edge.sourceHandle ? edge.sourceHandle.split('-')[0] : '';
        if (
          (sourceHandleType === 'yes' && block.conditionMet) ||
          (sourceHandleType === 'no' && !block.conditionMet)
        ) {
          setActiveEdgeId(edge.id);
          await delay(BASE_EDGE_DELAY);
          setActiveEdgeId(null);
          await traverse(edge.target, visited, inLoop);
        } else {
          console.log(`Skipping branch on edge ${edge.id} as its condition does not match.`);
        }
      } else {
        setActiveEdgeId(edge.id);
        await delay(BASE_EDGE_DELAY);
        setActiveEdgeId(null);
        await traverse(edge.target, visited, inLoop);
      }
    }

    console.log(`--- Finished Node: ${block.id} ---\n`);
  }

  async function executeNextNode(currentNodeId, visited, inLoop = false) {
    const outgoingEdge = currentEdges.find((e) => e.source === currentNodeId);
    if (outgoingEdge) {
      setActiveEdgeId(outgoingEdge.id);
      await delay(BASE_EDGE_DELAY);
      setActiveEdgeId(null);
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
      (block) => block.type === 'custom' && block.data.blockType === 'start'
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
    // Reset speed to default (sped-up version: multiplier = 2)
    speedRef.current = 2;
    setPaused(false);
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
    setSpeedMultiplier,
    togglePause,
    paused,
  };
}