import { createContext, useContext } from 'react';

export const ActiveFlowContext = createContext({
  activeBlockId: null,
  activeEdgeId: null,
  onReplace: () => {},
});

export const useActiveFlow = () => useContext(ActiveFlowContext);