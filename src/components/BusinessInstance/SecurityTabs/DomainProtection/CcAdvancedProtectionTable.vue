<template>
  <div class="cc-advanced-protection-table">
    <div class="table-header">
      <span class="table-title">高级CC防护</span>
      <el-switch v-model="localValue.enabled" active-text="启用" inactive-text="禁用" />
      <el-button type="primary" size="small" @click="openDialog()" :disabled="!localValue.enabled" style="margin-left: 16px;">新增</el-button>
    </div>
    <el-table :data="localValue.rules" border style="width: 100%; margin-top: 12px;" v-if="localValue.enabled && localValue.rules.length">
      <el-table-column label="序号" type="index" width="60" />
      <el-table-column label="规则名称" prop="name" min-width="120" />
      <el-table-column label="防护路径" prop="path" min-width="120" />
      <el-table-column label="统计时长(秒)" prop="statDuration" width="120" />
      <el-table-column label="访问次数" prop="frequency" width="100" />
      <el-table-column label="处理方式" prop="action" width="100">
        <template #default="{ row }">
          <span>{{ row.action === 'block' ? '请求阻断' : '请求限频' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="封禁时长(秒)" prop="banTime" width="120" />
      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <el-switch v-model="row.status" :disabled="!localValue.enabled" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="{ row, $index }">
          <el-button type="primary" link @click="openDialog(row, $index)" :disabled="!localValue.enabled">编辑</el-button>
          <el-button type="danger" link @click="removeRule($index)" :disabled="!localValue.enabled">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-empty v-if="localValue.enabled && !localValue.rules.length" description="暂无数据" style="margin: 32px 0;" />
    <el-empty v-if="!localValue.enabled" description="高级CC防护功能已禁用，请先启用该功能" style="margin: 32px 0;" />

    <el-dialog v-model="dialogVisible" :title="editIndex === -1 ? '新建规则' : '编辑规则'" width="500px">
      <el-form :model="dialogForm" :rules="dialogRules" ref="dialogFormRef" label-width="100px">
        <el-form-item label="规则名称" prop="name">
          <el-input v-model="dialogForm.name" maxlength="32" show-word-limit placeholder="请输入规则名称" />
        </el-form-item>
        <el-form-item label="防护路径" prop="path">
          <el-input v-model="dialogForm.path" maxlength="128" show-word-limit placeholder="如 /api/*，支持通配符" />
        </el-form-item>
        <el-form-item label="统计时长(秒)" prop="statDuration">
          <el-input-number v-model="dialogForm.statDuration" :min="1" :max="3600" />
        </el-form-item>
        <el-form-item label="访问次数" prop="frequency">
          <el-input-number v-model="dialogForm.frequency" :min="1" :max="100000" />
        </el-form-item>
        <el-form-item label="处理方式" prop="action">
          <el-radio-group v-model="dialogForm.action">
            <el-radio label="block">请求阻断</el-radio>
            <el-radio label="limit">请求限频</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="封禁时长(秒)" prop="banTime">
          <el-input-number v-model="dialogForm.banTime" :min="1" :max="86400" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="dialogForm.status" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitDialog">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, watch, nextTick } from 'vue'
const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})
const emit = defineEmits(['update:modelValue'])
const localValue = reactive({ ...props.modelValue })
watch(() => props.modelValue, (val) => {
  // 避免不必要的更新，只有当值不同时才更新
  if (JSON.stringify(val) !== JSON.stringify(localValue)) {
    Object.assign(localValue, val)
  }
})
watch(localValue, (val) => {
  emit('update:modelValue', { ...val })
}, { deep: true })

const dialogVisible = ref(false)
const dialogFormRef = ref(null)
const editIndex = ref(-1)
const dialogForm = reactive({
  name: '',
  path: '',
  statDuration: 60,
  frequency: 1000,
  action: 'block',
  banTime: 30,
  status: true
})
const dialogRules = {
  name: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  path: [{ required: true, message: '请输入防护路径', trigger: 'blur' }],
  statDuration: [{ required: true, type: 'number', message: '请输入统计时长', trigger: 'blur' }],
  frequency: [{ required: true, type: 'number', message: '请输入访问次数', trigger: 'blur' }],
  action: [{ required: true, message: '请选择处理方式', trigger: 'change' }],
  banTime: [{ required: true, type: 'number', message: '请输入封禁时长', trigger: 'blur' }]
}
function openDialog(row, idx) {
  if (row) {
    Object.assign(dialogForm, row)
    editIndex.value = idx
  } else {
    Object.assign(dialogForm, { name: '', path: '', statDuration: 60, frequency: 1000, action: 'block', banTime: 30, status: true })
    editIndex.value = -1
  }
  dialogVisible.value = true
}
function submitDialog() {
  dialogFormRef.value.validate().then(() => {
    const updatedRules = [...localValue.rules]
    
    if (editIndex.value === -1) {
      updatedRules.push({ ...dialogForm })
    } else {
      updatedRules[editIndex.value] = { ...dialogForm }
    }
    
    // 使用 nextTick 打断响应式循环
    nextTick(() => {
      // 一次性替换整个数组，而不是修改现有数组
      localValue.rules = updatedRules
      dialogVisible.value = false
    })
  })
}

function removeRule(idx) {
  // 创建新数组而不是修改原数组
  const updatedRules = localValue.rules.filter((_, i) => i !== idx)
  
  // 使用 nextTick 打断响应式循环
  nextTick(() => {
    localValue.rules = updatedRules
  })
}
</script>

<style scoped>
.cc-advanced-protection-table {
  background: #fff;
  padding: 16px 24px 8px 24px;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.03);
}
.table-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.table-title {
  font-size: 16px;
  font-weight: bold;
  margin-right: 16px;
}
</style> 