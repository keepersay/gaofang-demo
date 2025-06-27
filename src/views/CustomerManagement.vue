<template>
  <div class="customer-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>客户管理</span>
          <el-button type="primary" @click="handleAdd">新增客户</el-button>
        </div>
      </template>
      
      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="客户名">
            <el-input v-model="searchForm.customerName" placeholder="请输入客户名" clearable />
          </el-form-item>
          <el-form-item label="手机号">
            <el-input v-model="searchForm.phone" placeholder="请输入手机号" clearable />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="searchForm.email" placeholder="请输入邮箱" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 表格区域 -->
      <el-table :data="tableData" style="width: 100%; min-height: 320px;" v-loading="loading" border stripe
        max-height="500" row-class-name="dense-row"
        :header-cell-style="{ position: 'sticky', top: 0, background: '#fff', zIndex: 2 }">
        <el-table-column prop="customerId" label="客户ID" width="120" fixed="left" />
        <el-table-column prop="customerName" label="客户名" width="150" fixed="left" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column 
          prop="status" 
          label="状态" 
          width="100" 
          :filters="[
            { text: '正常', value: 'active' },
            { text: '禁用', value: 'disabled' }
          ]"
          :filter-method="filterStatus"
          filter-placement="bottom-end"
        >
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
              {{ scope.row.status === 'active' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="creditCode" label="统一社会信用代码" width="200" />
        <el-table-column prop="remark" label="备注" width="200" show-overflow-tooltip />
        <el-table-column prop="createTime" label="添加时间" width="160" />
        <el-table-column prop="createAccount" label="添加账号" width="120" />
        <el-table-column prop="updateTime" label="最后修改时间" width="160" />
        <el-table-column prop="updateAccount" label="最后修改账号" width="120" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" link size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="primary" link size="small" @click="handleLicense(scope.row)">营业执照</el-button>
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
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="140px">
        <el-form-item label="客户名" prop="customerName">
          <el-input v-model="form.customerName" placeholder="请输入客户名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="统一社会信用代码" prop="creditCode">
          <el-input v-model="form.creditCode" placeholder="请输入统一社会信用代码" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input 
            v-model="form.remark" 
            type="textarea" 
            :rows="3"
            placeholder="请输入备注信息" 
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio value="active">正常</el-radio>
            <el-radio value="disabled">禁用</el-radio>
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

    <!-- 删除确认对话框 -->
    <el-dialog v-model="deleteVisible" title="确认删除" width="400px">
      <div>确定要删除客户 <b>{{ deleteRow?.customerName }}</b> 吗？</div>
      <div class="text-xs text-gray-500 mt-2">ID: {{ deleteRow?.customerId }}</div>
      <template #footer>
        <el-button @click="deleteVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmDelete">确认删除</el-button>
      </template>
    </el-dialog>

    <!-- 启用/禁用确认对话框 -->
    <el-dialog v-model="statusVisible" :title="statusRow?.status === 'active' ? '确认禁用' : '确认启用'" width="400px">
      <div>确定要{{ statusRow?.status === 'active' ? '禁用' : '启用' }}客户 <b>{{ statusRow?.customerName }}</b> 吗？</div>
      <div class="text-xs text-gray-500 mt-2">ID: {{ statusRow?.customerId }}</div>
      <template #footer>
        <el-button @click="statusVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmStatusChange">确认</el-button>
      </template>
    </el-dialog>

    <!-- 营业执照管理对话框 -->
    <el-dialog v-model="licenseVisible" title="营业执照管理" width="700px">
      <div v-if="currentCustomer">
        <div class="license-info">
          <p class="license-customer-name">{{ currentCustomer.customerName }}</p>
          <p class="license-customer-id">客户ID: {{ currentCustomer.customerId }}</p>
        </div>
        
        <el-tabs v-model="licenseActiveTab">
          <el-tab-pane label="查看营业执照" name="view">
            <div class="license-view">
              <div v-if="currentCustomer.license" class="license-image-container">
                <img :src="currentCustomer.license" class="license-image" alt="营业执照" />
                <div class="license-actions">
                  <el-button type="primary" @click="previewLicense">预览</el-button>
                  <el-button type="danger" @click="confirmDeleteLicense">删除</el-button>
                </div>
                <p class="license-upload-time" v-if="currentCustomer.licenseUploadTime">
                  上传时间: {{ currentCustomer.licenseUploadTime }}
                </p>
              </div>
              <div v-else class="license-empty">
                <el-empty description="暂无营业执照">
                  <el-button type="primary" @click="licenseActiveTab = 'upload'">上传营业执照</el-button>
                </el-empty>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="上传营业执照" name="upload">
            <div class="license-upload">
              <el-upload
                class="license-uploader"
                action="#"
                :auto-upload="false"
                :on-change="handleLicenseChange"
                :on-remove="handleLicenseRemove"
                :limit="1"
                :file-list="licenseFileList"
              >
                <el-button type="primary">选择文件</el-button>
                <template #tip>
                  <div class="el-upload__tip">
                    请上传JPG/PNG格式的营业执照图片，文件大小不超过5MB
                  </div>
                </template>
              </el-upload>
              
              <div class="license-preview" v-if="licensePreview">
                <img :src="licensePreview" class="license-preview-image" alt="预览" />
              </div>
              
              <div class="license-upload-actions">
                <el-button type="primary" @click="uploadLicense" :disabled="!licenseFile">上传</el-button>
                <el-button @click="cancelUpload">取消</el-button>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>
    
    <!-- 营业执照预览 -->
    <el-dialog v-model="licensePreviewVisible" title="营业执照预览" width="800px" center>
      <div class="license-preview-container">
        <img :src="currentCustomer?.license" class="license-preview-full" alt="营业执照预览" />
      </div>
    </el-dialog>
    
    <!-- 删除营业执照确认 -->
    <el-dialog v-model="licenseDeleteVisible" title="删除营业执照" width="400px">
      <div>确定要删除 <b>{{ currentCustomer?.customerName }}</b> 的营业执照吗？</div>
      <template #footer>
        <el-button @click="licenseDeleteVisible = false">取消</el-button>
        <el-button type="danger" @click="deleteLicense">确认删除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  customerName: '',
  phone: '',
  email: '',
  status: ''
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
const deleteVisible = ref(false)
const deleteRow = ref(null)
const statusVisible = ref(false)
const statusRow = ref(null)

// 表单数据
const form = reactive({
  customerId: '',
  customerName: '',
  phone: '',
  email: '',
  status: 'active',
  creditCode: '',
  remark: '',
  createTime: '',
  createAccount: '',
  updateTime: '',
  updateAccount: ''
})

// 表单验证规则
const rules = {
  customerName: [
    { required: true, message: '请输入客户名', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  creditCode: [
    { pattern: /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/, message: '请输入正确的统一社会信用代码', trigger: 'blur' }
  ]
}

// 营业执照相关
const licenseVisible = ref(false)
const licenseActiveTab = ref('view')
const currentCustomer = ref(null)
const licenseFile = ref(null)
const licenseFileList = ref([])
const licensePreview = ref('')
const licensePreviewVisible = ref(false)
const licenseDeleteVisible = ref(false)

// 雪花算法ID生成（简单模拟）
function generateSnowflakeId() {
  const timestamp = Date.now() % 1e12
  const machineId = Math.floor(Math.random() * 1024)
  const sequence = Math.floor(Math.random() * 4096)
  return `LCG${timestamp}${machineId.toString().padStart(3, '0')}${sequence.toString().padStart(4, '0')}`
}

// 模拟数据
const mockData = [
  {
    customerId: generateSnowflakeId(),
    customerName: '北京科技有限公司',
    phone: '13800138001',
    email: 'contact@beijingtech.com',
    status: 'active',
    creditCode: '91110000123456789X',
    remark: '重要客户，需要重点关注',
    createTime: '2024-01-15 10:30:00',
    createAccount: 'admin',
    updateTime: '2024-01-20 14:20:00',
    updateAccount: 'admin'
  },
  {
    customerId: generateSnowflakeId(),
    customerName: '上海网络科技有限公司',
    phone: '13900139002',
    email: 'info@shanghainet.com',
    status: 'active',
    creditCode: '91310000123456789Y',
    remark: '新客户，正在洽谈中',
    createTime: '2024-01-18 09:15:00',
    createAccount: 'operator1',
    updateTime: '2024-01-18 09:15:00',
    updateAccount: 'operator1'
  },
  {
    customerId: generateSnowflakeId(),
    customerName: '广州数据服务有限公司',
    phone: '13700137003',
    email: 'service@guangzhou.com',
    status: 'disabled',
    creditCode: '91440000123456789Z',
    remark: '暂停合作',
    createTime: '2024-01-10 16:45:00',
    createAccount: 'admin',
    updateTime: '2024-01-25 11:30:00',
    updateAccount: 'operator2'
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
    customerName: '',
    phone: '',
    email: ''
  })
  handleSearch()
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增客户'
  Object.assign(form, {
    customerId: '',
    customerName: '',
    phone: '',
    email: '',
    status: 'active',
    creditCode: '',
    remark: '',
    createTime: '',
    createAccount: '',
    updateTime: '',
    updateAccount: ''
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑客户'
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
  const index = tableData.value.findIndex(item => item.customerId === deleteRow.value.customerId)
  if (index > -1) {
    tableData.value.splice(index, 1)
    pagination.total--
    ElMessage.success('删除成功')
  }
  deleteVisible.value = false
}

// 状态变更
const handleStatusChange = (row) => {
  statusRow.value = row
  statusVisible.value = true
}

// 确认状态变更
const confirmStatusChange = () => {
  statusRow.value.status = statusRow.value.status === 'active' ? 'disabled' : 'active'
  statusRow.value.updateTime = new Date().toLocaleString()
  statusRow.value.updateAccount = 'current_user'
  const action = statusRow.value.status === 'active' ? '启用' : '禁用'
  ElMessage.success(`${statusRow.value.customerName}已${action}`)
  statusVisible.value = false
}

// 提交表单
const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      const currentTime = new Date().toLocaleString()
      const currentUser = 'current_user'
      
      if (form.customerId) {
        // 编辑
        const index = tableData.value.findIndex(item => item.customerId === form.customerId)
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
        const newCustomer = {
          ...form,
          customerId: generateId(),
          createTime: currentTime,
          createAccount: currentUser,
          updateTime: currentTime,
          updateAccount: currentUser
        }
        tableData.value.push(newCustomer)
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

// 新增时也用雪花ID
function generateId() {
  return generateSnowflakeId()
}

// 状态过滤方法
const filterStatus = (value, row) => {
  return row.status === value;
}

// 处理营业执照按钮点击
const handleLicense = (row) => {
  currentCustomer.value = row
  licenseVisible.value = true
  licenseActiveTab.value = 'view'
  licenseFileList.value = []
  licensePreview.value = ''
}

// 处理营业执照文件选择
const handleLicenseChange = (file) => {
  const isImage = file.raw.type === 'image/jpeg' || file.raw.type === 'image/png'
  const isLt5M = file.size / 1024 / 1024 < 5
  
  if (!isImage) {
    ElMessage.error('营业执照必须是JPG或PNG格式!')
    licenseFileList.value = []
    return false
  }
  if (!isLt5M) {
    ElMessage.error('营业执照大小不能超过5MB!')
    licenseFileList.value = []
    return false
  }
  
  licenseFile.value = file.raw
  
  // 生成预览
  const reader = new FileReader()
  reader.onload = (e) => {
    licensePreview.value = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

// 处理营业执照文件移除
const handleLicenseRemove = () => {
  licenseFile.value = null
  licensePreview.value = ''
}

// 上传营业执照
const uploadLicense = () => {
  if (!licenseFile.value) {
    ElMessage.warning('请先选择营业执照文件')
    return
  }
  
  // 模拟上传
  setTimeout(() => {
    // 在实际应用中，这里应该是调用API上传文件
    // 这里我们直接使用预览的base64作为模拟
    if (currentCustomer.value) {
      currentCustomer.value.license = licensePreview.value
      currentCustomer.value.licenseUploadTime = new Date().toLocaleString()
      ElMessage.success('营业执照上传成功')
      licenseActiveTab.value = 'view'
      licenseFile.value = null
      licenseFileList.value = []
      licensePreview.value = ''
    }
  }, 500)
}

// 取消上传
const cancelUpload = () => {
  licenseFile.value = null
  licenseFileList.value = []
  licensePreview.value = ''
  licenseActiveTab.value = 'view'
}

// 预览营业执照
const previewLicense = () => {
  if (currentCustomer.value && currentCustomer.value.license) {
    licensePreviewVisible.value = true
  }
}

// 确认删除营业执照
const confirmDeleteLicense = () => {
  licenseDeleteVisible.value = true
}

// 删除营业执照
const deleteLicense = () => {
  if (currentCustomer.value) {
    currentCustomer.value.license = null
    currentCustomer.value.licenseUploadTime = null
    ElMessage.success('营业执照已删除')
    licenseDeleteVisible.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.customer-management {
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

.search-form {
  margin-bottom: 0;
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

.py-10 {
  padding-top: 2.5rem;
  padding-bottom: 2.5rem;
}

.text-center {
  text-align: center;
}

.dense-row td {
  padding-top: 6px !important;
  padding-bottom: 6px !important;
}

/* 营业执照相关样式 */
.license-info {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.license-customer-name {
  font-size: 18px;
  font-weight: 500;
  margin: 0 0 5px 0;
}

.license-customer-id {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.license-view {
  min-height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.license-image-container {
  text-align: center;
}

.license-image {
  max-width: 100%;
  max-height: 300px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.license-actions {
  margin-top: 15px;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.license-upload-time {
  margin-top: 10px;
  font-size: 12px;
  color: #909399;
}

.license-empty {
  width: 100%;
  padding: 30px 0;
}

.license-upload {
  padding: 20px 0;
}

.license-uploader {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.license-preview {
  margin-top: 20px;
  text-align: center;
}

.license-preview-image {
  max-width: 100%;
  max-height: 200px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.license-upload-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.license-preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.license-preview-full {
  max-width: 100%;
  max-height: 70vh;
}
</style> 