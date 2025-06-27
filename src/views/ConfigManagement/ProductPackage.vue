<template>
  <div class="product-package">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>商品套餐</span>
          <el-button type="primary" @click="handleAdd">新增套餐</el-button>
        </div>
      </template>
      
      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="套餐名">
            <el-input v-model="searchForm.packageName" placeholder="请输入套餐名" clearable />
          </el-form-item>
          <el-form-item label="地域">
            <el-select v-model="searchForm.region" placeholder="请选择地域" clearable>
              <el-option label="华北" value="华北" />
              <el-option label="华东" value="华东" />
              <el-option label="华南" value="华南" />
              <el-option label="西南" value="西南" />
            </el-select>
          </el-form-item>
          <el-form-item label="防护类型">
            <el-select v-model="searchForm.protectionType" placeholder="请选择防护类型" clearable>
              <el-option label="DDoS防护" value="DDoS防护" />
              <el-option label="WAF防护" value="WAF防护" />
              <el-option label="混合防护" value="混合防护" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 表格区域 -->
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="packageName" label="套餐名" width="150" />
        <el-table-column prop="region" label="地域" width="100" />
        <el-table-column prop="protectionBandwidth" label="防护带宽" width="120">
          <template #default="scope">
            {{ scope.row.protectionBandwidth }}G
          </template>
        </el-table-column>
        <el-table-column prop="businessBandwidth" label="业务带宽" width="120">
          <template #default="scope">
            {{ scope.row.businessBandwidth }}M
          </template>
        </el-table-column>
        <el-table-column prop="protectionType" label="防护类型" width="120" />
        <el-table-column prop="ipCount" label="IP数量" width="100">
          <template #default="scope">
            {{ scope.row.ipCount }}个
          </template>
        </el-table-column>
        <el-table-column prop="qps" label="QPS（WAF）" width="120">
          <template #default="scope">
            {{ scope.row.qps }}万
          </template>
        </el-table-column>
        <el-table-column prop="isActive" label="是否生效" width="100">
          <template #default="scope">
            <el-switch
              v-model="scope.row.isActive"
              @change="handleStatusChange(scope.row)"
              active-text="生效"
              inactive-text="失效"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
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
      width="600px"
      @close="handleDialogClose"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="套餐名" prop="packageName">
          <el-input v-model="form.packageName" placeholder="请输入套餐名" />
        </el-form-item>
        <el-form-item label="地域" prop="region">
          <el-select v-model="form.region" placeholder="请选择地域" style="width: 100%">
            <el-option label="华北" value="华北" />
            <el-option label="华东" value="华东" />
            <el-option label="华南" value="华南" />
            <el-option label="西南" value="西南" />
          </el-select>
        </el-form-item>
        <el-form-item label="防护带宽" prop="protectionBandwidth">
          <el-input-number v-model="form.protectionBandwidth" :min="1" :max="1000" style="width: 100%" />
          <span style="margin-left: 10px;">G</span>
        </el-form-item>
        <el-form-item label="业务带宽" prop="businessBandwidth">
          <el-input-number v-model="form.businessBandwidth" :min="1" :max="10000" style="width: 100%" />
          <span style="margin-left: 10px;">M</span>
        </el-form-item>
        <el-form-item label="防护类型" prop="protectionType">
          <el-select v-model="form.protectionType" placeholder="请选择防护类型" style="width: 100%">
            <el-option label="DDoS防护" value="DDoS防护" />
            <el-option label="WAF防护" value="WAF防护" />
            <el-option label="混合防护" value="混合防护" />
          </el-select>
        </el-form-item>
        <el-form-item label="IP数量" prop="ipCount">
          <el-input-number v-model="form.ipCount" :min="1" :max="1000" style="width: 100%" />
          <span style="margin-left: 10px;">个</span>
        </el-form-item>
        <el-form-item label="QPS（WAF）" prop="qps">
          <el-input-number v-model="form.qps" :min="1" :max="1000" style="width: 100%" />
          <span style="margin-left: 10px;">万</span>
        </el-form-item>
        <el-form-item label="是否生效" prop="isActive">
          <el-switch v-model="form.isActive" active-text="生效" inactive-text="失效" />
        </el-form-item>
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

// 搜索表单
const searchForm = reactive({
  packageName: '',
  region: '',
  protectionType: ''
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

// 表单数据
const form = reactive({
  packageId: '',
  packageName: '',
  region: '',
  protectionBandwidth: 10,
  businessBandwidth: 100,
  protectionType: '',
  ipCount: 10,
  qps: 10,
  isActive: true
})

// 表单验证规则
const rules = {
  packageName: [
    { required: true, message: '请输入套餐名', trigger: 'blur' }
  ],
  region: [
    { required: true, message: '请选择地域', trigger: 'change' }
  ],
  protectionType: [
    { required: true, message: '请选择防护类型', trigger: 'change' }
  ]
}

// 雪花算法ID生成（简单模拟）
function generateSnowflakeId() {
  const timestamp = Date.now() % 1e12
  const machineId = Math.floor(Math.random() * 1024)
  const sequence = Math.floor(Math.random() * 4096)
  return `LCG${timestamp}${machineId.toString().padStart(3, '0')}${sequence.toString().padStart(4, '0')}`
}

// 新增时也用雪花ID
function generateId() {
  return generateSnowflakeId()
}

// 模拟数据
const mockData = [
  {
    packageId: generateSnowflakeId(),
    packageName: '基础防护套餐',
    region: '华北',
    protectionBandwidth: 10,
    businessBandwidth: 100,
    protectionType: 'DDoS防护',
    ipCount: 10,
    qps: 10,
    isActive: true
  },
  {
    packageId: generateSnowflakeId(),
    packageName: '标准防护套餐',
    region: '华东',
    protectionBandwidth: 20,
    businessBandwidth: 200,
    protectionType: 'WAF防护',
    ipCount: 20,
    qps: 20,
    isActive: true
  },
  {
    packageId: generateSnowflakeId(),
    packageName: '高级防护套餐',
    region: '华南',
    protectionBandwidth: 50,
    businessBandwidth: 500,
    protectionType: '混合防护',
    ipCount: 50,
    qps: 50,
    isActive: false
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

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  fetchData()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    packageName: '',
    region: '',
    protectionType: ''
  })
  handleSearch()
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增套餐'
  Object.assign(form, {
    packageId: '',
    packageName: '',
    region: '',
    protectionBandwidth: 10,
    businessBandwidth: 100,
    protectionType: '',
    ipCount: 10,
    qps: 10,
    isActive: true
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑套餐'
  Object.assign(form, row)
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
  })
}

// 状态变更
const handleStatusChange = (row) => {
  ElMessage.success(`${row.packageName}已${row.isActive ? '生效' : '失效'}`)
}

// 提交表单
const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      if (form.packageId) {
        // 编辑
        const index = tableData.value.findIndex(item => item.packageId === form.packageId)
        if (index > -1) {
          Object.assign(tableData.value[index], form)
        }
        ElMessage.success('编辑成功')
      } else {
        // 新增
        const newPackage = {
          ...form,
          packageId: generateId()
        }
        tableData.value.push(newPackage)
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

.search-area {
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
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
</style> 