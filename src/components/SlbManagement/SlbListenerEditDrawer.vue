<template>
  <el-drawer
    v-model="visible"
    title="编辑监听器"
    size="50%"
    :before-close="handleClose"
  >
    <div class="listener-edit-content">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
        label-position="left"
      >
        <!-- 基本信息（只读） -->
        <div class="readonly-section">
          <h4 class="section-title">基本信息（不可修改）</h4>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="IP协议类型">
                <el-input
                  v-model="formData.ipVersion"
                  readonly
                  class="readonly-input"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="VIP地址">
                <el-input
                  v-model="formData.vip"
                  readonly
                  class="readonly-input"
                />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="监听端口">
                <el-input
                  v-model="formData.vport"
                  readonly
                  class="readonly-input"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="协议类型">
                <el-input
                  v-model="formData.protocol"
                  readonly
                  class="readonly-input"
                />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="转发模式">
                <el-input
                  v-model="formData.fwMode"
                  readonly
                  class="readonly-input"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 高级配置（可编辑） -->
        <div class="editable-section">
          <h4 class="section-title">高级配置（可修改）</h4>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="监听名称" prop="name">
                <el-input
                  v-model="formData.name"
                  placeholder="请输入监听名称"
                  maxlength="50"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="调度算法" prop="schedule">
                <el-select
                  v-model="formData.schedule"
                  placeholder="请选择调度算法"
                  style="width: 100%"
                >
                  <el-option
                    label="加权轮询算法 (wrr)"
                    value="wrr"
                  />
                  <el-option
                    label="加权最小链接算法 (wlc)"
                    value="wlc"
                  />
                  <el-option
                    label="IP一致性Hash算法 (conhash)"
                    value="conhash"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="会话超时时间" prop="timeout">
                <el-input-number
                  v-model="formData.timeout"
                  :min="30"
                  :max="3600"
                  placeholder="30-3600秒"
                  style="width: 100%"
                />
                <div class="form-tip">范围：30-3600秒</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Reset开关" prop="swReset">
                <el-radio-group v-model="formData.swReset">
                  <el-radio label="enable">启用</el-radio>
                  <el-radio label="disable">停用</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="TOA/UOA开关" prop="swTuoa">
                <el-radio-group v-model="formData.swTuoa">
                  <el-radio label="enable">启用</el-radio>
                  <el-radio label="disable">停用</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="会话同步" prop="swSessionSync">
                <el-radio-group v-model="formData.swSessionSync">
                  <el-radio label="enable">启用</el-radio>
                  <el-radio label="disable">停用</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="转换日志" prop="swTransfLog">
                <el-radio-group v-model="formData.swTransfLog">
                  <el-radio label="enable">启用</el-radio>
                  <el-radio label="disable">停用</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="会话保留" prop="swExpQuiet">
                <el-radio-group v-model="formData.swExpQuiet">
                  <el-radio label="enable">启用</el-radio>
                  <el-radio label="disable">停用</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="QoS ID列表" prop="qidList">
                <el-select
                  v-model="formData.qidList"
                  multiple
                  placeholder="请选择QoS ID（最多2个）"
                  style="width: 100%"
                  :max-collapse-tags="2"
                >
                  <el-option
                    v-for="qid in qidOptions"
                    :key="qid"
                    :label="`QoS ID ${qid}`"
                    :value="qid"
                  />
                </el-select>
                <div class="form-tip">最多选择2个QoS ID</div>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>
    </div>

    <template #footer>
      <div class="drawer-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button 
          type="primary" 
          :loading="submitting"
          @click="handleSubmit"
        >
          保存
        </el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

// 定义props和emits
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  listenerData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

// 控制抽屉显示
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 表单引用和状态
const formRef = ref(null)
const submitting = ref(false)

// 表单数据
const formData = reactive({
  id: '',
  name: '',
  ipVersion: '',
  vip: '',
  vport: '',
  protocol: '',
  fwMode: '',
  schedule: '',
  timeout: 300,
  swReset: 'disable',
  swTuoa: 'disable',
  swSessionSync: 'disable',
  swTransfLog: 'disable',
  swExpQuiet: 'disable',
  qidList: []
})

