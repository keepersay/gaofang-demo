<template>
  <div class="placeholder-page">
    <el-card class="placeholder-card">
      <div class="placeholder-content">
        <div class="placeholder-icon">
          <el-icon :size="48" color="#909399"><Tools /></el-icon>
        </div>
        <h2>{{ title || '功能开发中' }}</h2>
        <p>该功能正在开发中，敬请期待...</p>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Tools } from '@element-plus/icons-vue'

const route = useRoute()

// 根据路由名称获取页面标题
const title = computed(() => {
  const routeName = route.name
  const titleMap = {
    'ADS': 'ADS管理',
    'SLB': 'SLB管理',
    'WAF': 'WAF管理',
    'WAFCC': 'WAF-CC管理',
    'Blackhole': '黑洞管理',
    'TrafficAnalysis': '流量分析',
    'DNS': 'DNS管理',
    'BusinessInstance': '业务实例',
    'Order': '订单管理'
  }
  return titleMap[routeName] || route.meta?.title || '功能开发中'
})
</script>

<style scoped>
.placeholder-page {
  padding: 0;
  margin: 0;
  background: #f5f6fa;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.placeholder-card {
  width: 100%;
  max-width: 600px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  margin: 0;
}

.placeholder-content {
  padding: 40px 20px;
  text-align: center;
}

.placeholder-icon {
  margin-bottom: 20px;
}

h2 {
  font-size: 24px;
  color: #303133;
  margin-bottom: 16px;
  font-weight: 500;
}

p {
  font-size: 16px;
  color: #909399;
  margin: 0;
}
</style> 