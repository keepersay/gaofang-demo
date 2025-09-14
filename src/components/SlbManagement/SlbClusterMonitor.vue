<template>
  <div class="cluster-monitor-container">
    <el-tabs 
      v-model="activeTab" 
      tab-position="left" 
      class="cluster-monitor-tabs"
    >
      <el-tab-pane label="主机监控" name="hostMonitor">
        <HostMonitor />
      </el-tab-pane>
      
      <el-tab-pane label="业务监控" name="businessMonitor">
        <BusinessMonitor />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import HostMonitor from './ClusterMonitor/HostMonitor.vue'
import BusinessMonitor from './ClusterMonitor/BusinessMonitor.vue'

const activeTab = ref('hostMonitor')
</script>

<style scoped>
.cluster-monitor-container {
  height: calc(100vh - 200px);
  padding: 16px 16px 16px 0;
}

.cluster-monitor-tabs {
  height: 100%;
  
  :deep(.el-tabs__nav-wrap) {
    width: 80px;
    border-right: 1px solid #e4e7ed;
  }
  
  :deep(.el-tabs__item) {
    text-align: center;
    padding: 10px 8px;
    font-size: 13px;
    font-weight: 500;
    color: #606266;
    
    &.is-active {
      color: #409eff;
      background-color: #f0f9ff;
    }
  }
  
  :deep(.el-tabs__content) {
    padding-left: 2px;
    height: 100%;
    overflow-y: auto;
  }
}
</style>
