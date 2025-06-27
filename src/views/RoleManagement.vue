<template>
  <div class="role-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
          <el-button type="primary" @click="handleAdd">新增角色</el-button>
        </div>
      </template>
      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="角色名称">
            <el-input
              v-model="searchForm.name"
              placeholder="请输入角色名称"
              clearable
              style="max-width: 260px;"
              @keyup.enter="handleSearch"
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
        :data="filteredTableData"
        style="width: 100%; min-height: 320px;"
        v-loading="loading"
        border
        stripe
        max-height="500"
        :header-cell-style="{ position: 'sticky', top: 0, background: '#fff', zIndex: 2 }"
        row-class-name="dense-row"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="name" label="角色名称" width="140" fixed="left">
          <template #default="scope">
            <el-tooltip effect="dark" :content="scope.row.name" placement="top">
              <span class="ellipsis-cell">{{ scope.row.name }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="key" label="角色标识" width="120">
          <template #default="scope">
            <el-tooltip effect="dark" :content="scope.row.key" placement="top">
              <span class="ellipsis-cell">{{ scope.row.key }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="描述" width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #header>
            <span>状态</span>
            <el-popover
              placement="bottom"
              width="160"
              trigger="click"
              v-model:visible="statusPopoverVisible"
            >
              <div>
                <el-checkbox-group v-model="statusFilterValue">
                  <el-checkbox label="active">启用</el-checkbox>
                  <el-checkbox label="disabled">禁用</el-checkbox>
                </el-checkbox-group>
                <div class="mt-2 flex justify-end">
                  <el-button size="small" @click="resetStatusFilter">重置</el-button>
                  <el-button size="small" type="primary" @click="confirmStatusFilter">确定</el-button>
                </div>
              </div>
              <template #reference>
                <el-icon :color="statusFilterValue.length ? '#409EFF' : '#909399'" class="ml-1 cursor-pointer"><Filter /></el-icon>
              </template>
            </el-popover>
          </template>
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
              {{ scope.row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" sortable />
        <el-table-column prop="createAccount" label="创建人" width="120" />
        <el-table-column prop="updateTime" label="修改时间" width="160" sortable />
        <el-table-column prop="updateAccount" label="修改人" width="120" />
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="scope">
            <el-button type="primary" link size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="info" link size="small" @click="handleAssign(scope.row)">分配资源</el-button>
            <el-button :type="scope.row.status === 'active' ? 'danger' : 'success'" link size="small" @click="handleStatusChange(scope.row)">
              {{ scope.row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <div class="text-gray-400 py-10 text-center">暂无数据</div>
        </template>
      </el-table>
      <!-- 分页 -->
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
    </el-card>
    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" @close="handleDialogClose">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色标识" prop="key">
          <el-input v-model="form.key" placeholder="如 admin、user" />
        </el-form-item>
        <el-form-item label="描述" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 分配资源对话框 -->
    <el-dialog v-model="assignVisible" title="分配资源" width="400px">
      <el-tree
        :data="resourceTree"
        show-checkbox
        node-key="id"
        :default-checked-keys="checkedResourceKeys"
        :props="treeProps"
        style="max-height: 400px; overflow: auto;"
      />
      <template #footer>
        <el-button @click="assignVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAssignSubmit">保存</el-button>
      </template>
    </el-dialog>
    <!-- 删除确认对话框 -->
    <el-dialog v-model="deleteVisible" title="确认删除" width="400px">
      <div>确定要删除角色 <b>{{ deleteRow?.name }}</b> 吗？</div>
      <div class="text-xs text-gray-500 mt-2">ID: {{ deleteRow?.id }}</div>
      <template #footer>
        <el-button @click="deleteVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmDelete">确认删除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Filter } from '@element-plus/icons-vue'

// 雪花算法ID生成（简单模拟）
function generateSnowflakeId() {
  const timestamp = Date.now() % 1e12
  const machineId = Math.floor(Math.random() * 1024)
  const sequence = Math.floor(Math.random() * 4096)
  return `LCG${timestamp}${machineId.toString().padStart(3, '0')}${sequence.toString().padStart(4, '0')}`
}

// 搜索表单
const searchForm = reactive({
  name: '',
})

// 表格数据
const tableData = ref([])
const loading = ref(false)

// 分页
const PAGE_SIZE_KEY = 'role-management-page-size';
const defaultPageSize = Number(localStorage.getItem(PAGE_SIZE_KEY)) || 10;
const pagination = reactive({
  currentPage: 1,
  pageSize: defaultPageSize,
  total: 0
})

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref()
const deleteVisible = ref(false)
const deleteRow = ref(null)
const assignVisible = ref(false)
const assignRow = ref(null)

// 表单数据
const form = reactive({
  id: '',
  name: '',
  key: '',
  remark: '',
  status: 'active',
  createTime: '',
  createAccount: '',
  updateTime: '',
  updateAccount: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' }
  ],
  key: [
    { required: true, message: '请输入角色标识', trigger: 'blur' }
  ]
}

// 资源树（模拟）
const resourceTree = [
  {
    id: 'menu-1',
    label: '配置管理',
    children: [
      { id: 'menu-1-1', label: '地域管理' },
      { id: 'menu-1-2', label: '逻辑集群' },
      { id: 'menu-1-3', label: '逻辑集群组' },
      { id: 'menu-1-4', label: '商品套餐' }
    ]
  },
  {
    id: 'menu-2',
    label: '网元管理',
    children: [
      { id: 'menu-2-1', label: 'ADS' },
      { id: 'menu-2-2', label: 'SLB' },
      { id: 'menu-2-3', label: 'WAF' },
      { id: 'menu-2-4', label: 'WAF-CC' },
      { id: 'menu-2-5', label: '黑洞' },
      { id: 'menu-2-6', label: '流量分析' }
    ]
  },
  {
    id: 'menu-3',
    label: '客户管理'
  },
  {
    id: 'menu-4',
    label: '用户管理'
  },
  {
    id: 'menu-5',
    label: '系统管理',
    children: [
      { id: 'menu-5-1', label: '全局配置' },
      { id: 'menu-5-2', label: '角色管理' },
      { id: 'menu-5-3', label: '用户管理' }
    ]
  }
]
const treeProps = { label: 'label', children: 'children' }
const checkedResourceKeys = ref([])

// 模拟数据
const mockData = [
  {
    id: generateSnowflakeId(),
    name: '管理员',
    key: 'admin',
    remark: '系统超级管理员，拥有所有权限',
    status: 'active',
    createTime: '2024-01-01 10:00:00',
    createAccount: 'system',
    updateTime: '2024-01-10 12:00:00',
    updateAccount: 'system',
    resources: ['menu-1', 'menu-2', 'menu-3', 'menu-4', 'menu-5']
  },
  {
    id: generateSnowflakeId(),
    name: '普通用户',
    key: 'user',
    remark: '普通业务操作员',
    status: 'active',
    createTime: '2024-01-05 09:30:00',
    createAccount: 'admin',
    updateTime: '2024-01-15 14:20:00',
    updateAccount: 'admin',
    resources: ['menu-1-1', 'menu-1-2', 'menu-3', 'menu-4']
  },
  {
    id: generateSnowflakeId(),
    name: '访客',
    key: 'guest',
    remark: '只读权限',
    status: 'disabled',
    createTime: '2024-01-08 11:00:00',
    createAccount: 'admin',
    updateTime: '2024-01-20 16:00:00',
    updateAccount: 'admin',
    resources: ['menu-1-1', 'menu-3']
  }
]

// 获取数据
const fetchData = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = mockData
    pagination.total = mockData.length
    loading.value = false
  }, 500)
}

// 过滤后的表格数据
const filteredTableData = computed(() => {
  let data = tableData.value
  if (searchForm.name) {
    const query = searchForm.name.trim().toLowerCase()
    data = data.filter(item => item.name.toLowerCase().includes(query))
  }
  return data
})

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  fetchData()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    name: ''
  })
  handleSearch()
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增角色'
  Object.assign(form, {
    id: '',
    name: '',
    key: '',
    remark: '',
    status: 'active',
    createTime: '',
    createAccount: '',
    updateTime: '',
    updateAccount: ''
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑角色'
  Object.assign(form, row)
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
    pagination.total--
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
  ElMessage.success(`角色已${action}`)
}

// 提交表单
const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      const currentTime = new Date().toLocaleString()
      const currentUser = 'current_user'
      if (form.id) {
        // 编辑
        const index = tableData.value.findIndex(item => item.id === form.id)
        if (index > -1) {
          Object.assign(tableData.value[index], {
            ...form,
            updateTime: currentTime,
            updateAccount: currentUser
          })
        }
        ElMessage.success('编辑成功')
      } else {
        // 新增
        const newRole = {
          ...form,
          id: generateSnowflakeId(),
          createTime: currentTime,
          createAccount: currentUser,
          updateTime: currentTime,
          updateAccount: currentUser,
          resources: []
        }
        tableData.value.push(newRole)
        pagination.total++
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
    }
  })
}

