<template>
  <div class="bot-protection-tab">
    <div class="tab-content">
      <!-- 顶部提示信息 -->
      <div class="tip-box">
        <i class="el-icon-info"></i>
        <span>以下防护技术组合使用，可对攻击者进行有效拦截</span>
      </div>
      
      <!-- 搜索引擎爬虫白名单 -->
      <div class="protection-section">
        <div class="section-header">
          <span class="section-title">搜索引擎爬虫白名单</span>
          <el-switch v-model="config.searchEngineWhitelist.enabled" />
        </div>
        <el-input
          v-model="config.searchEngineWhitelist.list"
          type="textarea"
          :rows="4"
          placeholder="请输入爬虫名称，多个之间用回车分隔"
          :disabled="!config.searchEngineWhitelist.enabled"
          @change="handleConfigChange"
        />
      </div>
      
      <!-- 静态资源后缀加白 -->
      <div class="protection-section">
        <div class="section-header">
          <span class="section-title">静态资源后缀加白</span>
          <el-switch v-model="config.staticResourceSuffix.enabled" />
        </div>
        <el-input
          v-model="config.staticResourceSuffix.list"
          type="textarea"
          :rows="4"
          placeholder="请输入需要加白的静态资源后缀，多个之间用回车分隔"
          :disabled="!config.staticResourceSuffix.enabled"
          @change="handleConfigChange"
        />
      </div>
      
      <!-- 动态防护(web) -->
      <div class="protection-section">
        <div class="section-header">
          <span class="section-title">动态防护(web)</span>
          <el-switch v-model="config.dynamicProtection.enabled" />
        </div>
        <div class="check-items" :class="{ disabled: !config.dynamicProtection.enabled }">
          <div class="check-item">
            <el-checkbox v-model="config.dynamicProtection.dynamicEnvVerify" disabled>动态环境验证</el-checkbox>
            <el-tooltip content="该选项为必选项" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
          </div>
          
          <div class="check-item">
            <el-checkbox v-model="config.dynamicProtection.dynamicTokenCheck" disabled>动态令牌校验</el-checkbox>
            <el-tooltip content="该选项为必选项" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
          </div>
          
          <div class="check-item">
            <el-checkbox 
              v-model="config.dynamicProtection.urlParamObfuscate"
              :disabled="!config.dynamicProtection.enabled"
              @change="handleConfigChange"
            >URL参数混淆</el-checkbox>
          </div>
          
          <div class="check-item">
            <el-checkbox 
              v-model="config.dynamicProtection.refererObfuscate"
              :disabled="!config.dynamicProtection.enabled"
              @change="handleConfigChange"
            >referer参数混淆</el-checkbox>
          </div>
          
          <div class="check-item">
            <el-checkbox 
              v-model="config.dynamicProtection.bodyParamObfuscate"
              :disabled="!config.dynamicProtection.enabled"
              @change="handleConfigChange"
            >请求体参数混淆</el-checkbox>
          </div>
          
          <div class="check-item">
            <el-checkbox 
              v-model="config.dynamicProtection.disableDevTools"
              :disabled="!config.dynamicProtection.enabled"
              @change="handleConfigChange"
            >禁用开发者工具</el-checkbox>
          </div>
          
          <div class="check-item">
            <el-checkbox 
              v-model="config.dynamicProtection.preventDebugging"
              :disabled="!config.dynamicProtection.enabled"
              @change="handleConfigChange"
            >页面防调试</el-checkbox>
          </div>
        </div>
      </div>
      
      <!-- HTML混淆 -->
      <div class="protection-section">
        <div class="section-header">
          <span class="section-title">HTML混淆</span>
          <el-switch v-model="config.htmlObfuscation.enabled" @change="handleConfigChange" />
        </div>
        
        <div class="form-item" :class="{ disabled: !config.htmlObfuscation.enabled }">
          <span class="item-label">混淆方式:</span>
          <el-radio-group 
            v-model="config.htmlObfuscation.mode"
            :disabled="!config.htmlObfuscation.enabled"
            @change="handleConfigChange"
          >
            <el-radio label="all">混淆全部</el-radio>
            <el-radio label="tag">混淆标签</el-radio>
          </el-radio-group>
        </div>
        
        <div class="form-item">
          <div class="textarea-label">
            <span class="required">*</span>
            <span>混淆路径(前缀匹配):</span>
          </div>
          <el-input
            v-model="config.htmlObfuscation.obfuscatePaths"
            type="textarea"
            :rows="3"
            :maxlength="5120"
            :disabled="!config.htmlObfuscation.enabled"
            placeholder="请输入混淆路径，多个之间用英文逗号分割，最多配置20个，单个路径最长255字符"
            show-word-limit
            @change="handleConfigChange"
          />
        </div>
        
        <div class="form-item">
          <div class="textarea-label">
            <span>例外路径(前缀匹配):</span>
          </div>
          <el-input
            v-model="config.htmlObfuscation.exceptPaths"
            type="textarea"
            :rows="3"
            :maxlength="5120"
            :disabled="!config.htmlObfuscation.enabled"
            placeholder="请输入例外路径，多个之间用英文逗号分割，最多配置20个，单个路径最长255字符"
            show-word-limit
            @change="handleConfigChange"
          />
        </div>
      </div>
      
      <!-- JS混淆 -->
      <div class="protection-section">
        <div class="section-header">
          <span class="section-title">JS混淆</span>
          <el-switch v-model="config.jsObfuscation.enabled" @change="handleConfigChange" />
        </div>
        
        <div class="form-item">
          <div class="textarea-label">
            <span class="required">*</span>
            <span>混淆路径(前缀匹配):</span>
          </div>
          <el-input
            v-model="config.jsObfuscation.obfuscatePaths"
            type="textarea"
            :rows="3"
            :maxlength="5120"
            :disabled="!config.jsObfuscation.enabled"
            placeholder="请输入混淆路径，多个之间用英文逗号分割，最多配置20个，单个路径最长255字符"
            show-word-limit
            @change="handleConfigChange"
          />
        </div>
        
        <div class="form-item">
          <div class="textarea-label">
            <span>例外路径(前缀匹配):</span>
          </div>
          <el-input
            v-model="config.jsObfuscation.exceptPaths"
            type="textarea"
            :rows="3"
            :maxlength="5120"
            :disabled="!config.jsObfuscation.enabled"
            placeholder="请输入例外路径，多个之间用英文逗号分割，最多配置20个，单个路径最长255字符"
            show-word-limit
            @change="handleConfigChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'

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

