<template>
  <div>
    <el-drawer
      v-model="drawerVisible"
      title="安全防护配置"
      size="50%"
      :destroy-on-close="false"
      :before-close="handleClose"
      custom-class="security-config-drawer"
    >
      <div class="security-drawer-content" v-loading="loading">
        <div class="security-tabs-container">
          <el-tabs tab-position="left" v-model="activeTab" class="security-tabs">
            <el-tab-pane label="ICMP禁用" name="icmp">
              <div class="tab-content">
                <h3>ICMP协议禁用</h3>
                <div class="setting-description">
                  在清洗时丢弃ICMP协议，可以减少服务器被探测风险，并过滤ICMP攻击（开启后对白名单中IP也会生效）。
                </div>
                <div class="setting-control">
                  <div class="control-item">
                    <span class="control-label">启用ICMP禁用：</span>
                    <el-switch
                      v-model="icmpConfig.enabled"
                      active-color="#13ce66"
                      inactive-color="#ff4949"
                    />
                  </div>
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="黑白名单" name="blackwhitelist">
              <div class="tab-content">
                <h3>黑白名单</h3>
                
                <!-- 黑白名单标签页 -->
                <el-tabs v-model="blacklistWhitelistTab" @tab-click="handleBlackWhiteListTabChange">
                  <el-tab-pane label="黑名单" name="blacklist">
                    <div class="list-header">
                      <div class="list-actions">
                        <el-button type="primary" size="small" @click="openBlacklistConfigDialog">手动添加</el-button>
                        <el-input
                          v-model="searchIp"
                          placeholder="请输入IP进行精确查询"
                          style="width: 220px; margin: 0 10px;"
                          size="small"
                          clearable
                        >
                          <template #append>
                            <el-button @click="handleSearch">
                              <el-icon><Search /></el-icon>
                            </el-button>
                          </template>
                        </el-input>
                        <el-button type="primary" size="small" @click="openTimeoutDialog">超时时间设置</el-button>
                      </div>
                      <div class="list-info">
                        <span v-if="blacklistExpireTime">黑名单超时时间: {{ blacklistExpireTime }}</span>
                      </div>
                    </div>
                    
                    <el-table
                      :data="blacklistData"
                      style="width: 100%; margin-top: 10px;"
                      @selection-change="(selection) => selectedIps = selection.map(item => item.ip)"
                    >
                      <el-table-column type="selection" width="55" />
                      <el-table-column prop="ip" label="IP" />
                      <el-table-column prop="addTime" label="添加时间" width="180" />
                      <el-table-column label="操作" width="100">
                        <template #default="scope">
                          <el-button
                            type="danger"
                            size="small"
                            @click="deleteIp(scope.row)"
                          >
                            删除
                          </el-button>
                        </template>
                      </el-table-column>
                    </el-table>
                    
                    <div class="list-footer" v-if="blacklistData.length > 0">
                      <el-button 
                        type="danger" 
                        size="small" 
                        :disabled="selectedIps.length === 0"
                        @click="batchDelete"
                      >
                        批量删除
                      </el-button>
                      <el-button 
                        type="danger" 
                        size="small" 
                        @click="clearList"
                      >
                        清空黑名单
                      </el-button>
                    </div>
                    
                    <div class="empty-text" v-else>
                      没有查询到符合条件的记录
                    </div>
                  </el-tab-pane>
                  
                  <el-tab-pane label="白名单" name="whitelist">
                    <div class="list-header">
                      <div class="list-actions">
                        <el-button type="primary" size="small" @click="openBlacklistConfigDialog">手动添加</el-button>
                        <el-input
                          v-model="searchIp"
                          placeholder="请输入IP进行精确查询"
                          style="width: 220px; margin: 0 10px;"
                          size="small"
                          clearable
                        >
                          <template #append>
                            <el-button @click="handleSearch">
                              <el-icon><Search /></el-icon>
                            </el-button>
                          </template>
                        </el-input>
                      </div>
                    </div>
                    
                    <el-table
                      :data="whitelistData"
                      style="width: 100%; margin-top: 10px;"
                      @selection-change="(selection) => selectedIps = selection.map(item => item.ip)"
                    >
                      <el-table-column type="selection" width="55" />
                      <el-table-column prop="ip" label="IP" />
                      <el-table-column prop="addTime" label="添加时间" width="180" />
                      <el-table-column label="操作" width="100">
                        <template #default="scope">
                          <el-button
                            type="danger"
                            size="small"
                            @click="deleteIp(scope.row)"
                          >
                            删除
                          </el-button>
                        </template>
                      </el-table-column>
                    </el-table>
                    
                    <div class="list-footer" v-if="whitelistData.length > 0">
                      <el-button 
                        type="danger" 
                        size="small" 
                        :disabled="selectedIps.length === 0"
                        @click="batchDelete"
                      >
                        批量删除
                      </el-button>
                      <el-button 
                        type="danger" 
                        size="small" 
                        @click="clearList"
                      >
                        清空白名单
                      </el-button>
                    </div>
                    
                    <div class="empty-text" v-else>
                      没有查询到符合条件的记录
                    </div>
                  </el-tab-pane>
                </el-tabs>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="区域封禁" name="regionblock">
              <div class="tab-content">
                <h3>区域封禁</h3>
                <div class="placeholder-content">
                  此功能模块待实现
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="源限速" name="ratelimit">
              <div class="tab-content">
                <h3>源限速</h3>
                <div class="placeholder-content">
                  此功能模块待实现
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="反射攻击配置" name="reflection">
              <div class="tab-content">
                <h3>反射攻击配置</h3>
                <div class="placeholder-content">
                  此功能模块待实现
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="指纹过滤" name="fingerprint">
              <div class="tab-content">
                <h3>指纹过滤</h3>
                <div class="placeholder-content">
                  此功能模块待实现
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
        
        <div class="drawer-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="handleSave" :loading="saveLoading">保存</el-button>
        </div>
      </div>
    </el-drawer>
    
    <!-- 黑名单超时时间设置对话框 -->
    <el-dialog
      v-model="timeoutDialogVisible"
      title="超时时间设置"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="timeout-dialog-content">
        <div class="timeout-description">
          更新时间后，所有黑名单生效时间将从当前时刻全部刷新。
        </div>
        <div class="timeout-item">
          <span class="timeout-label">黑名单超时时间</span>
          <span class="timeout-value">{{ blacklistExpireTime || '未设置' }}</span>
        </div>
        <div class="timeout-item">
          <span class="timeout-label">超时时间设置</span>
          <el-select v-model="blacklistTimeout" @change="handleTimeoutChange" style="width: 140px;">
            <el-option
              v-for="item in blacklistTimeoutOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        <div class="timeout-item" v-if="blacklistTimeout === 'custom'">
          <span class="timeout-label"></span>
          <el-input-number 
            v-model="customTimeout" 
            :min="5" 
            :max="43200" 
            size="small" 
            style="width: 140px;"
          />
          <span class="timeout-unit">分钟 (配置范围5~43200)</span>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="timeoutDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveTimeout">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 黑名单配置对话框 -->
    <el-dialog
      v-model="blacklistConfigDialogVisible"
      :title="blacklistWhitelistTab === 'blacklist' ? '黑名单配置' : '白名单配置'"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="blacklist-config-content">
        <el-input
          v-model="blacklistConfigText"
          type="textarea"
          :rows="10"
          placeholder="多个地址请用换行、逗号或空格分隔，最多可添加2000个IP"
        />
        <div class="blacklist-config-tip">
          多个地址请用换行、逗号或空格分隔，黑名单最多支持添加2000个IP
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="blacklistConfigDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addBlacklist">添加</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getIpProtectionDetail, updateIpProtectionConfig } from '@/services/ProtectionObjectService'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  protectionId: {
    type: [Number, String],
    default: null
  }
})

