<template>
  <div class="domain-protection">
    <div class="search-area">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="客户名称">
          <el-input v-model="searchForm.customerName" placeholder="请输入客户名称" clearable />
        </el-form-item>
        <el-form-item label="业务实例">
          <el-input v-model="searchForm.instanceName" placeholder="请输入业务实例名称" clearable />
        </el-form-item>
        <el-form-item label="防护IP组">
          <el-input v-model="searchForm.protectionIpGroupInfo" placeholder="请输入防护IP组" clearable />
        </el-form-item>
        <el-form-item label="防护域名">
          <el-input v-model="searchForm.domain" placeholder="请输入防护域名" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-operations">
      <el-button type="primary" @click="handleAdd">添加域名防护对象</el-button>
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
      <el-table-column prop="addressType" label="地址类型" width="100">
        <template #default="{ row }">
          <el-tag :type="getAddressTypeTag(row.addressType)">
            {{ row.addressType }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="protectionIpGroupInfo" label="防护IP组" min-width="140" />
      <el-table-column prop="domain" label="防护域名" min-width="150" />
      <el-table-column prop="cname" label="防护CNAME" min-width="180" />
      <el-table-column label="业务QPS" min-width="150">
        <template #default="{ row }">
          {{ getQpsDisplay(row) }}
        </template>
      </el-table-column>
      <el-table-column prop="protectionPackage" label="防护套餐" min-width="120">
        <template #default="{ row }">
          <el-tag :type="getProtectionPackageTag(row.protectionPackage)">
            {{ getProtectionPackageLabel(row.protectionPackage) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100" :filters="statusFilters" :filter-method="filterStatus">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
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
            type="primary" 
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

    <!-- 域名防护对象模态框 -->
    <DomainProtectionModal
      v-model:visible="modalVisible"
      :edit-data="currentEditData"
      @success="handleModalSuccess"
    />
    
    <!-- 域名防护对象配置抽屉 -->
    <domain-protection-config-drawer
      v-model:visible="configDrawerVisible"
      :protection-id="currentConfigId"
      @success="handleConfigSuccess"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getDomainProtectionList, 
  deleteDomainProtection, 
  batchDeleteDomainProtection,
  enableDomainProtection,
  disableDomainProtection
} from '@/services/ProtectionObjectService'
import DomainProtectionModal from '@/components/BusinessInstance/DomainProtectionModal.vue'
import DomainProtectionConfigDrawer from '@/components/BusinessInstance/DomainProtectionConfigDrawer.vue'

// 状态
const loading = ref(false)
const tableData = ref([])
const selectedRows = ref([])
const modalVisible = ref(false)
const currentEditData = ref(null)

// 配置域名防护对象
const configDrawerVisible = ref(false)
const currentConfigId = ref(null)

// 状态过滤选项
const statusFilters = [
  { text: '已启用', value: 'active' },
  { text: '已禁用', value: 'inactive' }
]

// 状态过滤方法
const filterStatus = (value, row) => {
  return row.status === value
}

// 搜索表单
const searchForm = reactive({
  customerName: '',
  instanceName: '',
  protectionIpGroupInfo: '',
  domain: '',
  status: ''
})

// 分页
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 获取域名防护对象列表
const fetchDomainProtectionList = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm,
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize
    }
    const res = await getDomainProtectionList(params)
    if (res.code === 200) {
      tableData.value = res.data.list
      pagination.total = res.data.total
    } else {
      ElMessage.error(res.message || '获取数据失败')
    }
  } catch (error) {
    console.error('获取域名防护对象列表失败:', error)
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索方法
const handleSearch = () => {
  pagination.pageNum = 1
  fetchDomainProtectionList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.customerName = ''
  searchForm.instanceName = ''
  searchForm.protectionIpGroupInfo = ''
  searchForm.domain = ''
  searchForm.status = ''
  handleSearch()
}

// 表格选择变化
const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

// 分页方法
const handleSizeChange = (size) => {
  pagination.pageSize = size
  fetchDomainProtectionList()
}

const handleCurrentChange = (page) => {
  pagination.pageNum = page
  fetchDomainProtectionList()
}

// 添加域名防护对象
const handleAdd = () => {
  currentEditData.value = null
  modalVisible.value = true
}

// 配置域名防护对象
const handleConfig = (row) => {
  currentConfigId.value = row.id
  configDrawerVisible.value = true
}

// 安全防护配置
const handleSecurityConfig = (row) => {
  ElMessage.info(`安全防护配置功能待实现: ${row.domain}`)
}

// 删除域名防护对象
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除域名防护对象 ${row.domain} 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      const res = await deleteDomainProtection(row.id)
      if (res.code === 200) {
        ElMessage.success(`删除域名防护对象 ${row.domain} 成功`)
        fetchDomainProtectionList()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (error) {
      console.error('删除域名防护对象失败:', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请至少选择一条记录')
    return
  }
  
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedRows.value.length} 条记录吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      const ids = selectedRows.value.map(item => item.id)
      const res = await batchDeleteDomainProtection(ids)
      if (res.code === 200) {
        ElMessage.success(`批量删除 ${selectedRows.value.length} 条记录成功`)
        fetchDomainProtectionList()
      } else {
        ElMessage.error(res.message || '批量删除失败')
      }
    } catch (error) {
      console.error('批量删除域名防护对象失败:', error)
      ElMessage.error('批量删除失败')
    }
  }).catch(() => {})
}

