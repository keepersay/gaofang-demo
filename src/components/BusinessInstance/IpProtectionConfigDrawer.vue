<template>
  <el-drawer
    v-model="drawerVisible"
    title="IP防护对象配置"
    size="50%"
    :destroy-on-close="false"
    :before-close="handleClose"
  >
    <template #default>
      <div class="config-drawer-content" v-loading="loading">
        <el-tabs v-model="activeTab" class="config-tabs">
          <el-tab-pane label="基本信息配置" name="basic">
            <el-form 
              ref="basicFormRef" 
              :model="basicForm" 
              :rules="basicRules" 
              label-width="140px"
              label-position="right"
            >
              <el-form-item label="防护IP组" prop="protectionIpGroupId">
                <el-select 
                  v-model="basicForm.protectionIpGroupId" 
                  placeholder="请选择防护IP组" 
                  style="width: 100%"
                  @change="handleIpGroupChange"
                >
                  <el-option
                    v-for="item in protectionIpGroupOptions"
                    :key="item.groupId"
                    :label="item.displayName"
                    :value="item.groupId"
                  />
                </el-select>
              </el-form-item>
              
              <el-form-item label="地址类型">
                <el-tag :type="getAddressTypeTag(selectedIpGroupInfo.addressType)">
                  {{ selectedIpGroupInfo.addressType || '未选择' }}
                </el-tag>
                <div class="form-tip">
                  地址类型由所选防护IP组决定
                </div>
              </el-form-item>
              
              <el-form-item label="防护带宽" prop="protectionBandwidthType">
                <el-radio-group v-model="basicForm.protectionBandwidthType" @change="handleProtectionBandwidthTypeChange">
                  <el-radio value="shared">共享</el-radio>
                  <el-radio value="dedicated">独享</el-radio>
                </el-radio-group>
              </el-form-item>
              
              <el-form-item 
                v-if="basicForm.protectionBandwidthType === 'dedicated'" 
                label="独享防护带宽" 
                prop="dedicatedProtectionBandwidth"
              >
                <el-input-number 
                  v-model="basicForm.dedicatedProtectionBandwidth" 
                  :min="1" 
                  :max="remainingProtectionBandwidth" 
                  :step="1" 
                  style="width: 120px"
                />
                <div class="form-tip">
                  可分配的最大独享防护带宽为 {{ remainingProtectionBandwidth }} Mbps
                </div>
              </el-form-item>
              
              <el-form-item label="业务带宽" prop="businessBandwidthType">
                <el-radio-group v-model="basicForm.businessBandwidthType" @change="handleBusinessBandwidthTypeChange">
                  <el-radio value="shared">共享</el-radio>
                  <el-radio value="dedicated">独享</el-radio>
                </el-radio-group>
              </el-form-item>
              
              <el-form-item 
                v-if="basicForm.businessBandwidthType === 'dedicated'" 
                label="独享业务带宽" 
                prop="dedicatedBusinessBandwidth"
              >
                <el-input-number 
                  v-model="basicForm.dedicatedBusinessBandwidth" 
                  :min="1" 
                  :max="remainingBusinessBandwidth" 
                  :step="1" 
                  style="width: 120px"
                />
                <div class="form-tip">
                  可分配的最大独享业务带宽为 {{ remainingBusinessBandwidth }} Mbps
                </div>
              </el-form-item>
              
              <el-form-item label="七层防护" prop="layer7Protection">
                <el-tag :type="basicForm.layer7Protection ? 'success' : 'info'">
                  {{ basicForm.layer7Protection ? '是' : '否' }}
                </el-tag>
                <div class="form-tip">
                  七层防护状态由业务实例套餐类型决定，不可手动修改
                </div>
              </el-form-item>
            </el-form>
          </el-tab-pane>
          
          <el-tab-pane label="负载均衡配置" name="slb">
            <div class="slb-config-notice" v-if="basicForm.layer7Protection">
              <el-alert
                type="info"
                :closable="false"
                show-icon
              >
                <template #title>
                  七层防护已开启，负载均衡使用默认配置，无需手动配置
                </template>
                <template #default>
                  开启七层防护后，ADS会过WAF-CC和WAF，回源Member信息将在域名防护对象中进行配置
                </template>
              </el-alert>
            </div>
            
            <el-form 
              v-else
              ref="slbFormRef" 
              :model="slbForm" 
              :rules="slbRules" 
              label-width="140px"
              label-position="right"
            >
              <el-form-item label="监听协议/端口">
                <div class="protocol-port-list">
                  <div class="protocol-port-item" v-for="(item, index) in slbForm.protocols" :key="index">
                    <el-tag>{{ item.protocol }}</el-tag>
                    <span class="port-range">{{ item.portRange }}</span>
                  </div>
                </div>
              </el-form-item>
              
              <el-form-item label="调度算法" prop="scheduler">
                <el-select v-model="slbForm.scheduler" style="width: 100%">
                  <el-option label="加权轮询(WRR)" value="wrr" />
                  <el-option label="加权最小连接数(WLC)" value="wlc" />
                  <el-option label="源IP哈希(CONN-HASH)" value="conn-hash" />
                </el-select>
              </el-form-item>
              
              <el-form-item label="会话超时时间(秒)" prop="sessionTimeout">
                <el-input-number v-model="slbForm.sessionTimeout" :min="1" :max="3600" style="width: 120px" />
              </el-form-item>
              
              <el-form-item label="健康检查" prop="healthCheck">
                <el-select v-model="slbForm.healthCheck" style="width: 100%">
                  <el-option label="TCP" value="TCP" />
                  <el-option label="UDP" value="UDP" />
                  <el-option label="HTTP" value="HTTP" />
                  <el-option label="HTTPS" value="HTTPS" />
                  <el-option label="ICMP" value="ICMP" />
                  <el-option label="无健康检查" value="NONE" />
                </el-select>
              </el-form-item>
              
              <el-form-item label="插入TOA/UOA" prop="insertToa">
                <el-switch v-model="slbForm.insertToa" />
              </el-form-item>
              
              <el-form-item label="会话超时双向reset" prop="sessionResetEnabled">
                <el-switch v-model="slbForm.sessionResetEnabled" />
              </el-form-item>
              
              <el-form-item label="五元组转换日志">
                <div class="syslog-config">
                  <div class="syslog-item">
                    <span class="syslog-label">Syslog IP:</span>
                    <el-input v-model="slbForm.syslogIp" placeholder="请输入Syslog IP" />
                  </div>
                  <div class="syslog-item">
                    <span class="syslog-label">Syslog Port:</span>
                    <el-input-number v-model="slbForm.syslogPort" :min="1" :max="65535" style="width: 120px" />
                  </div>
                </div>
              </el-form-item>
              
              <el-divider content-position="left">后端Member配置</el-divider>
              
              <div class="member-operations">
                <el-button type="primary" @click="handleAddMember">添加Member</el-button>
              </div>
              
              <el-table :data="slbForm.members" border style="width: 100%">
                <el-table-column label="IP地址" prop="ip" min-width="150" />
                <el-table-column label="端口" prop="port" width="100" />
                <el-table-column label="权重" prop="weight" width="100" />
                <el-table-column label="操作" width="150" fixed="right">
                  <template #default="{ row, $index }">
                    <el-button type="primary" link @click="handleEditMember(row, $index)">编辑</el-button>
                    <el-button type="danger" link @click="handleDeleteMember($index)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-form>
          </el-tab-pane>
        </el-tabs>
        
        <div class="drawer-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="handleSave" :loading="saveLoading">保存</el-button>
        </div>
      </div>
    </template>
  </el-drawer>
  
  <!-- Member编辑对话框 -->
  <el-dialog
    v-model="memberDialogVisible"
    :title="isEditMember ? '编辑Member' : '添加Member'"
    width="500px"
    :close-on-click-modal="false"
  >
    <el-form
      ref="memberFormRef"
      :model="memberForm"
      :rules="memberRules"
      label-width="80px"
    >
      <el-form-item label="IP地址" prop="ip">
        <el-input v-model="memberForm.ip" placeholder="请输入IP地址" />
      </el-form-item>
      
      <el-form-item label="端口" prop="port">
        <el-input-number v-model="memberForm.port" :min="1" :max="65535" style="width: 120px" />
      </el-form-item>
      
      <el-form-item label="权重" prop="weight">
        <el-input-number v-model="memberForm.weight" :min="1" :max="100" style="width: 120px" />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="memberDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleMemberSubmit">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getIpProtectionDetail, updateIpProtectionConfig, getInstanceAllocatedIpGroups, getIpGroupDetail } from '@/services/ProtectionObjectService'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  protectionId: {
    type: [Number, String],
    default: null
  }
})

