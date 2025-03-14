// /src/hooks/useNodeUpdater.js
import { useReactFlow } from 'reactflow';

/**
 * Custom hook to update the data of a block given its ID.
 *
 * @param {string} blockId - The ID of the block to update.
 * @returns {Function} A function to update the block’s data.
 */
export const useNodeUpdater = (blockId) => {
  const { setNodes } = useReactFlow();

  /**
   * Merges the new data into the block's existing data.
   *
   * @param {Object} newData - New data to merge.
   */
  const updateNodeData = (newData) => {
    setNodes((nds) =>
      nds.map((block) =>
        block.id === blockId
          ? { ...block, data: { ...block.data, ...newData } }
          : block
      )
    );
  };

  return updateNodeData;
};