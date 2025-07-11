<template>
  <el-drawer
    v-model="drawerVisible"
    title="域名防护安全配置"
    size="60%"
    :destroy-on-close="false"
    :before-close="handleClose"
  >
    <template #default>
      <div class="security-drawer-content" v-loading="loading">
        <div class="security-menu">
          <el-menu
            :default-active="activeTab"
            class="security-tabs"
            @select="handleTabChange"
          >
            <el-menu-item index="highDefense">高防防护</el-menu-item>
            <el-menu-item index="ccProtection">CC攻击防护</el-menu-item>
            <el-menu-item index="botProtection">BOT攻击防护</el-menu-item>
            <el-menu-item index="scanProtection">扫描防护</el-menu-item>
            <el-menu-item index="regionBlock">区域封禁</el-menu-item>
            <el-menu-item index="requestCompliance">请求合规性检查</el-menu-item>
            <el-menu-item index="cookieProtection">Cookie防护</el-menu-item>
            <el-menu-item index="customRules">自定义规则</el-menu-item>
            <el-menu-item index="infoLeakage">信息防泄露</el-menu-item>
          </el-menu>
        </div>
        
        <div class="security-content">
          <!-- 高防防护 -->
          <div v-show="activeTab === 'highDefense'" class="tab-content">
            <component :is="tabComponents.highDefense" 
              :protection-id="protectionId"
              :protection-data="protectionData"
              @update="handleUpdate"
            />
          </div>
          
          <!-- CC攻击防护 -->
          <div v-show="activeTab === 'ccProtection'" class="tab-content">
            <component :is="tabComponents.ccProtection"
              :protection-id="protectionId"
              :protection-data="protectionData"
              @update="handleUpdate"
            />
          </div>
          
          <!-- BOT攻击防护 -->
          <div v-show="activeTab === 'botProtection'" class="tab-content">
            <component :is="tabComponents.botProtection"
              :protection-id="protectionId"
              :protection-data="protectionData"
              @update="handleUpdate"
            />
          </div>
          
          <!-- 扫描防护 -->
          <div v-show="activeTab === 'scanProtection'" class="tab-content">
            <component :is="tabComponents.scanProtection"
              :protection-id="protectionId"
              :protection-data="protectionData"
              @update="handleUpdate"
            />
          </div>
          
          <!-- 区域封禁 -->
          <div v-show="activeTab === 'regionBlock'" class="tab-content">
            <component :is="tabComponents.regionBlock"
              :protection-id="protectionId"
              :protection-data="protectionData"
              @update="handleUpdate"
            />
          </div>
          
          <!-- 请求合规性检查 -->
          <div v-show="activeTab === 'requestCompliance'" class="tab-content">
            <component :is="tabComponents.requestCompliance"
              :protection-id="protectionId"
              :protection-data="protectionData"
              @update="handleUpdate"
            />
          </div>
          
          <!-- Cookie防护 -->
          <div v-show="activeTab === 'cookieProtection'" class="tab-content">
            <component :is="tabComponents.cookieProtection"
              :protection-id="protectionId"
              :protection-data="protectionData"
              @update="handleUpdate"
            />
          </div>
          
          <!-- 自定义规则 -->
          <div v-show="activeTab === 'customRules'" class="tab-content">
            <component :is="tabComponents.customRules"
              :protection-id="protectionId"
              :protection-data="protectionData"
              @update="handleUpdate"
            />
          </div>
          
          <!-- 信息防泄露 -->
          <div v-show="activeTab === 'infoLeakage'" class="tab-content">
            <component :is="tabComponents.infoLeakage"
              :protection-id="protectionId"
              :protection-data="protectionData"
              @update="handleUpdate"
            />
          </div>
        </div>
      </div>
      
      <div class="drawer-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saveLoading">保存</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref, reactive, computed, watch, defineAsyncComponent } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getDomainProtectionSecurityConfig, updateDomainProtectionSecurityConfig } from '@/services/ProtectionObjectService'

