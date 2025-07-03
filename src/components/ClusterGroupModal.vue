<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑集群组' : '新建集群组'"
    width="600px"
    :close-on-click-modal="false"
    @close="onClose"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
      <el-form-item label="名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入集群组名称" />
      </el-form-item>

      <el-form-item label="类型" prop="type">
        <el-radio-group v-model="form.type" @change="handleTypeChange">
          <el-radio label="standby">主备</el-radio>
          <el-radio label="distributed">分布式</el-radio>
          <el-radio label="anycast">Anycast</el-radio>
        </el-radio-group>
        <div class="form-tip">
          {{ getTypeDescription }}
        </div>
      </el-form-item>
      
      <el-form-item v-if="form.type === 'standby'" label="机房" prop="dataCenterId">
        <el-select 
          v-model="form.dataCenterId" 
          placeholder="请选择机房" 
          clearable
          style="width: 100%"
          :loading="loading.dataCenters"
          @change="handleDataCenterChange"
        >
          <el-option
            v-for="dc in activedataCenters"
            :key="dc.id"
            :label="dc.name"
            :value="dc.id"
          >
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span>{{ dc.name }}</span>
              <el-tag size="small" effect="plain">{{ getRegionName(dc.regionId) }}</el-tag>
            </div>
          </el-option>
        </el-select>
      </el-form-item>
      
      <el-form-item 
        label="主集群" 
        prop="primaryClusters"
        :rules="[
          { required: true, message: '请选择主集群', trigger: 'change' },
          { validator: validatePrimaryClusters, trigger: 'change' }
        ]"
      >
        <el-select 
          v-model="form.primaryClusters" 
          multiple 
          placeholder="请选择主集群" 
          style="width: 100%"
          :loading="loading.clusters"
          :disabled="isMainClusterSelectDisabled"
        >
          <el-option
            v-for="cluster in availablePrimaryClusters"
            :key="cluster.id"
            :label="cluster.displayName"
            :value="cluster.id"
          >
            <div class="cluster-option">
              <span>{{ cluster.displayName }}</span>
            </div>
          </el-option>
        </el-select>
        <div class="form-tip">
          {{ getPrimaryClusterTip }}
        </div>
      </el-form-item>
      
      <!-- 默认集群选择，仅在分布式模式下显示 -->
      <el-form-item 
        v-if="form.type === 'distributed'" 
        label="默认集群" 
        prop="defaultClusterId"
        :rules="[
          { required: true, message: '请选择默认集群', trigger: 'change' }
        ]"
      >
        <el-select 
          v-model="form.defaultClusterId" 
          placeholder="请选择默认集群" 
          style="width: 100%"
          :loading="loading.clusters"
          :disabled="form.primaryClusters.length === 0"
        >
          <el-option
            v-for="clusterId in form.primaryClusters"
            :key="clusterId"
            :label="getClusterName(clusterId)"
            :value="clusterId"
          >
            <div class="cluster-option">
              <span>{{ getClusterName(clusterId) }}</span>
            </div>
          </el-option>
        </el-select>
        <div class="form-tip">
          默认集群将作为分布式集群组的首选集群
        </div>
      </el-form-item>
      
      <el-form-item 
        v-if="form.type !== 'anycast'"
        label="备集群" 
        prop="standbyClusters"
        :rules="[{ validator: validateStandbyClusters, trigger: 'change' }]"
      >
        <el-select 
          v-model="form.standbyClusters" 
          multiple 
          placeholder="请选择备集群（可选，最多1个）" 
          style="width: 100%"
          :loading="loading.clusters"
          :disabled="isStandbyClusterSelectDisabled"
        >
          <el-option
            v-for="cluster in availableStandbyClusters"
            :key="cluster.id"
            :label="cluster.displayName"
            :value="cluster.id"
            :disabled="form.primaryClusters.includes(cluster.id)"
          >
            <div class="cluster-option">
              <span>{{ cluster.displayName }}</span>
            </div>
          </el-option>
        </el-select>
        <div class="form-tip">备集群用于故障切换，最多选择1个</div>
      </el-form-item>
      
      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注信息" />
      </el-form-item>
      
      <el-form-item label="地址类型" prop="addressType">
        <el-radio-group v-model="form.addressType">
          <el-radio label="ipv4">IPv4</el-radio>
          <el-radio label="ipv6">IPv6</el-radio>
          <el-radio label="dual">双栈</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio label="active">启用</el-radio>
          <el-radio label="disabled">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import RegionService from '@/services/RegionService'
import ClusterService from '@/services/ClusterService'
import DataCenterService from '@/services/DataCenterService'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  isEdit: {
    type: Boolean,
    default: false
  },
  editData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:visible', 'submit'])

const dialogVisible = ref(false)
const formRef = ref()
const regions = ref([]) // 扁平结构的地域列表
const clusters = ref([])
const dataCenters = ref([])
const loading = ref({
  regions: false,
  clusters: false,
  dataCenters: false
})

