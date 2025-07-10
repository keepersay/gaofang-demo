<template>
  <el-drawer
    v-model="drawerVisible"
    title="域名防护对象配置"
    size="60%"
    :destroy-on-close="false"
    :before-close="handleClose"
  >
    <template #default>
      <div class="config-drawer-content" v-loading="loading">
        <el-tabs v-model="activeTab" class="config-tabs">
          <el-tab-pane label="基本信息配置" name="basic">
            <el-form 
              ref="basicFormRef" 
              :model="basicForm" 
              :rules="basicRules" 
              label-width="140px"
              label-position="right"
            >
              <el-form-item label="业务实例" prop="instanceId">
                <el-input v-model="basicForm.instanceId" disabled />
              </el-form-item>

              <el-form-item label="客户名称">
                <el-input v-model="instanceInfo.customerName" disabled />
              </el-form-item>

              <el-form-item label="接入方式">
                <el-tag>{{ getAccessTypeLabel(basicForm.accessType) }}</el-tag>
              </el-form-item>
              
              <el-form-item label="IPv4防护IP组" prop="ipv4GroupId">
                <el-select 
                  v-model="basicForm.ipv4GroupId" 
                  placeholder="请选择IPv4防护IP组" 
                  style="width: 100%"
                  clearable
                  @change="handleIpGroupChange"
                >
                  <el-option
                    v-for="item in ipv4GroupOptions"
                    :key="item.groupId"
                    :label="item.displayName"
                    :value="item.groupId"
                  />
                </el-select>
              </el-form-item>
              
              <el-form-item label="IPv6防护IP组" prop="ipv6GroupId">
                <el-select 
                  v-model="basicForm.ipv6GroupId" 
                  placeholder="请选择IPv6防护IP组" 
                  style="width: 100%"
                  clearable
                  @change="handleIpGroupChange"
                >
                  <el-option
                    v-for="item in ipv6GroupOptions"
                    :key="item.groupId"
                    :label="item.displayName"
                    :value="item.groupId"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="地址类型">
                <el-tag :type="getAddressTypeTagType(basicForm.addressType)">
                  {{ basicForm.addressType }}
                </el-tag>
              </el-form-item>
              
              <el-form-item label="防护域名" prop="domain">
                <el-input 
                  v-model="basicForm.domain" 
                  placeholder="请输入需要防护的域名，如example.com" 
                />
              </el-form-item>

              <el-form-item label="防护CNAME">
                <el-input v-model="basicForm.cname" disabled />
              </el-form-item>
              
              <el-form-item label="业务QPS" prop="businessQpsType">
                <el-radio-group v-model="basicForm.businessQpsType" @change="handleBusinessQpsTypeChange">
                  <el-radio value="shared">共享</el-radio>
                  <el-radio value="dedicated">独享</el-radio>
                </el-radio-group>
              </el-form-item>
              
              <el-form-item 
                v-if="basicForm.businessQpsType === 'dedicated'" 
                label="独享业务QPS" 
                prop="dedicatedBusinessQps"
              >
                <el-input-number 
                  v-model="basicForm.dedicatedBusinessQps" 
                  :min="1" 
                  :max="remainingBusinessQps" 
                  :step="100" 
                  style="width: 120px"
                />
                <div class="form-tip">
                  可分配的最大独享业务QPS为 {{ remainingBusinessQps || 0 }}
                </div>
              </el-form-item>

              <el-form-item label="防护套餐" prop="protectionPackage">
                <el-radio-group v-model="basicForm.protectionPackage">
                  <el-radio value="standard">WAF标准防护</el-radio>
                  <el-radio value="enhanced">WAF增强防护</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-form>
          </el-tab-pane>
          
          <el-tab-pane label="负载均衡配置" name="slb">
            <div class="slb-header">
              <div class="slb-search">
                <el-input
                  v-model="slbSearchForm.keyword"
                  placeholder="搜索名称、端口"
                  clearable
                  style="width: 200px; margin-right: 10px;"
                  @input="handleSlbSearch"
                />
                <el-select
                  v-model="slbSearchForm.protocol"
                  placeholder="监听协议"
                  clearable
                  style="width: 120px; margin-right: 10px;"
                  @change="handleSlbSearch"
                >
                  <el-option label="HTTP" value="HTTP" />
                  <el-option label="HTTPS" value="HTTPS" />
                  <el-option label="TCP" value="TCP" />
                  <el-option label="UDP" value="UDP" />
                </el-select>
                <el-select
                  v-model="slbSearchForm.status"
                  placeholder="运行状态"
                  clearable
                  style="width: 120px; margin-right: 10px;"
                  @change="handleSlbSearch"
                >
                  <el-option label="运行中" value="running" />
                  <el-option label="已停止" value="stopped" />
                  <el-option label="异常" value="error" />
                </el-select>
                <el-button type="primary" @click="handleSlbSearch">搜索</el-button>
              </div>
              <div class="slb-actions">
                <el-button type="primary" @click="handleCreateSlbListener">添加监听</el-button>
              </div>
            </div>
            
            <el-table
              :data="paginatedSlbList"
              border
              style="width: 100%"
              v-loading="slbLoading"
              @row-click="handleSlbRowClick"
              highlight-current-row
            >
              <el-table-column label="名称" prop="name" min-width="150" show-overflow-tooltip />
              <el-table-column label="端口" prop="port" width="100" />
              <el-table-column label="地址类型" width="100">
                <template #default="{ row }">
                  <el-tag :type="getAddressTypeTagType(row.addressType)">{{ row.addressType }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="监听协议" prop="protocol" width="100" />
              <el-table-column label="运行状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="getSlbStatusTagType(row.status)">{{ getSlbStatusLabel(row.status) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="创建人" prop="creator" width="120" show-overflow-tooltip />
              <el-table-column label="创建时间" prop="createTime" width="180" show-overflow-tooltip />
              <el-table-column label="备注" prop="remark" min-width="150" show-overflow-tooltip />
              <el-table-column label="操作" width="200" fixed="right">
                <template #default="{ row }">
                  <el-button type="primary" link @click="handleEditSlbInfo(row)">编辑</el-button>
                  <el-button :type="row.status === 'running' ? 'danger' : 'success'" link @click="handleToggleSlbStatus(row)">
                    {{ row.status === 'running' ? '停止' : '启动' }}
                  </el-button>
                  <el-button type="danger" link @click="handleDeleteSlb(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <div class="empty-data" v-if="filteredSlbList.length === 0 && !slbLoading">
              <el-empty description="暂无负载均衡监听配置" />
            </div>

            <!-- 分页控件 -->
            <div class="pagination-container" v-if="filteredSlbList.length > 0">
              <el-pagination
                v-model:current-page="slbPagination.currentPage"
                v-model:page-size="slbPagination.pageSize"
                :page-sizes="[10, 20, 50, 100]"
                :small="false"
                layout="total, sizes, prev, pager, next, jumper"
                :total="filteredSlbList.length"
                @size-change="handleSlbSizeChange"
                @current-change="handleSlbCurrentChange"
              />
            </div>

            <!-- 后端member部分 -->
            <div class="backend-member-section" v-if="currentSlb">
              <div class="section-header">
                <h3>后端member</h3>
              </div>
              
              <div class="member-header">
                <div class="member-info">
                  <span class="member-listener-name">监听名称: {{ currentSlb.name }} ({{ currentSlb.port }})</span>
                </div>
                
                <div class="member-stats">
                  <span class="stat-item total">总数: {{ memberStats.total }}</span>
                  <span class="stat-item running">已启用: {{ memberStats.running }}</span>
                  <span class="stat-item stopped">停止: {{ memberStats.stopped }}</span>
                  <span class="stat-item normal">正常: {{ memberStats.normal }}</span>
                  <span class="stat-item partial-abnormal">部分异常: {{ memberStats.partialAbnormal }}</span>
                  <span class="stat-item abnormal">异常: {{ memberStats.abnormal }}</span>
                </div>
                
                <div class="member-actions">
                  <el-button type="primary" @click="handleAddMember">添加后端主机</el-button>
                </div>
              </div>
              
              <el-table
                :data="paginatedMemberList"
                border
                style="width: 100%"
                v-loading="memberLoading"
              >
                <el-table-column type="index" label="序号" width="60" />
                <el-table-column label="主机器名称" prop="hostName" min-width="120" show-overflow-tooltip />
                <el-table-column label="IP地址" prop="ip" min-width="140" show-overflow-tooltip />
                <el-table-column label="端口" prop="port" width="80" />
                <el-table-column label="权重" prop="weight" width="80" />
                <el-table-column label="角色" prop="role" width="80" />
                <el-table-column label="状态" width="100">
                  <template #default="{ row }">
                    <el-tag :type="getMemberStatusTagType(row.status)">{{ getMemberStatusLabel(row.status) }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="健康检查" width="100">
                  <template #default="{ row }">
                    <el-tag :type="getHealthStatusTagType(row.healthStatus)">{{ getHealthStatusLabel(row.healthStatus) }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="监控" width="80">
                  <template #default="{ row }">
                    <el-button type="primary" link @click="handleViewMonitor(row)">查看监控</el-button>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="180" fixed="right">
                  <template #default="{ row, $index }">
                    <el-button type="primary" link @click="handleEditMember(row, $index)">编辑</el-button>
                    <el-button :type="row.status === 'running' ? 'danger' : 'success'" link @click="handleToggleMemberStatus(row)">
                      {{ row.status === 'running' ? '停用' : '启用' }}
                    </el-button>
                    <el-button type="danger" link @click="handleDeleteMember($index)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
              
              <div class="empty-data" v-if="memberList.length === 0 && !memberLoading">
                <el-empty description="暂无后端服务器" />
              </div>
              
              <!-- 后端member分页 -->
              <div class="pagination-container" v-if="memberList.length > 0">
                <el-pagination
                  v-model:current-page="memberPagination.currentPage"
                  v-model:page-size="memberPagination.pageSize"
                  :page-sizes="[10, 20, 50, 100]"
                  :small="false"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="memberList.length"
                  @size-change="handleMemberSizeChange"
                  @current-change="handleMemberCurrentChange"
                />
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
        
        <div class="drawer-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="handleSave" :loading="saveLoading">保存</el-button>
        </div>
      </div>
    </template>
  </el-drawer>
  
  <!-- Member编辑对话框 -->
  <el-drawer
    v-model="memberDialogVisible"
    :title="isEditMember ? '编辑后端主机' : '添加后端主机'"
    :size="'50%'"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    direction="rtl"
    append-to-body
  >
    <template #default>
      <div class="member-drawer-content">
        <el-form
          ref="memberFormRef"
          :model="memberForm"
          :rules="memberRules"
          label-width="100px"
          label-position="right"
          class="member-form"
        >
          <el-form-item label="地址类型" prop="addressType" required>
            <el-radio-group v-model="memberForm.addressType">
              <el-radio label="主机簿">主机簿</el-radio>
              <el-radio label="手工配置">手工配置</el-radio>
            </el-radio-group>
            <div class="form-tip">
              <el-icon><InfoFilled /></el-icon>
              <span>主机簿功能尚未实现，目前仅支持手工配置</span>
            </div>
          </el-form-item>
          
          <el-form-item label="IP" prop="ip" required>
            <el-input v-model="memberForm.ip" placeholder="请输入IP地址" />
          </el-form-item>
          
          <el-form-item label="端口" prop="port" required>
            <el-input v-model="memberForm.port" placeholder="请输入端口" />
          </el-form-item>
          
          <el-form-item label="权重" prop="weight" required>
            <el-input-number v-model="memberForm.weight" :min="1" :max="100" style="width: 120px" />
            <div class="weight-tip">
              <el-icon><InfoFilled /></el-icon>
              <span>范围: 1-100</span>
            </div>
          </el-form-item>
          
          <el-form-item label="角色" prop="role" required>
            <el-radio-group v-model="memberForm.role">
              <el-radio label="主">主</el-radio>
              <el-radio label="备">备</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>
    </template>
    
    <template #footer>
      <div class="drawer-footer">
        <el-button @click="memberDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleMemberSubmit">确定</el-button>
      </div>
    </template>
  </el-drawer>
  
  <!-- 负载均衡监听抽屉 -->
  <SlbListenerDrawer 
    v-model:visible="slbListenerVisible"
    :protection-id="basicForm.id"
    :listener-data="currentSlbListener"
    @success="handleSlbListenerSuccess"
  />
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getDomainProtectionDetail, updateDomainProtectionConfig, getInstanceAllocatedIpGroups } from '@/services/ProtectionObjectService'
import SlbListenerDrawer from '@/components/BusinessInstance/SlbListenerDrawer.vue'
import { InfoFilled } from '@element-plus/icons-vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  protectionId: {
    type: [Number, String],
    default: null
  }
})

