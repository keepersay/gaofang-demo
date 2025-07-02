<template>
  <div class="protection-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>防护对象管理</span>
        </div>
      </template>
      
      <el-tabs v-model="activeTab" @tab-click="handleTabClick" type="border-card">
        <el-tab-pane label="IP防护对象" name="ip">
          <router-view v-if="activeTab === 'ip'" />
        </el-tab-pane>
        <el-tab-pane label="域名防护对象" name="domain">
          <router-view v-if="activeTab === 'domain'" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const activeTab = ref('ip')

// 监听路由变化，更新当前激活的标签页
watch(() => route.path, (path) => {
  if (path.includes('/protection/domain')) {
    activeTab.value = 'domain'
  } else {
    activeTab.value = 'ip'
  }
}, { immediate: true })

// 处理标签页点击事件
const handleTabClick = (tab) => {
  router.push(`/business/protection/${tab.props.name}`)
}
</script>

<style scoped>
.protection-container {
  padding: 20px;
  background: #f5f6fa;
  min-height: calc(100vh - 120px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.el-tabs__content) {
  padding: 20px;
  background-color: #fff;
}
</style> 