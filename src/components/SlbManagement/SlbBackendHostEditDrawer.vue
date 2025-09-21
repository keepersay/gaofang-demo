<template>
  <el-drawer
    v-model="visible"
    title="编辑后端主机"
    size="40vw"
    direction="rtl"
    :before-close="handleClose"
    destroy-on-close
  >
    <div class="backend-host-edit-content">
      <el-form
        :model="formData"
        :rules="rules"
        ref="formRef"
        label-width="100px"
        label-position="left"
        @submit.prevent
      >
        <!-- 只读信息展示 -->
        <el-form-item label="主机簿名称">
          <el-input 
            :value="formData.serverName || '--'" 
            readonly
            class="readonly-input"
          />
        </el-form-item>

        <el-form-item label="IP地址">
          <el-input 
            :value="formData.ipAddress" 
            readonly
            class="readonly-input"
          />
        </el-form-item>

        <el-form-item label="端口">
          <el-input 
            :value="formData.port" 
            readonly
            class="readonly-input"
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-tag 
            :type="getStatusTagType(formData.status)" 
            size="small"
            class="status-tag"
          >
            {{ getStatusText(formData.status) }}
          </el-tag>
        </el-form-item>

        <el-form-item label="健康检查">
          <el-tag 
            :type="formData.healthCheck === '正常' ? 'success' : 'danger'" 
            size="small"
            class="status-tag"
          >
            {{ formData.healthCheck }}
          </el-tag>
        </el-form-item>

        <!-- 可编辑的权重 -->
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

        <!-- 可编辑的备注 -->
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
  serverData: {
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
  id: null,
  serverName: '',
  ipAddress: '',
  port: '',
  weight: 10,
  remark: '',
  status: '',
  healthCheck: ''
})

// 表单验证规则
const rules = {
  weight: [
    { type: 'number', min: 1, max: 100, message: '权重范围: 1-100', trigger: 'blur' }
  ]
}

// 状态文本映射
const getStatusText = (status) => {
  const statusMap = {
    'running': '运行中',
    'stopped': '已停用',
    'error': '异常'
  }
  return statusMap[status] || status
}

// 状态标签类型映射
const getStatusTagType = (status) => {
  const typeMap = {
    'running': 'success',
    'stopped': 'info',
    'error': 'danger'
  }
  return typeMap[status] || 'info'
}

// 监听服务器数据变化，初始化表单
watch(() => props.serverData, (newData) => {
  if (newData) {
    Object.assign(formData, {
      id: newData.id,
      serverName: newData.serverName || '--',
      ipAddress: newData.ipAddress,
      port: newData.port,
      weight: newData.weight,
      remark: newData.remark || '',
      status: newData.status,
      healthCheck: newData.healthCheck
    })
  }
}, { immediate: true })

// 提交表单
const handleSubmit = async () => {
  try {
    // 验证表单
    await formRef.value.validate()
    
    submitting.value = true
    
    // 构建更新数据
    const updateData = {
      id: formData.id,
      weight: formData.weight,
      remark: formData.remark
    }
    
    console.log('更新后端主机权重:', updateData)
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('主机权重更新成功')
    
    // 触发成功事件
    emit('success', updateData)
    
    // 关闭抽屉
    handleClose()
    
  } catch (error) {
    console.error('更新主机权重失败:', error)
    if (error !== 'validation failed') {
      ElMessage.error('更新主机权重失败，请重试')
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
    id: null,
    serverName: '',
    ipAddress: '',
    port: '',
    weight: 10,
    remark: '',
    status: '',
    healthCheck: ''
  })
  
  // 清除表单验证状态
  if (formRef.value) {
    formRef.value.resetFields()
  }
}
</script>

<style scoped>
.backend-host-edit-content {
  padding: 20px;
  height: calc(100vh - 120px);
  overflow-y: auto;
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

.status-tag {
  font-size: 12px;
  height: 24px;
  line-height: 22px;
  padding: 0 8px;
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

/* 只读字段样式 */
.el-form-item:has(.readonly-input) .el-form-item__label {
  color: #909399 !important;
}

/* 确保只读输入框样式生效 */
.readonly-input {
  pointer-events: none;
}

/* 可编辑字段突出显示 */
.el-form-item:has(.el-input-number) .el-form-item__label {
  color: #303133;
  font-weight: 600;
}

.el-form-item:has(.el-input-number) .el-form-item__label:after {
  content: '*';
  color: #f56c6c;
  margin-left: 4px;
}
</style>
