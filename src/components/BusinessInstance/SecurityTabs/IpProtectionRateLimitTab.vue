<template>
  <div class="tab-content">
    <h3>源限速</h3>
    
    <div class="setting-description">
      以目的IP颗粒度，对访问频率超出阈值的源IP地址进行限速。
      访问速率未超出阈值的源IP地址，访问不受影响。
      源限速类型为 bps/pps/synbps/synpps 四种类型，针对源限速还可以支持拉黑处理。
    </div>
    
    <div class="rate-limit-settings">
      <!-- PPS限速设置 -->
      <div class="limit-item">
        <div class="limit-header">
          <div class="limit-switch-row">
            <span class="required-marker">*</span>
            <span class="limit-label">源PPS限速</span>
            <el-switch v-model="rateLimit.pps.enabled" @change="updateConfig" />
          </div>
        </div>
        
        <div v-if="rateLimit.pps.enabled" class="limit-content">
          <div class="threshold-row">
            <span class="threshold-label">当源PPS限速达到</span>
            <el-input-number 
              v-model="rateLimit.pps.threshold" 
              :min="32" 
              :max="50000"
              @change="updateConfig"
              controls-position="right"
              size="small"
              class="threshold-input"
            />
            <span class="threshold-unit">Packet/s，做限速处理</span>
          </div>
          
          <div class="whitelist-row">
            <el-checkbox v-model="rateLimit.pps.enableWhitelist" @change="updateConfig">
              源PPS限速超60秒仍攻击，将该源IP加入黑名单
            </el-checkbox>
          </div>
        </div>
      </div>
      
      <!-- 源带宽限速设置 -->
      <div class="limit-item">
        <div class="limit-header">
          <div class="limit-switch-row">
            <span class="required-marker">*</span>
            <span class="limit-label">源带宽限速</span>
            <el-switch v-model="rateLimit.bps.enabled" @change="updateConfig" />
          </div>
        </div>
        
        <div v-if="rateLimit.bps.enabled" class="limit-content">
          <div class="threshold-row">
            <span class="threshold-label">当源带宽限速达到</span>
            <el-input-number 
              v-model="rateLimit.bps.threshold" 
              :min="1024" 
              :max="268435456"
              @change="updateConfig"
              controls-position="right"
              size="small"
              class="threshold-input"
            />
            <span class="threshold-unit">Byte/s，做限速处理</span>
          </div>
          
          <div class="whitelist-row">
            <el-checkbox v-model="rateLimit.bps.enableWhitelist" @change="updateConfig">
              源带宽限速超60秒仍攻击，将该源IP加入黑名单
            </el-checkbox>
          </div>
        </div>
      </div>
      
      <!-- SYN PPS限速设置 -->
      <div class="limit-item">
        <div class="limit-header">
          <div class="limit-switch-row">
            <span class="required-marker">*</span>
            <span class="limit-label">源SYN PPS限速</span>
            <el-switch v-model="rateLimit.synPps.enabled" @change="updateConfig" />
          </div>
        </div>
        
        <div v-if="rateLimit.synPps.enabled" class="limit-content">
          <div class="threshold-row">
            <span class="threshold-label">当源SYN PPS限速达到</span>
            <el-input-number 
              v-model="rateLimit.synPps.threshold" 
              :min="1" 
              :max="10000"
              @change="updateConfig"
              controls-position="right"
              size="small"
              class="threshold-input"
            />
            <span class="threshold-unit">Packet/s，做限速处理</span>
          </div>
          
          <div class="whitelist-row">
            <el-checkbox v-model="rateLimit.synPps.enableWhitelist" @change="updateConfig">
              源SYN PPS限速超60秒仍攻击，将该源IP加入黑名单
            </el-checkbox>
          </div>
        </div>
      </div>
      
      <!-- SYN带宽限速设置 -->
      <div class="limit-item">
        <div class="limit-header">
          <div class="limit-switch-row">
            <span class="required-marker">*</span>
            <span class="limit-label">源SYN带宽限速</span>
            <el-switch v-model="rateLimit.synBps.enabled" @change="updateConfig" />
          </div>
        </div>
        
        <div v-if="rateLimit.synBps.enabled" class="limit-content">
          <div class="threshold-row">
            <span class="threshold-label">当源SYN带宽限速达到</span>
            <el-input-number 
              v-model="rateLimit.synBps.threshold" 
              :min="1024" 
              :max="268435456"
              @change="updateConfig"
              controls-position="right"
              size="small"
              class="threshold-input"
            />
            <span class="threshold-unit">Byte/s，做限速处理</span>
          </div>
          
          <div class="whitelist-row">
            <el-checkbox v-model="rateLimit.synBps.enableWhitelist" @change="updateConfig">
              源SYN带宽限速超60秒仍攻击，将该源IP加入黑名单
            </el-checkbox>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  config: {
    type: Object,
    default: () => ({
      pps: {
        enabled: false,
        threshold: 1000,
        enableWhitelist: false
      },
      bps: {
        enabled: false,
        threshold: 10240,
        enableWhitelist: false
      },
      synPps: {
        enabled: false,
        threshold: 100,
        enableWhitelist: false
      },
      synBps: {
        enabled: false,
        threshold: 10240,
        enableWhitelist: false
      }
    })
  }
})

