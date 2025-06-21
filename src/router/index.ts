import { createRouter, createWebHistory } from 'vue-router'
import Overview from '../views/Overview.vue'
import ClusterGroup from '../views/ClusterGroup.vue'
import ClusterGroupManagement from '../views/ClusterGroupManagement.vue'
import UserManagement from '../views/UserManagement.vue'
import CustomerManagement from '../views/CustomerManagement.vue'
import ProductPackage from '../views/ConfigManagement/ProductPackage.vue'
import Placeholder from '../views/Placeholder.vue'
import WafManagement from '../views/WafManagement.vue'
import SlbManagement from '../views/SlbManagement.vue'
import LoginLog from '../views/LogManagement/LoginLog.vue'
import OperationLog from '../views/LogManagement/OperationLog.vue'

declare global {
  interface ImportMeta {
    env: {
      BASE_URL: string
    }
  }
}

const routes = [
  {
    path: '/',
    redirect: '/overview'
  },
  {
    path: '/overview',
    name: 'Overview',
    component: Overview
  },
  {
    path: '/cluster-group',
    name: 'LogicalCluster',
    component: ClusterGroup
  },
  {
    path: '/cluster-group-management',
    name: 'LogicalClusterGroup',
    component: ClusterGroupManagement
  },
  {
    path: '/ads',
    name: 'ADS',
    component: Placeholder
  },
  {
    path: '/slb',
    name: 'SLB',
    component: SlbManagement
  },
  {
    path: '/waf',
    name: 'WAF',
    component: WafManagement
  },
  {
    path: '/waf-cc',
    name: 'WAFCC',
    component: Placeholder
  },
  {
    path: '/blackhole',
    name: 'Blackhole',
    component: Placeholder
  },
  {
    path: '/traffic',
    name: 'TrafficAnalysis',
    component: Placeholder
  },
  {
    path: '/config/product',
    name: 'ProductPackage',
    component: ProductPackage
  },
  {
    path: '/log/login',
    name: 'LoginLogs',
    component: LoginLog
  },
  {
    path: '/log/operation',
    name: 'OperationLogs',
    component: OperationLog
  },
  {
    path: '/customer',
    name: 'CustomerManagement',
    component: CustomerManagement
  },
  {
    path: '/user',
    name: 'UserManagement',
    component: UserManagement
  },
  {
    path: '/region-management',
    name: 'RegionManagement',
    component: () => import('../views/RegionManagement.vue')
  },
  {
    path: '/role',
    name: 'RoleManagement',
    component: () => import('../views/RoleManagement.vue')
  },
  {
    path: '/dns',
    name: 'DNS',
    component: () => import('@/views/Placeholder.vue'),
    meta: { title: 'DNS' }
  },
  {
    path: '/business-instance',
    name: 'BusinessInstance',
    component: Placeholder
  },
  {
    path: '/order',
    name: 'Order',
    component: Placeholder
  },
  {
    path: '/global-config',
    name: 'GlobalConfig',
    component: Placeholder,
    meta: { title: '全局配置' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router 