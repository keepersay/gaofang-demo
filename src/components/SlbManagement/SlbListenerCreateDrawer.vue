<template>
  <el-drawer
    v-model="visible"
    title="新建监听"
    size="50vw"
    direction="rtl"
    :before-close="handleClose"
    destroy-on-close
  >
    <div class="listener-create-content">
      <el-form
        :model="formData"
        :rules="rules"
        ref="formRef"
        label-width="120px"
        label-position="left"
        @submit.prevent
      >
        <!-- 基础配置 -->
        <div class="config-section">
          <h3 class="section-title">基础配置</h3>
          
          <el-form-item label="监听名称" prop="listenerName">
            <el-input 
              v-model="formData.listenerName" 
              placeholder="请输入监听名称" 
              clearable
            />
          </el-form-item>

          <el-form-item label="端口" prop="vport">
            <div class="port-config">
              <el-radio-group v-model="formData.portType" @change="handlePortTypeChange">
                <el-radio value="single">端口</el-radio>
                <el-radio value="range">端口范围</el-radio>
              </el-radio-group>
              <el-input 
                v-model="formData.vport" 
                :placeholder="formData.portType === 'single' ? '请输入端口' : '请输入端口范围，如：100-2000'" 
                clearable
                style="margin-top: 8px;"
              />
            </div>
          </el-form-item>

          <el-form-item label="协议" prop="protocol">
            <el-radio-group v-model="formData.protocol">
              <el-radio value="tcp">TCP</el-radio>
              <el-radio value="udp">UDP</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="调度算法" prop="schedule">
            <el-radio-group v-model="formData.schedule">
              <el-radio value="wrr">加权轮询(wrr)</el-radio>
              <el-radio value="wlc">加权最小连接(wlc)</el-radio>
              <el-radio value="conhash">IP一致性散列(ipconhash)</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="负载模式" prop="fwMode">
            <el-radio-group v-model="formData.fwMode">
              <el-radio value="fnat">FNAT</el-radio>
              <el-radio value="dnat">DNAT</el-radio>
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
              <el-option label="admin" value="admin" />
              <el-option label="operator" value="operator" />
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
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

// 定义props和emits
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
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
  // 基础配置
  listenerName: '',
  portType: 'single',
  vport: '',
  protocol: 'tcp',
  schedule: 'wrr',
  fwMode: 'fnat',
  timeout: 90,
  localIpObject: '',
  healthCheckIpObject: '',
  
  // 健康检查
  healthCheck: {
    checkType: 'none', // 默认为NONE
    port: '', // 字符串类型，无默认值
    checkInterval: 10,
    checkTimeout: 1,
    succCnt: 1,
    errCnt: 3,
    domain: '',
    resCode: '',
    resInfo: ''
  },
  
  // 高级配置
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

