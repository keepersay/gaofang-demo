<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '修改业务实例' : '新增业务实例'"
    width="60%"
    destroy-on-close
  >
    <el-steps :active="active" finish-status="success" simple style="margin-bottom: 20px">
      <el-step title="基本信息" />
      <el-step title="部署配置" />
      <el-step title="防护选项" />
      <el-step title="资源配置" />
      <el-step title="状态与备注" />
    </el-steps>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
      style="max-height: 500px; overflow-y: auto"
    >
      <!-- 步骤1：基本信息 -->
      <div v-show="active === 0">
        <el-form-item label="业务实例名称" prop="instanceName">
          <el-input v-model="form.instanceName" placeholder="请输入业务实例名称" />
        </el-form-item>
        <el-form-item label="客户" prop="customerId">
          <el-select 
            v-model="form.customerId" 
            placeholder="请选择客户" 
            filterable 
            style="width: 100%"
            @change="handleCustomerChange"
          >
            <el-option
              v-for="item in customerOptions"
              :key="item.customerId"
              :label="item.customerName"
              :value="item.customerId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关联订单" prop="orderId">
          <el-select 
            v-model="form.orderId" 
            placeholder="请选择关联订单" 
            filterable 
            style="width: 100%"
            :disabled="!form.customerId"
            @change="handleOrderChange"
          >
            <el-option
              v-for="item in orderOptions"
              :key="item.orderId"
              :label="item.orderId"
              :value="item.orderId"
            >
              <div>
                <div>{{ item.orderId }}</div>
                <small style="color: #999">{{ item.packageName }}</small>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
      </div>

      <!-- 步骤2：部署配置 -->
      <div v-show="active === 1">
        <el-form-item label="Anycast" prop="isAnycast">
          <el-switch v-model="form.isAnycast" />
        </el-form-item>
        <el-form-item label="地址类型" prop="addressType">
          <el-radio-group v-model="form.addressType">
            <el-radio label="IPv4">IPv4</el-radio>
            <el-radio label="IPv6">IPv6</el-radio>
            <el-radio label="dual">双栈</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="地域" prop="regionId" v-if="!form.isAnycast">
          <el-select v-model="form.regionId" placeholder="请选择地域" style="width: 100%">
            <el-option
              v-for="item in regionOptions"
              :key="item.regionId"
              :label="item.regionName"
              :value="item.regionId"
            />
          </el-select>
        </el-form-item>
      </div>

      <!-- 步骤3：防护选项 -->
      <div v-show="active === 2">
        <el-alert
          title="防护配置与套餐对应关系"
          type="info"
          description="ADS防护 -> DDOS防护；ADS防护+CC防护 -> WAF标准防护；ADS防护+CC防护+WAF防护 -> WAF增强防护"
          :closable="false"
          style="margin-bottom: 20px;"
        />

        <el-form-item label="套餐选择" prop="packageType">
          <el-radio-group v-model="form.packageType" @change="handlePackageTypeChange">
            <el-radio :label="1">DDOS防护（仅ADS防护）</el-radio>
            <el-radio :label="2">WAF标准防护（ADS+CC防护）</el-radio>
            <el-radio :label="3">WAF增强防护（ADS+CC+WAF防护）</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="防护内容">
          <el-tag v-if="form.adsProtection" type="success" style="margin-right: 5px">ADS防护</el-tag>
          <el-tag v-if="form.ccProtection" type="warning" style="margin-right: 5px">CC防护</el-tag>
          <el-tag v-if="form.wafProtection" type="danger">WAF防护</el-tag>
        </el-form-item>
      </div>

      <!-- 步骤4：资源配置 -->
      <div v-show="active === 3">
        <el-form-item label="带宽(Mbps)" prop="bandwidth">
          <el-input-number v-model="form.bandwidth" :min="1" :max="10000" />
        </el-form-item>
        <el-form-item label="QPS" prop="qps">
          <el-input-number v-model="form.qps" :min="1" :max="100000" />
        </el-form-item>
        <el-form-item label="IP数量" prop="protectionIpCount">
          <el-input-number v-model="form.protectionIpCount" :min="1" :max="100" />
        </el-form-item>
        <el-form-item label="域名数量" prop="domainCount">
          <el-input-number v-model="form.domainCount" :min="1" :max="1000" />
        </el-form-item>
        <el-form-item label="端口数量" prop="portCount">
          <el-input-number v-model="form.portCount" :min="1" :max="100" />
        </el-form-item>
      </div>

      <!-- 步骤5：状态与备注 -->
      <div v-show="active === 4">
        <el-form-item label="实例状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="4"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </div>
    </el-form>

    <div style="margin-top: 20px; display: flex; justify-content: space-between;">
      <div>
        <el-button @click="handlePrev" v-if="active > 0">上一步</el-button>
      </div>
      <div>
        <el-button @click="handleCancel">取消</el-button>
        <el-button v-if="active < 4" type="primary" @click="handleNext">下一步</el-button>
        <el-button v-else type="primary" @click="handleSubmit">提交</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import BusinessInstanceService from '../../services/BusinessInstanceService'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  instanceData: {
    type: Object,
    default: null
  },
  isEdit: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

