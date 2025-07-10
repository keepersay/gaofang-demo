<!-- 负载均衡监听抽屉 -->
<template>
  <el-drawer
    v-model="drawerVisible"
    :title="isEdit ? '编辑监听' : '添加监听'"
    :size="'50%'"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    direction="rtl"
    append-to-body
  >
    <template #default>
      <div class="listener-drawer-content" v-loading="loading">
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="120px"
          label-position="right"
          class="listener-form"
        >
          <!-- 基本信息 -->
          <el-divider content-position="left">基本信息</el-divider>
          
          <el-form-item label="名称" prop="name">
            <el-input v-model="form.name" placeholder="请输入监听名称" />
          </el-form-item>
          
          <el-form-item label="端口" prop="port">
            <el-input-number v-model="form.port" :min="1" :max="65535" style="width: 120px" :disabled="isEdit" />
            <div class="form-tip">端口范围：1-65535</div>
            <div class="form-tip" v-if="isEdit">编辑模式下端口不可修改</div>
          </el-form-item>
          
          <el-form-item label="监听地址类型" prop="addressType">
            <el-radio-group v-model="form.addressType">
              <el-radio label="IPv4">IPv4</el-radio>
              <el-radio label="IPv6">IPv6</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item label="监听协议" prop="protocol">
            <el-radio-group v-model="form.protocol" :disabled="isEdit">
              <el-radio label="TCP">TCP</el-radio>
              <el-radio label="UDP">UDP</el-radio>
              <el-radio label="HTTP">HTTP</el-radio>
              <el-radio label="HTTPS">HTTPS</el-radio>
            </el-radio-group>
            <div class="form-tip" v-if="isEdit">编辑模式下监听协议不可修改</div>
          </el-form-item>
          
          <el-form-item label="调度算法" prop="scheduler">
            <el-radio-group v-model="form.scheduler">
              <el-radio label="iphash">IP散列(iphash)</el-radio>
              <el-radio label="wrr">加权轮询(wrr)</el-radio>
              <el-radio label="wlc">加权最小连接(wlc)</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <!-- 加密算法（仅HTTPS显示） -->
          <template v-if="form.protocol === 'HTTPS'">
            <el-divider content-position="left">加密算法</el-divider>
            
            <el-form-item label="TLS">
              <el-switch v-model="form.tls" />
            </el-form-item>
            
            <template v-if="form.tls">
              <el-form-item label="TLS版本" prop="tlsVersions" required>
                <div class="tls-versions">
                  <el-checkbox-group v-model="form.tlsVersions">
                    <el-checkbox label="TLS1.0" border />
                    <el-checkbox label="TLS1.1" border />
                    <el-checkbox label="TLS1.2" border />
                    <el-checkbox label="TLS1.3" border />
                  </el-checkbox-group>
                </div>
                <div class="form-tip">至少选择一个TLS版本</div>
              </el-form-item>
              
              <el-form-item label="SSL Ciphers" prop="sslCiphers">
                <el-input 
                  v-model="form.sslCiphers" 
                  placeholder="请输入SSL Ciphers配置" 
                  :rows="2"
                  type="textarea"
                />
                <div class="form-tip">设置SSL加密套件，留空则使用默认配置</div>
              </el-form-item>
              
              <el-form-item label="服务器证书" prop="serverCertificate" required>
                <el-select v-model="form.serverCertificate" placeholder="请选择服务器证书" style="width: 100%">
                  <el-option v-for="cert in certificateOptions" :key="cert.value" :label="cert.label" :value="cert.value" />
                </el-select>
                <div class="form-tip">可在证书管理模块配置证书</div>
              </el-form-item>
            </template>
            
            <el-form-item label="国密">
              <el-switch v-model="form.gm" />
              <div class="form-tip" v-if="form.gm">需先在证书管理中配置国密证书</div>
            </el-form-item>
            
            <el-form-item label="开启双向认证">
              <el-switch v-model="form.biAuth" />
              <div class="form-tip" v-if="form.biAuth">请确保客户端已配置相应证书</div>
            </el-form-item>
          </template>
          
          <!-- 回源协议（仅HTTP/HTTPS显示） -->
          <template v-if="form.protocol === 'HTTP' || form.protocol === 'HTTPS'">
            <el-form-item label="回源协议" prop="backendProtocol">
              <el-radio-group v-model="form.backendProtocol">
                <el-radio label="TCP">TCP</el-radio>
                <el-radio label="TCP(TLS)">TCP(TLS)</el-radio>
                <el-radio label="TCP(国密)">TCP(国密)</el-radio>
              </el-radio-group>
            </el-form-item>
          </template>
          
          <!-- 健康检查 -->
          <el-divider content-position="left">健康检查</el-divider>
          
          <el-form-item label="协议" prop="healthCheck.protocol">
            <el-select v-model="form.healthCheck.protocol" style="width: 200px">
              <el-option label="TCP" value="TCP" />
              <el-option label="HTTP" value="HTTP" />
              <el-option label="HTTPS" value="HTTPS" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="响应端口" prop="healthCheck.port">
            <el-input-number v-model="form.healthCheck.port" :min="1" :max="65535" style="width: 120px" />
            <div class="form-tip">范围：1-65535</div>
          </el-form-item>
          
          <el-form-item label="探测间隔(秒)" prop="healthCheck.interval">
            <el-input-number v-model="form.healthCheck.interval" :min="10" :max="3600" style="width: 120px" />
            <div class="form-tip">范围：10-3600</div>
          </el-form-item>
          
          <el-form-item label="超时时间(秒)" prop="healthCheck.timeout">
            <el-input-number v-model="form.healthCheck.timeout" :min="1" :max="60" style="width: 120px" />
            <div class="form-tip">范围：1-60</div>
          </el-form-item>
          
          <el-form-item label="成功次数" prop="healthCheck.successThreshold">
            <el-input-number v-model="form.healthCheck.successThreshold" :min="1" :max="128" style="width: 120px" />
            <div class="form-tip">范围：1-128</div>
          </el-form-item>
          
          <el-form-item label="失败次数" prop="healthCheck.failureThreshold">
            <el-input-number v-model="form.healthCheck.failureThreshold" :min="1" :max="128" style="width: 120px" />
            <div class="form-tip">范围：1-128</div>
          </el-form-item>
          
          <!-- 高级配置 -->
          <el-divider content-position="left">高级配置</el-divider>
          
          <!-- TCP/UDP专用配置 -->
          <template v-if="form.protocol === 'TCP' || form.protocol === 'UDP'">
            <el-form-item label="插入TOA/UOA" prop="insertToa">
              <el-switch v-model="form.insertToa" />
            </el-form-item>
            
            <el-form-item label="会话超时双向reset" prop="sessionResetEnabled">
              <el-switch v-model="form.sessionResetEnabled" />
            </el-form-item>
            
            <el-form-item label="五元组转换日志">
              <div class="syslog-config">
                <div class="syslog-item">
                  <span class="syslog-label">Syslog IP:</span>
                  <el-input v-model="form.syslogIp" placeholder="请输入Syslog IP" />
                </div>
                <div class="syslog-item">
                  <span class="syslog-label">Syslog Port:</span>
                  <el-input-number v-model="form.syslogPort" :min="1" :max="65535" style="width: 120px" />
                </div>
              </div>
            </el-form-item>
          </template>
          
          <!-- HTTP/HTTPS专用配置 -->
          <template v-if="form.protocol === 'HTTP' || form.protocol === 'HTTPS'">
            <div class="config-section">
              <el-form-item label="真实源IP HTTP头字段" prop="realSourceIpHeader">
                <el-input v-model="form.realSourceIpHeader" placeholder="X-Forwarded-For" />
                <div class="form-tip">
                  <el-icon><info-filled /></el-icon>
                  提示：1. 如果已存在该字段，则将真实源IP添加到最后，使用逗号分隔。2. 如果不存在该字段，则新增该字段和真实源IP值
                </div>
              </el-form-item>
              
              <el-form-item label="开启CC防护" prop="ccProtection">
                <el-switch v-model="form.ccProtection" />
              </el-form-item>
              
              <template v-if="form.ccProtection">
                <el-form-item label="防护阈值" prop="ccThreshold" required>
                  <div class="threshold-input">
                    <el-input-number v-model="form.ccThreshold" :min="1" :max="1000000" controls-position="right" style="width: 200px" />
                    <span class="unit">qps</span>
                  </div>
                  <div class="form-tip">
                    <el-icon><info-filled /></el-icon>
                    提示：范围1-1000000
                  </div>
                </el-form-item>
                
                <el-form-item label="检测周期" prop="ccDetectionPeriod" required>
                  <div class="period-input">
                    <el-input-number v-model="form.ccDetectionPeriod" :min="1" :max="3600" controls-position="right" style="width: 200px" />
                    <span class="unit">s</span>
                  </div>
                  <div class="form-tip">
                    <el-icon><info-filled /></el-icon>
                    提示：范围1-3600
                  </div>
                </el-form-item>
                
                <el-form-item label="封禁时长" prop="ccBlockDuration" required>
                  <div class="duration-input">
                    <el-input-number v-model="form.ccBlockDuration" :min="1" :max="86400" controls-position="right" style="width: 200px" />
                    <span class="unit">s</span>
                  </div>
                  <div class="form-tip">
                    <el-icon><info-filled /></el-icon>
                    提示：范围1-86400
                  </div>
                </el-form-item>
              </template>
            </div>
          </template>
          
          <el-form-item label="限速配置">
            <el-select v-model="form.rateLimit" placeholder="请选择限速配置" clearable style="width: 100%">
              <el-option label="暂无可用配置" value="" disabled />
            </el-select>
            <div class="form-tip">可在限速配置模块创建后选择</div>
          </el-form-item>
          
          <el-form-item label="黑名单">
            <el-select v-model="form.blacklist" placeholder="请选择黑名单配置" clearable style="width: 100%">
              <el-option label="暂无可用配置" value="" disabled />
            </el-select>
            <div class="form-tip">可在黑名单配置模块创建后选择</div>
          </el-form-item>
          
          <el-form-item label="IP白名单">
            <el-select v-model="form.ipWhitelist" placeholder="请选择IP白名单配置" clearable style="width: 100%">
              <el-option label="暂无可用配置" value="" disabled />
            </el-select>
            <div class="form-tip">可在IP白名单配置模块创建后选择</div>
          </el-form-item>
          
          <el-form-item label="策略白名单">
            <el-select v-model="form.policyWhitelist" placeholder="请选择策略白名单配置" clearable style="width: 100%">
              <el-option label="暂无可用配置" value="" disabled />
            </el-select>
            <div class="form-tip">可在策略白名单配置模块创建后选择</div>
          </el-form-item>
          
          <el-form-item label="备注" prop="remark">
            <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注信息" />
          </el-form-item>
        </el-form>
      </div>
    </template>
    
    <template #footer>
      <div class="drawer-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  protectionId: {
    type: [String, Number],
    default: ''
  },
  listenerData: {
    type: Object,
    default: () => null
  }
})

