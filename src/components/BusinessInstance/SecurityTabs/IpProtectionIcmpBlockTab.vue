<template>
  <div class="tab-content">
    <h3>ICMP封禁</h3>
    
    <div class="icmp-block-form">
      <el-form :model="icmpConfig" label-position="top">
        <el-form-item label="ICMP封禁">
          <el-switch
            v-model="icmpConfig.enabled"
            active-text="开启"
            inactive-text="关闭"
            @change="updateConfig"
          />
        </el-form-item>
        
        <el-form-item label="ICMP类型" v-if="icmpConfig.enabled">
          <el-select
            v-model="icmpConfig.types"
            multiple
            collapse-tags
            placeholder="请选择ICMP类型"
            style="width: 100%"
            @change="updateConfig"
          >
            <el-option
              v-for="item in icmpTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      
      <div class="description" v-if="icmpConfig.enabled">
        <p>ICMP封禁说明：</p>
        <ul>
          <li>开启ICMP封禁后，将拒绝所选ICMP类型的请求</li>
          <li>Echo Request (类型8): ping请求</li>
          <li>Echo Reply (类型0): ping响应</li>
          <li>Destination Unreachable (类型3): 目标不可达</li>
          <li>Source Quench (类型4): 源抑制</li>
          <li>Redirect (类型5): 重定向</li>
          <li>Time Exceeded (类型11): 超时</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  config: {
    type: Object,
    default: () => ({
      enabled: false,
      types: []
    })
  }
})

const emit = defineEmits(['update:config'])

// ICMP类型选项
const icmpTypeOptions = [
  { value: 0, label: 'Echo Reply (类型0)' },
  { value: 3, label: 'Destination Unreachable (类型3)' },
  { value: 4, label: 'Source Quench (类型4)' },
  { value: 5, label: 'Redirect (类型5)' },
  { value: 8, label: 'Echo Request (类型8)' },
  { value: 11, label: 'Time Exceeded (类型11)' },
  { value: 12, label: 'Parameter Problem (类型12)' },
  { value: 13, label: 'Timestamp (类型13)' },
  { value: 14, label: 'Timestamp Reply (类型14)' },
  { value: 17, label: 'Address Mask Request (类型17)' },
  { value: 18, label: 'Address Mask Reply (类型18)' }
]

// 本地状态
const icmpConfig = reactive({
  enabled: props.config?.enabled || false,
  types: props.config?.types || []
})

// 更新配置并向父组件发送事件
const updateConfig = () => {
  emit('update:config', {
    enabled: icmpConfig.enabled,
    types: icmpConfig.types
  })
}

// 监听props变化
watch(() => props.config, (newVal) => {
  if (newVal) {
    icmpConfig.enabled = newVal.enabled
    icmpConfig.types = newVal.types || []
  }
}, { deep: true })
</script>

<style scoped>
.tab-content {
  padding: 0;
}

.icmp-block-form {
  margin-top: 20px;
}

.description {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  font-size: 14px;
  color: #606266;
}

.description ul {
  padding-left: 20px;
  margin-top: 10px;
}

.description li {
  margin-bottom: 5px;
}
</style> 