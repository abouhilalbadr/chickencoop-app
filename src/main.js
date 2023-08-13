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
    window.location.href = '/';
    localStorage.removeItem('user')
  });

createApp(App)
  .use(pinia)
  .use(router)
  .mount('#app')