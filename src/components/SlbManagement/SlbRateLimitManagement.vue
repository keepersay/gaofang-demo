<template>
  <div class="rate-limit-management">
    <!-- 搜索区域 -->
    <div class="search-bar">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="名称">
          <el-input
            v-model="searchForm.name"
            placeholder="名称"
            clearable
            style="width: 200px;"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="限速ID">
          <el-input
            v-model="searchForm.qosId"
            placeholder="限速ID"
            clearable
            style="width: 200px;"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      <div class="right-actions">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新建
        </el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <el-table
      :data="tableData"
      v-loading="loading"
      border
      stripe
      style="width: 100%; margin-top: 20px;"
      :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
    >
      <el-table-column prop="name" label="名称" min-width="150" />
      <el-table-column prop="qosId" label="限速ID" width="100" align="center" />
      <el-table-column prop="bandwidth" label="带宽限制" min-width="120" align="center">
        <template #default="{ row }">
          <span v-if="row.bandwidth">{{ row.bandwidth }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="cps" label="新建限制" min-width="120" align="center">
        <template #default="{ row }">
          <span v-if="row.cps">{{ row.cps }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="conns" label="会话限制" min-width="120" align="center">
        <template #default="{ row }">
          <span v-if="row.conns">{{ row.conns }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="owner" label="责任人" min-width="100" align="center" />
      <el-table-column label="操作" width="160" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 新建/编辑弹窗 -->
    <SlbRateLimitModal
      v-model="modalVisible"
      :qos-data="currentQos"
      :is-edit="isEdit"
      @success="handleModalSuccess"
      @add-qos="handleAddQos"
      @modify-qos="handleModifyQos"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import RateLimitService from '@/services/RateLimitService'
import SlbRateLimitModal from './SlbRateLimitModal.vue'

// 响应式数据
const loading = ref(false)
const tableData = ref([])
const modalVisible = ref(false)
const currentQos = ref(null)
const isEdit = ref(false)

// 搜索表单
const searchForm = reactive({
  name: '',
  qosId: ''
})

// 分页数据
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 获取限速策略列表
const fetchRateLimitList = async () => {
  try {
    loading.value = true
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      ...searchForm
    }
    
    // 模拟API调用
    const response = await mockGetRateLimitList(params)
    tableData.value = response.data.list
    total.value = response.data.total
  } catch (error) {
    ElMessage.error('获取限速策略列表失败')
    console.error('Error fetching rate limit list:', error)
  } finally {
    loading.value = false
  }
}

// 模拟数据存储
let mockData = [
  {
    id: 1,
    name: '新建限制',
    qosId: 3,
    bandwidth: '',
    cps: '20cps',
    conns: '',
    owner: 'yl'
  },
  {
    id: 2,
    name: '并发限制',
    qosId: 2,
    bandwidth: '',
    cps: '',
    conns: '3000conns',
    owner: 'yl'
  },
  {
    id: 3,
    name: '带宽限制',
    qosId: 1,
    bandwidth: '10Mbps',
    cps: '',
    conns: '4000conns',
    owner: 'yl'
  }
]

// 模拟获取限速策略列表API
const mockGetRateLimitList = (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟搜索过滤
      let filteredData = [...mockData]
      if (params.name) {
        filteredData = filteredData.filter(item => 
          item.name.includes(params.name)
        )
      }
      if (params.qosId) {
        filteredData = filteredData.filter(item => 
          item.qosId.toString().includes(params.qosId)
        )
      }
      
      resolve({
        data: {
          list: filteredData,
          total: filteredData.length
        }
      })
    }, 500)
  })
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchRateLimitList()
}

// 重置搜索
const handleReset = () => {
  searchForm.name = ''
  searchForm.qosId = ''
  currentPage.value = 1
  fetchRateLimitList()
}

// 新建
const handleAdd = () => {
  currentQos.value = null
  isEdit.value = false
  modalVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  currentQos.value = { ...row }
  isEdit.value = true
  modalVisible.value = true
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除限速策略"${row.name}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 模拟删除API调用
    await mockDeleteQos(row.qosId)
    ElMessage.success('删除成功')
    fetchRateLimitList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error('Error deleting QoS:', error)
    }
  }
}

// 模拟添加QoS API
const mockAddQos = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newId = Math.max(...mockData.map(item => item.id)) + 1
      const newQosId = Math.max(...mockData.map(item => item.qosId)) + 1
      
      // 将字节转换回Mbps显示
      let bandwidthDisplay = ''
      if (data.bandWidth) {
        const bytesPerSecond = parseInt(data.bandWidth)
        const mbps = Math.round(bytesPerSecond * 8 / 1000000 * 100) / 100 // 保留2位小数
        bandwidthDisplay = `${mbps}Mbps`
      }
      
      const newItem = {
        id: newId,
        name: data.name,
        qosId: newQosId,
        bandwidth: bandwidthDisplay,
        cps: data.cps ? `${data.cps}cps` : '',
        conns: data.conns ? `${data.conns}conns` : '',
        owner: data.owner
      }
      
      mockData.push(newItem)
      resolve({ 
        success: true,
        data: {
          qosId: newQosId.toString()
        }
      })
    }, 500)
  })
}

// 模拟修改QoS API
const mockModifyQos = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockData.findIndex(item => item.qosId.toString() === data.qosId)
      if (index !== -1) {
        // 将字节转换回Mbps显示
        let bandwidthDisplay = ''
        if (data.bandWidth) {
          const bytesPerSecond = parseInt(data.bandWidth)
          const mbps = Math.round(bytesPerSecond * 8 / 1000000 * 100) / 100 // 保留2位小数
          bandwidthDisplay = `${mbps}Mbps`
        }
        
        mockData[index] = {
          ...mockData[index],
          name: data.name,
          bandwidth: bandwidthDisplay,
          cps: data.cps ? `${data.cps}cps` : '',
          conns: data.conns ? `${data.conns}conns` : '',
          owner: data.owner
        }
      }
      resolve({ success: true })
    }, 500)
  })
}

// 模拟删除QoS API
const mockDeleteQos = (qosId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockData.findIndex(item => item.qosId.toString() === qosId)
      if (index !== -1) {
        mockData.splice(index, 1)
      }
      resolve({ success: true })
    }, 500)
  })
}

// 弹窗成功回调
const handleModalSuccess = () => {
  modalVisible.value = false
  fetchRateLimitList()
}

// 处理添加QoS
const handleAddQos = async (data) => {
  try {
    await mockAddQos(data)
  } catch (error) {
    console.error('Error adding QoS:', error)
  }
}

// 处理修改QoS
const handleModifyQos = async (data) => {
  try {
    await mockModifyQos(data)
  } catch (error) {
    console.error('Error modifying QoS:', error)
  }
}

// 分页大小改变
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  fetchRateLimitList()
}

// 当前页改变
const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchRateLimitList()
}

// 组件挂载
onMounted(() => {
  fetchRateLimitList()
})
</script>

<style scoped>
.rate-limit-management {
  padding: 20px;
  background: #f5f6fa;
  min-height: calc(100vh - 108px);
}

.search-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.search-form {
  margin: 0;
}

.right-actions {
  display: flex;
  gap: 10px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

:deep(.el-table) {
  background: #fff;
}

:deep(.el-table th) {
  background: #f5f7fa !important;
  color: #606266 !important;
  font-weight: 500;
}

:deep(.el-table td) {
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background: #fafafa;
}
</style>
