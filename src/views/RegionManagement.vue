<template>
  <div class="region-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>地域</span>
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
      <!-- 表格区域 - 改为树形表格 -->
      <el-table
        :data="filteredTableData"
        style="width: 100%; min-height: 500px; margin-top: 20px;"
        v-loading="loading"
        border
        stripe
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        max-height="700"
        :header-cell-style="{ position: 'sticky', top: 0, background: '#fff', zIndex: 2 }"
        row-class-name="dense-row"
      >
        <el-table-column prop="id" label="ID" width="120" fixed="left" />
        <el-table-column prop="code" label="代码" width="80" />
        <el-table-column prop="name" label="名称" width="150">
          <template #default="scope">
            <el-tooltip effect="dark" :content="scope.row.name" placement="top">
              <span class="ellipsis-cell">{{ scope.row.name }}</span>
            </el-tooltip>
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
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column prop="createAccount" label="创建人" width="120" />
        <el-table-column prop="updateTime" label="修改时间" width="160" />
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
    </el-card>
    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑地域' : '新建地域'"
      width="500px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="父级节点" prop="pid">
          <el-cascader
            v-model="form.pid"
            :options="regionOptions"
            :props="{ 
              checkStrictly: true,
              value: 'id',
              label: 'name',
              emitPath: false
            }"
            placeholder="请选择父级节点"
            clearable
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="代码" prop="code">
          <el-input v-model="form.code" placeholder="请输入地域代码（如PEK）" />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入地域名称" />
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

// 表格数据和树形数据
const tableData = ref([])
const loading = ref(false)
const isEdit = ref(false)
const regionTree = ref([])

// 对话框
const dialogVisible = ref(false)
const formRef = ref()
const deleteVisible = ref(false)
const deleteRow = ref(null)

// 表单数据
const form = reactive({
  id: '',
  pid: '0', // 默认为根节点
  code: '',
  name: '',
  status: 'active',
  remark: '',
  createTime: '',
  createAccount: '',
  updateTime: '',
  updateAccount: ''
})

// 表单验证规则
const rules = {
  pid: [
    { required: true, message: '请选择父级节点', trigger: 'change' }
  ],
  code: [
    { required: true, message: '请输入地域代码', trigger: 'blur' },
    { pattern: /^[A-Z0-9]{1,10}$/, message: '代码必须是1-10位大写字母或数字', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入地域名称', trigger: 'blur' }
  ]
}

// 过滤相关
const statusPopoverVisible = ref(false)
const statusFilterValue = ref([])
function resetStatusFilter() { statusFilterValue.value = [] }
function confirmStatusFilter() { statusPopoverVisible.value = false }

// 级联选择器的选项，用于选择父节点
const regionOptions = computed(() => {
  // 添加一个"根节点"选项
  return [
    {
      id: '0',
      name: '根节点',
      children: regionTree.value
    }
  ]
})

// 获取地域树形数据
const fetchRegionTree = async () => {
  loading.value = true
  try {
    regionTree.value = await RegionService.getRegionTree()
    loading.value = false
  } catch (error) {
    console.error('获取地域树形数据失败:', error)
    loading.value = false
  }
}

// 获取地域数据（扁平化列表，用于表格展示）
const fetchData = async () => {
  loading.value = true
  try {
    // 获取树形数据
    regionTree.value = await RegionService.getRegionTree()
    // 将树形数据用于表格展示
    tableData.value = regionTree.value
    loading.value = false
  } catch (error) {
    console.error('获取地域数据失败:', error)
    loading.value = false
  }
}

// 过滤后的表格数据
const filteredTableData = computed(() => {
  let data = tableData.value
  // 根据名称过滤
  if (searchForm.name) {
    // 这里的过滤需要考虑树形结构，所以暂时简单处理
    const searchName = searchForm.name.toLowerCase()
    return data.filter(item => item.name.toLowerCase().includes(searchName))
  }
  // 根据状态过滤
  if (statusFilterValue.value.length) {
    return data.filter(item => statusFilterValue.value.includes(item.status))
  }
  return data
})

// 搜索
const handleSearch = () => {
  // 简单处理，调用 fetchData 重新获取数据
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
  isEdit.value = false
  Object.assign(form, {
    id: '',
    pid: '0',
    code: '',
    name: '',
    status: 'active',
    remark: '',
    createTime: '',
    createAccount: '',
    updateTime: '',
    updateAccount: ''
  })
  // 先获取最新的地域树，用于选择父节点
  await fetchRegionTree()
  dialogVisible.value = true
}

// 编辑
const handleEdit = async (row) => {
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    pid: row.pid,
    code: row.code,
    name: row.name,
    status: row.status,
    remark: row.remark
  })
  // 先获取最新的地域树，用于选择父节点
  await fetchRegionTree()
  dialogVisible.value = true
}

// 删除
const handleDelete = (row) => {
  deleteRow.value = row
  deleteVisible.value = true
}

// 确认删除
const confirmDelete = async () => {
  try {
    const result = await RegionService.deleteRegion(deleteRow.value.id)
    if (result.success) {
      ElMessage.success('删除成功')
      fetchData() // 重新获取数据
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    console.error('删除地域失败:', error)
    ElMessage.error('删除地域失败')
  }
  deleteVisible.value = false
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
const handleSubmit = async () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      if (isEdit.value) {
        // 编辑
        try {
          await RegionService.updateRegion(form.id, form)
          ElMessage.success('编辑成功')
          dialogVisible.value = false
          fetchData() // 重新获取数据
        } catch (error) {
          console.error('编辑地域失败:', error)
          ElMessage.error('编辑地域失败')
        }
      } else {
        // 新增
        try {
          await RegionService.addRegion(form)
          ElMessage.success('新增成功')
          dialogVisible.value = false
          fetchData() // 重新获取数据
        } catch (error) {
          console.error('新增地域失败:', error)
          ElMessage.error('新增地域失败')
        }
      }
    }
  })
}

// 对话框关闭
const handleDialogClose = () => {
  formRef.value?.resetFields()
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
  min-height: calc(100vh - 60px);
}

.box-card {
  margin-bottom: 0;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  height: calc(100vh - 60px);
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