const emit = defineEmits(['update:visible', 'success'])

// 抽屉可见性
const drawerVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

// 加载状态
const loading = ref(false)
const saveLoading = ref(false)

// 当前激活的标签页
const activeTab = ref('icmp')

// ICMP配置
const icmpConfig = reactive({
  enabled: false
})

// 黑白名单配置
const blacklistWhitelistTab = ref('blacklist') // 当前选中的黑白名单标签页：blacklist/whitelist
const blacklistData = ref([]) // 黑名单数据
const whitelistData = ref([]) // 白名单数据
const blacklistExpireTime = ref('') // 黑名单超时时间
const selectedIps = ref([]) // 选中的IP列表
const searchIp = ref('') // 搜索IP
const blacklistTimeout = ref('10') // 黑名单超时时间
const blacklistTimeoutUnit = ref('minute') // 黑名单超时时间单位
const customTimeout = ref(10) // 自定义超时时间
const blacklistTimeoutOptions = [
  { label: '5分钟', value: '5', unit: 'minute' },
  { label: '10分钟', value: '10', unit: 'minute' },
  { label: '30分钟', value: '30', unit: 'minute' },
  { label: '60分钟', value: '60', unit: 'minute' },
  { label: '1天', value: '1', unit: 'day' },
  { label: '3天', value: '3', unit: 'day' },
  { label: '7天', value: '7', unit: 'day' },
  { label: '30天', value: '30', unit: 'day' },
  { label: '永久生效', value: 'permanent', unit: 'permanent' },
  { label: '自定义', value: 'custom', unit: 'custom' }
]

// 黑名单超时时间设置对话框可见性
const timeoutDialogVisible = ref(false)