// 对话框可见性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 表单引用
const formRef = ref(null)

// 步骤
const active = ref(0)

// 表单数据
const form = reactive({
  instanceName: '',
  customerId: '',
  customerName: '',
  orderId: '',
  packageId: '',
  packageName: '',
  packageType: 1, // 1: DDOS防护, 2: WAF标准防护, 3: WAF增强防护
  isAnycast: false,
  addressType: 'IPv4',
  regionId: '',
  adsProtection: true, // 默认开启ADS防护
  ccProtection: false,
  wafProtection: false,
  bandwidth: 100,
  qps: 1000,
  protectionIpCount: 1,
  domainCount: 10,
  portCount: 10,
  status: 'active',
  remark: ''
})

// 表单验证规则
const rules = {
  instanceName: [
    { required: true, message: '请输入业务实例名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  customerId: [
    { required: true, message: '请选择客户', trigger: 'change' }
  ],
  orderId: [
    { required: true, message: '请选择关联订单', trigger: 'change' }
  ],
  addressType: [
    { required: true, message: '请选择地址类型', trigger: 'change' }
  ],
  regionId: [
    { required: true, message: '请选择地域', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择实例状态', trigger: 'change' }
  ]
}

// 选项数据
const customerOptions = ref([])
const orderOptions = ref([])
const regionOptions = ref([])

// 重置表单
const resetForm = () => {
  form.instanceName = ''
  form.customerId = ''
  form.customerName = ''
  form.orderId = ''
  form.packageId = ''
  form.packageName = ''
  form.packageType = 1
  form.isAnycast = false
  form.addressType = 'IPv4'
  form.regionId = ''
  form.adsProtection = true
  form.ccProtection = false
  form.wafProtection = false
  form.bandwidth = 100
  form.qps = 1000
  form.protectionIpCount = 1
  form.domainCount = 10
  form.portCount = 10
  form.status = 'active'
  form.remark = ''
}

// 监听实例数据变化
watch(() => props.instanceData, (val) => {
  if (val) {
    Object.keys(form).forEach(key => {
      if (val[key] !== undefined) {
        form[key] = val[key]
      }
    })
    
    // 根据套餐名称设置防护选项
    if (val.packageName) {
      if (val.packageName === 'DDOS防护') {
        form.adsProtection = true;
        form.ccProtection = false;
        form.wafProtection = false;
        form.packageType = 1;
      } else if (val.packageName === 'WAF标准防护') {
        form.adsProtection = true;
        form.ccProtection = true;
        form.wafProtection = false;
        form.packageType = 2;
      } else if (val.packageName === 'WAF增强防护') {
        form.adsProtection = true;
        form.ccProtection = true;
        form.wafProtection = true;
        form.packageType = 3;
      }
    }
    
    // 加载关联数据
    fetchOrderOptions()
  } else {
    resetForm()
  }
}, { immediate: true, deep: true })

// 监听对话框可见性
watch(() => dialogVisible.value, (val) => {
  if (val) {
    active.value = 0
    nextTick(() => {
      fetchCustomerOptions()
      fetchRegionOptions()
    })
  }
})

// 获取客户选项
const fetchCustomerOptions = async () => {
  try {
    // 模拟数据，实际项目中应该从API获取
    customerOptions.value = [
      { customerId: 'CUST1001', customerName: '北京科技有限公司' },
      { customerId: 'CUST1002', customerName: '上海网络科技有限公司' },
      { customerId: 'CUST1003', customerName: '广州信息技术有限公司' },
      { customerId: 'CUST1004', customerName: '深圳互联网有限公司' },
      { customerId: 'CUST1005', customerName: '杭州数字科技有限公司' }
    ]
  } catch (error) {
    console.error('获取客户列表失败:', error)
  }
}

// 获取订单选项
const fetchOrderOptions = async () => {
  try {
    const params = new URLSearchParams()
    if (form.customerId) {
      params.append('customerId', form.customerId)
    }
    
    const result = await BusinessInstanceService.getAvailableOrders({
      customerId: form.customerId
    })
    
    if (result.code === 200) {
      orderOptions.value = result.data
    }
  } catch (error) {
    console.error('获取订单列表失败:', error)
  }
}

// 获取地域选项
const fetchRegionOptions = async () => {
  try {
    // 模拟数据，实际项目中应该从API获取
    regionOptions.value = [
      { regionId: 'cn-beijing', regionName: '华北-北京' },
      { regionId: 'cn-shanghai', regionName: '华东-上海' },
      { regionId: 'cn-guangzhou', regionName: '华南-广州' },
      { regionId: 'cn-hangzhou', regionName: '华东-杭州' },
      { regionId: 'cn-shenzhen', regionName: '华南-深圳' }
    ]
  } catch (error) {
    console.error('获取地域列表失败:', error)
  }
}

// 客户变更处理
const handleCustomerChange = (val) => {
  form.orderId = ''
  const customer = customerOptions.value.find(item => item.customerId === val)
  if (customer) {
    form.customerName = customer.customerName
  }
  fetchOrderOptions()
}

// 订单变更处理
const handleOrderChange = (val) => {
  const order = orderOptions.value.find(item => item.orderId === val)
  if (order) {
    form.packageName = order.packageName
    
    // 根据套餐名称设置对应的防护选项和套餐类型
    if (order.packageName === 'DDOS防护') {
      form.packageType = 1;
      form.adsProtection = true;
      form.ccProtection = false;
      form.wafProtection = false;
    } else if (order.packageName === 'WAF标准防护') {
      form.packageType = 2;
      form.adsProtection = true;
      form.ccProtection = true;
      form.wafProtection = false;
    } else if (order.packageName === 'WAF增强防护') {
      form.packageType = 3;
      form.adsProtection = true;
      form.ccProtection = true;
      form.wafProtection = true;
    }
  }
}

// 上一步
const handlePrev = () => {
  if (active.value > 0) {
    active.value--
  }
}

// 下一步
const handleNext = async () => {
  if (active.value === 0) {
    // 验证第一步表单
    try {
      await formRef.value.validateField(['instanceName', 'customerId', 'orderId'])
      active.value++
    } catch (error) {
      console.error(error)
    }
  } else if (active.value === 1) {
    // 验证第二步表单
    try {
      await formRef.value.validateField(['addressType'])
      if (!form.isAnycast) {
        await formRef.value.validateField(['regionId'])
      }
      active.value++
    } catch (error) {
      console.error(error)
    }
  } else if (active.value < 4) {
    active.value++
  }
}

// 取消
const handleCancel = () => {
  dialogVisible.value = false
  resetForm()
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    // 构建提交数据
    const submitData = {
      ...form
    }
    
    // 根据防护选项选择套餐名称
    if (form.wafProtection && form.ccProtection && form.adsProtection) {
      submitData.packageName = 'WAF增强防护';
    } else if (form.ccProtection && form.adsProtection) {
      submitData.packageName = 'WAF标准防护';
    } else {
      submitData.packageName = 'DDOS防护';  // 默认或只有ADS防护时
    }
    
    // 如果是Anycast，清空地域ID
    if (submitData.isAnycast) {
      submitData.regionId = ''
    }
    
    // 使用服务
    let result
    if (props.isEdit) {
      result = await BusinessInstanceService.updateBusinessInstance(props.instanceData.instanceId, submitData)
    } else {
      result = await BusinessInstanceService.createBusinessInstance(submitData)
    }
    
    if (result.code === 200) {
      ElMessage.success(props.isEdit ? '修改成功' : '创建成功')
      dialogVisible.value = false
      emit('success')
    } else {
      ElMessage.error(result.message || (props.isEdit ? '修改失败' : '创建失败'))
    }
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 处理套餐类型变更
const handlePackageTypeChange = (val) => {
  if (val === 1) {
    // DDOS防护
    form.adsProtection = true;
    form.ccProtection = false;
    form.wafProtection = false;
  } else if (val === 2) {
    // WAF标准防护
    form.adsProtection = true;
    form.ccProtection = true;
    form.wafProtection = false;
  } else if (val === 3) {
    // WAF增强防护
    form.adsProtection = true;
    form.ccProtection = true;
    form.wafProtection = true;
  }
}
</script>

<style scoped>
.el-step {
  cursor: pointer;
}
</style> 