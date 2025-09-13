<template>
  <div class="slb-page">
    <el-row class="slb-row" gutter="0">
      <!-- 左侧树形区域 -->
      <el-col :span="4" class="tree-col">
        <el-card class="tree-card">
          <div class="tree-header">
            <el-input v-model="search" placeholder="搜索节点" size="small" clearable style="width: 60%;" />
            <div class="tree-actions">
              <el-button size="small" @click="handleCollapseAll" circle>
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
            v-loading="treeLoading"
            @node-click="handleNodeClick"
          />
        </el-card>
      </el-col>
      <!-- 右侧内容区域 -->
      <el-col :span="20" class="content-col">
        <el-card class="content-card">
          <div v-if="selectedCluster" class="cluster-header">
            <h3>{{ selectedCluster.label }}</h3>
            <el-tag v-if="selectedCluster.nodeType === 'cluster'" :type="getClusterStatusType(selectedCluster)">
              {{ getClusterStatusText(selectedCluster) }}
            </el-tag>
          </div>
          <div v-else class="cluster-header">
            <h3>请从左侧选择SLB集群</h3>
          </div>
          
          <!-- SLB集群Tab页面内容 -->
          <el-tabs v-model="activeTab" v-if="selectedCluster && selectedCluster.nodeType === 'cluster'">
            <el-tab-pane label="实例管理" name="instance">
              <SlbInstanceManagement />
            </el-tab-pane>
            <el-tab-pane label="集群监控" name="monitoring">
              <div class="tab-placeholder-content">
                <el-empty :description="`${selectedCluster.label} 集群监控内容将在这里显示`" />
              </div>
            </el-tab-pane>
            <el-tab-pane label="限速管理" name="rateLimit">
              <div class="tab-placeholder-content">
                <el-empty :description="`${selectedCluster.label} 限速管理内容将在这里显示`" />
              </div>
            </el-tab-pane>
            <el-tab-pane label="SNAT规则" name="snatRules">
              <div class="tab-placeholder-content">
                <el-empty :description="`${selectedCluster.label} SNAT规则内容将在这里显示`" />
              </div>
            </el-tab-pane>
            <el-tab-pane label="集群管理" name="clusterManagement">
              <div class="tab-placeholder-content">
                <el-empty :description="`${selectedCluster.label} 集群管理内容将在这里显示`" />
              </div>
            </el-tab-pane>
            <el-tab-pane label="VIP池管理" name="vipPool">
              <div class="tab-placeholder-content">
                <el-empty :description="`${selectedCluster.label} VIP池管理内容将在这里显示`" />
              </div>
            </el-tab-pane>
            <el-tab-pane label="配置日志" name="configLog">
              <div class="tab-placeholder-content">
                <el-empty :description="`${selectedCluster.label} 配置日志内容将在这里显示`" />
              </div>
            </el-tab-pane>
            <el-tab-pane label="主机IP对象" name="hostIpObject">
              <div class="tab-placeholder-content">
                <el-empty :description="`${selectedCluster.label} 主机IP对象内容将在这里显示`" />
              </div>
            </el-tab-pane>
            <el-tab-pane label="抓包管理" name="packetCapture">
              <div class="tab-placeholder-content">
                <el-empty :description="`${selectedCluster.label} 抓包管理内容将在这里显示`" />
              </div>
            </el-tab-pane>
            <el-tab-pane label="资源限制" name="resourceLimit">
              <div class="tab-placeholder-content">
                <el-empty :description="`${selectedCluster.label} 资源限制内容将在这里显示`" />
              </div>
            </el-tab-pane>
            <el-tab-pane label="升级管理" name="upgradeManagement">
              <div class="tab-placeholder-content">
                <el-empty :description="`${selectedCluster.label} 升级管理内容将在这里显示`" />
              </div>
            </el-tab-pane>
          </el-tabs>
          <div v-else-if="selectedCluster && selectedCluster.nodeType === 'region'" class="placeholder-content">
            <el-empty description="请选择此地域下的SLB集群" />
          </div>
          <div v-else-if="selectedCluster && selectedCluster.nodeType === 'dataCenter'" class="placeholder-content">
            <el-empty description="请选择此机房下的SLB集群" />
          </div>
          <div v-else class="placeholder-content">
            <el-empty description="请从左侧选择SLB集群" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import RegionService from '@/services/RegionService'
import DataCenterService from '@/services/DataCenterService'
import { ElMessage } from 'element-plus'
import SlbInstanceManagement from '@/components/SlbManagement/SlbInstanceManagement.vue'

const route = useRoute()
const search = ref('')
const activeTab = ref('instance') // 默认选中实例管理tab
const treeRef = ref()
const selectedCluster = ref(null)

// 树形结构属性配置
const defaultProps = {
  children: 'children',
  label: 'label'
}

// 地域和SLB集群数据
const regionTree = ref([])
const dataCenters = ref([])
const treeLoading = ref(true)