// 表单数据
const form = ref({
  name: '',
  type: 'standby', // 默认为主备类型
  dataCenterId: '',
  primaryClusters: [],
  standbyClusters: [],
  status: 'active',
  remark: '',
  addressType: 'ipv4',
  defaultClusterId: ''
})

// 根据类型获取描述
const getTypeDescription = computed(() => {
  const typeDesc = {
    'standby': '主备模式：只能选择一个主集群，最多可选一个备集群，需选择特定机房',
    'distributed': '分布式模式：可选多个主集群，必须指定一个默认集群，可选一个备集群，不限制机房',
    'anycast': 'Anycast模式：可选多个主集群，无需选择默认集群，不支持备集群，不限制机房'
  }
  return typeDesc[form.value.type] || ''
})

// 主集群提示信息
const getPrimaryClusterTip = computed(() => {
  const tipMap = {
    'standby': '请选择一个主集群',
    'distributed': '请选择至少一个主集群',
    'anycast': '请选择至少一个主集群'
  }
  return tipMap[form.value.type] || '请选择主集群'
})

// 是否禁用主集群选择
const isMainClusterSelectDisabled = computed(() => {
  if (form.value.type === 'anycast' || form.value.type === 'distributed') {
    return false
  } else {
    return !form.value.dataCenterId
  }
})

// 是否禁用备集群选择
const isStandbyClusterSelectDisabled = computed(() => {
  if (form.value.type === 'distributed') {
    return form.value.primaryClusters.length === 0
  } else if (form.value.type === 'standby') {
    return !form.value.dataCenterId || form.value.primaryClusters.length === 0
  }
  return true // anycast类型不应该显示备集群选择
})

// 激活状态的机房列表
const activedataCenters = computed(() => {
  return dataCenters.value.filter(dc => dc.status === 'active')
})

// 计算属性：可选的主集群
const availablePrimaryClusters = computed(() => {
  if (form.value.type === 'anycast' || form.value.type === 'distributed') {
    // Anycast和分布式模式下，所有集群都可选
    return clusters.value.filter(c => c.status === 'active')
  } else {
    // 主备模式下，需要选择机房内的集群
    if (!form.value.dataCenterId) return []
    return clusters.value.filter(c => 
      c.status === 'active' && c.dataCenterId === form.value.dataCenterId
    )
  }
})

// 计算属性：可选的备集群
const availableStandbyClusters = computed(() => {
  if (form.value.type === 'distributed') {
    // 分布式模式下，所有未被选为主集群的集群都可以选
    return clusters.value.filter(c => 
      c.status === 'active' && !form.value.primaryClusters.includes(c.id)
    )
  } else if (form.value.type === 'standby') {
    // 主备模式下，只能选择特定机房且未被选为主集群的集群
    if (!form.value.dataCenterId) return []
    return clusters.value.filter(c => 
      c.status === 'active' && 
      c.dataCenterId === form.value.dataCenterId && 
      !form.value.primaryClusters.includes(c.id)
    )
  }
  return []
})

// 获取地域名称
const getRegionName = (regionId) => {
  const region = regions.value.find(r => r.id === regionId)
  return region ? region.name : regionId
}

// 获取集群名称
const getClusterName = (clusterId) => {
  const cluster = clusters.value.find(c => c.id === clusterId)
  return cluster ? cluster.displayName : clusterId
}

// 获取地域数据
const fetchRegions = async () => {
  loading.value.regions = true
  try {
    // 同时获取扁平化地域数据
    regions.value = await RegionService.getRegions()
  } catch (error) {
    console.error('获取地域数据失败:', error)
    ElMessage.error('获取地域数据失败')
  } finally {
    loading.value.regions = false
  }
}

// 获取机房数据
const fetchDataCenters = async () => {
  loading.value.dataCenters = true
  try {
    dataCenters.value = await DataCenterService.getDataCenters()
  } catch (error) {
    console.error('获取机房数据失败:', error)
    ElMessage.error('获取机房数据失败')
  } finally {
    loading.value.dataCenters = false
  }
}

// 获取集群数据
const fetchClusters = async () => {
  loading.value.clusters = true
  try {
    clusters.value = await ClusterService.getClusters()
  } catch (error) {
    console.error('获取集群数据失败:', error)
    ElMessage.error('获取集群数据失败')
  } finally {
    loading.value.clusters = false
  }
}

// 表单校验
const validatePrimaryClusters = (rule, value, callback) => {
  if (!value || value.length === 0) {
    callback(new Error('请选择至少一个主集群'))
    return
  }
  
  // 主备模式下只能选择一个主集群
  if (form.value.type === 'standby' && value.length > 1) {
    callback(new Error('主备模式下只能选择一个主集群'))
    return
  }
  
  // 分布式模式下必须选择默认集群
  if (form.value.type === 'distributed' && !form.value.defaultClusterId) {
    callback(new Error('分布式模式下必须选择默认集群'))
    return
  }
  
  callback()
}

