<template>
  <div class="slb-page">
    <el-row class="slb-row" gutter="0">
      <!-- 左侧树形区域 -->
      <el-col :span="5" class="tree-col">
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
            v-loading="loading"
            @node-click="handleNodeClick"
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
import { ref, onMounted, watch, computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import RegionService from '@/services/RegionService'
import DataCenterService from '@/services/DataCenterService'
import { ElMessage } from 'element-plus'

const route = useRoute()
const search = ref('')
const activeTab = ref('instance')
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
          children: getSLBClustersForDataCenter(dc.id)
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

// 获取指定机房的SLB集群
const getSLBClustersForDataCenter = (dataCenterId) => {
  const clusters = []
  
  // 添加默认集群
  clusters.push({
    id: `${dataCenterId}_SLB_CLUSTER1`,
    label: `SLB集群1`,
    dataCenterId: dataCenterId,
    nodeType: 'cluster',
    status: 'running'
  })
  
  clusters.push({
    id: `${dataCenterId}_SLB_CLUSTER2`,
    label: `SLB集群2`,
    dataCenterId: dataCenterId,
    nodeType: 'cluster',
    status: 'running'
  })
  
  // 为特定机房添加从集群管理来的集群
  if (dataCenterId === 'DC202401010001') { // 北京机房01
    clusters.push({
      id: 'CLU202412070002',
      label: '北京机房SLB集群01',
      dataCenterId: dataCenterId,
      nodeType: 'cluster',
      status: 'running',
      createTime: '2024-01-01 10:00:00',
      remark: '北京地区四层负载均衡集群'
    })
  }
  
  return clusters
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



function handleCollapseAll() {
  if (treeRef.value) {
    treeRef.value.store.nodesMap && Object.values(treeRef.value.store.nodesMap).forEach(node => node.collapse())
  }
}

// 页面加载时获取地域数据
onMounted(async () => {
  try {
    loading.value = true
    
    // 并行加载数据
    const [_, dcData] = await Promise.all([
      fetchRegions(),
      DataCenterService.getDataCenters()
    ])
    
    dataCenters.value = dcData || []
    
    // 处理从集群管理页面跳转过来的URL参数
    await nextTick()
    handleClusterJumpFromUrl()
    
  } catch (error) {
    console.error('数据加载失败:', error)
  } finally {
    loading.value = false
  }
})

// 树节点点击事件
function handleNodeClick(data) {
  selectedCluster.value = data
  if (data.nodeType === 'cluster') {
    activeTab.value = 'instance'
  }
}

// 处理从集群管理页面跳转过来的URL参数
const handleClusterJumpFromUrl = async () => {
  const { clusterId, clusterName, from } = route.query
  
  if (!clusterId || !clusterName || from !== 'cluster-management') {
    return
  }
  
  console.log('检测到从集群管理页面跳转到SLB，目标集群:', { clusterId, clusterName })
  
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