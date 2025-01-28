// src/Components/ControlPanel.js

import React from 'react';

function ControlPanel({
  executeFlowchart,
  resetExecution,
  selectedNodes,
  selectedEdges,
  setNodes,
  setEdges,
}) {
  return (
    <div className="button-group">
      <button onClick={executeFlowchart} className="run-button">
        Run
      </button>
      <button onClick={resetExecution} className="reset-button">
        Reset
      </button>
      <button
        onClick={() => {
          setNodes((nds) =>
            nds.filter((node) => !selectedNodes.includes(node))
          );
          setEdges((eds) =>
            eds.filter((edge) => !selectedEdges.includes(edge))
          );
        }}
        disabled={selectedNodes.length === 0 && selectedEdges.length === 0}
        className="delete-button"
      >
        Delete
      </button>
    </div>
  );
}

export default ControlPanel;