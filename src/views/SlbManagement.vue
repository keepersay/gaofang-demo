<template>
  <div class="slb-page">
    <el-row class="slb-row" gutter="0">
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
            class="slb-tree"
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
            <el-tab-pane label="负载均衡配置" name="loadbalance" />
            <el-tab-pane label="健康检查" name="healthcheck" />
            <el-tab-pane label="流量统计" name="traffic" />
            <el-tab-pane label="告警日志" name="alarmLog" />
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

// 地域和SLB集群数据
const regionTree = ref([])
const loading = ref(false)

// 从RegionService获取树形结构地域数据
const fetchRegions = async () => {
  loading.value = true
  try {
    regionTree.value = await RegionService.getRegionTree()
    loading.value = false
  } catch (error) {
    console.error('获取地域数据失败:', error)
    loading.value = false
  }
}

// 构建SLB管理树形数据
const treeData = computed(() => {
  // 递归处理树形结构
  function processRegions(regions) {
    if (!regions || regions.length === 0) return []
    
    return regions.map(region => {
      // 为每个末级地域生成2个模拟SLB集群
      const hasChildren = region.children && region.children.length > 0
      const childrenNodes = hasChildren ? processRegions(region.children) : [
        { 
          id: `${region.id}_CLUSTER1`, 
          label: `${region.name}SLB集群1`,
          regionId: region.id,
          nodeType: 'cluster'
        },
        { 
          id: `${region.id}_CLUSTER2`, 
          label: `${region.name}SLB集群2`,
          regionId: region.id,
          nodeType: 'cluster'
        }
      ]
      
      return {
        id: region.id,
        label: region.name,
        nodeType: 'region',
        children: childrenNodes
      }
    })
  }
  
  return processRegions(regionTree.value)
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
.slb-page {
  padding: 0;
  margin: 0;
  background: #f5f6fa;
}
.slb-row {
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
.slb-tree {
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