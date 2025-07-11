<template>
  <div class="cookie-protection-tab">
    <div class="tab-header">
      <div class="tab-title">
        <h3>Cookie防护</h3>
        <p class="tab-description">
          Cookie防护可以防止Cookie篡改、Cookie劫持等攻击，保护用户会话安全
        </p>
      </div>
      
      <div class="tab-actions">
        <el-switch
          v-model="config.enabled"
          active-text="启用"
          inactive-text="禁用"
          @change="handleStatusChange"
        />
      </div>
    </div>
    
    <el-divider />
    
    <div class="tab-content" v-if="config.enabled">
      <el-alert
        type="info"
        :closable="false"
        show-icon
      >
        <template #title>
          功能开发中
        </template>
        <template #default>
          Cookie防护功能正在开发中，敬请期待
        </template>
      </el-alert>
    </div>
    
    <div class="tab-disabled" v-else>
      <el-empty description="Cookie防护功能已禁用，请先启用该功能" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'

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

// Cookie防护配置
const config = reactive({
  enabled: false
})

// 初始化配置
const initConfig = () => {
  if (props.protectionData && props.protectionData.securityConfig && props.protectionData.securityConfig.cookieProtection) {
    const cookieProtection = props.protectionData.securityConfig.cookieProtection
    config.enabled = cookieProtection.enabled || false
  }
}

// 处理状态变更
const handleStatusChange = (val) => {
  config.enabled = val
  emitUpdate()
}

// 向父组件发送更新事件
const emitUpdate = () => {
  const updatedConfig = {
    enabled: config.enabled
  }
  
  emit('update', 'cookieProtection', updatedConfig)
}

// 监听保护对象数据变化
watch(() => props.protectionData, () => {
  initConfig()
}, { deep: true })

// 组件挂载时初始化
onMounted(() => {
  initConfig()
})
</script>

<style scoped>
.cookie-protection-tab {
  padding: 0 10px;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.tab-title h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
}

.tab-description {
  color: #606266;
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}

.tab-content {
  margin-top: 20px;
}

.tab-disabled {
  padding: 40px 0;
}
</style> 