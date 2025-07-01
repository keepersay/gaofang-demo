import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router'

// 导入Mock数据
import './mock/businessInstance.js'
import './mock/protectionObject.js'

const app = createApp(App)
app.use(ElementPlus)
app.use(router)
app.mount('#app') 