<template>
  <el-drawer
    v-model="visible"
    :title="mode === 'create' ? '新建实例' : '编辑'"
    :width="500"
    direction="rtl"
    :before-close="handleClose"
    destroy-on-close
  >
    <div class="drawer-content">
      <el-form
        :model="formData"
        :rules="rules"
        ref="formRef"
        label-width="120px"
        label-position="left"
        @submit.prevent
      >
        <el-form-item label="实例名" prop="instanceName">
          <el-input 
            v-model="formData.instanceName" 
            placeholder="请输入实例名" 
            :readonly="mode === 'edit'"
            :class="{ 'readonly-input': mode === 'edit' }"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="IP地址类型">
          <el-radio-group v-model="formData.ipType" :disabled="mode === 'edit'">
            <el-radio value="ipv4">IPv4</el-radio>
            <el-radio value="ipv6">IPv6</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="VIP地址配置">
          <el-radio-group v-model="formData.vipConfig" :disabled="mode === 'edit'">
            <el-radio value="auto">自动分配</el-radio>
            <el-radio value="manual">手工配置</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item 
          label="VIP地址" 
          prop="vipAddress" 
          v-if="formData.vipConfig === 'manual' || mode === 'edit'"
        >
          <el-input 
            v-model="formData.vipAddress" 
            placeholder="请输入VIP地址" 
            :readonly="mode === 'edit'"
            :class="{ 'readonly-input': mode === 'edit' }"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="网络类型">
          <el-radio-group v-model="formData.networkType" :disabled="mode === 'edit'">
            <el-radio value="public">公网</el-radio>
            <el-radio value="private">私网</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="负责人" prop="owner">
          <el-input 
            v-model="formData.owner" 
            placeholder="请输入负责人" 
            clearable
          />
        </el-form-item>
        
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入内容"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
      </el-form>
    </div>
    
    <template #footer>
      <div class="drawer-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button 
          type="primary" 
          @click="handleSubmit" 
          :loading="submitting"
        >
          {{ mode === 'create' ? '确定' : '保存' }}
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
  mode: {
    type: String,
    default: 'create',
    validator: (value) => ['create', 'edit'].includes(value)
  },
  instanceData: {
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

// 表单引用
const formRef = ref()
const submitting = ref(false)

// 表单数据
const formData = reactive({
  instanceName: '',
  ipType: 'ipv4',
  vipConfig: 'manual',
  vipAddress: '',
  networkType: 'public',
  owner: 'huangji',
  remark: ''
})

// 表单验证规则
const rules = computed(() => {
  const baseRules = {
    owner: [
      { required: true, message: '请输入负责人', trigger: 'blur' },
      { min: 2, max: 20, message: '负责人姓名长度在2-20个字符', trigger: 'blur' }
    ],
    remark: [
      { max: 100, message: '备注不能超过100个字符', trigger: 'blur' }
    ]
  }
  
  // 编辑模式只验证可编辑字段
  if (props.mode === 'edit') {
    return baseRules
  }
  
  // 新建模式返回完整验证规则
  return {
    ...baseRules,
    instanceName: [
      { required: true, message: '请输入实例名', trigger: 'blur' },
      { min: 2, max: 50, message: '实例名长度在2-50个字符', trigger: 'blur' },
      { pattern: /^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/, message: '实例名只能包含字母、数字、中文、下划线和连字符', trigger: 'blur' }
    ],
    vipAddress: [
      { required: true, message: '请输入VIP地址', trigger: 'blur' },
      { 
        validator: (rule, value, callback) => {
          if (formData.vipConfig === 'manual') {
            if (!value) {
              callback(new Error('请输入VIP地址'))
            } else if (formData.ipType === 'ipv4') {
              // IPv4格式验证
              const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
              if (!ipv4Regex.test(value)) {
                callback(new Error('请输入正确的IPv4地址格式'))
              } else {
                callback()
              }
            } else {
              // IPv6格式验证（简单版）
              const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
              if (!ipv6Regex.test(value)) {
                callback(new Error('请输入正确的IPv6地址格式'))
              } else {
                callback()
              }
            }
          } else {
            callback()
          }
        },
        trigger: 'blur'
      }
    ]
  }
})

// 监听VIP配置变化，清空VIP地址
watch(() => formData.vipConfig, (newVal) => {
  if (newVal === 'auto') {
    formData.vipAddress = ''
  }
})

// 监听IP类型变化，清空VIP地址
watch(() => formData.ipType, () => {
  formData.vipAddress = ''
})

// 重置表单
const resetForm = () => {
  formData.instanceName = ''
  formData.ipType = 'ipv4'
  formData.vipConfig = 'manual'
  formData.vipAddress = ''
  formData.networkType = 'public'
  formData.owner = 'huangji'
  formData.remark = ''
  
  // 清除表单验证状态
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 预填充表单数据（编辑模式）
const fillFormData = (instanceData) => {
  formData.instanceName = instanceData.instanceName || ''
  formData.ipType = instanceData.ipType || 'ipv4'
  formData.vipConfig = instanceData.vipConfig || 'manual'
  formData.vipAddress = instanceData.vip || ''
  formData.networkType = instanceData.networkType || 'public'
  formData.owner = instanceData.owner || ''
  formData.remark = instanceData.remark || ''
  
  // 清除表单验证状态
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

// 生成随机VIP地址（用于自动分配）
const generateVipAddress = () => {
  if (formData.ipType === 'ipv4') {
    // 生成IPv4地址
    const segments = []
    segments.push(Math.floor(Math.random() * 223) + 1) // 第一段1-223
    for (let i = 1; i < 4; i++) {
      segments.push(Math.floor(Math.random() * 256))
    }
    return segments.join('.')
  } else {
    // 生成IPv6地址（简化版）
    const segments = []
    for (let i = 0; i < 8; i++) {
      segments.push(Math.floor(Math.random() * 65536).toString(16).padStart(4, '0'))
    }
    return segments.join(':')
  }
}

// 生成实例ID
const generateInstanceId = () => {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  return timestamp + random
}

// 提交表单
const handleSubmit = async () => {
  try {
    // 验证表单
    await formRef.value.validate()
    
    submitting.value = true
    
    if (props.mode === 'edit') {
      // 编辑模式：只提交可编辑字段
      const updateData = {
        id: props.instanceData.id,
        owner: formData.owner,
        remark: formData.remark
      }
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      ElMessage.success('实例信息更新成功')
      
      // 触发成功事件，返回更新后的完整数据
      const updatedData = {
        ...props.instanceData,
        owner: formData.owner,
        remark: formData.remark
      }
      emit('success', updatedData)
      
    } else {
      // 新建模式：提交完整数据
      const submitData = {
        id: generateInstanceId(),
        instanceName: formData.instanceName,
        vip: formData.vipConfig === 'auto' ? generateVipAddress() : formData.vipAddress,
        attractionStatus: 'not_attracted', // 新建实例默认未牵引
        owner: formData.owner,
        runningStatus: 'running', // 新建实例默认运行中
        createTime: new Date().toLocaleString(),
        ipType: formData.ipType,
        vipConfig: formData.vipConfig,
        networkType: formData.networkType,
        remark: formData.remark
      }
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      ElMessage.success('创建实例成功')
      
      // 触发成功事件
      emit('success', submitData)
    }
    
    // 关闭抽屉
    handleClose()
    
  } catch (error) {
    console.error(`${props.mode === 'edit' ? '更新' : '创建'}实例失败:`, error)
    if (error !== 'validation failed') {
      ElMessage.error(`${props.mode === 'edit' ? '更新' : '创建'}实例失败，请重试`)
    }
  } finally {
    submitting.value = false
  }
}

// 取消操作
const handleCancel = () => {
  handleClose()
}

// 关闭抽屉
const handleClose = () => {
  // 重置表单
  resetForm()
  // 关闭抽屉
  visible.value = false
}

// 监听抽屉打开，重置或预填充表单
watch(visible, (newVal) => {
  if (newVal) {
    if (props.mode === 'edit' && props.instanceData) {
      // 编辑模式预填充数据
      fillFormData(props.instanceData)
    } else {
      // 新建模式重置表单
      resetForm()
    }
  }
})

// 监听instanceData变化，编辑模式下预填充表单
watch(() => props.instanceData, (newData) => {
  if (newData && props.mode === 'edit' && visible.value) {
    fillFormData(newData)
  }
}, { deep: true })
</script>

<style scoped>
.drawer-content {
  padding: 0 20px;
  height: calc(100vh - 120px);
  overflow-y: auto;
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
  padding-top: 20px;
}

.el-form-item {
  margin-bottom: 24px;
}

.el-form-item__label {
  font-weight: 500;
  color: #606266;
}

.el-radio-group {
  display: flex;
  flex-wrap: wrap;
}

.el-radio {
  margin-right: 24px;
  margin-bottom: 8px;
}

.el-textarea .el-input__count {
  background-color: transparent;
}

/* 必填字段标红星 */
.el-form-item.is-required .el-form-item__label:before {
  content: '*';
  color: #f56c6c;
  margin-right: 4px;
}

/* 只读输入框样式 */
.readonly-input {
  background-color: #f5f7fa;
  cursor: not-allowed;
}

.readonly-input :deep(.el-input__inner) {
  background-color: #f5f7fa !important;
  cursor: not-allowed;
  color: #606266;
}

/* 只读单选按钮样式 */
.el-radio-group :deep(.el-radio.is-disabled) {
  cursor: not-allowed;
}

.el-radio-group :deep(.el-radio.is-disabled .el-radio__input.is-disabled .el-radio__inner) {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
}

.el-radio-group :deep(.el-radio.is-disabled .el-radio__label) {
  color: #606266;
}
</style>