// 表单验证规则
const rules = computed(() => {
  const baseRules = {
    listenerName: [
      { required: true, message: '请输入监听名称', trigger: 'blur' },
      { min: 2, max: 50, message: '监听名称长度在2-50个字符', trigger: 'blur' }
    ],
    vport: [
      { required: true, message: '请输入端口', trigger: 'blur' },
      { 
        validator: (rule, value, callback) => {
          if (!value) {
            callback(new Error('请输入端口'))
            return
          }
          
          if (formData.portType === 'single') {
            // 单端口验证: 1-65535
            if (!/^([1-9]\d{0,3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/.test(value)) {
              callback(new Error('端口范围: 1-65535'))
              return
            }
          } else {
            // 端口范围验证: 100-2000
            if (!/^\d+-\d+$/.test(value)) {
              callback(new Error('格式: 起始端口-结束端口'))
              return
            }
            const [start, end] = value.split('-').map(Number)
            if (start >= end) {
              callback(new Error('起始端口必须小于结束端口'))
              return
            }
            if (start < 1 || end > 65535) {
              callback(new Error('端口范围: 1-65535'))
              return
            }
          }
          callback()
        },
        trigger: 'blur'
      }
    ],
    timeout: [
      { type: 'number', min: 30, max: 3600, message: '范围: 30-3600秒', trigger: 'blur' }
    ]
  }
  
  // 健康检查验证规则
  if (formData.healthCheck.checkType !== 'none') {
    baseRules['healthCheck.checkInterval'] = [
      { type: 'number', min: 10, max: 3600, message: '范围: 10-3600', trigger: 'blur' }
    ]
    baseRules['healthCheck.checkTimeout'] = [
      { type: 'number', min: 1, max: 60, message: '范围: 1-60', trigger: 'blur' }
    ]
    baseRules['healthCheck.succCnt'] = [
      { type: 'number', min: 1, max: 128, message: '范围: 1-128', trigger: 'blur' }
    ]
    baseRules['healthCheck.errCnt'] = [
      { type: 'number', min: 1, max: 128, message: '范围: 1-128', trigger: 'blur' }
    ]
    
    // 需要端口的协议验证
    if (needsPort.value) {
      baseRules['healthCheck.port'] = [
        { required: true, message: '请输入探测端口', trigger: 'blur' },
        { 
          pattern: /^([1-9]\d{0,3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/, 
          message: '端口范围: 1-65535', 
          trigger: 'blur' 
        }
      ]
    }
  }
  
  return baseRules
})

// 是否需要端口配置
const needsPort = computed(() => {
  return ['tcp', 'udp', 'http', 'https'].includes(formData.healthCheck.checkType)
})

// 是否需要HTTP配置
const needsHttpConfig = computed(() => {
  return ['http', 'https'].includes(formData.healthCheck.checkType)
})

// 端口类型变化处理
const handlePortTypeChange = () => {
  formData.vport = ''
  // 清除验证状态
  if (formRef.value) {
    formRef.value.clearValidate(['vport'])
  }
}

// 协议变化处理
const handleProtocolChange = () => {
  // 重置端口
  if (!needsPort.value) {
    formData.healthCheck.port = ''
  }
  
  // 重置HTTP配置
  if (!needsHttpConfig.value) {
    formData.healthCheck.domain = ''
    formData.healthCheck.resCode = ''
    formData.healthCheck.resInfo = ''
  }
  
  // 清除验证状态
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

// 构建API数据
const buildVportApiData = () => {
  return {
    listenerName: formData.listenerName, // 后端接口需要补充此参数
    ipVersion: props.instanceData?.ipType || 'ipv4',
    vip: props.instanceData?.vip || '',
    vport: formData.vport,
    protocol: formData.protocol,
    fwMode: formData.fwMode,
    schedule: formData.schedule,
    timeout: formData.timeout.toString(),
    swReset: formData.bidirectionalResetEnabled ? 'enable' : 'disable',
    swTuoa: formData.toaEnabled ? 'enable' : 'disable',
    swSessionSync: formData.sessionSyncEnabled ? 'enable' : 'disable',
    swTransiLog: formData.fiveTupleLogEnabled ? 'enable' : 'disable',
    swExpQuiet: formData.sessionSilentDeleteEnabled ? 'enable' : 'disable',
    qidList: formData.rateLimitConfig ? [formData.rateLimitConfig] : []
  }
}

const buildHealthCheckApiData = () => {
  return {
    ipVersion: props.instanceData?.ipType || 'ipv4',
    vip: props.instanceData?.vip || '',
    vport: formData.vport,
    protocol: formData.protocol,
    hcip: [], // 健康检查IP列表，暂时为空
    checkType: formData.healthCheck.checkType,
    checkInterval: formData.healthCheck.checkInterval.toString(),
    checkTimeout: formData.healthCheck.checkTimeout.toString(),
    errCnt: formData.healthCheck.errCnt.toString(),
    succCnt: formData.healthCheck.succCnt.toString(),
    port: formData.healthCheck.port || undefined,
    domain: formData.healthCheck.domain || undefined,
    uri: formData.healthCheck.uri || undefined,
    resCode: formData.healthCheck.resCode || undefined,
    resInfo: formData.healthCheck.resInfo || undefined
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    // 验证表单
    await formRef.value.validate()
    
    submitting.value = true
    
    // 构建监听数据
    const vportData = buildVportApiData()
    console.log('创建监听数据:', vportData)
    
    // 构建健康检查数据
    const healthCheckData = buildHealthCheckApiData()
    console.log('健康检查数据:', healthCheckData)
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟创建的监听器数据（返回给父组件）
    const newListener = {
      id: Date.now(),
      name: formData.listenerName,
      port: formData.vport,
      protocol: formData.protocol.toUpperCase(),
      algorithm: formData.schedule,
      status: 'running',
      servers: [] // 新建监听器没有后端主机
    }
    
    ElMessage.success('监听创建成功')
    
    // 触发成功事件
    emit('success', newListener)
    
    // 关闭抽屉
    handleClose()
    
  } catch (error) {
    console.error('创建监听失败:', error)
    if (error !== 'validation failed') {
      ElMessage.error('创建监听失败，请重试')
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
  // 重置基础数据
  Object.assign(formData, {
    listenerName: '',
    portType: 'single',
    vport: '',
    protocol: 'tcp',
    schedule: 'wrr',
    fwMode: 'fnat',
    timeout: 90,
    localIpObject: '',
    healthCheckIpObject: '',
    healthCheck: {
      checkType: 'none', // 重置为NONE
      port: '', // 重置为空字符串
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
  
  // 清除表单验证状态
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 监听抽屉打开，重置表单
watch(visible, (newVal) => {
  if (newVal) {
    resetForm()
  }
})
</script>

<style scoped>
.listener-create-content {
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

.port-config {
  width: 100%;
}

.timeout-config,
.input-with-unit,
.health-check-protocol {
  display: flex;
  align-items: center;
  gap: 8px;
}

.unit {
  color: #606266;
  font-size: 14px;
  min-width: 20px;
}

.range-tip {
  color: #909399;
  font-size: 12px;
  margin-top: 4px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
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
  gap: 16px;
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

/* 确保抽屉宽度为50% */
:deep(.el-drawer) {
  width: 50% !important;
}

:deep(.el-drawer__body) {
  padding: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .el-row {
    flex-direction: column;
  }
  
  .timeout-config,
  .input-with-unit,
  .health-check-protocol {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
