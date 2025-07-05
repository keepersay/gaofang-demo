<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑IP防护对象' : '新增IP防护对象'"
    width="650px"
    :close-on-click-modal="false"
    :before-close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
      label-position="right"
    >
      <el-form-item label="业务实例" prop="instanceId">
        <el-select 
          v-model="form.instanceId" 
          placeholder="请选择业务实例" 
          style="width: 100%"
          @change="handleInstanceChange"
        >
          <el-option
            v-for="item in instanceOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="客户名称">
        <el-input v-model="instanceInfo.customerName" disabled />
      </el-form-item>
      
      <el-form-item label="地址类型" prop="addressType">
        <el-radio-group v-model="form.addressType" @change="handleAddressTypeChange">
          <el-radio value="all">全部</el-radio>
          <el-radio value="IPv4">IPv4</el-radio>
          <el-radio value="IPv6">IPv6</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item label="防护IP组" prop="protectionIpGroupId">
        <el-select 
          v-model="form.protectionIpGroupId" 
          placeholder="请选择防护IP组" 
          style="width: 100%"
          :disabled="!form.instanceId"
          @change="handleIpGroupChange"
        >
          <el-option
            v-for="item in filteredIpGroupOptions"
            :key="item.groupId"
            :label="item.displayName"
            :value="item.groupId"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="IP列表">
        <div class="ip-list-container">
          <div v-for="(ip, index) in selectedIpGroupInfo.ips" :key="index" class="ip-item">
            <span>{{ ip.ip }}</span>
            <span class="ip-cluster">({{ ip.logicClusterName }})</span>
          </div>
          <div v-if="!selectedIpGroupInfo.ips || selectedIpGroupInfo.ips.length === 0" class="no-ip">
            暂无IP信息
          </div>
        </div>
      </el-form-item>
      
      <el-form-item label="防护带宽" prop="protectionBandwidthType">
        <el-radio-group v-model="form.protectionBandwidthType" @change="handleProtectionBandwidthTypeChange">
          <el-radio value="shared">共享</el-radio>
          <el-radio value="dedicated">独享</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item 
        v-if="form.protectionBandwidthType === 'dedicated'" 
        label="独享防护带宽" 
        prop="dedicatedProtectionBandwidth"
      >
        <el-input-number 
          v-model="form.dedicatedProtectionBandwidth" 
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
        <el-radio-group v-model="form.businessBandwidthType" @change="handleBusinessBandwidthTypeChange">
          <el-radio value="shared">共享</el-radio>
          <el-radio value="dedicated">独享</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item 
        v-if="form.businessBandwidthType === 'dedicated'" 
        label="独享业务带宽" 
        prop="dedicatedBusinessBandwidth"
      >
        <el-input-number 
          v-model="form.dedicatedBusinessBandwidth" 
          :min="1" 
          :max="remainingBusinessBandwidth" 
          :step="1" 
          style="width: 120px"
        />
        <div class="form-tip">
          可分配的最大独享业务带宽为 {{ remainingBusinessBandwidth }} Mbps
        </div>
      </el-form-item>
      
      <!-- 显示七层防护状态 -->
      <el-form-item label="七层防护">
        <el-tag :type="form.layer7Protection ? 'success' : 'info'">
          {{ form.layer7Protection ? '是' : '否' }}
        </el-tag>
        <div class="form-tip">
          七层防护状态由业务实例套餐类型决定，不可手动修改
        </div>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getBusinessInstanceOptions, getBusinessInstanceDetail } from '@/services/BusinessInstanceService'
import { addIpProtection, updateIpProtection, getInstanceAllocatedIpGroups, getIpGroupDetail } from '@/services/ProtectionObjectService'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  editData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:visible', 'success'])

// 表单引用
const formRef = ref(null)
const loading = ref(false)
const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

// 是否是编辑模式
const isEdit = computed(() => !!props.editData)

// 业务实例选项
const instanceOptions = ref([])

// IP组选项
const ipGroupOptions = ref([])

// 根据地址类型筛选IP组选项
const filteredIpGroupOptions = computed(() => {
  if (form.addressType === 'all') {
    return ipGroupOptions.value
  }
  return ipGroupOptions.value.filter(item => item.addressType === form.addressType)
})

// 选中的IP组信息
const selectedIpGroupInfo = reactive({
  addressType: '',
  ipCount: 0,
  ips: []
})

// 业务实例信息
const instanceInfo = reactive({
  customerName: '',
  protectionBandwidth: 0,
  businessBandwidth: 0,
  allocatedProtectionBandwidth: 0,
  allocatedBusinessBandwidth: 0
})

