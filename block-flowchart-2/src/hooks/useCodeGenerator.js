// /hooks/useCodeGenerator.js
import { evaluate } from 'mathjs';

/**
 * Generates JavaScript code from the flowchart's blocks and edges.
 *
 * @param {Array} blocks - The array of block objects.
 * @param {Array} edges - The array of edge objects.
 * @returns {string} - The generated JavaScript code.
 */
export function generateJavaScriptCode(blocks, edges) {
  // Create a map of block IDs to block objects for easy lookup.
  const blockMap = blocks.reduce((map, block) => {
    map[block.id] = block;
    return map;
  }, {});

  const codeLines = [];

  /**
   * Recursive traversal to generate code.
   * 
   * @param {string} blockId - The current block’s ID.
   * @param {number} indentLevel - Current indentation level.
   * @param {Set<string>} visited - Set of already visited block IDs.
   */
  function traverse(blockId, indentLevel = 0, visited = new Set()) {
    const indent = '  '.repeat(indentLevel);
    
    //stop to prevent generating it again, if the block with the same ID is already visited
    if (visited.has(blockId)) {
      codeLines.push(indent + `Cycle detected: block ${blockId} already processed. Stopping recursion here.`);
      return;
    }
    visited.add(blockId);

    const block = blockMap[blockId];
    if (!block) {
      codeLines.push(indent + `Error: Block ${blockId} not found`);
      return;
    }
    // codeLines.push(indent + `Block: ${block.data.blockType} (${block.id})`);

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
        // codeLines.push(indent + 'End of flowchart');
        codeLines.push(indent + 'return;');
        break;

      case 'setVariable':
        if (block.data.varName) {
          codeLines.push(indent + `var ${block.data.varName} = ${block.data.varValue};`);
        }
        {
          const next = getNextBlock(blockId);
          if (next) traverse(next, indentLevel, new Set(visited));
        }
        break;

      case 'changeVariable':
        if (block.data.varName) {
          codeLines.push(indent + `${block.data.varName} += ${block.data.varValue};`);
        }
        {
          const next = getNextBlock(blockId);
          if (next) traverse(next, indentLevel, new Set(visited));
        }
        break;

      case 'operator':
        if (block.data.expression) {
          if (block.data.resultVar) {
            codeLines.push(indent + `var ${block.data.resultVar} = ${block.data.expression};`);
          } else {
            codeLines.push(indent + block.data.expression + ';');
          }
        } else {
          let op = '';
          switch (block.data.operator) {
            case 'add': op = '+'; break;
            case 'subtract': op = '-'; break;
            case 'multiply': op = '*'; break;
            case 'divide': op = '/'; break;
            default: op = '?';
          }
          const expression = `${block.data.operand1} ${op} ${block.data.operand2}`;
          if (block.data.resultVar) {
            codeLines.push(indent + `var ${block.data.resultVar} = ${expression};`);
          } else {
            codeLines.push(indent + expression + ';');
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
          // codeLines.push(indent + 'End of while loop (whileEnd block, ignored)');
          break;

        case 'print':
          {
            let msg = block.data.message || '';
            msg = msg.replace(/{(\w+)}/g, '${$1}');
            codeLines.push(indent + `console.log(\`${msg}\`);`);
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
   * Utility function to get the next block from the current block.
   * Optionally, filter by a sourceHandle prefix (e.g., "yes", "no", "body", or "exit").
   *
   * @param {string} currentBlockId - The ID of the current block.
   * @param {string} [sourceHandleFilter] - Optional filter for the sourceHandle.
   * @returns {string|null} The target block ID or null.
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

  const startBlock = blocks.find((block) => block.data.blockType === 'start');
  if (!startBlock) return '// Error: No start block found.';
  traverse(startBlock.id);
  return codeLines.join('\n');
}