const emit = defineEmits(['update:visible', 'success'])

// 抽屉可见性
const drawerVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

// 表单引用
const formRef = ref(null)

// 加载和提交状态
const loading = ref(false)
const submitting = ref(false)

// 是否编辑模式
const isEdit = computed(() => !!props.listenerData)

// 表单数据
const form = reactive({
  id: '',
  name: '',
  port: 80,
  addressType: 'IPv4',
  protocol: 'HTTP',
  scheduler: 'wrr',
  
  // 加密相关(HTTPS)
  tls: false,
  tlsVersions: ['TLS1.2', 'TLS1.3'], // 默认选择TLS1.2和TLS1.3
  sslCiphers: '',
  serverCertificate: '',
  gm: false,
  biAuth: false,
  
  // 回源协议(HTTP/HTTPS)
  backendProtocol: 'TCP',
  
  // 健康检查
  healthCheck: {
    protocol: 'TCP',
    port: undefined,
    interval: 10,
    timeout: 1,
    successThreshold: 1,
    failureThreshold: 3
  },
  
  // TCP/UDP专用配置
  insertToa: false,
  sessionResetEnabled: false,
  syslogIp: '',
  syslogPort: 514,
  
  // HTTP/HTTPS专用配置
  realSourceIpHeader: 'X-Forwarded-For',
  ccProtection: false,
  ccThreshold: 1000,
  ccDetectionPeriod: 60,
  ccBlockDuration: 300,
  
  // 高级配置
  rateLimit: '',
  blacklist: '',
  ipWhitelist: '',
  policyWhitelist: '',
  remark: ''
})

