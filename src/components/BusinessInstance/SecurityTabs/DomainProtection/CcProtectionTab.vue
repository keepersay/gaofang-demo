<template>
  <div class="cc-protection-tab">
    <CcBasicProtectionForm v-model="basic" />
    <CcAdvancedProtectionTable v-model="advanced" />
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import CcBasicProtectionForm from './CcBasicProtectionForm.vue'
import CcAdvancedProtectionTable from './CcAdvancedProtectionTable.vue'

const props = defineProps({
  protectionId: {
    type: [Number, String],
    required: true
  },
  protectionData: {
    type: Object,
    required: true
  }
})
const emit = defineEmits(['update'])

const basic = reactive({
  enabled: false,
  statObjects: ['IP'],
  defenseMode: 'JavaScript',
  action: 'block',
  frequency: 1000,
  period: 10,
  banTime: 30
})
const advanced = reactive({
  enabled: false,
  rules: []
})

// 初始化配置
const initConfig = () => {
  if (props.protectionData && props.protectionData.securityConfig && props.protectionData.securityConfig.ccProtection) {
    const cc = props.protectionData.securityConfig.ccProtection
    if (cc.basic) Object.assign(basic, cc.basic)
    if (cc.advanced) Object.assign(advanced, cc.advanced)
  }
}
watch(() => props.protectionData, initConfig, { deep: true, immediate: true })
watch([basic, advanced], () => {
  emit('update', 'ccProtection', { basic: { ...basic }, advanced: { ...advanced } })
}, { deep: true })
</script>

<style scoped>
.cc-protection-tab {
  padding: 0 10px;
}
</style> 