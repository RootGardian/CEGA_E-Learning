import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

axios.defaults.baseURL = apiBaseUrl;
axios.defaults.withCredentials = true;
