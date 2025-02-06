// src/hooks/useNodeUpdater.js

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
   * Updates the block data by merging the new data with the existing data.
   *
   * @param {Object} newData - The new data to merge into the block's data.
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