// 黑名单配置对话框可见性
const blacklistConfigDialogVisible = ref(false)

// 黑名单配置文本域
const blacklistConfigText = ref('')

// 获取防护对象详情
const fetchProtectionDetail = async () => {
  if (!props.protectionId) return
  
  loading.value = true
  try {
    const res = await getIpProtectionDetail(props.protectionId)
    if (res.code === 200 && res.data) {
      // 设置ICMP配置
      if (res.data.securityConfig && res.data.securityConfig.icmp) {
        icmpConfig.enabled = res.data.securityConfig.icmp.enabled
      }
      
      // 设置黑白名单数据
      if (res.data.securityConfig) {
        blacklistData.value = res.data.securityConfig.blacklist || []
        whitelistData.value = res.data.securityConfig.whitelist || []
        blacklistExpireTime.value = res.data.securityConfig.blacklistExpireTime || ''
      }
    } else {
      ElMessage.error(res.message || '获取防护对象详情失败')
    }
  } catch (error) {
    console.error('获取防护对象详情失败:', error)
    ElMessage.error('获取防护对象详情失败')
  } finally {
    loading.value = false
  }
}

// 搜索黑/白名单
const handleSearch = () => {
  // 根据当前标签页搜索
  if (!searchIp.value) return
  
  // 实际项目中应该调用API，这里简化处理，只进行前端过滤
  if (blacklistWhitelistTab.value === 'blacklist') {
    return blacklistData.value.filter(item => item.ip.includes(searchIp.value))
  } else {
    return whitelistData.value.filter(item => item.ip.includes(searchIp.value))
  }
}

// 处理黑白名单标签页切换
const handleBlackWhiteListTabChange = (tab) => {
  blacklistWhitelistTab.value = tab
  selectedIps.value = []
}

// 打开超时时间设置对话框
const openTimeoutDialog = () => {
  timeoutDialogVisible.value = true
}

// 处理超时时间设置
const handleTimeoutChange = (value) => {
  if (value === 'custom') {
    // 自定义时间
    blacklistTimeout.value = 'custom'
  } else {
    blacklistTimeout.value = value
    blacklistTimeoutUnit.value = blacklistTimeoutOptions.find(item => item.value === value)?.unit || 'minute'
  }
}

// 保存超时时间设置
const saveTimeout = () => {
  // 构建超时时间
  let timeout = 0
  
  if (blacklistTimeout.value === 'permanent') {
    // 永久生效
    timeout = -1
  } else if (blacklistTimeout.value === 'custom') {
    // 自定义时间
    if (customTimeout.value < 5 || customTimeout.value > 43200) {
      ElMessage.warning('自定义时间必须在5~43200分钟之间')
      return
    }
    timeout = customTimeout.value
  } else {
    // 预设时间
    const value = parseInt(blacklistTimeout.value)
    if (blacklistTimeoutUnit.value === 'minute') {
      timeout = value
    } else if (blacklistTimeoutUnit.value === 'day') {
      timeout = value * 24 * 60
    }
  }
  
  // 设置黑名单过期时间
  const now = new Date()
  if (timeout === -1) {
    // 永久生效
    blacklistExpireTime.value = '永久生效'
  } else {
    const expireTime = new Date(now.getTime() + timeout * 60 * 1000)
    blacklistExpireTime.value = expireTime.toISOString().replace('T', ' ').substring(0, 19)
  }
  
  timeoutDialogVisible.value = false
  ElMessage.success('超时时间设置成功')
}

// 打开黑名单配置对话框
const openBlacklistConfigDialog = () => {
  blacklistConfigText.value = ''
  blacklistConfigDialogVisible.value = true
}

// 添加黑名单
const addBlacklist = () => {
  if (!blacklistConfigText.value.trim()) {
    ElMessage.warning('请输入要添加的IP')
    return
  }
  
  // 解析IP列表
  const ips = blacklistConfigText.value.split(/[\n,，\s]+/).filter(ip => ip.trim())
  
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
  
  // 添加到黑名单
  ips.forEach(ip => {
    if (!blacklistData.value.some(item => item.ip === ip)) {
      blacklistData.value.push({
        ip,
        addTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
      })
    }
  })
  
  blacklistConfigDialogVisible.value = false
  ElMessage.success(`成功添加 ${ips.length} 个IP到黑名单`)
}

// 验证IP地址格式
const isValidIp = (ip) => {
  // IPv4格式验证
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
  // IPv6格式验证
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
  
  if (ipv4Regex.test(ip)) {
    // 验证IPv4各段数值
    return ip.split('.').every(segment => parseInt(segment) <= 255)
  } else if (ipv6Regex.test(ip)) {
    return true
  }
  
  return false
}

