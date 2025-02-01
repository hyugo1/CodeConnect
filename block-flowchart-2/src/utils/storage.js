// src/utils/storage.js

/**
 * Serializes nodes by excluding internal React Flow properties.
 * @param {Array} nodes - The nodes to serialize.
 * @returns {Array} - The serialized nodes.
 */
const serializeNodes = (nodes) => {
  return nodes.map(({ id, type, position, data }) => ({
    id,
    type,
    position,
    data,
  }));
};

/**
 * Serializes edges by excluding internal React Flow properties.
 * @param {Array} edges - The edges to serialize.
 * @returns {Array} - The serialized edges.
 */
const serializeEdges = (edges) => {
  return edges.map(({ id, source, target, sourceHandle, targetHandle, type, animated, markerEnd, style, label }) => ({
    id,
    source,
    target,
    sourceHandle,
    targetHandle,
    type,
    animated,
    markerEnd,
    style,
    label,
  }));
};

/**
 * Deserializes nodes by ensuring they have the necessary properties.
 * @param {Array} serializedNodes - The serialized nodes.
 * @returns {Array} - The deserialized nodes.
 */
const deserializeNodes = (serializedNodes) => {
  return serializedNodes.map((node) => ({
    ...node,
  }));
};

/**
 * Deserializes edges by ensuring they have all necessary properties, including sourceHandle.
 * @param {Array} serializedEdges - The serialized edges.
 * @returns {Array} - The deserialized edges.
 */
const deserializeEdges = (serializedEdges) => {
  return serializedEdges.map((edge) => ({
    ...edge,
  }));
};

/**
 * Saves a flowchart to localStorage.
 * @param {string} projectName - The name of the project.
 * @param {Array} nodes - The nodes of the flowchart.
 * @param {Array} edges - The edges of the flowchart.
 */
export const saveFlowchart = (projectName, nodes, edges) => {
  if (!projectName) {
    throw new Error('Project name is required to save a flowchart.');
  }

  if (nodes.length === 0 && edges.length === 0) {
    throw new Error('Cannot save an empty flowchart.');
  }

  const sanitizedProjectName = projectName.trim().replace(/[^a-zA-Z0-9_-]/g, '_');

  const flowchartData = {
    nodes: serializeNodes(nodes),
    edges: serializeEdges(edges),
    savedAt: new Date().toISOString(),
  };

  try {
    const serializedData = JSON.stringify(flowchartData);
    console.log(`Saving flowchart "${sanitizedProjectName}" with data:`, serializedData);
    localStorage.setItem(`flowchart_${sanitizedProjectName}`, serializedData);
  } catch (error) {
    console.error('Failed to serialize flowchart data:', error);
    throw new Error('Failed to save the flowchart. Data serialization error.');
  }
};

/**
 * Loads a flowchart from localStorage.
 * @param {string} projectName - The name of the project to load.
 * @returns {Object|null} - Returns an object containing nodes and edges, or null if not found.
 */
export const loadFlowchart = (projectName) => {
  if (!projectName) {
    throw new Error('Project name is required to load a flowchart.');
  }

  const sanitizedProjectName = projectName.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  console.log(`Sanitized project name for loading: "${sanitizedProjectName}"`);

  const key = `flowchart_${sanitizedProjectName}`;
  console.log(`Attempting to retrieve localStorage key: "${key}"`);

  const flowchartJSON = localStorage.getItem(key);
  if (!flowchartJSON) {
    console.warn(`No flowchart found with name "${sanitizedProjectName}".`);
    return null;
  }

  try {
    const flowchartData = JSON.parse(flowchartJSON);
    console.log(`Loaded flowchart "${sanitizedProjectName}":`, flowchartData);
    if (!flowchartData.nodes || !flowchartData.edges) {
      console.warn(`Flowchart "${sanitizedProjectName}" is missing nodes or edges.`);
      return null;
    }
    return {
      nodes: deserializeNodes(flowchartData.nodes) || [],
      edges: deserializeEdges(flowchartData.edges) || [],
    };
  } catch (error) {
    console.error('Error parsing flowchart JSON:', error);
    return null;
  }
};

/**
 * Retrieves a list of saved project names from localStorage.
 * @returns {Array<string>} - An array of project names.
 */
export const getSavedProjects = () => {
  const projects = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('flowchart_')) {
      const projectName = key.replace('flowchart_', '');
      projects.push(projectName);
      console.log(`Found project: "${projectName}"`);
    }
  }
  console.log('Retrieved saved projects:', projects);
  return projects;
};

/**
 * Deletes a saved flowchart from localStorage.
 * @param {string} projectName - The name of the project to delete.
 */
export const deleteProject = (projectName) => {
  if (!projectName) {
    throw new Error('Project name is required to delete a flowchart.');
  }

  const sanitizedProjectName = projectName.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  console.log(`Deleting flowchart "${sanitizedProjectName}".`);
  localStorage.removeItem(`flowchart_${sanitizedProjectName}`);
};