// 分配资源
const handleAssign = (row) => {
  assignRow.value = row
  checkedResourceKeys.value = [...(row.resources || [])]
  assignVisible.value = true
}
const handleAssignSubmit = () => {
  if (assignRow.value) {
    assignRow.value.resources = [...checkedResourceKeys.value]
    assignRow.value.updateTime = new Date().toLocaleString()
    assignRow.value.updateAccount = 'current_user'
    ElMessage.success('资源分配成功')
  }
  assignVisible.value = false
}

// 对话框关闭
const handleDialogClose = () => {
  formRef.value?.resetFields()
}

// 分页
const handleSizeChange = (val) => {
  pagination.pageSize = val
  localStorage.setItem(PAGE_SIZE_KEY, val)
  handleSearch()
}
const handleCurrentChange = (val) => {
  pagination.currentPage = val
  fetchData()
}

// 状态过滤方法
const filterStatus = (value, row) => {
  return row.status === value
}

const statusPopoverVisible = ref(false)
const statusFilterValue = ref([])
function resetStatusFilter() { statusFilterValue.value = [] }
function confirmStatusFilter() { statusPopoverVisible.value = false }

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.role-management {
  padding: 0;
  margin: 0;
  background: #f5f6fa;
}

.box-card {
  margin-bottom: 0;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: 500;
  padding: 8px 0 8px 0;
}

.search-area {
  margin-bottom: 8px;
  padding: 8px 8px 0 8px;
  background: transparent;
  border-radius: 0;
}

.pagination-container {
  margin-top: 8px;
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

.text-gray-400 {
  color: #9ca3af;
}

.mt-2 {
  margin-top: 8px;
}

.ellipsis-cell {
  display: inline-block;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
}

.dense-row td {
  padding-top: 6px !important;
  padding-bottom: 6px !important;
}

.py-10 {
  padding-top: 2.5rem;
  padding-bottom: 2.5rem;
}

.text-center {
  text-align: center;
}
</style> 