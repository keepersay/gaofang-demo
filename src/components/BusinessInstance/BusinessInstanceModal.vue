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
        <el-form-item label="集群类型" prop="clusterType">
          <el-radio-group v-model="form.clusterType" @change="handleClusterTypeChange">
            <el-radio value="standby">主备</el-radio>
            <el-radio value="distributed">分布式</el-radio>
            <el-radio value="anycast">Anycast</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="地址类型" prop="addressType">
          <el-radio-group v-model="form.addressType">
            <el-radio value="IPv4">IPv4</el-radio>
            <el-radio value="IPv6">IPv6</el-radio>
            <el-radio value="dual">双栈</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="地域" prop="regionId" v-if="form.clusterType === 'standby'">
          <el-select v-model="form.regionId" placeholder="请选择地域" style="width: 100%" @change="handleRegionChange">
            <el-option
              v-for="item in regionOptions"
              :key="item.regionId"
              :label="item.regionName"
              :value="item.regionId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="逻辑集群组" prop="clusterGroupId">
          <el-select 
            v-model="form.clusterGroupId" 
            placeholder="请选择逻辑集群组" 
            filterable 
            style="width: 100%"
            :loading="loading.clusterGroups"
            @change="handleClusterGroupChange"
          >
            <el-option
              v-for="item in filteredClusterGroupOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
              :disabled="clusterGroupResourceStatus[item.id] === 'insufficient'"
            >
              <div style="display: flex; justify-content: space-between; align-items: center">
                <span>{{ item.name }}</span>
                <div>
                  <el-tag size="small" :type="getClusterGroupTypeTag(item)" style="margin-right: 5px">
                    {{ getClusterGroupTypeLabel(item) }}
                  </el-tag>
                  <el-tag 
                    v-if="clusterGroupResourceStatus[item.id]" 
                    size="small" 
                    :type="clusterGroupResourceStatus[item.id] === 'sufficient' ? 'success' : 'danger'"
                  >
                    {{ clusterGroupResourceStatus[item.id] === 'sufficient' ? '资源充足' : '资源不足' }}
                  </el-tag>
                </div>
              </div>
            </el-option>
          </el-select>
          <div class="form-tip">请选择与订单集群类型相匹配的逻辑集群组</div>
          <div v-if="loading.resourceCheck" class="form-tip">正在检查网池资源充足性...</div>
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
        <el-form-item label="防护带宽(Mbps)" prop="bandwidth">
          <el-input-number v-model="form.bandwidth" :min="1" :max="10000" />
        </el-form-item>
        <el-form-item label="业务带宽(Mbps)" prop="businessBandwidth">
          <el-input-number v-model="form.businessBandwidth" :min="1" :max="5000" />
        </el-form-item>
        <el-form-item label="业务QPS" prop="qps">
          <el-input-number v-model="form.qps" :min="1" :max="100000" />
        </el-form-item>
        <el-form-item label="防护IP数" prop="protectionIpCount">
          <el-input-number v-model="form.protectionIpCount" :min="1" :max="100" />
        </el-form-item>
        <el-form-item label="防护域名数" prop="domainCount">
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
import ClusterService from '../../services/ClusterService'
import RegionService from '../../services/RegionService'

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

// 提交状态
const submitting = ref(false)

// 数据加载状态
const loading = reactive({
  customers: false,
  orders: false,
  regions: false,
  clusterGroups: false,
  resourceCheck: false
})

// 逻辑集群组资源状态
const clusterGroupResourceStatus = ref({})

// 对话框可见性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 是否为编辑模式
const isEdit = computed(() => props.isEdit)