const emit = defineEmits(['update:visible', 'success'])

// 抽屉可见性
const drawerVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

// 加载状态
const loading = ref(false)
const saveLoading = ref(false)

// 当前激活的标签页
const activeTab = ref('basic')

// 表单引用
const basicFormRef = ref(null)
const slbFormRef = ref(null)
const memberFormRef = ref(null)

// 基本信息表单
const basicForm = reactive({
  id: null,
  instanceId: '',
  accessType: 'domain',
  ipv4GroupId: '',
  ipv6GroupId: '',
  addressType: '',
  domain: '',
  cname: '',
  businessQpsType: 'shared',
  dedicatedBusinessQps: 0,
  instanceBusinessQps: 0,
  protectionPackage: 'standard'
})

// 防护IP组选项
const protectionIpGroupOptions = ref([])
const ipv4GroupOptions = ref([])
const ipv6GroupOptions = ref([])

// 实例信息
const instanceInfo = reactive({
  customerName: '',
  businessQps: 0,
  allocatedBusinessQps: 0,
  currentBusinessQps: 0
})

// 计算剩余可分配的QPS
const remainingBusinessQps = computed(() => {
  return Math.max(0, instanceInfo.businessQps - instanceInfo.allocatedBusinessQps + 
    (basicForm.businessQpsType === 'dedicated' ? basicForm.dedicatedBusinessQps : 0))
})

