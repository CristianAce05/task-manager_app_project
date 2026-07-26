import axios from 'axios'

// In local dev, VITE_API_URL is unset and requests stay relative, so Vite's
// dev proxy (see vite.config.js) forwards them to the backend. In production
// the frontend and backend are deployed separately, so this needs to point
// at the deployed backend's URL.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
})

export default api
