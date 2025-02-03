// src/hooks/useNodeUpdater.js

import { useReactFlow } from 'reactflow';

/**
 * Custom hook to update the data of a node given its ID.
 *
 * @param {string} nodeId - The ID of the node to update.
 * @returns {Function} A function to update the node’s data.
 */
export const useNodeUpdater = (nodeId) => {
  const { setNodes } = useReactFlow();

  /**
   * Updates the node data by merging the new data with the existing data.
   *
   * @param {Object} newData - The new data to merge into the node's data.
   */
  const updateNodeData = (newData) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...newData } }
          : node
      )
    );
  };

  return updateNodeData;
};