// 证书选项（模拟数据，实际应从API获取）
const certificateOptions = ref([
  { value: 'default', label: '默认证书' },
  { value: 'cert-1', label: '通配符证书 *.example.com' },
  { value: 'cert-2', label: 'www.example.com' },
  { value: 'cert-3', label: 'api.example.com' },
])

// 表单校验规则
const rules = {
  name: [
    { required: true, message: '请输入监听名称', trigger: 'blur' },
    { min: 1, max: 64, message: '长度应为1-64个字符', trigger: 'blur' }
  ],
  port: [
    { required: true, message: '请输入端口', trigger: 'blur' },
    { type: 'number', min: 1, max: 65535, message: '端口范围为1-65535', trigger: 'blur' }
  ],
  addressType: [
    { required: true, message: '请选择监听地址类型', trigger: 'change' }
  ],
  protocol: [
    { required: true, message: '请选择监听协议', trigger: 'change' }
  ],
  scheduler: [
    { required: true, message: '请选择调度算法', trigger: 'change' }
  ],
  backendProtocol: [
    { required: true, message: '请选择回源协议', trigger: 'change' }
  ],
  'healthCheck.protocol': [
    { required: true, message: '请选择健康检查协议', trigger: 'change' }
  ],
  'healthCheck.interval': [
    { required: true, message: '请输入探测间隔', trigger: 'blur' },
    { type: 'number', min: 10, max: 3600, message: '探测间隔范围为10-3600秒', trigger: 'blur' }
  ],
  'healthCheck.timeout': [
    { required: true, message: '请输入超时时间', trigger: 'blur' },
    { type: 'number', min: 1, max: 60, message: '超时时间范围为1-60秒', trigger: 'blur' }
  ],
  'healthCheck.successThreshold': [
    { required: true, message: '请输入成功次数', trigger: 'blur' },
    { type: 'number', min: 1, max: 128, message: '成功次数范围为1-128', trigger: 'blur' }
  ],
  'healthCheck.failureThreshold': [
    { required: true, message: '请输入失败次数', trigger: 'blur' },
    { type: 'number', min: 1, max: 128, message: '失败次数范围为1-128', trigger: 'blur' }
  ],
  realSourceIpHeader: [
    { required: true, message: '请输入真实源IP HTTP头字段', trigger: 'blur' }
  ],
  tlsVersions: [
    { 
      validator: (rule, value, callback) => {
        if (!value || value.length === 0) {
          callback(new Error('请至少选择一个TLS版本'));
        } else {
          callback();
        }
      }, 
      trigger: 'change' 
    }
  ],
  serverCertificate: [
    { required: true, message: '请选择服务器证书', trigger: 'change' }
  ],
  ccThreshold: [
    { required: true, message: '请输入防护阈值', trigger: 'blur' },
    { type: 'number', min: 1, max: 1000000, message: '防护阈值范围为1-1000000', trigger: 'blur' }
  ],
  ccDetectionPeriod: [
    { required: true, message: '请输入检测周期', trigger: 'blur' },
    { type: 'number', min: 1, max: 3600, message: '检测周期范围为1-3600秒', trigger: 'blur' }
  ],
  ccBlockDuration: [
    { required: true, message: '请输入封禁时长', trigger: 'blur' },
    { type: 'number', min: 1, max: 86400, message: '封禁时长范围为1-86400秒', trigger: 'blur' }
  ]
}

