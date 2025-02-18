import { evaluate } from 'mathjs';

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

  /**
   * Recursively traverse blocks to build code.
   *
   * @param {string} blockId - The current block's ID.
   * @param {number} indentLevel - Current indentation level.
   * @param {Set<string>} visited - Set of already visited block IDs.
   */
  function traverse(blockId, indentLevel = 0, visited = new Set()) {
    const indent = '  '.repeat(indentLevel);

    // Prevent infinite recursion.
    if (visited.has(blockId)) {
      codeLines.push(indent + `// Cycle detected: block ${blockId} already processed.`);
      return;
    }
    visited.add(blockId);

    const block = blockMap[blockId];
    if (!block) {
      codeLines.push(indent + `// Error: Block ${blockId} not found`);
      return;
    }

    switch (block.data.blockType) {
      case 'start':
        codeLines.push(indent + 'function runFlowchart() {');
        {
          const next = getNextBlock(blockId);
          if (next) traverse(next, indentLevel + 1, new Set(visited));
        }
        codeLines.push(indent + '}');
        break;

      case 'end':
        codeLines.push(indent + 'return;');
        break;

      case 'setVariable':
        if (block.data.varName) {
          if (block.data.valueType === 'string') {
            codeLines.push(indent + `var ${block.data.varName} = "${block.data.varValue}";`);
          }
          /* Array handling commented out:
          else if (block.data.valueType === 'array') {
            const rawValue = block.data.varValue || "";
            const items = rawValue.split(',')
              .map(item => item.trim())
              .filter(item => item !== '');
            const arrayLiteral = `[${items.map(item => `"${item}"`).join(', ')}]`;
            codeLines.push(indent + `var ${block.data.varName} = ${arrayLiteral};`);
          }
          */
          else {
            // Default: assume number (or expression).
            codeLines.push(indent + `var ${block.data.varName} = ${block.data.varValue};`);
          }
        }
        {
          const next = getNextBlock(blockId);
          if (next) traverse(next, indentLevel, new Set(visited));
        }
        break;

      case 'changeVariable':
        if (block.data.varName) {
          const vt = block.data.valueType || 'number';
          const op = block.data.operation || 'add';
          
          if (vt === 'string') {
            codeLines.push(indent + `${block.data.varName} = "${block.data.varValue}";`);
          }
          /* Array handling commented out:
          else if (vt === 'array') {
            const rawValue = block.data.varValue || "";
            const items = rawValue.split(',')
              .map(item => item.trim())
              .filter(item => item !== '');
            const arrayLiteral = `[${items.map(item => `"${item}"`).join(', ')}]`;
            
            switch (op) {
              case 'push':
                codeLines.push(indent + `${block.data.varName}.push(...${arrayLiteral});`);
                break;
              case 'pop':
                codeLines.push(indent + `for (let i = 0; i < ${items.length}; i++) {`);
                codeLines.push(indent + `  ${block.data.varName}.pop();`);
                codeLines.push(indent + `}`);
                break;
              case 'remove':
                codeLines.push(indent + `${block.data.varName} = ${block.data.varName}.filter(el => !${arrayLiteral}.includes(el));`);
                break;
              case 'add':
              default:
                codeLines.push(indent + `${block.data.varName} = ${block.data.varName}.concat(${arrayLiteral});`);
            }
          }
          */
          else {
            codeLines.push(indent + `${block.data.varName} += ${block.data.varValue};`);
          }
        }
        {
          const next = getNextBlock(blockId);
          if (next) traverse(next, indentLevel, new Set(visited));
        }
        break;

      case 'if':
        if (block.data.leftOperand && block.data.operator && block.data.rightOperand) {
          const condition = `${block.data.leftOperand} ${block.data.operator} ${block.data.rightOperand}`;
          codeLines.push(indent + `if (${condition}) {`);
          const trueBranch = getNextBlock(blockId, 'yes');
          if (trueBranch) traverse(trueBranch, indentLevel + 1, new Set(visited));
          codeLines.push(indent + '} else {');
          const falseBranch = getNextBlock(blockId, 'no');
          if (falseBranch) traverse(falseBranch, indentLevel + 1, new Set(visited));
          codeLines.push(indent + '}');
        } else {
          codeLines.push(indent + '// Incomplete condition in if block');
        }
        break;

      case 'whileStart':
        if (block.data.leftOperand && block.data.operator && block.data.rightOperand) {
          const condition = `${block.data.leftOperand} ${block.data.operator} ${block.data.rightOperand}`;
          codeLines.push(indent + `while (${condition}) {`);
          const loopBody = getNextBlock(blockId, 'body');
          if (loopBody) traverse(loopBody, indentLevel + 1, new Set(visited));
          codeLines.push(indent + '}');
          const exitBlock = getNextBlock(blockId, 'exit');
          if (exitBlock) traverse(exitBlock, indentLevel, new Set(visited));
        } else {
          codeLines.push(indent + '// Incomplete while condition');
        }
        break;

      case 'whileEnd':
        // whileEnd is a visual marker; ignore it.
        break;

      case 'print': {
        let msg = block.data.message || '';
        msg = msg.replace(/{(\w+)}/g, '${$1}');
        codeLines.push(indent + `console.log(\`${msg}\`);`);
        {
          const next = getNextBlock(blockId);
          if (next) traverse(next, indentLevel, new Set(visited));
        }
        break;
      }

      case 'function':
        if (block.data.resultVar && block.data.expression) {
          codeLines.push(indent + `var ${block.data.resultVar} = ${block.data.expression};`);
        } else {
          codeLines.push(indent + '// Incomplete function block');
        }
        {
          const next = getNextBlock(blockId);
          if (next) traverse(next, indentLevel, new Set(visited));
        }
        break;

      case 'forLoopStart':
        {
          const arrayVar = block.data.arrayVar || 'arr';
          const indexVar = block.data.indexVar || 'i';
          codeLines.push(indent + `for (let ${indexVar} = 0; ${indexVar} < ${arrayVar}.length; ${indexVar}++) {`);
          const loopBody = getNextBlock(block.id, 'body');
          if (loopBody) traverse(loopBody, indentLevel + 1, new Set(visited));
          codeLines.push(indent + '}');
          const exitBlock = getNextBlock(block.id, 'exit');
          if (exitBlock) traverse(exitBlock, indentLevel, new Set(visited));
        }
        break;

      case 'forLoopEnd':
        // forLoopEnd is a visual marker; ignore it.
        break;

      default:
        codeLines.push(indent + `// Unknown block type: ${block.data.blockType}`);
        {
          const next = getNextBlock(blockId);
          if (next) traverse(next, indentLevel, new Set(visited));
        }
        break;
    }
  }

  /**
   * Returns the target block for the given block.
   *
   * @param {string} currentBlockId - The current block's ID.
   * @param {string} [sourceHandleFilter] - Optional filter for the edge's sourceHandle.
   * @returns {string|null} - The target block's ID, or null if none.
   */
  function getNextBlock(currentBlockId, sourceHandleFilter) {
    const outgoing = edges.find(edge => {
      if (edge.source !== currentBlockId) return false;
      if (sourceHandleFilter) {
        return edge.sourceHandle && edge.sourceHandle.startsWith(sourceHandleFilter);
      }
      return true;
    });
    return outgoing ? outgoing.target : null;
  }

  const startBlock = blocks.find(block => block.data.blockType === 'start');
  if (!startBlock) return '// Error: No start block found.';
  traverse(startBlock.id);
  return codeLines.join('\n');
}