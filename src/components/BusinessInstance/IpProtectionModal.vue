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
      
      <el-form-item label="地址类型">
        <el-input v-model="instanceInfo.addressType" disabled />
      </el-form-item>
      
      <el-form-item label="防护公网IP" prop="publicIp">
        <el-select 
          v-model="form.publicIp" 
          placeholder="请选择防护公网IP" 
          style="width: 100%"
          :disabled="!form.instanceId"
        >
          <el-option
            v-for="item in publicIpOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="防护带宽" prop="protectionBandwidthType">
        <el-radio-group v-model="form.protectionBandwidthType" @change="handleProtectionBandwidthTypeChange">
          <el-radio :label="'shared'">共享</el-radio>
          <el-radio :label="'dedicated'">独享</el-radio>
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
          <el-radio :label="'shared'">共享</el-radio>
          <el-radio :label="'dedicated'">独享</el-radio>
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
      
      <el-form-item label="业务QPS" prop="businessQpsType">
        <el-radio-group v-model="form.businessQpsType" @change="handleBusinessQpsTypeChange">
          <el-radio :label="'shared'">共享</el-radio>
          <el-radio :label="'dedicated'">独享</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item 
        v-if="form.businessQpsType === 'dedicated'" 
        label="独享业务QPS" 
        prop="dedicatedBusinessQps"
      >
        <el-input-number 
          v-model="form.dedicatedBusinessQps" 
          :min="1" 
          :max="remainingBusinessQps" 
          :step="1" 
          style="width: 120px"
        />
        <div class="form-tip">
          可分配的最大独享业务QPS为 {{ remainingBusinessQps }}
        </div>
      </el-form-item>
      
      <el-form-item label="近源压制" prop="nearSourceSuppression">
        <el-radio-group v-model="form.nearSourceSuppression">
          <el-radio :label="true">是</el-radio>
          <el-radio :label="false">否</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item label="七层防护" prop="layer7Protection">
        <el-radio-group v-model="form.layer7Protection">
          <el-radio :label="true">是</el-radio>
          <el-radio :label="false">否</el-radio>
        </el-radio-group>
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
import { addIpProtection, updateIpProtection } from '@/services/ProtectionObjectService'

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

// 防护公网IP选项
const publicIpOptions = ref([])

// 业务实例信息
const instanceInfo = reactive({
  customerName: '',
  addressType: '',
  protectionBandwidth: 0,
  businessBandwidth: 0,
  businessQps: 0,
  allocatedProtectionBandwidth: 0,
  allocatedBusinessBandwidth: 0,
  allocatedBusinessQps: 0
})

// 计算剩余可分配的带宽和QPS
const remainingProtectionBandwidth = computed(() => {
  return instanceInfo.protectionBandwidth - instanceInfo.allocatedProtectionBandwidth
})

const remainingBusinessBandwidth = computed(() => {
  return instanceInfo.businessBandwidth - instanceInfo.allocatedBusinessBandwidth
})

const remainingBusinessQps = computed(() => {
  return instanceInfo.businessQps - instanceInfo.allocatedBusinessQps
})

// 表单数据
const form = reactive({
  instanceId: '',
  publicIp: '',
  protectionBandwidthType: 'shared',
  dedicatedProtectionBandwidth: 0,
  businessBandwidthType: 'shared',
  dedicatedBusinessBandwidth: 0,
  businessQpsType: 'shared',
  dedicatedBusinessQps: 0,
  nearSourceSuppression: false,
  layer7Protection: false
})

