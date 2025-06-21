<template>
  <div class="waf-page">
    <el-row class="waf-row" gutter="0">
      <!-- 左侧树形区域 -->
      <el-col :span="5" class="tree-col">
        <el-card class="tree-card">
          <div class="tree-header">
            <el-input v-model="search" placeholder="搜索节点" size="small" clearable style="width: 60%;" />
            <div class="tree-actions">
              <el-button size="small" @click="handleAddNode" circle>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              </el-button>
              <el-button size="small" @click="handleCollapseAll" circle style="margin-left: 8px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </el-button>
            </div>
          </div>
          <el-tree
            :data="treeData"
            :props="defaultProps"
            :filter-node-method="filterNode"
            ref="treeRef"
            node-key="id"
            highlight-current
            class="waf-tree"
            style="margin-top: 8px;"
            v-loading="loading"
          />
        </el-card>
      </el-col>
      <!-- 右侧Tabs区域 -->
      <el-col :span="19" class="tabs-col">
        <el-card class="tabs-card">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="实例管理" name="instance" />
            <el-tab-pane label="集群管理" name="cluster" />
            <el-tab-pane label="抓包管理" name="capture" />
            <el-tab-pane label="升级管理" name="upgrade" />
            <el-tab-pane label="请求日志" name="requestLog" />
            <el-tab-pane label="配置日志" name="configLog" />
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import RegionService from '@/services/RegionService'

const search = ref('')
const activeTab = ref('instance')
const treeRef = ref()

// 树形结构属性配置
const defaultProps = {
  children: 'children',
  label: 'label'
}

// 地域和WAF集群数据
const regions = ref([])
const loading = ref(false)

// 从RegionService获取地域数据
const fetchRegions = async () => {
  loading.value = true
  try {
    regions.value = await RegionService.getRegions()
    loading.value = false
  } catch (error) {
    console.error('获取地域数据失败:', error)
    loading.value = false
  }
}

// 构建树形数据
const treeData = computed(() => {
  return regions.value.map(region => {
    // 过滤掉全局和全国地域，只显示具体城市
    if (region.id === 'GLOBAL' || region.id === 'CHINA') return null
    
    // 为每个地域生成2个模拟WAF集群
    const children = [
      { 
        id: `${region.id}_CLUSTER1`, 
        label: `${region.name}WAF集群1`,
        regionId: region.id
      },
      { 
        id: `${region.id}_CLUSTER2`, 
        label: `${region.name}WAF集群2`,
        regionId: region.id
      }
    ]
    
    return {
      id: region.id,
      label: region.name,
      children
    }
  }).filter(Boolean) // 过滤掉null值
})

// 监听搜索输入
watch(search, (val) => {
  treeRef.value?.filter(val)
})

// 搜索过滤方法
function filterNode(value, data) {
  if (!value) return true
  return data.label.toLowerCase().includes(value.toLowerCase())
}

function handleAddNode() {
  // 预留新增节点逻辑
}

function handleCollapseAll() {
  if (treeRef.value) {
    treeRef.value.store.nodesMap && Object.values(treeRef.value.store.nodesMap).forEach(node => node.collapse())
  }
}

// 页面加载时获取地域数据
onMounted(() => {
  fetchRegions()
})
</script>

<style scoped>
.waf-page {
  padding: 0;
  margin: 0;
  background: #f5f6fa;
}
.waf-row {
  margin: 0;
}
.tree-col {
  padding-left: 0 !important;
  padding-right: 8px !important;
}
.tabs-col {
  padding-right: 0 !important;
  padding-left: 0 !important;
}
.tree-card {
  min-height: 480px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  margin-top: 0;
  margin-bottom: 0;
}
.tree-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2px;
}
.tree-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}
.waf-tree {
  background: #fff;
  border-radius: 4px;
  padding: 2px 0;
}
.tabs-card {
  margin-top: 0;
  margin-bottom: 0;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
</style> 