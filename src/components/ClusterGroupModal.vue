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
      <el-form-item label="地域" prop="region">
        <el-select 
          v-model="form.region" 
          placeholder="请选择地域" 
          clearable 
          :loading="loading.regions"
          @change="handleRegionChange"
        >
          <el-option
            v-for="region in regions"
            :key="region.id"
            :label="region.name"
            :value="region.id"
            :disabled="region.status !== 'active'"
          >
            <span>{{ region.name }}</span>
            <el-tag size="small" type="info" class="ml-2" v-if="region.distributed">
              分布式
            </el-tag>
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
          :disabled="!form.region"
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
          {{ isDistributed ? '可选择多个主集群实现负载均衡' : '非分布式模式下只能选择当前地域的集群' }}
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
          :disabled="!form.region"
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
const regions = ref([])
const clusters = ref([])
const loading = ref({
  regions: false,
  clusters: false
})

// 表单数据
const form = ref({
  name: '',
  region: '',
  primaryClusters: [],
  standbyClusters: [],
  status: 'active',
  remark: ''
})

// 计算属性：是否为分布式
const isDistributed = computed(() => {
  const selectedRegion = regions.value.find(r => r.id === form.value.region)
  return selectedRegion?.distributed || false
})

// 计算属性：可选的主集群
const availablePrimaryClusters = computed(() => {
  if (!form.value.region) return []
  if (isDistributed.value) {
    return clusters.value.filter(c => c.status === 'active')
  } else {
    return clusters.value.filter(c => c.region === form.value.region && c.status === 'active')
  }
})

// 计算属性：可选的备集群
const availableStandbyClusters = computed(() => {
  if (!form.value.region) return []
  return clusters.value.filter(c => 
    c.status === 'active' && !form.value.primaryClusters.includes(c.id)
  )
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

// 获取地域数据
const fetchRegions = async () => {
  loading.value.regions = true
  try {
    regions.value = await RegionService.getRegions()
  } catch (error) {
    console.error('获取地域数据失败:', error)
    ElMessage.error('获取地域数据失败')
  } finally {
    loading.value.regions = false
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

// 地域变更处理
const handleRegionChange = () => {
  form.value.primaryClusters = []
  form.value.standbyClusters = []
}

// 验证主集群
const validatePrimaryClusters = (rule, value, callback) => {
  if (!form.value.region) {
    callback(new Error('请先选择地域'))
    return
  }

  if (value.length === 0) {
    callback(new Error('请至少选择1个主集群'))
    return
  }

  if (!isDistributed.value && value.length > 1) {
    callback(new Error('非分布式模式下只能选择1个主集群'))
    return
  }

  // 验证非分布式时主集群地域必须与所选地域相同
  if (!isDistributed.value) {
    const primaryCluster = clusters.value.find(c => c.id === value[0])
    if (primaryCluster && primaryCluster.region !== form.value.region) {
      callback(new Error('非分布式模式下主集群必须与所选地域相同'))
      return
    }
  }

  callback()
}

// 验证备集群
const validateStandbyClusters = (rule, value, callback) => {
  if (value.length > 1) {
    callback(new Error('备集群最多只能选择1个'))
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
  region: [
    { required: true, message: '请选择地域', trigger: 'change' }
  ],
  remark: [
    { max: 200, message: '长度不能超过 200 个字符', trigger: 'blur' }
  ]
}

// 监听visible属性变化
watch(() => props.visible, (val) => {
  dialogVisible.value = val
  if (val && props.isEdit && props.editData) {
    form.value = { ...props.editData }
  } else if (val) {
    form.value = {
      name: '',
      region: '',
      primaryClusters: [],
      standbyClusters: [],
      status: 'active',
      remark: ''
    }
  }
})

// 监听对话框可见性变化
watch(() => dialogVisible.value, (val) => {
  emit('update:visible', val)
})

// 提交表单
const handleSubmit = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      emit('submit', {
        ...form.value,
        distributed: isDistributed.value
      })
      dialogVisible.value = false
    }
  })
}

// 关闭对话框
const onClose = () => {
  formRef.value?.resetFields()
}

// 组件挂载时获取数据
onMounted(() => {
  fetchRegions()
  fetchClusters()
})
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.ml-2 {
  margin-left: 8px;
}

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
</style> 