const validateStandbyClusters = (rule, value, callback) => {
  if (form.value.type === 'anycast' && value && value.length > 0) {
    callback(new Error('Anycast模式不支持备集群'))
    return
  }
  
  if (value && value.length > 1) {
    callback(new Error('备集群最多选择1个'))
    return
  } 
  
  if (value && value.some(id => form.value.primaryClusters.includes(id))) {
    callback(new Error('备集群不能与主集群重复'))
    return
  }
  
  callback()
}

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入集群组名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择集群组类型', trigger: 'change' }
  ],
  dataCenterId: [
    { required: computed(() => form.value.type === 'standby'), message: '请选择机房', trigger: 'change' }
  ],
  addressType: [
    { required: true, message: '请选择地址类型', trigger: 'change' }
  ]
}

// 处理类型变更
const handleTypeChange = (value) => {
  // 清空相关字段
  form.value.primaryClusters = []
  form.value.standbyClusters = []
  form.value.defaultClusterId = ''
  
  if (value === 'anycast' || value === 'distributed') {
    // Anycast和分布式类型不需要选择机房
    form.value.dataCenterId = ''
  } else {
    // 主备需要选择机房
    if (!form.value.dataCenterId) {
      form.value.dataCenterId = ''
    }
  }
}

// 处理机房变更
const handleDataCenterChange = (value) => {
  if (value !== form.value.dataCenterId) {
    // 清空已选集群
    form.value.primaryClusters = []
    form.value.standbyClusters = []
    form.value.defaultClusterId = ''
  }
}

// 监听主集群变化
watch(() => form.value.primaryClusters, (newVal) => {
  // 处理主集群变化后的默认集群选择
  if (form.value.defaultClusterId && !newVal.includes(form.value.defaultClusterId)) {
    form.value.defaultClusterId = newVal.length > 0 ? newVal[0] : ''
  } else if (form.value.type === 'distributed' && newVal.length > 0 && !form.value.defaultClusterId) {
    // 如果是分布式集群，且有主集群但没有默认集群，则设置第一个主集群为默认集群
    form.value.defaultClusterId = newVal[0]
  }
  
  // 对于主备模式，确保只能选择一个主集群
  if (form.value.type === 'standby' && newVal.length > 1) {
    form.value.primaryClusters = [newVal[newVal.length - 1]]
  }
}, { deep: true })

// 监听类型变化，处理集群选择的合法性
watch(() => form.value.type, (newVal) => {
  if (newVal === 'anycast') {
    // Anycast 模式下清空备集群
    form.value.standbyClusters = []
    form.value.defaultClusterId = ''
  } else if (newVal === 'standby' && form.value.primaryClusters.length > 1) {
    // 主备模式下只能有一个主集群
    form.value.primaryClusters = [form.value.primaryClusters[0]]
  }
}, { deep: true })

// 监听props.visible变化
watch(() => props.visible, (val) => {
  dialogVisible.value = val
  if (val && props.isEdit && props.editData) {
    // 编辑模式，初始化表单数据
    // 处理兼容历史数据，将旧数据的distributed映射到新类型
    let clusterType = 'standby'
    if (props.editData.distributed) {
      clusterType = 'distributed'
    }
    
    form.value = {
      id: props.editData.id,
      name: props.editData.name,
      type: props.editData.type || clusterType, // 如果有type字段使用，否则从distributed推断
      dataCenterId: props.editData.dataCenterId,
      primaryClusters: [...props.editData.primaryClusters],
      standbyClusters: [...(props.editData.standbyClusters || [])],
      status: props.editData.status,
      remark: props.editData.remark,
      addressType: props.editData.addressType || 'ipv4',
      defaultClusterId: props.editData.defaultClusterId || (props.editData.primaryClusters.length > 0 ? props.editData.primaryClusters[0] : '')
    }
  } else if (val) {
    // 新增模式，重置表单
    form.value = {
      id: '',
      name: '',
      type: 'standby',
      dataCenterId: '',
      primaryClusters: [],
      standbyClusters: [],
      status: 'active',
      remark: '',
      addressType: 'ipv4',
      defaultClusterId: ''
    }
  }
})

// 监听dialogVisible变化
watch(dialogVisible, (val) => {
  emit('update:visible', val)
})

// 关闭对话框
const onClose = () => {
  formRef.value?.resetFields()
}

// 提交
const handleSubmit = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      // 提交前处理数据
      const formData = {
        id: props.editData?.id || '',
        ...form.value,
        // 兼容老数据结构，增加distributed字段
        distributed: form.value.type === 'distributed',
      }

      emit('submit', formData)
      dialogVisible.value = false
    } else {
      return false
    }
  })
}

// 初始化数据
const initData = () => {
  fetchRegions()
  fetchClusters()
  fetchDataCenters()
}

onMounted(() => {
  initData()
})
</script>

<style scoped>
.cluster-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style> 