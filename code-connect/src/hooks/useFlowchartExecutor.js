// src/hooks/useFlowchartExecutor.js

import { evaluate } from 'mathjs';
import { useRef, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

export function useFlowchartExecutor(
  blocks,
  edges,
  setConsoleOutput,
  setCharacterPosition,
  setCharacterMessage,
  setActiveBlockId,
  setActiveEdgeId,
  setErrorBlockId
) {
  const MAX_VISITS_PER_NODE = 50;
  const BASE_BLOCK_DELAY = 800;
  const BASE_EDGE_DELAY = 800;
  const PRINT_DELAY = 3000;

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

  const togglePause = useCallback(() => {
    setPaused((prev) => {
      const newVal = !prev;
      console.log(`Paused: ${newVal}`);
      return newVal;
    });
  }, []);

  const resetExecution = useCallback(() => {
    setConsoleOutput('');
    setCharacterPosition({ x: 0, y: 0 });
    setCharacterMessage('');
    setActiveBlockId(null);
    setActiveEdgeId(null);
    setPaused(false);
    console.log('Execution has been reset.');
  }, [setConsoleOutput, setCharacterPosition, setCharacterMessage, setActiveBlockId, setActiveEdgeId]);

  // Context to hold variables and character state during execution
  const context = {
    variables: {},
    characterPos: { x: 0, y: 0 },
    characterMsg: '',
  };

  const outputs = [];
  const currentNodes = blocks;
  const currentEdges = edges;

  // autoQuote helper: returns the operand unquoted if it exists in context, otherwise wraps it in quotes
  function autoQuote(operand) {
    if (typeof operand !== 'string' || operand.trim() === '') return operand;
    if (context.variables.hasOwnProperty(operand)) return operand;
    if (!isNaN(parseFloat(operand))) return operand;
    const trimmed = operand.trim();
    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
      return trimmed;
    }
    return `"${trimmed}"`;
  }

  // Recursive function to traverse nodes with enhanced error handling and logging
  async function traverse(blockId, visitCounts = new Map()) {
    try {
    const count = visitCounts.get(blockId) || 0;
    if (count >= MAX_VISITS_PER_NODE) {
      outputs.push(`Error: Block ${blockId} visited too many times. Possible infinite loop.`);
      console.warn(`Block ${blockId} visited ${count} times. Stopping traversal.`);
      setConsoleOutput(outputs.join('\n'));
      return;
    }
    visitCounts.set(blockId, count + 1);

    const block = currentNodes.find((n) => n.id === blockId);
    if (!block) {
      outputs.push(`Error: Node with ID ${blockId} not found.`);
      console.error(`Node with ID ${blockId} not found.`);
      setConsoleOutput(outputs.join('\n'));
      return;
    }

    const blockDisplayName =
      block && block.data && block.data.label ? block.data.label : blockId;

    setActiveBlockId(block.id);
    await delay(BASE_BLOCK_DELAY);

    console.log(`\n--- Executing Node: ${block.id} (${blockDisplayName}) ---`);
    outputs.push(`Executing block "${blockDisplayName}"`);

    switch (block.data.blockType) {
      case 'start':
        await executeNextNode(block.id, visitCounts);
        return; //Return immediately to avoid processing outgoing edges twice.

      case 'end':
        outputs.push('Execution ended.');
        console.log('Execution ended.');
        setActiveBlockId(null);
        setActiveEdgeId(null);
        setConsoleOutput(outputs.join('\n'));
        setCharacterPosition(context.characterPos);
        setCharacterMessage(context.characterMsg);
        return;

      case 'setVariable':
        if (block.data.varName) {
          try {
            let value;
            if (block.data.valueType === 'string') {
              value = block.data.varValue;
            } else {
              value = evaluate(block.data.varValue, context.variables);
            }
            context.variables[block.data.varName] = value;
            outputs.push(`Set variable ${block.data.varName} = ${JSON.stringify(value)}`);
            console.log(`Set variable ${block.data.varName} = ${JSON.stringify(value)}`);
          } catch (error) {
            console.error(`Error evaluating value in block ${blockDisplayName}:`, error);
            outputs.push(`Error evaluating value in block ${blockDisplayName}: ${error.message}`);
            setConsoleOutput(outputs.join('\n'));
            return;
          }
        }
        break;

      case 'changeVariable':
        if (block.data.varName && context.variables.hasOwnProperty(block.data.varName)) {
          try {
            if (block.data.valueType === 'string') {
              context.variables[block.data.varName] = block.data.varValue;
            } else {
              const value = evaluate(block.data.varValue, context.variables);
              const operator = block.data.operator || '+';
              switch (operator) {
                case '-':
                  context.variables[block.data.varName] -= value;
                  break;
                case '*':
                  context.variables[block.data.varName] *= value;
                  break;
                case '/':
                  context.variables[block.data.varName] /= value;
                  break;
                default:
                  context.variables[block.data.varName] += value;
              }
            }
            outputs.push(
              `Changed variable ${block.data.varName} to ${JSON.stringify(
                context.variables[block.data.varName]
              )}`
            );
            console.log(
              `Changed variable ${block.data.varName} to ${JSON.stringify(
                context.variables[block.data.varName]
              )}`
            );
          } catch (error) {
            console.error(`Error changing variable in block ${blockDisplayName}:`, error);
            outputs.push(
              `Error changing variable in block ${blockDisplayName}: ${error.message}`
            );
            setConsoleOutput(outputs.join('\n'));
            return;
          }
        } else {
          outputs.push(`Variable "${block.data.varName}" not found in block ${blockDisplayName}.`);
          console.error(`Variable "${block.data.varName}" not found in block ${blockDisplayName}.`);
          setConsoleOutput(outputs.join('\n'));
          return;
        }
        break;

      case 'if': {
        const { leftOperand, operator, rightOperand } = block.data;
        let conditionMet = false;
        if (leftOperand && rightOperand) {
          const op = operator || '=='; // Default to "=="
          if (
            (op === '==' || op === '!=') &&
            typeof context.variables[leftOperand] === 'string'
          ) {
            const rightValue = rightOperand.trim().replace(/^['"]|['"]$/g, '');
            conditionMet =
              op === '=='
                ? context.variables[leftOperand] === rightValue
                : context.variables[leftOperand] !== rightValue;
            outputs.push(`Condition ${leftOperand} ${op} ${rightValue} evaluated to ${conditionMet}`);
          } else {
            const condition = `${leftOperand} ${op} ${autoQuote(rightOperand)}`;
            outputs.push(`Evaluating condition: ${condition}`);
            conditionMet = evaluate(condition, context.variables);
          }
        } else {
          outputs.push(`Incomplete condition in block ${blockDisplayName}.`);
          console.error(`Incomplete condition in block ${blockDisplayName}.`);
          setConsoleOutput(outputs.join('\n'));
          return;
        }
        block.conditionMet = conditionMet;

        //check that the corresponding branch edge exists.
        const branchEdges = currentEdges.filter((e) => e.source === block.id);
        if (conditionMet) {
          const trueEdge = branchEdges.find(
            (e) => e.sourceHandle && e.sourceHandle.startsWith('yes')
          );
          if (!trueEdge) {
            const errorMsg = `Missing edge for true branch in "${blockDisplayName}".`;
            toast.error(errorMsg);
            outputs.push(errorMsg);
            setConsoleOutput(outputs.join('\n'));
            if (setErrorBlockId) {
              setErrorBlockId(block.id);
              setTimeout(() => setErrorBlockId(null), 5000);
            }
            return;
          }
        } else {
          const falseEdge = branchEdges.find(
            (e) => e.sourceHandle && e.sourceHandle.startsWith('no')
          );
          if (!falseEdge) {
            const errorMsg = `Missing edge for false branch in "${blockDisplayName}".`;
            toast.error(errorMsg);
            outputs.push(errorMsg);
            setConsoleOutput(outputs.join('\n'));
            if (setErrorBlockId) {
              setErrorBlockId(block.id);
              setTimeout(() => setErrorBlockId(null), 5000);
            }
            return;
          }
        }
        break;
      }

      case 'join':
        await executeNextNode(block.id, visitCounts);
        return;

      case 'whileStart': {
        const { leftOperand, operator, rightOperand } = block.data;
        let conditionMet = false;
        if (leftOperand && operator && rightOperand) {
          if (
            (operator === '==' || operator === '!=') &&
            typeof context.variables[leftOperand] === 'string'
          ) {
            const rightValue = rightOperand.trim().replace(/^['"]|['"]$/g, '');
            conditionMet =
              operator === '=='
                ? context.variables[leftOperand] === rightValue
                : context.variables[leftOperand] !== rightValue;
            outputs.push(`While condition ${leftOperand} ${operator} ${rightValue} evaluated to ${conditionMet}`);
          } else {
            const condition = `${leftOperand} ${operator} ${autoQuote(rightOperand)}`;
            outputs.push(`Evaluating while condition: ${condition}`);
            conditionMet = evaluate(condition, context.variables);
          }
        } else {
          outputs.push(`Incomplete while condition in block ${blockDisplayName}.`);
          console.error(`Incomplete while condition in block ${blockDisplayName}.`);
          setConsoleOutput(outputs.join('\n'));
          return;
        }

        if (conditionMet) {
          const loopBodyEdge = currentEdges.find(
            (e) => e.source === block.id && e.sourceHandle === `body-${block.id}`
          );
          if (loopBodyEdge) {
            console.log(`Condition met. Traversing to loop body: ${loopBodyEdge.target}`);
            setActiveEdgeId(loopBodyEdge.id);
            await delay(BASE_EDGE_DELAY);
            setActiveEdgeId(null);
            await traverse(loopBodyEdge.target, new Map(visitCounts));
          } else {
            outputs.push(`No loop body connected to block ${blockDisplayName}.`);
            console.error(`No loop body connected to block ${blockDisplayName}.`);
            setConsoleOutput(outputs.join('\n'));
            return;
          }
        } else {
          const exitEdge = currentEdges.find(
            (e) => e.source === block.id && e.sourceHandle === `exit-${block.id}`
          );
          if (exitEdge) {
            console.log(`Condition not met. Exiting loop to block: ${exitEdge.target}`);
            setActiveEdgeId(exitEdge.id);
            await delay(BASE_EDGE_DELAY);
            setActiveEdgeId(null);
            await traverse(exitEdge.target, new Map(visitCounts));
          } else {
            outputs.push(`No exit path connected to block "${blockDisplayName}".`);
            console.error(`No exit path connected to block "${blockDisplayName}".`);
            setConsoleOutput(outputs.join('\n'));
            return;
          }
        }
        return;
      }
      case 'print': {
        let message = block.data.message || '';
        if (!message) {
          outputs.push(`Error: No message set in Print block "${blockDisplayName}".`);
          console.error(`No message set in Print block "${blockDisplayName}".`);
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
        outputs.push(`Print Block: ${evaluatedMessage}`);
        console.log(`Print Block: ${evaluatedMessage}`);
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
              outputs.push(`Unknown direction "${direction}" in Move block "${blockDisplayName}".`);
              console.error(`Unknown direction "${direction}" in Move block "${blockDisplayName}".`);
              setConsoleOutput(outputs.join('\n'));
              return;
          }
          context.characterPos = { x: newX, y: newY };
          outputs.push(`Moved ${direction} by ${distance} units to (${newX}, ${newY})`);
          console.log(`Moved ${direction} by ${distance} units to (${newX}, ${newY})`);
          setCharacterPosition({ x: newX, y: newY });
        } else {
          outputs.push(`Incomplete move data in block "${blockDisplayName}".`);
          console.error(`Incomplete move data in block "${blockDisplayName}".`);
        }
        break;
      }
      default:
        outputs.push(
          `Unknown block type "${block.data.blockType}" in block "${blockDisplayName}".`
        );
        console.error(
          `Unknown block type: ${block.data.blockType} in block ${blockDisplayName}`
        );
        break;
    }

    // Process all connected edges with individual error handling
    const connectedEdges = currentEdges.filter((e) => e.source === block.id);
    for (const edge of connectedEdges) {
      try {
        if (block.data.blockType === 'if') {
          const sourceHandleType = edge.sourceHandle ? edge.sourceHandle.split('-')[0] : '';
          if (
            (sourceHandleType === 'yes' && block.conditionMet) ||
            (sourceHandleType === 'no' && !block.conditionMet)
          ) {
            setActiveEdgeId(edge.id);
            await delay(BASE_EDGE_DELAY);
            setActiveEdgeId(null);
            await traverse(edge.target, new Map(visitCounts));
          } else {
            console.log(`Skipping branch on edge ${edge.id} as its condition does not match.`);
          }
        } else {
          setActiveEdgeId(edge.id);
          await delay(BASE_EDGE_DELAY);
          setActiveEdgeId(null);
          await traverse(edge.target, new Map(visitCounts));
        }
      } catch (edgeError) {
        console.error(`Error processing edge ${edge.id}:`, edgeError);
        outputs.push(`Error processing edge ${edge.id}: ${edgeError.message}`);
        setConsoleOutput(outputs.join('\n'));
        return;
      }
    }

    console.log(`--- Finished Node: ${block.id} ---\n`);
  } catch (traverseError) {
    // We only know the blockDisplayName if we've found the block.
    const block = currentNodes.find((n) => n.id === blockId);
    const blockDisplayName =
      block && block.data && block.data.label ? block.data.label : blockId;

    let customMessage = traverseError.message;
    const match = customMessage.match(/Undefined symbol (\w+)/);
    if (match) {
      const missingVar = match[1];
      customMessage = `Variable "${missingVar}" is not defined. Please initialise it before using this condition.`;
    }
    toast.error(`Error in block "${blockDisplayName}": ${customMessage}`);
    console.error(`Unexpected error in block "${blockDisplayName}":`, traverseError);
    outputs.push(`Unexpected error in block "${blockDisplayName}": ${customMessage}`);

    if (setErrorBlockId && block) {
      setErrorBlockId(block.id);
      setTimeout(() => setErrorBlockId(null), 5000);
    }

    setConsoleOutput(outputs.join('\n'));
  }
  }

  async function executeNextNode(currentNodeId, visitCounts) {
    const outgoingEdge = currentEdges.find((e) => e.source === currentNodeId);
    if (outgoingEdge) {
      setActiveEdgeId(outgoingEdge.id);
      await delay(BASE_EDGE_DELAY);
      setActiveEdgeId(null);
      console.log(`Executing next block via edge ${outgoingEdge.id} to block ${outgoingEdge.target}`);
      await traverse(outgoingEdge.target, new Map(visitCounts));
    } else {
      outputs.push('Execution ended.');
      console.log('No outgoing edges. Execution ended.');
      setConsoleOutput(outputs.join('\n'));
      setCharacterPosition(context.characterPos);
      setCharacterMessage(context.characterMsg);
    }
  }

  async function runFlowchart() {
    const endBlockExists = blocks.some(
      (block) => (block.data.blockType || "").toLowerCase() === "end"
    );
    if (!endBlockExists) {
      const msg = "Error: No End block connected.";
      outputs.push(msg);
      setConsoleOutput(outputs.join("\n"));
      toast.error(msg);
      return;
    }
  
    const startBlock = currentNodes.find(
      (block) =>
        block.type === "custom" &&
        (block.data.blockType || "").toLowerCase() === "start"
    );
    if (startBlock) {
      await traverse(startBlock.id, new Map());
      setConsoleOutput(outputs.join("\n"));
    } else {
      const msg = "Error: No start block found.";
      outputs.push(msg);
      setConsoleOutput(outputs.join("\n"));
      toast.error(msg);
    }
  }

  const executeFlowchart = useCallback(() => {
    // iterationCount = 0;
    outputs.length = 0;
    context.variables = {};
    setConsoleOutput('');
    setCharacterMessage('');
    setCharacterPosition({ x: 0, y: 0 });
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