const emit = defineEmits(['update:visible', 'success'])

// 抽屉可见性
const drawerVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

// 加载状态
const loading = ref(false)
const saveLoading = ref(false)

// 当前激活的标签页
const activeTab = ref('basic')

// 表单引用
const basicFormRef = ref(null)
const slbFormRef = ref(null)
const memberFormRef = ref(null)

// 选中的IP组信息
const selectedIpGroupInfo = reactive({
  addressType: '',
  ipCount: 0,
  ips: []
})

// 基本信息表单
const basicForm = reactive({
  id: null,
  protectionIpGroupId: '',
  protectionBandwidthType: 'shared',
  dedicatedProtectionBandwidth: 0,
  instanceProtectionBandwidth: 0,
  businessBandwidthType: 'shared',
  dedicatedBusinessBandwidth: 0,
  instanceBusinessBandwidth: 0,
  layer7Protection: false
})

// 防护IP组选项
const protectionIpGroupOptions = ref([])

// 实例信息
const instanceInfo = reactive({
  protectionBandwidth: 0,
  businessBandwidth: 0,
  allocatedProtectionBandwidth: 0,
  allocatedBusinessBandwidth: 0,
  currentProtectionBandwidth: 0,
  currentBusinessBandwidth: 0
})

// 计算剩余可分配的带宽
const remainingProtectionBandwidth = computed(() => {
  return basicForm.instanceProtectionBandwidth - (basicForm.protectionBandwidthType === 'shared' ? 0 : basicForm.dedicatedProtectionBandwidth)
})

