i<template>
  <div class="slb-instance-management">
    <!-- 搜索表单区域 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="实例名">
          <el-input 
            v-model="searchForm.instanceName" 
            placeholder="请输入实例名" 
            clearable 
            style="width: 200px;"
          />
        </el-form-item>
        <el-form-item label="VIP">
          <el-input 
            v-model="searchForm.vip" 
            placeholder="请输入VIP" 
            clearable 
            style="width: 200px;"
          />
        </el-form-item>
        <el-form-item label="负责人">
          <el-input 
            v-model="searchForm.owner" 
            placeholder="请输入负责人" 
            clearable 
            style="width: 200px;"
          />
        </el-form-item>
        <el-form-item label="牵引状态">
          <el-select 
            v-model="searchForm.attractionStatus" 
            placeholder="请选择" 
            clearable 
            style="width: 120px;"
          >
            <el-option label="已牵引" value="attracted" />
            <el-option label="未牵引" value="not_attracted" />
          </el-select>
        </el-form-item>
        <el-form-item label="运行状态">
          <el-select 
            v-model="searchForm.runningStatus" 
            placeholder="请选择" 
            clearable 
            style="width: 120px;"
          >
            <el-option label="运行中" value="running" />
            <el-option label="已停用" value="stopped" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="primary" @click="handleCreate">新建实例</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格区域 -->
    <el-card class="table-card" shadow="never">
      <el-table 
        :data="filteredTableData" 
        border 
        stripe 
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="instanceName" label="实例名" min-width="120" sortable />
        <el-table-column prop="vip" label="VIP" min-width="120" sortable />
        <el-table-column label="牵引" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.attractionStatus === 'attracted' ? 'success' : 'warning'">
              {{ scope.row.attractionStatus === 'attracted' ? '已牵引' : '未牵引' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="owner" label="负责人" width="100" />
        <el-table-column label="运行状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.runningStatus === 'running' ? 'success' : 'info'">
              {{ scope.row.runningStatus === 'running' ? '运行中' : '已停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="160" sortable />
        <el-table-column label="监控" width="100">
          <template #default="scope">
            <el-button link type="primary" @click="handleViewMonitor(scope.row)">
              查看监控
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="240" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button link type="primary" @click="handleAction('edit', scope.row)">编辑</el-button>
              <el-button link type="primary" @click="handleAction('config', scope.row)">配置</el-button>
              
              <!-- 条件显示的按钮 -->
              <el-button 
                v-if="canStop(scope.row)" 
                link 
                type="warning" 
                @click="handleAction('stop', scope.row)"
              >
                停用
              </el-button>
              <el-button 
                v-if="canStart(scope.row)" 
                link 
                type="success" 
                @click="handleAction('start', scope.row)"
              >
                启用
              </el-button>
              <el-button 
                v-if="canAttract(scope.row)" 
                link 
                type="primary" 
                @click="handleAction('attract', scope.row)"
              >
                启用牵引
              </el-button>
              <el-button 
                v-if="canCancelAttract(scope.row)" 
                link 
                type="warning" 
                @click="handleAction('cancelAttract', scope.row)"
              >
                取消牵引
              </el-button>
              <el-button 
                v-if="canDelete(scope.row)" 
                link 
                type="danger" 
                @click="handleAction('delete', scope.row)"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalCount"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新建实例抽屉 -->
    <SlbInstanceDrawer
      v-model="createDrawerVisible"
      mode="create"
      @success="handleCreateSuccess"
    />
    
    <!-- 编辑实例抽屉 -->
    <SlbInstanceDrawer
      v-model="editDrawerVisible"
      mode="edit"
      :instance-data="editingInstance"
      @success="handleEditSuccess"
    />
    
    <!-- 配置实例抽屉 -->
    <SlbInstanceConfigDrawer
      v-model="configDrawerVisible"
      :instance-data="configInstance"
      @listener-status-change="handleListenerStatusChange"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import SlbInstanceDrawer from './SlbInstanceDrawer.vue'
import SlbInstanceConfigDrawer from './SlbInstanceConfigDrawer.vue'

// 搜索表单数据
const searchForm = ref({
  instanceName: '',
  vip: '',
  owner: '',
  attractionStatus: '',
  runningStatus: ''
})

// 表格数据和分页
const tableData = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)

// 新建实例抽屉控制
const createDrawerVisible = ref(false)

// 编辑实例抽屉控制
const editDrawerVisible = ref(false)
const editingInstance = ref(null)

// 配置实例抽屉控制
const configDrawerVisible = ref(false)
const configInstance = ref(null)

// 模拟数据
const mockData = [
  {
    id: 1,
    instanceName: 'SLB-001',
    vip: '192.168.1.100',
    attractionStatus: 'attracted',
    owner: '张三',
    runningStatus: 'running',
    createTime: '2025-03-26 17:44:40',
    listeners: [
      {
        id: 1,
        name: '8080',
        port: '8080',
        protocol: 'TCP',
        status: 'running',
        servers: [
          { id: 1, status: 'running' },
          { id: 2, status: 'running' }
        ]
      }
    ]
  },
  {
    id: 2,
    instanceName: 'SLB-002',
    vip: '192.168.1.101',
    attractionStatus: 'not_attracted',
    owner: '李四',
    runningStatus: 'running',
    createTime: '2025-03-25 16:30:20',
    listeners: [
      {
        id: 2,
        name: '8080',
        port: '8080',
        protocol: 'TCP',
        status: 'running',
        servers: [
          { id: 3, status: 'running' }
        ]
      }
    ]
  },
  {
    id: 3,
    instanceName: 'SLB-003',
    vip: '192.168.1.102',
    attractionStatus: 'not_attracted',
    owner: '王五',
    runningStatus: 'stopped',
    createTime: '2025-03-24 15:20:10',
    listeners: [
      {
        id: 3,
        name: '8080',
        port: '8080',
        protocol: 'TCP',
        status: 'stopped',
        servers: []
      }
    ]
  },
  {
    id: 4,
    instanceName: 'SLB-004',
    vip: '192.168.1.103',
    attractionStatus: 'attracted',
    owner: '赵六',
    runningStatus: 'running',
    createTime: '2025-03-23 14:10:30',
    listeners: [
      {
        id: 4,
        name: '8080',
        port: '8080',
        protocol: 'TCP',
        status: 'running',
        servers: [
          { id: 4, status: 'running' },
          { id: 5, status: 'stopped' }
        ]
      }
    ]
  },
  {
    id: 5,
    instanceName: 'SLB-005',
    vip: '192.168.1.104',
    attractionStatus: 'not_attracted',
    owner: '孙七',
    runningStatus: 'stopped',
    createTime: '2025-03-22 13:45:15',
    listeners: []
  }
]

// 过滤后的表格数据
const filteredTableData = computed(() => {
  let data = tableData.value
  
  // 应用搜索过滤
  if (searchForm.value.instanceName) {
    data = data.filter(item => 
      item.instanceName.toLowerCase().includes(searchForm.value.instanceName.toLowerCase())
    )
  }
  
  if (searchForm.value.vip) {
    data = data.filter(item => 
      item.vip.includes(searchForm.value.vip)
    )
  }
  
  if (searchForm.value.owner) {
    data = data.filter(item => 
      item.owner.includes(searchForm.value.owner)
    )
  }
  
  if (searchForm.value.attractionStatus) {
    data = data.filter(item => 
      item.attractionStatus === searchForm.value.attractionStatus
    )
  }
  
  if (searchForm.value.runningStatus) {
    data = data.filter(item => 
      item.runningStatus === searchForm.value.runningStatus
    )
  }
  
  return data
})

// 检查监听器是否全部删除或停用
const areAllListenersDeletedOrStopped = (instance) => {
  if (!instance.listeners || instance.listeners.length === 0) {
    return true // 没有监听器时认为全部删除
  }
  
  // 检查是否所有监听器都已删除或停用
  const activeListeners = instance.listeners.filter(listener => 
    listener.status === 'running'
  )
  return activeListeners.length === 0
}

// 按钮显示逻辑
const canStop = (row) => {
  // 实例停用条件：监听全部删除或者全部停用，实例已经取消牵引
  return row.runningStatus === 'running' && 
         row.attractionStatus === 'not_attracted' && 
         areAllListenersDeletedOrStopped(row)
}

const canStart = (row) => {
  // 实例启用条件：无条件启用
  return row.runningStatus === 'stopped'
}

const canAttract = (row) => {
  return row.runningStatus === 'running' && row.attractionStatus === 'not_attracted'
}

const canCancelAttract = (row) => {
  return row.attractionStatus === 'attracted'
}

const canDelete = (row) => {
  // 实例删除条件：实例已经停用
  return row.runningStatus === 'stopped'
}

// 搜索功能
const handleSearch = () => {
  console.log('搜索条件:', searchForm.value)
  // 在实际应用中，这里会调用API
}

// 重置搜索
const handleReset = () => {
  searchForm.value = {
    instanceName: '',
    vip: '',
    owner: '',
    attractionStatus: '',
    runningStatus: ''
  }
  handleSearch()
}

// 新建实例
const handleCreate = () => {
  createDrawerVisible.value = true
}

// 创建实例成功处理
const handleCreateSuccess = (newInstance) => {
  // 添加到表格数据的开头
  tableData.value.unshift(newInstance)
  totalCount.value++
  
  // 如果当前不在第一页，跳转到第一页以显示新创建的实例
  if (currentPage.value !== 1) {
    currentPage.value = 1
  }
}

// 编辑实例成功处理
const handleEditSuccess = (updatedInstance) => {
  // 查找并更新表格中的实例数据
  const index = tableData.value.findIndex(item => item.id === updatedInstance.id)
  if (index > -1) {
    tableData.value[index] = updatedInstance
  }
}

// 检查实例是否应该自动停用
const checkAndAutoStopInstance = (instance) => {
  if (instance.runningStatus === 'running' && 
      instance.attractionStatus === 'not_attracted' && 
      areAllListenersDeletedOrStopped(instance)) {
    instance.runningStatus = 'stopped'
    ElMessage.warning(`实例 ${instance.instanceName} 的所有监听器已删除或停用，实例已自动停用`)
  }
}

// 监听器状态变化处理（从配置抽屉调用）
const handleListenerStatusChange = (instanceId, listeners) => {
  const instance = tableData.value.find(item => item.id === instanceId)
  if (instance) {
    instance.listeners = listeners
    checkAndAutoStopInstance(instance)
  }
}

// 查看监控
const handleViewMonitor = (row) => {
  ElMessage({
    message: `查看 ${row.instanceName} 的监控信息`,
    type: 'info'
  })
}

// 操作处理
const handleAction = async (action, row) => {
  console.log('执行操作:', action, row)
  
  switch (action) {
    case 'edit':
      // 打开编辑抽屉
      editingInstance.value = { ...row }
      editDrawerVisible.value = true
      break
      
    case 'config':
      // 打开配置抽屉
      configInstance.value = { ...row }
      configDrawerVisible.value = true
      break
      
    case 'stop':
      // 检查停用条件
      if (!canStop(row)) {
        if (row.attractionStatus === 'attracted') {
          ElMessage.warning('实例已启用牵引，请先取消牵引')
        } else if (!areAllListenersDeletedOrStopped(row)) {
          ElMessage.warning('请先删除或停用所有监听器')
        } else {
          ElMessage.warning('实例当前状态不允许停用')
        }
        return
      }
      
      try {
        await ElMessageBox.confirm(
          `确定要停用实例 ${row.instanceName} 吗？`,
          '停用确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        // 模拟API调用
        row.runningStatus = 'stopped'
        ElMessage({
          type: 'success',
          message: '停用成功'
        })
      } catch (error) {
        // 用户取消操作
      }
      break
      
    case 'start':
      row.runningStatus = 'running'
      ElMessage({
        type: 'success',
        message: '启用成功'
      })
      break
      
    case 'attract':
      row.attractionStatus = 'attracted'
      ElMessage({
        type: 'success',
        message: '启用牵引成功'
      })
      break
      
    case 'cancelAttract':
      try {
        await ElMessageBox.confirm(
          `确定要取消实例 ${row.instanceName} 的牵引吗？`,
          '取消牵引确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        row.attractionStatus = 'not_attracted'
        ElMessage({
          type: 'success',
          message: '取消牵引成功'
        })
      } catch (error) {
        // 用户取消操作
      }
      break
      
    case 'delete':
      // 检查删除条件
      if (!canDelete(row)) {
        ElMessage.warning('只有已停用的实例才能删除')
        return
      }
      
      try {
        await ElMessageBox.confirm(
          `确定要删除实例 ${row.instanceName} 吗？此操作不可恢复！`,
          '删除确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        // 从数据中移除
        const index = tableData.value.findIndex(item => item.id === row.id)
        if (index > -1) {
          tableData.value.splice(index, 1)
          totalCount.value = tableData.value.length
        }
        
        ElMessage({
          type: 'success',
          message: '删除成功'
        })
      } catch (error) {
        // 用户取消操作
      }
      break
  }
}

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size
  // 在实际应用中重新加载数据
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  // 在实际应用中重新加载数据
}

// 初始化数据
const loadData = () => {
  loading.value = true
  
  // 模拟异步加载
  setTimeout(() => {
    tableData.value = mockData
    totalCount.value = mockData.length
    loading.value = false
  }, 500)
}

// 组件挂载时加载数据
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.slb-instance-management {
  padding: 0;
}

.search-card {
  margin-bottom: 16px;
}

.search-form {
  margin-bottom: 0;
}

.search-form .el-form-item {
  margin-bottom: 16px;
}

.table-card {
  background: #fff;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.action-buttons .el-button {
  margin: 0;
  padding: 4px 8px;
}

.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
