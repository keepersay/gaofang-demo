import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  base: process.env.NODE_ENV === 'production' ? '/gaofang-demo/' : '/',
  optimizeDeps: {
    force: true // 强制重新构建优化的依赖
  },
  server: {
    hmr: true // 确保热更新正常工作
  }
}) 