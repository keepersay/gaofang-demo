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
        
        <!-- 搜索控制表单 -->
        <el-form :inline="true" size="small" :model="instanceSearchForm" class="instance-inline-form">
          <el-form-item>
            <el-select 
              v-model="instanceSearchForm.hostIp" 
              placeholder="主机"
              style="width: 120px;"
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
              v-model="instanceSearchForm.instanceIp" 
              placeholder="实例"
              style="width: 120px;"
              clearable
            >
              <el-option
                v-for="instance in instanceOptions"
                :key="instance.value"
                :label="instance.label"
                :value="instance.value"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-select 
              v-model="instanceSearchForm.listener" 
              placeholder="监听"
              style="width: 100px;"
              :disabled="instanceSearchForm.instanceIp === 'ALL'"
              clearable
            >
              <el-option
                v-for="listener in listenerOptions"
                :key="listener.value"
                :label="listener.label"
                :value="listener.value"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-select 
              v-model="instanceSearchForm.backendHost" 
              placeholder="后端主机"
              style="width: 120px;"
              :disabled="instanceSearchForm.instanceIp === 'ALL'"
              clearable
            >
              <el-option
                v-for="backend in backendHostOptions"
                :key="backend.value"
                :label="backend.label"
                :value="backend.value"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-select 
              v-model="instanceSearchForm.statisticType" 
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
              v-model="instanceSearchForm.startTime"
              type="datetime"
              placeholder="开始时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 160px;"
            />
          </el-form-item>
          
          <el-form-item>
            <el-date-picker
              v-model="instanceSearchForm.endTime"
              type="datetime"
              placeholder="结束时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 160px;"
            />
          </el-form-item>
          
          <el-form-item>
            <el-checkbox v-model="instanceSearchForm.autoRefresh">
              自动刷新
            </el-checkbox>
          </el-form-item>
          
          <el-form-item>
            <el-select 
              v-model="instanceSearchForm.refreshInterval" 
              :disabled="!instanceSearchForm.autoRefresh"
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
            <el-button type="primary" @click="handleInstanceSearch" :loading="instanceLoading">
              查询
            </el-button>
          </el-form-item>
        </el-form>
        
        <!-- 每秒新建连接数 -->
        <div class="instance-chart-simple">
          <div class="instance-chart-title">
            <h4>每秒新建连接数</h4>
          </div>
          <el-empty description="每秒新建连接数监控图表功能开发中" class="instance-chart-empty" />
        </div>
        
        <!-- 并发连接数 -->
        <div class="instance-chart-simple">
          <div class="instance-chart-title">
            <h4>并发连接数</h4>
          </div>
          <el-empty description="并发连接数监控图表功能开发中" class="instance-chart-empty" />
        </div>
        
        <!-- 带宽 -->
        <div class="instance-chart-simple">
          <div class="instance-chart-title">
            <h4>带宽</h4>
          </div>
          <el-empty description="带宽监控图表功能开发中" class="instance-chart-empty" />
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
        
        <!-- 搜索控制表单 -->
        <el-form :inline="true" size="small" :model="snatSearchForm" class="snat-inline-form">
          <el-form-item>
            <el-select 
              v-model="snatSearchForm.hostIp" 
              placeholder="主机"
              style="width: 120px;"
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
              v-model="snatSearchForm.instanceIp" 
              placeholder="实例"
              style="width: 120px;"
              clearable
            >
              <el-option
                v-for="instance in instanceOptions"
                :key="instance.value"
                :label="instance.label"
                :value="instance.value"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-select 
              v-model="snatSearchForm.listener" 
              placeholder="监听"
              style="width: 100px;"
              :disabled="snatSearchForm.instanceIp === 'ALL'"
              clearable
            >
              <el-option
                v-for="listener in snatListenerOptions"
                :key="listener.value"
                :label="listener.label"
                :value="listener.value"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-select 
              v-model="snatSearchForm.backendHost" 
              placeholder="后端主机"
              style="width: 120px;"
              :disabled="snatSearchForm.instanceIp === 'ALL'"
              clearable
            >
              <el-option
                v-for="backend in snatBackendHostOptions"
                :key="backend.value"
                :label="backend.label"
                :value="backend.value"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-select 
              v-model="snatSearchForm.statisticType" 
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
              v-model="snatSearchForm.startTime"
              type="datetime"
              placeholder="开始时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 160px;"
            />
          </el-form-item>
          
          <el-form-item>
            <el-date-picker
              v-model="snatSearchForm.endTime"
              type="datetime"
              placeholder="结束时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 160px;"
            />
          </el-form-item>
          
          <el-form-item>
            <el-checkbox v-model="snatSearchForm.autoRefresh">
              自动刷新
            </el-checkbox>
          </el-form-item>
          
          <el-form-item>
            <el-select 
              v-model="snatSearchForm.refreshInterval" 
              :disabled="!snatSearchForm.autoRefresh"
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
            <el-button type="primary" @click="handleSnatSearch" :loading="snatLoading">
              查询
            </el-button>
          </el-form-item>
        </el-form>
        
        <!-- 每秒新建连接数 -->
        <div class="snat-chart-simple">
          <div class="snat-chart-title">
            <h4>每秒新建连接数</h4>
          </div>
          <el-empty description="每秒新建连接数监控图表功能开发中" class="snat-chart-empty" />
        </div>
        
        <!-- 并发连接数 -->
        <div class="snat-chart-simple">
          <div class="snat-chart-title">
            <h4>并发连接数</h4>
          </div>
          <el-empty description="并发连接数监控图表功能开发中" class="snat-chart-empty" />
        </div>
        
        <!-- 带宽 -->
        <div class="snat-chart-simple">
          <div class="snat-chart-title">
            <h4>带宽</h4>
          </div>
          <el-empty description="带宽监控图表功能开发中" class="snat-chart-empty" />
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
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { TrendCharts, Share, Timer } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 手风琴激活的面板名称，默认展开第一个
const activeNames = ref('instance-metrics')

