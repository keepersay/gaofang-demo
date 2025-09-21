<template>
  <el-drawer
    v-model="visible"
    :title="isEdit ? '编辑限速策略' : '新建限速策略'"
    direction="rtl"
    size="40vw"
    :before-close="handleClose"
    destroy-on-close
  >
    <div class="rate-limit-modal-content">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="dynamicRules"
        label-width="120px"
        label-position="left"
        @submit.prevent
      >
        <!-- 基础信息 -->
        <div class="config-section">
          <h3>基础信息</h3>
          <el-form-item label="名称" prop="name">
            <el-input
              v-model="formData.name"
              placeholder="名称"
              maxlength="50"
              show-word-limit
              style="width: 300px;"
            />
          </el-form-item>
          <el-form-item label="限速ID" prop="qosId" v-if="isEdit">
            <el-input
              v-model="formData.qosId"
              placeholder="限速ID"
              disabled
              style="width: 300px;"
            />
          </el-form-item>
        </div>

        <!-- 限速配置 -->
        <div class="config-section">
          <h3>限速配置</h3>
          
          <!-- 带宽限制 -->
          <div class="limit-item">
            <div class="limit-header">
              <span class="limit-label">带宽限制</span>
              <el-switch
                v-model="formData.bandwidthEnabled"
                @change="handleBandwidthChange"
              />
            </div>
            <div v-if="formData.bandwidthEnabled" class="limit-content">
              <div class="input-with-unit">
                <el-input-number
                  v-model="formData.bandwidthValue"
                  :min="1"
                  :max="10485760"
                  placeholder="请输入数值"
                  class="number-input"
                />
                <el-select
                  v-model="formData.bandwidthUnit"
                  placeholder="选择单位"
                  class="unit-select"
                >
                  <el-option label="Kbps" value="kbps" />
                  <el-option label="Mbps" value="mbps" />
                  <el-option label="Gbps" value="gbps" />
                </el-select>
              </div>
              <div class="range-tip">提示: 范围1-10485760</div>
            </div>
          </div>

          <!-- 新建限制 -->
          <div class="limit-item">
            <div class="limit-header">
              <span class="limit-label">新建限制</span>
              <el-switch
                v-model="formData.cpsEnabled"
                @change="handleCpsChange"
              />
            </div>
            <div v-if="formData.cpsEnabled" class="limit-content">
              <div class="input-with-unit">
                <el-input-number
                  v-model="formData.cpsValue"
                  :min="1"
                  :max="100000"
                  placeholder="请输入数值"
                  class="number-input"
                />
                <span class="unit-text">CPS</span>
              </div>
              <div class="range-tip">提示: 范围1-100000</div>
            </div>
          </div>

          <!-- 会话限制 -->
          <div class="limit-item">
            <div class="limit-header">
              <span class="limit-label">会话限制</span>
              <el-switch
                v-model="formData.connsEnabled"
                @change="handleConnsChange"
              />
            </div>
            <div v-if="formData.connsEnabled" class="limit-content">
              <div class="input-with-unit">
                <el-input-number
                  v-model="formData.connsValue"
                  :min="1"
                  :max="1000000"
                  placeholder="请输入数值"
                  class="number-input"
                />
                <span class="unit-text">CONNS</span>
              </div>
              <div class="range-tip">提示: 范围1-1000000</div>
            </div>
          </div>
        </div>

        <!-- 责任人 -->
        <div class="config-section">
          <h3>责任人</h3>
          <el-form-item label="责任人" prop="owner">
            <el-select
              v-model="formData.owner"
              placeholder="请选择责任人"
              filterable
              remote
              :remote-method="handleOwnerSearch"
              :loading="ownerLoading"
              style="width: 300px;"
            >
              <el-option
                v-for="user in ownerOptions"
                :key="user.id"
                :label="user.name"
                :value="user.name"
              />
            </el-select>
          </el-form-item>
        </div>
      </el-form>
    </div>

    <template #footer>
      <div class="drawer-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          保存
        </el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import RateLimitService from '@/services/RateLimitService'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  qosData: {
    type: Object,
    default: null
  },
  isEdit: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'success', 'add-qos', 'modify-qos'])

// 响应式数据
const formRef = ref()
const submitting = ref(false)
const ownerLoading = ref(false)
const ownerOptions = ref([])