const remainingBusinessBandwidth = computed(() => {
  return basicForm.instanceBusinessBandwidth - (basicForm.businessBandwidthType === 'shared' ? 0 : basicForm.dedicatedBusinessBandwidth)
})

// 表单验证规则
const basicRules = reactive({
  protectionIpGroupId: [
    { required: true, message: '请选择防护IP组', trigger: 'change' }
  ],
  protectionBandwidthType: [
    { required: true, message: '请选择防护带宽类型', trigger: 'change' }
  ],
  dedicatedProtectionBandwidth: [
    { 
      required: true, 
      message: '请输入独享防护带宽', 
      trigger: 'blur',
      validator: (rule, value, callback) => {
        if (basicForm.protectionBandwidthType === 'dedicated' && (!value || value <= 0)) {
          callback(new Error('请输入独享防护带宽'));
        } else {
          callback();
        }
      }
    },
    { 
      type: 'number', 
      min: 1, 
      message: '独享防护带宽必须大于0', 
      trigger: 'blur',
      validator: (rule, value, callback) => {
        if (basicForm.protectionBandwidthType === 'dedicated' && value <= 0) {
          callback(new Error('独享防护带宽必须大于0'));
        } else if (basicForm.protectionBandwidthType === 'dedicated' && value > remainingProtectionBandwidth.value) {
          callback(new Error(`独享防护带宽不能超过${remainingProtectionBandwidth.value}Mbps`));
        } else {
          callback();
        }
      }
    }
  ],
  businessBandwidthType: [
    { required: true, message: '请选择业务带宽类型', trigger: 'change' }
  ],
  dedicatedBusinessBandwidth: [
    { 
      required: true, 
      message: '请输入独享业务带宽', 
      trigger: 'blur',
      validator: (rule, value, callback) => {
        if (basicForm.businessBandwidthType === 'dedicated' && (!value || value <= 0)) {
          callback(new Error('请输入独享业务带宽'));
        } else {
          callback();
        }
      }
    },
    { 
      type: 'number', 
      min: 1, 
      message: '独享业务带宽必须大于0', 
      trigger: 'blur',
      validator: (rule, value, callback) => {
        if (basicForm.businessBandwidthType === 'dedicated' && value <= 0) {
          callback(new Error('独享业务带宽必须大于0'));
        } else if (basicForm.businessBandwidthType === 'dedicated' && value > remainingBusinessBandwidth.value) {
          callback(new Error(`独享业务带宽不能超过${remainingBusinessBandwidth.value}Mbps`));
        } else {
          callback();
        }
      }
    }
  ],
  layer7Protection: [
    { required: true, message: '请选择是否启用七层防护', trigger: 'change' }
  ]
})

