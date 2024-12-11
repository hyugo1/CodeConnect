// // src/Context/ConnectionContext.js

// import React, { createContext, useState } from 'react';

// export const ConnectionContext = createContext();

// export const ConnectionProvider = ({ children }) => {
//   const [connectingNodeId, setConnectingNodeId] = useState(null);

//   // Derive isConnecting based on connectingNodeId
//   const isConnecting = connectingNodeId !== null;

//   return (
//     <ConnectionContext.Provider value={{ connectingNodeId, setConnectingNodeId, isConnecting }}>
//       {children}
//     </ConnectionContext.Provider>
//   );
// };