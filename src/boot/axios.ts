import axios from 'axios'

const api = axios.create({
  baseURL: 'https://medialert-backend-1q8e.onrender.com'
})

export default api
