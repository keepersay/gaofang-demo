<template>
  <el-drawer
    v-model="visible"
    title="编辑监听"
    size="50vw"
    direction="rtl"
    :before-close="handleClose"
    destroy-on-close
  >
    <div class="listener-edit-content">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
        label-position="left"
        @submit.prevent
      >
        <!-- 基础配置 -->
        <div class="config-section">
          <h3 class="section-title">基础配置</h3>
          
          <el-form-item label="监听名称" prop="name">
            <el-input
              v-model="formData.name"
              placeholder="请输入监听名称"
              maxlength="50"
              clearable
            />
          </el-form-item>

          <el-form-item label="IP协议类型">
            <el-input
              v-model="formData.ipVersion"
              readonly
              class="readonly-input"
            />
          </el-form-item>

          <el-form-item label="VIP地址">
            <el-input
              v-model="formData.vip"
              readonly
              class="readonly-input"
            />
          </el-form-item>

          <el-form-item label="监听端口">
            <el-input
              v-model="formData.vport"
              readonly
              class="readonly-input"
            />
          </el-form-item>

          <el-form-item label="协议">
            <el-input
              v-model="formData.protocol"
              readonly
              class="readonly-input"
            />
          </el-form-item>

          <el-form-item label="负载模式">
            <el-input
              v-model="formData.fwMode"
              readonly
              class="readonly-input"
            />
          </el-form-item>

          <el-form-item label="调度算法" prop="schedule">
            <el-radio-group v-model="formData.schedule">
              <el-radio value="wrr">加权轮询(wrr)</el-radio>
              <el-radio value="wlc">加权最小连接(wlc)</el-radio>
              <el-radio value="conhash">IP一致性散列(ipconhash)</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="会话超时时间" prop="timeout">
            <div class="timeout-config">
              <el-input-number 
                v-model="formData.timeout" 
                :min="30" 
                :max="3600" 
                controls-position="right"
                style="width: 150px;"
              />
              <span class="unit">s</span>
              <span class="range-tip">范围: 30-3600</span>
            </div>
          </el-form-item>

          <el-form-item label="本地IP对象">
            <el-input 
              v-model="formData.localIpObject" 
              placeholder="请选择" 
              readonly
              clearable
            />
          </el-form-item>

          <el-form-item label="健康检查IP对象">
            <el-input 
              v-model="formData.healthCheckIpObject" 
              placeholder="请选择" 
              readonly
              clearable
            />
          </el-form-item>
        </div>

        <!-- 健康检查 -->
        <div class="config-section">
          <h3 class="section-title">健康检查</h3>
          
          <!-- 协议和端口行 -->
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="协议" prop="healthCheck.checkType">
                <el-select v-model="formData.healthCheck.checkType" @change="handleProtocolChange">
                  <el-option label="NONE" value="none" />
                  <el-option label="ICMP" value="icmp" />
                  <el-option label="TCP" value="tcp" />
                  <el-option label="UDP" value="udp" />
                  <el-option label="HTTP" value="http" />
                  <el-option label="HTTPS" value="https" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12" v-if="needsPort">
              <el-form-item label="探测端口" prop="healthCheck.port">
                <el-input 
                  v-model="formData.healthCheck.port" 
                  placeholder="1-65535"
                  style="width: 120px;"
                  clearable
                />
                <div class="range-tip">范围: 1-65535</div>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- HTTPS特殊提示 -->
          <el-alert 
            v-if="formData.healthCheck.checkType === 'https'"
            title="不支持双向认证"
            type="info"
            :closable="false"
            style="margin-bottom: 16px;"
          />

          <!-- 基础参数行（非NONE协议才显示） -->
          <template v-if="formData.healthCheck.checkType !== 'none'">
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="探测间隔" prop="healthCheck.checkInterval">
                  <div class="input-with-unit">
                    <el-input-number 
                      v-model="formData.healthCheck.checkInterval" 
                      :min="10" 
                      :max="3600" 
                      controls-position="right"
                      style="width: 120px;"
                    />
                    <span class="unit">s</span>
                  </div>
                  <div class="range-tip">范围: 10-3600</div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="超时时间" prop="healthCheck.checkTimeout">
                  <div class="input-with-unit">
                    <el-input-number 
                      v-model="formData.healthCheck.checkTimeout" 
                      :min="1" 
                      :max="60" 
                      controls-position="right"
                      style="width: 120px;"
                    />
                    <span class="unit">s</span>
                  </div>
                  <div class="range-tip">范围: 1-60</div>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="成功次数" prop="healthCheck.succCnt">
                  <el-input-number 
                    v-model="formData.healthCheck.succCnt" 
                    :min="1" 
                    :max="128" 
                    controls-position="right"
                    style="width: 120px;"
                  />
                  <div class="range-tip">范围: 1-128</div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="失败次数" prop="healthCheck.errCnt">
                  <el-input-number 
                    v-model="formData.healthCheck.errCnt" 
                    :min="1" 
                    :max="128" 
                    controls-position="right"
                    style="width: 120px;"
                  />
                  <div class="range-tip">范围: 1-128</div>
                </el-form-item>
              </el-col>
            </el-row>
          </template>

          <!-- HTTP/HTTPS 扩展配置 -->
          <template v-if="needsHttpConfig">
            <el-form-item label="域名/路径" prop="healthCheck.domain">
              <el-input 
                v-model="formData.healthCheck.domain" 
                placeholder="请输入域名/路径"
                clearable
              />
              <div class="form-tip">提示: 请勿输入含有端口的域名</div>
            </el-form-item>
            
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="返回码" prop="healthCheck.resCode">
                  <el-input 
                    v-model="formData.healthCheck.resCode" 
                    placeholder="请输入返回码"
                    clearable
                  />
                  <div class="form-tip">
                    支持格式: 100, 200-999, >=100且<=999, 多个用|分隔
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-form-item label="返回信息">
              <el-input 
                v-model="formData.healthCheck.resInfo" 
                type="textarea"
                :rows="3"
                placeholder="请输入内容"
                clearable
              />
            </el-form-item>
          </template>
        </div>

        <!-- 高级配置 -->
        <div class="config-section">
          <h3 class="section-title">高级配置</h3>
          
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="限速配置">
                <el-select v-model="formData.rateLimitConfig" placeholder="请选择" clearable>
                  <el-option label="限速配置1" value="qos1" />
                  <el-option label="限速配置2" value="qos2" />
                  <el-option label="限速配置3" value="qos3" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="IP黑名单">
                <el-input v-model="formData.ipBlacklist" placeholder="请选择" clearable />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="IP白名单">
            <el-input v-model="formData.ipWhitelist" placeholder="请选择" clearable />
          </el-form-item>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="TOA">
                <el-switch v-model="formData.toaEnabled" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="会话同步">
                <el-switch v-model="formData.sessionSyncEnabled" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="双向reset">
                <el-switch v-model="formData.bidirectionalResetEnabled" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="五元组日志">
                <el-switch v-model="formData.fiveTupleLogEnabled" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="会话静默删除">
            <el-switch v-model="formData.sessionSilentDeleteEnabled" />
          </el-form-item>

          <el-form-item label="负责人">
            <el-select v-model="formData.owner" style="width: 200px;">
              <el-option label="huangji" value="huangji" />
              <el-option label="zhangsan" value="zhangsan" />
              <el-option label="lisi" value="lisi" />
            </el-select>
          </el-form-item>

          <el-form-item label="备注">
            <el-input 
              v-model="formData.remark" 
              type="textarea"
              :rows="3"
              placeholder="请输入内容"
              maxlength="100"
              show-word-limit
              clearable
            />
          </el-form-item>
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
  localIpObject: '',
  healthCheckIpObject: '',
  healthCheck: {
    checkType: 'none',
    port: '',
    checkInterval: 10,
    checkTimeout: 1,
    succCnt: 1,
    errCnt: 3,
    domain: '',
    resCode: '',
    resInfo: ''
  },
  rateLimitConfig: '',
  ipBlacklist: '',
  ipWhitelist: '',
  toaEnabled: true,
  sessionSyncEnabled: true,
  bidirectionalResetEnabled: false,
  fiveTupleLogEnabled: false,
  sessionSilentDeleteEnabled: false,
  owner: 'huangji',
  remark: ''
})

