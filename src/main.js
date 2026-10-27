import { createApp } from 'vue'
import './index.css'
import '@platform-ui/highrise/dist/style.css'
import App from './App.vue'
import router from './router.js'
import Highrise from '@platform-ui/highrise'

createApp(App).use(router).use(Highrise).mount('#root')
