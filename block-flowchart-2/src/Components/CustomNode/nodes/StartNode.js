// src/Components/CustomNode/nodes/StartNode.js

import React from 'react';
import { Handle, Position } from 'reactflow';
import { FaPlay } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import './node.css';

const handleStyle = { background: '#555' };
const DownLineStyle = {
  // position: 'absolute',
  // width: 3,
  // backgroundColor: '#555',
  // top: '100%',
  // left: '50%',
  // height: 50,
  // transform: 'translateX(-50%)',
  // zIndex: -1,
};

const StartNode = ({ id, data, selected }) => {
  return (
    <div
      style={{
        padding: 10,
        border: '2px solid #777',
        borderRadius: 5,
        position: 'relative',
        minWidth: 180,
        textAlign: 'center',
        fontWeight: 'bold',
        backgroundColor: '#d3f9d8',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      className={`end-node ${selected ? 'selected' : ''}`}
    >
      <FaPlay style={{ marginBottom: 5 }} />
      <div>{data.label}</div>
      <Handle
        type="source"
        position={Position.Bottom}
        id={`source-${id}`}
        className="handle-source-square"
        style={{ left: '50%', top: '90%', ...handleStyle }}
        data-tooltip-id={`tooltip-${id}-source`}
        data-tooltip-content="Connect to another node"
        isConnectable={true}
      />
      <Tooltip id={`tooltip-${id}-source`} place="top" />
      <div style={DownLineStyle}></div>
    </div>
  );
};

export default StartNode;