// 表单验证规则
const rules = reactive({
  instanceId: [
    { required: true, message: '请选择业务实例', trigger: 'change' }
  ],
  publicIp: [
    { required: true, message: '请选择防护公网IP', trigger: 'change' }
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
  ],
  businessQpsType: [
    { required: true, message: '请选择业务QPS类型', trigger: 'change' }
  ],
  dedicatedBusinessQps: [
    { 
      required: true, 
      message: '请输入独享业务QPS', 
      trigger: 'blur',
      validator: (rule, value, callback) => {
        if (form.businessQpsType === 'dedicated' && (!value || value <= 0)) {
          callback(new Error('请输入独享业务QPS'));
        } else {
          callback();
        }
      }
    },
    { 
      type: 'number', 
      min: 1, 
      message: '独享业务QPS必须大于0', 
      trigger: 'blur',
      validator: (rule, value, callback) => {
        if (form.businessQpsType === 'dedicated' && value <= 0) {
          callback(new Error('独享业务QPS必须大于0'));
        } else {
          callback();
        }
      }
    }
  ]
})

// 获取业务实例选项
const fetchInstanceOptions = async () => {
  try {
    const res = await getBusinessInstanceOptions()
    if (res.code === 200) {
      instanceOptions.value = res.data
    }
  } catch (error) {
    console.error('获取业务实例选项失败:', error)
  }
}

// 处理业务实例变更
const handleInstanceChange = async (instanceId) => {
  // 重置相关字段
  form.publicIp = ''
  publicIpOptions.value = []
  
  // 重置实例信息
  Object.assign(instanceInfo, {
    customerName: '',
    addressType: '',
    protectionBandwidth: 0,
    businessBandwidth: 0,
    businessQps: 0,
    allocatedProtectionBandwidth: 0,
    allocatedBusinessBandwidth: 0,
    allocatedBusinessQps: 0
  })
  
  if (!instanceId) return
  
  try {
    const res = await getBusinessInstanceDetail(instanceId)
    if (res.code === 200) {
      const data = res.data
      
      // 更新实例信息
      Object.assign(instanceInfo, {
        customerName: data.customerName,
        addressType: data.addressType,
        protectionBandwidth: data.protectionBandwidth,
        businessBandwidth: data.businessBandwidth,
        businessQps: data.businessQps,
        allocatedProtectionBandwidth: data.allocatedProtectionBandwidth || 0,
        allocatedBusinessBandwidth: data.allocatedBusinessBandwidth || 0,
        allocatedBusinessQps: data.allocatedBusinessQps || 0
      })
      
      // 更新防护公网IP选项
      publicIpOptions.value = (data.publicIpList || []).map(ip => ({
        label: ip,
        value: ip
      }))
      
      // 如果是编辑模式，需要把当前IP也加入选项中
      if (isEdit.value && props.editData.publicIp) {
        const exists = publicIpOptions.value.some(item => item.value === props.editData.publicIp)
        if (!exists) {
          publicIpOptions.value.push({
            label: props.editData.publicIp,
            value: props.editData.publicIp
          })
        }
      }
      
      // 设置默认值
      if (form.protectionBandwidthType === 'dedicated') {
        form.dedicatedProtectionBandwidth = Math.min(form.dedicatedProtectionBandwidth, remainingProtectionBandwidth.value)
      }
      
      if (form.businessBandwidthType === 'dedicated') {
        form.dedicatedBusinessBandwidth = Math.min(form.dedicatedBusinessBandwidth, remainingBusinessBandwidth.value)
      }
      
      if (form.businessQpsType === 'dedicated') {
        form.dedicatedBusinessQps = Math.min(form.dedicatedBusinessQps, remainingBusinessQps.value)
      }
    }
  } catch (error) {
    console.error('获取业务实例详情失败:', error)
  }
}

// 处理防护带宽类型变更
const handleProtectionBandwidthTypeChange = (type) => {
  if (type === 'dedicated') {
    form.dedicatedProtectionBandwidth = Math.min(100, remainingProtectionBandwidth.value) // 默认值
  } else {
    form.dedicatedProtectionBandwidth = 0
  }
}

// 处理业务带宽类型变更
const handleBusinessBandwidthTypeChange = (type) => {
  if (type === 'dedicated') {
    form.dedicatedBusinessBandwidth = Math.min(50, remainingBusinessBandwidth.value) // 默认值
  } else {
    form.dedicatedBusinessBandwidth = 0
  }
}

