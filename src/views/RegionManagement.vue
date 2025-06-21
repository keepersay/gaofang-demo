<template>
  <div class="region-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>地域管理</span>
          <el-button type="primary" @click="handleAdd">新建地域</el-button>
        </div>
      </template>
      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="名称">
            <el-input
              v-model="searchForm.name"
              placeholder="请输入地域名称"
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
        :data="tableData"
        style="width: 100%; min-height: 320px; margin-top: 20px;"
        v-loading="loading"
        border
        stripe
        max-height="500"
        :header-cell-style="{ position: 'sticky', top: 0, background: '#fff', zIndex: 2 }"
        row-class-name="dense-row"
      >
        <el-table-column prop="id" label="ID" width="180" fixed="left" />
        <el-table-column prop="name" label="名称" width="150">
          <template #default="scope">
            <el-tooltip effect="dark" :content="scope.row.name" placement="top">
              <span class="ellipsis-cell">{{ scope.row.name }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="distributed" label="分布式" width="100">
          <template #header>
            <span>分布式</span>
            <el-popover
              placement="bottom"
              width="160"
              trigger="click"
              v-model:visible="distributedPopoverVisible"
            >
              <div>
                <el-checkbox-group v-model="distributedFilterValue">
                  <el-checkbox :label="true">是</el-checkbox>
                  <el-checkbox :label="false">否</el-checkbox>
                </el-checkbox-group>
                <div class="mt-2 flex justify-end">
                  <el-button size="small" @click="resetDistributedFilter">重置</el-button>
                  <el-button size="small" type="primary" @click="confirmDistributedFilter">确定</el-button>
                </div>
              </div>
              <template #reference>
                <el-icon :color="distributedFilterValue.length ? '#409EFF' : '#909399'" class="ml-1 cursor-pointer"><Filter /></el-icon>
              </template>
            </el-popover>
          </template>
          <template #default="scope">
            <el-tag :type="scope.row.distributed ? 'success' : 'info'">
              {{ scope.row.distributed ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
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
        <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" width="160" sortable />
        <el-table-column prop="createAccount" label="创建人" width="120" />
        <el-table-column prop="updateTime" label="修改时间" width="160" sortable />
        <el-table-column prop="updateAccount" label="修改人" width="120" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button type="primary" link size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button
              :type="scope.row.status === 'active' ? 'danger' : 'success'"
              link size="small"
              @click="handleStatusChange(scope.row)"
            >
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
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑地域' : '新建地域'"
      width="500px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入地域名称" />
        </el-form-item>
        <el-form-item label="分布式" prop="distributed">
          <el-switch v-model="form.distributed" active-text="是" inactive-text="否" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注信息" />
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
      <div>确定要删除地域 <b>{{ deleteRow?.name }}</b> 吗？</div>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { Filter } from '@element-plus/icons-vue'
import RegionService from '@/services/RegionService'

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
const PAGE_SIZE_KEY = 'region-management-page-size'
const defaultPageSize = Number(localStorage.getItem(PAGE_SIZE_KEY)) || 10
const pagination = ref({
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

// 表单数据
const form = reactive({
  id: '',
  name: '',
  distributed: false,
  status: 'active',
  remark: '',
  createTime: '',
  createAccount: '',
  updateTime: '',
  updateAccount: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入地域名称', trigger: 'blur' }
  ]
}

// 获取地域数据
const fetchData = async () => {
  loading.value = true
  try {
    tableData.value = await RegionService.getRegions()
  } catch (error) {
    console.error('获取地域数据失败:', error)
    ElMessage.error('获取地域数据失败')
  } finally {
    loading.value = false
  }
}

// 过滤相关
const distributedPopoverVisible = ref(false)
const statusPopoverVisible = ref(false)
const distributedFilterValue = ref([])
const statusFilterValue = ref([])
function resetDistributedFilter() { distributedFilterValue.value = [] }
function confirmDistributedFilter() { distributedPopoverVisible.value = false }
function resetStatusFilter() { statusFilterValue.value = [] }
function confirmStatusFilter() { statusPopoverVisible.value = false }

// 排序相关
const sortState = ref({ prop: '', order: '' })
function handleSortChange({ prop, order }) {
  sortState.value = { prop, order }
}

// 过滤和排序后的表格数据
const filteredTableData = computed(() => {
  let data = tableData.value
  if (searchForm.name) {
    const query = searchForm.name.trim().toLowerCase()
    data = data.filter(item => item.name.toLowerCase().includes(query))
  }
  // 是否分布式过滤
  if (distributedFilterValue.value.length) {
    data = data.filter(item => distributedFilterValue.value.includes(item.distributed))
  }
  // 状态过滤
  if (statusFilterValue.value.length) {
    data = data.filter(item => statusFilterValue.value.includes(item.status))
  }
  // 排序
  if (sortState.value.prop && sortState.value.order) {
    data = [...data].sort((a, b) => {
      let aVal = a[sortState.value.prop]
      let bVal = b[sortState.value.prop]
      // 时间字段特殊处理
      if (sortState.value.prop === 'createTime' || sortState.value.prop === 'updateTime') {
        aVal = new Date(aVal).getTime()
        bVal = new Date(bVal).getTime()
      }
      if (sortState.value.order === 'ascending') {
        return aVal - bVal
      } else {
        return bVal - aVal
      }
    })
  }
  return data
})

// 搜索
const handleSearch = () => {
  pagination.value.currentPage = 1
  fetchData()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
  })
  handleSearch()
}

// 新增
const handleAdd = async () => {
  dialogTitle.value = '新建地域'
  Object.assign(form, {
    id: '',
    name: '',
    distributed: false,
    status: 'active',
    remark: '',
    createTime: '',
    createAccount: '',
    updateTime: '',
    updateAccount: ''
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = async (id, form) => {
  try {
    await RegionService.updateRegion(id, form)
    ElMessage.success('编辑成功')
    fetchData()
  } catch (error) {
    console.error('编辑地域失败:', error)
    ElMessage.error('编辑地域失败')
  }
}

// 删除
const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除该地域吗？', '提示', {
      type: 'warning'
    })
    await RegionService.deleteRegion(id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除地域失败:', error)
      ElMessage.error('删除地域失败')
    }
  }
}

// 状态变更
const handleStatusChange = (row) => {
  row.status = row.status === 'active' ? 'disabled' : 'active'
  row.updateTime = new Date().toLocaleString()
  row.updateAccount = 'current_user'
  const action = row.status === 'active' ? '启用' : '禁用'
  ElMessage.success(`地域已${action}`)
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
        const newRegion = {
          ...form,
          id: generateSnowflakeId(),
          createTime: currentTime,
          createAccount: currentUser,
          updateTime: currentTime,
          updateAccount: currentUser
        }
        tableData.value.push(newRegion)
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
  localStorage.setItem(PAGE_SIZE_KEY, val)
  handleSearch()
}

const handleCurrentChange = (val) => {
  pagination.value.currentPage = val
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.region-management {
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
</style> 