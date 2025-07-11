<template>
  <div class="high-defense-tab">
    <div class="tab-header">
      <div class="tab-title">
        <h3>高防防护</h3>
      </div>
    </div>
    
    <div class="protection-status">
      <span class="status-label">防护模式：</span>
      <el-radio-group v-model="config.mode" @change="handleModeChange" size="small">
        <el-radio label="warn">预警</el-radio>
        <el-radio label="block">阻断</el-radio>
      </el-radio-group>
    </div>
    
    <div class="protection-stats">
      <div class="stats-text">已匹配到攻击规则数量：<span class="stats-value">6</span>，拦截数量：<span class="stats-value">2</span>，告警数量：<span class="stats-value">4</span>（防护模式为"预警"时不会阻断）</div>
    </div>
    
    <div class="protection-level">
      <span class="level-label">防护等级：</span>
      <span class="level-value">中等</span>
    </div>
    
    <div class="search-area">
      <div class="search-form">
        <el-input placeholder="输入规则ID" v-model="searchForm.ruleId" size="small" />
        <el-input placeholder="输入规则名称" v-model="searchForm.ruleName" size="small" />
        <el-select v-model="searchForm.attackType" placeholder="攻击类型筛选" clearable size="small">
          <el-option label="全部" value="" />
          <el-option label="SQL注入" value="SQL注入" />
          <el-option label="跨站脚本攻击" value="跨站脚本攻击" />
          <el-option label="命令注入" value="命令注入" />
        </el-select>
        <el-input placeholder="输入CVE编号" v-model="searchForm.cveId" size="small" />
        <el-select v-model="searchForm.threatLevel" placeholder="威胁等级筛选" clearable size="small">
          <el-option label="全部" value="" />
          <el-option label="严重" value="严重" />
          <el-option label="高" value="高" />
          <el-option label="中" value="中" />
          <el-option label="低" value="低" />
        </el-select>
        <div class="search-buttons">
          <el-button type="primary" @click="handleSearch" size="small">搜索</el-button>
          <el-button @click="resetSearch" size="small">重置</el-button>
        </div>
      </div>
    </div>
    
    <el-table :data="filteredRules" border style="width: 100%" size="small" :header-cell-style="{padding: '2px 0'}" :cell-style="{padding: '1px 0'}">
      <el-table-column label="序号" width="50" type="index" align="center" />
      <el-table-column label="规则ID" prop="ruleId" width="90" align="center" />
      <el-table-column label="规则名称" prop="ruleName" min-width="160" />
      <el-table-column label="威胁等级" width="70" align="center">
        <template #default="{ row }">
          <el-tag :type="getThreatLevelType(row.threatLevel)" size="small">
            {{ row.threatLevel }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="高危编号" prop="cveId" width="110" align="center" />
      <el-table-column label="攻击类型" prop="attackType" width="110" />
      <el-table-column label="效果说明" prop="effectDescription" min-width="110" />
      <el-table-column label="状态" width="60" align="center">
        <template #default="{ row }">
          <el-switch
            v-model="row.enabled"
            @change="(val) => handleRuleStatusChange(row, val)"
            size="small"
          />
        </template>
      </el-table-column>
      <el-table-column label="防护模式" width="120" align="center">
        <template #default="{ row }">
          <div class="protection-mode-group">
            <el-radio v-model="row.mode" label="warn" size="small">预警</el-radio>
            <el-radio v-model="row.mode" label="block" size="small">阻断</el-radio>
          </div>
        </template>
      </el-table-column>
    </el-table>
    
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalRules"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        small
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  protectionId: {
    type: [Number, String],
    required: true
  },
  protectionData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update'])

// 高防防护配置
const config = reactive({
  enabled: true,
  level: 'medium',
  mode: 'warn',
  rules: []
})

// 搜索表单
const searchForm = reactive({
  ruleId: '',
  ruleName: '',
  attackType: '',
  cveId: '',
  threatLevel: ''
})

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const totalRules = ref(0)

// 规则分类数据
const ruleCategories = ref([
  {
    ruleId: '1070020113',
    ruleName: '远程命令执行漏洞',
    threatLevel: '高',
    cveId: '-',
    attackType: '命令注入',
    effectDescription: '木马型代码注入',
    enabled: true,
    mode: 'warn'
  },
  {
    ruleId: '1010010020',
    ruleName: 'SQL注入-SQL注入攻击-3',
    threatLevel: '高',
    cveId: '-',
    attackType: 'SQL注入',
    effectDescription: 'SQL注入',
    enabled: true,
    mode: 'warn'
  },
  {
    ruleId: '1060050015',
    ruleName: 'XSS攻击检测：htaccess文',
    threatLevel: '高',
    cveId: '-',
    attackType: 'webshell上传',
    effectDescription: 'webshell上传',
    enabled: true,
    mode: 'warn'
  },
  {
    ruleId: '1040010673',
    ruleName: '可疑的数字字符串：Null2ing',
    threatLevel: '高',
    cveId: '-',
    attackType: '跨站脚本攻击',
    effectDescription: '跨站脚本攻击',
    enabled: true,
    mode: 'warn'
  },
  {
    ruleId: '1040010336',
    ruleName: 'XSS攻击检测：video poster',
    threatLevel: '严重',
    cveId: '-',
    attackType: '跨站脚本攻击',
    effectDescription: '跨站脚本攻击',
    enabled: true,
    mode: 'block'
  },
  {
    ruleId: '1050010011',
    ruleName: 'Apache HTTP服务器mod_proxy',
    threatLevel: '严重',
    cveId: 'CVE-2021-40438',
    attackType: '远程代码执行',
    effectDescription: '远程代码执行漏洞',
    enabled: true,
    mode: 'block'
  },
  {
    ruleId: '1080030112',
    ruleName: '访问敏感文件："/proc/tty/d"',
    threatLevel: '高',
    cveId: '-',
    attackType: '核心文件非法访问',
    effectDescription: '核心文件非法访问',
    enabled: true,
    mode: 'warn'
  },
  {
    ruleId: '1050010042',
    ruleName: 'Apache Tika Tesseract组件',
    threatLevel: '高',
    cveId: 'CVE-2018-1335',
    attackType: '命令执行漏洞',
    effectDescription: '命令执行漏洞',
    enabled: true,
    mode: 'warn'
  }
])

// 过滤规则
const filteredRules = computed(() => {
  let result = [...ruleCategories.value]
  
  if (searchForm.ruleId) {
    result = result.filter(rule => rule.ruleId.includes(searchForm.ruleId))
  }
  
  if (searchForm.ruleName) {
    result = result.filter(rule => rule.ruleName.includes(searchForm.ruleName))
  }
  
  if (searchForm.attackType) {
    result = result.filter(rule => rule.attackType === searchForm.attackType)
  }
  
  if (searchForm.cveId) {
    result = result.filter(rule => rule.cveId.includes(searchForm.cveId))
  }
  
  if (searchForm.threatLevel) {
    result = result.filter(rule => rule.threatLevel === searchForm.threatLevel)
  }
  
  return result
})

// 初始化配置
const initConfig = () => {
  if (props.protectionData && props.protectionData.securityConfig && props.protectionData.securityConfig.highDefense) {
    const highDefense = props.protectionData.securityConfig.highDefense
    
    config.enabled = highDefense.enabled || true
    config.level = highDefense.level || 'medium'
    config.mode = highDefense.mode || 'warn'
    
    // 转换旧的防护模式值到新的值
    if (config.mode === 'detect' || config.mode === 'monitor') {
      config.mode = 'warn'
    }
    
    if (highDefense.rules && Array.isArray(highDefense.rules)) {
      // 更新规则状态
      highDefense.rules.forEach(rule => {
        const existingRule = ruleCategories.value.find(r => r.ruleId === rule.ruleId)
        if (existingRule) {
          existingRule.enabled = rule.enabled
          // 转换旧的防护模式值到新的值
          if (rule.mode === 'detect' || rule.mode === 'monitor') {
            existingRule.mode = 'warn'
          } else if (rule.mode === 'block') {
            existingRule.mode = 'block'
          } else {
            existingRule.mode = rule.mode || 'warn'
          }
        }
      })
    }
  }
}

// 处理状态变更
const handleStatusChange = (val) => {
  config.enabled = val
  emitUpdate()
}

// 处理防护等级变更
const handleLevelChange = (val) => {
  config.level = val
  emitUpdate()
}

// 处理防护模式变更
const handleModeChange = (val) => {
  config.mode = val
  // 根据全局模式更新所有规则的模式
  ruleCategories.value.forEach(rule => {
    rule.mode = val
  })
  emitUpdate()
}

// 处理规则状态变更
const handleRuleStatusChange = (rule, val) => {
  rule.enabled = val
  emitUpdate()
}

// 搜索方法
const handleSearch = () => {
  // 在实际应用中，这里可能会调用API进行搜索
  currentPage.value = 1
}

// 重置搜索
const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  handleSearch()
}

