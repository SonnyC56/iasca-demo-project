import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createConvex } from './lib/convex'

const app = createApp(App)

app.use(router)
app.use(createConvex())

app.mount('#app')
