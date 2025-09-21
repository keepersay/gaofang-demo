<template>
  <el-drawer
    v-model="visible"
    title="添加后端主机"
    size="40vw"
    direction="rtl"
    :before-close="handleClose"
    destroy-on-close
  >
    <div class="backend-host-create-content">
      <el-form
        :model="formData"
        :rules="rules"
        ref="formRef"
        label-width="100px"
        label-position="left"
        @submit.prevent
      >
        <el-form-item label="地址类型" prop="addressType">
          <el-radio-group v-model="formData.addressType">
            <el-radio value="主机簿">主机簿</el-radio>
            <el-radio value="手工配置">手工配置</el-radio>
          </el-radio-group>
          <div class="form-tip">
            <el-icon><InfoFilled /></el-icon>
            <span>主机簿功能尚未实现，目前仅支持手工配置</span>
          </div>
        </el-form-item>

        <el-form-item label="IP" prop="ip">
          <el-input 
            v-model="formData.ip" 
            placeholder="请输入IP地址" 
            clearable
          />
        </el-form-item>

        <el-form-item label="端口" prop="port">
          <el-input 
            v-model="formData.port" 
            placeholder="请输入端口" 
            clearable
          />
        </el-form-item>

        <el-form-item label="权重" prop="weight">
          <el-input-number 
            v-model="formData.weight" 
            :min="1" 
            :max="100" 
            controls-position="right"
            style="width: 120px;"
          />
          <div class="range-tip">范围: 1-100</div>
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input 
            v-model="formData.remark" 
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
            maxlength="200"
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
          确定
        </el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'

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

// 表单引用
const formRef = ref()
const submitting = ref(false)

// 表单数据
const formData = reactive({
  addressType: '手工配置', // 默认手工配置
  ip: '',                 // IP地址
  port: '',               // 端口
  weight: 10,             // 权重，默认10
  remark: ''              // 备注
})

// 表单验证规则
const rules = {
  addressType: [
    { required: true, message: '请选择地址类型', trigger: 'change' }
  ],
  ip: [
    { required: true, message: '请输入IP地址', trigger: 'blur' },
    { 
      pattern: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/, 
      message: '请输入有效的IP地址', 
      trigger: 'blur' 
    }
  ],
  port: [
    { required: true, message: '请输入端口', trigger: 'blur' },
    { 
      pattern: /^([1-9]\d{0,3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/, 
      message: '端口范围: 1-65535', 
      trigger: 'blur' 
    }
  ],
  weight: [
    { type: 'number', min: 1, max: 100, message: '权重范围: 1-100', trigger: 'blur' }
  ]
}

// 构建后端主机数据
const buildBackendHostData = () => {
  return {
    id: Date.now(), // 临时ID
    listenerId: props.listenerData?.id,
    addressType: formData.addressType,
    ip: formData.ip,
    port: parseInt(formData.port),
    weight: formData.weight,
    remark: formData.remark,
    status: 'running', // 默认运行状态
    health: '正常'     // 默认健康状态
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    // 验证表单
    await formRef.value.validate()
    
    submitting.value = true
    
    // 构建后端主机数据
    const backendHostData = buildBackendHostData()
    console.log('添加后端主机数据:', backendHostData)
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('后端主机添加成功')
    
    // 触发成功事件
    emit('success', backendHostData)
    
    // 关闭抽屉
    handleClose()
    
  } catch (error) {
    console.error('添加后端主机失败:', error)
    if (error !== 'validation failed') {
      ElMessage.error('添加后端主机失败，请重试')
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

// 重置表单
const resetForm = () => {
  // 重置数据
  Object.assign(formData, {
    addressType: '手工配置',
    ip: '',
    port: '',
    weight: 10,
    remark: ''
  })
  
  // 清除表单验证状态
  if (formRef.value) {
    formRef.value.resetFields()
  }
}
</script>

<style scoped>
.backend-host-create-content {
  padding: 20px;
  height: calc(100vh - 120px);
  overflow-y: auto;
}

.form-tip {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}

.range-tip {
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

.el-radio-group {
  display: flex;
  gap: 16px;
}

/* 必填字段标红星 */
.el-form-item.is-required .el-form-item__label:before {
  content: '*';
  color: #f56c6c;
  margin-right: 4px;
}

/* 确保抽屉宽度为40% */
:deep(.el-drawer) {
  width: 40% !important;
}

:deep(.el-drawer__body) {
  padding: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .backend-host-create-content {
    padding: 16px;
  }
  
  .el-radio-group {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
