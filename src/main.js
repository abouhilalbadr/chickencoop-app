import { createApp } from "vue";
import { createPinia } from 'pinia'
import axios from "axios";

import "./styles.css";
import App from "./App.vue";
import router from "./router";

const pinia = createPinia()

axios.defaults.baseURL = 'https://caisseapi.chicken-coop.cyou/api/v1'

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