// 构建地域-机房-集群树形结构
const clustersMap = ref({}) // { dataCenterId: [集群列表] }

// 从RegionService获取树形结构地域数据
const fetchRegions = async () => {
  try {
    console.log('开始加载地域数据...')
    regionTree.value = await RegionService.getRegionTree()
    console.log('地域数据加载完成:', regionTree.value)
    return regionTree.value
  } catch (error) {
    console.error('获取地域数据失败:', error)
    regionTree.value = []
    return []
  }
}

const treeData = computed(() => {
  function processRegions(regions) {
    if (!regions || regions.length === 0) return []
    return regions.map(region => {
      const hasChildren = region.children && region.children.length > 0
      const childrenNodes = hasChildren ? processRegions(region.children) : []
      // 找到该region下所有机房
      const dataCenterNodes = dataCenters.value
        .filter(dc => dc.regionId === region.id)
        .map(dc => ({
          id: dc.id,
          label: dc.name,
          nodeType: 'dataCenter',
          regionId: dc.regionId,
          children: (clustersMap.value[dc.id] || []).map(cluster => ({
            ...cluster,
            children: []
          }))
        }))
      return {
        id: region.id,
        label: region.name,
        nodeType: 'region',
        children: [...childrenNodes, ...dataCenterNodes]
      }
    })
  }
  return processRegions(regionTree.value)
})

// 初始化模拟SLB集群数据
function initClustersMap() {
  const map = {}
  dataCenters.value.forEach(dc => {
    const clusters = []
    
    // 添加默认集群
    clusters.push({
      id: `${dc.id}_SLB_CLUSTER1`,
      label: `${dc.name}SLB集群1`,
      dataCenterId: dc.id,
      nodeType: 'cluster',
      status: 'running',
      version: 'v1.2.3',
      nodeCount: 3,
      createTime: '2024-05-15 10:30:00',
      remark: ''
    })
    
    clusters.push({
      id: `${dc.id}_SLB_CLUSTER2`,
      label: `${dc.name}SLB集群2`,
      dataCenterId: dc.id,
      nodeType: 'cluster',
      status: 'running',
      version: 'v1.2.2',
      nodeCount: 2,
      createTime: '2024-05-16 14:20:00',
      remark: ''
    })
    
    // 为特定机房添加从集群管理来的集群
    if (dc.id === 'DC202401010001') { // 北京机房01
      clusters.push({
        id: 'CLU202412070002',
        label: '北京机房SLB集群01',
        dataCenterId: dc.id,
        nodeType: 'cluster',
        status: 'running',
        version: 'v1.2.3',
        nodeCount: 4,
        createTime: '2024-01-01 10:00:00',
        createUser: 'admin',
        updateTime: '2024-01-01 10:00:00',
        updateUser: 'admin',
        remark: '北京地区四层负载均衡集群'
      })
    }
    
    map[dc.id] = clusters
  })
  clustersMap.value = map
}

// 监听搜索输入
watch(search, (val) => {
  treeRef.value?.filter(val)
})

// 搜索过滤方法
function filterNode(value, data) {
  if (!value) return true
  return data.label.toLowerCase().includes(value.toLowerCase())
}

function handleNodeClick(data) {
  selectedCluster.value = data
  if (data.nodeType === 'cluster') {
    activeTab.value = 'instance' // 选中集群时切换到实例管理tab
  }
  console.log('选中的节点:', data)
}

function handleCollapseAll() {
  if (!treeRef.value) return;
  
  try {
    // 检查是否有展开的节点
    const isAnyNodeExpanded = document.querySelector('.slb-tree .el-tree-node.is-expanded') !== null;
    
    if (isAnyNodeExpanded) {
      // 如果有展开的节点，则全部折叠
      const allKeys = getAllNodeKeys(treeData.value);
      allKeys.forEach(key => {
        const node = treeRef.value.getNode(key);
        if (node && node.expanded) {
          node.collapse();
        }
      });
    } else {
      // 如果没有展开的节点，则全部展开
      const allKeys = getAllNodeKeys(treeData.value);
      allKeys.forEach(key => {
        const node = treeRef.value.getNode(key);
        if (node) {
          node.expand();
        }
      });
    }
  } catch (error) {
    console.error('展开/折叠树节点时出错:', error);
  }
}

// 递归获取所有节点的key
function getAllNodeKeys(nodes) {
  if (!nodes || !Array.isArray(nodes)) return [];
  
  let keys = [];
  nodes.forEach(node => {
    if (node.id) {
      keys.push(node.id);
    }
    if (node.children && node.children.length > 0) {
      keys = keys.concat(getAllNodeKeys(node.children));
    }
  });
  return keys;
}

// 获取集群状态类型
function getClusterStatusType(cluster) {
  if (!cluster) return ''
  switch (cluster.status) {
    case 'running': return 'success'
    case 'stopped': return 'danger'
    case 'deploying': return 'warning'
    default: return 'info'
  }
}

