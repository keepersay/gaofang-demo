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
            <el-tab-pane label="总览" name="overview">
              <div class="placeholder-content">
                <el-empty description="WAF总览内容将在这里显示" />
              </div>
            </el-tab-pane>
            <el-tab-pane label="实例管理" name="instance">
              <div class="placeholder-content">
                <el-empty description="WAF实例管理内容将在这里显示" />
              </div>
            </el-tab-pane>
            <el-tab-pane label="集群管理" name="cluster">
              <div class="cluster-management">
                <div class="section-header">
                  <h3>WAF集群管理</h3>
                  <el-button type="primary" size="small">
                    <el-icon class="el-icon--left"><Plus /></el-icon>新建集群
                  </el-button>
                </div>
                
                <el-table :data="clusterList" border style="width: 100%" v-loading="clustersLoading">
                  <el-table-column prop="id" label="集群ID" width="180" />
                  <el-table-column prop="name" label="集群名称" width="150" />
                  <el-table-column prop="regionName" label="所属地域" width="120" />
                  <el-table-column prop="nodeCount" label="节点数量" width="100" />
                  <el-table-column prop="status" label="状态" width="100">
                    <template #default="scope">
                      <el-tag :type="scope.row.status === 'running' ? 'success' : scope.row.status === 'stopped' ? 'danger' : 'warning'">
                        {{ scope.row.status === 'running' ? '运行中' : scope.row.status === 'stopped' ? '已停止' : '部署中' }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="version" label="版本" width="120" />
                  <el-table-column prop="createTime" label="创建时间" width="180" />
                  <el-table-column label="操作" fixed="right" width="200">
                    <template #default="scope">
                      <el-button link type="primary" size="small" @click="handleEditCluster(scope.row)">编辑</el-button>
                      <el-button link type="primary" size="small" @click="handleViewNodes(scope.row)">查看节点</el-button>
                      <el-button link type="danger" size="small" @click="handleDeleteCluster(scope.row)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
                
                <div class="pagination-container">
                  <el-pagination
                    v-model:current-page="clusterPagination.page"
                    v-model:page-size="clusterPagination.pageSize"
                    :page-sizes="[10, 20, 50, 100]"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="clusterPagination.total"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                  />
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="抓包管理" name="capture">
              <div class="placeholder-content">
                <el-empty description="WAF抓包管理内容将在这里显示" />
              </div>
            </el-tab-pane>
            <el-tab-pane label="升级管理" name="upgrade">
              <div class="placeholder-content">
                <el-empty description="WAF升级管理内容将在这里显示" />
              </div>
            </el-tab-pane>
            <el-tab-pane label="请求日志" name="requestLog">
              <div class="placeholder-content">
                <el-empty description="WAF请求日志内容将在这里显示" />
              </div>
            </el-tab-pane>
            <el-tab-pane label="配置日志" name="configLog">
              <div class="placeholder-content">
                <el-empty description="WAF配置日志内容将在这里显示" />
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import RegionService from '@/services/RegionService'
import { ElMessageBox, ElMessage } from 'element-plus'

const search = ref('')
const activeTab = ref('overview')
const treeRef = ref()

// 树形结构属性配置
const defaultProps = {
  children: 'children',
  label: 'label'
}

// 地域和WAF集群数据
const regionTree = ref([])
const loading = ref(false)

// 集群管理相关数据
const clusterList = ref([
  {
    id: 'WAF-CLUSTER-001',
    name: '北京WAF集群1',
    regionName: '华北-北京',
    nodeCount: 5,
    status: 'running',
    version: 'v2.5.3',
    createTime: '2024-05-15 10:30:00'
  },
  {
    id: 'WAF-CLUSTER-002',
    name: '北京WAF集群2',
    regionName: '华北-北京',
    nodeCount: 3,
    status: 'running',
    version: 'v2.5.3',
    createTime: '2024-05-16 14:20:00'
  },
  {
    id: 'WAF-CLUSTER-003',
    name: '上海WAF集群1',
    regionName: '华东-上海',
    nodeCount: 4,
    status: 'running',
    version: 'v2.5.2',
    createTime: '2024-05-10 09:15:00'
  },
  {
    id: 'WAF-CLUSTER-004',
    name: '广州WAF集群1',
    regionName: '华南-广州',
    nodeCount: 2,
    status: 'deploying',
    version: 'v2.5.3',
    createTime: '2024-06-01 16:45:00'
  },
  {
    id: 'WAF-CLUSTER-005',
    name: '成都WAF集群1',
    regionName: '西南-成都',
    nodeCount: 2,
    status: 'stopped',
    version: 'v2.5.1',
    createTime: '2024-04-20 11:30:00'
  }
])
const clustersLoading = ref(false)
const clusterPagination = ref({
  page: 1,
  pageSize: 10,
  total: 5
})

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

// 构建WAF管理树形数据
const treeData = computed(() => {
  // 递归处理树形结构
  function processRegions(regions) {
    if (!regions || regions.length === 0) return []
    
    return regions.map(region => {
      // 为每个末级地域生成2个模拟WAF集群
      const hasChildren = region.children && region.children.length > 0
      const childrenNodes = hasChildren ? processRegions(region.children) : [
        { 
          id: `${region.id}_CLUSTER1`, 
          label: `${region.name}WAF集群1`,
          regionId: region.id,
          nodeType: 'cluster'
        },
        { 
          id: `${region.id}_CLUSTER2`, 
          label: `${region.name}WAF集群2`,
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

// 集群管理相关方法
function handleEditCluster(row) {
  ElMessage.info(`编辑集群: ${row.name}`)
}

function handleViewNodes(row) {
  ElMessage.info(`查看节点: ${row.name}`)
}

function handleDeleteCluster(row) {
  ElMessageBox.confirm(`确定要删除集群 ${row.name} 吗?`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success(`已删除集群: ${row.name}`)
  }).catch(() => {
    // 取消删除
  })
}

function handleSizeChange(val) {
  clusterPagination.value.pageSize = val
  // 这里可以添加重新获取数据的逻辑
}

function handleCurrentChange(val) {
  clusterPagination.value.page = val
  // 这里可以添加重新获取数据的逻辑
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
.placeholder-content {
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background-color: #fafafa;
  border-radius: 4px;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.section-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}
.cluster-management {
  padding: 16px;
}
.pagination-container {
  margin-top: 16px;
  text-align: right;
}
</style> 