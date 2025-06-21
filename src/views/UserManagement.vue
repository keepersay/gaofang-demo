<template>
  <div class="user-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" @click="onCreate">新增用户</el-button>
        </div>
      </template>
      
        <UserTable
          :data="pagedData"
          :total="filteredData.length"
          :current-page="currentPage"
          :page-size="pageSize"
          :search-query="searchQuery"
          :filtered-role="filters.role"
          :filtered-status="filters.status"
          @edit="onEdit"
          @disable_enable="onDisableEnable"
          @delete="onDelete"
          @search="onSearch"
          @page-change="onPageChange"
          @size-change="onPageSizeChange"
          @filter-change="onFilterChange"
          @sort-change="onSortChange"
        />

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredData.length"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="onPageSizeChange"
          @current-change="onPageChange"
        />
      </div>
      </el-card>

      <UserModal
        :visible="modalVisible"
        :is-edit="isEdit"
        :edit-data="editData"
        @close="modalVisible = false"
        @submit="handleModalSubmit"
      />

      <el-dialog v-model="deleteVisible" title="确认删除" width="400px">
        <div>确定要删除用户 <b>{{ deleteRow?.username }}</b> 吗？</div>
        <div class="text-xs text-gray-500 mt-2">ID: {{ deleteRow?.id }}</div>
        <template #footer>
          <el-button @click="deleteVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmDelete">确认删除</el-button>
        </template>
      </el-dialog>

      <el-dialog v-model="disableEnableVisible" :title="disableEnableRow?.status === 'active' ? '确认禁用' : '确认启用'" width="400px">
        <div>确定要{{ disableEnableRow?.status === 'active' ? '禁用' : '启用' }}用户 <b>{{ disableEnableRow?.username }}</b> 吗？</div>
        <div class="text-xs text-gray-500 mt-2">ID: {{ disableEnableRow?.id }}</div>
        <template #footer>
          <el-button @click="disableEnableVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmDisableEnable">确认</el-button>
        </template>
      </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import UserTable from '../components/UserManagement/UserTable.vue'
import UserModal from '../components/UserManagement/UserModal.vue'

// 雪花算法ID生成（简单模拟）
function generateSnowflakeId() {
  const timestamp = Date.now() % 1e12
  const machineId = Math.floor(Math.random() * 1024)
  const sequence = Math.floor(Math.random() * 4096)
  return `LCG${timestamp}${machineId.toString().padStart(3, '0')}${sequence.toString().padStart(4, '0')}`
}

// Mock data for users
const usersData = ref([
  {
    id: generateSnowflakeId(),
    username: 'ABC',
    password: 'password123',
    confirmPassword: 'password123',
    name: '张三',
    email: 'hi@gmail.com',
    phone: '18888888888',
    role: 'admin',
    status: 'active',
    creator: 'Admin',
    createdAt: '2023-05-01',
    notes: '12345'
  },
  {
    id: generateSnowflakeId(),
    username: 'DEF',
    password: 'password123',
    confirmPassword: 'password123',
    name: '李四',
    email: 'li@example.com',
    phone: '13333333333',
    role: 'readonly',
    status: 'disabled',
    creator: 'Admin',
    createdAt: '2023-06-15',
    notes: '测试用户'
  }
])

// Search, filter, sort, pagination states
const searchQuery = ref('')
const filters = ref({ role: [], status: [] })
const sort = ref({ prop: '', order: '' })
const currentPage = ref(1)
const pageSize = ref(10)

// Computed data for table
const filteredData = computed(() => {
  let data = usersData.value

  console.log('filteredData: Starting filter with searchQuery:', searchQuery.value, 'and filters:', filters.value);

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    data = data.filter(
      (item) =>
        item.username.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query) ||
        item.phone.includes(query)
    )
  }
  console.log('filteredData: After search filter, data count:', data.length);

  // Role filter
  if (filters.value.role && filters.value.role.length) {
    data = data.filter((item) => {
      const itemRole = String(item.role).toLowerCase().trim();
      return filters.value.role.map(f => String(f).toLowerCase().trim()).includes(itemRole);
    });
  }
  console.log('filteredData: After role filter, data count:', data.length);

  // Status filter
  if (filters.value.status && filters.value.status.length) {
    data = data.filter((item) => {
      const itemStatus = String(item.status).toLowerCase().trim();
      return filters.value.status.map(f => String(f).toLowerCase().trim()).includes(itemStatus);
    });
  }
  console.log('filteredData: After status filter, data count:', data.length);

  // Sort
  if (sort.value.prop) {
    data = [...data].sort((a, b) => {
      const aVal = a[sort.value.prop]
      const bVal = b[sort.value.prop]

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sort.value.order === 'ascending'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }
      return 0
    })
  }

  return data
})

const pagedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredData.value.slice(start, start + pageSize.value)
})

// Modal/Dialog states
const modalVisible = ref(false)
const isEdit = ref(false)
const editData = ref(null)
const deleteVisible = ref(false)
const deleteRow = ref(null)
const disableEnableVisible = ref(false)
const disableEnableRow = ref(null)

// Event handlers from UserTable
function onCreate() {
  isEdit.value = false
  editData.value = null
  modalVisible.value = true
}

function onEdit(row) {
  isEdit.value = true
  editData.value = { ...row }
  modalVisible.value = true
}

function onDisableEnable(row) {
  disableEnableRow.value = row
  disableEnableVisible.value = true
}

function onDelete(row) {
  deleteRow.value = row
  deleteVisible.value = true
}

function onSearch(query) {
  searchQuery.value = query
  currentPage.value = 1
}

function onPageChange(page) {
  currentPage.value = page
}

function onPageSizeChange(size) {
  pageSize.value = size
  currentPage.value = 1
}

function onFilterChange(filterData) {
  filters.value = { ...filters.value, ...filterData }
  currentPage.value = 1
}

function onSortChange(sortData) {
  sort.value = sortData
}

// Modal submit handler
function handleModalSubmit(formData) {
  if (isEdit.value) {
    // Edit existing user
    const index = usersData.value.findIndex(user => user.id === editData.value.id)
    if (index !== -1) {
      usersData.value[index] = { ...usersData.value[index], ...formData }
      ElMessage.success('用户更新成功')
    }
  } else {
    // Create new user
    const newUser = {
      ...formData,
      id: generateSnowflakeId(),
      creator: 'Admin',
      createdAt: new Date().toISOString().split('T')[0]
    }
    usersData.value.push(newUser)
    ElMessage.success('用户创建成功')
  }
  modalVisible.value = false
}

// Confirm delete
function confirmDelete() {
  const index = usersData.value.findIndex(user => user.id === deleteRow.value.id)
  if (index !== -1) {
    usersData.value.splice(index, 1)
    ElMessage.success('用户删除成功')
  }
  deleteVisible.value = false
}

// Confirm disable/enable
function confirmDisableEnable() {
  const index = usersData.value.findIndex(user => user.id === disableEnableRow.value.id)
  if (index !== -1) {
    usersData.value[index].status = disableEnableRow.value.status === 'active' ? 'disabled' : 'active'
    const action = usersData.value[index].status === 'active' ? '启用' : '禁用'
    ElMessage.success(`用户已${action}`)
  }
  disableEnableVisible.value = false
}
</script>

<style scoped>
.user-management {
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

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
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
</style> 