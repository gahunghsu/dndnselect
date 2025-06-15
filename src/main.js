import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import VueDragSelect from "@coleqiu/vue-drag-select";

const app = createApp(App);
app.use(VueDragSelect);
app.mount('#app');
