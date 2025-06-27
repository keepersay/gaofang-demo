<template>
  <div class="ip-allocation-log-page">
    <el-card class="log-card">
      <div class="log-header">
        <h3>IP分配历史</h3>
        <div class="header-actions">
          <el-button type="primary" @click="handleRefresh">
            <el-icon><Refresh /></el-icon> 刷新
          </el-button>
          <el-button type="success" @click="handleExport">
            <el-icon><Download /></el-icon> 导出
          </el-button>
        </div>
      </div>
      
      <div class="search-bar">
        <el-input
          v-model="search.ipAddress"
          placeholder="IP地址"
          style="width: 180px;"
          clearable
          @clear="handleSearchClear('ipAddress')"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-input
          v-model="search.instanceId"
          placeholder="业务实例ID/名称"
          style="width: 180px; margin-left: 10px;"
          clearable
          @clear="handleSearchClear('instanceId')"
        />
        <el-input
          v-model="search.customerId"
          placeholder="客户ID/名称"
          style="width: 180px; margin-left: 10px;"
          clearable
          @clear="handleSearchClear('customerId')"
        />
        <el-date-picker
          v-model="search.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="margin-left: 10px; width: 320px;"
        />
        <el-button type="primary" @click="handleSearch" style="margin-left: 10px;">搜索</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </div>
      
      <el-table
        :data="tableData"
        style="width: 100%; margin-top: 15px;"
        border
        stripe
        size="small"
        v-loading="loading"
        @sort-change="handleSortChange"
        @filter-change="handleFilterChange"
      >
        <el-table-column prop="ipAddress" label="IP地址" min-width="120" sortable="custom" />
        <el-table-column prop="instanceName" label="业务实例" min-width="120" show-overflow-tooltip />
        <el-table-column prop="customerName" label="客户" min-width="120" show-overflow-tooltip />
        <el-table-column prop="operationType" label="操作类型" width="100"
          :filters="[
            { text: '分配', value: 'allocate' },
            { text: '回收', value: 'reclaim' }
          ]"
          column-key="operationType"
        >
          <template #default="scope">
            <el-tag :type="scope.row.operationType === 'allocate' ? 'success' : 'danger'" size="small">
              {{ scope.row.operationType === 'allocate' ? '分配' : '回收' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operationTime" label="操作时间" min-width="180" sortable="custom">
          <template #default="scope">
            {{ formatDateTime(scope.row.operationTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="operatorName" label="操作人" width="100" />
        <el-table-column prop="ipPoolName" label="IP池" width="120"
          :filters="ipPoolFilters"
          column-key="ipPoolId"
        />
        <el-table-column prop="ipSegment" label="IP段" min-width="120" show-overflow-tooltip />
        <el-table-column label="操作" fixed="right" width="80">
          <template #default="scope">
            <el-button 
              link 
              type="primary" 
              @click="showDetail(scope.row)"
              size="small"
            >
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          small
        />
      </div>
    </el-card>
    
    <!-- 详情抽屉 -->
    <el-drawer
      v-model="detailDrawerVisible"
      title="IP分配历史详情"
      direction="rtl"
      size="500px"
      :destroy-on-close="true"
    >
      <el-descriptions
        v-if="currentDetail"
        :column="1"
        border
        style="padding: 0 20px;"
      >
        <el-descriptions-item label="IP地址">{{ currentDetail.ipAddress }}</el-descriptions-item>
        <el-descriptions-item label="IP段">{{ currentDetail.ipSegment }}</el-descriptions-item>
        <el-descriptions-item label="业务实例">
          {{ currentDetail.instanceId }} / {{ currentDetail.instanceName }}
        </el-descriptions-item>
        <el-descriptions-item label="客户">
          {{ currentDetail.customerId }} / {{ currentDetail.customerName }}
        </el-descriptions-item>
        <el-descriptions-item label="操作类型">
          <el-tag :type="currentDetail.operationType === 'allocate' ? 'success' : 'danger'">
            {{ currentDetail.operationType === 'allocate' ? '分配' : '回收' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作时间">
          {{ formatDateTime(currentDetail.operationTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="操作人">
          {{ currentDetail.operatorName }}
        </el-descriptions-item>
        <el-descriptions-item label="IP池">
          {{ currentDetail.ipPoolName }}
        </el-descriptions-item>
        <el-descriptions-item label="请求ID">
          {{ currentDetail.requestId }}
        </el-descriptions-item>
        <el-descriptions-item label="审批状态">
          <el-tag type="success">已审批</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="审批时间">
          {{ formatDateTime(currentDetail.approvalTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="审批人">
          {{ currentDetail.approvalBy }}
        </el-descriptions-item>
        <el-descriptions-item label="网络类型">
          {{ currentDetail.networkType }}
        </el-descriptions-item>
        <el-descriptions-item label="带宽">
          {{ currentDetail.bandwidth }}
        </el-descriptions-item>
        <el-descriptions-item label="IP版本">
          {{ currentDetail.ipVersion }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatDateTime(currentDetail.createTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ formatDateTime(currentDetail.updateTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="备注">
          {{ currentDetail.remark }}
        </el-descriptions-item>
      </el-descriptions>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, Download } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import IpAllocationLogService from '@/services/IpAllocationLogService'

// 状态变量
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const tableData = ref([])
const detailDrawerVisible = ref(false)
const currentDetail = ref(null)
const ipPoolFilters = ref([])

// 搜索条件
const search = reactive({
  ipAddress: '',
  instanceId: '',
  customerId: '',
  dateRange: null
})

// 过滤条件
const filters = reactive({
  operationType: null,
  ipPoolId: null
})

// 排序
const sortInfo = reactive({
  prop: 'operationTime',
  order: 'descending'
})

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      ipAddress: search.ipAddress,
      instanceId: search.instanceId,
      customerId: search.customerId,
      dateRange: search.dateRange,
      operationType: filters.operationType,
      ipPoolId: filters.ipPoolId,
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      sortField: sortInfo.prop,
      sortOrder: sortInfo.order
    }
    
    const res = await IpAllocationLogService.queryIpAllocationLogs(params)
    tableData.value = res.records
    total.value = res.total
  } catch (error) {
    console.error('获取IP分配历史数据失败', error)
    ElMessage.error('获取数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 获取过滤选项
const fetchFilterOptions = async () => {
  try {
    // 获取IP池列表
    const ipPools = await IpAllocationLogService.getIpPools()
    ipPoolFilters.value = ipPools.map(pool => ({
      text: pool.name,
      value: pool.id
    }))
  } catch (error) {
    console.error('获取过滤选项失败', error)
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchData()
}

// 重置搜索
const resetSearch = () => {
  search.ipAddress = ''
  search.instanceId = ''
  search.customerId = ''
  search.dateRange = null
  
  // 重置过滤条件
  filters.operationType = null
  filters.ipPoolId = null
  
  currentPage.value = 1
  fetchData()
}

// 清除特定搜索条件
const handleSearchClear = (field) => {
  search[field] = ''
}

// 刷新数据
const handleRefresh = () => {
  fetchData()
}

// 导出数据
const handleExport = async () => {
  try {
    loading.value = true
    const params = {
      ipAddress: search.ipAddress,
      instanceId: search.instanceId,
      customerId: search.customerId,
      dateRange: search.dateRange,
      operationType: filters.operationType,
      ipPoolId: filters.ipPoolId
    }
    
    const res = await IpAllocationLogService.exportIpAllocationLogs(params)
    if (res.success) {
      ElMessage.success('导出成功')
      // 在实际应用中，这里应该触发文件下载
    } else {
      ElMessage.error(res.message || '导出失败')
    }
  } catch (error) {
    console.error('导出数据失败', error)
    ElMessage.error('导出失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 处理分页大小变化
const handleSizeChange = (size) => {
  pageSize.value = size
  fetchData()
}

// 处理页码变化
const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchData()
}

// 处理排序变化
const handleSortChange = ({ prop, order }) => {
  if (prop) {
    sortInfo.prop = prop
    sortInfo.order = order
    fetchData()
  }
}

// 处理过滤变化
const handleFilterChange = (filters) => {
  if (filters.operationType) {
    this.filters.operationType = filters.operationType[0]
  } else {
    this.filters.operationType = null
  }
  
  if (filters.ipPoolId) {
    this.filters.ipPoolId = filters.ipPoolId[0]
  } else {
    this.filters.ipPoolId = null
  }
  
  currentPage.value = 1
  fetchData()
}

// 显示详情
const showDetail = async (row) => {
  loading.value = true
  try {
    const detail = await IpAllocationLogService.getIpAllocationLogDetail(row.id)
    currentDetail.value = detail
    detailDrawerVisible.value = true
  } catch (error) {
    console.error('获取详情失败', error)
    ElMessage.error('获取详情失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 格式化日期时间
const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/\//g, '-')
}

// 初始化
onMounted(() => {
  fetchFilterOptions()
  fetchData()
})
</script>

<style scoped>
.ip-allocation-log-page {
  padding: 20px;
  background: #f5f6fa;
  min-height: calc(100vh - 120px);
}

.log-card {
  margin-bottom: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.log-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.search-bar {
  display: flex;
  margin-bottom: 15px;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px 0;
}

.pagination-container {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}
</style> 