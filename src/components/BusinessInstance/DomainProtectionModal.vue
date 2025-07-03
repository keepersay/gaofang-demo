<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑域名防护对象' : '新增域名防护对象'"
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
      
      <el-form-item label="接入方式" prop="accessType">
        <el-radio-group v-model="form.accessType">
          <el-radio label="domain">域名接入</el-radio>
          <el-radio label="port">端口接入</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item label="防护公网IP" prop="publicIp">
        <el-select 
          v-model="form.publicIp" 
          placeholder="请选择防护公网IP" 
          style="width: 100%"
          :disabled="!form.instanceId"
          @change="handlePublicIpChange"
        >
          <el-option
            v-for="item in publicIpOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="地址类型">
        <el-input v-model="form.addressType" disabled />
      </el-form-item>
      
      <el-form-item label="防护域名" prop="domain">
        <el-input 
          v-model="form.domain" 
          placeholder="请输入需要防护的域名，如example.com" 
          @input="generateCname"
        />
      </el-form-item>

      <el-form-item label="防护CNAME">
        <el-input v-model="form.cname" disabled />
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
          :max="remainingBusinessQps || 1" 
          :step="100" 
          style="width: 120px"
        />
        <div class="form-tip">
          可分配的最大独享业务QPS为 {{ remainingBusinessQps || 0 }}
        </div>
      </el-form-item>

      <el-form-item label="防护套餐" prop="protectionPackage">
        <el-radio-group v-model="form.protectionPackage">
          <el-radio :label="'standard'">WAF标准防护</el-radio>
          <el-radio :label="'enhanced'">WAF增强防护</el-radio>
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
import { addDomainProtection, updateDomainProtection } from '@/services/ProtectionObjectService'

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
  businessQps: 0,
  allocatedBusinessQps: 0
})

// 计算剩余可分配的QPS
const remainingBusinessQps = computed(() => {
  return Math.max(0, instanceInfo.businessQps - instanceInfo.allocatedBusinessQps)
})

// 表单数据
const form = reactive({
  instanceId: '',
  accessType: 'domain',
  publicIp: '',
  addressType: '',
  domain: '',
  cname: '',
  businessQpsType: 'shared',
  dedicatedBusinessQps: 0,
  protectionPackage: 'standard'
})