// 异步加载各个Tab组件
const tabComponents = {
  highDefense: defineAsyncComponent(() => import('./SecurityTabs/DomainProtection/HighDefenseTab.vue')),
  ccProtection: defineAsyncComponent(() => import('./SecurityTabs/DomainProtection/CcProtectionTab.vue')),
  botProtection: defineAsyncComponent(() => import('./SecurityTabs/DomainProtection/BotProtectionTab.vue')),
  scanProtection: defineAsyncComponent(() => import('./SecurityTabs/DomainProtection/ScanProtectionTab.vue')),
  regionBlock: defineAsyncComponent(() => import('./SecurityTabs/DomainProtection/RegionBlockTab.vue')),
  requestCompliance: defineAsyncComponent(() => import('./SecurityTabs/DomainProtection/RequestComplianceTab.vue')),
  cookieProtection: defineAsyncComponent(() => import('./SecurityTabs/DomainProtection/CookieProtectionTab.vue')),
  customRules: defineAsyncComponent(() => import('./SecurityTabs/DomainProtection/CustomRulesTab.vue')),
  infoLeakage: defineAsyncComponent(() => import('./SecurityTabs/DomainProtection/InfoLeakageTab.vue'))
}

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
const activeTab = ref('highDefense')

// 保护对象数据
const protectionData = reactive({
  id: null,
  domainName: '',
  securityConfig: {
    highDefense: {
      enabled: false,
      level: 'medium'
    },
    ccProtection: {
      enabled: false,
      // CC防护相关配置
    },
    botProtection: {
      enabled: false,
      // BOT防护相关配置
    },
    scanProtection: {
      enabled: false,
      // 扫描防护相关配置
    },
    regionBlock: {
      enabled: false,
      // 区域封禁相关配置
    },
    requestCompliance: {
      enabled: false,
      // 请求合规性检查相关配置
    },
    cookieProtection: {
      enabled: false,
      // Cookie防护相关配置
    },
    customRules: {
      enabled: false,
      // 自定义规则相关配置
    },
    infoLeakage: {
      enabled: false,
      // 信息防泄露相关配置
    }
  }
})

// 切换标签页
const handleTabChange = (tab) => {
  activeTab.value = tab
}

// 获取域名防护对象安全配置
const fetchSecurityConfig = async () => {
  if (!props.protectionId) return
  
  loading.value = true
  try {
    const res = await getDomainProtectionSecurityConfig(props.protectionId)
    if (res.code === 200) {
      const data = res.data
      
      // 更新保护对象数据
      protectionData.id = data.id
      protectionData.domainName = data.domainName
      
      // 更新安全配置
      if (data.securityConfig) {
        Object.assign(protectionData.securityConfig, data.securityConfig)
      }
    } else {
      ElMessage.error(res.message || '获取域名防护对象安全配置失败')
    }
  } catch (error) {
    console.error('获取域名防护对象安全配置失败:', error)
    ElMessage.error('获取域名防护对象安全配置失败: ' + (error.message || error))
  } finally {
    loading.value = false
  }
}

// 更新配置
const handleUpdate = (tab, data) => {
  if (protectionData.securityConfig[tab]) {
    Object.assign(protectionData.securityConfig[tab], data)
  }
}

// 保存配置
const handleSave = async () => {
  try {
    saveLoading.value = true
    
    // 构建提交数据
    const submitData = {
      id: protectionData.id,
      securityConfig: protectionData.securityConfig
    }
    
    // 调用API
    const res = await updateDomainProtectionSecurityConfig(submitData)
    
    if (res.code === 200) {
      ElMessage.success('保存配置成功')
      emit('success')
      drawerVisible.value = false
    } else {
      ElMessage.error(res.message || '保存配置失败')
    }
  } catch (error) {
    console.error('保存配置失败:', error)
    ElMessage.error('保存配置失败: ' + (error.message || error))
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
watch(() => drawerVisible.value, (val) => {
  if (val) {
    // 打开抽屉时获取数据
    fetchSecurityConfig()
  }
})
</script>

<style scoped>
.security-drawer-content {
  display: flex;
  height: calc(100% - 60px); /* 减去底部按钮区域的高度 */
  overflow: hidden;
}

.security-menu {
  width: 200px;
  border-right: 1px solid #e6e6e6;
  height: 100%;
  overflow-y: auto;
}

.security-tabs {
  border-right: none;
}

.security-content {
  flex: 1;
  padding: 0 20px;
  overflow-y: auto;
}

.tab-content {
  padding: 20px 0;
  height: 100%;
}

.drawer-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px 20px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #e6e6e6;
  background-color: #fff;
}
</style> 