// 删除黑/白名单中的IP
const deleteIp = (row) => {
  ElMessageBox.confirm(
    `确定要从${blacklistWhitelistTab.value === 'blacklist' ? '黑' : '白'}名单中删除 ${row.ip} 吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    if (blacklistWhitelistTab.value === 'blacklist') {
      blacklistData.value = blacklistData.value.filter(item => item.ip !== row.ip)
    } else {
      whitelistData.value = whitelistData.value.filter(item => item.ip !== row.ip)
    }
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 批量删除
const batchDelete = () => {
  if (selectedIps.value.length === 0) {
    ElMessage.warning('请至少选择一条记录')
    return
  }
  
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedIps.value.length} 条记录吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    if (blacklistWhitelistTab.value === 'blacklist') {
      blacklistData.value = blacklistData.value.filter(item => !selectedIps.value.includes(item.ip))
    } else {
      whitelistData.value = whitelistData.value.filter(item => !selectedIps.value.includes(item.ip))
    }
    selectedIps.value = []
    ElMessage.success('批量删除成功')
  }).catch(() => {})
}

// 清空黑/白名单
const clearList = () => {
  ElMessageBox.confirm(
    `确定要清空${blacklistWhitelistTab.value === 'blacklist' ? '黑' : '白'}名单吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    if (blacklistWhitelistTab.value === 'blacklist') {
      blacklistData.value = []
    } else {
      whitelistData.value = []
    }
    ElMessage.success('清空成功')
  }).catch(() => {})
}

// 保存配置
const handleSave = async () => {
  if (!props.protectionId) {
    ElMessage.error('参数错误：缺少防护对象ID')
    return
  }
  
  try {
    saveLoading.value = true
    
    // 构建保存数据
    const securityConfig = {
      icmp: {
        enabled: icmpConfig.enabled
      },
      blacklist: blacklistData.value,
      whitelist: whitelistData.value,
      blacklistExpireTime: blacklistExpireTime.value
      // 其他安全配置...
    }
    
    const submitData = {
      id: props.protectionId,
      securityConfig
    }
    
    // 调用更新接口
    const res = await updateIpProtectionConfig(submitData)
    
    if (res.code === 200) {
      ElMessage.success('保存配置成功')
      emit('success')
      drawerVisible.value = false
    } else {
      ElMessage.error(res.message || '保存失败')
    }
  } catch (error) {
    console.error('保存配置失败:', error)
    ElMessage.error('保存失败，请重试')
  } finally {
    saveLoading.value = false
  }
}

// 关闭抽屉
const handleClose = () => {
  ElMessageBox.confirm(
    '确定要关闭配置页面吗？未保存的修改将会丢失',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    drawerVisible.value = false
  }).catch(() => {})
}

// 监听抽屉可见性变化
onMounted(() => {
  if (drawerVisible.value && props.protectionId) {
    fetchProtectionDetail()
  }
})

// 监听属性变化
watch(
  () => [props.visible, props.protectionId],
  ([newVisible, newId]) => {
    if (newVisible && newId) {
      fetchProtectionDetail()
    }
  }
)
</script>

<style scoped>
.security-config-drawer :deep(.el-drawer__body) {
  padding: 0;
}

.security-drawer-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.security-tabs-container {
  flex: 1;
  overflow: hidden;
}

.security-tabs {
  height: 100%;
  display: flex;
}

.security-tabs :deep(.el-tabs__content) {
  flex: 1;
  padding: 20px;
  overflow: auto;
}

.security-tabs :deep(.el-tabs__header) {
  margin-right: 0;
  border-right: 1px solid #e4e7ed;
}

.security-tabs :deep(.el-tabs__nav) {
  min-width: 150px;
}

.security-tabs :deep(.el-tabs__item) {
  height: 50px;
  line-height: 50px;
  text-align: left;
  padding-left: 20px;
}

.tab-content {
  height: 100%;
}

.placeholder-content {
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
  color: #909399;
  text-align: center;
  margin-top: 20px;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.drawer-footer {
  padding: 10px 20px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #e4e7ed;
}

.setting-description {
  margin: 16px 0;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  color: #606266;
  line-height: 1.6;
}

.setting-control {
  margin-top: 20px;
}

.control-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.control-label {
  width: 150px;
  margin-right: 12px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.list-actions {
  display: flex;
  align-items: center;
}

.list-info {
  margin-left: 10px;
}

.timeout-dialog-content {
  padding: 20px;
}

.timeout-description {
  margin-bottom: 10px;
}

.timeout-item {
  margin-bottom: 10px;
}

.timeout-label {
  margin-right: 10px;
}

.timeout-value {
  font-weight: bold;
}

.timeout-unit {
  margin-left: 10px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

.blacklist-config-content {
  padding: 20px;
}

.blacklist-config-tip {
  margin-top: 10px;
  color: #909399;
}
</style> 