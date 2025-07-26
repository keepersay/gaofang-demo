<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑集群' : '新建集群'"
    width="600px"
    :close-on-click-modal="false"
    @close="onClose"
  >
    <el-form 
      :model="form" 
      :rules="rules" 
      ref="formRef" 
      label-width="100px"
      v-loading="loading"
    >
      <el-form-item label="集群名称" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入集群名称（最多16个字符）"
          maxlength="16"
          show-word-limit
          clearable
        />
        <div class="form-tip">
          集群名称在所有网元类型中全局唯一
        </div>
      </el-form-item>

      <el-form-item label="所属机房" prop="dataCenterId">
        <el-select 
          v-model="form.dataCenterId" 
          placeholder="请选择机房" 
          clearable
          style="width: 100%"
          :loading="loading.dataCenters"
          filterable
        >
          <el-option
            v-for="dc in activeDataCenters"
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

      <el-form-item label="网元类型" prop="networkElementType">
        <el-select
          v-model="form.networkElementType"
          placeholder="请选择网元类型"
          style="width: 100%"
          :disabled="isEdit"
        >
          <el-option
            v-for="(label, value) in networkElementTypes"
            :key="value"
            :label="label"
            :value="value"
          />
        </el-select>
        <div class="form-tip" v-if="isEdit">
          网元类型创建后不可修改
        </div>
      </el-form-item>

      <el-form-item label="集群状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio label="active">启用</el-radio>
          <el-radio label="disabled">停用</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="form.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息（最多256个字符）"
          maxlength="256"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="onClose">取消</el-button>
        <el-button 
          type="primary" 
          @click="handleSubmit"
          :loading="submitting"
        >
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import ClusterManagementService, { networkElementTypes } from '@/services/ClusterManagementService'
import DataCenterService from '@/services/DataCenterService'
import RegionService from '@/services/RegionService'

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

// 响应式数据
const dialogVisible = ref(false)
const formRef = ref()
const loading = ref({
  dataCenters: false
})
const submitting = ref(false)
const dataCenters = ref([])
const regions = ref([])

// 表单数据
const form = ref({
  name: '',
  dataCenterId: '',
  networkElementType: '',
  status: 'active',
  remark: ''
})

// 获取活跃的机房列表
const activeDataCenters = computed(() => {
  return dataCenters.value.filter(dc => dc.status === 'active')
})

// 获取地域名称
const getRegionName = (regionId) => {
  const region = regions.value.find(r => r.id === regionId)
  return region ? region.name : regionId
}

// 集群名称唯一性验证
const validateClusterName = async (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入集群名称'))
    return
  }
  
  if (value.length > 16) {
    callback(new Error('集群名称最多16个字符'))
    return
  }
  
  try {
    const excludeId = props.isEdit ? props.editData.id : ''
    const result = await ClusterManagementService.checkClusterNameUnique(value, excludeId)
    if (!result.unique) {
      callback(new Error('集群名称已存在'))
      return
    }
    callback()
  } catch (error) {
    callback(new Error('名称验证失败'))
  }
}

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入集群名称', trigger: 'blur' },
    { validator: validateClusterName, trigger: 'blur' }
  ],
  dataCenterId: [
    { required: true, message: '请选择所属机房', trigger: 'change' }
  ],
  networkElementType: [
    { required: true, message: '请选择网元类型', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择集群状态', trigger: 'change' }
  ],
  remark: [
    { max: 256, message: '备注信息最多256个字符', trigger: 'blur' }
  ]
}

// 加载机房数据
const loadDataCenters = async () => {
  loading.value.dataCenters = true
  try {
    const result = await DataCenterService.getDataCenters()
    dataCenters.value = result
  } catch (error) {
    ElMessage.error('加载机房数据失败：' + error.message)
  } finally {
    loading.value.dataCenters = false
  }
}

// 加载地域数据
const loadRegions = async () => {
  try {
    const result = await RegionService.getRegions()
    regions.value = result
  } catch (error) {
    console.error('加载地域数据失败：', error)
  }
}

// 重置表单
const resetForm = () => {
  form.value = {
    name: '',
    dataCenterId: '',
    networkElementType: '',
    status: 'active',
    remark: ''
  }
  
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

// 初始化表单数据
const initFormData = () => {
  if (props.isEdit && props.editData) {
    form.value = {
      id: props.editData.id,
      name: props.editData.name,
      dataCenterId: props.editData.dataCenterId,
      networkElementType: props.editData.networkElementType,
      status: props.editData.status,
      remark: props.editData.remark || ''
    }
  } else {
    resetForm()
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    // 验证表单
    const valid = await formRef.value.validate()
    if (!valid) return
    
    submitting.value = true
    
    const formData = { ...form.value }
    
    if (props.isEdit) {
      await ClusterManagementService.updateCluster(formData)
      ElMessage.success('编辑成功')
    } else {
      await ClusterManagementService.addCluster(formData)
      ElMessage.success('创建成功')
    }
    
    emit('submit')
    onClose()
  } catch (error) {
    ElMessage.error(`${props.isEdit ? '编辑' : '创建'}失败：` + error.message)
  } finally {
    submitting.value = false
  }
}

// 关闭弹窗
const onClose = () => {
  emit('update:visible', false)
  resetForm()
}

// 监听弹窗显示状态
watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal
  if (newVal) {
    loadDataCenters()
    loadRegions()
    initFormData()
  }
})

// 监听dialogVisible变化
watch(dialogVisible, (newVal) => {
  if (!newVal) {
    emit('update:visible', false)
  }
})
</script>

<style scoped>
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}

.dialog-footer {
  text-align: right;
}

:deep(.el-form-item__content) {
  flex-direction: column;
  align-items: flex-start;
}

:deep(.el-form-item__content .form-tip) {
  align-self: stretch;
}
</style> 