// 负载均衡表单
const slbForm = reactive({
  protocols: [
    { protocol: 'TCP', portRange: '1-65535' },
    { protocol: 'UDP', portRange: '1-65535' }
  ],
  scheduler: 'wrr',
  sessionTimeout: 300,
  healthCheck: 'TCP',
  insertToa: false,
  sessionResetEnabled: false,
  syslogIp: '',
  syslogPort: 514,
  members: []
})

// Member表单
const memberDialogVisible = ref(false)
const isEditMember = ref(false)
const currentMemberIndex = ref(-1)
const memberForm = reactive({
  ip: '',
  port: 80,
  weight: 10
})

const memberRules = reactive({
  ip: [
    { required: true, message: '请输入IP地址', trigger: 'blur' },
    { 
      pattern: /^(\d{1,3}\.){3}\d{1,3}$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/, 
      message: '请输入有效的IPv4或IPv6地址', 
      trigger: 'blur' 
    }
  ],
  port: [
    { required: true, message: '请输入端口号', trigger: 'blur' },
    { type: 'number', min: 1, max: 65535, message: '端口号必须在1-65535之间', trigger: 'blur' }
  ],
  weight: [
    { required: true, message: '请输入权重', trigger: 'blur' },
    { type: 'number', min: 1, max: 100, message: '权重必须在1-100之间', trigger: 'blur' }
  ]
})

const slbRules = reactive({
  scheduler: [
    { required: true, message: '请选择调度算法', trigger: 'change' }
  ],
  sessionTimeout: [
    { required: true, message: '请输入会话超时时间', trigger: 'blur' }
  ],
  healthCheck: [
    { required: true, message: '请选择健康检查方式', trigger: 'change' }
  ]
})

// 获取IP防护对象详情
const fetchProtectionDetail = async () => {
  if (!props.protectionId) return
  
  loading.value = true
  try {
    const res = await getIpProtectionDetail(props.protectionId)
    if (res.code === 200) {
      const data = res.data
      
      // 更新基本信息表单
      Object.assign(basicForm, {
        id: data.id,
        protectionIpGroupId: data.protectionIpGroupId,
        protectionBandwidthType: data.protectionBandwidthType,
        dedicatedProtectionBandwidth: data.dedicatedProtectionBandwidth,
        instanceProtectionBandwidth: data.instanceProtectionBandwidth,
        businessBandwidthType: data.businessBandwidthType,
        dedicatedBusinessBandwidth: data.dedicatedBusinessBandwidth,
        instanceBusinessBandwidth: data.instanceBusinessBandwidth,
        layer7Protection: data.layer7Protection
      })
      
      // 设置地址类型信息
      if (data.addressType) {
        selectedIpGroupInfo.addressType = data.addressType;
      }
      
      // 填充实例信息
      if (data.instanceInfo) {
        Object.assign(instanceInfo, {
          protectionBandwidth: data.instanceInfo.protectionBandwidth,
          businessBandwidth: data.instanceInfo.businessBandwidth,
          allocatedProtectionBandwidth: data.instanceInfo.allocatedProtectionBandwidth || 0,
          allocatedBusinessBandwidth: data.instanceInfo.allocatedBusinessBandwidth || 0,
          currentProtectionBandwidth: data.instanceInfo.currentProtectionBandwidth || 0,
          currentBusinessBandwidth: data.instanceInfo.currentBusinessBandwidth || 0
        })
      }
      
      // 获取业务实例已分配的防护IP组
      if (data.instanceId) {
        console.log('获取业务实例的防护IP组，业务实例ID:', data.instanceId);
        try {
          const ipGroupsRes = await getInstanceAllocatedIpGroups(data.instanceId)
          if (ipGroupsRes.code === 200) {
            protectionIpGroupOptions.value = ipGroupsRes.data.map(group => ({
              groupId: group.groupId,
              displayName: group.displayName,
              addressType: group.addressType
            }))
            
            // 确保当前IP组在选项中
            const exists = protectionIpGroupOptions.value.some(item => item.groupId === data.protectionIpGroupId)
            if (!exists && data.protectionIpGroupId) {
              // 如果当前选中的IP组不在列表中，添加一个临时选项
              protectionIpGroupOptions.value.push({
                groupId: data.protectionIpGroupId,
                displayName: `防护IP组 #${data.protectionIpGroupId.slice(-5)}`
              })
            }
            
            // 调用handleIpGroupChange确保地址类型正确更新
            if (data.protectionIpGroupId) {
              await handleIpGroupChange(data.protectionIpGroupId);
            }
          } else {
            console.error('获取防护IP组列表失败:', ipGroupsRes.message);
            ElMessage.error(ipGroupsRes.message || '获取防护IP组列表失败');
          }
        } catch (error) {
          console.error('获取防护IP组列表失败:', error)
          ElMessage.error('获取防护IP组列表失败: ' + (error.message || error))
        }
      } else {
        console.error('业务实例ID不存在');
        ElMessage.error('业务实例ID不存在');
      }
      
      // 填充负载均衡配置
      if (data.slbConfig) {
        Object.assign(slbForm, {
          scheduler: data.slbConfig.scheduler || 'wrr',
          sessionTimeout: data.slbConfig.sessionTimeout || 300,
          healthCheck: data.slbConfig.healthCheck || 'TCP',
          insertToa: data.slbConfig.insertToa || false,
          sessionResetEnabled: data.slbConfig.sessionResetEnabled || false,
          syslogIp: data.slbConfig.syslogIp || '',
          syslogPort: data.slbConfig.syslogPort || 514,
          members: data.slbConfig.members || []
        })
      }
    } else {
      ElMessage.error(res.message || '获取IP防护对象详情失败')
    }
  } catch (error) {
    console.error('获取IP防护对象详情失败:', error)
    ElMessage.error('获取IP防护对象详情失败: ' + (error.message || error))
  } finally {
    loading.value = false
  }
}

