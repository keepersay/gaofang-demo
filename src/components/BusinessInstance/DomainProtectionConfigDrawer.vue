<template>
  <el-drawer
    v-model="drawerVisible"
    title="域名防护对象配置"
    size="60%"
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
              <el-form-item label="业务实例" prop="instanceId">
                <el-input v-model="basicForm.instanceId" disabled />
              </el-form-item>

              <el-form-item label="客户名称">
                <el-input v-model="instanceInfo.customerName" disabled />
              </el-form-item>

              <el-form-item label="接入方式">
                <el-tag>{{ getAccessTypeLabel(basicForm.accessType) }}</el-tag>
              </el-form-item>
              
              <el-form-item label="防护IP组" prop="protectionIpGroupId">
                <el-select 
                  v-model="basicForm.protectionIpGroupId" 
                  placeholder="请选择防护IP组" 
                  style="width: 100%"
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
                <el-input v-model="basicForm.addressType" disabled />
              </el-form-item>
              
              <el-form-item label="防护域名" prop="domain">
                <el-input 
                  v-model="basicForm.domain" 
                  placeholder="请输入需要防护的域名，如example.com" 
                />
              </el-form-item>

              <el-form-item label="防护CNAME">
                <el-input v-model="basicForm.cname" disabled />
              </el-form-item>
              
              <el-form-item label="业务QPS" prop="businessQpsType">
                <el-radio-group v-model="basicForm.businessQpsType" @change="handleBusinessQpsTypeChange">
                  <el-radio value="shared">共享</el-radio>
                  <el-radio value="dedicated">独享</el-radio>
                </el-radio-group>
              </el-form-item>
              
              <el-form-item 
                v-if="basicForm.businessQpsType === 'dedicated'" 
                label="独享业务QPS" 
                prop="dedicatedBusinessQps"
              >
                <el-input-number 
                  v-model="basicForm.dedicatedBusinessQps" 
                  :min="1" 
                  :max="remainingBusinessQps" 
                  :step="100" 
                  style="width: 120px"
                />
                <div class="form-tip">
                  可分配的最大独享业务QPS为 {{ remainingBusinessQps || 0 }}
                </div>
              </el-form-item>

              <el-form-item label="防护套餐" prop="protectionPackage">
                <el-radio-group v-model="basicForm.protectionPackage">
                  <el-radio value="standard">WAF标准防护</el-radio>
                  <el-radio value="enhanced">WAF增强防护</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-form>
          </el-tab-pane>
          
          <el-tab-pane label="负载均衡配置" name="slb">
            <el-form 
              ref="slbFormRef" 
              :model="slbForm" 
              :rules="slbRules" 
              label-width="140px"
              label-position="right"
            >
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
                  <el-option label="HTTP" value="HTTP" />
                  <el-option label="HTTPS" value="HTTPS" />
                  <el-option label="无健康检查" value="NONE" />
                </el-select>
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
import { getDomainProtectionDetail, updateDomainProtectionConfig, getInstanceAllocatedIpGroups } from '@/services/ProtectionObjectService'

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

// 基本信息表单
const basicForm = reactive({
  id: null,
  instanceId: '',
  accessType: 'domain',
  protectionIpGroupId: '',
  addressType: '',
  domain: '',
  cname: '',
  businessQpsType: 'shared',
  dedicatedBusinessQps: 0,
  instanceBusinessQps: 0,
  protectionPackage: 'standard'
})

// 防护IP组选项
const protectionIpGroupOptions = ref([])

// 实例信息
const instanceInfo = reactive({
  customerName: '',
  businessQps: 0,
  allocatedBusinessQps: 0,
  currentBusinessQps: 0
})

// 计算剩余可分配的QPS
const remainingBusinessQps = computed(() => {
  return Math.max(0, instanceInfo.businessQps - instanceInfo.allocatedBusinessQps + 
    (basicForm.businessQpsType === 'dedicated' ? basicForm.dedicatedBusinessQps : 0))
})

