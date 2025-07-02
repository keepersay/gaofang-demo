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
                <h3>ICMP禁用</h3>
                <div class="placeholder-content">
                  此功能模块待实现
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
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

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
  try {
    saveLoading.value = true
    
    // 这里是保存逻辑，目前只是模拟
    setTimeout(() => {
      ElMessage.success('保存配置成功')
      emit('success')
      drawerVisible.value = false
      saveLoading.value = false
    }, 1000)
  } catch (error) {
    console.error('保存配置失败:', error)
    ElMessage.error('保存失败，请重试')
    saveLoading.value = false
  }
}
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