// 负载均衡表单
const slbForm = reactive({
  scheduler: 'wrr',
  sessionTimeout: 300,
  healthCheck: 'TCP',
  members: []
})

// 负载均衡实例列表
const slbList = ref([])
const slbLoading = ref(false)

// 负载均衡搜索表单
const slbSearchForm = reactive({
  keyword: '',
  protocol: '',
  status: ''
})

// 负载均衡分页
const slbPagination = reactive({
  currentPage: 1,
  pageSize: 10
})

// 当前选中的负载均衡实例
const currentSlb = ref(null)

// 后端member列表
const memberList = ref([])
const memberLoading = ref(false)

// 后端member统计数据
const memberStats = reactive({
  total: 0,
  running: 0,
  stopped: 0,
  normal: 0,
  partialAbnormal: 0,
  abnormal: 0
})

// 后端member分页
const memberPagination = reactive({
  currentPage: 1,
  pageSize: 10
})

// 负载均衡监听抽屉
const slbListenerVisible = ref(false)
const currentSlbListener = ref(null)

// 根据搜索条件过滤负载均衡列表
const filteredSlbList = computed(() => {
  if (!slbList.value || slbList.value.length === 0) return []
  
  // 先应用过滤条件
  const filteredList = slbList.value.filter(item => {
    // 关键字搜索(名称、端口)
    const keywordMatch = !slbSearchForm.keyword || 
      item.name.toLowerCase().includes(slbSearchForm.keyword.toLowerCase()) ||
      String(item.port).includes(slbSearchForm.keyword)
    
    // 协议筛选
    const protocolMatch = !slbSearchForm.protocol || item.protocol === slbSearchForm.protocol
    
    // 状态筛选
    const statusMatch = !slbSearchForm.status || item.status === slbSearchForm.status
    
    return keywordMatch && protocolMatch && statusMatch
  })
  
  return filteredList
})