// 负载均衡表单
const slbForm = reactive({
  scheduler: 'wrr',
  sessionTimeout: 300,
  healthCheck: 'TCP',
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

// 表单验证规则
const basicRules = reactive({
  protectionIpGroupId: [
    { required: true, message: '请选择防护IP组', trigger: 'change' }
  ],
  domain: [
    { required: true, message: '请输入防护域名', trigger: 'blur' },
    { 
      pattern: /^[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/, 
      message: '请输入有效的域名格式，如example.com', 
      trigger: 'blur' 
    }
  ],
  businessQpsType: [
    { required: true, message: '请选择业务QPS类型', trigger: 'change' }
  ],
  dedicatedBusinessQps: [
    { required: true, message: '请输入独享业务QPS', trigger: 'blur' }
  ],
  protectionPackage: [
    { required: true, message: '请选择防护套餐', trigger: 'change' }
  ]
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

// 获取域名防护对象详情
const fetchProtectionDetail = async () => {
  if (!props.protectionId) return
  
  loading.value = true
  try {
    const res = await getDomainProtectionDetail(props.protectionId)
    if (res.code === 200) {
      const data = res.data
      
      // 更新基本信息表单
      Object.assign(basicForm, {
        id: data.id,
        instanceId: data.instanceId,
        accessType: data.accessType || 'domain',
        protectionIpGroupId: data.protectionIpGroupId,
        addressType: data.addressType || 'IPv4',
        domain: data.domain,
        cname: data.cname,
        businessQpsType: data.businessQpsType || 'shared',
        dedicatedBusinessQps: data.dedicatedBusinessQps || 0,
        instanceBusinessQps: data.instanceBusinessQps || 0,
        protectionPackage: data.protectionPackage || 'standard'
      })
      
      // 填充实例信息
      if (data.instanceInfo) {
        Object.assign(instanceInfo, {
          customerName: data.instanceInfo.customerName || '',
          businessQps: data.instanceInfo.businessQps || 0,
          allocatedBusinessQps: data.instanceInfo.allocatedBusinessQps || 0,
          currentBusinessQps: data.instanceInfo.currentBusinessQps || 0
        })
      }
      
      // 获取业务实例已分配的防护IP组
      if (data.instanceId) {
        try {
          const ipGroupsRes = await getInstanceAllocatedIpGroups(data.instanceId)
          if (ipGroupsRes.code === 200) {
            protectionIpGroupOptions.value = ipGroupsRes.data.map(group => ({
              groupId: group.groupId,
              displayName: group.displayName
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
          } else {
            console.error('获取防护IP组列表失败:', ipGroupsRes.message)
            ElMessage.error(ipGroupsRes.message || '获取防护IP组列表失败')
          }
        } catch (error) {
          console.error('获取防护IP组列表失败:', error)
          ElMessage.error('获取防护IP组列表失败: ' + (error.message || error))
        }
      } else {
        console.error('业务实例ID不存在')
        ElMessage.error('业务实例ID不存在')
      }
      
      // 填充负载均衡配置
      if (data.slbConfig) {
        Object.assign(slbForm, {
          scheduler: data.slbConfig.scheduler || 'wrr',
          sessionTimeout: data.slbConfig.sessionTimeout || 300,
          healthCheck: data.slbConfig.healthCheck || 'TCP',
          members: data.slbConfig.members || []
        })
      }
    } else {
      ElMessage.error(res.message || '获取域名防护对象详情失败')
    }
  } catch (error) {
    console.error('获取域名防护对象详情失败:', error)
    ElMessage.error('获取域名防护对象详情失败: ' + (error.message || error))
  } finally {
    loading.value = false
  }
}

// 处理业务QPS类型变更
const handleBusinessQpsTypeChange = (type) => {
  if (type === 'dedicated') {
    // 设置默认值，不超过可用QPS
    basicForm.dedicatedBusinessQps = Math.min(1000, remainingBusinessQps.value)
  } else {
    basicForm.dedicatedBusinessQps = 0
  }
}

// 获取接入方式显示标签
const getAccessTypeLabel = (type) => {
  const types = {
    domain: '域名接入',
    port: '端口接入'
  }
  return types[type] || type
}

// 保存配置
const handleSave = async () => {
  try {
    // 验证基本信息表单
    if (!basicFormRef.value) return
    await basicFormRef.value.validate()
    
    // 验证负载均衡表单
    if (!slbFormRef.value) return
    await slbFormRef.value.validate()
    
    saveLoading.value = true
    
    // 构建提交数据
    const submitData = {
      id: basicForm.id,
      protectionIpGroupId: basicForm.protectionIpGroupId,
      domain: basicForm.domain,
      businessQpsType: basicForm.businessQpsType,
      dedicatedBusinessQps: basicForm.businessQpsType === 'dedicated' ? basicForm.dedicatedBusinessQps : 0,
      protectionPackage: basicForm.protectionPackage,
      slbConfig: {
        scheduler: slbForm.scheduler,
        sessionTimeout: slbForm.sessionTimeout,
        healthCheck: slbForm.healthCheck,
        members: slbForm.members
      }
    }
    
    // 调用API
    const res = await updateDomainProtectionConfig(submitData)
    
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
    '确定要删除此Member吗？',
    '警告',
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
  if (!memberFormRef.value) return
  
  try {
    await memberFormRef.value.validate()
    
    if (isEditMember.value && currentMemberIndex.value >= 0) {
      // 编辑模式
      slbForm.members[currentMemberIndex.value] = { ...memberForm }
    } else {
      // 添加模式
      slbForm.members.push({ ...memberForm })
    }
    
    memberDialogVisible.value = false
  } catch (error) {
    console.error('Member表单验证失败:', error)
  }
}

// 监听抽屉显示状态
watch(() => drawerVisible.value, (visible) => {
  if (visible) {
    fetchProtectionDetail()
  }
})
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
  overflow-y: auto;
}

.drawer-footer {
  margin-top: 20px;
  text-align: right;
  padding: 10px 0;
  border-top: 1px solid #e6e6e6;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.member-operations {
  margin-bottom: 15px;
}

.protocol-port-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.protocol-port-item {
  display: flex;
  align-items: center;
}

.port-range {
  margin-left: 5px;
}

.syslog-config {
  display: flex;
  gap: 10px;
  align-items: center;
}

.syslog-item {
  display: flex;
  align-items: center;
  flex: 1;
}

.syslog-label {
  margin-right: 10px;
  white-space: nowrap;
}
</style> 