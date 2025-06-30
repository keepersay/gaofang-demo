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

      <el-form-item label="分布式" prop="distributed">
        <el-switch v-model="form.distributed" @change="handleDistributedChange" />
        <span class="ml-2">{{ form.distributed ? '是' : '否' }}</span>
        <div class="form-tip">
          {{ form.distributed ? '分布式集群组不需要选择地域和机房' : '非分布式集群组需要选择机房' }}
        </div>
        </el-form-item>
      
      <el-form-item v-if="!form.distributed" label="机房" prop="dataCenterId">
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
          :disabled="!form.distributed && !form.dataCenterId"
        >
          <el-option
            v-for="cluster in availablePrimaryClusters"
            :key="cluster.id"
            :label="cluster.displayName"
            :value="cluster.id"
          >
            <div class="cluster-option">
              <span>{{ cluster.displayName }}</span>
              <div class="cluster-option-tags">
                <el-tag size="small" :type="getProviderTagType(cluster.provider)">
                  {{ getProviderLabel(cluster.provider) }}
                </el-tag>
                <el-tag size="small" :type="getTypeTagType(cluster.type)">
                  {{ getTypeLabel(cluster.type) }}
                </el-tag>
              </div>
            </div>
          </el-option>
        </el-select>
        <div class="form-tip">
          {{ '请选择主集群' }}
        </div>
      </el-form-item>
      
      <!-- 默认集群选择，仅在分布式模式下显示 -->
      <el-form-item 
        v-if="form.distributed" 
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
              <el-tag size="small" type="success">默认</el-tag>
            </div>
          </el-option>
        </el-select>
        <div class="form-tip">
          默认集群将作为分布式集群组的首选集群
        </div>
      </el-form-item>
      
      <el-form-item 
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
          :disabled="!form.distributed && !form.dataCenterId"
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
              <div class="cluster-option-tags">
                <el-tag size="small" :type="getProviderTagType(cluster.provider)">
                  {{ getProviderLabel(cluster.provider) }}
                </el-tag>
                <el-tag size="small" :type="getTypeTagType(cluster.type)">
                  {{ getTypeLabel(cluster.type) }}
                </el-tag>
      </div>
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
  distributed: false,
  dataCenterId: '',
  primaryClusters: [],
  standbyClusters: [],
  status: 'active',
  remark: '',
  addressType: 'ipv4',
  defaultClusterId: ''
})

// 激活状态的机房列表
const activedataCenters = computed(() => {
  return dataCenters.value.filter(dc => dc.status === 'active')
})

// 计算属性：可选的主集群
const availablePrimaryClusters = computed(() => {
  if (form.value.distributed) {
    // 分布式模式下，所有集群都可选
    return clusters.value.filter(c => c.status === 'active')
  } else if (form.value.dataCenterId) {
    // 非分布式模式下，只能选择特定机房的集群
    return clusters.value.filter(c => 
      c.status === 'active' && c.dataCenterId === form.value.dataCenterId
    )
  }
  return []
})

// 计算属性：可选的备集群
const availableStandbyClusters = computed(() => {
  if (form.value.distributed) {
    // 分布式模式下，所有未被选为主集群的集群都可以选
    return clusters.value.filter(c => 
      c.status === 'active' && !form.value.primaryClusters.includes(c.id)
    )
  } else if (form.value.dataCenterId) {
    // 非分布式模式下，只能选择特定机房且未被选为主集群的集群
    return clusters.value.filter(c => 
      c.status === 'active' && 
      c.dataCenterId === form.value.dataCenterId && 
      !form.value.primaryClusters.includes(c.id)
    )
  }
  return []
})

// 获取服务商标签样式
const getProviderTagType = (provider) => {
  const typeMap = {
    telecom: 'success',
    unicom: 'warning',
    mobile: 'info'
  }
  return typeMap[provider] || 'info'
}

// 获取服务商标签文本
const getProviderLabel = (provider) => {
  const typeMap = {
    telecom: '电信',
    unicom: '联通',
    mobile: '移动'
  }
  return typeMap[provider] || provider
}

// 获取类型标签样式
const getTypeTagType = (type) => {
  const typeMap = {
    basic: 'info',
    standard: 'warning',
    premium: 'success'
  }
  return typeMap[type] || 'info'
}

// 获取类型标签文本
const getTypeLabel = (type) => {
  const typeMap = {
    basic: '基础版',
    standard: '标准版',
    premium: '高级版'
  }
  return typeMap[type] || type
}

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
  } else if (form.value.distributed && !form.value.defaultClusterId) {
    callback(new Error('分布式集群组必须选择一个默认集群'))
  } else {
    callback()
  }
}

const validateStandbyClusters = (rule, value, callback) => {
  if (value && value.length > 1) {
    callback(new Error('备集群最多选择1个'))
  } else if (value && value.some(id => form.value.primaryClusters.includes(id))) {
    callback(new Error('备集群不能与主集群重复'))
  } else {
    callback()
  }
}

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入集群组名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  dataCenterId: [
    { required: computed(() => !form.value.distributed), message: '请选择机房', trigger: 'change' }
  ],
  addressType: [
    { required: true, message: '请选择地址类型', trigger: 'change' }
  ]
}

// 处理分布式状态变化
const handleDistributedChange = (value) => {
  // 清空相关字段
  form.value.primaryClusters = []
  form.value.standbyClusters = []
  form.value.defaultClusterId = ''
  if (!value) {
    // 如果改为非分布式，需要选择机房
    form.value.dataCenterId = ''
  }
}

// 处理机房变更
const handleDataCenterChange = (value) => {
  if (value !== form.value.dataCenterId) {
    // 清空已选集群
    form.value.primaryClusters = []
    form.value.standbyClusters = []
  }
}

// 监听主集群变化，如果默认集群不在主集群列表中，则清空默认集群
watch(() => form.value.primaryClusters, (newVal) => {
  if (form.value.defaultClusterId && !newVal.includes(form.value.defaultClusterId)) {
    form.value.defaultClusterId = newVal.length > 0 ? newVal[0] : ''
  } else if (form.value.distributed && newVal.length > 0 && !form.value.defaultClusterId) {
    // 如果是分布式集群，且有主集群但没有默认集群，则设置第一个主集群为默认集群
    form.value.defaultClusterId = newVal[0]
  }
}, { deep: true })

// 监听props.visible变化
watch(() => props.visible, (val) => {
  dialogVisible.value = val
  if (val && props.isEdit && props.editData) {
    // 编辑模式，初始化表单数据
    form.value = {
      id: props.editData.id,
      name: props.editData.name,
      distributed: props.editData.distributed,
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
      distributed: false,
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
.cluster-option-tags {
  display: flex;
  gap: 4px;
}
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
.ml-2 {
  margin-left: 8px;
}
</style> 