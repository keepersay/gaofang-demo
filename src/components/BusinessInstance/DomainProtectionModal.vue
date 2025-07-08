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
      
      <el-form-item label="IPv4防护IP组" prop="ipv4GroupId">
        <el-select 
          v-model="form.ipv4GroupId" 
          placeholder="请选择IPv4防护IP组" 
          style="width: 100%"
          :disabled="!form.instanceId"
          clearable
          @change="handleIpGroupChange"
        >
          <el-option
            v-for="item in ipv4GroupOptions"
            :key="item.groupId"
            :label="item.displayName"
            :value="item.groupId"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="IPv6防护IP组" prop="ipv6GroupId">
        <el-select 
          v-model="form.ipv6GroupId" 
          placeholder="请选择IPv6防护IP组" 
          style="width: 100%"
          :disabled="!form.instanceId"
          clearable
          @change="handleIpGroupChange"
        >
          <el-option
            v-for="item in ipv6GroupOptions"
            :key="item.groupId"
            :label="item.displayName"
            :value="item.groupId"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="地址类型">
        <el-tag :type="getAddressTypeTagType(form.addressType)">
          {{ form.addressType }}
        </el-tag>
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
          <el-radio value="standard">WAF标准防护</el-radio>
          <el-radio value="enhanced">WAF增强防护</el-radio>
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
const ipv4GroupOptions = ref([])
const ipv6GroupOptions = ref([])

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
  ipv4GroupId: '',
  ipv6GroupId: '',
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
  ipv4GroupId: [
    { 
      validator: (rule, value, callback) => {
        if (!value && !form.ipv6GroupId) {
          callback(new Error('IPv4防护IP组和IPv6防护IP组至少选择一个'));
        } else {
          callback();
        }
      }, 
      trigger: 'change' 
    }
  ],
  ipv6GroupId: [
    { 
      validator: (rule, value, callback) => {
        if (!value && !form.ipv4GroupId) {
          callback(new Error('IPv4防护IP组和IPv6防护IP组至少选择一个'));
        } else {
          callback();
        }
      }, 
      trigger: 'change' 
    }
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
    ipv4GroupId: '',
    ipv6GroupId: '',
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
  ipv4GroupOptions.value = []
  ipv6GroupOptions.value = []

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
      ipv4GroupId: editData.ipv4GroupId || '',
      ipv6GroupId: editData.ipv6GroupId || '',
      addressType: editData.addressType || '',
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
  form.ipv4GroupId = ''
  form.ipv6GroupId = ''
  form.addressType = ''
  protectionIpGroupOptions.value = []
  ipv4GroupOptions.value = []
  ipv6GroupOptions.value = []
  
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
          protectionIpGroupOptions.value = ipGroupsRes.data.map(group => ({
            groupId: group.groupId,
            displayName: group.displayName,
            addressType: group.addressType
          }))
          
          // 分类IPv4和IPv6组
          ipv4GroupOptions.value = protectionIpGroupOptions.value.filter(item => item.addressType === 'IPv4')
          ipv6GroupOptions.value = protectionIpGroupOptions.value.filter(item => item.addressType === 'IPv6')
          
          // 如果是编辑模式且有ipv4GroupId/ipv6GroupId，确保该选项在列表中
          if (isEdit.value && props.editData) {
            if (props.editData.ipv4GroupId) {
              const existsIpv4 = ipv4GroupOptions.value.some(item => 
                item.groupId === props.editData.ipv4GroupId
              )
              
              if (!existsIpv4 && props.editData.ipv4GroupId) {
                // 如果当前选中的IPv4组不在列表中，添加一个临时选项
                ipv4GroupOptions.value.push({
                  groupId: props.editData.ipv4GroupId,
                  displayName: `IPv4组 #${props.editData.ipv4GroupId.slice(-5)}`,
                  addressType: 'IPv4'
                })
              }
              
              // 设置当前IPv4组
              form.ipv4GroupId = props.editData.ipv4GroupId
            }
            
            if (props.editData.ipv6GroupId) {
              const existsIpv6 = ipv6GroupOptions.value.some(item => 
                item.groupId === props.editData.ipv6GroupId
              )
              
              if (!existsIpv6 && props.editData.ipv6GroupId) {
                // 如果当前选中的IPv6组不在列表中，添加一个临时选项
                ipv6GroupOptions.value.push({
                  groupId: props.editData.ipv6GroupId,
                  displayName: `IPv6组 #${props.editData.ipv6GroupId.slice(-5)}`,
                  addressType: 'IPv6'
                })
              }
              
              // 设置当前IPv6组
              form.ipv6GroupId = props.editData.ipv6GroupId
            }
            
            // 更新地址类型
            handleIpGroupChange()
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
const handleIpGroupChange = () => {
  // 根据选择的IP组更新地址类型
  if (form.ipv4GroupId && form.ipv6GroupId) {
    form.addressType = '双栈'
  } else if (form.ipv4GroupId) {
    form.addressType = 'IPv4'
  } else if (form.ipv6GroupId) {
    form.addressType = 'IPv6'
  } else {
    form.addressType = ''
  }
  
  // 更新CNAME
  generateCname()
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

// 获取地址类型标签类型
const getAddressTypeTagType = (type) => {
  const types = {
    'IPv4': 'primary',
    'IPv6': 'success',
    '双栈': 'warning'
  }
  return types[type] || 'info'
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
      ipv4GroupId: form.ipv4GroupId,
      ipv6GroupId: form.ipv6GroupId,
      addressType: form.addressType,
      domain: form.domain,
      businessQpsType: form.businessQpsType,
      dedicatedBusinessQps: form.businessQpsType === 'dedicated' ? form.dedicatedBusinessQps : 0,
      protectionPackage: form.protectionPackage
    }
    
    // 如果是编辑模式，添加ID字段
    if (isEdit.value && props.editData) {
      submitData.id = props.editData.id
    }
    
    // 调用接口
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
    console.error('表单提交失败:', error)
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