// QoS ID选项（模拟数据）
const qidOptions = ref([
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  11, 12, 13, 14, 15, 16, 17, 18, 19, 20
])

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入监听名称', trigger: 'blur' },
    { min: 1, max: 50, message: '监听名称长度在1到50个字符', trigger: 'blur' }
  ],
  schedule: [
    { required: true, message: '请选择调度算法', trigger: 'change' }
  ],
  timeout: [
    { required: true, message: '请输入会话超时时间', trigger: 'blur' },
    { type: 'number', min: 30, max: 3600, message: '会话超时时间必须在30-3600秒之间', trigger: 'blur' }
  ],
  swReset: [
    { required: true, message: '请选择Reset开关状态', trigger: 'change' }
  ],
  swTuoa: [
    { required: true, message: '请选择TOA/UOA开关状态', trigger: 'change' }
  ],
  swSessionSync: [
    { required: true, message: '请选择会话同步状态', trigger: 'change' }
  ],
  swTransfLog: [
    { required: true, message: '请选择转换日志状态', trigger: 'change' }
  ],
  swExpQuiet: [
    { required: true, message: '请选择会话保留状态', trigger: 'change' }
  ],
  qidList: [
    { 
      validator: (rule, value, callback) => {
        if (value && value.length > 2) {
          callback(new Error('最多只能选择2个QoS ID'))
        } else {
          callback()
        }
      }, 
      trigger: 'change' 
    }
  ]
}

// 监听监听器数据变化，初始化表单
watch(() => props.listenerData, (newData) => {
  if (newData) {
    // 初始化只读字段
    formData.id = newData.id || ''
    formData.ipVersion = newData.ipVersion || 'ipv4'
    formData.vip = newData.vip || ''
    formData.vport = newData.vport || ''
    formData.protocol = newData.protocol || 'tcp'
    formData.fwMode = newData.fwMode || 'fnat'
    
    // 初始化可编辑字段
    formData.name = newData.name || ''
    formData.schedule = newData.schedule || 'wrr'
    formData.timeout = newData.timeout || 300
    formData.swReset = newData.swReset || 'disable'
    formData.swTuoa = newData.swTuoa || 'disable'
    formData.swSessionSync = newData.swSessionSync || 'disable'
    formData.swTransfLog = newData.swTransfLog || 'disable'
    formData.swExpQuiet = newData.swExpQuiet || 'disable'
    formData.qidList = newData.qidList || []
  }
}, { immediate: true })

// 提交处理
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitting.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 构建更新数据
    const updateData = {
      id: formData.id,
      name: formData.name,
      schedule: formData.schedule,
      timeout: formData.timeout,
      swReset: formData.swReset,
      swTuoa: formData.swTuoa,
      swSessionSync: formData.swSessionSync,
      swTransfLog: formData.swTransfLog,
      swExpQuiet: formData.swExpQuiet,
      qidList: formData.qidList
    }
    
    // 发送成功事件
    emit('success', updateData)
    ElMessage.success('监听器更新成功')
    
    // 关闭抽屉
    visible.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    submitting.value = false
  }
}

// 取消处理
const handleCancel = () => {
  visible.value = false
}

// 关闭处理
const handleClose = () => {
  visible.value = false
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  Object.assign(formData, {
    id: '',
    name: '',
    ipVersion: '',
    vip: '',
    vport: '',
    protocol: '',
    fwMode: '',
    schedule: '',
    timeout: 300,
    swReset: 'disable',
    swTuoa: 'disable',
    swSessionSync: 'disable',
    swTransfLog: 'disable',
    swExpQuiet: 'disable',
    qidList: []
  })
}
</script>

<style scoped>
.listener-edit-content {
  padding: 20px;
  height: calc(100vh - 120px);
  overflow-y: auto;
}

.readonly-section {
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.editable-section {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  border-bottom: 2px solid #409eff;
  padding-bottom: 8px;
}

.readonly-input :deep(.el-input__wrapper) {
  background-color: #f5f7fa !important;
  box-shadow: none !important;
}

.readonly-input :deep(.el-input__inner) {
  background-color: #f5f7fa !important;
  color: #909399 !important;
  cursor: not-allowed !important;
}

.readonly-input :deep(.el-input__inner):focus {
  background-color: #f5f7fa !important;
  color: #909399 !important;
  box-shadow: none !important;
}

.form-tip {
  color: #909399;
  font-size: 12px;
  margin-top: 4px;
  margin-left: 8px;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #ebeef5;
  background-color: #fff;
}

.el-form {
  padding-top: 0;
}

.el-form-item {
  margin-bottom: 24px;
}

.el-form-item__label {
  font-weight: 500;
  color: #606266;
}

/* 只读字段样式 */
.el-form-item:has(.readonly-input) .el-form-item__label {
  color: #909399 !important;
}

/* 确保只读输入框样式生效 */
.readonly-input {
  pointer-events: none;
}

/* 可编辑字段突出显示 */
.el-form-item:not(:has(.readonly-input)) .el-form-item__label {
  color: #303133;
  font-weight: 600;
}

/* 必填字段标识 */
.el-form-item.is-required .el-form-item__label::before {
  content: '*';
  color: #f56c6c;
  margin-right: 4px;
}
</style>
