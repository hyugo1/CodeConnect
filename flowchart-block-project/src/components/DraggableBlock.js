import React from 'react';
import { useDrag } from 'react-dnd';

const DraggableBlock = ({ id, type, name }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type,
    item: { id, type, name },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        padding: '10px',
        margin: '5px',
        backgroundColor: '#ccc',
        border: '1px solid #999',
        cursor: 'move',
      }}
    >
      {name}
      <div style={{ fontSize: '20px', marginTop: '10px' }}>↓</div> {/* Arrow symbol */}
    </div>
  );
};

export default DraggableBlock;


// const DraggableBlock = ({ id, type, name, blockType }) => {
//   const [{ isDragging }, drag] = useDrag(() => ({
//     type,
//     item: { id, type, name, blockType },
//     collect: (monitor) => ({
//       isDragging: monitor.isDragging(),
//     }),
//   }));

//   return (
//     <div
//       ref={drag}
//       style={{
//         opacity: isDragging ? 0.5 : 1,
//         padding: '10px',
//         margin: '5px',
//         backgroundColor: '#ccc',
//         border: '1px solid #999',
//         cursor: 'move',
//       }}
//     >
//       {name}
//       <div style={{ fontSize: '20px', marginTop: '10px' }}>↓</div>
//     </div>
//   );
// };

// export default DraggableBlock;