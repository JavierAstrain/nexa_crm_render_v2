import axios from 'axios';
const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000' });
export function setToken(t){ api.defaults.headers.common['Authorization'] = t ? `Bearer ${t}` : undefined; }
export default api;