// 分页后的负载均衡列表
const paginatedSlbList = computed(() => {
  const start = (slbPagination.currentPage - 1) * slbPagination.pageSize
  const end = start + slbPagination.pageSize
  return filteredSlbList.value.slice(start, end)
})

// 分页后的后端member列表
const paginatedMemberList = computed(() => {
  const start = (memberPagination.currentPage - 1) * memberPagination.pageSize
  const end = start + memberPagination.pageSize
  return memberList.value.slice(start, end)
})

// Member表单
const memberDialogVisible = ref(false)
const isEditMember = ref(false)
const currentMemberIndex = ref(-1)
const memberForm = reactive({
  ip: '',
  port: '',
  weight: 10,
  addressType: '手工配置',
  role: '主'
})

// 表单验证规则
const basicRules = reactive({
  ipv4GroupId: [
    { 
      validator: (rule, value, callback) => {
        if (!value && !basicForm.ipv6GroupId) {
          callback(new Error('请至少选择一个防护IP组'));
        } else {
          callback();
        }
      }, 
      trigger: 'change' 
    }
  ],
  ipv6GroupId: [
    { 
      validator: (rule, value, callback) => {
        if (!value && !basicForm.ipv4GroupId) {
          callback(new Error('请至少选择一个防护IP组'));
        } else {
          callback();
        }
      }, 
      trigger: 'change' 
    }
  ],
  domain: [
    { required: true, message: '请输入防护域名', trigger: 'blur' },
    { 
      pattern: /^[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/, 
      message: '请输入有效的域名格式，如example.com', 
      trigger: 'blur' 
    }
  ],
  businessQpsType: [
    { required: true, message: '请选择业务QPS类型', trigger: 'change' }
  ],
  dedicatedBusinessQps: [
    { required: true, message: '请输入独享业务QPS', trigger: 'blur' }
  ],
  protectionPackage: [
    { required: true, message: '请选择防护套餐', trigger: 'change' }
  ]
})

const memberRules = reactive({
  addressType: [
    { required: true, message: '请选择地址类型', trigger: 'change' }
  ],
  ip: [
    { required: true, message: '请输入IP地址', trigger: 'blur' },
    { 
      pattern: /^(\d{1,3}\.){3}\d{1,3}$/, 
      message: '请输入有效的IPv4地址', 
      trigger: 'blur' 
    }
  ],
  port: [
    { required: true, message: '请输入端口号', trigger: 'blur' },
    { 
      pattern: /^\d+$/, 
      message: '端口号必须是数字', 
      trigger: 'blur' 
    },
    {
      validator: (rule, value, callback) => {
        const port = parseInt(value);
        if (isNaN(port) || port < 1 || port > 65535) {
          callback(new Error('端口号必须在1-65535之间'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
  weight: [
    { required: true, message: '请输入权重', trigger: 'blur' },
    { type: 'number', min: 1, max: 100, message: '权重必须在1-100之间', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
})

const slbRules = reactive({
  scheduler: [
    { required: true, message: '请选择调度算法', trigger: 'change' }
  ],
  sessionTimeout: [
    { required: true, message: '请输入会话超时时间', trigger: 'blur' }
  ],
  healthCheck: [
    { required: true, message: '请选择健康检查方式', trigger: 'change' }
  ]
})

// 获取域名防护对象详情
const fetchProtectionDetail = async () => {
  if (!props.protectionId) return
  
  loading.value = true
  try {
    const res = await getDomainProtectionDetail(props.protectionId)
    if (res.code === 200) {
      const data = res.data
      
      // 更新基本信息表单
      Object.assign(basicForm, {
        id: data.id,
        instanceId: data.instanceId,
        accessType: data.accessType || 'domain',
        ipv4GroupId: data.ipv4GroupId || '',
        ipv6GroupId: data.ipv6GroupId || '',
        addressType: data.addressType || 'IPv4',
        domain: data.domain,
        cname: data.cname,
        businessQpsType: data.businessQpsType || 'shared',
        dedicatedBusinessQps: data.dedicatedBusinessQps || 0,
        instanceBusinessQps: data.instanceBusinessQps || 0,
        protectionPackage: data.protectionPackage || 'standard'
      })
      
      // 填充实例信息
      if (data.instanceInfo) {
        Object.assign(instanceInfo, {
          customerName: data.instanceInfo.customerName || '',
          businessQps: data.instanceInfo.businessQps || 0,
          allocatedBusinessQps: data.instanceInfo.allocatedBusinessQps || 0,
          currentBusinessQps: data.instanceInfo.currentBusinessQps || 0
        })
      }
      
      // 获取业务实例已分配的防护IP组
      if (data.instanceId) {
        try {
          const ipGroupsRes = await getInstanceAllocatedIpGroups(data.instanceId)
          if (ipGroupsRes.code === 200) {
            protectionIpGroupOptions.value = ipGroupsRes.data.map(group => ({
              groupId: group.groupId,
              displayName: group.displayName,
              addressType: group.addressType
            }))
            
            // 分类IPv4和IPv6组
            ipv4GroupOptions.value = protectionIpGroupOptions.value.filter(item => item.addressType === 'IPv4')
            ipv6GroupOptions.value = protectionIpGroupOptions.value.filter(item => item.addressType === 'IPv6')
            
            // 确保当前IP组在选项中
            if (data.ipv4GroupId) {
              const existsIpv4 = ipv4GroupOptions.value.some(item => item.groupId === data.ipv4GroupId)
              if (!existsIpv4) {
                // 如果当前选中的IPv4组不在列表中，添加一个临时选项
                ipv4GroupOptions.value.push({
                  groupId: data.ipv4GroupId,
                  displayName: `IPv4组 #${data.ipv4GroupId.slice(-5)}`,
                  addressType: 'IPv4'
                })
              }
            }
            
            if (data.ipv6GroupId) {
              const existsIpv6 = ipv6GroupOptions.value.some(item => item.groupId === data.ipv6GroupId)
              if (!existsIpv6) {
                // 如果当前选中的IPv6组不在列表中，添加一个临时选项
                ipv6GroupOptions.value.push({
                  groupId: data.ipv6GroupId,
                  displayName: `IPv6组 #${data.ipv6GroupId.slice(-5)}`,
                  addressType: 'IPv6'
                })
              }
            }
          } else {
            console.error('获取防护IP组列表失败:', ipGroupsRes.message)
            ElMessage.error(ipGroupsRes.message || '获取防护IP组列表失败')
          }
        } catch (error) {
          console.error('获取防护IP组列表失败:', error)
          ElMessage.error('获取防护IP组列表失败: ' + (error.message || error))
        }
      } else {
        console.error('业务实例ID不存在')
        ElMessage.error('业务实例ID不存在')
      }
      
      // 填充负载均衡列表（模拟数据）
      slbLoading.value = true
      setTimeout(() => {
        // 这里应该是从API获取数据，现在使用模拟数据
        slbList.value = [
          {
            id: '1',
            name: 'HTTP监听80',
            port: 80,
            addressType: 'IPv4',
            protocol: 'HTTP',
            status: 'running',
            creator: '管理员',
            createTime: '2023-10-01 12:00:00',
            remark: 'Web服务HTTP监听'
          },
          {
            id: '2',
            name: 'HTTPS监听443',
            port: 443,
            addressType: 'IPv4',
            protocol: 'HTTPS',
            status: 'running',
            creator: '管理员',
            createTime: '2023-10-01 12:05:00',
            remark: 'Web服务HTTPS监听'
          },
          {
            id: '3',
            name: 'TCP监听8080',
            port: 8080,
            addressType: '双栈',
            protocol: 'TCP',
            status: 'stopped',
            creator: '系统',
            createTime: '2023-10-02 09:30:00',
            remark: '后端API服务监听'
          }
        ]
        slbLoading.value = false
      }, 500)
    } else {
      ElMessage.error(res.message || '获取域名防护对象详情失败')
    }
  } catch (error) {
    console.error('获取域名防护对象详情失败:', error)
    ElMessage.error('获取域名防护对象详情失败: ' + (error.message || error))
  } finally {
    loading.value = false
  }
}

// 处理业务QPS类型变更
const handleBusinessQpsTypeChange = (type) => {
  if (type === 'dedicated') {
    // 设置默认值，不超过可用QPS
    basicForm.dedicatedBusinessQps = Math.min(1000, remainingBusinessQps.value)
  } else {
    basicForm.dedicatedBusinessQps = 0
  }
}

// 获取接入方式显示标签
const getAccessTypeLabel = (type) => {
  const types = {
    domain: '域名接入',
    port: '端口接入'
  }
  return types[type] || type
}

// 处理IP组变更
const handleIpGroupChange = () => {
  // 根据选择的IP组更新地址类型
  if (basicForm.ipv4GroupId && basicForm.ipv6GroupId) {
    basicForm.addressType = '双栈'
  } else if (basicForm.ipv4GroupId) {
    basicForm.addressType = 'IPv4'
  } else if (basicForm.ipv6GroupId) {
    basicForm.addressType = 'IPv6'
  } else {
    basicForm.addressType = ''
  }
}

// 获取地址类型标签类型
const getAddressTypeTagType = (type) => {
  const types = {
    'IPv4': 'primary',
    'IPv6': 'success',
    '双栈': 'warning'
  }
  return types[type] || 'info'
}

// 获取负载均衡状态标签类型
const getSlbStatusTagType = (status) => {
  const types = {
    'running': 'success',
    'stopped': 'info',
    'error': 'danger'
  }
  return types[status] || 'info'
}

// 获取负载均衡状态显示标签
const getSlbStatusLabel = (status) => {
  const labels = {
    'running': '运行中',
    'stopped': '已停止',
    'error': '异常'
  }
  return labels[status] || status
}

// 处理负载均衡搜索
const handleSlbSearch = () => {
  // 重置到第一页
  slbPagination.currentPage = 1
}

// 处理创建负载均衡监听
const handleCreateSlbListener = () => {
  slbListenerVisible.value = true
  currentSlbListener.value = null
}

// 处理编辑负载均衡信息
const handleEditSlbInfo = (row) => {
  slbListenerVisible.value = true
  currentSlbListener.value = { ...row }
}

// 处理切换负载均衡状态
const handleToggleSlbStatus = (row) => {
  const action = row.status === 'running' ? '停止' : '启动'
  ElMessageBox.confirm(
    `确定要${action}负载均衡 ${row.name} 吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    ElMessage.success(`${action}成功`)
    // 模拟状态切换
    row.status = row.status === 'running' ? 'stopped' : 'running'
  }).catch(() => {})
}

// 处理删除负载均衡
const handleDeleteSlb = (row) => {
  ElMessageBox.confirm(
    `确定要删除负载均衡 ${row.name} 吗？此操作不可恢复！`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    ElMessage.success('删除成功')
    // 模拟删除
    const index = slbList.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      slbList.value.splice(index, 1)
    }
    
    // 如果删除的是当前选中的负载均衡，则清空当前选中
    if (currentSlb.value && currentSlb.value.id === row.id) {
      currentSlb.value = null
      memberList.value = []
    }
  }).catch(() => {})
}

// 处理负载均衡行点击
const handleSlbRowClick = (row) => {
  currentSlb.value = row
  fetchMemberList(row.id)
}

// 获取后端member列表
const fetchMemberList = (listenerId) => {
  if (!listenerId) return
  
  memberLoading.value = true
  
  // 重置分页到第一页
  memberPagination.currentPage = 1
  
  // 模拟API调用
  setTimeout(() => {
    // 这里应该是从API获取数据，现在使用模拟数据
    if (listenerId === '3') {
      // TCP监听8080的成员
      memberList.value = [
        {
          id: 'member-a1b2c3d4',
          hostName: '--',
          ip: '100.0.0.13',
          port: 8080,
          weight: 10,
          status: 'running',
          healthStatus: 'normal',
          listenerId: '3',
          addressType: '手工配置',
          role: '主'
        },
        {
          id: 'member-b2c3d4e5',
          hostName: '--',
          ip: '100.0.0.14',
          port: 8080,
          weight: 10,
          status: 'running',
          healthStatus: 'normal',
          listenerId: '3',
          addressType: '手工配置',
          role: '备'
        }
      ]
    } else if (listenerId === '1') {
      // HTTP监听80的成员
      memberList.value = [
        {
          id: 'member-c3d4e5f6',
          hostName: '--',
          ip: '100.0.0.15',
          port: 80,
          weight: 5,
          status: 'running',
          healthStatus: 'normal',
          listenerId: '1',
          addressType: '手工配置',
          role: '主'
        }
      ]
    } else if (listenerId === '2') {
      // HTTPS监听443的成员
      memberList.value = [
        {
          id: 'member-d4e5f6g7',
          hostName: '--',
          ip: '100.0.0.16',
          port: 443,
          weight: 8,
          status: 'running',
          healthStatus: 'normal',
          listenerId: '2',
          addressType: '手工配置',
          role: '主'
        },
        {
          id: 'member-e5f6g7h8',
          hostName: '--',
          ip: '100.0.0.17',
          port: 443,
          weight: 8,
          status: 'stopped',
          healthStatus: 'abnormal',
          listenerId: '2',
          addressType: '手工配置',
          role: '备'
        }
      ]
    } else {
      memberList.value = []
    }
    
    // 更新统计数据
    updateMemberStats()
    
    memberLoading.value = false
  }, 500)
}

// 更新member统计数据
const updateMemberStats = () => {
  const total = memberList.value.length
  const running = memberList.value.filter(item => item.status === 'running').length
  const stopped = memberList.value.filter(item => item.status === 'stopped').length
  const normal = memberList.value.filter(item => item.healthStatus === 'normal').length
  const abnormal = memberList.value.filter(item => item.healthStatus === 'abnormal').length
  const partialAbnormal = total > 0 && abnormal > 0 && abnormal < total ? 1 : 0
  
  Object.assign(memberStats, {
    total,
    running,
    stopped,
    normal,
    partialAbnormal,
    abnormal
  })
}

// 获取member状态标签类型
const getMemberStatusTagType = (status) => {
  const types = {
    'running': 'success',
    'stopped': 'info'
  }
  return types[status] || 'info'
}

// 获取member状态显示标签
const getMemberStatusLabel = (status) => {
  const labels = {
    'running': '运行中',
    'stopped': '已停止'
  }
  return labels[status] || status
}

// 获取健康检查状态标签类型
const getHealthStatusTagType = (status) => {
  const types = {
    'normal': 'success',
    'abnormal': 'danger'
  }
  return types[status] || 'info'
}

// 获取健康检查状态显示标签
const getHealthStatusLabel = (status) => {
  const labels = {
    'normal': '正常',
    'abnormal': '异常'
  }
  return labels[status] || status
}

// 处理添加member
const handleAddMember = () => {
  if (!currentSlb.value) {
    ElMessage.warning('请先选择一个监听')
    return
  }
  
  isEditMember.value = false
  currentMemberIndex.value = -1
  
  // 重置表单
  Object.assign(memberForm, {
    ip: '',
    port: currentSlb.value.port,
    weight: 10,
    addressType: '手工配置',
    role: '主'
  })
  
  memberDialogVisible.value = true
}

// 处理编辑member
const handleEditMember = (row, index) => {
  isEditMember.value = true
  currentMemberIndex.value = index
  
  // 填充表单
  Object.assign(memberForm, {
    ip: row.ip,
    port: row.port,
    weight: row.weight,
    addressType: row.addressType,
    role: row.role
  })
  
  memberDialogVisible.value = true
}

// 处理切换member状态
const handleToggleMemberStatus = (row) => {
  const action = row.status === 'running' ? '停用' : '启用'
  ElMessageBox.confirm(
    `确定要${action}后端服务器 ${row.ip}:${row.port} 吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    ElMessage.success(`${action}成功`)
    // 模拟状态切换
    row.status = row.status === 'running' ? 'stopped' : 'running'
    // 更新统计数据
    updateMemberStats()
  }).catch(() => {})
}

// 处理删除member
const handleDeleteMember = (index) => {
  ElMessageBox.confirm(
    `确定要删除此后端服务器吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    ElMessage.success('删除成功')
    // 模拟删除
    memberList.value.splice(index, 1)
    // 更新统计数据
    updateMemberStats()
  }).catch(() => {})
}

// 处理查看监控
const handleViewMonitor = (row) => {
  ElMessage.info(`查看监控功能暂未实现: ${row.ip}:${row.port}`)
}

// 提交Member表单
const handleMemberSubmit = async () => {
  if (!memberFormRef.value) return
  
  try {
    await memberFormRef.value.validate()
    
    const newMember = {
      id: isEditMember.value ? memberList.value[currentMemberIndex.value].id : `member-${Math.random().toString(36).substr(2, 9)}`,
      hostName: '--',
      ip: memberForm.ip,
      port: memberForm.port,
      weight: memberForm.weight,
      status: 'running',
      healthStatus: 'normal',
      listenerId: currentSlb.value.id,
      addressType: memberForm.addressType,
      role: memberForm.role
    }
    
    if (isEditMember.value && currentMemberIndex.value >= 0) {
      // 编辑模式
      memberList.value[currentMemberIndex.value] = newMember
    } else {
      // 添加模式
      memberList.value.push(newMember)
    }
    
    // 更新统计数据
    updateMemberStats()
    
    memberDialogVisible.value = false
    ElMessage.success(isEditMember.value ? '编辑成功' : '添加成功')
  } catch (error) {
    console.error('Member表单验证失败:', error)
  }
}

// 处理负载均衡监听成功
const handleSlbListenerSuccess = (data) => {
  if (!data) return
  
  if (currentSlbListener.value) {
    // 编辑模式 - 更新列表中的数据
    const index = slbList.value.findIndex(item => item.id === data.id)
    if (index !== -1) {
      slbList.value[index] = data
    }
  } else {
    // 创建模式 - 添加到列表
    slbList.value.push(data)
  }
}

// 处理负载均衡分页大小变化
const handleSlbSizeChange = (val) => {
  slbPagination.pageSize = val
}

// 处理负载均衡当前页变化
const handleSlbCurrentChange = (val) => {
  slbPagination.currentPage = val
}

// 处理后端member分页大小变化
const handleMemberSizeChange = (val) => {
  memberPagination.pageSize = val
}

// 处理后端member当前页变化
const handleMemberCurrentChange = (val) => {
  memberPagination.currentPage = val
}

// 保存配置
const handleSave = async () => {
  try {
    // 验证基本信息表单
    if (!basicFormRef.value) return
    await basicFormRef.value.validate()
    
    // 验证负载均衡表单
    if (!slbFormRef.value) return
    await slbFormRef.value.validate()
    
    saveLoading.value = true
    
    // 构建提交数据
    const submitData = {
      id: basicForm.id,
      ipv4GroupId: basicForm.ipv4GroupId,
      ipv6GroupId: basicForm.ipv6GroupId,
      addressType: basicForm.addressType,
      domain: basicForm.domain,
      businessQpsType: basicForm.businessQpsType,
      dedicatedBusinessQps: basicForm.businessQpsType === 'dedicated' ? basicForm.dedicatedBusinessQps : 0,
      protectionPackage: basicForm.protectionPackage,
      slbConfig: {
        scheduler: slbForm.scheduler,
        sessionTimeout: slbForm.sessionTimeout,
        healthCheck: slbForm.healthCheck,
        members: slbForm.members
      }
    }
    
    // 调用API
    const res = await updateDomainProtectionConfig(submitData)
    
    if (res.code === 200) {
      ElMessage.success('保存配置成功')
      emit('success')
      drawerVisible.value = false
    } else {
      ElMessage.error(res.message || '保存配置失败')
    }
  } catch (error) {
    console.error('保存配置失败:', error)
    ElMessage.error('表单验证失败，请检查输入')
  } finally {
    saveLoading.value = false
  }
}

// 关闭抽屉
const handleClose = () => {
  ElMessageBox.confirm(
    '确定要关闭配置页面吗？未保存的修改将会丢失',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    drawerVisible.value = false
  }).catch(() => {})
}

// 监听抽屉显示状态
watch(() => drawerVisible.value, (visible) => {
  if (visible) {
    fetchProtectionDetail()
  }
})
</script>

<style scoped>
.config-drawer-content {
  padding: 0 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.config-tabs {
  flex: 1;
  overflow-y: auto;
}

.drawer-footer {
  margin-top: 20px;
  text-align: right;
  padding: 10px 0;
  border-top: 1px solid #e6e6e6;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.member-operations {
  margin-bottom: 15px;
}

.protocol-port-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.protocol-port-item {
  display: flex;
  align-items: center;
}

.port-range {
  margin-left: 5px;
}

.syslog-config {
  display: flex;
  gap: 10px;
  align-items: center;
}

.syslog-item {
  display: flex;
  align-items: center;
  flex: 1;
}

.syslog-label {
  margin-right: 10px;
  white-space: nowrap;
}

.slb-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e6e6e6;
}

.slb-search {
  display: flex;
  align-items: center;
  gap: 10px;
}

.slb-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.empty-data {
  margin-top: 20px;
}

/* 后端member样式 */
.backend-member-section {
  margin-top: 30px;
  border-top: 1px solid #e6e6e6;
  padding-top: 20px;
}

.section-header {
  margin-bottom: 15px;
}

.section-header h3 {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin: 0;
}

.member-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.member-info {
  font-size: 14px;
  color: #606266;
}

.member-listener-name {
  font-weight: 500;
}

.member-stats {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin: 10px 0;
}

.stat-item {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.stat-item.total {
  background-color: #ecf5ff;
  color: #409eff;
}

.stat-item.running {
  background-color: #f0f9eb;
  color: #67c23a;
}

.stat-item.stopped {
  background-color: #f4f4f5;
  color: #909399;
}

.stat-item.normal {
  background-color: #f0f9eb;
  color: #67c23a;
}

.stat-item.partial-abnormal {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.stat-item.abnormal {
  background-color: #fef0f0;
  color: #f56c6c;
}

.member-actions {
  margin-left: auto;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
  display: flex;
  justify-content: flex-end;
}

/* Member抽屉内容样式 */
.member-drawer-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.member-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.weight-tip {
  display: flex;
  align-items: center;
  margin-top: 5px;
  color: #909399;
  font-size: 12px;
}

.weight-tip .el-icon {
  margin-right: 5px;
}
</style> 