// 处理业务QPS类型变更
const handleBusinessQpsTypeChange = (type) => {
  if (type === 'dedicated') {
    form.dedicatedBusinessQps = Math.min(1000, remainingBusinessQps.value) // 默认值
  } else {
    form.dedicatedBusinessQps = 0
  }
}

// 初始化表单数据
const initFormData = () => {
  Object.assign(form, {
    instanceId: '',
    publicIp: '',
    protectionBandwidthType: 'shared',
    dedicatedProtectionBandwidth: 0,
    businessBandwidthType: 'shared',
    dedicatedBusinessBandwidth: 0,
    businessQpsType: 'shared',
    dedicatedBusinessQps: 0,
    nearSourceSuppression: false,
    layer7Protection: false
  })
  
  Object.assign(instanceInfo, {
    customerName: '',
    addressType: '',
    protectionBandwidth: 0,
    businessBandwidth: 0,
    businessQps: 0,
    allocatedProtectionBandwidth: 0,
    allocatedBusinessBandwidth: 0,
    allocatedBusinessQps: 0
  })
  
  publicIpOptions.value = []
  
  // 如果是编辑模式，填充表单数据
  if (isEdit.value && props.editData) {
    const editData = props.editData
    
    form.instanceId = editData.instanceId
    form.publicIp = editData.publicIp
    
    // 防护带宽
    form.protectionBandwidthType = editData.protectionBandwidthType || 'shared'
    form.dedicatedProtectionBandwidth = editData.dedicatedProtectionBandwidth || 0
    
    // 业务带宽
    form.businessBandwidthType = editData.businessBandwidthType || 'shared'
    form.dedicatedBusinessBandwidth = editData.dedicatedBusinessBandwidth || 0
    
    // 业务QPS
    form.businessQpsType = editData.businessQpsType || 'shared'
    form.dedicatedBusinessQps = editData.dedicatedBusinessQps || 0
    
    // 其他选项
    form.nearSourceSuppression = editData.nearSourceSuppression || false
    form.layer7Protection = editData.layer7Protection || false
    
    // 加载业务实例详情
    handleInstanceChange(form.instanceId)
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    loading.value = true
    
    // 构建提交数据
    const submitData = {
      instanceId: form.instanceId,
      publicIp: form.publicIp,
      protectionBandwidthType: form.protectionBandwidthType,
      dedicatedProtectionBandwidth: form.protectionBandwidthType === 'dedicated' ? form.dedicatedProtectionBandwidth : 0,
      businessBandwidthType: form.businessBandwidthType,
      dedicatedBusinessBandwidth: form.businessBandwidthType === 'dedicated' ? form.dedicatedBusinessBandwidth : 0,
      businessQpsType: form.businessQpsType,
      dedicatedBusinessQps: form.businessQpsType === 'dedicated' ? form.dedicatedBusinessQps : 0,
      nearSourceSuppression: form.nearSourceSuppression,
      layer7Protection: form.layer7Protection
    }
    
    // 如果是编辑模式，需要传入ID
    if (isEdit.value && props.editData) {
      submitData.id = props.editData.id
    }
    
    // 调用API
    const res = isEdit.value
      ? await updateIpProtection(submitData)
      : await addIpProtection(submitData)
    
    if (res.code === 200) {
      ElMessage.success(isEdit.value ? '编辑成功' : '添加成功')
      emit('success')
      dialogVisible.value = false
    } else {
      ElMessage.error(res.message || (isEdit.value ? '编辑失败' : '添加失败'))
    }
  } catch (error) {
    console.error(isEdit.value ? '编辑IP防护对象失败:' : '添加IP防护对象失败:', error)
    ElMessage.error('表单验证失败，请检查输入')
  } finally {
    loading.value = false
  }
}

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
}

// 监听对话框可见性变化
watch(() => dialogVisible.value, (val) => {
  if (val) {
    fetchInstanceOptions()
    initFormData()
  }
})
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
</style> 