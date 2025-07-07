<template>
  <div class="tab-content">
    <h3>黑白名单</h3>
    
    <div class="blackwhite-list-container">
      <el-tabs v-model="activeTab" class="list-tabs">
        <el-tab-pane label="黑名单" name="blacklist">
          <div class="list-content">
            <div class="list-header">
              <div class="list-title">IP黑名单</div>
              <el-button type="primary" size="small" @click="showAddBlacklistDialog">
                <el-icon><plus /></el-icon>添加
              </el-button>
            </div>
            
            <div class="list-description">
              黑名单中的IP将被拒绝访问，优先级高于白名单
            </div>
            
            <el-table
              v-loading="loading"
              :data="blacklist"
              style="width: 100%"
              border
              stripe
            >
              <el-table-column prop="ip" label="IP/CIDR" min-width="180" />
              <el-table-column prop="description" label="描述" min-width="180" />
              <el-table-column label="操作" width="120" fixed="right">
                <template #default="scope">
                  <el-button
                    type="danger"
                    size="small"
                    @click="removeBlacklistItem(scope.row)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <div class="empty-placeholder" v-if="!blacklist.length">
              <el-empty description="暂无黑名单数据" />
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="白名单" name="whitelist">
          <div class="list-content">
            <div class="list-header">
              <div class="list-title">IP白名单</div>
              <el-button type="primary" size="small" @click="showAddWhitelistDialog">
                <el-icon><plus /></el-icon>添加
              </el-button>
            </div>
            
            <div class="list-description">
              白名单中的IP将被允许访问，但黑名单优先级更高
            </div>
            
            <el-table
              v-loading="loading"
              :data="whitelist"
              style="width: 100%"
              border
              stripe
            >
              <el-table-column prop="ip" label="IP/CIDR" min-width="180" />
              <el-table-column prop="description" label="描述" min-width="180" />
              <el-table-column label="操作" width="120" fixed="right">
                <template #default="scope">
                  <el-button
                    type="danger"
                    size="small"
                    @click="removeWhitelistItem(scope.row)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <div class="empty-placeholder" v-if="!whitelist.length">
              <el-empty description="暂无白名单数据" />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
      
      <!-- 添加黑名单对话框 -->
      <el-dialog
        v-model="blacklistDialogVisible"
        title="添加黑名单"
        width="500px"
        append-to-body
      >
        <el-form
          ref="blacklistFormRef"
          :model="blacklistForm"
          :rules="formRules"
          label-width="80px"
        >
          <el-form-item label="IP/CIDR" prop="ip">
            <el-input v-model="blacklistForm.ip" placeholder="请输入IP或CIDR格式" />
            <div class="form-tip">支持单个IP(如: 1.2.3.4)或CIDR格式(如: 1.2.3.0/24)</div>
          </el-form-item>
          <el-form-item label="描述" prop="description">
            <el-input v-model="blacklistForm.description" placeholder="请输入描述信息" />
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="blacklistDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="addBlacklistItem">确定</el-button>
          </div>
        </template>
      </el-dialog>
      
      <!-- 添加白名单对话框 -->
      <el-dialog
        v-model="whitelistDialogVisible"
        title="添加白名单"
        width="500px"
        append-to-body
      >
        <el-form
          ref="whitelistFormRef"
          :model="whitelistForm"
          :rules="formRules"
          label-width="80px"
        >
          <el-form-item label="IP/CIDR" prop="ip">
            <el-input v-model="whitelistForm.ip" placeholder="请输入IP或CIDR格式" />
            <div class="form-tip">支持单个IP(如: 1.2.3.4)或CIDR格式(如: 1.2.3.0/24)</div>
          </el-form-item>
          <el-form-item label="描述" prop="description">
            <el-input v-model="whitelistForm.description" placeholder="请输入描述信息" />
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="whitelistDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="addWhitelistItem">确定</el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({
  config: {
    type: Object,
    default: () => ({
      blacklist: [],
      whitelist: []
    })
  }
})

const emit = defineEmits(['update:config'])

