<template>
  <div class="waf-page">
    <el-row class="waf-row" gutter="0">
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
            class="waf-tree"
            style="margin-top: 8px;"
            v-loading="treeLoading"
            @node-click="handleNodeClick"
          />
        </el-card>
      </el-col>
      <!-- 右侧Tabs区域 -->
      <el-col :span="20" class="tabs-col">
        <el-card class="tabs-card">
          <div v-if="selectedCluster" class="cluster-header">
            <h3>{{ selectedCluster.label }}</h3>
            <el-tag v-if="selectedCluster.nodeType === 'cluster'" :type="getClusterStatusType(selectedCluster)">
              {{ getClusterStatusText(selectedCluster) }}
            </el-tag>
          </div>
          <div v-else class="cluster-header">
            <h3>请从左侧选择WAF集群</h3>
          </div>
          <el-tabs v-model="activeTab" v-if="selectedCluster && selectedCluster.nodeType === 'cluster'">
            <el-tab-pane label="总览" name="overview">
              <div class="overview-content">
                <el-descriptions title="集群基本信息" :column="2" border>
                  <template #title>
                    <span>集群基本信息</span>
                    <el-button type="primary" link style="margin-left: 8px; vertical-align: middle;" @click="editClusterInfo">
                      <el-icon><EditPen /></el-icon>
                    </el-button>
                  </template>
                  <el-descriptions-item label="集群ID">{{ selectedCluster.id }}</el-descriptions-item>
                  <el-descriptions-item label="集群名称">{{ selectedCluster.label }}</el-descriptions-item>
                  <el-descriptions-item label="机房">{{ getDataCenterName(selectedCluster.dataCenterId || selectedCluster.regionId) }}</el-descriptions-item>
                  <el-descriptions-item label="状态">
                    <el-tag :type="getClusterStatusType(selectedCluster)">{{ getClusterStatusText(selectedCluster) }}</el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="添加时间">{{ selectedCluster.createTime || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="添加账号">{{ selectedCluster.createUser || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="最后修改时间">{{ selectedCluster.updateTime || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="最后修改账号">{{ selectedCluster.updateUser || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="备注" :span="2">
                    <span style="white-space: pre-line; word-break: break-all;">{{ selectedCluster.remark || '-' }}</span>
                  </el-descriptions-item>
                </el-descriptions>
                <hr class="section-divider" />
                <div class="overview-stats">
                  <div class="stats-header">
                    <h3>集群健康状态 <el-tag :type="getClusterStatusType(selectedCluster)">{{ getClusterStatusText(selectedCluster) }}</el-tag></h3>
                  </div>
                  <el-row gutter="24" style="margin-top: 16px;">
                    <el-col :span="6">
                      <el-card>
                        <div>异常实例数量</div>
                        <el-link type="danger" @click="goToInstanceTabWithError">{{ errorInstanceCount }}</el-link>
                      </el-card>
                    </el-col>
                    <el-col :span="6">
                      <el-card>
                        <div>主机健康数量/总数</div>
                        <span>{{ healthyInstanceCount }}/{{ totalServers }}</span>
                      </el-card>
                    </el-col>
                  </el-row>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="实例管理" name="instance">
              <div class="instance-content">
                <div class="search-bar">
                  <el-input
                    v-model="instanceSearch"
                    placeholder="搜索站点名称/域名/IP"
                    style="width: 250px;"
                    clearable
                    @clear="handleInstanceSearchClear"
                  >
                    <template #prefix>
                      <el-icon><Search /></el-icon>
                    </template>
                  </el-input>
                  <el-button type="primary" @click="handleInstanceSearch">搜索</el-button>
                  <el-button @click="handleRefreshInstances">
                    <el-icon><Refresh /></el-icon>
                  </el-button>
                  <div class="right-actions">
                    <el-button type="primary" @click="handleAddInstance">新增实例</el-button>
                  </div>
                </div>
                
                <el-table
                  :data="filteredInstances"
                  style="width: 100%"
                  v-loading="instancesLoading"
                  border
                  stripe
                >
                  <el-table-column prop="siteName" label="站点名称" min-width="150" sortable>
                    <template #default="scope">
                      <el-tooltip :content="scope.row.siteName" placement="top" :show-after="500">
                        <span>{{ scope.row.siteName }}</span>
                      </el-tooltip>
                    </template>
                  </el-table-column>
                  <el-table-column prop="domain" label="防护域名/IP" min-width="180" sortable />
                  <el-table-column prop="protectionLevel" label="防护等级" width="100">
                    <template #default="scope">
                      <el-tag :type="getProtectionLevelType(scope.row.protectionLevel)">
                        {{ getProtectionLevelText(scope.row.protectionLevel) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="protectionMode" label="防护模式" width="100">
                    <template #default="scope">
                      <el-tag :type="getProtectionModeType(scope.row.protectionMode)">
                        {{ getProtectionModeText(scope.row.protectionMode) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="status" label="状态" width="100">
                    <template #default="scope">
                      <el-tag :type="getInstanceStatusType(scope.row.status)">
                        {{ getInstanceStatusText(scope.row.status) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" fixed="right" width="220">
                    <template #default="scope">
                      <el-button link type="primary" @click="handleEditInstance(scope.row)">编辑</el-button>
                      <el-button link type="primary" @click="handleSecurityConfig(scope.row)">安全配置</el-button>
                      <el-button 
                        link 
                        type="danger" 
                        :disabled="scope.row.status !== 'disabled'"
                        @click="handleDeleteInstance(scope.row)"
                      >
                        删除
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
                
                <div class="pagination-container">
                  <el-pagination
                    v-model:current-page="instanceCurrentPage"
                    v-model:page-size="instancePageSize"
                    :page-sizes="[10, 20, 50, 100]"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="totalInstances"
                    @size-change="handleInstanceSizeChange"
                    @current-change="handleInstanceCurrentChange"
                  />
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="主机管理" name="host">
              <div class="cluster-content">
                <div class="search-bar">
                  <el-input
                    v-model="serverSearch"
                    placeholder="搜索主机名/IP/实例ID"
                    style="width: 250px;"
                    clearable
                    @clear="handleServerSearchClear"
                  >
                    <template #prefix>
                      <el-icon><Search /></el-icon>
                    </template>
                  </el-input>
                  <el-button type="primary" @click="handleServerSearch">搜索</el-button>
                  <el-button @click="handleRefreshServers">
                    <el-icon><Refresh /></el-icon>
                  </el-button>
                  <div class="right-actions">
                    <el-button type="primary" @click="handleAddServer">添加主机</el-button>
                  </div>
                </div>
                
                <el-table
                  :data="filteredServers"
                  style="width: 100%"
                  v-loading="serversLoading"
                  border
                  stripe
                >
                  <el-table-column type="selection" width="55" />
                  <el-table-column prop="instanceId" label="实例ID" min-width="120" sortable />
                  <el-table-column prop="hostname" label="主机名" min-width="150" sortable>
                    <template #default="scope">
                      <el-tooltip :content="scope.row.hostname" placement="top" :show-after="500">
                        <span>{{ scope.row.hostname }}</span>
                      </el-tooltip>
                    </template>
                  </el-table-column>
                  <el-table-column prop="ipAddress" label="IP地址" min-width="120" sortable />
                  <el-table-column prop="status" label="状态" width="100">
                    <template #default="scope">
                      <el-tag :type="getServerStatusType(scope.row.status)">
                        {{ getServerStatusText(scope.row.status) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="instanceType" label="实例规格" min-width="120" />
                  <el-table-column prop="zone" label="可用区" min-width="120" />
                  <el-table-column prop="cpu" label="CPU" width="80">
                    <template #default="scope">
                      {{ scope.row.cpu }} 核
                    </template>
                  </el-table-column>
                  <el-table-column prop="memory" label="内存" width="80">
                    <template #default="scope">
                      {{ scope.row.memory }} GB
                    </template>
                  </el-table-column>
                  <el-table-column prop="diskSize" label="系统盘" width="100">
                    <template #default="scope">
                      {{ scope.row.diskSize }} GB
                    </template>
                  </el-table-column>
                  <el-table-column prop="createTime" label="创建时间" min-width="160" sortable />
                  <el-table-column label="操作" fixed="right" width="180">
                    <template #default="scope">
                      <el-button link type="primary" @click="handleServerDetail(scope.row)">详情</el-button>
                      <el-dropdown>
                        <el-button link type="primary">
                          更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
                        </el-button>
                        <template #dropdown>
                          <el-dropdown-menu>
                            <el-dropdown-item @click="handleServerMonitor(scope.row)">监控</el-dropdown-item>
                            <el-dropdown-item @click="handleServerConfig(scope.row)">配置</el-dropdown-item>
                            <el-dropdown-item @click="handleServerLogs(scope.row)">日志</el-dropdown-item>
                            <el-dropdown-item divided @click="handleServerRemove(scope.row)" class="text-danger">
                              移除
                            </el-dropdown-item>
                          </el-dropdown-menu>
                        </template>
                      </el-dropdown>
                    </template>
                  </el-table-column>
                </el-table>
                
                <div class="pagination-container">
                  <el-pagination
                    v-model:current-page="currentPage"
                    v-model:page-size="pageSize"
                    :page-sizes="[10, 20, 50, 100]"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="totalServers"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                  />
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="抓包管理" name="capture">
              <div class="placeholder-content">
                <el-empty :description="`${selectedCluster.label} 抓包管理内容将在这里显示`" />
              </div>
            </el-tab-pane>
            <el-tab-pane label="升级管理" name="upgrade">
              <div class="placeholder-content">
                <el-empty :description="`${selectedCluster.label} 升级管理内容将在这里显示`" />
              </div>
            </el-tab-pane>
            <el-tab-pane label="请求日志" name="requestLog">
              <div class="placeholder-content">
                <el-empty :description="`${selectedCluster.label} 请求日志内容将在这里显示`" />
              </div>
            </el-tab-pane>
            <el-tab-pane label="配置日志" name="configLog">
              <div class="placeholder-content">
                <el-empty :description="`${selectedCluster.label} 配置日志内容将在这里显示`" />
              </div>
            </el-tab-pane>
          </el-tabs>
          <div v-else-if="selectedCluster && selectedCluster.nodeType === 'region'" class="placeholder-content">
            <el-empty description="请选择此地域下的WAF集群" />
          </div>
          <div v-else class="placeholder-content">
            <el-empty description="请从左侧选择WAF集群" />
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-dialog v-model="editDialogVisible" title="编辑集群信息" width="500px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="集群名称">
          <el-input v-model="editForm.label" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="editForm.remark" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveClusterInfo">保存</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, reactive, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import RegionService from '@/services/RegionService'
import DataCenterService from '@/services/DataCenterService'
import { Search, Refresh, ArrowDown, EditPen } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const search = ref('')
const activeTab = ref('overview') // 默认选中总览tab
const treeRef = ref()
const selectedCluster = ref(null)

// 树形结构属性配置
const defaultProps = {
  children: 'children',
  label: 'label'
}

// 地域和WAF集群数据
const regionTree = ref([])
const treeLoading = ref(true)
const dataCenters = ref([])

// 服务器列表相关
const serverSearch = ref('')
const serversLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const totalServers = ref(0)
const servers = ref([])

// 编辑相关
const editDialogVisible = ref(false)
const editForm = reactive({ label: '', remark: '' })



// 构建地域-机房-集群树形结构
const clustersMap = ref({}) // { dataCenterId: [集群列表] }

// WAF实例列表相关
const instanceSearch = ref('')
const instancesLoading = ref(false)
const instanceCurrentPage = ref(1)
const instancePageSize = ref(10)
const totalInstances = ref(0)
const instances = ref([])

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

function handleNodeClick(data) {
  selectedCluster.value = data
  if (data.nodeType === 'cluster') {
    activeTab.value = 'overview'
    fetchServers(data.id)
    fetchInstances(data.id) // 加载WAF实例列表
  }
}

function handleCollapseAll() {
  if (!treeRef.value) return;
  
  try {
    // 检查是否有展开的节点
    const isAnyNodeExpanded = document.querySelector('.waf-tree .el-tree-node.is-expanded') !== null;
    
    if (isAnyNodeExpanded) {
      // 如果有展开的节点，则全部折叠
      // 获取所有节点ID
      const allKeys = getAllNodeKeys(treeData.value);
      // 遍历所有节点，逐个折叠
      allKeys.forEach(key => {
        const node = treeRef.value.getNode(key);
        if (node && node.expanded) {
          node.collapse();
        }
      });
    } else {
      // 如果没有展开的节点，则全部展开
      // 获取所有节点ID
      const allKeys = getAllNodeKeys(treeData.value);
      // 遍历所有节点，逐个展开
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



// 模拟获取服务器列表数据
const fetchServers = async (clusterId) => {
  if (!clusterId) return
  
  serversLoading.value = true
  try {
    // 这里应该是从API获取数据，现在用模拟数据
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 生成10-20个随机服务器
    const count = Math.floor(Math.random() * 10) + 10
    const mockServers = []
    
    const zones = ['华北1-可用区A', '华北1-可用区B', '华北1-可用区C']
    const instanceTypes = ['ecs.g6.large', 'ecs.g6.xlarge', 'ecs.g6.2xlarge', 'ecs.c6.large']
    const statuses = ['running', 'stopped', 'starting', 'stopping', 'error']
    
    for (let i = 0; i < count; i++) {
      mockServers.push({
        id: `srv-${Date.now()}-${i}`,
        instanceId: `i-${Math.random().toString(36).substring(2, 10)}`,
        hostname: `waf-${selectedCluster.value.label.replace(/\s+/g, '-').toLowerCase()}-${i}`,
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        status: Math.random() > 0.8 ? statuses[Math.floor(Math.random() * statuses.length)] : 'running',
        instanceType: instanceTypes[Math.floor(Math.random() * instanceTypes.length)],
        zone: zones[Math.floor(Math.random() * zones.length)],
        cpu: [2, 4, 8, 16][Math.floor(Math.random() * 4)],
        memory: [4, 8, 16, 32][Math.floor(Math.random() * 4)],
        diskSize: [40, 80, 120, 200][Math.floor(Math.random() * 4)],
        createTime: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toLocaleString()
      })
    }
    
    servers.value = mockServers
    totalServers.value = mockServers.length
    serversLoading.value = false
  } catch (error) {
    console.error('获取服务器列表失败:', error)
    serversLoading.value = false
  }
}

// 过滤后的服务器列表
const filteredServers = computed(() => {
  let result = servers.value
  
  // 应用搜索过滤
  if (serverSearch.value) {
    const searchLower = serverSearch.value.toLowerCase()
    result = result.filter(server => 
      server.hostname.toLowerCase().includes(searchLower) ||
      server.ipAddress.toLowerCase().includes(searchLower) ||
      server.instanceId.toLowerCase().includes(searchLower)
    )
  }
  
  return result
})

// 获取服务器状态类型
function getServerStatusType(status) {
  switch (status) {
    case 'running': return 'success'
    case 'stopped': return 'info'
    case 'starting': return 'warning'
    case 'stopping': return 'warning'
    case 'error': return 'danger'
    default: return 'info'
  }
}

// 获取服务器状态文本
function getServerStatusText(status) {
  switch (status) {
    case 'running': return '运行中'
    case 'stopped': return '已停止'
    case 'starting': return '启动中'
    case 'stopping': return '停止中'
    case 'error': return '异常'
    default: return '未知'
  }
}

// 处理服务器搜索
function handleServerSearch() {
  // 可以在这里添加额外的搜索逻辑
}

// 清除搜索
function handleServerSearchClear() {
  serverSearch.value = ''
}

// 刷新服务器列表
function handleRefreshServers() {
  if (selectedCluster.value && selectedCluster.value.nodeType === 'cluster') {
    fetchServers(selectedCluster.value.id)
  }
}

// 分页相关
function handleSizeChange(size) {
  pageSize.value = size
  // 在实际应用中，这里应该重新获取数据
}

function handleCurrentChange(page) {
  currentPage.value = page
  // 在实际应用中，这里应该重新获取数据
}

// 服务器操作相关
function handleServerDetail(server) {
  console.log('查看服务器详情:', server)
}

function handleServerMonitor(server) {
  console.log('查看服务器监控:', server)
}

function handleServerConfig(server) {
  console.log('配置服务器:', server)
}

function handleServerLogs(server) {
  console.log('查看服务器日志:', server)
}

function handleServerRemove(server) {
  console.log('移除服务器:', server)
}

function handleAddServer() {
  console.log('添加服务器')
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

function editClusterInfo() {
  editForm.label = selectedCluster.value.label
  editForm.remark = selectedCluster.value.remark || ''
  editDialogVisible.value = true
}

function saveClusterInfo() {
  // 更新集群信息
  selectedCluster.value.label = editForm.label;
  selectedCluster.value.remark = editForm.remark;
  
  // 更新最后修改时间和账号
  selectedCluster.value.updateTime = new Date().toLocaleString();
  selectedCluster.value.updateUser = 'current_user'; // 这里可以替换为实际登录用户
  
  editDialogVisible.value = false;
}

const errorInstanceCount = computed(() => {
  return servers.value.filter(s => getServerStatusText(s.status) === '异常').length
})

const healthyInstanceCount = computed(() => {
  return servers.value.filter(s => getServerStatusText(s.status) === '运行中').length
})

function goToInstanceTabWithError() {
  activeTab.value = 'instance'
  instanceSearch.value = ''
  // 可以在这里加上只显示异常实例的逻辑
}

// 机房ID转名称
const getDataCenterName = (id) => {
  const dc = dataCenters.value.find(dc => dc.id === id)
  return dc ? dc.name : id || '-'
}

// 根据regionId查找机房ID
const getDataCenterIdByRegion = (regionId) => {
  const dc = dataCenters.value.find(dc => dc.regionId === regionId)
  return dc ? dc.id : regionId
}



// 初始化模拟集群数据
function initClustersMap() {
  const map = {}
  dataCenters.value.forEach(dc => {
    const clusters = []
    
    // 添加默认集群
    clusters.push({
      id: `${dc.id}_CLUSTER1`,
      label: `${dc.name}集群1`,
      dataCenterId: dc.id,
      nodeType: 'cluster',
      status: 'running',
      version: 'v2.5.3',
      nodeCount: 5,
      createTime: '2024-05-15 10:30:00',
      remark: ''
    })
    
    clusters.push({
      id: `${dc.id}_CLUSTER2`,
      label: `${dc.name}集群2`,
      dataCenterId: dc.id,
      nodeType: 'cluster',
      status: 'running',
      version: 'v2.5.2',
      nodeCount: 3,
      createTime: '2024-05-16 14:20:00',
      remark: ''
    })
    
    // 为特定机房添加从集群管理来的集群
    if (dc.id === 'DC202407200001') { // 首尔机房01
      clusters.push({
        id: 'CLU202412070001',
        label: '首尔机房WAF集群01',
        dataCenterId: dc.id,
        nodeType: 'cluster',
        status: 'running',
        version: 'v2.5.3',
        nodeCount: 2,
        createTime: '2024-05-16 14:20:00',
        createUser: 'admin',
        updateTime: '2024-05-16 14:20:00',
        updateUser: 'admin',
        remark: '首尔地区WAF防护集群'
      })
    }
    
    if (dc.id === 'DC202401010001') { // 北京机房01
      clusters.push({
        id: 'CLU202412070002',
        label: '北京机房SLB集群01',
        dataCenterId: dc.id,
        nodeType: 'cluster',
        status: 'running',
        version: 'v2.5.3',
        nodeCount: 3,
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

// 模拟获取WAF实例列表数据
const fetchInstances = async (clusterId) => {
  if (!clusterId) return
  
  instancesLoading.value = true
  try {
    // 这里应该是从API获取数据，现在用模拟数据
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 生成5-10个随机WAF实例
    const count = Math.floor(Math.random() * 5) + 5
    const mockInstances = []
    
    const protectionLevels = ['low', 'medium', 'high']
    const protectionModes = ['warning', 'blocking']
    const statuses = ['enabled', 'disabled']
    const domains = [
      'example.com', 'api.company.org', 'shop.example.net', 
      'blog.example.com', 'admin.company.org', 'crm.example.net',
      '192.168.1.100', '10.0.0.55', '172.16.0.10'
    ]
    
    for (let i = 0; i < count; i++) {
      const domain = domains[Math.floor(Math.random() * domains.length)]
      mockInstances.push({
        id: `waf-${Date.now()}-${i}`,
        siteName: `站点${i + 1}`,
        domain: domain,
        protectionLevel: protectionLevels[Math.floor(Math.random() * protectionLevels.length)],
        protectionMode: protectionModes[Math.floor(Math.random() * protectionModes.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        createTime: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toLocaleString()
      })
    }
    
    instances.value = mockInstances
    totalInstances.value = mockInstances.length
    instancesLoading.value = false
  } catch (error) {
    console.error('获取WAF实例列表失败:', error)
    instancesLoading.value = false
  }
}

// 过滤后的WAF实例列表
const filteredInstances = computed(() => {
  let result = instances.value
  
  // 应用搜索过滤
  if (instanceSearch.value) {
    const searchLower = instanceSearch.value.toLowerCase()
    result = result.filter(instance => 
      instance.siteName.toLowerCase().includes(searchLower) ||
      instance.domain.toLowerCase().includes(searchLower)
    )
  }
  
  return result
})

// 获取防护等级类型和文本
function getProtectionLevelType(level) {
  switch (level) {
    case 'low': return 'info'
    case 'medium': return 'warning'
    case 'high': return 'danger'
    default: return 'info'
  }
}

function getProtectionLevelText(level) {
  switch (level) {
    case 'low': return '低'
    case 'medium': return '中'
    case 'high': return '高'
    default: return '未知'
  }
}

// 获取防护模式类型和文本
function getProtectionModeType(mode) {
  switch (mode) {
    case 'warning': return 'warning'
    case 'blocking': return 'danger'
    default: return 'info'
  }
}

function getProtectionModeText(mode) {
  switch (mode) {
    case 'warning': return '预警'
    case 'blocking': return '阻断'
    default: return '未知'
  }
}

// 获取实例状态类型和文本
function getInstanceStatusType(status) {
  switch (status) {
    case 'enabled': return 'success'
    case 'disabled': return 'info'
    default: return 'info'
  }
}

function getInstanceStatusText(status) {
  switch (status) {
    case 'enabled': return '启用'
    case 'disabled': return '禁用'
    default: return '未知'
  }
}

// 处理实例搜索
function handleInstanceSearch() {
  // 可以在这里添加额外的搜索逻辑
}

// 清除实例搜索
function handleInstanceSearchClear() {
  instanceSearch.value = ''
}

// 刷新实例列表
function handleRefreshInstances() {
  if (selectedCluster.value && selectedCluster.value.nodeType === 'cluster') {
    fetchInstances(selectedCluster.value.id)
  }
}

// 实例分页相关
function handleInstanceSizeChange(size) {
  instancePageSize.value = size
  // 在实际应用中，这里应该重新获取数据
}

function handleInstanceCurrentChange(page) {
  instanceCurrentPage.value = page
  // 在实际应用中，这里应该重新获取数据
}

// 实例操作相关
function handleAddInstance() {
  ElMessage({
    message: '新增实例功能将在后续实现',
    type: 'info'
  })
}

function handleEditInstance(instance) {
  ElMessage({
    message: '编辑实例功能将在后续实现',
    type: 'info'
  })
}

function handleSecurityConfig(instance) {
  ElMessage({
    message: '安全配置功能将在后续实现',
    type: 'info'
  })
}

function handleDeleteInstance(instance) {
  if (instance.status !== 'disabled') {
    ElMessage({
      message: '只能删除已禁用的实例',
      type: 'warning'
    })
    return
  }
  
  ElMessageBox.confirm(
    `确定要删除实例 ${instance.siteName} 吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 模拟删除操作
    instances.value = instances.value.filter(item => item.id !== instance.id)
    totalInstances.value = instances.value.length
    
    ElMessage({
      type: 'success',
      message: '删除成功'
    })
  }).catch(() => {
    // 用户取消删除
  })
}

// 处理从集群管理页面跳转过来的URL参数
const handleClusterJumpFromUrl = async () => {
  const { clusterId, clusterName, from } = route.query
  
  if (!clusterId || !clusterName || from !== 'cluster-management') {
    return
  }
  
  console.log('检测到从集群管理页面跳转，目标集群:', { clusterId, clusterName })
  
  // 等待DOM更新完成
  await nextTick()
  
  try {
    // 在树数据中查找目标集群
    const targetCluster = findClusterInTree(clusterId, treeData.value)
    
    if (targetCluster) {
      console.log('找到目标集群:', targetCluster)
      
      // 展开到目标节点的路径
      await expandToCluster(targetCluster)
      
      // 选中目标集群
      selectedCluster.value = targetCluster
      
      // 切换到总览标签
      activeTab.value = 'overview'
      
      // 加载集群数据
      fetchServers(targetCluster.id)
      fetchInstances(targetCluster.id)
      
      // 高亮树节点
      if (treeRef.value) {
        treeRef.value.setCurrentKey(targetCluster.id)
      }
      
      ElMessage({
        message: `已定位到集群: ${clusterName}`,
        type: 'success',
        duration: 3000
      })
    } else {
      console.warn('未找到目标集群:', clusterId)
      ElMessage({
        message: `未找到指定的集群: ${clusterName}`,
        type: 'warning',
        duration: 5000
      })
    }
  } catch (error) {
    console.error('定位集群时出错:', error)
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
    
    console.log('树节点展开完成')
  } catch (error) {
    console.error('展开树节点时出错:', error)
  }
}
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
.search-bar {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 8px;
}
.right-actions {
  margin-left: auto;
}
.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
.text-danger {
  color: #F56C6C;
}
.overview-content {
  padding: 20px;
}
.overview-stats {
  margin-top: 24px;
}
.section-divider {
  border: none;
  border-top: 2px solid #e4e7ed;
  margin: 32px 0 24px 0;
}
.stats-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.stats-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}
.stats-header .el-tag {
  margin-left: 12px;
}
.instance-content {
  padding: 20px;
  background-color: #fafafa;
  border-radius: 4px;
  min-height: 400px;
}
</style> 