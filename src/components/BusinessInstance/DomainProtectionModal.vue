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
          <el-radio value="domain">域名接入</el-radio>
          <el-radio value="port">端口接入</el-radio>
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
            v-for="item in protectionIpGroupOptions"
            :key="item.groupId"
            :label="item.displayName"
            :value="item.groupId"
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
          <el-radio value="shared">共享</el-radio>
          <el-radio value="dedicated">独享</el-radio>
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
import { addDomainProtection, updateDomainProtection, getInstanceAllocatedIpGroups, getIpGroupDetail } from '@/services/ProtectionObjectService'

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

// 防护IP组选项
const protectionIpGroupOptions = ref([])

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
  protectionIpGroupId: '',
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
    protectionIpGroupId: '',
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

  protectionIpGroupOptions.value = []

  // 如果是编辑模式，填充表单数据
  if (isEdit.value && props.editData) {
    const editData = props.editData

    // 确保instanceId格式正确
    const formattedInstanceId = editData.instanceId.toString().startsWith('BI') 
      ? editData.instanceId 
      : `BI${editData.instanceId}`;

    // 填充基础表单数据
    Object.assign(form, {
      instanceId: formattedInstanceId,
      accessType: editData.accessType || 'domain',
      protectionIpGroupId: editData.protectionIpGroupId,
      addressType: editData.addressType,
      domain: editData.domain,
      cname: editData.cname,
      businessQpsType: editData.businessQpsType || 'shared',
      dedicatedBusinessQps: editData.dedicatedBusinessQps || 0,
      protectionPackage: editData.protectionPackage || 'standard'
    })

    // 获取业务实例详情
    handleInstanceChange(formattedInstanceId)
  }
}

// 处理业务实例变更
const handleInstanceChange = async (instanceId) => {
  // 重置相关字段
  form.protectionIpGroupId = ''
  form.addressType = ''
  protectionIpGroupOptions.value = []
  
  // 重置实例信息
  Object.assign(instanceInfo, {
    customerName: '',
    businessQps: 0,
    allocatedBusinessQps: 0
  })
  
  if (!instanceId) return
  
  try {
    loading.value = true
    console.log(`处理业务实例变更，原始ID: ${instanceId}`);
    
    // 确保instanceId格式正确，如果是纯数字，则添加BI前缀
    const formattedInstanceId = instanceId.toString().startsWith('BI') 
      ? instanceId 
      : `BI${instanceId}`;
      
    console.log(`格式化后的业务实例ID: ${formattedInstanceId}`);
    
    // 获取业务实例详情
    const res = await getBusinessInstanceDetail(formattedInstanceId)
    if (res.code === 200) {
      const data = res.data
      
      // 更新实例信息
      Object.assign(instanceInfo, {
        customerName: data.customerName,
        businessQps: data.businessQps,
        allocatedBusinessQps: data.allocatedBusinessQps || 0
      })
      
      // 获取业务实例已分配的防护IP组
      try {
        const ipGroupsRes = await getInstanceAllocatedIpGroups(formattedInstanceId)
        if (ipGroupsRes.code === 200) {
          protectionIpGroupOptions.value = ipGroupsRes.data
          
          // 如果是编辑模式且有protectionIpGroupId，确保该选项在列表中
          if (isEdit.value && props.editData && props.editData.protectionIpGroupId) {
            const exists = protectionIpGroupOptions.value.some(item => 
              item.groupId === props.editData.protectionIpGroupId
            )
            
            if (!exists && props.editData.protectionIpGroupId) {
              // 如果当前选中的IP组不在列表中，添加一个临时选项
              protectionIpGroupOptions.value.push({
                groupId: props.editData.protectionIpGroupId,
                displayName: `防护IP组 #${props.editData.protectionIpGroupId.slice(-5)}`
              })
            }
            
            // 设置当前IP组
            form.protectionIpGroupId = props.editData.protectionIpGroupId
            // 获取IP组详情
            await handleIpGroupChange(form.protectionIpGroupId)
          }
          
          // 如果只有一个IP组选项，自动选择
          if (protectionIpGroupOptions.value.length === 1 && !form.protectionIpGroupId) {
            form.protectionIpGroupId = protectionIpGroupOptions.value[0].groupId
            await handleIpGroupChange(form.protectionIpGroupId)
          }
        } else {
          ElMessage.error(ipGroupsRes.message || '获取防护IP组列表失败')
        }
      } catch (error) {
        console.error('获取防护IP组列表失败:', error)
        ElMessage.error('获取防护IP组列表失败')
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
      
      // 设置一些默认值
      instanceInfo.businessQps = props.editData.instanceBusinessQps || 5000;
    }
  } finally {
    loading.value = false
  }
}

// 处理IP组变更
const handleIpGroupChange = async (groupId) => {
  if (!groupId) {
    form.addressType = ''
    return
  }
  
  try {
    // 先从选项中查找
    const ipGroup = protectionIpGroupOptions.value.find(item => item.groupId === groupId)
    
    if (ipGroup) {
      // 设置地址类型
      form.addressType = ipGroup.addressType || 'IPv4'
    } else {
      // 如果没有找到，从服务器获取详情
      const res = await getIpGroupDetail(groupId)
      if (res.code === 200) {
        form.addressType = res.data.addressType || 'IPv4'
      } else {
        form.addressType = 'IPv4' // 默认值
      }
    }
  } catch (error) {
    console.error('获取IP组详情失败:', error)
    form.addressType = 'IPv4' // 出错时使用默认值
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
      protectionIpGroupId: form.protectionIpGroupId,
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
      // 处理服务器返回的详细错误信息
      if (res.errors) {
        // 如果有详细的错误信息，显示第一个错误
        const firstErrorField = Object.keys(res.errors)[0];
        const firstError = res.errors[firstErrorField][0];
        ElMessage.error(`${firstErrorField}: ${firstError}`);
        
        // 如果是表单字段的错误，标记对应字段为错误状态
        if (formRef.value && formRef.value.fields[firstErrorField]) {
          formRef.value.fields[firstErrorField].validateMessage = firstError;
          formRef.value.fields[firstErrorField].validateState = 'error';
        }
      } else {
        ElMessage.error(res.message || (isEdit.value ? '编辑失败' : '添加失败'));
      }
    }
  } catch (error) {
    console.error(isEdit.value ? '编辑域名防护对象失败:' : '添加域名防护对象失败:', error);
    
    // 检查是否是表单验证错误
    if (error.fields) {
      // 表单验证失败，显示第一个错误
      const firstField = Object.keys(error.fields)[0];
      ElMessage.error(`表单验证失败: ${error.fields[firstField][0].message}`);
    } else {
      ElMessage.error('表单验证失败，请检查输入');
    }
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