<template>
  <div class="business-instance-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>业务实例管理</span>
          <el-button type="primary" @click="handleAddInstance">新增业务实例</el-button>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item>
            <el-input
              v-model="searchForm.keyword"
              placeholder="搜索业务实例名称/ID/客户名称/订单ID"
              clearable
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 表格区域 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%; min-height: 320px;"
        row-key="instanceId"
        max-height="500"
        row-class-name="dense-row"
        :header-cell-style="{ position: 'sticky', top: 0, background: '#fff', zIndex: 2 }"
      >
        <el-table-column prop="instanceId" label="业务实例ID" width="150" fixed="left" />
        <el-table-column prop="instanceName" label="业务实例名称" min-width="150" />
        <el-table-column prop="customerName" label="客户名称" min-width="180" />
        <el-table-column prop="orderId" label="订单ID" width="150" />
        <el-table-column prop="packageName" label="套餐名称" width="120" />
        <el-table-column 
          label="集群类型" 
          width="120"
          :filters="[
            { text: '主备', value: 'standby' },
            { text: '分布式', value: 'distributed' },
            { text: 'Anycast', value: 'anycast' }
          ]"
          :filter-method="filterClusterType"
          filter-placement="bottom-end"
        >
          <template #default="{ row }">
            <el-tag :type="getClusterTypeTag(row.clusterType)">
              {{ getClusterTypeLabel(row.clusterType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column 
          prop="addressType" 
          label="地址类型" 
          width="100"
          :filters="[
            { text: 'IPv4', value: 'IPv4' },
            { text: 'IPv6', value: 'IPv6' },
            { text: '双栈', value: 'dual' }
          ]"
          :filter-method="filterAddressType"
          filter-placement="bottom-end"
        >
          <template #default="{ row }">
            <el-tag :type="getAddressTypeTag(row.addressType)">
              {{ getAddressTypeLabel(row.addressType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="逻辑集群组" min-width="180">
          <template #default="{ row }">
            <el-tooltip 
              effect="light" 
              :content="getClusterGroupTooltip(row)" 
              placement="top" 
              :show-after="500"
            >
              <el-link type="primary" @click="handleViewClusterGroup(row)">
                {{ getClusterGroupName(row) }}
              </el-link>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="bandwidth" label="防护带宽(Mbps)" width="140" sortable />
        <el-table-column prop="businessBandwidth" label="业务带宽(Mbps)" width="140" sortable />
        <el-table-column prop="qps" label="业务QPS" width="120" sortable />
        <el-table-column prop="protectionIpCount" label="防护IP数" width="120" sortable />
        <el-table-column prop="domainCount" label="防护域名数" width="120" sortable />
        <el-table-column prop="portCount" label="端口数量" width="120" sortable />
        <el-table-column 
          prop="status" 
          label="状态" 
          width="100"
          :filters="[
            { text: '已启用', value: 'active' },
            { text: '已禁用', value: 'inactive' }
          ]"
          :filter-method="filterStatus"
          filter-placement="bottom-end"
        >
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" sortable />
        <el-table-column label="操作" width="320" fixed="right">
          <template #default="{ row }">
            <el-button 
              v-if="row.status === 'inactive'" 
              type="success" 
              link
              @click="handleEnable(row)"
            >
              启用
            </el-button>
            <el-button 
              v-if="row.status === 'active'" 
              type="warning" 
              link
              @click="handleDisable(row)"
            >
              禁用
            </el-button>
            <el-button 
              type="primary" 
              link
              @click="handleEdit(row)"
            >
              修改配置
            </el-button>
            <el-button 
              type="primary" 
              link
              @click="handleAllocateIp(row)"
            >
              分配防护IP
            </el-button>
            <el-button 
              type="danger" 
              link
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
        <template #empty>
          <div class="text-gray-400 py-10 text-center">暂无数据</div>
        </template>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 业务实例表单对话框 -->
    <business-instance-modal
      v-model="instanceModalVisible"
      :instance-data="currentInstance"
      :is-edit="isEdit"
      @success="handleModalSuccess"
    />

    <!-- IP分配对话框 -->
    <ip-allocation-modal
      v-model="ipModalVisible"
      :instance-data="currentInstance"
      @success="handleIpAllocationSuccess"
    />

    <!-- 启用确认对话框 -->
    <el-dialog
      v-model="enableDialogVisible"
      title="确认启用"
      width="400px"
    >
      <div>确定要启用业务实例 <b>{{ currentInstance?.instanceName }}</b> 吗？</div>
      <div class="text-xs text-gray-500 mt-2">ID: {{ currentInstance?.instanceId }}</div>
      <template #footer>
        <el-button @click="enableDialogVisible = false">取消</el-button>
        <el-button type="success" @click="confirmEnable">确认启用</el-button>
      </template>
    </el-dialog>

    <!-- 禁用确认对话框 -->
    <el-dialog
      v-model="disableDialogVisible"
      title="确认禁用"
      width="400px"
    >
      <div>确定要禁用业务实例 <b>{{ currentInstance?.instanceName }}</b> 吗？</div>
      <div class="text-xs text-gray-500 mt-2">ID: {{ currentInstance?.instanceId }}</div>
      <template #footer>
        <el-button @click="disableDialogVisible = false">取消</el-button>
        <el-button type="warning" @click="confirmDisable">确认禁用</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import BusinessInstanceModal from '../components/BusinessInstance/BusinessInstanceModal.vue'
import IpAllocationModal from '../components/BusinessInstance/IpAllocationModal.vue'
import BusinessInstanceService from '../services/BusinessInstanceService'
import ClusterService from '../services/ClusterService'

// 状态
const loading = ref(false)
const tableData = ref([])
const instanceModalVisible = ref(false)
const ipModalVisible = ref(false)
const enableDialogVisible = ref(false)
const disableDialogVisible = ref(false)
const isEdit = ref(false)
const currentInstance = ref(null)
const clusterGroups = ref([]) // 缓存所有集群组数据

// 搜索表单
const searchForm = reactive({
  keyword: '',
  dateRange: [],
})

// 分页
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
})

// 生命周期钩子
onMounted(() => {
  fetchData()
  fetchClusterGroups() // 获取所有集群组数据
})

// 获取数据
const fetchData = async () => {
  try {
    loading.value = true
    const params = {
      keyword: searchForm.keyword,
      status: searchForm.status,
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize
    }
    
    // 添加日期范围参数
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.dateRange = searchForm.dateRange
    }
    
    const result = await BusinessInstanceService.getBusinessInstances(params)
    
    if (result.code === 200) {
      // 处理数据兼容性
      tableData.value = result.data.list.map(item => {
        // 如果没有clusterType字段但有isAnycast字段，根据isAnycast设置clusterType
        if (!item.clusterType && item.isAnycast !== undefined) {
          item.clusterType = item.isAnycast ? 'anycast' : 'standby';
        }
        return item;
      });
      pagination.total = result.data.total
      pagination.pageNum = result.data.pageNum
      pagination.pageSize = result.data.pageSize
    } else {
      ElMessage.error(result.message || '获取业务实例列表失败')
    }
  } catch (error) {
    console.error('获取业务实例列表失败:', error)
    ElMessage.error('获取业务实例列表失败')
  } finally {
    loading.value = false
  }
}

// 获取所有集群组数据
const fetchClusterGroups = async () => {
  try {
    clusterGroups.value = await ClusterService.getClusterGroups()
  } catch (error) {
    console.error('获取逻辑集群组列表失败:', error)
  }
}

// 获取集群组名称
const getClusterGroupName = (row) => {
  // 先从实例的属性中查找，可能已经从API获取
  if (row.clusterGroupName) return row.clusterGroupName
  
  // 否则从缓存的集群组列表中查找
  const group = clusterGroups.value.find(g => g.id === row.clusterGroupId)
  if (group) return group.name
  
  // 如果都没有找到，返回ID
  return row.clusterGroupId
}

// 获取集群组提示内容
const getClusterGroupTooltip = (row) => {
  
  const group = clusterGroups.value.find(g => g.id === row.clusterGroupId)
  if (!group) return `集群组ID: ${row.clusterGroupId}`
  
  let typeLabel = '主备'
  if (group.type === 'anycast') {
    typeLabel = 'Anycast'
  } else if (group.type === 'distributed' || group.distributed) {
    typeLabel = '分布式'
  }
  
  return `${group.name} (${typeLabel}类型)\n${group.remark || ''}`
}

// 查看集群组详情
const handleViewClusterGroup = (row) => {
  if (!row.clusterGroupId) return
  
  // 跳转到集群组管理页面并高亮显示该集群组
  // 这里只是简单提示，实际实现可能需要路由跳转等
  ElMessage({
    message: `查看集群组: ${getClusterGroupName(row)}`,
    type: 'info'
  })
}

// 搜索
const handleSearch = () => {
  pagination.pageNum = 1
  fetchData()
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.dateRange = []
  pagination.pageNum = 1
  fetchData()
}

// 分页处理
const handleSizeChange = (size) => {
  pagination.pageSize = size
  fetchData()
}

const handleCurrentChange = (page) => {
  pagination.pageNum = page
  fetchData()
}

// 新增业务实例
const handleAddInstance = () => {
  currentInstance.value = null
  isEdit.value = false
  instanceModalVisible.value = true
}

// 编辑业务实例
const handleEdit = (row) => {
  currentInstance.value = { ...row }
  isEdit.value = true
  instanceModalVisible.value = true
}

// 启用业务实例
const handleEnable = (row) => {
  currentInstance.value = { ...row }
  enableDialogVisible.value = true
}

// 确认启用
const confirmEnable = async () => {
  try {
    const result = await BusinessInstanceService.enableBusinessInstance(currentInstance.value.instanceId)
    
    if (result.code === 200) {
      ElMessage.success('启用成功')
      enableDialogVisible.value = false
      fetchData()
    } else {
      ElMessage.error(result.message || '启用失败')
    }
  } catch (error) {
    console.error('启用业务实例失败:', error)
    ElMessage.error('启用业务实例失败')
  }
}

// 禁用业务实例
const handleDisable = (row) => {
  currentInstance.value = { ...row }
  disableDialogVisible.value = true
}

// 确认禁用
const confirmDisable = async () => {
  try {
    const result = await BusinessInstanceService.disableBusinessInstance(currentInstance.value.instanceId)
    
    if (result.code === 200) {
      ElMessage.success('禁用成功')
      disableDialogVisible.value = false
      fetchData()
    } else {
      ElMessage.error(result.message || '禁用失败')
    }
  } catch (error) {
    console.error('禁用业务实例失败:', error)
    ElMessage.error('禁用业务实例失败')
  }
}

// 分配防护IP
const handleAllocateIp = (row) => {
  currentInstance.value = row
  ipModalVisible.value = true
}

// 删除业务实例
const handleDelete = (row) => {
  ElMessageBox.confirm(
    '确定要删除该业务实例吗？删除后无法恢复。',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      const result = await BusinessInstanceService.deleteBusinessInstance(row.instanceId)
      
      if (result.code === 200) {
        ElMessage.success('删除成功')
        fetchData()
      } else {
        ElMessage.error(result.message || '删除失败')
      }
    } catch (error) {
      console.error('删除业务实例失败:', error)
      ElMessage.error('删除业务实例失败')
    }
  }).catch(() => {})
}

