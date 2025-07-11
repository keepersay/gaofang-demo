<template>
  <div class="cc-protection-tab">
    <div class="tab-header">
      <div class="tab-title">
        <h3>CC攻击防护</h3>
        <p class="tab-description">
          CC攻击防护可以防止恶意用户或爬虫短时间内发起大量HTTP请求，耗尽服务器资源，导致正常用户无法访问
        </p>
      </div>
      
      <div class="tab-actions">
        <el-switch
          v-model="config.enabled"
          active-text="启用"
          inactive-text="禁用"
          @change="handleStatusChange"
        />
      </div>
    </div>
    
    <el-divider />
    
    <div class="tab-content" v-if="config.enabled">
      <el-form :model="config" label-width="120px">
        <el-form-item label="防护模式">
          <el-radio-group v-model="config.mode" @change="handleModeChange">
            <el-radio label="normal">正常</el-radio>
            <el-radio label="strict">严格</el-radio>
            <el-radio label="custom">自定义</el-radio>
          </el-radio-group>
          <div class="form-tip" v-if="config.mode === 'normal'">
            正常模式：适用于大多数网站，可防御一般的CC攻击
          </div>
          <div class="form-tip" v-if="config.mode === 'strict'">
            严格模式：适用于经常遭受CC攻击的网站，防护更严格，可能会影响少量正常用户
          </div>
          <div class="form-tip" v-if="config.mode === 'custom'">
            自定义模式：根据需求自定义CC防护规则
          </div>
        </el-form-item>
        
        <template v-if="config.mode === 'custom'">
          <el-form-item label="QPS阈值">
            <el-input-number v-model="config.qpsThreshold" :min="10" :max="10000" @change="handleConfigChange" />
            <span class="input-suffix">次/秒</span>
            <div class="form-tip">
              当单个IP在1秒内的请求次数超过该阈值时触发防护
            </div>
          </el-form-item>
          
          <el-form-item label="统计周期">
            <el-input-number v-model="config.statisticsPeriod" :min="1" :max="60" @change="handleConfigChange" />
            <span class="input-suffix">秒</span>
            <div class="form-tip">
              统计单个IP请求次数的时间周期
            </div>
          </el-form-item>
          
          <el-form-item label="封禁时长">
            <el-input-number v-model="config.blockDuration" :min="5" :max="1800" @change="handleConfigChange" />
            <span class="input-suffix">秒</span>
            <div class="form-tip">
              触发防护后，封禁IP的时长
            </div>
          </el-form-item>
          
          <el-form-item label="防护动作">
            <el-select v-model="config.action" style="width: 200px" @change="handleConfigChange">
              <el-option label="封禁" value="block" />
              <el-option label="人机验证" value="captcha" />
              <el-option label="监控" value="monitor" />
            </el-select>
            <div class="form-tip">
              触发防护后执行的动作
            </div>
          </el-form-item>
        </template>
      </el-form>
      
      <div class="url-rules" v-if="config.enabled">
        <div class="section-header">
          <h4>URL防护规则</h4>
          <el-button type="primary" @click="handleAddUrlRule">添加规则</el-button>
        </div>
        
        <el-table :data="config.urlRules" border style="width: 100%">
          <el-table-column label="序号" width="80" type="index" />
          <el-table-column label="URL" prop="url" min-width="200" />
          <el-table-column label="QPS阈值" prop="qpsThreshold" width="120" />
          <el-table-column label="防护动作" width="120">
            <template #default="{ row }">
              <el-tag :type="getActionType(row.action)">
                {{ getActionName(row.action) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-switch
                v-model="row.enabled"
                @change="() => handleUrlRuleStatusChange(row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="{ row, $index }">
              <el-button type="primary" link @click="handleEditUrlRule(row, $index)">编辑</el-button>
              <el-button type="danger" link @click="handleDeleteUrlRule($index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <div class="whitelist" v-if="config.enabled">
        <div class="section-header">
          <h4>IP白名单</h4>
          <el-button type="primary" @click="handleAddWhitelist">添加白名单</el-button>
        </div>
        
        <el-table :data="config.whitelist" border style="width: 100%">
          <el-table-column label="序号" width="80" type="index" />
          <el-table-column label="IP/CIDR" prop="ip" min-width="180" />
          <el-table-column label="备注" prop="comment" min-width="200" />
          <el-table-column label="操作" width="150">
            <template #default="{ row, $index }">
              <el-button type="primary" link @click="handleEditWhitelist(row, $index)">编辑</el-button>
              <el-button type="danger" link @click="handleDeleteWhitelist($index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    
    <div class="tab-disabled" v-else>
      <el-empty description="CC攻击防护功能已禁用，请先启用该功能" />
    </div>
  </div>
  
  <!-- URL规则对话框 -->
  <el-dialog
    v-model="urlRuleDialogVisible"
    :title="isEditUrlRule ? '编辑URL规则' : '添加URL规则'"
    width="500px"
  >
    <el-form
      ref="urlRuleFormRef"
      :model="urlRuleForm"
      :rules="urlRuleRules"
      label-width="100px"
    >
      <el-form-item label="URL" prop="url">
        <el-input v-model="urlRuleForm.url" placeholder="请输入URL，支持通配符*" />
      </el-form-item>
      
      <el-form-item label="QPS阈值" prop="qpsThreshold">
        <el-input-number v-model="urlRuleForm.qpsThreshold" :min="1" :max="10000" style="width: 200px" />
      </el-form-item>
      
      <el-form-item label="防护动作" prop="action">
        <el-select v-model="urlRuleForm.action" style="width: 200px">
          <el-option label="封禁" value="block" />
          <el-option label="人机验证" value="captcha" />
          <el-option label="监控" value="monitor" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="状态">
        <el-switch v-model="urlRuleForm.enabled" />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="urlRuleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleUrlRuleSubmit">确定</el-button>
      </span>
    </template>
  </el-dialog>
  
  <!-- 白名单对话框 -->
  <el-dialog
    v-model="whitelistDialogVisible"
    :title="isEditWhitelist ? '编辑白名单' : '添加白名单'"
    width="500px"
  >
    <el-form
      ref="whitelistFormRef"
      :model="whitelistForm"
      :rules="whitelistRules"
      label-width="100px"
    >
      <el-form-item label="IP/CIDR" prop="ip">
        <el-input v-model="whitelistForm.ip" placeholder="请输入IP或CIDR，例如：192.168.1.1或192.168.1.0/24" />
      </el-form-item>
      
      <el-form-item label="备注" prop="comment">
        <el-input v-model="whitelistForm.comment" placeholder="请输入备注" />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="whitelistDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleWhitelistSubmit">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({
  protectionId: {
    type: [Number, String],
    required: true
  },
  protectionData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update'])

// CC防护配置
const config = reactive({
  enabled: false,
  mode: 'normal',
  qpsThreshold: 100,
  statisticsPeriod: 10,
  blockDuration: 300,
  action: 'block',
  urlRules: [],
  whitelist: []
})

// URL规则对话框
const urlRuleDialogVisible = ref(false)
const isEditUrlRule = ref(false)
const currentUrlRuleIndex = ref(-1)
const urlRuleFormRef = ref(null)
const urlRuleForm = reactive({
  url: '',
  qpsThreshold: 50,
  action: 'block',
  enabled: true
})

// URL规则表单验证规则
const urlRuleRules = reactive({
  url: [
    { required: true, message: '请输入URL', trigger: 'blur' }
  ],
  qpsThreshold: [
    { required: true, message: '请输入QPS阈值', trigger: 'blur' },
    { type: 'number', min: 1, message: 'QPS阈值必须大于0', trigger: 'blur' }
  ],
  action: [
    { required: true, message: '请选择防护动作', trigger: 'change' }
  ]
})

// 白名单对话框
const whitelistDialogVisible = ref(false)
const isEditWhitelist = ref(false)
const currentWhitelistIndex = ref(-1)
const whitelistFormRef = ref(null)
const whitelistForm = reactive({
  ip: '',
  comment: ''
})

// 白名单表单验证规则
const whitelistRules = reactive({
  ip: [
    { required: true, message: '请输入IP或CIDR', trigger: 'blur' },
    { 
      pattern: /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/, 
      message: '请输入有效的IP或CIDR格式', 
      trigger: 'blur' 
    }
  ]
})

// 初始化配置
const initConfig = () => {
  if (props.protectionData && props.protectionData.securityConfig && props.protectionData.securityConfig.ccProtection) {
    const ccProtection = props.protectionData.securityConfig.ccProtection
    
    config.enabled = ccProtection.enabled || false
    config.mode = ccProtection.mode || 'normal'
    config.qpsThreshold = ccProtection.qpsThreshold || 100
    config.statisticsPeriod = ccProtection.statisticsPeriod || 10
    config.blockDuration = ccProtection.blockDuration || 300
    config.action = ccProtection.action || 'block'
    
    if (ccProtection.urlRules && Array.isArray(ccProtection.urlRules)) {
      config.urlRules = [...ccProtection.urlRules]
    }
    
    if (ccProtection.whitelist && Array.isArray(ccProtection.whitelist)) {
      config.whitelist = [...ccProtection.whitelist]
    }
  }
}

// 处理状态变更
const handleStatusChange = (val) => {
  config.enabled = val
  emitUpdate()
}

// 处理模式变更
const handleModeChange = (val) => {
  config.mode = val
  emitUpdate()
}

// 处理配置变更
const handleConfigChange = () => {
  emitUpdate()
}

// 处理URL规则状态变更
const handleUrlRuleStatusChange = (rule) => {
  emitUpdate()
}

// 添加URL规则
const handleAddUrlRule = () => {
  isEditUrlRule.value = false
  currentUrlRuleIndex.value = -1
  
  // 重置表单
  Object.assign(urlRuleForm, {
    url: '',
    qpsThreshold: 50,
    action: 'block',
    enabled: true
  })
  
  urlRuleDialogVisible.value = true
}

// 编辑URL规则
const handleEditUrlRule = (rule, index) => {
  isEditUrlRule.value = true
  currentUrlRuleIndex.value = index
  
  // 填充表单
  Object.assign(urlRuleForm, {
    url: rule.url,
    qpsThreshold: rule.qpsThreshold,
    action: rule.action,
    enabled: rule.enabled
  })
  
  urlRuleDialogVisible.value = true
}

// 删除URL规则
const handleDeleteUrlRule = (index) => {
  ElMessageBox.confirm(
    '确定要删除该URL规则吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    config.urlRules.splice(index, 1)
    emitUpdate()
  }).catch(() => {})
}

// 提交URL规则表单
const handleUrlRuleSubmit = async () => {
  if (!urlRuleFormRef.value) return
  
  try {
    await urlRuleFormRef.value.validate()
    
    const urlRuleData = {
      url: urlRuleForm.url,
      qpsThreshold: urlRuleForm.qpsThreshold,
      action: urlRuleForm.action,
      enabled: urlRuleForm.enabled
    }
    
    if (isEditUrlRule.value && currentUrlRuleIndex.value !== -1) {
      // 编辑模式
      config.urlRules[currentUrlRuleIndex.value] = urlRuleData
    } else {
      // 添加模式
      config.urlRules.push(urlRuleData)
    }
    
    urlRuleDialogVisible.value = false
    emitUpdate()
  } catch (error) {
    console.error('URL规则表单验证失败:', error)
  }
}

// 添加白名单
const handleAddWhitelist = () => {
  isEditWhitelist.value = false
  currentWhitelistIndex.value = -1
  
  // 重置表单
  Object.assign(whitelistForm, {
    ip: '',
    comment: ''
  })
  
  whitelistDialogVisible.value = true
}

// 编辑白名单
const handleEditWhitelist = (item, index) => {
  isEditWhitelist.value = true
  currentWhitelistIndex.value = index
  
  // 填充表单
  Object.assign(whitelistForm, {
    ip: item.ip,
    comment: item.comment
  })
  
  whitelistDialogVisible.value = true
}

// 删除白名单
const handleDeleteWhitelist = (index) => {
  ElMessageBox.confirm(
    '确定要删除该白名单吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    config.whitelist.splice(index, 1)
    emitUpdate()
  }).catch(() => {})
}

// 提交白名单表单
const handleWhitelistSubmit = async () => {
  if (!whitelistFormRef.value) return
  
  try {
    await whitelistFormRef.value.validate()
    
    const whitelistData = {
      ip: whitelistForm.ip,
      comment: whitelistForm.comment
    }
    
    if (isEditWhitelist.value && currentWhitelistIndex.value !== -1) {
      // 编辑模式
      config.whitelist[currentWhitelistIndex.value] = whitelistData
    } else {
      // 添加模式
      config.whitelist.push(whitelistData)
    }
    
    whitelistDialogVisible.value = false
    emitUpdate()
  } catch (error) {
    console.error('白名单表单验证失败:', error)
  }
}

// 获取防护动作名称
const getActionName = (action) => {
  const actions = {
    'block': '封禁',
    'captcha': '人机验证',
    'monitor': '监控'
  }
  return actions[action] || action
}

// 获取防护动作标签类型
const getActionType = (action) => {
  const types = {
    'block': 'danger',
    'captcha': 'warning',
    'monitor': 'info'
  }
  return types[action] || 'info'
}

// 向父组件发送更新事件
const emitUpdate = () => {
  const updatedConfig = {
    enabled: config.enabled,
    mode: config.mode,
    qpsThreshold: config.qpsThreshold,
    statisticsPeriod: config.statisticsPeriod,
    blockDuration: config.blockDuration,
    action: config.action,
    urlRules: config.urlRules,
    whitelist: config.whitelist
  }
  
  emit('update', 'ccProtection', updatedConfig)
}

// 监听保护对象数据变化
watch(() => props.protectionData, () => {
  initConfig()
}, { deep: true })

// 组件挂载时初始化
onMounted(() => {
  initConfig()
})
</script>

<style scoped>
.cc-protection-tab {
  padding: 0 10px;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.tab-title h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
}

.tab-description {
  color: #606266;
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}

.tab-content {
  margin-top: 20px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
  margin-top: 5px;
}

.input-suffix {
  margin-left: 10px;
  color: #606266;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 30px 0 15px;
}

.section-header h4 {
  margin: 0;
}

.url-rules, .whitelist {
  margin-top: 30px;
}

.tab-disabled {
  padding: 40px 0;
}
</style> 