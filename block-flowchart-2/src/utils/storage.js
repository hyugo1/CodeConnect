// src/utils/storage.js

export const saveFlowchart = (projectName, nodes, edges) => {
    const flowchartData = {
      nodes,
      edges,
    };
    localStorage.setItem(`flowchart_${projectName}`, JSON.stringify(flowchartData));
    alert(`Project "${projectName}" has been saved.`);
  };
  
  export const loadFlowchart = (projectName) => {
    const savedData = localStorage.getItem(`flowchart_${projectName}`);
    if (savedData) {
      const { nodes: savedNodes, edges: savedEdges } = JSON.parse(savedData);
      return { nodes: savedNodes, edges: savedEdges };
    } else {
      alert(`Project "${projectName}" does not exist.`);
      return null;
    }
  };
  
  export const getSavedProjects = () => {
    const keys = Object.keys(localStorage);
    return keys
      .filter((key) => key.startsWith('flowchart_'))
      .map((key) => key.replace('flowchart_', ''));
  };
  
  export const deleteProject = (projectName) => {
    localStorage.removeItem(`flowchart_${projectName}`);
    alert(`Project "${projectName}" has been deleted.`);
  };