// 表单数据
const formData = reactive({
  name: '',
  qosId: '',
  bandwidthEnabled: false,
  bandwidthValue: 1,
  bandwidthUnit: 'mbps',
  cpsEnabled: false,
  cpsValue: 1,
  connsEnabled: false,
  connsValue: 1,
  owner: ''
})

// 计算属性
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' },
    { min: 1, max: 50, message: '名称长度在1到50个字符', trigger: 'blur' }
  ],
  qosId: [
    { required: true, message: '限速ID不能为空', trigger: 'blur' }
  ],
  owner: [
    { required: true, message: '请选择责任人', trigger: 'change' }
  ]
}

// 动态验证规则
const dynamicRules = computed(() => {
  const baseRules = {
    name: [
      { required: true, message: '请输入名称', trigger: 'blur' },
      { min: 1, max: 50, message: '名称长度在1到50个字符', trigger: 'blur' }
    ],
    owner: [
      { required: true, message: '请选择责任人', trigger: 'change' }
    ]
  }
  
  // 编辑模式下才需要限速ID验证
  if (props.isEdit) {
    baseRules.qosId = [
      { required: true, message: '限速ID不能为空', trigger: 'blur' }
    ]
  }
  
  return baseRules
})

// 生成限速ID
const generateQosId = () => {
  return Math.floor(Math.random() * 1000) + 1
}

// 获取用户列表
const fetchUserList = async (query = '') => {
  try {
    ownerLoading.value = true
    // 模拟API调用
    const response = await mockGetUserList(query)
    ownerOptions.value = response.data.list
  } catch (error) {
    console.error('Error fetching user list:', error)
  } finally {
    ownerLoading.value = false
  }
}

// 模拟获取用户列表API
const mockGetUserList = (query) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockUsers = [
        { id: 1, name: 'huangjj' },
        { id: 2, name: 'yl' },
        { id: 3, name: 'keepersay' },
        { id: 4, name: 'admin' },
        { id: 5, name: 'test' }
      ]
      
      const filteredUsers = query 
        ? mockUsers.filter(user => user.name.includes(query))
        : mockUsers
      
      resolve({
        data: {
          list: filteredUsers
        }
      })
    }, 300)
  })
}

// 责任人搜索
const handleOwnerSearch = (query) => {
  fetchUserList(query)
}

// 带宽限制开关变化
const handleBandwidthChange = (val) => {
  if (!val) {
    formData.bandwidthValue = 1
    formData.bandwidthUnit = 'mbps'
  }
}

// 新建限制开关变化
const handleCpsChange = (val) => {
  if (!val) {
    formData.cpsValue = 1
  }
}

// 会话限制开关变化
const handleConnsChange = (val) => {
  if (!val) {
    formData.connsValue = 1
  }
}

// 构建提交数据
const buildSubmitData = () => {
  const data = {
    name: formData.name,
    owner: formData.owner
  }
  
  // 编辑模式下才包含qosId
  if (props.isEdit) {
    data.qosId = formData.qosId
  }

  // 带宽限制
  if (formData.bandwidthEnabled) {
    let bandwidth = formData.bandwidthValue
    if (formData.bandwidthUnit === 'kbps') {
      // Kbps转换为字节：1 Kbps = 1000 bps = 1000/8 字节/秒
      bandwidth = Math.floor(bandwidth * 1000 / 8)
    } else if (formData.bandwidthUnit === 'mbps') {
      // Mbps转换为字节：1 Mbps = 1000000 bps = 1000000/8 字节/秒
      bandwidth = Math.floor(bandwidth * 1000000 / 8)
    } else if (formData.bandwidthUnit === 'gbps') {
      // Gbps转换为字节：1 Gbps = 1000000000 bps = 1000000000/8 字节/秒
      bandwidth = Math.floor(bandwidth * 1000000000 / 8)
    }
    data.bandWidth = bandwidth.toString()
  }

  // 新建限制
  if (formData.cpsEnabled) {
    data.cps = formData.cpsValue.toString()
  }

  // 会话限制
  if (formData.connsEnabled) {
    data.conns = formData.connsValue.toString()
  }

  return data
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    // 检查是否至少有一个限速策略开启
    if (!formData.bandwidthEnabled && !formData.cpsEnabled && !formData.connsEnabled) {
      ElMessage.error('请至少开启一个限速策略')
      return
    }
    
    submitting.value = true

    const submitData = buildSubmitData()
    
    // 通过事件传递数据给父组件处理
    if (props.isEdit) {
      emit('modify-qos', submitData)
      ElMessage.success('修改成功')
    } else {
      emit('add-qos', submitData)
      ElMessage.success('创建成功')
    }
    
    emit('success')
  } catch (error) {
    if (error !== false) {
      ElMessage.error('操作失败')
      console.error('Error submitting form:', error)
    }
  } finally {
    submitting.value = false
  }
}

