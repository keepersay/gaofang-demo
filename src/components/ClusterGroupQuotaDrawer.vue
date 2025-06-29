<template>
  <el-drawer
    :model-value="visible"
    :title="drawerTitle"
    size="480px"
    direction="rtl"
    @close="onClose"
  >
    <div class="mb-6">
      <h3 class="font-semibold mb-2">基础配额</h3>
      <el-form :model="quota" label-width="220px">
        <el-form-item label="逻辑集群组的防御域名总数">
          <el-input-number v-model="quota.domain" :min="0" />
        </el-form-item>
        <el-form-item label="逻辑组的防护最大总带宽 (Mbps)">
          <el-input-number v-model="quota.bandwidth" :min="0" />
        </el-form-item>
      </el-form>
    </div>
    <div class="flex justify-end mt-6">
      <el-button @click="onClose">取消</el-button>
      <el-button type="primary" @click="onSave">保存配额</el-button>
    </div>
  </el-drawer>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({
  visible: Boolean,
  groupName: String,
  quotaData: Object
})
const emits = defineEmits(['close', 'save'])
const quota = ref({
  domain: 1024,
  bandwidth: 10240
})
const drawerTitle = props.groupName ? `配额管理: ${props.groupName}` : '配额管理'
watch(() => props.visible, (val) => {
  if(val && props.quotaData) {
    quota.value = { ...quota.value, ...props.quotaData }
  }
})
function onClose() {
  emits('close')
}
function onSave() {
  emits('save', { ...quota.value })
  onClose()
}
</script> 