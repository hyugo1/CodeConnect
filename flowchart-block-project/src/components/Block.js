import React, { useState, useRef, useEffect } from "react";
import { useDrag } from "react-dnd";

const Block = ({ block, index, blocks, setBlocks, onConnect }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "block",
    item: { id: block.id, type: block.type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const blockRef = useRef(null);

  // Combine drag ref and blockRef using a callback function
  const dragRef = drag(blockRef);

  useEffect(() => {
    if (blockRef.current) {
      const rect = blockRef.current.getBoundingClientRect();
      const updatedBlocks = [...blocks];
      updatedBlocks[index] = { ...block, x: rect.left, y: rect.top };
      setBlocks(updatedBlocks);
    }
  }, [isDragging]);

  const handleConnection = () => {
    if (!isConnected && index < blocks.length - 1) {
      onConnect(block.id, blocks[index + 1].id);
      setIsConnected(true);
    }
  };

  return (
    <div
      ref={dragRef} // Combined drag and blockRef here
      className="block"
      style={{ opacity: isDragging ? 0.5 : 1 }}
      onClick={handleConnection}
    >
      {block.type.charAt(0).toUpperCase() + block.type.slice(1)}
      <div className="arrow-down">↓</div>
    </div>
  );
};

export default Block;