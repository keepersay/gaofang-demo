<template>
  <div class="business-monitor-content">
    <!-- 手风琴折叠面板 -->
    <el-collapse v-model="activeNames" accordion>
      <!-- 实例监控指标面板 -->
      <el-collapse-item title="实例监控指标" name="instance-metrics">
        <template #title>
          <div class="collapse-title">
            <el-icon><TrendCharts /></el-icon>
            <span>实例监控指标</span>
          </div>
        </template>
        <div class="panel-content">
          <el-empty description="实例监控指标功能开发中" />
        </div>
      </el-collapse-item>

      <!-- SNAT监控指标面板 -->
      <el-collapse-item title="SNAT监控指标" name="snat-metrics">
        <template #title>
          <div class="collapse-title">
            <el-icon><Share /></el-icon>
            <span>SNAT监控指标</span>
          </div>
        </template>
        <div class="panel-content">
          <el-empty description="SNAT监控指标功能开发中" />
        </div>
      </el-collapse-item>

      <!-- QOS监控指标面板 -->
      <el-collapse-item title="QOS监控指标" name="qos-metrics">
        <template #title>
          <div class="collapse-title">
            <el-icon><Timer /></el-icon>
            <span>QOS监控指标</span>
          </div>
        </template>
        <div class="panel-content">
          <el-empty description="QOS监控指标功能开发中" />
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { TrendCharts, Share, Timer } from '@element-plus/icons-vue'

// 手风琴激活的面板名称，默认展开第一个
const activeNames = ref('instance-metrics')
</script>

<style scoped>
.business-monitor-content {
  height: 100%;
  padding: 20px 20px 20px 2px;
  overflow: visible;
}

.el-collapse {
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  background: #fff;
}

.collapse-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  line-height: 1.2;
  
  .el-icon {
    font-size: 16px;
    color: #409eff;
  }
}

.panel-content {
  padding: 20px;
  min-height: 200px;
  background: #fafafa;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 自定义折叠面板样式 */
:deep(.el-collapse-item__header) {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 8px 20px;
  font-weight: 500;
  line-height: 1.2;
  min-height: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;
}

:deep(.el-collapse-item__header:hover) {
  background: #e9ecef;
}

:deep(.el-collapse-item__content) {
  padding: 16px;
  background: #fff;
  max-height: 80vh;
  overflow-y: auto;
}

:deep(.el-collapse-item__wrap) {
  border-bottom: none;
}

/* 手风琴激活状态 */
:deep(.el-collapse-item.is-active .el-collapse-item__header) {
  background: #409eff;
  color: #fff;
}

:deep(.el-collapse-item.is-active .collapse-title .el-icon) {
  color: #fff;
}

/* 确保箭头图标显示 */
:deep(.el-collapse-item__arrow) {
  flex-shrink: 0;
  margin-left: auto;
  color: #606266;
  transition: transform 0.3s ease;
}

:deep(.el-collapse-item.is-active .el-collapse-item__arrow) {
  color: #fff;
  transform: rotate(90deg);
}
</style>