// 计算剩余可分配的带宽
const remainingProtectionBandwidth = computed(() => {
  return instanceInfo.protectionBandwidth - instanceInfo.allocatedProtectionBandwidth
})

const remainingBusinessBandwidth = computed(() => {
  return instanceInfo.businessBandwidth - instanceInfo.allocatedBusinessBandwidth
})

// 表单数据
const form = reactive({
  instanceId: '',
  addressType: 'all',
  protectionIpGroupId: '',
  protectionBandwidthType: 'shared',
  dedicatedProtectionBandwidth: 0,
  businessBandwidthType: 'shared',
  dedicatedBusinessBandwidth: 0,
  layer7Protection: false
})

// 表单验证规则
const rules = reactive({
  instanceId: [
    { required: true, message: '请选择业务实例', trigger: 'change' }
  ],
  addressType: [
    { required: true, message: '请选择地址类型', trigger: 'change' }
  ],
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
        if (form.protectionBandwidthType === 'dedicated' && (!value || value <= 0)) {
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
        if (form.protectionBandwidthType === 'dedicated' && value <= 0) {
          callback(new Error('独享防护带宽必须大于0'));
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
        if (form.businessBandwidthType === 'dedicated' && (!value || value <= 0)) {
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
        if (form.businessBandwidthType === 'dedicated' && value <= 0) {
          callback(new Error('独享业务带宽必须大于0'));
        } else {
          callback();
        }
      }
    }
  ]
})

// 初始化
const init = async () => {
  try {
    // 获取业务实例选项
    const res = await getBusinessInstanceOptions()
    if (res.code === 200) {
      instanceOptions.value = res.data
    }
    
    // 编辑模式下，初始化表单数据
    if (isEdit.value) {
      const editData = props.editData
      form.instanceId = editData.instanceId
      form.protectionIpGroupId = editData.protectionIpGroupId
      form.protectionBandwidthType = editData.protectionBandwidthType
      form.dedicatedProtectionBandwidth = editData.dedicatedProtectionBandwidth
      form.businessBandwidthType = editData.businessBandwidthType
      form.dedicatedBusinessBandwidth = editData.dedicatedBusinessBandwidth
      form.layer7Protection = editData.layer7Protection
      
      // 获取业务实例详情
      await handleInstanceChange(form.instanceId)
      
      // 获取IP组详情
      await handleIpGroupChange(form.protectionIpGroupId)
      
      // 设置地址类型
      if (selectedIpGroupInfo.addressType) {
        form.addressType = selectedIpGroupInfo.addressType
      }
    }
  } catch (error) {
    console.error('初始化失败:', error)
    ElMessage.error('初始化失败')
  }
}

// 处理业务实例变更
const handleInstanceChange = async (instanceId) => {
  if (!instanceId) {
    resetInstanceInfo()
    return
  }
  
  loading.value = true
  try {
    // 获取业务实例详情
    const res = await getBusinessInstanceDetail(instanceId)
    if (res.code === 200) {
      const data = res.data
      instanceInfo.customerName = data.customerName
      instanceInfo.protectionBandwidth = data.protectionBandwidth
      instanceInfo.businessBandwidth = data.businessBandwidth
      instanceInfo.allocatedProtectionBandwidth = data.allocatedProtectionBandwidth
      instanceInfo.allocatedBusinessBandwidth = data.allocatedBusinessBandwidth
      
      // 设置七层防护状态
      form.layer7Protection = data.layer7Protection || false
      
      // 获取IP组列表
      await fetchIpGroups(instanceId)
    }
  } catch (error) {
    console.error('获取业务实例详情失败:', error)
    ElMessage.error('获取业务实例详情失败')
  } finally {
    loading.value = false
  }
}

// 处理地址类型变更
const handleAddressTypeChange = (type) => {
  // 清空已选择的IP组
  form.protectionIpGroupId = ''
  resetIpGroupInfo()
  
  // 如果筛选后只有一个IP组，自动选择
  if (filteredIpGroupOptions.value.length === 1) {
    form.protectionIpGroupId = filteredIpGroupOptions.value[0].groupId
    handleIpGroupChange(form.protectionIpGroupId)
  }
}

