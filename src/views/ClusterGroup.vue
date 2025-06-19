<template>
  <div class="cluster-management">
    <div class="page-header">
      <h2>逻辑集群</h2>
      <el-button type="primary" @click="handleAdd">新建集群</el-button>
    </div>

    <div class="search-area">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="名称">
          <el-input v-model="searchForm.name" placeholder="请输入集群名称" clearable />
        </el-form-item>
        <el-form-item label="地域">
          <el-select v-model="searchForm.region" placeholder="请选择地域" clearable :loading="loading.regions">
            <el-option
              v-for="region in regions"
              :key="region.id"
              :label="region.name"
              :value="region.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table :data="tableData" style="width: 100%" v-loading="loading.table" border stripe>
      <el-table-column prop="id" label="ID" width="220" fixed="left" />
      <el-table-column prop="name" label="名称" width="180" />
      <el-table-column prop="displayName" label="显示名称" width="180" />
      <el-table-column prop="region" label="地域" width="150">
        <template #default="scope">
          {{ getRegionName(scope.row.region) }}
        </template>
      </el-table-column>
      <el-table-column prop="provider" label="服务商" width="120" />
      <el-table-column prop="type" label="类型" width="120">
        <template #default="scope">
          <el-tag :type="getTypeTagType(scope.row.type)">
            {{ getTypeLabel(scope.row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
            {{ scope.row.status === 'active' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
      <el-table-column prop="createTime" label="创建时间" width="160" sortable />
      <el-table-column prop="createAccount" label="创建人" width="120" />
      <el-table-column prop="updateTime" label="修改时间" width="160" sortable />
      <el-table-column prop="updateAccount" label="修改人" width="120" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
          <el-button
            :type="scope.row.status === 'active' ? 'danger' : 'success'"
            link
            @click="handleStatusChange(scope.row)"
          >
            {{ scope.row.status === 'active' ? '禁用' : '启用' }}
          </el-button>
          <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑集群' : '新建集群'"
      width="600px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入集群名称，例如：huadong-telecom-premium" />
        </el-form-item>
        <el-form-item label="显示名称" prop="displayName">
          <el-input v-model="form.displayName" placeholder="请输入显示名称，例如：华东-电信-高级版" />
        </el-form-item>
        <el-form-item label="地域" prop="region">
          <el-select v-model="form.region" placeholder="请选择地域" style="width: 100%" :loading="loading.regions">
            <el-option
              v-for="region in regions"
              :key="region.id"
              :label="region.name"
              :value="region.id"
              :disabled="region.status !== 'active'"
            >
              <span>{{ region.name }}</span>
              <el-tag size="small" type="info" class="ml-2" v-if="region.distributed">分布式</el-tag>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="服务商" prop="provider">
          <el-select v-model="form.provider" placeholder="请选择服务商" style="width: 100%">
            <el-option label="电信" value="telecom" />
            <el-option label="联通" value="unicom" />
            <el-option label="移动" value="mobile" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择类型" style="width: 100%">
            <el-option label="基础版" value="basic" />
            <el-option label="标准版" value="standard" />
            <el-option label="高级版" value="premium" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input 
            v-model="form.remark" 
            type="textarea" 
            :rows="3"
            placeholder="请输入备注信息" 
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog v-model="deleteVisible" title="确认删除" width="400px">
      <div>确定要删除集群 <b>{{ deleteRow?.displayName }}</b> 吗？</div>
      <div class="text-xs text-gray-500 mt-2">ID: {{ deleteRow?.id }}</div>
      <template #footer>
        <el-button @click="deleteVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmDelete">确认删除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import RegionService from '@/services/RegionService'

// 生成雪花算法ID
function generateSnowflakeId() {
  const timestamp = Date.now() % 1e12
  const machineId = Math.floor(Math.random() * 1024)
  const sequence = Math.floor(Math.random() * 4096)
  return `LC${timestamp}${machineId.toString().padStart(3, '0')}${sequence.toString().padStart(4, '0')}`
}

const loading = ref({
  regions: false,
  table: false
})
const dialogVisible = ref(false)
const isEdit = ref(false)
const deleteVisible = ref(false)
const deleteRow = ref(null)
const regions = ref([])
const formRef = ref()

// 搜索表单
const searchForm = ref({
  name: '',
  region: ''
})

// 表单数据
const form = ref({
  name: '',
  displayName: '',
  region: '',
  provider: '',
  type: '',
  status: 'active',
  remark: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入集群名称', trigger: 'blur' },
    { pattern: /^[a-z0-9-]+$/, message: '只能包含小写字母、数字和连字符', trigger: 'blur' },
    { min: 3, max: 50, message: '长度在 3 到 50 个字符', trigger: 'blur' }
  ],
  displayName: [
    { required: true, message: '请输入显示名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  region: [
    { required: true, message: '请选择地域', trigger: 'change' }
  ],
  provider: [
    { required: true, message: '请选择服务商', trigger: 'change' }
  ],
  type: [
    { required: true, message: '请选择类型', trigger: 'change' }
  ],
  remark: [
    { max: 200, message: '长度不能超过 200 个字符', trigger: 'blur' }
  ]
}

// 表格数据
const tableData = ref([
  {
    id: generateSnowflakeId(),
    name: 'huadong-telecom-premium',
    displayName: '华东-电信-高级版',
    region: 'EAST_CHINA',
    provider: 'telecom',
    type: 'premium',
    status: 'active',
    remark: '华东地区电信高级版集群',
    createTime: '2024-01-01 10:00:00',
    createAccount: 'admin',
    updateTime: '2024-01-01 10:00:00',
    updateAccount: 'admin'
  },
  {
    id: generateSnowflakeId(),
    name: 'huanan-unicom-basic',
    displayName: '华南-联通-基础版',
    region: 'SOUTH_CHINA',
    provider: 'unicom',
    type: 'basic',
    status: 'active',
    remark: '华南地区联通基础版集群',
    createTime: '2024-01-02 14:30:00',
    createAccount: 'admin',
    updateTime: '2024-01-02 14:30:00',
    updateAccount: 'admin'
  }
])

// 分页
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 获取地域名称
const getRegionName = (regionId) => {
  const region = regions.value.find(r => r.id === regionId)
  return region ? region.name : '-'
}

// 获取类型标签样式
const getTypeTagType = (type) => {
  const typeMap = {
    basic: 'info',
    standard: 'warning',
    premium: 'success'
  }
  return typeMap[type] || 'info'
}

// 获取类型标签文本
const getTypeLabel = (type) => {
  const typeMap = {
    basic: '基础版',
    standard: '标准版',
    premium: '高级版'
  }
  return typeMap[type] || type
}

// 获取地域数据
const fetchRegions = async () => {
  loading.value.regions = true
  try {
    regions.value = await RegionService.getRegions()
  } catch (error) {
    console.error('获取地域数据失败:', error)
  } finally {
    loading.value.regions = false
  }
}

// 搜索
const handleSearch = () => {
  // 实现搜索逻辑
}

// 重置搜索
const handleReset = () => {
  searchForm.value.name = ''
  searchForm.value.region = ''
  handleSearch()
}

// 新增
const handleAdd = () => {
  isEdit.value = false
  form.value = {
    name: '',
    displayName: '',
    region: '',
    provider: '',
    type: '',
    status: 'active',
    remark: ''
  }
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  isEdit.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

// 删除
const handleDelete = (row) => {
  deleteRow.value = row
  deleteVisible.value = true
}

// 确认删除
const confirmDelete = () => {
  const index = tableData.value.findIndex(item => item.id === deleteRow.value.id)
  if (index > -1) {
    tableData.value.splice(index, 1)
    pagination.value.total--
    ElMessage.success('删除成功')
  }
  deleteVisible.value = false
}

// 状态变更
const handleStatusChange = (row) => {
  row.status = row.status === 'active' ? 'disabled' : 'active'
  row.updateTime = new Date().toLocaleString()
  row.updateAccount = 'current_user'
  const action = row.status === 'active' ? '启用' : '禁用'
  ElMessage.success(`集群已${action}`)
}

// 提交表单
const handleSubmit = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      const currentTime = new Date().toLocaleString()
      if (isEdit.value) {
        // 编辑
        const index = tableData.value.findIndex(item => item.id === form.value.id)
        if (index > -1) {
          tableData.value[index] = {
            ...tableData.value[index],
            ...form.value,
            updateTime: currentTime,
            updateAccount: 'current_user'
          }
        }
        ElMessage.success('编辑成功')
      } else {
        // 新增
        const newData = {
          ...form.value,
          id: generateSnowflakeId(),
          createTime: currentTime,
          createAccount: 'current_user',
          updateTime: currentTime,
          updateAccount: 'current_user'
        }
        tableData.value.push(newData)
        pagination.value.total++
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
  pagination.value.pageSize = val
  handleSearch()
}

const handleCurrentChange = (val) => {
  pagination.value.currentPage = val
  handleSearch()
}

onMounted(() => {
  fetchRegions()
  pagination.value.total = tableData.value.length
})
</script>

<style scoped>
.cluster-management {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
}

.search-area {
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
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

.text-xs {
  font-size: 12px;
}

.text-gray-500 {
  color: #6b7280;
}

.mt-2 {
  margin-top: 8px;
}

.ml-2 {
  margin-left: 8px;
}
</style> 