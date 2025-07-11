<template>
  <div>
    <el-drawer
      v-model="drawerVisible"
      title="安全防护"
      size="60%"
      :destroy-on-close="false"
      :before-close="handleClose"
      custom-class="security-config-drawer"
    >
      <div class="security-drawer-content" v-loading="loading">
        <div class="security-menu">
          <div class="menu-wrapper">
            <div 
              v-for="(item, index) in menuItems" 
              :key="index" 
              class="menu-item" 
              :class="{ active: activeTab === item.key }"
              @click="handleTabChange(item.key)"
            >
              {{ item.label }}
            </div>
          </div>
        </div>
        
        <div class="security-content">
          <!-- ICMP禁用 -->
          <div v-show="activeTab === 'icmp'" class="tab-content">
            <IpProtectionIcmpBlockTab
              v-model:config="securityConfig.icmp"
            />
          </div>
          
          <!-- 黑白名单 -->
          <div v-show="activeTab === 'blackwhitelist'" class="tab-content">
            <IpProtectionBlackWhiteListTab
              v-model:config="securityConfig.blackWhiteList"
            />
          </div>
          
          <!-- 区域封禁 -->
          <div v-show="activeTab === 'regionblock'" class="tab-content">
            <IpProtectionRegionBlockTab
              v-model:config="securityConfig.regionBlock"
            />
          </div>
          
          <!-- 源限速 -->
          <div v-show="activeTab === 'ratelimit'" class="tab-content">
            <IpProtectionRateLimitTab
              v-model:config="securityConfig.rateLimit"
            />
          </div>
          
          <!-- 反射攻击配置 -->
          <div v-show="activeTab === 'reflection'" class="tab-content">
            <IpProtectionReflectionTab
              v-model="securityConfig.reflection"
            />
          </div>
          
          <!-- 指纹过滤 -->
          <div v-show="activeTab === 'fingerprint'" class="tab-content">
            <IpProtectionFingerprintTab
              v-model="securityConfig.fingerprint"
            />
          </div>
        </div>
      </div>
      
      <div class="drawer-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saveLoading">保存</el-button>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getIpProtectionDetail, updateIpProtectionConfig } from '@/services/ProtectionObjectService'
import IpProtectionIcmpBlockTab from './SecurityTabs/IpProtectionIcmpBlockTab.vue'
import IpProtectionBlackWhiteListTab from './SecurityTabs/IpProtectionBlackWhiteListTab.vue'
import IpProtectionRegionBlockTab from './SecurityTabs/IpProtectionRegionBlockTab.vue'
import IpProtectionRateLimitTab from './SecurityTabs/IpProtectionRateLimitTab.vue'
import IpProtectionReflectionTab from './SecurityTabs/IpProtectionReflectionTab.vue'
import IpProtectionFingerprintTab from './SecurityTabs/IpProtectionFingerprintTab.vue'

// 菜单项
const menuItems = [
  { key: 'icmp', label: 'ICMP禁用' },
  { key: 'blackwhitelist', label: '黑白名单' },
  { key: 'regionblock', label: '区域封禁' },
  { key: 'ratelimit', label: '源限速' },
  { key: 'reflection', label: '反射攻击配置' },
  { key: 'fingerprint', label: '指纹过滤' }
]

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

// 切换标签页
const handleTabChange = (tab) => {
  activeTab.value = tab
}

// 安全配置对象
const securityConfig = reactive({
  // ICMP配置
  icmp: {
    enabled: false,
    types: []
  },
  
  // 黑白名单配置
  blackWhiteList: {
    blacklist: [],
    whitelist: []
  },
  
  // 区域封禁配置
  regionBlock: {
    chinaRegions: [],
    internationalRegions: []
  },
  
  // 源限速配置
  rateLimit: {
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
  },
  
  // 反射攻击配置
  reflection: {
    enabled: false,
    reflectionAttacks: [],
    customRules: []
  },
  
  // 指纹过滤配置
  fingerprint: {
    enabled: false,
    rules: []
  }
})

