// src/hooks/useFlowchartExecutor.js

import { evaluate } from 'mathjs';
import { useRef, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * Validates the flowchart structure and the integrity of block data.
 * Returns an array of error messages. If the array is empty, the flowchart is valid.
 *
 * @param {Array} blocks - The nodes of the flowchart.
 * @param {Array} edges - The edges of the flowchart.
 * @returns {Array} errors - An array of error messages.
 */
function validateFlowchart(blocks, edges) {
  const errors = [];
  const nodeIds = blocks.map((b) => b.id);

  // Check for existence of a Start block (blockType "start", custom node)
  const startBlock = blocks.find(
    (b) =>
      (b.data.blockType || "").toLowerCase() === "start" &&
      b.type === "custom"
  );
  if (!startBlock) {
    errors.push("Error: No Start block found.");
  }

  // Check for existence of an End block
  const endBlock = blocks.find(
    (b) => (b.data.blockType || "").toLowerCase() === "end"
  );
  if (!endBlock) {
    errors.push("Error: No End block found.");
  }

  // Check that all edges point to existing blocks
  edges.forEach((edge) => {
    if (!nodeIds.includes(edge.source)) {
      errors.push(
        `Error: Edge ${edge.id} refers to a non-existent source node (${edge.source}).`
      );
    }
    if (!nodeIds.includes(edge.target)) {
      errors.push(
        `Error: Edge ${edge.id} refers to a non-existent target node (${edge.target}).`
      );
    }
  });

  // Check for connectivity from Start to End
  if (startBlock && endBlock) {
    const visited = new Set();
    function dfs(nodeId) {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      edges.forEach((edge) => {
        if (edge.source === nodeId) {
          dfs(edge.target);
        }
      });
    }
    dfs(startBlock.id);
    if (!visited.has(endBlock.id)) {
      errors.push("Error: The End block is not reachable from the Start block.");
    }
  }

  // Validate each block's internal data
  blocks.forEach((block) => {
    const type = block.data.blockType;
    const displayName = block.data.label || block.id;

    // For setVariable, ensure variable name is provided and the value is non-empty.
    if (type === "setVariable") {
      if (!block.data.varName || block.data.varName.trim() === "") {
        errors.push(
          `Error: Set Variable block "${displayName}" must have a valid variable name.`
        );
      }
      if (
        block.data.varValue === null ||
        block.data.varValue === undefined ||
        block.data.varValue === ""
      ) {
        errors.push(
          `Error: Set Variable block "${displayName}" must have a non-empty value.`
        );
      }
    }
  });

  return errors;
}

export function useFlowchartExecutor(
  blocks,
  edges,
  setConsoleOutput,
  setCharacterPosition,
  setCharacterMessage, 
  setCharacterRotation,
  setActiveBlockId,
  setActiveEdgeId,
  setErrorBlockId,
  setPaused,
  setSnackbar
) {
  const MAX_VISITS_PER_NODE = 50;
  const BASE_BLOCK_DELAY = 800;
  const BASE_EDGE_DELAY = 800;
  const PRINT_DELAY = 3000;

  const speedRef = useRef(2);
  const [paused, setLocalPaused] = useState(false);

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
    setLocalPaused((prev) => {
      const newVal = !prev;
      console.log(`Paused: ${newVal}`);
      setPaused(newVal); // also update parent state if needed
      return newVal;
    });
  }, [setPaused]);

  // Context to hold execution variables and character state
  const context = {
    variables: {},
    characterPos: { x: 0, y: 0 },
    characterMsg: '',
    characterRotation: 0,
  };

  const outputs = [];
  const currentNodes = blocks;
  const currentEdges = edges;

  // Helper to auto-quote operands if needed.
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

  async function traverse(blockId, visitCounts = new Map()) {
    try {
    const count = visitCounts.get(blockId) || 0;
    if (count >= MAX_VISITS_PER_NODE) {
      const errMsg = `Error: Block ${blockId} visited too many times. Possible infinite loop.`;
      outputs.push(errMsg);
      console.warn(errMsg);
      toast.error(errMsg);
      if (setSnackbar) setSnackbar(errMsg);
      if (setErrorBlockId) {
        setErrorBlockId(blockId);
        setTimeout(() => setErrorBlockId(null), 5000);
      }
      setConsoleOutput(outputs.join('\n'));
      return;
    }
    visitCounts.set(blockId, count + 1);

    const block = currentNodes.find((n) => n.id === blockId);
    if (!block) {
      const errMsg = `Error: Node with ID ${blockId} not found.`;
      outputs.push(errMsg);
      console.error(errMsg);
      toast.error(errMsg);
      if (setSnackbar) setSnackbar(errMsg);
      setConsoleOutput(outputs.join('\n'));
      return;
    }

    const blockDisplayName = block?.data?.label || blockId;

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
        setCharacterRotation(context.characterRotation);
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
            const msg = `Set variable ${block.data.varName} = ${JSON.stringify(value)}`;
            outputs.push(msg);
            console.log(msg);
          } catch (error) {
            const errMsg = `Error evaluating value in block ${blockDisplayName}: ${error.message}`;
            console.error(errMsg);
            outputs.push(errMsg);
            toast.error(errMsg);
            if (setSnackbar) setSnackbar(errMsg);
            if (setErrorBlockId) {
              setErrorBlockId(block.id);
              setTimeout(() => setErrorBlockId(null), 5000);
            }
            setConsoleOutput(outputs.join('\n'));
            return;
          }
        } else {
          const errMsg = `Error: Set Variable block "${blockDisplayName}" must have a valid variable name.`;
          outputs.push(errMsg);
          console.error(errMsg);
          toast.error(errMsg);
          if (setSnackbar) setSnackbar(errMsg);
          if (setErrorBlockId) {
            setErrorBlockId(block.id);
            setTimeout(() => setErrorBlockId(null), 5000);
          }
          setConsoleOutput(outputs.join("\n"));
          return;
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
            const msg = `Changed variable ${block.data.varName} to ${JSON.stringify(context.variables[block.data.varName])}`;
            outputs.push(msg);
            console.log(msg);
          } catch (error) {
            const errMsg = `Error changing variable in block ${blockDisplayName}: ${error.message}`;
            console.error(errMsg);
            outputs.push(errMsg);
            toast.error(errMsg);
            if (setSnackbar) setSnackbar(errMsg);
            if (setErrorBlockId) {
              setErrorBlockId(block.id);
              setTimeout(() => setErrorBlockId(null), 5000);
            }
            setConsoleOutput(outputs.join('\n'));
            return;
          }
        } else {
          const errMsg = `Error: Variable "${block.data.varName}" not found in block ${blockDisplayName}.`;
          outputs.push(errMsg);
          console.error(errMsg);
          toast.error(errMsg);
          if (setSnackbar) setSnackbar(errMsg);
          if (setErrorBlockId) {
            setErrorBlockId(block.id);
            setTimeout(() => setErrorBlockId(null), 5000);
          }
          setConsoleOutput(outputs.join("\n"));
          return;
        }
        break;

      case 'if': {
        const { leftOperand, operator, rightOperand } = block.data;
        let conditionMet = false;
        if (leftOperand && rightOperand) {
          const op = operator || '==';
          if ((op === '==' || op === '!=') && typeof context.variables[leftOperand] === 'string') {
            const rightValue = rightOperand.trim().replace(/^['"]|['"]$/g, '');
            conditionMet = op === '==' ? context.variables[leftOperand] === rightValue : context.variables[leftOperand] !== rightValue;
            outputs.push(`Condition ${leftOperand} ${op} ${rightValue} evaluated to ${conditionMet}`);
          } else {
            const condition = `${leftOperand} ${op} ${autoQuote(rightOperand)}`;
            outputs.push(`Evaluating condition: ${condition}`);
            conditionMet = evaluate(condition, context.variables);
          }
        } else {
          const errMsg = `Error: Incomplete condition in block ${blockDisplayName}.`;
          outputs.push(errMsg);
          console.error(errMsg);
          toast.error(errMsg);
          if (setSnackbar) setSnackbar(errMsg);
          if (setErrorBlockId) {
            setErrorBlockId(block.id);
            setTimeout(() => setErrorBlockId(null), 5000);
          }
          setConsoleOutput(outputs.join('\n'));
          return;
        }
        block.conditionMet = conditionMet;

        //check that the corresponding branch edge exists.
        const branchEdges = currentEdges.filter((e) => e.source === block.id);
        if (conditionMet) {
          const trueEdge = branchEdges.find((e) => e.sourceHandle && e.sourceHandle.startsWith('yes'));
          if (!trueEdge) {
            const errMsg = `Error: Missing edge for true branch in "${blockDisplayName}".`;
            toast.error(errMsg);
            if (setSnackbar) setSnackbar(errMsg);
            outputs.push(errMsg);
            if (setErrorBlockId) {
              setErrorBlockId(block.id);
              setTimeout(() => setErrorBlockId(null), 5000);
            }
            setConsoleOutput(outputs.join('\n'));
            return;
          }
        } else {
          const falseEdge = branchEdges.find((e) => e.sourceHandle && e.sourceHandle.startsWith('no'));
          if (!falseEdge) {
            const errMsg = `Error: Missing edge for false branch in "${blockDisplayName}".`;
            toast.error(errMsg);
            if (setSnackbar) setSnackbar(errMsg);
            outputs.push(errMsg);
            if (setErrorBlockId) {
              setErrorBlockId(block.id);
              setTimeout(() => setErrorBlockId(null), 5000);
            }
            setConsoleOutput(outputs.join('\n'));
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
          if ((operator === '==' || operator === '!=') && typeof context.variables[leftOperand] === 'string') {
            const rightValue = rightOperand.trim().replace(/^['"]|['"]$/g, '');
            conditionMet = operator === '==' ? context.variables[leftOperand] === rightValue : context.variables[leftOperand] !== rightValue;
            outputs.push(`While condition ${leftOperand} ${operator} ${rightValue} evaluated to ${conditionMet}`);
          } else {
            const condition = `${leftOperand} ${operator} ${autoQuote(rightOperand)}`;
            outputs.push(`Evaluating while condition: ${condition}`);
            conditionMet = evaluate(condition, context.variables);
          }
        } else {
          const errMsg = `Error: Incomplete while condition in block ${blockDisplayName}.`;
          outputs.push(errMsg);
          console.error(errMsg);
          toast.error(errMsg);
          if (setSnackbar) setSnackbar(errMsg);
          if (setErrorBlockId) {
            setErrorBlockId(block.id);
            setTimeout(() => setErrorBlockId(null), 5000);
          }
          setConsoleOutput(outputs.join('\n'));
          return;
        }

        if (conditionMet) {
          const loopBodyEdge = currentEdges.find((e) => e.source === block.id && e.sourceHandle === `body-${block.id}`);
          if (loopBodyEdge) {
            console.log(`Condition met. Traversing to loop body: ${loopBodyEdge.target}`);
            setActiveEdgeId(loopBodyEdge.id);
            await delay(BASE_EDGE_DELAY);
            setActiveEdgeId(null);
            await traverse(loopBodyEdge.target, new Map(visitCounts));
          } else {
            const errMsg = `Error: No loop body connected to block ${blockDisplayName}.`;
            outputs.push(errMsg);
            console.error(errMsg);
            toast.error(errMsg);
            if (setSnackbar) setSnackbar(errMsg);
            if (setErrorBlockId) {
              setErrorBlockId(block.id);
              setTimeout(() => setErrorBlockId(null), 5000);
            }
            setConsoleOutput(outputs.join('\n'));
            return;
          }
        } else {
          const exitEdge = currentEdges.find((e) => e.source === block.id && e.sourceHandle === `exit-${block.id}`);
          if (exitEdge) {
            console.log(`Condition not met. Exiting loop to block: ${exitEdge.target}`);
            setActiveEdgeId(exitEdge.id);
            await delay(BASE_EDGE_DELAY);
            setActiveEdgeId(null);
            await traverse(exitEdge.target, new Map(visitCounts));
          } else {
            const errMsg = `Error: No exit path connected to block "${blockDisplayName}".`;
            outputs.push(errMsg);
            console.error(errMsg);
            toast.error(errMsg);
            if (setSnackbar) setSnackbar(errMsg);
            if (setErrorBlockId) {
              setErrorBlockId(block.id);
              setTimeout(() => setErrorBlockId(null), 5000);
            }
            setConsoleOutput(outputs.join('\n'));
            return;
          }
        }
        return;
      }
      case 'print': {
        let message = block.data.message || '';
        if (!message) {
          const errMsg = `Error: No message set in Print block "${blockDisplayName}".`;
          outputs.push(errMsg);
          console.error(errMsg);
          toast.error(errMsg);
          if (setSnackbar) setSnackbar(errMsg);
          if (setErrorBlockId) {
            setErrorBlockId(block.id);
            setTimeout(() => setErrorBlockId(null), 5000);
          }
          setConsoleOutput(outputs.join('\n'));
          return;
        }
        let evaluatedMessage = message.replace(/{(\w+)}/g, (match, varName) =>
          context.variables.hasOwnProperty(varName) ? context.variables[varName] : match
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
              const errMsg = `Error: Unknown direction "${direction}" in Move block "${blockDisplayName}".`;
              outputs.push(errMsg);
              console.error(errMsg);
              toast.error(errMsg);
              if (setSnackbar) setSnackbar(errMsg);
              if (setErrorBlockId) {
                setErrorBlockId(block.id);
                setTimeout(() => setErrorBlockId(null), 5000);
              }
              setConsoleOutput(outputs.join('\n'));
              return;
          }
          context.characterPos = { x: newX, y: newY };
          const msg = `Moved ${direction} by ${distance} units to (${newX}, ${newY})`;
          outputs.push(msg);
          console.log(msg);
          setCharacterPosition({ x: newX, y: newY });
        } else {
          const errMsg = `Error: Incomplete move data in block "${blockDisplayName}".`;
          outputs.push(errMsg);
          console.error(errMsg);
          toast.error(errMsg);
          if (setSnackbar) setSnackbar(errMsg);
          if (setErrorBlockId) {
            setErrorBlockId(block.id);
            setTimeout(() => setErrorBlockId(null), 5000);
          }
        }
        break;
      }
      case 'rotate': {
        const { degrees, rotateDirection } = block.data;
        if (degrees && rotateDirection) {
          let newRotation = context.characterRotation || 0;
          switch (rotateDirection) {
            case 'left':
              newRotation -= degrees;
              break;
            case 'right':
              newRotation += degrees;
              break;
            default:
              const errMsg = `Error: Unknown rotation direction "${rotateDirection}" in Rotate block "${blockDisplayName}".`;
              outputs.push(errMsg);
              console.error(errMsg);
              toast.error(errMsg);
              if (setSnackbar) setSnackbar(errMsg);
              if (setErrorBlockId) {
                setErrorBlockId(block.id);
                setTimeout(() => setErrorBlockId(null), 5000);
              }
              setConsoleOutput(outputs.join('\n'));
              return;
          }
          context.characterRotation = newRotation;
          const msg = `Rotated ${rotateDirection} by ${degrees} degrees to (${newRotation}°)`;
          outputs.push(msg);
          console.log(msg);
          setCharacterRotation(newRotation);
        } else {
          const errMsg = `Error: Incomplete rotate data in block "${blockDisplayName}".`;
          outputs.push(errMsg);
          console.error(errMsg);
          toast.error(errMsg);
          if (setSnackbar) setSnackbar(errMsg);
          if (setErrorBlockId) {
            setErrorBlockId(block.id);
            setTimeout(() => setErrorBlockId(null), 5000);
          }
        }
        break;
      }
      default:
        const errMsg = `Error: Unknown block type "${block.data.blockType}" in block "${blockDisplayName}".`;
        outputs.push(errMsg);
        console.error(errMsg);
        toast.error(errMsg);
        if (setSnackbar) setSnackbar(errMsg);
        if (setErrorBlockId) {
          setErrorBlockId(block.id);
          setTimeout(() => setErrorBlockId(null), 5000);
        }
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
        const errMsg = `Error processing edge ${edge.id}: ${edgeError.message}`;
        console.error(errMsg, edgeError);
        outputs.push(errMsg);
        toast.error(errMsg);
        if (setSnackbar) setSnackbar(errMsg);
        setConsoleOutput(outputs.join('\n'));
        return;
      }
    }
    if (connectedEdges.length === 0 && block.data.blockType !== 'end') {
      const warnMsg = `Warning: Block "${blockDisplayName}" has no outgoing connections; execution ended abruptly.`;
      outputs.push(warnMsg);
      console.warn(warnMsg);
      toast.error(warnMsg);
      if (setSnackbar) setSnackbar(warnMsg);
      setConsoleOutput(outputs.join('\n'));
    }

    console.log(`--- Finished Node: ${block.id} ---\n`);
  } catch (traverseError) {
    const block = currentNodes.find((n) => n.id === blockId);
    const blockDisplayName = (block && block.data && block.data.label) || blockId;

    let customMessage = traverseError.message;
    const match = customMessage.match(/Undefined symbol (\w+)/);
    if (match) {
      const missingVar = match[1];
      customMessage = `Variable "${missingVar}" is not defined. Please initialise it before using this condition.`;
    }
    const errMsg = `Error in block "${blockDisplayName}": ${customMessage}`;
    toast.error(errMsg);
    if (setSnackbar) setSnackbar(errMsg);
    console.error(`Unexpected error in block "${blockDisplayName}":`, traverseError);
    outputs.push(errMsg);

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
      setConsoleOutput(outputs.join("\n"));
      setCharacterPosition(context.characterPos);
      setCharacterMessage(context.characterMsg);
    }
  }

  async function runFlowchart() {
    const endBlockExists = blocks.some(
      (block) => (block.data.blockType || "").toLowerCase() === "end"
    );
    if (!endBlockExists) {
      const errMsg = "Error: No End block connected.";
      outputs.push(errMsg);
      setConsoleOutput(outputs.join("\n"));
      toast.error(errMsg);
      if (setSnackbar) setSnackbar(errMsg);
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
      const errMsg = "Error: No start block found.";
      outputs.push(errMsg);
      setConsoleOutput(outputs.join("\n"));
      toast.error(errMsg);
      if (setSnackbar) setSnackbar(errMsg);
    }
  }

  const executeFlowchart = useCallback(() => {
    outputs.length = 0;
    context.variables = {};
    setConsoleOutput('');
    setCharacterMessage('');
    setCharacterPosition({ x: 0, y: 0 });
    speedRef.current = 2;
    setLocalPaused(false);
    setPaused(false);

    // Run validation before executing.
    const validationErrors = validateFlowchart(blocks, edges);
    if (validationErrors.length > 0) {
      validationErrors.forEach((err) => {
        toast.error(err);
        if (setSnackbar) setSnackbar(err);
        outputs.push(err);
      });
      setConsoleOutput(outputs.join("\n"));
      return; 
    }

    runFlowchart();
  }, [
    blocks,
    edges,
    setConsoleOutput,
    setCharacterPosition,
    setCharacterMessage,
    setCharacterRotation,
    setActiveBlockId,
    setActiveEdgeId,
    setErrorBlockId,
    setPaused,
    setSnackbar,
  ]);

  return {
    executeFlowchart,
    setSpeedMultiplier,
    togglePause,
    paused,
  };
}