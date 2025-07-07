<template>
  <div class="fingerprint-tab-container">
    <div class="description-text">
      当前仅支持TCP和UDP协议，通过指纹特征识别恶意流量并进行过滤。
    </div>
    
    <div class="table-operations">
      <el-button type="primary" @click="handleAddFingerprint">添加特征</el-button>
    </div>
    
    <el-table :data="fingerprintRules" style="width: 100%" v-loading="loading">
      <el-table-column prop="protocol" label="协议" width="80" />
      <el-table-column label="开始源端口-结束源端口" width="180">
        <template #default="scope">
          {{ scope.row.sourcePortStart }} - {{ scope.row.sourcePortEnd }}
        </template>
      </el-table-column>
      <el-table-column label="开始目的端口-结束目的端口" width="180">
        <template #default="scope">
          {{ scope.row.destPortStart }} - {{ scope.row.destPortEnd }}
        </template>
      </el-table-column>
      <el-table-column label="最小包长-最大包长" width="150">
        <template #default="scope">
          {{ scope.row.minPacketLength }} - {{ scope.row.maxPacketLength }}
        </template>
      </el-table-column>
      <el-table-column prop="offset" label="偏移量" width="80">
        <template #default="scope">
          {{ scope.row.offset !== undefined ? scope.row.offset : '--' }}
        </template>
      </el-table-column>
      <el-table-column prop="matchData" label="检测数据" width="120">
        <template #default="scope">
          {{ scope.row.matchData || '--' }}
        </template>
      </el-table-column>
      <el-table-column prop="action" label="匹配后动作" width="120">
        <template #default="scope">
          {{ getActionLabel(scope.row.action) }}
        </template>
      </el-table-column>
      <el-table-column prop="threshold" label="阈值" width="80">
        <template #default="scope">
          {{ scope.row.threshold || '--' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="scope">
          <el-button type="text" size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="text" size="small" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <div v-if="fingerprintRules.length === 0" class="empty-data">
      <div class="empty-text">没有查询到符合条件的记录</div>
    </div>
    
    <!-- 添加/编辑特征抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      :title="isEdit ? '编辑指纹过滤特征' : '新增指纹过滤特征'"
      size="50%"
      :destroy-on-close="false"
      :before-close="handleDrawerClose"
    >
      <div class="drawer-content" v-loading="submitLoading">
        <el-form 
          ref="formRef" 
          :model="form" 
          :rules="rules" 
          label-width="180px" 
          label-position="right"
        >
          <el-form-item label="协议" prop="protocol" required>
            <el-select v-model="form.protocol" placeholder="请选择协议" style="width: 100%">
              <el-option label="TCP" value="TCP" />
              <el-option label="UDP" value="UDP" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="开始源端口-结束源端口" required>
            <div class="port-range">
              <el-form-item prop="sourcePortStart">
                <el-input-number 
                  v-model="form.sourcePortStart" 
                  :min="0" 
                  :max="65535"
                  controls-position="right"
                />
              </el-form-item>
              <span class="range-separator">-</span>
              <el-form-item prop="sourcePortEnd">
                <el-input-number 
                  v-model="form.sourcePortEnd" 
                  :min="0" 
                  :max="65535"
                  controls-position="right"
                />
              </el-form-item>
            </div>
          </el-form-item>
          
          <el-form-item label="开始目的端口-结束目的端口" required>
            <div class="port-range">
              <el-form-item prop="destPortStart">
                <el-input-number 
                  v-model="form.destPortStart" 
                  :min="0" 
                  :max="65535"
                  controls-position="right"
                />
              </el-form-item>
              <span class="range-separator">-</span>
              <el-form-item prop="destPortEnd">
                <el-input-number 
                  v-model="form.destPortEnd" 
                  :min="0" 
                  :max="65535"
                  controls-position="right"
                />
              </el-form-item>
            </div>
            <div class="form-tip">请输入正确的端口范围，取值0~65535，不能为空。</div>
          </el-form-item>
          
          <el-form-item label="最小包长-最大包长" required>
            <div class="port-range">
              <el-form-item prop="minPacketLength">
                <el-input-number 
                  v-model="form.minPacketLength" 
                  :min="1" 
                  :max="1500"
                  controls-position="right"
                />
              </el-form-item>
              <span class="range-separator">-</span>
              <el-form-item prop="maxPacketLength">
                <el-input-number 
                  v-model="form.maxPacketLength" 
                  :min="1" 
                  :max="1500"
                  controls-position="right"
                />
              </el-form-item>
            </div>
            <div class="form-tip">范围1 ~ 1500，不能为空。最大包长必须大于等于最小包长。</div>
          </el-form-item>
          
          <el-form-item label="偏移量" prop="offset">
            <el-input-number 
              v-model="form.offset" 
              :min="0" 
              :max="1500"
              controls-position="right"
              style="width: 180px"
            />
            <div class="form-tip">偏移量的单位是字节，表示匹配的二进制。当前支持最大二进制长度15字节，偏移起始为0时，从payload第一字节开始匹配。</div>
          </el-form-item>
          
          <el-form-item label="检测数据" prop="matchData">
            <el-input 
              v-model="form.matchData" 
              placeholder="请输入十六进制字符串"
              style="width: 300px"
            />
            <div class="form-tip">请输入十六进制字符串。</div>
          </el-form-item>
          
          <el-form-item label="匹配后动作" prop="action" required>
            <el-select v-model="form.action" placeholder="请选择匹配后动作" style="width: 180px">
              <el-option label="通过" value="pass" />
              <el-option label="丢弃" value="drop" />
              <el-option label="源IP限速" value="sourceIpLimit" />
              <el-option label="Session限速" value="sessionLimit" />
            </el-select>
          </el-form-item>
          
          <el-form-item 
            label="阈值" 
            prop="threshold" 
            v-if="form.action === 'sourceIpLimit' || form.action === 'sessionLimit'"
          >
            <el-input-number 
              v-model="form.threshold" 
              :min="1" 
              controls-position="right"
              style="width: 180px"
            />
          </el-form-item>
        </el-form>
        
        <div class="drawer-footer">
          <el-button @click="handleDrawerClose">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      enabled: false,
      rules: []
    })
  }
})