// 全选规则
const selectAllRules = () => {
  ruleCategories.value.forEach(rule => {
    rule.enabled = true
  })
  emitUpdate()
}

// 取消全选规则
const unselectAllRules = () => {
  ruleCategories.value.forEach(rule => {
    rule.enabled = false
  })
  emitUpdate()
}

// 处理每页条数变化
const handleSizeChange = (val) => {
  pageSize.value = val
  // 这里可以添加重新获取数据的逻辑
}

// 处理页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val
  // 这里可以添加重新获取数据的逻辑
}

// 获取威胁等级对应的标签类型
const getThreatLevelType = (level) => {
  const types = {
    '高': 'danger',
    '中': 'warning',
    '低': 'info',
    '严重': 'danger' // 修改从 'error' 到 'danger'
  }
  return types[level] || 'info'
}

// 向父组件发送更新事件
const emitUpdate = () => {
  const updatedConfig = {
    enabled: config.enabled,
    level: config.level,
    mode: config.mode,
    rules: ruleCategories.value.map(rule => ({
      ruleId: rule.ruleId,
      enabled: rule.enabled,
      mode: rule.mode
    }))
  }
  
  emit('update', 'highDefense', updatedConfig)
}

// 监听保护对象数据变化
watch(() => props.protectionData, () => {
  initConfig()
}, { deep: true })