// 启用域名防护对象
const handleEnable = (row) => {
  ElMessageBox.confirm(
    `确定要启用域名防护对象 ${row.domain} 吗？`,
    '确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    }
  ).then(async () => {
    try {
      const res = await enableDomainProtection(row.id)
      if (res.code === 200) {
        ElMessage.success(`启用域名防护对象 ${row.domain} 成功`)
        fetchDomainProtectionList()
      } else {
        ElMessage.error(res.message || '启用失败')
      }
    } catch (error) {
      console.error('启用域名防护对象失败:', error)
      ElMessage.error('启用失败')
    }
  }).catch(() => {})
}

// 禁用域名防护对象
const handleDisable = (row) => {
  ElMessageBox.confirm(
    `确定要禁用域名防护对象 ${row.domain} 吗？`,
    '确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    }
  ).then(async () => {
    try {
      const res = await disableDomainProtection(row.id)
      if (res.code === 200) {
        ElMessage.success(`禁用域名防护对象 ${row.domain} 成功`)
        fetchDomainProtectionList()
      } else {
        ElMessage.error(res.message || '禁用失败')
      }
    } catch (error) {
      console.error('禁用域名防护对象失败:', error)
      ElMessage.error('禁用失败')
    }
  }).catch(() => {})
}

// 处理模态框成功
const handleModalSuccess = () => {
  fetchDomainProtectionList()
}

// 配置成功回调
const handleConfigSuccess = () => {
  fetchDomainProtectionList()
}

// 工具函数 - 状态
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

// 工具函数 - 地址类型
const getAddressTypeTag = (type) => {
  const map = {
    'IPv4': 'primary',
    'IPv6': 'success'
  }
  return map[type] || 'info'
}

// 工具函数 - 防护套餐
const getProtectionPackageTag = (type) => {
  const map = {
    'standard': 'primary',
    'enhanced': 'success'
  }
  return map[type] || 'info'
}

const getProtectionPackageLabel = (type) => {
  const map = {
    'standard': 'WAF标准防护',
    'enhanced': 'WAF增强防护'
  }
  return map[type] || type
}

// 工具函数 - QPS显示
const getQpsDisplay = (row) => {
  if (row.businessQpsType === 'shared') {
    return `共享/${row.instanceBusinessQps}`
  } else {
    return `${row.dedicatedBusinessQps}/${row.instanceBusinessQps}`
  }
}

// 初始化
onMounted(() => {
  fetchDomainProtectionList()
})
</script>

<style scoped>
.domain-protection {
  width: 100%;
}

.search-area {
  margin-bottom: 20px;
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
}

.table-operations {
  margin-bottom: 15px;
  display: flex;
  justify-content: flex-start;
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
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