// 表单引用
const formRef = ref()

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
  clusterType: 'standby',
  addressType: 'IPv4',
  regionId: '',
  adsProtection: true, // 默认开启ADS防护
  ccProtection: false,
  wafProtection: false,
  bandwidth: 100,
  businessBandwidth: 50, // 默认业务带宽
  qps: 1000,
  protectionIpCount: 1,
  domainCount: 10,
  portCount: 10,
  status: 'active',
  remark: '',
  clusterGroupId: '',
  // 添加用于记录之前选择的逻辑集群组，便于检测变更
  previousClusterGroupId: ''
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
  clusterType: [
    { required: true, message: '请选择集群类型', trigger: 'change' }
  ],
  addressType: [
    { required: true, message: '请选择地址类型', trigger: 'change' }
  ],
  regionId: [
    { required: () => form.clusterType === 'standby', message: '请选择地域', trigger: 'change' }
  ],
  clusterGroupId: [
    { required: true, message: '请选择逻辑集群组', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择实例状态', trigger: 'change' }
  ]
}

// 选项数据
const customerOptions = ref([])
const orderOptions = ref([])
const regionOptions = ref([])
const clusterGroupOptions = ref([])

// 重置表单
const resetForm = () => {
  form.instanceName = ''
  form.customerId = ''
  form.customerName = ''
  form.orderId = ''
  form.packageId = ''
  form.packageName = ''
  form.packageType = 1
  form.clusterType = 'standby'
  form.addressType = 'IPv4'
  form.regionId = ''
  form.adsProtection = true
  form.ccProtection = false
  form.wafProtection = false
  form.bandwidth = 100
  form.businessBandwidth = 50
  form.qps = 1000
  form.protectionIpCount = 1
  form.domainCount = 10
  form.portCount = 10
  form.status = 'active'
  form.remark = ''
  form.clusterGroupId = ''
  form.previousClusterGroupId = ''
}