// 表单验证规则
const rules = reactive({
  instanceId: [
    { required: true, message: '请选择业务实例', trigger: 'change' }
  ],
  accessType: [
    { required: true, message: '请选择接入方式', trigger: 'change' }
  ],
  publicIp: [
    { required: true, message: '请选择防护公网IP', trigger: 'change' }
  ],
  domain: [
    { required: true, message: '请输入防护域名', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/, message: '请输入有效的域名', trigger: 'blur' }
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

// 获取业务实例选项
const fetchInstanceOptions = async () => {
  try {
    const res = await getBusinessInstanceOptions()
    if (res.code === 200) {
      instanceOptions.value = res.data
    } else {
      ElMessage.error(res.message || '获取业务实例选项失败')
    }
  } catch (error) {
    console.error('获取业务实例选项失败:', error)
    ElMessage.error('获取业务实例选项失败')
  }
}

// 初始化表单数据
const initFormData = () => {
  // 重置表单
  Object.assign(form, {
    instanceId: '',
    accessType: 'domain',
    publicIp: '',
    addressType: '',
    domain: '',
    cname: '',
    businessQpsType: 'shared',
    dedicatedBusinessQps: 0,
    protectionPackage: 'standard'
  })

  // 重置实例信息
  Object.assign(instanceInfo, {
    customerName: '',
    businessQps: 0,
    allocatedBusinessQps: 0
  })

  publicIpOptions.value = []

  // 如果是编辑模式，填充表单数据
  if (isEdit.value && props.editData) {
    const editData = props.editData

    // 填充基础表单数据
    Object.assign(form, {
      instanceId: editData.instanceId,
      accessType: editData.accessType || 'domain',
      publicIp: editData.publicIp,
      addressType: editData.addressType,
      domain: editData.domain,
      cname: editData.cname,
      businessQpsType: editData.businessQpsType || 'shared',
      dedicatedBusinessQps: editData.dedicatedBusinessQps || 0,
      protectionPackage: editData.protectionPackage || 'standard'
    })
    
    // 先将当前使用的IP添加到选项中
    if (editData.publicIp) {
      publicIpOptions.value = [{
        label: editData.publicIp,
        value: editData.publicIp
      }];
    }

    // 获取业务实例详情
    handleInstanceChange(editData.instanceId)
  }
}

// 处理业务实例变更
const handleInstanceChange = async (instanceId) => {
  // 保存当前选中的IP，以便在获取新的IP列表后能恢复选择
  const currentIp = form.publicIp
  
  // 重置相关字段
  form.publicIp = ''
  publicIpOptions.value = []
  form.addressType = ''
  
  // 重置实例信息
  Object.assign(instanceInfo, {
    customerName: '',
    businessQps: 0,
    allocatedBusinessQps: 0
  })
  
  if (!instanceId) return
  
  try {
    // 处理业务实例ID格式，如果是字符串格式（如BI10001），则提取数字部分
    const numericId = instanceId.toString().replace(/\D/g, '')
    
    const res = await getBusinessInstanceDetail(numericId)
    if (res.code === 200) {
      const data = res.data
      
      // 更新实例信息
      Object.assign(instanceInfo, {
        customerName: data.customerName,
        businessQps: data.businessQps,
        allocatedBusinessQps: data.allocatedBusinessQps || 0
      })
      
      // 更新防护公网IP选项
      publicIpOptions.value = (data.publicIpList || []).map(ip => ({
        label: ip,
        value: ip
      }))
      
      // 如果是编辑模式，需要把当前IP也加入选项中
      if (isEdit.value && props.editData && props.editData.publicIp) {
        const exists = publicIpOptions.value.some(item => item.value === props.editData.publicIp)
        if (!exists) {
          publicIpOptions.value.push({
            label: props.editData.publicIp,
            value: props.editData.publicIp
          })
        }
        
        // 如果是编辑模式，设置当前IP为已有IP
        form.publicIp = props.editData.publicIp
        handlePublicIpChange(form.publicIp)
      } else if (currentIp) {
        // 如果有保存的当前IP，则恢复选择
        form.publicIp = currentIp
        handlePublicIpChange(form.publicIp)
      }
      
      // 设置默认值
      if (form.businessQpsType === 'dedicated') {
        form.dedicatedBusinessQps = Math.min(form.dedicatedBusinessQps, remainingBusinessQps.value)
      }
    } else {
      ElMessage.error(res.message || '获取业务实例详情失败')
      
      // 如果是编辑模式且获取详情失败，则使用编辑数据填充一些基本信息
      if (isEdit.value && props.editData) {
        instanceInfo.customerName = props.editData.customerName || '未知客户';
        
        // 为公网IP选项添加当前IP
        if (props.editData.publicIp) {
          publicIpOptions.value = [{
            label: props.editData.publicIp,
            value: props.editData.publicIp
          }];
          form.publicIp = props.editData.publicIp;
          form.addressType = props.editData.addressType || (props.editData.publicIp.includes(':') ? 'IPv6' : 'IPv4');
        }
        
        // 设置一些默认值
        instanceInfo.businessQps = props.editData.instanceBusinessQps || 5000;
      }
    }
  } catch (error) {
    console.error('获取业务实例详情失败:', error)
    ElMessage.error('获取业务实例详情失败')
    
    // 如果是编辑模式且发生异常，则使用编辑数据填充一些基本信息
    if (isEdit.value && props.editData) {
      instanceInfo.customerName = props.editData.customerName || '未知客户';
      
      // 为公网IP选项添加当前IP
      if (props.editData.publicIp) {
        publicIpOptions.value = [{
          label: props.editData.publicIp,
          value: props.editData.publicIp
        }];
        form.publicIp = props.editData.publicIp;
        form.addressType = props.editData.addressType || (props.editData.publicIp.includes(':') ? 'IPv6' : 'IPv4');
      }
      
      // 设置一些默认值
      instanceInfo.businessQps = props.editData.instanceBusinessQps || 5000;
    }
  }
}

// 处理公网IP变更
const handlePublicIpChange = (ip) => {
  if (ip) {
    // 根据IP判断地址类型
    form.addressType = ip.includes(':') ? 'IPv6' : 'IPv4'
  } else {
    form.addressType = ''
  }
}

// 生成CNAME
const generateCname = () => {
  if (form.domain) {
    form.cname = `${form.domain}.vmdat.com`
  } else {
    form.cname = ''
  }
}

// 处理业务QPS类型变更
const handleBusinessQpsTypeChange = (type) => {
  if (type === 'shared') {
    form.dedicatedBusinessQps = 0
  } else {
    form.dedicatedBusinessQps = Math.min(1000, Math.max(1, remainingBusinessQps.value || 1))
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
      accessType: form.accessType,
      publicIp: form.publicIp,
      addressType: form.addressType,
      domain: form.domain,
      cname: form.cname,
      businessQpsType: form.businessQpsType,
      dedicatedBusinessQps: form.businessQpsType === 'dedicated' ? form.dedicatedBusinessQps : 0,
      protectionPackage: form.protectionPackage
    }
    
    // 如果是编辑模式，需要传入ID
    if (isEdit.value && props.editData) {
      submitData.id = props.editData.id
    }
    
    // 调用API
    const res = isEdit.value
      ? await updateDomainProtection(submitData)
      : await addDomainProtection(submitData)
    
    if (res.code === 200) {
      ElMessage.success(isEdit.value ? '编辑成功' : '添加成功')
      emit('success')
      dialogVisible.value = false
    } else {
      ElMessage.error(res.message || (isEdit.value ? '编辑失败' : '添加失败'))
    }
  } catch (error) {
    console.error(isEdit.value ? '编辑域名防护对象失败:' : '添加域名防护对象失败:', error)
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

.unit {
  margin-left: 10px;
  color: #606266;
}
</style> 