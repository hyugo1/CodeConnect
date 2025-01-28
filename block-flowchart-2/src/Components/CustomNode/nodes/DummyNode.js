// src/Components/CustomNode/nodes/DummyNode.js

import React from 'react';
import { Handle, Position } from 'reactflow';
import { FaRegSquare } from 'react-icons/fa';
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

const DummyNode = ({ id, data, selected }) => {
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
        backgroundColor: '#e0e0e0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      className={selected ? 'selected' : ''}
    >
      <FaRegSquare style={{ marginBottom: 5 }} />
      <div>{data.label}</div>
      <Handle
        type="target"
        position={Position.Top}
        id={`target-${id}`}
        className="handle-target-circle"
        style={{ left: '50%', top: '0px', ...handleStyle }}
        data-tooltip-id={`tooltip-${id}-target`}
        data-tooltip-content="Connect from another node"
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id={`source-${id}`}
        className="handle-source-square"
        style={{ left: '50%', top: '90%', ...handleStyle }}
        isConnectable={true}
      />
      <div style={DownLineStyle}></div>
    </div>
  );
};

export default DummyNode;