// 实例监控指标搜索表单
const instanceSearchForm = reactive({
  hostIp: 'ALL',
  instanceIp: 'ALL',
  listener: '',
  backendHost: '',
  statisticType: 'avg',
  startTime: '',
  endTime: '',
  autoRefresh: false,
  refreshInterval: 15
})

const instanceLoading = ref(false)
let instanceRefreshTimer = null

// 主机选项列表
const hostOptions = ref([
  { label: 'ALL', value: 'ALL' },
  { label: '192.168.145.11', value: '192.168.145.11' },
  { label: '192.168.145.12', value: '192.168.145.12' },
  { label: '192.168.145.13', value: '192.168.145.13' }
])

// 实例选项列表
const instanceOptions = ref([
  { label: 'ALL', value: 'ALL' },
  { label: '10.0.0.1', value: '10.0.0.1' },
  { label: '10.0.0.2', value: '10.0.0.2' },
  { label: '10.0.0.3', value: '10.0.0.3' }
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

// 监听选项（依赖实例选择）
const listenerOptions = computed(() => {
  if (instanceSearchForm.instanceIp === 'ALL') return []
  // 模拟根据选中实例返回对应监听列表
  return [
    { label: '8080', value: '8080' },
    { label: '8443', value: '8443' },
    { label: '9090', value: '9090' }
  ]
})

// 后端主机选项（依赖实例和监听选择）
const backendHostOptions = computed(() => {
  if (instanceSearchForm.instanceIp === 'ALL') return []
  // 模拟根据选中实例和监听返回对应后端主机列表
  return [
    { label: '192.168.1.10', value: '192.168.1.10' },
    { label: '192.168.1.11', value: '192.168.1.11' },
    { label: '192.168.1.12', value: '192.168.1.12' }
  ]
})

// 实例监控查询处理
const handleInstanceSearch = () => {
  console.log('实例监控查询:', instanceSearchForm)
  instanceLoading.value = true
  
  setTimeout(() => {
    instanceLoading.value = false
    ElMessage.success('实例监控数据查询完成')
  }, 1000)
}

// 监听实例选择变化
watch(() => instanceSearchForm.instanceIp, (newVal) => {
  if (newVal === 'ALL') {
    // 清空并禁用监听和后端主机选择
    instanceSearchForm.listener = ''
    instanceSearchForm.backendHost = ''
  }
})

// 监听监听选择变化
watch(() => instanceSearchForm.listener, () => {
  // 重新加载后端主机选项时清空当前选择
  instanceSearchForm.backendHost = ''
})

// 实例监控自动刷新监听
watch(() => instanceSearchForm.autoRefresh, (newVal) => {
  if (newVal) {
    startInstanceAutoRefresh()
  } else {
    stopInstanceAutoRefresh()
  }
})

watch(() => instanceSearchForm.refreshInterval, () => {
  if (instanceSearchForm.autoRefresh) {
    stopInstanceAutoRefresh()
    startInstanceAutoRefresh()
  }
})

// 实例监控自动刷新函数
const startInstanceAutoRefresh = () => {
  if (instanceRefreshTimer) {
    clearInterval(instanceRefreshTimer)
  }
  instanceRefreshTimer = setInterval(() => {
    handleInstanceSearch()
  }, instanceSearchForm.refreshInterval * 1000)
}

const stopInstanceAutoRefresh = () => {
  if (instanceRefreshTimer) {
    clearInterval(instanceRefreshTimer)
    instanceRefreshTimer = null
  }
}

// 组件挂载时初始化
onMounted(() => {
  // 设置默认值已在reactive中定义
})

// SNAT监控指标搜索表单
const snatSearchForm = reactive({
  hostIp: 'ALL',
  instanceIp: 'ALL',
  listener: '',
  backendHost: '',
  statisticType: 'avg',
  startTime: '',
  endTime: '',
  autoRefresh: false,
  refreshInterval: 15
})

const snatLoading = ref(false)
let snatRefreshTimer = null

// SNAT监听选项（依赖实例选择）
const snatListenerOptions = computed(() => {
  if (snatSearchForm.instanceIp === 'ALL') return []
  // 模拟根据选中实例返回对应监听列表
  return [
    { label: '8080', value: '8080' },
    { label: '8443', value: '8443' },
    { label: '9090', value: '9090' }
  ]
})

// SNAT后端主机选项（依赖实例和监听选择）
const snatBackendHostOptions = computed(() => {
  if (snatSearchForm.instanceIp === 'ALL') return []
  // 模拟根据选中实例和监听返回对应后端主机列表
  return [
    { label: '192.168.1.10', value: '192.168.1.10' },
    { label: '192.168.1.11', value: '192.168.1.11' },
    { label: '192.168.1.12', value: '192.168.1.12' }
  ]
})

// SNAT监控查询处理
const handleSnatSearch = () => {
  console.log('SNAT监控查询:', snatSearchForm)
  snatLoading.value = true
  
  setTimeout(() => {
    snatLoading.value = false
    ElMessage.success('SNAT监控数据查询完成')
  }, 1000)
}

// 监听SNAT实例选择变化
watch(() => snatSearchForm.instanceIp, (newVal) => {
  if (newVal === 'ALL') {
    // 清空并禁用监听和后端主机选择
    snatSearchForm.listener = ''
    snatSearchForm.backendHost = ''
  }
})

// 监听SNAT监听选择变化
watch(() => snatSearchForm.listener, () => {
  // 重新加载后端主机选项时清空当前选择
  snatSearchForm.backendHost = ''
})

// SNAT监控自动刷新监听
watch(() => snatSearchForm.autoRefresh, (newVal) => {
  if (newVal) {
    startSnatAutoRefresh()
  } else {
    stopSnatAutoRefresh()
  }
})

watch(() => snatSearchForm.refreshInterval, () => {
  if (snatSearchForm.autoRefresh) {
    stopSnatAutoRefresh()
    startSnatAutoRefresh()
  }
})

// SNAT监控自动刷新函数
const startSnatAutoRefresh = () => {
  if (snatRefreshTimer) {
    clearInterval(snatRefreshTimer)
  }
  snatRefreshTimer = setInterval(() => {
    handleSnatSearch()
  }, snatSearchForm.refreshInterval * 1000)
}

const stopSnatAutoRefresh = () => {
  if (snatRefreshTimer) {
    clearInterval(snatRefreshTimer)
    snatRefreshTimer = null
  }
}

// 组件卸载时清理定时器
onUnmounted(() => {
  stopInstanceAutoRefresh()
  stopSnatAutoRefresh()
})
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

/* 实例监控指标面板样式 */
.instance-inline-form {
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

.instance-chart-simple {
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

.instance-chart-title {
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

.instance-chart-empty {
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

/* SNAT监控指标面板样式 */
.snat-inline-form {
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

.snat-chart-simple {
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

.snat-chart-title {
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

.snat-chart-empty {
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
</style>