// QoS ID选项（模拟数据）
const qidOptions = ref([
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  11, 12, 13, 14, 15, 16, 17, 18, 19, 20
])

// 健康检查相关计算属性
const needsPort = computed(() => {
  return ['tcp', 'udp', 'http', 'https'].includes(formData.healthCheck.checkType)
})

const needsHttpConfig = computed(() => {
  return ['http', 'https'].includes(formData.healthCheck.checkType)
})

// 健康检查协议变化处理
const handleProtocolChange = (value) => {
  // 清空端口
  if (value === 'none') {
    formData.healthCheck.port = ''
  }
}

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
  'healthCheck.checkType': [
    { required: true, message: '请选择健康检查协议', trigger: 'change' }
  ],
  'healthCheck.port': [
    { 
      validator: (rule, value, callback) => {
        if (needsPort.value && !value) {
          callback(new Error('请输入探测端口'))
        } else if (value && (value < 1 || value > 65535)) {
          callback(new Error('端口范围必须在1-65535之间'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ],
  'healthCheck.checkInterval': [
    { 
      validator: (rule, value, callback) => {
        if (formData.healthCheck.checkType !== 'none' && (!value || value < 10 || value > 3600)) {
          callback(new Error('探测间隔必须在10-3600秒之间'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ],
  'healthCheck.checkTimeout': [
    { 
      validator: (rule, value, callback) => {
        if (formData.healthCheck.checkType !== 'none' && (!value || value < 1 || value > 60)) {
          callback(new Error('超时时间必须在1-60秒之间'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ],
  'healthCheck.succCnt': [
    { 
      validator: (rule, value, callback) => {
        if (formData.healthCheck.checkType !== 'none' && (!value || value < 1 || value > 128)) {
          callback(new Error('成功次数必须在1-128之间'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ],
  'healthCheck.errCnt': [
    { 
      validator: (rule, value, callback) => {
        if (formData.healthCheck.checkType !== 'none' && (!value || value < 1 || value > 128)) {
          callback(new Error('失败次数必须在1-128之间'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
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
    
    // 初始化基础配置字段
    formData.name = newData.name || ''
    formData.schedule = newData.schedule || 'wrr'
    formData.timeout = newData.timeout || 300
    formData.localIpObject = newData.localIpObject || ''
    formData.healthCheckIpObject = newData.healthCheckIpObject || ''
    
    // 初始化健康检查字段
    formData.healthCheck = {
      checkType: newData.healthCheck?.checkType || 'none',
      port: newData.healthCheck?.port || '',
      checkInterval: newData.healthCheck?.checkInterval || 10,
      checkTimeout: newData.healthCheck?.checkTimeout || 1,
      succCnt: newData.healthCheck?.succCnt || 1,
      errCnt: newData.healthCheck?.errCnt || 3,
      domain: newData.healthCheck?.domain || '',
      resCode: newData.healthCheck?.resCode || '',
      resInfo: newData.healthCheck?.resInfo || ''
    }
    
    // 初始化高级配置字段
    formData.rateLimitConfig = newData.rateLimitConfig || ''
    formData.ipBlacklist = newData.ipBlacklist || ''
    formData.ipWhitelist = newData.ipWhitelist || ''
    formData.toaEnabled = newData.toaEnabled !== undefined ? newData.toaEnabled : true
    formData.sessionSyncEnabled = newData.sessionSyncEnabled !== undefined ? newData.sessionSyncEnabled : true
    formData.bidirectionalResetEnabled = newData.bidirectionalResetEnabled || false
    formData.fiveTupleLogEnabled = newData.fiveTupleLogEnabled || false
    formData.sessionSilentDeleteEnabled = newData.sessionSilentDeleteEnabled || false
    formData.owner = newData.owner || 'huangji'
    formData.remark = newData.remark || ''
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
      localIpObject: formData.localIpObject,
      healthCheckIpObject: formData.healthCheckIpObject,
      healthCheck: formData.healthCheck,
      rateLimitConfig: formData.rateLimitConfig,
      ipBlacklist: formData.ipBlacklist,
      ipWhitelist: formData.ipWhitelist,
      toaEnabled: formData.toaEnabled,
      sessionSyncEnabled: formData.sessionSyncEnabled,
      bidirectionalResetEnabled: formData.bidirectionalResetEnabled,
      fiveTupleLogEnabled: formData.fiveTupleLogEnabled,
      sessionSilentDeleteEnabled: formData.sessionSilentDeleteEnabled,
      owner: formData.owner,
      remark: formData.remark
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
    localIpObject: '',
    healthCheckIpObject: '',
    healthCheck: {
      checkType: 'none',
      port: '',
      checkInterval: 10,
      checkTimeout: 1,
      succCnt: 1,
      errCnt: 3,
      domain: '',
      resCode: '',
      resInfo: ''
    },
    rateLimitConfig: '',
    ipBlacklist: '',
    ipWhitelist: '',
    toaEnabled: true,
    sessionSyncEnabled: true,
    bidirectionalResetEnabled: false,
    fiveTupleLogEnabled: false,
    sessionSilentDeleteEnabled: false,
    owner: 'huangji',
    remark: ''
  })
}
</script>

<style scoped>
.listener-edit-content {
  padding: 0 20px 20px;
  height: calc(100vh - 120px);
  overflow-y: auto;
}

.config-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #ebeef5;
}

.config-section:last-child {
  border-bottom: none;
}

.section-title {
  margin: 0 0 20px 0;
  padding-left: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  border-left: 3px solid #409EFF;
}

.timeout-config {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-with-unit {
  display: flex;
  align-items: center;
  gap: 8px;
}

.unit {
  color: #606266;
  font-size: 14px;
}

.range-tip {
  color: #909399;
  font-size: 12px;
  margin-left: 8px;
}

.form-tip {
  color: #909399;
  font-size: 12px;
  margin-top: 4px;
  margin-left: 8px;
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

/* 确保只读输入框样式生效 */
.readonly-input {
  pointer-events: none;
}

/* 只读字段样式 */
.el-form-item:has(.readonly-input) .el-form-item__label {
  color: #909399 !important;
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

/* 必填字段标识 */
.el-form-item.is-required .el-form-item__label::before {
  content: '*';
  color: #f56c6c;
  margin-right: 4px;
}
</style>
