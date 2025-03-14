// src/utils/storage.js

/**
 * Serializes blocks by excluding internal React Flow properties.
 * @param {Array} blocks - The blocks to serialize.
 * @returns {Array} - The serialized blocks.
 */
const serializeNodes = (blocks) => {
  return blocks.map(({ id, type, position, data }) => ({
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
  return edges.map(
    ({
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
    }) => ({
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
    })
  );
};

/**
 * Deserializes blocks.
 * @param {Array} serializedNodes - The serialized blocks.
 * @returns {Array} - The deserialized blocks.
 */
const deserializeNodes = (serializedNodes) => {
  return serializedNodes.map((block) => ({
    ...block,
  }));
};

/**
 * Deserializes edges.
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
 * @param {Array} blocks - The blocks of the flowchart.
 * @param {Array} edges - The edges of the flowchart.
 */
export const saveFlowchart = (projectName, blocks, edges) => {
  if (!projectName) {
    throw new Error('Project name is required to save a flowchart.');
  }

  if (blocks.length === 0 && edges.length === 0) {
    throw new Error('Cannot save an empty flowchart.');
  }

  const sanitizedProjectName = projectName.trim().replace(/[^a-zA-Z0-9_-]/g, '_');

  const flowchartData = {
    blocks: serializeNodes(blocks),
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
 * @returns {Object|null} - Returns an object containing blocks and edges, or null if not found.
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
    if (!flowchartData.blocks || !flowchartData.edges) {
      console.warn(`Flowchart "${sanitizedProjectName}" is missing blocks or edges.`);
      return null;
    }
    return {
      blocks: deserializeNodes(flowchartData.blocks) || [],
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

/**
 * Exports the flowchart data as a JSON string.
 * @param {Array} blocks - The blocks of the flowchart.
 * @param {Array} edges - The edges of the flowchart.
 * @returns {string} - A pretty-printed JSON string.
 */
export const exportFlowchart = (blocks, edges) => {
  const flowchartData = {
    blocks: serializeNodes(blocks),
    edges: serializeEdges(edges),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(flowchartData, null, 2);
};

/**
 * Imports flowchart data from a JSON string.
 * @param {string} jsonData - The JSON string containing the flowchart data.
 * @returns {Object} - An object with blocks and edges arrays.
 * @throws {Error} - If the JSON is invalid.
 */
export const importFlowchart = (jsonData) => {
  try {
    const flowchartData = JSON.parse(jsonData);
    if (!flowchartData.blocks || !flowchartData.edges) {
      throw new Error('Invalid flowchart data: missing blocks or edges.');
    }
    return {
      blocks: deserializeNodes(flowchartData.blocks) || [],
      edges: deserializeEdges(flowchartData.edges) || [],
    };
  } catch (error) {
    throw new Error('Invalid JSON data.');
  }
};