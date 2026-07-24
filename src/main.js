import { createApp } from "vue";
import { createPinia } from 'pinia'
import axios from "axios";

import "./styles.css";
import App from "./App.vue";
import router from "./router";

const pinia = createPinia()

const baseUrl = window.navigator.onLine ? import.meta.env.VITE_API_URL : import.meta.env.VITE_API_URL_OFFLINE

axios.defaults.baseURL = baseUrl + '/api/v1'

axios.interceptors.response.use(
  response => response,
  error => {
    // Only force re-login on a genuine auth failure (expired/invalid token).
    // Other errors (400 validation, 403, 500, network blips) must NOT wipe the session.
    if (error?.response?.status === 401) {
      localStorage.removeItem('user')
      window.location.hash = '#/'
    }
    return Promise.reject(error)
  });

createApp(App)
  .use(pinia)
  .use(router)
  .mount('#app')