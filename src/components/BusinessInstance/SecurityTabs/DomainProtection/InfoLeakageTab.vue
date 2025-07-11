<template>
  <div class="info-leakage-tab">
    <div class="tab-header">
      <div class="tab-title">
        <h3>信息防泄露</h3>
        <p class="tab-description">
          信息防泄露可以防止敏感信息在网页中被泄露，如身份证号、手机号、邮箱等个人隐私信息
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
          信息防泄露功能正在开发中，敬请期待
        </template>
      </el-alert>
    </div>
    
    <div class="tab-disabled" v-else>
      <el-empty description="信息防泄露功能已禁用，请先启用该功能" />
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

// 信息防泄露配置
const config = reactive({
  enabled: false
})

// 初始化配置
const initConfig = () => {
  if (props.protectionData && props.protectionData.securityConfig && props.protectionData.securityConfig.infoLeakage) {
    const infoLeakage = props.protectionData.securityConfig.infoLeakage
    config.enabled = infoLeakage.enabled || false
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
  
  emit('update', 'infoLeakage', updatedConfig)
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
.info-leakage-tab {
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