// 监听实例数据变化
watch(() => props.instanceData, (val) => {
  if (val) {
    Object.keys(form).forEach(key => {
      if (val[key] !== undefined) {
        form[key] = val[key]
      }
    })
    
    // 根据套餐名称设置防护选项和集群类型
    if (val.packageName) {
      if (val.packageName === 'DDOS防护') {
        form.adsProtection = true;
        form.ccProtection = false;
        form.wafProtection = false;
        form.packageType = 1;
        // 如果没有明确的clusterType，则根据包类型设置
        if (!val.clusterType) {
          form.clusterType = 'standby';
        }
      } else if (val.packageName === 'WAF标准防护') {
        form.adsProtection = true;
        form.ccProtection = true;
        form.wafProtection = false;
        form.packageType = 2;
        // 如果没有明确的clusterType，则根据包类型设置
        if (!val.clusterType) {
          form.clusterType = 'distributed';
        }
      } else if (val.packageName === 'WAF增强防护') {
        form.adsProtection = true;
        form.ccProtection = true;
        form.wafProtection = true;
        form.packageType = 3;
        // 如果没有明确的clusterType，则根据包类型设置
        if (!val.clusterType) {
          form.clusterType = 'anycast';
        }
      }
    }
    
    // 如果有集群类型但没有isAnycast字段（向下兼容），根据集群类型设置
    if (!val.clusterType && val.isAnycast !== undefined) {
      form.clusterType = val.isAnycast ? 'anycast' : 'standby';
    }
    
    // 如果有关联的逻辑集群组ID，获取集群组详情
    if (val.clusterGroupId) {
      fetchClusterGroupDetail(val.clusterGroupId);
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
      fetchClusterGroupOptions()
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
    
    // 直接使用订单中的集群类型（如果有）
    if (order.clusterType) {
      form.clusterType = order.clusterType;
    }
    
    // 如果切换为Anycast，清空地域选择
    if (form.clusterType === 'anycast') {
      form.regionId = '';
    }
    
    // 清空之前选择的集群组
    form.clusterGroupId = '';
    form.previousClusterGroupId = '';
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
      if (form.clusterType === 'standby') {
        await formRef.value.validateField(['regionId'])
      }
      // 验证逻辑集群组
      await formRef.value.validateField(['clusterGroupId'])
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
    // 表单验证
    await formRef.value.validate()
    
    // 禁用提交按钮
    submitting.value = true
    
    let result
    if (props.isEdit) {
      // 编辑模式
      const updateData = { ...form }
      
      // 如果修改了逻辑集群组，需要标记为重新分配IP组
      const needReallocateIps = updateData.clusterGroupId !== props.instanceData.clusterGroupId
      
      result = await BusinessInstanceService.updateBusinessInstance(props.instanceData.instanceId, updateData)
      
      if (result.code === 200) {
        ElMessage.success('更新成功')
        
        // 如果修改了逻辑集群组，自动重新分配IP组
        if (needReallocateIps) {
          const allocateResult = await BusinessInstanceService.autoAllocateIpGroups(result.data.instanceId)
          if (allocateResult.code === 200) {
            ElMessage.success('已自动重新分配防护IP组')
          } else {
            ElMessage.warning('自动分配防护IP组失败，可能需要手动分配')
          }
        }
        
        dialogVisible.value = false
        emit('success')
      } else {
        ElMessage.error(result.message || '更新失败')
      }
    } else {
      // 新增模式
      result = await BusinessInstanceService.createBusinessInstance(form)
      
      if (result.code === 200) {
        ElMessage.success('创建成功')
        
        // 自动分配IP组
        const allocateResult = await BusinessInstanceService.autoAllocateIpGroups(result.data.instanceId)
        if (allocateResult.code === 200) {
          ElMessage.success('已自动分配防护IP组')
        } else {
          ElMessage.warning('自动分配防护IP组失败，可能需要手动分配')
        }
        
        dialogVisible.value = false
        emit('success')
      } else {
        ElMessage.error(result.message || '创建失败')
      }
    }
  } catch (error) {
    console.error('表单提交失败:', error)
  } finally {
    submitting.value = false
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

// 处理地域变更
const handleRegionChange = () => {
  // 根据地域和Anycast状态过滤可用的逻辑集群组
  if (form.clusterType !== 'anycast' && form.regionId) {
    // 非Anycast模式下，建议使用主备类型且与地域匹配的集群组
    // 这里只是提示用户，不强制限制选择
  }
}

// 监听Anycast状态变化
watch(() => form.clusterType, (newVal) => {
  // 如果切换了集群类型，可能需要重新考虑集群组选择
  if (newVal === 'anycast' || newVal === 'distributed') {
    // Anycast或分布式模式下建议使用对应类型的集群组
    form.regionId = '';
  } else {
    // 主备模式下建议使用主备类型的集群组
  }
})

// 监听clusterType和addressType变化，自动修改regionId
watch([() => form.clusterType, () => form.addressType], ([newClusterType]) => {
  // 如果切换为Anycast或分布式，自动清空regionId
  if (newClusterType === 'anycast' || newClusterType === 'distributed') {
    form.regionId = ''
  }
  
  // 如果逻辑集群组已选择，重新检查资源充足性
  if (form.clusterGroupId) {
    checkClusterGroupResourceSufficiency(form.clusterGroupId);
  }
})

// 监听防护IP数量变化，自动重新检查资源充足性
watch(() => form.protectionIpCount, (newCount, oldCount) => {
  if (newCount !== oldCount && form.clusterGroupId) {
    checkClusterGroupResourceSufficiency(form.clusterGroupId);
  }
})

// 获取逻辑集群组选项
const fetchClusterGroupOptions = async () => {
  try {
    loading.clusterGroups = true
    // 调用ClusterService获取集群组列表
    const result = await ClusterService.getClusterGroups()
    clusterGroupOptions.value = result
  } catch (error) {
    console.error('获取逻辑集群组列表失败:', error)
    ElMessage.error('获取逻辑集群组列表失败')
  } finally {
    loading.clusterGroups = false
  }
}

// 获取逻辑集群组详情
const fetchClusterGroupDetail = async (id) => {
  try {
    const result = await ClusterService.getClusterGroupById(id)
    if (result) {
      // 更新集群组相关信息
      form.clusterGroupId = result.id
    }
  } catch (error) {
    console.error('获取逻辑集群组详情失败:', error)
  }
}

// 过滤逻辑集群组选项
const filteredClusterGroupOptions = computed(() => {
  if (!clusterGroupOptions.value.length) return []
  
  return clusterGroupOptions.value.filter(item => {
    // 只显示活跃的集群组
    if (item.status !== 'active') return false;
    
    // 根据选择的集群类型筛选匹配的逻辑集群组
    if (form.clusterType === 'standby') {
      // 主备类型实例只能选择主备类型的集群组
      return item.type === 'standby' || (!item.type && !item.distributed);
    } else if (form.clusterType === 'distributed') {
      // 分布式类型实例只能选择分布式类型的集群组
      return item.type === 'distributed' || (!item.type && item.distributed);
    } else if (form.clusterType === 'anycast') {
      // Anycast类型实例只能选择Anycast类型的集群组
      return item.type === 'anycast';
    }
    
    // 默认显示所有活跃的集群组
    return true;
  });
})

// 获取逻辑集群组类型标签类型
const getClusterGroupTypeTag = (item) => {
  if (item.type === 'anycast') {
    return 'warning'
  } else if (item.type === 'distributed' || item.distributed) {
    return 'success'
  } else {
    return 'info'
  }
}

// 获取逻辑集群组类型标签文本
const getClusterGroupTypeLabel = (item) => {
  if (item.type === 'anycast') {
    return 'Anycast'
  } else if (item.type === 'distributed' || item.distributed) {
    return '分布式'
  } else {
    return '主备'
  }
}

// 处理逻辑集群组选择变更
const handleClusterGroupChange = async () => {
  // 检查逻辑集群组是否发生了变更
  if (form.clusterGroupId !== form.previousClusterGroupId) {
    // 如果发生了变更，检查资源充足性
    await checkClusterGroupResourceSufficiency(form.clusterGroupId);
    // 更新previousClusterGroupId
    form.previousClusterGroupId = form.clusterGroupId;
  }
};

// 检查逻辑集群组的IP资源充足性
const checkClusterGroupResourceSufficiency = async (clusterGroupId) => {
  if (!clusterGroupId) return;
  
  loading.resourceCheck = true;
  try {
    const result = await BusinessInstanceService.checkClusterGroupIpResource(
      clusterGroupId,
      form.addressType,
      form.protectionIpCount
    );
    
    if (result.code === 200) {
      // 更新资源状态
      clusterGroupResourceStatus.value = {
        ...clusterGroupResourceStatus.value,
        [clusterGroupId]: result.data.sufficient ? 'sufficient' : 'insufficient'
      };
      
      // 如果资源不足，显示警告
      if (!result.data.sufficient) {
        ElMessage.warning(`所选逻辑集群组的IP资源不足，无法满足${form.protectionIpCount}组IP的分配需求`);
      }
    } else {
      ElMessage.error(result.message || '检查资源充足性失败');
    }
  } catch (error) {
    console.error('检查资源充足性失败:', error);
    ElMessage.error('检查资源充足性失败');
  } finally {
    loading.resourceCheck = false;
  }
};

// 处理集群类型变更
const handleClusterTypeChange = () => {
  // 如果切换为Anycast或分布式，自动清空regionId
  if (form.clusterType === 'anycast' || form.clusterType === 'distributed') {
    form.regionId = '';
  }
  
  // 清空之前选择的集群组，因为不同类型的实例需要选择不同类型的集群组
  form.clusterGroupId = '';
  form.previousClusterGroupId = '';
}
</script>

<style scoped>
.el-step {
  cursor: pointer;
}
</style> 