// 本地状态
const activeTab = ref('blacklist')
const loading = ref(false)
const blacklist = ref([])
const whitelist = ref([])

// 表单相关
const blacklistDialogVisible = ref(false)
const whitelistDialogVisible = ref(false)
const blacklistFormRef = ref(null)
const whitelistFormRef = ref(null)

const blacklistForm = reactive({
  ip: '',
  description: ''
})

const whitelistForm = reactive({
  ip: '',
  description: ''
})

const formRules = {
  ip: [
    { required: true, message: '请输入IP或CIDR', trigger: 'blur' },
    { 
      pattern: /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/, 
      message: '请输入有效的IP或CIDR格式', 
      trigger: 'blur' 
    }
  ],
  description: [
    { required: true, message: '请输入描述', trigger: 'blur' }
  ]
}

// 方法
const showAddBlacklistDialog = () => {
  blacklistForm.ip = ''
  blacklistForm.description = ''
  blacklistDialogVisible.value = true
}

const showAddWhitelistDialog = () => {
  whitelistForm.ip = ''
  whitelistForm.description = ''
  whitelistDialogVisible.value = true
}

const addBlacklistItem = async () => {
  if (!blacklistFormRef.value) return
  
  await blacklistFormRef.value.validate((valid) => {
    if (valid) {
      // 检查是否已存在
      const exists = blacklist.value.some(item => item.ip === blacklistForm.ip)
      if (exists) {
        ElMessage.warning('该IP/CIDR已存在于黑名单中')
        return
      }
      
      // 添加到黑名单
      blacklist.value.push({
        ip: blacklistForm.ip,
        description: blacklistForm.description
      })
      
      blacklistDialogVisible.value = false
      updateConfig()
      ElMessage.success('添加黑名单成功')
    }
  })
}

const addWhitelistItem = async () => {
  if (!whitelistFormRef.value) return
  
  await whitelistFormRef.value.validate((valid) => {
    if (valid) {
      // 检查是否已存在
      const exists = whitelist.value.some(item => item.ip === whitelistForm.ip)
      if (exists) {
        ElMessage.warning('该IP/CIDR已存在于白名单中')
        return
      }
      
      // 检查是否在黑名单中
      const inBlacklist = blacklist.value.some(item => item.ip === whitelistForm.ip)
      if (inBlacklist) {
        ElMessage.warning('该IP/CIDR已存在于黑名单中，黑名单优先级更高')
      }
      
      // 添加到白名单
      whitelist.value.push({
        ip: whitelistForm.ip,
        description: whitelistForm.description
      })
      
      whitelistDialogVisible.value = false
      updateConfig()
      ElMessage.success('添加白名单成功')
    }
  })
}

const removeBlacklistItem = (row) => {
  ElMessageBox.confirm(
    `确定要从黑名单中删除 ${row.ip} 吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = blacklist.value.findIndex(item => item.ip === row.ip)
    if (index !== -1) {
      blacklist.value.splice(index, 1)
      updateConfig()
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

const removeWhitelistItem = (row) => {
  ElMessageBox.confirm(
    `确定要从白名单中删除 ${row.ip} 吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = whitelist.value.findIndex(item => item.ip === row.ip)
    if (index !== -1) {
      whitelist.value.splice(index, 1)
      updateConfig()
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

// 更新配置并向父组件发送事件
const updateConfig = () => {
  emit('update:config', {
    blacklist: blacklist.value,
    whitelist: whitelist.value
  })
}

// 初始化数据
const initFromProps = () => {
  if (props.config) {
    blacklist.value = [...(props.config.blacklist || [])]
    whitelist.value = [...(props.config.whitelist || [])]
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

.blackwhite-list-container {
  margin-top: 20px;
}

.list-tabs {
  width: 100%;
}

.list-content {
  padding: 15px 0;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.list-title {
  font-size: 16px;
  font-weight: 500;
}

.list-description {
  margin-bottom: 15px;
  color: #606266;
  font-size: 14px;
}

.empty-placeholder {
  margin: 30px 0;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style> 