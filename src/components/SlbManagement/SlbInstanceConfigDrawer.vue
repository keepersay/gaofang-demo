<template>
  <el-drawer
    v-model="visible"
    :title="`实例名称: ${instanceData?.instanceName || ''}`"
    size="60vw"
    direction="rtl"
    :before-close="handleClose"
    destroy-on-close
  >
    <div class="config-drawer-content">
      <!-- 实例信息展示区域 -->
      <el-card class="instance-info-card" shadow="never">
        <div class="instance-info-grid">
          <div class="info-item">
            <span class="info-label">实例IP:</span>
            <span class="info-value">{{ instanceData?.vip }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">实例状态:</span>
            <el-tag 
              :type="getStatusTagType(instanceData?.runningStatus)" 
              size="small"
            >
              {{ getStatusText(instanceData?.runningStatus) }}
            </el-tag>
          </div>
          <div class="info-item">
            <span class="info-label">创建人:</span>
            <span class="info-value">{{ instanceData?.owner }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">负责人:</span>
            <span class="info-value">{{ instanceData?.owner }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">创建时间:</span>
            <span class="info-value">{{ instanceData?.createTime }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">备注:</span>
            <span class="info-value">{{ instanceData?.remark || '--' }}</span>
          </div>
        </div>
      </el-card>

      <!-- Tab页面容器 -->
      <el-card class="tab-card" shadow="never">
        <el-tabs v-model="activeTab" class="config-tabs">
          <!-- 监听明细Tab -->
          <el-tab-pane label="监听明细" name="listeners">
            <div class="listeners-content">
              <!-- 添加监听按钮 -->
              <div class="listeners-header">
                <el-button type="primary" @click="handleAddListener">
                  添加监听
                </el-button>
              </div>

              <!-- 监听器列表表格 -->
              <el-table 
                :data="listenersData" 
                border 
                stripe
                class="listeners-table"
                highlight-current-row
                @current-change="handleListenerClick"
              >
                <el-table-column prop="id" label="序号" width="80" align="center" />
                <el-table-column prop="name" label="名称" width="100" align="center" />
                <el-table-column label="端口号:协议" width="140" align="center">
                  <template #default="{ row }">
                    <span>{{ row.port }}:{{ row.protocol }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="algorithm" label="网络算法" width="150" align="center">
                  <template #default="{ row }">
                    <span>{{ getAlgorithmText(row.algorithm) }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="timeout" label="会话超时时间" width="120" align="center">
                  <template #default="{ row }">
                    <span>{{ row.timeout }}s</span>
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100" align="center">
                  <template #default="{ row }">
                    <el-tag 
                      :type="getStatusTagType(row.status)" 
                      size="small"
                    >
                      {{ getStatusText(row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="监控" width="100" align="center">
                  <template #default="{ row }">
                    <el-button 
                      type="primary" 
                      link 
                      size="small" 
                      @click="handleViewListenerMonitor(row)"
                    >
                      查看监控
                    </el-button>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="160" align="center">
                  <template #default="{ row }">
                    <div class="listener-actions">
                      <el-button 
                        type="primary" 
                        link 
                        size="small" 
                        @click="handleEditListener(row)"
                      >
                        编辑
                      </el-button>
                      <el-button 
                        type="primary" 
                        link 
                        size="small" 
                        :disabled="!canStopListener(row)"
                        @click="handleStopListener(row)"
                      >
                        停用
                      </el-button>
                      <el-button 
                        type="danger" 
                        link 
                        size="small" 
                        :disabled="!canDeleteListener(row)"
                        @click="handleDeleteListener(row)"
                      >
                        删除
                      </el-button>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
              
              <!-- 后端主机区域 -->
              <div v-if="selectedListener" class="backend-hosts-section">
                <div class="backend-header">
                  <div class="backend-title">
                    <h4>后端主机</h4>
                    <div class="listener-stats">
                      监听名称: {{ selectedListener.name }}{{ selectedListener.port ? ` (${selectedListener.port})` : '' }}
                      <el-tag type="info" size="small">总数: {{ selectedListener.servers ? selectedListener.servers.length : 0 }}</el-tag>
                      <el-tag type="success" size="small">已启用: {{ getServerCountByStatus('running') }}</el-tag>
                      <el-tag type="info" size="small">停止: {{ getServerCountByStatus('stopped') }}</el-tag>
                      <el-tag type="success" size="small">正常: {{ getServerCountByHealth('正常') }}</el-tag>
                      <el-tag type="warning" size="small">部分异常: 0</el-tag>
                      <el-tag type="danger" size="small">异常: 0</el-tag>
                    </div>
                  </div>
                  <div class="backend-actions">
                    <el-button type="primary" @click="handleAddBackendHost">
                      添加后端主机
                    </el-button>
                  </div>
                </div>
                
                <!-- 后端主机表格 -->
                <el-table 
                  :data="selectedListener.servers" 
                  border 
                  stripe
                  class="backend-hosts-table"
                >
                  <el-table-column prop="id" label="序号" width="80" align="center" />
                  <el-table-column prop="serverName" label="主机簿名称" width="120" align="center">
                    <template #default="{ row }">
                      <span>{{ row.serverName || '--' }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="ipAddress" label="IP地址" width="140" align="center" />
                  <el-table-column prop="port" label="端口" width="80" align="center" />
                  <el-table-column prop="weight" label="权重" width="80" align="center" />
                  <el-table-column prop="remark" label="备注" width="120" align="center">
                    <template #default="{ row }">
                      <span>{{ row.remark || '--' }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="status" label="状态" width="100" align="center">
                    <template #default="{ row }">
                      <el-tag 
                        :type="getStatusTagType(row.status)" 
                        size="small"
                      >
                        {{ getStatusText(row.status) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="healthCheck" label="健康检查" width="100" align="center">
                    <template #default="{ row }">
                      <el-tag 
                        :type="row.healthCheck === '正常' ? 'success' : 'danger'" 
                        size="small"
                      >
                        {{ row.healthCheck }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="监控" width="100" align="center">
                    <template #default="{ row }">
                      <el-button 
                        type="primary" 
                        link 
                        size="small" 
                        @click="handleViewServerMonitor(row)"
                      >
                        查看监控
                      </el-button>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="160" align="center">
                    <template #default="{ row }">
                      <div class="server-actions">
                        <el-button 
                          type="primary" 
                          link 
                          size="small" 
                          @click="handleEditServer(row)"
                        >
                          编辑
                        </el-button>
                        <el-button 
                          type="primary" 
                          link 
                          size="small" 
                          :disabled="row.status !== 'running'"
                          @click="handleStopServer(row)"
                        >
                          停用
                        </el-button>
                        <el-button 
                          type="danger" 
                          link 
                          size="small" 
                          :disabled="row.status === 'running'"
                          @click="handleDeleteServer(row)"
                        >
                          删除
                        </el-button>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </el-tab-pane>

          <!-- 异常日志Tab -->
          <el-tab-pane label="异常日志" name="errorLogs">
            <div class="error-logs-content">
              <!-- 搜索表单 -->
              <div class="search-form">
                <el-form :inline="true" :model="errorLogsSearchForm" size="small">
                  <el-row :gutter="16">
                    <el-col :span="12">
                      <el-form-item label="监听开始时间">
                        <el-date-picker
                          v-model="errorLogsSearchForm.startTime"
                          type="datetime"
                          placeholder="开始时间"
                          format="YYYY-MM-DD HH:mm:ss"
                          value-format="YYYY-MM-DD HH:mm:ss"
                          style="width: 180px;"
                        />
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="监听结束时间">
                        <el-date-picker
                          v-model="errorLogsSearchForm.endTime"
                          type="datetime"
                          placeholder="结束时间"
                          format="YYYY-MM-DD HH:mm:ss"
                          value-format="YYYY-MM-DD HH:mm:ss"
                          style="width: 180px;"
                        />
                      </el-form-item>
                    </el-col>
                  </el-row>
                  
                  <el-row :gutter="16">
                    <el-col :span="8">
                      <el-form-item label="状态">
                        <el-select v-model="errorLogsSearchForm.status" placeholder="全部" style="width: 120px;">
                          <el-option label="全部" value="" />
                          <el-option label="已恢复" value="recovered" />
                          <el-option label="异常中" value="error" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="监听">
                        <el-select v-model="errorLogsSearchForm.listener" placeholder="ALL" style="width: 120px;">
                          <el-option label="ALL" value="" />
                          <el-option 
                            v-for="listener in listenersData" 
                            :key="listener.id"
                            :label="`${listener.protocol.toUpperCase()}:${listener.port}`"
                            :value="listener.id"
                          />
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="后端服务器">
                        <el-select v-model="errorLogsSearchForm.backendServer" placeholder="后端服务器" style="width: 140px;">
                          <el-option label="全部" value="" />
                          <el-option 
                            v-for="server in backendServerOptions" 
                            :key="server.value"
                            :label="server.label"
                            :value="server.value"
                          />
                        </el-select>
                      </el-form-item>
                    </el-col>
                  </el-row>
                  
                  <el-row>
                    <el-col :span="24">
                      <el-form-item>
                        <el-button type="primary" @click="handleErrorLogsSearch" :loading="errorLogsLoading">
                          查询
                        </el-button>
                        <el-button @click="handleErrorLogsReset">
                          重置
                        </el-button>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-form>
              </div>
              
              <!-- 数据表格 -->
              <el-table 
                :data="errorLogsData" 
                :loading="errorLogsLoading"
                border 
                stripe
                size="small"
                class="error-logs-table"
              >
                <el-table-column prop="protocol" label="监听协议" width="120" align="center" />
                <el-table-column prop="backendService" label="后端服务" width="160" align="center" />
                <el-table-column prop="startTime" label="开始时间" width="180" align="center" />
                <el-table-column prop="endTime" label="结束时间" width="180" align="center" />
                <el-table-column prop="errorCount" label="异常次数" width="100" align="center" />
                <el-table-column prop="status" label="状态" width="100" align="center">
                  <template #default="{ row }">
                    <el-tag 
                      :type="row.status === '已恢复' ? 'success' : 'danger'"
                      size="small"
                    >
                      {{ row.status }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="recoveryReason" label="恢复原因" min-width="120" align="center" />
              </el-table>
              
              <!-- 分页 -->
              <div class="pagination-container">
                <el-pagination
                  v-model:current-page="errorLogsPagination.currentPage"
                  v-model:page-size="errorLogsPagination.pageSize"
                  :page-sizes="[10, 20, 50, 100]"
                  :total="errorLogsPagination.total"
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="handleErrorLogsPageSizeChange"
                  @current-change="handleErrorLogsCurrentPageChange"
                />
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
    
    <!-- 新建监听抽屉 -->
    <SlbListenerCreateDrawer
      v-model="createListenerVisible"
      :instance-data="instanceData"
      @success="handleCreateListenerSuccess"
    />
    
    <!-- 编辑监听抽屉 -->
    <SlbListenerEditDrawer
      v-model="editListenerVisible"
      :listener-data="currentListenerForEdit"
      @success="handleEditListenerSuccess"
    />
    
    <!-- 添加后端主机抽屉 -->
    <SlbBackendHostCreateDrawer
      v-model="addBackendHostVisible"
      :listener-data="currentListenerForHost"
      @success="handleAddBackendHostSuccess"
    />
    
    <!-- 编辑后端主机抽屉 -->
    <SlbBackendHostEditDrawer
      v-model="editBackendHostVisible"
      :server-data="currentServerForEdit"
      @success="handleEditBackendHostSuccess"
    />
  </el-drawer>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import SlbListenerCreateDrawer from './SlbListenerCreateDrawer.vue'
import SlbListenerEditDrawer from './SlbListenerEditDrawer.vue'
import SlbBackendHostCreateDrawer from './SlbBackendHostCreateDrawer.vue'
import SlbBackendHostEditDrawer from './SlbBackendHostEditDrawer.vue'

// 定义props和emits
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  instanceData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'listener-status-change'])

// 控制抽屉显示
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Tab页面状态
const activeTab = ref('listeners')

// 选中的监听器
const selectedListener = ref(null)

// 新建监听抽屉控制
const createListenerVisible = ref(false)

// 编辑监听抽屉控制
const editListenerVisible = ref(false)
const currentListenerForEdit = ref(null)

// 添加后端主机抽屉控制
const addBackendHostVisible = ref(false)
const currentListenerForHost = ref(null)

// 编辑后端主机抽屉控制
const editBackendHostVisible = ref(false)
const currentServerForEdit = ref(null)

// 异常日志相关
const errorLogsSearchForm = reactive({
  startTime: '',
  endTime: '',
  status: '',
  listener: '',
  backendServer: ''
})

const errorLogsData = ref([
  {
    id: 1,
    protocol: 'tcp:8080',
    backendService: '1.1.1.1:808',
    startTime: '2025-01-10 11:34:30',
    endTime: '2025-01-10 11:38:13',
    errorCount: 3,
    status: '已恢复',
    recoveryReason: '服务已恢复'
  },
  {
    id: 2,
    protocol: 'tcp:8080',
    backendService: '100.0.0.14:80',
    startTime: '2025-01-06 16:47:45',
    endTime: '2025-01-06 16:49:00',
    errorCount: 5,
    status: '已恢复',
    recoveryReason: '服务已恢复'
  },
  {
    id: 3,
    protocol: 'tcp:8080',
    backendService: '100.0.0.13:80',
    startTime: '2025-01-06 16:47:30',
    endTime: '2025-01-06 16:49:00',
    errorCount: 6,
    status: '已恢复',
    recoveryReason: '服务已恢复'
  }
])

const errorLogsLoading = ref(false)

// 异常日志分页
const errorLogsPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 后端服务器选项
const backendServerOptions = computed(() => {
  if (!errorLogsSearchForm.listener) {
    return []
  }
  const listener = listenersData.value.find(l => l.id === errorLogsSearchForm.listener)
  return listener?.servers?.map(server => ({
    label: `${server.ipAddress}:${server.port}`,
    value: server.id
  })) || []
})

// 模拟监听器数据
const listenersData = ref([
  {
    id: 1,
    name: '8080',
    port: '8080',
    protocol: 'TCP',
    algorithm: 'wrr', // 加权轮询
    status: 'running',
    // 编辑所需的基本信息字段
    ipVersion: 'ipv4',
    vip: '192.168.1.100',
    vport: '8080',
    fwMode: 'fnat',
    // 编辑所需的高级配置字段
    schedule: 'wrr',
    timeout: 300,
    swReset: 'disable',
    swTuoa: 'disable',
    swSessionSync: 'disable',
    swTransfLog: 'disable',
    swExpQuiet: 'disable',
    qidList: [1, 2],
    servers: [
      {
        id: 1,
        serverName: '--',
        ipAddress: '100.0.0.13',
        port: 8080,
        weight: 10,
        remark: '主服务器',
        status: 'running',
        healthCheck: '正常'
      },
      {
        id: 2,
        serverName: '--',
        ipAddress: '100.0.0.14',
        port: 8080,
        weight: 10,
        remark: '备用服务器',
        status: 'running',
        healthCheck: '正常'
      }
    ]
  }
])

// 获取按状态统计服务器数量
const getServerCountByStatus = (status) => {
  if (!selectedListener.value || !selectedListener.value.servers) return 0
  return selectedListener.value.servers.filter(server => server.status === status).length
}

// 获取按健康状态统计服务器数量
const getServerCountByHealth = (health) => {
  if (!selectedListener.value || !selectedListener.value.servers) return 0
  return selectedListener.value.servers.filter(server => server.healthCheck === health).length
}

// 状态文本映射
const getStatusText = (status) => {
  const statusMap = {
    'running': '运行中',
    'stopped': '已停用',
    'error': '异常'
  }
  return statusMap[status] || status
}

// 状态标签类型映射
const getStatusTagType = (status) => {
  const typeMap = {
    'running': 'success',
    'stopped': 'info',
    'error': 'danger'
  }
  return typeMap[status] || 'info'
}

// 调度算法文本映射
const getAlgorithmText = (algorithm) => {
  const algorithmMap = {
    'rr': '加权轮询(rr)',
    'wlc': '加权最小链接(wlc)',
    'ipconhash': 'IP一致性散列(ipconhash)',
    'wrr': '加权轮询(wrr)' // 兼容原有数据
  }
  return algorithmMap[algorithm] || algorithm
}

// 监听器点击选中处理
const handleListenerClick = (row) => {
  selectedListener.value = row
}

// 监听器操作处理
const handleAddListener = () => {
  createListenerVisible.value = true
}

// 新建监听成功处理
const handleCreateListenerSuccess = (newListener) => {
  // 添加到监听器列表
  listenersData.value.push(newListener)
  ElMessage.success('监听器创建成功')
}

// 编辑监听成功处理
const handleEditListenerSuccess = (updateData) => {
  // 查找并更新监听器数据
  const listener = listenersData.value.find(l => l.id === updateData.id)
  if (listener) {
    // 更新可编辑字段
    listener.name = updateData.name
    listener.schedule = updateData.schedule
    listener.timeout = updateData.timeout
    listener.swReset = updateData.swReset
    listener.swTuoa = updateData.swTuoa
    listener.swSessionSync = updateData.swSessionSync
    listener.swTransfLog = updateData.swTransfLog
    listener.swExpQuiet = updateData.swExpQuiet
    listener.qidList = updateData.qidList
    
    // 更新算法显示字段（兼容性）
    listener.algorithm = updateData.schedule
    
    ElMessage.success('监听器更新成功')
    
    // 通知父组件监听器状态变化
    emit('listener-status-change', props.instanceData?.id, listenersData.value)
  }
}

const handleEditListener = (row) => {
  currentListenerForEdit.value = row
  editListenerVisible.value = true
}

// 检查监听器是否可以停用
const canStopListener = (listener) => {
  // 监听器必须是运行状态才能停用
  return listener.status === 'running'
}

// 检查监听器是否可以删除
const canDeleteListener = (listener) => {
  // 监听器必须是停用状态才能删除
  return listener.status === 'stopped'
}

// 检查监听器是否应该自动停用
const shouldAutoStopListener = (listener) => {
  if (!listener.servers || listener.servers.length === 0) {
    return true // 没有主机时自动停用
  }
  
  // 检查是否所有主机都已删除或停用
  const activeServers = listener.servers.filter(server => 
    server.status === 'running'
  )
  return activeServers.length === 0
}

const handleStopListener = (row) => {
  // 检查是否可以停用
  if (!canStopListener(row)) {
    ElMessage.warning('只有运行中的监听器才能停用')
    return
  }
  
  // 执行停用操作
  row.status = 'stopped'
  ElMessage.success(`监听器 ${row.name} 已停用`)
  
  // 通知父组件监听器状态变化
  emit('listener-status-change', props.instanceData?.id, listenersData.value)
}

const handleDeleteListener = (row) => {
  // 检查是否可以删除
  if (!canDeleteListener(row)) {
    ElMessage.warning('只有已停用的监听器才能删除')
    return
  }
  
  // 确认删除
  ElMessageBox.confirm(
    `确定要删除监听器 ${row.name} 吗？删除后无法恢复。`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 执行删除操作
    const index = listenersData.value.findIndex(l => l.id === row.id)
    if (index > -1) {
      listenersData.value.splice(index, 1)
      // 如果删除的是当前选中的监听器，清空选择
      if (selectedListener.value && selectedListener.value.id === row.id) {
        selectedListener.value = null
      }
      ElMessage.success(`监听器 ${row.name} 已删除`)
      
      // 通知父组件监听器状态变化
      emit('listener-status-change', props.instanceData?.id, listenersData.value)
    }
  }).catch(() => {
    // 用户取消删除
  })
}

const handleViewListenerMonitor = (row) => {
  ElMessage.info(`查看监听器 ${row.name} 监控功能开发中`)
}

// 后端主机操作处理
const handleAddBackendHost = () => {
  if (!selectedListener.value) {
    ElMessage.warning('请先选择监听器')
    return
  }
  currentListenerForHost.value = selectedListener.value
  addBackendHostVisible.value = true
}

// 添加后端主机成功处理
const handleAddBackendHostSuccess = (newHost) => {
  // 添加到选中监听器的servers数组
  if (selectedListener.value && selectedListener.value.servers) {
    selectedListener.value.servers.push({
      id: newHost.id,
      ipAddress: newHost.ip,  // 注意这里用ipAddress匹配表格字段
      port: newHost.port,
      weight: newHost.weight,
      remark: newHost.remark,
      status: newHost.status,
      health: newHost.health
    })
  }
  ElMessage.success('后端主机添加成功')
}

// 编辑后端主机成功处理
const handleEditBackendHostSuccess = (updateData) => {
  // 更新选中监听器的servers数组中对应服务器的权重和备注
  if (selectedListener.value && selectedListener.value.servers) {
    const serverIndex = selectedListener.value.servers.findIndex(server => server.id === updateData.id)
    if (serverIndex !== -1) {
      selectedListener.value.servers[serverIndex].weight = updateData.weight
      selectedListener.value.servers[serverIndex].remark = updateData.remark
    }
  }
  ElMessage.success('主机信息更新成功')
}

// 异常日志相关方法
const handleErrorLogsSearch = () => {
  console.log('查询异常日志:', errorLogsSearchForm)
  errorLogsLoading.value = true
  
  // 模拟API调用
  setTimeout(() => {
    // 模拟数据过滤
    let filteredData = [...errorLogsData.value]
    
    if (errorLogsSearchForm.status) {
      filteredData = filteredData.filter(item => {
        if (errorLogsSearchForm.status === 'recovered') {
          return item.status === '已恢复'
        } else if (errorLogsSearchForm.status === 'error') {
          return item.status === '异常中'
        }
        return true
      })
    }
    
    if (errorLogsSearchForm.listener) {
      const listener = listenersData.value.find(l => l.id === errorLogsSearchForm.listener)
      if (listener) {
        const protocol = `${listener.protocol}:${listener.port}`
        filteredData = filteredData.filter(item => item.protocol === protocol)
      }
    }
    
    errorLogsPagination.total = filteredData.length
    errorLogsLoading.value = false
    ElMessage.success('查询完成')
  }, 1000)
}

const handleErrorLogsReset = () => {
  Object.assign(errorLogsSearchForm, {
    startTime: '',
    endTime: '',
    status: '',
    listener: '',
    backendServer: ''
  })
  errorLogsPagination.currentPage = 1
  ElMessage.success('重置成功')
}

const handleErrorLogsPageSizeChange = (size) => {
  errorLogsPagination.pageSize = size
  errorLogsPagination.currentPage = 1
}

const handleErrorLogsCurrentPageChange = (page) => {
  errorLogsPagination.currentPage = page
}

// 监听器变化时重置后端服务器选择
watch(() => errorLogsSearchForm.listener, () => {
  errorLogsSearchForm.backendServer = ''
})

// Tab切换时加载数据
watch(() => activeTab.value, (newTab) => {
  if (newTab === 'errorLogs' && props.instanceData) {
    errorLogsPagination.total = errorLogsData.value.length
  }
})

const handleEditServer = (server) => {
  currentServerForEdit.value = server
  editBackendHostVisible.value = true
}

const handleStopServer = (server) => {
  // 检查主机状态，只有运行中的主机才能停用
  if (server.status !== 'running') {
    ElMessage.warning('只有运行中的主机才能停用')
    return
  }
  
  // 执行停用操作
  server.status = 'stopped'
  ElMessage.success(`服务器 ${server.ipAddress}:${server.port} 已停用`)
  
  // 检查监听器是否应该自动停用
  if (selectedListener.value && shouldAutoStopListener(selectedListener.value)) {
    selectedListener.value.status = 'stopped'
    ElMessage.warning('所有主机已停用，监听器已自动停用')
  }
}

const handleDeleteServer = (server) => {
  // 检查主机状态，只有已停用的主机才能删除
  if (server.status === 'running') {
    ElMessage.warning('只有已停用的主机才能删除')
    return
  }
  
  // 确认删除
  ElMessageBox.confirm(
    `确定要删除服务器 ${server.ipAddress}:${server.port} 吗？删除后无法恢复。`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 执行删除操作
    if (selectedListener.value && selectedListener.value.servers) {
      const index = selectedListener.value.servers.findIndex(s => s.id === server.id)
      if (index > -1) {
        selectedListener.value.servers.splice(index, 1)
        ElMessage.success(`服务器 ${server.ipAddress}:${server.port} 已删除`)
        
        // 检查监听器是否应该自动停用
        if (shouldAutoStopListener(selectedListener.value)) {
          selectedListener.value.status = 'stopped'
          ElMessage.warning('所有主机已删除，监听器已自动停用')
        }
      }
    }
  }).catch(() => {
    // 用户取消删除
  })
}

const handleViewServerMonitor = (server) => {
  ElMessage.info(`查看服务器 ${server.ipAddress}:${server.port} 监控功能开发中`)
}

// 关闭抽屉
const handleClose = () => {
  visible.value = false
}

// 监听实例数据变化，重置tab状态
watch(() => props.instanceData, (newData) => {
  if (newData) {
    activeTab.value = 'listeners'
    selectedListener.value = null
  }
})
</script>

<style scoped>
.config-drawer-content {
  padding: 0 16px 16px;
  height: calc(100vh - 60px);
  overflow-y: auto;
}

/* 确保抽屉宽度为60% */
:deep(.el-drawer) {
  width: 60% !important;
}

:deep(.el-drawer__body) {
  padding: 0;
}

/* 异常日志样式 */
.error-logs-content {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.search-form {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
  margin-bottom: 16px;
  border: 1px solid #e9ecef;
  
  .el-form-item {
    margin-bottom: 12px;
  }
  
  .el-form-item__label {
    font-size: 12px;
    color: #606266;
    font-weight: 500;
  }
  
  .el-input {
    font-size: 12px;
  }
  
  .el-select {
    font-size: 12px;
  }
  
  .el-button {
    font-size: 12px;
  }
}

.error-logs-table {
  flex: 1;
  font-size: 12px;
  
  :deep(.el-table__header) {
    font-weight: 600;
    font-size: 12px;
  }
  
  :deep(.el-table__body) {
    font-size: 12px;
  }
  
  :deep(.el-table td) {
    padding: 8px 0;
  }
  
  :deep(.el-table th) {
    padding: 8px 0;
    background-color: #f5f7fa;
  }
}

.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: center;
  
  :deep(.el-pagination) {
    font-size: 12px;
  }
}

.instance-info-card {
  margin-bottom: 12px;
}

.instance-info-card :deep(.el-card__body) {
  padding: 12px;
}

.instance-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 16px;
}

.info-item {
  display: flex;
  align-items: center;
  font-size: 12px;
}

.info-label {
  font-weight: 500;
  color: #606266;
  margin-right: 6px;
  min-width: 60px;
  font-size: 12px;
}

.info-value {
  color: #303133;
  flex: 1;
  font-size: 12px;
}

.tab-card {
  background: #fff;
}

.tab-card :deep(.el-card__body) {
  padding: 12px;
}

.config-tabs {
  margin-top: 0;
}

.config-tabs :deep(.el-tabs__header) {
  margin: 0 0 12px 0;
}

.config-tabs :deep(.el-tabs__item) {
  font-size: 13px;
  height: 32px;
  line-height: 32px;
}

.listeners-content {
  padding-top: 8px;
}

.listeners-header {
  margin-bottom: 12px;
  display: flex;
  justify-content: flex-start;
}

.listeners-header .el-button {
  font-size: 12px;
  padding: 6px 12px;
}

.listeners-table {
  width: 100%;
}

.backend-hosts-section {
  margin-top: 20px;
  border-top: 1px solid #ebeef5;
  padding-top: 16px;
}

.backend-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.backend-title h4 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

.listener-stats {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #606266;
  flex-wrap: wrap;
}

.listener-stats .el-tag {
  font-size: 11px;
  height: 20px;
  line-height: 18px;
  padding: 0 6px;
}

.backend-actions {
  display: flex;
  justify-content: flex-end;
}

.backend-actions .el-button {
  font-size: 12px;
  padding: 6px 16px;
}

.backend-hosts-table {
  width: 100%;
  margin-top: 12px;
}

.listener-actions,
.server-actions {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.listener-actions .el-button,
.server-actions .el-button {
  font-size: 12px;
  padding: 3px 8px;
}

.error-logs-content {
  padding: 40px 0;
  text-align: center;
}

/* 表格样式优化 */
.listeners-table :deep(.el-table__row) {
  cursor: pointer;
}

.listeners-table :deep(.el-table__row:hover) {
  background-color: #f5f7fa;
}

.listeners-table :deep(.current-row) {
  background-color: #ecf5ff !important;
}

.listeners-table :deep(.current-row:hover) {
  background-color: #ecf5ff !important;
}

.listeners-table :deep(.el-table th) {
  font-size: 12px;
  padding: 8px 0;
}

.listeners-table :deep(.el-table td) {
  font-size: 12px;
  padding: 6px 0;
}

.backend-hosts-table :deep(.el-table__header) {
  background-color: #fafafa;
}

.backend-hosts-table :deep(.el-table__header th) {
  background-color: #fafafa !important;
  color: #606266;
  font-weight: 500;
  font-size: 12px;
  padding: 6px 0;
}

.backend-hosts-table :deep(.el-table td) {
  font-size: 12px;
  padding: 4px 0;
}

.backend-hosts-table :deep(.el-tag) {
  font-size: 12px;
  height: 20px;
  line-height: 18px;
  padding: 0 6px;
}

.listeners-table :deep(.el-tag) {
  font-size: 11px;
  height: 20px;
  line-height: 18px;
  padding: 0 6px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .instance-info-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .detail-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .status-tags {
    width: 100%;
  }
}
</style>