// 处理防护带宽类型变更
const handleProtectionBandwidthTypeChange = (type) => {
  if (type === 'dedicated') {
    // 设置默认值，不超过可用带宽
    basicForm.dedicatedProtectionBandwidth = Math.min(100, remainingProtectionBandwidth.value)
  } else {
    basicForm.dedicatedProtectionBandwidth = 0
  }
}

// 处理业务带宽类型变更
const handleBusinessBandwidthTypeChange = (type) => {
  if (type === 'dedicated') {
    // 设置默认值，不超过可用带宽
    basicForm.dedicatedBusinessBandwidth = Math.min(50, remainingBusinessBandwidth.value)
  } else {
    basicForm.dedicatedBusinessBandwidth = 0
  }
}

// 保存配置
const handleSave = async () => {
  try {
    // 验证基本信息表单
    if (!basicFormRef.value) return
    await basicFormRef.value.validate()
    
    // 如果七层防护关闭，则验证负载均衡表单
    if (!basicForm.layer7Protection) {
      if (!slbFormRef.value) return
      await slbFormRef.value.validate()
    }
    
    saveLoading.value = true
    
    // 构建提交数据
    const submitData = {
      id: basicForm.id,
      protectionIpGroupId: basicForm.protectionIpGroupId,
      addressType: selectedIpGroupInfo.addressType,
      protectionBandwidthType: basicForm.protectionBandwidthType,
      dedicatedProtectionBandwidth: basicForm.protectionBandwidthType === 'dedicated' ? basicForm.dedicatedProtectionBandwidth : 0,
      businessBandwidthType: basicForm.businessBandwidthType,
      dedicatedBusinessBandwidth: basicForm.businessBandwidthType === 'dedicated' ? basicForm.dedicatedBusinessBandwidth : 0,
      layer7Protection: basicForm.layer7Protection,
      slbConfig: !basicForm.layer7Protection ? {
        scheduler: slbForm.scheduler,
        sessionTimeout: slbForm.sessionTimeout,
        healthCheck: slbForm.healthCheck,
        insertToa: slbForm.insertToa,
        sessionResetEnabled: slbForm.sessionResetEnabled,
        syslogIp: slbForm.syslogIp,
        syslogPort: slbForm.syslogPort,
        members: slbForm.members
      } : null
    }
    
    // 调用API
    const res = await updateIpProtectionConfig(submitData)
    
    if (res.code === 200) {
      ElMessage.success('保存配置成功')
      emit('success')
      drawerVisible.value = false
    } else {
      ElMessage.error(res.message || '保存配置失败')
    }
  } catch (error) {
    console.error('保存配置失败:', error)
    ElMessage.error('表单验证失败，请检查输入')
  } finally {
    saveLoading.value = false
  }
}

