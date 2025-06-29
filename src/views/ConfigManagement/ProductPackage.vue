<template>
  <div class="product-package">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>商品套餐</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon> 新增套餐
            </el-button>
            <el-button @click="handleRefresh">
              <el-icon><Refresh /></el-icon> 刷新
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="套餐名">
            <el-input v-model="searchForm.packageName" placeholder="请输入套餐名" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 表格区域 -->
      <el-table 
        :data="tableData" 
        style="width: 100%; min-height: 320px;" 
        v-loading="loading"
        border
        stripe
        row-key="packageId"
      >
        <el-table-column prop="packageName" label="套餐名称" min-width="150" fixed="left" />
        <el-table-column prop="isAnycast" label="是否Anycast" width="100">
          <template #header>
            <div class="filter-header">
              是否Anycast
              <el-dropdown trigger="click" @command="handleAnycastFilterChange">
                <el-icon class="filter-icon"><Filter /></el-icon>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item :command="null">全部</el-dropdown-item>
                    <el-dropdown-item :command="true">是</el-dropdown-item>
                    <el-dropdown-item :command="false">否</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
          <template #default="scope">
            <el-tag :type="scope.row.isAnycast ? 'success' : 'info'" size="small">
              {{ scope.row.isAnycast ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="regionId" label="地域" width="100">
          <template #default="scope">
            <span v-if="!scope.row.isAnycast">{{ scope.row.regionId }}</span>
            <el-tag v-else type="info" size="small">不适用</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="addressType" label="地址类型" width="100">
          <template #header>
            <div class="filter-header">
              地址类型
              <el-dropdown trigger="click" @command="handleAddressTypeFilterChange">
                <el-icon class="filter-icon"><Filter /></el-icon>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item :command="null">全部</el-dropdown-item>
                    <el-dropdown-item :command="'IPv4'">IPv4</el-dropdown-item>
                    <el-dropdown-item :command="'IPv6'">IPv6</el-dropdown-item>
                    <el-dropdown-item :command="'dual'">双栈</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
          <template #default="scope">
            <el-tag :type="getAddressTypeTagType(scope.row.addressType)" size="small">
              {{ getAddressTypeText(scope.row.addressType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="防护配置" width="180">
          <template #default="scope">
            <div class="protection-tags">
              <el-tag v-if="scope.row.hasAdsProtection" type="success" size="small">ADS</el-tag>
              <el-tag v-if="scope.row.hasCcProtection" type="success" size="small">CC</el-tag>
              <el-tag v-if="scope.row.hasWafProtection" type="success" size="small">WAF</el-tag>
              <el-tag v-if="!scope.row.hasAdsProtection && !scope.row.hasCcProtection && !scope.row.hasWafProtection" type="info" size="small">无</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="protectionBandwidth" label="防护带宽(Mbps)" width="120" sortable />
        <el-table-column prop="businessBandwidth" label="业务带宽(Mbps)" width="120" sortable />
        <el-table-column prop="businessQps" label="业务QPS" width="100" sortable />
        <el-table-column prop="protectionIpCount" label="防护IP数" width="100" sortable />
        <el-table-column prop="protectionDomainCount" label="防护域名数" width="100" sortable />
        <el-table-column prop="portCount" label="端口数量" width="100" sortable />
        <el-table-column prop="createTime" label="创建时间" width="160">
          <template #default="scope">
            {{ formatDateTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="isActive" label="状态" width="100">
          <template #header>
            <div class="filter-header">
              状态
              <el-dropdown trigger="click" @command="handleStatusFilterChange">
                <el-icon class="filter-icon"><Filter /></el-icon>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item :command="null">全部</el-dropdown-item>
                    <el-dropdown-item :command="true">启用</el-dropdown-item>
                    <el-dropdown-item :command="false">禁用</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
          <template #default="scope">
            <el-switch
              v-model="scope.row.isActive"
              @change="handleStatusChange(scope.row)"
              active-text="启用"
              inactive-text="禁用"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" text @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="success" text @click="handleCopy(scope.row)">复制</el-button>
            <el-button size="small" type="danger" text @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="650px"
      @close="handleDialogClose"
      destroy-on-close
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息" name="basic">
            <el-form-item label="套餐名称" prop="packageName">
              <el-input v-model="form.packageName" placeholder="请输入套餐名称" />
            </el-form-item>
            <el-form-item label="状态" prop="isActive">
              <el-switch v-model="form.isActive" active-text="启用" inactive-text="禁用" />
            </el-form-item>
          </el-tab-pane>
          
          <el-tab-pane label="部署配置" name="deployment">
            <el-form-item label="是否Anycast" prop="isAnycast">
              <el-radio-group v-model="form.isAnycast">
                <el-radio :label="true">是</el-radio>
                <el-radio :label="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item label="地域" prop="regionId" v-if="!form.isAnycast">
              <el-select v-model="form.regionId" placeholder="请选择地域" style="width: 100%">
                <el-option v-for="region in regionOptions" :key="region.value" :label="region.label" :value="region.value" />
              </el-select>
        </el-form-item>
            
            <el-form-item label="地址类型" prop="addressType">
              <el-select v-model="form.addressType" placeholder="请选择地址类型" style="width: 100%">
                <el-option label="IPv4" value="IPv4" />
                <el-option label="IPv6" value="IPv6" />
                <el-option label="双栈" value="dual" />
          </el-select>
        </el-form-item>
          </el-tab-pane>
          
          <el-tab-pane label="防护配置" name="protection">
            <el-form-item label="ADS防护" prop="hasAdsProtection">
              <el-switch v-model="form.hasAdsProtection" />
            </el-form-item>
            
            <el-form-item label="CC防护" prop="hasCcProtection">
              <el-switch v-model="form.hasCcProtection" />
            </el-form-item>
            
            <el-form-item label="WAF防护" prop="hasWafProtection">
              <el-switch v-model="form.hasWafProtection" />
            </el-form-item>
          </el-tab-pane>
          
          <el-tab-pane label="资源配置" name="resource">
        <el-form-item label="防护带宽" prop="protectionBandwidth">
              <el-input-number v-model="form.protectionBandwidth" :min="1" :max="10000" style="width: 100%" />
              <span class="unit-label">Mbps</span>
        </el-form-item>
            
        <el-form-item label="业务带宽" prop="businessBandwidth">
          <el-input-number v-model="form.businessBandwidth" :min="1" :max="10000" style="width: 100%" />
              <span class="unit-label">Mbps</span>
        </el-form-item>
            
            <el-form-item label="业务QPS" prop="businessQps">
              <el-input-number v-model="form.businessQps" :min="1" :max="100000" style="width: 100%" />
        </el-form-item>
            
            <el-form-item label="防护IP数" prop="protectionIpCount">
              <el-input-number v-model="form.protectionIpCount" :min="1" :max="1000" style="width: 100%" />
              <span class="unit-label">个</span>
        </el-form-item>
            
            <el-form-item label="防护域名数" prop="protectionDomainCount">
              <el-input-number v-model="form.protectionDomainCount" :min="1" :max="1000" style="width: 100%" />
              <span class="unit-label">个</span>
        </el-form-item>
            
            <el-form-item label="端口数量" prop="portCount">
              <el-input-number v-model="form.portCount" :min="1" :max="1000" style="width: 100%" />
              <span class="unit-label">个</span>
        </el-form-item>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, Filter } from '@element-plus/icons-vue'

// 搜索表单
const searchForm = reactive({
  packageName: '',
})

// 表格数据
const tableData = ref([])
const loading = ref(false)

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref()
const activeTab = ref('basic')

// 表单数据
const form = reactive({
  packageId: '',
  packageName: '',
  isAnycast: false,
  regionId: 'cn-beijing',
  addressType: 'IPv4',
  hasAdsProtection: false,
  hasCcProtection: false,
  hasWafProtection: false,
  protectionBandwidth: 100,
  businessBandwidth: 50,
  businessQps: 1000,
  protectionIpCount: 5,
  protectionDomainCount: 3,
  portCount: 10,
  isActive: true,
  createTime: '',
  updateTime: ''
})

// 地域选项
const regionOptions = [
  { label: '华北（北京）', value: 'cn-beijing' },
  { label: '华东（杭州）', value: 'cn-hangzhou' },
  { label: '华南（广州）', value: 'cn-guangzhou' },
  { label: '西南（成都）', value: 'cn-chengdu' }
]

// 表单验证规则
const rules = {
  packageName: [
    { required: true, message: '请输入套餐名称', trigger: 'blur' }
  ],
  addressType: [
    { required: true, message: '请选择地址类型', trigger: 'change' }
  ],
  regionId: [
    { required: true, message: '请选择地域', trigger: 'change' }
  ]
}

// 雪花算法ID生成（简单模拟）
function generateSnowflakeId() {
  const timestamp = Date.now() % 1e12
  const machineId = Math.floor(Math.random() * 1024)
  const sequence = Math.floor(Math.random() * 4096)
  return `PKG${timestamp}${machineId.toString().padStart(3, '0')}${sequence.toString().padStart(4, '0')}`
}

// 格式化日期时间
function formatDateTime(dateString) {
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

// 获取地址类型文本
function getAddressTypeText(type) {
  const types = {
    'IPv4': 'IPv4',
    'IPv6': 'IPv6',
    'dual': '双栈'
  }
  return types[type] || type
}

// 获取地址类型标签类型
function getAddressTypeTagType(type) {
  const types = {
    'IPv4': 'primary',
    'IPv6': 'success',
    'dual': 'warning'
  }
  return types[type] || 'info'
}

// 模拟数据
const mockData = [
  {
    packageId: generateSnowflakeId(),
    packageName: '基础防护套餐',
    isAnycast: false,
    regionId: 'cn-beijing',
    addressType: 'IPv4',
    hasAdsProtection: true,
    hasCcProtection: false,
    hasWafProtection: false,
    protectionBandwidth: 100,
    businessBandwidth: 50,
    businessQps: 1000,
    protectionIpCount: 5,
    protectionDomainCount: 3,
    portCount: 10,
    isActive: true,
    createTime: '2024-05-01T10:30:00',
    updateTime: '2024-05-01T10:30:00'
  },
  {
    packageId: generateSnowflakeId(),
    packageName: '标准防护套餐',
    isAnycast: false,
    regionId: 'cn-hangzhou',
    addressType: 'IPv4',
    hasAdsProtection: true,
    hasCcProtection: true,
    hasWafProtection: false,
    protectionBandwidth: 200,
    businessBandwidth: 100,
    businessQps: 2000,
    protectionIpCount: 10,
    protectionDomainCount: 5,
    portCount: 15,
    isActive: true,
    createTime: '2024-05-02T09:15:00',
    updateTime: '2024-05-02T09:15:00'
  },
  {
    packageId: generateSnowflakeId(),
    packageName: '高级防护套餐',
    isAnycast: true,
    regionId: '',
    addressType: 'dual',
    hasAdsProtection: true,
    hasCcProtection: true,
    hasWafProtection: true,
    protectionBandwidth: 500,
    businessBandwidth: 200,
    businessQps: 5000,
    protectionIpCount: 20,
    protectionDomainCount: 10,
    portCount: 30,
    isActive: true,
    createTime: '2024-05-03T11:45:00',
    updateTime: '2024-05-03T11:45:00'
  },
  {
    packageId: generateSnowflakeId(),
    packageName: 'IPv6专享套餐',
    isAnycast: false,
    regionId: 'cn-guangzhou',
    addressType: 'IPv6',
    hasAdsProtection: true,
    hasCcProtection: true,
    hasWafProtection: false,
    protectionBandwidth: 300,
    businessBandwidth: 150,
    businessQps: 3000,
    protectionIpCount: 15,
    protectionDomainCount: 8,
    portCount: 20,
    isActive: false,
    createTime: '2024-05-04T14:20:00',
    updateTime: '2024-05-04T14:20:00'
  }
]

// 移除之前的过滤方法，添加新的过滤变量和方法
const anycastFilter = ref(null)
const addressTypeFilter = ref(null)
const statusFilter = ref(null)

// 处理是否Anycast过滤
const handleAnycastFilterChange = (value) => {
  anycastFilter.value = value
  filterData()
}

// 处理地址类型过滤
const handleAddressTypeFilterChange = (value) => {
  addressTypeFilter.value = value
  filterData()
}

// 处理状态过滤
const handleStatusFilterChange = (value) => {
  statusFilter.value = value
  filterData()
}

// 过滤数据
const filterData = () => {
  let filteredData = [...mockData]
  
  if (searchForm.packageName) {
    filteredData = filteredData.filter(item => 
      item.packageName.toLowerCase().includes(searchForm.packageName.toLowerCase())
    )
  }
  
  if (anycastFilter.value !== null) {
    filteredData = filteredData.filter(item => item.isAnycast === anycastFilter.value)
  }
  
  if (addressTypeFilter.value) {
    filteredData = filteredData.filter(item => item.addressType === addressTypeFilter.value)
  }
  
  if (statusFilter.value !== null) {
    filteredData = filteredData.filter(item => item.isActive === statusFilter.value)
  }
  
  tableData.value = filteredData
  pagination.total = filteredData.length
}

// 修改获取数据方法
const fetchData = () => {
  loading.value = true
  setTimeout(() => {
    filterData()
    loading.value = false
  }, 500)
}

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  fetchData()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    packageName: '',
  })
  handleSearch()
}

// 刷新
const handleRefresh = () => {
  fetchData()
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增套餐'
  Object.assign(form, {
    packageId: '',
    packageName: '',
    isAnycast: false,
    regionId: 'cn-beijing',
    addressType: 'IPv4',
    hasAdsProtection: false,
    hasCcProtection: false,
    hasWafProtection: false,
    protectionBandwidth: 100,
    businessBandwidth: 50,
    businessQps: 1000,
    protectionIpCount: 5,
    protectionDomainCount: 3,
    portCount: 10,
    isActive: true,
    createTime: '',
    updateTime: ''
  })
  activeTab.value = 'basic'
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑套餐'
  Object.assign(form, JSON.parse(JSON.stringify(row)))
  activeTab.value = 'basic'
  dialogVisible.value = true
}

// 复制
const handleCopy = (row) => {
  dialogTitle.value = '复制套餐'
  const copyData = JSON.parse(JSON.stringify(row))
  copyData.packageId = ''
  copyData.packageName = `${copyData.packageName}-复制`
  copyData.createTime = ''
  copyData.updateTime = ''
  Object.assign(form, copyData)
  activeTab.value = 'basic'
  dialogVisible.value = true
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除套餐"${row.packageName}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    const index = tableData.value.findIndex(item => item.packageId === row.packageId)
    if (index > -1) {
      tableData.value.splice(index, 1)
      pagination.total--
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

// 状态变更
const handleStatusChange = (row) => {
  ElMessage.success(`${row.packageName}已${row.isActive ? '启用' : '禁用'}`)
}

// 提交表单
const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      const now = new Date().toISOString()
      
      if (form.packageId) {
        // 编辑
        const index = tableData.value.findIndex(item => item.packageId === form.packageId)
        if (index > -1) {
          form.updateTime = now
          Object.assign(tableData.value[index], JSON.parse(JSON.stringify(form)))
        }
        ElMessage.success('编辑成功')
      } else {
        // 新增
        const newPackage = JSON.parse(JSON.stringify(form))
        newPackage.packageId = generateSnowflakeId()
        newPackage.createTime = now
        newPackage.updateTime = now
        tableData.value.unshift(newPackage)
        pagination.total++
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
    }
  })
}

// 对话框关闭
const handleDialogClose = () => {
  formRef.value?.resetFields()
}

// 分页
const handleSizeChange = (val) => {
  pagination.pageSize = val
  fetchData()
}

const handleCurrentChange = (val) => {
  pagination.currentPage = val
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.product-package {
  padding: 20px;
}

.box-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.search-area {
  margin-bottom: 20px;
}

.search-form {
  margin-bottom: 0;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.protection-tags {
  display: flex;
  gap: 5px;
}

.unit-label {
  margin-left: 10px;
  color: #606266;
}

.filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
}

.filter-icon {
  cursor: pointer;
  margin-left: 2px;
  font-size: 12px;
}
</style> 