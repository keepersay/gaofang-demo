<template>
  <el-dialog
    :model-value="visible"
    :title="isEdit ? '编辑用户' : '创建用户'"
    width="500px"
    @close="onClose"
    :close-on-click-modal="false"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" placeholder="请输入用户名" :disabled="isEdit" />
      </el-form-item>
      <el-form-item label="密码" prop="password" v-if="!isEdit || form.password">
        <el-input v-model="form.password" type="password" placeholder="请输入密码" />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword" v-if="!isEdit || form.confirmPassword">
        <el-input v-model="form.confirmPassword" type="password" placeholder="请再次输入密码" />
      </el-form-item>
      <el-form-item label="姓名" prop="name">
        <el-input v-model="form.name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="角色" prop="role">
        <el-select v-model="form.role" placeholder="请选择角色" style="width:100%">
          <el-option label="管理员" value="admin" />
          <el-option label="只读用户" value="readonly" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="onClose">取消</el-button>
      <el-button type="primary" @click="onSubmit">{{ isEdit ? '保存' : '创建' }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  visible: Boolean,
  isEdit: Boolean,
  editData: Object
})

const emits = defineEmits(['close', 'submit'])

const formRef = ref()
const form = ref({
  username: '',
  password: '',
  confirmPassword: '',
  name: '',
  email: '',
  phone: '',
  role: 'readonly'
})

// 密码确认校验规则
const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== form.value.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const rules = ref({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validatePass, trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱格式', trigger: ['blur', 'change'] }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
})

watch(() => props.visible, (val) => {
  if (val) {
    // 打开弹窗时重置表单并回填数据
    formRef.value?.resetFields()
    if (props.isEdit && props.editData) {
      // 编辑模式，回填数据，密码和确认密码不清空但也不强制显示
      form.value = { ...JSON.parse(JSON.stringify(props.editData)), password: '', confirmPassword: '' }
    } else {
      // 新建模式
      form.value = { username: '', password: '', confirmPassword: '', name: '', email: '', phone: '', role: 'readonly' }
    }
  }
})

function onClose() {
  emits('close')
}

function onSubmit() {
  formRef.value?.validate(async (valid) => {
    if (valid) {
      // 移除确认密码字段，因为后端不需要
      const submitData = { ...form.value }
      delete submitData.confirmPassword
      
      emits('submit', submitData)
    } else {
      ElMessage.error('请检查表单输入')
      return false
    }
  })
}
</script> 