const emit = defineEmits(['update:config'])

// 本地状态
const rateLimit = reactive({
  pps: {
    enabled: false,
    threshold: 1000,
    enableWhitelist: false
  },
  bps: {
    enabled: false,
    threshold: 10240,
    enableWhitelist: false
  },
  synPps: {
    enabled: false,
    threshold: 100,
    enableWhitelist: false
  },
  synBps: {
    enabled: false,
    threshold: 10240,
    enableWhitelist: false
  }
})

// 更新配置
const updateConfig = () => {
  emit('update:config', {
    pps: { ...rateLimit.pps },
    bps: { ...rateLimit.bps },
    synPps: { ...rateLimit.synPps },
    synBps: { ...rateLimit.synBps }
  })
}

// 初始化数据
const initFromProps = () => {
  if (props.config) {
    // 初始化PPS限速
    if (props.config.pps) {
      rateLimit.pps.enabled = props.config.pps.enabled || false
      rateLimit.pps.threshold = props.config.pps.threshold || 1000
      rateLimit.pps.enableWhitelist = props.config.pps.enableWhitelist || false
    }
    
    // 初始化BPS限速
    if (props.config.bps) {
      rateLimit.bps.enabled = props.config.bps.enabled || false
      rateLimit.bps.threshold = props.config.bps.threshold || 10240
      rateLimit.bps.enableWhitelist = props.config.bps.enableWhitelist || false
    }
    
    // 初始化SYN PPS限速
    if (props.config.synPps) {
      rateLimit.synPps.enabled = props.config.synPps.enabled || false
      rateLimit.synPps.threshold = props.config.synPps.threshold || 100
      rateLimit.synPps.enableWhitelist = props.config.synPps.enableWhitelist || false
    }
    
    // 初始化SYN BPS限速
    if (props.config.synBps) {
      rateLimit.synBps.enabled = props.config.synBps.enabled || false
      rateLimit.synBps.threshold = props.config.synBps.threshold || 10240
      rateLimit.synBps.enableWhitelist = props.config.synBps.enableWhitelist || false
    }
  }
}

// 监听props变化
watch(() => props.config, () => {
  initFromProps()
}, { deep: true })

// 初始化
initFromProps()
</script>

<style scoped>
.tab-content {
  padding: 0;
}

.setting-description {
  margin: 16px 0;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  color: #606266;
  line-height: 1.6;
}

.rate-limit-settings {
  margin-top: 20px;
}

.limit-item {
  margin-bottom: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.limit-header {
  padding: 12px 15px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}

.limit-content {
  padding: 15px;
}

.limit-switch-row {
  display: flex;
  align-items: center;
}

.required-marker {
  color: #f56c6c;
  margin-right: 5px;
}

.limit-label {
  margin-right: 12px;
  flex-shrink: 0;
}

.threshold-row {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.threshold-label {
  margin-right: 10px;
}

.threshold-input {
  width: 150px;
}

.threshold-unit {
  margin-left: 10px;
}

.whitelist-row {
  margin-top: 10px;
}
</style> 