// BOT防护配置
const config = reactive({
  searchEngineWhitelist: {
    enabled: true,
    list: ""
  },
  staticResourceSuffix: {
    enabled: true,
    list: ""
  },
  dynamicProtection: {
    enabled: true,
    dynamicEnvVerify: true,
    dynamicTokenCheck: true,
    urlParamObfuscate: true,
    refererObfuscate: true,
    bodyParamObfuscate: true,
    disableDevTools: false,
    preventDebugging: false
  },
  htmlObfuscation: {
    enabled: true,
    mode: "all",
    obfuscatePaths: "/",
    exceptPaths: ""
  },
  jsObfuscation: {
    enabled: true,
    obfuscatePaths: "/",
    exceptPaths: ""
  }
})

// 初始化配置
const initConfig = () => {
  if (props.protectionData && props.protectionData.securityConfig && props.protectionData.securityConfig.botProtection) {
    const botProtection = props.protectionData.securityConfig.botProtection
    
    // 合并配置
    if (botProtection.searchEngineWhitelist) {
      Object.assign(config.searchEngineWhitelist, botProtection.searchEngineWhitelist)
    }
    
    if (botProtection.staticResourceSuffix) {
      Object.assign(config.staticResourceSuffix, botProtection.staticResourceSuffix)
    }
    
    if (botProtection.dynamicProtection) {
      Object.assign(config.dynamicProtection, botProtection.dynamicProtection)
      // 确保必选项始终为true
      config.dynamicProtection.dynamicEnvVerify = true
      config.dynamicProtection.dynamicTokenCheck = true
    }
    
    if (botProtection.htmlObfuscation) {
      Object.assign(config.htmlObfuscation, botProtection.htmlObfuscation)
    }
    
    if (botProtection.jsObfuscation) {
      Object.assign(config.jsObfuscation, botProtection.jsObfuscation)
    }
  }
}

// 处理配置变更
const handleConfigChange = () => {
  emitUpdate()
}

// 向父组件发送更新事件
const emitUpdate = () => {
  emit('update', 'botProtection', {
    searchEngineWhitelist: { ...config.searchEngineWhitelist },
    staticResourceSuffix: { ...config.staticResourceSuffix },
    dynamicProtection: { ...config.dynamicProtection },
    htmlObfuscation: { ...config.htmlObfuscation },
    jsObfuscation: { ...config.jsObfuscation }
  })
}

// 监听保护对象数据变化
watch(() => props.protectionData, () => {
  initConfig()
}, { deep: true })

// 组件挂载时初始化
onMounted(() => {
  initConfig()
})
</script>

<style scoped>
.bot-protection-tab {
  padding: 0 10px;
}

.tip-box {
  background-color: #ecf8ff;
  padding: 10px 16px;
  border-radius: 4px;
  color: #606266;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.tip-box i {
  color: #409eff;
  margin-right: 8px;
  font-size: 14px;
}

.protection-section {
  margin-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 20px;
}

.protection-section:last-child {
  border-bottom: none;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-weight: bold;
  color: #303133;
}

.check-items {
  display: flex;
  flex-wrap: wrap;
  gap: 15px 30px;
  margin-bottom: 10px;
}

.check-item {
  display: flex;
  align-items: center;
}

.check-item i {
  margin-left: 5px;
  color: #909399;
  cursor: pointer;
}

.form-item {
  margin-bottom: 15px;
}

.item-label {
  margin-right: 10px;
}

.textarea-label {
  margin-bottom: 5px;
}

.required {
  color: #f56c6c;
  margin-right: 4px;
}

.disabled {
  opacity: 0.7;
  pointer-events: none;
}
</style> 