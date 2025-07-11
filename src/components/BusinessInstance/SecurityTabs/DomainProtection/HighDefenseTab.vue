<template>
  <div class="high-defense-tab">
    <div class="tab-header">
      <div class="tab-title">
        <h3>高防防护</h3>
        <p class="tab-description">
          基于中国电信云安全WAF安全防护能力的OWASP TOP10安全防护，包括XSS、SQL注入，目录遍历等Web安全防护
        </p>
      </div>
      
      <div class="tab-actions">
        <el-switch
          v-model="config.enabled"
          active-text="启用"
          inactive-text="禁用"
          @change="handleStatusChange"
        />
      </div>
    </div>
    
    <el-divider />
    
    <div class="tab-content" v-if="config.enabled">
      <el-form :model="config" label-width="120px">
        <el-form-item label="防护等级">
          <el-radio-group v-model="config.level" @change="handleLevelChange">
            <el-radio-button value="low">低</el-radio-button>
            <el-radio-button value="medium">中等</el-radio-button>
            <el-radio-button value="high">高</el-radio-button>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="防护模式">
          <el-radio-group v-model="config.mode" @change="handleModeChange">
            <el-radio label="detect">检测</el-radio>
            <el-radio label="block">拦截</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      
      <div class="rule-categories">
        <div class="category-header">
          <h4>防护规则分类</h4>
          <el-button type="primary" link @click="selectAllRules">全选</el-button>
          <el-button type="info" link @click="unselectAllRules">取消全选</el-button>
        </div>
        
        <el-table :data="ruleCategories" border style="width: 100%">
          <el-table-column label="序号" width="80" type="index" />
          <el-table-column label="规则ID" prop="ruleId" width="120" />
          <el-table-column label="规则名称" prop="ruleName" min-width="200" />
          <el-table-column label="威胁等级" width="120">
            <template #default="{ row }">
              <el-tag :type="getThreatLevelType(row.threatLevel)">
                {{ row.threatLevel }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="CVE编号" prop="cveId" width="150" />
          <el-table-column label="攻击类型" prop="attackType" min-width="150" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-switch
                v-model="row.enabled"
                @change="(val) => handleRuleStatusChange(row, val)"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button type="primary" link>详情</el-button>
              <el-button type="danger" link>日志</el-button>
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
          />
        </div>
      </div>
    </div>
    
    <div class="tab-disabled" v-else>
      <el-empty description="高防防护功能已禁用，请先启用该功能" />
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
  enabled: false,
  level: 'medium',
  mode: 'detect',
  rules: []
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
    enabled: true
  },
  {
    ruleId: '1010010020',
    ruleName: 'SQL注入-SQL注入攻击-3',
    threatLevel: '高',
    cveId: '-',
    attackType: 'SQL注入',
    enabled: true
  },
  {
    ruleId: '1060050015',
    ruleName: 'XSS攻击检测：htaccess文',
    threatLevel: '高',
    cveId: '-',
    attackType: 'webshell上传',
    enabled: true
  },
  {
    ruleId: '1040010673',
    ruleName: '可疑的数字字符串：Null2ing',
    threatLevel: '高',
    cveId: '-',
    attackType: '跨站脚本攻击',
    enabled: true
  },
  {
    ruleId: '1040010336',
    ruleName: 'XSS攻击检测：video poster',
    threatLevel: '严重',
    cveId: '-',
    attackType: '跨站脚本攻击',
    enabled: true
  },
  {
    ruleId: '1050010011',
    ruleName: 'Apache HTTP服务器mod_proxy',
    threatLevel: '严重',
    cveId: 'CVE-2021-40438',
    attackType: '远程代码执行',
    enabled: true
  },
  {
    ruleId: '1080030112',
    ruleName: '访问敏感文件："/proc/tty/d"',
    threatLevel: '高',
    cveId: '-',
    attackType: '核心文件非法访问',
    enabled: true
  },
  {
    ruleId: '1050010042',
    ruleName: 'Apache Tika Tesseract组件',
    threatLevel: '高',
    cveId: 'CVE-2018-1335',
    attackType: '命令执行漏洞',
    enabled: true
  }
])

// 初始化配置
const initConfig = () => {
  if (props.protectionData && props.protectionData.securityConfig && props.protectionData.securityConfig.highDefense) {
    const highDefense = props.protectionData.securityConfig.highDefense
    
    config.enabled = highDefense.enabled || false
    config.level = highDefense.level || 'medium'
    config.mode = highDefense.mode || 'detect'
    
    if (highDefense.rules && Array.isArray(highDefense.rules)) {
      // 更新规则状态
      highDefense.rules.forEach(rule => {
        const existingRule = ruleCategories.value.find(r => r.ruleId === rule.ruleId)
        if (existingRule) {
          existingRule.enabled = rule.enabled
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
  emitUpdate()
}

// 处理规则状态变更
const handleRuleStatusChange = (rule, val) => {
  rule.enabled = val
  emitUpdate()
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
    '严重': 'error'
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
      enabled: rule.enabled
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
  padding: 0 10px;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.tab-title h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
}

.tab-description {
  color: #606266;
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}

.tab-content {
  margin-top: 20px;
}

.rule-categories {
  margin-top: 30px;
}

.category-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.category-header h4 {
  margin: 0;
  margin-right: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.tab-disabled {
  padding: 40px 0;
}
</style> 