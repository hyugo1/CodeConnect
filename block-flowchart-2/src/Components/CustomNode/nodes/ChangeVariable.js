// src/Components/CustomNode/nodes/ChangeVariable.js

import React from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { FaPlusCircle } from 'react-icons/fa';
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
const inputStyle = {
  width: '100%',
  marginTop: 10,
  padding: '5px',
  borderRadius: '3px',
  border: '1px solid #ccc',
  fontSize: '12px',
  boxSizing: 'border-box',
};

const ChangeVariable = ({ id, data, selected }) => {
  const { setNodes } = useReactFlow();

  const handleVarNameChange = (e) => {
    const newVarName = e.target.value;
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              varName: newVarName,
            },
          };
        }
        return node;
      })
    );
  };

  const handleVarValueChange = (e) => {
    const newVarValue = e.target.value;
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              varValue: newVarValue,
            },
          };
        }
        return node;
      })
    );
  };

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
        backgroundColor: '#e0ffe0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      className={selected ? 'selected' : ''}
    >
      <FaPlusCircle style={{ marginBottom: 5 }} />
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
        style={{ left: '50%', top: '95%', ...handleStyle }}
        data-tooltip-id={`tooltip-${id}-source`}
        data-tooltip-content="Connect to another node"
        isConnectable={true}
      />
      <Tooltip id={`tooltip-${id}-target`} place="top" />
      <Tooltip id={`tooltip-${id}-source`} place="top" />
      <input
        type="text"
        placeholder="Variable Name"
        value={data.varName || ''}
        onChange={handleVarNameChange}
        style={inputStyle}
      />
      <input
        type="number"
        placeholder="Change Value"
        value={data.varValue || ''}
        onChange={handleVarValueChange}
        style={inputStyle}
      />
      <div style={DownLineStyle}></div>
    </div>
  );
};

export default ChangeVariable;