// 监听协议变更
watch(() => form.protocol, (val) => {
  // 当选择UDP时，健康检查协议只能是TCP
  if (val === 'UDP') {
    form.healthCheck.protocol = 'TCP'
  }
  
  // 如果不是HTTP/HTTPS，重置回源协议
  if (val !== 'HTTP' && val !== 'HTTPS') {
    form.backendProtocol = 'TCP'
  }
  
  // 重置加密相关选项
  if (val !== 'HTTPS') {
    form.tls = false
    form.tlsVersions = ['TLS1.2', 'TLS1.3']
    form.sslCiphers = ''
    form.serverCertificate = ''
    form.gm = false
    form.biAuth = false
  }
})

// 监听TLS开关状态
watch(() => form.tls, (val) => {
  if (!val) {
    // TLS关闭时重置相关配置
    form.tlsVersions = ['TLS1.2', 'TLS1.3']
    form.sslCiphers = ''
    form.serverCertificate = ''
  } else if (val && form.tlsVersions.length === 0) {
    // 确保至少有一个TLS版本被选中
    form.tlsVersions = ['TLS1.2']
  }
})

// 初始化表单数据
const initFormData = () => {
  if (props.listenerData) {
    // 编辑模式，使用传入的数据填充表单
    Object.assign(form, props.listenerData)
    
    // 处理健康检查对象
    if (props.listenerData.healthCheck) {
      Object.assign(form.healthCheck, props.listenerData.healthCheck)
    }
    
    // 确保TLS版本数组存在
    if (!form.tlsVersions || !Array.isArray(form.tlsVersions) || form.tlsVersions.length === 0) {
      form.tlsVersions = ['TLS1.2', 'TLS1.3']; // 默认值
    }
  } else {
    // 创建模式，使用默认值
    Object.assign(form, {
      id: '',
      name: '',
      port: 80,
      addressType: 'IPv4',
      protocol: 'HTTP',
      scheduler: 'wrr',
      
      // 加密相关(HTTPS)
      tls: false,
      tlsVersions: ['TLS1.2', 'TLS1.3'],
      sslCiphers: '',
      serverCertificate: '',
      gm: false,
      biAuth: false,
      
      // 回源协议(HTTP/HTTPS)
      backendProtocol: 'TCP',
      
      // 健康检查
      healthCheck: {
        protocol: 'TCP',
        port: undefined,
        interval: 10,
        timeout: 1,
        successThreshold: 1,
        failureThreshold: 3
      },
      
      // TCP/UDP专用配置
      insertToa: false,
      sessionResetEnabled: false,
      syslogIp: '',
      syslogPort: 514,
      
      // HTTP/HTTPS专用配置
      realSourceIpHeader: 'X-Forwarded-For',
      ccProtection: false,
      ccThreshold: 1000,
      ccDetectionPeriod: 60,
      ccBlockDuration: 300,
      
      // 高级配置
      rateLimit: '',
      blacklist: '',
      ipWhitelist: '',
      policyWhitelist: '',
      remark: ''
    })
  }
}

