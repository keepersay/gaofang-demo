<template>
  <div class="tab-content">
    <h3>源限速</h3>
    
    <div class="setting-description">
      以目的IP颗粒度，对访问频率超出阈值的源IP地址进行限速。
      访问速率未超出阈值的源IP地址，访问不受影响。
      源限速类型为 bps/pps/synbps/synpps 四种类型，针对源限速还可以支持拉黑处理。
    </div>
    
    <div class="rate-limit-settings">
      <div class="limit-switch-row">
        <span class="limit-label">启用源限速：</span>
        <el-switch v-model="rateLimit.enabled" @change="updateConfig" />
      </div>
      
      <div v-if="rateLimit.enabled" class="limit-settings-container">
        <div class="limit-type-row">
          <span class="limit-label">限速类型：</span>
          <el-radio-group v-model="rateLimit.type" @change="updateConfig">
            <el-radio label="bps">bps</el-radio>
            <el-radio label="pps">pps</el-radio>
            <el-radio label="synbps">synbps</el-radio>
            <el-radio label="synpps">synpps</el-radio>
          </el-radio-group>
        </div>
        
        <div class="limit-threshold-row">
          <span class="limit-label">限速阈值：</span>
          <el-input-number 
            v-model="rateLimit.threshold" 
            :min="1" 
            :max="100000"
            @change="updateConfig"
          />
          <span class="limit-unit">{{ getUnitByType(rateLimit.type) }}</span>
        </div>
        
        <div class="limit-action-row">
          <span class="limit-label">超限行为：</span>
          <el-radio-group v-model="rateLimit.action" @change="updateConfig">
            <el-radio label="limit">限速</el-radio>
            <el-radio label="block">拉黑</el-radio>
          </el-radio-group>
        </div>
        
        <div class="block-time-row" v-if="rateLimit.action === 'block'">
          <span class="limit-label">拉黑时长：</span>
          <el-select v-model="rateLimit.blockTime" @change="updateConfig" style="width: 150px;">
            <el-option
              v-for="item in blockTimeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <div v-if="rateLimit.blockTime === 'custom'" class="custom-block-time">
            <el-input-number 
              v-model="rateLimit.customBlockTime" 
              :min="1" 
              :max="1440"
              @change="updateConfig"
              style="width: 120px;"
            />
            <span class="limit-unit">分钟</span>
          </div>
        </div>
        
        <div class="limit-whitelist-row">
          <span class="limit-label">白名单：</span>
          <div class="whitelist-input-container">
            <el-input
              v-model="whitelistInput"
              type="textarea"
              :rows="4"
              placeholder="请输入IP白名单，多个IP请用换行分隔"
            />
            <div class="whitelist-tip">
              源限速白名单中的IP不受源限速规则限制，多个IP请用换行分隔
            </div>
            <div class="whitelist-actions">
              <el-button type="primary" size="small" @click="addToWhitelist">添加</el-button>
            </div>
          </div>
        </div>
        
        <div class="whitelist-table-container" v-if="rateLimit.whitelist.length > 0">
          <h4>已添加的白名单</h4>
          <el-table
            :data="rateLimit.whitelist"
            style="width: 100%"
            border
            stripe
          >
            <el-table-column prop="ip" label="IP" min-width="180" />
            <el-table-column prop="addTime" label="添加时间" width="180" />
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="scope">
                <el-button
                  type="danger"
                  size="small"
                  @click="removeFromWhitelist(scope.row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({
  config: {
    type: Object,
    default: () => ({
      enabled: false,
      type: 'pps',
      threshold: 1000,
      action: 'limit',
      blockTime: '5',
      customBlockTime: 5,
      whitelist: []
    })
  }
})

const emit = defineEmits(['update:config'])

// 本地状态
const rateLimit = reactive({
  enabled: props.config?.enabled || false,
  type: props.config?.type || 'pps',
  threshold: props.config?.threshold || 1000,
  action: props.config?.action || 'limit',
  blockTime: props.config?.blockTime || '5',
  customBlockTime: props.config?.customBlockTime || 5,
  whitelist: []
})

const whitelistInput = ref('')

// 拉黑时长选项
const blockTimeOptions = [
  { label: '5分钟', value: '5' },
  { label: '10分钟', value: '10' },
  { label: '30分钟', value: '30' },
  { label: '1小时', value: '60' },
  { label: '2小时', value: '120' },
  { label: '6小时', value: '360' },
  { label: '12小时', value: '720' },
  { label: '1天', value: '1440' },
  { label: '自定义', value: 'custom' }
]

