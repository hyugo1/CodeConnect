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
      if (!node) return;

      switch (node.data.nodeType) {
        case 'setVariable': {
          const { varName, varValue } = node.data;
          if (varName) {
            try {
              // Use math.js to safely evaluate the expression
              const value = evaluate(varValue, context.variables);
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

        case 'if': {
          const { leftOperand, operator, rightOperand } = node.data;
          let conditionMet = false;
          if (leftOperand && operator && rightOperand) {
            try {
              // Use math.js to evaluate the condition
              const condition = `${leftOperand} ${operator} ${rightOperand}`;
              console.log(`Evaluating condition at node ${node.id}: ${condition}`);
              conditionMet = evaluate(condition, context.variables);
            } catch (error) {
              console.error(`Error evaluating condition at node ${node.id}:`, error);
              outputs.push(`Error evaluating condition in node ${node.id}: ${error.message}`);
              return;
            }
          } else {
            outputs.push(`Incomplete condition in node ${node.id}`);
            return;
          }
          node.conditionMet = conditionMet;
          break;
        }

        case 'whileEnd': {
          const { leftOperand, operator, rightOperand, whileStartNodeId } = node.data;
          let conditionMet = false;
          if (leftOperand && operator && rightOperand) {
            try {
              const condition = `${leftOperand} ${operator} ${rightOperand}`;
              conditionMet = evaluate(condition, context.variables);
            } catch (error) {
              console.error(`Error evaluating condition at node ${node.id}:`, error);
              outputs.push(`Error evaluating condition in node ${node.id}: ${error.message}`);
              return;
            }
          } else {
            outputs.push(`Incomplete condition in node ${node.id}`);
            return;
          }

          if (conditionMet && whileStartNodeId) {
            await traverse(whileStartNodeId);
          }
          return;
        }

        case 'print': {
          let message = node.data.message || '';
          try {
            // Use math.js to evaluate the message
            const evaluatedMessage = evaluate(message, context.variables);
            outputs.push(evaluatedMessage);
            setCharacterMessage(evaluatedMessage);
            await new Promise((resolve) => setTimeout(resolve, 2000));
            setCharacterMessage('');
          } catch (error) {
            console.error(`Error evaluating message at node ${node.id}:`, error);
            outputs.push(`Error evaluating message in node ${node.id}: ${error.message}`);
          }
          break;
        }

        default:
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