// 获取集群状态文本
function getClusterStatusText(cluster) {
  if (!cluster) return ''
  switch (cluster.status) {
    case 'running': return '运行中'
    case 'stopped': return '已停止'
    case 'deploying': return '部署中'
    default: return '未知状态'
  }
}

// 页面加载时获取地域和机房数据
onMounted(async () => {
  try {
    treeLoading.value = true
    console.log('开始加载数据...')
    
    // 并行加载数据以提高效率
    const [_, dcData] = await Promise.all([
      fetchRegions(),
      DataCenterService.getDataCenters()
    ])
    
    dataCenters.value = dcData || []
    console.log('机房数据加载完成:', dataCenters.value)
    
    // 确保初始化集群映射
    initClustersMap()
    console.log('集群映射初始化完成:', clustersMap.value)
    
    // 处理从集群管理页面跳转过来的URL参数
    handleClusterJumpFromUrl()
    
  } catch (error) {
    console.error('数据加载失败:', error)
    // 确保即使出错也能显示空树
    regionTree.value = []
    dataCenters.value = []
  } finally {
    // 无论成功失败都关闭loading
    treeLoading.value = false
    console.log('树加载状态已关闭')
  }
})

// 处理从集群管理页面跳转过来的URL参数
const handleClusterJumpFromUrl = async () => {
  const { clusterId, clusterName, from } = route.query
  
  if (!clusterId || !clusterName || from !== 'cluster-management') {
    return
  }
  
  console.log('检测到从集群管理页面跳转到SLB，目标集群:', { clusterId, clusterName })
  
  // 等待DOM更新完成
  await nextTick()
  
  try {
    // 在树数据中查找目标集群
    const targetCluster = findClusterInTree(clusterId, treeData.value)
    
    if (targetCluster) {
      console.log('找到目标SLB集群:', targetCluster)
      
      // 展开到目标节点的路径
      await expandToCluster(targetCluster)
      
      // 选中目标集群
      selectedCluster.value = targetCluster
      
      // 切换到实例管理标签
      activeTab.value = 'instance'
      
      // 高亮树节点
      if (treeRef.value) {
        treeRef.value.setCurrentKey(targetCluster.id)
      }
      
      ElMessage({
        message: `已定位到SLB集群: ${clusterName}`,
        type: 'success',
        duration: 3000
      })
    } else {
      console.warn('未找到目标SLB集群:', clusterId)
      ElMessage({
        message: `未找到指定的SLB集群: ${clusterName}`,
        type: 'warning',
        duration: 5000
      })
    }
  } catch (error) {
    console.error('定位SLB集群时出错:', error)
    ElMessage({
      message: '定位集群失败，请手动选择',
      type: 'error',
      duration: 5000
    })
  }
}

// 在树数据中递归查找指定ID的集群
const findClusterInTree = (clusterId, nodes) => {
  if (!nodes || !Array.isArray(nodes)) return null
  
  for (const node of nodes) {
    // 检查当前节点
    if (node.id === clusterId && node.nodeType === 'cluster') {
      return node
    }
    
    // 递归检查子节点
    if (node.children && node.children.length > 0) {
      const found = findClusterInTree(clusterId, node.children)
      if (found) return found
    }
  }
  
  return null
}

// 展开到指定集群的路径
const expandToCluster = async (targetCluster) => {
  if (!treeRef.value || !targetCluster) return
  
  // 等待树渲染完成
  await nextTick()
  
  try {
    // 根据集群的dataCenterId找到父级机房节点
    const dataCenterId = targetCluster.dataCenterId
    if (!dataCenterId) return
    
    // 找到机房对应的地域
    const dataCenter = dataCenters.value.find(dc => dc.id === dataCenterId)
    if (!dataCenter) return
    
    const regionId = dataCenter.regionId
    
    // 展开地域节点
    const regionNode = treeRef.value.getNode(regionId)
    if (regionNode && !regionNode.expanded) {
      regionNode.expand()
    }
    
    // 展开机房节点
    const dataCenterNode = treeRef.value.getNode(dataCenterId)
    if (dataCenterNode && !dataCenterNode.expanded) {
      dataCenterNode.expand()
    }
    
    console.log('SLB树节点展开完成')
  } catch (error) {
    console.error('展开SLB树节点时出错:', error)
  }
}
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
.content-col {
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
.content-card {
  margin-top: 0;
  margin-bottom: 0;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.cluster-header {
  display: flex;
  align-items: center;
  padding: 0 20px 10px;
  border-bottom: 1px solid #eee;
}
.cluster-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}
.cluster-header .el-tag {
  margin-left: 12px;
}
.cluster-content {
  padding: 20px;
  background-color: #fafafa;
  border-radius: 4px;
  min-height: 400px;
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
.tab-placeholder-content {
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background-color: #fafafa;
  border-radius: 4px;
}
</style> 