const emit = defineEmits(['update:modelValue'])

// 数据加载状态
const loading = ref(false)
const submitLoading = ref(false)

// 指纹过滤规则列表
const fingerprintRules = ref([])

// 抽屉状态
const drawerVisible = ref(false)
const isEdit = ref(false)
const currentEditId = ref(null)

// 表单引用
const formRef = ref(null)

// 表单数据
const form = reactive({
  protocol: 'TCP',
  sourcePortStart: 0,
  sourcePortEnd: 65535,
  destPortStart: 0,
  destPortEnd: 65535,
  minPacketLength: 1,
  maxPacketLength: 1500,
  offset: undefined,
  matchData: '',
  action: 'pass',
  threshold: undefined
})

// 表单验证规则
const rules = {
  protocol: [
    { required: true, message: '请选择协议', trigger: 'change' }
  ],
  sourcePortStart: [
    { required: true, message: '请输入开始源端口', trigger: 'blur' },
    { type: 'number', min: 0, max: 65535, message: '端口范围为0-65535', trigger: 'blur' }
  ],
  sourcePortEnd: [
    { required: true, message: '请输入结束源端口', trigger: 'blur' },
    { type: 'number', min: 0, max: 65535, message: '端口范围为0-65535', trigger: 'blur' }
  ],
  destPortStart: [
    { required: true, message: '请输入开始目的端口', trigger: 'blur' },
    { type: 'number', min: 0, max: 65535, message: '端口范围为0-65535', trigger: 'blur' }
  ],
  destPortEnd: [
    { required: true, message: '请输入结束目的端口', trigger: 'blur' },
    { type: 'number', min: 0, max: 65535, message: '端口范围为0-65535', trigger: 'blur' }
  ],
  minPacketLength: [
    { required: true, message: '请输入最小包长', trigger: 'blur' },
    { type: 'number', min: 1, max: 1500, message: '包长范围为1-1500', trigger: 'blur' }
  ],
  maxPacketLength: [
    { required: true, message: '请输入最大包长', trigger: 'blur' },
    { type: 'number', min: 1, max: 1500, message: '包长范围为1-1500', trigger: 'blur' }
  ],
  matchData: [
    { pattern: /^[0-9A-Fa-f]*$/, message: '请输入有效的十六进制字符串', trigger: 'blur' }
  ],
  action: [
    { required: true, message: '请选择匹配后动作', trigger: 'change' }
  ]
}

// 初始化数据
onMounted(() => {
  initFromProps()
})

