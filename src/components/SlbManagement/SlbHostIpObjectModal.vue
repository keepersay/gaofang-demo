<template>
  <el-drawer
    v-model="visible"
    :title="isEdit ? '编辑主机IP对象' : '添加主机IP对象'"
    direction="rtl"
    size="40vw"
    :before-close="handleClose"
    destroy-on-close
  >
    <div class="host-ip-object-modal-content">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
        label-position="left"
        @submit.prevent
      >
        <!-- 基础信息 -->
        <div class="config-section">
          <h3>基础信息</h3>
          <el-form-item label="名称" prop="name">
            <el-input
              v-model="formData.name"
              placeholder="名称"
              maxlength="50"
              show-word-limit
              style="width: 300px;"
            />
          </el-form-item>
          <el-form-item label="类型" prop="type">
            <el-radio-group v-model="formData.type">
              <el-radio label="localip">本地IP</el-radio>
              <el-radio label="hcip">健康检查IP</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="网络区域" prop="networkZone">
            <el-radio-group v-model="formData.networkZone">
              <el-radio label="public">公网</el-radio>
              <el-radio label="private">私网</el-radio>
            </el-radio-group>
          </el-form-item>
        </div>

        <!-- IP配置 -->
        <div class="config-section">
          <h3>IP配置</h3>
          <el-form-item label="地址类型" prop="ipType">
            <el-radio-group v-model="formData.ipType">
              <el-radio label="ipv4">IPv4</el-radio>
              <el-radio label="ipv6">IPv6</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="角色" prop="roleType">
            <el-radio-group v-model="formData.roleType">
              <el-radio label="primary">主</el-radio>
              <el-radio label="backup">备</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="位置" prop="location">
            <el-radio-group v-model="formData.location">
              <el-radio label="local">本地</el-radio>
              <el-radio label="remote">远端</el-radio>
            </el-radio-group>
          </el-form-item>
        </div>

        <!-- 管理信息 -->
        <div class="config-section">
          <h3>管理信息</h3>
          <el-form-item label="责任人" prop="owner">
            <el-select
              v-model="formData.owner"
              placeholder="请选择责任人"
              filterable
              remote
              :remote-method="handleOwnerSearch"
              :loading="ownerLoading"
              style="width: 300px;"
            >
              <el-option
                v-for="user in ownerOptions"
                :key="user.id"
                :label="user.name"
                :value="user.name"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="formData.remark"
              type="textarea"
              placeholder="备注"
              :rows="3"
              maxlength="200"
              show-word-limit
              style="width: 300px;"
            />
          </el-form-item>
        </div>
      </el-form>
    </div>

    <template #footer>
      <div class="drawer-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          保存
        </el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import HostIpObjectService from '@/services/HostIpObjectService'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  ipObjectData: {
    type: Object,
    default: null
  },
  isEdit: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'success', 'add-ip-object', 'modify-ip-object'])

// 响应式数据
const formRef = ref()
const submitting = ref(false)
const ownerLoading = ref(false)
const ownerOptions = ref([])

// 表单数据
const formData = reactive({
  name: '',
  type: 'localip',
  networkZone: 'public',
  ipType: 'ipv4',
  roleType: 'primary',
  location: 'local',
  owner: '',
  remark: ''
})

// 计算属性
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' },
    { min: 1, max: 50, message: '名称长度在1到50个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择类型', trigger: 'change' }
  ],
  networkZone: [
    { required: true, message: '请选择网络区域', trigger: 'change' }
  ],
  ipType: [
    { required: true, message: '请选择IP类型', trigger: 'change' }
  ],
  roleType: [
    { required: true, message: '请选择角色类型', trigger: 'change' }
  ],
  location: [
    { required: true, message: '请选择位置', trigger: 'change' }
  ],
  owner: [
    { required: true, message: '请选择责任人', trigger: 'change' }
  ]
}

// 获取用户列表
const fetchUserList = async (query = '') => {
  try {
    ownerLoading.value = true
    // 模拟API调用
    const response = await mockGetUserList(query)
    ownerOptions.value = response.data.list
  } catch (error) {
    console.error('Error fetching user list:', error)
  } finally {
    ownerLoading.value = false
  }
}

// 模拟获取用户列表API
const mockGetUserList = (query) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockUsers = [
        { id: 1, name: 'huangjj' },
        { id: 2, name: 'yl' },
        { id: 3, name: 'keepersay' },
        { id: 4, name: 'admin' },
        { id: 5, name: 'test' }
      ]
      
      const filteredUsers = query 
        ? mockUsers.filter(user => user.name.includes(query))
        : mockUsers
      
      resolve({
        data: {
          list: filteredUsers
        }
      })
    }, 300)
  })
}

// 责任人搜索
const handleOwnerSearch = (query) => {
  fetchUserList(query)
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    submitting.value = true

    const submitData = { ...formData }
    
    // 通过事件传递数据给父组件处理
    if (props.isEdit) {
      submitData.id = props.ipObjectData.id
      emit('modify-ip-object', submitData)
      ElMessage.success('修改成功')
    } else {
      emit('add-ip-object', submitData)
      ElMessage.success('创建成功')
    }
    
    emit('success')
  } catch (error) {
    if (error !== false) {
      ElMessage.error('操作失败')
      console.error('Error submitting form:', error)
    }
  } finally {
    submitting.value = false
  }
}

// 取消
const handleCancel = () => {
  handleClose()
}

// 关闭弹窗
const handleClose = () => {
  visible.value = false
  resetForm()
}

// 重置表单
const resetForm = () => {
  formData.name = ''
  formData.type = 'localip'
  formData.networkZone = 'public'
  formData.ipType = 'ipv4'
  formData.roleType = 'primary'
  formData.location = 'local'
  formData.owner = ''
  formData.remark = ''
  
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 初始化表单数据
const initFormData = () => {
  if (props.ipObjectData && props.isEdit) {
    // 编辑模式，填充数据
    formData.name = props.ipObjectData.name || ''
    formData.type = props.ipObjectData.type || 'localip'
    formData.networkZone = props.ipObjectData.networkZone || 'public'
    formData.ipType = props.ipObjectData.ipType || 'ipv4'
    formData.roleType = props.ipObjectData.roleType || 'primary'
    formData.location = props.ipObjectData.location || 'local'
    formData.owner = props.ipObjectData.owner || ''
    formData.remark = props.ipObjectData.remark || ''
  } else {
    // 新建模式，使用默认值
    resetForm()
  }
}

// 监听props变化
watch(() => props.ipObjectData, () => {
  initFormData()
}, { immediate: true })

watch(() => props.isEdit, () => {
  initFormData()
}, { immediate: true })

// 组件挂载
onMounted(() => {
  fetchUserList()
})
</script>

<style scoped>
.host-ip-object-modal-content {
  padding: 20px;
}

.config-section {
  margin-bottom: 30px;
}

.config-section h3 {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #ebeef5;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-radio-group) {
  display: flex;
  gap: 20px;
}

:deep(.el-radio) {
  margin-right: 0;
}
</style>
