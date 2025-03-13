// src/hooks/useCodeGenerator.js
// import { evaluate } from 'mathjs';

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
    const trimmed = operand.trim();
    // If it’s a valid variable name (identifier), return it as-is.
    if (/^[a-zA-Z_$][a-zA-Z_$0-9]*$/.test(trimmed)) return trimmed;
    // If it can be parsed as a number, leave it as a number.
    if (!isNaN(parseFloat(trimmed))) return trimmed;
    // If already quoted, return as-is.
    if (trimmed.startsWith('"') || trimmed.startsWith("'")) return trimmed;
    // Otherwise, wrap it in quotes.
    return `"${trimmed}"`;
  }

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
      // codeLines.push(indent + `// Cycle detected: block ${blockId} already processed.`);
      return;
    }
    visited.add(blockId);

    const block = blockMap[blockId];
    if (!block) {
      codeLines.push(indent + `// Error: Block ${blockId} not found`);
      return;
    }

    // Convert block type to lowercase for case-insensitive matching.
    const type = (block.data.blockType || '').toLowerCase();

    switch (type) {
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

      case 'setvariable':
        if (block.data.varName) {
          if (block.data.valueType === 'string') {
            codeLines.push(indent + `var ${block.data.varName} = "${block.data.varValue}";`);
          } else {
            codeLines.push(indent + `var ${block.data.varName} = ${block.data.varValue};`);
          }
        }
        {
          const next = getNextBlock(blockId);
          if (next) traverse(next, indentLevel, new Set(visited));
        }
        break;

      case 'changevariable':
        if (block.data.varName) {
          const vt = block.data.valueType || 'number';
          if (vt === 'string') {
            codeLines.push(indent + `${block.data.varName} = "${block.data.varValue}";`);
          } else {
            // Use the operator from the block data (defaults to '+')
            const op = block.data.operator || '+';
            codeLines.push(indent + `${block.data.varName} ${op}= ${block.data.varValue};`);
          }
        }
        {
          const next = getNextBlock(blockId);
          if (next) traverse(next, indentLevel, new Set(visited));
        }
        break;

      case 'if':
        if (block.data.leftOperand && block.data.rightOperand) {
          const operator = block.data.operator || '==';
          const left = block.data.leftOperand;
          const right = autoQuote(block.data.rightOperand);
          const condition = `${left} ${operator} ${right}`;
          codeLines.push(indent + `if (${condition}) {`);
          const trueBranch = getNextBlock(blockId, 'yes');
          if (trueBranch) traverse(trueBranch, indentLevel + 1, new Set(visited));
          codeLines.push(indent + '} else {');
          const falseBranch = getNextBlock(blockId, 'no');
          if (falseBranch) traverse(falseBranch, indentLevel + 1, new Set(visited));
          codeLines.push(indent + '}');
        } else {
          codeLines.push(indent + '// Incomplete condition in if then block');
        }
        break;
      case 'join':
        {
          const next = getNextBlock(blockId);
          if (next) traverse(next, indentLevel, new Set(visited));
        }
        break;

      case 'whilestart':
        if (block.data.leftOperand && block.data.operator && block.data.rightOperand) {
          const left = block.data.leftOperand;
          const right = autoQuote(block.data.rightOperand);
          const condition = `${left} ${block.data.operator} ${right}`;
          // Generate a standard while loop.
          codeLines.push(indent + `while (${condition}) {`);
          // Use "body" to represent the loop body branch.
          const bodyBranch = getNextBlock(blockId, 'body');
          if (bodyBranch) traverse(bodyBranch, indentLevel + 1, new Set(visited));
          codeLines.push(indent + `}`);
          // Use "exit" to represent what happens after the loop.
          const exitBranch = getNextBlock(blockId, 'exit');
          if (exitBranch) traverse(exitBranch, indentLevel, new Set(visited));
        } else {
          codeLines.push(indent + '// Incomplete while condition');
        }
        break;

      case 'print': {
        let msg = block.data.message || '';
        // Replace {var} with template literal placeholders.
        msg = msg.replace(/{(\w+)}/g, '${$1}');
        codeLines.push(indent + `console.log(\`${msg}\`);`);
        {
          const next = getNextBlock(blockId);
          if (next) traverse(next, indentLevel, new Set(visited));
        }
        break;
      }
      // New case: move
      case 'move':
        if (block.data.distance && block.data.direction) {
          codeLines.push(
            indent +
              `moveCharacter(${block.data.direction}, ${block.data.distance});`
          );
        } else {
          codeLines.push(indent + '// Incomplete move block data');
        }
        {
          const next = getNextBlock(blockId);
          if (next) traverse(next, indentLevel, new Set(visited));
        }
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
    const outgoing = edges.find((edge) => {
      if (edge.source !== currentBlockId) return false;
      if (sourceHandleFilter) {
        return edge.sourceHandle && edge.sourceHandle.startsWith(sourceHandleFilter);
      }
      return true;
    });
    return outgoing ? outgoing.target : null;
  }

  const startBlock = blocks.find(
    (block) => (block.data.blockType || '').toLowerCase() === 'start'
  );
  if (!startBlock) return '// Error: No start block found.';
  traverse(startBlock.id);
  return codeLines.join('\n');
}