// 从props初始化数据
const initFromProps = () => {
  if (props.modelValue && props.modelValue.rules) {
    fingerprintRules.value = [...props.modelValue.rules]
  }
}

// 获取动作标签
const getActionLabel = (action) => {
  const actionMap = {
    'pass': '通过',
    'drop': '丢弃',
    'sourceIpLimit': '源IP限速',
    'sessionLimit': 'Session限速'
  }
  return actionMap[action] || action
}

// 添加指纹特征
const handleAddFingerprint = () => {
  isEdit.value = false
  currentEditId.value = null
  resetForm()
  drawerVisible.value = true
}

// 编辑指纹特征
const handleEdit = (row) => {
  isEdit.value = true
  currentEditId.value = row.id
  
  // 填充表单数据
  Object.keys(form).forEach(key => {
    if (row[key] !== undefined) {
      form[key] = row[key]
    }
  })
  
  drawerVisible.value = true
}

// 删除指纹特征
const handleDelete = (row) => {
  ElMessageBox.confirm(
    '确定要删除此指纹过滤特征吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 从列表中删除
    const index = fingerprintRules.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      fingerprintRules.value.splice(index, 1)
      updateModelValue()
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

// 关闭抽屉
const handleDrawerClose = () => {
  ElMessageBox.confirm(
    '确定要关闭吗？未保存的修改将会丢失',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    drawerVisible.value = false
  }).catch(() => {})
}

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    protocol: 'TCP',
    sourcePortStart: 0,
    sourcePortEnd: 65535,
    destPortStart: 0,
    destPortEnd: 65535,
    minPacketLength: 1,
    maxPacketLength: 1500,
    offset: undefined,
    matchData: '',
    action: 'pass',
    threshold: undefined
  })
  
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 提交表单
const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (!valid) {
      return
    }
    
    // 验证端口范围
    if (form.sourcePortEnd < form.sourcePortStart) {
      ElMessage.error('结束源端口必须大于等于开始源端口')
      return
    }
    
    if (form.destPortEnd < form.destPortStart) {
      ElMessage.error('结束目的端口必须大于等于开始目的端口')
      return
    }
    
    // 验证包长范围
    if (form.maxPacketLength < form.minPacketLength) {
      ElMessage.error('最大包长必须大于等于最小包长')
      return
    }
    
    submitLoading.value = true
    
    try {
      const formData = { ...form }
      
      // 如果不是限速动作，则不需要阈值
      if (formData.action !== 'sourceIpLimit' && formData.action !== 'sessionLimit') {
        formData.threshold = undefined
      }
      
      if (isEdit.value && currentEditId.value !== null) {
        // 编辑现有规则
        const index = fingerprintRules.value.findIndex(item => item.id === currentEditId.value)
        if (index !== -1) {
          formData.id = currentEditId.value
          fingerprintRules.value[index] = formData
        }
      } else {
        // 添加新规则
        formData.id = Date.now() // 临时ID
        fingerprintRules.value.push(formData)
      }
      
      // 更新父组件数据
      updateModelValue()
      
      ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
      drawerVisible.value = false
    } catch (error) {
      console.error('保存指纹过滤特征失败:', error)
      ElMessage.error('操作失败，请重试')
    } finally {
      submitLoading.value = false
    }
  })
}

// 更新父组件数据
const updateModelValue = () => {
  emit('update:modelValue', {
    enabled: fingerprintRules.value.length > 0,
    rules: fingerprintRules.value
  })
}
</script>

<style scoped>
.fingerprint-tab-container {
  padding: 0;
}

.description-text {
  margin-bottom: 20px;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.table-operations {
  margin-bottom: 16px;
  text-align: right;
}

.empty-data {
  padding: 32px 0;
  text-align: center;
  color: #909399;
}

.drawer-content {
  padding: 20px;
  height: 100%;
  overflow: auto;
}

.drawer-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px 20px;
  display: flex;
  justify-content: flex-end;
  background-color: #fff;
  border-top: 1px solid #e4e7ed;
}

.port-range {
  display: flex;
  align-items: center;
}

.range-separator {
  margin: 0 10px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  line-height: 1.4;
}

:deep(.el-form-item__content) {
  flex-wrap: wrap;
}

:deep(.el-form-item) {
  margin-bottom: 22px;
}

:deep(.el-drawer__header) {
  margin-bottom: 0;
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;
}

:deep(.el-drawer__body) {
  padding: 0;
  overflow: hidden;
}
</style> 