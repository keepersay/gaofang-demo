<template>
  <el-drawer
    v-model="drawerVisible"
    title="安全防护配置"
    size="50%"
    :destroy-on-close="false"
    :before-close="handleClose"
    custom-class="security-config-drawer"
  >
    <template #default>
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
                <div class="placeholder-content">
                  此功能模块待实现
                </div>
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
    </template>
  </el-drawer>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
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
      }
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
</style> 