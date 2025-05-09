// src/Components/ControlPanel/ControlPanel.js
import React from 'react';
import './ControlPanel.css';
import { FaPlay, FaRedo, FaTrash } from 'react-icons/fa';
import PropTypes from 'prop-types';
import useFlowchartReset from '../../hooks/useFlowchartReset';

const ControlPanel = ({
  executeFlowchart,
  setConsoleOutput,
  setCharacterPosition,
  setCharacterRotation,
  setCharacterMessage,
  setActiveBlockId,
  setActiveEdgeId,
  selectedNodes, 
  selectedEdges,
  setNodes,
  setEdges,
}) => {
  const resetExecution = useFlowchartReset({
    setConsoleOutput,
    setCharacterPosition,
    setCharacterRotation,
    setCharacterMessage,
    setActiveBlockId,
    setActiveEdgeId,
  });

  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedNodes.length} selected block(s) and ${selectedEdges.length} edge(s)?`
      )
    ) {
      // Filter out blocks and edges based on IDs
      setNodes((nds) => nds.filter((block) => !selectedNodes.includes(block.id)));
      setEdges((eds) => eds.filter((edge) => !selectedEdges.includes(edge.id)));
      console.log(`Deleted ${selectedNodes.length} blocks and ${selectedEdges.length} edges.`);
    }
  };


  return (
    <div className="control-panel">
      <button onClick={executeFlowchart} className="execute-button" title="Run Program">
        <FaPlay /> Run
      </button>
      <button onClick={resetExecution} className="reset-button" title="Reset Execution">
        <FaRedo /> Reset
      </button>
      {/* <button onClick={togglePause} className="pause-button" title="Pause/Resume Execution"> */}
        {/* {paused ? <><FaPlayCircle /> Resume</> : <><FaPause /> Pause</>} */}
      {/* </button> */}
      {/* <button onClick={handleSpeedUp} className="speed-button" title="Speed Up Execution">
        <FaRocket /> Speed Up
      </button>
      <button onClick={handleNormalSpeed} className="speed-button" title="Normal Speed">
        <FaTachometerAlt /> Normal Speed
      </button> */}
      {(selectedNodes.length > 0 || selectedEdges.length > 0) && (
        <button onClick={handleDelete} className="delete-button" title="Delete Selected Component">
          <FaTrash /> Delete Selected
        </button>
      )}
    </div>
  );
};

ControlPanel.propTypes = {
  executeFlowchart: PropTypes.func.isRequired,
  setConsoleOutput: PropTypes.func.isRequired,
  setCharacterPosition: PropTypes.func.isRequired,
  setCharacterRotation: PropTypes.func.isRequired,
  setCharacterMessage: PropTypes.func.isRequired,
  setActiveBlockId: PropTypes.func.isRequired,
  setActiveEdgeId: PropTypes.func.isRequired,
  selectedNodes: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedEdges: PropTypes.arrayOf(PropTypes.string).isRequired,
  setNodes: PropTypes.func.isRequired,
  setEdges: PropTypes.func.isRequired,
};

export default ControlPanel;