// 取消
const handleCancel = () => {
  ElMessageBox.confirm(
    '确定要取消操作吗？未保存的数据将会丢失',
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

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    // 表单验证
    await formRef.value.validate()
    
    submitting.value = true
    
    // 构建提交数据
    const submitData = {
      protectionId: props.protectionId,
      ...form
    }
    
    console.log('提交负载均衡监听数据:', submitData)
    
    // 模拟API调用
    setTimeout(() => {
      // 生成一个唯一ID，实际中应由后端生成
      const id = props.listenerData?.id || 'slb-' + Date.now().toString(36)
      
      // 构建结果数据
      const resultData = {
        id,
        ...submitData,
        status: 'running',
        creator: '当前用户',
        createTime: new Date().toLocaleString()
      }
      
      // 提交成功
      ElMessage.success(isEdit.value ? '编辑监听成功' : '创建监听成功')
      emit('success', resultData)
      drawerVisible.value = false
      
      submitting.value = false
    }, 500)
  } catch (error) {
    console.error('表单验证失败:', error)
    ElMessage.error('表单填写有误，请检查')
    submitting.value = false
  }
}

// 监听抽屉显示状态
watch(() => drawerVisible.value, (visible) => {
  if (visible) {
    // 初始化表单数据
    initFormData()
  }
})
</script>

<style scoped>
.listener-drawer-content {
  padding: 0 20px;
  height: 100%;
  overflow-y: auto;
}

.listener-form {
  padding-bottom: 50px;
}

.drawer-footer {
  padding: 10px 20px;
  text-align: right;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1;
  margin-top: 5px;
}

.syslog-config {
  display: flex;
  gap: 20px;
}

.syslog-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.syslog-label {
  white-space: nowrap;
  color: #606266;
}

.config-section {
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 15px;
  background-color: #fafafa;
}

.threshold-input,
.period-input,
.duration-input {
  display: flex;
  align-items: center;
}

.unit {
  margin-left: 10px;
  color: #606266;
}

.tls-versions {
  margin-bottom: 10px;
}

.tls-versions .el-checkbox {
  margin-right: 15px;
  margin-bottom: 10px;
}
</style> 