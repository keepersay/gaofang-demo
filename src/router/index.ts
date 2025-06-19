import { createRouter, createWebHistory } from 'vue-router'
import Overview from '../views/Overview.vue'
import ClusterGroup from '../views/ClusterGroup.vue'
import ClusterGroupManagement from '../views/ClusterGroupManagement.vue'
import UserManagement from '../views/UserManagement.vue'
import CustomerManagement from '../views/CustomerManagement.vue'
import ProductPackage from '../views/ConfigManagement/ProductPackage.vue'
import Placeholder from '../views/Placeholder.vue'
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
    component: Placeholder
  },
  {
    path: '/waf',
    name: 'WAF',
    component: Placeholder
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
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router 