<template>
  <div class="ip-protection">
    <div class="search-area">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="IP地址">
          <el-input v-model="searchForm.publicIp" placeholder="请输入IP地址" clearable />
        </el-form-item>
        <el-form-item label="业务实例">
          <el-input v-model="searchForm.instanceName" placeholder="请输入业务实例名称" clearable />
        </el-form-item>
        <el-form-item label="地址类型">
          <el-select v-model="searchForm.addressType" placeholder="请选择地址类型" clearable>
            <el-option label="全部" value="" />
            <el-option label="IPv4" value="IPv4" />
            <el-option label="IPv6" value="IPv6" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-operations">
      <el-button type="primary" @click="handleAdd">添加IP防护对象</el-button>
      <el-button type="danger" :disabled="!selectedRows.length" @click="handleBatchDelete">批量删除</el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="tableData"
      border
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="customerName" label="客户名称" min-width="150" />
      <el-table-column prop="instanceName" label="业务实例" min-width="120" />
      <el-table-column label="防护IP组" min-width="250">
        <template #default="{ row }">
          {{ row.protectionIpGroupInfo }}
        </template>
      </el-table-column>
      <el-table-column prop="addressType" label="地址类型" width="100">
        <template #default="{ row }">
          <el-tag :type="row.addressType === 'IPv4' ? 'success' : 'warning'">
            {{ row.addressType }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="防护带宽(Mbps)" width="150">
        <template #default="{ row }">
          {{ getBandwidthDisplay(row.protectionBandwidthType, row.dedicatedProtectionBandwidth, row.instanceProtectionBandwidth) }}
        </template>
      </el-table-column>
      <el-table-column label="业务带宽(Mbps)" width="150">
        <template #default="{ row }">
          {{ getBandwidthDisplay(row.businessBandwidthType, row.dedicatedBusinessBandwidth, row.instanceBusinessBandwidth) }}
        </template>
      </el-table-column>
      <el-table-column label="七层防护" width="100">
        <template #default="{ row }">
          <el-tag :type="row.layer7Protection ? 'success' : 'info'">
            {{ row.layer7Protection ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100"
        :filters="statusFilters"
        :filter-method="filterStatus"
        filter-placement="bottom-end"
        prop="status"
      >
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="240" fixed="right">
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
            @click="handleConfig(row)"
          >
            配置
          </el-button>
          <el-button 
            type="warning" 
            link
            @click="handleSecurityConfig(row)"
          >
            安全防护
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
    
    <!-- IP防护对象新增/编辑表单 -->
    <ip-protection-modal
      v-model:visible="modalVisible"
      :edit-data="currentEditData"
      @success="handleModalSuccess"
    />

    <!-- IP防护对象配置抽屉 -->
    <ip-protection-config-drawer
      v-model:visible="configDrawerVisible"
      :protection-id="currentConfigId"
      @success="handleConfigSuccess"
    />
    
    <!-- IP防护对象安全防护配置抽屉 -->
    <ip-protection-security-drawer
      v-model:visible="securityDrawerVisible"
      :protection-id="currentSecurityId"
      @success="handleSecurityConfigSuccess"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getIpProtectionList, 
  deleteIpProtection, 
  batchDeleteIpProtection,
  enableIpProtection,
  disableIpProtection
} from '@/services/ProtectionObjectService'
import { getBusinessInstanceOptions } from '@/services/BusinessInstanceService'
import IpProtectionModal from '@/components/BusinessInstance/IpProtectionModal.vue'
import IpProtectionConfigDrawer from '@/components/BusinessInstance/IpProtectionConfigDrawer.vue'
import IpProtectionSecurityDrawer from '@/components/BusinessInstance/IpProtectionSecurityDrawer.vue'

// 状态
const loading = ref(false)
const tableData = ref([])
const selectedRows = ref([])
const instanceOptions = ref([])
const modalVisible = ref(false)
const currentEditData = ref(null)

// 搜索表单
const searchForm = reactive({
  publicIp: '',
  instanceName: '',
  addressType: '',
  status: ''
})

// 分页
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 配置IP防护对象
const configDrawerVisible = ref(false)
const currentConfigId = ref(null)

// 安全防护配置
const securityDrawerVisible = ref(false)
const currentSecurityId = ref(null)

// 获取业务实例选项
const fetchInstanceOptions = async () => {
  try {
    const res = await getBusinessInstanceOptions()
    if (res.code === 200) {
      instanceOptions.value = res.data
    }
  } catch (error) {
    console.error('获取业务实例选项失败:', error)
  }
}

// 获取IP防护对象列表
const fetchIpProtectionList = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm,
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize
    }
    const res = await getIpProtectionList(params)
    if (res.code === 200) {
      tableData.value = res.data.list
      pagination.total = res.data.total
    } else {
      ElMessage.error(res.message || '获取数据失败')
    }
  } catch (error) {
    console.error('获取IP防护对象列表失败:', error)
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索方法
const handleSearch = () => {
  pagination.pageNum = 1
  fetchIpProtectionList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.publicIp = ''
  searchForm.instanceName = ''
  searchForm.addressType = ''
  handleSearch()
}

// 表格选择变化
const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

// 分页方法
const handleSizeChange = (size) => {
  pagination.pageSize = size
  fetchIpProtectionList()
}

const handleCurrentChange = (current) => {
  pagination.pageNum = current
  fetchIpProtectionList()
}

// 添加IP防护对象
const handleAdd = () => {
  currentEditData.value = null
  modalVisible.value = true
}

// 编辑IP防护对象
const handleEdit = (row) => {
  currentEditData.value = { ...row }
  modalVisible.value = true
}

// 删除IP防护对象
const handleDelete = (row) => {
  ElMessageBox.confirm('确认删除此IP防护对象吗？', '确认删除', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteIpProtection(row.id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchIpProtectionList()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (error) {
      console.error('删除IP防护对象失败:', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

// 批量删除IP防护对象
const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的记录')
    return
  }
  
  const ids = selectedRows.value.map(row => row.id)
  
  ElMessageBox.confirm(`确认删除选中的 ${ids.length} 条记录吗？`, '确认删除', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await batchDeleteIpProtection(ids)
      if (res.code === 200) {
        ElMessage.success('批量删除成功')
        fetchIpProtectionList()
      } else {
        ElMessage.error(res.message || '批量删除失败')
      }
    } catch (error) {
      console.error('批量删除IP防护对象失败:', error)
      ElMessage.error('批量删除失败')
    }
  }).catch(() => {})
}

// 启用IP防护对象
const handleEnable = async (row) => {
  try {
    const res = await enableIpProtection(row.id)
    if (res.code === 200) {
      ElMessage.success('启用成功')
      fetchIpProtectionList()
    } else {
      ElMessage.error(res.message || '启用失败')
    }
  } catch (error) {
    console.error('启用IP防护对象失败:', error)
    ElMessage.error('启用失败')
  }
}

// 禁用IP防护对象
const handleDisable = async (row) => {
  try {
    const res = await disableIpProtection(row.id)
    if (res.code === 200) {
      ElMessage.success('禁用成功')
      fetchIpProtectionList()
    } else {
      ElMessage.error(res.message || '禁用失败')
    }
  } catch (error) {
    console.error('禁用IP防护对象失败:', error)
    ElMessage.error('禁用失败')
  }
}

// 配置IP防护对象
const handleConfig = (row) => {
  currentConfigId.value = row.id
  configDrawerVisible.value = true
}

// 安全防护配置
const handleSecurityConfig = (row) => {
  currentSecurityId.value = row.id
  securityDrawerVisible.value = true
}

// 表单提交成功回调
const handleModalSuccess = () => {
  fetchIpProtectionList()
}

// 配置成功回调
const handleConfigSuccess = () => {
  fetchIpProtectionList()
}

// 安全防护配置成功回调
const handleSecurityConfigSuccess = () => {
  fetchIpProtectionList()
}

// 获取带宽显示
const getBandwidthDisplay = (type, dedicatedValue, instanceValue) => {
  if (type === 'dedicated') {
    return `${dedicatedValue} Mbps (独享)`
  } else {
    return `${instanceValue} Mbps (共享)`
  }
}

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    active: 'success',
    inactive: 'info'
  }
  return types[status] || 'info'
}

// 获取状态标签
const getStatusLabel = (status) => {
  const labels = {
    active: '已启用',
    inactive: '已禁用'
  }
  return labels[status] || '未知'
}

// 状态过滤选项
const statusFilters = [
  { text: '已启用', value: 'active' },
  { text: '已禁用', value: 'inactive' }
]

// 状态过滤方法
const filterStatus = (value, row) => {
  return row.status === value
}

// 初始化
onMounted(() => {
  fetchInstanceOptions()
  fetchIpProtectionList()
})
</script>

<style scoped>
.ip-protection {
  padding: 20px;
}

.search-area {
  margin-bottom: 20px;
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.table-operations {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-start;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>