// 模拟添加QoS API
const mockAddQos = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ 
        success: true,
        data: {
          qosId: generateQosId().toString()
        }
      })
    }, 500)
  })
}

// 模拟修改QoS API
const mockModifyQos = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true })
    }, 500)
  })
}

// 取消
const handleCancel = () => {
  handleClose()
}

// 关闭弹窗
const handleClose = () => {
  visible.value = false
  resetForm()
}

// 重置表单
const resetForm = () => {
  formData.name = ''
  formData.qosId = ''
  formData.bandwidthEnabled = false
  formData.bandwidthValue = 1
  formData.bandwidthUnit = 'mbps'
  formData.cpsEnabled = false
  formData.cpsValue = 1
  formData.connsEnabled = false
  formData.connsValue = 1
  formData.owner = ''
  
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 初始化表单数据
const initFormData = () => {
  if (props.qosData && props.isEdit) {
    // 编辑模式，填充数据
    formData.name = props.qosData.name || ''
    formData.qosId = props.qosData.qosId || ''
    formData.owner = props.qosData.owner || ''
    
    // 解析带宽限制
    if (props.qosData.bandwidth) {
      formData.bandwidthEnabled = true
      // 这里需要根据实际数据格式解析
      formData.bandwidthValue = 10
      formData.bandwidthUnit = 'mbps'
    }
    
    // 解析新建限制
    if (props.qosData.cps) {
      formData.cpsEnabled = true
      formData.cpsValue = parseInt(props.qosData.cps) || 1
    }
    
    // 解析会话限制
    if (props.qosData.conns) {
      formData.connsEnabled = true
      formData.connsValue = parseInt(props.qosData.conns) || 1
    }
  } else {
    // 新建模式，不生成限速ID，保存时由后端生成
    formData.qosId = ''
  }
}

// 监听props变化
watch(() => props.qosData, () => {
  initFormData()
}, { immediate: true })

watch(() => props.isEdit, () => {
  initFormData()
}, { immediate: true })

// 组件挂载
onMounted(() => {
  fetchUserList()
})
</script>

<style scoped>
.rate-limit-modal-content {
  padding: 20px;
}

.config-section {
  margin-bottom: 30px;
}

.config-section h3 {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
}

.limit-item {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background: #fafafa;
}

.limit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.limit-label {
  font-weight: 500;
  color: #606266;
}

.limit-content {
  margin-top: 15px;
}

.range-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #ebeef5;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-input.is-disabled .el-input__wrapper) {
  background-color: #f5f7fa;
  box-shadow: 0 0 0 1px #e4e7ed inset;
}

/* 数字和单位组合样式 */
.input-with-unit {
  display: flex;
  align-items: center;
  width: 190px;
}

.number-input {
  width: 150px;
}

.number-input :deep(.el-input-number) {
  width: 100%;
}

.number-input :deep(.el-input-number .el-input__wrapper) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-right: none;
}

.unit-select {
  width: 120px;
}

.unit-select :deep(.el-select) {
  width: 100%;
}

.unit-select :deep(.el-select .el-input__wrapper) {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-left: 1px solid #dcdfe6;
}

.unit-text {
  display: flex;
  align-items: center;
  padding-left: 8px;
  color: #606266;
  font-size: 14px;
  font-weight: 500;
}

/* 悬停效果 */
.input-with-unit:hover .number-input :deep(.el-input-number .el-input__wrapper),
.input-with-unit:hover .unit-select :deep(.el-select .el-input__wrapper) {
  border-color: #c0c4cc;
}

/* 聚焦效果 */
.number-input:focus-within :deep(.el-input-number .el-input__wrapper),
.unit-select:focus-within :deep(.el-select .el-input__wrapper) {
  border-color: #409eff;
  box-shadow: 0 0 0 1px #409eff inset;
}
</style>
