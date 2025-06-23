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
        <el-cascader
          v-model="form.region"
          :options="regionOptions"
          placeholder="请选择地域"
          clearable
          :loading="loading.regions"
          :props="{
            checkStrictly: true,
            value: 'id',
            label: 'name',
            emitPath: false,
            expandTrigger: 'hover'
          }"
          @change="handleRegionChange"
        />
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
          {{ '请选择主集群' }}
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
const regions = ref([]) // 扁平结构的地域列表
const regionTree = ref([]) // 树形结构的地域列表
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

// 构建地域树形选择器选项
const regionOptions = computed(() => {
  return regionTree.value
})

// 计算属性：可选的主集群
const availablePrimaryClusters = computed(() => {
  if (!form.value.region) return []
  // 获取所选地域的集群
  return clusters.value.filter(c => c.region === form.value.region && c.status === 'active')
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
    // 获取树形地域数据
    regionTree.value = await RegionService.getRegionTree()
    // 同时获取扁平化地域数据
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

// 表单校验
const validatePrimaryClusters = (rule, value, callback) => {
  if (!value || value.length === 0) {
    callback(new Error('请选择至少一个主集群'))
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

const rules = {
  name: [
    { required: true, message: '请输入集群组名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  region: [
    { required: true, message: '请选择地域', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 监听地域变更
const handleRegionChange = (value) => {
  if (value !== form.value.region) {
    form.value.primaryClusters = []
    form.value.standbyClusters = []
  }
}

// 监听visible变化
watch(() => props.visible, (val) => {
  dialogVisible.value = val
  if (val) {
    // 初始化数据
    if (props.isEdit && props.editData) {
      Object.keys(form.value).forEach(key => {
        if (props.editData[key] !== undefined) {
          if (Array.isArray(props.editData[key])) {
            form.value[key] = [...props.editData[key]]
          } else {
            form.value[key] = props.editData[key]
          }
        }
      })
    } else {
      // 新建重置表单
      form.value = {
        name: '',
        region: '',
        primaryClusters: [],
        standbyClusters: [],
        status: 'active',
        remark: ''
      }
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
      emit('submit', {
        id: props.editData?.id || '',
        ...form.value
      })
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
</style> 