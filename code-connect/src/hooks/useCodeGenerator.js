// src/hooks/useCodeGenerator.js

/**
 * Generates JavaScript code from the flowchart's blocks and edges.
 *
 * @param {Array} blocks - The array of block objects.
 * @param {Array} edges - The array of edge objects.
 * @returns {string} - The generated JavaScript code.
 */
export function generateJavaScriptCode(blocks, edges) {
  // Create a lookup map for blocks by their ID.
  const blockMap = blocks.reduce((map, block) => {
    map[block.id] = block;
    return map;
  }, {});

  const codeLines = [];

  // Helper function: if the right operand is not a number and not quoted, wrap it in quotes.
  function autoQuote(operand) {
    if (typeof operand !== 'string' || operand.trim() === '') return operand;
    const t = operand.trim();
    if (/^[a-zA-Z_$][a-zA-Z_$0-9]*$/.test(t)) return t;
    if (!isNaN(parseFloat(t))) return t;
    if (t.startsWith('"') || t.startsWith("'")) return t;
    return `"${t}"`;
  }

  /**
   * Recursively walk the flowchart.
   * @param {string} id
   * @param {number} indentLevel
   * @param {Set<string>} visited
   */
  function traverse(id, indentLevel = 0, visited = new Set()) {
    const indent = '  '.repeat(indentLevel);
    if (visited.has(id)) return;
    visited.add(id);

    const block = blockMap[id];
    if (!block) {
      codeLines.push(indent + `// Error: Block ${id} not found`);
      return;
    }

    const type = (block.data.blockType || '').toLowerCase();

    switch (type) {
      case 'start':
        codeLines.push(indent + 'function runFlowchart() {');
        {
          const next = getNext(id);
          if (next) traverse(next, indentLevel + 1, visited);
        }
        codeLines.push(indent + '}');
        break;

      case 'end':
        codeLines.push(indent + 'return;');
        break;

      case 'createvariable':
        if (block.data.varName) {
          if (block.data.valueType === 'string') {
            codeLines.push(indent + `var ${block.data.varName} = "${block.data.varValue}";`);
          } else {
            codeLines.push(indent + `var ${block.data.varName} = ${block.data.varValue};`);
          }
        }
        {
          const next = getNext(id);
          if (next) traverse(next, indentLevel, visited);
        }
        break;

      case 'updatevariable':
        if (block.data.varName) {
          if (block.data.valueType === 'string') {
            codeLines.push(indent + `${block.data.varName} = "${block.data.varValue}";`);
          } else {
            const op = block.data.operator || '+';
            codeLines.push(indent + `${block.data.varName} ${op}= ${block.data.varValue};`);
          }
        }
        {
          const next = getNext(id);
          if (next) traverse(next, indentLevel, visited);
        }
        break;

      case 'if':
        if (block.data.leftOperand && block.data.rightOperand) {
          const op = block.data.operator || '==';
          const left = block.data.leftOperand;
          const right = autoQuote(block.data.rightOperand);
          codeLines.push(indent + `if (${left} ${op} ${right}) {`);
          // const thenId = getNext(id, 'yes');
          // if (thenId) {
          //   traverse(thenId, indentLevel + 1, new Set(visited));
          // }
          // codeLines.push(indent + `} else {`);
          // const elseId = getNext(id, 'no');
          // if (elseId) {
          //   traverse(elseId, indentLevel + 1, new Set(visited));
          // }
          const tBr = getNext(id, 'yes');
          if (tBr) traverse(tBr, indentLevel + 1, new Set(visited));
          codeLines.push(indent + `} else {`);
          const fBr = getNext(id, 'no');
          if (fBr) traverse(fBr, indentLevel + 1, new Set(visited));
          codeLines.push(indent + `}`);
        } else {
          codeLines.push(indent + `// Incomplete condition in if block`);
        }
        break;

      case 'join':
        {
          const next = getNext(id);
          if (next) traverse(next, indentLevel, visited);
        }
        break;

      case 'whilestart':
        if (block.data.leftOperand && block.data.operator && block.data.rightOperand) {
          const left = block.data.leftOperand;
          const right = autoQuote(block.data.rightOperand);
          codeLines.push(indent + `while (${left} ${block.data.operator} ${right}) {`);
          const body = getNext(id, 'body');
          if (body) traverse(body, indentLevel + 1, visited);
          codeLines.push(indent + `}`);
          const exit = getNext(id, 'exit');
          if (exit) traverse(exit, indentLevel, visited);
        } else {
          codeLines.push(indent + `// Incomplete while condition`);
        }
        break;

      case 'input':
        if (block.data.varName && block.data.prompt) {
          const msg = block.data.prompt.replace(/"/g, '\\"');
          codeLines.push(indent + `var ${block.data.varName} = prompt("${msg}");`);
        } else {
          codeLines.push(indent + `// Error: Incomplete Input block`);
        }
        {
          const next = getNext(id);
          if (next) traverse(next, indentLevel, visited);
        }
        break;

      case 'output':
        const raw = block.data.message || '';
        /* eslint-disable no-template-curly-in-string */
        const tpl = raw.includes('${')
          ? raw
          : raw.replace(/\{(\w+)\}/g, '${$1}');
        codeLines.push(indent + `console.log(\`${tpl}\`);`);
        {
          const next = getNext(id);
          if (next) traverse(next, indentLevel, visited);
        }
        break;

      case 'move':
        if (block.data.direction && block.data.distance != null) {
          codeLines.push(
            indent + `moveCharacter(${block.data.direction}, ${block.data.distance});`
          );
        } else {
          codeLines.push(indent + `// Incomplete move block data`);
        }
        {
          const next = getNext(id);
          if (next) traverse(next, indentLevel, visited);
        }
        break;

      case 'rotate':
        {
          const deg = parseInt(block.data.degrees, 10) || 0;
          const dir = block.data.rotateDirection;
          const val = dir === 'left' ? -deg : deg;
          codeLines.push(indent + `rotateCharacter(${val});`);
        }
        {
          const next = getNext(id);
          if (next) traverse(next, indentLevel, visited);
        }
        break;

      default:
        codeLines.push(indent + `// Unknown block type: ${block.data.blockType}`);
        {
          const next = getNext(id);
          if (next) traverse(next, indentLevel, visited);
        }
        break;
    }
  }

  /**
   * Find next block ID by outgoing edge.
   * @param {string} from
   * @param {string} [handle]
   */
  function getNext(from, handle) {
    const e = edges.find(ed => {
      if (ed.source !== from) return false;
      if (handle) return ed.sourceHandle && ed.sourceHandle.startsWith(handle);
      return true;
    });
    return e ? e.target : null;
  }

  const start = blocks.find(b => (b.data.blockType||'').toLowerCase()==='start');
  if (!start) return '// Error: No start block found.';
  traverse(start.id);
  return codeLines.join('\n');
}