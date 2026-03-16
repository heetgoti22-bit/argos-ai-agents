import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
});

export const api = {
  health: () => API.get('/health'),
  // Repos
  getRepos: () => API.get('/api/v1/repos'),
  connectGithub: (url) => API.post('/api/v1/repos/github', null, { params: { url } }),
  // Agents
  getAgents: () => API.get('/api/v1/agents'),
  runAgent: (id, repoId) => API.post(`/api/v1/agents/${id}/run`, { repo_id: repoId }),
  // Pipelines
  getPipelines: () => API.get('/api/v1/pipelines'),
  createPipeline: (data) => API.post('/api/v1/pipelines', data),
  runPipeline: (id, repoId) => API.post(`/api/v1/pipelines/${id}/run`, null, { params: { repo_id: repoId } }),
  deletePipeline: (id) => API.delete(`/api/v1/pipelines/${id}`),
  // RAG
  queryRAG: (question, repoId) => API.post('/api/v1/query', { question, repo_id: repoId }),
  // Security
  getCredentials: () => API.get('/api/v1/security/credentials'),
  getAudit: () => API.get('/api/v1/security/audit'),
  rotateKeys: () => API.post('/api/v1/security/rotate'),
};

export default api;
