<template>
  <div class="host-monitor-content">
    <!-- 手风琴折叠面板 -->
    <el-collapse v-model="activeNames" accordion>
      <!-- CPU/内存/磁盘面板 -->
      <el-collapse-item title="CPU/内存/磁盘" name="cpu-memory-disk">
        <template #title>
          <div class="collapse-title">
            <el-icon><Monitor /></el-icon>
            <span>CPU/内存/磁盘</span>
          </div>
        </template>
        
        <!-- 搜索控制表单 -->
        <el-form :inline="true" size="small" :model="cpuSearchForm" class="cpu-inline-form">
          <el-form-item>
            <el-select 
              v-model="cpuSearchForm.hostIp" 
              placeholder="选择主机"
              style="width: 140px;"
              clearable
            >
              <el-option
                v-for="host in hostOptions"
                :key="host.value"
                :label="host.label"
                :value="host.value"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-select 
              v-model="cpuSearchForm.statisticType" 
              placeholder="统计方式"
              style="width: 100px;"
            >
              <el-option
                v-for="stat in statisticOptions"
                :key="stat.value"
                :label="stat.label"
                :value="stat.value"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-date-picker
              v-model="cpuSearchForm.startTime"
              type="datetime"
              placeholder="开始时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 160px;"
            />
          </el-form-item>
          
          <el-form-item>
            <el-date-picker
              v-model="cpuSearchForm.endTime"
              type="datetime"
              placeholder="结束时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 160px;"
            />
          </el-form-item>
          
          <el-form-item>
            <el-checkbox v-model="cpuSearchForm.autoRefresh">
              自动刷新
            </el-checkbox>
          </el-form-item>
          
          <el-form-item>
            <el-select 
              v-model="cpuSearchForm.refreshInterval" 
              :disabled="!cpuSearchForm.autoRefresh"
              style="width: 80px;"
            >
              <el-option
                v-for="refresh in refreshOptions"
                :key="refresh.value"
                :label="refresh.label"
                :value="refresh.value"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="handleCpuSearch" :loading="cpuLoading">
              查询
            </el-button>
          </el-form-item>
        </el-form>
        
        <!-- 主机CPU信息 -->
        <div class="cpu-chart-simple">
          <div class="cpu-chart-title">
            <h4>主机CPU信息</h4>
          </div>
          <el-empty description="CPU监控图表功能开发中" class="cpu-chart-empty" />
        </div>
        
        <!-- 主机内存统计 -->
        <div class="cpu-chart-simple">
          <div class="cpu-chart-title">
            <h4>主机内存统计</h4>
          </div>
          <el-empty description="内存监控图表功能开发中" class="cpu-chart-empty" />
        </div>
        
        <!-- 主机磁盘统计 -->
        <div class="cpu-chart-simple">
          <div class="cpu-chart-title">
            <h4>主机磁盘统计</h4>
          </div>
          <el-empty description="磁盘监控图表功能开发中" class="cpu-chart-empty" />
        </div>
      </el-collapse-item>

      <!-- Linux网卡面板 -->
      <el-collapse-item title="Linux网卡" name="linux-network">
        <template #title>
          <div class="collapse-title">
            <el-icon><Connection /></el-icon>
            <span>Linux网卡</span>
          </div>
        </template>
        <div class="panel-content">
          <el-empty description="Linux网卡监控功能开发中" />
        </div>
      </el-collapse-item>

      <!-- DPVS网卡面板 -->
      <el-collapse-item title="DPVS网卡" name="dpvs-network">
        <template #title>
          <div class="collapse-title">
            <el-icon><Switch /></el-icon>
            <span>DPVS网卡</span>
          </div>
        </template>
        <div class="panel-content">
          <el-empty description="DPVS网卡监控功能开发中" />
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, onUnmounted } from 'vue'
import { Monitor, Connection, Switch } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 手风琴激活的面板名称，默认展开第一个
const activeNames = ref('cpu-memory-disk')

// CPU/内存/磁盘搜索表单
const cpuSearchForm = reactive({
  hostIp: '',
  statisticType: 'avg',
  startTime: '',
  endTime: '',
  autoRefresh: false,
  refreshInterval: 15
})

const cpuLoading = ref(false)
let refreshTimer = null

// 主机选项列表
const hostOptions = ref([
  { label: '192.168.145.11', value: '192.168.145.11' },
  { label: '192.168.145.12', value: '192.168.145.12' },
  { label: '192.168.145.13', value: '192.168.145.13' }
])

// 统计方式选项
const statisticOptions = [
  { label: '平均值', value: 'avg' },
  { label: '最大值', value: 'max' },
  { label: '最小值', value: 'min' }
]

// 刷新周期选项
const refreshOptions = [
  { label: '15秒', value: 15 },
  { label: '30秒', value: 30 },
  { label: '1分钟', value: 60 },
  { label: '3分钟', value: 180 }
]

// 查询处理
const handleCpuSearch = () => {
  console.log('CPU监控查询:', cpuSearchForm)
  cpuLoading.value = true
  
  setTimeout(() => {
    cpuLoading.value = false
    ElMessage.success('CPU/内存/磁盘监控数据查询完成')
  }, 1000)
}

// 监听自动刷新状态变化
watch(() => cpuSearchForm.autoRefresh, (newVal) => {
  if (newVal) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
})

// 监听刷新周期变化
watch(() => cpuSearchForm.refreshInterval, () => {
  if (cpuSearchForm.autoRefresh) {
    stopAutoRefresh()
    startAutoRefresh()
  }
})

// 开始自动刷新
const startAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
  refreshTimer = setInterval(() => {
    handleCpuSearch()
  }, cpuSearchForm.refreshInterval * 1000)
}

// 停止自动刷新
const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

// 组件挂载时初始化
onMounted(() => {
  // 设置默认主机
  if (hostOptions.value.length > 0) {
    cpuSearchForm.hostIp = hostOptions.value[0].value
  }
})

// 组件卸载时清理定时器
onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
.host-monitor-content {
  height: 100%;
  padding: 20px 20px 20px 2px;
  overflow: visible;
}

.el-collapse {
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  background: #fff;
  width: 100%;
  box-sizing: border-box;
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

/* CPU/内存/磁盘面板直接样式 */
.cpu-inline-form {
  background: #f8f9fa;
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 20px;
  border: 1px solid #e9ecef;
  
  .el-form-item {
    margin-bottom: 0;
    margin-right: 16px;
  }
  
  .el-form-item:last-child {
    margin-right: 0;
  }
}

.cpu-chart-simple {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.cpu-chart-title {
  padding: 12px 20px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
  
  h4 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #303133;
  }
}

.cpu-chart-empty {
  padding: 20px;
  height: 300px;
  
  :deep(.el-empty__image) {
    width: 80px;
    height: 80px;
  }
  
  :deep(.el-empty__description) {
    font-size: 14px;
    color: #909399;
  }
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