// 关闭抽屉
const handleClose = () => {
  ElMessageBox.confirm(
    '确定要关闭配置页面吗？未保存的修改将会丢失',
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

// 添加Member
const handleAddMember = () => {
  isEditMember.value = false
  currentMemberIndex.value = -1
  
  // 重置表单
  Object.assign(memberForm, {
    ip: '',
    port: 80,
    weight: 10
  })
  
  memberDialogVisible.value = true
}

// 编辑Member
const handleEditMember = (row, index) => {
  isEditMember.value = true
  currentMemberIndex.value = index
  
  // 填充表单
  Object.assign(memberForm, {
    ip: row.ip,
    port: row.port,
    weight: row.weight
  })
  
  memberDialogVisible.value = true
}

// 删除Member
const handleDeleteMember = (index) => {
  ElMessageBox.confirm(
    '确定要删除该Member吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    slbForm.members.splice(index, 1)
  }).catch(() => {})
}

// 提交Member表单
const handleMemberSubmit = async () => {
  try {
    if (!memberFormRef.value) return
    
    await memberFormRef.value.validate()
    
    const memberData = {
      ip: memberForm.ip,
      port: memberForm.port,
      weight: memberForm.weight
    }
    
    if (isEditMember.value && currentMemberIndex.value !== -1) {
      // 编辑模式
      slbForm.members[currentMemberIndex.value] = memberData
    } else {
      // 添加模式
      slbForm.members.push(memberData)
    }
    
    memberDialogVisible.value = false
  } catch (error) {
    console.error('Member表单验证失败:', error)
    ElMessage.error('表单验证失败，请检查输入')
  }
}

// 监听七层防护变化
watch(() => basicForm.layer7Protection, (newValue) => {
  if (newValue) {
    // 七层防护开启，重置负载均衡配置为默认值
    Object.assign(slbForm, {
      scheduler: 'wrr',
      sessionTimeout: 300,
      healthCheck: 'TCP',
      insertToa: false,
      sessionResetEnabled: false,
      syslogIp: '',
      syslogPort: 514,
      members: []
    })
  }
})

// 监听抽屉可见性变化
watch(() => drawerVisible.value, (val) => {
  if (val) {
    // 打开抽屉时获取数据
    fetchProtectionDetail()
  }
})

// 格式化带宽显示
const getBandwidthDisplay = (type, dedicated, total) => {
  if (type === 'shared') {
    return `共享(${total})`
  } else {
    return `${dedicated}/${total}`
  }
}

// 处理IP组变化
const handleIpGroupChange = async (groupId) => {
  if (!groupId) {
    selectedIpGroupInfo.addressType = '';
    return;
  }
  
  try {
    // 先从选项中查找
    let ipGroup = protectionIpGroupOptions.value.find(item => item.groupId === groupId);
    
    // 如果没有找到或没有地址类型信息，从服务器获取详情
    if (!ipGroup || !ipGroup.addressType) {
      loading.value = true;
      const res = await getIpGroupDetail(groupId);
      loading.value = false;
      
      if (res.code === 200) {
        ipGroup = res.data;
        
        // 更新选项中的地址类型
        const index = protectionIpGroupOptions.value.findIndex(item => item.groupId === groupId);
        if (index !== -1) {
          protectionIpGroupOptions.value[index].addressType = ipGroup.addressType;
        }
      }
    }
    
    if (ipGroup) {
      // 更新选中的IP组信息
      selectedIpGroupInfo.addressType = ipGroup.addressType || '';
      selectedIpGroupInfo.ipCount = ipGroup.ipCount || 0;
      selectedIpGroupInfo.ips = ipGroup.ips || [];
      
      console.log(`IP组已更改，地址类型更新为: ${selectedIpGroupInfo.addressType}`);
    }
  } catch (error) {
    console.error('获取IP组详情失败:', error);
    ElMessage.error('获取IP组详情失败');
    loading.value = false;
  }
}

// 获取地址类型标签
const getAddressTypeTag = (type) => {
  const types = {
    'IPv4': 'primary',
    'IPv6': 'success'
  }
  return types[type] || 'info'
}
</script>

<style scoped>
.config-drawer-content {
  padding: 0 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.config-tabs {
  flex: 1;
  overflow: auto;
}

.drawer-footer {
  margin-top: 20px;
  padding: 10px 0;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #ebeef5;
}

.protocol-port-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.protocol-port-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.port-range {
  color: #606266;
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

.member-operations {
  margin-bottom: 15px;
  display: flex;
  justify-content: flex-start;
}

.slb-config-notice {
  margin-bottom: 20px;
}
</style> 