// 获取防护对象详情
const fetchProtectionDetail = async () => {
  if (!props.protectionId) return
  
  loading.value = true
  try {
    const res = await getIpProtectionDetail(props.protectionId)
    if (res.code === 200 && res.data) {
      // 设置ICMP配置
      if (res.data.securityConfig && res.data.securityConfig.icmp) {
        securityConfig.icmp = {
          enabled: res.data.securityConfig.icmp.enabled || false,
          types: res.data.securityConfig.icmp.types || []
        }
      }
      
      // 设置黑白名单数据
      if (res.data.securityConfig) {
        securityConfig.blackWhiteList = {
          blacklist: res.data.securityConfig.blacklist || [],
          whitelist: res.data.securityConfig.whitelist || []
        }
      }
      
      // 设置区域封禁数据
      if (res.data.securityConfig && res.data.securityConfig.regionBlock) {
        securityConfig.regionBlock = {
          chinaRegions: res.data.securityConfig.regionBlock.chinaRegions || [],
          internationalRegions: res.data.securityConfig.regionBlock.internationalRegions || []
        }
      }
      
      // 设置源限速数据
      if (res.data.securityConfig && res.data.securityConfig.rateLimit) {
        try {
          // 检查是否为旧版数据结构
          if (res.data.securityConfig.rateLimit.pps === undefined) {
            // 旧版数据结构
            const oldRateLimit = res.data.securityConfig.rateLimit;
            securityConfig.rateLimit = {
              pps: {
                enabled: oldRateLimit.type === 'pps' && oldRateLimit.enabled,
                threshold: oldRateLimit.type === 'pps' ? oldRateLimit.threshold : 1000,
                enableWhitelist: false
              },
              bps: {
                enabled: oldRateLimit.type === 'bps' && oldRateLimit.enabled,
                threshold: oldRateLimit.type === 'bps' ? oldRateLimit.threshold : 10240,
                enableWhitelist: false
              },
              synPps: {
                enabled: oldRateLimit.type === 'synpps' && oldRateLimit.enabled,
                threshold: oldRateLimit.type === 'synpps' ? oldRateLimit.threshold : 100,
                enableWhitelist: false
              },
              synBps: {
                enabled: oldRateLimit.type === 'synbps' && oldRateLimit.enabled,
                threshold: oldRateLimit.type === 'synbps' ? oldRateLimit.threshold : 10240,
                enableWhitelist: false
              }
            };
          } else {
            // 新版数据结构
            securityConfig.rateLimit = {
              pps: {
                enabled: res.data.securityConfig.rateLimit.pps?.enabled || false,
                threshold: res.data.securityConfig.rateLimit.pps?.threshold || 1000,
                enableWhitelist: res.data.securityConfig.rateLimit.pps?.enableWhitelist || false
              },
              bps: {
                enabled: res.data.securityConfig.rateLimit.bps?.enabled || false,
                threshold: res.data.securityConfig.rateLimit.bps?.threshold || 10240,
                enableWhitelist: res.data.securityConfig.rateLimit.bps?.enableWhitelist || false
              },
              synPps: {
                enabled: res.data.securityConfig.rateLimit.synPps?.enabled || false,
                threshold: res.data.securityConfig.rateLimit.synPps?.threshold || 100,
                enableWhitelist: res.data.securityConfig.rateLimit.synPps?.enableWhitelist || false
              },
              synBps: {
                enabled: res.data.securityConfig.rateLimit.synBps?.enabled || false,
                threshold: res.data.securityConfig.rateLimit.synBps?.threshold || 10240,
                enableWhitelist: res.data.securityConfig.rateLimit.synBps?.enableWhitelist || false
              },
              whitelist: res.data.securityConfig.rateLimit.whitelist || []
            };
          }
        } catch (e) {
          console.error('解析源限速数据出错:', e);
          // 使用默认配置
          securityConfig.rateLimit = {
            pps: { enabled: false, threshold: 1000, enableWhitelist: false },
            bps: { enabled: false, threshold: 10240, enableWhitelist: false },
            synPps: { enabled: false, threshold: 100, enableWhitelist: false },
            synBps: { enabled: false, threshold: 10240, enableWhitelist: false },
            whitelist: []
          };
        }
      }
      
      // 设置反射攻击配置数据
      if (res.data.securityConfig && res.data.securityConfig.reflection) {
        securityConfig.reflection = res.data.securityConfig.reflection;
      }
      
      // 设置指纹过滤配置数据
      if (res.data.securityConfig && res.data.securityConfig.fingerprint) {
        securityConfig.fingerprint = res.data.securityConfig.fingerprint;
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

// 保存配置
const handleSave = async () => {
  if (!props.protectionId) {
    ElMessage.error('参数错误：缺少防护对象ID')
    return
  }
  
  try {
    saveLoading.value = true
    
    // 构建保存数据
    const submitData = {
      id: props.protectionId,
      securityConfig: {
        icmp: securityConfig.icmp,
        blacklist: securityConfig.blackWhiteList.blacklist,
        whitelist: securityConfig.blackWhiteList.whitelist,
        regionBlock: securityConfig.regionBlock,
        rateLimit: securityConfig.rateLimit,
        reflection: securityConfig.reflection,
        fingerprint: securityConfig.fingerprint
      }
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
  display: flex;
  height: calc(100vh - 140px);
}

.security-menu {
  width: 80px;
  border-right: 1px solid #e6e6e6;
  overflow-y: auto;
  flex-shrink: 0;
}

.menu-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.menu-item {
  padding: 8px 4px;
  font-size: 12px;
  text-align: center;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  color: #606266;
  line-height: 1.3;
}

.menu-item:hover {
  background-color: #f5f7fa;
}

.menu-item.active {
  color: #409eff;
  background-color: #ecf5ff;
  border-right: 2px solid #409eff;
}

.security-content {
  flex: 1;
  padding: 0 10px;
  overflow-y: auto;
}

.tab-content {
  height: 100%;
}

.drawer-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px 20px;
  background-color: #fff;
  border-top: 1px solid #e6e6e6;
  text-align: right;
}
</style> 