// 获取IP组列表
const fetchIpGroups = async (instanceId) => {
  if (!instanceId) return
  
  try {
    const res = await getInstanceAllocatedIpGroups(instanceId)
    if (res.code === 200) {
      ipGroupOptions.value = res.data
      
      // 如果只有一个IP组，自动选择
      if (ipGroupOptions.value.length === 1 && !form.protectionIpGroupId) {
        form.protectionIpGroupId = ipGroupOptions.value[0].groupId
        await handleIpGroupChange(form.protectionIpGroupId)
      }
    }
  } catch (error) {
    console.error('获取防护IP组列表失败:', error)
    ElMessage.error('获取防护IP组列表失败')
  }
}

// 处理IP组变更
const handleIpGroupChange = async (groupId) => {
  if (!groupId) {
    resetIpGroupInfo()
    return
  }
  
  try {
    // 先从选项中查找
    let ipGroup = ipGroupOptions.value.find(item => item.groupId === groupId)
    
    // 如果没有找到，从服务器获取详情
    if (!ipGroup) {
      const res = await getIpGroupDetail(groupId)
      if (res.code === 200) {
        ipGroup = res.data
      }
    }
    
    if (ipGroup) {
      selectedIpGroupInfo.addressType = ipGroup.addressType
      selectedIpGroupInfo.ipCount = ipGroup.ipCount
      selectedIpGroupInfo.ips = ipGroup.ips || []
      
      // 如果地址类型为"全部"，则更新为实际IP组的地址类型
      if (form.addressType === 'all') {
        form.addressType = ipGroup.addressType
      }
    }
  } catch (error) {
    console.error('获取IP组详情失败:', error)
    ElMessage.error('获取IP组详情失败')
  }
}

// 重置业务实例信息
const resetInstanceInfo = () => {
  instanceInfo.customerName = ''
  instanceInfo.protectionBandwidth = 0
  instanceInfo.businessBandwidth = 0
  instanceInfo.allocatedProtectionBandwidth = 0
  instanceInfo.allocatedBusinessBandwidth = 0
  form.layer7Protection = false
  
  // 清空IP组选项
  ipGroupOptions.value = []
  form.protectionIpGroupId = ''
  resetIpGroupInfo()
}

// 重置IP组信息
const resetIpGroupInfo = () => {
  selectedIpGroupInfo.addressType = ''
  selectedIpGroupInfo.ipCount = 0
  selectedIpGroupInfo.ips = []
}

// 处理防护带宽类型变更
const handleProtectionBandwidthTypeChange = (type) => {
  if (type === 'shared') {
    form.dedicatedProtectionBandwidth = 0
  }
}

// 处理业务带宽类型变更
const handleBusinessBandwidthTypeChange = (type) => {
  if (type === 'shared') {
    form.dedicatedBusinessBandwidth = 0
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    loading.value = true
    
    // 构造提交数据
    const data = {
      instanceId: form.instanceId,
      protectionIpGroupId: form.protectionIpGroupId,
      protectionBandwidthType: form.protectionBandwidthType,
      dedicatedProtectionBandwidth: form.protectionBandwidthType === 'dedicated' ? form.dedicatedProtectionBandwidth : 0,
      businessBandwidthType: form.businessBandwidthType,
      dedicatedBusinessBandwidth: form.businessBandwidthType === 'dedicated' ? form.dedicatedBusinessBandwidth : 0,
      layer7Protection: form.layer7Protection
    }
    
    // 编辑模式下添加ID
    if (isEdit.value) {
      data.id = props.editData.id
    }
    
    // 提交数据
    const res = isEdit.value 
      ? await updateIpProtection(data)
      : await addIpProtection(data)
    
    if (res.code === 200) {
      ElMessage.success(isEdit.value ? '编辑成功' : '添加成功')
      emit('success')
      handleClose()
    } else {
      ElMessage.error(res.message || (isEdit.value ? '编辑失败' : '添加失败'))
    }
  } catch (error) {
    console.error('表单提交失败:', error)
    ElMessage.error(isEdit.value ? '编辑失败' : '添加失败')
  } finally {
    loading.value = false
  }
}

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
  formRef.value?.resetFields()
  resetInstanceInfo()
  resetIpGroupInfo()
}

// 监听对话框可见性变化
watch(() => props.visible, (val) => {
  if (val) {
    init()
  }
})
</script>

<style scoped>
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.ip-list-container {
  max-height: 150px;
  overflow-y: auto;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 8px;
}

.ip-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  border-bottom: 1px dashed #ebeef5;
}

.ip-item:last-child {
  border-bottom: none;
}

.ip-cluster {
  color: #909399;
  font-size: 12px;
}

.no-ip {
  color: #909399;
  text-align: center;
  padding: 10px 0;
}
</style> 