// 组件挂载时初始化
onMounted(() => {
  initConfig()
  totalRules.value = ruleCategories.value.length
})
</script>

<style scoped>
.high-defense-tab {
  padding: 0;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.tab-title h3 {
  margin: 0 0 3px 0;
  font-size: 14px;
  font-weight: normal;
}

.protection-status {
  margin-bottom: 6px;
  font-size: 12px;
}

.status-label {
  font-weight: normal;
  margin-right: 5px;
}

.protection-stats {
  margin-bottom: 6px;
  border-radius: 2px;
  padding: 5px;
  background-color: #f5f7fa;
  font-size: 12px;
}

.stats-text {
  font-size: 12px;
  color: #606266;
}

.stats-value {
  color: #f56c6c;
  font-weight: normal;
}

.protection-level {
  margin-bottom: 8px;
  font-size: 12px;
}

.level-label {
  font-weight: normal;
  margin-right: 5px;
}

.level-value {
  color: #409eff;
}

.search-area {
  margin-bottom: 8px;
  background-color: #f5f7fa;
  padding: 8px;
  border-radius: 2px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.search-form .el-input,
.search-form .el-select {
  width: 160px;
}

.search-buttons {
  margin-left: auto;
}

.pagination-container {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-table) {
  font-size: 12px;
}

:deep(.el-table th) {
  padding: 2px 0;
  font-size: 12px;
}

:deep(.el-table td) {
  padding: 1px 0;
}

:deep(.el-radio) {
  margin-right: 0;
  margin-bottom: 0;
}

:deep(.el-radio__label) {
  font-size: 11px;
  padding-left: 3px;
}

:deep(.el-button) {
  padding: 5px 8px;
  font-size: 12px;
}

:deep(.el-tag) {
  font-size: 11px;
  padding: 0 4px;
  height: 18px;
  line-height: 18px;
}

:deep(.el-radio-group) {
  font-size: 12px;
}

:deep(.el-pagination) {
  font-size: 12px;
}

.protection-mode-group {
  display: flex;
  justify-content: space-between;
  padding: 0 2px;
}

.protection-mode-group :deep(.el-radio) {
  margin-right: 0;
}

:deep(.el-input__wrapper) {
  padding: 0 8px;
}

:deep(.el-input__inner) {
  height: 24px;
}

:deep(.el-select__wrapper) {
  height: 24px;
}
</style> 