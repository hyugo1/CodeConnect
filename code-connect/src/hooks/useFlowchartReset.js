import { useCallback } from 'react';

/**
 * Custom hook that returns a new resetExecution function.
 *
 * @param {Function} setConsoleOutput - State setter to update console output.
 * @param {Function} setCharacterPosition - Setter for character's position.
 * @param {Function} setCharacterRotation - Setter for character's rotation.
 * @param {Function} setCharacterMessage - Setter for the character's message.
 * @param {Function} setActiveBlockId - Setter for the active block highlight.
 * @param {Function} setActiveEdgeId - Setter for the active edge highlight.
 * @param {Function} setPaused - Setter to update the pause state (if applicable).
 * @param {Function} [resetExecutionContext] - Optional function to clear any additional execution context.
 * @returns {Function} The resetExecution function.
 */
const useFlowchartReset = ({
  setConsoleOutput,
  setCharacterPosition,
  setCharacterRotation,
  setCharacterMessage,
  setActiveBlockId,
  setActiveEdgeId,
  setPaused,
  resetExecutionContext
}) => {
  const resetExecution = useCallback(() => {
    // Clear the console output of any previous logs
    setConsoleOutput("");

    setCharacterPosition({ x: 0, y: 0 });
    setCharacterRotation(0);
    setCharacterMessage("");

    setActiveBlockId(null);
    setActiveEdgeId(null);

    setPaused(false);

    if (resetExecutionContext) {
      resetExecutionContext();
    }

    console.log("Flowchart execution has been fully reset.");
  }, [
    setConsoleOutput,
    setCharacterPosition,
    setCharacterRotation,
    setCharacterMessage,
    setActiveBlockId,
    setActiveEdgeId,
    setPaused,
    resetExecutionContext,
  ]);

  return resetExecution;
};

export default useFlowchartReset;