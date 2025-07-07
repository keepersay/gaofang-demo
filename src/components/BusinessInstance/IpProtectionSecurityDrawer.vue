<template>
  <div>
    <el-drawer
      v-model="drawerVisible"
      title="安全防护"
      size="50%"
      :destroy-on-close="false"
      :before-close="handleClose"
      custom-class="security-config-drawer"
    >
      <div class="security-drawer-content" v-loading="loading">
        <div class="security-tabs-container">
          <el-tabs tab-position="left" v-model="activeTab" class="security-tabs">
            <el-tab-pane label="ICMP禁用" name="icmp">
              <IpProtectionIcmpBlockTab
                v-model:config="securityConfig.icmp"
              />
            </el-tab-pane>
            
            <el-tab-pane label="黑白名单" name="blackwhitelist">
              <IpProtectionBlackWhiteListTab
                v-model:config="securityConfig.blackWhiteList"
              />
            </el-tab-pane>
            
            <el-tab-pane label="区域封禁" name="regionblock">
              <IpProtectionRegionBlockTab
                v-model:config="securityConfig.regionBlock"
              />
            </el-tab-pane>
            
            <el-tab-pane label="源限速" name="ratelimit">
              <IpProtectionRateLimitTab
                v-model:config="securityConfig.rateLimit"
              />
            </el-tab-pane>
            
            <el-tab-pane label="反射攻击配置" name="reflection">
              <IpProtectionReflectionTab
                v-model="securityConfig.reflection"
              />
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
        reflection: securityConfig.reflection
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
</style> 