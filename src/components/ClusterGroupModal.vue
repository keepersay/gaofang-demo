<template>
  <el-dialog
    :model-value="visible"
    :title="isEdit ? '编辑逻辑集群组' : '新建逻辑集群组'"
    width="700px"
    @close="onClose"
    :close-on-click-modal="false"
  >
    <el-steps :active="step" finish-status="success" align-center class="mb-4">
      <el-step title="基础信息" />
      <el-step title="链路编排" />
    </el-steps>
    <div v-show="step === 0">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="110px">
        <el-form-item label="逻辑集群组名称" prop="name">
          <el-input v-model="form.name" placeholder="如：huadong-telecom-premium" />
        </el-form-item>
        <el-form-item label="所在机房" prop="location">
          <el-select v-model="form.location" placeholder="请选择机房" :disabled="isEdit">
            <el-option label="华东-上海" value="sh" />
            <el-option label="华南-广州" value="gz" />
          </el-select>
        </el-form-item>
        <el-form-item label="链路模板" prop="linkType">
          <el-select v-model="form.linkType">
            <el-option label="七层防护链路 (ADS→SLB→WAF-CC→WAF)" value="L7" />
            <el-option label="四层防护链路 (ADS→SLB)" value="L4" />
          </el-select>
        </el-form-item>
        <el-form-item label="VIP池">
          <el-select v-model="form.vipPool" multiple filterable allow-create default-first-option placeholder="输入IP/范围/CIDR后回车..." style="width:100%" />
        </el-form-item>
        <el-form-item label="回源IP池">
          <el-select v-model="form.originPool" multiple filterable allow-create default-first-option placeholder="输入IP/范围/CIDR后回车..." style="width:100%" />
        </el-form-item>
        <el-form-item label="SNAT地址池">
          <el-select v-model="form.snatPool" multiple filterable allow-create default-first-option placeholder="输入IP/范围/CIDR后回车..." style="width:100%" />
        </el-form-item>
      </el-form>
      <div class="flex justify-end mt-4">
        <el-button @click="onClose">取消</el-button>
        <el-button type="primary" @click="nextStep">下一步</el-button>
      </div>
    </div>
    <div v-show="step === 1">
      <div class="mb-3 p-2 bg-gray-50 rounded text-sm">
        <span>所属机房：</span><b>{{ locationText }}</b>（不可修改）
      </div>
      <div>
        <div v-for="(slot, idx) in linkSlots" :key="slot.type" class="flex items-center mb-4">
          <span class="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full mr-3">{{ idx+1 }}</span>
          <span class="w-20">{{ slot.label }}</span>
          <el-select v-model="form.orchestration[slot.type]" placeholder="选择集群或留空跳过" style="flex:1">
            <el-option :label="slot.label+'-cluster-01 (可用)'" :value="slot.type+'-cl-01'" />
            <el-option label="不选择 (跳过此节点)" value="" />
          </el-select>
        </div>
      </div>
      <div class="flex justify-between mt-4">
        <el-button @click="step=0">上一步</el-button>
        <el-button type="primary" @click="onSubmit">{{ isEdit ? '确认保存' : '确认创建' }}</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
const props = defineProps({
  visible: Boolean,
  isEdit: Boolean,
  editData: Object
})
const emits = defineEmits(['close', 'submit'])
const step = ref(0)
const formRef = ref()
const form = ref({
  name: '',
  location: '',
  linkType: 'L7',
  vipPool: [],
  originPool: [],
  snatPool: [],
  orchestration: {}
})
const rules = {
  name: [{ required: true, message: '必填', trigger: 'blur' }],
  location: [{ required: true, message: '必填', trigger: 'change' }],
  linkType: [{ required: true, message: '必填', trigger: 'change' }]
}
const linkSlotsMap = {
  L7: [
    { type: 'ADS', label: 'ADS' },
    { type: 'SLB', label: 'SLB' },
    { type: 'WAF-CC', label: 'WAF-CC' },
    { type: 'WAF', label: 'WAF' }
  ],
  L4: [
    { type: 'ADS', label: 'ADS' },
    { type: 'SLB', label: 'SLB' }
  ]
}
const linkSlots = computed(() => linkSlotsMap[form.value.linkType])
const locationText = computed(() => {
  if(form.value.location==='sh') return '华东-上海'
  if(form.value.location==='gz') return '华南-广州'
  return ''
})

watch(() => props.visible, (val) => {
  if(val && props.isEdit && props.editData) {
    form.value = JSON.parse(JSON.stringify(props.editData))
    step.value = 0
  } else if(val) {
    form.value = { name: '', location: '', linkType: 'L7', vipPool: [], originPool: [], snatPool: [], orchestration: {} }
    step.value = 0
  }
})

function onClose() {
  emits('close')
}
function nextStep() {
  formRef.value.validate((valid) => {
    if(valid) step.value = 1
  })
}
function onSubmit() {
  emits('submit', { ...form.value })
  onClose()
}
</script>

<style scoped>
.bg-gray-50 { background: #f9fafb; }
</style> 