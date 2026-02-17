// src/hooks/useFlowchartState.js

import { useState, useCallback } from 'react';
import { applyNodeChanges, applyEdgeChanges } from 'reactflow';

/**
 * Custom hook to manage flowchart state (blocks/nodes and edges).
 * Provides centralized state management for the flowchart data.
 * 
 * @returns {Object} - Contains state and handlers for blocks and edges
 */
export function useFlowchartState() {
  const [blocks, setBlocks] = useState([]);
  const [edges, setEdges] = useState([]);

  // Handle node changes from React Flow (drag, select, remove, etc.)
  const onNodesChange = useCallback(
    (changes) => {
      setBlocks((nodes) => applyNodeChanges(changes, nodes));
    },
    []
  );

  // Handle edge changes from React Flow
  const onEdgesChange = useCallback(
    (changes) => {
      setEdges((eds) => {
        const updatedEdges = applyEdgeChanges(changes, eds);
        // Add 'Loop Back' label to loopback edges
        return updatedEdges.map((edge) => {
          if (edge.sourceHandle && edge.sourceHandle.startsWith('loopBack')) {
            return { ...edge, label: 'Loop Back' };
          }
          return edge;
        });
      });
    },
    []
  );

  // Clear all blocks and edges
  const clearFlowchart = useCallback(() => {
    setBlocks([]);
    setEdges([]);
  }, []);

  // Load blocks and edges (for import/load operations)
  const loadFlowchart = useCallback((newBlocks, newEdges) => {
    setBlocks(newBlocks);
    setEdges(newEdges);
  }, []);

  return {
    blocks,
    setBlocks,
    edges,
    setEdges,
    onNodesChange,
    onEdgesChange,
    clearFlowchart,
    loadFlowchart,
  };
}

export default useFlowchartState;