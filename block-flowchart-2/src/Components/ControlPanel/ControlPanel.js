// src/Components/ControlPanel/ControlPanel.js

import React from 'react';
import './ControlPanel.css';
import { FaPlay, FaRedo, FaTrash  
  // , FaStop, FaRocket, FaTachometerAlt, FaPause, FaPlayCircle 
} from 'react-icons/fa';
import PropTypes from 'prop-types';

const ControlPanel = ({
  executeFlowchart,
  resetExecution,
  // togglePause,
  // paused,
  setSpeedMultiplier,
  selectedNodes, 
  selectedEdges,
  setNodes,
  setEdges,
}) => {
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

  // const handleSpeedUp = () => {
  //   setSpeedMultiplier(2);
  // };

  // const handleNormalSpeed = () => {
  //   setSpeedMultiplier(1);
  // };

  return (
    <div className="control-panel">
      <button onClick={executeFlowchart} className="execute-button" title="Run Flowchart">
        <FaPlay /> Run
      </button>
      <button onClick={resetExecution} className="reset-button" title="Reset/Stop Execution">
        <FaRedo /> Reset/Stop
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
        <button onClick={handleDelete} className="delete-button" title="Delete Selected">
          <FaTrash /> Delete Selected
        </button>
      )}
    </div>
  );
};

// Define prop types for better type checking
ControlPanel.propTypes = {
  executeFlowchart: PropTypes.func.isRequired,
  resetExecution: PropTypes.func.isRequired,
  // togglePause: PropTypes.func.isRequired,
  setSpeedMultiplier: PropTypes.func.isRequired,
  // paused: PropTypes.bool.isRequired,
  selectedNodes: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedEdges: PropTypes.arrayOf(PropTypes.string).isRequired,
  setNodes: PropTypes.func.isRequired,
  setEdges: PropTypes.func.isRequired,
};

export default ControlPanel;