// 根据限速类型获取单位
const getUnitByType = (type) => {
  switch (type) {
    case 'bps':
      return 'bps';
    case 'pps':
      return 'pps';
    case 'synbps':
      return 'syn/bps';
    case 'synpps':
      return 'syn/pps';
    default:
      return '';
  }
}

// 更新配置
const updateConfig = () => {
  emit('update:config', {
    enabled: rateLimit.enabled,
    type: rateLimit.type,
    threshold: rateLimit.threshold,
    action: rateLimit.action,
    blockTime: rateLimit.blockTime,
    customBlockTime: rateLimit.customBlockTime,
    whitelist: rateLimit.whitelist
  })
}

// 添加到白名单
const addToWhitelist = () => {
  if (!whitelistInput.value.trim()) {
    ElMessage.warning('请输入IP地址')
    return
  }
  
  // 解析IP列表
  const ips = whitelistInput.value.split(/[\n,，\s]+/).filter(ip => ip.trim())
  
  if (ips.length === 0) {
    ElMessage.warning('请输入有效的IP')
    return
  }
  
  // 验证IP格式
  const invalidIps = ips.filter(ip => !isValidIp(ip))
  if (invalidIps.length > 0) {
    ElMessage.warning(`以下IP格式无效: ${invalidIps.join(', ')}`)
    return
  }
  
  // 添加到白名单
  let addedCount = 0
  ips.forEach(ip => {
    if (!rateLimit.whitelist.some(item => item.ip === ip)) {
      rateLimit.whitelist.push({
        ip,
        addTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
      })
      addedCount++
    }
  })
  
  if (addedCount > 0) {
    ElMessage.success(`成功添加 ${addedCount} 个IP到白名单`)
    whitelistInput.value = ''
    updateConfig()
  } else {
    ElMessage.warning('所有IP已存在于白名单中')
  }
}

// 从白名单移除
const removeFromWhitelist = (row) => {
  ElMessageBox.confirm(
    `确定要从白名单中删除 ${row.ip} 吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    const index = rateLimit.whitelist.findIndex(item => item.ip === row.ip)
    if (index !== -1) {
      rateLimit.whitelist.splice(index, 1)
      updateConfig()
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

// 验证IP地址格式
const isValidIp = (ip) => {
  // IPv4格式验证
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
  // IPv6格式验证
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
  // CIDR格式验证
  const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/
  
  if (ipv4Regex.test(ip)) {
    // 验证IPv4各段数值
    return ip.split('.').every(segment => parseInt(segment) <= 255)
  } else if (ipv6Regex.test(ip)) {
    return true
  } else if (cidrRegex.test(ip)) {
    const [ipPart, prefixPart] = ip.split('/')
    const isValidIpPart = ipPart.split('.').every(segment => parseInt(segment) <= 255)
    const isValidPrefix = parseInt(prefixPart) >= 0 && parseInt(prefixPart) <= 32
    return isValidIpPart && isValidPrefix
  }
  
  return false
}

// 初始化数据
const initFromProps = () => {
  if (props.config) {
    rateLimit.enabled = props.config.enabled || false
    rateLimit.type = props.config.type || 'pps'
    rateLimit.threshold = props.config.threshold || 1000
    rateLimit.action = props.config.action || 'limit'
    rateLimit.blockTime = props.config.blockTime || '5'
    rateLimit.customBlockTime = props.config.customBlockTime || 5
    rateLimit.whitelist = [...(props.config.whitelist || [])]
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

.limit-switch-row,
.limit-type-row,
.limit-threshold-row,
.limit-action-row,
.block-time-row,
.limit-whitelist-row {
  display: flex;
  margin-bottom: 20px;
  align-items: center;
}

.limit-label {
  width: 100px;
  margin-right: 12px;
  flex-shrink: 0;
}

.limit-unit {
  margin-left: 10px;
}

.limit-settings-container {
  margin-top: 20px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.custom-block-time {
  margin-top: 10px;
  margin-left: 112px;
  display: flex;
  align-items: center;
}

.whitelist-input-container {
  flex: 1;
}

.whitelist-tip {
  margin-top: 5px;
  font-size: 12px;
  color: #909399;
}

.whitelist-actions {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}

.whitelist-table-container {
  margin-top: 20px;
}

.whitelist-table-container h4 {
  margin-bottom: 10px;
}
</style> 