// 对话框成功回调
const handleModalSuccess = () => {
  fetchData()
}

// IP分配成功回调
const handleIpAllocationSuccess = () => {
  fetchData()
  // 重置当前实例，避免引用问题
  currentInstance.value = null
  ipModalVisible.value = false
}

// 表格过滤方法
const filterStatus = (value, row) => {
  return row.status === value
}

const filterClusterType = (value, row) => {
  return row.clusterType === value
}

const filterAddressType = (value, row) => {
  return row.addressType === value
}

// 工具函数
const getStatusType = (status) => {
  const map = {
    active: 'success',
    inactive: 'info'
  }
  return map[status] || 'info'
}

const getStatusLabel = (status) => {
  const map = {
    active: '已启用',
    inactive: '已禁用'
  }
  return map[status] || status
}

const getClusterTypeTag = (type) => {
  const map = {
    'standby': 'primary',
    'distributed': 'success',
    'anycast': 'warning'
  }
  return map[type] || 'info'
}

const getClusterTypeLabel = (type) => {
  const map = {
    'standby': '主备',
    'distributed': '分布式',
    'anycast': 'Anycast'
  }
  return map[type] || type
}

const getAddressTypeTag = (type) => {
  const map = {
    'IPv4': 'primary',
    'IPv6': 'success',
    'dual': 'warning'
  }
  return map[type] || 'info'
}

const getAddressTypeLabel = (type) => {
  const map = {
    'IPv4': 'IPv4',
    'IPv6': 'IPv6',
    'dual': '双栈'
  }
  return map[type] || type
}
</script>

<style scoped>
.business-instance-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-area {
  margin-bottom: 20px;
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.mr-5 {
  margin-right: 5px;
}

.dense-row {
  height: 50px;
}

.text-gray-400 {
  color: #9ca3af;
}

.py-10 {
  padding-top: 2.5rem;
  padding-bottom: 2.5rem;
}

.text-center {
  text-align: center;
}
</style> 