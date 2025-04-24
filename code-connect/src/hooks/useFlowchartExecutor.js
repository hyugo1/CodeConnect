// src/hooks/useFlowchartExecutor.js

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
  const nodeIds = blocks.map(b => b.id);

  // Start block?
  const start = blocks.find(b =>
    (b.data.blockType || '').toLowerCase() === 'start' && b.type === 'custom'
  );
  if (!start) errors.push('Error: No Start block found.');

  // Check for existence of an End block
  const end = blocks.find(b =>
    (b.data.blockType || '').toLowerCase() === 'end'
  );
  if (!end) errors.push('Error: No End block found.');

  // Check that all edges point to existing blocks
  edges.forEach(e => {
    if (!nodeIds.includes(e.source)) {
      errors.push(`Error: Edge ${e.id} refers to missing source ${e.source}`);
    }
    if (!nodeIds.includes(e.target)) {
      errors.push(`Error: Edge ${e.id} refers to missing target ${e.target}`);
    }
  });

  // Check for connectivity from Start to End
  if (start && end) {
    const visited = new Set();
    function dfs(id) {
      if (visited.has(id)) return;
      visited.add(id);
      edges.forEach(e => { if (e.source === id) dfs(e.target); });
    }
    dfs(start.id);
    if (!visited.has(end.id)) {
      errors.push('Error: End block is not reachable from Start block.');
    }
  }

  // Validate each block's internal data
  blocks.forEach(b => {
    if ((b.data.blockType || '').toLowerCase() === 'createvariable') {
      if (!b.data.varName?.trim()) {
        errors.push(
          `Error: Create Variable block "${b.data.label || b.id}" needs a variable name.`
        );
      }
      if (b.data.varValue == null || b.data.varValue === '') {
        errors.push(
          `Error: Create Variable block "${b.data.label || b.id}" needs a non-empty value.`
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
  setSnackbar
) {
  // --- dynamically load mathjs only when needed ---
  const evaluateRef = useRef(null);
  async function getEvaluate() {
    if (!evaluateRef.current) {
      const math = await import('mathjs');
      evaluateRef.current = math.evaluate;
    }
    return evaluateRef.current;
  }

  // configuration
  const MAX_VISITS    = 3000;
  const BLOCK_DELAY   = 800;
  const EDGE_DELAY    = 800;
  const OUTPUT_DELAY  = 3000;
  const speedRef      = useRef(2);
  const [paused, setPaused] = useState(false);
  const [inputRequest, setInputRequest] = useState(null);

  // context holds variables & character state
  const context = {
    variables: {},
    characterPos:      { x: 0, y: 0 },
    characterMsg:      '',
    characterRotation: 0,
  };
  const outputs = [];
  const nodes = blocks;
  const conns = edges;

  // helper: delay with pause & speed multiplier
  async function delay(ms) {
    let rem = ms / speedRef.current;
    while (rem > 0) {
      if (paused) {
        await new Promise(r => setTimeout(r, 50));
      } else {
        const chunk = Math.min(50, rem);
        const t0 = Date.now();
        await new Promise(r => setTimeout(r, chunk));
        const t1 = Date.now();
        rem -= (t1 - t0);
      }
    }
  }

  // helper: resolve {varName} in strings
  function resolveTemplate(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/\{(\w+)\}/g, (_m, v) => {
      const val = context.variables[v];
      if (val === undefined) return `{${v}}`;
      return typeof val === 'string' ? `"${val}"` : val;
    });
  }

  // helper: auto-quote an operand if needed
  function autoQuote(op) {
    if (typeof op !== 'string' || !op.trim()) return op;
    if (context.variables.hasOwnProperty(op)) return op;
    if (!isNaN(parseFloat(op))) return op;
    const t = op.trim();
    if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'")))
      return t;
    return `"${t}"`;
  }

  // helper: mark error block temporarily
  function markError(id) {
    if (!setErrorBlockId) return;
    setErrorBlockId(id);
    setTimeout(() => setErrorBlockId(null), 5000);
  }

  // recursive executor
  async function traverse(id, visits = new Map()) {
    const count = visits.get(id) || 0;
    if (count >= MAX_VISITS) {
      const msg = `Error: Block ${id} visited too many times.`;
      outputs.push(msg);
      toast.error(msg);
      markError(id);
      setConsoleOutput(outputs.join('\n'));
      return;
    }
    visits.set(id, count + 1);

    const block = nodes.find(n => n.id === id);
    if (!block) {
      const msg = `Error: Node ${id} not found.`;
      outputs.push(msg);
      toast.error(msg);
      setConsoleOutput(outputs.join('\n'));
      return;
    }

    const disp = block.data.label || id;
    setActiveBlockId(id);
    await delay(BLOCK_DELAY);
    outputs.push(`Executing block "${disp}"`);

    const type = (block.data.blockType || '').toLowerCase();
    switch (type) {
      case 'start':
        await stepNext(id, visits);
        return;

      case 'input': {
        const raw = await new Promise(res =>
          setInputRequest({
            varName:    block.data.varName,
            promptText: block.data.prompt,
            resolve:    res,
          })
        );
        const val = block.data.valueType === 'number' ? parseFloat(raw) : raw;
        context.variables[block.data.varName] = val;
        outputs.push(`Input ${block.data.varName} = ${JSON.stringify(val)}`);
        setInputRequest(null);
        break;
      }

      case 'createvariable': {
        try {
          let val;
          if (block.data.valueType === 'string') {
            val = resolveTemplate(block.data.varValue).replace(/^"|"$/g, '');
          } else {
            const evaluate = await getEvaluate();
            val = evaluate(resolveTemplate(block.data.varValue), context.variables);
          }
          context.variables[block.data.varName] = val;
          outputs.push(`Create Variable ${block.data.varName} = ${JSON.stringify(val)}`);
        } catch (e) {
          const msg = `Error in CreateVariable "${disp}": ${e.message}`;
          outputs.push(msg);
          toast.error(msg);
          markError(id);
          setConsoleOutput(outputs.join('\n'));
          return;
        }
        break;
      }

      case 'updatevariable': {
        if (!context.variables.hasOwnProperty(block.data.varName)) {
          const msg = `Error: Variable "${block.data.varName}" not defined.`;
          outputs.push(msg);
          toast.error(msg);
          markError(id);
          setConsoleOutput(outputs.join('\n'));
          return;
        }
        try {
          let nv;
          const tmpl = resolveTemplate(block.data.varValue);
          if (block.data.valueType === 'string') {
            nv = tmpl.replace(/^"|"$/g, '');
          } else {
            const evaluate = await getEvaluate();
            nv = evaluate(tmpl, context.variables);
          }
          const op = block.data.operator || '+';
          switch (op) {
            case '-': context.variables[block.data.varName] -= nv; break;
            case '*': context.variables[block.data.varName] *= nv; break;
            case '/': context.variables[block.data.varName] /= nv; break;
            default:  context.variables[block.data.varName] += nv;
          }
          outputs.push(`Changed ${block.data.varName} to ${JSON.stringify(context.variables[block.data.varName])}`);
        } catch (e) {
          const msg = `Error in updateVariable "${disp}": ${e.message}`;
          outputs.push(msg);
          toast.error(msg);
          markError(id);
          setConsoleOutput(outputs.join('\n'));
          return;
        }
        break;
      }

      case 'if': {
        const { leftOperand, operator, rightOperand } = block.data;
        if (!leftOperand || rightOperand == null) {
          const msg = `Error: Incomplete condition in "${disp}".`;
          outputs.push(msg);
          toast.error(msg);
          markError(id);
          setConsoleOutput(outputs.join('\n'));
          return;
        }
        let cond = false;
        const op = operator || '==';
        if ((op === '==' || op === '!=') && typeof context.variables[leftOperand] === 'string') {
          const rhs = rightOperand.trim().replace(/^['"]|['"]$/g, '');
          cond = op === '==' 
            ? context.variables[leftOperand] === rhs 
            : context.variables[leftOperand] !== rhs;
        } else {
          const expr = `${leftOperand} ${op} ${autoQuote(rightOperand)}`;
          const evaluate = await getEvaluate();
          cond = evaluate(expr, context.variables);
        }
        block.conditionMet = cond;
        outputs.push(`If condition ${leftOperand} ${op} ${rightOperand} => ${cond}`);
        break;
      }

      case 'join':
        await stepNext(id, visits);
        return;

      case 'whilestart': {
        const { leftOperand, operator, rightOperand } = block.data;
        const op = operator || '==';
        let cond = false;
        if ((op === '==' || op === '!=') && typeof context.variables[leftOperand] === 'string') {
          const rhs = rightOperand.trim().replace(/^['"]|['"]$/g, '');
          cond = op === '==' 
            ? context.variables[leftOperand] === rhs 
            : context.variables[leftOperand] !== rhs;
        } else {
          const expr = `${leftOperand} ${op} ${autoQuote(rightOperand)}`;
          const evaluate = await getEvaluate();
          cond = evaluate(expr, context.variables);
        }
        if (cond) {
          const bodyEdge = conns.find(e => e.source === id && e.sourceHandle === `body-${id}`);
          if (!bodyEdge) {
            const msg = `Error: No loop body on "${disp}".`;
            outputs.push(msg);
            toast.error(msg);
            markError(id);
            setConsoleOutput(outputs.join('\n'));
            return;
          }
          setActiveEdgeId(bodyEdge.id);
          await delay(EDGE_DELAY);
          setActiveEdgeId(null);
          await traverse(bodyEdge.target, new Map(visits));
        } else {
          const exitEdge = conns.find(e => e.source === id && e.sourceHandle === `exit-${id}`);
          if (!exitEdge) {
            const msg = `Error: No exit path on "${disp}".`;
            outputs.push(msg);
            toast.error(msg);
            markError(id);
            setConsoleOutput(outputs.join('\n'));
            return;
          }
          setActiveEdgeId(exitEdge.id);
          await delay(EDGE_DELAY);
          setActiveEdgeId(null);
          await traverse(exitEdge.target, new Map(visits));
        }
        return;
      }

      case 'move': {
        const { distance, direction } = block.data;
        if (typeof distance === 'number' && direction) {
          let { x, y } = context.characterPos;
          switch (direction) {
            case 'left':  x -= distance; break;
            case 'right': x += distance; break;
            case 'up':    y -= distance; break;
            case 'down':  y += distance; break;
          }
          context.characterPos = { x, y };
          outputs.push(`Moved ${direction} by ${distance} to (${x},${y})`);
          setCharacterPosition({ x, y });
        } else {
          const msg = `Error: Invalid Move data in "${disp}".`;
          outputs.push(msg);
          toast.error(msg);
          markError(id);
          setConsoleOutput(outputs.join('\n'));
          return;
        }
        break;
      }

      case 'rotate': {
        const { degrees, rotateDirection } = block.data;
        if (typeof degrees === 'number' && rotateDirection) {
          let rot = context.characterRotation;
          rot += rotateDirection === 'left' ? -degrees : degrees;
          context.characterRotation = rot;
          outputs.push(`Rotated ${rotateDirection} by ${degrees}° to ${rot}°`);
          setCharacterRotation(rot);
        } else {
          const msg = `Error: Invalid Rotate data in "${disp}".`;
          outputs.push(msg);
          toast.error(msg);
          markError(id);
          setConsoleOutput(outputs.join('\n'));
          return;
        }
        break;
      }

      case 'output': {
        let msg = block.data.message || '';
        msg = msg.replace(/\{(\w+)\}/g, (_m, v) =>
          context.variables.hasOwnProperty(v) ? context.variables[v] : _m
        );
        outputs.push(`Output: ${msg}`);
        setCharacterMessage(msg);
        await delay(OUTPUT_DELAY);
        setCharacterMessage('');
        break;
      }

      case 'end':
        outputs.push('Execution ended.');
        setConsoleOutput(outputs.join('\n'));
        setActiveBlockId(null);
        setActiveEdgeId(null);
        setCharacterPosition(context.characterPos);
        setCharacterMessage(context.characterMsg);
        setCharacterRotation(context.characterRotation);
        return;

      default:
        const err = `Error: Unknown block type "${type}" in "${disp}".`;
        outputs.push(err);
        toast.error(err);
        markError(id);
        setConsoleOutput(outputs.join('\n'));
        return;
    }

    // walk all outgoing edges
    const outs = conns.filter(e => e.source === id);
    for (const e of outs) {
      if (type === 'if') {
        const br = e.sourceHandle?.split('-')[0];
        if ((br === 'yes' && block.conditionMet) || (br === 'no' && !block.conditionMet)) {
          setActiveEdgeId(e.id);
          await delay(EDGE_DELAY);
          setActiveEdgeId(null);
          await traverse(e.target, new Map(visits));
        }
      } else {
        setActiveEdgeId(e.id);
        await delay(EDGE_DELAY);
        setActiveEdgeId(null);
        await traverse(e.target, new Map(visits));
      }
    }

    if (outs.length === 0 && type !== 'end') {
      const w = `"${disp}" has no outgoing connections.`;
      outputs.push(`Warning: ${w}`);
      toast.error(w);
      setConsoleOutput(outputs.join('\n'));
    }
  }

  // helper to step to exactly one next node
  async function stepNext(from, visits) {
    const e = conns.find(x => x.source === from);
    if (e) {
      setActiveEdgeId(e.id);
      await delay(EDGE_DELAY);
      setActiveEdgeId(null);
      await traverse(e.target, new Map(visits));
    } else {
      outputs.push('Execution ended.');
      setConsoleOutput(outputs.join('\n'));
    }
  }

  // the public entry point
  const executeFlowchart = useCallback(() => {
    // preload mathjs chunk
    getEvaluate().catch(() => {
      toast.error('Could not load math engine');
    });

    // clear old errors & reset state
    outputs.length = 0;
    context.variables = {};
    setConsoleOutput('');
    setCharacterMessage('');
    setCharacterPosition({ x: 0, y: 0 });
    speedRef.current = 2;
    setErrorBlockId?.(null);
    setPaused(false);

    // validate up front
    const errs = validateFlowchart(blocks, edges);
    if (errs.length) {
      errs.forEach(e => toast.error(e));
      setConsoleOutput(errs.join('\n'));
      return;
    }

    // run from the Start block
    const start = blocks.find(b => (b.data.blockType || '').toLowerCase() === 'start');
    if (start) {
      traverse(start.id, new Map()).then(() => {
        setConsoleOutput(outputs.join('\n'));
      });
    } else {
      toast.error('Error: No Start block found.');
      setConsoleOutput('Error: No Start block found.');
    }
  }, [blocks, edges]);

  return { executeFlowchart, inputRequest };
}